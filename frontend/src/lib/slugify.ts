// Pure name -> slug transform, shared by the live auto-fill in EventForm.tsx and
// instantPreviewDraft.ts's buildDraftSlug (which appends a random suffix on top of this for
// pre-auth uniqueness). Kept dependency-free — no accent-stripping library needed for this.
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}
