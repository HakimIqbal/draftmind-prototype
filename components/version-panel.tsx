"use client";

import { ClockCounterClockwise, Camera } from "@phosphor-icons/react";
import { DocVersion, formatDate, formatTime } from "@/lib/types";
import { btnSecondary, cardBase, metaText } from "@/lib/ui";

export function VersionPanel({
  versions,
  onSnapshot,
  onRestore,
}: {
  versions: DocVersion[];
  onSnapshot: () => void;
  onRestore: (version: DocVersion) => void;
}) {
  return (
    <section
      data-testid="version-panel"
      aria-labelledby="version-panel-heading"
      className={cardBase + " p-4"}
    >
      <div className="flex items-center justify-between gap-2">
        <h2 id="version-panel-heading" className="flex items-center gap-2 text-sm font-semibold">
          <ClockCounterClockwise size={16} weight="regular" aria-hidden className="text-accent" />
          Version history
        </h2>
        <span className={metaText}>{versions.length} saved</span>
      </div>

      <button
        type="button"
        data-testid="version-snapshot-button"
        onClick={onSnapshot}
        className={btnSecondary + " mt-3 w-full"}
      >
        <Camera size={16} weight="regular" aria-hidden />
        Save snapshot
      </button>

      {versions.length === 0 ? (
        <p data-testid="empty-state" className="mt-4 text-xs text-ink-soft">
          No snapshots yet. Save one before big edits so you can roll back.
        </p>
      ) : (
        <ol className="mt-4 flex flex-col divide-y divide-line border-t border-line">
          {[...versions]
            .sort((a, b) => b.createdAt - a.createdAt)
            .map((v) => (
            <li key={v.id} className="flex items-center justify-between gap-3 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{v.label}</p>
                <p className={metaText + " mt-0.5"}>
                  {formatDate(v.createdAt)} {formatTime(v.createdAt)} ·{" "}
                  {v.sections.length} sections
                </p>
              </div>
              <button
                type="button"
                data-testid="version-restore-button"
                aria-label={`Restore ${v.label}`}
                onClick={() => onRestore(v)}
                className={btnSecondary + " shrink-0 px-3 py-1.5 text-xs"}
              >
                Restore
              </button>
            </li>
          ))}
        </ol>
      )}
      <p className="mt-3 text-xs text-ink-soft">
        Restoring replaces the current content. A snapshot of the current state
        is saved first, so restores are reversible.
      </p>
    </section>
  );
}