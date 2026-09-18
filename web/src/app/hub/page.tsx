"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { HubShell } from "@/components/hub/HubShell";
import { zar } from "@/lib/format";

type Stats = {
  settings: { businessName: string; location: string; tradingHours: string; slogan: string; dailyCupTarget: number };
  todayCups: number;
  todayRevenue: number;
  members: number;
  unread: number;
  weekCups: number;
  weekRevenue: number;
  lowStock: { name: string }[];
};

export default function HubHomePage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/hub/stats").then((r) => r.json()).then(setStats);
  }, []);

  return (
    <HubShell title="Hub">
      {stats ? (
        <>
          <p className="text-mist">{stats.settings.location} · {stats.settings.tradingHours}</p>
          <p className="mt-1 italic text-navy">{stats.settings.slogan}</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <Kpi label="Today cups" value={String(stats.todayCups)} sub={`Target ${stats.settings.dailyCupTarget}`} />
            <Kpi label="Today Yoco" value={zar(stats.todayRevenue)} />
            <Kpi label="Loyalty members" value={String(stats.members)} />
            <Kpi label="Stock alerts" value={String(stats.lowStock.length)} sub={stats.lowStock.slice(0, 3).map((s) => s.name).join(", ") || "All ok"} warn={stats.lowStock.length > 0} />
            <Kpi label="This week" value={`${stats.weekCups} cups`} sub={zar(stats.weekRevenue)} />
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/kiosk" className="bg-navy px-5 py-3 text-[12px] uppercase tracking-[0.18em] text-cream">Open kiosk</Link>
            <Link href="/hub/enquiries" className="border border-navy px-5 py-3 text-[12px] uppercase tracking-[0.18em] text-navy">
              Enquiries{stats.unread ? ` (${stats.unread})` : ""}
            </Link>
            <Link href="/" className="px-5 py-3 text-[12px] uppercase tracking-[0.18em] text-mist">View website</Link>
          </div>
        </>
      ) : (
        <p className="text-mist">Loading…</p>
      )}
    </HubShell>
  );
}

function Kpi({ label, value, sub, warn }: { label: string; value: string; sub?: string; warn?: boolean }) {
  return (
    <div className={`border p-5 ${warn ? "border-red-300 bg-red-50" : "border-line bg-white"}`}>
      <p className="text-[11px] uppercase tracking-[0.18em] text-mist">{label}</p>
      <p className="mt-2 font-display text-2xl text-navy">{value}</p>
      {sub ? <p className="mt-1 text-xs text-mist">{sub}</p> : null}
    </div>
  );
}
