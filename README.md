<div align="center">

# Traza Training

**Master any industry domain through AI-powered training.**

Learn the theory, build mental frameworks, then practice with realistic simulations — all guided by Claude AI.

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Tailwind](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Claude](https://img.shields.io/badge/Claude-Sonnet_4-D97706?logo=anthropic&logoColor=white)](https://anthropic.com)
[![Clerk](https://img.shields.io/badge/Clerk-Auth-6C47FF?logo=clerk&logoColor=white)](https://clerk.com)
[![Playwright](https://img.shields.io/badge/Playwright-E2E-2EAD33?logo=playwright&logoColor=white)](https://playwright.dev)

</div>

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Scripts](#scripts)
- [Project Structure](#project-structure)
- [Architecture](#architecture)
- [Deployment](#deployment)
- [License](#license)

---

## Overview

Traza Training guides users through a structured three-step learning path:

<table>
<tr>
<td width="33%" valign="top">

### 1. Domain Knowledge

Learn the vocabulary, lifecycle, and AI applications of a target industry. Ships with freight forwarding content by default — or generate theory for **any domain** via AI.

</td>
<td width="33%" valign="top">

### 2. Mental Framework

Build structured thinking using a 5-step problem-solving framework:
**Understand** → **Model** → **Prioritize** → **Design** → **Business Impact**

</td>
<td width="33%" valign="top">

### 3. Scenario Simulation

Practice with realistic client scenarios. An AI interviewer tracks your framework usage and delivers detailed scorecards.

</td>
</tr>
</table>

Each module has a **Theory** tab with reference material and a **Training Chat** tab for interactive AI-powered practice.

> **Recommended path:** Domain → Framework → Simulation

---

## Features

<table>
<tr>
<td width="50%" valign="top">

**Custom Domain Generation**
Enter any industry (e.g. "Healthcare Logistics") to auto-generate full theory content — vocabulary, lifecycle, AI use cases — using structured AI output.

</td>
<td width="50%" valign="top">

**Prompt Customization**
Edit system prompts, user context, and suggested prompts per module from the Settings page. Export and import configurations.

</td>
</tr>
<tr>
<td width="50%" valign="top">

**Chat Archives**
Conversations are automatically archived (up to 5 per module) when cleared. Restore any past session with one click.

</td>
<td width="50%" valign="top">

**BYO API Key**
Users can bring their own Anthropic API key or fall back to the server default. Key status is validated in real time.

</td>
</tr>
<tr>
<td width="50%" valign="top">

**Streaming Responses**
Real-time streaming with rich markdown rendering — code blocks, tables, bold, lists — via Streamdown.

</td>
<td width="50%" valign="top">

**Fully Authenticated**
Clerk-powered auth with protected routes, per-user API key storage, and secure server-side key management.

</td>
</tr>
</table>

---

## Tech Stack

| Layer | Technology |
|:---|:---|
| **Framework** | [Next.js 15](https://nextjs.org) — App Router, React Server Components, Turbopack |
| **Language** | [TypeScript 5.9](https://typescriptlang.org) — strict mode |
| **AI** | [Vercel AI SDK v6](https://sdk.vercel.ai) + [Claude](https://docs.anthropic.com) (`claude-sonnet-4-20250514`) |
| **Auth** | [Clerk](https://clerk.com) — middleware-protected routes, per-user metadata |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com) — CSS-first config, dark-only theme |
| **Components** | [shadcn/ui](https://ui.shadcn.com) (new-york) + [Radix UI](https://radix-ui.com) |
| **Chat Rendering** | [Streamdown](https://github.com/nicepkg/streamdown) — streaming markdown with code highlighting |
| **Testing** | [Playwright](https://playwright.dev) — E2E with Clerk auth integration |

---

## Getting Started

### Prerequisites

- **Node.js** 18+
- A **[Clerk](https://clerk.com)** account
- An **[Anthropic API key](https://console.anthropic.com/)**

### 1. Clone and install

```bash
git clone https://github.com/your-org/traza-training.git
cd traza-training
npm install
```

### 2. Configure environment

```bash
cp .env.local.example .env.local
```

Fill in the required values:

| Variable | Description |
|:---|:---|
| `ANTHROPIC_API_KEY` | Default Anthropic API key (users can override in Settings) |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key ([Dashboard](https://dashboard.clerk.com)) |
| `CLERK_SECRET_KEY` | Clerk secret key ([Dashboard](https://dashboard.clerk.com)) |

### 3. Start developing

```bash
npm run dev
```

Open **[http://localhost:3000](http://localhost:3000)** — you'll be redirected to sign in via Clerk.

---

## Scripts

| Command | Description |
|:---|:---|
| `npm run dev` | Start dev server with Turbopack |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run lint` | Run ESLint |
| `npm run test:e2e` | Run Playwright E2E tests |

**Run a single test:**

```bash
npx playwright test e2e/landing.spec.ts
```

**E2E-specific env vars:**

| Variable | Description |
|:---|:---|
| `TEST_EMAIL` | Clerk test user email for authenticated tests |
| `ANTHROPIC_API_KEY_FUNDED` | Set to `1` to enable tests that make real API calls |

---

## Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout (Clerk, Sidebar, providers)
│   ├── page.tsx                  # Landing page (module cards)
│   ├── domain/                   # Domain Knowledge module
│   ├── framework/                # Mental Framework module
│   ├── simulation/               # Scenario Simulation module
│   ├── settings/                 # API key management + prompt editor
│   ├── sign-in/                  # Clerk sign-in (catch-all)
│   ├── sign-up/                  # Clerk sign-up (catch-all)
│   └── api/
│       ├── chat/                 # POST — streaming chat
│       ├── generate-theory/      # POST — structured theory generation
│       └── settings/api-key/     # GET / POST / DELETE — API key CRUD
├── components/
│   ├── ai-elements/              # Chat UI primitives (conversation, message, prompt-input)
│   ├── ui/                       # shadcn/ui components
│   ├── chat-interface.tsx        # Core chat (useChat, localStorage, archives)
│   ├── module-layout.tsx         # Shared Theory / Chat tabs layout
│   ├── domain-theory.tsx         # Domain theory + custom generation
│   ├── prompt-editor.tsx         # System prompt editor (Settings)
│   └── context-panel.tsx         # Per-chat user context editor
├── lib/
│   ├── prompts.ts                # Default system prompts per module
│   ├── prompt-store.ts           # localStorage CRUD for prompts / context
│   ├── chat-archive.ts           # Chat archive management
│   ├── types.ts                  # Zod schemas for API validation
│   ├── api-key.ts                # API key resolution (Clerk metadata → env fallback)
│   └── modules.ts                # Module definitions
├── hooks/
│   └── use-mobile.ts             # Responsive breakpoint hook
└── middleware.ts                  # Clerk auth (protects all routes)

e2e/                              # Playwright E2E tests
```

---

## Architecture

### Data Persistence

Traza Training has **no database**. All data is stored in two places:

| Store | What | Scope |
|:---|:---|:---|
| Clerk `privateMetadata` | Per-user Anthropic API keys | Server-side, per user |
| Browser `localStorage` | Chat history, archives, system prompts, user context, custom domain data | Client-side, prefixed `traza-` |

### Authentication Flow

```
Request → Clerk Middleware → auth.protect()
                              ├── /sign-in, /sign-up  → public (pass through)
                              └── everything else      → redirect to /sign-in if unauthenticated
```

API routes extract the authenticated `userId` for per-user operations (API key storage, rate limiting).

### AI Integration

| Endpoint | SDK Method | Purpose |
|:---|:---|:---|
| `POST /api/chat` | `streamText` | Streaming chat — client sends full system prompt (defaults + user overrides) with each request |
| `POST /api/generate-theory` | `generateText` + `Output.object` | Structured domain content generation with Zod schema validation. Rate-limited: 3 req/min/user |
| `GET\|POST\|DELETE /api/settings/api-key` | Clerk SDK | CRUD for per-user API keys stored in Clerk metadata |

### Module Architecture

All three modules share the same component structure:

```
/app/{module}/page.tsx          (Server Component)
  └── ModuleLayout              (Client — tabs)
       ├── Theory Tab           → {Module}Theory component
       └── Training Chat Tab    → ChatInterface (useChat + localStorage persistence)
```

The `ChatInterface` is keyed by chat type (`"domain"` | `"framework"` | `"simulation"`), which flows through to localStorage keys and API requests.

---

## Deployment

Standard Next.js deployment. Configure all environment variables on your platform.

| Platform | Notes |
|:---|:---|
| [**Vercel**](https://vercel.com) | Recommended — zero-config deployment |
| [**Netlify**](https://netlify.com) | Supported via `@netlify/plugin-nextjs` |
| [**Docker**](https://nextjs.org/docs/app/building-your-application/deploying#docker-image) | Use the official Next.js Dockerfile |
| **Self-hosted** | `npm run build && npm run start` |

---

## License

Private — All rights reserved.
