import { describe, it, expect, vi, beforeEach } from "vitest";
import type { DomainTheoryData } from "@/lib/types";

// Mock dependencies before importing the route
vi.mock("ai", () => ({
  generateText: vi.fn(),
  Output: { object: vi.fn(() => "mocked-output-config") },
  stepCountIs: vi.fn((n: number) => `stopWhen-${n}`),
}));

vi.mock("@ai-sdk/anthropic", () => ({
  createAnthropic: vi.fn(() => {
    const model = vi.fn(() => "mocked-model");
    model.tools = {
      webSearch_20250305: vi.fn(() => "mocked-web-search-tool"),
    };
    return model;
  }),
}));

vi.mock("@clerk/nextjs/server", () => ({
  auth: {
    protect: vi.fn(() => Promise.resolve({ userId: "test-user-123" })),
  },
}));

vi.mock("@/lib/api-key", () => ({
  getApiKey: vi.fn(() => Promise.resolve("test-api-key")),
}));

const mockTheoryData: DomainTheoryData = {
  domainName: "Freight Forwarding",
  overview: {
    title: "What is Freight Forwarding?",
    paragraphs: ["Paragraph one.", "Paragraph two."],
  },
  vocabulary: Array.from({ length: 10 }, (_, i) => ({
    term: `Term ${i}`,
    definition: `Def ${i}`,
    example: `Example ${i}`,
  })),
  lifecycle: Array.from({ length: 7 }, (_, i) => ({
    step: i + 1,
    name: `Step ${i + 1}`,
    description: `Description ${i + 1}`,
  })),
  aiUseCases: Array.from({ length: 4 }, (_, i) => ({
    area: `Area ${i}`,
    description: `Desc ${i}`,
    impact: `Impact ${i}`,
  })),
  sources: [
    { title: "Source 1", url: "https://example.com/1" },
    { title: "Source 2", url: "https://example.com/2" },
  ],
};

describe("POST /api/generate-theory", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("returns 200 with valid DomainTheoryData on success", async () => {
    const { generateText } = await import("ai");
    vi.mocked(generateText).mockResolvedValue({
      output: mockTheoryData,
    } as never);

    const { POST } = await import("../route");
    const req = new Request("http://localhost/api/generate-theory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ domain: "Freight Forwarding" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.domainName).toBe("Freight Forwarding");
    expect(body.sources).toHaveLength(2);
    expect(body.sources[0].url).toBe("https://example.com/1");
  });

  it("uses stopWhen with stepCountIs(7) and web search tool", async () => {
    const { generateText, stepCountIs } = await import("ai");
    vi.mocked(generateText).mockResolvedValue({
      output: mockTheoryData,
    } as never);

    const { POST } = await import("../route");
    const req = new Request("http://localhost/api/generate-theory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ domain: "Freight Forwarding" }),
    });

    await POST(req);

    expect(generateText).toHaveBeenCalledOnce();
    const callArgs = vi.mocked(generateText).mock.calls[0][0];

    // Must use stopWhen (not maxSteps)
    expect(callArgs).toHaveProperty("stopWhen");
    expect(callArgs).not.toHaveProperty("maxSteps");
    expect(stepCountIs).toHaveBeenCalledWith(7);

    // Must include web_search tool
    expect(callArgs.tools).toHaveProperty("web_search");

    // Must use Output.object
    expect(callArgs).toHaveProperty("output");
  });

  it("returns 400 for empty domain", async () => {
    const { POST } = await import("../route");
    const req = new Request("http://localhost/api/generate-theory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ domain: "" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 400 for domain > 100 chars", async () => {
    const { POST } = await import("../route");
    const req = new Request("http://localhost/api/generate-theory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ domain: "x".repeat(101) }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 400 for missing domain field", async () => {
    const { POST } = await import("../route");
    const req = new Request("http://localhost/api/generate-theory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});
