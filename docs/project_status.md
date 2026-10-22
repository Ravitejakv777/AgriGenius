# AgriGenius Project Status

Last updated: 2026-10-22

## Current State

AgriGenius is a local multilingual RAG development prototype. The checked-in backend and frontend are wired together, and the persistent local index has verified corpus and embedding provenance. This is not a production or TRL 6 sign-off: live retrieval, reranking, generation, safety, and deployment checks remain to be run with online model access.

## Verified Local Artifacts

- `kcc_index_ready_final.csv`: 493,213 rows across Uttar Pradesh (347,928), Maharashtra (106,166), and Andhra Pradesh (39,119).
- Chroma collection `kcc_agri_advisor`: 493,213 vectors.
- Kaggle notebook `nlp-run1.ipynb`: its build output reports loading 493,213 rows and completing 1,927 batches with `l3cube-pune/indic-sentence-bert-nli`.
- Notebook settings and local Chroma configuration agree on normalized 768-dimensional embeddings and cosine distance.
- Local collection metadata now records the embedding model, dimensions, normalization, distance metric, row count, and corpus fingerprint. First, middle, and last indexed records match the current CSV.
- The corpus text contains Devanagari characters in 452,838 rows and Telugu characters in 28,296 rows. These are script-presence counts, not a language-label audit; the CSV `language` field is blank.
- Frontend uses the FastAPI API. Backend failures now surface as errors rather than mock answers. The status panel reports when the API is unavailable.

## Architecture Configuration

- Embedding model: `l3cube-pune/indic-sentence-bert-nli`.
- Vector store: ChromaDB, collection `kcc_agri_advisor`, cosine distance.
- Reranker: `BAAI/bge-reranker-v2-m3`.
- Generation: Gemini (`gemini-3.6-flash`) and Hugging Face Inference Llama 3.1 8B; both can be run against the same evidence through the LLM QA page.
- Evaluation judge: RAGAS with Gemini (`gemini-3.8-flash` by default), using the same judge for both answers.
- Explainability: on-demand LIME perturbation explanation for the BGE cross-encoder relevance score of a selected source.
- Service: FastAPI with `/api/health`, `/api/chat`, `/api/chat/stream`, `/api/llm/compare`, and `/api/explain`.
- UI: React 19, TypeScript, Vite, with SSE streaming, source cards, an LLM QA view, live per-run generation latency, and RAGAS scores when evaluation credentials are available.

## Readiness Checks Still Required

- Load the Indic embedding model and BGE reranker from Hugging Face in an online environment; confirm startup and index metadata checks.
- Install the expanded requirements in the runtime environment and validate the real RAGAS install; the active venv currently has LIME installed but not RAGAS.
- Run retrieval evaluations for Hindi, Telugu, and English against a reviewed expected-answer set. The current small demo evaluation is not a held-out benchmark.
- Run `evaluate_abstention.py` and chat/streaming requests against Gemini and, if offered, Hugging Face; check citations, same-language replies, abstention with insufficient evidence, and provider failures.
- Run dual-model comparisons on a reviewed, multi-case Hindi/Telugu/English evaluation set; record RAGAS faithfulness and answer relevance, and validate the judge scores against human review. The current UI is a per-question live comparison, not an aggregate benchmark.
- Confirm LIME explanations load in the intended environment and review whether the query-token attributions are interpretable for each script.
- Verify deployment-specific `VITE_API_BASE_URL`, `AGRI_CORS_ORIGINS`, secrets, startup, health check, and SSE behavior.
- Complete a broader privacy and agronomic safety review before public farmer use.

## Count Reconciliation

The authoritative local working count is **493,213**, because the current final CSV, local Chroma collection, sampled indexed records, and the index-build notebook agree. The previous repository docs' 347,944 count and the separate engineering summary's 508,072 cleaned-corpus count describe earlier or different artifacts and are not the active local count.

On 2026-10-22 the Hindi/Telugu/English retrieval smoke set and Gemini abstention script were retried. Both stopped before retrieval while resolving the Indic encoder's `adapter_config.json` from Hugging Face because DNS/network access to `huggingface.co` was unavailable. No new live retrieval or answer score was produced. Neither `GEMINI_API_KEY` nor `HF_TOKEN` is configured in this runtime.

## Model QA and Explainability

Implementation is present, but no live model comparison or RAGAS score is claimed in this status. The LLM QA screen runs both generators on the same retrieved passages for one submitted question, records end-to-end generation latency and answer length, then requests RAGAS faithfulness and answer relevance from a shared Gemini judge. Its unsupported-claim rate is `1 - faithfulness` and is labeled as a proxy. Source-card LIME perturbations explain the local BGE reranker score only; they do not establish answer truth or agronomic safety. The current result remains **pending live credential/model access and reviewed multilingual evaluation cases**.
