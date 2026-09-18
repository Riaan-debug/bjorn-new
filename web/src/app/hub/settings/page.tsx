"use client";

import { useEffect, useState } from "react";
import { HubShell } from "@/components/hub/HubShell";
import { AmountInput } from "@/components/hub/AmountInput";
import type { Settings, StaffMember, StaffRole } from "@/lib/types";

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [accounts, setAccounts] = useState<StaffMember[]>([]);
  const [staffId, setStaffId] = useState("");
  const [msg, setMsg] = useState("");
  const [teamMsg, setTeamMsg] = useState("");
  const [teamBusy, setTeamBusy] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [newRole, setNewRole] = useState<StaffRole>("staff");
  const [resetId, setResetId] = useState<string | null>(null);
  const [resetPin, setResetPin] = useState("");
  const [resetConfirm, setResetConfirm] = useState("");

  async function loadTeam() {
    const [settingsRes, accountsRes, statusRes] = await Promise.all([
      fetch("/api/hub/settings"),
      fetch("/api/auth/accounts"),
      fetch("/api/auth/status"),
    ]);
    if (settingsRes.ok) setSettings(await settingsRes.json());
    if (accountsRes.ok) setAccounts(await accountsRes.json());
    if (statusRes.ok) {
      const status = await statusRes.json();
      setStaffId(String(status.staffId || ""));
    }
  }

  useEffect(() => {
    loadTeam();
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!settings) return;
    const res = await fetch("/api/hub/settings", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(settings),
    });
    setMsg(res.ok ? "Saved" : "Could not save");
  }

  async function download() {
    const res = await fetch("/api/hub/backup");
    const data = await res.json();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
    a.download = "apostello-backup.json";
    a.click();
  }

  async function upload(file: File) {
    const data = JSON.parse(await file.text());
    const res = await fetch("/api/hub/backup", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(data),
    });
    setMsg(res.ok ? "Backup imported" : "Could not import backup");
  }

  async function addPerson(e: React.FormEvent) {
    e.preventDefault();
    setTeamMsg("");
    if (newPin !== confirmPin) {
      setTeamMsg("PINs do not match");
      return;
    }
    setTeamBusy(true);
    const res = await fetch("/api/auth/accounts", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: newName, pin: newPin, role: newRole }),
    });
    const data = await res.json().catch(() => ({}));
    setTeamBusy(false);
    if (!res.ok) {
      setTeamMsg(data.error || "Could not add this person");
      return;
    }
    setAccounts(data);
    setNewName("");
    setNewPin("");
    setConfirmPin("");
    setNewRole("staff");
    setTeamMsg("Added");
  }

  async function savePerson(account: StaffMember, name: string, role: StaffRole) {
    const next = name.trim();
    if (!next) {
      setTeamMsg("Enter a name");
      return;
    }
    setTeamBusy(true);
    setTeamMsg("");
    const res = await fetch("/api/auth/accounts", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id: account.id, name: next, role }),
    });
    const data = await res.json().catch(() => ({}));
    setTeamBusy(false);
    if (!res.ok) {
      setTeamMsg(data.error || "Could not save this person");
      return;
    }
    setAccounts(data);
    setTeamMsg("Saved");
    window.dispatchEvent(new Event("hub-auth-changed"));
  }

  async function saveReset(e: React.FormEvent) {
    e.preventDefault();
    if (!resetId) return;
    setTeamMsg("");
    if (resetPin !== resetConfirm) {
      setTeamMsg("PINs do not match");
      return;
    }
    setTeamBusy(true);
    const res = await fetch("/api/auth/accounts", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id: resetId, newPin: resetPin }),
    });
    const data = await res.json().catch(() => ({}));
    setTeamBusy(false);
    if (!res.ok) {
      setTeamMsg(data.error || "Could not reset PIN");
      return;
    }
    setAccounts(data);
    setResetId(null);
    setResetPin("");
    setResetConfirm("");
    setTeamMsg("PIN reset");
  }

  async function remove(account: StaffMember) {
    if (!window.confirm(`Remove ${account.name}? They will no longer be able to sign in.`)) return;
    setTeamBusy(true);
    const res = await fetch("/api/auth/accounts", {
      method: "DELETE",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id: account.id }),
    });
    const data = await res.json().catch(() => ({}));
    setTeamBusy(false);
    if (!res.ok) {
      setTeamMsg(data.error || "Could not remove this person");
      return;
    }
    setAccounts(data);
    if (resetId === account.id) setResetId(null);
  }

  if (!settings) return <HubShell title="Settings"><p className="text-mist">Loading…</p></HubShell>;

  const fields: { key: keyof Settings; label: string; type?: string }[] = [
    { key: "businessName", label: "Business name" },
    { key: "slogan", label: "Slogan" },
    { key: "location", label: "Location label" },
    { key: "address", label: "Address" },
    { key: "tradingHours", label: "Trading hours" },
    { key: "publicPhone", label: "Public phone" },
    { key: "publicEmail", label: "Public email" },
    { key: "instagramUrl", label: "Instagram URL" },
    { key: "whatsappUrl", label: "WhatsApp URL" },
    { key: "googleBizUrl", label: "Google Business URL" },
    { key: "coffeeBlend", label: "Coffee blend" },
    { key: "coffeeNotes", label: "Coffee notes" },
  ];

  return (
    <HubShell title="Settings">
      <form onSubmit={save} className="grid max-w-2xl gap-4">
        {fields.map((field) => (
          <label key={field.key} className="text-sm text-mist">
            {field.label}
            <input
              value={String(settings[field.key] ?? "")}
              onChange={(e) => setSettings({ ...settings, [field.key]: e.target.value })}
              className="mt-1 w-full border border-line bg-white px-3 py-2 text-navy"
            />
          </label>
        ))}
        <label className="text-sm text-mist">Daily cup target
          <AmountInput value={settings.dailyCupTarget} onChange={(dailyCupTarget) => setSettings({ ...settings, dailyCupTarget })} className="mt-1 w-full border border-line bg-white px-3 py-2 text-navy" />
        </label>
        <label className="text-sm text-mist">Free drink after stamps
          <AmountInput value={settings.loyaltyFreeAt} min={3} onChange={(loyaltyFreeAt) => setSettings({ ...settings, loyaltyFreeAt })} className="mt-1 w-full border border-line bg-white px-3 py-2 text-navy" />
        </label>
        <button className="w-fit bg-navy px-5 py-2 text-[12px] uppercase tracking-[0.16em] text-cream">Save settings</button>
        {msg ? <p className="text-sm text-navy">{msg}</p> : null}
      </form>

      <div className="mt-12 max-w-2xl border-t border-line pt-10">
        <h2 className="font-display text-xl text-navy">Team</h2>
        <p className="mt-1 text-sm text-mist">
          Each person has their own 4–8 digit PIN. Staff can use Loyalty, Stock, Daily, and the kiosk. Owners also get Menu, Settings, and backup.
        </p>
        <div className="mt-5 space-y-3">
          {accounts.map((account) => (
            <TeamRow
              key={account.id}
              account={account}
              isYou={account.id === staffId}
              busy={teamBusy}
              resetOpen={resetId === account.id}
              resetPin={resetPin}
              resetConfirm={resetConfirm}
              onResetPin={setResetPin}
              onResetConfirm={setResetConfirm}
              onToggleReset={() => {
                setResetId(resetId === account.id ? null : account.id);
                setResetPin("");
                setResetConfirm("");
                setTeamMsg("");
              }}
              onSave={(name, role) => savePerson(account, name, role)}
              onRemove={() => remove(account)}
              onSavePin={saveReset}
            />
          ))}
        </div>
        <form onSubmit={addPerson} className="mt-6 grid gap-4 border border-line bg-white p-4">
          <h3 className="font-display text-lg text-navy">Add someone</h3>
          <label className="text-sm text-mist">Name
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="mt-1 w-full border border-line px-3 py-2 text-navy"
              required
            />
          </label>
          <label className="text-sm text-mist">Role
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value as StaffRole)}
              className="mt-1 w-full border border-line bg-white px-3 py-2 text-navy"
            >
              <option value="staff">Staff</option>
              <option value="owner">Owner</option>
            </select>
          </label>
          <label className="text-sm text-mist">PIN
            <input
              type="password"
              inputMode="numeric"
              autoComplete="off"
              value={newPin}
              onChange={(e) => setNewPin(e.target.value.replace(/\D/g, "").slice(0, 8))}
              className="mt-1 w-full border border-line px-3 py-2 text-navy"
              required
            />
          </label>
          <label className="text-sm text-mist">Confirm PIN
            <input
              type="password"
              inputMode="numeric"
              autoComplete="off"
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, "").slice(0, 8))}
              className="mt-1 w-full border border-line px-3 py-2 text-navy"
              required
            />
          </label>
          <button disabled={teamBusy} className="w-fit bg-navy px-5 py-2 text-[12px] uppercase tracking-[0.16em] text-cream disabled:opacity-60">
            Add to team
          </button>
        </form>
        {teamMsg ? <p className="mt-4 text-sm text-navy">{teamMsg}</p> : null}
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <button type="button" onClick={download} className="border border-navy px-4 py-2 text-[12px] uppercase tracking-[0.16em] text-navy">Download backup</button>
        <label className="border border-navy px-4 py-2 text-[12px] uppercase tracking-[0.16em] text-navy">
          Import JSON
          <input type="file" accept="application/json" className="hidden" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
        </label>
      </div>
    </HubShell>
  );
}

function TeamRow({
  account,
  isYou,
  busy,
  resetOpen,
  resetPin,
  resetConfirm,
  onResetPin,
  onResetConfirm,
  onToggleReset,
  onSave,
  onRemove,
  onSavePin,
}: {
  account: StaffMember;
  isYou: boolean;
  busy: boolean;
  resetOpen: boolean;
  resetPin: string;
  resetConfirm: string;
  onResetPin: (value: string) => void;
  onResetConfirm: (value: string) => void;
  onToggleReset: () => void;
  onSave: (name: string, role: StaffRole) => void;
  onRemove: () => void;
  onSavePin: (e: React.FormEvent) => void;
}) {
  const [name, setName] = useState(account.name);
  const [role, setRole] = useState<StaffRole>(account.role);

  useEffect(() => {
    setName(account.name);
    setRole(account.role);
  }, [account.name, account.role]);

  return (
    <div className="border border-line bg-white p-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSave(name, role);
        }}
        className="flex flex-wrap items-end gap-3"
      >
        <label className="min-w-[10rem] flex-1 text-sm text-mist">Name
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full border border-line px-3 py-2 text-navy"
            required
          />
        </label>
        <label className="text-sm text-mist">Role
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as StaffRole)}
            className="mt-1 block border border-line bg-white px-3 py-2 text-navy"
          >
            <option value="staff">Staff</option>
            <option value="owner">Owner</option>
          </select>
        </label>
        <button disabled={busy} className="bg-navy px-4 py-2 text-[12px] uppercase tracking-[0.16em] text-cream disabled:opacity-60">
          Save
        </button>
        <button
          type="button"
          onClick={onToggleReset}
          className="px-3 py-2 text-[12px] uppercase tracking-[0.16em] text-navy"
        >
          Reset PIN
        </button>
        {isYou ? (
          <span className="px-3 py-2 text-[11px] uppercase tracking-[0.16em] text-mist">You</span>
        ) : (
          <button
            type="button"
            disabled={busy}
            onClick={onRemove}
            className="px-3 py-2 text-[12px] uppercase tracking-[0.16em] text-red-700 disabled:opacity-60"
          >
            Remove
          </button>
        )}
      </form>
      {resetOpen ? (
        <form onSubmit={onSavePin} className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="text-sm text-mist">New PIN
            <input
              type="password"
              inputMode="numeric"
              autoComplete="off"
              value={resetPin}
              onChange={(e) => onResetPin(e.target.value.replace(/\D/g, "").slice(0, 8))}
              className="mt-1 w-full border border-line px-3 py-2 text-navy"
              required
            />
          </label>
          <label className="text-sm text-mist">Confirm PIN
            <input
              type="password"
              inputMode="numeric"
              autoComplete="off"
              value={resetConfirm}
              onChange={(e) => onResetConfirm(e.target.value.replace(/\D/g, "").slice(0, 8))}
              className="mt-1 w-full border border-line px-3 py-2 text-navy"
              required
            />
          </label>
          <button disabled={busy} className="w-fit bg-navy px-4 py-2 text-[12px] uppercase tracking-[0.16em] text-cream disabled:opacity-60">
            Save PIN
          </button>
        </form>
      ) : null}
    </div>
  );
}
