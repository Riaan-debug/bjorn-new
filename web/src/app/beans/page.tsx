import Link from "next/link";
import { BagShot } from "@/components/site/BagShot";
import { MediaPlaceholder } from "@/components/site/MediaPlaceholder";
import { SiteChrome } from "@/components/site/SiteChrome";
import { publicShop } from "@/lib/db";
import { zar } from "@/lib/format";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Shop" };

type Product = ReturnType<typeof publicShop>[number];

function bagPhoto(id: string, imagePath: string) {
  if (imagePath) return imagePath;
  if (id === "house") return "/media/cooler-poster.jpg";
  return "";
}

function price(sizes: { price: number }[]) {
  const prices = sizes.map((size) => size.price).filter((value) => value > 0);
  if (!prices.length) return "Price at the counter";
  const min = Math.min(...prices);
  return new Set(prices).size > 1 ? `From ${zar(min)}` : zar(min);
}

export default function ShopPage() {
  const products = publicShop();
  const beans = products.filter((product) => product.kind === "beans");
  const merch = products.filter((product) => product.kind === "merch");

  return (
    <SiteChrome>
      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
        <p className="text-[11px] uppercase tracking-[0.28em] text-mist">To take home</p>
        <h1 className="mt-3 font-display text-5xl font-bold uppercase tracking-tight text-navy sm:text-7xl">Shop</h1>
        <p className="mt-4 max-w-xl text-base leading-8 text-mist">Bags of the blend, and the things we wear behind the counter. Collect at Olympus, pay when you do.</p>

        {products.length === 0 ? <p className="mt-12 text-base leading-8 text-mist">The shop is at the counter today.</p> : null}

        <Shelf title="Coffee" products={beans} empty="The bags are at the counter today." />
        <Shelf title="Merch" products={merch} empty="" />
      </div>
    </SiteChrome>
  );
}

function Shelf({ title, products, empty }: { title: string; products: Product[]; empty: string }) {
  if (!products.length && !empty) return null;
  return (
    <section className="mt-16">
      <h2 className="font-display text-3xl font-bold uppercase tracking-tight text-navy sm:text-4xl">{title}</h2>
      {products.length ? (
        <ul className="mt-8 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => {
            const photo = bagPhoto(product.id, product.imagePath);
            return (
              <li key={product.id}>
                <Link href={`/beans/${product.id}`} className="group block">
                  {photo ? (
                    <BagShot front={photo} behind={product.behindPath} name={product.name} inLink />
                  ) : (
                    <MediaPlaceholder label={product.name} ratio="aspect-square" />
                  )}
                  <h3 className="mt-4 font-display text-lg font-bold uppercase tracking-[0.06em] text-navy group-hover:underline">{product.name}</h3>
                  {product.summary ? <p className="mt-1 text-sm leading-6 text-mist">{product.summary}</p> : null}
                  <p className="mt-2 text-sm text-navy">{price(product.sizes)}</p>
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="mt-6 text-base leading-8 text-mist">{empty}</p>
      )}
    </section>
  );
}
