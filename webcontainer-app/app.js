import { WebContainer } from "https://esm.sh/@webcontainer/api@1.6.4";
import { STARTERS, buildTree } from "./virtual-project.js";

const $ = (id) => document.getElementById(id);
const statusEl = $("status");
const editor = $("editor");
const terminal = $("terminal");
const preview = $("preview");
const previewUrl = $("preview-url");

let container = null;
let serverProc = null;

function setStatus(text, cls) {
  statusEl.textContent = text;
  statusEl.className = "status " + (cls || "");
}

function writeTerminal(chunk) {
  terminal.textContent += chunk;
  terminal.scrollTop = terminal.scrollHeight;
}

async function boot() {
  if (container) return;
  setStatus("booting…", "busy");
  $("boot").disabled = true;
  try {
    container = await WebContainer.boot();
    container.on("server-ready", (_port, url) => {
      preview.src = url;
      previewUrl.textContent = url;
      setStatus("preview live", "ok");
    });
    setStatus("booted", "ok");
    $("run").disabled = false;
  } catch (error) {
    setStatus("boot failed: " + error.message, "err");
    $("boot").disabled = false;
  }
}

async function spawnToTerminal(command, args) {
  const proc = await container.spawn(command, args);
  proc.output.pipeTo(
    new WritableStream({ write: writeTerminal })
  );
  const code = await proc.exit;
  writeTerminal(`\n[exit ${code}]\n`);
  return code;
}

async function run() {
  if (!container) return;
  $("run").disabled = true;
  setStatus("installing…", "busy");
  writeTerminal(`\n$ npm install\n`);

  const starter = STARTERS[$("starter").value] || STARTERS.express;
  starter["server.js"] = editor.value;

  await container.mount(buildTree(starter));

  if ((await spawnToTerminal("npm", ["install"])) !== 0) {
    setStatus("install failed", "err");
    $("run").disabled = false;
    return;
  }

  writeTerminal(`\n$ node server.js\n`);
  serverProc = await container.spawn("node", ["server.js"]);
  serverProc.output.pipeTo(
    new WritableStream({ write: writeTerminal })
  );
  serverProc.exit.then((code) => {
    if (code !== 0) setStatus("server exited: " + code, "err");
  });
  setStatus("running — waiting for the preview", "busy");
  $("run").disabled = false;
}

$("boot").addEventListener("click", boot);
$("run").addEventListener("click", run);
editor.value = STARTERS.express["server.js"];
setStatus("idle — pick a starter and boot", "");
