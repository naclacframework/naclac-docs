"use client";

import { useEffect, useRef, useState } from "react";

export type ThemePreference = "system" | "light" | "dark";

export const THEME_STORAGE_KEY = "theme";

function resolveTheme(pref: ThemePreference): "light" | "dark" {
  if (pref === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  return pref;
}

export function applyTheme(pref: ThemePreference) {
  const resolved = resolveTheme(pref);
  document.documentElement.classList.remove("light", "dark");
  document.documentElement.classList.add(resolved);
}

export function readStoredTheme(): ThemePreference {
  return (
    (window.localStorage.getItem(THEME_STORAGE_KEY) as ThemePreference | null) ??
    "system"
  );
}

export const THEME_ICONS: Record<ThemePreference, React.ReactNode> = {
  system: (
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
      className="size-4 text-gray-600 group-hover:text-gray-800 dark:text-gray-300 dark:group-hover:text-gray-100 transition-colors"
    >
      <path d="M4.5 15.5L9 14.5L13.5 15.5" />
      <path d="M9 11.75V14.5" />
      <path d="M14.25 2.75H3.75C2.64543 2.75 1.75 3.64543 1.75 4.75V9.75C1.75 10.8546 2.64543 11.75 3.75 11.75H14.25C15.3546 11.75 16.25 10.8546 16.25 9.75V4.75C16.25 3.64543 15.3546 2.75 14.25 2.75Z" />
    </svg>
  ),
  light: (
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
      className="size-4 text-gray-600 group-hover:text-gray-800 dark:text-gray-300 dark:group-hover:text-gray-100 transition-colors"
    >
      <path d="M9 1.25V2.25" />
      <path d="M14.48 3.52002L13.773 4.22702" />
      <path d="M16.75 9H15.75" />
      <path d="M14.48 14.4799L13.773 13.7729" />
      <path d="M9 16.75V15.75" />
      <path d="M3.52 14.4799L4.227 13.7729" />
      <path d="M1.25 9H2.25" />
      <path d="M3.52 3.52002L4.227 4.22702" />
      <path d="M9 13.25C11.3472 13.25 13.25 11.3472 13.25 9C13.25 6.65279 11.3472 4.75 9 4.75C6.65279 4.75 4.75 6.65279 4.75 9C4.75 11.3472 6.65279 13.25 9 13.25Z" />
    </svg>
  ),
  dark: (
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
      className="size-4 text-gray-600 group-hover:text-gray-800 dark:text-gray-300 dark:group-hover:text-gray-100 transition-colors"
    >
      <path d="M13 11.75C9.548 11.75 6.75 8.95201 6.75 5.50001C6.75 4.14801 7.183 2.90101 7.912 1.87801C4.548 2.50601 2 5.45301 2 9.00001C2 13.004 5.246 16.25 9.25 16.25C12.622 16.25 15.448 13.944 16.259 10.826C15.309 11.409 14.196 11.75 13 11.75Z" />
    </svg>
  ),
};

const OPTIONS: { pref: ThemePreference; label: string }[] = [
  { pref: "system", label: "System" },
  { pref: "light", label: "Light" },
  { pref: "dark", label: "Dark" },
];

export function ThemeToggle() {
  const [pref, setPref] = useState<ThemePreference>("system");
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored =
      (window.localStorage.getItem(THEME_STORAGE_KEY) as ThemePreference | null) ??
      "system";
    setPref(stored);
    applyTheme(stored);
  }, []);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("mousedown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("mousedown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function choose(next: ThemePreference) {
    setPref(next);
    window.localStorage.setItem(THEME_STORAGE_KEY, next);
    applyTheme(next);
    setOpen(false);
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Change theme preference"
        aria-expanded={open}
        className="group p-2 flex items-center justify-center w-9 h-9 rounded-full bg-gray-950/[0.03] dark:bg-white/[0.03] hover:bg-gray-950/10 dark:hover:bg-white/10 transition-colors"
      >
        {THEME_ICONS[pref]}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 min-w-36 origin-top-right rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-950 p-1 shadow-xl text-gray-950/70 dark:text-white/70 animate-fade-in-up">
          {OPTIONS.map((opt) => {
            const active = opt.pref === pref;
            return (
              <button
                key={opt.pref}
                type="button"
                onClick={() => choose(opt.pref)}
                className={
                  "flex w-full items-center justify-between p-2 gap-2 text-sm rounded-xl font-medium cursor-pointer select-none transition-colors " +
                  (active
                    ? "text-primary dark:text-primary-light"
                    : "text-gray-800 dark:text-gray-300 hover:text-gray-950 dark:hover:text-white hover:bg-gray-950/[0.03] dark:hover:bg-white/[0.03]")
                }
              >
                <div className="flex min-w-0 items-center gap-2">
                  {THEME_ICONS[opt.pref]}
                  <span>{opt.label}</span>
                </div>
                {active && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 18 18"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    className="size-3.5 shrink-0 text-primary dark:text-primary-light"
                  >
                    <path d="M2.75 9.5L6.5 13.25L15.25 4.5" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/** Inline script string, injected in the root layout's <head> so the
 * correct theme class is applied before first paint (no flash). */
export const themeBootstrapScript = `
(function () {
  try {
    var pref = localStorage.getItem('${THEME_STORAGE_KEY}') || 'system';
    var resolved = pref === 'system'
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : pref;
    document.documentElement.classList.add(resolved);
  } catch (e) {}
})();
`;
