# LLM Quality and Explainability Evaluation

## Purpose

This section defines how the AgriGenius prototype compares its two answer generators, checks source support and answer relevance, and explains the retrieval reranker. It is an evaluation protocol and implementation report, not a claim that the models have passed a benchmark. Current live model results remain pending until the two provider credentials and model downloads are available and the multilingual cases have been run.

## Compared system

The RAG pipeline uses `l3cube-pune/indic-sentence-bert-nli` for normalized 768-dimensional query embeddings, cosine search in the 493,213-vector Chroma collection, and `BAAI/bge-reranker-v2-m3` to select ranked KCC passages. The model QA interface compares:

| Role | Configured model | Function |
| --- | --- | --- |
| Generator A | Gemini 3.6 Flash (`AGRI_GEMINI_MODEL`) | Produces an answer from the selected KCC passages |
| Generator B | Meta Llama 3.1 8B Instruct (`meta-llama/Meta-Llama-3.1-8B-Instruct`) | Produces a second answer from the exact same passages |
| Evaluation judge | Gemini 3.8 Flash by default (`AGRI_EVAL_JUDGE_MODEL`) | Scores both outputs with RAGAS using one shared judge configuration |

The Google model registry currently identifies Gemini 3.5 Flash as deprecated and says requests are routed to Gemini 3.6 Flash, so the configured direct model ID was moved to `gemini-3.6-flash`. [Google Gemini model reference](https://ai.google.dev/gemini-api/docs/models/gemini-3.5-flash.md)

The `/api/llm/compare` endpoint retrieves context once, then calls each generator separately with identical question, prompt rules, and retrieved passages. Each model result reports provider status, answer text, end-to-end generation latency, and answer character count. Timing excludes the RAGAS judge calls.

## LLM quality measures

The live **LLM QA** page (route `/evaluation`) runs one prompt at a time. For each successful generator response, it reports:

| Measure | Method | Interpretation |
| --- | --- | --- |
| Faithfulness | RAGAS `Faithfulness`, with the answer and retrieved context | Estimates the share of generated claims supported by the supplied context; higher is better. |
| Answer relevance | RAGAS `AnswerRelevancy`, with the question and answer | Estimates how directly the response addresses the user's question; higher is better. It does not establish factual correctness. |
| Unsupported-claim rate (proxy) | `1 − faithfulness` | A convenience view of the faithfulness score, not an independent hallucination classifier. Lower is better. |
| Generation latency | `time.perf_counter()` around each generator call | End-to-end time for the model response; lower is faster for this request. |
| Answer size | Character count | Descriptive output-size measure, not a quality score. |

RAGAS defines faithfulness as factual consistency between response claims and retrieved context, and answer relevancy as alignment between the response and user input. [RAGAS Faithfulness](https://docs.ragas.io/en/stable/concepts/metrics/available_metrics/faithfulness/), [RAGAS Answer Relevancy](https://docs.ragas.io/en/stable/concepts/metrics/available_metrics/answer_relevance/)

The judge is shared across both responses to reduce differences in evaluator setup. It is still another model, so its scores can be biased, non-deterministic, and weaker on Hindi or Telugu than English. Scores must not be presented as verified agronomic correctness. Before drawing model-selection conclusions, run multiple reviewed examples in each language, retain per-case outputs, compare with human agronomist judgments, and report aggregate and per-language results.

The faithfulness inversion is explicitly labeled a proxy because it is not a separate hallucination detector. A stronger hallucination study should additionally validate claims against reviewed reference answers and/or a dedicated detector, then adjudicate disagreements by a domain reviewer. No human-reviewed references are currently present in the small `demo_queries.json` smoke-test set.

## Explainability

The source drawer has an on-demand **Explain reranker score** action. The `/api/explain` route reruns retrieval for the submitted question and selected rank, holds that KCC passage fixed, applies word-presence perturbations to the question with LIME, and fits a local weighted surrogate to the BGE cross-encoder's sigmoid relevance score. The UI shows the reranker score and positive/negative token weights.

This is a local explanation of why a query/passage pair received a sigmoid-scaled reranker relevance score. The displayed score is not a calibrated probability. LIME is not a causal proof, does not explain the generator's internal reasoning, and does not verify an answer's truth. The source card retains the quoted KCC passage alongside the attribution so the user can inspect both.

## Test cases and execution

The evaluation UI contains starter prompts in Hindi, Telugu, and English, and accepts arbitrary text for additional reviewed cases. The repository's `demo_queries.json` contains eight small retrieval smoke cases across those languages. Use a separate reviewed QA file for formal results, including:

1. Agricultural questions with expected crop/category and a reviewed reference answer.
2. Cases where KCC context contains enough evidence, including advice with numbers or dates that must remain grounded.
3. Cases where the retrieved passages are irrelevant or insufficient, including the Mars/zero-gravity unsupported-query check in `evaluate_abstention.py`.
4. Multiple questions per language, reviewed for meaning and equivalent difficulty across translations.

For the current UI, run `/evaluation` for each test question with `GEMINI_API_KEY`, Hugging Face `HF_TOKEN` and inference access, downloaded Indic/BGE models, and RAGAS dependencies installed. For a batch run, use `python evaluate_llms.py --query-file <reviewed-cases.json> --output llm_evaluation_results.json`; it stores per-case outputs and provider/language averages. Record the model IDs, date, language, retrieved passage ranks, provider failures, latency, RAGAS outputs, and judge model. A failed provider or judge is reported as unavailable; the UI does not invent replacement responses or scores.

## Results status

| Language / check | Generator comparison | Faithfulness / relevance | Status |
| --- | --- | --- | --- |
| Hindi | Gemini 3.6 Flash vs Llama 3.1 8B | Pending live RAGAS judge run | Not run in this report |
| Telugu | Gemini 3.6 Flash vs Llama 3.1 8B | Pending live RAGAS judge run | Not run in this report |
| English | Gemini 3.6 Flash vs Llama 3.1 8B | Pending live RAGAS judge run | Not run in this report |
| Unsupported / insufficient evidence | Run each configured generator and inspect abstention | Context metrics are skipped when no KCC sources are retrieved | Pending live provider access |
| LIME explanation review | Inspect positive/negative query token weights against ranked passage | Qualitative review required per script | Pending live model access |

No numerical LLM quality results are reported here because the online retrieval/abstention retries could not load Hugging Face assets in the current network environment, and the active virtual environment does not yet have RAGAS installed. The LIME algorithm was exercised against a deterministic mock scorer in English, Hindi, and Telugu; that verifies the perturbation/token path only, not AgriGenius model attributions. The local index integrity check is independent of these live model-quality checks.

## Readiness decision

The required UI and backend paths for LIME, dual-provider execution, latency measurement, RAGAS faithfulness, answer relevance, and explicit abstention/unsupported-claim reporting are implemented. Proceed with further prototype upgrades, but treat model-quality sign-off as pending until both providers run successfully on the reviewed multilingual set and the RAGAS/human-review results are recorded. This report does not certify TRL 6 or farmer-facing readiness.
