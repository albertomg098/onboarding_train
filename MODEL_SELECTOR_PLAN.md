# Plan: Add Model Selector to Training Chats

## Review Notes (Senior → Junior)

The original plan is solid in structure but has several issues I'm correcting:

1. **Step 1 is speculative.** You scaffold a component (`npx ai-elements@latest add model-selector`) then say "read the generated file to confirm its API." That's hope-driven development. We don't know what that component exports, so the plan must not depend on its internal API. I'm restructuring so we read it first and adapt.
2. **Option A / Option B in Step 6 is a decision you should have made before writing the plan.** A plan with "it depends" is not a plan. We go with Option B (native `PromptInputSelect`) as the guaranteed path, and only swap to the installed component if it's a clear win after inspection.
3. **`DEFAULT_MODEL_ID` import in prompt-store.ts** — you flagged "circular import risk" then said "hardcode is simpler." Good call, but then you also import it in `route.ts`. Be consistent: use the constant in server code, hardcode in client-side localStorage helpers.
4. **Missing: `useState` import** — you add `useState` and `useCallback` usage but never mention importing them. They may already be imported, but the plan should verify, not assume.
5. **Security validation is correct** — the allowlist approach is right. No notes.
6. **Step 7 is a non-step.** "No change needed here" shouldn't be a step. Removed.
7. **Duplicated allowlist array.** The original plan defines `ALLOWED_MODELS` inline in route.ts duplicating the model IDs from constants. Single source of truth: derive it from `ANTHROPIC_MODELS` in constants.ts and import it in the route.

---

## Goal

Add a model selector dropdown to the chat input footer across all training chat tabs. Users can pick between Haiku 3.5 (cheap/fast), Sonnet 4 (default), and Opus 4 (powerful). Selection persists via `localStorage` and is sent to the API route, which validates it server-side.

## Models

| Display Name     | Model ID                    | Use Case                     |
|------------------|-----------------------------|------------------------------|
| Haiku 3.5        | `claude-haiku-4-5-20251001` | Fast & affordable            |
| Sonnet 4         | `claude-sonnet-4-20250514`  | Balanced (default)           |
| Opus 4           | `claude-opus-4-20250514`    | Most capable                 |

---

## Step 1 — Install and inspect the model-selector component

```bash
npx ai-elements@latest add model-selector
```

After installation, **immediately read** the generated file:

```bash
cat src/components/ai-elements/model-selector.tsx
```

**Decision gate:** Does the component export a reusable `<ModelSelector>` that accepts `models`, `value`, and `onValueChange` props (or similar)?

- **If yes** → use it in Step 6 (Option A).
- **If no / unclear / too opinionated** → use `PromptInputSelect` already available from prompt-input (Option B). The installed file stays in the repo unused — no harm.

> **Checkpoint:** `npm run build` passes. File exists at `src/components/ai-elements/model-selector.tsx`.

---

## Step 2 — Add model constants

**File:** `src/lib/constants.ts`

Append at the bottom:

```ts
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
```

**Why the type and `ALLOWED_MODEL_IDS`?**
- `AnthropicModelId` gives us compile-time safety wherever we pass model IDs.
- `ALLOWED_MODEL_IDS` is derived from `ANTHROPIC_MODELS` — single source of truth. Used in both client and API route. No duplicated arrays.

> **Checkpoint:** `npx tsc --noEmit` passes.

---

## Step 3 — Add model persistence helpers

**File:** `src/lib/prompt-store.ts`

Add after the existing Context section (~line 74):

```ts
// --- Model Selection ---

const MODEL_KEY = "traza-model";

export function getSelectedModel(): string {
  if (typeof window === "undefined") return "claude-sonnet-4-20250514";
  return localStorage.getItem(MODEL_KEY) ?? "claude-sonnet-4-20250514";
}

export function setSelectedModel(modelId: string): void {
  localStorage.setItem(MODEL_KEY, modelId);
}
```

**Note:** We intentionally hardcode the fallback string instead of importing `DEFAULT_MODEL_ID` from constants. `prompt-store.ts` may already import from constants or be imported by it — this avoids any circular dependency risk. The hardcoded value is the same and won't drift because the default model is Sonnet 4 by definition.

> **Checkpoint:** TypeScript compiles. Manual test in browser console: `localStorage.setItem("traza-model", "claude-opus-4-20250514"); localStorage.getItem("traza-model")`.

---

## Step 4 — Send the selected model from client to API

**File:** `src/components/chat-interface.tsx`

### 4a. Add import

Near existing `prompt-store` imports:

```ts
import { getSelectedModel } from "@/lib/prompt-store";
```

### 4b. Add `model` to the request body

In the `prepareSendMessagesRequest` callback (~line 56-62):

```ts
prepareSendMessagesRequest: ({ messages, id }) => ({
  body: {
    id,
    messages,
    type,
    systemPrompt: getFullSystemPrompt(type),
    model: getSelectedModel(), // ← new
  },
}),
```

**Why here and not via state?** `getSelectedModel()` reads fresh from localStorage on every send. This means if the user changes model mid-conversation, the next message uses the new model immediately — no stale state bugs, no extra re-renders of the transport config.

> **Checkpoint:** Dev server running → send a message → Network tab → inspect request payload → confirm `"model": "claude-sonnet-4-20250514"` is present.

---

## Step 5 — Validate and use the model in the API route

**File:** `src/app/api/chat/route.ts`

### 5a. Add imports

```ts
import { ALLOWED_MODEL_IDS, DEFAULT_MODEL_ID } from "@/lib/constants";
```

### 5b. Extract `model` from request body

At ~line 14, add `model` to destructuring:

```ts
const { messages, type, systemPrompt, model } = await req.json();
```

### 5c. Validate and use

Replace the hardcoded model string (~line 28):

```ts
const selectedModel = ALLOWED_MODEL_IDS.includes(model) ? model : DEFAULT_MODEL_ID;

const result = streamText({
  model: createAnthropic({ apiKey })(selectedModel),
  system: finalPrompt,
  messages: modelMessages,
});
```

**Security:** The allowlist prevents arbitrary model ID injection. Invalid values silently fall back to Sonnet 4. No error thrown to the client — we don't leak information about what models exist or don't.

> **Checkpoint:** Restart dev server → send message → server logs show correct model. Test injection: use DevTools to POST with `"model": "gpt-4o"` → confirm fallback to Sonnet 4.

---

## Step 6 — Add the Model Selector UI

**File:** `src/components/chat-interface.tsx`

### 6a. Add imports

```ts
import { ANTHROPIC_MODELS } from "@/lib/constants";
import { setSelectedModel } from "@/lib/prompt-store";
// getSelectedModel already imported in Step 4
```

Verify `useState` and `useCallback` are already imported from "react" at the top of the file. If not, add them.

For Option B, also import from prompt-input (verify these exports exist in `src/components/ai-elements/prompt-input.tsx` first):
```ts
import {
  PromptInputSelect,
  PromptInputSelectTrigger,
  PromptInputSelectContent,
  PromptInputSelectItem,
  PromptInputSelectValue,
} from "@/components/ai-elements/prompt-input";
```

### 6b. Add state

Inside the `ChatInterface` component, after existing state declarations:

```ts
const [selectedModel, setSelectedModelState] = useState(() => getSelectedModel());

const handleModelChange = useCallback((modelId: string) => {
  setSelectedModelState(modelId);
  setSelectedModel(modelId); // persist to localStorage
}, []);
```

### 6c. Render the selector in the footer

**Option A** — If the installed `ModelSelector` component from Step 1 is confirmed usable:

```tsx
import { ModelSelector } from "@/components/ai-elements/model-selector";

// ...inside JSX:
<PromptInputFooter>
  <ModelSelector
    models={ANTHROPIC_MODELS}
    value={selectedModel}
    onValueChange={handleModelChange}
  />
  {/* ...existing stop/submit buttons unchanged... */}
</PromptInputFooter>
```

**Option B** (safe default) — Using `PromptInputSelect`:

```tsx
<PromptInputFooter>
  <PromptInputSelect value={selectedModel} onValueChange={handleModelChange}>
    <PromptInputSelectTrigger className="w-auto gap-1 text-xs h-8">
      <PromptInputSelectValue />
    </PromptInputSelectTrigger>
    <PromptInputSelectContent>
      {ANTHROPIC_MODELS.map((m) => (
        <PromptInputSelectItem key={m.id} value={m.id}>
          <span>{m.name}</span>
          <span className="ml-2 text-muted-foreground text-xs">
            {m.description}
          </span>
        </PromptInputSelectItem>
      ))}
    </PromptInputSelectContent>
  </PromptInputSelect>

  {isStreaming ? (
    <Button variant="outline" size="sm" type="button" onClick={() => stop()}>
      Stop
    </Button>
  ) : (
    <PromptInputSubmit disabled={!input.trim()} />
  )}
</PromptInputFooter>
```

**If `PromptInputSelect` is NOT exported from prompt-input**, fall back to raw shadcn `Select` from `@/components/ui/select` with the same pattern.

> **Checkpoint:** Visit any training chat → model dropdown visible in footer → change to Haiku → refresh → still shows Haiku → send message → Network tab confirms `"model": "claude-haiku-4-5-20251001"`.

---

## Files Modified (Summary)

| File | Change |
|------|--------|
| `src/lib/constants.ts` | Add `ANTHROPIC_MODELS`, `AnthropicModelId`, `DEFAULT_MODEL_ID`, `ALLOWED_MODEL_IDS` |
| `src/lib/prompt-store.ts` | Add `getSelectedModel()` and `setSelectedModel()` |
| `src/components/chat-interface.tsx` | Import model utils, add state + handler, send model in request body, render selector in footer |
| `src/app/api/chat/route.ts` | Import constants, extract & validate `model` from request, use in `createAnthropic()` |
| `src/components/ai-elements/model-selector.tsx` | New file (auto-scaffolded via `npx ai-elements@latest add model-selector`) |

---

## Verification Checklist

| # | Check | How |
|---|-------|-----|
| 1 | Build | `npm run build` — zero errors |
| 2 | Visual | Open Domain, Framework, Simulation tabs → selector visible in each footer |
| 3 | Persistence | Select Haiku → refresh → still Haiku |
| 4 | API payload | DevTools Network → send message → body has correct `model` value |
| 5 | Security | POST with `"model": "gpt-4o"` via DevTools → server uses Sonnet 4 |
| 6 | Lint | `npm run lint` — passes |
| 7 | E2E (if exists) | `npm run test:e2e` — no regressions |

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| `npx ai-elements` scaffolds something unexpected | Decision gate in Step 1; Option B as guaranteed fallback |
| Circular imports between constants ↔ prompt-store | Hardcoded fallback in prompt-store, no import from constants |
| User sends arbitrary model ID | Server-side allowlist in route.ts; silent fallback to default |
| `PromptInputSelect` not exported from prompt-input | Verify exports before coding; if missing, use raw shadcn `Select` |
| `localStorage` unavailable (SSR / incognito) | `typeof window` guard in `getSelectedModel()` |
| Model state out of sync with localStorage | Read fresh from localStorage on each send (Step 4b); state is UI-only |
| Duplicated model ID arrays across files | `ALLOWED_MODEL_IDS` derived from `ANTHROPIC_MODELS` — single source of truth |