# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run dev          # Web app at http://localhost:3007
npm run cli -- <args>  # Run CLI from source (e.g. npm run cli -- inspect file.elpx)

# Type checking
npm run check:web    # Check app/ + src/ (tsconfig.json)
npm run check:cli    # Check cli/ + src/ (tsconfig.cli.json)
npm run check        # Both

# Build
npm run build        # Web → docs/ (GitHub Pages)
npm run build:cli    # CLI → dist/cli/
npm run build:all    # Both

# Preview built web app
npm run preview
```

## Architecture

The project exposes a **shared conversion core** (`src/`) through two separate frontends:

- **`app/`** — Web app entry point (Vite root). `app/main.ts` is the UI layer; `src/main.ts` is the web interface logic.
- **`cli/execonvert.ts`** — CLI entry point. Parses args, calls converters from `src/`, writes output files.
- **`cli/runtime.ts`** — Node-specific polyfills and setup (`installCliRuntime()` must be called before any conversion in CLI context).
- **`bin/execonvert.js`** — Shell launcher; the `execonvert` command users install.
- **`src/`** — All format conversion logic, shared by both frontends.

### Core conversion modules (`src/`)

| File | Responsibility |
|---|---|
| `converter.ts` | Parse `.elpx`, page selection, HTML normalization, export to `.docx` and `.pdf`. PDF in Node uses Puppeteer + MathJax SVG; `pdfmake` is the browser fallback. |
| `legacy-elp.ts` | Convert `.elp` (legacy) to `.elpx` using bundled eXeLearning importers/exporters. |
| `docx-import.ts` | Import `.docx` → `.elpx`. |
| `elpx-markdown.ts` | Export `.elpx` → `.md`. |
| `markdown-import.ts` | Import `.md`/`.txt` → `.elpx`. |
| `i18n.ts` | Shared i18n (es/ca/en). CLI adds its own message layer on top in `execonvert.ts`. |

### Conversion matrix

```
.elp  → .elpx, .md, .docx, .pdf  (via intermediate .elpx)
.elpx → .md, .docx, .pdf
.docx → .elpx
.md   → .elpx
```

### Build outputs

- Web build → `docs/` (served as GitHub Pages at execonvert.github.io)
- CLI build → `dist/cli/` (bundled for npm publish and native packaging)
- Native packages (`.deb`, `AppImage`, `.exe`, `.pkg`) are built via GitHub Actions using scripts in `scripts/package-cli/`

### TypeScript setup

Two separate `tsconfig` files cover different environments:
- `tsconfig.json` → web (includes `vite/client` types, covers `app/` and `src/`)
- `tsconfig.cli.json` → CLI (includes `node` types, covers `cli/` and `src/`)
- `tsconfig.base.json` → shared base (ES2022, strict, noEmit, Bundler resolution)

The `src/` modules are intentionally written to work in both browser and Node environments. Avoid adding Node-only APIs to `src/`; put them in `cli/runtime.ts` instead.
