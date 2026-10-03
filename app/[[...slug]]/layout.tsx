import { findTabForSlug, getFlatPages, getGithubStars, getSiteConfig, getTabs } from "@/content/nav";
import { TopNav } from "@/components/top-nav";
import { Sidebar } from "@/components/sidebar";
import { Toc } from "@/components/toc";
import { PageTransition } from "@/components/page-transition";
import { PageScrollbar } from "@/components/page-scrollbar";

export default async function DocsLayout({
  children,
  params,
}: LayoutProps<"/[[...slug]]">) {
  const { slug } = await params;
  const tabs = getTabs();
  const currentTab = findTabForSlug(slug) ?? tabs[0];
  const currentSlugKey = slug?.join("/") ?? "";
  const pages = getFlatPages();
  const site = getSiteConfig();
  const stars = await getGithubStars(site.githubUrl);

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-clip w-full max-w-full">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[480px] bg-[radial-gradient(ellipse_60%_50%_at_50%_-20%,rgb(239_112_37_/_0.08),transparent)] dark:bg-[radial-gradient(ellipse_60%_50%_at_50%_-20%,rgb(239_112_37_/_0.12),transparent)]"
      />
      <TopNav
        tabs={tabs}
        currentTab={currentTab.tab}
        currentSlugKey={currentSlugKey}
        pages={pages}
        site={site}
        stars={stars}
      />
      <div className="mx-auto flex w-full max-w-[88rem] flex-1 gap-8 px-4 sm:px-6 py-8 min-w-0">
        <Sidebar tab={currentTab} currentSlugKey={currentSlugKey} />
        <main className="min-w-0 max-w-full flex-1 overflow-x-clip">
          <PageTransition>{children}</PageTransition>
        </main>
        <Toc />
      </div>
      <PageScrollbar />
    </div>
  );
}

