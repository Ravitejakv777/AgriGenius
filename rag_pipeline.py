"""
Reusable RAG pipeline for AgriGenius.

This module keeps the retrieval + generation logic separate from any CLI or UI.
The Streamlit frontend can import AgriGeniusRAG and call answer_query() to get
both the generated answer and the retrieved source passages.
"""

from __future__ import annotations

import os
import re
from dataclasses import dataclass
from difflib import SequenceMatcher
from typing import Any

from dotenv import load_dotenv

load_dotenv()
load_dotenv("keys.env")

import chromadb
import numpy as np
from google import genai
from google.genai import types
from sentence_transformers import SentenceTransformer
from sentence_transformers.cross_encoder import CrossEncoder


CHROMA_DB_PATH = "./chroma_kcc_db"
COLLECTION_NAME = "kcc_agri_advisor"
EMBED_MODEL_NAME = "l3cube-pune/indic-sentence-bert-nli"
CROSS_ENCODER_MODEL_NAME = "BAAI/bge-reranker-v2-m3"
_configured_gemini_model = os.environ.get("AGRI_GEMINI_MODEL", "gemini-3-flash-preview").strip()
# Accept the short alias that may have been configured in a local or hosted
# environment, while sending the actual Gemini API model ID.
LLM_MODEL_NAME = {
    "gemini-3-flash": "gemini-3-flash-preview",
}.get(_configured_gemini_model, _configured_gemini_model)
GROQ_MODEL_NAME = os.environ.get("AGRI_GROQ_MODEL", "openai/gpt-oss-20b")
EVALUATION_JUDGE_MODEL = os.environ.get("AGRI_EVAL_JUDGE_MODEL", "gemini-3.8-flash")
DEFAULT_TOP_K = 5
DEFAULT_FETCH_K = 20
MMR_LAMBDA = 0.72


def _groq_client(api_key: str):
    try:
        from groq import Groq
    except ImportError as error:
        raise RuntimeError("Groq support is not installed; install the project requirements.") from error
    return Groq(api_key=api_key)


SYSTEM_INSTRUCTION = """You are AgriGenius, a helpful agricultural advisory assistant for farmers in India.

Rules:
- Answer ONLY using the provided Kisan Call Centre advisory context. Do not use parametric world knowledge.
- If the context is not enough to answer safely, abstain by saying that the available evidence is insufficient.
- Respond in the same language as the farmer's question whenever possible.
- Keep the answer practical, specific, and concise (maximum 3 sentences).
- Do not invent pesticide doses, fertilizer quantities, dates, schemes, or weather information.
- Cite the exact source you use by referencing its Rank (e.g., "[Source 1]").
"""


QUESTION_LIKE_PATTERNS = [
    re.compile(r"\?$"),
    re.compile(r"^(what|when|where|why|how|which|provide information|information about)\b", re.I),
    re.compile(r"^(जानकारी|बताइए|क्या|कब|कैसे|कौन)\b", re.I),
]


CROP_ALIASES = {
    "groundnut": "Groundnut (pea nut/mung phalli)",
    "peanut": "Groundnut (pea nut/mung phalli)",
    "मूंगफली": "Groundnut (pea nut/mung phalli)",
    "wheat": "Wheat",
    "गेहूं": "Wheat",
    "गेहूँ": "Wheat",
    "paddy": "Paddy (Dhan)",
    "rice": "Paddy (Dhan)",
    "धान": "Paddy (Dhan)",
    "mango": "Mango",
    "आम": "Mango",
    "sugarcane": "Sugarcane (Noble Cane)",
    "गन्ना": "Sugarcane (Noble Cane)",
    "mustard": "Mustard",
    "सरसों": "Mustard",
    "onion": "Onion",
    "प्याज": "Onion",
    "banana": "Banana",
    "केला": "Banana",
    "potato": "Potato",
    "आलू": "Potato",
    "maize": "Maize (Makka)",
    "corn": "Maize (Makka)",
    "मक्का": "Maize (Makka)",
}


QUERY_TYPE_ALIASES = {
    "irrigation": "Water Management",
    "water": "Water Management",
    "सिंचाई": "Water Management",
    "pest": "Plant Protection",
    "pests": "Plant Protection",
    "disease": "Plant Protection",
    "कीट": "Plant Protection",
    "रोग": "Plant Protection",
    "weed": "Weed Management",
    "weeds": "Weed Management",
    "खरपतवार": "Weed Management",
    "fertilizer": "Fertilizer Use and Availability",
    "fertiliser": "Fertilizer Use and Availability",
    "उर्वरक": "Fertilizer Use and Availability",
    "खाद": "Fertilizer Use and Availability",
    "seed rate": "Seeds",
    "seeds": "Seeds",
    "बीज दर": "Seeds",
}


DUPLICATE_STOPWORDS = {
    "sir",
    "madam",
    "farmer",
    "जी",
    "श्रीमान",
    "महोदय",
    "सर",
    "आप",
    "में",
    "के",
    "की",
    "का",
    "को",
    "लिए",
    "फसल",
}


@dataclass
class RetrievedSource:
    """One source passage retrieved from the KCC vector index."""

    rank: int
    text: str
    similarity: float
    metadata: dict[str, Any]

    def citation_label(self) -> str:
        crop = self.metadata.get("Crop") or "Unknown crop"
        district = self.metadata.get("DistrictName") or "Unknown district"
        query_type = self.metadata.get("QueryType") or "Unknown category"
        return f"KCC source {self.rank}: {crop} | {district} | {query_type}"


def _normalize_text(text: str) -> str:
    return re.sub(r"\s+", " ", str(text).strip()).lower()


def is_probable_non_answer(text: str) -> bool:
    """Flag obvious rows where KccAns looks like a question rather than advice."""
    clean = _normalize_text(text)
    if len(clean.split()) < 3:
        return True
    return any(pattern.search(clean) for pattern in QUESTION_LIKE_PATTERNS)


def _too_similar(text_a: str, text_b: str, threshold: float = 0.92) -> bool:
    a = _normalize_text(text_a)
    b = _normalize_text(text_b)
    if a == b:
        return True
    if SequenceMatcher(None, a, b).ratio() >= threshold:
        return True
    return _token_overlap(a, b) >= 0.78


def _token_overlap(text_a: str, text_b: str) -> float:
    tokens_a = _content_tokens(text_a)
    tokens_b = _content_tokens(text_b)
    if not tokens_a or not tokens_b:
        return 0.0
    return len(tokens_a & tokens_b) / min(len(tokens_a), len(tokens_b))


def _content_tokens(text: str) -> set[str]:
    tokens = set(re.findall(r"[\w\u0900-\u097F]+", text.lower()))
    return {token for token in tokens if token not in DUPLICATE_STOPWORDS and len(token) > 1}


def _safe_metadata(meta: dict[str, Any]) -> dict[str, Any]:
    return {key: ("" if value is None else value) for key, value in dict(meta).items()}


def infer_crop_filter(query: str) -> dict[str, Any] | None:
    """Infer an exact Chroma metadata filter when the query names a known crop."""
    clean_query = _normalize_text(query)
    for alias, crop_name in CROP_ALIASES.items():
        if alias in clean_query:
            return {"Crop": crop_name}
    return None


def infer_query_type_filter(query: str) -> dict[str, Any] | None:
    """Infer an exact QueryType filter for clear advisory intents."""
    clean_query = _normalize_text(query)
    for alias, query_type in QUERY_TYPE_ALIASES.items():
        if alias in clean_query:
            return {"QueryType": query_type}
    return None


def infer_metadata_filter(query: str) -> dict[str, Any] | None:
    filters = [item for item in (infer_crop_filter(query), infer_query_type_filter(query)) if item]
    if not filters:
        return None
    if len(filters) == 1:
        return filters[0]
    return {"$and": filters}


class AgriGeniusRAG:
    """Load once, then reuse for CLI, Streamlit, tests, or evaluation scripts."""

    def __init__(
        self,
        chroma_path: str = CHROMA_DB_PATH,
        collection_name: str = COLLECTION_NAME,
        embed_model_name: str = EMBED_MODEL_NAME,
        cross_encoder_name: str = CROSS_ENCODER_MODEL_NAME,
        llm_model_name: str = LLM_MODEL_NAME,
        groq_model_name: str = GROQ_MODEL_NAME,
    ) -> None:
        self.chroma_path = chroma_path
        self.collection_name = collection_name
        self.embed_model_name = embed_model_name
        self.cross_encoder_name = cross_encoder_name
        self.llm_model_name = llm_model_name
        self.groq_model_name = groq_model_name
        self.embedding_model = SentenceTransformer(embed_model_name)
        self.cross_encoder = CrossEncoder(cross_encoder_name)
        self.chroma_client = chromadb.PersistentClient(path=chroma_path)
        self.collection = self.chroma_client.get_collection(collection_name)
        index_metadata = self.collection.metadata or {}
        indexed_model = index_metadata.get("embedding_model")
        if indexed_model != embed_model_name:
            raise RuntimeError(
                f"Chroma collection {collection_name!r} records embedding model "
                f"{indexed_model!r}; runtime requested {embed_model_name!r}. "
                "Rebuild or explicitly verify and annotate the collection before serving queries."
            )
        expected_dimensions = index_metadata.get("embedding_dimension")
        actual_dimensions = self.embedding_model.get_sentence_embedding_dimension()
        if expected_dimensions and expected_dimensions != actual_dimensions:
            raise RuntimeError(
                f"Chroma index dimension {expected_dimensions} does not match "
                f"embedding model dimension {actual_dimensions}."
            )
        if index_metadata.get("normalized_embeddings") is not True:
            raise RuntimeError("Chroma collection metadata does not confirm normalized embeddings.")
        distance_metric = self.collection.configuration.get("hnsw", {}).get("space")
        if distance_metric != "cosine":
            raise RuntimeError(f"Chroma collection must use cosine distance; found {distance_metric!r}.")

    def collection_count(self) -> int:
        return self.collection.count()

    def retrieve_sources(
        self,
        query: str,
        top_k: int = DEFAULT_TOP_K,
        fetch_k: int = DEFAULT_FETCH_K,
        where: dict[str, Any] | None = None,
        use_mmr: bool = False,
        use_cross_encoder: bool = True,
        drop_non_answers: bool = True,
        auto_metadata_filter: bool = True,
    ) -> list[RetrievedSource]:
        query_embedding = self.embedding_model.encode([query], normalize_embeddings=True)[0]
        n_results = max(fetch_k, top_k)
        query_filter = where or (infer_metadata_filter(query) if auto_metadata_filter else None)
        results = self.collection.query(
            query_embeddings=[query_embedding.tolist()],
            n_results=n_results,
            where=query_filter,
            include=["documents", "metadatas", "distances", "embeddings"],
        )

        candidates: list[dict[str, Any]] = []
        embeddings = results.get("embeddings", [[None]])[0]
        for doc, meta, dist, emb in zip(
            results["documents"][0],
            results["metadatas"][0],
            results["distances"][0],
            embeddings,
        ):
            if drop_non_answers and is_probable_non_answer(doc):
                continue
            if any(_too_similar(doc, item["text"]) for item in candidates):
                continue
            candidates.append(
                {
                    "text": doc,
                    "metadata": _safe_metadata(meta),
                    "similarity": float(1 - dist),
                    "embedding": np.array(emb, dtype=float) if emb is not None else None,
                }
            )

        if use_cross_encoder and candidates:
            pairs = [(query, item["text"]) for item in candidates]
            scores = self.cross_encoder.predict(pairs)
            for i, score in enumerate(scores):
                # BGE reranker returns logits; map them to a bounded display score.
                clipped_score = float(np.clip(score, -60.0, 60.0))
                candidates[i]["similarity"] = 1.0 / (1.0 + np.exp(-clipped_score))
            candidates.sort(key=lambda x: x["similarity"], reverse=True)
            selected = candidates[:top_k]
        elif use_mmr and candidates and candidates[0]["embedding"] is not None:
            selected = self._mmr_select(candidates, top_k)
        else:
            selected = candidates[:top_k]

        return [
            RetrievedSource(
                rank=idx + 1,
                text=item["text"],
                similarity=item["similarity"],
                metadata=item["metadata"],
            )
            for idx, item in enumerate(selected)
        ]

    def _mmr_select(self, candidates: list[dict[str, Any]], top_k: int) -> list[dict[str, Any]]:
        selected: list[dict[str, Any]] = []
        remaining = candidates.copy()

        while remaining and len(selected) < top_k:
            if not selected:
                best = max(remaining, key=lambda item: item["similarity"])
            else:
                best = max(
                    remaining,
                    key=lambda item: (
                        MMR_LAMBDA * item["similarity"]
                        - (1 - MMR_LAMBDA) * self._max_source_similarity(item, selected)
                    ),
                )
            selected.append(best)
            remaining.remove(best)

        return selected

    @staticmethod
    def _max_source_similarity(candidate: dict[str, Any], selected: list[dict[str, Any]]) -> float:
        candidate_embedding = candidate["embedding"]
        if candidate_embedding is None:
            return 0.0
        similarities = []
        for item in selected:
            selected_embedding = item["embedding"]
            if selected_embedding is not None:
                similarities.append(float(candidate_embedding @ selected_embedding))
        return max(similarities, default=0.0)

    def build_prompt(self, query: str, sources: list[RetrievedSource]) -> str:
        context_block = "\n\n".join(
            f"[Source {source.rank}] "
            f"(Crop: {source.metadata.get('Crop', '?')}; "
            f"District: {source.metadata.get('DistrictName', '?')}; "
            f"Category: {source.metadata.get('QueryType', '?')})\n"
            f"{source.text}"
            for source in sources
        )
        return f"""Kisan Call Centre advisory context:
{context_block}

Farmer question: {query}

Answer:"""

    def generate_answer(self, query: str, sources: list[RetrievedSource], llm_provider: str = "gemini") -> str:
        if not sources:
            return "I do not have enough reliable KCC context to answer this question safely."

        prompt = self.build_prompt(query, sources)

        if llm_provider == "groq":
            api_key = os.environ.get("GROQ_API_KEY")
            if not api_key:
                raise RuntimeError("GROQ_API_KEY environment variable is not set for Groq.")
            client = _groq_client(api_key)
            try:
                response = client.chat.completions.create(
                    model=self.groq_model_name,
                    messages=[
                        {"role": "system", "content": SYSTEM_INSTRUCTION},
                        {"role": "user", "content": prompt},
                    ],
                    max_completion_tokens=500,
                    temperature=0.0,
                    stream=False,
                )
                return response.choices[0].message.content or ""
            except Exception as e:
                raise RuntimeError(f"Error calling Groq: {e}") from e
        elif llm_provider == "gemini":
            api_key = os.environ.get("GEMINI_API_KEY")
            if not api_key:
                raise RuntimeError("GEMINI_API_KEY environment variable is not set.")

            client = genai.Client(api_key=api_key)
            response = client.models.generate_content(
                model=self.llm_model_name,
                contents=prompt,
                config=types.GenerateContentConfig(system_instruction=SYSTEM_INSTRUCTION, temperature=0.0),
            )
            return response.text or ""
        else:
            raise ValueError(f"Unsupported LLM provider: {llm_provider!r}")

    def explain_source_relevance(
        self,
        query: str,
        source: RetrievedSource,
        num_samples: int = 64,
        num_features: int = 8,
    ) -> dict[str, Any]:
        """Explain one reranker score with local LIME token perturbations."""
        try:
            from lime.lime_text import LimeTextExplainer
        except ImportError as error:
            raise RuntimeError("LIME explainability is unavailable; install the `lime` requirement.") from error

        if not query.strip():
            raise ValueError("A non-empty question is required for an explanation.")

        def predict_relevance(queries: list[str]) -> np.ndarray:
            pairs = [(item or " ", source.text) for item in queries]
            logits = np.asarray(self.cross_encoder.predict(pairs), dtype=float).reshape(-1)
            logits = np.clip(logits, -60.0, 60.0)
            positive_probability = 1.0 / (1.0 + np.exp(-logits))
            return np.column_stack((1.0 - positive_probability, positive_probability))

        explainer = LimeTextExplainer(
            class_names=["lower relevance", "higher relevance"],
            split_expression=r"\W+",
            bow=True,
            random_state=41,
        )
        explanation = explainer.explain_instance(
            query,
            predict_relevance,
            labels=(1,),
            num_features=num_features,
            num_samples=num_samples,
        )
        full_score = float(predict_relevance([query])[0, 1])
        weights = [
            {"token": token, "weight": float(weight)}
            for token, weight in explanation.as_list(label=1)
        ]
        return {
            "method": "LIME text perturbation",
            "target": "BGE cross-encoder relevance for the selected KCC passage",
            "source_rank": source.rank,
            "reranker_score": full_score,
            "num_samples": num_samples,
            "feature_weights": weights,
            "note": "Positive weights raised the local relevance prediction; negative weights lowered it. This explains the reranker score, not the generated answer's factual correctness.",
        }

    async def compare_models(self, query: str, top_k: int = DEFAULT_TOP_K) -> dict[str, Any]:
        """Run both configured answer models on identical retrieved evidence and score with RAGAS."""
        import time

        sources = self.retrieve_sources(query, top_k=top_k)
        source_payload = [
            {
                "rank": source.rank,
                "text": source.text,
                "similarity": source.similarity,
                "metadata": source.metadata,
            }
            for source in sources
        ]
        model_specs = [
            ("gemini", self.llm_model_name),
            ("groq", self.groq_model_name),
        ]
        results: list[dict[str, Any]] = []
        for provider, model_name in model_specs:
            started = time.perf_counter()
            try:
                answer = self.generate_answer(query, sources, llm_provider=provider)
                if not answer.strip():
                    raise RuntimeError("The provider returned an empty answer.")
                results.append({
                    "provider": provider,
                    "model": model_name,
                    "status": "ok",
                    "answer": answer,
                    "generation_latency_ms": round((time.perf_counter() - started) * 1000),
                    "answer_characters": len(answer),
                })
            except Exception as error:
                results.append({
                    "provider": provider,
                    "model": model_name,
                    "status": "error",
                    "answer": None,
                    "generation_latency_ms": round((time.perf_counter() - started) * 1000),
                    "error": str(error),
                })

        evaluation_status = "skipped_no_context" if not sources else "skipped_no_successful_generation"
        judge_model = EVALUATION_JUDGE_MODEL
        if sources and any(item["status"] == "ok" for item in results):
            judge_sync_client = None
            judge_async_client = None
            try:
                from ragas.embeddings import GoogleEmbeddings
                from ragas.llms import llm_factory
                from ragas.metrics.collections import AnswerRelevancy, Faithfulness
                from openai import AsyncOpenAI

                api_key = os.environ.get("GEMINI_API_KEY")
                if not api_key:
                    raise RuntimeError("GEMINI_API_KEY is required for the RAGAS judge.")
                # RAGAS collection metrics call the judge asynchronously. The
                # GenAI Instructor adapter only accepts a synchronous Google
                # client, so use Google's OpenAI-compatible endpoint with an
                # AsyncOpenAI client for the judge instead.
                judge_sync_client = genai.Client(api_key=api_key)
                judge_async_client = AsyncOpenAI(
                    api_key=api_key,
                    base_url="https://generativelanguage.googleapis.com/v1beta/openai/",
                )
                judge_llm = llm_factory(
                    judge_model,
                    provider="openai",
                    client=judge_async_client,
                    adapter="instructor",
                    temperature=0.0,
                    max_tokens=8192,
                )
                judge_embeddings = GoogleEmbeddings(client=judge_sync_client, model="gemini-embedding-001")
                faithfulness_metric = Faithfulness(llm=judge_llm)
                relevancy_metric = AnswerRelevancy(llm=judge_llm, embeddings=judge_embeddings)
                contexts = [source.text for source in sources]
                for item in results:
                    if item["status"] != "ok":
                        continue
                    faithfulness_result = await faithfulness_metric.ascore(
                        user_input=query, response=item["answer"], retrieved_contexts=contexts
                    )
                    answer_relevancy_result = await relevancy_metric.ascore(
                        user_input=query, response=item["answer"]
                    )
                    faithfulness_raw = faithfulness_result.value
                    answer_relevancy_raw = answer_relevancy_result.value
                    faithfulness = float(faithfulness_raw) if faithfulness_raw is not None and np.isfinite(faithfulness_raw) else None
                    answer_relevancy = float(answer_relevancy_raw) if answer_relevancy_raw is not None and np.isfinite(answer_relevancy_raw) else None
                    item["metrics"] = {
                        "faithfulness": faithfulness,
                        "answer_relevancy": answer_relevancy,
                        "unsupported_claim_rate_proxy": 1.0 - faithfulness if faithfulness is not None else None,
                    }
                evaluation_status = "ok"
            except Exception as error:
                evaluation_status = "error"
                for item in results:
                    if item["status"] == "ok":
                        item["evaluation_error"] = str(error)
            finally:
                try:
                    if judge_async_client is not None:
                        await judge_async_client.close()
                finally:
                    if judge_sync_client is not None:
                        judge_sync_client.close()

        return {
            "query": query,
            "models": results,
            "sources": source_payload,
            "source_count": len(sources),
            "evaluation": {
                "framework": "RAGAS",
                "judge_model": judge_model,
                "status": evaluation_status,
                "hallucination_measure": "Unsupported-claim-rate proxy = 1 - RAGAS faithfulness; not an independent hallucination classifier.",
            },
        }

    def answer_query(
        self,
        query: str,
        top_k: int = DEFAULT_TOP_K,
        fetch_k: int = DEFAULT_FETCH_K,
        where: dict[str, Any] | None = None,
        generate: bool = True,
        llm_provider: str = "gemini",
    ) -> dict[str, Any]:
        sources = self.retrieve_sources(query, top_k=top_k, fetch_k=fetch_k, where=where)
        answer = self.generate_answer(query, sources, llm_provider) if generate else ""
        return {
            "query": query,
            "answer": answer,
            "sources": sources,
            "source_count": len(sources),
            "collection_count": self.collection_count(),
        }

    def generate_answer_stream(self, query: str, sources: list[RetrievedSource], llm_provider: str = "gemini"):
        if not sources:
            yield "I do not have enough reliable KCC context to answer this question safely."
            return

        prompt = self.build_prompt(query, sources)

        if llm_provider == "groq":
            yield from self._generate_stream_groq(prompt)
        elif llm_provider == "gemini":
            yield from self._generate_stream_gemini(prompt)
        else:
            raise ValueError(f"Unsupported LLM provider: {llm_provider!r}")

    def _generate_stream_gemini(self, prompt: str):
        api_key = os.environ.get("GEMINI_API_KEY")
        if not api_key:
            raise RuntimeError("GEMINI_API_KEY environment variable is not set.")

        client = genai.Client(api_key=api_key)
        response_stream = client.models.generate_content_stream(
            model=self.llm_model_name,
            contents=prompt,
            config=types.GenerateContentConfig(system_instruction=SYSTEM_INSTRUCTION, temperature=0.0),
        )
        for chunk in response_stream:
            if chunk.text:
                yield chunk.text

    def _generate_stream_groq(self, prompt: str):
        api_key = os.environ.get("GROQ_API_KEY")
        if not api_key:
            raise RuntimeError("GROQ_API_KEY environment variable is not set for Groq.")

        client = _groq_client(api_key)
        try:
            stream = client.chat.completions.create(
                model=self.groq_model_name,
                messages=[
                    {"role": "system", "content": SYSTEM_INSTRUCTION},
                    {"role": "user", "content": prompt},
                ],
                max_completion_tokens=500,
                temperature=0.0,
                stream=True,
            )
            for chunk in stream:
                if chunk.choices[0].delta.content:
                    yield chunk.choices[0].delta.content
        except Exception as e:
            raise RuntimeError(f"Error calling Groq: {e}") from e

    def answer_query_stream(
        self,
        query: str,
        top_k: int = DEFAULT_TOP_K,
        fetch_k: int = DEFAULT_FETCH_K,
        where: dict[str, Any] | None = None,
        llm_provider: str = "gemini",
    ):
        sources = self.retrieve_sources(query, top_k=top_k, fetch_k=fetch_k, where=where)
        # First yield the sources so the UI can show them immediately
        yield {
            "type": "metadata",
            "sources": sources,
            "source_count": len(sources),
            "collection_count": self.collection_count(),
        }
        
        # Then yield the streamed chunks
        for chunk in self.generate_answer_stream(query, sources, llm_provider=llm_provider):
            yield {
                "type": "chunk",
                "content": chunk,
            }
