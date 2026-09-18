"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Wordmark } from "@/components/site/Wordmark";

export default function HubLoginPage() {
  const router = useRouter();
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch("/api/auth/status")
      .then((r) => r.json())
      .then((data) => {
        if (data.signedIn) router.replace("/hub");
        else setConfigured(Boolean(data.configured));
      });
  }, [router]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const url = configured ? "/api/auth/login" : "/api/auth/setup";
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ pin }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setError(data.error || "Could not sign in");
      return;
    }
    router.replace("/hub");
  }

  if (configured === null) {
    return <div className="grid min-h-screen place-items-center bg-navy text-cream/60">Loading…</div>;
  }

  return (
    <div className="grid min-h-screen place-items-center bg-navy px-5">
      <form onSubmit={submit} className="w-full max-w-sm border border-cream/15 bg-navy p-8 text-center">
        <Wordmark invert size="sm" />
        <p className="mt-3 text-sm italic text-cream/60">not just served, Sent.</p>
        <p className="mt-8 text-sm text-cream/80">
          {configured
            ? "Enter your PIN"
            : "Create a 4–8 digit owner PIN. You can add staff PINs later in Settings."}
        </p>
        <input
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 8))}
          inputMode="numeric"
          type="password"
          autoFocus
          className="mt-6 w-full border border-cream/20 bg-transparent px-4 py-3 text-center tracking-[0.4em] text-cream outline-none"
          placeholder="••••"
        />
        <button
          type="submit"
          disabled={busy}
          className="mt-5 w-full bg-cream py-3 text-[12px] uppercase tracking-[0.22em] text-navy disabled:opacity-60"
        >
          {configured ? "Sign in" : "Save PIN & enter"}
        </button>
        {error ? <p className="mt-4 text-sm text-red-200">{error}</p> : null}
      </form>
    </div>
  );
}
