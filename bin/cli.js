#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { fileURLToPath } from "node:url";
import { spawn, execSync } from "node:child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PACKAGE_ROOT = path.resolve(__dirname, "..");

const pkg = JSON.parse(
  fs.readFileSync(path.join(PACKAGE_ROOT, "package.json"), "utf-8")
);

function printHelp() {
  console.log(`
\x1b[1m\x1b[38;2;239;112;37mnaclac-docs\x1b[0m v${pkg.version}
Mintlify-compatible documentation engine & CLI

\x1b[1mUSAGE\x1b[0m
  $ naclac-docs <command> [directory] [options]

\x1b[1mCOMMANDS\x1b[0m
  \x1b[32mdev\x1b[0m   [dir]   Start the local documentation development server (default)
  \x1b[32mbuild\x1b[0m [dir]   Build static HTML export for production hosting
  \x1b[32minit\x1b[0m  [dir]   Initialize a new docs project with starter templates

\x1b[1mOPTIONS\x1b[0m
  -p, --port <port>   Port to listen on (default: 3000)
  -H, --host <host>   Host to bind server to (default: localhost)
  --no-open           Do not automatically open browser on dev start
  --out <dir>         Output directory for static build (default: ./out)
  -v, --version       Display version
  -h, --help          Display this help message

\x1b[1mEXAMPLES\x1b[0m
  $ naclac-docs dev
  $ naclac-docs dev ./docs --port 3001
  $ naclac-docs build ./docs --out ./public/docs
  $ naclac-docs init my-new-docs
`);
}

function parseCliArgs(argv) {
  const args = {
    command: "dev",
    targetDir: ".",
    port: 3000,
    host: "localhost",
    open: true,
    out: "./out",
  };

  const positional = [];
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "-h" || arg === "--help") {
      printHelp();
      process.exit(0);
    }
    if (arg === "-v" || arg === "--version") {
      console.log(`naclac-docs v${pkg.version}`);
      process.exit(0);
    }
    if (arg === "-p" || arg === "--port") {
      args.port = parseInt(argv[++i], 10) || 3000;
    } else if (arg === "-H" || arg === "--host") {
      args.host = argv[++i] || "localhost";
    } else if (arg === "--no-open") {
      args.open = false;
    } else if (arg === "--out") {
      args.out = argv[++i] || "./out";
    } else if (!arg.startsWith("-")) {
      positional.push(arg);
    }
  }

  if (positional.length > 0) {
    const first = positional[0].toLowerCase();
    if (["dev", "build", "init"].includes(first)) {
      args.command = first;
      if (positional.length > 1) {
        args.targetDir = positional[1];
      }
    } else {
      args.targetDir = positional[0];
    }
  }

  return args;
}

function openBrowser(url) {
  const platform = process.platform;
  if (platform === "darwin") {
    spawn("open", [url], { detached: true, stdio: "ignore" }).unref();
  } else if (platform === "win32") {
    spawn("cmd", ["/c", "start", "", url], { detached: true, stdio: "ignore" }).unref();
  } else {
    spawn("xdg-open", [url], { detached: true, stdio: "ignore" }).unref();
  }
}

function copyDirectory(src, dest, ignore = new Set()) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    if (ignore.has(entry.name)) continue;
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirectory(srcPath, destPath, ignore);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function getEngineCacheDir() {
  return path.join(os.homedir(), ".naclac-docs", `v${pkg.version}`);
}

function installDependencies(cacheDir) {
  const managers = [
    { name: "pnpm", cmd: "pnpm install --prod --node-linker=hoisted" },
    { name: "yarn", cmd: "yarn install --production --ignore-engines" },
    { name: "npm", cmd: "npm install --omit=dev --no-audit --no-fund" },
  ];

  const errors = [];

  for (const { name, cmd } of managers) {
    try {
      console.log(`\x1b[1m\x1b[38;2;239;112;37m[naclac-docs]\x1b[0m Installing engine dependencies with \x1b[36m${name}\x1b[0m...`);
      execSync(cmd, {
        cwd: cacheDir,
        stdio: "inherit",
        shell: true,
      });
      console.log(`\x1b[32m? Documentation engine successfully prepared using ${name}!\x1b[0m\n`);
      return;
    } catch (err) {
      console.warn(`\x1b[33m[naclac-docs] ${name} install failed or is not available. Trying fallback...\x1b[0m`);
      errors.push({ name, error: err.message || String(err) });
    }
  }

  console.error(`
\x1b[1m\x1b[31m??????????????????????????????????????????????????????????????????????\x1b[0m
\x1b[1m\x1b[31m[naclac-docs] Fatal Error: Engine Installation Failed\x1b[0m
\x1b[1m\x1b[31m??????????????????????????????????????????????????????????????????????\x1b[0m

Could not install the documentation engine in:
  \x1b[36m${cacheDir}\x1b[0m

All attempted package managers failed:
${errors.map((e) => `  • \x1b[1m${e.name}\x1b[0m: ${e.error}`).join("\n")}

\x1b[1mHow to resolve:\x1b[0m
1. Verify you have an active internet connection.
2. Ensure at least one package manager is installed:
   • pnpm (recommended): \x1b[36mnpm install -g pnpm\x1b[0m
   • npm: bundled with Node.js
3. You can also manually navigate to the engine directory and run:
   \x1b[36mcd ${cacheDir}\x1b[0m
   \x1b[36mpnpm install --node-linker=hoisted\x1b[0m
\x1b[1m\x1b[31m??????????????????????????????????????????????????????????????????????\x1b[0m
`);
  process.exit(1);
}

function ensureEngineInstalled() {
  const cacheDir = getEngineCacheDir();
  const nextBin = path.join(cacheDir, "node_modules", "next", "dist", "bin", "next");

  if (fs.existsSync(nextBin)) {
    return cacheDir;
  }

  console.log(`\x1b[1m\x1b[38;2;239;112;37m[naclac-docs]\x1b[0m Initializing documentation engine in ~/.naclac-docs/v${pkg.version} (one-time setup)...`);

  fs.mkdirSync(cacheDir, { recursive: true });

  const ignoreList = new Set([".git", ".next", "node_modules", "out"]);
  const itemsToCopy = [
    "app",
    "components",
    "content",
    "mdx",
    "public",
    "package.json",
    "next.config.mjs",
    "postcss.config.mjs",
    "tsconfig.json",
    "next-env.d.ts",
  ];

  for (const item of itemsToCopy) {
    const src = path.join(PACKAGE_ROOT, item);
    const dest = path.join(cacheDir, item);
    if (fs.existsSync(src)) {
      if (fs.statSync(src).isDirectory()) {
        copyDirectory(src, dest, ignoreList);
      } else {
        fs.copyFileSync(src, dest);
      }
    }
  }

  installDependencies(cacheDir);

  return cacheDir;
}

function resolveContentDir(targetDir) {
  const resolved = path.resolve(process.cwd(), targetDir);
  const docsPath = path.join(resolved, "docs.json");
  const mintPath = path.join(resolved, "mint.json");

  if (!fs.existsSync(docsPath) && !fs.existsSync(mintPath)) {
    console.error(`
\x1b[31m[naclac-docs] Error:\x1b[0m Could not find "docs.json" or "mint.json" in:
  ${resolved}

To create a starter documentation template, run:
  \x1b[36mnaclac-docs init\x1b[0m
`);
    process.exit(1);
  }

  return resolved;
}

function runInit(targetDir) {
  const resolved = path.resolve(process.cwd(), targetDir);
  if (!fs.existsSync(resolved)) {
    fs.mkdirSync(resolved, { recursive: true });
  }

  const docsJsonPath = path.join(resolved, "docs.json");
  if (fs.existsSync(docsJsonPath)) {
    console.error(`\x1b[31mError:\x1b[0m "docs.json" already exists in ${resolved}`);
    process.exit(1);
  }

  const starterDocsJson = {
    name: "My Documentation",
    navigation: {
      tabs: [
        {
          tab: "Documentation",
          groups: [
            {
              group: "Get Started",
              pages: ["introduction", "quickstart"],
            },
          ],
        },
      ],
    },
  };

  const starterIntroMdx = `---
title: "Introduction"
description: "Welcome to your documentation portal."
---

## Overview

Welcome to your documentation! This site is powered by the Naclac Docs engine.

<CardGroup cols={2}>
  <Card title="Quick Start" icon="rocket" href="/quickstart">
    Follow the step-by-step guide to get up and running.
  </Card>
  <Card title="Architecture" icon="cubes" href="/introduction">
    Learn how the project is structured.
  </Card>
</CardGroup>
`;

  const starterQuickstartMdx = `---
title: "Quick Start"
description: "Get started in less than 5 minutes."
---

## Getting Started

Follow these simple steps:

<Steps>
  <Step title="Install CLI">
    Install your package globally:

    \`\`\`bash
    npm install -g my-project
    \`\`\`
  </Step>
  <Step title="Configure your workspace">
    Initialize your project:

    \`\`\`bash
    my-project init
    \`\`\`
  </Step>
</Steps>

<Tip>
  Edit your .mdx files to see live updates in the browser!
</Tip>
`;

  fs.writeFileSync(docsJsonPath, JSON.stringify(starterDocsJson, null, 2), "utf-8");
  fs.writeFileSync(path.join(resolved, "introduction.mdx"), starterIntroMdx, "utf-8");
  fs.writeFileSync(path.join(resolved, "quickstart.mdx"), starterQuickstartMdx, "utf-8");

  console.log(`
\x1b[32m? Created starter documentation in:\x1b[0m
  ${resolved}

\x1b[1mFiles created:\x1b[0m
  • docs.json
  • introduction.mdx
  • quickstart.mdx

\x1b[1mTo start preview:\x1b[0m
  $ naclac-docs dev ${targetDir !== "." ? targetDir : ""}
`);
}

function runDev(args) {
  const contentDir = resolveContentDir(args.targetDir);
  const engineDir = ensureEngineInstalled();
  const nextBin = path.join(engineDir, "node_modules", "next", "dist", "bin", "next");

  console.log(`\x1b[1m\x1b[38;2;239;112;37m[naclac-docs]\x1b[0m Loading documentation from: \x1b[36m${contentDir}\x1b[0m`);
  console.log(`\x1b[1m\x1b[38;2;239;112;37m[naclac-docs]\x1b[0m Starting dev server at: \x1b[32mhttp://${args.host}:${args.port}\x1b[0m\n`);

  const env = {
    ...process.env,
    CONTENT_DIR: contentDir,
    PORT: String(args.port),
  };

  const child = spawn(process.execPath, [nextBin, "dev", "-p", String(args.port), "-H", args.host], {
    cwd: engineDir,
    stdio: "inherit",
    env,
  });

  if (args.open) {
    setTimeout(() => {
      openBrowser(`http://${args.host}:${args.port}`);
    }, 2000);
  }

  child.on("close", (code) => {
    process.exit(code ?? 0);
  });
}

function runBuild(args) {
  const contentDir = resolveContentDir(args.targetDir);
  const engineDir = ensureEngineInstalled();
  const nextBin = path.join(engineDir, "node_modules", "next", "dist", "bin", "next");
  const outputDir = path.resolve(process.cwd(), args.out);

  console.log(`\x1b[1m\x1b[38;2;239;112;37m[naclac-docs]\x1b[0m Building static documentation from: \x1b[36m${contentDir}\x1b[0m`);

  const env = {
    ...process.env,
    CONTENT_DIR: contentDir,
    DOCS_EXPORT: "true",
  };

  const child = spawn(process.execPath, [nextBin, "build"], {
    cwd: engineDir,
    stdio: "inherit",
    env,
  });

  child.on("close", (code) => {
    if (code !== 0) {
      console.error(`\x1b[31m[naclac-docs] Build failed with code ${code}\x1b[0m`);
      process.exit(code ?? 1);
    }

    const exportOut = path.join(engineDir, "out");
    if (fs.existsSync(exportOut)) {
      copyDirectory(exportOut, outputDir);
      console.log(`\n\x1b[32m? Static documentation export complete!\x1b[0m`);
      console.log(`?? Export directory: \x1b[36m${outputDir}\x1b[0m\n`);
    } else {
      console.log(`\n\x1b[32m? Documentation build complete!\x1b[0m\n`);
    }
    process.exit(0);
  });
}

const args = parseCliArgs(process.argv.slice(2));

switch (args.command) {
  case "init":
    runInit(args.targetDir);
    break;
  case "build":
    runBuild(args);
    break;
  case "dev":
  default:
    runDev(args);
    break;
}
