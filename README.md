# ADF Editor

A browser-based [Atlassian Document Format (ADF)](https://developer.atlassian.com/cloud/jira/platform/apis/document/structure/) editor and live JSON viewer, built with React and the Atlaskit Editor.

![React](https://img.shields.io/badge/React-18.2-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-4.9-blue) ![Atlaskit](https://img.shields.io/badge/Atlaskit-Editor-0052CC)

## Features

- **Full-page Atlaskit Editor** — rich text editing with the full universal preset (tables, panels, code blocks, mentions, task lists, text color, rules, and more)
- **Live ADF JSON panel** — see the ADF output update in real time as you type in the editor
- **Bidirectional sync** — edit JSON directly in the right panel and the editor updates instantly; invalid JSON is highlighted
- **Resizable split view** — drag the splitter to resize the editor and JSON panels
- **Markdown shortcuts** — supports `**bold**`, `` `inline code` ``, ` ``` ` for code blocks, and other Atlaskit markdown shortcuts

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

### Run Tests

```bash
npm test
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
└── __tests__/
    └── ResizableSplit.test.tsx
craco.config.js            # Webpack overrides for Atlaskit compatibility
```

### Key Components

| Component | Description |
|---|---|
| `AdfViewer` | Wraps the Atlaskit `ComposableEditor` with the universal preset and a synced ADF JSON textarea. Handles bidirectional updates with debouncing and JSON validation. |
| `ResizableSplit` | Generic two-panel horizontal split with a draggable splitter. Enforces a 200 px minimum panel width. |

## Tech Stack

- **React 18** with TypeScript
- **@atlaskit/editor-core** (ComposableEditor + universal preset)
- **@atlaskit/textarea** for the JSON panel
- **CRACO** to patch webpack for Atlaskit compatibility (Node polyfill fallbacks, source-map warning suppression, icon alias fixes)
- **react-intl-next** for Atlaskit i18n requirements

## Notes

- `React.StrictMode` is intentionally **not** used — Atlaskit's portal system conflicts with StrictMode's double-mount behavior in React 18, causing `removeChild` errors.
- The CRACO config resolves several Atlaskit bundling issues including broken `@atlaskit/icon-file-type` imports and missing Node built-in polyfills.

## License

Private
