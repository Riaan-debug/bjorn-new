"use client";

import { useEffect, useRef, type ReactNode } from "react";

const CREAM = "#fffdf5";
const NAVY = "#011b3d";

function Sticker({
  className = "",
  shift,
  children,
}: {
  className?: string;
  shift: number;
  children: ReactNode;
}) {
  const anchorRef = useRef<HTMLDivElement>(null);
  const motionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const anchor = anchorRef.current;
    const node = motionRef.current;
    if (!anchor || !node) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = anchor.getBoundingClientRect();
      const raw = (window.innerHeight / 2 - (rect.top + rect.height / 2)) / window.innerHeight;
      const delta = Math.max(-0.8, Math.min(0.8, raw));
      const y = -delta * shift;
      const x = -delta * shift * 0.12;
      const tilt = -delta * 6;
      node.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${tilt}deg)`;
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
  }, [shift]);

  return (
    <div ref={anchorRef} className={`sticker pointer-events-none absolute z-30 ${className}`} aria-hidden>
      <div ref={motionRef}>{children}</div>
    </div>
  );
}

export function CupSticker({ className = "" }: { className?: string }) {
  return (
    <Sticker className={className} shift={64}>
      <svg viewBox="0 0 200 240" fill="none">
        <path
          d="M40 74c-2-26 122-26 120 0 0 10-8 16-14 18l-12 100c-4 20-64 20-68 0L54 92c-6-2-14-8-14-18Z"
          fill={CREAM}
          stroke={CREAM}
          strokeWidth="16"
          strokeLinejoin="round"
        />
        <path
          d="M40 74c-2-26 122-26 120 0 0 10-8 16-14 18l-12 100c-4 20-64 20-68 0L54 92c-6-2-14-8-14-18Z"
          stroke={NAVY}
          strokeWidth="2.4"
          strokeLinejoin="round"
        />
        <path d="M48 78h104" stroke={NAVY} strokeWidth="2.4" strokeLinecap="round" />
        <path d="M58 112h88l-3 28H55l3-28Z" stroke={NAVY} strokeWidth="2.4" strokeLinejoin="round" />
        <text
          x="100"
          y="172"
          textAnchor="middle"
          fill={NAVY}
          style={{
            fontFamily: "var(--font-montserrat), Montserrat, sans-serif",
            fontSize: 13,
            fontWeight: 500,
            letterSpacing: "0.02em",
          }}
        >
          Apostellō
        </text>
      </svg>
    </Sticker>
  );
}

export function BurgerSticker({ className = "" }: { className?: string }) {
  return (
    <Sticker className={className} shift={88}>
      <svg viewBox="0 0 200 210" fill="none">
        <g fill={CREAM} stroke={CREAM} strokeWidth="14" strokeLinejoin="round">
          <path d="M36 92C32 44 168 40 172 90l4 12c2 8-10 12-20 12H48c-12 0-20-4-16-14l4-8Z" />
          <path d="M40 112h132l8 14-14-2 6 14H46l4-12-8-4-2-10Z" />
          <path d="M32 136h144c6 0 8 12-2 16H36c-10 0-12-10-4-16Z" />
          <path d="M44 156h120c16 0 20 18 4 28-26 14-90 14-120 2-12-6-16-20-8-28 2-1 2-2 4-2Z" />
        </g>
        <g fill="none" stroke={NAVY} strokeWidth="2.3" strokeLinejoin="round" strokeLinecap="round">
          <path d="M36 92C32 44 168 40 172 90l4 12c2 8-10 12-20 12H48c-12 0-20-4-16-14l4-8Z" />
          <path d="M40 112h132l8 14-14-2 6 14H46l4-12-8-4-2-10Z" />
          <path d="M32 136h144c6 0 8 12-2 16H36c-10 0-12-10-4-16Z" />
          <path d="M30 152c10 8 16-4 26 0s16-6 26 2 18 4 28-2 16-6 24 0 18 2 26-4" />
          <path d="M44 156h120c16 0 20 18 4 28-26 14-90 14-120 2-12-6-16-20-8-28 2-1 2-2 4-2Z" />
        </g>
        <g fill={NAVY}>
          <ellipse cx="72" cy="72" rx="3.2" ry="2.2" transform="rotate(-16 72 72)" />
          <ellipse cx="100" cy="64" rx="3.2" ry="2.2" transform="rotate(6 100 64)" />
          <ellipse cx="130" cy="72" rx="3.2" ry="2.2" transform="rotate(14 130 72)" />
          <ellipse cx="88" cy="84" rx="2.6" ry="1.8" />
        </g>
      </svg>
    </Sticker>
  );
}

export function PortafilterSticker({ className = "" }: { className?: string }) {
  return (
    <Sticker className={className} shift={52}>
      <svg viewBox="0 0 250 150" fill="none">
        <g fill={CREAM} stroke={CREAM} strokeWidth="14" strokeLinejoin="round">
          <circle cx="68" cy="62" r="34" />
          <path d="M96 48h92c22 0 24 32 2 32H100" />
        </g>
        <g fill="none" stroke={NAVY} strokeWidth="2.3" strokeLinejoin="round" strokeLinecap="round">
          <circle cx="68" cy="62" r="34" />
          <circle cx="68" cy="62" r="18" />
          <path d="M96 48h92c22 0 24 32 2 32H100" />
          <path d="M168 56v16" />
          <path d="M60 72v16" />
          <path d="M76 72v16" />
        </g>
      </svg>
    </Sticker>
  );
}
