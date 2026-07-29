export function formatEventDate(iso: string, locale: string) {
  return new Date(iso).toLocaleDateString(locale, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
