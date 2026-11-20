import { PrdDoc, Section, uid } from "./types";

export const STORAGE_KEY = "draftmind.docs.v1";

function seedSections(): {
  problem: Section;
  goals: Section;
  requirements: Section;
  metrics: Section;
} {
  return {
    problem: {
      id: uid(),
      kind: "problem",
      title: "Problem",
      body: "Product teams spend 6+ hours per PRD rewriting the same context across tools. Requirements drift between the doc, the backlog, and the shipped feature, and nobody can say which version is current.",
    },
    goals: {
      id: uid(),
      kind: "goals",
      title: "Goals",
      body: "1. Cut first-draft PRD time from hours to under 15 minutes.\n2. Keep one source of truth with version history.\n3. Make export to PDF and DOCX a one-click handoff.",
    },
    requirements: {
      id: uid(),
      kind: "requirements",
      title: "Requirements",
      body: "R1. Structured editor with Problem, Goals, Requirements, Metrics blocks.\nR2. AI assist drafts sections from a short product brief.\nR3. Snapshot and restore any previous version.\nR4. Export the current version as PDF or DOCX.",
    },
    metrics: {
      id: uid(),
      kind: "metrics",
      title: "Metrics",
      body: "M1. Median time to first complete draft.\nM2. Share of drafts that reach Ready status.\nM3. Exports per active document per week.\nTargets are placeholders in this demo, not measured values.",
    },
  };
}

export function seedDocs(): PrdDoc[] {
  const now = Date.now();
  const day = 86_400_000;
  const s1 = seedSections();
  const s2 = seedSections();
  s2.problem.body =
    "Support agents answer the same billing questions 40+ times a week. Answers live in scattered Notion pages, so response quality depends on who picks up the ticket.";
  s2.goals.body =
    "1. Centralize billing answers in one searchable knowledge base.\n2. Suggest a drafted reply inside the ticket view.\n3. Track which answers agents actually reuse.";
  const s3 = seedSections();
  s3.problem.body =
    "Field technicians fill inspection reports on paper, then retype them at the office. Transcription errors delay invoicing by days and photos get lost between devices.";
  s3.requirements.body =
    "R1. Offline-first mobile form with photo capture.\nR2. Sync queue that survives flaky connections.\nR3. One-tap PDF report per inspection.\nR4. Supervisor review queue before invoicing.";

  const docA: PrdDoc = {
    id: "demo-doc-draftmind",
    title: "DraftMind Core Editor PRD",
    product: "DraftMind",
    audience: "Product managers at 10-200 person SaaS teams",
    summary:
      "AI-assisted PRD editor with version history and one-click export.",
    status: "in-review",
    createdAt: now - 6 * day,
    updatedAt: now - 1 * day,
    sections: [s1.problem, s1.goals, s1.requirements, s1.metrics],
    versions: [],
  };
  docA.versions = [
    {
      id: uid(),
      label: "v1 - initial outline",
      createdAt: now - 6 * day,
      title: docA.title,
      sections: [
        { ...s1.problem, id: uid(), body: "PRDs are slow to write and drift from the backlog." },
        { ...s1.goals, id: uid(), body: "1. Faster first drafts.\n2. One source of truth." },
      ],
    },
    {
      id: uid(),
      label: "v2 - requirements pass",
      createdAt: now - 3 * day,
      title: docA.title,
      sections: [
        { ...s1.problem, id: uid() },
        { ...s1.goals, id: uid() },
        { ...s1.requirements, id: uid() },
      ],
    },
  ];

  const docB: PrdDoc = {
    id: "demo-doc-helpdesk",
    title: "Billing Answers Knowledge Base",
    product: "Helpdesk Copilot",
    audience: "Support leads at B2B fintech companies",
    summary: "Searchable billing answers with drafted replies in the ticket view.",
    status: "draft",
    createdAt: now - 4 * day,
    updatedAt: now - 2 * day,
    sections: [s2.problem, s2.goals, s2.requirements],
    versions: [
      {
        id: uid(),
        label: "v1 - first pass",
        createdAt: now - 4 * day,
        title: "Billing Answers Knowledge Base",
        sections: [{ ...s2.problem, id: uid() }],
      },
    ],
  };

  const docC: PrdDoc = {
    id: "demo-doc-field",
    title: "Offline Inspection Reports",
    product: "FieldLog",
    audience: "Operations managers at utility contractors",
    summary: "Offline-first inspection forms with photo capture and PDF handoff.",
    status: "ready",
    createdAt: now - 12 * day,
    updatedAt: now - 5 * day,
    sections: [s3.problem, s3.goals, s3.requirements, s3.metrics],
    versions: [],
  };

  return [docA, docB, docC];
}

export type LoadResult =
  | { ok: true; docs: PrdDoc[]; seeded: boolean }
  | { ok: false; error: string };

export function loadDocs(): LoadResult {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === null) {
      const docs = seedDocs();
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
      return { ok: true, docs, seeded: true };
    }
    const parsed = JSON.parse(raw) as PrdDoc[];
    if (!Array.isArray(parsed)) throw new Error("stored value is not a list");
    for (const d of parsed) {
      if (typeof d.id !== "string" || !Array.isArray(d.sections)) {
        throw new Error("stored document shape is invalid");
      }
    }
    return { ok: true, docs: parsed, seeded: false };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "unknown storage error",
    };
  }
}

export function saveDocs(docs: PrdDoc[]): boolean {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
    return true;
  } catch {
    return false;
  }
}

export function resetDocs(): PrdDoc[] {
  const docs = seedDocs();
  saveDocs(docs);
  return docs;
}

export function getDoc(id: string): PrdDoc | undefined {
  const res = loadDocs();
  if (!res.ok) return undefined;
  return res.docs.find((d) => d.id === id);
}

export function upsertDoc(doc: PrdDoc): boolean {
  const res = loadDocs();
  const docs = res.ok ? res.docs : [];
  const idx = docs.findIndex((d) => d.id === doc.id);
  if (idx >= 0) docs[idx] = doc;
  else docs.unshift(doc);
  return saveDocs(docs);
}

export function deleteDoc(id: string): boolean {
  const res = loadDocs();
  if (!res.ok) return false;
  return saveDocs(res.docs.filter((d) => d.id !== id));
}