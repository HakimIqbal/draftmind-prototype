"use client";

import { ArrowDown, ArrowUp, Trash } from "@phosphor-icons/react";
import { Section, SECTION_LABELS } from "@/lib/types";
import { btnIcon, cardBase, inputBase, metaText } from "@/lib/ui";

export function SectionCard({
  section,
  index,
  count,
  onBodyChange,
  onRemove,
  onMove,
}: {
  section: Section;
  index: number;
  count: number;
  onBodyChange: (body: string) => void;
  onRemove: () => void;
  onMove: (dir: -1 | 1) => void;
}) {
  return (
    <article
      data-testid="section-card"
      data-section-kind={section.kind}
      className={cardBase + " p-4 sm:p-5"}
    >
      <div className="flex items-center justify-between gap-3">
        <h3 className="flex items-baseline gap-2 text-sm font-semibold">
          <span className={metaText}>{String(index + 1).padStart(2, "0")}</span>
          {SECTION_LABELS[section.kind]}
        </h3>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            data-testid="section-move-up"
            aria-label={`Move ${SECTION_LABELS[section.kind]} section up`}
            disabled={index === 0}
            onClick={() => onMove(-1)}
            className={btnIcon}
          >
            <ArrowUp size={16} weight="regular" aria-hidden />
          </button>
          <button
            type="button"
            data-testid="section-move-down"
            aria-label={`Move ${SECTION_LABELS[section.kind]} section down`}
            disabled={index === count - 1}
            onClick={() => onMove(1)}
            className={btnIcon}
          >
            <ArrowDown size={16} weight="regular" aria-hidden />
          </button>
          <button
            type="button"
            data-testid="section-remove-button"
            aria-label={`Remove ${SECTION_LABELS[section.kind]} section`}
            onClick={onRemove}
            className={btnIcon + " hover:border-accent hover:text-accent"}
          >
            <Trash size={16} weight="regular" aria-hidden />
          </button>
        </div>
      </div>
      <label className="sr-only" htmlFor={`section-body-${section.id}`}>
        {SECTION_LABELS[section.kind]} section content
      </label>
      <textarea
        id={`section-body-${section.id}`}
        data-testid="section-body-input"
        rows={Math.min(8, Math.max(3, section.body.split("\n").length + 1))}
        value={section.body}
        onChange={(e) => onBodyChange(e.target.value)}
        className={inputBase + " mt-3 resize-y leading-relaxed"}
      />
    </article>
  );
}