"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { authApi } from "@/lib/authApi";

type Status = "confirming" | "success" | "alreadyConfirmed" | "error" | "missingToken";

function ResendForm() {
  const t = useTranslations("auth.verifyEmail");
  const [email, setEmail] = useState("");
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

function VerifyEmailContent() {
  const t = useTranslations("auth.verifyEmail");
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<Status>(token ? "confirming" : "missingToken");

  useEffect(() => {
    if (!token) {
      return;
    }
    authApi
      .confirmEmail(token)
      .then((response) => setStatus(response.alreadyConfirmed ? "alreadyConfirmed" : "success"))
      .catch(() => setStatus("error"));
  }, [token]);

  if (status === "confirming") {
    return <p className="text-[#5B6B67]">{t("confirming")}</p>;
  }

  if (status === "success" || status === "alreadyConfirmed") {
    return (
      <>
        <h1 className="mb-2 font-serif text-2xl text-[#14211D]" style={{ fontWeight: 600 }}>
          {status === "success" ? t("successTitle") : t("alreadyConfirmedTitle")}
        </h1>
        <p className="mb-6 text-[#5B6B67]">
          {status === "success" ? t("successBody") : t("alreadyConfirmedBody")}
        </p>
        <Link
          href="/login"
          className="font-medium text-[#0F766E] underline transition-colors duration-150"
        >
          {t("backToLogin")}
        </Link>
      </>
    );
  }

  return (
    <>
      <h1 className="mb-2 font-serif text-2xl text-[#14211D]" style={{ fontWeight: 600 }}>
        {t("errorTitle")}
      </h1>
      <p className="text-[#5B6B67]">{status === "missingToken" ? t("missingToken") : ""}</p>
      <ResendForm />
    </>
  );
}

export default function VerifyEmailPage() {
  const t = useTranslations("auth.verifyEmail");

  return (
    <div className="flex flex-1 flex-col bg-[#FDFBF7]">
      <SiteHeader />
      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm text-center">
          <Suspense fallback={<p className="text-[#5B6B67]">{t("confirming")}</p>}>
            <VerifyEmailContent />
          </Suspense>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
