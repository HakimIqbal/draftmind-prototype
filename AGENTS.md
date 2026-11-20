# AGENTS.md - DraftMind interactive prototype

Stateful, keyboard-accessible product prototype of DraftMind (AI PRD SaaS):
dashboard -> 3-step wizard -> editor (sections, mock AI streaming, version
history) -> simulated export. Static-exported Next.js 15 for Cloudflare Pages.
All data is local (localStorage). No backend, no network calls, no API keys.

## Commands

```bash
npm install          # install deps (Node 22 / npm 10)
npm run dev          # dev server on :3000
npm run build        # next build -> static export in out/
npm run typecheck    # tsc --noEmit
npx serve out        # serve the production export locally
```

## Conventions

- App Router, all interactive surfaces are 'use client' leaves.
- Routes: `/` dashboard, `/new` wizard, `/editor?id=<docId>` editor.
  Query param instead of dynamic segment so `output: 'export'` works.
- State: `lib/store.ts` (localStorage key `draftmind.docs.v1`, seeded demo docs).
- Mock AI: `lib/mock-ai.ts`, deterministic templates, typewriter effect.
  Always labeled "Demo generation - no API call".
- Styling: Tailwind v4 tokens in `app/globals.css` (@theme). Paper #F7F5F0,
  ink #191817, single accent #C2410C, single radius `rounded-box`.
- Fonts: Geist + Geist Mono via `geist` package (next/font/local, self-hosted).
- Icons: @phosphor-icons/react only, weight="regular", size 16 (20 in empty states).
- Motion: `motion/react`, transform/opacity only, `useReducedMotion` honored.
- `data-testid` hooks on every key control (see README click-path).
- Visible text: regular hyphens only, never em/en dashes. No emoji in UI.

## Boundaries

- Never add network calls, analytics, or remote fonts. Must work offline.
- Never generate real PDF/DOCX binaries; export is an honest simulation.
- Never use h-screen (use min-h-[100dvh]); no window scroll listeners.
- Keep light theme locked; one accent color; one corner radius.
- Do not deploy from here; CI (.github/workflows/ci.yml) handles Pages.

## Dependencies

next 15, react 19, motion, @phosphor-icons/react, geist, tailwindcss 4
(@tailwindcss/postcss), typescript 5.

## Config

`next.config.ts`: output 'export', images unoptimized. `public/_headers`
(security headers) is copied into out/ by the export. CI template lives at
~/.hermes/infra/templates/ci-nextjs-pages.yml.

## Error handling

Store load failures surface a resettable error panel on the dashboard.
Wizard shows inline validation errors. Editor shows a not-found empty state.
Export modal has an optional simulated-failure path with retry.

## Troubleshooting

- Build fails on useSearchParams: keep the <Suspense> wrapper in app/editor.
- Hydration mismatch: pages render a skeleton until mounted; keep that gate.
- Stale demo data: use "Reset demo data" on the dashboard or clear the
  `draftmind.docs.v1` localStorage key.