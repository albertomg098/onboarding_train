import { generateText, Output, stepCountIs } from "ai";
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

  const trimmedDomain = domain.trim();
  const provider = createAnthropic({ apiKey });
  const model = provider("claude-sonnet-4-20250514");

  try {
    const { output } = await generateText({
      model,
      stopWhen: stepCountIs(7),
      maxOutputTokens: 4000,
      tools: {
        web_search: provider.tools.webSearch_20250305({
          maxUses: 5,
        }),
      },
      output: Output.object({ schema: DomainTheoryDataSchema }),
      system: `You are an expert at creating educational content for industry training.
You have access to web search. Use it to find accurate, current information about the domain.

Perform 3-4 targeted searches to gather:
- Industry overview, key terminology, and vocabulary
- End-to-end workflow/lifecycle steps
- AI/automation applications and real metrics

Then generate a comprehensive theory module with:
1. overview: A title (format: "What is {Domain}?") and 2-3 explanatory paragraphs
2. vocabulary: 10-12 key terms with precise definitions and real-world examples
3. lifecycle: 7-9 sequential steps in the end-to-end workflow
4. aiUseCases: 4 specific areas where AI/automation adds measurable value
5. sources: Array of {title, url} for key references found via search

Be practical, specific, grounded in real industry knowledge. No generic filler. No invented terminology.
Use real terminology and real workflows found in your research.`,
      prompt: `Generate a comprehensive training theory module for: "${trimmedDomain}"`,
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
