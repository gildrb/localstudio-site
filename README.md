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
pnpm design:check
pnpm lint
pnpm build
pnpm test
pnpm preview
```
