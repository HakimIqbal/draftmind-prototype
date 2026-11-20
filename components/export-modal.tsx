"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  CheckCircle,
  FileDoc,
  FilePdf,
  Warning,
} from "@phosphor-icons/react";
import { Modal } from "@/components/modal";
import { btnPrimary, btnSecondary, metaText } from "@/lib/ui";

type Format = "pdf" | "docx";
type Phase = "choose" | "exporting" | "success" | "error";

const STAGES = [
  "Collecting sections",
  "Applying document template",
  "Rendering pages",
  "Finalizing package",
];

export function ExportModal({
  open,
  onClose,
  docTitle,
  sectionCount,
}: {
  open: boolean;
  onClose: () => void;
  docTitle: string;
  sectionCount: number;
}) {
  const reduce = useReducedMotion();
  const [format, setFormat] = useState<Format>("pdf");
  const [phase, setPhase] = useState<Phase>("choose");
  const [stage, setStage] = useState(0);
  const [simulateFailure, setSimulateFailure] = useState(false);
  const timersRef = useRef<number[]>([]);
  const failRef = useRef(false);

  function clearTimers() {
    timersRef.current.forEach((t) => window.clearTimeout(t));
    timersRef.current = [];
  }

  useEffect(() => {
    if (open) {
      setPhase("choose");
      setStage(0);
      setFormat("pdf");
      setSimulateFailure(false);
    } else {
      clearTimers();
    }
    return clearTimers;
  }, [open]);

  function runExport(fail: boolean) {
    clearTimers();
    failRef.current = fail;
    setPhase("exporting");
    setStage(0);
    const stepMs = reduce ? 150 : 700;
    STAGES.forEach((_, i) => {
      timersRef.current.push(
        window.setTimeout(() => setStage(i), i * stepMs)
      );
    });
    timersRef.current.push(
      window.setTimeout(() => {
        setPhase(failRef.current ? "error" : "success");
      }, STAGES.length * stepMs + 200)
    );
  }

  const fileName = `${docTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "document"}.${format}`;

  return (
    <Modal open={open} onClose={onClose} labelledBy="export-heading" testId="export-modal">
      <div className="p-5 sm:p-6">
        <h2 id="export-heading" className="pr-8 text-lg font-semibold">
          Export document
        </h2>
        <p className={metaText + " mt-1"}>
          Simulated export - no file is produced
        </p>

        {phase === "choose" && (
          <div className="mt-5">
            <fieldset>
              <legend className="text-sm font-medium">Format</legend>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {(
                  [
                    ["pdf", "PDF", FilePdf, "Fixed layout for review"],
                    ["docx", "DOCX", FileDoc, "Editable for handoff"],
                  ] as const
                ).map(([value, label, Icon, hint]) => (
                  <label
                    key={value}
                    className={
                      "flex cursor-pointer flex-col gap-1 rounded-box border p-3 transition-colors " +
                      (format === value
                        ? "border-accent bg-paper-deep"
                        : "border-line hover:border-ink-soft/50")
                    }
                  >
                    <span className="flex items-center gap-2 text-sm font-medium">
                      <input
                        type="radio"
                        name="export-format"
                        data-testid={`export-format-${value}`}
                        checked={format === value}
                        onChange={() => setFormat(value)}
                        className="h-4 w-4 accent-[#c2410c] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                      />
                      <Icon size={16} weight="regular" aria-hidden />
                      {label}
                    </span>
                    <span className="text-xs text-ink-soft">{hint}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <label className="mt-4 flex items-center gap-2 text-xs text-ink-soft">
              <input
                type="checkbox"
                data-testid="export-failure-toggle"
                checked={simulateFailure}
                onChange={(e) => setSimulateFailure(e.target.checked)}
                className="h-4 w-4 accent-[#c2410c] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              />
              Simulate a failed export (to demo the error path)
            </label>

            <p className="mt-4 text-xs text-ink-soft">
              {sectionCount} sections will be included from &quot;{docTitle}&quot;.
              This prototype walks the export flow honestly: progress and result
              states are real UI, but no binary file is generated.
            </p>

            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={onClose} className={btnSecondary}>
                Cancel
              </button>
              <button
                type="button"
                data-testid="export-confirm"
                data-autofocus
                onClick={() => runExport(simulateFailure)}
                className={btnPrimary}
              >
                Export {format.toUpperCase()}
              </button>
            </div>
          </div>
        )}

        {phase === "exporting" && (
          <div className="mt-5" role="status" aria-live="polite">
            <p className="text-sm font-medium">
              Exporting {format.toUpperCase()}...
            </p>
            <div
              className="mt-3 h-1.5 overflow-hidden rounded-box bg-paper-deep"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={STAGES.length}
              aria-valuenow={stage + 1}
              aria-label="Export progress"
            >
              <motion.div
                className="h-full origin-left bg-accent"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: (stage + 1) / STAGES.length }}
                transition={{ duration: reduce ? 0 : 0.4 }}
              />
            </div>
            <ol className="mt-4 flex flex-col gap-2">
              {STAGES.map((s, i) => (
                <li
                  key={s}
                  className={
                    "flex items-center gap-2 text-sm " +
                    (i < stage
                      ? "text-ink-soft"
                      : i === stage
                        ? "font-medium text-ink"
                        : "text-ink-soft/50")
                  }
                >
                  {i < stage ? (
                    <CheckCircle size={16} weight="regular" aria-hidden className="text-accent" />
                  ) : (
                    <span
                      aria-hidden
                      className={
                        "inline-block h-2 w-2 rounded-full " +
                        (i === stage ? "animate-pulse bg-accent" : "bg-line")
                      }
                    />
                  )}
                  {s}
                </li>
              ))}
            </ol>
            <div className="mt-5 flex justify-end">
              <button type="button" onClick={onClose} className={btnSecondary}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {phase === "success" && (
          <div className="mt-5" data-testid="export-success" role="status">
            <div className="flex items-start gap-3">
              <CheckCircle size={20} weight="regular" aria-hidden className="mt-0.5 text-accent" />
              <div>
                <p className="text-sm font-semibold">Export simulation complete</p>
                <p className="mt-1 font-mono text-xs text-ink-soft">{fileName}</p>
                <p className="mt-2 text-xs text-ink-soft">
                  Simulation finished successfully. In the real product this is
                  where the {format.toUpperCase()} download starts. No file was
                  generated in this prototype.
                </p>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                data-autofocus
                onClick={onClose}
                className={btnPrimary}
              >
                Done
              </button>
            </div>
          </div>
        )}

        {phase === "error" && (
          <div className="mt-5" data-testid="export-error" role="alert">
            <div className="flex items-start gap-3">
              <Warning size={20} weight="regular" aria-hidden className="mt-0.5 text-accent" />
              <div>
                <p className="text-sm font-semibold">Export failed</p>
                <p className="mt-2 text-xs text-ink-soft">
                  The simulated renderer hit an error on the finalizing stage
                  (this failure was requested via the demo toggle). Your
                  document is untouched. Retry, or switch format.
                </p>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setPhase("choose")}
                className={btnSecondary}
              >
                Back to options
              </button>
              <button
                type="button"
                data-testid="export-retry"
                data-autofocus
                onClick={() => {
                  setSimulateFailure(false);
                  runExport(false);
                }}
                className={btnPrimary}
              >
                Retry export
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}