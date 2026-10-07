const CAFE_TZ = "Africa/Johannesburg";

export function cafeToday(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: CAFE_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function earliestEventDate(date = new Date()) {
  const [year, month, day] = cafeToday(date).split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day + 1)).toISOString().slice(0, 10);
}

export function isBookableEventDate(value: string, date = new Date()) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && value >= earliestEventDate(date);
}

export function addIsoDays(iso: string, days: number) {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day + days)).toISOString().slice(0, 10);
}

export function isCollectDate(value: string, date = new Date()) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const earliest = earliestEventDate(date);
  const latest = addIsoDays(cafeToday(date), 21);
  if (value < earliest || value > latest) return false;
  const [year, month, day] = value.split("-").map(Number);
  const weekday = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
  return weekday !== 0 && weekday !== 6;
}
