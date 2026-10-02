export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await fetch("http://localhost:8000/embed", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text,
    }),
  });

  if (!response.ok) {
    const message = await response.text();

    throw new Error(
      `Embedding service error: ${response.status} ${message}`
    );
  }

  const data = (await response.json()) as {
    embedding: number[];
    dimensions: number;
  };

  if (data.dimensions !== 384) {
    throw new Error(
      `Invalid embedding dimensions: expected 384, received ${data.dimensions}`
    );
  }

  return data.embedding;
}