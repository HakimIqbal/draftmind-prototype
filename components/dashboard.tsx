"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  ArrowRight,
  MagnifyingGlass,
  Plus,
  Trash,
} from "@phosphor-icons/react";
import {
  deleteDoc,
  loadDocs,
  resetDocs,
} from "@/lib/store";
import {
  PrdDoc,
  STATUS_LABELS,
  formatDate,
} from "@/lib/types";
import {
  btnDanger,
  btnPrimary,
  btnSecondary,
  cardBase,
  chipBase,
  inputBase,
  metaText,
} from "@/lib/ui";
import { EmptyState, ErrorState, LoadingState } from "@/components/states";
import { ToastRegion } from "@/components/toast";
import { useToast } from "@/lib/use-toast";

type Phase = "loading" | "ready" | "error";

export function Dashboard() {
  const [phase, setPhase] = useState<Phase>("loading");
  const [docs, setDocs] = useState<PrdDoc[]>([]);
  const [query, setQuery] = useState("");
  const [storageError, setStorageError] = useState("");
  const { toasts, push, dismiss } = useToast();
  const reduce = useReducedMotion();

  useEffect(() => {
    const res = loadDocs();
    if (res.ok) {
      setDocs(res.docs);
      setPhase("ready");
    } else {
      setStorageError(res.error);
      setPhase("error");
    }
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return docs;
    return docs.filter(
      (d) =>
        d.title.toLowerCase().includes(q) ||
        d.product.toLowerCase().includes(q) ||
        d.summary.toLowerCase().includes(q)
    );
  }, [docs, query]);

  function handleDelete(id: string) {
    const doc = docs.find((d) => d.id === id);
    if (deleteDoc(id)) {
      setDocs((prev) => prev.filter((d) => d.id !== id));
      push(`Deleted "${doc?.title ?? "document"}"`);
    } else {
      push("Could not delete: local storage unavailable");
    }
  }

  function handleReset() {
    setDocs(resetDocs());
    setPhase("ready");
    setQuery("");
    push("Demo data restored");
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-xl">
          <p className={metaText}>Workspace / Documents</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            Product requirement documents
          </h1>
          <p className="mt-2 text-sm text-ink-soft">
            Draft, structure, and export PRDs. Seeded documents below are demo
            data; everything you create stays in this browser.
          </p>
        </div>
        <Link
          href="/new"
          data-testid="new-prd-button"
          className={btnPrimary + " shrink-0"}
        >
          <Plus size={16} weight="regular" aria-hidden />
          New PRD
        </Link>
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-md">
          <MagnifyingGlass
            size={16}
            weight="regular"
            aria-hidden
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft"
          />
          <input
            type="search"
            data-testid="search-input"
            aria-label="Search documents by title, product, or summary"
            placeholder="Search documents"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={phase !== "ready"}
            className={inputBase + " pl-9"}
          />
        </div>
        <p className={metaText} aria-live="polite">
          {phase === "ready"
            ? `${filtered.length} of ${docs.length} documents`
            : "Loading documents"}
        </p>
        {phase === "ready" && (
          <button
            type="button"
            data-testid="reset-demo-button"
            onClick={handleReset}
            className={btnSecondary + " sm:ml-auto"}
          >
            Reset demo data
          </button>
        )}
      </div>

      <div className="mt-6">
        {phase === "loading" && <LoadingState label="Loading documents" />}

        {phase === "error" && (
          <ErrorState
            title="Could not read local data"
            body={`The stored demo data is unreadable (${storageError}). Reset to reseed the demo documents. This only affects this browser.`}
            action={
              <button
                type="button"
                data-testid="error-reset-button"
                onClick={handleReset}
                className={btnPrimary}
              >
                Reset demo data
              </button>
            }
          />
        )}

        {phase === "ready" && docs.length === 0 && (
          <EmptyState
            title="No documents yet"
            body="Create your first PRD with the guided wizard, or restore the seeded demo documents."
            action={
              <div className="flex flex-wrap gap-2">
                <Link href="/new" className={btnPrimary}>
                  <Plus size={16} weight="regular" aria-hidden />
                  New PRD
                </Link>
                <button
                  type="button"
                  onClick={handleReset}
                  className={btnSecondary}
                >
                  Restore demo data
                </button>
              </div>
            }
          />
        )}

        {phase === "ready" && docs.length > 0 && filtered.length === 0 && (
          <EmptyState
            title="No matches"
            body={`Nothing matches "${query.trim()}". Try a different title or product name.`}
            action={
              <button
                type="button"
                onClick={() => setQuery("")}
                className={btnSecondary}
              >
                Clear search
              </button>
            }
          />
        )}

        {phase === "ready" && filtered.length > 0 && (
          <ul data-testid="doc-list" className="flex flex-col gap-3">
            <AnimatePresence initial={false}>
              {filtered.map((doc) => (
                <motion.li
                  key={doc.id}
                  data-testid="doc-list-item"
                  layout={reduce ? false : "position"}
                  initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className={cardBase + " group"}
                >
                  <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:gap-4 sm:p-5">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={`/editor?id=${doc.id}`}
                          data-testid="doc-open-link"
                          className="truncate rounded-box text-base font-semibold hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                        >
                          {doc.title}
                        </Link>
                        <span className={chipBase + " text-ink-soft"}>
                          {STATUS_LABELS[doc.status]}
                        </span>
                      </div>
                      <p className="mt-1 truncate text-sm text-ink-soft">
                        {doc.summary}
                      </p>
                      <p className={metaText + " mt-2"}>
                        {doc.product} · {doc.sections.length} sections ·{" "}
                        {doc.versions.length} versions · updated{" "}
                        {formatDate(doc.updatedAt)}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <Link
                        href={`/editor?id=${doc.id}`}
                        className={btnSecondary}
                        aria-label={`Open ${doc.title} in editor`}
                      >
                        Open
                        <ArrowRight size={16} weight="regular" aria-hidden />
                      </Link>
                      <button
                        type="button"
                        data-testid="doc-delete-button"
                        aria-label={`Delete ${doc.title}`}
                        onClick={() => handleDelete(doc.id)}
                        className={btnDanger + " px-2.5"}
                      >
                        <Trash size={16} weight="regular" aria-hidden />
                      </button>
                    </div>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </div>

      <ToastRegion toasts={toasts} dismiss={dismiss} />
    </div>
  );
}