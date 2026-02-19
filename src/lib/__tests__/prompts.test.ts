import { describe, it, expect } from "vitest";
import {
  buildDomainPrompt,
  buildFrameworkPrompt,
  buildSimulationPrompt,
  SYSTEM_PROMPTS,
} from "@/lib/prompts";
import { DEFAULT_DOMAIN } from "@/lib/default-domain-data";
import type { DomainTheoryData } from "@/lib/types";

const customDomain: DomainTheoryData = {
  domainName: "Logistics",
  overview: { title: "What is Logistics?", paragraphs: ["Para 1."] },
  vocabulary: [
    { term: "Supply Chain", definition: "End-to-end flow of goods", example: "From factory to store" },
    { term: "Warehouse", definition: "Storage facility", example: "Distribution center" },
    { term: "3PL", definition: "Third-party logistics provider", example: "DHL Supply Chain" },
    { term: "Last Mile", definition: "Final delivery leg", example: "From hub to doorstep" },
    { term: "Cross-Docking", definition: "Direct transfer between vehicles", example: "No storage needed" },
    { term: "TMS", definition: "Transportation Management System", example: "Oracle TMS" },
    { term: "WMS", definition: "Warehouse Management System", example: "Manhattan Associates" },
    { term: "Freight Audit", definition: "Verifying carrier invoices", example: "Checking rates vs contract" },
  ],
  lifecycle: [
    { step: 1, name: "Order Receipt", description: "Customer places order" },
    { step: 2, name: "Pick & Pack", description: "Items gathered and packaged" },
    { step: 3, name: "Dispatch", description: "Shipment leaves warehouse" },
    { step: 4, name: "Transit", description: "Goods in transit to destination" },
    { step: 5, name: "Delivery", description: "Final delivery to customer" },
  ],
  aiUseCases: [
    { area: "Route Optimization", description: "AI-optimized delivery routes", impact: "20% fuel savings" },
    { area: "Demand Forecasting", description: "Predict inventory needs", impact: "30% less stockouts" },
    { area: "Warehouse Robotics", description: "Automated picking systems", impact: "3x throughput" },
  ],
  sources: [],
};

describe("buildDomainPrompt", () => {
  it("with DEFAULT_DOMAIN matches the original hardcoded prompt", () => {
    const result = buildDomainPrompt(DEFAULT_DOMAIN);
    // Must contain key phrases from the original hardcoded prompt
    expect(result).toContain("senior industry expert");
    expect(result).toContain("freight forwarding and supply chain operations");
    expect(result).toContain("Bill of Lading");
    expect(result).toContain("Incoterms");
    expect(result).toContain("Workflow lifecycle");
    expect(result).toContain("Email Classification");
    expect(result).toContain("Professional but conversational");
  });

  it("with custom domain contains domain-specific content", () => {
    const result = buildDomainPrompt(customDomain);
    expect(result).toContain("Logistics");
    expect(result).toContain("Supply Chain");
    expect(result).toContain("Warehouse");
    expect(result).toContain("3PL");
    expect(result).toContain("Order Receipt");
    expect(result).toContain("Route Optimization");
    expect(result).toContain("Demand Forecasting");
  });

  it("with custom domain preserves instructional scaffolding", () => {
    const result = buildDomainPrompt(customDomain);
    expect(result).toContain("Your role:");
    expect(result).toContain("real-world examples");
    expect(result).toContain("what it is, why it matters, and a concrete example");
    expect(result).toContain("Professional but conversational");
    expect(result).toContain("Use markdown");
    expect(result).toContain("Respond in the same language the user writes in");
  });
});

describe("buildFrameworkPrompt", () => {
  it("with DEFAULT_DOMAIN contains framework steps and scoring", () => {
    const result = buildFrameworkPrompt(DEFAULT_DOMAIN);
    expect(result).toContain("5-step problem-solving framework");
    expect(result).toContain("UNDERSTAND");
    expect(result).toContain("MODEL");
    expect(result).toContain("PRIORITIZE");
    expect(result).toContain("DESIGN");
    expect(result).toContain("BUSINESS IMPACT");
    expect(result).toContain("Score responses on each step (1-5 scale)");
  });

  it("with custom domain contains domain-specific content", () => {
    const result = buildFrameworkPrompt(customDomain);
    expect(result).toContain("Logistics");
    expect(result).toContain("Supply Chain");
    expect(result).toContain("Order Receipt");
  });

  it("with custom domain preserves instructional scaffolding", () => {
    const result = buildFrameworkPrompt(customDomain);
    expect(result).toContain("UNDERSTAND");
    expect(result).toContain("MODEL");
    expect(result).toContain("Score responses on each step (1-5 scale)");
    expect(result).toContain("probing questions");
    expect(result).toContain("Encouraging but rigorous");
    expect(result).toContain("Respond in the same language the user writes in");
  });
});

describe("buildSimulationPrompt", () => {
  it("with DEFAULT_DOMAIN contains all 8 rules and scorecard", () => {
    const result = buildSimulationPrompt(DEFAULT_DOMAIN);
    expect(result).toContain("presenting a real client case");
    expect(result).toContain("freight forwarder with a specific operational problem");
    expect(result).toContain("company context, current pain points");
    expect(result).toContain("Strong Hire / Hire / Lean No / No Hire");
    expect(result).toContain("Scenario types:");
  });

  it("with custom domain contains domain-specific content", () => {
    const result = buildSimulationPrompt(customDomain);
    expect(result).toContain("Logistics");
    expect(result).toContain("Route Optimization");
    expect(result).toContain("Demand Forecasting");
    expect(result).toContain("Warehouse Robotics");
  });

  it("with custom domain preserves instructional scaffolding", () => {
    const result = buildSimulationPrompt(customDomain);
    expect(result).toContain("presenting a real client case");
    expect(result).toContain("company context, current pain points");
    expect(result).toContain("reward with rich data");
    expect(result).toContain("Track framework steps completed");
    expect(result).toContain("Strong Hire / Hire / Lean No / No Hire");
    expect(result).toContain("Professional, realistic");
    expect(result).toContain("Respond in the same language the user writes in");
  });
});

describe("SYSTEM_PROMPTS export", () => {
  it("has all three chat types", () => {
    expect(SYSTEM_PROMPTS).toHaveProperty("domain");
    expect(SYSTEM_PROMPTS).toHaveProperty("framework");
    expect(SYSTEM_PROMPTS).toHaveProperty("simulation");
  });

  it("contains default domain content", () => {
    expect(SYSTEM_PROMPTS.domain).toContain("freight forwarding");
    expect(SYSTEM_PROMPTS.framework).toContain("5-step problem-solving framework");
    expect(SYSTEM_PROMPTS.simulation).toContain("work trial simulation");
  });

  it("equals the template output with DEFAULT_DOMAIN", () => {
    expect(SYSTEM_PROMPTS.domain).toBe(buildDomainPrompt(DEFAULT_DOMAIN));
    expect(SYSTEM_PROMPTS.framework).toBe(buildFrameworkPrompt(DEFAULT_DOMAIN));
    expect(SYSTEM_PROMPTS.simulation).toBe(buildSimulationPrompt(DEFAULT_DOMAIN));
  });
});
