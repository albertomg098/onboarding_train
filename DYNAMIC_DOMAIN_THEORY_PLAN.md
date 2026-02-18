# Final Plan: Dynamic Domain Theory with Web Search & Structured Output

## Senior Review Summary

The junior's plan (and the "corrected" plan layered on top) gets the **strategic direction right** but has several technical errors, outdated API usage, and one missed risk that would cause real bugs in production. Here's the consolidated, corrected version.

---

## What the Original Plan Gets Right

1. **Kill Tavily, use Anthropic native web search** — Correct. `anthropic.tools.webSearch_20250305()` eliminates a dependency, custom tool code, lazy init, and API key management. Zero debate here.
2. **Single-call architecture** — Correct. `generateText` with `Output.object()` + tools in one call is the way. AI SDK 6 explicitly unified these.
3. **Don't hand-roll SSE** — Correct. Use `streamText` + `toDataStreamResponse()` if streaming is needed. Don't build custom `ReadableStream` with keepalive intervals.
4. **Centralized prompt store** — Correct pattern. `updateAllDomainPrompts()` owning all templates is clean.
5. **Template framework/simulation from cached data** — Correct. No extra API call needed.

---

## What the Original Plan Gets Wrong

### 🔴 Critical: `maxSteps` is AI SDK 5 API — AI SDK 6 uses `stopWhen`

The plan uses `maxSteps: 6` throughout. If the project is on AI SDK 6 (which it should be), this is **deprecated or removed**. AI SDK 6 replaced `maxSteps` with `stopWhen`:

```typescript
// ❌ WRONG (AI SDK 5)
await generateText({ maxSteps: 6, ... });

// ✅ CORRECT (AI SDK 6)
import { stepCountIs } from 'ai';
await generateText({ stopWhen: stepCountIs(6), ... });
```

**Critical nuance:** When using `Output.object()` with tools, the structured output generation **counts as a step**. So if you want up to 5 web searches + 1 structured output generation, you need `stopWhen: stepCountIs(7)`, not 6. The plan doesn't account for this.

### 🔴 Critical: `anthropic.createAnthropic({ apiKey })` — Wrong API

The plan does:
```typescript
const provider = anthropic.createAnthropic({ apiKey });
const model = provider('claude-sonnet-4-20250514');
```

The correct pattern with `@ai-sdk/anthropic` is:
```typescript
import { createAnthropic } from '@ai-sdk/anthropic';
const provider = createAnthropic({ apiKey });
const model = provider('claude-sonnet-4-20250514');
```

Or if using a singleton with env var:
```typescript
import { anthropic } from '@ai-sdk/anthropic';
const model = anthropic('claude-sonnet-4-20250514');
```

The `anthropic.createAnthropic` call doesn't exist — `anthropic` is already the default provider instance. You import `createAnthropic` separately to create a custom instance with a different API key.

### 🟡 Risk: Known Streaming Bug with Anthropic Web Search

There's an [open issue (#7649)](https://github.com/vercel/ai/issues/7649) where Anthropic's web search tool causes broken streaming rendering — punctuation and bullets appear in separate blocks. This directly impacts the Phase 3 streaming recommendation. **Mitigation:** test `streamText` + web search thoroughly before shipping, or stick with `generateText` (non-streaming) for v1 which avoids the issue entirely.

### 🟡 Risk: `web_fetch` Provider Tool Crash

There's another [open issue (#11856)](https://github.com/vercel/ai/issues/11856) where Anthropic provider tool errors (like `web_fetch_tool_result_error`) crash the AI SDK with a JSON parse error. While we're only using `webSearch` (not `webFetch`), this signals the provider-defined tool error handling path in the SDK may be fragile. Defensive error handling around the `generateText` call is not optional.

### 🟡 Missing: AI SDK Version Check

The plan says "ensure `@ai-sdk/anthropic` is at version `>=1.2.0`" — this is vague. The web search tool was added in a specific version. The plan should explicitly require version checks and document them.

### 🟡 Missing: `structuredOutputMode` Consideration

Anthropic supports native structured outputs for Claude Sonnet 4+ models. The `@ai-sdk/anthropic` provider has a `structuredOutputMode` option (`"outputFormat" | "jsonTool" | "auto"`). The plan doesn't mention this. Using `"outputFormat"` with compatible models can improve reliability of structured output generation.

### 🟡 Overcomplication: The Fallback Without Search

The plan has a `catch` block that detects web search failures and retries without search. This is reasonable but the error detection (`error.message.includes('web_search')`) is fragile. A simpler pattern: just let the single call handle it. If web search is unavailable, Claude will still generate content from training data — the `maxUses` on the tool doesn't force search. Claude uses it when useful.

A true fallback should be for catastrophic failures (network, auth, rate limit), not "web search specifically failed."

---

## Corrected Implementation Plan

### Architecture

**Single `generateText` call** with:
- Anthropic native web search (`anthropic.tools.webSearch_20250305`)
- Structured output via `Output.object()` with Zod schema
- `stopWhen: stepCountIs(7)` (5 searches + 1 tool processing + 1 structured output)
- No Tavily, no custom tools, no SSE for v1

### Prerequisites

Before starting, verify:
```bash
# Check AI SDK versions — require v6+
npm ls ai @ai-sdk/anthropic @ai-sdk/react

# Required minimums (approximate — verify against changelogs):
# ai >= 6.0.0
# @ai-sdk/anthropic >= 3.0.0 (v6-compatible)
```

Ensure **web search is enabled** in your [Anthropic Console](https://console.anthropic.com/) organization settings.

---

### Phase 1: Web Search + Single-Call API Route (1–2 days)

#### 1.1 No New Dependencies

`@ai-sdk/anthropic` already includes `anthropic.tools.webSearch_20250305()`. Zero `npm install` needed.

#### 1.2 API Route — Single Call

**File: `src/app/api/generate-theory/route.ts`**

```typescript
import { generateText, Output, stepCountIs } from 'ai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { auth } from '@clerk/nextjs/server';
import { getApiKey } from '@/lib/api-key';
import { DomainTheoryDataSchema } from '@/lib/types';
import { NextResponse } from 'next/server';

// ... keep existing rate limit logic ...

export async function POST(req: Request) {
  const { userId } = await auth.protect();
  const apiKey = await getApiKey();

  if (isRateLimited(userId)) {
    return NextResponse.json(
      { error: 'Too many requests. Wait a minute and try again.' },
      { status: 429 }
    );
  }

  let body: { domain?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { domain } = body;
  if (
    !domain ||
    typeof domain !== 'string' ||
    domain.trim().length < 2 ||
    domain.length > 100
  ) {
    return NextResponse.json(
      { error: 'Domain must be 2-100 characters' },
      { status: 400 }
    );
  }

  const trimmedDomain = domain.trim();

  // Create provider instance with explicit API key
  const provider = createAnthropic({ apiKey });
  const model = provider('claude-sonnet-4-20250514');

  try {
    // Single call: web search → structured output, all in one conversation turn
    const { output } = await generateText({
      model,
      // 5 possible searches + tool result processing + structured output = 7 steps
      stopWhen: stepCountIs(7),
      maxTokens: 4000,
      tools: {
        web_search: provider.tools.webSearch_20250305({
          maxUses: 5,
        }),
      },
      output: Output.object({ schema: DomainTheoryDataSchema }),
      providerOptions: {
        anthropic: {
          // Use native structured output format for Sonnet 4+
          structuredOutputMode: 'auto',
        },
      },
      system: `You are an expert at creating educational content for industry training.
You have access to web search. Use it to find accurate, current information about the domain.

Perform 3-4 targeted searches to gather:
- Industry overview, key terminology, and vocabulary
- End-to-end workflow/lifecycle steps
- AI/automation applications and real metrics

Then generate a comprehensive theory module with:
1. overview: Title ("What is {Domain}?") + 2-3 explanatory paragraphs
2. vocabulary: 10-12 key terms with precise definitions and real-world examples
3. lifecycle: 7-9 sequential steps in the end-to-end workflow
4. aiUseCases: 4 areas where AI/automation adds measurable value
5. sources: Array of {title, url} for key references found via search

Be practical, specific, grounded. No generic filler. No invented terminology.
Use real terminology and real workflows found in your research.`,
      prompt: `Generate a comprehensive training theory module for: "${trimmedDomain}"`,
    });

    if (!output) {
      return NextResponse.json(
        { error: 'Generation produced no output' },
        { status: 500 }
      );
    }

    return NextResponse.json(output);
  } catch (error) {
    console.error('Theory generation failed:', error);
    return NextResponse.json(
      { error: 'Failed to generate theory. Please try again.' },
      { status: 500 }
    );
  }
}
```

**Key differences from original plan:**
- Uses `createAnthropic` (correct import), not `anthropic.createAnthropic`
- Uses `stopWhen: stepCountIs(7)` (AI SDK 6), not `maxSteps: 6`
- Uses `provider.tools.webSearch_20250305()` (tool from the custom provider instance, not the singleton)
- Adds `structuredOutputMode: 'auto'` for native structured output support
- Removes the fragile "retry without search" fallback — if the call fails, it fails. The error message is clear.
- No separate research step, no source extraction logic, no two-call pipeline

#### 1.3 Fallback: If `Output.object` + Provider Tools Has Issues

If combining `Output.object()` with the web search provider tool causes SDK errors in practice (not documented, but possible edge case given the relative newness), fall back to:

```typescript
const result = await generateText({
  model,
  stopWhen: stepCountIs(7),
  maxTokens: 4000,
  tools: {
    web_search: provider.tools.webSearch_20250305({ maxUses: 5 }),
  },
  system: `...same system prompt...
  
After researching, respond with ONLY a valid JSON object matching this schema:
${JSON.stringify(zodToJsonSchema(DomainTheoryDataSchema), null, 2)}

No markdown fences. No explanation. Just the JSON object.`,
  prompt: `Research and generate training theory for: "${trimmedDomain}"`,
});

const parsed = DomainTheoryDataSchema.safeParse(JSON.parse(result.text));
if (!parsed.success) {
  console.error('Schema validation failed:', parsed.error);
  return NextResponse.json({ error: 'Invalid output format' }, { status: 500 });
}
return NextResponse.json(parsed.data);
```

This is still **one API call**. Claude searches and generates in a single turn.

#### 1.4 Schema Update

**File: `src/lib/types.ts`**

Add optional `sources` field to `DomainTheoryDataSchema`:

```typescript
sources: z
  .array(
    z.object({
      title: z.string().describe('Title of the source article or page'),
      url: z.string().url().describe('URL of the source'),
    })
  )
  .optional()
  .default([])
  .describe('Web sources used during research'),
```

Backward compatible — old cached data without `sources` still works via `.default([])`.

#### 1.5 Render Sources

**File: `src/components/theory-renderer.tsx`**

```tsx
{data.sources && data.sources.length > 0 && (
  <section className="mt-6">
    <h3 className="text-lg font-semibold mb-2">Sources</h3>
    <ul className="text-sm text-muted-foreground space-y-1">
      {data.sources.map((source, i) => (
        <li key={i}>
          <a
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground transition-colors"
          >
            {source.title}
          </a>
        </li>
      ))}
    </ul>
  </section>
)}
```

---

### Phase 2: Domain-Aware Prompts + Templating (1 day)

#### 2.1 Centralized Prompt Store

**File: `src/lib/prompt-store.ts`**

```typescript
import type { DomainTheoryData } from './types';

const DOMAIN_KEY = 'traza-active-domain';
const CACHE_KEY = 'traza-custom-domain';

export function getActiveDomain(): string {
  if (typeof window === 'undefined') return 'Freight Forwarding';
  return localStorage.getItem(DOMAIN_KEY) ?? 'Freight Forwarding';
}

export function setActiveDomain(domain: string): void {
  localStorage.setItem(DOMAIN_KEY, domain);
}

export function getCachedDomainData(): DomainTheoryData | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Build and persist ALL domain-dependent prompts from generated theory data.
 * Called once after successful generation. All prompt templates live here.
 */
export function updateAllDomainPrompts(data: DomainTheoryData): void {
  const vocabList = data.vocabulary.map((v) => v.term).join(', ');
  const lifecycleFlow = data.lifecycle.map((l) => l.name).join(' → ');
  const aiAreas = data.aiUseCases.map((a) => a.area).join(', ');
  const domain = data.domainName;

  setActiveDomain(domain);
  localStorage.setItem(CACHE_KEY, JSON.stringify(data));

  setSystemPrompt(
    'domain',
    `You are a senior industry expert in ${domain}.
Key vocabulary: ${vocabList}
Workflow: ${lifecycleFlow}
AI opportunities: ${aiAreas}
Answer questions about ${domain} with precision. Use real terminology.
Language: Respond in the same language the user writes in.`
  );

  setSystemPrompt(
    'framework',
    `You are a mentor helping apply a 5-step problem-solving framework to AI automation in ${domain}.
Steps: UNDERSTAND → MODEL → PRIORITIZE → DESIGN → BUSINESS IMPACT
Domain vocabulary: ${vocabList}
Workflow: ${lifecycleFlow}
AI areas: ${aiAreas}
Use ${domain}-specific examples and real terminology.
Language: Respond in the same language the user writes in.`
  );

  setSystemPrompt(
    'simulation',
    `You are conducting a work trial simulation for AI automation in ${domain}.
Present realistic client scenarios using real terminology:
Terms: ${vocabList}
Workflow: ${lifecycleFlow}
AI areas: ${aiAreas}
Start with a client scenario, let the candidate drive, track framework steps, give a scorecard.
Language: Respond in the same language the user writes in.`
  );
}

export function resetAllDomainPrompts(): void {
  localStorage.removeItem(DOMAIN_KEY);
  localStorage.removeItem(CACHE_KEY);
  clearSystemPrompt('domain');
  clearSystemPrompt('framework');
  clearSystemPrompt('simulation');
}
```

#### 2.2 Wire Up in Domain Theory Component

**File: `src/components/domain-theory.tsx`**

After successful generation:
```typescript
const result = await fetch('/api/generate-theory', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ domain: inputValue }),
});

const data = await result.json();
if (result.ok) {
  setTheoryData(data);
  updateAllDomainPrompts(data); // ← Populate all domain prompts
}
```

#### 2.3 Template Framework & Simulation Pages

**File: `src/components/framework-theory.tsx` and `simulation-theory.tsx`**

Replace hardcoded freight forwarding examples with dynamic content from cached domain data:

```tsx
import { getCachedDomainData } from '@/lib/prompt-store';

// In component
const [domainData, setDomainData] = useState<DomainTheoryData | null>(null);

useEffect(() => {
  setDomainData(getCachedDomainData());
}, []);

// Then use domainData?.vocabulary, domainData?.lifecycle, etc.
// to populate examples, scenario descriptions, framework step illustrations
```

No extra API call. Pure client-side templating from already-generated data.

---

### Phase 3: Streaming (OPTIONAL — Only If Latency > 15s) (2–3 days)

> ⚠️ **Ship Phase 1 + 2 first. Measure latency. Only proceed here if single-call `generateText` takes >15s consistently.**

> ⚠️ **Known issue:** Anthropic web search + `streamText` has a rendering bug where punctuation appears in separate blocks ([vercel/ai#7649](https://github.com/vercel/ai/issues/7649)). Test thoroughly.

If streaming is needed:

**Server (`route.ts`):**
```typescript
import { streamText, stepCountIs } from 'ai';

export async function POST(req: Request) {
  // ... validation, auth ...

  const result = streamText({
    model,
    stopWhen: stepCountIs(7),
    maxTokens: 4000,
    tools: {
      web_search: provider.tools.webSearch_20250305({ maxUses: 5 }),
    },
    system: '...same system prompt...',
    prompt: `Generate training theory for: "${trimmedDomain}"`,
  });

  return result.toDataStreamResponse();
}
```

**Client:** Use `useCompletion` or `useChat` from `@ai-sdk/react`. These handle streaming, abort, and error states out of the box. Do NOT build custom `EventSource` / `ReadableStream` logic.

For structured streaming output, consider `streamText` with `Output.object()` — the SDK progressively streams the JSON fields as they're generated, but the client can only render partial results if the UI is designed for it. For a theory module (which is all-or-nothing), streaming only helps with perceived latency via a progress indicator, not progressive rendering.

---

### Phase 4: Documentation (0.5 day)

**Files to update:**
- `.env.local.example` — Note: no `TAVILY_API_KEY` needed. Just `ANTHROPIC_API_KEY`.
- `CLAUDE.md` — Document web search architecture, single-call pattern, `stopWhen` usage.
- `README.md` — Feature description: "Domain theory generation with real-time web research."

**Key doc note:** Web search requires enabling in Anthropic Console org settings. This is a deployment prerequisite, not a code change.

---

## File Changes Summary

| File | Action | Description |
|:---|:---|:---|
| `src/app/api/generate-theory/route.ts` | **Modify** | Single-call with native web search + `Output.object` + `stopWhen` |
| `src/lib/types.ts` | **Modify** | Add optional `sources` field to schema |
| `src/components/theory-renderer.tsx` | **Modify** | Render sources section |
| `src/lib/prompt-store.ts` | **Modify** | `updateAllDomainPrompts`, `resetAllDomainPrompts`, `getCachedDomainData` |
| `src/components/domain-theory.tsx` | **Modify** | Call `updateAllDomainPrompts` on generate |
| `src/components/framework-theory.tsx` | **Modify** | Template examples from cached domain data |
| `src/components/simulation-theory.tsx` | **Modify** | Template examples from cached domain data |
| `CLAUDE.md` | **Modify** | Document architecture |
| `README.md` | **Modify** | Document feature |

**Files NOT needed (eliminated from original plans):**
- ~~`src/lib/tools/web-search.ts`~~ — No custom tool
- ~~`package.json` changes~~ — No new dependencies
- ~~Any SSE/streaming utilities~~ — SDK built-in handles it

---

## Effort Estimates

| Task | Effort | Notes |
|:---|:---|:---|
| Phase 1: API route + schema + renderer | 1–2 days | Includes testing `Output.object` + tools compatibility |
| Phase 2: Prompt store + templating | 1 day | Straightforward refactor |
| Phase 3: Streaming (optional) | 2–3 days | Only if latency is a problem. Known bug risk. |
| Phase 4: Docs | 0.5 day | |
| **Total (without streaming)** | **2.5–3.5 days** | |
| **Total (with streaming)** | **4.5–6.5 days** | |

---

## Implementation Order

1. **Version check** — Confirm `ai` and `@ai-sdk/anthropic` are on v6-compatible versions. Upgrade if needed.
2. **Anthropic Console** — Enable web search in org settings.
3. **Phase 1.2** — Modify API route. Test with `curl`. Verify search results appear in structured output.
4. **Phase 1.3** — If `Output.object` + provider tools doesn't work, switch to JSON-parse fallback. Test again.
5. **Phase 1.4–1.5** — Schema + renderer. Verify backward compat with old cached data.
6. **Phase 2.1** — Prompt store refactor.
7. **Phase 2.2–2.3** — Wire up domain-theory component + template framework/simulation.
8. **Phase 4** — Docs.
9. **Measure latency** — If >15s consistently, proceed to Phase 3.
10. **Phase 3** — Only if needed. Use `streamText` + `toDataStreamResponse()`. Test for [#7649](https://github.com/vercel/ai/issues/7649) rendering bug.

---

## Testing Checklist

- [ ] `Output.object()` + `anthropic.tools.webSearch_20250305()` works in single call
- [ ] Generated output includes web-grounded terms and populated `sources` array
- [ ] Web search disabled in Console → call still works (Claude generates from training data)
- [ ] Rate limit exceeded → proper 429 response
- [ ] Custom domain → framework chat uses domain vocabulary in system prompt
- [ ] Custom domain → simulation chat uses domain scenarios
- [ ] Reset to default → all 3 prompts reset to freight forwarding
- [ ] Refresh page → cached custom domain loads correctly
- [ ] Old cached data (no `sources` field) → renders without errors
- [ ] Input validation: empty string, >100 chars, special characters
- [ ] Latency: single-call timing (target <15s)
- [ ] Token usage: output stays within `maxTokens: 4000`
- [ ] `stopWhen: stepCountIs(7)` is sufficient (no premature stop, no infinite loop)
- [ ] E2E: `npm run test:e2e` passes

---

## Comparison vs Original Plans

| Aspect | Junior Plan | "Corrected" Plan | This Plan |
|:---|:---|:---|:---|
| Web search | Tavily (custom tool) | Anthropic native ✅ | Anthropic native ✅ |
| API calls | 2 (research + generate) | 1 ✅ | 1 ✅ |
| New deps | `@tavily/core` | None ✅ | None ✅ |
| Multi-step API | `maxSteps` (v5) ❌ | `maxSteps` (v5) ❌ | **`stopWhen` (v6)** ✅ |
| Provider instantiation | N/A | `anthropic.createAnthropic` ❌ | **`createAnthropic`** ✅ |
| Structured output mode | N/A | Not mentioned | **`structuredOutputMode: 'auto'`** ✅ |
| Step count for output | N/A | 6 (doesn't account for output step) | **7** (5 search + 1 processing + 1 output) ✅ |
| Streaming bugs noted | No | No | **Yes** (issue #7649) ✅ |
| SSE | Hand-rolled | "Don't" ✅ | "Don't" + SDK built-in if needed ✅ |
| Effort | 5–8 days | 2.5–3.5 days | **2.5–3.5 days** |