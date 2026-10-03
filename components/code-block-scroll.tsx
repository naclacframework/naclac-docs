"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

/**
 * Floating auto-hiding horizontal scrollbar overlay for code blocks.
 * Remains invisible until the user scrolls horizontally or hovers over
 * overflowing content, then smoothly fades out once idle.
 */
export function CodeBlockScroll({ children }: { children: ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [hasOverflow, setHasOverflow] = useState(false);
  const [thumb, setThumb] = useState({ width: 0, left: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartScrollLeftRef = useRef(0);

  const getViewport = useCallback(() => {
    const root = containerRef.current;
    if (!root) return null;
    return (
      root.querySelector<HTMLElement>('[data-component-part="code-block-root"]') ??
      root.querySelector<HTMLElement>("pre")
    );
  }, []);

  const update = useCallback((scrollingElement?: HTMLElement) => {
    const viewport = scrollingElement ?? getViewport();
    const track = trackRef.current;
    const root = containerRef.current;
    if (!viewport || !track || !root) return;

    const { clientWidth, scrollWidth, scrollLeft } = viewport;
    const overflow = scrollWidth > clientWidth + 2;
    setHasOverflow(overflow);

    if (overflow) {
      const trackWidth = track.clientWidth || (root.clientWidth - 32);
      const thumbWidth = Math.max(28, (clientWidth / scrollWidth) * trackWidth);
      const maxScroll = scrollWidth - clientWidth;
      const progress = maxScroll > 0 ? scrollLeft / maxScroll : 0;
      const thumbLeft = progress * (trackWidth - thumbWidth);
      setThumb({ width: thumbWidth, left: thumbLeft });
    }
  }, [getViewport]);

  const showBar = useCallback(() => {
    setIsVisible(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => {
      if (!isDraggingRef.current) {
        setIsVisible(false);
      }
    }, 850);
  }, []);

  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    const handleScrollCapture = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target && target.scrollWidth > target.clientWidth) {
        update(target);
        showBar();
      }
    };

    root.addEventListener("scroll", handleScrollCapture, { capture: true, passive: true });
    window.addEventListener("resize", () => update(), { passive: true });

    const ro = new ResizeObserver(() => update());
    ro.observe(root);

    update();

    return () => {
      root.removeEventListener("scroll", handleScrollCapture, { capture: true });
      window.removeEventListener("resize", () => update());
      ro.disconnect();
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, [update, showBar]);

  const onThumbMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const viewport = getViewport();
    if (!viewport) return;

    isDraggingRef.current = true;
    dragStartXRef.current = e.clientX;
    dragStartScrollLeftRef.current = viewport.scrollLeft;
    setIsVisible(true);

    const onMouseMove = (moveEvent: MouseEvent) => {
      if (!isDraggingRef.current || !trackRef.current) return;
      const trackWidth = trackRef.current.clientWidth;
      const deltaX = moveEvent.clientX - dragStartXRef.current;
      const { clientWidth, scrollWidth } = viewport;
      const maxScroll = scrollWidth - clientWidth;
      const scrollableTrack = trackWidth - thumb.width;
      if (scrollableTrack <= 0) return;
      const scrollDelta = (deltaX / scrollableTrack) * maxScroll;
      viewport.scrollLeft = dragStartScrollLeftRef.current + scrollDelta;
      update(viewport);
    };

    const onMouseUp = () => {
      isDraggingRef.current = false;
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      showBar();
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  const onTrackClick = (e: React.MouseEvent) => {
    const track = trackRef.current;
    const viewport = getViewport();
    if (!track || !viewport) return;
    const rect = track.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const trackWidth = track.clientWidth;
    const { clientWidth, scrollWidth } = viewport;
    const maxScroll = scrollWidth - clientWidth;
    const targetProgress = Math.max(0, Math.min(1, clickX / trackWidth));
    viewport.scrollTo({ left: targetProgress * maxScroll, behavior: "smooth" });
  };

  return (
    <div
      ref={containerRef}
      className="relative group/code-scroll"
      onMouseEnter={() => {
        update();
        if (hasOverflow) showBar();
      }}
      onMouseLeave={() => {
        if (!isDraggingRef.current) setIsVisible(false);
      }}
    >
      {children}
      <div
        ref={trackRef}
        onClick={onTrackClick}
        className={`absolute bottom-2 inset-x-4 h-1 rounded-full bg-neutral-200/40 dark:bg-white/10 z-20 transition-opacity duration-250 ease-out cursor-pointer ${
          hasOverflow && isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden="true"
      >
        <div
          onMouseDown={onThumbMouseDown}
          className="h-full rounded-full bg-neutral-400 hover:bg-neutral-500 active:bg-neutral-600 dark:bg-white/40 dark:hover:bg-white/60 dark:active:bg-white/70 transition-transform duration-75 ease-out cursor-grab active:cursor-grabbing"
          style={{
            width: `${thumb.width}px`,
            transform: `translateX(${thumb.left}px)`,
          }}
        />
      </div>
    </div>
  );
}
