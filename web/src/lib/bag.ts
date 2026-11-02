export type BagLine = {
  productId: string;
  sizeId: string;
  qty: number;
};

const KEY = "ap_bag";

export function cleanBag(raw: unknown): BagLine[] {
  if (!Array.isArray(raw)) return [];
  const map = new Map<string, BagLine>();
  for (const item of raw) {
    const row = item && typeof item === "object" ? (item as Record<string, unknown>) : {};
    const productId = String(row.productId || "").slice(0, 40);
    const sizeId = String(row.sizeId || "").slice(0, 40);
    const qty = Math.min(6, Math.max(1, Math.round(Number(row.qty) || 1)));
    if (!productId || !sizeId) continue;
    const key = `${productId}:${sizeId}`;
    const hit = map.get(key);
    if (hit) hit.qty = Math.min(6, hit.qty + qty);
    else if (map.size < 12) map.set(key, { productId, sizeId, qty });
  }
  return [...map.values()];
}

export function mergeBags(a: unknown, b: unknown): BagLine[] {
  const map = new Map<string, BagLine>();
  for (const line of [...cleanBag(a), ...cleanBag(b)]) {
    const key = `${line.productId}:${line.sizeId}`;
    const hit = map.get(key);
    if (!hit) {
      if (map.size >= 12) continue;
      map.set(key, { ...line });
    } else {
      hit.qty = Math.min(6, Math.max(hit.qty, line.qty));
    }
  }
  return [...map.values()];
}

export function readBag(): BagLine[] {
  if (typeof window === "undefined") return [];
  try {
    return cleanBag(JSON.parse(localStorage.getItem(KEY) || "[]"));
  } catch {
    return [];
  }
}

export function writeBag(lines: BagLine[]) {
  const next = cleanBag(lines);
  localStorage.setItem(KEY, JSON.stringify(next));
  window.dispatchEvent(new Event("ap-bag"));
  void pushBag(next);
}

export function addBag(productId: string, sizeId: string, qty: number) {
  const lines = readBag();
  const hit = lines.find((line) => line.productId === productId && line.sizeId === sizeId);
  const next = Math.min(6, Math.max(1, Math.round(qty)));
  if (hit) hit.qty = Math.min(6, hit.qty + next);
  else lines.push({ productId, sizeId, qty: next });
  writeBag(lines);
}

export function bagCount() {
  return readBag().reduce((sum, line) => sum + line.qty, 0);
}

let hydrated = false;

export function hydrateBagFromServer() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  fetch("/api/account/me")
    .then((res) => (res.ok ? res.json() : null))
    .then((me) => {
      if (!me?.bag) return;
      writeBag(mergeBags(readBag(), me.bag));
    })
    .catch(() => {});
}

async function pushBag(lines: BagLine[]) {
  if (typeof window === "undefined") return;
  try {
    const res = await fetch("/api/account/bag", {
      method: "POST",
      credentials: "same-origin",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ items: lines }),
    });
    if (res.status === 401) return;
  } catch {
    /* Guest bags stay on this phone. */
  }
}
