const ML_SERVICE_URL =
  process.env.ML_SERVICE_URL || "http://localhost:8000";

export async function generateEmbedding(
  text: string
): Promise<number[]> {
  const url = `${ML_SERVICE_URL}/embed`;

  console.log("Embedding service URL:", url);

  const maxAttempts = 3;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log(
        `Embedding request attempt ${attempt}/${maxAttempts}`
      );

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        const message = await response.text();

        console.error(
          `Embedding service returned ${response.status}`
        );

        if (attempt === maxAttempts) {
          throw new Error(
            `Embedding service error: ${response.status}`
          );
        }

        // Retry temporary Render errors
        if (
          response.status === 502 ||
          response.status === 503 ||
          response.status === 504
        ) {
          await new Promise((resolve) =>
            setTimeout(resolve, attempt * 2000)
          );

          continue;
        }

        throw new Error(
          `Embedding service error: ${response.status} ${message}`
        );
      }

      const data = (await response.json()) as {
        embedding: number[];
        dimensions: number;
      };

      if (!Array.isArray(data.embedding)) {
        throw new Error(
          "Embedding service returned an invalid embedding"
        );
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

      console.log(
        `Embedding generated successfully: ${data.dimensions} dimensions`
      );

      return data.embedding;
    } catch (error) {
      console.error(
        `Embedding attempt ${attempt} failed:`,
        error
      );

      if (attempt === maxAttempts) {
        throw error;
      }

      await new Promise((resolve) =>
        setTimeout(resolve, attempt * 2000)
      );
    }
  }

  throw new Error("Failed to generate embedding");
}