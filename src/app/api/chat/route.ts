import { anthropic } from "@ai-sdk/anthropic";
import { streamText, convertToModelMessages, type UIMessage } from "ai";
import { getServerEnv } from "@/lib/env";
import { SYSTEM_PROMPTS, isValidChatType } from "@/lib/prompts";
import { CHAT_CONFIG } from "@/lib/constants";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    getServerEnv();

    const body = await req.json();
    const { messages, type } = body as {
      messages: UIMessage[];
      type: unknown;
    };

    if (!isValidChatType(type)) {
      return Response.json(
        { error: "Invalid chat type. Must be: domain, framework, simulation" },
        { status: 400 }
      );
    }

    if (!Array.isArray(messages) || messages.length === 0) {
      return Response.json({ error: "Messages required" }, { status: 400 });
    }

    const trimmedMessages = messages.slice(-CHAT_CONFIG.maxHistoryMessages);

    const result = streamText({
      model: anthropic("claude-sonnet-4-20250514"),
      system: SYSTEM_PROMPTS[type],
      messages: await convertToModelMessages(trimmedMessages),
      maxOutputTokens: CHAT_CONFIG.maxResponseTokens,
      abortSignal: req.signal,
    });

    return result.toUIMessageStreamResponse();
  } catch (error: unknown) {
    console.error("[Chat API Error]", error);

    if (error && typeof error === "object" && "status" in error) {
      const apiError = error as { status: number };
      if (apiError.status === 429) {
        return Response.json(
          { error: "Rate limit reached. Please wait a moment and try again." },
          { status: 429, headers: { "Retry-After": "30" } }
        );
      }
      if (apiError.status === 529) {
        return Response.json(
          {
            error:
              "AI service is temporarily overloaded. Please try again in a few seconds.",
          },
          { status: 503, headers: { "Retry-After": "10" } }
        );
      }
      if (apiError.status === 401) {
        return Response.json(
          { error: "API authentication failed. Check ANTHROPIC_API_KEY." },
          { status: 500 }
        );
      }
    }

    return Response.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
