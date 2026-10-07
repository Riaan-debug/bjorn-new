import Link from "next/link";
import { SiteChrome } from "@/components/site/SiteChrome";
import { publicOrder } from "@/lib/db";
import { prettyDate, zar } from "@/lib/format";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Order" };

const STATUS: Record<string, string> = {
  new: "Set aside",
  ready: "Ready to collect",
  collected: "Collected",
  cancelled: "Cancelled",
};

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = publicOrder(id);

  return (
    <SiteChrome>
      <div className="mx-auto max-w-2xl px-5 py-16 sm:px-8">
        {order ? (
          <>
            <p className="text-[11px] uppercase tracking-[0.28em] text-mist">{STATUS[order.status] || "Order"}</p>
            <h1 className="mt-3 font-display text-5xl font-light text-navy">{order.number}</h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-mist">
              {order.name}, collect on {prettyDate(order.collectDate)} at {order.location}. {order.address}.{" "}
              {order.tradingHours}. Pay when you collect.
            </p>
            <ul className="mt-8 divide-y divide-line border-y border-line">
              {order.items.map((item) => (
                <li key={`${item.name}:${item.sizeLabel}`} className="flex justify-between gap-4 py-4 text-sm text-navy">
                  <span>
                    {item.name} · {item.sizeLabel} × {item.qty}
                  </span>
                  <span>{zar(item.price * item.qty)}</span>
                </li>
              ))}
            </ul>
            <p className="mt-6 font-display text-2xl font-light text-navy">{zar(order.total)}</p>
            {order.note ? <p className="mt-4 text-sm leading-7 text-mist">{order.note}</p> : null}
          </>
        ) : (
          <>
            <h1 className="font-display text-5xl font-light text-navy">That order isn&apos;t here</h1>
            <p className="mt-6 text-base leading-8 text-mist">The link may be old, or the order was never placed.</p>
          </>
        )}
        <Link href="/beans" className="mt-10 inline-block text-sm text-navy underline underline-offset-4">
          Back to the shop
        </Link>
      </div>
    </SiteChrome>
  );
}
