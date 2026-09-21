import { z } from "zod";
import { asError, guardWrite, json, reject } from "@/lib/api";
import { store } from "@/lib/db";
import { safeText, uid } from "@/lib/security";
import type { Enquiry, EnquiryEvent } from "@/lib/types";

const messageSchema = z.object({
  kind: z.literal("message").optional(),
  name: z.string().min(2).max(80),
  email: z.string().email().max(120),
  phone: z.string().max(40).optional().default(""),
  message: z.string().min(10).max(2000),
});

const eventSchema = z.object({
  kind: z.literal("event"),
  name: z.string().min(2).max(80),
  email: z.string().email().max(120),
  phone: z.string().max(40).optional().default(""),
  message: z.string().max(2000).optional().default(""),
  eventDate: z.string().min(8).max(40),
  guests: z.coerce.number().int().min(1).max(5000),
  power: z.boolean(),
  trailerAccess: z.boolean(),
});

function eventBrief(event: EnquiryEvent, notes: string) {
  const lines = [
    `Date: ${event.date}`,
    `Guests: ${event.guests}`,
    `Power on site: ${event.power ? "Yes" : "No"}`,
    `Trailer access without a roof: ${event.trailerAccess ? "Yes" : "No"}`,
  ];
  if (notes) lines.push("", notes);
  return lines.join("\n");
}

export async function POST(request: Request) {
  try {
    const blocked = guardWrite(request, "contact", 5, 60 * 60 * 1000);
    if (blocked) return blocked;

    const raw = await request.json();
    const list = store.enquiries();
    const base = {
      id: uid(),
      createdAt: new Date().toISOString(),
      read: false as const,
    };

    if (raw?.kind === "event") {
      const body = eventSchema.parse(raw);
      const event: EnquiryEvent = {
        date: safeText(body.eventDate, 40),
        guests: body.guests,
        power: body.power,
        trailerAccess: body.trailerAccess,
      };
      const notes = safeText(body.message, 2000);
      const row: Enquiry = {
        ...base,
        kind: "event",
        name: safeText(body.name, 80),
        email: safeText(body.email, 120),
        phone: safeText(body.phone, 40),
        message: eventBrief(event, notes),
        event,
      };
      list.unshift(row);
    } else {
      const body = messageSchema.parse(raw);
      list.unshift({
        ...base,
        kind: "message",
        name: safeText(body.name, 80),
        email: safeText(body.email, 120),
        phone: safeText(body.phone, 40),
        message: safeText(body.message, 2000),
      });
    }

    store.saveEnquiries(list.slice(0, 500));
    return json({ ok: true });
  } catch (error) {
    if (error instanceof z.ZodError) return reject("Please check the form and try again");
    return asError(error);
  }
}
