import { SiteChrome } from "@/components/site/SiteChrome";
import { ContactForm } from "@/components/site/ContactForm";
import { publicSettings } from "@/lib/db";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Visit" };

export default function VisitPage() {
  const settings = publicSettings();
  const mapQuery = encodeURIComponent(settings.address);

  return (
    <SiteChrome>
      <div className="mx-auto grid max-w-6xl gap-14 px-5 py-16 sm:px-8 md:grid-cols-2">
        <div>
          <p className="text-[11px] uppercase tracking-[0.28em] text-mist">Find us</p>
          <h1 className="mt-3 font-display text-5xl font-light text-navy">Visit</h1>
          <div className="mt-8 space-y-3 text-base leading-8 text-mist">
            <p className="text-navy">{settings.location}</p>
            <p>{settings.address}</p>
            <p>{settings.tradingHours}</p>
            {settings.publicPhone ? <p>{settings.publicPhone}</p> : null}
            <p>
              <a className="underline underline-offset-4" href={settings.instagramUrl} target="_blank" rel="noreferrer">
                @apostellocafe
              </a>
            </p>
          </div>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}
            target="_blank"
            rel="noreferrer"
            className="mt-10 block border border-line"
          >
            <div className="placeholder-media flex h-72 flex-col items-center justify-center text-center">
              <p className="font-display text-xl text-navy">17 Midas Avenue, Olympus</p>
              <p className="mt-2 text-[12px] uppercase tracking-[0.2em] text-mist">Open directions</p>
            </div>
          </a>
        </div>
        <div>
          <h2 className="font-display text-3xl font-light text-navy">Write to us</h2>
          <p className="mt-3 text-sm leading-7 text-mist">
            Events, wholesale beans, or a weekday table. We keep messages on our side and reply from the café.
          </p>
          <ContactForm />
        </div>
      </div>
    </SiteChrome>
  );
}
