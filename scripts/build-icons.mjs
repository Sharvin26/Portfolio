import { writeFile, readFile, mkdtemp } from "node:fs/promises";
import { existsSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import { join } from "node:path";
import { spawn } from "node:child_process";

const PORT = 9334;

const jobs = [
  { svg: "public/favicon.svg", out: "icon-16.png", size: 16, pad: 0, temp: true },
  { svg: "public/favicon.svg", out: "icon-32.png", size: 32, pad: 0, temp: true },
  { svg: "public/favicon.svg", out: "icon-48.png", size: 48, pad: 0, temp: true },

  { svg: "public/favicon.svg", out: "public/apple-touch-icon.png", size: 180, pad: 0.10 },
  { svg: "public/favicon.svg", out: "public/icon-192.png", size: 192, pad: 0.08 },

  { svg: "public/favicon.svg", out: "public/icon-512.png", size: 512, pad: 0.14 },
];

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
    const m = JSON.parse(e.data);
    if (m.id && pending.has(m.id)) {
      pending.get(m.id)(m.result);
      pending.delete(m.id);
    }
  });
  return (method, params = {}) =>
    new Promise((res) => {
      const i = ++id;
      pending.set(i, res);
      ws.send(JSON.stringify({ id: i, method, params }));
    });
};

function buildIco(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);

  const directory = Buffer.alloc(16 * images.length);
  let offset = 6 + directory.length;

  images.forEach(({ size, data }, i) => {
    const e = i * 16;
    directory[e] = size >= 256 ? 0 : size;
    directory[e + 1] = size >= 256 ? 0 : size;
    directory[e + 2] = 0;
    directory[e + 3] = 0;
    directory.writeUInt16LE(1, e + 4);
    directory.writeUInt16LE(32, e + 6);
    directory.writeUInt32LE(data.length, e + 8);
    directory.writeUInt32LE(offset, e + 12);
    offset += data.length;
  });

  return Buffer.concat([header, directory, ...images.map((i) => i.data)]);
}

const chrome = spawn(findChrome(), [
  "--headless",
  `--remote-debugging-port=${PORT}`,
  "--hide-scrollbars",
], { stdio: "ignore" });

try {
  for (let i = 0; i < 40; i++) {
    try {
      await (await fetch(`http://127.0.0.1:${PORT}/json/version`)).json();
      break;
    } catch {
      await new Promise((r) => setTimeout(r, 250));
    }
  }

  const rendered = new Map();
  const scratch = await mkdtemp(join(tmpdir(), "icons-"));

  for (const job of jobs) {
    const dest = job.temp ? join(scratch, job.out) : job.out;
    const svg = await readFile(job.svg, "utf8");
    const inset = Math.round(job.size * job.pad);
    const html = `<!doctype html><style>
      *{margin:0;padding:0}
      html,body{width:${job.size}px;height:${job.size}px;overflow:hidden;background:#17110d}
      svg{display:block;position:absolute;left:${inset}px;top:${inset}px;
          width:${job.size - inset * 2}px;height:${job.size - inset * 2}px}
    </style>${svg}`;

    const url = "data:text/html;base64," + Buffer.from(html).toString("base64");
    const target = await (
      await fetch(`http://127.0.0.1:${PORT}/json/new?${encodeURIComponent(url)}`, { method: "PUT" })
    ).json();
    const ws = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise((r) => (ws.onopen = r));
    const send = rpc(ws);

    await send("Page.enable");
    await send("Emulation.setDeviceMetricsOverride", {
      width: job.size, height: job.size, deviceScaleFactor: 1, mobile: false,
    });
    await new Promise((r) => setTimeout(r, 350));
    const { data } = await send("Page.captureScreenshot", {
      format: "png",
      clip: { x: 0, y: 0, width: job.size, height: job.size, scale: 1 },
    });
    ws.close();

    const buf = Buffer.from(data, "base64");
    await writeFile(dest, buf);
    rendered.set(job.size, buf);
    if (!job.temp) console.log(`  ${job.out.padEnd(30)} ${job.size}x${job.size}`);
  }

  const ico = buildIco([16, 32, 48].map((size) => ({ size, data: rendered.get(size) })));
  await writeFile("public/favicon.ico", ico);
  console.log(`  ${"public/favicon.ico".padEnd(30)} 16/32/48  ${(ico.length / 1024).toFixed(1)} KB`);
} finally {
  chrome.kill();
}
