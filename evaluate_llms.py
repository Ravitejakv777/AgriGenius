"""Compare both configured generators with local lexical metrics on reviewed queries."""

import argparse
import asyncio
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
            "mean_evidence_token_coverage": (
                sum(row["metrics"]["evidence_token_coverage"] for row in scored) / len(scored)
                if scored else None
            ),
            "mean_question_token_coverage": (
                sum(row["metrics"]["question_token_coverage"] for row in scored) / len(scored)
                if scored else None
            ),
            "mean_unmatched_token_share_proxy": (
                sum(row["metrics"]["unmatched_token_share_proxy"] for row in scored) / len(scored)
                if scored else None
            ),
        }
    return summary


async def main() -> int:
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
        comparison = await rag.compare_models(query, top_k=args.top_k)
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
        print(f"[{index}/{len(cases)}] {case.get('language', 'Unspecified')}: {statuses}; local_scores={comparison['evaluation']['status']}")

    output = {
        "query_file": str(Path(args.query_file)),
        "model_ids": {"qwen": rag.qwen_model_name, "groq": rag.groq_model_name},
        "evaluation_method": "deterministic_unicode_token_overlap_v1",
        "results": results,
        "summary_by_language_and_provider": summarize(results),
        "limitations": [
            "This set is exploratory unless its questions and reference answers have been reviewed by agricultural experts.",
            "Evidence and question scores are exact-token overlap heuristics; they do not detect semantic support, answer correctness, or hallucinations.",
            "Token overlap is sensitive to wording, inflection, spelling, and language; human review is needed, especially for Hindi and Telugu.",
            "Unmatched-token share is 1 - evidence token coverage, not an unsupported-claim or hallucination classifier.",
        ],
    }
    with open(args.output, "w", encoding="utf-8") as file:
        json.dump(output, file, ensure_ascii=False, indent=2)
    print(f"Saved run details and per-language summaries to {args.output}")
    return 0 if results else 1


if __name__ == "__main__":
    raise SystemExit(asyncio.run(main()))
