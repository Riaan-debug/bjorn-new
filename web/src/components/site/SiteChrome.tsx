import Link from "next/link";
import { SiteHeader } from "./SiteHeader";
import { Wordmark } from "./Wordmark";
import { BackToTop } from "./BackToTop";
import { publicSettings } from "@/lib/db";

export function SiteChrome({
  children,
  darkHero = false,
}: {
  children: React.ReactNode;
  darkHero?: boolean;
}) {
  const settings = publicSettings();

  return (
    <div className="min-h-screen bg-cream">
      {darkHero ? <SiteHeader /> : <LightHeader />}
      <main>{children}</main>
      <footer className="border-t border-line bg-navy text-cream">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 sm:px-8 md:grid-cols-3">
          <div>
            <Wordmark invert size="sm" />
            <p className="mt-4 max-w-xs text-sm italic text-cream/70">{settings.slogan}</p>
            <p className="mt-3 text-[11px] uppercase tracking-[0.22em] text-cream/50">Speciality coffee · Est. 26</p>
          </div>
          <div className="text-sm leading-7 text-cream/75">
            <p>{settings.location}</p>
            <p>{settings.address}</p>
            <p>{settings.tradingHours}</p>
            {settings.publicPhone ? <p>{settings.publicPhone}</p> : null}
          </div>
          <div className="flex flex-col items-start gap-3">
            <Link href="/menu" className="nav-link nav-link-dark">Menu</Link>
            <Link href="/visit" className="nav-link nav-link-dark">Visit</Link>
            <Link href="/events" className="nav-link nav-link-dark">Book an event</Link>
            <a href={settings.instagramUrl} target="_blank" rel="noreferrer" className="nav-link nav-link-dark">Instagram</a>
            <Link href="/privacy" className="nav-link nav-link-dark">Privacy</Link>
          </div>
        </div>
      </footer>
      <BackToTop />
    </div>
  );
}

function LightHeader() {
  const links = [
    { href: "/menu", label: "Menu" },
    { href: "/about", label: "About" },
    { href: "/gallery", label: "Gallery" },
    { href: "/events", label: "Events" },
    { href: "/visit", label: "Visit" },
  ];
  return (
    <header className="border-b border-line bg-cream">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-5 sm:px-8 md:flex-row md:items-center md:justify-between">
        <Link href="/">
          <Wordmark size="sm" />
        </Link>
        <nav className="flex flex-wrap items-center gap-x-6 gap-y-2">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="nav-link nav-link-light">
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
