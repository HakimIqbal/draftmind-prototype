# CLAUDE.md - DraftMind interactive prototype

Read AGENTS.md first; this file is the short working brief.

## What this is

A clickable, stateful prototype of the DraftMind PRD product (not a marketing
page): dashboard with live search, 3-step creation wizard with validation,
editor with reorderable sections + mock AI streaming + version restore, and a
simulated PDF/DOCX export modal. Static Next.js 15 export for Cloudflare Pages.

## Exact commands

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # must produce out/ (output: 'export')
npm run typecheck
```

## Rules that matter

1. Everything offline: React state + localStorage (`lib/store.ts`). No fetch.
2. Honest simulation: AI panel says "Demo generation - no API call"; export
   says no file is produced. Never fake real metrics or real files.
3. Accessibility: full keyboard flow, modal focus trap + Escape, aria-live on
   AI output and toast, aria-labels on icon buttons, focus-visible everywhere.
4. `data-testid` ids are a contract (README lists the exact click-path). Do not
   rename: new-prd-button, wizard-step-1..3, wizard-next/back/submit,
   doc-title-input, add-section-button, ai-assist-button, ai-output,
   version-history-button, version-restore-button, export-button, export-modal,
   export-confirm, export-success, search-input, doc-list, doc-list-item,
   empty-state, toast.
5. Design: paper/ink/burnt-orange only, rounded-box only, Geist fonts,
   phosphor icons, motion/react with useReducedMotion, transform/opacity only.
6. No em/en dashes in visible text. No emoji. No Inter. No Google Fonts link.
7. Layouts collapse at 375px; min-h-[100dvh], never h-screen.
8. Empty, loading, and error states exist on every surface. Keep them.

## File map

- app/: layout (fonts, header, demo notice), page (dashboard), new (wizard),
  editor (Suspense + query param).
- components/: dashboard, wizard, editor, ai-panel, version-panel,
  export-modal, section-card, modal (focus trap), toast, states.
- lib/: types, store (seed + persistence), mock-ai, ui (class strings),
  use-toast.

## Verify before finishing

`npm run build` passes, `out/index.html` exists, `grep -c $'\u2014' out/*.html`
is zero, typecheck clean. Do not deploy; parent agent handles deployment.