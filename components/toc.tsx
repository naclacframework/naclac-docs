// Table of Contents (TOC) navigation component with sliding scroll-spy indicator.
"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

type Heading = { id: string; text: string; level: number };

/** Strips anchor buttons and non-content elements to extract raw heading text. */
function headingText(el: HTMLElement): string {
  const clone = el.cloneNode(true) as HTMLElement;
  clone.querySelectorAll("a, button, [aria-hidden='true']").forEach((node) => node.remove());
  return clone.textContent?.trim() || "";
}

export function Toc() {
  const pathname = usePathname();
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [dotTop, setDotTop] = useState<number>(16);
  const [dotVisible, setDotVisible] = useState(false);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    function scan() {
      const elements = Array.from(
        document.querySelectorAll<HTMLHeadingElement>("main h2[id], main h3[id]")
      );
      if (elements.length > 0) {
        const next = elements.map((el) => ({
          id: el.id,
          text: headingText(el),
          level: el.tagName === "H2" ? 2 : 3,
        }));
        setHeadings(next);
        const hash = typeof window !== "undefined" && window.location.hash ? window.location.hash.slice(1) : "";
        const hashMatch = next.some((h) => h.id === hash);
        setActiveId((prev) => (prev ? prev : hashMatch ? hash : next[0].id));
      }
    }

    scan();
    const main = document.querySelector("main");
    const observer = new MutationObserver(() => scan());
    if (main) {
      observer.observe(main, { childList: true, subtree: true });
    }
    return () => observer.disconnect();
  }, [pathname]);

  useEffect(() => {
    if (headings.length === 0) return;

    const handleScroll = () => {
      const elements = Array.from(
        document.querySelectorAll<HTMLHeadingElement>("main h2[id], main h3[id]")
      );
      if (elements.length === 0) return;

      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 50) {
        setActiveId(elements[elements.length - 1].id);
        return;
      }

      let current = elements[0].id;
      for (const el of elements) {
        const rect = el.getBoundingClientRect();
        if (rect.top <= 120) {
          current = el.id;
        } else {
          break;
        }
      }
      setActiveId(current);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [headings]);

  useEffect(() => {
    function updateDot() {
      if (!activeId || !listRef.current) return;
      const activeLi = listRef.current.querySelector<HTMLElement>(
        `li[data-id="${CSS.escape(activeId)}"]`
      );
      if (activeLi) {
        setDotTop(activeLi.offsetTop + 16);
        setDotVisible(true);
      }
    }

    updateDot();
    window.addEventListener("resize", updateDot);
    return () => window.removeEventListener("resize", updateDot);
  }, [activeId, headings]);

  if (headings.length === 0) return null;

  return (
    <nav
      aria-label="On this page"
      className="scrollbar-common sticky top-20 hidden max-h-[calc(100vh-6rem)] w-60 shrink-0 self-start overflow-y-auto xl:block"
    >
      <h2 className="m-0 font-normal">
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="flex items-center space-x-2 text-sm font-medium text-gray-700 transition-colors hover:text-gray-900 cursor-pointer dark:text-gray-300 dark:hover:text-gray-100"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className="size-3 shrink-0"
          >
            <path
              d="M2.75 14.25H15.25"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M2.75 3.75H15.25"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M2.75 9H8.25"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span>On this page</span>
        </button>
      </h2>

      <div className="relative mt-2">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-0 h-1.5 w-1.5 rounded-full bg-primary dark:bg-primary-light"
          style={{
            top: `${dotTop}px`,
            transform: "translateY(-50%)",
            transition: "top 160ms cubic-bezier(0.25, 0.75, 0.2, 1), opacity 150ms ease",
            opacity: dotVisible ? 1 : 0,
          }}
        />
        <ul ref={listRef} id="table-of-contents-content" className="toc">
          {headings.map((h) => {
            const active = h.id === activeId;
            return (
              <li
                key={h.id}
                data-id={h.id}
                className="toc-item relative pl-4"
              >
                <a
                  href={`#${h.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    const target = document.getElementById(h.id);
                    if (target) {
                      const y = target.getBoundingClientRect().top + window.scrollY - 88;
                      window.scrollTo({ top: y, behavior: "smooth" });
                      window.history.pushState(null, "", `#${h.id}`);
                      setActiveId(h.id);
                    }
                  }}
                  style={{ paddingLeft: h.level === 3 ? "0.75rem" : "0rem" }}
                  className={
                    "block break-words py-1 text-sm leading-6 transition-colors " +
                    (active
                      ? "text-primary dark:text-primary-light [text-shadow:-0.15px_0_0_currentColor,0.15px_0_0_currentColor]"
                      : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200")
                  }
                >
                  {h.text}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
