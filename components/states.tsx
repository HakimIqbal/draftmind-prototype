"use client";

import { FileText, Warning } from "@phosphor-icons/react";
import { cardBase, metaText } from "@/lib/ui";

export function LoadingState({ label }: { label: string }) {
  return (
    <div
      data-testid="loading-state"
      role="status"
      aria-live="polite"
      className={cardBase + " p-8"}
    >
      <div className="flex items-center gap-3">
        <span
          aria-hidden
          className="inline-block h-2 w-2 animate-pulse rounded-full bg-accent"
        />
        <p className={metaText}>{label}</p>
      </div>
      <div className="mt-6 space-y-3" aria-hidden>
        <div className="h-3 w-2/3 animate-pulse rounded-box bg-paper-deep" />
        <div className="h-3 w-1/2 animate-pulse rounded-box bg-paper-deep" />
        <div className="h-3 w-3/4 animate-pulse rounded-box bg-paper-deep" />
      </div>
      <span className="sr-only">Loading</span>
    </div>
  );
}

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: React.ReactNode;
}) {
  return (
    <div
      data-testid="empty-state"
      className={cardBase + " flex flex-col items-start gap-3 p-8"}
    >
      <FileText size={20} weight="regular" aria-hidden className="text-ink-soft" />
      <h2 className="text-base font-semibold">{title}</h2>
      <p className="max-w-md text-sm text-ink-soft">{body}</p>
      {action}
    </div>
  );
}

export function ErrorState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: React.ReactNode;
}) {
  return (
    <div
      data-testid="error-state"
      role="alert"
      className={cardBase + " border-accent/40 p-8"}
    >
      <div className="flex items-start gap-3">
        <Warning size={20} weight="regular" aria-hidden className="mt-0.5 text-accent" />
        <div className="flex flex-col items-start gap-2">
          <h2 className="text-base font-semibold">{title}</h2>
          <p className="max-w-md text-sm text-ink-soft">{body}</p>
          {action}
        </div>
      </div>
    </div>
  );
}