"use client";

import { useEffect, useState } from "react";
import { HubShell } from "@/components/hub/HubShell";
import { AmountInput } from "@/components/hub/AmountInput";
import type { StockItem } from "@/lib/types";

const empty: StockItem = { id: "", name: "", cat: "Other", unit: "each", count: 0, reorder: 0 };

export default function StockPage() {
  const [items, setItems] = useState<StockItem[]>([]);
  const [edit, setEdit] = useState<StockItem | null>(null);
  const [q, setQ] = useState("");
  const [scope, setScope] = useState<"all" | "low">("all");
  const [cat, setCat] = useState("all");

  async function load() {
    const res = await fetch("/api/hub/stock");
    if (res.ok) setItems(await res.json());
  }
  useEffect(() => { load(); }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!edit) return;
    await fetch("/api/hub/stock", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(edit),
    });
    setEdit(null);
    load();
  }

  const cats = [...new Set(items.map((item) => item.cat).filter(Boolean))].sort();
  const filtered = items.filter((item) => {
    if (scope === "low" && item.count > item.reorder) return false;
    if (cat !== "all" && item.cat !== cat) return false;
    const s = q.trim().toLowerCase();
    if (!s) return true;
    return item.name.toLowerCase().includes(s) || item.cat.toLowerCase().includes(s);
  });

  return (
    <HubShell title="Stock">
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <button type="button" onClick={() => setEdit({ ...empty })} className="bg-navy px-4 py-2 text-[12px] uppercase tracking-[0.16em] text-cream">Add item</button>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search item or category"
          className="min-w-[200px] flex-1 border border-line bg-white px-3 py-2"
        />
        <select
          value={cat}
          onChange={(e) => setCat(e.target.value)}
          className="border border-line bg-white px-3 py-2 text-navy"
        >
          <option value="all">All categories</option>
          {cats.map((name) => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => setScope("all")}
            className={`px-3 py-2 text-[12px] uppercase tracking-[0.16em] ${scope === "all" ? "bg-navy text-cream" : "border border-navy text-navy"}`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setScope("low")}
            className={`px-3 py-2 text-[12px] uppercase tracking-[0.16em] ${scope === "low" ? "bg-navy text-cream" : "border border-navy text-navy"}`}
          >
            Low stock
          </button>
        </div>
      </div>
      <div className="table-wrap border border-line bg-white">
        <table>
          <thead><tr><th>Item</th><th>Category</th><th>Count</th><th>Reorder</th></tr></thead>
          <tbody>
            {filtered.map((item) => (
              <tr key={item.id} className={item.count <= item.reorder ? "bg-red-50" : ""}>
                <td><button type="button" className="text-left font-medium text-navy" onClick={() => setEdit(item)}>{item.name}</button></td>
                <td>{item.cat}</td>
                <td>{item.count} {item.unit}</td>
                <td>{item.reorder}</td>
              </tr>
            ))}
            {!filtered.length ? (
              <tr>
                <td colSpan={4} className="py-10 text-center text-mist">
                  {items.length ? "No items match that search." : "Loading…"}
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
      {edit ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-navy/40 p-4">
          <form onSubmit={save} className="w-full max-w-md bg-cream p-6">
            <h2 className="font-display text-2xl text-navy">{edit.id ? "Edit stock" : "New item"}</h2>
            <div className="mt-4 grid gap-3">
              <input value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} placeholder="Name" className="border border-line bg-white px-3 py-2" required />
              <input value={edit.cat} onChange={(e) => setEdit({ ...edit, cat: e.target.value })} placeholder="Category" className="border border-line bg-white px-3 py-2" />
              <input value={edit.unit} onChange={(e) => setEdit({ ...edit, unit: e.target.value })} placeholder="Unit" className="border border-line bg-white px-3 py-2" />
              <AmountInput value={edit.count} placeholder="Count" onChange={(count) => setEdit({ ...edit, count })} />
              <AmountInput value={edit.reorder} placeholder="Reorder at" onChange={(reorder) => setEdit({ ...edit, reorder })} />
            </div>
            <div className="mt-6 flex gap-3">
              <button className="bg-navy px-4 py-2 text-cream">Save</button>
              <button type="button" onClick={() => setEdit(null)} className="text-mist">Cancel</button>
            </div>
          </form>
        </div>
      ) : null}
    </HubShell>
  );
}
