"use client";

import { useState, type KeyboardEvent, type MouseEvent } from "react";

export function BagShot({
  front,
  behind = "",
  name,
  ratio = "aspect-square",
  className = "",
  inLink = false,
}: {
  front: string;
  behind?: string;
  name: string;
  ratio?: string;
  className?: string;
  inLink?: boolean;
}) {
  const [open, setOpen] = useState(false);

  if (!front) return null;
  if (!behind || behind === front) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={front} alt={name} className={`${ratio} w-full object-cover ${className}`} />
    );
  }

  function toggle(event: MouseEvent | KeyboardEvent) {
    const fineHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (fineHover) return;
    event.preventDefault();
    event.stopPropagation();
    setOpen((value) => !value);
  }

  return (
    <div
      className={`group/shot relative overflow-hidden ${ratio} ${className}`}
      onClick={toggle}
      onKeyDown={(event) => {
        if (inLink) return;
        if (event.key === "Enter" || event.key === " ") toggle(event);
      }}
      role={inLink ? undefined : "button"}
      tabIndex={inLink ? undefined : 0}
      aria-pressed={inLink ? undefined : open}
      aria-label={inLink ? undefined : open ? `Show the first photo of ${name}` : `Show the other photo of ${name}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={behind} alt="" className="absolute inset-0 h-full w-full object-cover" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={front}
        alt={name}
        className={`absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover/shot:translate-x-full motion-reduce:transition-none ${open ? "translate-x-full" : ""}`}
      />
    </div>
  );
}
