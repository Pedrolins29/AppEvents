// Ambient globals the ad-pixel loader scripts (components/AdPixels.tsx) attach to window when
// configured — declared here so components/UpsellBanner.tsx can fire tracking events without
// `any`. Each is optional: unconfigured pixels never load their script, so the function is
// simply undefined at call time (guarded with `?.` at every call site).
export {};

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    gtag?: (...args: unknown[]) => void;
    ttq?: { track?: (...args: unknown[]) => void };
  }
}
