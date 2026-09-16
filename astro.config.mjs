import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";

const SITE = "https://www.sharvinshah.com";
const GUIDES_DIR = fileURLToPath(new URL("./src/content/guides", import.meta.url));

function guideLastmod() {
  const dates = new Map();

  for (const file of readdirSync(GUIDES_DIR)) {
    if (!file.endsWith(".md")) continue;

    const source = readFileSync(path.join(GUIDES_DIR, file), "utf8");
    if (!source.startsWith("---")) continue;
    const frontmatter = source.slice(3, source.indexOf("\n---", 3));

    const field = (key) => frontmatter.match(new RegExp(`^${key}:\\s*(\\S+)`, "m"))?.[1];
    const raw = field("updatedDate") ?? field("publishDate");
    if (!raw) continue;

    const parsed = new Date(raw.replace(/^["']|["']$/g, ""));
    if (!Number.isNaN(parsed.getTime())) dates.set(file.replace(/\.md$/, ""), parsed);
  }

  return dates;
}

const lastmod = guideLastmod();

const hubLastmod = lastmod.size
  ? new Date(Math.max(...[...lastmod.values()].map((d) => d.getTime())))
  : undefined;

export default defineConfig({
  site: SITE,
  integrations: [
    sitemap({
      serialize(item) {
        const guide = item.url.match(/\/guides\/([^/]+)\/?$/)?.[1];

        if (guide && lastmod.has(guide)) {
          item.lastmod = lastmod.get(guide).toISOString();
          item.priority = 0.8;
          item.changefreq = "monthly";
        } else if (/\/guides\/?$/.test(item.url)) {
          if (hubLastmod) item.lastmod = hubLastmod.toISOString();
          item.priority = 0.8;
          item.changefreq = "monthly";
        } else if (item.url === `${SITE}/`) {
          item.priority = 1;
          item.changefreq = "weekly";
        }

        return item;
      },
    }),
  ],
  markdown: {
    shikiConfig: {
      theme: "css-variables",
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
