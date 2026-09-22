"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Wordmark } from "./Wordmark";

const CLEAR_AT = 14.5;
const CARD_AT = 15.6;
const LOGO_HOLD_MS = 2400;

export function HeroFilm({ location, tradingHours }: { location: string; tradingHours: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [clearCopy, setClearCopy] = useState(false);
  const [showLogo, setShowLogo] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let stage: "film" | "card" = "film";
    let holdTimer = 0;

    const restart = () => {
      stage = "film";
      setClearCopy(false);
      setShowLogo(false);
      video.currentTime = 0;
      void video.play().catch(() => {});
    };

    const tick = () => {
      if (stage === "card") return;
      if (video.currentTime >= CLEAR_AT) setClearCopy(true);
      if (video.ended || video.currentTime >= CARD_AT) {
        stage = "card";
        video.pause();
        setShowLogo(true);
        holdTimer = window.setTimeout(restart, LOGO_HOLD_MS);
      }
    };

    const id = window.setInterval(tick, 200);
    video.addEventListener("timeupdate", tick);
    video.addEventListener("seeked", tick);
    video.addEventListener("ended", tick);
    return () => {
      window.clearInterval(id);
      window.clearTimeout(holdTimer);
      video.removeEventListener("timeupdate", tick);
      video.removeEventListener("seeked", tick);
      video.removeEventListener("ended", tick);
    };
  }, []);

  return (
    <>
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover object-center"
        autoPlay
        muted
        playsInline
        poster="/media/hero-poster.jpg?v=2"
      >
        <source src="/media/hero.mp4?v=2" type="video/mp4" />
      </video>
      <div
        className={`absolute inset-0 bg-gradient-to-b from-navy/20 via-navy/30 to-navy transition-opacity duration-700 ${
          clearCopy ? "opacity-0" : "opacity-100"
        }`}
      />
      <div
        className={`relative z-10 mx-auto flex min-h-[92vh] max-w-6xl flex-col justify-end px-5 pb-20 pt-32 transition-opacity duration-700 sm:px-8 ${
          clearCopy ? "pointer-events-none opacity-0" : "opacity-100"
        }`}
      >
        <p className="text-[15px] leading-7 tracking-[0.01em] text-white sm:text-lg">{location}</p>
        <p className="mt-1 text-[15px] leading-7 tracking-[0.01em] text-white sm:text-lg">{tradingHours}</p>
        <div className="mt-10 flex flex-wrap gap-4">
          <Link href="/menu" className="btn-cream px-7 py-3.5 text-[13px] font-semibold uppercase tracking-[0.16em]">
            View menu
          </Link>
          <Link href="/visit" className="btn-ghost px-7 py-3.5 text-[13px] font-semibold uppercase tracking-[0.16em]">
            Find us
          </Link>
        </div>
      </div>
      <div
        className={`absolute inset-0 z-20 flex items-center justify-center bg-navy transition-opacity duration-700 ${
          showLogo ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden={!showLogo}
      >
        <Wordmark invert size="lg" />
      </div>
    </>
  );
}
