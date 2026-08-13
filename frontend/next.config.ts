import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://localhost:5001";
const apiOrigin = new URL(API_BASE_URL).origin;

// Sprint 14: each ad pixel's domains are only added to the CSP when its id is actually
// configured (components/AdPixels.tsx renders no script tag at all otherwise) — an unconfigured
// deployment keeps today's strict baseline unchanged. Domain lists are the standard ones each
// provider documents for its own loader snippet.
const scriptSrcExtra: string[] = [];
const connectSrcExtra: string[] = [];
const imgSrcExtra: string[] = [];

if (process.env.NEXT_PUBLIC_META_PIXEL_ID) {
  scriptSrcExtra.push("connect.facebook.net");
  connectSrcExtra.push("www.facebook.com", "connect.facebook.net");
  imgSrcExtra.push("www.facebook.com");
}

if (process.env.NEXT_PUBLIC_GOOGLE_ADS_ID) {
  scriptSrcExtra.push("www.googletagmanager.com");
  connectSrcExtra.push("www.googletagmanager.com", "www.google-analytics.com", "googleads.g.doubleclick.net");
  imgSrcExtra.push("www.google-analytics.com");
}

if (process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID) {
  scriptSrcExtra.push("analytics.tiktok.com");
  connectSrcExtra.push("analytics.tiktok.com");
}

// Sprint 18: once the backend's Storage:Provider is switched to R2, uploaded images are served
// from a different origin than the API — without this, the browser silently blocks those <img>
// tags under CSP even though the HTML renders fine.
if (process.env.NEXT_PUBLIC_R2_PUBLIC_BASE_URL) {
  imgSrcExtra.push(new URL(process.env.NEXT_PUBLIC_R2_PUBLIC_BASE_URL).origin);
}

// Dev mode's HMR client injects inline scripts that a strict script-src would break, so these
// headers only apply to production builds — the backend already draws the same Dev/Prod line
// for exception detail (see AppEvents.Api's GlobalExceptionHandler).
const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      `img-src 'self' data: ${apiOrigin} ${imgSrcExtra.join(" ")}`.trim(),
      // Theme cards/hero use inline style={{}} attributes for exact per-template colors.
      "style-src 'self' 'unsafe-inline'",
      // Pixel loader snippets are inline <script> tags (components/AdPixels.tsx) — only needed
      // (and only added) once at least one pixel id is configured; 'unsafe-inline' is otherwise
      // absent, matching today's strict baseline.
      `script-src 'self'${scriptSrcExtra.length ? ` ${scriptSrcExtra.join(" ")} 'unsafe-inline'` : ""}`,
      `connect-src 'self'${connectSrcExtra.length ? ` ${connectSrcExtra.join(" ")}` : ""}`,
      "object-src 'none'",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
];

const nextConfig: NextConfig = {
  // Pins the workspace root to this project — without it, Turbopack's auto-detection picks up
  // an unrelated package-lock.json in the user's home directory (a parent of this repo) and
  // warns on every dev-server start.
  turbopack: {
    root: process.cwd(),
  },
  // Image optimization: enable AVIF (better compression) and WebP formats for modern browsers,
  // responsive sizing with lazy loading, and LCP improvements for hero images.
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    if (process.env.NODE_ENV !== "production") {
      return [];
    }
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

export default withNextIntl(nextConfig);
