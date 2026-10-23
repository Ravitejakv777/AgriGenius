import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any, Literal
import json
from sse_starlette.sse import EventSourceResponse

from rag_pipeline import AgriGeniusRAG, RetrievedSource

app = FastAPI(title="AgriGenius API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        origin.strip()
        for origin in os.environ.get(
            "AGRI_CORS_ORIGINS",
            "http://localhost:5173,http://127.0.0.1:5173",
        ).split(",")
        if origin.strip()
    ],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

rag = AgriGeniusRAG()

class ChatRequest(BaseModel):
    query: str
    language: Optional[str] = "auto"
    top_k: Optional[int] = 5
    crop: Optional[str] = None
    state: Optional[str] = None
    llm_provider: Optional[Literal["gemini", "groq"]] = "gemini"

class CompareRequest(BaseModel):
    query: str = Field(min_length=2, max_length=2000)
    top_k: int = Field(default=5, ge=1, le=10)

class ExplainRequest(BaseModel):
    query: str = Field(min_length=2, max_length=2000)
    source_rank: int = Field(default=1, ge=1, le=10)

@app.get("/api/health")
def health_check():
    return {
        "status": "ok",
        "collection_count": rag.collection_count(),
        "model": rag.embed_model_name,
        "reranker": rag.cross_encoder_name,
        "llm_model": rag.llm_model_name,
        "llm_models": {"gemini": rag.llm_model_name, "groq": rag.groq_model_name},
        "evaluation_judge": os.environ.get("AGRI_EVAL_JUDGE_MODEL", "gemini-3.8-flash"),
    }

@app.post("/api/chat")
def chat(request: ChatRequest):
    filters = []
    if request.crop:
        filters.append({"Crop": request.crop})
    if request.state:
        filters.append({"StateName": request.state})
    
    where = None
    if filters:
        if len(filters) == 1:
            where = filters[0]
        else:
            where = {"$and": filters}

    result = rag.answer_query(
        query=request.query,
        top_k=request.top_k,
        where=where,
        generate=True,
        llm_provider=request.llm_provider
    )
    
    # serialize sources
    sources = []
    for src in result["sources"]:
        sources.append({
            "rank": src.rank,
            "text": src.text,
            "similarity": src.similarity,
            "metadata": src.metadata
        })
        
    result["sources"] = sources
    return result

@app.post("/api/llm/compare")
def compare_llms(request: CompareRequest):
    """Compare both configured generators against the same retrieved context."""
    return rag.compare_models(request.query, top_k=request.top_k)

@app.post("/api/explain")
def explain_source(request: ExplainRequest):
    """Return a LIME explanation for a source's BGE reranker score."""
    sources = rag.retrieve_sources(request.query, top_k=request.source_rank)
    if len(sources) < request.source_rank:
        return {"status": "unavailable", "reason": "The requested ranked KCC passage was not retrieved."}
    explanation = rag.explain_source_relevance(request.query, sources[request.source_rank - 1])
    return {"status": "ok", **explanation}

@app.post("/api/chat/stream")
def chat_stream(request: ChatRequest):
    filters = []
    if request.crop:
        filters.append({"Crop": request.crop})
    if request.state:
        filters.append({"StateName": request.state})
    
    where = None
    if filters:
        if len(filters) == 1:
            where = filters[0]
        else:
            where = {"$and": filters}

    def generate():
        stream_generator = rag.answer_query_stream(
            query=request.query,
            top_k=request.top_k,
            where=where,
            llm_provider=request.llm_provider
        )
        try:
            for chunk in stream_generator:
                if chunk["type"] == "metadata":
                    sources = []
                    for src in chunk["sources"]:
                        sources.append({
                            "rank": src.rank,
                            "text": src.text,
                            "similarity": src.similarity,
                            "metadata": src.metadata
                        })
                    yield json.dumps({"type": "metadata", "sources": sources})
                elif chunk["type"] == "chunk":
                    yield json.dumps({"type": "chunk", "content": chunk["content"]})
        except Exception as error:
            yield json.dumps({"type": "error", "message": str(error)})
    
    return EventSourceResponse(generate())
