import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 bg-zinc-50 px-6 text-center dark:bg-black">
      <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        AppEvents
      </h1>
      <p className="max-w-md text-zinc-600 dark:text-zinc-400">
        Create beautiful digital invitations for weddings, birthdays, and every celebration in
        minutes.
      </p>
      <div className="flex gap-4">
        <Link
          href="/login"
          className="rounded-full border border-zinc-300 px-5 py-2 font-medium text-zinc-900 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-50 dark:hover:bg-zinc-900"
        >
          Log in
        </Link>
        <Link
          href="/register"
          className="rounded-full bg-zinc-900 px-5 py-2 font-medium text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-200"
        >
          Get started
        </Link>
      </div>
    </div>
  );
}
