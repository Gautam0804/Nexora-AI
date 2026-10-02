export async function generateAnswer(
  prompt: string
): Promise<string> {
  const response = await fetch(
    "http://localhost:11434/api/generate",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "qwen2.5:3b",
        prompt,
        stream: false,
      }),
    }
  );

  if (!response.ok) {
    const message = await response.text();

    throw new Error(
      `LLM service error: ${response.status} ${message}`
    );
  }

  const data = (await response.json()) as {
    response: string;
  };

  if (!data.response) {
    throw new Error("LLM returned an empty response");
  }

  return data.response.trim();
}