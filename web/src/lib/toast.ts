export type ToastKind = "ok" | "error";

export function toast(message: string, kind: ToastKind = "ok") {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("hub-toast", { detail: { message, kind } }));
}
