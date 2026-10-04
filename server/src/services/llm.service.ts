import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const LLM_MODEL =
  process.env.LLM_MODEL || "gpt-4.1-mini";

export async function generateAnswer(
  prompt: string
): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  console.log("LLM provider: OpenAI");
  console.log("LLM model:", LLM_MODEL);
  console.log("LLM: Sending request...");

  const response = await openai.responses.create({
    model: LLM_MODEL,
    input: prompt,
    temperature: 0.1,
  });

  const answer = response.output_text?.trim();

  console.log("LLM: OpenAI response received");

  if (!answer) {
    throw new Error("LLM returned an empty response");
  }

  return answer;
}