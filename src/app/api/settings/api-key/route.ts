import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { userId } = await auth.protect();

  let body: { apiKey?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { apiKey } = body;

  if (apiKey && !apiKey.startsWith("sk-ant-")) {
    return NextResponse.json({ error: "Invalid Anthropic API key format" }, { status: 400 });
  }

  const client = await clerkClient();
  await client.users.updateUserMetadata(userId, {
    privateMetadata: { anthropicApiKey: apiKey || null },
  });

  return NextResponse.json({ success: true });
}

export async function GET() {
  await auth.protect();

  try {
    const { getApiKey } = await import("@/lib/api-key");
    const key = await getApiKey();

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1,
        messages: [{ role: "user", content: "hi" }],
      }),
    });

    return NextResponse.json({
      valid: res.ok,
      source: key === process.env.ANTHROPIC_API_KEY ? "server" : "custom",
    });
  } catch {
    return NextResponse.json({ valid: false, source: "none" });
  }
}

export async function DELETE() {
  const { userId: deleteUserId } = await auth.protect();

  const client = await clerkClient();
  await client.users.updateUserMetadata(deleteUserId, {
    privateMetadata: { anthropicApiKey: null },
  });

  return NextResponse.json({ success: true });
}
