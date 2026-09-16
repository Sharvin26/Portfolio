# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server (localhost:4321)
npm run build    # Production build
npm run preview  # Preview the production build locally
npm run lint     # ESLint
```

No test framework is configured.

## Architecture

This is a personal portfolio site built with **Astro 7**, **TypeScript**, and **Tailwind CSS 4**.

The entire site is a single static page rendered from `src/pages/index.astro`, composed of Astro components for each section: navbar, hero, about, experience, skills, hobbies, footer.

### Key directories

- `src/pages/` — Astro pages (file-based routing; `index.astro` is the only route)
- `src/layouts/` — `BaseLayout.astro` (`<html>`/`<body>` shell, font imports, favicon)
- `src/components/` — Section components (`Hero.astro`, `About.astro`, `Experience.astro`, `Skills.astro`, `Hobbies.astro`, `Navbar.astro`, `Footer.astro`, `SEO.astro`) and `icons/` (hand-written SVG icon components)
- `src/styles/globals.css` — Tailwind CSS 4 CSS-first config (`@theme inline`), OKLCH color tokens, custom keyframes/utility classes
- `src/assets/` — Build-time-optimized images (processed via `astro:assets`)
- `src/lib/utils.ts` — `cn()` helper combining clsx + tailwind-merge
- `public/` — Static files served as-is (favicon, robots.txt, a stable copy of the hero photo for OG/Twitter meta tags)

### Patterns

- **Path alias**: `@/*` maps to `./src/*`
- **Interactivity**: The only client-side JS is a vanilla `<script>` in `Navbar.astro` (scroll-shadow effect + mobile menu toggle) — no UI framework/island is used anywhere on the site
- **Animations**: Pure CSS — load-triggered `@keyframes` with staggered `animation-delay`, and scroll-triggered animation via `@supports (animation-timeline: view())` (progressive enhancement; content is always visible without it). No animation library is used.
- **Styling**: Tailwind CSS 4 wired via `@tailwindcss/vite` in `astro.config.mjs`, with CSS custom properties (OKLCh color space) in `src/styles/globals.css`. No dark mode exists on this site.
- **Fonts**: Self-hosted via `@fontsource-variable/urbanist` and `@fontsource-variable/manrope`, imported in `BaseLayout.astro`
- **SEO**: `src/components/SEO.astro` renders title/meta/OG/Twitter tags per-page; JSON-LD Person schema is inlined in `src/pages/index.astro`; sitemap is auto-generated at build time via the `@astrojs/sitemap` integration
- **Node version**: v24.13.1 (specified in `.nvmrc`)
