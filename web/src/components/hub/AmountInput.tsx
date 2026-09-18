"use client";

import { useEffect, useRef, useState } from "react";

export function AmountInput({
  value,
  onChange,
  min = 0,
  step = 1,
  placeholder,
  className = "border border-line bg-white px-3 py-2",
}: {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  step?: number | "any";
  placeholder?: string;
  className?: string;
}) {
  const focused = useRef(false);
  const [text, setText] = useState(String(value ?? 0));

  useEffect(() => {
    if (!focused.current) setText(String(value ?? 0));
  }, [value]);

  return (
    <input
      type="number"
      inputMode="decimal"
      min={min}
      step={step}
      placeholder={placeholder}
      className={className}
      value={text}
      onFocus={() => {
        focused.current = true;
      }}
      onBlur={() => {
        focused.current = false;
        if (text === "" || !Number.isFinite(Number(text))) {
          setText(String(value ?? 0));
          return;
        }
        const n = Number(text);
        setText(String(n));
        onChange(n);
      }}
      onChange={(e) => {
        const raw = e.target.value;
        setText(raw);
        if (raw === "") return;
        const n = Number(raw);
        if (Number.isFinite(n)) onChange(n);
      }}
    />
  );
}
