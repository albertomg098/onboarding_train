import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Must mock before importing the component
vi.mock("@/lib/prompt-store", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/prompt-store")>();
  return {
    ...actual,
    updateAllDomainPrompts: vi.fn(),
    resetAllDomainPrompts: vi.fn(),
  };
});

vi.mock("@/lib/default-domain-data", () => ({
  DEFAULT_DOMAIN: {
    domainName: "Freight Forwarding",
    overview: { title: "What is Freight Forwarding?", paragraphs: ["Para."] },
    vocabulary: Array.from({ length: 10 }, (_, i) => ({
      term: `Term ${i}`,
      definition: `Def ${i}`,
      example: `Ex ${i}`,
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
  },
}));

import { DomainTheory } from "@/components/domain-theory";
import { updateAllDomainPrompts } from "@/lib/prompt-store";
import type { DomainTheoryData } from "@/lib/types";

const mockResponseData: DomainTheoryData = {
  domainName: "Logistics",
  overview: { title: "What is Logistics?", paragraphs: ["Para."] },
  vocabulary: Array.from({ length: 10 }, (_, i) => ({
    term: `LogTerm ${i}`,
    definition: `Def ${i}`,
    example: `Ex ${i}`,
  })),
  lifecycle: Array.from({ length: 7 }, (_, i) => ({
    step: i + 1,
    name: `LogStep ${i + 1}`,
    description: `Desc ${i + 1}`,
  })),
  aiUseCases: Array.from({ length: 4 }, (_, i) => ({
    area: `LogArea ${i}`,
    description: `Desc ${i}`,
    impact: `Impact ${i}`,
  })),
  sources: [{ title: "Source", url: "https://example.com" }],
};

describe("DomainTheory — layout consistency", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    const store: Record<string, string> = {};
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(
      (key: string) => store[key] ?? null
    );
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(
      (key: string, value: string) => {
        store[key] = value;
      }
    );
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("constrains the input card to the same max-width as the theory content", () => {
    render(<DomainTheory />);

    // The Card wrapping the input should have max-w-4xl to match TheoryRenderer
    const card = screen.getByText(/Default: Freight Forwarding/).closest("[class*='max-w']");
    expect(card).not.toBeNull();
    expect(card?.className).toMatch(/max-w-4xl/);
  });
});

describe("DomainTheory — generation wiring", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock localStorage
    const store: Record<string, string> = {};
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(
      (key: string) => store[key] ?? null
    );
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(
      (key: string, value: string) => {
        store[key] = value;
      }
    );
    vi.spyOn(Storage.prototype, "removeItem").mockImplementation(
      (key: string) => {
        delete store[key];
      }
    );
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("calls updateAllDomainPrompts after successful generation", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponseData),
    });

    const user = userEvent.setup();
    render(<DomainTheory />);

    const input = screen.getByPlaceholderText(/e\.g\./);
    await user.type(input, "Logistics");
    await user.click(screen.getByRole("button", { name: /generate/i }));

    // Wait for the async operation to complete
    await vi.waitFor(() => {
      expect(updateAllDomainPrompts).toHaveBeenCalledWith(mockResponseData);
    });
  });

  it("calls /api/generate-theory with the correct payload", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponseData),
    });
    globalThis.fetch = fetchMock;

    const user = userEvent.setup();
    render(<DomainTheory />);

    const input = screen.getByPlaceholderText(/e\.g\./);
    await user.type(input, "Logistics");
    await user.click(screen.getByRole("button", { name: /generate/i }));

    await vi.waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith("/api/generate-theory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: "Logistics" }),
      });
    });
  });

  it("shows error state on API failure", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.resolve({ error: "Server error" }),
    });

    const user = userEvent.setup();
    render(<DomainTheory />);

    const input = screen.getByPlaceholderText(/e\.g\./);
    await user.type(input, "Logistics");
    await user.click(screen.getByRole("button", { name: /generate/i }));

    await vi.waitFor(() => {
      expect(screen.getByText("Server error")).toBeInTheDocument();
    });
  });
});
