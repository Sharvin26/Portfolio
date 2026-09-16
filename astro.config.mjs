import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://sharvinshah.com",
  integrations: [
    sitemap({
      serialize(item) {
        if (item.url === "https://sharvinshah.com/") {
          item.priority = 1;
          item.changefreq = "weekly";
        } else if (item.url.includes("/guides")) {
          item.priority = 0.8;
          item.changefreq = "monthly";
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
