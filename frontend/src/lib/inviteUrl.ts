// Shared by CopyInviteLink.tsx and the auto-copy-on-publish flow in events/[id]/edit/page.tsx —
// one place building the public invitation URL a guest actually opens.
export function buildInviteUrl(slug: string): string {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  return `${origin}/e/${slug}`;
}
