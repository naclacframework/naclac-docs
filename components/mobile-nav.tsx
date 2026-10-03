// File: website/docs/components/mobile-nav.tsx
// Purpose: Mobile navigation interfaces for the documentation site, providing
// the slide-over sidebar drawer for page hierarchy and the header dropdown menu.

"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import type { NavTab } from "@/content/nav";
import {
  applyTheme,
  readStoredTheme,
  THEME_ICONS,
  THEME_STORAGE_KEY,
  type ThemePreference,
} from "./theme-toggle";

const THEME_OPTIONS: ThemePreference[] = ["system", "light", "dark"];

export function MobileNavbarMenu({
  open,
  onClose,
  tabs,
  currentTab,
  githubUrl,
  stars,
}: {
  open: boolean;
  onClose: () => void;
  tabs: NavTab[];
  currentTab: string;
  githubUrl?: string;
  stars?: number | null;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!mounted || !open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 lg:hidden pointer-events-auto">
      <div
        className="fixed inset-0 bg-black/20 touch-none"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="fixed right-4 top-14 z-50 w-72 origin-top-right rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#18181b] p-4 shadow-2xl animate-fade-in-up overscroll-contain touch-pan-y">
        <div className="flex items-center justify-between pb-3">
          <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">
            {currentTab}
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="flex size-7 items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/20 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-3.5"
            >
              <path d="M4 4l8 8M12 4l-8 8" />
            </svg>
          </button>
        </div>

        <div className="flex flex-col gap-1 py-1">
          {tabs.map((tab) => {
            const firstPage = tab.groups[0]?.pages[0];
            const active = tab.tab === currentTab;
            return (
              <Link
                key={tab.tab}
                href={firstPage ? `/${firstPage.slug.join("/")}` : "/"}
                onClick={onClose}
                className={
                  "flex items-center justify-between py-2 text-base font-medium transition-colors " +
                  (active
                    ? "text-primary dark:text-primary-light font-semibold"
                    : "text-gray-700 dark:text-gray-300 hover:text-gray-950 dark:hover:text-white")
                }
              >
                <span>{tab.tab}</span>
              </Link>
            );
          })}
        </div>

        {githubUrl && (
          <div className="mt-2 pt-3 border-t border-gray-100 dark:border-gray-800">
            <a
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onClose}
              className="flex items-center justify-between py-1 text-base font-medium text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary-light transition-colors"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" className="shrink-0">
                  <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.1 3.3 9.4 7.9 10.9.6.1.8-.25.8-.57v-2c-3.2.7-3.9-1.4-3.9-1.4-.5-1.3-1.3-1.7-1.3-1.7-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.7 1.3 3.4 1 .1-.8.4-1.3.8-1.6-2.6-.3-5.3-1.3-5.3-5.7 0-1.3.4-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.3 1.2.9-.3 2-.4 3-.4s2.1.1 3 .4c2.3-1.5 3.3-1.2 3.3-1.2.6 1.6.2 2.8.1 3.1.8.8 1.2 1.8 1.2 3.1 0 4.4-2.7 5.4-5.3 5.7.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6 4.6-1.5 7.9-5.8 7.9-10.9C23.5 5.65 18.35.5 12 .5z" />
                </svg>
                <span className="truncate">{githubUrl.replace(/^https?:\/\/(www\.)?github\.com\//, "").replace(/\/$/, "")}</span>
              </div>
              {stars !== null && stars !== undefined && (
                <div className="flex items-center gap-1 shrink-0 text-gray-500 dark:text-gray-400">
                  <svg
                    className="size-3.5"
                    aria-hidden="true"
                    style={{
                      maskImage: 'url("https://d3gk2c5xim1je2.cloudfront.net/fontawesome/v7.2.0/regular/star.svg")',
                      WebkitMaskImage: 'url("https://d3gk2c5xim1je2.cloudfront.net/fontawesome/v7.2.0/regular/star.svg")',
                      maskRepeat: 'no-repeat',
                      WebkitMaskRepeat: 'no-repeat',
                      maskPosition: 'center',
                      WebkitMaskPosition: 'center',
                      backgroundColor: 'currentColor',
                    }}
                  />
                  <span className="text-sm">{stars}</span>
                </div>
              )}
            </a>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

export function MobileSidebarDrawer({
  open,
  onClose,
  tabs,
  currentTab,
  tab,
  currentSlugKey,
  siteName,
}: {
  open: boolean;
  onClose: () => void;
  tabs?: NavTab[];
  currentTab?: string;
  tab: NavTab;
  currentSlugKey: string;
  siteName?: string;
}) {
  const [mounted, setMounted] = useState(false);
  const [themePref, setThemePref] = useState<ThemePreference>("system");
  const [tabDropdownOpen, setTabDropdownOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    setThemePref(readStoredTheme());
  }, []);

  useEffect(() => {
    if (!open) {
      setTabDropdownOpen(false);
      return;
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    const scrollY = window.scrollY;
    const origBodyOverflow = document.body.style.overflow;
    const origBodyPosition = document.body.style.position;
    const origBodyTop = document.body.style.top;
    const origBodyWidth = document.body.style.width;
    const origHtmlOverflow = document.documentElement.style.overflow;

    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.documentElement.style.overflow = origHtmlOverflow;
      document.body.style.overflow = origBodyOverflow;
      document.body.style.position = origBodyPosition;
      document.body.style.top = origBodyTop;
      document.body.style.width = origBodyWidth;
      window.scrollTo(0, scrollY);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  function chooseTheme(next: ThemePreference) {
    setThemePref(next);
    window.localStorage.setItem(THEME_STORAGE_KEY, next);
    applyTheme(next);
  }

  if (!mounted || !open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex lg:hidden overflow-hidden touch-none">
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity animate-fade-in touch-none"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative z-10 flex h-[100dvh] max-h-[100dvh] w-72 sm:w-80 max-w-[85vw] flex-col bg-white dark:bg-[#0e0d0f] border-r border-gray-100 dark:border-gray-800 shadow-2xl animate-slide-in-left overflow-hidden overscroll-contain">
        {/* Drawer Header: Logo + Theme Toggle */}
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 px-5 py-3 shrink-0 touch-none">
          <Link
            href="/"
            onClick={onClose}
            className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-200"
          >
            {siteName ?? "Naclac"}
          </Link>
          <div className="flex items-center border border-gray-200 dark:border-white/10 rounded-full p-0.5 bg-gray-50 dark:bg-white/[0.04]">
            {THEME_OPTIONS.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => chooseTheme(opt)}
                aria-label={`Switch to ${opt} theme`}
                className={
                  "size-6 flex items-center justify-center rounded-full transition-colors " +
                  (themePref === opt
                    ? "bg-white dark:bg-white/15 text-gray-900 dark:text-white shadow-xs"
                    : "text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300")
                }
              >
                <span className="scale-75 flex items-center justify-center">
                  {THEME_ICONS[opt]}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Dropdown Selector */}
        {tabs && tabs.length > 1 && (
          <div className="relative px-5 pt-3 pb-1 shrink-0">
            <button
              type="button"
              onClick={() => setTabDropdownOpen((v) => !v)}
              className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-sm font-semibold border border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/[0.02] text-gray-900 dark:text-gray-100 hover:bg-gray-100/50 dark:hover:bg-white/[0.05] transition-colors"
            >
              <span>{tab.tab}</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={
                  "size-4 text-gray-400 transition-transform " +
                  (tabDropdownOpen ? "rotate-180" : "")
                }
              >
                <path d="M4 6l4 4 4-4" />
              </svg>
            </button>

            {tabDropdownOpen && (
              <div className="absolute left-5 right-5 top-13 z-20 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#18181b] p-1.5 shadow-xl">
                {tabs.map((t) => {
                  const firstPage = t.groups[0]?.pages[0];
                  const active = t.tab === (currentTab ?? tab.tab);
                  return (
                    <Link
                      key={t.tab}
                      href={firstPage ? `/${firstPage.slug.join("/")}` : "/"}
                      onClick={() => {
                        setTabDropdownOpen(false);
                        onClose();
                      }}
                      className={
                        "flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors " +
                        (active
                          ? "bg-gray-100 dark:bg-white/10 text-primary dark:text-primary-light"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5")
                      }
                    >
                      <span>{t.tab}</span>
                      {active && (
                        <span className="size-1.5 rounded-full bg-primary dark:bg-primary-light" />
                      )}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Sidebar Nav Items */}
        <div className="scrollbar-common flex-1 overflow-y-auto px-5 py-4 min-h-0 overscroll-contain touch-pan-y">
          <div className="text-sm">
            {tab.groups.map((group) => (
              <div key={group.group} className="mb-6 last:mb-0">
                <div className="sidebar-group-header flex items-center gap-2.5 pl-4 mb-2.5 font-semibold text-gray-900 dark:text-gray-200 text-xs capitalize">
                  <h3 className="sidebar-title text-[length:inherit] font-[inherit]">
                    {group.group}
                  </h3>
                </div>
                <ul className="sidebar-group space-y-px">
                  {group.pages.map((page) => {
                    const active = page.slug.join("/") === currentSlugKey;
                    return (
                      <li key={page.id} className="relative">
                        <Link
                          href={`/${page.slug.join("/")}`}
                          onClick={onClose}
                          className={
                            "group flex items-start pr-3 py-1.5 pl-4 gap-x-3 text-left break-words hyphens-auto w-full rounded-md transition-colors " +
                            (active
                              ? "text-primary dark:text-primary-light [text-shadow:-0.2px_0_0_currentColor,0.2px_0_0_currentColor]"
                              : "text-gray-700 dark:text-gray-400 hover:text-primary hover:dark:text-primary-light")
                          }
                        >
                          <span className="min-w-0 max-w-full break-words hyphens-auto">
                            {page.title}
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
