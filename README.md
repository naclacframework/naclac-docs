# @naclac/docs

A Mintlify-compatible documentation engine & CLI (`naclac-docs`). Write `.mdx` files and a `docs.json` (or `mint.json`), and get a modern, blazing-fast, static documentation website.

## Features

- **Mintlify-Compatible**: Drop in your existing `docs.json` or `mint.json` and `.mdx` files with zero conversion.
- **Rich Components**: Full support for `<Card>`, `<CardGroup>`, `<Steps>`, `<Step>`, `<Tabs>`, `<Tab>`, `<CodeGroup>`, `<Tip>`, `<Warning>`, `<Note>`, and `<Accordion>`.
- **Dark Mode**: Complete light/dark theme support with warm palette tokens and syntax highlighting matching Mintlify.
- **Table of Contents**: Smooth scroll-spy with animated indicator pill and responsive layout.
- **Instant Search**: Full-text client search with keyboard shortcuts (`Ctrl+K` / `⌘K`).
- **Static Export**: Build pure static HTML (`SSG`) with one command, ready to deploy anywhere for free (GitHub Pages, Cloudflare Pages, Vercel, Netlify, AWS S3).

## Getting Started

### 1. Initialize a new documentation project

```bash
npx @naclac/docs init my-docs
cd my-docs
```

This generates a starter project:
```text
my-docs/
├── docs.json
├── introduction.mdx
└── quickstart.mdx
```

### 2. Start the local preview server

```bash
npx naclac-docs dev
```

Your documentation site will automatically open at `http://localhost:3000`. Any edits to `.mdx` or `docs.json` will hot-reload in real-time.

### 3. Build for production

```bash
npx naclac-docs build --out ./dist
```

This exports pre-rendered, SEO-optimized static HTML files into `./dist`, ready for deployment to any web host.

## CLI Commands

| Command | Description |
| --- | --- |
| `naclac-docs dev [dir]` | Start local dev server (default port: 3000) |
| `naclac-docs build [dir]` | Build static HTML export (default out: `./out`) |
| `naclac-docs init [dir]` | Initialize a new docs project with starter template |

### Options

- `-p, --port <port>`: Port to listen on (default: `3000`)
- `-H, --host <host>`: Host to bind server to (default: `localhost`)
- `--no-open`: Do not automatically open browser on startup
- `--out <dir>`: Output directory for static build (default: `./out`)
- `-v, --version`: Display version
- `-h, --help`: Display help
