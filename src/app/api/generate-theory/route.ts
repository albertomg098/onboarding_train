import { generateText, Output } from "ai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { auth } from "@clerk/nextjs/server";
import { getApiKey } from "@/lib/api-key";
import { DomainTheoryDataSchema } from "@/lib/types";
import { NextResponse } from "next/server";

const rateLimitMap = new Map<string, number[]>();
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 3;

function isRateLimited(userId: string): boolean {
  const now = Date.now();
  const timestamps = rateLimitMap.get(userId) ?? [];
  const recent = timestamps.filter((t) => now - t < WINDOW_MS);

  if (recent.length >= MAX_REQUESTS) {
    rateLimitMap.set(userId, recent);
    return true;
  }

  recent.push(now);
  rateLimitMap.set(userId, recent);
  return false;
}

export async function POST(req: Request) {
  const { userId } = await auth.protect();
  const apiKey = await getApiKey();

  if (isRateLimited(userId)) {
    return NextResponse.json(
      { error: "Too many requests. Wait a minute and try again." },
      { status: 429 }
    );
  }

  let body: { domain?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { domain } = body;
  if (
    !domain ||
    typeof domain !== "string" ||
    domain.trim().length < 2 ||
    domain.length > 100
  ) {
    return NextResponse.json(
      { error: "Domain must be 2-100 characters" },
      { status: 400 }
    );
  }

  try {
    const { output } = await generateText({
      model: createAnthropic({ apiKey })("claude-sonnet-4-20250514"),
      output: Output.object({ schema: DomainTheoryDataSchema }),
      prompt: `Generate comprehensive training theory content for the domain: "${domain.trim()}"`,
      system: `You are an expert at creating educational content for industry training.
Given a domain/industry, generate a comprehensive theory module with:

1. overview: A title (format: "What is {Domain}?") and 2 explanatory paragraphs
2. vocabulary: 10-12 key terms with clear definitions and relatable real-world examples
3. lifecycle: 7-9 sequential steps in the typical end-to-end workflow
4. aiUseCases: 4 specific areas where AI/automation adds measurable value

Make content practical, specific, and grounded in real industry knowledge. Avoid generic filler.`,
    });

    if (!output) {
      return NextResponse.json(
        { error: "Generation produced no output" },
        { status: 500 }
      );
    }

    return NextResponse.json(output);
  } catch (error) {
    console.error("Theory generation failed:", error);
    return NextResponse.json(
      { error: "Failed to generate theory. Please try again." },
      { status: 500 }
    );
  }
}
