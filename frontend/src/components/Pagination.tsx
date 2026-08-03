"use client";

import { useTranslations } from "next-intl";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const MAX_VISIBLE_PAGES = 5;

// Generic numbered pager (1, 2, 3, ...) — the first paginated list in this app (guest list today),
// kept dependency-free and reusable for future lists (e.g. events) rather than one-off inline markup.
export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const t = useTranslations("pagination");

  if (totalPages <= 1) {
    return null;
  }

  const pages = buildPageWindow(currentPage, totalPages);

  return (
    <nav className="mt-4 flex flex-wrap items-center justify-center gap-1 text-sm" aria-label="Pagination">
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="rounded-full border border-[#E2DFD3] px-3 py-1 text-[#14211D] transition-colors duration-150 hover:bg-[#F5F2EA] disabled:opacity-40"
      >
        {t("previous")}
      </button>

      {pages.map((page, index) =>
        page === null ? (
          <span key={`ellipsis-${index}`} className="px-1 text-[#5B6B67]">
            …
          </span>
        ) : (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            aria-label={t("goToPage", { page })}
            aria-current={page === currentPage ? "page" : undefined}
            className={`min-w-8 rounded-full border px-3 py-1 transition-colors duration-150 ${
              page === currentPage
                ? "border-[#0F766E] bg-[#0F766E] text-white"
                : "border-[#E2DFD3] text-[#14211D] hover:bg-[#F5F2EA]"
            }`}
          >
            {page}
          </button>
        ),
      )}

      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="rounded-full border border-[#E2DFD3] px-3 py-1 text-[#14211D] transition-colors duration-150 hover:bg-[#F5F2EA] disabled:opacity-40"
      >
        {t("next")}
      </button>
    </nav>
  );
}

// Returns page numbers to render, with `null` marking an ellipsis gap — always includes page 1,
// the last page, and up to MAX_VISIBLE_PAGES centered on the current page.
function buildPageWindow(currentPage: number, totalPages: number): (number | null)[] {
  if (totalPages <= MAX_VISIBLE_PAGES + 2) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const half = Math.floor(MAX_VISIBLE_PAGES / 2);
  let start = Math.max(2, currentPage - half);
  let end = Math.min(totalPages - 1, currentPage + half);

  if (currentPage - half < 2) {
    end = Math.min(totalPages - 1, end + (2 - (currentPage - half)));
  }
  if (currentPage + half > totalPages - 1) {
    start = Math.max(2, start - (currentPage + half - (totalPages - 1)));
  }

  const middle: (number | null)[] = [];
  for (let page = start; page <= end; page++) {
    middle.push(page);
  }

  const result: (number | null)[] = [1];
  if (start > 2) {
    result.push(null);
  }
  result.push(...middle);
  if (end < totalPages - 1) {
    result.push(null);
  }
  result.push(totalPages);

  return result;
}
