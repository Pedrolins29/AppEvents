"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [isLoading, user, router]);

  async function handleLogout() {
    await logout();
    router.push("/login");
  }

  if (isLoading || !user) {
    return (
      <div className="flex flex-1 items-center justify-center bg-zinc-50 dark:bg-black">
        <p className="text-zinc-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 bg-zinc-50 px-6 text-center dark:bg-black">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        Welcome, {user.fullName}
      </h1>
      <p className="text-zinc-600 dark:text-zinc-400">{user.email}</p>
      <button
        onClick={handleLogout}
        className="mt-4 rounded-full border border-zinc-300 px-5 py-2 font-medium text-zinc-900 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-50 dark:hover:bg-zinc-900"
      >
        Log out
      </button>
    </div>
  );
}
