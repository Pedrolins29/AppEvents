// Builds a wa.me deep link the organizer taps to send a pre-filled WhatsApp message from their own
// device - the honest, no-API way to nudge a guest (the app never sends WhatsApp itself).
//
// Phone normalization is best-effort: strip everything but digits, and if the number looks like a
// local Brazilian one (no country code), prepend 55. Callers pass an already-reasonable number;
// this just makes the common cases work.
const DEFAULT_COUNTRY_CODE = "55";

export function normalizeWhatsappPhone(rawPhone: string): string {
  const digits = rawPhone.replace(/\D/g, "");
  if (digits.length === 0) {
    return "";
  }
  // 10-11 digits = a Brazilian number without its country code (DDD + number).
  if (digits.length <= 11 && !digits.startsWith(DEFAULT_COUNTRY_CODE)) {
    return `${DEFAULT_COUNTRY_CODE}${digits}`;
  }
  return digits;
}

export function buildWhatsappLink(rawPhone: string, message: string): string | null {
  const phone = normalizeWhatsappPhone(rawPhone);
  if (!phone) {
    return null;
  }
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
