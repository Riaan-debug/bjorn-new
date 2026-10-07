import { SiteChrome } from "@/components/site/SiteChrome";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy" };

export default function PrivacyPage() {
  return (
    <SiteChrome>
      <div className="mx-auto max-w-3xl px-5 py-16 sm:px-8">
        <h1 className="font-display text-5xl font-light text-navy">Privacy</h1>
        <div className="mt-8 space-y-5 text-sm leading-7 text-mist">
          <p>
            Apostellō Coffee stores only what we need to run the café: loyalty names and phone numbers,
            daily trade notes, stock counts, messages or event requests you send through this site,
            and bag orders (your name, email, phone, and what you asked to collect).
          </p>
          <p>
            Loyalty data is collected at the kiosk or by staff. Phone numbers are used to find your stamp card.
            We do not sell this information. Staff access is PIN-protected, sessions expire, and backups stay
            on the café’s own server — not on the previous developer’s Netlify account.
          </p>
          <p>
            Website enquiries are stored in the staff hub. Ask us in person if you want your loyalty card
            or a message removed.
          </p>
        </div>
      </div>
    </SiteChrome>
  );
}
