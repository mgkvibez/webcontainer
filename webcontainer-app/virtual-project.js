/* Builds the virtual project tree that gets mounted into the WebContainer.
 *
 * WebContainer.mount expects nested objects:
 *   { "package.json": { file: { contents } },
 *     "src": { directory: { "app.js": { file: { contents } } } } }
 *
 * buildTree takes flat "path -> contents" pairs and nests them, so starters
 * stay readable as plain maps. Pure, dependency-free, unit-tested.
 */

export const STARTERS = {
  express: {
    "package.json": JSON.stringify(
      {
        name: "webcontainer-starter",
        type: "module",
        dependencies: { express: "^4.19.2" },
      },
      null,
      2
    ),
    "server.js": [
      "import express from 'express';",
      "const app = express();",
      "app.get('/', (req, res) => res.send('Hello from a WebContainer!'));",
      "app.get('/api/time', (req, res) => res.json({ now: Date.now() }));",
      "app.listen(3000, () => console.log('listening on 3000'));",
    ].join("\n"),
  },
  plain: {
    "package.json": JSON.stringify(
      { name: "webcontainer-starter", type: "module" },
      null,
      2
    ),
    "server.js": [
      "import http from 'node:http';",
      "const server = http.createServer((req, res) => {",
      "  res.writeHead(200, { 'content-type': 'text/html' });",
      "  res.end('<h1>Hello from a plain Node WebContainer!</h1>');",
      "});",
      "server.listen(3000, () => console.log('listening on 3000'));",
    ].join("\n"),
  },
};

export function buildTree(files) {
  const root = {};
  for (const [path, contents] of Object.entries(files)) {
    const parts = path.split("/").filter(Boolean);
    let node = root;
    for (const part of parts.slice(0, -1)) {
      node[part] ??= { directory: {} };
      node = node[part].directory;
    }
    node[parts.at(-1)] = { file: { contents } };
  }
  return root;
}

export function validPath(path) {
  return (
    typeof path === "string" &&
    path.length > 0 &&
    !path.startsWith("/") &&
    !path.split("/").includes("..") &&
    path.split("/").filter(Boolean).length > 0
  );
}
