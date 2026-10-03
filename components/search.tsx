"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import type { FlatPage } from "@/content/nav";

/** Subsequence fuzzy match (query chars appear in order, not necessarily
 * contiguous) — used only as a fallback when no plain substring matches
 * exist. Lower score = better (fewer/earlier gaps). */
function fuzzyScore(text: string, query: string): number | null {
  let textIndex = 0;
  let score = 0;
  for (const ch of query) {
    const idx = text.indexOf(ch, textIndex);
    if (idx === -1) return null;
    score += idx - textIndex;
    textIndex = idx + 1;
  }
  return score;
}

function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="inline-flex items-center justify-center min-w-4 px-1.5 py-0.5 text-[10px] font-semibold font-mono rounded-md border border-gray-200/80 dark:border-white/10 bg-white dark:bg-white/5 text-gray-500 dark:text-gray-400 shadow-xs">
      {children}
    </kbd>
  );
}

function HighlightedTitle({ text, query }: { text: string; query: string }): ReactNode {
  if (!query) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-primary/20 text-primary dark:text-primary-light font-semibold rounded-xs px-0.5">
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
}

export function Search({
  pages,
  open: controlledOpen,
  onOpenChange,
}: {
  pages: FlatPage[];
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = (val: boolean) => {
    if (isControlled) {
      onOpenChange?.(val);
    } else {
      setInternalOpen(val);
    }
  };

  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return pages.slice(0, 8);

    const titleMatches: FlatPage[] = [];
    const descMatches: FlatPage[] = [];
    const otherMatches: FlatPage[] = [];
    const fuzzyMatches: { page: FlatPage; score: number }[] = [];

    for (const page of pages) {
      const title = page.title.toLowerCase();
      const desc = page.description?.toLowerCase() ?? "";
      const group = page.group.toLowerCase();
      const id = page.id.toLowerCase();

      if (title.includes(q)) {
        titleMatches.push(page);
      } else if (desc.includes(q)) {
        descMatches.push(page);
      } else if (group.includes(q) || id.includes(q)) {
        otherMatches.push(page);
      } else {
        const score = fuzzyScore(title, q);
        if (score !== null) fuzzyMatches.push({ page, score });
      }
    }
    fuzzyMatches.sort((a, b) => a.score - b.score);

    return [...titleMatches, ...descMatches, ...otherMatches, ...fuzzyMatches.map((m) => m.page)].slice(0, 10);
  }, [pages, query]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(true);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIndex(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  function go(page: FlatPage) {
    setOpen(false);
    router.push(`/${page.slug.join("/")}`);
  }

  function onInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const target = results[activeIndex];
      if (target) go(target);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Search documentation"
        className="group/search flex items-center justify-between text-sm leading-6 border border-gray-950/10 dark:border-white/10 text-gray-400 dark:text-gray-500 hover:text-gray-500 hover:dark:text-gray-400 bg-gray-950/[0.03] dark:bg-white/[0.03] hover:bg-gray-950/5 hover:dark:bg-white/5 h-8 2xl:w-60 min-w-8 w-8 2xl:px-2.5 rounded-full transition-colors relative"
      >
        <div className="flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            focusable="false"
            className="size-4 min-w-4 flex-none text-gray-700 group-hover/search:text-gray-800 dark:text-gray-400 dark:group-hover/search:text-gray-200 transition-colors"
          >
            <path d="M15.25 15.25L11.285 11.285" />
            <path d="M7.75 12.75C10.5114 12.75 12.75 10.5114 12.75 7.75C12.75 4.98858 10.5114 2.75 7.75 2.75C4.98858 2.75 2.75 4.98858 2.75 7.75C2.75 10.5114 4.98858 12.75 7.75 12.75Z" />
          </svg>
          <div className="truncate min-w-0 hidden 2xl:block">Search...</div>
        </div>
        <span className="flex-none text-xs font-semibold bg-white dark:bg-background-dark px-1.5 py-0.5 rounded-full text-gray-600 dark:text-gray-400 hidden 2xl:inline-flex">
          Ctrl K
        </span>
      </button>

      {mounted && open && createPortal(
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 dark:bg-black/75 backdrop-blur-xs p-3 pt-6 sm:pt-20 animate-fade-in"
          onClick={() => setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Search documentation"
            className="w-full max-w-[620px] overflow-hidden rounded-2xl border border-gray-200/80 dark:border-white/10 bg-white dark:bg-[#0e0d0f] shadow-2xl ring-1 ring-black/5 dark:ring-white/5 flex flex-col animate-fade-in-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search Input Container */}
            <div className="p-2 sm:p-2.5 relative z-10 border-b border-gray-100 dark:border-white/5">
              <div className="relative h-12 flex items-center px-3.5 rounded-xl border border-gray-200/80 dark:border-white/10 bg-gray-50/70 dark:bg-white/[0.04] transition-all focus-within:border-gray-400/80 dark:focus-within:border-white/20 focus-within:bg-white dark:focus-within:bg-[#121113]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 18 18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  className="size-4 shrink-0 text-gray-400 dark:text-gray-500 mr-3"
                >
                  <path d="M15.25 15.25L11.285 11.285" />
                  <path d="M7.75 12.75C10.5114 12.75 12.75 10.5114 12.75 7.75C12.75 4.98858 10.5114 2.75 7.75 2.75C4.98858 2.75 2.75 4.98858 2.75 7.75C2.75 10.5114 4.98858 12.75 7.75 12.75Z" />
                </svg>
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={onInputKeyDown}
                  placeholder="Search..."
                  autoComplete="off"
                  spellCheck="false"
                  className="flex-1 min-w-0 h-full bg-transparent border-none p-0 text-sm sm:text-base font-normal text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none! focus:outline-none! focus-visible:outline-none! focus:ring-0! ring-0! shadow-none!"
                  style={{ outline: "none", boxShadow: "none" }}
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    className="mr-2 p-1 rounded-md text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
                    aria-label="Clear query"
                  >
                    <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex items-center text-[11px] font-medium px-2 py-1 rounded-lg border border-gray-200/80 dark:border-white/10 bg-white dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors cursor-pointer select-none"
                  aria-label="Close search"
                >
                  Esc
                </button>
              </div>
            </div>

            {/* Results List */}
            <div className="scrollbar-common p-2 max-h-[calc(100vh-14rem)] sm:max-h-96 overflow-y-auto">
              {results.length > 0 ? (
                <ul className="space-y-1">
                  {results.map((page, i) => (
                    <li key={page.id}>
                      <button
                        type="button"
                        onClick={() => go(page)}
                        onMouseEnter={() => setActiveIndex(i)}
                        className={
                          "group flex w-full items-center justify-between gap-3 px-3.5 py-2.5 text-left rounded-xl transition-all duration-150 " +
                          (i === activeIndex
                            ? "bg-gray-100/90 dark:bg-white/10 text-gray-900 dark:text-white"
                            : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5")
                        }
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={
                              "flex size-8 shrink-0 items-center justify-center rounded-lg border transition-colors " +
                              (i === activeIndex
                                ? "border-primary/30 bg-primary/10 text-primary dark:text-primary-light"
                                : "border-gray-200/60 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300")
                            }
                          >
                            <svg
                              viewBox="0 0 24 24"
                              width="15"
                              height="15"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.75"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                              <polyline points="14 2 14 8 20 8" />
                            </svg>
                          </div>
                          <div className="flex min-w-0 flex-col">
                            <span className="text-sm font-medium tracking-tight truncate">
                              <HighlightedTitle text={page.title} query={query} />
                            </span>
                            <span className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1.5 mt-0.5">
                              <span>{page.tab}</span>
                              <span className="text-gray-300 dark:text-gray-700">/</span>
                              <span>{page.group}</span>
                            </span>
                          </div>
                        </div>
                        <svg
                          viewBox="0 0 24 24"
                          width="14"
                          height="14"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className={
                            "shrink-0 transition-transform " +
                            (i === activeIndex
                              ? "opacity-100 translate-x-0 text-primary dark:text-primary-light"
                              : "opacity-0 -translate-x-1 text-gray-400")
                          }
                        >
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="flex flex-col items-center justify-center gap-2 py-12 px-4 text-center">
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-gray-500 mb-1">
                    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <circle cx="11" cy="11" r="7" />
                      <path d="M21 21l-4.3-4.3" strokeLinecap="round" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-200">
                    No results found
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs">
                    We couldn&apos;t find any documentation matching &ldquo;<span className="text-gray-700 dark:text-gray-300 font-medium">{query}</span>&rdquo;
                  </p>
                </div>
              )}
            </div>

            {/* Footer with keyboard hints */}
            <div className="flex items-center justify-between border-t border-gray-100 dark:border-white/5 px-4 py-2.5 text-xs text-gray-500 dark:text-gray-400 bg-gray-50/70 dark:bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5">
                  <Kbd>↑</Kbd><Kbd>↓</Kbd> Navigate
                </span>
                <span className="flex items-center gap-1.5">
                  <Kbd>↵</Kbd> Select
                </span>
                <span className="flex items-center gap-1.5">
                  <Kbd>Esc</Kbd> Close
                </span>
              </div>
              <div className="hidden sm:flex items-center gap-1 text-[11px] text-gray-400 dark:text-gray-500">
                <span>{results.length} {results.length === 1 ? "result" : "results"}</span>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
