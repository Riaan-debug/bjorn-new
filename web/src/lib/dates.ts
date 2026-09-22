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
