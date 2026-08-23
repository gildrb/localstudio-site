# [Local Studio web](https://localstudio-web.vercel.app/)

## Design

The migration spec lives in [`ls-designmd/LS_WEB_REFACTOR_SPEC.md`](https://github.com/gildrb/ls-designmd/blob/sync/ls-web-canonical-routes/LS_WEB_REFACTOR_SPEC.md).
Read the [`ls-designmd` system](https://github.com/gildrb/ls-designmd/blob/main/design.md) before changing the landing page, embedded Local Studio UI, hero demo, or product showcase.

## Run

```sh
corepack enable
pnpm install --frozen-lockfile
pnpm exec playwright install chromium
pnpm dev
```

## Check

A clean checkout must pass:

```sh
corepack enable
pnpm install --frozen-lockfile
pnpm check
pnpm context:bundle
pnpm build
pnpm bundle:check
```

`pnpm check` runs lint, TypeScript, context and graph gates, leftover-path checks, design-manifest, asset-manifest, and browser-free unit tests.

Optional:

```sh
pnpm test
pnpm reproducible:check
pnpm preview
```

`pnpm test` needs Playwright Chromium. This NixOS host cannot launch it.
Ubuntu CI installs Chromium and runs `pnpm test`.
`pnpm test:visual` records route screenshots; generate them on Ubuntu with `--update-snapshots`.
