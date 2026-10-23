import assert from "node:assert/strict";
import test from "node:test";
import { buildTree, validPath, STARTERS } from "../webcontainer-app/virtual-project.js";

test("buildTree nests flat paths into directories", () => {
  const tree = buildTree({
    "package.json": "{}",
    "src/app.js": "console.log(1)",
    "src/lib/util.js": "export const x = 1",
  });
  assert.deepEqual(Object.keys(tree).sort(), ["package.json", "src"]);
  assert.equal(tree["package.json"].file.contents, "{}");
  assert.deepEqual(Object.keys(tree.src.directory), ["app.js", "lib"]);
  assert.equal(tree.src.directory["lib"].directory["util.js"].file.contents, "export const x = 1");
});

test("buildTree mirrors the shape WebContainer.mount expects", () => {
  const tree = buildTree({ "a/b.js": "x" });
  assert.ok(tree.a.directory);
  assert.equal(tree.a.directory["b.js"].file.contents, "x");
});

test("validPath rejects traversal and absolute paths", () => {
  assert.equal(validPath("src/app.js"), true);
  assert.equal(validPath(""), false);
  assert.equal(validPath("/abs.js"), false);
  assert.equal(validPath("../etc/passwd"), false);
  assert.equal(validPath("a/../../etc"), false);
});

test("starters mount cleanly: every starter builds and parses", () => {
  for (const [name, files] of Object.entries(STARTERS)) {
    assert.ok(files["package.json"], `${name} has a package.json`);
    assert.doesNotThrow(() => JSON.parse(files["package.json"]), name);
    assert.doesNotThrow(() => buildTree(files), name);
  }
});
