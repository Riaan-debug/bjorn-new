import Link from "next/link";
import { SiteChrome } from "@/components/site/SiteChrome";
import { ContactForm } from "@/components/site/ContactForm";
import { publicSettings, publicSite } from "@/lib/db";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Visit" };

function instagramHandle(url: string) {
  const match = url.match(/instagram\.com\/([^/?#]+)/i);
  return match ? `@${match[1]}` : "Instagram";
}

export default function VisitPage() {
  const settings = publicSettings();
  const photo = publicSite().photos.homeCounter;
  const directions =
    settings.googleBizUrl ||
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings.address)}`;

  return (
    <SiteChrome>
      <section className="relative min-h-[78vh] bg-navy text-cream">
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo} alt="The counter at Olympus" className="absolute inset-0 h-full w-full object-cover" />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-navy/80 via-navy/35 to-navy/25" />
        <div className="relative z-10 flex min-h-[78vh] flex-col justify-end px-5 py-12 sm:px-10 sm:py-16">
          <h1 className="font-display text-6xl font-light sm:text-8xl">Olympus</h1>
          <div className="mt-6 max-w-md space-y-3 text-base leading-7">
            <p>{settings.address}</p>
            <p>{settings.tradingHours}</p>
            <a href={directions} target="_blank" rel="noreferrer" className="inline-block underline underline-offset-4">
              Open in Google Maps
            </a>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-14 px-5 py-16 sm:px-8 md:grid-cols-2">
        <div>
          <p className="text-base leading-8 text-mist">
            {settings.location}. {settings.address}. We’re open {settings.tradingHours}.
            The counter is the one with the navy cups.
          </p>
          <div className="mt-6 space-y-2 text-base leading-8 text-mist">
            {settings.publicPhone ? <p className="text-navy">{settings.publicPhone}</p> : null}
            {settings.instagramUrl ? (
              <p>
                <a className="text-navy underline underline-offset-4" href={settings.instagramUrl} target="_blank" rel="noreferrer">
                  {instagramHandle(settings.instagramUrl)}
                </a>
              </p>
            ) : null}
          </div>
          <p className="mt-8 text-base leading-8 text-mist">
            Event bookings go on the{" "}
            <Link href="/events" className="text-navy underline underline-offset-4">
              events
            </Link>{" "}
            page.
          </p>
        </div>
        <div id="write" className="scroll-mt-24">
          <h2 className="font-display text-3xl font-light text-navy">Write to us</h2>
          <p className="mt-3 text-base leading-8 text-mist">
            Order a bag of the{" "}
            <Link href="/beans" className="text-navy underline underline-offset-4">
              house blend
            </Link>{" "}
            on the site, and pay when you collect. Write here for wholesale, or a weekday table.
          </p>
          <ContactForm />
        </div>
      </div>
    </SiteChrome>
  );
}
