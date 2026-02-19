import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock localStorage
const store: Record<string, string> = {};
const localStorageMock = {
  getItem: vi.fn((key: string) => store[key] ?? null),
  setItem: vi.fn((key: string, value: string) => {
    store[key] = value;
  }),
  removeItem: vi.fn((key: string) => {
    delete store[key];
  }),
  clear: vi.fn(() => {
    Object.keys(store).forEach((k) => delete store[k]);
  }),
  length: 0,
  key: vi.fn(() => null),
};

Object.defineProperty(globalThis, "localStorage", { value: localStorageMock });

import { getSystemPrompt } from "@/lib/prompt-store";

import type { DomainTheoryData } from "@/lib/types";

const mockData: DomainTheoryData = {
  domainName: "Logistics",
  overview: { title: "What is Logistics?", paragraphs: ["Para 1."] },
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

describe("prompt-store — domain prompt management", () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  describe("updateAllDomainPrompts", () => {
    it("sets the active domain name", async () => {
      const { updateAllDomainPrompts, getActiveDomain } = await import(
        "@/lib/prompt-store"
      );
      updateAllDomainPrompts(mockData);
      expect(getActiveDomain()).toBe("Logistics");
    });

    it("caches the full domain data", async () => {
      const { updateAllDomainPrompts, getCachedDomainData } = await import(
        "@/lib/prompt-store"
      );
      updateAllDomainPrompts(mockData);
      const cached = getCachedDomainData();
      expect(cached).not.toBeNull();
      expect(cached!.domainName).toBe("Logistics");
    });

    it("sets domain system prompt with vocabulary terms", async () => {
      const { updateAllDomainPrompts } = await import("@/lib/prompt-store");
      updateAllDomainPrompts(mockData);
      const prompt = getSystemPrompt("domain");
      expect(prompt).toContain("Supply Chain");
      expect(prompt).toContain("Warehouse");
    });

    it("sets framework system prompt with lifecycle steps", async () => {
      const { updateAllDomainPrompts } = await import("@/lib/prompt-store");
      updateAllDomainPrompts(mockData);
      const prompt = getSystemPrompt("framework");
      expect(prompt).toContain("Planning");
      expect(prompt).toContain("Execution");
    });

    it("sets simulation system prompt with AI use case areas", async () => {
      const { updateAllDomainPrompts } = await import("@/lib/prompt-store");
      updateAllDomainPrompts(mockData);
      const prompt = getSystemPrompt("simulation");
      expect(prompt).toContain("Route Optimization");
    });
  });

  describe("resetAllDomainPrompts", () => {
    it("resets active domain to default", async () => {
      const { updateAllDomainPrompts, resetAllDomainPrompts, getActiveDomain } =
        await import("@/lib/prompt-store");
      updateAllDomainPrompts(mockData);
      resetAllDomainPrompts();
      expect(getActiveDomain()).toBe("Freight Forwarding");
    });

    it("clears cached domain data", async () => {
      const {
        updateAllDomainPrompts,
        resetAllDomainPrompts,
        getCachedDomainData,
      } = await import("@/lib/prompt-store");
      updateAllDomainPrompts(mockData);
      resetAllDomainPrompts();
      expect(getCachedDomainData()).toBeNull();
    });

    it("clears system prompts for all chat types", async () => {
      const { updateAllDomainPrompts, resetAllDomainPrompts } = await import(
        "@/lib/prompt-store"
      );
      updateAllDomainPrompts(mockData);
      resetAllDomainPrompts();

      // After reset, getSystemPrompt should return defaults (from SYSTEM_PROMPTS)
      // not the Logistics-specific prompts
      const domainPrompt = getSystemPrompt("domain");
      expect(domainPrompt).not.toContain("Logistics");
    });
  });

  describe("getCachedDomainData", () => {
    it("returns null when nothing is cached", async () => {
      const { getCachedDomainData } = await import("@/lib/prompt-store");
      expect(getCachedDomainData()).toBeNull();
    });

    it("returns parsed data when cache exists", async () => {
      const { updateAllDomainPrompts, getCachedDomainData } = await import(
        "@/lib/prompt-store"
      );
      updateAllDomainPrompts(mockData);
      const cached = getCachedDomainData();
      expect(cached).not.toBeNull();
      expect(cached!.vocabulary).toHaveLength(2);
    });

    it("returns null on corrupted JSON (no crash)", async () => {
      store["traza-custom-domain"] = "{invalid json";
      const { getCachedDomainData } = await import("@/lib/prompt-store");
      expect(getCachedDomainData()).toBeNull();
    });
  });

  describe("getActiveDomain", () => {
    it("returns default when nothing is set", async () => {
      const { getActiveDomain } = await import("@/lib/prompt-store");
      expect(getActiveDomain()).toBe("Freight Forwarding");
    });
  });
});
