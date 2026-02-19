# Mobile UX Fix — Final Consolidated Plan (Senior Review v2)

## Review Verdict

The original plan (junior + first senior pass) is **~80% correct** but contains structural risks that would cause a rollback in production. This version fixes those issues and reorders implementation to fail fast on the highest-risk change.

---

## Critical Issues Found in the Reviewed Plan

### 🔴 Issue A: `overflow-auto` on `SidebarInset` is the wrong scroll strategy

The plan moves `overflow-auto` to `SidebarInset`. This is **dangerous** for two reasons:

1. **`SidebarInset` is a layout shell, not a scroll container.** Making it scrollable means the `MobileHeader` (which is a child of `SidebarInset`) will scroll away with the content. You lose your fixed hamburger menu the moment the user scrolls. This defeats the entire purpose of adding mobile nav.

2. **Chat's `use-stick-to-bottom` will break.** The library binds to the nearest scrollable ancestor (or a ref). If `SidebarInset` becomes scrollable, the library either picks up the wrong container or competes with the inner chat scroll — causing jank, double scrollbars, or auto-scroll failure.

**Correct approach:** `SidebarInset` must be `overflow-hidden` (not `overflow-auto`). Each page/module manages its own scroll internally. The `MobileHeader` stays pinned because it's a flex sibling above the scrollable content area, inside a non-scrolling flex column.

```
SidebarInset (flex col, overflow-hidden, h-full)
  ├── MobileHeader (shrink-0, fixed height) ← always visible
  └── div.flex-1.min-h-0.overflow-hidden    ← children scroll internally
        └── {children}
```

This is the standard Next.js shell layout pattern. The original plan got this backwards.

### 🔴 Issue B: `<main>` → `<div>` swap is correct but the plan buries it as a "maybe"

The double `<main>` issue isn't optional — it's an HTML spec violation and an a11y audit failure. The plan says "verify first" but doesn't commit. **Commit now:** if `SidebarInset` renders `<main>` (it does in shadcn/ui ≥ 0.8), the inner wrapper MUST be a `<div>`. No ambiguity.

### 🟡 Issue C: `setOpenMobile(false)` on every Link is fragile

Manually wiring `onClick={() => setOpenMobile(false)}` on every `<Link>` in the sidebar is:
- Easy to forget when adding new links
- Duplicated logic across N links
- Broken if someone uses `<a>` or a wrapper component

**Better pattern:** Listen to `pathname` changes via `usePathname()` and close the sidebar reactively. One hook, zero per-link wiring.

### 🟡 Issue D: Touch target size spec is incomplete

The plan says `h-10 w-10` (40px). Apple HIG requires 44px minimum. That's `h-11 w-11` in Tailwind (44px). The plan's own test matrix says "≥ 44×44px" but the code uses 40px. Contradiction.

### 🟡 Issue E: `min-h-full` on `page.tsx` depends on parent having explicit height

`min-h-full` resolves to `min-height: 100%`. This only works if the parent has a **defined height** (not just `flex-1`). If the parent is `flex-1 min-h-0` without an explicit height, `min-h-full` computes to `min-height: 0` in some browsers. The safer approach is `min-h-0 flex-1` on the wrapper + `flex-1` on the page content with `justify-center`.

### ℹ️ Issue F: No rollback checkpoint defined

This plan touches `layout.tsx` — the root layout that affects every single page. There's no mention of git strategy. If step 1 breaks chat, you need to revert instantly, not debug forward.

---

## Final Implementation Plan

### Principles

1. **Fail fast on the riskiest change** — layout.tsx scroll fix goes first, tested immediately
2. **No scroll containers on layout shells** — pages own their scroll
3. **CSS-only responsive visibility** — no `useIsMobile()`, no hydration mismatches
4. **Reactive sidebar close** — pathname-based, not per-link onClick
5. **Git checkpoint after each step** — revertible atomic commits

---

### Pre-Flight Checks (10 min, read-only)

Before writing ANY code, open these files and answer these questions:

| File | Question | Why it matters |
|------|----------|----------------|
| `src/components/ui/sidebar.tsx` | What HTML tag does `SidebarInset` render? | Determines if we need `<div>` swap |
| `src/components/ui/sidebar.tsx` | Does `SidebarInset` already have `flex flex-col`? | Determines if we need to add it |
| `src/components/ui/sidebar.tsx` | How does mobile Sheet close? Is `onOpenChange` wired? | Determines Step 3 approach |
| `src/components/app-sidebar.tsx` | Are nav items `<Link>` or custom components? | Determines sidebar-close wiring |
| Chat component (find it) | What element does `use-stick-to-bottom` attach to? Ref or auto-detect? | Determines if layout change breaks chat |
| `src/app/layout.tsx` | What's the current `<meta name="viewport">` content? Does it include `viewport-fit=cover`? | Determines if safe-area insets matter |

**Record answers before proceeding. Do not skip this.**

---

### Step 1: Fix the Scroll Trap (HIGH RISK)

> **Git: Create branch `fix/mobile-ux`. Commit after this step with message `fix: remove overflow trap from root layout`.**

**File: `src/app/layout.tsx`**

Current (broken):
```tsx
<SidebarProvider className="h-full !min-h-0 overflow-hidden">
  <AppSidebar />
  <SidebarInset className="min-h-0 overflow-hidden">
    <main className="flex-1 h-full overflow-hidden">
      <ChatMigrationProvider>
        {children}
      </ChatMigrationProvider>
    </main>
  </SidebarInset>
</SidebarProvider>
```

Target (fixed):
```tsx
<SidebarProvider className="h-full !min-h-0">
  <AppSidebar />
  <SidebarInset className="h-full min-h-0 flex flex-col overflow-hidden">
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
      <ChatMigrationProvider>
        {children}
      </ChatMigrationProvider>
    </div>
  </SidebarInset>
</SidebarProvider>
```

Changes explained:
| What | Why |
|------|-----|
| `overflow-hidden` removed from `SidebarProvider` | It was trapping scroll at the outermost layer unnecessarily |
| `SidebarInset`: `overflow-hidden` KEPT (not `overflow-auto`) | SidebarInset is a layout shell; it must not scroll. The MobileHeader (added in Step 2) must stay pinned. |
| `SidebarInset`: `h-full flex flex-col` added | Explicit height chain so children can use `flex-1` reliably |
| `<main>` → `<div>` | `SidebarInset` already renders `<main>`. Nested `<main>` is invalid HTML. **(Confirm in pre-flight. If `SidebarInset` does NOT render `<main>`, keep `<main>` here.)** |
| Inner div: `overflow-hidden` kept | Each page/module handles its own internal scroll. This prevents content from leaking out of the flex layout. |

**What this does NOT do:** It does not add `overflow-auto` to any layout-level element. Pages that need to scroll (landing page, theory tabs) will scroll via their own internal containers. Chat already has its own scroll container via `use-stick-to-bottom`.

**File: `src/app/page.tsx`**

```diff
- <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-12">
+ <div className="flex flex-col items-center justify-center h-full overflow-auto px-4 py-8 md:py-12">
```

Changes:
- `h-full overflow-auto` — this page IS its own scroll container now
- Removed `min-h-[calc(100vh-4rem)]` viewport hack
- Responsive vertical padding: tighter on mobile

#### 🧪 STOP AND TEST (P0 — must pass before proceeding)

| # | Test | Expected |
|---|------|----------|
| 1 | Open chat, send messages | Auto-scroll to bottom works. Input stays visible. |
| 2 | Scroll up in chat | "Scroll to bottom" button appears and works |
| 3 | Open landing page on desktop (1440×900) | Cards visible, centered, no unnecessary scrollbar |
| 4 | Open landing page on mobile (375×667 in DevTools) | Cards stack, page scrolls vertically |
| 5 | Open any module with tabs | Tab content scrolls independently, no double scrollbar |

**If test 1 or 2 fails:** The `use-stick-to-bottom` scroll container ref has changed. Find the chat component and update the ref target. Do NOT proceed to Step 2 until chat works.

**If test 4 fails (page doesn't scroll):** The landing page needs `overflow-auto` on its own root container (the `page.tsx` wrapper). This is expected — that's why we added it above.

> **Git: Commit.**

---

### Step 2: Add Mobile Navigation

> **Git: Commit after this step with message `feat: add mobile header with hamburger nav`.**

**File: `src/components/mobile-header.tsx` (NEW)**

```tsx
"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";

export function MobileHeader() {
  return (
    <header
      className="flex items-center h-12 px-3 border-b border-border shrink-0 md:hidden"
    >
      <SidebarTrigger className="h-11 w-11 flex items-center justify-center -ml-1" />
      <span className="ml-1 text-sm font-semibold truncate">
        Traza Training
      </span>
    </header>
  );
}
```

Design decisions:
| Decision | Rationale |
|----------|-----------|
| CSS-only `md:hidden` | No `useIsMobile()` hook → no hydration mismatch. Component always mounts, CSS handles visibility. |
| `shrink-0` | Prevents flex collapse — header always takes its 48px |
| `h-11 w-11` (44px) on `SidebarTrigger` | Meets Apple HIG 44×44px minimum touch target. `-ml-1` compensates visual alignment. |
| `truncate` on title | Prevents text overflow on 320px screens |
| `<header>` tag | Correct semantics: `SidebarInset` is `<main>`, this is `<header>` inside it |
| No safe-area padding by default | Only needed if `<meta viewport>` has `viewport-fit=cover`. Add `pt-[env(safe-area-inset-top)]` later if confirmed. |

**File: `src/app/layout.tsx` — integrate MobileHeader**

```tsx
import { MobileHeader } from "@/components/mobile-header";

// Inside SidebarInset — MobileHeader is ABOVE the content div:
<SidebarInset className="h-full min-h-0 flex flex-col overflow-hidden">
  <MobileHeader />
  <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
    <ChatMigrationProvider>
      {children}
    </ChatMigrationProvider>
  </div>
</SidebarInset>
```

**Why MobileHeader is inside `SidebarInset` and above the content div:**
- `SidebarInset` is `overflow-hidden` + `flex flex-col` → MobileHeader is pinned at top, never scrolls away
- Content div takes remaining space via `flex-1`
- On desktop, `md:hidden` hides the header → zero layout impact, the div takes full height

#### 🧪 TEST

| # | Test | Expected |
|---|------|----------|
| 6 | Mobile (375×667) | Hamburger icon visible top-left |
| 7 | Tap hamburger | Sidebar Sheet slides in from left |
| 8 | Desktop (1440×900) | No mobile header visible anywhere |
| 9 | Resize desktop → mobile | Header appears. Resize back → header disappears. No flash. |

> **Git: Commit.**

---

### Step 3: Sidebar Auto-Close on Navigation (Mobile)

> **Git: Commit after this step with message `fix: auto-close mobile sidebar on navigation`.**

**Do NOT wire `onClick` on every Link.** Instead, use a pathname watcher:

**File: `src/components/sidebar-close-on-nav.tsx` (NEW)**

```tsx
"use client";

import { usePathname } from "next/navigation";
import { useSidebar } from "@/components/ui/sidebar";
import { useEffect, useRef } from "react";

/**
 * Closes the mobile sidebar sheet whenever the route changes.
 * Mount once inside SidebarProvider. Zero per-link wiring needed.
 */
export function SidebarCloseOnNav() {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();
  const prevPathname = useRef(pathname);

  useEffect(() => {
    if (prevPathname.current !== pathname) {
      setOpenMobile(false);
      prevPathname.current = pathname;
    }
  }, [pathname, setOpenMobile]);

  return null;
}
```

**File: `src/app/layout.tsx` — integrate**

```tsx
import { SidebarCloseOnNav } from "@/components/sidebar-close-on-nav";

<SidebarProvider className="h-full !min-h-0">
  <AppSidebar />
  <SidebarCloseOnNav />
  <SidebarInset className="h-full min-h-0 flex flex-col overflow-hidden">
    {/* ... */}
  </SidebarInset>
</SidebarProvider>
```

**Why this is better than per-link `onClick`:**
- Works for ALL navigation, including programmatic `router.push()`, future links, and nested components
- Zero maintenance — add new links freely without remembering to wire close behavior
- Single source of truth — easy to find, easy to remove
- `useRef` prevents closing on initial mount (only fires on actual path changes)

#### 🧪 TEST

| # | Test | Expected |
|---|------|----------|
| 10 | Mobile: open sidebar, tap a module link | Navigates AND sidebar closes |
| 11 | Mobile: open sidebar, tap current page link | Sidebar stays (same pathname, no change detected) — acceptable |
| 12 | Desktop: navigate between modules | No side effects, sidebar remains visible/collapsed as expected |

> **Git: Commit.**

---

### Step 4: Mobile Polish (LOW RISK)

> **Git: Commit with message `style: responsive padding and typography for mobile`.**

**File: `src/components/module-layout.tsx`**

```diff
- <div className="p-6 pb-0 flex-shrink-0">
-   <h1 className="text-2xl font-bold text-foreground">{title}</h1>
-   <p className="text-sm text-muted-foreground mt-1">{description}</p>
+ <div className="p-3 sm:p-4 md:p-6 pb-0 flex-shrink-0">
+   <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground">{title}</h1>
+   <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 md:mt-1">{description}</p>
  </div>
```

Rationale: On iPhone SE (375×667), with MobileHeader (48px) + module title + tab bar, usable content area is ~450px. Three breakpoints (`p-3` / `p-4` / `p-6`) ensure readability at all sizes without wasting space.

> **Git: Commit.**

---

### Step 5: Viewport Height Audit (MEDIUM RISK)

> **Git: Commit with message `fix: replace 100vh with 100dvh for iOS Safari compatibility`.**

```bash
grep -rn "100vh\|h-screen" src/ --include="*.tsx" --include="*.css"
```

For every match:
| Found | Replace with | Why |
|-------|-------------|-----|
| `h-screen` in a scroll container | `h-dvh` (or custom `h-[100dvh]`) | iOS Safari `100vh` doesn't account for browser chrome. `100dvh` does. |
| `h-screen` on `<body>` or root | Keep as-is if using `h-screen-safe` | The safe utility already handles this |
| `min-h-screen` on a page wrapper | `min-h-dvh` or `min-h-[100dvh]` | Same iOS Safari issue |
| `100vh` in inline styles | `100dvh` | Same |

If on Tailwind v3 without `h-dvh`:

**File: `src/app/globals.css`** (add once)
```css
@layer utilities {
  .h-dvh {
    height: 100dvh;
  }
  .min-h-dvh {
    min-height: 100dvh;
  }
}
```

#### 🧪 TEST

| # | Test | Expected |
|---|------|----------|
| 13 | iOS Safari: open chat, tap input to open keyboard | Input stays visible, no layout jump, content doesn't hide behind keyboard |
| 14 | iOS Safari: dismiss keyboard | Layout returns to full height smoothly |

> **Git: Commit.**

---

## Full Test Matrix

| # | Scenario | Viewport | Expected | Priority |
|---|----------|----------|----------|----------|
| 1 | Chat auto-scroll | 375×667 | New messages scroll into view, input visible | **P0** |
| 2 | Chat with keyboard open | 375×667 iOS Safari | Input visible when keyboard opens | **P0** |
| 3 | Landing page scrolls | 375×667 | Cards stack, page scrolls | **P0** |
| 4 | Landing page centered | 1440×900 | Grid layout, centered, no broken scroll | **P0** |
| 5 | Hamburger opens sidebar | 375×667 | Sheet slides in from left | **P0** |
| 6 | Navigate via sidebar closes it | 375×667 | Tap module → navigates, sidebar closes | **P0** |
| 7 | Desktop unaffected | 1440×900 | Sidebar visible, no mobile header, everything works as before | **P0** |
| 8 | Theory tab scroll | 375×667 | Content scrolls, no double scrollbar | **P1** |
| 9 | Training tab chat | 375×667 | Chat scrolls, input pinned at bottom | **P1** |
| 10 | Scroll-to-bottom button | 375×667 | Appears on scroll up, works on tap | **P1** |
| 11 | MobileHeader hidden on desktop | 1440×900 | Not visible, no layout shift | **P1** |
| 12 | Resize responsiveness | Drag browser | Header appears/disappears, no flash or hydration error | **P1** |
| 13 | Touch targets | 375×667 | Hamburger ≥ 44×44px | **P2** |
| 14 | Notched device safe areas | iPhone 14 Pro (if PWA) | Content not behind notch | **P2** |

**P0 = blocks merge. P1 = should pass. P2 = conditional on PWA/standalone mode.**

---

## Risk Matrix

| File | Change | Risk | Rollback |
|------|--------|------|----------|
| `layout.tsx` | Overflow fix, MobileHeader integration, `<main>` → `<div>`, SidebarCloseOnNav | **HIGH** | Revert to previous commit |
| `page.tsx` | `h-full overflow-auto`, responsive padding | **LOW** | Independent of other changes |
| `mobile-header.tsx` | New file | **LOW** | Delete file + remove import |
| `sidebar-close-on-nav.tsx` | New file | **LOW** | Delete file + remove import |
| `module-layout.tsx` | Responsive padding/typography | **LOW** | Revert single file |
| `globals.css` | `h-dvh` utility (if needed) | **LOW** | Remove utility |
| `sidebar.tsx` | Read-only verification | **NONE** | — |

---

## Key Differences from Original Plan

| Topic | Original Plan | This Plan | Why |
|-------|--------------|-----------|-----|
| `SidebarInset` overflow | `overflow-auto` | `overflow-hidden` | Prevents MobileHeader from scrolling away; prevents `use-stick-to-bottom` breakage |
| Page scroll strategy | SidebarInset scrolls | Each page scrolls internally | Standard layout shell pattern; isolates scroll contexts |
| Sidebar close mechanism | `onClick` on every `<Link>` | `usePathname()` watcher component | Zero maintenance, works for all navigation |
| Touch target size | `h-10 w-10` (40px) | `h-11 w-11` (44px) | Meets Apple HIG spec. Original contradicted its own test matrix. |
| `min-h-full` on page.tsx | `min-h-full` | `h-full overflow-auto` | `min-h-full` unreliable without explicit parent height; `h-full` + `overflow-auto` makes the page its own scroll container |
| `<main>` → `<div>` | "Verify first" (tentative) | Committed change (with pre-flight confirmation) | Double `<main>` is an HTML violation; don't leave it ambiguous |
| Responsive padding | `p-4` on mobile | `p-3 sm:p-4 md:p-6` | Three breakpoints for iPhone SE (375px), mid-range, desktop |
| Git strategy | Not mentioned | Atomic commits per step with test gates | Enables instant rollback of highest-risk change |