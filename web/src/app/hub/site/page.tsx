"use client";

import { useEffect, useRef, useState } from "react";
import { HubShell } from "@/components/hub/HubShell";
import type { SiteContent } from "@/lib/types";
import { DEFAULT_SITE, SITE_PHOTO_SLOTS } from "@/lib/site";

const GROUPS = ["Home", "About", "Events", "Gallery"] as const;

export default function HubSitePage() {
  const [site, setSite] = useState<SiteContent>(DEFAULT_SITE);
  const [ready, setReady] = useState(false);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState("");
  const siteRef = useRef(site);
  siteRef.current = site;

  async function load() {
    const res = await fetch("/api/hub/site");
    if (res.ok) setSite(await res.json());
    setReady(true);
  }

  useEffect(() => {
    load();
  }, []);

  async function saveSite(next: SiteContent, okMessage: string) {
    setBusy(true);
    setMsg("");
    const res = await fetch("/api/hub/site", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(next),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setMsg(data.error || "Could not save");
      return;
    }
    siteRef.current = data;
    setSite(data);
    setMsg(okMessage);
  }

  async function saveSpecial(e: React.FormEvent) {
    e.preventDefault();
    const current = siteRef.current;
    if (current.special.active && !current.special.name.trim() && !current.special.imagePath) {
      setMsg("Add a name or a photo before showing this on the website");
      return;
    }
    await saveSite(
      current,
      current.special.active ? "Special is on the website — scroll past the film, or open the menu" : "Special saved (hidden on the website)",
    );
  }

  async function upload(file: File, target: "special" | string) {
    setUploading(target);
    setMsg("");
    const body = new FormData();
    body.append("file", file);
    body.append("folder", "site");
    const res = await fetch("/api/hub/upload", { method: "POST", body });
    const data = await res.json().catch(() => ({}));
    setUploading("");
    if (!res.ok) {
      setMsg(data.error || "Could not upload that photo");
      return;
    }
    const current = siteRef.current;
    const next: SiteContent = target === "special"
      ? { ...current, special: { ...current.special, imagePath: data.path } }
      : { ...current, photos: { ...current.photos, [target]: data.path } };
    siteRef.current = next;
    setSite(next);
    await saveSite(next, "Photo saved");
  }

  async function clearPhoto(target: "special" | string) {
    const current = siteRef.current;
    const next: SiteContent = target === "special"
      ? { ...current, special: { ...current.special, imagePath: "" } }
      : { ...current, photos: { ...current.photos, [target]: "" } };
    siteRef.current = next;
    setSite(next);
    await saveSite(next, "Photo removed");
  }

  if (!ready) return <HubShell title="Site"><p className="text-mist">Loading…</p></HubShell>;

  return (
    <HubShell title="Site">
      <p className="mb-8 max-w-2xl text-sm text-mist">
        Today’s special and the photos guests see on the website. Staff do not see this page.
      </p>

      <form onSubmit={saveSpecial} className="max-w-2xl border border-line bg-white p-5">
        <h2 className="font-display text-xl text-navy">Today</h2>
        <p className="mt-1 text-sm text-mist">Turn this on, type the name, then Save special. It shows on the homepage film and on the menu.</p>
        <label className="mt-4 flex items-center gap-2 text-sm text-navy">
          <input
            type="checkbox"
            checked={site.special.active}
            onChange={(e) => setSite({ ...site, special: { ...site.special, active: e.target.checked } })}
          />
          Show on website
        </label>
        <label className="mt-4 block text-sm text-mist">Name
          <input
            value={site.special.name}
            onChange={(e) => setSite({ ...site, special: { ...site.special, name: e.target.value } })}
            className="mt-1 w-full border border-line px-3 py-2 text-navy"
            placeholder="Name of the drink or dish"
          />
        </label>
        <label className="mt-3 block text-sm text-mist">A line of copy
          <textarea
            value={site.special.blurb}
            onChange={(e) => setSite({ ...site, special: { ...site.special, blurb: e.target.value } })}
            rows={2}
            className="mt-1 w-full border border-line px-3 py-2 text-navy"
            placeholder="Optional — a short line guests will see"
          />
        </label>
        <PhotoDrop
          path={site.special.imagePath}
          busy={uploading === "special"}
          onFile={(file) => upload(file, "special")}
          onClear={() => clearPhoto("special")}
        />
        <button disabled={busy} className="mt-4 bg-navy px-5 py-2 text-[12px] uppercase tracking-[0.16em] text-cream disabled:opacity-60">
          Save special
        </button>
      </form>

      <div className="mt-12 max-w-4xl">
        <h2 className="font-display text-xl text-navy">Pictures</h2>
        <p className="mt-1 text-sm text-mist">Each box is a slot on the site. Drop a photo onto it. Empty slots stay as placeholders.</p>
        {GROUPS.map((group) => (
          <section key={group} className="mt-8">
            <h3 className="text-[11px] uppercase tracking-[0.22em] text-mist">{group}</h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {SITE_PHOTO_SLOTS.filter((slot) => slot.group === group).map((slot) => (
                <div key={slot.id} className="border border-line bg-white p-4">
                  <p className="text-sm text-navy">{slot.label}</p>
                  <PhotoDrop
                    path={site.photos[slot.id] || ""}
                    busy={uploading === slot.id}
                    onFile={(file) => upload(file, slot.id)}
                    onClear={() => clearPhoto(slot.id)}
                  />
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
      {msg ? <p className="mt-6 text-sm text-navy">{msg}</p> : null}
    </HubShell>
  );
}

function PhotoDrop({
  path,
  busy,
  onFile,
  onClear,
}: {
  path: string;
  busy: boolean;
  onFile: (file: File) => void;
  onClear: () => void;
}) {
  const [over, setOver] = useState(false);
  return (
    <div className="mt-3">
      <label
        onDragOver={(e) => { e.preventDefault(); setOver(true); }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          const file = e.dataTransfer.files[0];
          if (file) onFile(file);
        }}
        className={`block cursor-pointer border border-dashed px-3 py-5 text-center text-sm ${over ? "border-navy bg-cream" : "border-line bg-cream"}`}
      >
        {path ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={path} alt="" className="mx-auto mb-3 h-28 w-full max-w-xs object-cover" />
        ) : null}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,.jpg,.jpeg,.png,.webp,.gif"
          className="sr-only"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onFile(file);
            e.target.value = "";
          }}
        />
        <span className="text-navy">
          {busy ? "Uploading…" : path ? "Drop a new photo, or click to choose one" : "Drop a photo here, or click to choose"}
        </span>
      </label>
      {path ? (
        <button type="button" onClick={onClear} className="mt-2 text-sm text-mist">
          Remove photo
        </button>
      ) : null}
    </div>
  );
}
