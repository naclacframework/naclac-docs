import fs from "node:fs";
import { cache, type ComponentProps, type ReactElement } from "react";
import { evaluate } from "next-mdx-remote-client/rsc";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import {
  Accordion,
  AccordionGroup,
  Card,
  Columns,
  H2,
  H3,
  Note,
  Pre,
  StepItem,
  Steps,
  Tabs,
  TabItem,
  Tip,
  Warning,
} from "@/mdx/mdx-components";
import { slugToFile } from "./nav";

// Card's own <a> wrapper has no `not-prose`, so the outer article's `prose`
// class (needed for plain markdown text) leaks its default anchor
// underline onto card titles/descriptions. `not-prose` on an ancestor
// fully excludes Typography's selectors from matching descendants, which
// is the plugin's own intended escape hatch for exactly this case.
function CardGroup(props: ComponentProps<typeof Columns>) {
  return (
    <div className="not-prose">
      <Columns {...props} />
    </div>
  );
}

function Table(props: ComponentProps<"table">) {
  return (
    <div className="table-scroll-container my-6 w-full max-w-full overflow-x-auto [overscroll-behavior-x:contain] [overscroll-behavior-y:auto] touch-pan-x touch-pan-y">
      <table {...props} className="w-full min-w-full text-left border-collapse" />
    </div>
  );
}

// Built here (a server file), not inside the "use client" module — a plain
// object grouping multiple client-component references, when exported
// directly from a "use client" file and read from server code, collapses
// to a single opaque client reference (every property lookup returns
// undefined). Individual named imports don't have that problem.
const mdxComponents: NonNullable<Parameters<typeof evaluate>[0]["components"]> = {
  Accordion,
  AccordionGroup,
  Card,
  CardGroup,
  Steps,
  Step: StepItem,
  Tabs,
  Tab: TabItem,
  Note,
  Tip,
  Warning,
  pre: Pre,
  h2: H2,
  h3: H3,
  table: Table,
};

export type PageFrontmatter = {
  title?: string;
  sidebarTitle?: string;
  description?: string;
};

export type LoadedPage = {
  content: ReactElement;
  frontmatter: PageFrontmatter;
};

/**
 * Reads and compiles one .mdx page. Cached per request so generateMetadata
 * and the page component (both calling this for the same slug) only pay
 * for one actual MDX compile.
 */
export const loadPage = cache(
  async (slug: string[] | undefined): Promise<LoadedPage | null> => {
    const filePath = slugToFile(slug);
    let source: string;
    try {
      source = fs.readFileSync(filePath, "utf-8");
    } catch {
      return null;
    }

    const { content, frontmatter } = await evaluate({
      source,
      components: mdxComponents,
      options: {
        parseFrontmatter: true,
        mdxOptions: {
          remarkPlugins: [remarkGfm],
          rehypePlugins: [rehypeSlug],
        },
      },
    });

    return { content, frontmatter: frontmatter as PageFrontmatter };
  }
);
