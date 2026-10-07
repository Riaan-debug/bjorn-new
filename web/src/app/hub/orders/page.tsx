"use client";

import { useEffect, useState } from "react";
import { HubShell } from "@/components/hub/HubShell";
import { prettyDate, zar } from "@/lib/format";
import type { OrderStatus, ShopOrder } from "@/lib/types";

const STATUSES: { id: OrderStatus; label: string }[] = [
  { id: "new", label: "New" },
  { id: "ready", label: "Ready" },
  { id: "collected", label: "Collected" },
  { id: "cancelled", label: "Cancelled" },
];

export default function HubOrdersPage() {
  const [list, setList] = useState<ShopOrder[]>([]);
  const [error, setError] = useState("");

  async function load() {
    const res = await fetch("/api/hub/orders");
    if (res.ok) setList(await res.json());
  }

  useEffect(() => {
    load();
  }, []);

  async function setStatus(id: string, status: OrderStatus) {
    setError("");
    const res = await fetch("/api/hub/orders", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error || "Could not update that order.");
      return;
    }
    load();
  }

  return (
    <HubShell title="Orders">
      <p className="max-w-2xl text-sm leading-7 text-mist">
        Bags of coffee ordered on the site. The customer pays when they collect. Cancelling an order puts the beans back into stock.
      </p>
      {error ? <p className="mt-4 text-sm text-red-800">{error}</p> : null}
      <div className="mt-6 space-y-4">
        {list.length === 0 ? <p className="text-mist">No bag orders yet.</p> : null}
        {list.map((order) => (
          <article key={order.id} className={`border bg-white p-5 ${order.status === "new" ? "border-navy" : "border-line"}`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-display text-2xl font-light text-navy">{order.number}</p>
                <p className="mt-1 text-sm text-navy">{order.name}</p>
                <p className="text-sm text-mist">
                  {order.email}
                  {order.phone ? ` · ${order.phone}` : ""}
                </p>
              </div>
              <div className="text-right text-sm text-mist">
                <p>{new Date(order.createdAt).toLocaleString("en-ZA")}</p>
                <p className="mt-1 text-navy">Collect {prettyDate(order.collectDate)}</p>
                <p className="mt-1 font-display text-xl text-navy">{zar(order.total)}</p>
              </div>
            </div>
            <ul className="mt-4 text-sm text-navy">
              {order.items.map((item) => (
                <li key={`${item.productId}:${item.sizeId}`}>
                  {item.name} · {item.sizeLabel} × {item.qty}
                </li>
              ))}
            </ul>
            {order.note ? <p className="mt-3 text-sm leading-7 text-mist">{order.note}</p> : null}
            <div className="mt-4 flex flex-wrap gap-2">
              {STATUSES.map((status) => (
                <button
                  key={status.id}
                  type="button"
                  onClick={() => setStatus(order.id, status.id)}
                  className={`px-3 py-2 text-[12px] uppercase tracking-[0.14em] ${
                    order.status === status.id ? "bg-navy text-cream" : "border border-navy text-navy"
                  }`}
                >
                  {status.label}
                </button>
              ))}
            </div>
          </article>
        ))}
      </div>
    </HubShell>
  );
}
