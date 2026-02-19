export const SUGGESTED_PROMPTS: Record<string, string[]> = {
  domain: [
    "Explain what a freight forwarder does in simple terms",
    "What is a Bill of Lading and why does it matter?",
    "Walk me through a shipment's lifecycle from booking to delivery",
    "What are Incoterms? Explain FOB vs CIF vs DDP",
  ],
  framework: [
    "Give me a mini-scenario to practice the 5-step framework",
    "Explain the UNDERSTAND step — what are the 4 lenses?",
    "What are the most common mistakes candidates make?",
    "How do I properly model entities and their relationships?",
  ],
  simulation: [
    "Start a freight forwarding simulation — order management scenario",
    "Give me an operations exception case to work through",
    "Run a compliance-focused simulation",
    "Start a customer communication scenario",
  ],
  pricing: [
    "¿Cuál es el mejor modelo de pricing para AI Workers en freight forwarding?",
    "Ayúdame a calcular unit economics para un cliente con 300 envíos/mes",
    "¿Cómo justificar el ROI de Traza frente al coste de operadores humanos?",
    "Diseña una propuesta de pricing 3-layer para un forwarder mediano",
    "¿Qué objeciones de precio esperamos y cómo las rebatimos?",
  ],
};

export const CHAT_CONFIG = {
  maxResponseTokens: 2048,
  maxMessages: 40,
  warningThreshold: 6,
  maxHistoryMessages: 30,
  maxInputChars: 4000,
} as const;

export const CHAT_PLACEHOLDERS: Record<string, string> = {
  domain: "Ask about freight forwarding concepts...",
  framework: "Practice the 5-step framework...",
  simulation: "Start a simulation or ask for a scenario...",
  pricing: "Pregunta sobre estrategia de precios, unit economics o posicionamiento competitivo...",
};

// --- Model Selection ---

export const ANTHROPIC_MODELS = [
  {
    id: "claude-haiku-4-5-20251001",
    name: "Haiku 3.5",
    description: "Fast & affordable",
  },
  {
    id: "claude-sonnet-4-20250514",
    name: "Sonnet 4",
    description: "Balanced (default)",
  },
  {
    id: "claude-opus-4-20250514",
    name: "Opus 4",
    description: "Most capable",
  },
] as const;

export type AnthropicModelId = (typeof ANTHROPIC_MODELS)[number]["id"];

export const DEFAULT_MODEL_ID: AnthropicModelId = "claude-sonnet-4-20250514";

export const ALLOWED_MODEL_IDS: readonly string[] = ANTHROPIC_MODELS.map((m) => m.id);
