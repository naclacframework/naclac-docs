import fs from "node:fs";
import path from "node:path";
import { CONTENT_DIR } from "./config";
import { readFrontmatter } from "./frontmatter";

type DocsJsonPage = string;

type DocsJsonGroup = {
  group: string;
  pages: DocsJsonPage[];
};

type DocsJsonTab = {
  tab: string;
  groups: DocsJsonGroup[];
};

type DocsJson = {
  name: string;
  navbar?: {
    primary?: { type: string; href: string };
  };
  navigation: {
    tabs: DocsJsonTab[];
  };
};

export type SiteConfig = {
  name: string;
  githubUrl?: string;
};

export type NavPage = {
  /** content-relative id, no extension, e.g. "concepts/execution-modes" */
  id: string;
  slug: string[];
  title: string;
};

export type NavGroup = {
  group: string;
  pages: NavPage[];
};

export type NavTab = {
  tab: string;
  groups: NavGroup[];
};

export type FlatPage = NavPage & {
  tab: string;
  group: string;
  description?: string;
};

function idToSlug(id: string): string[] {
  return id.split("/");
}

function slugKey(slug: string[]): string {
  return slug.join("/");
}

function readDocsJson(): DocsJson {
  const docsPath = path.join(CONTENT_DIR, "docs.json");
  const mintPath = path.join(CONTENT_DIR, "mint.json");
  const resolved = fs.existsSync(docsPath) ? docsPath : mintPath;
  const raw = fs.readFileSync(resolved, "utf-8");
  return JSON.parse(raw) as DocsJson;
}

let cached: {
  tabs: NavTab[];
  flatPages: FlatPage[];
  byId: Map<string, FlatPage>;
  site: SiteConfig;
} | null = null;

function build() {
  if (process.env.NODE_ENV === "production" && cached) return cached;

  const docsJson = readDocsJson();
  const site: SiteConfig = {
    name: docsJson.name,
    githubUrl:
      docsJson.navbar?.primary?.type === "github"
        ? docsJson.navbar.primary.href
        : undefined,
  };
  const flatPages: FlatPage[] = [];

  const tabs: NavTab[] = docsJson.navigation.tabs.map((tab) => ({
    tab: tab.tab,
    groups: tab.groups.map((group) => ({
      group: group.group,
      pages: group.pages.map((id) => {
        const frontmatter = readFrontmatter(path.join(CONTENT_DIR, `${id}.mdx`));
        const page: NavPage = {
          id,
          slug: idToSlug(id),
          title: frontmatter.sidebarTitle ?? frontmatter.title ?? titleFromId(id),
        };
        flatPages.push({ ...page, tab: tab.tab, group: group.group, description: frontmatter.description });
        return page;
      }),
    })),
  }));

  const byId = new Map(flatPages.map((p) => [p.id, p]));

  cached = { tabs, flatPages, byId, site };
  return cached;
}

export function getSiteConfig(): SiteConfig {
  return build().site;
}

/** Live GitHub star count for the repo linked in docs.json's navbar —
 * confirmed present on the real site (design-audit.md "Top nav"), never
 * implemented until now. Public, unauthenticated endpoint; cached for an
 * hour so normal traffic doesn't re-fetch per request. Returns null on any
 * failure (rate limit, network, private/missing repo) rather than
 * throwing — a star count is decoration, not something that should be able
 * to break the page. */
export async function getGithubStars(url: string | undefined): Promise<number | null> {
  if (!url) return null;
  const match = /github\.com\/([^/]+)\/([^/]+)/.exec(url);
  if (!match) return null;

  try {
    const res = await fetch(`https://api.github.com/repos/${match[1]}/${match[2]}`, {
      headers: { Accept: "application/vnd.github+json" },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { stargazers_count?: unknown };
    return typeof data.stargazers_count === "number" ? data.stargazers_count : null;
  } catch {
    return null;
  }
}

function titleFromId(id: string): string {
  const last = id.split("/").at(-1) ?? id;
  return last
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function getTabs(): NavTab[] {
  return build().tabs;
}

/** First page of the group a given page belongs to — used to make the
 * breadcrumb label above each page's H1 a real link, not just text. */
export function findGroupFirstPage(tabName: string, groupName: string): NavPage | undefined {
  const tab = getTabs().find((t) => t.tab === tabName);
  const group = tab?.groups.find((g) => g.group === groupName);
  return group?.pages[0];
}

/** Prev/next page for footer pagination, scoped to the current tab only —
 * switching tabs swaps the entire sidebar tree, so paginating across tabs
 * would silently jump into an unrelated nav tree. */
export function findAdjacentPages(slug: string[] | undefined): { prev?: FlatPage; next?: FlatPage } {
  if (!slug || slug.length === 0) return {};
  const { flatPages } = build();
  const key = slugKey(slug);
  const idx = flatPages.findIndex((p) => slugKey(p.slug) === key);
  if (idx === -1) return {};
  const current = flatPages[idx];
  const prev = flatPages[idx - 1];
  const next = flatPages[idx + 1];
  return {
    prev: prev && prev.tab === current.tab ? prev : undefined,
    next: next && next.tab === current.tab ? next : undefined,
  };
}

export function getFlatPages(): FlatPage[] {
  return build().flatPages;
}

/** The tab that owns the given slug — drives "switching tabs swaps the
 * entire sidebar tree" behavior confirmed in design-audit.md. */
export function findTabForSlug(slug: string[] | undefined): NavTab | undefined {
  if (!slug || slug.length === 0) {
    return getTabs()[0];
  }
  const key = slugKey(slug);
  const { byId, tabs } = build();
  const page = byId.get(key);
  if (!page) return tabs[0];
  return tabs.find((t) => t.tab === page.tab);
}

export function findPageMeta(slug: string[] | undefined): FlatPage | undefined {
  if (!slug || slug.length === 0) return undefined;
  return build().byId.get(slugKey(slug));
}

/** Route slug array -> absolute .mdx file path. Root ("/") special-cases to
 * index.mdx, which exists in content but isn't listed in docs.json's nav. */
export function slugToFile(slug: string[] | undefined): string {
  const id = !slug || slug.length === 0 ? "index" : slug.join("/");
  return path.join(CONTENT_DIR, `${id}.mdx`);
}

/** Feeds generateStaticParams — every page docs.json knows about, plus the
 * root. Content is fully known at build time so everything is prerendered.
 * Root uses an empty array (the documented convention for prerendering the
 * base route of an optional catch-all segment), not `undefined`. */
export function allSlugs(): { slug: string[] }[] {
  const pages = getFlatPages().map((p) => ({ slug: p.slug }));
  return [{ slug: [] }, ...pages];
}
