"""Compare both configured generators with RAGAS on a reviewed query JSON file."""

import argparse
import json
from collections import defaultdict
from pathlib import Path

from rag_pipeline import AgriGeniusRAG


def summarize(results: list[dict]) -> dict:
    grouped: dict[tuple[str, str], list[dict]] = defaultdict(list)
    for result in results:
        language = result.get("language", "Unspecified")
        for model in result.get("comparison", {}).get("models", []):
            grouped[(language, model["provider"])].append(model)

    summary = {}
    for (language, provider), model_results in grouped.items():
        completed = [row for row in model_results if row.get("status") == "ok"]
        scored = [row for row in completed if row.get("metrics")]
        summary.setdefault(language, {})[provider] = {
            "cases": len(model_results),
            "successful_generations": len(completed),
            "scored_cases": len(scored),
            "mean_generation_latency_ms": (
                sum(row["generation_latency_ms"] for row in completed) / len(completed)
                if completed else None
            ),
            "mean_faithfulness": (
                sum(row["metrics"]["faithfulness"] for row in scored) / len(scored)
                if scored else None
            ),
            "mean_answer_relevancy": (
                sum(row["metrics"]["answer_relevancy"] for row in scored) / len(scored)
                if scored else None
            ),
            "mean_unsupported_claim_rate_proxy": (
                sum(row["metrics"]["unsupported_claim_rate_proxy"] for row in scored) / len(scored)
                if scored else None
            ),
        }
    return summary


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--query-file", default="demo_queries.json")
    parser.add_argument("--output", default="llm_evaluation_results.json")
    parser.add_argument("--top-k", type=int, default=5)
    args = parser.parse_args()

    with open(args.query_file, encoding="utf-8") as file:
        cases = json.load(file)
    if not cases:
        parser.error("The query file must contain at least one case.")

    rag = AgriGeniusRAG()
    results = []
    for index, case in enumerate(cases, start=1):
        query = case.get("query", "").strip()
        if not query:
            print(f"Skipping case {index}: missing query")
            continue
        comparison = rag.compare_models(query, top_k=args.top_k)
        results.append({
            "case_id": case.get("id", index),
            "language": case.get("language", "Unspecified"),
            "expected_crop": case.get("expected_crop"),
            "expected_query_type": case.get("expected_query_type"),
            "reference_answer": case.get("reference_answer"),
            "comparison": comparison,
        })
        statuses = ", ".join(
            f"{model['provider']}={model['status']}"
            for model in comparison["models"]
        )
        print(f"[{index}/{len(cases)}] {case.get('language', 'Unspecified')}: {statuses}; RAGAS={comparison['evaluation']['status']}")

    output = {
        "query_file": str(Path(args.query_file)),
        "model_ids": {"gemini": rag.llm_model_name, "llama": rag.llama_model_name},
        "evaluation_judge": comparison["evaluation"]["judge_model"] if results else None,
        "results": results,
        "summary_by_language_and_provider": summarize(results),
        "limitations": [
            "This set is exploratory unless its questions and reference answers have been reviewed by agricultural experts.",
            "Faithfulness and answer relevance use an LLM judge and need human validation, especially for Hindi and Telugu.",
            "Unsupported-claim rate is 1 - faithfulness, a proxy rather than an independent hallucination classifier.",
        ],
    }
    with open(args.output, "w", encoding="utf-8") as file:
        json.dump(output, file, ensure_ascii=False, indent=2)
    print(f"Saved run details and per-language summaries to {args.output}")
    return 0 if results else 1


if __name__ == "__main__":
    raise SystemExit(main())
