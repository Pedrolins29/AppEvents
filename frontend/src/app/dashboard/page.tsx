"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/Skeleton";
import { useAuth } from "@/lib/auth-context";

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [isLoading, user, router]);

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await logout();
      router.push("/login");
    } finally {
      setIsLoggingOut(false);
    }
  }

  if (isLoading || !user) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 bg-[#FDFBF7] px-6 dark:bg-[#0F1714]">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-5 w-40" />
        <Skeleton className="mt-4 h-10 w-40 rounded-full" />
        <Skeleton className="h-10 w-40 rounded-full" />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 bg-[#FDFBF7] px-6 text-center dark:bg-[#0F1714]">
      <h1
        className="font-serif text-2xl text-[#14211D] dark:text-[#F3F1EA]"
        style={{ fontWeight: 600 }}
      >
        Welcome, {user.fullName}
      </h1>
      <p className="text-[#5B6B67] dark:text-[#9CA9A5]">{user.email}</p>
      <Link
        href="/events"
        className="mt-4 rounded-full bg-[#0F766E] px-5 py-2 font-medium text-white transition-colors duration-150 hover:bg-[#0C5C56] dark:bg-[#14B8A6] dark:text-[#062420] dark:hover:bg-[#2DD4BF]"
      >
        Manage events
      </Link>
      <Link
        href="/templates"
        className="rounded-full border border-[#E2DFD3] px-5 py-2 font-medium text-[#14211D] transition-colors duration-150 hover:bg-[#0F766E]/5 dark:border-[#2A3532] dark:text-[#F3F1EA] dark:hover:bg-[#1B2422]"
      >
        Browse templates
      </Link>
      <button
        onClick={handleLogout}
        disabled={isLoggingOut}
        className="rounded-full border border-[#E2DFD3] px-5 py-2 font-medium text-[#14211D] transition-colors duration-150 hover:bg-[#0F766E]/5 disabled:opacity-50 dark:border-[#2A3532] dark:text-[#F3F1EA] dark:hover:bg-[#1B2422]"
      >
        {isLoggingOut ? "Logging out..." : "Log out"}
      </button>
    </div>
  );
}
