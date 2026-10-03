// File: website/docs/components/top-nav.tsx
// Purpose: Primary navigation header providing desktop tabs, search, GitHub links,
// theme toggles, and 2-row mobile navigation with dedicated drawer and menu controls.

"use client";

import { useState } from "react";
import Link from "next/link";
import type { FlatPage, NavTab, SiteConfig } from "@/content/nav";
import { ThemeToggle } from "./theme-toggle";
import { Search } from "./search";
import { MobileNavbarMenu, MobileSidebarDrawer } from "./mobile-nav";

function formatStars(count: number): string {
  if (count >= 1000) return `${(count / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  return String(count);
}

export function TopNav({
  tabs,
  currentTab,
  currentSlugKey,
  pages,
  site,
  stars,
}: {
  tabs: NavTab[];
  currentTab: string;
  currentSlugKey: string;
  pages: FlatPage[];
  site: SiteConfig;
  stars: number | null;
}) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [navbarMenuOpen, setNavbarMenuOpen] = useState(false);
  const [sidebarDrawerOpen, setSidebarDrawerOpen] = useState(false);

  const activeTab = tabs.find((t) => t.tab === currentTab) ?? tabs[0];
  const currentPage = activeTab.groups
    .flatMap((g) => g.pages)
    .find((p) => p.slug.join("/") === currentSlugKey);
  const currentGroup = activeTab.groups.find((g) =>
    g.pages.some((p) => p.slug.join("/") === currentSlugKey)
  );
  const currentGroupTitle = currentGroup?.group ?? activeTab.tab;
  const currentPageTitle = currentPage?.title ?? "Overview";

  return (
    <>
      <header
        id="navbar"
        className="sticky top-0 z-30 w-full border-b border-gray-100 bg-white dark:border-gray-800 dark:bg-[#0e0d0f]"
      >
        <div className="relative px-0 lg:px-5">
          <div className="relative">
            {/* Desktop Layout */}
            <div className="hidden lg:flex items-center h-12 px-4 pb-px min-w-0">
              <div className="flex-1 flex items-center gap-x-4 h-full pr-2 min-w-0">
                <Link
                  href="/"
                  className="select-none inline-block text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight dark:text-gray-200 h-6"
                >
                  <span className="sr-only">{site.name} home page</span>
                  {site.name}
                </Link>
              </div>

              {tabs.length > 1 && (
                <nav
                  aria-label="Main"
                  className="hidden lg:flex text-sm items-center justify-center px-2 min-w-0"
                >
                  <ul className="flex items-center gap-1">
                    {tabs.map((tab) => {
                      const firstPage = tab.groups[0]?.pages[0];
                      const active = tab.tab === currentTab;
                      return (
                        <li key={tab.tab}>
                          <Link
                            href={firstPage ? `/${firstPage.slug.join("/")}` : "/"}
                            className={
                              "flex items-center gap-1.5 whitespace-nowrap h-9 text-sm font-medium tracking-tight rounded-full px-4 transition-colors " +
                              (active
                                ? "text-gray-950 dark:text-gray-100 bg-gray-950/[0.03] dark:bg-white/[0.06]"
                                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-950/[0.03] dark:hover:bg-white/[0.03]")
                            }
                          >
                            {tab.tab}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </nav>
              )}

              <div className="flex-1 flex items-center gap-2 justify-end">
                <Search
                  pages={pages}
                  open={searchOpen}
                  onOpenChange={setSearchOpen}
                />
                {site.githubUrl && (
                  <a
                    href={site.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    title={site.githubUrl.replace(/^https?:\/\/(www\.)?github\.com\//, "")}
                    className="group flex items-center rounded-md hover:text-primary dark:hover:text-primary-light min-w-0 transition-colors"
                  >
                    <div className="flex items-center gap-1.5 h-8 min-w-0">
                      <div className="flex items-center gap-2 min-w-0">
                        <svg
                          viewBox="0 0 24 24"
                          width="16"
                          height="16"
                          fill="currentColor"
                          className="size-4 shrink-0 text-gray-700 dark:text-gray-300 group-hover:text-primary dark:group-hover:text-primary-light transition-colors"
                        >
                          <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.1 3.3 9.4 7.9 10.9.6.1.8-.25.8-.57v-2c-3.2.7-3.9-1.4-3.9-1.4-.5-1.3-1.3-1.7-1.3-1.7-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.7 1.3 3.4 1 .1-.8.4-1.3.8-1.6-2.6-.3-5.3-1.3-5.3-5.7 0-1.3.4-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.3 1.2.9-.3 2-.4 3-.4s2.1.1 3 .4c2.3-1.5 3.3-1.2 3.3-1.2.6 1.6.2 2.8.1 3.1.8.8 1.2 1.8 1.2 3.1 0 4.4-2.7 5.4-5.3 5.7.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6 4.6-1.5 7.9-5.8 7.9-10.9C23.5 5.65 18.35.5 12 .5z" />
                        </svg>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-primary dark:group-hover:text-primary-light truncate transition-colors">
                          {site.githubUrl.replace(/^https?:\/\/(www\.)?github\.com\//, "").replace(/\/$/, "")}
                        </span>
                      </div>
                      {stars !== null && (
                        <div className="flex items-center gap-1.5 ml-1 shrink-0 text-gray-600 dark:text-gray-400 group-hover:text-primary dark:group-hover:text-primary-light transition-colors">
                          <svg
                            className="forced-colors:forced-color-adjust-none size-3.5"
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
                          <span className="text-sm">{formatStars(stars)}</span>
                        </div>
                      )}
                    </div>
                  </a>
                )}
                <ThemeToggle />
              </div>
            </div>

            {/* Mobile Row 1 */}
            <div className="flex lg:hidden items-center h-12 px-4 pb-px min-w-0">
              <div className="h-full relative flex-1 flex items-center gap-x-4 min-w-0">
                <Link
                  href="/"
                  className="select-none inline-block text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight dark:text-gray-200 h-6"
                >
                  <span className="sr-only">{site.name} home page</span>
                  {site.name}
                </Link>
                <div className="flex items-center gap-3 ml-auto">
                  <button
                    type="button"
                    onClick={() => setSearchOpen(true)}
                    id="search-bar-entry-mobile"
                    aria-label="Open search"
                    className="text-gray-500 w-8 h-8 flex items-center justify-center hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
                  >
                    <span className="sr-only">Search or ask...</span>
                    <svg
                      className="forced-colors:forced-color-adjust-none h-4 w-4 bg-gray-500 dark:bg-gray-400 hover:bg-gray-600 dark:hover:bg-gray-300 transition-colors"
                      aria-hidden="true"
                      style={{
                        maskImage: 'url("https://d3gk2c5xim1je2.cloudfront.net/fontawesome/v7.2.0/solid/magnifying-glass.svg")',
                        WebkitMaskImage: 'url("https://d3gk2c5xim1je2.cloudfront.net/fontawesome/v7.2.0/solid/magnifying-glass.svg")',
                        maskRepeat: 'no-repeat',
                        WebkitMaskRepeat: 'no-repeat',
                        maskPosition: 'center',
                        WebkitMaskPosition: 'center',
                      }}
                    />
                  </button>
                  <button
                    type="button"
                    id="mobile-navbar-toggle"
                    onClick={() => setNavbarMenuOpen((v) => !v)}
                    aria-label="More actions"
                    className="h-7 w-5 flex items-center justify-center relative after:content-[''] after:absolute after:-inset-y-2 after:-left-1 after:-right-4"
                  >
                    <svg
                      className="forced-colors:forced-color-adjust-none size-4 shrink-0 bg-gray-500 dark:bg-gray-400 hover:bg-gray-600 dark:hover:bg-gray-300 transition-colors"
                      aria-hidden="true"
                      style={{
                        maskImage: 'url("https://d3gk2c5xim1je2.cloudfront.net/fontawesome/v7.2.0/solid/ellipsis-vertical.svg")',
                        WebkitMaskImage: 'url("https://d3gk2c5xim1je2.cloudfront.net/fontawesome/v7.2.0/solid/ellipsis-vertical.svg")',
                        maskRepeat: 'no-repeat',
                        WebkitMaskRepeat: 'no-repeat',
                        maskPosition: 'center',
                        WebkitMaskPosition: 'center',
                      }}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile Row 2: Breadcrumb / Sidebar Drawer Trigger */}
            <button
              type="button"
              onClick={() => setSidebarDrawerOpen(true)}
              id="mobile-sidebar-toggle"
              aria-label="Open navigation menu"
              className="flex items-center h-14 py-4 px-5 lg:hidden focus:outline-0 w-full text-left border-t border-gray-100 dark:border-gray-800"
            >
              <div className="text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300 transition-colors">
                <span className="sr-only">Navigation</span>
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
                  className="size-4 shrink-0"
                >
                  <path d="M2.25 9H15.75" />
                  <path d="M2.25 3.75H15.75" />
                  <path d="M2.25 14.25H15.75" />
                </svg>
              </div>
              <div className="ml-4 flex text-sm leading-6 whitespace-nowrap min-w-0 space-x-3 overflow-hidden">
                <div className="text-gray-900 truncate dark:text-gray-200 min-w-0 flex-1 font-medium">
                  {currentPageTitle}
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Header Dropdown Menu */}
        <MobileNavbarMenu
          open={navbarMenuOpen}
          onClose={() => setNavbarMenuOpen(false)}
          tabs={tabs}
          currentTab={currentTab}
          githubUrl={site.githubUrl}
          stars={stars}
        />
      </header>

      {/* Portaled Mobile Sidebar Drawer */}
      <MobileSidebarDrawer
        open={sidebarDrawerOpen}
        onClose={() => setSidebarDrawerOpen(false)}
        tabs={tabs}
        currentTab={currentTab}
        tab={activeTab}
        currentSlugKey={currentSlugKey}
        siteName={site.name}
      />
    </>
  );
}
