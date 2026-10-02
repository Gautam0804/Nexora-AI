const LLM_SERVICE_URL =
  process.env.LLM_SERVICE_URL || "http://localhost:11434";

const LLM_MODEL =
  process.env.LLM_MODEL || "qwen2.5:3b";

export async function generateAnswer(
  prompt: string
): Promise<string> {
  const ollamaUrl = `${LLM_SERVICE_URL}/api/generate`;

  console.log("LLM service URL:", ollamaUrl);
  console.log("LLM model:", LLM_MODEL);
  console.log("LLM: Sending request to Ollama...");

  const response = await fetch(ollamaUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: LLM_MODEL,
      prompt,
      stream: false,
      options: {
        temperature: 0.1,
      },
    }),
  });

  if (!response.ok) {
    const message = await response.text();

    console.error(
      "LLM ERROR:",
      response.status,
      message
    );

    throw new Error(
      `LLM service error: ${response.status} ${message}`
    );
  }

  const data = (await response.json()) as {
    response?: string;
    done?: boolean;
  };

  console.log("LLM: Ollama response received");

  if (!data.response) {
    throw new Error("LLM returned an empty response");
  }

  return data.response.trim();
}