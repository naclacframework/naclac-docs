import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);

function findTurbopackRoot(): string {
  try {
    const nextPkg = require.resolve("next/package.json");
    let dir = __dirname;
    while (dir !== path.dirname(dir)) {
      if (nextPkg.toLowerCase().startsWith(dir.toLowerCase())) {
        return dir;
      }
      dir = path.dirname(dir);
    }
  } catch {}
  return __dirname;
}

const turbopackRoot = findTurbopackRoot();

const nextConfig: NextConfig = {
  output: process.env.DOCS_EXPORT === "true" ? "export" : undefined,
  images: {
    unoptimized: true,
  },
  turbopack: {
    root: turbopackRoot,
  },
  outputFileTracingRoot: turbopackRoot,
};

export default nextConfig;
