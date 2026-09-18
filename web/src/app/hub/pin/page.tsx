"use client";

import { useState } from "react";
import { HubShell } from "@/components/hub/HubShell";

export default function ChangePinPage() {
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function changePin(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    if (newPin !== confirmPin) {
      setMsg("New PINs do not match");
      return;
    }
    setBusy(true);
    const res = await fetch("/api/auth/pin", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ currentPin, newPin }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setMsg(data.error || "Could not change PIN");
      return;
    }
    setCurrentPin("");
    setNewPin("");
    setConfirmPin("");
    setMsg("PIN updated");
  }

  return (
    <HubShell title="Your PIN">
      <form onSubmit={changePin} className="grid max-w-2xl gap-4">
        <p className="text-sm text-mist">This changes only your PIN. It is never shown after you save.</p>
        <label className="text-sm text-mist">Current PIN
          <input
            type="password"
            inputMode="numeric"
            autoComplete="off"
            value={currentPin}
            onChange={(e) => setCurrentPin(e.target.value.replace(/\D/g, "").slice(0, 8))}
            className="mt-1 w-full border border-line bg-white px-3 py-2 text-navy"
            required
          />
        </label>
        <label className="text-sm text-mist">New PIN
          <input
            type="password"
            inputMode="numeric"
            autoComplete="new-password"
            value={newPin}
            onChange={(e) => setNewPin(e.target.value.replace(/\D/g, "").slice(0, 8))}
            className="mt-1 w-full border border-line bg-white px-3 py-2 text-navy"
            required
          />
        </label>
        <label className="text-sm text-mist">Confirm new PIN
          <input
            type="password"
            inputMode="numeric"
            autoComplete="new-password"
            value={confirmPin}
            onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, "").slice(0, 8))}
            className="mt-1 w-full border border-line bg-white px-3 py-2 text-navy"
            required
          />
        </label>
        <button disabled={busy} className="w-fit bg-navy px-5 py-2 text-[12px] uppercase tracking-[0.16em] text-cream disabled:opacity-60">
          Change PIN
        </button>
        {msg ? <p className="text-sm text-navy">{msg}</p> : null}
      </form>
    </HubShell>
  );
}
