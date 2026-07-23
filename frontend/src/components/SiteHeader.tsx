import Link from "next/link";

function DiamondMark() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden className="text-[#A16207]">
      <path d="M5 0L10 5L5 10L0 5Z" fill="currentColor" />
    </svg>
  );
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-10 border-b border-[#E2DFD3] bg-[#FDFBF7]/90 backdrop-blur dark:border-[#2A3532] dark:bg-[#0F1714]/90">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <DiamondMark />
          <span className="text-sm font-semibold tracking-wide text-[#14211D] dark:text-[#F3F1EA]">
            AppEvents
          </span>
        </Link>
        <nav className="flex items-center gap-6">
          <Link
            href="/templates"
            className="hidden text-sm text-[#5B6B67] hover:text-[#14211D] sm:inline dark:text-[#9CA9A5] dark:hover:text-[#F3F1EA]"
          >
            Templates
          </Link>
          <Link
            href="/login"
            className="text-sm text-[#5B6B67] hover:text-[#14211D] dark:text-[#9CA9A5] dark:hover:text-[#F3F1EA]"
          >
            Log in
          </Link>
          <Link
            href="/register"
            className="rounded-full bg-[#0F766E] px-4 py-2 text-sm font-medium text-white hover:bg-[#0C5C56] dark:bg-[#14B8A6] dark:text-[#062420] dark:hover:bg-[#2DD4BF]"
          >
            Get started
          </Link>
        </nav>
      </div>
    </header>
  );
}
