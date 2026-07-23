import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-[#E2DFD3] px-6 py-8 dark:border-[#2A3532]">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 text-sm text-[#5B6B67] sm:flex-row dark:text-[#9CA9A5]">
        <p>&copy; {new Date().getFullYear()} AppEvents.</p>
        <div className="flex items-center gap-5">
          <Link href="/templates" className="hover:text-[#14211D] dark:hover:text-[#F3F1EA]">
            Templates
          </Link>
          <Link href="/login" className="hover:text-[#14211D] dark:hover:text-[#F3F1EA]">
            Log in
          </Link>
          <Link href="/register" className="hover:text-[#14211D] dark:hover:text-[#F3F1EA]">
            Get started
          </Link>
        </div>
      </div>
    </footer>
  );
}
