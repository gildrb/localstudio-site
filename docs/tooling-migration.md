# Frontend tooling migration

## Status

The frontend/tooling migration is implemented with Vite+ 0.3.1, Vite 8.2.2,
Rolldown 1.2.7, Vitest 4.1.11, Oxlint 1.81.0, Oxfmt 0.66.0, and native
TypeScript checking. Node.js is pinned to 24.21.0. Vite+ selects pnpm by default
(12.3.4 in this validation); there is no package-manager declaration forcing
another runtime.

**Validation is not fully green.** Five unchanged application test failures
remain. Dev/HMR, production preview, browser compatibility, visual checks,
and an actual Vercel deployment require user-started servers or CI.

## Files deleted

```text
bun.lock
oxlint.config.ts
packages/logo-renderer/scripts/bun-hooks.mjs
scripts/build.mjs
scripts/bun-plugins.mjs
scripts/prerender.mjs
scripts/serve.mjs
scripts/stylex-check.mjs
tests/unit/build-watch.spec.ts
tests/unit/serve.spec.ts
```

The two deleted test files contain seven tests for removed custom compiler,
watcher, and server APIs. Their polling/retry/process behavior is deliberately
replaced by Vite, not kept behind aliases. Application test assertions remain
unchanged. Imports, filesystem access, fixture type diagnostics, and the mock
module import were migrated. No new tests were added.

## Files added

```text
.node-version
docs/tooling-migration.md
pnpm-lock.yaml
pnpm-workspace.yaml
scripts/check-styles.mjs
scripts/site-plugin.ts
src/entry-server.tsx
tests/tsconfig.json
vite.config.ts
```

## Major files changed

| Area           | Files and changes                                                                                                                                                                |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Toolchain      | Root/workspace package manifests, TypeScript project references, `.github/workflows/quality.yml`, `AGENTS.md`, `.mcp.json`, `.gitignore`, `README.md`                            |
| App entry      | `src/main.tsx`, `src/env.d.ts`, `src/styles/stylex-entry.css`, `src/sections/sponsor-logos.ts`; native Vite raw imports and one font registration source                         |
| Production     | `scripts/vercel.mjs`, `vercel.json`, `scripts/reproducible.mjs`, `scripts/verify-generated.mjs`; deployment bootstrap and deterministic outputs                                  |
| Domain checks  | `scripts/{assets,bundle,context,design-manifest,graph,index-html}.mjs`, `architecture.json`, `design-manifest.json`; Node execution, workspace declarations, Vite manifest graph |
| Renderer/tests | Existing renderer generator scripts, Playwright configuration, and existing unit imports/types; official WGSL plugin and native Vite+ packaging                                  |

Oxfmt also reformatted authored TS/TSX/JS/JSON files. Captured browser artifacts
and vendored lint code are excluded; their formatting-only changes were undone.
Application logic, source shaders, and public binary assets were not redesigned.

## Dependencies

| Change                 | Dependencies                                                                                                                                                                  |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Removed                | Standalone root `oxlint@1.78.0`; workspace `typescript@6.0.3` declarations whose standalone commands were removed                                                             |
| Added at root          | `vite-plus@0.3.1`, canonical `vite` alias to `@voidzero-dev/vite-plus-core@0.3.1`, `@vitejs/plugin-react@6.1.1`, `yaml@2.9.0`, `vgpu@0.3.1` for existing test types/mock      |
| Added in renderer      | `@vgpu/wgsl@0.3.1`, `@vgpu/wgsl-std@0.3.1`, `pngjs@7.0.0`, `vite-plus@0.3.1`, matching Vite core alias                                                                        |
| Moved/aligned          | Root `@vgpu/wgsl` is dev tooling; `@oxlint/plugins` aligns to Vite+'s 1.79.0 SDK                                                                                              |
| Retained intentionally | React/React DOM/Motion/StyleX, `phase`, `vgpu`, mesh generator dependencies, Playwright, type packages, and root TypeScript (the Vite core TypeScript peer/project toolchain) |

Vite+, not direct tool dependencies, supplies Vitest, Oxlint, Oxfmt, and native
typechecking. The official StyleX Vite plugin remains `@stylexjs/unplugin@0.19.0`.
The existing vgpu patch now lives in `pnpm-workspace.yaml`. Native installation
scripts are explicitly allowed for the GPU packages and esbuild; the unrelated
`phase` dependency git-hook installation is denied. Vite's intentional alias
version is declared in peer rules; no second upstream Vite copy is installed.

Dependency/import inventory: zero unused root dependencies, zero workspace
package declaration gaps, and zero unresolved imports. Workspace compiler
executables were removed after a separate manifest audit. No obsolete frontend
tooling configuration remains. Four baseline application files remain outside
the import graph; see Known failures rather than treating this as a clean
whole-application dead-code audit.

## Commands

| Old command                                              | New command                                                                    |
| -------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `bun install [--frozen-lockfile]`                        | `vp install [--frozen-lockfile]`                                               |
| `bun run dev`, `dev:lan`, `preview`                      | `vp dev`, `vp dev --host 0.0.0.0`, `vp preview`                                |
| `bun run build`                                          | `vp build`                                                                     |
| `bun run check`, `bun run lint`, standalone typecheck    | `vp check`, `vp lint`, `vp check --no-fmt --no-lint`; formatting uses `vp fmt` |
| `bun test tests/unit`, old browser `test`, `test:visual` | `vp test`, `vp run test:e2e`, `vp run test:visual`                             |

Domain scripts use `vp run <name>` and execute Node.js. They are separate from
canonical `vp check`/`vp build`; `vp run validate` runs the domain checks.
Headless commands are `vp run snapshot`, `vp run snapshot:atmosphere`, and
`vp run snapshot:loading-layers`. `vp pack` compiles their renderer code through
the official WGSL plugin. The loading-layer generator retains its existing
application-specific shader-mask clone using the native pack API, not a custom
loader or transform.

## Measured timings

Single process wall-time samples on this machine. Both fresh installations
started with all workspace `node_modules` directories absent. Package caches
were retained, so these are **warm-cache installs**, not network benchmarks.
The baseline is isolated git revision `43a04322dcb3d7940031267b7c1fb7fc4936c79f`.

| Operation            | Before, seconds | After, seconds | Result/limits                                                                                               |
| -------------------- | --------------: | -------------: | ----------------------------------------------------------------------------------------------------------- |
| Fresh frozen install |           1.120 |          0.392 | Both pass                                                                                                   |
| Check                |          26.339 |          3.453 | Before fails context budget; after passes. Different scope: old check also runs package/shader/domain steps |
| Unit tests           |           0.615 |          2.014 | Before 104 pass / 6 fail; after 98 pass / 5 fail; seven removed tooling tests explain count change          |
| Dev start/HMR        |         Not run |        Not run | Local server startup is prohibited for agents                                                               |
| Production build     |          46.621 |          7.316 | Both pass. Old command includes type/shader/source checks; `vp build` is build/prerender only               |

The old bundle-only step reported 4.548 seconds, separate from its full command.
No speedup claim is made for unlike check/build workloads. Preview startup is
also unmeasured. Native renderer packaging passed, but GPU snapshot rendering
was not run. The optional `intro:coverage:check` requires capture and approved
reference directories containing `0.9-intro.png` and `0.9-surface.bin`. Those
inputs are not present; an argument-free invocation correctly rejects them.
This image comparison is blocked, not a passed rendering check.

## Validation evidence

| Gate                                       | Result                                                                                     |
| ------------------------------------------ | ------------------------------------------------------------------------------------------ |
| Empty-state `vp install --frozen-lockfile` | PASS; final workspace graph, default pnpm                                                  |
| `vp check`                                 | PASS; zero errors and 3,297 advisory lint warnings                                         |
| `vp test`                                  | FAIL; exactly five matching baseline application failures, no migration-only failures      |
| `vp build`                                 | PASS; client bundle plus homepage SSR                                                      |
| `vp run generated:check`                   | PASS; generated documents/config/assets deterministic and current                          |
| `vp run styles:check --dist`               | PASS; one linked production CSS asset, no legacy style framework                           |
| `vp run reproducible:check`                | PASS; two builds produce identical hashes for all 106 output files                         |
| WGSL and renderer packaging                | PASS; 55 shaders checked, official `vp pack` output keeps native GPU dependencies external |
| Structured review                          | PASS; Codex review found no accepted/actionable migration defects                          |
| Dev/HMR, preview, E2E/visual, deployment   | NOT RUN; no local server was started and no deployment was made                            |

Production evidence is stronger than just a successful exit:

1. All 100 common non-homepage/static outputs are byte-identical to baseline,
   including public assets and generated agent documents.
2. Homepage text and all 1,452 element names are preserved. HTML serialization,
   React text-boundary comments, chunk names, and hashes are not byte-identical.
3. The original 90,868-byte StyleX stylesheet is an **exact suffix** of the new
   91,158-byte CSS asset. Only the two required font-face declarations precede it.
4. All 891 SSR atomic classes have selectors in the linked hashed stylesheet.
   No compile-only StyleX runtime calls or old reload markers remain in bundles.
5. Actual lazy route boundaries remain DownloadPage and MachinePage. Production
   source maps remain off; Vite supplies development maps. The modern browser
   target remains unpolyfilled; browser execution is not claimed as verified.

The only authored CSS file contains application-required `@font-face` rules.
Global reset/component styling stays in StyleX. There is no authored legacy
utility CSS framework. Unit tests omit browser-only plugins because they do not
execute StyleX APIs; this avoids the official browser plugin's HTTP-lifetime
interval in Vitest's serverless module runner. The WGSL plugin remains active.

## Known failures and exact preservation limits

The five unit failures were reproduced before migration:

- Two ProductStory assertions expect 300 ms/stationary crossfades, while the
  current application intentionally uses a 500 ms blur transition.
- One color-policy assertion rejects existing mask gradient color literals.
- Two asset assertions reject an unregistered old atmosphere PNG and missing
  dimensions for an existing WebP.

No assertions were weakened and the current application behavior was not
changed to satisfy stale expectations. Consequently, the requested passing
`vp test` validation remains outstanding.

The old context gate already exceeded its source/test budgets. The final check
reports 138,283 tokens against an operating limit of 103,000 and hard limit of
105,000; its test category is also over budget. The import-graph
gate still identifies these baseline files: `src/components/MediaFrame.tsx`,
`packages/logo-renderer/src/renderer/render/intro-material.ts`, its
`shaders/glass/intro-material.wgsl`, and `shaders/postprocess/intro-atmosphere.wgsl`.
The intro-material TypeScript file is read by an existing source-inspection test;
none were deleted to disguise baseline debt. The old initial-JS size limit also
already failed: baseline eager JS is 287,696 gzip bytes versus 122,880 allowed;
current eager JS is 281,216 gzip bytes. Both values use the project gates with
Node.js `gzipSync` defaults and the actual static-import closure. Budgets were
not raised, so `vp run validate` and `vp run bundle:check` are not claimed green.

Vite replaces old development retry pages, filesystem stamps, child rebuild
processes, and polling reload behavior with its own server/HMR semantics.
The removed seven tests do not prove Vite HMR; that needs a real browser check.
Fonts now have a single required stylesheet declaration rather than duplicated
SSR/JavaScript registration. App-specific API/docs/routing is retained as Vite
middleware; preview also exposes the already-deployed MCP handler instead of the
old local server's incomplete API emulation. Actual remote deployment and browser
behavior still need verification.

## Remaining runtime-name references

There are no executable Bun references in frontend/tooling source, manifests,
lockfiles, CI, or current development instructions. Thirteen mentions on eleven
lines remain in four application content files because they describe the **separate Local
Studio desktop product's controller**, not this website's toolchain:

```text
src/agent/markdown.ts
src/content/setup-prompt.txt
src/pages/DocsPage.tsx
src/pages/ResourcesPage.tsx
```

This migration report also contains historical command/file names because the
requested before/after inventory requires them. These are documentation only.

## Evidence locations

Detailed baseline: `/tmp/site-localstudio-before-report.md` and `.json`.
Full command logs: `/tmp/site-localstudio-before-logs/` and
`/tmp/site-localstudio-final-*.log`. Output inventory:
`/tmp/site-localstudio-after-inventory.json`. Dependency/generator detail:
`/tmp/site-localstudio-utilities-report.md`.

## User-run server validation

1. Start `vp dev` manually. Open the homepage and direct route URLs. Check the
   hero, navigation, theme controls, and both lazy route pages.
2. Edit a UI component and a StyleX rule, then restore the edits. Verify React
   Fast Refresh, stylesheet updates, and error recovery in the browser.
3. Run `vp build`, then start `vp preview` on port 4173. Check homepage hydration,
   fonts, route navigation, Markdown negotiation, API responses, and real 404s.
4. With preview running, run `vp run test:e2e` and `vp run test:visual` yourself.
   Check the existing browser and visual expectations without updating snapshots
   merely to make the migration pass.
5. Use a Vercel preview deployment to verify the same routes, redirects, headers,
   agent documents, and API/MCP handlers in the actual deployment environment.

Next: start `vp dev` manually and supply its URL. No local HTTP server or
server-dependent Playwright command was started by an agent.
