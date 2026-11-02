"use client";

import { useEffect, useState } from "react";
import { HubShell } from "@/components/hub/HubShell";
import { AmountInput } from "@/components/hub/AmountInput";
import type { ShopProduct } from "@/lib/types";

const empty = (kind: "beans" | "merch"): ShopProduct =>
  kind === "merch"
    ? { id: "", name: "", summary: "", active: true, kind, imagePath: "", behindPath: "", sizes: [{ id: "", label: "One size", grams: 0, price: 0 }] }
    : { id: "", name: "", summary: "", active: true, kind, imagePath: "", behindPath: "", sizes: [{ id: "", label: "250 g", grams: 250, price: 0 }] };

const kindOf = (product: ShopProduct) => (product.kind === "merch" ? "merch" : "beans");

export default function HubShopPage() {
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/hub/shop")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setProducts(data);
      });
  }, []);

  function patch(index: number, next: ShopProduct) {
    setSaved(false);
    setProducts(products.map((product, i) => (i === index ? next : product)));
  }

  async function upload(index: number, file: File, slot: "imagePath" | "behindPath") {
    setError("");
    setSaved(false);
    const body = new FormData();
    body.append("file", file);
    body.append("folder", "shop");
    const res = await fetch("/api/hub/upload", { method: "POST", body });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.path) {
      setError(data.error || "Could not upload that photo.");
      return;
    }
    setProducts((current) => current.map((product, i) => (i === index ? { ...product, [slot]: data.path } : product)));
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setSaved(false);
    const res = await fetch("/api/hub/shop", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ products }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error || "Could not save the shop.");
      return;
    }
    setSaved(true);
    const fresh = await fetch("/api/hub/shop");
    if (fresh.ok) setProducts(await fresh.json());
  }

  return (
    <HubShell title="Shop">
      <p className="max-w-2xl text-sm leading-7 text-mist">
        Each card on the shop is one product: a bag of coffee, or a piece of merch. Give it a photo, a sentence, and sizes.
        A merch piece with no price still shows on the shop, but it can only be bought once a price is set here. A customer pays when they collect.
      </p>
      <form onSubmit={save} className="mt-6 space-y-4">
        {products.map((product, index) => (
          <article key={product.id || index} className="border border-line bg-white p-5">
            <div className="grid gap-3 sm:grid-cols-[1fr_10rem_auto]">
              <label className="block">
                <span className="text-[11px] uppercase tracking-[0.16em] text-mist">Name</span>
                <input
                  value={product.name}
                  onChange={(e) => patch(index, { ...product, name: e.target.value })}
                  className="mt-1 w-full border border-line px-3 py-2 text-navy"
                  required
                />
              </label>
              <label className="block">
                <span className="text-[11px] uppercase tracking-[0.16em] text-mist">Kind</span>
                <select
                  value={kindOf(product)}
                  onChange={(e) => patch(index, { ...product, kind: e.target.value as ShopProduct["kind"] })}
                  className="mt-1 w-full border border-line bg-white px-3 py-2 text-navy"
                >
                  <option value="beans">Coffee</option>
                  <option value="merch">Merch</option>
                </select>
              </label>
              <label className="mt-7 flex items-center gap-2 text-sm text-navy">
                <input
                  type="checkbox"
                  checked={product.active}
                  onChange={(e) => patch(index, { ...product, active: e.target.checked })}
                />
                On the site
              </label>
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <label className="block text-sm text-navy">
                <span className="text-[11px] uppercase tracking-[0.16em] text-mist">Front photo</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="mt-1 block w-full"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) upload(index, file, "imagePath");
                  }}
                />
              </label>
              <label className="block text-sm text-navy">
                <span className="text-[11px] uppercase tracking-[0.16em] text-mist">Photo behind (shows on hover)</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="mt-1 block w-full"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) upload(index, file, "behindPath");
                  }}
                />
              </label>
            </div>
            <label className="mt-3 block">
              <span className="text-[11px] uppercase tracking-[0.16em] text-mist">One sentence</span>
              <input
                value={product.summary}
                onChange={(e) => patch(index, { ...product, summary: e.target.value })}
                className="mt-1 w-full border border-line px-3 py-2 text-navy"
              />
            </label>
            <div className="mt-4 space-y-2">
              {product.sizes.map((size, sizeIndex) => (
                <div
                  key={size.id || sizeIndex}
                  className={`grid gap-2 ${kindOf(product) === "beans" ? "sm:grid-cols-[1fr_8rem_8rem_auto]" : "sm:grid-cols-[1fr_8rem_auto]"}`}
                >
                  <input
                    value={size.label}
                    onChange={(e) => {
                      const sizes = product.sizes.map((item, i) => (i === sizeIndex ? { ...item, label: e.target.value } : item));
                      patch(index, { ...product, sizes });
                    }}
                    placeholder={kindOf(product) === "beans" ? "Size" : "S, M, L, or One size"}
                    className="border border-line px-3 py-2 text-navy"
                    required
                  />
                  {kindOf(product) === "beans" ? (
                    <AmountInput
                      value={size.grams}
                      onChange={(grams) => {
                        const sizes = product.sizes.map((item, i) => (i === sizeIndex ? { ...item, grams } : item));
                        patch(index, { ...product, sizes });
                      }}
                      placeholder="Grams"
                    />
                  ) : null}
                  <AmountInput
                    value={size.price}
                    step="any"
                    onChange={(price) => {
                      const sizes = product.sizes.map((item, i) => (i === sizeIndex ? { ...item, price } : item));
                      patch(index, { ...product, sizes });
                    }}
                    placeholder="Price"
                  />
                  <button
                    type="button"
                    className="text-sm text-red-800"
                    onClick={() => {
                      if (product.sizes.length === 1) return;
                      patch(index, { ...product, sizes: product.sizes.filter((_, i) => i !== sizeIndex) });
                    }}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-3 flex gap-4 text-sm">
              <button
                type="button"
                className="text-navy"
                onClick={() =>
                  patch(index, {
                    ...product,
                    sizes: [...product.sizes, { id: "", label: "", grams: kindOf(product) === "beans" ? 250 : 0, price: 0 }],
                  })
                }
              >
                Add a size
              </button>
              <button type="button" className="text-red-800" onClick={() => setProducts(products.filter((_, i) => i !== index))}>
                Remove product
              </button>
            </div>
          </article>
        ))}
        {error ? <p className="text-sm text-red-800">{error}</p> : null}
        {saved ? <p className="text-sm text-navy">Saved.</p> : null}
        <div className="flex flex-wrap gap-3">
          <button type="submit" className="bg-navy px-5 py-3 text-[12px] uppercase tracking-[0.18em] text-cream">
            Save shop
          </button>
          <button
            type="button"
            className="border border-navy px-5 py-3 text-[12px] uppercase tracking-[0.18em] text-navy"
            onClick={() => setProducts([...products, empty("beans")])}
          >
            Add a bag
          </button>
          <button
            type="button"
            className="border border-navy px-5 py-3 text-[12px] uppercase tracking-[0.18em] text-navy"
            onClick={() => setProducts([...products, empty("merch")])}
          >
            Add merch
          </button>
        </div>
      </form>
    </HubShell>
  );
}
