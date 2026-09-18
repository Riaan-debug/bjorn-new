import type { SiteContent } from "./types";

export const SITE_PHOTO_SLOTS = [
  { id: "homeStory", label: "Café / trailer still", group: "Home" },
  { id: "homeSmash", label: "Smash burger still", group: "Home" },
  { id: "homePour", label: "Espresso / pour", group: "Home" },
  { id: "homeCounter", label: "Olympus counter", group: "Home" },
  { id: "about", label: "Portrait / team / machine", group: "About" },
  { id: "events", label: "Event / trailer", group: "Events" },
  { id: "galleryShake", label: "Strawberry shake", group: "Gallery" },
  { id: "galleryBeans", label: "Beans / wholesale", group: "Gallery" },
  { id: "galleryTeam", label: "Team", group: "Gallery" },
  { id: "galleryInterior", label: "Interior detail", group: "Gallery" },
] as const;

export const GALLERY_SLOT_IDS = [
  "homeStory",
  "homePour",
  "homeSmash",
  "galleryShake",
  "galleryBeans",
  "homeCounter",
  "events",
  "galleryTeam",
  "galleryInterior",
] as const;

export const DEFAULT_SITE: SiteContent = {
  special: { active: false, name: "", blurb: "", imagePath: "" },
  photos: Object.fromEntries(SITE_PHOTO_SLOTS.map((slot) => [slot.id, ""])),
};

export function cleanImagePath(value: unknown) {
  const path = String(value ?? "").trim();
  if (!path) return "";
  if (!path.startsWith("/media/") || path.includes("..") || path.includes("\\")) return "";
  return path.slice(0, 200);
}

export function mergeSite(raw?: Partial<SiteContent> | null): SiteContent {
  const photos: Record<string, string> = { ...DEFAULT_SITE.photos };
  for (const slot of SITE_PHOTO_SLOTS) {
    photos[slot.id] = cleanImagePath(raw?.photos?.[slot.id]);
  }
  return {
    special: {
      active: Boolean(raw?.special?.active),
      name: String(raw?.special?.name ?? "").trim().slice(0, 80),
      blurb: String(raw?.special?.blurb ?? "").trim().slice(0, 240),
      imagePath: cleanImagePath(raw?.special?.imagePath),
    },
    photos,
  };
}
