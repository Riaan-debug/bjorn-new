import Link from "next/link";
import { BagShot } from "@/components/site/BagShot";
import { BuyBag } from "@/components/site/BuyBag";
import { SiteChrome } from "@/components/site/SiteChrome";
import { publicSettings, publicShop } from "@/lib/db";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const product = publicShop().find((item) => item.id === id);
  return { title: product?.name || "Shop" };
}

export default async function BagPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = publicShop().find((item) => item.id === id);
  const settings = publicSettings();
  const house = product?.id === "house";
  const origins = settings.coffeeBlend
    .split("·")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const match = part.match(/^(\d+%)\s+(.+)$/);
      if (!match) return { percent: "", name: part };
      return { percent: match[1], name: match[2] };
    });
  const notes = settings.coffeeNotes
    .split(/\. (?=[A-Z])/)
    .map((part) => part.trim().replace(/\.$/, ""))
    .filter(Boolean);
  const rested = notes.find((note) => /rest/i.test(note));
  const facts = [rested, ...notes.filter((note) => note !== rested)].filter(Boolean);
  const photo = product?.imagePath || (house ? "/media/cooler-poster.jpg" : "");

  return (
    <SiteChrome>
      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
        <Link href="/beans" className="text-[11px] uppercase tracking-[0.28em] text-mist">
          Coffee
        </Link>
        {product ? (
          <div className="mt-8 grid items-start gap-10 md:grid-cols-2">
            <BagShot front={photo} behind={product.behindPath} name={product.name} />
            <div>
              <h1 className="font-display text-5xl font-light text-navy sm:text-6xl">{product.name}</h1>
              {house ? (
                <p className="mt-4 text-base text-navy">
                  {origins.map((origin) => (origin.percent ? `${origin.percent} ${origin.name}` : origin.name)).join(" · ")}
                </p>
              ) : null}
              {product.summary ? <p className="mt-6 max-w-xl text-base leading-8 text-mist">{product.summary}</p> : null}
              <BuyBag productId={product.id} sizes={product.sizes} />
              {house ? (
                <>
                  <hr className="mt-10 max-w-xl border-line" />
                  <ul className="mt-6 flex max-w-xl flex-col gap-3">
                    {facts.map((fact) => (
                      <li key={fact} className="text-[13px] uppercase tracking-[0.16em] text-navy">
                        {fact}
                      </li>
                    ))}
                  </ul>
                </>
              ) : null}
            </div>
          </div>
        ) : (
          <>
            <h1 className="mt-6 font-display text-5xl font-light text-navy">That bag isn&apos;t on the shop</h1>
            <p className="mt-6 text-base leading-8 text-mist">It may have come off the list.</p>
          </>
        )}
      </div>
    </SiteChrome>
  );
}
