<p align="center">
  <img src="public/icons/icon-192.png" width="96" height="96" alt="Family Planner" />
</p>

# Family Planner

**A simple, beautiful week planner for families — sync schedules, plan together, stay organized.**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![SQLite](https://img.shields.io/badge/SQLite-Drizzle-003B57?style=flat-square&logo=sqlite)](https://www.sqlite.org/)
[![Node](https://img.shields.io/badge/Node-20+-339933?style=flat-square&logo=nodedotjs)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

---

## Overview

Family Planner is a **7-day week calendar** built for couples and families. View husband and wife columns side by side, create **combined** events for family time, and use **A/B weeks** (e.g. alternating custody or shift plans). Everything is stored in a local **SQLite** database — no account required, runs on your machine or your server.

- **Dual columns** — Separate lanes for each partner plus combined events
- **Drag & drop** — Reschedule or reassign events by dragging on the grid
- **A/B week toggle** — Switch between two week templates (e.g. Week A / Week B)
- **Categories & colors** — General, Work, Sleep, Family Time, Own Time, plus custom categories
- **PWA-ready** — Install to your phone or desktop; runs fullscreen like an app
- **Dark mode** — System-aware theme with tuned colors for all categories

---

## Features

| Feature | Description |
|--------|-------------|
| **Weekly grid** | Monday–Sunday with hourly rows; zoom in/out for detail |
| **Husband / Wife / Combined** | Per-person columns and shared “combined” events |
| **Drag & drop** | Move events in time or between people with [@dnd-kit](https://dndkit.com/) |
| **Resize** | Drag the bottom edge of an event to change end time |
| **Categories** | Fixed (General, Own Time, Family Time, Work, Sleep) + custom with colors |
| **A/B weeks** | Toggle between two week plans; filter events by active week |
| **SQLite + Drizzle** | Single-file DB, type-safe with [Drizzle ORM](https://orm.drizzle.team/) |
| **PWA** | Web app manifest, installable, standalone/fullscreen on mobile and desktop |

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | [Next.js 16](https://nextjs.org/) (App Router, React 19) |
| Language | [TypeScript](https://www.typescriptlang.org/) |
| Styling | [Tailwind CSS](https://tailwindcss.com/) v4, [shadcn/ui](https://ui.shadcn.com/) (Radix) |
| Database | [SQLite](https://www.sqlite.org/) via [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) |
| ORM | [Drizzle ORM](https://orm.drizzle.team/) |
| Drag & drop | [@dnd-kit](https://dndkit.com/) |
| Icons | [Lucide](https://lucide.dev/) |

---

## Quick Start

**Prerequisites:** [Node.js](https://nodejs.org/) 20+ and npm.

```bash
# Clone and install (replace YOUR_USERNAME with your GitHub username)
git clone https://github.com/YOUR_USERNAME/familyplanner.git
cd familyplanner
npm install

# Optional: copy .env.example to .env.local to customize DATABASE_URL or PORT
# If you skip this, the app uses sqlite.db and port 3021 by default.
cp .env.example .env.local

# Initialize database and seed
npx drizzle-kit push
npx tsx src/db/seed.ts

# Run
npm run dev
```

Open **http://localhost:3021** in your browser.

---

## Project Scripts

| Command | Description |
|--------|-------------|
| `npm run dev` | Start dev server (port 3021) |
| `npm run build` | Production build |
| `npm run start` | Run production server |
| `npm run lint` | Run ESLint |
| `npm run generate-favicons` | Generate favicon + PWA icons (heart icon) |

---

## Environment Variables

Create `.env.local` in the project root (or copy from `.env.example` if you add one).

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `sqlite.db` | Path to SQLite file (relative or absolute) |
| `PORT` | `3021` | Server port for dev/start |

---

## Database Setup

1. **Push schema** (creates/updates tables):
   ```bash
   npx drizzle-kit push
   ```

2. **Seed data** (optional — fixed categories + sample events):
   ```bash
   npx tsx src/db/seed.ts
   ```

   For a fuller demo with A/B week events:
   ```bash
   npx tsx src/db/seed-plan.ts
   ```
   For generic showcase/demo data (screenshots, no personal data):
   ```bash
   npm run seed-showcase
   ```

---

## Production

1. **Build:**
   ```bash
   npm run build
   ```

2. **Environment:** Set `DATABASE_URL` to an absolute path (or a persistent volume path in Docker). Ensure the process can read/write the SQLite file. For correct SEO and Open Graph links when shared, set `NEXT_PUBLIC_APP_URL` to your public URL (e.g. `https://your-domain.com`).

3. **Run:**
   ```bash
   npm run start
   ```

4. **Icons (optional):** Regenerate favicon and PWA icons to match the header heart:
   ```bash
   npm run generate-favicons
   ```

The app includes a [web app manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest) and is installable as a PWA (Add to Home Screen / Install app).

---

## Project Structure

```
familyplanner/
├── src/
│   ├── app/                 # Next.js App Router (pages, API, layout, manifest)
│   ├── components/          # React components (planner grid, editor, UI)
│   ├── db/                  # Drizzle schema, DB client, seeds
│   ├── lib/                 # Constants, utils, compose-refs
│   ├── types/               # Shared TypeScript types (Event, Category)
│   └── hooks/               # useAsRef, useIsomorphicLayoutEffect, etc.
├── public/                  # Static assets, favicons, PWA icons
├── scripts/
│   └── generate-favicons.mjs
└── drizzle.config.ts
```

---

## License

MIT License. See [LICENSE](LICENSE) for details. You may use, copy, modify, and distribute this project under the terms of the MIT license.

---

<p align="center">
  <sub>Built with Next.js, React, TypeScript, Tailwind, SQLite & Drizzle</sub>
</p>
