"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

function wrap(time: number, duration: number) {
  if (!duration) return 0;
  return ((time % duration) + duration) % duration;
}

export function BeanFall() {
  const [on, setOn] = useState(false);
  const leftRef = useRef<HTMLVideoElement>(null);
  const rightRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const wide = window.matchMedia("(min-width: 80rem)");
    const sync = () => setOn(!reduce.matches && wide.matches);
    sync();
    reduce.addEventListener("change", sync);
    wide.addEventListener("change", sync);
    return () => {
      reduce.removeEventListener("change", sync);
      wide.removeEventListener("change", sync);
    };
  }, []);

  useEffect(() => {
    if (!on) return;
    const left = leftRef.current;
    const right = rightRef.current;
    if (!left || !right) return;

    const time = { left: 0, right: 0 };
    let rightArmed = false;

    const armRight = () => {
      if (!right.duration || rightArmed) return;
      time.right = right.duration * 0.47;
      right.currentTime = time.right;
      rightArmed = true;
    };
    right.addEventListener("loadedmetadata", armRight);
    if (right.readyState >= 1) armRight();

    const follow = (video: HTMLVideoElement, target: number) => {
      if (!video.duration || video.seeking) return;
      const next = wrap(target, video.duration);
      const gap = Math.abs(next - video.currentTime);
      if (Math.min(gap, video.duration - gap) < 0.03) return;
      video.currentTime = next;
    };

    const onLeftSeeked = () => follow(left, time.left);
    const onRightSeeked = () => follow(right, time.right);
    left.addEventListener("seeked", onLeftSeeked);
    right.addEventListener("seeked", onRightSeeked);

    let last = window.scrollY;
    let frame = 0;

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const y = window.scrollY;
        const delta = y - last;
        last = y;
        if (Math.abs(delta) < 0.5) return;

        const step = delta * 0.0055;
        if (left.duration) {
          time.left = wrap(time.left + step, left.duration);
          follow(left, time.left);
        }
        if (right.duration) {
          if (!rightArmed) armRight();
          time.right = wrap(time.right + step, right.duration);
          follow(right, time.right);
        }
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      right.removeEventListener("loadedmetadata", armRight);
      left.removeEventListener("seeked", onLeftSeeked);
      right.removeEventListener("seeked", onRightSeeked);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [on]);

  if (!on) return null;

  return (
    <>
      <BeanStrip side="left" videoRef={leftRef} />
      <BeanStrip side="right" videoRef={rightRef} />
    </>
  );
}

function BeanStrip({
  side,
  videoRef,
}: {
  side: "left" | "right";
  videoRef: RefObject<HTMLVideoElement | null>;
}) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none fixed bottom-0 top-0 z-20 overflow-hidden ${side === "left" ? "left-0" : "right-0"}`}
      style={{ width: "var(--bean-strip)" }}
    >
      <video
        ref={videoRef}
        className={`h-full w-full object-cover mix-blend-multiply ${side === "right" ? "-scale-x-100" : ""}`}
        muted
        playsInline
        preload="auto"
        src="/media/fall.webm?v=2"
      />
    </div>
  );
}
