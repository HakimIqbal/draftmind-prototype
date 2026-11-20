"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowLeft, ArrowRight, Check } from "@phosphor-icons/react";
import { saveDocs, loadDocs } from "@/lib/store";
import {
  PrdDoc,
  SECTION_KINDS,
  SECTION_LABELS,
  Section,
  SectionKind,
  uid,
} from "@/lib/types";
import {
  btnPrimary,
  btnSecondary,
  cardBase,
  errorText,
  inputBase,
  labelBase,
  metaText,
} from "@/lib/ui";

interface FormState {
  product: string;
  title: string;
  audience: string;
  summary: string;
  kinds: SectionKind[];
}

type Errors = Partial<Record<"product" | "title" | "audience" | "summary" | "kinds", string>>;

const STEPS = ["Product basics", "Scope & requirements", "Review"] as const;

const STARTERS: Record<SectionKind, string> = {
  problem: "Describe the pain this product removes.",
  goals: "List the outcomes this release must achieve.",
  requirements: "Enumerate testable requirements, R1 onward.",
  metrics: "Define how success will be measured.",
};

export function Wizard() {
  const router = useRouter();
  const reduce = useReducedMotion();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>({
    product: "",
    title: "",
    audience: "",
    summary: "",
    kinds: ["problem", "goals", "requirements", "metrics"],
  });
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headingRef.current?.focus();
  }, [step]);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function toggleKind(kind: SectionKind) {
    setForm((f) => ({
      ...f,
      kinds: f.kinds.includes(kind)
        ? f.kinds.filter((k) => k !== kind)
        : [...f.kinds, kind],
    }));
    setErrors((e) => ({ ...e, kinds: undefined }));
  }

  function validateStep(index: number): Errors {
    const e: Errors = {};
    if (index === 0) {
      if (form.product.trim().length < 2)
        e.product = "Product name needs at least 2 characters.";
      if (form.title.trim().length < 4)
        e.title = "Document title needs at least 4 characters.";
      if (form.audience.trim().length < 4)
        e.audience = "Describe the audience in at least 4 characters.";
    }
    if (index === 1) {
      if (form.summary.trim().length < 20)
        e.summary = "Give the scope at least 20 characters so the draft has context.";
      if (form.kinds.length === 0)
        e.kinds = "Pick at least one section to include.";
    }
    return e;
  }

  function focusFirstError(e: Errors) {
    const order: (keyof Errors)[] = ["product", "title", "audience", "summary", "kinds"];
    const first = order.find((k) => e[k]);
    if (!first) return;
    const el = document.querySelector<HTMLElement>(`[data-field="${first}"]`);
    el?.focus();
  }

  function goNext() {
    const e = validateStep(step);
    setErrors(e);
    if (Object.keys(e).length > 0) {
      focusFirstError(e);
      return;
    }
    setStep((s) => Math.min(s + 1, 2));
  }

  function goBack() {
    setErrors({});
    setStep((s) => Math.max(s - 1, 0));
  }

  function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (step < 2) {
      goNext();
      return;
    }
    const e = { ...validateStep(0), ...validateStep(1) };
    if (Object.keys(e).length > 0) {
      setErrors(e);
      setStep(e.product || e.title || e.audience ? 0 : 1);
      return;
    }
    setSubmitting(true);
    const now = Date.now();
    const ordered = SECTION_KINDS.filter((k) => form.kinds.includes(k));
    const sections: Section[] = ordered.map((kind) => ({
      id: uid(),
      kind,
      title: SECTION_LABELS[kind],
      body: STARTERS[kind],
    }));
    const doc: PrdDoc = {
      id: uid(),
      title: form.title.trim(),
      product: form.product.trim(),
      audience: form.audience.trim(),
      summary: form.summary.trim(),
      status: "draft",
      createdAt: now,
      updatedAt: now,
      sections,
      versions: [
        {
          id: uid(),
          label: "v1 - created from wizard",
          createdAt: now,
          title: form.title.trim(),
          sections: sections.map((s) => ({ ...s, id: uid() })),
        },
      ],
    };
    const res = loadDocs();
    const docs = res.ok ? res.docs : [];
    const saved = saveDocs([doc, ...docs]);
    if (!saved) {
      setSubmitting(false);
      setErrors({ summary: "Local storage is unavailable, so the document could not be saved. Enable storage for this site and try again." });
      return;
    }
    router.push(`/editor?id=${doc.id}`);
  }

  const fieldError = (key: keyof Errors) =>
    errors[key] ? (
      <p id={`${key}-error`} className={errorText} role="alert">
        {errors[key]}
      </p>
    ) : null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <p className={metaText}>Workspace / New document</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">
        Create a PRD
      </h1>

      <ol className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-0" aria-label="Wizard progress">
        {STEPS.map((label, i) => (
          <li key={label} className="flex items-center sm:flex-1">
            <span
              aria-current={i === step ? "step" : undefined}
              className={
                "flex items-center gap-2 text-sm " +
                (i === step ? "font-semibold text-ink" : "text-ink-soft")
              }
            >
              <span
                aria-hidden
                className={
                  "flex h-6 w-6 items-center justify-center rounded-box border font-mono text-[11px] " +
                  (i < step
                    ? "border-accent bg-accent text-paper"
                    : i === step
                      ? "border-accent text-accent"
                      : "border-line text-ink-soft")
                }
              >
                {i < step ? <Check size={12} weight="regular" /> : i + 1}
              </span>
              {label}
            </span>
            {i < STEPS.length - 1 && (
              <span aria-hidden className="mx-3 hidden h-px flex-1 bg-line sm:block" />
            )}
          </li>
        ))}
      </ol>

      <form onSubmit={handleSubmit} noValidate className={cardBase + " mt-6 p-5 sm:p-8"}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={step}
            initial={reduce ? { opacity: 0 } : { opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, x: -16 }}
            transition={{ duration: 0.16 }}
          >
            {step === 0 && (
              <section data-testid="wizard-step-1" aria-labelledby="step-heading">
                <h2
                  id="step-heading"
                  ref={headingRef}
                  tabIndex={-1}
                  className="text-lg font-semibold focus:outline-none"
                >
                  Product basics
                </h2>
                <p className="mt-1 text-sm text-ink-soft">
                  Name the product and who this document serves.
                </p>
                <div className="mt-6 flex flex-col gap-5">
                  <div>
                    <label htmlFor="w-product" className={labelBase}>Product name</label>
                    <input
                      id="w-product"
                      data-field="product"
                      data-testid="wizard-product-input"
                      className={inputBase}
                      value={form.product}
                      onChange={(e) => set("product", e.target.value)}
                      placeholder="e.g. DraftMind"
                      aria-invalid={!!errors.product}
                      aria-describedby={errors.product ? "product-error" : undefined}
                    />
                    {fieldError("product")}
                  </div>
                  <div>
                    <label htmlFor="w-title" className={labelBase}>Document title</label>
                    <input
                      id="w-title"
                      data-field="title"
                      data-testid="wizard-title-input"
                      className={inputBase}
                      value={form.title}
                      onChange={(e) => set("title", e.target.value)}
                      placeholder="e.g. Collaborative Editing PRD"
                      aria-invalid={!!errors.title}
                      aria-describedby={errors.title ? "title-error" : undefined}
                    />
                    {fieldError("title")}
                  </div>
                  <div>
                    <label htmlFor="w-audience" className={labelBase}>Target audience</label>
                    <input
                      id="w-audience"
                      data-field="audience"
                      data-testid="wizard-audience-input"
                      className={inputBase}
                      value={form.audience}
                      onChange={(e) => set("audience", e.target.value)}
                      placeholder="e.g. Product managers at small SaaS teams"
                      aria-invalid={!!errors.audience}
                      aria-describedby={errors.audience ? "audience-error" : undefined}
                    />
                    {fieldError("audience")}
                  </div>
                </div>
              </section>
            )}

            {step === 1 && (
              <section data-testid="wizard-step-2" aria-labelledby="step-heading">
                <h2
                  id="step-heading"
                  ref={headingRef}
                  tabIndex={-1}
                  className="text-lg font-semibold focus:outline-none"
                >
                  Scope & requirements
                </h2>
                <p className="mt-1 text-sm text-ink-soft">
                  One paragraph of context, then pick the sections to scaffold.
                </p>
                <div className="mt-6 flex flex-col gap-5">
                  <div>
                    <label htmlFor="w-summary" className={labelBase}>Scope summary</label>
                    <textarea
                      id="w-summary"
                      data-field="summary"
                      data-testid="wizard-summary-input"
                      rows={4}
                      className={inputBase + " resize-y"}
                      value={form.summary}
                      onChange={(e) => set("summary", e.target.value)}
                      placeholder="What is being built, for whom, and why now? At least 20 characters."
                      aria-invalid={!!errors.summary}
                      aria-describedby={errors.summary ? "summary-error" : undefined}
                    />
                    {fieldError("summary")}
                  </div>
                  <fieldset data-field="kinds" tabIndex={-1} className="focus:outline-none">
                    <legend className={labelBase}>Sections to include</legend>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {SECTION_KINDS.map((kind) => {
                        const checked = form.kinds.includes(kind);
                        return (
                          <label
                            key={kind}
                            className={
                              "flex cursor-pointer items-start gap-3 rounded-box border p-3 text-sm transition-colors " +
                              (checked
                                ? "border-accent bg-paper-deep"
                                : "border-line hover:border-ink-soft/50")
                            }
                          >
                            <input
                              type="checkbox"
                              data-testid={`wizard-kind-${kind}`}
                              checked={checked}
                              onChange={() => toggleKind(kind)}
                              className="mt-0.5 h-4 w-4 accent-[#c2410c] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                            />
                            <span>
                              <span className="font-medium">{SECTION_LABELS[kind]}</span>
                              <span className="mt-0.5 block text-xs text-ink-soft">
                                {STARTERS[kind]}
                              </span>
                            </span>
                          </label>
                        );
                      })}
                    </div>
                    {errors.kinds && (
                      <p className={errorText} role="alert">{errors.kinds}</p>
                    )}
                  </fieldset>
                </div>
              </section>
            )}

            {step === 2 && (
              <section data-testid="wizard-step-3" aria-labelledby="step-heading">
                <h2
                  id="step-heading"
                  ref={headingRef}
                  tabIndex={-1}
                  className="text-lg font-semibold focus:outline-none"
                >
                  Review
                </h2>
                <p className="mt-1 text-sm text-ink-soft">
                  Confirm the setup. You can edit everything in the editor.
                </p>
                <dl className="mt-6 flex flex-col divide-y divide-line border-y border-line">
                  {[
                    ["Product", form.product.trim()],
                    ["Title", form.title.trim()],
                    ["Audience", form.audience.trim()],
                    ["Scope", form.summary.trim()],
                    [
                      "Sections",
                      SECTION_KINDS.filter((k) => form.kinds.includes(k))
                        .map((k) => SECTION_LABELS[k])
                        .join(", "),
                    ],
                  ].map(([k, v]) => (
                    <div key={k} className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-[140px_1fr] sm:gap-4">
                      <dt className={metaText + " pt-0.5"}>{k}</dt>
                      <dd className="text-sm">{v}</dd>
                    </div>
                  ))}
                </dl>
                <p className="mt-4 text-xs text-ink-soft">
                  Creating the document also saves a first version snapshot, so
                  you can always restore this starting point.
                </p>
              </section>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="mt-8 flex items-center justify-between gap-3 border-t border-line pt-5">
          <button
            type="button"
            data-testid="wizard-back"
            onClick={goBack}
            disabled={step === 0 || submitting}
            className={btnSecondary}
          >
            <ArrowLeft size={16} weight="regular" aria-hidden />
            Back
          </button>
          {step < 2 ? (
            <button type="submit" data-testid="wizard-next" className={btnPrimary}>
              Next
              <ArrowRight size={16} weight="regular" aria-hidden />
            </button>
          ) : (
            <button
              type="submit"
              data-testid="wizard-submit"
              disabled={submitting}
              className={btnPrimary}
            >
              {submitting ? "Creating..." : "Create document"}
              <Check size={16} weight="regular" aria-hidden />
            </button>
          )}
        </div>
      </form>
    </div>
  );
}