import { NextResponse } from "next/server";
import { clientKey, isSameOrigin } from "./security";
import { rateLimit } from "./rate-limit";

export function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

export function reject(message: string, status = 400) {
  return json({ error: message }, status);
}

export function guardWrite(request: Request, key: string, limit: number, windowMs: number) {
  if (request.method !== "GET" && request.method !== "HEAD" && !isSameOrigin(request)) {
    return reject("Invalid origin", 403);
  }
  const limited = rateLimit(`${key}:${clientKey(request)}`, limit, windowMs);
  if (!limited.ok) {
    return reject("Too many attempts. Please wait a moment.", 429);
  }
  return null;
}

export function asError(error: unknown) {
  if (error instanceof Response) return error;
  console.error(error);
  return reject("Something went wrong", 500);
}
