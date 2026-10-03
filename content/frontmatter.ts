import fs from "node:fs";

export type Frontmatter = {
  title?: string;
  sidebarTitle?: string;
  description?: string;
};

/**
 * Minimal YAML-frontmatter reader for the flat `key: "value"` shape this
 * content actually uses (title/sidebarTitle/description) — not a general
 * YAML parser. Used only to build nav labels; page rendering itself parses
 * frontmatter properly via next-mdx-remote-client's `parseFrontmatter`.
 */
export function readFrontmatter(filePath: string): Frontmatter {
  let raw: string;
  try {
    raw = fs.readFileSync(filePath, "utf-8");
  } catch {
    return {};
  }

  const match = /^---\r?\n([\s\S]*?)\r?\n---/.exec(raw);
  if (!match) return {};

  const result: Frontmatter = {};
  for (const line of match[1].split(/\r?\n/)) {
    const kv = /^(\w+):\s*(.*)$/.exec(line);
    if (!kv) continue;
    const key = kv[1];
    const value = kv[2].trim().replace(/^["']|["']$/g, "");
    if (key === "title" || key === "sidebarTitle" || key === "description") {
      result[key] = value;
    }
  }
  return result;
}
