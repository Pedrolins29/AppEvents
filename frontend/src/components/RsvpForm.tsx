"use client";

import { useState } from "react";
import type { ThemeStyle } from "@/components/InvitationHero";
import { rsvpApi } from "@/lib/rsvpApi";
import type { RsvpStatus } from "@/types/rsvp";

interface RsvpFormProps {
  slug: string;
  theme: ThemeStyle;
}

export function RsvpForm({ slug, theme }: RsvpFormProps) {
  const [guestName, setGuestName] = useState("");
  const [status, setStatus] = useState<RsvpStatus>("Confirmed");
  const [honeypotField, setHoneypotField] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await rsvpApi.submit(slug, { guestName, status, honeypotField: honeypotField || null });
      setSubmitted(true);
    } catch {
      setError("Could not submit your RSVP. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="text-center">
        <p className={theme.fontClassName} style={{ color: theme.heading, fontStyle: theme.fontStyle, fontSize: "1.5rem" }}>
          Thanks for your RSVP, {guestName}.
        </p>
        <p className="mt-2 text-sm" style={{ color: theme.body }}>
          {status === "Confirmed" ? "We can't wait to see you there." : "We'll miss you — thanks for letting us know."}
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
        name="website"
        value={honeypotField}
        onChange={(e) => setHoneypotField(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }}
      />

      <div>
        <label htmlFor="rsvp-name" className="mb-1 block text-sm" style={{ color: theme.body }}>
          Your name
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

      <div className="flex justify-center gap-3">
        <button
          type="button"
          onClick={() => setStatus("Confirmed")}
          className="rounded-full border px-5 py-2 text-sm font-medium"
          style={
            status === "Confirmed"
              ? { background: theme.accent, borderColor: theme.accent, color: theme.pageBg }
              : { borderColor: theme.accent, color: theme.heading }
          }
        >
          I&apos;ll be there
        </button>
        <button
          type="button"
          onClick={() => setStatus("Declined")}
          className="rounded-full border px-5 py-2 text-sm font-medium"
          style={
            status === "Declined"
              ? { background: theme.accent, borderColor: theme.accent, color: theme.pageBg }
              : { borderColor: theme.accent, color: theme.heading }
          }
        >
          Can&apos;t make it
        </button>
      </div>

      {error && <p className="text-center text-sm text-red-500">{error}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-full px-6 py-2 text-sm font-medium disabled:opacity-50"
        style={{ background: theme.accent, color: theme.pageBg }}
      >
        {isSubmitting ? "Sending..." : "Send RSVP"}
      </button>
    </form>
  );
}
