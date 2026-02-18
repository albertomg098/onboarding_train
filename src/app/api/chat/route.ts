import { auth } from "@clerk/nextjs/server";
import { getApiKey } from "@/lib/api-key";
import { streamText, convertToModelMessages } from "ai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { SYSTEM_PROMPTS } from "@/lib/prompts";

const MAX_SYSTEM_PROMPT_LENGTH = 12_000;

export async function POST(req: Request) {
  await auth.protect();

  const apiKey = await getApiKey();

  const { messages, type, systemPrompt } = await req.json();

  let finalPrompt: string;
  if (systemPrompt && typeof systemPrompt === "string") {
    finalPrompt = systemPrompt.slice(0, MAX_SYSTEM_PROMPT_LENGTH);
  } else {
    finalPrompt =
      SYSTEM_PROMPTS[type as keyof typeof SYSTEM_PROMPTS] ??
      SYSTEM_PROMPTS.domain;
  }

  const modelMessages = await convertToModelMessages(messages);

  const result = streamText({
    model: createAnthropic({ apiKey })("claude-sonnet-4-20250514"),
    system: finalPrompt,
    messages: modelMessages,
  });

  return result.toUIMessageStreamResponse();
}
