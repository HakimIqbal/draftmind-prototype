# DraftMind - interactive PRD prototype

A stateful, keyboard-accessible product prototype of DraftMind, an AI-assisted
PRD (Product Requirement Document) SaaS. This is a clickable product demo, not
a marketing page: real form state, real validation, real transitions, all
persisted to localStorage. Static-exported Next.js 15 for Cloudflare Pages.

**Honesty notes:** all documents are demo data. The AI panel is a deterministic
local template with a typewriter effect ("Demo generation - no API call").
The export flow simulates progress and success but produces no binary file.
No backend, no network calls, no API keys. Works fully offline.

## Commands

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # static export -> out/
npm run typecheck
npx serve out      # serve the production export
```

## Stack

Next.js 15 (App Router, `output: 'export'`), React 19, Tailwind CSS v4,
Motion (`motion/react`), Phosphor icons, self-hosted Geist + Geist Mono.
Design: paper `#F7F5F0`, ink `#191817`, one accent `#C2410C`, one radius.

## Demo click-path (for automated browser agents)

All ids below are `data-testid` attributes. The full happy path:

### 1. Dashboard (`/`)

1. Wait for `[data-testid="doc-list"]` (3 seeded demo documents).
2. Type into `search-input` (e.g. `Billing`) - `doc-list` filters live;
   the count text announces "1 of 3 documents".
3. Clear `search-input`. Searching for gibberish shows `empty-state`
   ("No matches"). Deleting all docs shows `empty-state` ("No documents yet").
4. Click `new-prd-button` -> navigates to `/new`.

### 2. Wizard (`/new`)

5. On `wizard-step-1`: clicking `wizard-next` with empty fields shows inline
   errors and keeps you on step 1. Fill:
   - `wizard-product-input` = `DraftMind`
   - `wizard-title-input` = `Collaborative Editing PRD`
   - `wizard-audience-input` = `Product managers at SaaS teams`
6. Click `wizard-next` -> `wizard-step-2` appears. Fill
   `wizard-summary-input` with 20+ characters (short input shows an inline
   error). Section checkboxes: `wizard-kind-problem`, `wizard-kind-goals`,
   `wizard-kind-requirements`, `wizard-kind-metrics` (all checked by default;
   unchecking all shows an error).
7. Click `wizard-next` -> `wizard-step-3` (review) shows the entered values.
   `wizard-back` returns to step 2 with state intact.
8. Click `wizard-submit` -> creates the document in localStorage and routes
   to `/editor?id=<new-id>`.

### 3. Editor (`/editor?id=...`)

9. `doc-title-input` is editable; changes autosave (debounced) to localStorage.
10. `add-section-button` appends a section of the type chosen in
    `add-section-kind`. Each `section-card` has `section-move-up`,
    `section-move-down` (disabled at the ends), `section-remove-button`,
    and an editable `section-body-input`.
11. AI assist: pick a section in `ai-kind-select`, click `ai-assist-button`.
    `ai-output` streams a deterministic draft (aria-live, labeled
    "Demo generation - no API call"). `ai-stop-button` stops early;
    when done, `ai-apply-button` writes the draft into the document and a
    `toast` confirms.
12. Versions: click `version-history-button` to reveal the panel.
    `version-snapshot-button` saves a snapshot. Each snapshot row has a
    `version-restore-button`; restoring saves a "before restore" snapshot
    first, then replaces title + sections, and shows a `toast`.
13. Reload the page: title, sections, and versions persist.

### 4. Export

14. Click `export-button` -> `export-modal` opens (focus trapped, Escape
    closes, focus returns to the button).
15. Pick `export-format-pdf` or `export-format-docx`. Optional:
    check `export-failure-toggle` to demo the error path.
16. Click `export-confirm` -> staged progress bar, then `export-success`
    (or `export-error` with `export-retry` if failure was toggled).
    Close with the Done button or Escape.

### State coverage

- Loading: `loading-state` on dashboard/editor while local data loads.
- Empty: `empty-state` for no docs, no search matches, no sections, no
  snapshots, and unknown document id (`/editor?id=nope`).
- Error: corrupt the `draftmind.docs.v1` localStorage key to see the
  dashboard `error-state` with `error-reset-button`; `export-error` via the
  toggle; save-failure banner if storage writes fail.
- `reset-demo-button` on the dashboard reseeds the three demo documents.

## Keyboard support

Skip link, full tab order, wizard focus moves to each step heading, inline
errors focus the first invalid field, modal focus trap + Escape + focus
restore, visible focus rings on every control, aria-live on AI output,
progress, and toasts. `prefers-reduced-motion` disables movement animations
and renders AI output instantly.

## Layout of the code

- `app/` - routes: `/` dashboard, `/new` wizard, `/editor?id=` editor
  (query param keeps static export simple).
- `components/` - client leaves: dashboard, wizard, editor, ai-panel,
  version-panel, export-modal, section-card, modal, toast, states.
- `lib/` - types, localStorage store + seed data, deterministic mock AI,
  shared class tokens, toast hook.
- `public/_headers` - Cloudflare Pages security headers (copied to `out/`).
- `.github/workflows/ci.yml` - standard CI: typecheck, build, verify `out/`,
  deploy preview to Cloudflare Pages.