import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SUPPORTED_LOCALES = ["pt", "en", "es"] as const;
const DEFAULT_LOCALE = "pt";
const COOKIE_NAME = "NEXT_LOCALE";

function resolveFromAcceptLanguage(header: string | null): string {
  if (!header) return DEFAULT_LOCALE;

  const preferred = header
    .split(",")
    .map((part) => {
      const [tag, qPart] = part.trim().split(";q=");
      return { tag: tag.split("-")[0].toLowerCase(), q: qPart ? parseFloat(qPart) : 1 };
    })
    .sort((a, b) => b.q - a.q);

  for (const { tag } of preferred) {
    if ((SUPPORTED_LOCALES as readonly string[]).includes(tag)) return tag;
  }
  return DEFAULT_LOCALE;
}

export function proxy(request: NextRequest) {
  const existing = request.cookies.get(COOKIE_NAME)?.value;
  if (existing && (SUPPORTED_LOCALES as readonly string[]).includes(existing)) {
    return NextResponse.next();
  }

  const locale = resolveFromAcceptLanguage(request.headers.get("accept-language"));
  const response = NextResponse.next();
  response.cookies.set(COOKIE_NAME, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon|opengraph-image|.*\\.(?:png|jpg|jpeg|svg|webp|ico)$).*)",
  ],
};
