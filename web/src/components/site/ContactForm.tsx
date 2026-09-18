"use client";

import { useState } from "react";

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "err">("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formEl = e.currentTarget;
    setStatus("sending");
    setError("");
    const form = new FormData(formEl);
    const res = await fetch("/api/public/contact", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        email: form.get("email"),
        phone: form.get("phone"),
        message: form.get("message"),
      }),
    });
    if (res.ok) {
      setStatus("ok");
      formEl.reset();
      return;
    }
    const data = await res.json().catch(() => ({}));
    setError(data.error || "Could not send. Try again shortly.");
    setStatus("err");
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-4">
      <Field name="name" label="Name" required />
      <Field name="email" label="Email" type="email" required />
      <Field name="phone" label="Phone" />
      <label className="block">
        <span className="text-[11px] uppercase tracking-[0.2em] text-mist">Message</span>
        <textarea
          name="message"
          required
          minLength={10}
          rows={5}
          className="mt-2 w-full border border-line bg-white px-3 py-3 outline-none focus:border-navy"
        />
      </label>
      <button
        type="submit"
        disabled={status === "sending"}
        className="bg-navy px-6 py-3 text-[12px] uppercase tracking-[0.22em] text-cream disabled:opacity-60"
      >
        {status === "sending" ? "Sending…" : "Send"}
      </button>
      {status === "ok" ? <p className="text-sm text-navy">Received. We’ll come back to you.</p> : null}
      {status === "err" ? <p className="text-sm text-red-700">{error}</p> : null}
    </form>
  );
}

function Field({
  name,
  label,
  type = "text",
  required = false,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-[11px] uppercase tracking-[0.2em] text-mist">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        className="mt-2 w-full border border-line bg-white px-3 py-3 outline-none focus:border-navy"
      />
    </label>
  );
}
