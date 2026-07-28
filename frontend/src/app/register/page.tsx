"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth, ApiError } from "@/lib/auth-context";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

const PASSWORD_CHECKS: { label: string; test: (value: string) => boolean }[] = [
  { label: "At least 10 characters", test: (v) => v.length >= 10 },
  { label: "One uppercase letter", test: (v) => /[A-Z]/.test(v) },
  { label: "One lowercase letter", test: (v) => /[a-z]/.test(v) },
  { label: "One number", test: (v) => /[0-9]/.test(v) },
  { label: "One special character", test: (v) => /[^A-Za-z0-9]/.test(v) },
];

export default function RegisterPage() {
  const router = useRouter();
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
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={10}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => setPasswordTouched(true)}
                  className="w-full border border-[#E2DFD3] px-3 py-2 pr-16 dark:border-[#2A3532] dark:bg-[#1B2422] dark:text-[#F3F1EA]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-[#5B6B67] transition-colors duration-150 hover:text-[#14211D] dark:text-[#9CA9A5] dark:hover:text-[#F3F1EA]"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              {passwordTouched ? (
                <ul className="mt-2 flex flex-col gap-0.5">
                  {PASSWORD_CHECKS.map(({ label, test }) => {
                    const met = test(password);
                    return (
                      <li
                        key={label}
                        className={`text-xs ${met ? "text-[#0F766E] dark:text-[#14B8A6]" : "text-[#5B6B67] dark:text-[#9CA9A5]"}`}
                      >
                        {met ? "✓" : "○"} {label}
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="mt-1 text-xs text-[#5B6B67] dark:text-[#9CA9A5]">
                  At least 10 characters, with uppercase, lowercase, a digit, and a special character.
                </p>
              )}
            </div>
            <div>
              <label htmlFor="confirmPassword" className="mb-1 block text-sm font-medium text-[#14211D] dark:text-[#F3F1EA]">
                Confirm password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full border border-[#E2DFD3] px-3 py-2 pr-16 dark:border-[#2A3532] dark:bg-[#1B2422] dark:text-[#F3F1EA]"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-[#5B6B67] transition-colors duration-150 hover:text-[#14211D] dark:text-[#9CA9A5] dark:hover:text-[#F3F1EA]"
                >
                  {showConfirmPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 rounded-full bg-[#0F766E] px-5 py-2 font-medium text-white transition-colors duration-150 hover:bg-[#0C5C56] disabled:opacity-50 dark:bg-[#14B8A6] dark:text-[#062420] dark:hover:bg-[#2DD4BF]"
            >
              {isSubmitting ? "Creating account..." : "Create account"}
            </button>
          </form>
          <p className="mt-4 text-sm text-[#5B6B67] dark:text-[#9CA9A5]">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-[#0F766E] underline transition-colors duration-150 dark:text-[#14B8A6]">
              Log in
            </Link>
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
