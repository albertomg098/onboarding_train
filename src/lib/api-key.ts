import { auth, clerkClient } from "@clerk/nextjs/server";

export async function getApiKey(): Promise<string> {
  const { userId } = await auth();

  if (userId) {
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const customKey = user.privateMetadata?.anthropicApiKey as string | undefined;
    if (customKey) return customKey;
  }

  const envKey = process.env.ANTHROPIC_API_KEY;
  if (envKey) return envKey;

  throw new Error("No API key available. Set one in Settings or configure ANTHROPIC_API_KEY env var.");
}
