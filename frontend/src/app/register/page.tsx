"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth, ApiError } from "@/lib/auth-context";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      await register({ fullName, email, password });
      router.push("/login");
    } catch (err) {
      if (err instanceof ApiError) {
        const fieldErrors = err.problem?.errors
          ? Object.values(err.problem.errors).flat().join(" ")
          : null;
        setError(fieldErrors || err.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col bg-[#FDFBF7] dark:bg-[#0F1714]">
      <SiteHeader />
      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <h1
            className="mb-6 font-serif text-2xl text-[#14211D] dark:text-[#F3F1EA]"
            style={{ fontWeight: 600 }}
          >
            Create your account
          </h1>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label htmlFor="fullName" className="mb-1 block text-sm font-medium text-[#14211D] dark:text-[#F3F1EA]">
                Full name
              </label>
              <input
                id="fullName"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full border border-[#E2DFD3] px-3 py-2 dark:border-[#2A3532] dark:bg-[#1B2422] dark:text-[#F3F1EA]"
              />
            </div>
            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium text-[#14211D] dark:text-[#F3F1EA]">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-[#E2DFD3] px-3 py-2 dark:border-[#2A3532] dark:bg-[#1B2422] dark:text-[#F3F1EA]"
              />
            </div>
            <div>
              <label htmlFor="password" className="mb-1 block text-sm font-medium text-[#14211D] dark:text-[#F3F1EA]">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={10}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-[#E2DFD3] px-3 py-2 dark:border-[#2A3532] dark:bg-[#1B2422] dark:text-[#F3F1EA]"
              />
              <p className="mt-1 text-xs text-[#5B6B67] dark:text-[#9CA9A5]">
                At least 10 characters, with uppercase, lowercase, a digit, and a special character.
              </p>
            </div>
            <div>
              <label htmlFor="confirmPassword" className="mb-1 block text-sm font-medium text-[#14211D] dark:text-[#F3F1EA]">
                Confirm password
              </label>
              <input
                id="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full border border-[#E2DFD3] px-3 py-2 dark:border-[#2A3532] dark:bg-[#1B2422] dark:text-[#F3F1EA]"
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 rounded-full bg-[#0F766E] px-5 py-2 font-medium text-white hover:bg-[#0C5C56] disabled:opacity-50 dark:bg-[#14B8A6] dark:text-[#062420] dark:hover:bg-[#2DD4BF]"
            >
              {isSubmitting ? "Creating account..." : "Create account"}
            </button>
          </form>
          <p className="mt-4 text-sm text-[#5B6B67] dark:text-[#9CA9A5]">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-[#0F766E] underline dark:text-[#14B8A6]">
              Log in
            </Link>
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
