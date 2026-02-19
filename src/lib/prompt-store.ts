import { SYSTEM_PROMPTS, buildDomainPrompt, buildFrameworkPrompt, buildSimulationPrompt } from "./prompts";
import { SUGGESTED_PROMPTS } from "./constants";
import type { DomainTheoryData } from "./types";

export type ChatType = "domain" | "framework" | "simulation";

const STORAGE_PREFIX = "traza-prompt-";
const SUGGESTED_PREFIX = "traza-suggested-";
const CONTEXT_PREFIX = "traza-context-";
const DOMAIN_KEY = "traza-active-domain";
const CACHE_KEY = "traza-custom-domain";

const MAX_PROMPT_LENGTH = 10_000;
const MAX_CONTEXT_LENGTH = 2_000;

// --- System Prompts ---

export function getSystemPrompt(type: ChatType): string {
  if (typeof window === "undefined") return SYSTEM_PROMPTS[type];
  const custom = localStorage.getItem(`${STORAGE_PREFIX}${type}`);
  return custom ?? SYSTEM_PROMPTS[type];
}

export function setSystemPrompt(type: ChatType, prompt: string): void {
  if (!prompt.trim()) return;
  localStorage.setItem(`${STORAGE_PREFIX}${type}`, prompt.slice(0, MAX_PROMPT_LENGTH));
}

export function resetSystemPrompt(type: ChatType): void {
  localStorage.removeItem(`${STORAGE_PREFIX}${type}`);
}

export function isPromptCustomized(type: ChatType): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(`${STORAGE_PREFIX}${type}`) !== null;
}

// --- Suggested Prompts ---

export function getSuggestedPrompts(type: ChatType): string[] {
  if (typeof window === "undefined") return SUGGESTED_PROMPTS[type] ?? [];
  const custom = localStorage.getItem(`${SUGGESTED_PREFIX}${type}`);
  if (custom) {
    try {
      return JSON.parse(custom);
    } catch {
      return SUGGESTED_PROMPTS[type] ?? [];
    }
  }
  return SUGGESTED_PROMPTS[type] ?? [];
}

export function setSuggestedPrompts(type: ChatType, prompts: string[]): void {
  localStorage.setItem(`${SUGGESTED_PREFIX}${type}`, JSON.stringify(prompts));
}

export function resetSuggestedPrompts(type: ChatType): void {
  localStorage.removeItem(`${SUGGESTED_PREFIX}${type}`);
}

// --- User Context ---

export function getContext(type: ChatType): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(`${CONTEXT_PREFIX}${type}`) ?? "";
}

export function setContext(type: ChatType, context: string): void {
  localStorage.setItem(`${CONTEXT_PREFIX}${type}`, context.slice(0, MAX_CONTEXT_LENGTH));
}

export function resetContext(type: ChatType): void {
  localStorage.removeItem(`${CONTEXT_PREFIX}${type}`);
}

// --- Model Selection ---

const MODEL_KEY = "traza-model";

export function getSelectedModel(): string {
  if (typeof window === "undefined") return "claude-sonnet-4-20250514";
  return localStorage.getItem(MODEL_KEY) ?? "claude-sonnet-4-20250514";
}

export function setSelectedModel(modelId: string): void {
  localStorage.setItem(MODEL_KEY, modelId);
}

// --- Full prompt assembly ---

export function getFullSystemPrompt(type: ChatType): string {
  const base = getSystemPrompt(type);
  const context = getContext(type);
  if (!context.trim()) return base;
  return `${base}\n\n## User Context\n${context}`;
}

// --- Domain Data Management ---

export function getActiveDomain(): string {
  if (typeof window === "undefined") return "Freight Forwarding";
  return localStorage.getItem(DOMAIN_KEY) ?? "Freight Forwarding";
}

export function getCachedDomainData(): DomainTheoryData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function updateAllDomainPrompts(data: DomainTheoryData): void {
  localStorage.setItem(DOMAIN_KEY, data.domainName);
  localStorage.setItem(CACHE_KEY, JSON.stringify(data));

  setSystemPrompt("domain", buildDomainPrompt(data));
  setSystemPrompt("framework", buildFrameworkPrompt(data));
  setSystemPrompt("simulation", buildSimulationPrompt(data));
}

export function resetAllDomainPrompts(): void {
  localStorage.removeItem(DOMAIN_KEY);
  localStorage.removeItem(CACHE_KEY);
  resetSystemPrompt("domain");
  resetSystemPrompt("framework");
  resetSystemPrompt("simulation");
}

// --- Export / Import ---

export function exportAllPrompts(): string {
  const data: Record<string, unknown> = {};
  const types: ChatType[] = ["domain", "framework", "simulation"];
  for (const type of types) {
    const prompt = localStorage.getItem(`${STORAGE_PREFIX}${type}`);
    const suggested = localStorage.getItem(`${SUGGESTED_PREFIX}${type}`);
    const context = localStorage.getItem(`${CONTEXT_PREFIX}${type}`);
    if (prompt) data[`prompt-${type}`] = prompt;
    if (suggested) data[`suggested-${type}`] = suggested;
    if (context) data[`context-${type}`] = context;
  }
  return JSON.stringify(data, null, 2);
}

export function importAllPrompts(json: string): { success: boolean; error?: string } {
  try {
    const data = JSON.parse(json);
    if (typeof data !== "object" || data === null) {
      return { success: false, error: "Invalid format: expected JSON object" };
    }
    for (const [key, value] of Object.entries(data)) {
      if (
        typeof value === "string" &&
        (key.startsWith("prompt-") || key.startsWith("suggested-") || key.startsWith("context-"))
      ) {
        localStorage.setItem(`traza-${key}`, value);
      }
    }
    return { success: true };
  } catch {
    return { success: false, error: "Invalid JSON" };
  }
}
