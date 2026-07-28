"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";

function DiamondMark() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden className="text-[#A16207]">
      <path d="M5 0L10 5L5 10L0 5Z" fill="currentColor" />
    </svg>
  );
}

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden fill="none">
      {open ? (
        <path
          d="M5 5L15 15M15 5L5 15"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      ) : (
        <>
          <path d="M3 6H17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M3 10H17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M3 14H17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}

// The authenticated equivalent of SiteHeader.tsx — only mounted on already auth-gated pages, so
// it assumes `user` is present (no internal loading/redirect logic of its own).
export function AppHeader() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await logout();
      router.push("/login");
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <header className="sticky top-0 z-10 border-b border-[#E2DFD3] bg-[#FDFBF7]/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link
          href="/events"
          className="flex items-center gap-2 transition-colors duration-150"
          onClick={() => setIsMenuOpen(false)}
        >
          <DiamondMark />
          <span className="text-sm font-semibold tracking-wide text-[#14211D]">AppEvents</span>
        </Link>

        <nav className="hidden items-center gap-6 sm:flex">
          <Link
            href="/templates"
            className="text-sm text-[#5B6B67] transition-colors duration-150 hover:text-[#14211D]"
          >
            Templates
          </Link>
          {user && <span className="text-sm text-[#5B6B67]">{user.fullName}</span>}
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="rounded-full border border-[#E2DFD3] px-4 py-2 text-sm font-medium text-[#14211D] transition-colors duration-150 hover:bg-[#0F766E]/5 disabled:opacity-50"
          >
            {isLoggingOut ? "Logging out..." : "Log out"}
          </button>
        </nav>

        <button
          type="button"
          onClick={() => setIsMenuOpen((open) => !open)}
          aria-expanded={isMenuOpen}
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          className="flex items-center justify-center rounded-md p-2 text-[#14211D] transition-colors duration-150 hover:text-[#0F766E] sm:hidden"
        >
          <MenuIcon open={isMenuOpen} />
        </button>
      </div>

      <div
        className={`origin-top overflow-hidden border-t border-[#E2DFD3] bg-[#FDFBF7] transition-all duration-150 sm:hidden ${
          isMenuOpen ? "max-h-96 scale-y-100 opacity-100" : "max-h-0 scale-y-95 opacity-0"
        }`}
      >
        <nav className="flex flex-col gap-1 px-6 py-4">
          {user && <p className="px-2 py-2 text-sm text-[#5B6B67]">{user.fullName}</p>}
          <Link
            href="/templates"
            onClick={() => setIsMenuOpen(false)}
            className="rounded-md px-2 py-2 text-sm text-[#5B6B67] transition-colors duration-150 hover:bg-[#0F766E]/5 hover:text-[#14211D]"
          >
            Templates
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="mt-2 rounded-full border border-[#E2DFD3] px-4 py-2 text-center text-sm font-medium text-[#14211D] transition-colors duration-150 hover:bg-[#0F766E]/5 disabled:opacity-50"
          >
            {isLoggingOut ? "Logging out..." : "Log out"}
          </button>
        </nav>
      </div>
    </header>
  );
}
