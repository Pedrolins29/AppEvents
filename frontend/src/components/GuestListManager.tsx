"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { guestsApi } from "@/lib/guestsApi";
import { buildWhatsappLink } from "@/lib/whatsappLink";
import { getRsvpStatusLabels, type RsvpStatus } from "@/types/rsvp";
import type { AttendanceSummary, GuestRecord } from "@/types/guest";

interface GuestListManagerProps {
  eventId: string;
  slug: string;
  eventName: string;
}

const STATUS_COLOR: Record<RsvpStatus, string> = {
  Pending: "#B08D4C",
  Confirmed: "#0F766E",
  Declined: "#8A8578",
};

export function GuestListManager({ eventId, slug, eventName }: GuestListManagerProps) {
  const t = useTranslations("guests");
  const statusLabels = getRsvpStatusLabels(useTranslations("rsvpStatus"));

  const [summary, setSummary] = useState<AttendanceSummary | null>(null);
  const [guests, setGuests] = useState<GuestRecord[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [remindingId, setRemindingId] = useState<string | null>(null);
  const [remindedId, setRemindedId] = useState<string | null>(null);

  useEffect(() => {
    guestsApi
      .list(eventId)
      .then((response) => {
        setSummary(response.summary);
        setGuests(response.guests);
      })
      .catch(() => setSummary({ total: 0, pending: 0, confirmed: 0, declined: 0 }));
  }, [eventId]);

  function personalLink(token: string): string {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    return `${origin}/e/${slug}?g=${encodeURIComponent(token)}`;
  }

  function refreshSummary(list: GuestRecord[]) {
    setSummary({
      total: list.length,
      pending: list.filter((g) => g.status === "Pending").length,
      confirmed: list.filter((g) => g.status === "Confirmed").length,
      declined: list.filter((g) => g.status === "Declined").length,
    });
  }

  async function handleAdd(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setIsAdding(true);
    try {
      const guest = await guestsApi.add(eventId, {
        guestName: name.trim(),
        guestPhone: phone.trim() || null,
        guestEmail: email.trim() || null,
      });
      const next = [guest, ...guests];
      setGuests(next);
      refreshSummary(next);
      setName("");
      setPhone("");
      setEmail("");
    } catch {
      setError(t("addError"));
    } finally {
      setIsAdding(false);
    }
  }

  async function handleCopyLink(token: string, id: string) {
    try {
      await navigator.clipboard.writeText(personalLink(token));
      setCopiedId(id);
      setTimeout(() => setCopiedId((current) => (current === id ? null : current)), 2000);
    } catch {
      /* clipboard unavailable — no-op */
    }
  }

  async function handleRemind(guest: GuestRecord) {
    setError(null);
    setRemindingId(guest.id);
    try {
      const updated = await guestsApi.remindEmail(eventId, guest.id);
      const next = guests.map((g) => (g.id === guest.id ? updated : g));
      setGuests(next);
      setRemindedId(guest.id);
      setTimeout(() => setRemindedId((current) => (current === guest.id ? null : current)), 2000);
    } catch {
      setError(t("reminderError"));
    } finally {
      setRemindingId(null);
    }
  }

  async function handleRemove(id: string) {
    if (!confirm(t("removeConfirm"))) {
      return;
    }
    setError(null);
    try {
      await guestsApi.remove(eventId, id);
      const next = guests.filter((g) => g.id !== id);
      setGuests(next);
      refreshSummary(next);
    } catch {
      setError(t("reminderError"));
    }
  }

  function whatsappHref(guest: GuestRecord): string | null {
    if (!guest.guestPhone) {
      return null;
    }
    const message = t("whatsappMessage", {
      name: guest.guestName,
      event: eventName,
      link: personalLink(guest.inviteToken),
    });
    return buildWhatsappLink(guest.guestPhone, message);
  }

  return (
    <div className="mb-6 border border-[#E2DFD3] p-4">
      <p className="font-medium text-[#14211D]">{t("heading")}</p>
      <p className="mt-1 text-sm text-[#5B6B67]">{t("subtitle")}</p>

      {summary && (
        <div className="mt-3 flex flex-wrap gap-4 text-sm">
          <span className="text-[#14211D]"><strong>{summary.total}</strong> {t("total")}</span>
          <span style={{ color: STATUS_COLOR.Pending }}><strong>{summary.pending}</strong> {t("pending")}</span>
          <span style={{ color: STATUS_COLOR.Confirmed }}><strong>{summary.confirmed}</strong> {t("confirmed")}</span>
          <span className="text-[#5B6B67]"><strong>{summary.declined}</strong> {t("declined")}</span>
        </div>
      )}

      <form onSubmit={handleAdd} className="mt-4 flex flex-col gap-2 sm:flex-row">
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t("namePlaceholder")}
          className="flex-1 border border-[#E2DFD3] px-3 py-2 text-sm"
        />
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder={t("phonePlaceholder")}
          className="flex-1 border border-[#E2DFD3] px-3 py-2 text-sm"
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t("emailPlaceholder")}
          className="flex-1 border border-[#E2DFD3] px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={isAdding}
          className="rounded-full bg-[#0F766E] px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-[#0C5C56] disabled:opacity-50"
        >
          {isAdding ? t("adding") : t("addButton")}
        </button>
      </form>

      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}

      {guests.length === 0 ? (
        <p className="mt-4 text-sm text-[#5B6B67]">{t("empty")}</p>
      ) : (
        <ul className="mt-4 flex flex-col divide-y divide-[#E2DFD3]">
          {guests.map((guest) => {
            const waHref = whatsappHref(guest);
            return (
              <li key={guest.id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[#14211D]">{guest.guestName}</span>
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-white"
                      style={{ background: STATUS_COLOR[guest.status] }}
                    >
                      {statusLabels[guest.status]}
                    </span>
                  </div>
                  <p className="text-xs text-[#5B6B67]">
                    {guest.guestEmail}
                    {guest.guestEmail && guest.guestPhone ? " · " : ""}
                    {guest.guestPhone}
                    {guest.reminderCount > 0 && (
                      <> · {t("remindedCount", { count: guest.reminderCount })}</>
                    )}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => handleCopyLink(guest.inviteToken, guest.id)}
                    className="rounded-full border border-[#E2DFD3] px-3 py-1 text-[#14211D] transition-colors duration-150 hover:bg-[#F5F2EA]"
                  >
                    {copiedId === guest.id ? t("linkCopied") : t("copyLink")}
                  </button>

                  {guest.status === "Pending" && waHref && (
                    <a
                      href={waHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full border border-[#0F766E] px-3 py-1 text-[#0F766E] transition-colors duration-150 hover:bg-[#0F766E] hover:text-white"
                    >
                      {t("remindWhatsapp")}
                    </a>
                  )}

                  {guest.status === "Pending" && guest.guestEmail && (
                    <button
                      type="button"
                      onClick={() => handleRemind(guest)}
                      disabled={remindingId === guest.id}
                      className="rounded-full border border-[#E2DFD3] px-3 py-1 text-[#14211D] transition-colors duration-150 hover:bg-[#F5F2EA] disabled:opacity-50"
                    >
                      {remindingId === guest.id
                        ? t("reminderSending")
                        : remindedId === guest.id
                          ? t("reminderSent")
                          : t("remindEmail")}
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleRemove(guest.id)}
                    className="rounded-full border border-transparent px-3 py-1 text-red-600 transition-colors duration-150 hover:bg-red-50"
                  >
                    {t("remove")}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
