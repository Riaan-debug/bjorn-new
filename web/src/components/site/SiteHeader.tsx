"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BagLink } from "./BagLink";
import { Wordmark } from "./Wordmark";

const LINKS = [
  { href: "/menu", label: "Menu" },
  { href: "/beans", label: "Shop" },
  { href: "/about", label: "About" },
  { href: "/gallery", label: "Gallery" },
  { href: "/events", label: "Events" },
  { href: "/visit", label: "Visit" },
];

export function SiteHeader({ darkHero = false }: { darkHero?: boolean }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const overlay = darkHero;
  const creamBar = !overlay;

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  return (
    <>
    <header className={overlay ? "absolute inset-x-0 top-0 z-50" : "relative z-50"}>
      <div className={creamBar ? "bean-rule-b bg-cream/95 backdrop-blur" : undefined}>
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5 sm:px-8">
        <Link href="/" className="relative z-50" onClick={() => setOpen(false)}>
          <Wordmark invert={overlay} size="sm" />
        </Link>
        <div className="hidden items-center gap-7 md:flex">
          <nav className="flex items-center gap-7">
            {LINKS.map((link) => {
              const current = pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={current ? "page" : undefined}
                  className={`${overlay ? "nav-link nav-link-dark" : "nav-link nav-link-light"}${current ? " nav-link-current" : ""}`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
          <BagLink overlay={overlay} />
          <Link
            href="/events"
            className={`border px-3 py-1.5 text-[12px] font-medium uppercase tracking-[0.18em] ${
              overlay ? "border-cream text-cream" : "border-navy text-navy"
            }`}
          >
            Book us
          </Link>
        </div>
        <div className="flex items-center gap-5 md:hidden">
          <BagLink overlay={overlay} />
          <button
            type="button"
            className={`relative z-50 grid h-11 w-11 place-items-center ${
              overlay ? "text-cream" : "text-navy"
            }`}
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="site-nav"
            aria-label={open ? "Close menu" : "Open menu"}
          >
            <span className="flex w-[22px] flex-col gap-[5px]" aria-hidden>
              <span
                className={`h-0.5 w-full origin-center bg-current transition duration-200 ${
                  open ? "translate-y-[7px] rotate-45" : ""
                }`}
              />
              <span className={`h-0.5 w-full bg-current transition duration-200 ${open ? "opacity-0" : ""}`} />
              <span
                className={`h-0.5 w-full origin-center bg-current transition duration-200 ${
                  open ? "-translate-y-[7px] -rotate-45" : ""
                }`}
              />
            </span>
          </button>
        </div>
      </div>
      </div>
    </header>
    {open ? (
      <div id="site-nav" className={`fixed inset-0 z-40 overflow-y-auto overscroll-contain px-8 pb-16 pt-24 md:hidden ${creamBar ? "bg-cream" : "bg-navy"}`}>
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-7">
          <BagLink overlay={!creamBar} onClick={() => setOpen(false)} className="w-fit" />
          <Link
            href="/events"
            className={`w-fit border px-4 py-2 text-[12px] uppercase tracking-[0.18em] ${
              creamBar ? "border-navy text-navy" : "border-cream text-cream"
            }`}
            onClick={() => setOpen(false)}
          >
            Book us
          </Link>
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`font-display text-4xl font-light leading-none ${creamBar ? "text-navy" : "text-cream"}`}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    ) : null}
    </>
  );
}
