import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

const SITE = "https://www.sharvinshah.com";

export default defineConfig({
  site: SITE,
  markdown: {
    shikiConfig: {
      theme: "css-variables",
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
