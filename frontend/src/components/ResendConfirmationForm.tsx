"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { authApi } from "@/lib/authApi";

interface ResendConfirmationFormProps {
  /** Pre-fills the email field when the caller already knows it (e.g. right after register). */
  initialEmail?: string;
}

// Shared by /register (right after signup) and /verify-email (an invalid/expired link) — both
// need the same "resend the confirmation email" action, so the form lives in one place.
export function ResendConfirmationForm({ initialEmail = "" }: ResendConfirmationFormProps) {
  const t = useTranslations("auth.verifyEmail");
  const [email, setEmail] = useState(initialEmail);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await authApi.resendConfirmation(email);
      setSent(true);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (sent) {
    return <p className="mt-4 text-sm text-[#0F766E]">{t("resendSuccess")}</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3">
      <p className="text-sm text-[#5B6B67]">{t("resendPrompt")}</p>
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full border border-[#E2DFD3] px-3 py-2"
      />
      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-full bg-[#0F766E] px-5 py-2 font-medium text-white transition-colors duration-150 hover:bg-[#0C5C56] disabled:opacity-50"
      >
        {t("resendButton")}
      </button>
    </form>
  );
}
