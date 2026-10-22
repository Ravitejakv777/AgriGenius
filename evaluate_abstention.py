"""Live check that the generator abstains when KCC context cannot answer."""

import argparse

from rag_pipeline import AgriGeniusRAG


UNSUPPORTED_QUERY = "What is the KCC recommendation for growing wheat on Mars in zero gravity?"
ABSTENTION_MARKERS = (
    "insufficient",
    "not enough reliable kcc context",
    "cannot answer",
    "don't have enough",
    "do not have enough",
    "पर्याप्त साक्ष्य",
    "సరిపడా ఆధారాలు",
)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--provider", choices=("gemini", "llama"), default="gemini")
    args = parser.parse_args()

    rag = AgriGeniusRAG()
    result = rag.answer_query(
        UNSUPPORTED_QUERY,
        top_k=5,
        fetch_k=20,
        generate=True,
        llm_provider=args.provider,
    )
    answer = result["answer"].strip()
    did_abstain = any(marker in answer.lower() for marker in ABSTENTION_MARKERS)

    print(f"Provider: {args.provider}")
    print(f"Query: {UNSUPPORTED_QUERY}")
    print(f"Retrieved sources: {result['source_count']}")
    print(f"Answer: {answer}")
    print(f"Abstention marker detected: {'yes' if did_abstain else 'no'}")
    return 0 if did_abstain else 1


if __name__ == "__main__":
    raise SystemExit(main())
