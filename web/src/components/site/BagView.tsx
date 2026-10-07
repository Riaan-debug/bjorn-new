"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { readBag, writeBag, type BagLine } from "@/lib/bag";
import { zar } from "@/lib/format";

type Size = { id: string; label: string; price: number };
type Product = { id: string; name: string; sizes: Size[] };
type Row = BagLine & { name: string; sizeLabel: string; price: number; ok: boolean };

export function BagView() {
  const [rows, setRows] = useState<Row[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/public/shop")
      .then((res) => res.json())
      .then((products: Product[]) => {
        if (cancelled) return;
        const catalog = Array.isArray(products) ? products : [];
        setRows(
          readBag().map((line) => {
            const product = catalog.find((item) => item.id === line.productId);
            const size = product?.sizes.find((item) => item.id === line.sizeId);
            return {
              ...line,
              name: product?.name || "Bag",
              sizeLabel: size?.label || "",
              price: size?.price || 0,
              ok: Boolean(product && size),
            };
          }),
        );
        setReady(true);
      })
      .catch(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function save(next: Row[]) {
    setRows(next);
    writeBag(next.filter((row) => row.ok).map(({ productId, sizeId, qty }) => ({ productId, sizeId, qty })));
  }

  const payable = rows.filter((row) => row.ok);
  const total = payable.reduce((sum, row) => sum + row.price * row.qty, 0);

  return (
    <div className="mx-auto max-w-2xl px-5 py-16 sm:px-8">
      <p className="text-[11px] uppercase tracking-[0.28em] text-mist">To take home</p>
      <h1 className="mt-3 font-display text-5xl font-light text-navy">Your bag</h1>
      {!ready ? <p className="mt-8 text-mist">Loading…</p> : null}
      {ready && rows.length === 0 ? (
        <p className="mt-8 text-base leading-8 text-mist">
          The bag is empty.{" "}
          <Link href="/beans" className="text-navy underline underline-offset-4">
            The shop
          </Link>{" "}
          is where the bags are.
        </p>
      ) : null}
      {rows.length > 0 ? (
        <ul className="mt-10 divide-y divide-line border-y border-line">
          {rows.map((row) => (
            <li key={`${row.productId}:${row.sizeId}`} className="flex flex-wrap items-center justify-between gap-4 py-5">
              <div>
                <p className="font-display text-xl font-light text-navy">{row.name}</p>
                <p className="mt-1 text-sm text-mist">{row.ok ? row.sizeLabel : "No longer on the shop"}</p>
              </div>
              {row.ok ? (
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-navy">
                    <button
                      type="button"
                      className="px-3 py-2 text-navy"
                      aria-label="Fewer"
                      onClick={() =>
                        save(rows.map((item) => (item === row ? { ...item, qty: Math.max(1, item.qty - 1) } : item)))
                      }
                    >
                      −
                    </button>
                    <span className="min-w-6 text-center text-sm">{row.qty}</span>
                    <button
                      type="button"
                      className="px-3 py-2 text-navy"
                      aria-label="More"
                      onClick={() =>
                        save(rows.map((item) => (item === row ? { ...item, qty: Math.min(6, item.qty + 1) } : item)))
                      }
                    >
                      +
                    </button>
                  </div>
                  <p className="min-w-16 text-right text-sm text-navy">{zar(row.price * row.qty)}</p>
                </div>
              ) : null}
              <button
                type="button"
                className="text-sm text-navy underline underline-offset-4"
                onClick={() => save(rows.filter((item) => item !== row))}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      {payable.length > 0 ? (
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
          <p className="font-display text-2xl font-light text-navy">{zar(total)}</p>
          <Link href="/checkout" className="bg-navy px-5 py-3 text-[12px] uppercase tracking-[0.2em] text-cream">
            Checkout
          </Link>
        </div>
      ) : null}
      {payable.length > 0 ? (
        <p className="mt-4 text-sm leading-7 text-mist">Pay when you collect at Olympus, on a weekday.</p>
      ) : null}
    </div>
  );
}
