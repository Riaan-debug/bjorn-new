"use client";

import { earliestEventDate } from "@/lib/dates";
import { useEffect, useId, useRef, useState } from "react";

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

function shiftMonth(year: number, month: number, by: number) {
  const next = new Date(Date.UTC(year, month - 1 + by, 1));
  return { year: next.getUTCFullYear(), month: next.getUTCMonth() + 1 };
}

function monthCells(year: number, month: number) {
  const first = new Date(Date.UTC(year, month - 1, 1));
  const lead = (first.getUTCDay() + 6) % 7;
  const count = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const cells: Array<string | null> = Array.from({ length: lead }, () => null);
  for (let day = 1; day <= count; day += 1) {
    cells.push(new Date(Date.UTC(year, month - 1, day)).toISOString().slice(0, 10));
  }
  while (cells.length % 7) cells.push(null);
  return cells;
}

function monthTitle(year: number, month: number) {
  return new Date(Date.UTC(year, month - 1, 1)).toLocaleDateString("en-ZA", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

function longDate(iso: string) {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString("en-ZA", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function BookingDate({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const min = earliestEventDate();
  const [open, setOpen] = useState(false);
  const start = value || min;
  const [cursor, setCursor] = useState(() => {
    const [year, month] = start.split("-").map(Number);
    return { year, month };
  });
  const wrapRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  useEffect(() => {
    if (!open) return;
    function onPointer(event: MouseEvent) {
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const [minYear, minMonth] = min.split("-").map(Number);
  const prev = shiftMonth(cursor.year, cursor.month, -1);
  const canGoBack = prev.year > minYear || (prev.year === minYear && prev.month >= minMonth);

  return (
    <div ref={wrapRef} className="relative">
      <span className="text-[11px] uppercase tracking-[0.2em] text-mist">Date</span>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((current) => !current)}
        className={`mt-2 flex w-full items-center border bg-white px-3 py-3 text-left outline-none ${
          open ? "border-navy" : "border-line"
        }`}
      >
        <span className={value ? "text-navy" : "text-mist"}>{value ? longDate(value) : "Choose a date"}</span>
      </button>
      <input type="hidden" name="eventDate" value={value} required />
      {open ? (
        <div id={listId} className="absolute left-0 top-full z-30 mt-2 w-72 border border-navy bg-white p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="font-display text-lg font-light text-navy">{monthTitle(cursor.year, cursor.month)}</p>
            <div className="flex gap-1">
              <button
                type="button"
                aria-label="Previous month"
                disabled={!canGoBack}
                onClick={() => setCursor(prev)}
                className="h-8 w-8 text-navy disabled:opacity-25"
              >
                ‹
              </button>
              <button
                type="button"
                aria-label="Next month"
                onClick={() => setCursor(shiftMonth(cursor.year, cursor.month, 1))}
                className="h-8 w-8 text-navy"
              >
                ›
              </button>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-7 gap-1 text-center">
            {WEEKDAYS.map((day) => (
              <span key={day} className="py-1 text-[10px] uppercase tracking-[0.14em] text-mist">
                {day}
              </span>
            ))}
            {monthCells(cursor.year, cursor.month).map((iso, index) => {
              if (!iso) return <span key={`empty-${index}`} />;
              const bookable = iso >= min;
              const selected = iso === value;
              return (
                <button
                  key={iso}
                  type="button"
                  disabled={!bookable}
                  onClick={() => {
                    onChange(iso);
                    setOpen(false);
                  }}
                  className={`h-8 text-sm ${
                    selected
                      ? "bg-navy text-cream"
                      : bookable
                        ? "text-navy hover:bg-navy/10"
                        : "cursor-default text-navy/25"
                  }`}
                >
                  {Number(iso.slice(-2))}
                </button>
              );
            })}
          </div>
          <p className="mt-3 text-[11px] uppercase tracking-[0.16em] text-mist">From tomorrow</p>
        </div>
      ) : null}
    </div>
  );
}
