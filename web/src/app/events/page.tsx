import { SiteChrome } from "@/components/site/SiteChrome";
import { SiteImage } from "@/components/site/SiteImage";
import { EventForm } from "@/components/site/EventForm";
import { publicSettings, publicSite } from "@/lib/db";
import { waMe } from "@/lib/format";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Events" };

export default function EventsPage() {
  const settings = publicSettings();
  const eventPhoto = publicSite().photos.events;
  const phone = settings.eventsPhone;
  const wa = waMe(phone);

  return (
    <SiteChrome>
      <div className="mx-auto grid max-w-6xl gap-14 px-5 py-16 sm:px-8 md:grid-cols-2">
        <div>
          <p className="text-[11px] uppercase tracking-[0.28em] text-mist">Off-site</p>
          <h1 className="mt-3 font-display text-5xl font-light text-navy">Book us</h1>
          <p className="mt-6 text-base leading-8 text-mist">
            Apostellō also leaves the Olympus counter. Markets, offices, private tables — coffee trailer
            and smash service, same blend, same navy cups. We need the date, how many guests, whether
            there is power, and whether the trailer can get in without a roof in the way.
          </p>
          {phone ? (
            <div className="mt-8 border border-line bg-white p-5">
              <p className="text-[11px] uppercase tracking-[0.22em] text-mist">{settings.eventsContactRole || "Events"}</p>
              <p className="mt-2 font-display text-2xl font-light text-navy">{settings.eventsContactName || "Joan"}</p>
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
          <SiteImage src={eventPhoto} label="Event / trailer still" className="mt-10 min-h-[320px]" />
        </div>
        <div>
          <h2 className="font-display text-3xl font-light text-navy">Request a date</h2>
          <p className="mt-3 text-sm leading-7 text-mist">
            Send the brief. It lands in the hub.
            {settings.eventsContactName ? ` ${settings.eventsContactName} will come back to you.` : " We’ll come back to you."}
          </p>
          <EventForm />
        </div>
      </div>
    </SiteChrome>
  );
}
