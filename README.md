# mgk sandbox (webcontainer)

A Node.js dev environment that runs **entirely in the browser tab** — no
install, no server-side containers, no signup. Built on
[WebContainers](https://webcontainers.io): the editor contents are mounted
into an in-browser Node runtime, `npm install` runs locally in the page, and
the preview pane shows the live server as soon as it listens.

## Run it

```bash
node webcontainer-app/server.mjs
# open http://localhost:6173
```

The dev server exists for one reason: WebContainers need
**cross-origin isolation** (`SharedArrayBuffer`), so it sets the required
COOP/COEP headers. Then:

1. Pick a starter (Express or plain `node:http`) and hit **Boot container**.
2. Edit `server.js` in the editor.
3. Hit **npm install → node server.js**. The preview pane goes live on port 3000.

## What's inside

```
webcontainer-app/
  index.html        app shell: toolbar, editor, terminal, preview
  app.js            WebContainer boot, mount, spawn, server-ready wiring
  virtual-project.js  starter projects + buildTree (flat paths → mount tree)
  server.mjs        dev server with COOP/COEP isolation headers
  styles.css
tests/
  virtual-project.test.mjs  buildTree + path-validation + starter sanity
```

Tests are dependency-free Node test-runner:

```bash
node --test tests/
```

## Deployment

Cross-origin isolation is set in `vercel.json` (headers) so the same app
deploys statically. Any static host works if you can set the
`Cross-Origin-Opener-Policy: same-origin` and
`Cross-Origin-Embedder-Policy: require-corp` headers.

## Requirements / honest limitations

- A browser with SharedArrayBuffer support (all modern Chrome/Edge/Firefox/Safari
  on desktop; not every in-app webview).
- The WebContainer SDK loads from the esm.sh CDN (CORS-clean under COEP).
- First boot downloads the WebContainer runtime — subsequent boots are cached.
- v0.1 runs one process (`node server.js`) and one editable file; the
  terminal is output-only (no interactive stdin yet).

## License

MIT
