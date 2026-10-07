import { SiteChrome } from "@/components/site/SiteChrome";
import { EventForm } from "@/components/site/EventForm";
import { publicSettings, publicSite } from "@/lib/db";
import { waMe } from "@/lib/format";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Events" };

export default function EventsPage() {
  const settings = publicSettings();
  const site = publicSite();
  const photos = site.photos;
  const photo = photos.events || photos.homePour || site.special?.imagePath || "";
  const phone = settings.eventsPhone;
  const wa = waMe(phone);
  const host = settings.eventsContactName || "Joan";

  return (
    <SiteChrome>
      <div className="grid md:grid-cols-2">
        <section className="relative min-h-[52vh] bg-navy md:min-h-screen">
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photo} alt="A pour, or the trailer at an event" className="absolute inset-0 h-full w-full object-cover" />
          ) : null}
        </section>
        <section className="px-5 py-16 sm:px-10">
          <p className="text-[11px] uppercase tracking-[0.28em] text-mist">Off-site</p>
          <h1 className="mt-3 font-display text-5xl font-light text-navy">Book us</h1>
          <p className="mt-6 max-w-xl text-base leading-8 text-mist">
            Apostellō also leaves the Olympus counter. Markets, offices, private tables — coffee trailer
            and smash service, same blend, same navy cups. We need the date, how many guests, whether
            there is power, and whether the trailer can get in without a roof in the way.
          </p>
          {phone ? (
            <div className="mt-8 max-w-xl">
              <p className="text-[11px] uppercase tracking-[0.22em] text-mist">{settings.eventsContactRole || "Events"}</p>
              <p className="mt-2 font-display text-2xl font-light text-navy">{host}</p>
              <a href={`tel:${phone.replace(/\s/g, "")}`} className="mt-2 block text-navy underline underline-offset-4">
                {phone}
              </a>
              {wa ? (
                <a href={wa} target="_blank" rel="noreferrer" className="mt-2 block text-sm text-mist underline underline-offset-4">
                  WhatsApp
                </a>
              ) : null}
            </div>
          ) : null}
          <div className="max-w-xl">
            <h2 className="mt-12 font-display text-3xl font-light text-navy">Request a date</h2>
            <p className="mt-3 text-base leading-8 text-mist">
              Send the brief. It lands in the hub. {host} will come back to you.
            </p>
            <EventForm />
          </div>
        </section>
      </div>
    </SiteChrome>
  );
}
