"use client";

import { useEffect, useState } from "react";
import type { ToastKind } from "@/lib/toast";

type Note = { message: string; kind: ToastKind; id: number };

export function ToastHost() {
  const [note, setNote] = useState<Note | null>(null);

  useEffect(() => {
    function onToast(event: Event) {
      const detail = (event as CustomEvent<{ message?: string; kind?: ToastKind }>).detail || {};
      const message = String(detail.message || "").trim();
      if (!message) return;
      setNote({ message, kind: detail.kind === "error" ? "error" : "ok", id: Date.now() });
    }
    window.addEventListener("hub-toast", onToast);
    return () => window.removeEventListener("hub-toast", onToast);
  }, []);

  useEffect(() => {
    if (!note) return;
    const timer = window.setTimeout(() => setNote(null), 2800);
    return () => window.clearTimeout(timer);
  }, [note]);

  if (!note) return null;

  return (
    <div
      role="status"
      className={`fixed bottom-20 right-5 z-50 max-w-sm border bg-navy px-4 py-3 text-sm text-cream ${
        note.kind === "error" ? "border-cream/20 border-l-4 border-l-red-400" : "border-cream/20"
      }`}
    >
      {note.message}
    </div>
  );
}
