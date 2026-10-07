"use client";

import Link from "next/link";
import { useState } from "react";
import { addBag } from "@/lib/bag";
import { zar } from "@/lib/format";

type Size = { id: string; label: string; price: number };

export function BuyBag({ productId, sizes }: { productId: string; sizes: Size[] }) {
  const [sizeId, setSizeId] = useState(sizes[0]?.id || "");
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const size = sizes.find((item) => item.id === sizeId) || sizes[0];
  if (!size) return null;

  return (
    <div className="mt-10 max-w-xl">
      <div className="flex flex-wrap gap-2">
        {sizes.map((item) => {
          const on = item.id === size.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setSizeId(item.id);
                setAdded(false);
              }}
              className={`px-4 py-3 text-[12px] uppercase tracking-[0.16em] ${
                on ? "bg-navy text-cream" : "border border-navy text-navy"
              }`}
            >
              {item.label} · {zar(item.price)}
            </button>
          );
        })}
      </div>
      <div className="mt-6 flex flex-wrap items-center gap-4">
        <div className="flex items-center border border-navy">
          <button
            type="button"
            className="px-4 py-3 text-navy"
            onClick={() => {
              setQty((n) => Math.max(1, n - 1));
              setAdded(false);
            }}
            aria-label="Fewer bags"
          >
            −
          </button>
          <span className="min-w-8 text-center text-sm text-navy">{qty}</span>
          <button
            type="button"
            className="px-4 py-3 text-navy"
            onClick={() => {
              setQty((n) => Math.min(6, n + 1));
              setAdded(false);
            }}
            aria-label="More bags"
          >
            +
          </button>
        </div>
        <button
          type="button"
          onClick={() => {
            addBag(productId, size.id, qty);
            setAdded(true);
          }}
          className="border border-navy bg-navy px-5 py-3 text-[12px] uppercase tracking-[0.2em] text-cream"
        >
          Add to bag
        </button>
      </div>
      <p className="mt-4 text-sm leading-7 text-mist">A bag of this coffee. Pay when you collect it at Olympus.</p>
      {added ? (
        <Link href="/bag" className="mt-3 inline-block text-sm text-navy underline underline-offset-4">
          In your bag
        </Link>
      ) : null}
    </div>
  );
}
