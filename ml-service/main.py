from fastapi import FastAPI
from pydantic import BaseModel
from fastembed import TextEmbedding

app = FastAPI(title="Nexora AI ML Service")

model = TextEmbedding(
    model_name="BAAI/bge-small-en-v1.5"
)


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
    embedding = list(model.embed([request.text]))[0]
    embedding = embedding.tolist()

    return {
        "embedding": embedding,
        "dimensions": len(embedding)
    }