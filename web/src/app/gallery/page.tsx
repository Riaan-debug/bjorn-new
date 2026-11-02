import { Collage } from "@/components/site/Collage";
import { SiteChrome } from "@/components/site/SiteChrome";
import { publicSite } from "@/lib/db";
import { GALLERY_SLOT_IDS, SITE_PHOTO_SLOTS } from "@/lib/site";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Gallery" };

export default function GalleryPage() {
  const photos = publicSite().photos;
  const items = GALLERY_SLOT_IDS.map((id) => ({
    src: photos[id] || "",
    label: SITE_PHOTO_SLOTS.find((slot) => slot.id === id)?.label || "",
  })).filter((item) => item.src);

  return (
    <SiteChrome>
      <div className="mx-auto max-w-6xl px-5 pt-16 sm:px-8">
        <p className="text-[11px] uppercase tracking-[0.28em] text-mist">Pictures and film</p>
        <h1 className="mt-3 font-display text-5xl font-bold uppercase tracking-tight text-navy sm:text-7xl">Gallery</h1>
        <p className="mt-4 max-w-2xl text-base leading-8 text-mist">
          Stills from the Olympus counter, the trailer, and the cup.
        </p>
      </div>
      <div className="px-3 pb-16 pt-12 sm:px-5">
        {items.length ? <Collage items={items} /> : <p className="px-2 text-base leading-8 text-mist">Pictures are on their way.</p>}
      </div>
    </SiteChrome>
  );
}
