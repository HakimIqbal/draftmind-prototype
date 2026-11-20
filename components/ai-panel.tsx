"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { Lightning, Stop, Check } from "@phosphor-icons/react";
import { AI_DISCLAIMER, generateSectionText } from "@/lib/mock-ai";
import { SECTION_KINDS, SECTION_LABELS, SectionKind } from "@/lib/types";
import { btnPrimary, btnSecondary, cardBase, inputBase, labelBase, metaText } from "@/lib/ui";

type Phase = "idle" | "streaming" | "done";

export function AiPanel({
  brief,
  onApply,
}: {
  brief: { product: string; audience: string; summary: string };
  onApply: (kind: SectionKind, text: string) => void;
}) {
  const reduce = useReducedMotion();
  const [kind, setKind] = useState<SectionKind>("problem");
  const [phase, setPhase] = useState<Phase>("idle");
  const [output, setOutput] = useState("");
  const fullRef = useRef("");
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) window.clearInterval(timerRef.current);
    };
  }, []);

  function stopTimer() {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  function start() {
    const text = generateSectionText(kind, brief);
    fullRef.current = text;
    setOutput("");
    setPhase("streaming");
    if (reduce) {
      setOutput(text);
      setPhase("done");
      return;
    }
    let i = 0;
    stopTimer();
    timerRef.current = window.setInterval(() => {
      i = Math.min(i + 4, text.length);
      setOutput(text.slice(0, i));
      if (i >= text.length) {
        stopTimer();
        setPhase("done");
      }
    }, 24);
  }

  function stopEarly() {
    stopTimer();
    setPhase("done");
  }

  function apply() {
    onApply(kind, fullRef.current);
    setPhase("idle");
    setOutput("");
  }

  return (
    <section aria-labelledby="ai-panel-heading" className={cardBase + " p-4"}>
      <div className="flex items-center justify-between gap-2">
        <h2 id="ai-panel-heading" className="flex items-center gap-2 text-sm font-semibold">
          <Lightning size={16} weight="regular" aria-hidden className="text-accent" />
          AI assist
        </h2>
        <span className={metaText}>{AI_DISCLAIMER}</span>
      </div>
      <p className="mt-1 text-xs text-ink-soft">
        Drafts a section from your product brief using a deterministic local
        template. Nothing leaves this browser.
      </p>

      <div className="mt-4">
        <label htmlFor="ai-kind" className={labelBase}>Section to draft</label>
        <select
          id="ai-kind"
          data-testid="ai-kind-select"
          value={kind}
          onChange={(e) => setKind(e.target.value as SectionKind)}
          disabled={phase === "streaming"}
          className={inputBase}
        >
          {SECTION_KINDS.map((k) => (
            <option key={k} value={k}>{SECTION_LABELS[k]}</option>
          ))}
        </select>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {phase !== "streaming" ? (
          <button
            type="button"
            data-testid="ai-assist-button"
            onClick={start}
            className={btnPrimary}
          >
            <Lightning size={16} weight="regular" aria-hidden />
            {phase === "done" ? "Regenerate" : "Generate draft"}
          </button>
        ) : (
          <button
            type="button"
            data-testid="ai-stop-button"
            onClick={stopEarly}
            className={btnSecondary}
          >
            <Stop size={16} weight="regular" aria-hidden />
            Stop
          </button>
        )}
        {phase === "done" && (
          <button
            type="button"
            data-testid="ai-apply-button"
            onClick={apply}
            className={btnSecondary}
          >
            <Check size={16} weight="regular" aria-hidden />
            Add to document
          </button>
        )}
      </div>

      <div
        aria-live="polite"
        aria-busy={phase === "streaming"}
        className="mt-4"
      >
        {phase === "idle" ? (
          <p className={metaText}>Output appears here</p>
        ) : (
          <pre
            data-testid="ai-output"
            className="max-h-64 overflow-y-auto whitespace-pre-wrap rounded-box border border-line bg-paper-deep p-3 font-mono text-xs leading-relaxed text-ink"
          >
            {output}
            {phase === "streaming" && (
              <span aria-hidden className="ml-0.5 inline-block h-3 w-1.5 animate-pulse bg-accent align-middle" />
            )}
          </pre>
        )}
        {phase === "streaming" && (
          <p className={metaText + " mt-2"} role="status">
            Generating draft...
          </p>
        )}
        {phase === "done" && (
          <p className={metaText + " mt-2"} role="status">
            Draft complete - review before adding
          </p>
        )}
      </div>
    </section>
  );
}