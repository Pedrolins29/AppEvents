import type { EventType } from "@/types/event";

// Ponto 3 follow-up (Sprint 17): the InstantPreview widget stages only serializable fields here
// so a real account creation can auto-create the matching event. Photos are deliberately excluded
// — File/Blob objects can't survive sessionStorage or the register -> confirm-email -> login
// redirect chain, so they stay a live-preview-only demo (see InstantPreview.tsx).
const DRAFT_KEY = "appevents:instant-preview-draft";

export interface InstantPreviewDraft {
  name: string;
  eventType: EventType;
  eventDate: string;
  address: string;
}

export function stageInstantPreviewDraft(draft: InstantPreviewDraft) {
  try {
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  } catch {
    // Storage can throw in private-browsing/restricted contexts — losing the draft just means
    // the visitor lands on the normal events list after login instead of a pre-filled editor.
  }
}

export function consumeInstantPreviewDraft(): InstantPreviewDraft | null {
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY);
    if (!raw) {
      return null;
    }
    sessionStorage.removeItem(DRAFT_KEY);
    return JSON.parse(raw) as InstantPreviewDraft;
  } catch {
    return null;
  }
}

export function buildDraftSlug(name: string): string {
  const base =
    name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "convite";
  const suffix = Math.random().toString(36).slice(2, 8);
  return `${base}-${suffix}`;
}
