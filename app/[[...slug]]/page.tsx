import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { allSlugs, findAdjacentPages, findGroupFirstPage, findPageMeta } from "@/content/nav";
import { loadPage } from "@/content/mdx-loader";

export function generateStaticParams() {
  return allSlugs();
}

export async function generateMetadata({
  params,
}: PageProps<"/[[...slug]]">): Promise<Metadata> {
  const { slug } = await params;
  const page = await loadPage(slug);
  if (!page) return {};
  return {
    title: page.frontmatter.title,
    description: page.frontmatter.description,
  };
}

export default async function DocPage({
  params,
}: PageProps<"/[[...slug]]">) {
  const { slug } = await params;
  const page = await loadPage(slug);
  if (!page) notFound();

  const meta = findPageMeta(slug);
  const groupHome = meta ? findGroupFirstPage(meta.tab, meta.group) : undefined;
  const { prev, next } = findAdjacentPages(slug);

  return (
    <article className="prose dark:prose-invert max-w-none">
      {meta && (
        <p className="mb-1 text-sm font-semibold">
          {groupHome ? (
            <Link
              href={`/${groupHome.slug.join("/")}`}
              className="not-prose text-primary no-underline transition-opacity hover:opacity-80 dark:text-primary-light"
            >
              {meta.group}
            </Link>
          ) : (
            <span className="text-primary dark:text-primary-light">{meta.group}</span>
          )}
        </p>
      )}
      {page.frontmatter.title && <h1>{page.frontmatter.title}</h1>}
      {page.content}

      {(prev || next) && (
        <nav
          aria-label="Page navigation"
          className="not-prose mt-12 flex items-center justify-between gap-4 border-t border-gray-100 pt-6 dark:border-gray-800"
        >
          {prev ? (
            <Link
              href={`/${prev.slug.join("/")}`}
              className="flex flex-col items-start gap-0.5 rounded-lg px-3 py-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <span className="text-xs text-gray-500 dark:text-gray-400">Previous</span>
              <span className="flex items-center gap-1.5 text-sm font-medium text-gray-900 dark:text-gray-100">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {prev.title}
              </span>
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link
              href={`/${next.slug.join("/")}`}
              className="flex flex-col items-end gap-0.5 rounded-lg px-3 py-2 text-right transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <span className="text-xs text-gray-500 dark:text-gray-400">Next</span>
              <span className="flex items-center gap-1.5 text-sm font-medium text-gray-900 dark:text-gray-100">
                {next.title}
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </Link>
          )}
        </nav>
      )}
    </article>
  );
}
