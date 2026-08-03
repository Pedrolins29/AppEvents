"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { useAuth, ApiError } from "@/lib/auth-context";
import { ResendConfirmationForm } from "@/components/ResendConfirmationForm";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

const PASSWORD_TESTS: ((value: string) => boolean)[] = [
  (v) => v.length >= 10,
  (v) => /[A-Z]/.test(v),
  (v) => /[a-z]/.test(v),
  (v) => /[0-9]/.test(v),
  (v) => /[^A-Za-z0-9]/.test(v),
];

export default function RegisterPage() {
  const t = useTranslations("auth.register");
  const locale = useLocale();
  const { register } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [honeypotField, setHoneypotField] = useState("");
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);

  const passwordChecks = (t.raw("passwordChecks") as { label: string }[]).map(
    ({ label }, i) => ({ label, test: PASSWORD_TESTS[i] }),
  );

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError(t("passwordsMismatch"));
      return;
    }

    setIsSubmitting(true);
    try {
      await register({ fullName, email, password, honeypotField: honeypotField || null, locale });
      window.fbq?.("track", "CompleteRegistration", { status: true });
      window.gtag?.("event", "sign_up");
      window.ttq?.track?.("CompleteRegistration");
      setSubmittedEmail(email);
    } catch (err) {
      if (err instanceof ApiError) {
        const fieldErrors = err.problem?.errors
          ? Object.values(err.problem.errors).flat().join(" ")
          : null;
        setError(fieldErrors || err.message);
      } else {
        setError(t("genericError"));
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  if (submittedEmail) {
    return (
      <div className="flex flex-1 flex-col bg-[#FDFBF7]">
        <SiteHeader />
        <main className="flex flex-1 items-center justify-center px-6 py-16">
          <div className="w-full max-w-sm text-center">
            <h1 className="mb-2 font-serif text-2xl text-[#14211D]" style={{ fontWeight: 600 }}>
              {t("checkEmailTitle")}
            </h1>
            <p className="text-[#5B6B67]">{t("checkEmailBody", { email: submittedEmail })}</p>
            <ResendConfirmationForm initialEmail={submittedEmail} />
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col bg-[#FDFBF7]">
      <SiteHeader />
      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <h1
            className="mb-6 font-serif text-2xl text-[#14211D]"
            style={{ fontWeight: 600 }}
          >
            {t("title")}
          </h1>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Honeypot: hidden from every real visitor (visually and from assistive tech), left
                empty by humans, often auto-filled by bots - a non-empty value fails validation. */}
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
            <div>
              <label htmlFor="fullName" className="mb-1 block text-sm font-medium text-[#14211D]">
                {t("fullName")}
              </label>
              <input
                id="fullName"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full border border-[#E2DFD3] px-3 py-2"
              />
            </div>
            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium text-[#14211D]">
                {t("email")}
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-[#E2DFD3] px-3 py-2"
              />
            </div>
            <div>
              <label htmlFor="password" className="mb-1 block text-sm font-medium text-[#14211D]">
                {t("password")}
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={10}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => setPasswordTouched(true)}
                  className="w-full border border-[#E2DFD3] px-3 py-2 pr-16"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-[#5B6B67] transition-colors duration-150 hover:text-[#14211D]"
                >
                  {showPassword ? t("hide") : t("show")}
                </button>
              </div>
              {passwordTouched ? (
                <ul className="mt-2 flex flex-col gap-0.5">
                  {passwordChecks.map(({ label, test }) => {
                    const met = test(password);
                    return (
                      <li
                        key={label}
                        className={`text-xs ${met ? "text-[#0F766E]" : "text-[#5B6B67]"}`}
                      >
                        {met ? "✓" : "○"} {label}
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="mt-1 text-xs text-[#5B6B67]">{t("passwordHint")}</p>
              )}
            </div>
            <div>
              <label htmlFor="confirmPassword" className="mb-1 block text-sm font-medium text-[#14211D]">
                {t("confirmPassword")}
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full border border-[#E2DFD3] px-3 py-2 pr-16"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-[#5B6B67] transition-colors duration-150 hover:text-[#14211D]"
                >
                  {showConfirmPassword ? t("hide") : t("show")}
                </button>
              </div>
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 rounded-full bg-[#0F766E] px-5 py-2 font-medium text-white transition-colors duration-150 hover:bg-[#0C5C56] disabled:opacity-50"
            >
              {isSubmitting ? t("creatingAccount") : t("createAccount")}
            </button>
          </form>
          <p className="mt-4 text-sm text-[#5B6B67]">
            {t("haveAccount")}{" "}
            <Link href="/login" className="font-medium text-[#0F766E] underline transition-colors duration-150">
              {t("logIn")}
            </Link>
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
