import Link from "next/link";
import type { NavTab } from "@/content/nav";

export function Sidebar({
  tab,
  currentSlugKey,
}: {
  tab: NavTab;
  currentSlugKey: string;
}) {
  return (
    <nav
      aria-label="Sidebar"
      className="scrollbar-common sticky top-20 hidden max-h-[calc(100vh-6rem)] w-56 shrink-0 self-start overflow-y-auto lg:block text-sm"
    >
      <div className="flex flex-col mt-6 lg:mt-8 gap-6 lg:gap-8 first:mt-0">
        {tab.groups.map((group) => (
          <div key={group.group}>
            <div className="sidebar-group-header flex items-center gap-2.5 pl-4 mb-3.5 lg:mb-2.5 font-semibold text-gray-900 dark:text-gray-200 text-xs capitalize">
              <h3 className="sidebar-title">{group.group}</h3>
            </div>
            <ul className="sidebar-group space-y-px flex flex-col">
              {group.pages.map((page) => {
                const active = page.slug.join("/") === currentSlugKey;
                return (
                  <li key={page.id}>
                    <Link
                      href={`/${page.slug.join("/")}`}
                      className={
                        "group flex items-start pr-3 py-1.5 pl-4 gap-x-3 text-left break-words hyphens-auto w-full transition-colors " +
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
    </nav>
  );
}
