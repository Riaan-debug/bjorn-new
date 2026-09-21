import type { CSSProperties } from "react";
import { SiteChrome } from "@/components/site/SiteChrome";
import { SiteImage } from "@/components/site/SiteImage";
import { publicSite } from "@/lib/db";
import { GALLERY_SLOT_IDS, SITE_PHOTO_SLOTS } from "@/lib/site";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Gallery" };

const TILTS = [-2.2, 1.6, -1.1, 2.4, 0.6, -1.8, 1.3, -0.7, 2];

export default function GalleryPage() {
  const photos = publicSite().photos;
  const slots = GALLERY_SLOT_IDS.map((id) => SITE_PHOTO_SLOTS.find((slot) => slot.id === id)).filter(
    (slot): slot is (typeof SITE_PHOTO_SLOTS)[number] => Boolean(slot),
  );

  return (
    <SiteChrome>
      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
        <p className="text-[11px] uppercase tracking-[0.28em] text-mist">Pictures and film</p>
        <h1 className="mt-3 font-display text-5xl font-light text-navy">Gallery</h1>
        <p className="mt-4 max-w-2xl text-base leading-8 text-mist">
          Stills from the Olympus counter, the trailer, and the cup. Bjorn adds these from the hub.
        </p>
        <div className="pinboard mt-12">
          {slots.map((slot, index) => (
            <figure
              key={slot.id}
              className="pinboard-card border border-line bg-white p-2"
              style={{ "--tilt": `${TILTS[index % TILTS.length]}deg` } as CSSProperties}
            >
              <SiteImage src={photos[slot.id]} label={slot.label} />
              <figcaption className="px-1 py-3 text-[11px] uppercase tracking-[0.18em] text-mist">
                {slot.label}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </SiteChrome>
  );
}
