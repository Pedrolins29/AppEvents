"use client";

import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import type { ThemeStyle } from "@/components/InvitationHero";
import { publicEventsApi } from "@/lib/publicEventsApi";
import { rsvpApi } from "@/lib/rsvpApi";
import type { RsvpStatus } from "@/types/rsvp";

interface RsvpFormProps {
  slug: string;
  theme: ThemeStyle;
  /** Preview-page use only: skips the real network call, going straight to the success state. */
  demoMode?: boolean;
  /** Set when the guest opened their personal link (?g=token) — this component fetches that
   *  guest's own details client-side (the surrounding page is ISR-cached and guest-agnostic, so
   *  this can't be baked into the server-rendered HTML) to prefill the form and tie the
   *  submission to them. An unknown/expired token quietly falls back to the open form. */
  inviteToken?: string;
}

export function RsvpForm({ slug, theme, demoMode = false, inviteToken }: RsvpFormProps) {
  const t = useTranslations("invitation.rsvp");
  const locale = useLocale();
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [status, setStatus] = useState<RsvpStatus>("Confirmed");
  const [honeypotField, setHoneypotField] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!inviteToken) {
      return;
    }
    let cancelled = false;
    publicEventsApi.getGuestPrefill(slug, inviteToken).then((prefill) => {
      if (cancelled || !prefill) {
        return;
      }
      // Only fill fields still at their empty default, so a fast typist's input during the
      // round-trip is never clobbered.
      setGuestName((current) => current || prefill.guestName);
      setGuestEmail((current) => current || prefill.guestEmail || "");
      setGuestPhone((current) => current || prefill.guestPhone || "");
    });
    return () => {
      cancelled = true;
    };
  }, [slug, inviteToken]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      if (!demoMode) {
        await rsvpApi.submit(slug, {
          guestName,
          guestEmail,
          guestPhone: guestPhone || null,
          status,
          honeypotField: honeypotField || null,
          inviteToken: inviteToken || null,
          locale,
        });
      }
      setSubmitted(true);
    } catch {
      setError(t("submitError"));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="text-center">
        <p className={theme.fontClassName} style={{ color: theme.heading, fontStyle: theme.fontStyle, fontSize: "1.5rem" }}>
          {t("thanksMessage", { name: guestName })}
        </p>
        <p className="mt-2 text-sm" style={{ color: theme.body }}>
          {status === "Confirmed" ? t("confirmedMessage") : t("declinedMessage")}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto flex max-w-sm flex-col gap-4">
      {/* Honeypot: hidden from every real visitor (visually and from assistive tech), left
          empty by humans, often auto-filled by bots - a non-empty value fails validation. */}
      <input
        type="text"
        name="hp_confirm_token"
        value={honeypotField}
        onChange={(e) => setHoneypotField(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }}
      />

      <div>
        <label htmlFor="rsvp-name" className="mb-1 block text-sm" style={{ color: theme.body }}>
          {t("yourName")}
        </label>
        <input
          id="rsvp-name"
          type="text"
          required
          value={guestName}
          onChange={(e) => setGuestName(e.target.value)}
          className="w-full border bg-transparent px-3 py-2 text-sm"
          style={{ borderColor: theme.accent, color: theme.heading }}
        />
      </div>

      <div>
        <label htmlFor="rsvp-email" className="mb-1 block text-sm" style={{ color: theme.body }}>
          {t("yourEmail")}
        </label>
        <input
          id="rsvp-email"
          type="email"
          required
          value={guestEmail}
          onChange={(e) => setGuestEmail(e.target.value)}
          className="w-full border bg-transparent px-3 py-2 text-sm"
          style={{ borderColor: theme.accent, color: theme.heading }}
        />
        <p className="mt-1 text-xs" style={{ color: theme.body }}>
          {t("emailHint")}
        </p>
      </div>

      <div>
        <label htmlFor="rsvp-phone" className="mb-1 block text-sm" style={{ color: theme.body }}>
          {t("phone")}
        </label>
        <input
          id="rsvp-phone"
          type="tel"
          value={guestPhone}
          onChange={(e) => setGuestPhone(e.target.value)}
          className="w-full border bg-transparent px-3 py-2 text-sm"
          style={{ borderColor: theme.accent, color: theme.heading }}
        />
      </div>

      <div className="flex justify-center gap-3">
        <button
          type="button"
          onClick={() => setStatus("Confirmed")}
          className="rounded-full border px-5 py-2 text-sm font-medium transition-all duration-[var(--duration-fast)] ease-[var(--ease-premium)] motion-reduce:transition-none hover:scale-[1.03] hover:brightness-105 hover:shadow-[0_10px_24px_-10px_rgba(22,19,14,0.35)]"
          style={
            status === "Confirmed"
              ? { background: theme.accent, borderColor: theme.accent, color: theme.pageBg }
              : { borderColor: theme.accent, color: theme.heading }
          }
        >
          {t("attending")}
        </button>
        <button
          type="button"
          onClick={() => setStatus("Declined")}
          className="rounded-full border px-5 py-2 text-sm font-medium transition-all duration-[var(--duration-fast)] ease-[var(--ease-premium)] motion-reduce:transition-none hover:scale-[1.03] hover:brightness-105 hover:shadow-[0_10px_24px_-10px_rgba(22,19,14,0.35)]"
          style={
            status === "Declined"
              ? { background: theme.accent, borderColor: theme.accent, color: theme.pageBg }
              : { borderColor: theme.accent, color: theme.heading }
          }
        >
          {t("notAttending")}
        </button>
      </div>

      {error && <p className="text-center text-sm text-red-500">{error}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-full px-6 py-2 text-sm font-medium transition-all duration-[var(--duration-fast)] ease-[var(--ease-premium)] motion-reduce:transition-none hover:scale-[1.03] hover:brightness-105 hover:shadow-[0_10px_24px_-10px_rgba(22,19,14,0.35)] disabled:opacity-50"
        style={{ background: theme.accent, color: theme.pageBg }}
      >
        {isSubmitting ? t("sending") : t("send")}
      </button>
    </form>
  );
}
