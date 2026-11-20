export type SectionKind = "problem" | "goals" | "requirements" | "metrics";

export interface Section {
  id: string;
  kind: SectionKind;
  title: string;
  body: string;
}

export interface DocVersion {
  id: string;
  label: string;
  createdAt: number;
  title: string;
  sections: Section[];
}

export type DocStatus = "draft" | "in-review" | "ready";

export interface PrdDoc {
  id: string;
  title: string;
  product: string;
  audience: string;
  summary: string;
  status: DocStatus;
  createdAt: number;
  updatedAt: number;
  sections: Section[];
  versions: DocVersion[];
}

export const SECTION_KINDS: SectionKind[] = [
  "problem",
  "goals",
  "requirements",
  "metrics",
];

export const SECTION_LABELS: Record<SectionKind, string> = {
  problem: "Problem",
  goals: "Goals",
  requirements: "Requirements",
  metrics: "Metrics",
};

export const STATUS_LABELS: Record<DocStatus, string> = {
  draft: "Draft",
  "in-review": "In review",
  ready: "Ready",
};

export function uid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}