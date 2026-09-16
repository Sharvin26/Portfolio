import type { APIRoute } from "astro";
import { getCollection } from "astro:content";

const SITE = "https://www.sharvinshah.com";

interface Entry {
  path: string;
  lastmod?: Date;
  changefreq: string;
  priority: string;
}

function toXml(entries: Entry[]) {
  const urls = entries.map(({ path, lastmod, changefreq, priority }) => {
    const lines = [`    <loc>${SITE}${path}</loc>`];
    if (lastmod) lines.push(`    <lastmod>${lastmod.toISOString()}</lastmod>`);
    lines.push(`    <changefreq>${changefreq}</changefreq>`);
    lines.push(`    <priority>${priority}</priority>`);
    return `  <url>\n${lines.join("\n")}\n  </url>`;
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>
`;
}

export const GET: APIRoute = async () => {
  const guides = (await getCollection("guides"))
    .sort((a, b) => a.data.readingOrder - b.data.readingOrder)
    .map((guide) => ({
      path: `/guides/${guide.id}`,
      lastmod: guide.data.updatedDate ?? guide.data.publishDate,
      changefreq: "monthly",
      priority: "0.8",
    }));

  const hubLastmod = guides.length
    ? new Date(Math.max(...guides.map((guide) => guide.lastmod.getTime())))
    : undefined;

  const entries: Entry[] = [
    { path: "/", changefreq: "weekly", priority: "1.0" },
    { path: "/guides", lastmod: hubLastmod, changefreq: "monthly", priority: "0.8" },
    ...guides,
  ];

  return new Response(toXml(entries), {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
};
