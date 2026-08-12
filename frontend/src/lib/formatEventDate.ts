export function formatEventDate(iso: string, locale: string) {
  const [year, month, day] = iso.split('T')[0].split('-');
  return new Date(Number(year), Number(month) - 1, Number(day)).toLocaleDateString(locale, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
