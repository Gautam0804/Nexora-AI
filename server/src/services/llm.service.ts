import OpenAI from "openai";

const LLM_MODEL =
  process.env.LLM_MODEL || "openai/gpt-oss-20b";

export async function generateAnswer(
  prompt: string
): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not configured");
  }

  const groq = new OpenAI({
    apiKey,
    baseURL: "https://api.groq.com/openai/v1",
  });

  console.log("LLM provider: Groq");
  console.log("LLM model:", LLM_MODEL);
  console.log("LLM: Sending request...");

  const response = await groq.responses.create({
    model: LLM_MODEL,
    input: prompt,
  });

  const answer = response.output_text?.trim();

  console.log("LLM: Groq response received");

  if (!answer) {
    throw new Error("LLM returned an empty response");
  }

  return answer;
}