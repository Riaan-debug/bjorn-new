import Link from "next/link";
import { BagShot } from "@/components/site/BagShot";
import { SiteChrome } from "@/components/site/SiteChrome";
import { publicShop } from "@/lib/db";
import { zar } from "@/lib/format";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Shop" };

function bagPhoto(id: string, imagePath: string) {
  if (imagePath) return imagePath;
  if (id === "house") return "/media/cooler-poster.jpg";
  return "";
}

function bagPrice(sizes: { price: number }[]) {
  const prices = sizes.map((size) => size.price).filter((price) => price > 0);
  if (!prices.length) return "";
  const min = Math.min(...prices);
  return prices.length > 1 && new Set(prices).size > 1 ? `From ${zar(min)}` : zar(min);
}

export default function ShopPage() {
  const products = publicShop();

  return (
    <SiteChrome>
      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
        <h1 className="font-display text-5xl font-light text-navy sm:text-6xl">Coffee</h1>
        <p className="mt-4 max-w-xl text-base leading-8 text-mist">Bags to take home from Olympus.</p>
        {products.length === 0 ? (
          <p className="mt-12 text-base leading-8 text-mist">The bags are at the counter today.</p>
        ) : (
          <ul className="mt-12 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <li key={product.id}>
                <Link href={`/beans/${product.id}`} className="group block">
                  <BagShot
                    front={bagPhoto(product.id, product.imagePath)}
                    behind={product.behindPath}
                    name={product.name}
                    inLink
                  />
                  <h2 className="mt-4 font-display text-2xl font-light text-navy group-hover:underline">{product.name}</h2>
                  {product.summary ? <p className="mt-2 text-sm leading-6 text-mist">{product.summary}</p> : null}
                  <p className="mt-2 text-sm text-navy">{bagPrice(product.sizes)}</p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </SiteChrome>
  );
}
