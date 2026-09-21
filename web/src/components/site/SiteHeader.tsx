"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Wordmark } from "./Wordmark";

const LINKS = [
  { href: "/menu", label: "Menu" },
  { href: "/about", label: "About" },
  { href: "/gallery", label: "Gallery" },
  { href: "/events", label: "Events" },
  { href: "/visit", label: "Visit" },
];

export function SiteHeader({ darkHero = false }: { darkHero?: boolean }) {
  const [open, setOpen] = useState(false);
  const [pastHero, setPastHero] = useState(false);

  useEffect(() => {
    if (!darkHero) return;
    function onScroll() {
      setPastHero(window.scrollY > Math.min(window.innerHeight * 0.72, 640));
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [darkHero]);

  const overlay = darkHero && !pastHero;
  const creamBar = !overlay;

  return (
    <header
      className={
        overlay
          ? "absolute inset-x-0 top-0 z-40"
          : darkHero
            ? "fixed inset-x-0 top-0 z-40 border-b border-line bg-cream/95 backdrop-blur"
            : "sticky top-0 z-40 border-b border-line bg-cream/95 backdrop-blur"
      }
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5 sm:px-8">
        <Link href="/" className="relative z-50" onClick={() => setOpen(false)}>
          <Wordmark invert={overlay} size="sm" />
        </Link>
        <nav className="hidden items-center gap-7 md:flex">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={overlay ? "nav-link nav-link-dark" : "nav-link nav-link-light"}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <button
          type="button"
          className={`relative z-50 text-[13px] font-medium uppercase tracking-[0.2em] md:hidden ${
            overlay ? "text-cream" : "text-navy"
          }`}
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>
      {open ? (
        <div className={`fixed inset-0 z-40 px-8 pt-24 md:hidden ${creamBar ? "bg-cream" : "bg-navy"}`}>
          <div className="flex flex-col gap-6">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`font-display text-3xl ${creamBar ? "text-navy" : "text-cream"}`}
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </header>
  );
}
