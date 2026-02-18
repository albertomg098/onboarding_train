# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Traza Training is an AI-powered training platform with three learning modules (Domain Knowledge, Mental Framework, Scenario Simulation). Each module has a theory tab and a chat-based training tab powered by Claude via the Vercel AI SDK.

## Commands

```bash
npm run dev          # Dev server with Turbopack (port 3000)
npm run build        # Production build with Turbopack
npm run lint         # ESLint (flat config, ESLint 9)
npm run test:e2e     # Playwright E2E tests (requires dev server running or auto-starts)
npx playwright test e2e/landing.spec.ts  # Run a single test file
```

**E2E test env vars:** `TEST_EMAIL` for Clerk auth in tests, `ANTHROPIC_API_KEY_FUNDED=1` to enable API-credit-requiring tests.

## Tech Stack

- **Next.js 15** (App Router, RSC, Turbopack) + **React 19** + **TypeScript** (strict)
- **Clerk** for auth (middleware protects all routes except `/sign-in`, `/sign-up`)
- **Vercel AI SDK v6** (`ai`, `@ai-sdk/anthropic`, `@ai-sdk/react`) — uses `streamText`, `useChat`, `UIMessage`
- **Tailwind CSS v4** (CSS-first config in `globals.css`, no `tailwind.config.js`)
- **shadcn/ui** (new-york style) + Radix UI + Lucide icons
- **Streamdown** for streaming markdown rendering in chat
- **No database** — persistence is Clerk `privateMetadata` (API keys) + `localStorage` (chat history, prompts, archives)

## Architecture

### Module Pattern

All three modules (`/domain`, `/framework`, `/simulation`) follow the same structure:
- Page (Server Component) → `ModuleLayout` → tabs between Theory view and `ChatInterface`
- Chat type string (`"domain"` | `"framework"` | `"simulation"`) flows through as a prop and keys localStorage/API calls

### Layout Stack

```
ClerkProvider → TooltipProvider → SidebarProvider → AppSidebar + ChatMigrationProvider → {children}
```

Root layout forces `className="dark"` (dark-only theme, teal/cyan on navy).

### API Routes

- `POST /api/chat` — Streaming chat via `streamText` + `createAnthropic` (model: `claude-sonnet-4-20250514`)
- `POST /api/generate-theory` — Structured output via `generateText` + Zod schema (`DomainTheoryDataSchema`), in-memory rate limiting
- `GET|POST|DELETE /api/settings/api-key` — CRUD for user's Anthropic API key in Clerk metadata

All routes call `await auth.protect()` at the top.

### Client vs Server Split

- Pages and layout are Server Components (no `"use client"`)
- All interactive components (`chat-interface`, `module-layout`, `domain-theory`, `prompt-editor`, `context-panel`, all `ai-elements/*`) are Client Components

### localStorage Convention

All keys prefixed with `traza-`: `traza-chat-{type}`, `traza-archives-{type}`, `traza-prompt-{type}`, `traza-context-{type}`, `traza-suggested-{type}`, `traza-custom-domain`. CRUD via `src/lib/prompt-store.ts`.

## Key Conventions

- **Imports:** Always use `@/` path alias (maps to `src/`)
- **Styling:** Use `cn()` from `@/lib/utils` for className merging (clsx + tailwind-merge)
- **Exports:** Named exports for components; default exports only for Next.js page/layout/error files
- **Schemas:** Zod schemas in `src/lib/types.ts` for API I/O validation and TypeScript inference
- **System prompts:** Hardcoded in `src/lib/prompts.ts`, overridable per-user via prompt editor (localStorage)
- **shadcn/ui:** Add new components via `npx shadcn@latest add <component>`

## Environment Variables

```
ANTHROPIC_API_KEY                    # Fallback API key (required if users don't provide their own)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY    # Clerk client-side key
CLERK_SECRET_KEY                     # Clerk server-side key
```
