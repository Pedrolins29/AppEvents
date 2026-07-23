import type { NextConfig } from "next";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://localhost:5001";
const apiOrigin = new URL(API_BASE_URL).origin;

// Dev mode's HMR client injects inline scripts that a strict script-src would break, so these
// headers only apply to production builds — the backend already draws the same Dev/Prod line
// for exception detail (see AppEvents.Api's GlobalExceptionHandler).
const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      `img-src 'self' data: ${apiOrigin}`,
      // Theme cards/hero use inline style={{}} attributes for exact per-template colors.
      "style-src 'self' 'unsafe-inline'",
      "script-src 'self'",
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
  async headers() {
    if (process.env.NODE_ENV !== "production") {
      return [];
    }
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
