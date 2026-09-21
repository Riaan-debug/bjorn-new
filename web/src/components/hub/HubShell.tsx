"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Wordmark } from "@/components/site/Wordmark";
import { BackToTop } from "@/components/site/BackToTop";
import { ToastHost } from "@/components/hub/ToastHost";
import type { StaffRole } from "@/lib/types";

const NAV = [
  { href: "/hub", label: "Hub", ownerOnly: false },
  { href: "/hub/loyalty", label: "Loyalty", ownerOnly: false },
  { href: "/hub/menu", label: "Menu", ownerOnly: true },
  { href: "/hub/site", label: "Site", ownerOnly: true },
  { href: "/hub/stock", label: "Stock", ownerOnly: false },
  { href: "/hub/daily", label: "Daily log", ownerOnly: false },
  { href: "/hub/enquiries", label: "Enquiries", ownerOnly: false },
  { href: "/hub/settings", label: "Settings", ownerOnly: true },
];

const OWNER_PATHS = NAV.filter((item) => item.ownerOnly).map((item) => item.href);

type HubAuth = {
  role: StaffRole;
  name: string;
  staffId: string;
};

export function HubShell({ children, title }: { children: React.ReactNode; title: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [auth, setAuth] = useState<HubAuth | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function apply(data: { signedIn?: boolean; role?: StaffRole; name?: string; staffId?: string }) {
      if (!data.signedIn) {
        router.replace("/hub/login");
        return;
      }
      const next = {
        role: data.role as StaffRole,
        name: String(data.name || "Staff"),
        staffId: String(data.staffId || ""),
      };
      if (next.role !== "owner" && OWNER_PATHS.includes(pathname)) {
        router.replace("/hub");
        return;
      }
      setAuth(next);
    }

    function load() {
      fetch("/api/auth/status")
        .then((r) => r.json())
        .then(apply)
        .catch(() => router.replace("/hub/login"));
    }

    load();
    window.addEventListener("hub-auth-changed", load);
    return () => window.removeEventListener("hub-auth-changed", load);
  }, [router, pathname]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/hub/login");
  }

  if (!auth) {
    return <div className="grid min-h-screen place-items-center bg-cream text-mist">Opening hub…</div>;
  }

  const items = NAV.filter((item) => !item.ownerOnly || auth.role === "owner");

  return (
    <div className="min-h-screen bg-cream md:pl-64">
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-navy text-cream transition-transform ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
        <div className="border-b border-cream/10 px-6 py-7">
          <Wordmark invert size="sm" />
          <p className="mt-2 text-[11px] italic text-cream/50">
            {auth.name} · {auth.role === "owner" ? "Owner" : "Staff"}
          </p>
        </div>
        <nav className="flex flex-col py-4 pb-28">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`px-6 py-3 text-sm ${pathname === item.href ? "bg-cream/10 text-cream" : "text-cream/60 hover:text-cream"}`}
            >
              {item.label}
            </Link>
          ))}
          <Link href="/kiosk" className="px-6 py-3 text-sm text-cream/60 hover:text-cream">
            Open kiosk
          </Link>
        </nav>
        <div className="absolute bottom-6 left-6 space-y-3">
          <Link href="/hub/pin" className="block text-[11px] uppercase tracking-[0.18em] text-cream/50 hover:text-cream">
            Change PIN
          </Link>
          <button type="button" onClick={logout} className="block text-[11px] uppercase tracking-[0.18em] text-cream/50 hover:text-cream">
            Sign out
          </button>
        </div>
      </aside>
      {open ? <button className="fixed inset-0 z-30 bg-navy/40 md:hidden" onClick={() => setOpen(false)} /> : null}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line bg-cream px-5">
        <button type="button" className="text-[13px] font-medium uppercase tracking-[0.2em] text-navy md:hidden" onClick={() => setOpen(true)}>
          Menu
        </button>
        <h1 className="font-display text-lg text-navy">{title}</h1>
        <span className="text-[11px] uppercase tracking-[0.14em] text-mist">
          {new Date().toLocaleDateString("en-ZA", { weekday: "long", day: "numeric", month: "long" })}
        </span>
      </header>
      <div className="px-5 py-8 sm:px-8">{children}</div>
      <ToastHost />
      <BackToTop />
    </div>
  );
}
