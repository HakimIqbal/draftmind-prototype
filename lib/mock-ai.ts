import { SectionKind } from "./types";

/**
 * Deterministic local mock of AI section generation.
 * No network, no API keys. Output is templated from the product brief
 * so the same input always produces the same draft.
 */

interface Brief {
  product: string;
  audience: string;
  summary: string;
}

const TEMPLATES: Record<SectionKind, (b: Brief) => string> = {
  problem: (b) =>
    `Teams working on ${b.product} currently lack a shared, structured way to capture product intent. ${b.summary} Today this context lives in scattered docs and chat threads, so decisions are re-litigated and the shipped feature drifts from what ${b.audience} actually asked for. The cost shows up as slow handoffs, duplicated writing, and requirements nobody can trace back to a decision.`,
  goals: (b) =>
    `1. Give ${b.audience} one place where ${b.product} requirements are written, reviewed, and versioned.\n2. Reduce time from idea to reviewable first draft to under 15 minutes.\n3. Keep every exported document traceable to a saved version.\n4. Make the review loop explicit: draft, in review, ready.`,
  requirements: (b) =>
    `R1. Structured document with Problem, Goals, Requirements, and Metrics sections for ${b.product}.\nR2. AI-assisted drafting from a short brief, with every generated block clearly marked as a draft.\nR3. Version snapshots with one-click restore.\nR4. Export to PDF and DOCX for handoff to ${b.audience}.\nR5. Keyboard-complete editing: every action reachable without a mouse.`,
  metrics: (b) =>
    `M1. Median minutes from new document to first complete draft.\nM2. Percentage of ${b.product} documents that reach Ready status within a week.\nM3. Restores per document (signal that version history is trusted).\nM4. Exports per active document per week.\nNote: targets are intentionally unset in this demo. No measured values are claimed.`,
};

export function generateSectionText(kind: SectionKind, brief: Brief): string {
  const safe: Brief = {
    product: brief.product.trim() || "the product",
    audience: brief.audience.trim() || "the target users",
    summary: brief.summary.trim() || "The core flow needs a single source of truth.",
  };
  return TEMPLATES[kind](safe);
}

export const AI_DISCLAIMER = "Demo generation - no API call";