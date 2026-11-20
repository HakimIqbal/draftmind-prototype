/** Shared class strings. One accent, one radius (rounded-box), light theme. */

export const btnBase =
  "inline-flex items-center justify-center gap-2 rounded-box font-medium " +
  "transition-[background-color,color,border-color,opacity,transform] duration-150 " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent " +
  "active:translate-y-px disabled:pointer-events-none disabled:opacity-45 " +
  "whitespace-nowrap select-none";

export const btnPrimary =
  btnBase +
  " bg-accent text-paper px-4 py-2 text-sm hover:bg-accent-deep";

export const btnSecondary =
  btnBase +
  " border border-line bg-paper text-ink px-4 py-2 text-sm hover:border-ink-soft hover:bg-paper-deep";

export const btnGhost =
  btnBase +
  " text-ink-soft px-3 py-2 text-sm hover:bg-paper-deep hover:text-ink";

export const btnIcon =
  btnBase +
  " border border-line bg-paper text-ink-soft p-2 hover:border-ink-soft hover:text-ink hover:bg-paper-deep";

export const btnDanger =
  btnBase +
  " border border-line bg-paper text-accent px-3 py-2 text-sm hover:border-accent hover:bg-paper-deep";

export const inputBase =
  "w-full rounded-box border border-line bg-paper px-3 py-2 text-sm text-ink " +
  "placeholder:text-ink-soft/60 transition-[border-color,box-shadow] duration-150 " +
  "hover:border-ink-soft/50 focus:border-accent focus:outline-2 focus:outline-offset-1 " +
  "focus:outline-accent disabled:opacity-45";

export const labelBase = "block text-sm font-medium text-ink mb-1.5";

export const errorText = "mt-1.5 text-xs text-accent";

export const cardBase = "rounded-box border border-line bg-paper";

export const metaText = "font-mono text-[11px] uppercase tracking-wider text-ink-soft";

export const chipBase =
  "inline-flex items-center gap-1 rounded-box border border-line px-2 py-0.5 " +
  "font-mono text-[11px] uppercase tracking-wider";