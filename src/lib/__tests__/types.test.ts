import { describe, it, expect } from "vitest";
import { DomainTheoryDataSchema } from "@/lib/types";

const validBase = {
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
};

describe("DomainTheoryDataSchema — sources field", () => {
  it("validates an object WITH a sources array", () => {
    const data = {
      ...validBase,
      sources: [
        { title: "Example Source", url: "https://example.com" },
        { title: "Another Source", url: "https://another.com/page" },
      ],
    };
    const result = DomainTheoryDataSchema.safeParse(data);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.sources).toHaveLength(2);
      expect(result.data.sources[0]).toEqual({
        title: "Example Source",
        url: "https://example.com",
      });
    }
  });

  it("validates an object WITHOUT sources (backward compat, defaults to [])", () => {
    const result = DomainTheoryDataSchema.safeParse(validBase);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.sources).toEqual([]);
    }
  });

  it("rejects sources with missing url", () => {
    const data = {
      ...validBase,
      sources: [{ title: "No URL" }],
    };
    const result = DomainTheoryDataSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it("rejects sources with invalid url", () => {
    const data = {
      ...validBase,
      sources: [{ title: "Bad URL", url: "not-a-url" }],
    };
    const result = DomainTheoryDataSchema.safeParse(data);
    expect(result.success).toBe(false);
  });
});
