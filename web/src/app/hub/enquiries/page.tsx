"use client";

import { useEffect, useState } from "react";
import { HubShell } from "@/components/hub/HubShell";
import { prettyDate } from "@/lib/format";
import type { Enquiry, StaffRole } from "@/lib/types";

export default function EnquiriesPage() {
  const [list, setList] = useState<Enquiry[]>([]);
  const [role, setRole] = useState<StaffRole>("staff");

  async function load() {
    const res = await fetch("/api/hub/enquiries");
    if (res.ok) setList(await res.json());
  }
  useEffect(() => {
    load();
    fetch("/api/auth/status")
      .then((r) => r.json())
      .then((data) => {
        if (data.role === "owner" || data.role === "staff") setRole(data.role);
      });
  }, []);

  async function mark(id: string, read: boolean) {
    await fetch("/api/hub/enquiries", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id, read }),
    });
    load();
  }

  async function remove(id: string) {
    if (!confirm("Delete this enquiry?")) return;
    await fetch("/api/hub/enquiries", {
      method: "DELETE",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id }),
    });
    load();
  }

  return (
    <HubShell title="Enquiries">
      <div className="space-y-4">
        {list.map((item) => (
          <article key={item.id} className={`border p-5 ${item.read ? "border-line bg-white" : "border-navy bg-white"}`}>
            <div className="flex flex-wrap justify-between gap-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.18em] text-mist">
                  {item.kind === "event" ? "Event booking" : "Website message"}
                </p>
                <p className="mt-1 font-display text-xl text-navy">{item.name}</p>
              </div>
              <p className="text-xs text-mist">{new Date(item.createdAt).toLocaleString("en-ZA")}</p>
            </div>
            <p className="mt-1 text-sm text-mist">{item.email}{item.phone ? ` · ${item.phone}` : ""}</p>
            {item.event ? (
              <dl className="mt-4 grid gap-2 text-sm text-navy sm:grid-cols-2">
                <div><span className="text-mist">Date</span> · {prettyDate(item.event.date)}</div>
                <div><span className="text-mist">Guests</span> · {item.event.guests}</div>
                <div><span className="text-mist">Power</span> · {item.event.power ? "Yes" : "No"}</div>
                <div><span className="text-mist">Trailer access</span> · {item.event.trailerAccess ? "Yes" : "No"}</div>
              </dl>
            ) : null}
            {item.event ? (
              eventNotes(item.message) ? (
                <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-navy">{eventNotes(item.message)}</p>
              ) : null
            ) : (
              <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-navy">{item.message}</p>
            )}
            <div className="mt-4 flex gap-4 text-sm">
              <button type="button" onClick={() => mark(item.id, !item.read)} className="text-navy">{item.read ? "Mark unread" : "Mark read"}</button>
              {role === "owner" ? (
                <button type="button" onClick={() => remove(item.id)} className="text-red-700">Delete</button>
              ) : null}
            </div>
          </article>
        ))}
        {!list.length ? <p className="text-mist">No website messages or event requests yet.</p> : null}
      </div>
    </HubShell>
  );
}

function eventNotes(message: string) {
  const marker = "Trailer access without a roof:";
  const index = message.indexOf(marker);
  if (index < 0) return message;
  const after = message.slice(index).split("\n").slice(1).join("\n").trim();
  return after;
}
