"use client";

import { useEffect, useState } from "react";
import { HubShell } from "@/components/hub/HubShell";
import { AmountInput } from "@/components/hub/AmountInput";
import type { DailyEntry } from "@/lib/types";
import { prettyDate, zar } from "@/lib/format";
import { toast } from "@/lib/toast";

export default function DailyPage() {
  const [log, setLog] = useState<DailyEntry[]>([]);
  const [cups, setCups] = useState(0);
  const [revenue, setRevenue] = useState(0);
  const [notes, setNotes] = useState("");

  async function load() {
    const res = await fetch("/api/hub/daily");
    if (res.ok) setLog(await res.json());
  }
  useEffect(() => { load(); }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/hub/daily", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ cups, revenue, notes }),
    });
    if (!res.ok) {
      toast("Could not save the day", "error");
      return;
    }
    setNotes("");
    toast("Day saved");
    load();
  }

  return (
    <HubShell title="Daily log">
      <form onSubmit={save} className="mb-8 grid max-w-xl gap-3 sm:grid-cols-2">
        <label className="text-sm text-mist">Cups
          <AmountInput value={cups} onChange={setCups} className="mt-1 w-full border border-line bg-white px-3 py-2 text-navy" />
        </label>
        <label className="text-sm text-mist">Yoco / revenue
          <AmountInput value={revenue} step="any" onChange={setRevenue} className="mt-1 w-full border border-line bg-white px-3 py-2 text-navy" />
        </label>
        <label className="sm:col-span-2 text-sm text-mist">Notes
          <input value={notes} onChange={(e) => setNotes(e.target.value)} className="mt-1 w-full border border-line bg-white px-3 py-2 text-navy" />
        </label>
        <button className="bg-navy px-4 py-2 text-[12px] uppercase tracking-[0.16em] text-cream">Save today</button>
      </form>
      <div className="table-wrap border border-line bg-white">
        <table>
          <thead><tr><th>Date</th><th>Cups</th><th>Revenue</th><th>Notes</th></tr></thead>
          <tbody>
            {log.map((e) => (
              <tr key={e.id}>
                <td>{prettyDate(e.date)}</td>
                <td>{e.cups}</td>
                <td>{zar(e.revenue)}</td>
                <td>{e.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </HubShell>
  );
}
