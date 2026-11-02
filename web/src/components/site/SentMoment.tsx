"use client";

import { useEffect, useRef, useState } from "react";

function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function smooth(value: number) {
  const t = clamp(value);
  return t * t * (3 - 2 * t);
}

export function SentMoment({
  copy,
  specs,
  src,
}: {
  copy: string;
  specs: string[];
  src: string;
}) {
  const sceneRef = useRef<HTMLDivElement>(null);
  const cupRef = useRef<HTMLDivElement>(null);
  const [still, setStill] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setStill(media.matches);
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    const scene = sceneRef.current;
    const cup = cupRef.current;
    if (!scene || !cup || still) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = scene.getBoundingClientRect();
      const view = window.innerHeight || 1;
      const t = smooth(-rect.top / (view * 0.92));
      cup.style.transform = `translate3d(${t * 18}%, ${t * 6}%, 0) rotate(${t * 6}deg)`;
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [still]);

  return (
    <section ref={sceneRef} className="sent-scene bg-cream">
      <div className="mx-auto grid max-w-6xl items-center gap-8 px-5 py-16 pb-28 sm:px-8 sm:py-24 md:grid-cols-2 md:gap-x-16 md:gap-y-8">
        <h2 className="sent-word text-center text-navy md:text-left">Sent</h2>
        <div className="relative overflow-hidden md:row-span-2">
          <div
            ref={cupRef}
            className={`sent-cup mx-auto w-full max-w-md md:max-w-none ${still ? "" : "will-change-transform"}`}
          >
            <div className="aspect-[4/5] overflow-hidden bg-navy shadow-[0_24px_50px_rgba(1,27,61,0.18)]">
              {src ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={src} alt="The Apostellō cup" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-end bg-navy p-6">
                  <span className="font-display text-3xl font-light text-cream">The cup</span>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="relative z-10 text-center md:text-left">
          <p className="mx-auto max-w-md text-base leading-8 text-mist md:mx-0">{copy}</p>
          <ul className="mt-8 flex flex-col gap-2 md:items-start">
            {specs.map((spec) => (
              <li key={spec} className="text-[12px] uppercase tracking-[0.16em] text-navy">
                {spec}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
