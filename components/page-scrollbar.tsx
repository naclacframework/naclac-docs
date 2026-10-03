"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Floating auto-hiding vertical scrollbar overlay for the document page.
 * Invisible at rest; smoothly fades in while scrolling, proportionally
 * tracks scroll progress, and fades out after scrolling becomes idle.
 */
export function PageScrollbar() {
  const [isVisible, setIsVisible] = useState(false);
  const [hasOverflow, setHasOverflow] = useState(false);
  const [thumb, setThumb] = useState({ height: 0, top: 0 });
  const trackRef = useRef<HTMLDivElement>(null);
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isDraggingRef = useRef(false);
  const dragStartYRef = useRef(0);
  const dragStartScrollYRef = useRef(0);

  const update = useCallback(() => {
    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = window.innerHeight;
    const scrollY = window.scrollY;

    const overflow = scrollHeight > clientHeight + 30;
    setHasOverflow(overflow);

    const track = trackRef.current;
    if (overflow && track) {
      const trackHeight = track.clientHeight;
      const thumbHeight = Math.max(36, (clientHeight / scrollHeight) * trackHeight);
      const maxScroll = scrollHeight - clientHeight;
      const progress = maxScroll > 0 ? scrollY / maxScroll : 0;
      const thumbTop = progress * (trackHeight - thumbHeight);
      setThumb({ height: thumbHeight, top: thumbTop });
    }
  }, []);

  const onScroll = useCallback(() => {
    update();
    setIsVisible(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => {
      if (!isDraggingRef.current) {
        setIsVisible(false);
      }
    }, 850);
  }, [update]);

  useEffect(() => {
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", update, { passive: true });

    const scrollTimers = new WeakMap<HTMLElement, NodeJS.Timeout>();

    const onCaptureScroll = (e: Event) => {
      const target = e.target as HTMLElement;
      if (!target || target === document as unknown || target === document.documentElement || target === document.body) return;
      if (typeof target.setAttribute === "function") {
        target.setAttribute("data-scrolling", "true");
        const existing = scrollTimers.get(target);
        if (existing) clearTimeout(existing);
        scrollTimers.set(
          target,
          setTimeout(() => {
            target.removeAttribute("data-scrolling");
            scrollTimers.delete(target);
          }, 850)
        );
      }
    };

    window.addEventListener("scroll", onCaptureScroll, { capture: true, passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", onCaptureScroll, { capture: true });
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, [onScroll, update]);

  const onThumbMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    isDraggingRef.current = true;
    dragStartYRef.current = e.clientY;
    dragStartScrollYRef.current = window.scrollY;
    setIsVisible(true);

    const onMouseMove = (moveEvent: MouseEvent) => {
      if (!isDraggingRef.current || !trackRef.current) return;
      const trackHeight = trackRef.current.clientHeight;
      const deltaY = moveEvent.clientY - dragStartYRef.current;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = window.innerHeight;
      const maxScroll = scrollHeight - clientHeight;
      const scrollableTrack = trackHeight - thumb.height;
      if (scrollableTrack <= 0) return;
      const scrollDelta = (deltaY / scrollableTrack) * maxScroll;
      window.scrollTo(0, dragStartScrollYRef.current + scrollDelta);
    };

    const onMouseUp = () => {
      isDraggingRef.current = false;
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      hideTimerRef.current = setTimeout(() => {
        setIsVisible(false);
      }, 850);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  const onTrackClick = (e: React.MouseEvent) => {
    const track = trackRef.current;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    const clickY = e.clientY - rect.top;
    const trackHeight = track.clientHeight;
    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = window.innerHeight;
    const maxScroll = scrollHeight - clientHeight;
    const targetProgress = Math.max(0, Math.min(1, clickY / trackHeight));
    window.scrollTo({ top: targetProgress * maxScroll, behavior: "smooth" });
  };

  if (!hasOverflow) return null;

  return (
    <div
      ref={trackRef}
      onClick={onTrackClick}
      className={`fixed right-1 top-20 bottom-4 w-1.5 z-50 rounded-full transition-opacity duration-300 ease-out cursor-pointer ${
        isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      aria-hidden="true"
    >
      <div
        onMouseDown={onThumbMouseDown}
        className="w-full rounded-full bg-neutral-400/80 hover:bg-neutral-500 active:bg-neutral-600 dark:bg-white/40 dark:hover:bg-white/60 dark:active:bg-white/70 transition-transform duration-75 ease-out cursor-grab active:cursor-grabbing shadow-xs"
        style={{
          height: `${thumb.height}px`,
          transform: `translateY(${thumb.top}px)`,
        }}
      />
    </div>
  );
}
