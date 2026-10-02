from fastapi import FastAPI
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer

app = FastAPI(title="Nexora AI ML Service")

model = SentenceTransformer("BAAI/bge-small-en-v1.5")


class EmbeddingRequest(BaseModel):
    text: str


@app.get("/")
def health():
    return {
        "service": "Nexora AI ML Service",
        "status": "running"
    }


@app.post("/embed")
def create_embedding(request: EmbeddingRequest):
    embedding = model.encode(
        request.text,
        normalize_embeddings=True
    )

    return {
        "embedding": embedding.tolist(),
        "dimensions": len(embedding)
    }