# [Local Studio web](https://localstudio-web.vercel.app/)

## Design

Read the [`ls-designmd` system](https://github.com/gildrb/ls-designmd/blob/main/design.md) before changing the landing page, embedded Local Studio UI, hero demo, or product showcase.

## Run

```sh
corepack enable
pnpm install --frozen-lockfile
pnpm exec playwright install chromium
pnpm dev
```

## Check

```sh
pnpm check
pnpm build
pnpm test
pnpm preview
```

`pnpm check` runs lint, TypeScript, context/graph reports, generated-style drift, design-manifest, and asset-manifest checks.

Optional:

```sh
pnpm context:bundle
pnpm reproducible:check
```

Playwright Chromium needs system libraries. This NixOS host is missing `libnspr4.so`.
