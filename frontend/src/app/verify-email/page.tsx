"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { ResendConfirmationForm } from "@/components/ResendConfirmationForm";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { useAuth } from "@/lib/auth-context";
import { authApi } from "@/lib/authApi";

type Status = "confirming" | "redirecting" | "alreadyConfirmed" | "error" | "missingToken";

function VerifyEmailContent() {
  const t = useTranslations("auth.verifyEmail");
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const { applyConfirmedSession } = useAuth();
  const [status, setStatus] = useState<Status>(token ? "confirming" : "missingToken");
  const hasRun = useRef(false);

  useEffect(() => {
    if (!token || hasRun.current) {
      return;
    }
    hasRun.current = true;
    authApi
      .confirmEmail(token)
      .then(async (response) => {
        if (response.alreadyConfirmed) {
          setStatus("alreadyConfirmed");
          return;
        }
        if (response.accessToken && response.user) {
          // A fresh confirmation also issues a session — skip the "now log in" hop entirely.
          setStatus("redirecting");
          const { claimedEventId } = await applyConfirmedSession(response.accessToken, response.user);
          router.replace(claimedEventId ? `/events/${claimedEventId}/edit` : "/events");
          return;
        }
        setStatus("alreadyConfirmed");
      })
      .catch(() => setStatus("error"));
  }, [token, applyConfirmedSession, router]);

  if (status === "confirming" || status === "redirecting") {
    return <p className="text-[#5B6B67]">{t("confirming")}</p>;
  }

  if (status === "alreadyConfirmed") {
    return (
      <>
        <h1 className="mb-2 font-serif text-2xl text-[#14211D]" style={{ fontWeight: 600 }}>
          {t("alreadyConfirmedTitle")}
        </h1>
        <p className="mb-6 text-[#5B6B67]">{t("alreadyConfirmedBody")}</p>
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
      <ResendConfirmationForm />
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
