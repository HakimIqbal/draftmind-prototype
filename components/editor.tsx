"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ClockCounterClockwise,
  Export,
  Plus,
} from "@phosphor-icons/react";
import { getDoc, upsertDoc } from "@/lib/store";
import {
  DocVersion,
  PrdDoc,
  SECTION_KINDS,
  SECTION_LABELS,
  STATUS_LABELS,
  Section,
  SectionKind,
  formatDate,
  uid,
} from "@/lib/types";
import {
  btnPrimary,
  btnSecondary,
  chipBase,
  inputBase,
  metaText,
} from "@/lib/ui";
import { SectionCard } from "@/components/section-card";
import { AiPanel } from "@/components/ai-panel";
import { VersionPanel } from "@/components/version-panel";
import { ExportModal } from "@/components/export-modal";
import { EmptyState, ErrorState, LoadingState } from "@/components/states";
import { ToastRegion } from "@/components/toast";
import { useToast } from "@/lib/use-toast";

type Phase = "loading" | "ready" | "missing" | "storage-error";

export function Editor() {
  const params = useSearchParams();
  const id = params.get("id") ?? "";
  const [phase, setPhase] = useState<Phase>("loading");
  const [doc, setDoc] = useState<PrdDoc | null>(null);
  const [showVersions, setShowVersions] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [addKind, setAddKind] = useState<SectionKind>("problem");
  const [saveFailed, setSaveFailed] = useState(false);
  const { toasts, push, dismiss } = useToast();
  const saveTimer = useRef<number | null>(null);
  const loadedRef = useRef(false);

  useEffect(() => {
    if (!id) {
      setPhase("missing");
      return;
    }
    const found = getDoc(id);
    if (found) {
      setDoc(found);
      setPhase("ready");
      loadedRef.current = true;
    } else {
      setPhase("missing");
    }
  }, [id]);

  const update = useCallback(
    (mutate: (d: PrdDoc) => PrdDoc) => {
      setDoc((prev) => (prev ? { ...mutate(prev), updatedAt: Date.now() } : prev));
    },
    []
  );

  // Persist on every doc change (debounced). Keeping the side effect out of
  // the state updater avoids StrictMode double-invocation cancelling saves.
  useEffect(() => {
    if (!loadedRef.current || !doc) return;
    if (saveTimer.current !== null) window.clearTimeout(saveTimer.current);
    const snapshotDoc = doc;
    saveTimer.current = window.setTimeout(() => {
      const ok = upsertDoc(snapshotDoc);
      setSaveFailed(!ok);
      if (!ok) push("Save failed: local storage unavailable");
    }, 350);
  }, [doc, push]);

  useEffect(() => {
    return () => {
      if (saveTimer.current !== null) window.clearTimeout(saveTimer.current);
    };
  }, []);

  function snapshot(d: PrdDoc, label: string): DocVersion {
    const ts = Date.now();
    return {
      id: uid(),
      label,
      createdAt: ts,
      title: d.title,
      sections: d.sections.map((s) => ({ ...s, id: uid() })),
    };
  }

  function handleSnapshot() {
    update((d) => ({
      ...d,
      versions: [
        ...d.versions,
        snapshot(d, `v${d.versions.length + 1} - manual snapshot`),
      ],
    }));
    push("Snapshot saved");
  }

  function handleRestore(v: DocVersion) {
    update((d) => ({
      ...d,
      title: v.title,
      sections: v.sections.map((s) => ({ ...s, id: uid() })),
      versions: [
        ...d.versions,
        snapshot(d, `v${d.versions.length + 1} - before restore`),
      ],
    }));
    push(`Restored "${v.label}"`);
  }

  function handleAddSection() {
    update((d) => {
      const section: Section = {
        id: uid(),
        kind: addKind,
        title: SECTION_LABELS[addKind],
        body: "",
      };
      return { ...d, sections: [...d.sections, section] };
    });
    push(`Added ${SECTION_LABELS[addKind]} section`);
  }

  function handleAiApply(kind: SectionKind, text: string) {
    update((d) => {
      const idx = d.sections.findIndex((s) => s.kind === kind);
      if (idx >= 0) {
        const sections = [...d.sections];
        sections[idx] = { ...sections[idx], body: text };
        return { ...d, sections };
      }
      return {
        ...d,
        sections: [
          ...d.sections,
          { id: uid(), kind, title: SECTION_LABELS[kind], body: text },
        ],
      };
    });
    push(`${SECTION_LABELS[kind]} updated from AI draft`);
  }

  function moveSection(index: number, dir: -1 | 1) {
    update((d) => {
      const target = index + dir;
      if (target < 0 || target >= d.sections.length) return d;
      const sections = [...d.sections];
      [sections[index], sections[target]] = [sections[target], sections[index]];
      return { ...d, sections };
    });
  }

  function removeSection(index: number) {
    update((d) => ({
      ...d,
      sections: d.sections.filter((_, i) => i !== index),
    }));
    push("Section removed");
  }

  if (phase === "loading") {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <LoadingState label="Loading document" />
      </div>
    );
  }

  if (phase === "missing" || !doc) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <EmptyState
          title="Document not found"
          body="This document does not exist in local storage. It may have been deleted, or the link points to a document from another browser."
          action={
            <Link href="/" className={btnPrimary}>
              <ArrowLeft size={16} weight="regular" aria-hidden />
              Back to dashboard
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
      <div className="flex flex-wrap items-center gap-2">
        <Link href="/" className={btnSecondary + " px-3 py-1.5 text-xs"}>
          <ArrowLeft size={14} weight="regular" aria-hidden />
          Dashboard
        </Link>
        <span className={chipBase + " text-ink-soft"}>
          {STATUS_LABELS[doc.status]}
        </span>
        <span className={metaText} aria-live="polite">
          {saveFailed ? "Save failed" : "Autosaved locally"} · updated{" "}
          {formatDate(doc.updatedAt)}
        </span>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <button
            type="button"
            data-testid="version-history-button"
            aria-expanded={showVersions}
            aria-controls="version-panel-region"
            onClick={() => setShowVersions((v) => !v)}
            className={btnSecondary}
          >
            <ClockCounterClockwise size={16} weight="regular" aria-hidden />
            Versions
          </button>
          <button
            type="button"
            data-testid="export-button"
            onClick={() => setExportOpen(true)}
            className={btnPrimary}
          >
            <Export size={16} weight="regular" aria-hidden />
            Export
          </button>
        </div>
      </div>

      {saveFailed && (
        <div className="mt-4">
          <ErrorState
            title="Changes are not being saved"
            body="Local storage rejected the write (it may be full or blocked). Your edits stay in memory for this session but will be lost on reload."
            action={
              <button
                type="button"
                onClick={() => {
                  const ok = upsertDoc(doc);
                  setSaveFailed(!ok);
                  if (ok) push("Save recovered");
                }}
                className={btnSecondary}
              >
                Retry save
              </button>
            }
          />
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0">
          <label htmlFor="doc-title" className={metaText}>
            Document title
          </label>
          <input
            id="doc-title"
            data-testid="doc-title-input"
            value={doc.title}
            onChange={(e) => update((d) => ({ ...d, title: e.target.value }))}
            className={
              inputBase +
              " mt-1 border-transparent bg-transparent px-0 text-2xl font-semibold tracking-tight hover:border-transparent focus:border-transparent focus:px-2 sm:text-3xl"
            }
          />
          <p className="mt-1 text-sm text-ink-soft">
            {doc.product} · for {doc.audience}
          </p>

          <div className="mt-6 flex flex-col gap-3" data-testid="section-list">
            {doc.sections.length === 0 ? (
              <EmptyState
                title="No sections"
                body="This document is empty. Add a section below, or let AI assist draft one from the product brief."
              />
            ) : (
              doc.sections.map((s, i) => (
                <SectionCard
                  key={s.id}
                  section={s}
                  index={i}
                  count={doc.sections.length}
                  onBodyChange={(body) =>
                    update((d) => ({
                      ...d,
                      sections: d.sections.map((x) =>
                        x.id === s.id ? { ...x, body } : x
                      ),
                    }))
                  }
                  onRemove={() => removeSection(i)}
                  onMove={(dir) => moveSection(i, dir)}
                />
              ))
            )}
          </div>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
            <label htmlFor="add-kind" className="sr-only">
              Section type to add
            </label>
            <select
              id="add-kind"
              data-testid="add-section-kind"
              value={addKind}
              onChange={(e) => setAddKind(e.target.value as SectionKind)}
              className={inputBase + " sm:w-48"}
            >
              {SECTION_KINDS.map((k) => (
                <option key={k} value={k}>{SECTION_LABELS[k]}</option>
              ))}
            </select>
            <button
              type="button"
              data-testid="add-section-button"
              onClick={handleAddSection}
              className={btnSecondary}
            >
              <Plus size={16} weight="regular" aria-hidden />
              Add section
            </button>
          </div>
        </div>

        <aside className="flex min-w-0 flex-col gap-4">
          <AiPanel
            brief={{
              product: doc.product,
              audience: doc.audience,
              summary: doc.summary,
            }}
            onApply={handleAiApply}
          />
          <div id="version-panel-region" hidden={!showVersions}>
            <VersionPanel
              versions={doc.versions}
              onSnapshot={handleSnapshot}
              onRestore={handleRestore}
            />
          </div>
          {!showVersions && (
            <p className={metaText}>
              {doc.versions.length} {doc.versions.length === 1 ? "version" : "versions"} saved - open Versions to restore
            </p>
          )}
        </aside>
      </div>

      <ExportModal
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        docTitle={doc.title}
        sectionCount={doc.sections.length}
      />
      <ToastRegion toasts={toasts} dismiss={dismiss} />
    </div>
  );
}