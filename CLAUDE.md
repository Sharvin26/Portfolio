# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server (localhost:3000)
npm run build    # Production build
npm start        # Start production server
npm run lint     # ESLint
```

No test framework is configured.

## Architecture

This is a personal portfolio site built with **Next.js 15** (App Router), **React 19**, **TypeScript**, and **Tailwind CSS 4**.

The entire site is a single-page layout rendered from `src/app/page.tsx` (a client component using `"use client"` for Framer Motion animations). Sections: header/navbar, hero, about, experience, skills, hobbies, footer.

### Key directories

- `src/app/` — Next.js App Router (layout, page, globals.css)
- `src/components/ui/` — Shadcn UI components (badge, button, card) using class-variance-authority (CVA) for variants
- `src/components/icons/` — Custom SVG icon components (GitHub, LinkedIn, Twitter)
- `src/components/` — Domain components (`experience-item.tsx`, `skill-card.tsx`)
- `src/lib/utils.ts` — `cn()` helper combining clsx + tailwind-merge

### Patterns

- **Shadcn UI**: Components configured via `components.json` (new-york style, Lucide icons, RSC-aware). Uses Radix UI primitives under the hood.
- **Path alias**: `@/*` maps to `./src/*`
- **Animations**: Framer Motion with `whileInView` scroll-triggered animations and staggered fade-ins
- **Styling**: Tailwind CSS 4 with CSS custom properties (OKLch color space), dark mode via `.dark` class
- **Node version**: v24.13.1 (specified in `.nvmrc`)
