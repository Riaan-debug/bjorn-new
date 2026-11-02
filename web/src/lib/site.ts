import type { SiteContent, SiteReview, TeamPerson } from "./types";

export const SITE_PHOTO_SLOTS = [
  { id: "homeStory", label: "Café / trailer still", group: "Home" },
  { id: "homeSmash", label: "Smash burger still", group: "Home" },
  { id: "homePour", label: "Espresso / pour", group: "Home" },
  { id: "homeCounter", label: "Olympus counter", group: "Home" },
  { id: "menuBoard", label: "Printed menu board", group: "Menu" },
  { id: "menuBoardFood", label: "Second board (food), optional", group: "Menu" },
  { id: "about", label: "Portrait / team / machine", group: "About" },
  { id: "events", label: "Event / trailer", group: "Events" },
  { id: "galleryShake", label: "Strawberry shake", group: "Gallery" },
  { id: "galleryBeans", label: "Beans / wholesale", group: "Gallery" },
  { id: "galleryTeam", label: "Team", group: "Gallery" },
  { id: "galleryInterior", label: "Interior detail", group: "Gallery" },
  { id: "galleryTrailer", label: "Trailer, pouring", group: "Gallery" },
  { id: "galleryCounter", label: "Trailer counter", group: "Gallery" },
] as const;

export const GALLERY_SLOT_IDS = [
  "homeStory",
  "homePour",
  "homeSmash",
  "galleryShake",
  "homeCounter",
  "events",
  "galleryInterior",
] as const;

/* Stills from Bjorn's October shoot. They ship with the site and show until a slot is replaced from the hub.
   Group pictures with Bjorn in them stay off the public pages. Joan and Sibu stay. */
const SHIPPED_PHOTOS: Record<string, string> = {
  homeStory: "/media/site/trailer-pour.jpg",
  homePour: "/media/site/cup.jpg",
  homeSmash: "/media/site/smash.jpg",
  homeCounter: "/media/site/trailer-counter.jpg",
  about: "/media/site/interior.jpg",
  events: "/media/site/events.jpg",
  galleryBeans: "/media/site/beans.jpg",
  galleryInterior: "/media/site/interior.jpg",
  galleryTrailer: "/media/site/trailer-pour.jpg",
  galleryCounter: "/media/site/trailer-counter.jpg",
};

export const DEFAULT_SITE: SiteContent = {
  special: { active: false, name: "", blurb: "", imagePath: "" },
  photos: Object.fromEntries(SITE_PHOTO_SLOTS.map((slot) => [slot.id, SHIPPED_PHOTOS[slot.id] || ""])),
  team: [
    { id: "t-bjorn", name: "Bjorn", role: "Owner", imagePath: "" },
    { id: "t-joan", name: "Joan", role: "Office manager", imagePath: "/media/site/joan.jpg" },
  ],
  reviews: [],
};

export function cleanImagePath(value: unknown) {
  const path = String(value ?? "").trim();
  if (!path) return "";
  if (!path.startsWith("/media/") || path.includes("..") || path.includes("\\")) return "";
  return path.slice(0, 200);
}

function cleanTeam(raw?: TeamPerson[] | null): TeamPerson[] {
  const list = Array.isArray(raw) ? raw : DEFAULT_SITE.team;
  const seen = new Set<string>();
  const next: TeamPerson[] = [];
  for (const row of list) {
    const name = String(row?.name ?? "").trim().slice(0, 40);
    if (!name) continue;
    const id = String(row?.id ?? "").trim().slice(0, 40) || `t-${next.length + 1}`;
    if (seen.has(id)) continue;
    seen.add(id);
    const shipped = DEFAULT_SITE.team.find((person) => person.id === id)?.imagePath || "";
    next.push({
      id,
      name,
      role: String(row?.role ?? "").trim().slice(0, 40),
      imagePath: cleanImagePath(row?.imagePath) || shipped,
    });
    if (next.length >= 12) break;
  }
  return next;
}

function cleanReviews(raw?: SiteReview[] | null): SiteReview[] {
  const list = Array.isArray(raw) ? raw : [];
  const next: SiteReview[] = [];
  for (const row of list) {
    const quote = String(row?.quote ?? "").trim().slice(0, 400);
    if (!quote) continue;
    next.push({
      id: String(row?.id ?? "").trim().slice(0, 40) || `r-${next.length + 1}`,
      quote,
      name: String(row?.name ?? "").trim().slice(0, 80),
    });
    if (next.length >= 12) break;
  }
  return next;
}

const BJORN_PHOTOS = new Set([
  "/media/site/trailer.jpg",
  "/media/site/counter.jpg",
  "/media/site/machine.jpg",
  "/media/site/team.jpg",
]);

export function mergeSite(raw?: Partial<SiteContent> | null): SiteContent {
  const photos: Record<string, string> = { ...DEFAULT_SITE.photos };
  for (const slot of SITE_PHOTO_SLOTS) {
    const incoming = cleanImagePath(raw?.photos?.[slot.id]);
    photos[slot.id] = incoming && !BJORN_PHOTOS.has(incoming) ? incoming : DEFAULT_SITE.photos[slot.id] || "";
  }
  return {
    special: {
      active: Boolean(raw?.special?.active),
      name: String(raw?.special?.name ?? "").trim().slice(0, 80),
      blurb: String(raw?.special?.blurb ?? "").trim().slice(0, 240),
      imagePath: cleanImagePath(raw?.special?.imagePath),
    },
    photos,
    team: cleanTeam(raw?.team),
    reviews: cleanReviews(raw?.reviews),
  };
}
