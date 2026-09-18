import { SiteChrome } from "@/components/site/SiteChrome";
import { SiteImage } from "@/components/site/SiteImage";
import { publicSettings, publicSite } from "@/lib/db";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  const settings = publicSettings();
  const aboutPhoto = publicSite().photos.about;
  return (
    <SiteChrome>
      <div className="mx-auto grid max-w-6xl gap-14 px-5 py-16 sm:px-8 md:grid-cols-2">
        <div>
          <p className="text-[11px] uppercase tracking-[0.28em] text-mist">Est. 26</p>
          <h1 className="mt-3 font-display text-5xl font-light text-navy">Apostellō</h1>
          <p className="mt-6 text-xl italic text-navy">{settings.slogan}</p>
          <div className="mt-8 space-y-5 text-base leading-8 text-mist">
            <p>
              The name comes from the Greek ἀποστέλλω — to send. A cup here is not handed over as a transaction.
              It is sent: from the farm, through a 10-day rest, through a 28–32 second shot, to you.
            </p>
            <p>
              We roast and pull a house blend of {settings.coffeeBlend.toLowerCase()}. Ratio 1:2.4.
              That spec lives in the café and in the hub, so the drink stays consistent whether you are at
              the Olympus counter or we are pouring at an event.
            </p>
            <p>
              Alongside the coffee: smash burgers, bakery, and cold drinks. Same navy, same cream,
              same standard. Follow the work on Instagram at{" "}
              {settings.instagramUrl ? (
                <a
                  href={settings.instagramUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-navy underline underline-offset-4"
                >
                  @apostellocafe
                </a>
              ) : (
                "@apostellocafe"
              )}.
            </p>
          </div>
        </div>
        <div className="space-y-6">
          <SiteImage src={aboutPhoto} label="Portrait / team / machine" className="min-h-[420px]" />
          <div className="border border-line p-6">
            <p className="text-[11px] uppercase tracking-[0.22em] text-mist">Coffee spec</p>
            <p className="mt-3 font-display text-xl text-navy">{settings.coffeeBlend}</p>
            <p className="mt-2 text-sm leading-7 text-mist">{settings.coffeeNotes}</p>
          </div>
        </div>
      </div>
    </SiteChrome>
  );
}
