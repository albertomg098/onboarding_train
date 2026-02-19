import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";

vi.mock("@/lib/prompt-store", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/prompt-store")>();
  return {
    ...actual,
    getCachedDomainData: vi.fn(),
  };
});

import { FrameworkTheory } from "@/components/framework-theory";
import { getCachedDomainData } from "@/lib/prompt-store";
import type { DomainTheoryData } from "@/lib/types";

const mockData: DomainTheoryData = {
  domainName: "Logistics",
  overview: { title: "What is Logistics?", paragraphs: ["Para."] },
  vocabulary: [
    { term: "Supply Chain", definition: "Def", example: "Ex" },
    { term: "Warehouse", definition: "Def", example: "Ex" },
  ],
  lifecycle: [
    { step: 1, name: "Planning", description: "Desc" },
    { step: 2, name: "Execution", description: "Desc" },
  ],
  aiUseCases: [
    { area: "Route Optimization", description: "Desc", impact: "Impact" },
  ],
  sources: [],
};

describe("FrameworkTheory — domain awareness", () => {
  afterEach(cleanup);
  beforeEach(() => vi.clearAllMocks());

  it("renders domain-specific vocabulary when cached data exists", () => {
    vi.mocked(getCachedDomainData).mockReturnValue(mockData);
    render(<FrameworkTheory />);
    expect(screen.getByText(/Logistics/)).toBeInTheDocument();
  });

  it("renders gracefully when no cached data exists", () => {
    vi.mocked(getCachedDomainData).mockReturnValue(null);
    render(<FrameworkTheory />);
    // Should render without crashing — the default static content
    expect(screen.getByText("UNDERSTAND")).toBeInTheDocument();
  });
});
