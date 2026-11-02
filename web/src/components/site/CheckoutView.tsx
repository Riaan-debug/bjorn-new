"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { readBag, writeBag } from "@/lib/bag";
import { addIsoDays, cafeToday } from "@/lib/dates";
import { zar } from "@/lib/format";

type Size = { id: string; label: string; price: number };
type Product = { id: string; name: string; sizes: Size[] };
type Line = { productId: string; sizeId: string; qty: number; name: string; sizeLabel: string; price: number };

export function CheckoutView() {
  const [lines, setLines] = useState<Line[]>([]);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [cardName, setCardName] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const earliest = addIsoDays(cafeToday(), 1);
  const latest = addIsoDays(cafeToday(), 21);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetch("/api/public/shop").then((res) => res.json()),
      fetch("/api/account/me").then((res) => (res.ok ? res.json() : null)),
    ])
      .then(([products, me]) => {
        if (cancelled) return;
        const catalog: Product[] = Array.isArray(products) ? products : [];
        setLines(
          readBag().flatMap((line) => {
            const product = catalog.find((item) => item.id === line.productId);
            const size = product?.sizes.find((item) => item.id === line.sizeId);
            if (!product || !size || size.price <= 0) return [];
            return [{ ...line, name: product.name, sizeLabel: size.label, price: size.price }];
          }),
        );
        if (me?.name) {
          setCardName(String(me.name).split(" ")[0]);
          setName(me.name || "");
          setEmail(me.email || "");
          setPhone(me.phone || "");
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

  const total = lines.reduce((sum, line) => sum + line.price * line.qty, 0);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSending(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const res = await fetch("/api/public/orders", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        email: form.get("email"),
        phone: form.get("phone"),
        collectDate: form.get("collectDate"),
        note: form.get("note"),
        items: lines.map(({ productId, sizeId, qty }) => ({ productId, sizeId, qty })),
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.id) {
      setError(data.error || "Could not place the order. Try again shortly.");
      setSending(false);
      return;
    }
    writeBag([]);
    window.location.href = `/order/${data.id}`;
  }

  return (
    <div className="mx-auto max-w-2xl px-5 py-16 sm:px-8">
      <p className="text-[11px] uppercase tracking-[0.28em] text-mist">Collect at Olympus</p>
      <h1 className="mt-3 font-display text-5xl font-bold uppercase tracking-tight text-navy">Checkout</h1>
      <p className="mt-6 max-w-xl text-base leading-8 text-mist">
        Collect at Olympus on a weekday. Pay when you pick it up, between the opening hours.
      </p>
      {!ready ? <p className="mt-8 text-mist">Loading…</p> : null}
      {ready && lines.length === 0 ? (
        <p className="mt-8 text-base leading-8 text-mist">
          Nothing to check out.{" "}
          <Link href="/beans" className="text-navy underline underline-offset-4">
            Choose a bag
          </Link>
          .
        </p>
      ) : null}
      {lines.length > 0 ? (
        <form onSubmit={onSubmit} className="mt-10 space-y-4">
          <ul className="divide-y divide-line border-y border-line">
            {lines.map((line) => (
              <li key={`${line.productId}:${line.sizeId}`} className="flex justify-between gap-4 py-4 text-sm text-navy">
                <span>
                  {line.name} · {line.sizeLabel} × {line.qty}
                </span>
                <span>{zar(line.price * line.qty)}</span>
              </li>
            ))}
          </ul>
          <p className="font-display text-2xl font-light text-navy">{zar(total)}</p>
          {cardName ? (
            <p className="text-sm leading-7 text-mist">
              Signed in as {cardName}. This order is kept on{" "}
              <Link href="/account" className="text-navy underline underline-offset-4">
                your card
              </Link>
              .
            </p>
          ) : (
            <p className="text-sm leading-7 text-mist">
              Return customer?{" "}
              <Link href="/account" className="text-navy underline underline-offset-4">
                Sign in
              </Link>{" "}
              so this order sits on your card.
            </p>
          )}
          <Field name="name" label="Name" value={name} onChange={setName} required />
          <Field name="email" label="Email" type="email" value={email} onChange={setEmail} required />
          <Field name="phone" label="Phone" value={phone} onChange={setPhone} required />
          <label className="block">
            <span className="text-[11px] uppercase tracking-[0.18em] text-mist">Collect on</span>
            <input
              name="collectDate"
              type="date"
              required
              min={earliest}
              max={latest}
              className="mt-2 w-full border border-line bg-white px-3 py-3 outline-none focus:border-navy"
            />
          </label>
          <label className="block">
            <span className="text-[11px] uppercase tracking-[0.18em] text-mist">Note</span>
            <textarea name="note" rows={3} className="mt-2 w-full border border-line bg-white px-3 py-3 outline-none focus:border-navy" />
          </label>
          {error ? <p className="text-sm text-red-800">{error}</p> : null}
          <button
            type="submit"
            disabled={sending}
            className="bg-navy px-5 py-3 text-[12px] uppercase tracking-[0.2em] text-cream disabled:opacity-60"
          >
            {sending ? "Placing…" : "Place order"}
          </button>
        </form>
      ) : null}
    </div>
  );
}

function Field({
  name,
  label,
  type = "text",
  required = false,
  value,
  onChange,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-[11px] uppercase tracking-[0.18em] text-mist">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full border border-line bg-white px-3 py-3 outline-none focus:border-navy"
      />
    </label>
  );
}
