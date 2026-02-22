# ADF Editor

A browser-based [Atlassian Document Format (ADF)](https://developer.atlassian.com/cloud/jira/platform/apis/document/structure/) editor and live JSON viewer, built with React and the Atlaskit Editor.

![React](https://img.shields.io/badge/React-18.2-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-4.9-blue) ![Atlaskit](https://img.shields.io/badge/Atlaskit-Editor-0052CC)

## Features

- **Full-page Atlaskit Editor** — rich text editing with the full universal preset (tables, panels, code blocks, mentions, task lists, text color, rules, and more)
- **Live ADF JSON panel** — see the ADF output update in real time as you type in the editor
- **Bidirectional sync** — edit JSON directly in the right panel and the editor updates instantly; invalid JSON is highlighted
- **Resizable split view** — drag the splitter to resize the editor and JSON panels
- **Markdown shortcuts** — supports `**bold**`, `` `inline code` ``, ` ``` ` for code blocks, and other Atlaskit markdown shortcuts
- **Optimized for Production** — Custom Webpack chunk splitting for fast load times and reliable deployment

## Quick Start

### Prerequisites

- **Node.js** ≥ 16
- **npm** ≥ 8

### Install & Run

```bash
npm install
npm start
```

The app launches at [http://localhost:3000](http://localhost:3000).

### Build for Production

```bash
npm run build
```

Output is written to the `build/` directory.

### Deploy to GitHub Pages

This project is configured to deploy to GitHub Pages. The build process includes custom chunk splitting optimizations to ensure compatibility with GitHub Pages hosting limits (avoiding `ENAMETOOLONG` errors).

```bash
npm run deploy
```

## Project Structure

```
src/
├── index.tsx              # React entry point
├── index.css              # Global styles
├── App.tsx                # Root component
├── components/
│   ├── AdfViewer.tsx      # Editor + ADF JSON split view
│   └── ResizableSplit.tsx # Draggable split-pane layout
├── utils/
│   └── SimpleMentionResource.ts # Lightweight mention provider
└── __tests__/
    └── ResizableSplit.test.tsx
craco.config.js            # Webpack overrides for Atlaskit compatibility & optimization
```

### Key Components

| Component | Description |
|---|---|
| `AdfViewer` | Wraps the Atlaskit `ComposableEditor` with the universal preset and a synced ADF JSON textarea. Handles bidirectional updates with debouncing and JSON validation. |
| `ResizableSplit` | Generic two-panel horizontal split with a draggable splitter. Enforces a 200 px minimum panel width. |
| `SimpleMentionResource` | A lightweight mock implementation of mention resource to replace heavy test dependencies. |

## Tech Stack

- **React 18** with TypeScript
- **@atlaskit/editor-core** (ComposableEditor + universal preset)
- **@atlaskit/textarea** for the JSON panel
- **CRACO** to patch webpack for Atlaskit compatibility:
  - **Optimized Chunk Splitting**: Custom `splitChunks` configuration to group vendor libraries and prevent excessive small files.
  - **Node Polyfills**: Fallbacks for missing Node built-ins.
  - **Source Map Management**: Production-optimized source map handling.
  - **Icon Alias Fixes**: Resolves broken `@atlaskit/icon-file-type` imports.
- **react-intl-next** for Atlaskit i18n requirements

## Notes

- `React.StrictMode` is intentionally **not** used — Atlaskit's portal system conflicts with StrictMode's double-mount behavior in React 18, causing `removeChild` errors.
- The CRACO config resolves several Atlaskit bundling issues including broken `@atlaskit/icon-file-type` imports and missing Node built-in polyfills.
- **Build Optimization**: The `craco.config.js` includes a production-only `splitChunks` strategy that groups Atlaskit and React dependencies into larger, fewer chunks. This fixes deployment issues on Windows/GitHub Pages caused by excessive file counts.

## License

Private
