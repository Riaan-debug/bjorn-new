"use client";

import { useEffect, useState } from "react";

export function CoolerLoop() {
  const [still, setStill] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setStill(media.matches);
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, []);

  if (still) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src="/media/cooler-poster.jpg" alt="Coffee beans turning on the cooling tray" className="h-full w-full object-cover" />
    );
  }

  return (
    <video
      className="h-full w-full object-cover"
      autoPlay
      muted
      loop
      playsInline
      poster="/media/cooler-poster.jpg"
      aria-label="Coffee beans turning on the cooling tray"
    >
      <source src="/media/cooler.mp4" type="video/mp4" />
    </video>
  );
}
