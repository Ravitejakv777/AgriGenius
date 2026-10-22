"""
kcc_build_index.py

Full-corpus embedding + ChromaDB indexing for the KCC retrieval corpus.

Model: l3cube-pune/indic-sentence-bert-nli (confirmed by nlp-run1.ipynb,
       which built the current 493,213-vector local collection)
Input: kcc_index_ready_final.csv (post PII-strip -- run kcc_strip_pii.py first,
       and apply your Sowing Time and Weather decision if you chose to filter it)
Output: a persistent ChromaDB collection on disk at ./chroma_kcc_db, ready for
        the retrieval step of the RAG pipeline.

Resumable: progress is checkpointed to disk (kcc_index_checkpoint.json) after
every batch. If interrupted (sleep, crash, Ctrl-C), just rerun the same
command -- it skips batches already written. If the input CSV path or row
count changes since the last checkpoint, progress is automatically reset
(so it can't silently misalign after you filter the file further).

Actual throughput is measured live and an ETA is printed as the index runs.

Install (if not already present):
    pip install chromadb
"""

import hashlib
import pandas as pd
import chromadb
from sentence_transformers import SentenceTransformer
import json
import os
import time

# --- Config --------------------------------------------------------------
CSV_PATH = "kcc_index_ready_final.csv"
MODEL_NAME = "l3cube-pune/indic-sentence-bert-nli"
CHROMA_DB_PATH = "./chroma_kcc_db"
COLLECTION_NAME = "kcc_agri_advisor"
CHECKPOINT_PATH = "kcc_index_checkpoint.json"
BATCH_SIZE = 256
METADATA_COLUMNS = ["Crop", "DistrictName", "StateName", "QueryType", "Sector", "day", "month", "year"]
ID_COLUMN = "KCCCallID"
TEXT_COLUMN = "KccAns"


def load_checkpoint():
    if os.path.exists(CHECKPOINT_PATH):
        with open(CHECKPOINT_PATH) as f:
            return json.load(f)
    return {"completed_batches": [], "csv_path": None, "n_rows": None}


def save_checkpoint(state):
    with open(CHECKPOINT_PATH, "w") as f:
        json.dump(state, f)


def corpus_fingerprint(df):
    """Fingerprint IDs and source text so resumed batches cannot mix corpora."""
    digest = hashlib.sha256()
    for record_id, text in zip(df[ID_COLUMN].astype(str), df[TEXT_COLUMN].astype(str)):
        digest.update(record_id.encode("utf-8"))
        digest.update(b"\0")
        digest.update(text.encode("utf-8"))
        digest.update(b"\n")
    return digest.hexdigest()


def build_metadata(row):
    meta = {}
    for col in METADATA_COLUMNS:
        val = row.get(col, None)
        if pd.isna(val):
            meta[col] = ""
        elif col in ("day", "month", "year"):
            try:
                meta[col] = int(val)
            except (ValueError, TypeError):
                meta[col] = str(val)
        else:
            meta[col] = str(val)
    meta["source"] = "KCC"
    return meta


def main():
    print(f"Loading {CSV_PATH} ...")
    df = pd.read_csv(CSV_PATH)
    n = len(df)
    print(f"Loaded {n:,} rows.")

    if df[ID_COLUMN].duplicated().any():
        print(f"WARNING: {ID_COLUMN} has duplicates -- falling back to row-index-based IDs.")
        ids_all = [f"row_{i}" for i in range(n)]
    else:
        ids_all = df[ID_COLUMN].astype(str).tolist()

    texts_all = df[TEXT_COLUMN].astype(str).tolist()
    fingerprint = corpus_fingerprint(df)

    checkpoint = load_checkpoint()
    if (
        checkpoint.get("csv_path") != CSV_PATH
        or checkpoint.get("n_rows") != n
        or checkpoint.get("model_name") != MODEL_NAME
        or checkpoint.get("corpus_fingerprint") != fingerprint
    ):
        if checkpoint.get("completed_batches"):
            print("Input corpus or embedding model changed since last checkpoint -- resetting progress.")
        checkpoint = {
            "completed_batches": [],
            "csv_path": CSV_PATH,
            "n_rows": n,
            "model_name": MODEL_NAME,
            "corpus_fingerprint": fingerprint,
        }
    completed = set(checkpoint["completed_batches"])

    print(f"Loading model: {MODEL_NAME} ...")
    model = SentenceTransformer(MODEL_NAME)
    model_dimensions = model.get_sentence_embedding_dimension()
    if model_dimensions != 768:
        raise RuntimeError(f"Expected 768-dimensional embeddings; model reports {model_dimensions}.")

    print(f"Connecting to ChromaDB at {CHROMA_DB_PATH} ...")
    client = chromadb.PersistentClient(path=CHROMA_DB_PATH)
    collection = client.get_or_create_collection(
        name=COLLECTION_NAME,
        metadata={
            "hnsw:space": "cosine",
            "embedding_model": MODEL_NAME,
            "embedding_dimension": 768,
            "normalized_embeddings": True,
        },
    )
    index_metadata = collection.metadata or {}
    distance_metric = collection.configuration.get("hnsw", {}).get("space")
    if distance_metric != "cosine":
        raise RuntimeError(f"Existing collection uses {distance_metric!r}; use a new Chroma path for cosine.")
    indexed_model = index_metadata.get("embedding_model")
    if indexed_model and indexed_model != MODEL_NAME:
        raise RuntimeError(
            f"Collection already uses {indexed_model!r}; refusing to mix it with {MODEL_NAME!r}. "
            "Use a new Chroma path for a different embedding model."
        )
    if collection.count() and not indexed_model:
        raise RuntimeError(
            "Existing collection has no embedding-model provenance. Verify it, annotate its metadata, "
            "or build into a new Chroma path before continuing."
        )
    if collection.count() and (
        index_metadata.get("source_rows") != n
        or index_metadata.get("corpus_fingerprint") != fingerprint
    ):
        raise RuntimeError(
            "Existing collection was built from a different corpus. Use a new Chroma path so stale IDs "
            "cannot remain mixed with this corpus."
        )
    collection.modify(metadata={
        **{key: value for key, value in index_metadata.items() if key != "hnsw:space"},
        "embedding_model": MODEL_NAME,
        "embedding_dimension": 768,
        "normalized_embeddings": True,
        "distance_metric": "cosine",
        "source_rows": n,
        "corpus_fingerprint": fingerprint,
    })

    n_batches = (n + BATCH_SIZE - 1) // BATCH_SIZE
    print(f"\nTotal rows: {n:,} | Batch size: {BATCH_SIZE} | Total batches: {n_batches}")
    print(f"Already completed: {len(completed)} batches (resuming)\n")

    start_time = time.time()
    rows_done_this_run = 0

    for batch_idx in range(n_batches):
        if batch_idx in completed:
            continue

        start = batch_idx * BATCH_SIZE
        end = min(start + BATCH_SIZE, n)

        batch_texts = texts_all[start:end]
        batch_ids = ids_all[start:end]
        batch_meta = [build_metadata(df.iloc[i]) for i in range(start, end)]

        embeddings = model.encode(batch_texts, normalize_embeddings=True, show_progress_bar=False)

        collection.upsert(
            ids=batch_ids,
            embeddings=embeddings.tolist(),
            documents=batch_texts,
            metadatas=batch_meta,
        )

        completed.add(batch_idx)
        checkpoint["completed_batches"] = sorted(completed)
        save_checkpoint(checkpoint)

        rows_done_this_run += (end - start)
        elapsed = time.time() - start_time
        rate = rows_done_this_run / elapsed if elapsed > 0 else 0
        remaining_batches = n_batches - len(completed)
        eta_sec = (remaining_batches * BATCH_SIZE) / rate if rate > 0 else float("inf")

        print(f"Batch {batch_idx + 1}/{n_batches} done "
              f"({end:,}/{n:,} rows total) | "
              f"{rate:.1f} rows/sec this run | "
              f"ETA {eta_sec / 60:.1f} min", flush=True)

    print(f"\nDone. Collection '{COLLECTION_NAME}' now has {collection.count():,} vectors.")
    if collection.count() != n:
        raise RuntimeError(f"Indexed row count {collection.count():,} does not match corpus size {n:,}.")
    print(f"Stored at: {CHROMA_DB_PATH}")
    print("Delete kcc_index_checkpoint.json if you ever want to force a full re-embed from scratch.")


if __name__ == "__main__":
    main()
