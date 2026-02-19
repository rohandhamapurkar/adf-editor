# ADF Viewer DAC — Milestone Plan

## Context

Exact functional replica of the Atlassian ADF Viewer DAC example (`31-adf-viewer-DAC.tsx`) using CRA + TypeScript + CRACO + modern `ComposableEditor` API. Horizontal resizable layout with dark/light theming.

## Decisions

| Decision | Choice |
|---|---|
| Layout | Horizontal side-by-side, draggable splitter |
| Default split | 60% editor / 40% JSON textarea |
| Min panel width | 200px per panel |
| Editor API | `ComposableEditor` + `useUniversalPreset` |
| Appearance | `full-page` with title field |
| Toolbar features | All except media (tables, panels, text color, rules, expand, code blocks, help dialog) |
| Providers | Mention only |
| Media | Removed entirely |
| Sync | Bidirectional (editor ↔ JSON) |
| JSON format | Pretty-printed, 2-space indent |
| Initial content | Empty |
| JSON textarea | Full panel height |
| Theme | Light/dark, OS-aware + sun/moon toggle (top-right) |
| Header | None |
| Stack | CRA + TypeScript + CRACO + npm |

---

## Milestone 1 — Project Scaffold & Build Config

**Goal:** CRA project boots with CRACO and all Atlaskit packages installed without build errors.

### Steps

1.1. Scaffold CRA project:
```bash
cd "c:\Users\rohan\Downloads\New folder"
npx create-react-app . --template typescript
```

1.2. Install CRACO:
```bash
npm install @craco/craco
```

1.3. Update `package.json` scripts — replace `react-scripts` with `craco`:
```json
"scripts": {
  "start": "craco start",
  "build": "craco build",
  "test": "craco test"
}
```

1.4. Create `craco.config.js` at project root:
- `webpack.DefinePlugin` for `process.env` polyfill
- `resolve.fallback` for Node built-ins (`path`, `stream`, `os`, `crypto`, `http`, `https`, `zlib`, `url`, `buffer`, `assert`, `util`) → `false`
- Suppress source-map-loader warnings for Atlaskit packages

1.5. Install @atlaskit core packages:
```bash
npm install @atlaskit/editor-core @atlaskit/editor-common @atlaskit/editor-plugins @emotion/react
```

1.6. Install @atlaskit peer dependencies:
```bash
npm install react-intl-next@npm:react-intl@^5.18.1 @atlaskit/link-provider @atlaskit/media-core
```

1.7. Install feature packages:
```bash
npm install @atlaskit/textarea @atlaskit/util-data-test @atlaskit/mention @atlaskit/tokens
```

1.8. Clean up CRA boilerplate — remove `src/App.css`, `src/logo.svg`, `src/App.test.tsx`, `src/reportWebVitals.ts`, `src/setupTests.ts`. Simplify `src/App.tsx` to render a `<div>Hello</div>`.

1.9. Update `src/index.css`:
```css
html, body, #root {
  margin: 0;
  padding: 0;
  height: 100%;
  overflow: hidden;
}
```

### Test (Milestone 1)
```bash
npm start
```
- **Pass criteria:** App compiles and loads in browser with no build errors. "Hello" renders on screen. No webpack resolution errors for Atlaskit imports.

---

## Milestone 2 — Resizable Split Panel Layout

**Goal:** A working horizontal split layout with a draggable splitter bar, before wiring up any Atlaskit editor.

### Steps

2.1. Create `src/components/ResizableSplit.tsx`:
- Flexbox row container, full viewport height
- Left panel (60% default) and right panel (40% default)
- 6px vertical divider between panels with `cursor: col-resize`
- `onMouseDown` on divider → track `mousemove` → update left panel width via state
- Min width: 200px per panel
- Both panels: `overflow: auto`, `height: 100vh`
- Splitter styled: subtle gray background, slightly darker on hover

2.2. Create `src/components/ResizableSplit.test.tsx`:
- Test: renders two children in left/right panels
- Test: default split is approximately 60/40
- Test: splitter div is present and has correct cursor style

2.3. Update `src/App.tsx` to render `<ResizableSplit>` with placeholder content:
```tsx
<ResizableSplit>
  <div>Editor Panel</div>
  <div>ADF Panel</div>
</ResizableSplit>
```

### Test (Milestone 2)
```bash
npm test -- --watchAll=false --testPathPattern=ResizableSplit
npm start
```
- **Pass criteria:** Unit tests pass. Browser shows two panels side-by-side. Dragging the splitter resizes panels. Panels stop at 200px minimum.

---

## Milestone 3 — Theme System (Light/Dark)

**Goal:** OS-aware dark/light theme with a toggle button, applied globally.

### Steps

3.1. Create `src/theme/ThemeContext.tsx`:
- `ThemeContext` with `{ theme: 'light' | 'dark', toggleTheme: () => void }`
- `ThemeProvider` component:
  - On mount: check `localStorage` for saved preference, fallback to `matchMedia('(prefers-color-scheme: dark)')`
  - Listen for OS preference changes via `matchMedia` `change` event
  - Set `document.documentElement.dataset.colorMode` to `'light'` or `'dark'` — Atlaskit tokens read this
  - Set `document.documentElement.style.colorScheme` to match
  - Persist user override to `localStorage`

3.2. Create `src/theme/ThemeToggle.tsx`:
- Small button with sun (☀️) / moon (🌙) icon (use Unicode, no icon library)
- Absolutely positioned: `top: 8px; right: 8px; z-index: 1000`
- Subtle rounded background, adapts to current theme colors
- Calls `toggleTheme()` from context on click

3.3. Create `src/theme/ThemeToggle.test.tsx`:
- Test: renders sun icon in dark mode, moon icon in light mode
- Test: clicking toggles the theme

3.4. Update `src/App.tsx`:
```tsx
<ThemeProvider>
  <ThemeToggle />
  <ResizableSplit>
    <div>Editor Panel</div>
    <div>ADF Panel</div>
  </ResizableSplit>
</ThemeProvider>
```

3.5. Update `src/index.css` — add theme-aware CSS variables:
```css
html[data-color-mode="light"] {
  --bg-primary: #ffffff;
  --bg-secondary: #f4f5f7;
  --text-primary: #172b4d;
  --border-color: #dfe1e6;
  --splitter-color: #c1c7d0;
  --splitter-hover: #a5adba;
}
html[data-color-mode="dark"] {
  --bg-primary: #1d2125;
  --bg-secondary: #22272b;
  --text-primary: #b6c2cf;
  --border-color: #3d4449;
  --splitter-color: #3d4449;
  --splitter-hover: #5a6068;
}
html {
  background-color: var(--bg-primary);
  color: var(--text-primary);
  transition: background-color 0.2s, color 0.2s;
}
```

3.6. Update `ResizableSplit.tsx` to use CSS variables for splitter and panel backgrounds.

### Test (Milestone 3)
```bash
npm test -- --watchAll=false --testPathPattern=ThemeToggle
npm start
```
- **Pass criteria:** Unit tests pass. Page loads with OS-appropriate theme. Click toggle switches themes. Preference persists on reload. Splitter and panels adapt colors.

---

## Milestone 4 — Atlaskit Editor Integration

**Goal:** Full-page Atlaskit editor renders in the left panel with all toolbar features.

### Steps

4.1. Create `src/components/AdfViewer.tsx`:
- Import `ComposableEditor` from `@atlaskit/editor-core/composable-editor`
- Import `useUniversalPreset` from `@atlaskit/editor-core/preset-universal`
- Import `usePreset` from `@atlaskit/editor-core/use-preset`
- Import `EditorContext` from `@atlaskit/editor-core/editor-context`
- Import `WithEditorActions`, `ToolbarHelp` from `@atlaskit/editor-core`
- Import `ExtractInjectionAPI` from `@atlaskit/editor-common/types`
- Import `HelpDialogPlugin` from `@atlaskit/editor-plugins/help-dialog`
- Import `mentionResourceProvider` from `@atlaskit/util-data-test/mention-story-data`

4.2. Create `ComposableEditorWrapper` functional component:
```tsx
const ComposableEditorWrapper = (props: EditorProps) => {
  const initialPluginConfiguration = {
    tasksAndDecisionsPlugin: { allowBlockTaskItem: true },
  };
  const universalPreset = useUniversalPreset({ props, initialPluginConfiguration });
  const { preset, editorApi } = usePreset(() => universalPreset, [universalPreset]);

  return (
    <ComposableEditor
      preset={preset}
      {...props}
      primaryToolbarComponents={
        <ToolbarHelp
          key={1}
          titlePosition="top"
          title="Help"
          editorApi={
            props.allowHelpDialog
              ? (editorApi as ExtractInjectionAPI<HelpDialogPlugin>)
              : undefined
          }
        />
      }
    />
  );
};
```

4.3. Create the `providers` object:
```tsx
export const providers = {
  mentionProvider: Promise.resolve(mentionResourceProvider),
};
```

4.4. Render in `AdfViewer.tsx` — left panel of `<ResizableSplit>`:
```tsx
<EditorContext>
  <WithEditorActions
    render={(actions) => (
      <ComposableEditorWrapper
        appearance="full-page"
        allowRule={true}
        allowTextColor={true}
        allowTables={{ allowControls: true }}
        allowPanel={true}
        allowHelpDialog={true}
        placeholder="We support markdown! Try **bold**, `inline code`, or ``` for code blocks."
        {...providers}
      />
    )}
  />
</EditorContext>
```

4.5. Right panel: placeholder `<div>ADF JSON here</div>` for now.

4.6. Wrap `<AdfViewer />` in `<IntlProvider locale="en">` in `src/App.tsx`.

### Test (Milestone 4)
```bash
npm start
```
- **Pass criteria:** Atlaskit full-page editor renders in left panel with full toolbar. Title input visible. Typing works. Toolbar buttons (bold, italic, headings, tables, panels, text color, rules, code blocks, help) all visible and functional. No console errors. Mention autocomplete appears when typing `@`.

---

## Milestone 5 — ADF JSON Textarea Panel

**Goal:** Right panel shows ADF JSON textarea with proper styling.

### Steps

5.1. Import `TextArea` from `@atlaskit/textarea`.

5.2. Add `<h2>ADF</h2>` heading + `<TextArea>` to the right panel:
```tsx
<div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '0 8px' }}>
  <h2 style={{ margin: '8px 0', flexShrink: 0 }}>ADF</h2>
  <TextArea
    isMonospaced={true}
    minimumRows={20}
    placeholder='{"version": 1...'
    isInvalid={!isValidAdf}
    ref={textAreaRef}
    onChange={handleAdfChange}
    style={{ flex: 1 }}
  />
</div>
```

5.3. Make the textarea fill remaining height of the right panel (flex: 1 on the textarea container, with the parent as a flex column).

### Test (Milestone 5)
```bash
npm start
```
- **Pass criteria:** Right panel shows "ADF" heading and a monospaced textarea filling the panel. Textarea is editable. Theme colors apply to the textarea panel.

---

## Milestone 6 — Bidirectional Sync

**Goal:** Typing in the editor updates the JSON textarea; pasting valid ADF JSON into the textarea updates the editor.

### Steps

6.1. Store `editorActions` ref from `WithEditorActions` render prop.

6.2. Store textarea ref via `TextArea` ref callback.

6.3. Implement `handleEditorChange`:
```tsx
const handleEditorChange = () => {
  if (!editorActions) return;
  editorActions.getValue().then((value) => {
    if (textAreaRef) {
      textAreaRef.value = JSON.stringify(value, null, 2);
    }
  });
};
```
- Pass as `onChange` prop to `ComposableEditorWrapper`.

6.4. Implement `handleAdfChange`:
```tsx
const handleAdfChange = (e: { target: { value: string } }) => {
  try {
    if (editorActions) {
      editorActions.replaceDocument(e.target.value);
    }
    setIsValidAdf(true);
  } catch (error) {
    setIsValidAdf(false);
  }
};
```

6.5. State: `isValidAdf: boolean` (default `true`) — drives `isInvalid` on the textarea.

### Test (Milestone 6)
```bash
npm start
```
- **Pass criteria:**
  - Type text in editor → JSON textarea updates with pretty-printed ADF in real-time
  - Paste valid ADF (`{"version": 1, "type": "doc", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "Hello"}]}]}`) into textarea → editor shows "Hello"
  - Paste invalid JSON → textarea border turns red (`isInvalid`)
  - Clear invalid JSON and type valid JSON → red border disappears

---

## Milestone 7 — Polish & Final Verification

**Goal:** Final styling, edge cases, dark mode integration verification, and cleanup.

### Steps

7.1. Verify dark mode works end-to-end:
- Atlaskit editor toolbar and content area respond to `data-color-mode`
- ADF textarea panel background/text adapts
- Splitter bar adapts
- Toggle button icon and styling adapt

7.2. Verify splitter interactions:
- Drag works smoothly without text selection during drag (add `user-select: none` during drag)
- Works with window resize

7.3. Edge cases:
- Very large ADF documents don't freeze the UI (textarea and editor both scroll independently)
- Rapid typing doesn't cause sync race conditions (debounce `handleEditorChange` if needed)

7.4. Remove any remaining CRA boilerplate files not yet cleaned up.

7.5. Verify `npm run build` succeeds with no errors.

### Test (Milestone 7)
```bash
npm run build
npm start
```
- **Pass criteria:**
  - Production build succeeds
  - All features verified in both light and dark themes
  - Splitter drag is smooth
  - No console errors or warnings (other than React strict mode double-render if present)
  - Mention autocomplete works
  - Help dialog opens (? icon in toolbar)
  - Full bidirectional sync works

---

## File Structure (Final)

```
c:\Users\rohan\Downloads\New folder\
├── craco.config.js
├── package.json
├── tsconfig.json
├── public/
│   └── index.html
└── src/
    ├── index.tsx
    ├── index.css
    ├── App.tsx
    ├── theme/
    │   ├── ThemeContext.tsx
    │   └── ThemeToggle.tsx
    ├── components/
    │   ├── ResizableSplit.tsx
    │   └── AdfViewer.tsx
    └── __tests__/
        ├── ResizableSplit.test.tsx
        └── ThemeToggle.test.tsx
```

## Risk Mitigations

| Risk | Mitigation |
|---|---|
| Atlaskit webpack 5 compat issues | CRACO config with node polyfill fallbacks; iterative fixes |
| `react-intl-next` alias confusion | Install as `react-intl-next@npm:react-intl@^5.18.1` — verified approach |
| `@atlaskit/editor-test-helpers` dead (media) | Media feature removed entirely per decision |
| Large dependency tree = slow installs | One-time cost; `npm ci` for subsequent runs |
| Atlaskit dark mode incomplete | Supplement with CSS variables as fallback; Atlaskit tokens handle most cases |
| ComposableEditor API may differ from source | Subpath exports verified (`/composable-editor`, `/preset-universal`, `/use-preset`, `/editor-context`) |
