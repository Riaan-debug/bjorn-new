"use client";

import { useEffect, useState } from "react";
import { HubShell } from "@/components/hub/HubShell";
import { AmountInput } from "@/components/hub/AmountInput";
import type { MenuItem } from "@/lib/types";
import { zar } from "@/lib/format";
import { toast } from "@/lib/toast";

const empty: MenuItem = {
  id: "",
  name: "",
  kind: "drink",
  cat: "Espresso",
  description: "",
  active: true,
  featured: false,
  imagePath: "",
  sizes: [{ sz: "M", label: "Regular", price: 0 }],
};

export default function HubMenuPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [edit, setEdit] = useState<MenuItem | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [q, setQ] = useState("");
  const [kind, setKind] = useState<"all" | "drink" | "food">("all");

  async function load() {
    const res = await fetch("/api/hub/menu");
    if (res.ok) setItems(await res.json());
  }
  useEffect(() => { load(); }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!edit) return;
    const res = await fetch("/api/hub/menu", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(edit),
    });
    if (!res.ok) {
      toast("Could not save", "error");
      return;
    }
    setEdit(null);
    toast("Saved");
    load();
  }

  async function remove(id: string) {
    if (!confirm("Remove this item from the menu?")) return;
    const res = await fetch("/api/hub/menu", {
      method: "DELETE",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (!res.ok) {
      toast("Could not remove that item", "error");
      return;
    }
    toast("Removed");
    load();
  }

  async function uploadPhoto(file: File) {
    setUploadError("");
    setUploading(true);
    const body = new FormData();
    body.append("file", file);
    const res = await fetch("/api/hub/upload", { method: "POST", body });
    const data = await res.json().catch(() => ({}));
    setUploading(false);
    if (!res.ok) {
      setUploadError(data.error || "Could not upload that photo");
      return;
    }
    setEdit((current) => (current ? { ...current, imagePath: data.path } : current));
  }

  const filtered = items.filter((item) => {
    if (kind !== "all" && item.kind !== kind) return false;
    const s = q.trim().toLowerCase();
    if (!s) return true;
    return (
      item.name.toLowerCase().includes(s) ||
      item.cat.toLowerCase().includes(s) ||
      item.description.toLowerCase().includes(s)
    );
  });

  return (
    <HubShell title="Menu">
      <p className="mb-6 text-sm text-mist">This list is what guests see on the public website. Drop a photo onto an item, or choose one from your computer.</p>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <button type="button" onClick={() => { setUploadError(""); setEdit({ ...empty }); }} className="bg-navy px-4 py-2 text-[12px] uppercase tracking-[0.16em] text-cream">
          Add item
        </button>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name or category"
          className="min-w-[200px] flex-1 border border-line bg-white px-3 py-2"
        />
        <div className="flex gap-1">
          {([
            ["all", "All"],
            ["drink", "Drinks"],
            ["food", "Food"],
          ] as const).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setKind(value)}
              className={`px-3 py-2 text-[12px] uppercase tracking-[0.16em] ${kind === value ? "bg-navy text-cream" : "border border-navy text-navy"}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {filtered.map((item) => (
          <button key={item.id} type="button" onClick={() => { setUploadError(""); setEdit(item); }} className={`border p-4 text-left ${item.active ? "border-line bg-white" : "border-line bg-cream opacity-60"}`}>
            <div className="flex min-w-0 items-start gap-3">
              {item.imagePath ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.imagePath} alt="" className="h-14 w-14 shrink-0 object-cover" />
              ) : null}
              <p className="font-display text-lg text-navy">{item.name}</p>
            </div>
            <p className="mt-1 text-xs uppercase tracking-[0.16em] text-mist">{item.kind} · {item.cat}{item.featured ? " · Featured" : ""}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {item.sizes.map((size) => (
                <span key={`${item.id}-${size.label}`} className="border border-line bg-cream px-2 py-1 text-[11px] font-semibold text-navy">
                  {size.label} {zar(size.price)}
                </span>
              ))}
            </div>
            <p className="mt-2 text-sm text-mist">{item.description}</p>
          </button>
        ))}
        {!filtered.length ? (
          <p className="border border-line bg-white p-8 text-center text-mist md:col-span-2">
            {items.length ? "No items match that search." : "Loading…"}
          </p>
        ) : null}
      </div>
      {edit ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-navy/40 p-4">
          <form
            onSubmit={save}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => e.preventDefault()}
            className="max-h-[90vh] w-full max-w-lg overflow-auto bg-cream p-6"
          >
            <h2 className="font-display text-2xl text-navy">{edit.id ? "Edit item" : "New item"}</h2>
            <div className="mt-4 grid gap-3">
              <input value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} placeholder="Name" className="border border-line bg-white px-3 py-2" required />
              <div className="grid grid-cols-2 gap-3">
                <select value={edit.kind} onChange={(e) => setEdit({ ...edit, kind: e.target.value as MenuItem["kind"] })} className="border border-line bg-white px-3 py-2">
                  <option value="drink">Drink</option>
                  <option value="food">Food</option>
                </select>
                <input value={edit.cat} onChange={(e) => setEdit({ ...edit, cat: e.target.value })} placeholder="Category" className="border border-line bg-white px-3 py-2" />
              </div>
              <textarea value={edit.description} onChange={(e) => setEdit({ ...edit, description: e.target.value })} placeholder="Description" className="border border-line bg-white px-3 py-2" />
              <label
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  const file = e.dataTransfer.files[0];
                  if (file) uploadPhoto(file);
                }}
                className={`block cursor-pointer border border-dashed px-3 py-6 text-center text-sm ${dragOver ? "border-navy bg-white" : "border-line bg-white"}`}
              >
                {edit.imagePath ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={edit.imagePath} alt="" className="mx-auto mb-3 h-32 w-full max-w-xs object-cover" />
                ) : null}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif,.jpg,.jpeg,.png,.webp,.gif"
                  className="sr-only"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) uploadPhoto(file);
                    e.target.value = "";
                  }}
                />
                <span className="text-navy">
                  {uploading ? "Uploading…" : edit.imagePath ? "Drop a new photo, or click to choose one" : "Drop a photo here, or click to choose from your computer"}
                </span>
              </label>
              {edit.imagePath ? (
                <button type="button" className="text-left text-sm text-mist" onClick={() => setEdit({ ...edit, imagePath: "" })}>
                  Remove photo
                </button>
              ) : null}
              {uploadError ? <p className="text-sm text-red-700">{uploadError}</p> : null}
              <label className="flex gap-2 text-sm"><input type="checkbox" checked={edit.active} onChange={(e) => setEdit({ ...edit, active: e.target.checked })} /> Active on website</label>
              <label className="flex gap-2 text-sm"><input type="checkbox" checked={edit.featured} onChange={(e) => setEdit({ ...edit, featured: e.target.checked })} /> Featured on home</label>
              {edit.sizes.map((size, i) => (
                <div key={i} className="grid grid-cols-3 gap-2">
                  <input value={size.label} onChange={(e) => {
                    const sizes = [...edit.sizes];
                    sizes[i] = { ...sizes[i], label: e.target.value };
                    setEdit({ ...edit, sizes });
                  }} placeholder="Label" className="border border-line bg-white px-3 py-2" />
                  <AmountInput
                    value={size.price}
                    placeholder="Price"
                    onChange={(price) => {
                      const sizes = [...edit.sizes];
                      sizes[i] = { ...sizes[i], price };
                      setEdit({ ...edit, sizes });
                    }}
                  />
                  <button type="button" className="text-sm text-mist" onClick={() => setEdit({ ...edit, sizes: edit.sizes.filter((_, idx) => idx !== i) })}>Remove</button>
                </div>
              ))}
              <button type="button" className="text-left text-sm text-navy" onClick={() => setEdit({ ...edit, sizes: [...edit.sizes, { sz: "M", label: "New", price: 0 }] })}>
                Add size
              </button>
            </div>
            <div className="mt-6 flex gap-3">
              <button className="bg-navy px-4 py-2 text-cream">Save</button>
              <button type="button" onClick={() => setEdit(null)} className="px-4 py-2 text-mist">Cancel</button>
              {edit.id ? <button type="button" onClick={() => remove(edit.id)} className="ml-auto text-red-700">Delete</button> : null}
            </div>
          </form>
        </div>
      ) : null}
    </HubShell>
  );
}
