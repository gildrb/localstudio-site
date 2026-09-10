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
`vp run validate` checks domain manifests, architecture, assets, and shaders.

`vite.config.ts` owns the frontend toolchain. The official StyleX Vite plugin
extracts atomic CSS; the official WGSL Vite plugin resolves shader imports.
Vite serves development modules with React Fast Refresh and StyleX HMR. Use
`vp dev --host 0.0.0.0` for LAN access.

The production build writes `dist/`, including a prerendered homepage, generated
agent documents, public assets, and a Vite chunk manifest. Application middleware
adds API responses, Markdown negotiation, redirects, and 404s to Vite dev and
preview. Vercel retains its function handlers and generated routing configuration.
Production JavaScript source maps remain disabled; Vite supplies development maps.
Only `VITE_`-prefixed environment variables are exposed to browser code; secrets
stay server-side. The app uses `import.meta.env.PROD` for production behavior.

Browser checks use Playwright: `vp run test:e2e` and `vp run test:visual`.
Outside CI, start `vp preview` yourself on port 4173 first. Agents must not start
local servers or server-dependent browser checks; see `AGENTS.md`.

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
