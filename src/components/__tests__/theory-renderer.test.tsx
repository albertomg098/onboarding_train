import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { TheoryRenderer } from "@/components/theory-renderer";
import type { DomainTheoryData } from "@/lib/types";

const baseData: DomainTheoryData = {
  domainName: "Test Domain",
  overview: { title: "What is Test?", paragraphs: ["Para 1."] },
  vocabulary: Array.from({ length: 10 }, (_, i) => ({
    term: `Term ${i}`,
    definition: `Def ${i}`,
    example: `Example ${i}`,
  })),
  lifecycle: Array.from({ length: 7 }, (_, i) => ({
    step: i + 1,
    name: `Step ${i + 1}`,
    description: `Desc ${i + 1}`,
  })),
  aiUseCases: Array.from({ length: 4 }, (_, i) => ({
    area: `Area ${i}`,
    description: `Desc ${i}`,
    impact: `Impact ${i}`,
  })),
  sources: [],
};

describe("TheoryRenderer — sources section", () => {
  afterEach(cleanup);
  it("renders source links when sources are provided", () => {
    const data: DomainTheoryData = {
      ...baseData,
      sources: [
        { title: "Test Source", url: "https://example.com" },
        { title: "Another Source", url: "https://another.com" },
      ],
    };
    render(<TheoryRenderer data={data} />);

    const link = screen.getByRole("link", { name: "Test Source" });
    expect(link).toHaveAttribute("href", "https://example.com");
    expect(link).toHaveAttribute("target", "_blank");

    expect(screen.getByRole("link", { name: "Another Source" })).toBeInTheDocument();
    expect(screen.getByText("Sources")).toBeInTheDocument();
  });

  it("does not render sources section when sources is empty", () => {
    render(<TheoryRenderer data={baseData} />);
    expect(screen.queryByText("Sources")).not.toBeInTheDocument();
  });

  it("does not crash when sources is undefined (old data format)", () => {
    const oldData = { ...baseData } as Record<string, unknown>;
    delete oldData.sources;
    render(<TheoryRenderer data={oldData as DomainTheoryData} />);
    expect(screen.queryByText("Sources")).not.toBeInTheDocument();
  });
});
