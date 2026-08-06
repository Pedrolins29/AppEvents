"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { ApiError } from "@/lib/apiClient";
import { authApi } from "@/lib/authApi";
import {
  getWeddingPlanCheckoutUrl,
  isWeddingPlanConfigured,
  type WeddingPlanTier,
} from "@/lib/checkoutUrls";
import { DURATION, EASE_FRAMER } from "@/lib/motion";

interface SoftGateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PASSWORD_TESTS: ((value: string) => boolean)[] = [
  (v) => v.length >= 10,
  (v) => /[A-Z]/.test(v),
  (v) => /[a-z]/.test(v),
  (v) => /[0-9]/.test(v),
  (v) => /[^A-Za-z0-9]/.test(v),
];

// Sprint 23: soft gate (email/name/password) + decoy-priced plan cards, wired only to the
// InstantPreview CTA for Wedding drafts (see Sprints/sprint23.md — other event types keep the
// plain /register link until their own funnel gets modeled). Registers the visitor via the same
// authApi.register() the full /register page uses (no new backend surface), then redirects
// straight to the chosen plan's Lastlink checkout — zero-friction, doesn't wait for email
// confirmation. The confirmation email still goes out in the background as it always does.
export function SoftGateModal({ isOpen, onClose }: SoftGateModalProps) {
  const t = useTranslations("criarConvite.categories.Wedding.plans");
  const passwordChecksT = useTranslations("auth.register");
  const locale = useLocale();
  const reduceMotion = useReducedMotion();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [honeypotField, setHoneypotField] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submittingTier, setSubmittingTier] = useState<WeddingPlanTier | null>(null);

  const passwordChecks = (passwordChecksT.raw("passwordChecks") as { label: string }[]).map(
    ({ label }, i) => ({ label, test: PASSWORD_TESTS[i] }),
  );

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Locks background scroll while open, and compensates the padding-right for the vanishing
  // scrollbar width — otherwise page content shifts sideways as the scrollbar disappears/
  // reappears, exactly the "layout shift" the animation brief calls out to prevent.
  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    const previousOverflow = document.body.style.overflow;
    const previousPaddingRight = document.body.style.paddingRight;
    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPaddingRight;
    };
  }, [isOpen]);

  const transition = reduceMotion ? { duration: 0 } : { duration: DURATION.modal, ease: EASE_FRAMER };

  async function handleChoosePlan(tier: WeddingPlanTier) {
    setError(null);
    if (!fullName.trim() || !email.trim() || !password) {
      setError(t("submitError"));
      return;
    }

    setSubmittingTier(tier);
    try {
      const user = await authApi.register({
        fullName,
        email,
        password,
        honeypotField: honeypotField || null,
        locale,
      });
      const checkoutUrl = getWeddingPlanCheckoutUrl(tier, user.id);
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
        return;
      }
      // Shouldn't happen in practice (InstantPreview only opens this modal when at least one
      // tier is configured), but the account was already created either way — send the visitor
      // to the normal post-register flow instead of leaving them stuck on a dead click.
      window.location.href = "/register";
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 409) {
          setError(t("emailInUseError"));
        } else {
          const fieldErrors = err.problem?.errors
            ? Object.values(err.problem.errors).flat().join(" ")
            : null;
          setError(fieldErrors || err.message);
        }
      } else {
        setError(t("submitError"));
      }
      setSubmittingTier(null);
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="soft-gate-overlay"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              onClose();
            }
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={transition}
        >
          <motion.div
            className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-lg bg-[#FDFBF7] p-6 sm:p-8"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={transition}
          >
            <div className="mb-6 flex items-start justify-between">
              <p className="font-serif text-xl text-[#14211D]" style={{ fontWeight: 600 }}>
                {t("formHeading")}
              </p>
              <button
                type="button"
                onClick={onClose}
                aria-label={t("close")}
                className="text-[#5B6B67] transition-colors duration-150 hover:text-[#14211D]"
              >
                ✕
              </button>
            </div>

            {/* Honeypot: hidden from every real visitor, left empty by humans, often auto-filled by
                bots — a non-empty value fails validation server-side. Same pattern as register/page.tsx. */}
            <input
              type="text"
              name="hp_confirm_token"
              value={honeypotField}
              onChange={(e) => setHoneypotField(e.target.value)}
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }}
            />

            <div className="mb-6 grid gap-3 sm:grid-cols-3">
              <div>
                <label htmlFor="soft-gate-name" className="mb-1 block text-sm font-medium text-[#14211D]">
                  {t("fullNameLabel")}
                </label>
                <input
                  id="soft-gate-name"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full border border-[#E2DFD3] px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label htmlFor="soft-gate-email" className="mb-1 block text-sm font-medium text-[#14211D]">
                  {t("emailLabel")}
                </label>
                <input
                  id="soft-gate-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-[#E2DFD3] px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label htmlFor="soft-gate-password" className="mb-1 block text-sm font-medium text-[#14211D]">
                  {t("passwordLabel")}
                </label>
                <input
                  id="soft-gate-password"
                  type="password"
                  required
                  minLength={10}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => setPasswordTouched(true)}
                  className="w-full border border-[#E2DFD3] px-3 py-2 text-sm"
                />
              </div>
            </div>

            {passwordTouched && (
              <ul className="mb-4 -mt-3 flex flex-wrap gap-x-4 gap-y-0.5">
                {passwordChecks.map(({ label, test }) => {
                  const met = test(password);
                  return (
                    <li key={label} className={`text-xs ${met ? "text-[#0F766E]" : "text-[#5B6B67]"}`}>
                      {met ? "✓" : "○"} {label}
                    </li>
                  );
                })}
              </ul>
            )}

            <p className="mb-6 text-xs text-[#5B6B67]">{t("securityNote")}</p>

            {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

            <div className="grid gap-4 sm:grid-cols-2">
              {/* Anchor card */}
              <div className="flex flex-col rounded-lg border border-[#333333] p-5">
                <p className="font-serif text-lg text-[#14211D]" style={{ fontWeight: 600 }}>
                  {t("essencial.title")}
                </p>
                <p className="mt-2 text-2xl font-bold text-[#14211D]">{t("essencial.price")}</p>
                <p className="text-xs text-[#5B6B67]">{t("essencial.priceNote")}</p>
                <ul className="my-4 flex flex-col gap-2 text-sm text-[#14211D]">
                  {(t.raw("essencial.features") as string[]).map((feature) => (
                    <li key={feature} className="flex gap-2">
                      <span className="text-[#5B6B67]">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() => handleChoosePlan("Essencial")}
                  disabled={submittingTier !== null || !isWeddingPlanConfigured("Essencial")}
                  className="mt-auto rounded-full border border-[#333333] px-4 py-2 text-sm font-medium text-[#14211D] transition-all duration-[var(--duration-fast)] ease-[var(--ease-premium)] motion-reduce:transition-none hover:scale-[1.03] hover:bg-[#F5F2EA] hover:shadow-[0_10px_24px_-10px_rgba(22,19,14,0.35)] disabled:opacity-50"
                >
                  {submittingTier === "Essencial" ? t("submitting") : t("essencial.cta")}
                </button>
              </div>

              {/* Decoy / flagship card */}
              <div
                className="flex flex-col rounded-lg border-2 border-[#C5A059] bg-[#1A1A1A] p-5"
                style={{ boxShadow: "0 0 24px rgba(197, 160, 89, 0.25)" }}
              >
                <span className="mb-2 inline-block w-fit rounded-full bg-[#C5A059] px-3 py-1 text-xs font-bold text-black">
                  👑 {t("premium.badge")}
                </span>
                <p className="font-serif text-lg text-white" style={{ fontWeight: 600 }}>
                  {t("premium.title")}
                </p>
                <p className="mt-2 text-2xl font-bold text-[#C5A059]">{t("premium.price")}</p>
                <p className="text-xs text-[#A8A8A8]">{t("premium.priceNote")}</p>
                <ul className="my-4 flex flex-col gap-2 text-sm text-white">
                  {(t.raw("premium.features") as string[]).map((feature) => (
                    <li key={feature} className="flex gap-2">
                      <span className="text-[#C5A059]">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <p className="mb-4 text-xs text-[#A8A8A8]">{t("premium.founderNote")}</p>
                <button
                  type="button"
                  onClick={() => handleChoosePlan("Premium")}
                  disabled={submittingTier !== null || !isWeddingPlanConfigured("Premium")}
                  className="mt-auto rounded-full bg-[#C5A059] px-4 py-3 text-sm font-bold text-black transition-all duration-[var(--duration-fast)] ease-[var(--ease-premium)] motion-reduce:transition-none hover:scale-[1.03] hover:shadow-[0_10px_24px_-10px_rgba(22,19,14,0.35)] disabled:opacity-50"
                >
                  {submittingTier === "Premium" ? t("submitting") : t("premium.cta")}
                </button>
              </div>
            </div>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={onClose}
                className="text-sm text-[#5B6B67] underline transition-colors duration-150 hover:text-[#14211D]"
              >
                {t("freeLink")}
              </button>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 border-t border-[#E2DFD3] pt-4 text-xs text-[#5B6B67]">
              <span>{t("trustGuarantee")}</span>
              <span>{t("trustInstant")}</span>
              <span>{t("trustSsl")}</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
