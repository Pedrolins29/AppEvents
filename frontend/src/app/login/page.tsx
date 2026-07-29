"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth, ApiError } from "@/lib/auth-context";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export default function LoginPage() {
  const t = useTranslations("auth.login");
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login({ email, password });
      router.push("/events");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError(t("genericError"));
      }
    } finally {
      setIsSubmitting(false);
    }
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
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-[#E2DFD3] px-3 py-2"
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 rounded-full bg-[#0F766E] px-5 py-2 font-medium text-white transition-colors duration-150 hover:bg-[#0C5C56] disabled:opacity-50"
            >
              {isSubmitting ? t("submitting") : t("submit")}
            </button>
          </form>
          <p className="mt-4 text-sm text-[#5B6B67]">
            {t("noAccount")}{" "}
            <Link href="/register" className="font-medium text-[#0F766E] underline transition-colors duration-150">
              {t("createOne")}
            </Link>
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
