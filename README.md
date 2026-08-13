# Local Studio web

A self-contained recreation of the Local Studio public website, built with React, TypeScript, Tailwind CSS, Vite, and Motion. All Local Studio routes and cross-page navigation run locally; only GitHub and KittyLitter remain external.
## Run

```sh
pnpm install
pnpm exec playwright install chromium
pnpm dev
```

Production checks:

```sh
pnpm lint
pnpm build
pnpm test
pnpm preview
```

## Structure

- `src/components` — reusable navigation, links, icons, and brand elements
- `src/pages` — local route implementations
- `src/sections` — homepage sections
- `src/styles/global.css` — legacy homepage primitives and Tailwind import
- `public/images` — locally served product imagery
- `public/fonts` — local Geist font assets
