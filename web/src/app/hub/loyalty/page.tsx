"use client";

import { useEffect, useState } from "react";
import { HubShell } from "@/components/hub/HubShell";
import type { Customer, StaffRole } from "@/lib/types";
import { prettyDate } from "@/lib/format";

export default function LoyaltyPage() {
  const [list, setList] = useState<Customer[]>([]);
  const [q, setQ] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [editing, setEditing] = useState<Customer | null>(null);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [role, setRole] = useState<StaffRole>("staff");

  async function load() {
    const res = await fetch("/api/hub/customers");
    if (res.ok) setList(await res.json());
  }
  useEffect(() => {
    load();
    fetch("/api/auth/status")
      .then((r) => r.json())
      .then((data) => {
        if (data.role === "owner" || data.role === "staff") setRole(data.role);
      });
  }, []);

  const filtered = list.filter((c) => {
    const s = q.toLowerCase();
    return !s || c.name.toLowerCase().includes(s) || c.phone.includes(q.replace(/\D/g, ""));
  });

  async function add(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/hub/customers", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name, phone }),
    });
    setName("");
    setPhone("");
    load();
  }

  async function stamp(id: string, delta: number) {
    await fetch(`/api/hub/customers/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ stampsDelta: delta }),
    });
    load();
  }

  async function redeem(id: string) {
    await fetch(`/api/hub/customers/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ redeemFree: true }),
    });
    load();
  }

  function openEdit(customer: Customer) {
    setEditing(customer);
    setEditName(customer.name);
    setEditPhone(customer.phone);
    setEditNotes(customer.notes || "");
  }

  async function saveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setBusy(true);
    await fetch(`/api/hub/customers/${editing.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: editName, phone: editPhone, notes: editNotes }),
    });
    setBusy(false);
    setEditing(null);
    load();
  }

  async function remove() {
    if (!editing) return;
    if (!window.confirm(`Delete ${editing.name}? This cannot be undone.`)) return;
    setBusy(true);
    await fetch(`/api/hub/customers/${editing.id}`, { method: "DELETE" });
    setBusy(false);
    setEditing(null);
    load();
  }

  function csv() {
    const rows = [
      ["Name", "Phone", "Stamps", "Visits", "Last visit", "Notes"],
      ...filtered.map((c) => [c.name, c.phone, c.stamps, c.visits, c.lastVisit, c.notes || ""]),
    ];
    const blob = new Blob([rows.map((r) => r.join(",")).join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "apostello-loyalty.csv";
    a.click();
  }

  return (
    <HubShell title="Loyalty">
      <form onSubmit={add} className="mb-6 flex flex-wrap gap-3">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" className="border border-line bg-white px-3 py-2" required />
        <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone" className="border border-line bg-white px-3 py-2" required />
        <button className="bg-navy px-4 py-2 text-[12px] uppercase tracking-[0.16em] text-cream">Add</button>
        <button type="button" onClick={csv} className="border border-navy px-4 py-2 text-[12px] uppercase tracking-[0.16em] text-navy">Export CSV</button>
      </form>
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name or phone" className="mb-4 w-full max-w-md border border-line bg-white px-3 py-2" />
      <div className="table-wrap border border-line bg-white">
        <table>
          <thead>
            <tr><th>Name</th><th>Phone</th><th>Stamps</th><th>Visits</th><th>Last</th><th></th></tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id}>
                <td className="font-medium text-navy">
                  <button type="button" onClick={() => openEdit(c)} className="text-left underline-offset-2 hover:underline">
                    {c.name}
                  </button>
                  {c.notes ? <p className="mt-1 max-w-xs truncate text-xs font-normal text-mist">{c.notes}</p> : null}
                </td>
                <td>{c.phone}</td>
                <td>{c.stamps}</td>
                <td>{c.visits}</td>
                <td>{prettyDate(c.lastVisit)}</td>
                <td className="space-x-2 text-sm">
                  <button type="button" onClick={() => stamp(c.id, 1)} className="text-navy">+1</button>
                  <button type="button" onClick={() => stamp(c.id, -1)} className="text-mist">−1</button>
                  <button type="button" onClick={() => redeem(c.id)} className="text-navy">Redeem</button>
                  <button type="button" onClick={() => openEdit(c)} className="text-mist">Edit</button>
                </td>
              </tr>
            ))}
            {!filtered.length ? <tr><td colSpan={6} className="py-10 text-center text-mist">No customers yet. They can join on the iPad kiosk.</td></tr> : null}
          </tbody>
        </table>
      </div>

      {editing ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-navy/40 p-5">
          <form onSubmit={saveEdit} className="w-full max-w-md border border-line bg-white p-6">
            <h2 className="font-display text-2xl text-navy">Edit customer</h2>
            <label className="mt-4 block text-sm text-mist">Name
              <input value={editName} onChange={(e) => setEditName(e.target.value)} className="mt-1 w-full border border-line px-3 py-2 text-navy" required />
            </label>
            <label className="mt-3 block text-sm text-mist">Phone
              <input value={editPhone} onChange={(e) => setEditPhone(e.target.value)} className="mt-1 w-full border border-line px-3 py-2 text-navy" required />
            </label>
            <label className="mt-3 block text-sm text-mist">Notes
              <textarea value={editNotes} onChange={(e) => setEditNotes(e.target.value)} rows={3} className="mt-1 w-full border border-line px-3 py-2 text-navy" />
            </label>
            <div className="mt-6 flex flex-wrap gap-3">
              <button disabled={busy} className="bg-navy px-4 py-2 text-[12px] uppercase tracking-[0.16em] text-cream disabled:opacity-60">Save</button>
              <button type="button" onClick={() => setEditing(null)} className="px-4 py-2 text-[12px] uppercase tracking-[0.16em] text-mist">Cancel</button>
              {role === "owner" ? (
                <button type="button" onClick={remove} disabled={busy} className="ml-auto px-4 py-2 text-[12px] uppercase tracking-[0.16em] text-red-700 disabled:opacity-60">Delete</button>
              ) : null}
            </div>
          </form>
        </div>
      ) : null}
    </HubShell>
  );
}
