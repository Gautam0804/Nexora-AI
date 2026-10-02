const ML_SERVICE_URL =
  process.env.ML_SERVICE_URL || "http://localhost:8000";

export async function generateEmbedding(text: string): Promise<number[]> {
  const url = `${ML_SERVICE_URL}/embed`;

  console.log("Embedding service URL:", url);

  const response = await fetch(url, {
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

  if (!Array.isArray(data.embedding)) {
    throw new Error("Embedding service returned an invalid embedding");
  }

  if (data.dimensions !== 384) {
    throw new Error(
      `Invalid embedding dimensions: expected 384, received ${data.dimensions}`
    );
  }

  if (data.embedding.length !== 384) {
    throw new Error(
      `Invalid embedding length: expected 384, received ${data.embedding.length}`
    );
  }

  return data.embedding;
}