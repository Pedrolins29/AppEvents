import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Browse Templates",
  description:
    "Four hand-designed invitation themes — Elegant, Minimalist, Floral, and Modern. Pick one and make it yours.",
};

export default function TemplatesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
