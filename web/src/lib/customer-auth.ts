import { compare } from "bcryptjs";
import { cookies } from "next/headers";
import { validPin } from "./auth";
import { store } from "./db";
import { signPayload, verifyPayload } from "./security";
import type { Customer } from "./types";

const COOKIE = "ap_card";
const MAX_AGE = 60 * 60 * 24 * 30;

type CardSession = {
  customerId: string;
  iat: number;
  exp: number;
};

export async function createCustomerSession(customerId: string) {
  const now = Math.floor(Date.now() / 1000);
  const token = signPayload({
    customerId,
    iat: now,
    exp: now + MAX_AGE,
  } satisfies CardSession);
  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function clearCustomerSession() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export async function getCustomerSession() {
  const jar = await cookies();
  const session = verifyPayload<CardSession>(jar.get(COOKIE)?.value);
  if (!session?.customerId) return null;
  if (session.exp * 1000 < Date.now()) return null;
  const customer = store.customers().find((item) => item.id === session.customerId);
  if (!customer) return null;
  return { customerId: customer.id, customer };
}

export async function requireCustomer() {
  const session = await getCustomerSession();
  if (!session) {
    throw new Response(JSON.stringify({ error: "Sign in required" }), {
      status: 401,
      headers: { "content-type": "application/json" },
    });
  }
  return session;
}

export async function customerPinMatches(customer: Pick<Customer, "pinHash">, pin: string) {
  if (!customer.pinHash || !validPin(pin)) return false;
  return compare(pin, customer.pinHash);
}
