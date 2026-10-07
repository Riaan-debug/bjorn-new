export type BagLine = {
  productId: string;
  sizeId: string;
  qty: number;
};

const KEY = "ap_bag";

export function readBag(): BagLine[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || "[]");
    if (!Array.isArray(raw)) return [];
    return raw
      .map((line) => ({
        productId: String(line?.productId || ""),
        sizeId: String(line?.sizeId || ""),
        qty: Math.min(6, Math.max(1, Math.round(Number(line?.qty) || 1))),
      }))
      .filter((line) => line.productId && line.sizeId);
  } catch {
    return [];
  }
}

export function writeBag(lines: BagLine[]) {
  localStorage.setItem(KEY, JSON.stringify(lines));
  window.dispatchEvent(new Event("ap-bag"));
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
