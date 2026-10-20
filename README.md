# localstudio.ai

## Development

Install [Vite+](https://viteplus.dev/guide/), then run:

```sh
vp install
vp dev
```

Vite+ selects pnpm by default. `.node-version` pins Node.js. Commit
`pnpm-lock.yaml` after dependency changes; CI uses `vp install --frozen-lockfile`.

## Checks and production

```sh
vp check
vp test
vp run validate
vp build
vp preview
```

`vp check` runs Oxfmt, Oxlint, and native TypeScript checks. Use `vp fmt` to format
and `vp check --fix` for safe fixes. Vitest runs the existing unit suite.
`vp run validate` checks generated domain/deployment files, assets, meshes, and every authored shader.
After a build, `vp run styles:check --dist` checks the StyleX source/output contract.
`vp check` keeps correctness/type failures fatal and a small review-only warning set;
it does not enforce broad readonly, line-count, or stylistic refactors.
See [the tooling audit](docs/tooling-audit.md) for measured timings and validation limits.

`vite.config.ts` owns the frontend toolchain. The official StyleX Vite plugin
extracts atomic CSS; the official WGSL Vite plugin resolves shader imports.
Vite serves development modules with React Fast Refresh and StyleX HMR. Use
`vp dev --host 0.0.0.0` for LAN access.

The production build writes `dist/`, including a prerendered homepage, generated
agent documents, public assets, Cloudflare `_headers`/`_redirects` rules, and a
Vite chunk manifest. Application middleware adds API responses, Markdown
negotiation, redirects, and 404s to Vite dev and preview.
Production JavaScript source maps remain disabled; Vite supplies development maps.
Only `VITE_`-prefixed environment variables are exposed to browser code; secrets
stay server-side. The app uses `import.meta.env.PROD` for production behavior.

Browser checks use Playwright: `vp run test:e2e` and `vp run test:visual`.
Outside CI, start `vp preview` yourself on port 4173 first. Agents must not start
local servers or server-dependent browser checks; see `AGENTS.md`.

## Deployment

Production runs on Cloudflare Workers with static assets (Worker `localstudio`):

```sh
vp run deploy
```

`vp run deploy` builds `dist/` and runs `wrangler deploy`. `worker/index.ts` handles
the API (`worker/api.ts`), `/.well-known/mcp`, 308 redirects, and `Accept: text/markdown`
negotiation; every other path is a static asset. `scripts/cloudflare-config.ts` is the
single source for `wrangler.jsonc`, `worker/routes.ts` (both committed; regenerate
with `vp run cloudflare:manifest`) and the build-emitted `_headers`/`_redirects`.
`vp run validate` fails when the committed outputs are stale.

## Asset generation

Run the snapshot commands from the repository root:

```sh
vp run snapshot
vp run snapshot:atmosphere
vp run snapshot:loading-layers
```

Vite+ packages headless renderer scripts with the official WGSL plugin before
Node.js executes them. These commands need a supported WebGPU backend. Mesh
commands remain in the renderer workspace, for example
`vp run --filter @local-ai/logo-renderer generate`.

### Acknowledgements

The renderer and model is built with heavy inspiration from https://eve.dev. We thank the creators of Vercel for their talents and design sense.
