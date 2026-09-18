"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Wordmark } from "@/components/site/Wordmark";
import { visitAgo } from "@/lib/format";

type Card = {
  id: string;
  name: string;
  stamps: number;
  visits: number;
  freeCoffees: number;
  lastVisit: string;
};

type View = "home" | "register" | "quick" | "card" | "missing";
type PinPurpose = "stamp" | "exit" | null;

export default function KioskPage() {
  const router = useRouter();
  const [view, setView] = useState<View>("home");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [card, setCard] = useState<Card | null>(null);
  const [need, setNeed] = useState(10);
  const [error, setError] = useState("");
  const [pinPurpose, setPinPurpose] = useState<PinPurpose>(null);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [pinBusy, setPinBusy] = useState(false);

  function closePin() {
    setPinPurpose(null);
    setPin("");
    setPinError("");
    setPinBusy(false);
  }

  async function lookup() {
    setError("");
    const res = await fetch("/api/kiosk/lookup", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ phone }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Try again");
      return;
    }
    if (!data.found) {
      setView("missing");
      return;
    }
    setCard(data.customer);
    setNeed(data.loyaltyFreeAt);
    setView("card");
  }

  async function register() {
    setError("");
    const res = await fetch("/api/kiosk/register", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name, phone }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Could not register");
      return;
    }
    setCard(data.customer);
    setNeed(data.loyaltyFreeAt);
    setView("card");
  }

  async function confirmPin() {
    setPinError("");
    setPinBusy(true);
    if (pinPurpose === "exit") {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ pin }),
      });
      const data = await res.json().catch(() => ({}));
      setPinBusy(false);
      if (!res.ok) {
        setPinError(data.error || "Wrong PIN");
        return;
      }
      router.push("/hub");
      return;
    }
    if (!card) {
      setPinBusy(false);
      return;
    }
    const res = await fetch("/api/kiosk/stamp", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id: card.id, pin }),
    });
    const data = await res.json();
    setPinBusy(false);
    if (!res.ok) {
      setPinError(data.error || "Wrong PIN");
      return;
    }
    setCard(data.customer);
    setNeed(data.loyaltyFreeAt);
    closePin();
  }

  const progress = card ? card.stamps % need : 0;
  const freeDue = Boolean(card && card.stamps > 0 && card.stamps % need === 0);
  const filled = freeDue ? need : progress;
  const last = card ? visitAgo(card.lastVisit) : "";

  return (
    <div className="min-h-screen bg-navy px-6 py-10 text-cream">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-lg flex-col items-center justify-center text-center">
        <Wordmark invert size="md" />
        <p className="mt-3 italic text-cream/60">not just served, Sent.</p>

        {view === "home" ? (
          <div className="mt-12 w-full">
            <p className="text-lg">Enter your phone number to open your loyalty card</p>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") lookup();
              }}
              inputMode="tel"
              autoFocus
              placeholder="082 345 6789"
              className="mt-6 w-full border-b border-cream/30 bg-transparent py-4 text-center text-2xl tracking-wide outline-none"
            />
            <button type="button" onClick={lookup} className="mt-8 w-full bg-cream py-4 text-[13px] uppercase tracking-[0.22em] text-navy">
              Check in
            </button>
            <button type="button" onClick={() => { setError(""); setView("register"); }} className="mt-4 w-full border border-cream/25 py-4 text-[13px] uppercase tracking-[0.22em]">
              New here? Register
            </button>
          </div>
        ) : null}

        {view === "register" ? (
          <div className="mt-12 w-full">
            <p className="text-lg">Join the Apostellō card</p>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") register();
              }}
              autoFocus
              placeholder="Your name"
              className="mt-6 w-full border-b border-cream/30 bg-transparent py-4 text-center text-xl outline-none"
            />
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") register();
              }}
              inputMode="tel"
              placeholder="Phone number"
              className="mt-4 w-full border-b border-cream/30 bg-transparent py-4 text-center text-xl outline-none"
            />
            <button type="button" onClick={register} className="mt-8 w-full bg-cream py-4 text-[13px] uppercase tracking-[0.22em] text-navy">Register</button>
            <button type="button" onClick={() => { setError(""); setView("home"); }} className="mt-4 text-cream/50">Back</button>
          </div>
        ) : null}

        {view === "quick" ? (
          <div className="mt-12 w-full">
            <p className="text-lg">Almost there — add your name</p>
            <p className="mt-2 text-sm text-cream/50">{phone}</p>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") register();
              }}
              autoFocus
              placeholder="Your name"
              className="mt-6 w-full border-b border-cream/30 bg-transparent py-4 text-center text-xl outline-none"
            />
            <button type="button" onClick={register} className="mt-8 w-full bg-cream py-4 text-[13px] uppercase tracking-[0.22em] text-navy">Register</button>
            <button type="button" onClick={() => { setError(""); setView("home"); }} className="mt-4 text-cream/50">Cancel</button>
          </div>
        ) : null}

        {view === "missing" ? (
          <div className="mt-12 w-full">
            <p className="text-lg">No card for that number</p>
            <p className="mt-2 text-sm text-cream/50">Join the loyalty programme?</p>
            <button
              type="button"
              onClick={() => { setError(""); setName(""); setView("quick"); }}
              className="mt-8 w-full bg-cream py-4 text-[13px] uppercase tracking-[0.22em] text-navy"
            >
              Yes, sign me up
            </button>
            <button type="button" onClick={() => { setError(""); setView("home"); }} className="mt-4 text-cream/50">Try again</button>
          </div>
        ) : null}

        {view === "card" && card ? (
          <div className="mt-12 w-full">
            <p className="font-display text-3xl font-light">Welcome back, {card.name.split(" ")[0]}</p>
            {freeDue ? <p className="mt-3 text-cream">You have earned a free coffee today</p> : null}
            <p className="mt-4 text-cream/70">{filled} / {need} stamps</p>
            <div className="mx-auto mt-6 grid max-w-xs grid-cols-5 gap-3">
              {Array.from({ length: need }, (_, i) => (
                <span key={i} className={`h-10 w-10 rounded-full border ${i < filled ? "border-cream bg-cream" : "border-cream/30"}`} />
              ))}
            </div>
            <p className="mt-6 text-sm text-cream/50">
              {card.visits} visits · {card.freeCoffees} free coffees
              {last ? ` · last visit ${last}` : ""}
            </p>
            <button type="button" onClick={() => setPinPurpose("stamp")} className="mt-8 w-full border border-cream/25 py-4 text-[13px] uppercase tracking-[0.22em]">
              Add stamp (staff)
            </button>
            <button type="button" onClick={() => { setView("home"); setPhone(""); setName(""); }} className="mt-4 text-cream/50">Back</button>
          </div>
        ) : null}

        {error ? <p className="mt-6 text-red-200">{error}</p> : null}
      </div>

      {pinPurpose ? (
        <div className="fixed inset-0 grid place-items-center bg-navy/80 p-6">
          <div className="w-full max-w-sm border border-cream/20 bg-navy p-8 text-center">
            <p>{pinPurpose === "exit" ? "Staff PIN to leave kiosk" : "Staff PIN"}</p>
            <input
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 8))}
              onKeyDown={(e) => {
                if (e.key === "Enter") confirmPin();
              }}
              type="password"
              inputMode="numeric"
              autoFocus
              className="mt-4 w-full border-b border-cream/30 bg-transparent py-3 text-center tracking-[0.4em] outline-none"
            />
            <button type="button" onClick={confirmPin} disabled={pinBusy} className="mt-6 w-full bg-cream py-3 text-navy disabled:opacity-60">
              Confirm
            </button>
            <button type="button" onClick={closePin} className="mt-4 text-cream/50">Cancel</button>
            {pinError ? <p className="mt-3 text-red-200">{pinError}</p> : null}
          </div>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setPinPurpose("exit")}
        className="fixed bottom-5 right-5 text-[11px] uppercase tracking-[0.2em] text-cream/25"
      >
        Staff
      </button>
    </div>
  );
}
