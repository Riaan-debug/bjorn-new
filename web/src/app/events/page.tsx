import { SiteChrome } from "@/components/site/SiteChrome";
import { SiteImage } from "@/components/site/SiteImage";
import { ContactForm } from "@/components/site/ContactForm";
import { publicSite } from "@/lib/db";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Events" };

export default function EventsPage() {
  const eventPhoto = publicSite().photos.events;
  return (
    <SiteChrome>
      <div className="mx-auto grid max-w-6xl gap-14 px-5 py-16 sm:px-8 md:grid-cols-2">
        <div>
          <p className="text-[11px] uppercase tracking-[0.28em] text-mist">Off-site</p>
          <h1 className="mt-3 font-display text-5xl font-light text-navy">Book us</h1>
          <p className="mt-6 text-base leading-8 text-mist">
            Apostellō also leaves the Olympus counter. Markets, offices, private tables — coffee trailer
            and smash service, same blend, same navy cups. Tell us the date and we will come back from the hub.
          </p>
          <SiteImage src={eventPhoto} label="Event / trailer still" className="mt-10 min-h-[320px]" />
        </div>
        <div>
          <h2 className="font-display text-3xl font-light text-navy">Request a date</h2>
          <ContactForm />
        </div>
      </div>
    </SiteChrome>
  );
}
