# [Local Studio web](https://localstudio-web.vercel.app/)

## Design

Read the [`ls-designmd` system](https://github.com/gildrb/ls-designmd/blob/main/design.md) before changing the landing page, embedded Local Studio UI, hero demo, or product showcase.

## Run

```sh
pnpm install
pnpm exec playwright install chromium
pnpm dev
```

Production checks:

```sh
corepack enable
pnpm install --frozen-lockfile
pnpm check
pnpm build
pnpm test
pnpm preview
```

`pnpm check` runs lint, types, context/graph reports, and generated-style drift.
The first-party token gate stays report-only until copied Local Studio source is extracted.
