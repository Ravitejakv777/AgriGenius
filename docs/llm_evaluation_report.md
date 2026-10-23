# LLM Evaluation Protocol and Current Status

## Purpose and setup

The `/evaluation` page compares the configured Qwen and GPT-OSS generators using the same retrieved Kisan Call Centre passages. It records provider status, answer text, end-to-end generation latency, and answer length. After each successful generation, the backend computes deterministic local lexical metrics. Scoring is immediate and does not call a judge model or require a judge API key.

The metrics are deliberately named token coverage rather than faithfulness or relevance. They are inexpensive indicators for inspecting outputs and are not validated measures of answer quality.

## Local metrics and formulas

The scorer case-folds Unicode letter/number tokens, removes source citation markers such as `[Source 1]`, and excludes a small list of English, Hindi, and Telugu stopwords.

| Metric | Calculation | Interpretation |
|---|---|---|
| Evidence token coverage | For each answer sentence with content tokens, count unique sentence tokens also present among all retrieved passage tokens, divided by the sentence's unique content tokens. Average across answer sentences. | Literal lexical overlap with retrieved evidence. Higher means more answer wording also occurs in the evidence. |
| Question token coverage | Unique question content tokens also present in the answer, divided by all unique question content tokens. | Literal overlap between the question and answer. It does not determine whether the answer addresses the question correctly. |
| Unmatched answer-token share (proxy) | `1 - evidence token coverage`. | Complementary lexical indicator only. It is not an unsupported-claim rate or hallucination detector. |

If there are no answer sentences with content tokens, evidence token coverage is zero. If the question contains no content tokens after filtering, question token coverage is zero. Scores are between zero and one in the API and shown as decimals in the comparison cards.

## Limitations

Exact token overlap is sensitive to paraphrase, inflection, spelling, transliteration, and language. It can penalize a correct paraphrase or reward repeated and generic words. Sentence-level averaging gives each answer sentence equal weight. Context tokens are combined across all retrieved passages, so a token match does not show which passage supports a claim. Neither metric checks negation, quantities, causal reasoning, factual accuracy, or agronomic safety.

Use these scores as transparent lexical diagnostics only. Review answers claim-by-claim against the cited passages, and use qualified agricultural review for safety-sensitive advice. For a quality benchmark, use reviewed reference answers and a documented human evaluation protocol in addition to these indicators.

## Batch evaluation

For reviewed multilingual cases, run:

```bash
python evaluate_llms.py --query-file <reviewed-cases.json> --output llm_evaluation_results.json
```

Each output case includes model IDs, language, retrieved evidence, generation outcomes, local scores, and latency. The summary groups successful scores by language and provider. A run requires the configured Groq generation access and the project's local retrieval models/index; local scoring itself requires no external service. Record the date, model IDs, language, reviewed case set, provider failures, latency, and metric means when publishing results. Do not interpret means as semantic faithfulness or correctness.

## Current results status

| Language / check | Generator comparison | Local token metrics | Status |
|---|---|---|---|
| Hindi | Qwen 3.8 27B vs Groq GPT-OSS 20B | Evidence and question token coverage | Pending reviewed batch run |
| Telugu | Qwen 3.8 27B vs Groq GPT-OSS 20B | Evidence and question token coverage | Pending reviewed batch run |
| English | Qwen 3.8 27B vs Groq GPT-OSS 20B | Evidence and question token coverage | Pending reviewed batch run |

No aggregate generator-quality results are claimed here until the reviewed multilingual run is saved and inspected. LIME source explanations concern the BGE reranker's local relevance score for a selected passage; they do not explain or validate the generated answer. This report does not certify farmer-facing readiness.
