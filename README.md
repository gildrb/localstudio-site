# localstudio.ai

Read the [`agents-localstudio` product-design system](https://github.com/gildrb/agents-localstudio/tree/main/.agents/skills/product-design) before changing the landing page, embedded Local Studio UI, hero demo, or product showcase. All authored interface styling uses strongly typed StyleX tokens and extracted atomic CSS.

### Run

```sh
corepack enable
pnpm install --frozen-lockfile
pnpm exec playwright install chromium
pnpm dev
```

### Check

A clean checkout must pass:

```sh
corepack enable
pnpm install --frozen-lockfile
pnpm check
pnpm context:bundle
pnpm build
pnpm bundle:check
```

`pnpm check` runs lint, TypeScript, context and graph gates, leftover-path checks, design-manifest, asset-manifest, vercel-header drift, generated `index.html`, and browser-free unit tests.

Optional:

```sh
pnpm test
pnpm reproducible:check
pnpm preview
```

`pnpm test` needs Playwright Chromium. This NixOS host cannot launch it.
Ubuntu CI installs Chromium and runs `pnpm test` plus `pnpm test:visual`.
Record the first visual snapshots on Ubuntu with `pnpm test:visual --update-snapshots`, then commit `tests/visual`. Non-Linux hosts skip this Linux-only suite.
