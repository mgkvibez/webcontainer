/* Dev server with the cross-origin isolation headers WebContainers needs.
 *
 * WebContainer requires SharedArrayBuffer, which browsers only expose on
 * cross-origin-isolated pages. This server sets COOP/COEP so the demo
 * works on http://localhost:6173 out of the box.
 */
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import url from "node:url";

const ROOT = path.dirname(url.fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 6173);

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
};

const server = http.createServer((req, res) => {
  const { pathname } = new URL(req.url, `http://${req.headers.host}`);

  // Cross-origin isolation: required by WebContainer.
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");

  let file = pathname === "/" ? "index.html" : pathname.slice(1);
  const resolved = path.join(ROOT, file);
  if (!resolved.startsWith(ROOT)) {
    res.writeHead(403).end("forbidden");
    return;
  }

  fs.readFile(resolved, (error, data) => {
    if (error) {
      res.writeHead(404).end("not found");
      return;
    }
    res.setHeader("Content-Type", MIME[path.extname(resolved)] || "application/octet-stream");
    res.writeHead(200).end(data);
  });
});

server.listen(PORT, () => {
  console.log(`webcontainer demo: http://localhost:${PORT} (cross-origin isolated)`);
});
