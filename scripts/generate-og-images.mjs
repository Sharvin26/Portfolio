import { mkdtemp, writeFile, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { tmpdir, homedir } from "node:os";
import { join, resolve } from "node:path";
import { spawn } from "node:child_process";

const OUT_DIR = "public";
const WIDTH = 1200;
const HEIGHT = 630;

const T = {
  background: "oklch(0.14 0.012 45)",
  foreground: "oklch(0.97 0.006 80)",
  muted: "oklch(0.66 0.014 55)",
  border: "oklch(0.35 0.017 48)",
  accent: "oklch(0.77 0.16 71)",

  grid: "oklch(0.21 0.012 45)",
};

const cards = [
  {
    file: "og-rag.png",
    eyebrow: "Retrieval-Augmented Generation",
    lead: "Retrieval that survives",
    emphasis: "contact with production.",
    sub: "Chunking, hybrid search, reranking - and when to skip RAG entirely.",
    url: "sharvinshah.com/guides/rag",
  },
  {
    file: "og-llm-evaluation.png",
    eyebrow: "LLM Evaluation",
    lead: "Evals that actually",
    emphasis: "catch regressions.",
    sub: "Golden datasets, LLM-as-judge, and the failure modes that quietly break eval suites.",
    url: "sharvinshah.com/guides/llm-evaluation",
  },
  {
    file: "og-mcp.png",
    eyebrow: "Model Context Protocol",
    lead: "One server per tool,",
    emphasis: "not one per app.",
    sub: "Architecture, a working TypeScript server, and when MCP is pure overhead.",
    url: "sharvinshah.com/guides/mcp",
  },
  {
    file: "og-ai-agents.png",
    eyebrow: "AI Agents",
    lead: "When the model writes",
    emphasis: "its own control flow.",
    sub: "The plan-act-observe loop, memory, real cost per run, and when a workflow wins.",
    url: "sharvinshah.com/guides/ai-agents",
  },
  {
    file: "og-voice-ai-agents.png",
    eyebrow: "Voice AI Agents",
    lead: "The agent loop, minus",
    emphasis: "the send button.",
    sub: "Latency budgets, barge-in, turn-taking, and what a call actually costs.",
    url: "sharvinshah.com/guides/voice-ai-agents",
  },
];

const fontUrl = (pkg, file) =>
  `file://${resolve(`node_modules/@fontsource-variable/${pkg}/files/${file}`)}`;

const page = (card) => `<!doctype html>
<html><head><meta charset="utf-8"><style>
@font-face {
  font-family: "Urbanist Variable";
  src: url("${fontUrl("urbanist", "urbanist-latin-wght-normal.woff2")}") format("woff2-variations");
  font-weight: 100 900;
}
@font-face {
  font-family: "JetBrains Mono Variable";
  src: url("${fontUrl("jetbrains-mono", "jetbrains-mono-latin-wght-normal.woff2")}") format("woff2-variations");
  font-weight: 100 800;
}
* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  width: ${WIDTH}px; height: ${HEIGHT}px;
  background-color: ${T.background};
  background-image: radial-gradient(${T.grid} 1px, transparent 1px);
  background-size: 32px 32px;
  font-family: "Urbanist Variable", system-ui, sans-serif;
  display: flex; flex-direction: column; justify-content: center;
  padding: 0 100px;
  overflow: hidden;
}
.eyebrow {
  display: flex; align-items: center; gap: 14px;
  font-family: "JetBrains Mono Variable", monospace;
  font-size: 21px; font-weight: 700; letter-spacing: 0.18em;
  text-transform: uppercase; color: ${T.accent};
  margin-bottom: 26px;
}
.dot { width: 9px; height: 9px; border-radius: 50%; background: ${T.accent}; flex: none; }
h1 {
  font-size: 68px; font-weight: 800; line-height: 1.08;
  letter-spacing: -0.02em; color: ${T.foreground};
  max-width: 940px;
  text-wrap: balance;
}
h1 em { font-style: normal; color: ${T.accent}; }
.sub {
  margin-top: 30px; font-size: 26px; line-height: 1.45;
  color: ${T.muted}; max-width: 880px;
}
footer {
  position: absolute; left: 100px; right: 100px; bottom: 56px;
  padding-top: 26px; border-top: 1px solid ${T.border};
  display: flex; justify-content: space-between; align-items: baseline;
  font-family: "JetBrains Mono Variable", monospace; font-size: 22px;
}
.name { font-weight: 700; color: ${T.foreground}; }
.url { color: ${T.muted}; }
</style></head>
<body>
  <div class="eyebrow"><span class="dot"></span>${card.eyebrow}</div>
  <h1>${card.lead} <em>${card.emphasis}</em></h1>
  <p class="sub">${card.sub}</p>
  <footer><span class="name">Sharvin Shah</span><span class="url">${card.url}</span></footer>
</body></html>`;

function findChrome() {
  const candidates = [
    process.env.CHROME_PATH,
    join(homedir(), "Library/Caches/ms-playwright/chromium-1223/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing"),
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
  ].filter(Boolean);
  const found = candidates.find((c) => existsSync(c));
  if (!found) throw new Error("No Chrome binary found. Set CHROME_PATH.");
  return found;
}

const rpc = (ws) => {
  let id = 0;
  const pending = new Map();
  ws.addEventListener("message", (e) => {
    const msg = JSON.parse(e.data);
    if (msg.id && pending.has(msg.id)) {
      pending.get(msg.id)(msg.result);
      pending.delete(msg.id);
    }
  });
  return (method, params = {}) =>
    new Promise((res) => {
      const i = ++id;
      pending.set(i, res);
      ws.send(JSON.stringify({ id: i, method, params }));
    });
};

const port = 9333;
const chrome = spawn(findChrome(), [
  "--headless",
  `--remote-debugging-port=${port}`,
  "--hide-scrollbars",
  "--allow-file-access-from-files",
], { stdio: "ignore" });

try {
  let version;
  for (let i = 0; i < 40; i++) {
    try {
      version = await (await fetch(`http://127.0.0.1:${port}/json/version`)).json();
      break;
    } catch {
      await new Promise((r) => setTimeout(r, 250));
    }
  }
  if (!version) throw new Error("Chrome did not expose a debugging port.");

  const dir = await mkdtemp(join(tmpdir(), "og-"));

  for (const card of cards) {
    const html = join(dir, card.file.replace(".png", ".html"));
    await writeFile(html, page(card), "utf8");

    const target = await (
      await fetch(`http://127.0.0.1:${port}/json/new?${encodeURIComponent(`file://${html}`)}`, { method: "PUT" })
    ).json();
    const ws = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise((r) => (ws.onopen = r));
    const send = rpc(ws);

    await send("Page.enable");
    await send("Emulation.setDeviceMetricsOverride", {
      width: WIDTH, height: HEIGHT, deviceScaleFactor: 1, mobile: false,
    });

    await new Promise((r) => setTimeout(r, 900));

    const { data } = await send("Page.captureScreenshot", {
      format: "png",
      clip: { x: 0, y: 0, width: WIDTH, height: HEIGHT, scale: 1 },
    });
    await writeFile(join(OUT_DIR, card.file), Buffer.from(data, "base64"));
    ws.close();

    const size = (await readFile(join(OUT_DIR, card.file))).length;
    console.log(`  ${card.file.padEnd(28)} ${WIDTH}x${HEIGHT}  ${(size / 1024).toFixed(0)} KB`);
  }
  console.log(`\nWrote ${cards.length} OG images to ${OUT_DIR}/.`);
} finally {
  chrome.kill();
}
