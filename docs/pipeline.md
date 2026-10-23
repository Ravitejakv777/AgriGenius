# AgriGenius Product Pipeline

## Offline Corpus and Index

The current local artifacts form this verified path:

```text
KCC source exports
  -> pooled and cleaned source files
  -> kcc_index_ready_final.csv (493,213 rows)
  -> l3cube-pune/indic-sentence-bert-nli
  -> normalized 768-dimensional embeddings
  -> ChromaDB cosine collection: kcc_agri_advisor (493,213 vectors)
```

The Kaggle build procedure is recorded in `nlp-run1.ipynb`. Its output records 493,213 input rows and 1,927 completed batches using the Indic sentence model. The local index agrees with that count and model. The index builder records the model ID, output dimension, normalization, metric, source row count, and a SHA-256 fingerprint; its resume checkpoint also checks model and corpus fingerprint before skipping batches.

The index collection contains advisory text and crop, district, state, query type, sector, and date metadata. The final CSV's `language` column is empty, so script presence in text must not be represented as a complete language annotation.

## Online RAG Path

```text
Hindi / Telugu / English farmer question
  -> Indic sentence embedding
  -> cosine retrieval from ChromaDB (fetch-k candidates)
  -> remove likely question-only rows and near duplicates
  -> BAAI/bge-reranker-v2-m3 cross-encoder reranking
  -> top-k KCC passages and metadata
  -> Gemini 3.6 Flash or Groq openai/gpt-oss-20b generation
  -> SSE answer chunks with source metadata
```

The prompt requires answers to stay within the retrieved KCC context, cite source ranks, use the query language when possible, and abstain when evidence is insufficient. Provider errors are surfaced through the API; they are not returned as generated answer text.

## API and Frontend

- `GET /api/health` reports the live collection size and configured embedding, reranker, and generation models.
- `POST /api/chat` returns a complete answer and source list.
- `POST /api/chat/stream` sends source metadata and answer chunks as SSE.
- `POST /api/llm/compare` retrieves once, runs both configured generators on identical evidence, records generation latency, and optionally scores each response with RAGAS.
- `POST /api/explain` applies LIME text perturbations to explain one BGE reranker score for the requested ranked passage.
- The `/evaluation` UI shows the two live answer outputs, timings, faithfulness, answer relevance, and an explicitly labeled unsupported-claim proxy.
- `python evaluate_llms.py --query-file demo_queries.json` runs the same dual-model comparison over the query file and writes per-case results plus per-language/provider summaries to `llm_evaluation_results.json`.
- Vite proxies `/api` to `http://127.0.0.1:8000` during development.
- When the backend is unavailable, the frontend reports that state and shows an error on chat requests. It does not show hard-coded sample answers or citations as grounded output.
- Set `AGRI_CORS_ORIGINS` for deployment origins. The local defaults allow the Vite development origin.

## Validation Status

Local record counts, sampled corpus/index alignment, Chroma cosine configuration, provenance metadata, and the frontend production build have been checked. Retrieval quality across languages, abstention under live generation, provider behavior, and deployment remain pending an online end-to-end validation run. The small demo query set is a smoke check, not a benchmark.

Install `lime` for source-card explanations, RAGAS for model quality scores, `instructor[google-genai]` for the Google judge adapter, and `groq` for the second generator. RAGAS scoring uses `GEMINI_API_KEY`, `AGRI_EVAL_JUDGE_MODEL` (default `gemini-3.8-flash`), and Google `gemini-embedding-001` embeddings. If generation or judge credentials/network access are absent, output/status shows the failure or pending score; no score is substituted. The displayed unsupported-claim rate is `1 - faithfulness`, a proxy rather than a separate hallucination classifier.

Run `python evaluate_retrieval.py --top-k 5 --fetch-k 20` for per-language crop/category hit rates and `python evaluate_abstention.py --provider gemini` for the unsupported Mars cultivation prompt. These require the embedding and reranker models; the abstention check also requires provider credentials.
