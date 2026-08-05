"use client";

import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { InvitationPhoneMockupView, type MockupLabels } from "@/components/InvitationPhoneMockupView";
import { SoftGateModal } from "@/components/SoftGateModal";
import { TemplateCard } from "@/components/TemplateCard";
import { hasWeddingPlansConfigured } from "@/lib/checkoutUrls";
import { formatEventDate } from "@/lib/formatEventDate";
import { stageInstantPreviewDraft } from "@/lib/instantPreviewDraft";
import { mapsLinks } from "@/lib/mapsLinks";
import { EVENT_TYPES, getEventTypeLabels, type EventType } from "@/types/event";
import type { ThemeKey } from "@/types/template";

interface InstantPreviewProps {
  /** Pre-locks the type selector when embedded on a /criar-convite/[categoria] page. */
  defaultEventType?: EventType;
}

interface StagedPhoto {
  file: File;
  previewUrl: string;
}

const THEME_KEYS: ThemeKey[] = ["elegant", "minimalist", "floral", "modern"];
const MAX_PHOTOS = 3;

// Sprint 17, Piece B: a deliberately small "type your name, see it live" widget — NOT a
// save/resume editor. No backend calls, no draft entities while just previewing. Address +
// photos are staged in memory only (see Ponto 3 follow-up); photos never leave the browser tab —
// only the serializable fields (name/type/theme/date/address) are staged to sessionStorage so a
// real account creation can claim them. Cheap enough to ship and measure before ever justifying a
// bigger sandbox-editor rebuild (see Sprints/sprint17.md for the reconciliation this replaced).
export function InstantPreview({ defaultEventType }: InstantPreviewProps) {
  const locale = useLocale();
  const t = useTranslations("criarConvite.instantPreview");
  const countdownT = useTranslations("countdown");
  const invitationT = useTranslations("invitation");
  const themeNameT = useTranslations("templateThemeNames");
  const eventTypeLabels = getEventTypeLabels(useTranslations("eventTypes"));

  const [name, setName] = useState("");
  const [eventType, setEventType] = useState<EventType>(defaultEventType ?? "Wedding");
  const [theme, setTheme] = useState<ThemeKey>("elegant");
  const [eventDate, setEventDate] = useState("");
  const [address, setAddress] = useState("");
  const [photos, setPhotos] = useState<StagedPhoto[]>([]);
  const [hasFiredLead, setHasFiredLead] = useState(false);
  const [showPlansModal, setShowPlansModal] = useState(false);
  const photosRef = useRef<StagedPhoto[]>([]);

  // Sprint 23: the soft-gate/plan modal only exists for Wedding drafts, and only once a real
  // checkout link is configured for at least one tier (see checkoutUrls.ts) — every other event
  // type, and Wedding itself before any Lastlink link is set up, keeps today's plain-register CTA.
  const showWeddingPlansGate = eventType === "Wedding" && hasWeddingPlansConfigured();

  useEffect(() => {
    photosRef.current = photos;
  }, [photos]);

  useEffect(() => {
    return () => {
      photosRef.current.forEach((photo) => URL.revokeObjectURL(photo.previewUrl));
    };
  }, []);

  function handlePhotosSelected(files: FileList | null) {
    if (!files || files.length === 0) {
      return;
    }
    photos.forEach((photo) => URL.revokeObjectURL(photo.previewUrl));
    const nextPhotos = Array.from(files)
      .slice(0, MAX_PHOTOS)
      .map((file) => ({ file, previewUrl: URL.createObjectURL(file) }));
    setPhotos(nextPhotos);
  }

  const labels: MockupLabels = {
    days: countdownT("days"),
    hrs: countdownT("hours"),
    min: countdownT("min"),
    sec: countdownT("sec"),
    dressCode: invitationT("dressCode"),
    rsvpHeading: invitationT("rsvp.heading"),
    attending: invitationT("rsvp.attending"),
    notAttending: invitationT("rsvp.notAttending"),
  };

  function maybeFireLead(nextName: string, nextDate: string) {
    if (hasFiredLead || !nextName.trim() || !nextDate) {
      return;
    }
    setHasFiredLead(true);
    window.fbq?.("track", "Lead");
    window.gtag?.("event", "generate_lead");
    window.ttq?.track?.("Lead");
  }

  function handleCreateClick() {
    stageInstantPreviewDraft({ name, eventType, eventDate, address });
    window.fbq?.("track", "CompleteRegistration", { status: false });
    window.gtag?.("event", "sign_up_started");
    window.ttq?.track?.("ClickButton");
  }

  return (
    <>
    <div className="mx-auto grid max-w-4xl gap-8 sm:grid-cols-[1fr_auto] sm:items-center">
      <div className="flex flex-col gap-4">
        <div>
          <label htmlFor="instant-preview-name" className="mb-1 block text-sm text-[var(--muted-foreground)]">
            {t("nameLabel")}
          </label>
          <input
            id="instant-preview-name"
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              maybeFireLead(e.target.value, eventDate);
            }}
            placeholder={t("namePlaceholder")}
            className="w-full border border-[var(--border)] bg-white px-3 py-2 text-sm text-[var(--ink)]"
          />
        </div>

        <div>
          <label htmlFor="instant-preview-date" className="mb-1 block text-sm text-[var(--muted-foreground)]">
            {t("dateLabel")}
          </label>
          <input
            id="instant-preview-date"
            type="date"
            value={eventDate}
            onChange={(e) => {
              setEventDate(e.target.value);
              maybeFireLead(name, e.target.value);
            }}
            className="w-full border border-[var(--border)] bg-white px-3 py-2 text-sm text-[var(--ink)]"
          />
        </div>

        <div>
          <label htmlFor="instant-preview-address" className="mb-1 block text-sm text-[var(--muted-foreground)]">
            {t("addressLabel")}
          </label>
          <input
            id="instant-preview-address"
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder={t("addressPlaceholder")}
            className="w-full border border-[var(--border)] bg-white px-3 py-2 text-sm text-[var(--ink)]"
          />
          {address.trim() && (
            <div className="mt-2 flex gap-3 text-xs">
              <a
                href={mapsLinks(address).googleMaps}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--pinewood)] underline-offset-4 hover:underline"
              >
                {t("openGoogleMaps")}
              </a>
              <a
                href={mapsLinks(address).waze}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--pinewood)] underline-offset-4 hover:underline"
              >
                {t("openWaze")}
              </a>
            </div>
          )}
        </div>

        {!defaultEventType && (
          <div>
            <label htmlFor="instant-preview-type" className="mb-1 block text-sm text-[var(--muted-foreground)]">
              {t("eventTypeLabel")}
            </label>
            <select
              id="instant-preview-type"
              value={eventType}
              onChange={(e) => setEventType(e.target.value as EventType)}
              className="w-full border border-[var(--border)] bg-white px-3 py-2 text-sm text-[var(--ink)]"
            >
              {EVENT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {eventTypeLabels[type]}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <p className="mb-1 text-sm text-[var(--muted-foreground)]">{t("themeLabel")}</p>
          <div className="grid grid-cols-4 gap-2">
            {THEME_KEYS.map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setTheme(key)}
                aria-pressed={theme === key}
                className="overflow-hidden rounded-sm transition-opacity duration-150"
                style={{
                  outline: theme === key ? "2px solid var(--pinewood)" : "1px solid transparent",
                  outlineOffset: 2,
                  opacity: theme === key ? 1 : 0.6,
                }}
              >
                <TemplateCard theme={key} name={themeNameT(key)} />
              </button>
            ))}
          </div>
        </div>

        <div>
          <label
            htmlFor="instant-preview-photos"
            className="mb-1 block text-sm text-[var(--muted-foreground)]"
          >
            {t("photosLabel")}
          </label>
          <label
            htmlFor="instant-preview-photos"
            className="flex min-h-[64px] w-full cursor-pointer flex-col items-center justify-center gap-1 rounded-sm border border-dashed border-[var(--border)] px-4 py-4 text-center transition-colors duration-150 hover:border-[var(--gold)]"
          >
            <input
              id="instant-preview-photos"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={(e) => handlePhotosSelected(e.target.files)}
              className="sr-only"
            />
            <span className="text-sm font-medium text-[var(--pinewood)]">+</span>
            <span className="text-xs text-[var(--muted-foreground)]">{t("photosHint")}</span>
          </label>
          {photos.length > 0 && (
            <div className="mt-2 flex gap-2">
              {photos.map((photo, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={i}
                  src={photo.previewUrl}
                  alt=""
                  className="h-14 w-14 rounded-sm border border-[var(--border)] object-cover"
                />
              ))}
            </div>
          )}
        </div>

        {showWeddingPlansGate ? (
          <button
            type="button"
            onClick={() => {
              handleCreateClick();
              setShowPlansModal(true);
            }}
            className="mt-2 inline-block rounded-full bg-[var(--gold)] px-6 py-3 text-center text-sm font-semibold text-[var(--ink)] transition-colors duration-150 hover:bg-[#C6A05E]"
          >
            {t("ctaCreate")}
          </button>
        ) : (
          <a
            href="/register"
            onClick={handleCreateClick}
            className="mt-2 inline-block rounded-full bg-[var(--gold)] px-6 py-3 text-center text-sm font-semibold text-[var(--ink)] transition-colors duration-150 hover:bg-[#C6A05E]"
          >
            {t("ctaCreate")}
          </a>
        )}
        <p className="text-xs text-[var(--muted-foreground)]">{t("disclaimer")}</p>
      </div>

      <InvitationPhoneMockupView
        theme={theme}
        eventTypeLabel={eventTypeLabels[eventType]}
        name={name || t("namePlaceholder")}
        dateLabel={eventDate ? formatEventDate(eventDate, locale) : t("datePlaceholder")}
        screens={address.trim() ? ["countdown", "map"] : ["countdown"]}
        address={address.trim() || undefined}
        photoUrl={photos[0]?.previewUrl}
        labels={labels}
      />
    </div>
    {showWeddingPlansGate && (
      <SoftGateModal isOpen={showPlansModal} onClose={() => setShowPlansModal(false)} />
    )}
    </>
  );
}
