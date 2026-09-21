"use client";

import { useEffect, useRef, useState } from "react";
import { HubShell } from "@/components/hub/HubShell";
import type { SiteContent, SiteReview, TeamPerson } from "@/lib/types";
import { DEFAULT_SITE, SITE_PHOTO_SLOTS } from "@/lib/site";
import { toast } from "@/lib/toast";

const GROUPS = ["Home", "About", "Events", "Gallery"] as const;

export default function HubSitePage() {
  const [site, setSite] = useState<SiteContent>(DEFAULT_SITE);
  const [ready, setReady] = useState(false);
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
    const res = await fetch("/api/hub/site", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(next),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      toast(data.error || "Could not save", "error");
      return;
    }
    siteRef.current = data;
    setSite(data);
    toast(okMessage);
  }

  async function saveSpecial(e: React.FormEvent) {
    e.preventDefault();
    const current = siteRef.current;
    if (current.special.active && !current.special.name.trim() && !current.special.imagePath) {
      toast("Add a name or a photo before showing this on the website", "error");
      return;
    }
    await saveSite(
      current,
      current.special.active ? "Special is on the website — scroll past the film, or open the menu" : "Special saved (hidden on the website)",
    );
  }

  async function upload(file: File, target: "special" | string) {
    setUploading(target);
    const body = new FormData();
    body.append("file", file);
    body.append("folder", "site");
    const res = await fetch("/api/hub/upload", { method: "POST", body });
    const data = await res.json().catch(() => ({}));
    setUploading("");
    if (!res.ok) {
      toast(data.error || "Could not upload that photo", "error");
      return;
    }
    const current = siteRef.current;
    const next = withPhoto(current, target, data.path);
    siteRef.current = next;
    setSite(next);
    await saveSite(next, "Photo saved");
  }

  async function clearPhoto(target: "special" | string) {
    const current = siteRef.current;
    const next = withPhoto(current, target, "");
    siteRef.current = next;
    setSite(next);
    await saveSite(next, "Photo removed");
  }

  if (!ready) return <HubShell title="Site"><p className="text-mist">Loading…</p></HubShell>;

  return (
    <HubShell title="Site">
      <p className="mb-8 max-w-2xl text-sm text-mist">
        Today’s special, photos, the team on About, and the reviews list. Staff do not see this page.
      </p>

      <form onSubmit={saveSpecial} className="max-w-2xl border border-line bg-white p-5">
        <h2 className="font-display text-xl text-navy">Today</h2>
        <p className="mt-1 text-sm text-mist">Turn this on, type the name, then Save special. It shows on the homepage film and across the bottom of the menu board.</p>
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

      <TeamEditor
        team={site.team}
        busy={busy}
        uploading={uploading}
        onChange={(team) => setSite({ ...site, team })}
        onSave={(team) => saveSite({ ...siteRef.current, team }, "Team saved")}
        onUpload={(file, id) => upload(file, `team:${id}`)}
        onClear={(id) => clearPhoto(`team:${id}`)}
      />

      <ReviewsEditor
        reviews={site.reviews}
        busy={busy}
        onChange={(reviews) => setSite({ ...site, reviews })}
        onSave={(reviews) => saveSite({ ...siteRef.current, reviews }, "Reviews saved")}
      />
    </HubShell>
  );
}

function withPhoto(current: SiteContent, target: "special" | string, imagePath: string): SiteContent {
  if (target === "special") {
    return { ...current, special: { ...current.special, imagePath } };
  }
  if (target.startsWith("team:")) {
    const id = target.slice(5);
    return {
      ...current,
      team: current.team.map((person) => (person.id === id ? { ...person, imagePath } : person)),
    };
  }
  return { ...current, photos: { ...current.photos, [target]: imagePath } };
}

function TeamEditor({
  team,
  busy,
  uploading,
  onChange,
  onSave,
  onUpload,
  onClear,
}: {
  team: TeamPerson[];
  busy: boolean;
  uploading: string;
  onChange: (team: TeamPerson[]) => void;
  onSave: (team: TeamPerson[]) => Promise<void>;
  onUpload: (file: File, id: string) => void;
  onClear: (id: string) => void;
}) {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");

  function addPerson(e: React.FormEvent) {
    e.preventDefault();
    const nextName = name.trim();
    if (!nextName) return;
    const person: TeamPerson = {
      id: `t-${Date.now().toString(36)}`,
      name: nextName,
      role: role.trim(),
      imagePath: "",
    };
    const next = [...team, person];
    onChange(next);
    setName("");
    setRole("");
    void onSave(next);
  }

  return (
    <div className="mt-12 max-w-2xl">
      <h2 className="font-display text-xl text-navy">Meet the team</h2>
      <p className="mt-1 text-sm text-mist">
        Names and photos on the About page. This is the café face, not hub logins — those stay in Settings.
      </p>
      <div className="mt-5 space-y-4">
        {team.map((person) => (
          <div key={person.id} className="border border-line bg-white p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-sm text-mist">Name
                <input
                  value={person.name}
                  onChange={(e) => onChange(team.map((row) => (row.id === person.id ? { ...row, name: e.target.value } : row)))}
                  className="mt-1 w-full border border-line px-3 py-2 text-navy"
                />
              </label>
              <label className="text-sm text-mist">Role
                <input
                  value={person.role}
                  onChange={(e) => onChange(team.map((row) => (row.id === person.id ? { ...row, role: e.target.value } : row)))}
                  className="mt-1 w-full border border-line px-3 py-2 text-navy"
                />
              </label>
            </div>
            <PhotoDrop
              path={person.imagePath}
              busy={uploading === `team:${person.id}`}
              onFile={(file) => onUpload(file, person.id)}
              onClear={() => onClear(person.id)}
            />
            <div className="mt-3 flex flex-wrap gap-3">
              <button
                type="button"
                disabled={busy}
                onClick={() => onSave(team)}
                className="bg-navy px-4 py-2 text-[12px] uppercase tracking-[0.16em] text-cream disabled:opacity-60"
              >
                Save
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  const next = team.filter((row) => row.id !== person.id);
                  onChange(next);
                  void onSave(next);
                }}
                className="px-3 py-2 text-[12px] uppercase tracking-[0.16em] text-red-700 disabled:opacity-60"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={addPerson} className="mt-6 grid gap-3 border border-line bg-white p-4">
        <h3 className="font-display text-lg text-navy">Add someone</h3>
        <label className="text-sm text-mist">Name
          <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full border border-line px-3 py-2 text-navy" required />
        </label>
        <label className="text-sm text-mist">Role
          <input value={role} onChange={(e) => setRole(e.target.value)} className="mt-1 w-full border border-line px-3 py-2 text-navy" />
        </label>
        <button disabled={busy} className="w-fit bg-navy px-5 py-2 text-[12px] uppercase tracking-[0.16em] text-cream disabled:opacity-60">
          Add to About
        </button>
      </form>
    </div>
  );
}

function ReviewsEditor({
  reviews,
  busy,
  onChange,
  onSave,
}: {
  reviews: SiteReview[];
  busy: boolean;
  onChange: (reviews: SiteReview[]) => void;
  onSave: (reviews: SiteReview[]) => Promise<void>;
}) {
  const [quote, setQuote] = useState("");
  const [name, setName] = useState("");

  function addReview(e: React.FormEvent) {
    e.preventDefault();
    const nextQuote = quote.trim();
    if (!nextQuote) return;
    const next = [...reviews, { id: `r-${Date.now().toString(36)}`, quote: nextQuote, name: name.trim() }];
    onChange(next);
    setQuote("");
    setName("");
    void onSave(next);
  }

  return (
    <div className="mt-12 max-w-2xl">
      <h2 className="font-display text-xl text-navy">Reviews</h2>
      <p className="mt-1 text-sm text-mist">
        A short curated list for the Reviews page and About. Google stays the place guests write new ones — add the listing and write-a-review URLs in Settings.
      </p>
      <div className="mt-5 space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className="border border-line bg-white p-4">
            <label className="text-sm text-mist">Quote
              <textarea
                value={review.quote}
                onChange={(e) => onChange(reviews.map((row) => (row.id === review.id ? { ...row, quote: e.target.value } : row)))}
                rows={3}
                className="mt-1 w-full border border-line px-3 py-2 text-navy"
              />
            </label>
            <label className="mt-3 block text-sm text-mist">Name
              <input
                value={review.name}
                onChange={(e) => onChange(reviews.map((row) => (row.id === review.id ? { ...row, name: e.target.value } : row)))}
                className="mt-1 w-full border border-line px-3 py-2 text-navy"
              />
            </label>
            <div className="mt-3 flex flex-wrap gap-3">
              <button
                type="button"
                disabled={busy}
                onClick={() => onSave(reviews)}
                className="bg-navy px-4 py-2 text-[12px] uppercase tracking-[0.16em] text-cream disabled:opacity-60"
              >
                Save
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  const next = reviews.filter((row) => row.id !== review.id);
                  onChange(next);
                  void onSave(next);
                }}
                className="px-3 py-2 text-[12px] uppercase tracking-[0.16em] text-red-700 disabled:opacity-60"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={addReview} className="mt-6 grid gap-3 border border-line bg-white p-4">
        <h3 className="font-display text-lg text-navy">Add a line</h3>
        <label className="text-sm text-mist">Quote
          <textarea value={quote} onChange={(e) => setQuote(e.target.value)} rows={3} className="mt-1 w-full border border-line px-3 py-2 text-navy" required />
        </label>
        <label className="text-sm text-mist">Name
          <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full border border-line px-3 py-2 text-navy" />
        </label>
        <button disabled={busy} className="w-fit bg-navy px-5 py-2 text-[12px] uppercase tracking-[0.16em] text-cream disabled:opacity-60">
          Add review
        </button>
      </form>
    </div>
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
