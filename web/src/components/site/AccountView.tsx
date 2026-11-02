"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { bagCount, readBag, writeBag } from "@/lib/bag";
import { prettyDate, zar } from "@/lib/format";
import { ProfileCup, cupFirstName } from "./Stickers";

type CardOrder = {
  id: string;
  number: string;
  status: string;
  collectDate: string;
  total: number;
  createdAt: string;
  items: { name: string; sizeLabel: string; qty: number }[];
};

type Card = {
  name: string;
  phone: string;
  email: string;
  dateJoined: string;
  stamps: number;
  visits: number;
  freeCoffees: number;
  lastVisit: string;
  loyaltyFreeAt: number;
  bag: { productId: string; sizeId: string; qty: number }[];
  orders: CardOrder[];
};

const STATUS: Record<string, string> = {
  new: "Set aside",
  ready: "Ready to collect",
  collected: "Collected",
  cancelled: "Cancelled",
};

export function AccountView() {
  const [card, setCard] = useState<Card | null>(null);
  const [ready, setReady] = useState(false);
  const [mode, setMode] = useState<"in" | "join">("in");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [pin, setPin] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/account/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled) return;
        if (data?.name) {
          setCard(data);
          writeBag(data.bag || []);
        }
        setReady(true);
      })
      .catch(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const path = mode === "join" ? "/api/account/join" : "/api/account/login";
    const res = await fetch(path, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name,
        phone,
        email,
        pin,
        bag: readBag(),
      }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setError(data.error || "Could not sign in");
      return;
    }
    writeBag(data.bag || []);
    window.dispatchEvent(new Event("ap-card"));
    setCard(data);
    setPin("");
  }

  async function signOut() {
    await fetch("/api/account/logout", { method: "POST" });
    window.dispatchEvent(new Event("ap-card"));
    setCard(null);
    setMode("in");
  }

  if (!ready) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-16 sm:px-8">
        <p className="text-mist">Loading…</p>
      </div>
    );
  }

  if (card) {
    const need = card.loyaltyFreeAt || 10;
    const progress = card.stamps % need;
    const freeDue = card.stamps > 0 && progress === 0;
    const filled = freeDue ? need : progress;
    const waiting = bagCount();
    const first = cupFirstName(card.name);
    return (
      <div className="mx-auto max-w-2xl px-5 py-16 sm:px-8">
        <div className="flex flex-wrap items-end gap-8">
          <ProfileCup filled name={card.name} className="h-44 w-36 shrink-0 sm:h-52 sm:w-44" />
          <div className="min-w-0 pb-2">
            <p className="text-[11px] uppercase tracking-[0.28em] text-mist">Return customers</p>
            <h1 className="mt-3 font-display text-5xl font-bold uppercase tracking-tight text-navy">Your cup</h1>
            <p className="mt-6 max-w-md text-base leading-8 text-mist">
              Welcome back, {first}. The stamps on the iPad and the bag on this site live on this cup.
            </p>
          </div>
        </div>

        <div className="mt-12 border border-line bg-white px-6 py-8">
          {freeDue ? <p className="mb-4 text-sm text-navy">A free coffee is waiting the next time you are in.</p> : null}
          <p className="text-[11px] uppercase tracking-[0.18em] text-mist">Stamp card</p>
          <p className="mt-3 text-sm text-navy">
            {filled} / {need} stamps
          </p>
          <div className="mt-5 grid max-w-xs grid-cols-5 gap-3">
            {Array.from({ length: need }, (_, i) => (
              <span
                key={i}
                className={`h-9 w-9 rounded-full border ${i < filled ? "border-navy bg-navy" : "border-line"}`}
              />
            ))}
          </div>
          <dl className="mt-8 grid gap-4 text-sm sm:grid-cols-2">
            <Stat label="Visits at Olympus" value={String(card.visits)} />
            <Stat label="Free coffees" value={String(card.freeCoffees)} />
            <Stat label="Last at the counter" value={card.lastVisit ? prettyDate(card.lastVisit) : "—"} />
            <Stat label="On the card since" value={card.dateJoined ? prettyDate(card.dateJoined) : "—"} />
            <Stat label="Phone" value={card.phone || "—"} />
            <Stat label="Email" value={card.email || "—"} />
          </dl>
        </div>

        <p className="mt-8 text-base leading-8 text-mist">
          {waiting ? (
            <>
              There {waiting === 1 ? "is" : "are"} {waiting} {waiting === 1 ? "item" : "items"} in{" "}
              <Link href="/bag" className="text-navy underline underline-offset-4">
                your bag
              </Link>
              .
            </>
          ) : (
            <>
              The bag is empty.{" "}
              <Link href="/beans" className="text-navy underline underline-offset-4">
                The shop
              </Link>{" "}
              is where the bags are.
            </>
          )}
        </p>

        <div className="mt-12">
          <p className="text-[11px] uppercase tracking-[0.28em] text-mist">History</p>
          {card.orders.length ? (
            <ul className="mt-4 divide-y divide-line border-y border-line">
              {card.orders.map((order) => (
                <li key={order.id}>
                  <Link href={`/order/${order.id}`} className="block py-5 text-navy">
                    <span className="flex justify-between gap-4 text-sm">
                      <span>
                        {order.number} · {STATUS[order.status] || order.status}
                      </span>
                      <span>{zar(order.total)}</span>
                    </span>
                    <span className="mt-1 block text-sm text-mist">
                      Placed {prettyDate(order.createdAt)} · collect {prettyDate(order.collectDate)}
                    </span>
                    {order.items?.length ? (
                      <span className="mt-1 block text-sm text-mist">
                        {order.items
                          .map((item) => `${item.name}${item.sizeLabel ? ` ${item.sizeLabel}` : ""} × ${item.qty}`)
                          .join(" · ")}
                      </span>
                    ) : null}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm leading-7 text-mist">
              No bag orders yet. Counter visits still stamp on the iPad, and they show on this cup.
            </p>
          )}
        </div>

        <button type="button" onClick={signOut} className="mt-10 text-sm text-navy underline underline-offset-4">
          Sign out
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-5 py-16 sm:px-8">
      <ProfileCup labeled className="h-28 w-24" />
      <p className="mt-8 text-[11px] uppercase tracking-[0.28em] text-mist">Return customers</p>
      <h1 className="mt-3 font-display text-5xl font-bold uppercase tracking-tight text-navy">Your cup</h1>
      <p className="mt-6 max-w-xl text-base leading-8 text-mist">
        Sign in with the phone on your stamp card and a PIN you choose here. Once you are in, this cup
        carries your name, the bag, and the stamps at Olympus.
      </p>
      <div className="mt-10 flex gap-6 text-[12px] uppercase tracking-[0.18em]">
        <button
          type="button"
          onClick={() => {
            setMode("in");
            setError("");
          }}
          className={mode === "in" ? "text-navy" : "text-mist"}
        >
          Sign in
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("join");
            setError("");
          }}
          className={mode === "join" ? "text-navy" : "text-mist"}
        >
          Join
        </button>
      </div>
      <form onSubmit={submit} className="mt-8 space-y-4">
        {mode === "join" ? (
          <label className="block">
            <span className="text-[11px] uppercase tracking-[0.18em] text-mist">Name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
              className="mt-2 w-full border border-line bg-white px-3 py-3 outline-none focus:border-navy"
            />
          </label>
        ) : null}
        <label className="block">
          <span className="text-[11px] uppercase tracking-[0.18em] text-mist">Phone</span>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            inputMode="tel"
            autoComplete="tel"
            className="mt-2 w-full border border-line bg-white px-3 py-3 outline-none focus:border-navy"
          />
        </label>
        {mode === "join" ? (
          <label className="block">
            <span className="text-[11px] uppercase tracking-[0.18em] text-mist">Email · optional</span>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              autoComplete="email"
              className="mt-2 w-full border border-line bg-white px-3 py-3 outline-none focus:border-navy"
            />
          </label>
        ) : null}
        <label className="block">
          <span className="text-[11px] uppercase tracking-[0.18em] text-mist">
            {mode === "join" ? "Choose a 4–8 digit PIN" : "PIN"}
          </span>
          <input
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 8))}
            type="password"
            inputMode="numeric"
            autoComplete={mode === "join" ? "new-password" : "current-password"}
            required
            className="mt-2 w-full border border-line bg-white px-3 py-3 tracking-[0.3em] outline-none focus:border-navy"
          />
        </label>
        {mode === "join" ? (
          <p className="text-sm leading-7 text-mist">
            If you already stamp at the counter, use that phone. Joining here does not add a stamp — the iPad
            does that when you buy a coffee.
          </p>
        ) : (
          <p className="text-sm leading-7 text-mist">
            New to the card?{" "}
            <button type="button" className="text-navy underline underline-offset-4" onClick={() => setMode("join")}>
              Join with the same phone
            </button>
            .
          </p>
        )}
        {error ? <p className="text-sm text-red-800">{error}</p> : null}
        <button
          type="submit"
          disabled={busy}
          className="bg-navy px-5 py-3 text-[12px] uppercase tracking-[0.2em] text-cream disabled:opacity-60"
        >
          {busy ? "Please wait…" : mode === "join" ? "Join" : "Sign in"}
        </button>
      </form>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-[0.18em] text-mist">{label}</dt>
      <dd className="mt-1 text-navy">{value}</dd>
    </div>
  );
}
