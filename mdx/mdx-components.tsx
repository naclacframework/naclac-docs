"use client";

import {
  Children,
  isValidElement,
  useState,
  type ComponentProps,
  type ReactElement,
  type ReactNode,
} from "react";
import {
  Accordion,
  Card,
  CodeBlock,
  Columns,
  Note,
  Steps as MintlifySteps,
  Tabs,
  Tip,
  Warning,
} from "@mintlify/components";
import { CodeBlockScroll } from "@/components/code-block-scroll";

export { Accordion, Card, Columns, Note, Tabs, Tip, Warning };


// Static sub-properties (Accordion.Group, Steps.Item, Tabs.Item) must be
// pulled out and re-exported individually here, in the same module scope
// where they still resolve correctly — reading them off an import crossing
// the client boundary elsewhere returns undefined.
export const AccordionGroup = Accordion.Group;
export const StepItem = MintlifySteps.Item;
export const TabItem = Tabs.Item;

/**
 * @mintlify/components' Steps maps its children as `({ props }) => ...`
 * without filtering non-element children first (unlike Tabs, which does)
 * — MDX compilation inserts whitespace-only text nodes between sibling
 * <Step> tags, which crashes that destructure. Filtering to real elements
 * here works around the upstream gap.
 */
export function Steps({ children, ...props }: ComponentProps<typeof MintlifySteps>) {
  const filtered = Children.toArray(children).filter(isValidElement);
  return <MintlifySteps {...props}>{filtered as ComponentProps<typeof MintlifySteps>["children"]}</MintlifySteps>;
}

/** Hover-reveal copy-link icon next to section headings — ids come from
 * rehype-slug, already wired into the MDX pipeline. */
function makeHeading(Tag: "h2" | "h3") {
  return function Heading({
    id,
    children,
    ...props
  }: ComponentProps<"h2">) {
    const [copied, setCopied] = useState(false);

    async function copyLink() {
      if (!id) return;
      const url = `${window.location.origin}${window.location.pathname}#${id}`;
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        window.location.hash = id;
        setTimeout(() => setCopied(false), 1500);
      } catch {
        window.location.hash = id;
      }
    }

    return (
      <Tag id={id} className="group scroll-mt-24" {...props}>
        {children}
        {id && (
          <button
            type="button"
            onClick={copyLink}
            aria-label="Copy link to section"
            className="ml-2 align-middle text-gray-400 opacity-0 transition-opacity group-hover:opacity-100 hover:text-primary dark:text-gray-600 dark:hover:text-primary-light"
          >
            {copied ? "✓" : "#"}
          </button>
        )}
      </Tag>
    );
  };
}

export const H2 = makeHeading("h2");
export const H3 = makeHeading("h3");

type CodeElementProps = {
  className?: string;
  children?: ReactNode;
};

/**
 * Plain fenced code blocks compile to <pre><code className="language-xxx">,
 * not a <CodeBlock> tag. Bridges that to @mintlify/components' CodeBlock,
 * which does its own syntax highlighting internally (raw code + a language
 * string in) — mirroring what CodeGroup's own source does for the same
 * reason.
 */
export function Pre({ children }: { children?: ReactNode }) {
  const codeElement = isValidElement<CodeElementProps>(children)
    ? (children as ReactElement<CodeElementProps>)
    : null;

  if (!codeElement) {
    return <pre>{children}</pre>;
  }

  const match = /language-(\w+)/.exec(codeElement.props.className ?? "");
  const language = match?.[1];
  const rawCode = String(codeElement.props.children ?? "").replace(/\n$/, "");

  return (
    <CodeBlockScroll>
      <CodeBlock language={language}>{rawCode}</CodeBlock>
    </CodeBlockScroll>
  );
}

