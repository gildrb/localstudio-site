# Vite+ typing, maintainability and performance audit

## Result

Every authored JavaScript/TypeScript source is now TypeScript in a strict project.
There are no remaining authored JS/MJS entrypoints. `vp check` reports **0 errors
and 10 review warnings across 223 files**. A forced TypeScript build passes all
eight referenced projects. No explicit `any`, fake ambient declarations, casts
through `any`, or new diagnostic suppressions were introduced.

The first migration's green exit status did not prove full type coverage. Tooling,
API handlers and JS tests were outside the TypeScript projects. Of 1,985 unsafe
warnings, 1,931 were in JS/MJS and 943 involved unresolved internal error types.
A broad lint preset also added large amounts of style advice. The correction is
real project coverage and validated boundaries, not hundreds of readonly wrappers.

The latest scope prioritizes maintainability, measured latency, and a small
high-signal warning set. It supersedes the cancelled blanket zero-warning cleanup.
Existing assertions, snapshots, renderer algorithms and animation timing remain.

## Final matched-version measurements

Seconds: **median (minimum–maximum)**, five paired samples per cell.

| Operation / cache mode     | Before              | After               |
| -------------------------- | ------------------- | ------------------- |
| install / fresh-warm-cache | 0.354 (0.291–0.435) | 0.319 (0.298–0.469) |
| check / cold-project       | 3.445 (3.331–3.570) | 2.498 (2.443–2.587) |
| check / warm               | 3.448 (3.344–3.517) | 2.552 (2.499–2.584) |
| test / cold-project        | 2.044 (1.970–2.777) | 1.930 (1.865–1.990) |
| test / warm                | 2.053 (2.010–2.115) | 1.914 (1.878–2.705) |
| build / cold-project       | 7.120 (7.017–7.323) | 7.088 (6.934–7.173) |
| build / warm               | 7.091 (6.889–7.167) | 7.179 (7.003–7.184) |

Warm check median improved by 26%; warm unit median by 7%. The test ranges overlap,
so not every run is faster. Install ranges overlap. Build times are effectively
unchanged. These are end-to-end workflow results, not a claim that the compiler
itself became 26% faster: the check workload now has fewer noisy rules and more
real authored-source type coverage.

The before snapshot uses completed-migration source at `ce2a5c4`, with common
dependencies upgraded to the final versions. Both sides use Node 24.21.0, Vite+
0.3.1, pnpm 12.3.4, React 19.3.0, TypeScript 7.0.2 and vgpu 0.4.1, with the same
vendor declaration patches. Added validation/types dependencies and removed
obsolete dependencies are part of the implementation, not hidden version drift.

All 70 final samples ran serially, with alternating before/after order. Fresh
installs remove root and workspace node_modules but retain the warm package store.
Cold-project checks clear project Vite/TS/SSR caches; cold builds also remove dist.
OS, global Node and package-store caches are not flushed. No cold-network install
claim is made. The observed one-minute load range was 1.29–7.91 on 16 logical CPUs.
Every install/check/build passed. Every unit sample retained 98 passes and the
same five failures across 103 tests. Test isolation was not changed.

The initial loaded-host batch (load 22–28) is not a valid speed comparison: the
unchanged test workload later dropped from a 5.412s median to a 2.216s control run
when contention fell. An initial matched batch also exposed a formatting
short-circuit and the sponsor import integration gaps. It was rejected, repaired,
and rerun with preflight checks and fail-fast workload guards. None of those failed
samples appears in the final timing table.

## Isolated optimization and test profiling

The retained optimization is canonical `lazyPlugins`. Heavy StyleX, React and
site-plugin imports are dynamic inside the existing VITEST guard. WGSL remains
active. No custom loader, argument sniffing, pool change or assertion shortcut.

Five alternating paired samples per operation, on the original dependency set and
otherwise identical source/policy, gave:

| Operation | Eager config median (range), seconds | Lazy config median (range), seconds |
| --------- | ------------------------------------ | ----------------------------------- |
| test      | 2.007 (1.931–2.212)                  | 1.827 (1.761–2.292)                 |
| check     | 3.435 (3.377–3.460)                  | 2.890 (2.863–2.914)                 |
| build     | 6.877 (6.798–6.987)                  | 6.842 (6.798–6.916)                 |

All 106 output hashes matched in the isolated lazy experiment. The build difference
is noise. The tests retained the same 103 cases and five failures. Config shape
alone changed the old warning count from 3,297 to 3,295 in that experiment.

A three-file direct renderer import experiment was rejected: barrel median 1.791s
(range 1.765–2.329), direct median 1.765s (1.721–1.823). The small difference did not
justify extra application refactoring. No assertion or isolation weakening was
used to chase the historical approximately 0.6s Bun result. That historical runner
comparison also had different test populations: seven tests for deleted tooling
were removed by the completed migration, not by this audit.

Profiling used two launcher/main and 21 isolated worker CPU profiles, plus separate
startup and transform probes. A diagnostic measured API import 206ms, initialization
including config 263ms, discovery 6.4ms and shutdown 7.9ms; a separate debug run
measured config loading at 223ms. Eager Babel/StyleX evaluation was visible.

Serial transform instrumentation measured 21.4ms in TS/JSX syntax hooks, 163.2ms in
WGSL hooks and 61.1ms in import analysis. Semantic TypeScript checking is OFF in
`vp test`. Worker timings overlap and cannot be added as wall-clock fractions.
Large mesh deep-equality comparisons accounted for about 58–65% of non-idle samples
in the expensive workers. Existing comparisons were kept intact. Sampling does
not fully account for native Rust/Oxc/Rolldown CPU work. No inspector or HTTP
listener was opened.

## High-signal typing and warnings

The root references application, Node/config, demo UI, renderer, tests, scripts,
API and renderer-script projects. They all use strict typing, checked indexed
access and exact optional properties, directly or through inheritance. Node/tooling
projects skip third-party declaration interiors; application/workspace projects
retain library checking. The dev SSR boundary validates the imported render
function and its string result instead of pulling browser code into Node globals.

Important unsafe assignment/call/member/argument/return rules, explicit-any and
floating-promise rules are fatal. Broad pedantic, deep-readonly, line-count and
scope advice are not global gates. Standard guarded `unknown` is allowed. Valid
JSON-RPC `String(body.method)` behavior and the calibrated APCA exponent 1.414 remain.

The remaining warnings are deliberately visible:

- Eight unsafe assertions in existing CPU-only partial GPU fixtures. They are not
  unvalidated network/domain casts; replacing them with large fake implementations
  was not justified by this audit.
- One renderer effect captures `viewportAspect` and `staticPose`. They were sampled
  on renderer restart, not restart triggers. Blindly adding dependencies could
  restart GPU ownership and change behavior.
- One async clipboard click handler. The fallback is preserved; wrapping the call
  in `void` would not handle a rejection and was not treated as a fix.

| Rule                                                | Original migration | Upgraded before | After |
| --------------------------------------------------- | -----------------: | --------------: | ----: |
| `eslint/array-callback-return`                      |                  2 |               2 |     0 |
| `eslint/max-depth`                                  |                 22 |              22 |     0 |
| `eslint/max-lines`                                  |                 25 |              25 |     0 |
| `eslint/max-lines-per-function`                     |                 98 |              98 |     0 |
| `eslint/no-inline-comments`                         |                  3 |               3 |     0 |
| `eslint/no-loop-func`                               |                  1 |               1 |     0 |
| `eslint/no-negated-condition`                       |                  3 |               3 |     0 |
| `eslint/require-await`                              |                  1 |               1 |     0 |
| `eslint/require-unicode-regexp`                     |                105 |             105 |     0 |
| `eslint/sort-vars`                                  |                 17 |              17 |     0 |
| `import/max-dependencies`                           |                 13 |              13 |     0 |
| `react-hooks/exhaustive-deps`                       |                  1 |               1 |     1 |
| `react/exhaustive-effect-dependencies`              |                  3 |               3 |     0 |
| `react/no-unescaped-entities`                       |                  2 |               2 |     0 |
| `typescript/consistent-return`                      |                 28 |              28 |     0 |
| `typescript/no-base-to-string`                      |                  1 |               1 |     0 |
| `typescript/no-confusing-void-expression`           |                 78 |              78 |     0 |
| `typescript/no-deprecated`                          |                  6 |               6 |     0 |
| `typescript/no-misused-promises`                    |                  1 |               1 |     1 |
| `typescript/no-unnecessary-boolean-literal-compare` |                  1 |               1 |     0 |
| `typescript/no-unnecessary-type-conversion`         |                  1 |               1 |     0 |
| `typescript/no-unsafe-argument`                     |                109 |             109 |     0 |
| `typescript/no-unsafe-assignment`                   |                342 |             341 |     0 |
| `typescript/no-unsafe-call`                         |                595 |             595 |     0 |
| `typescript/no-unsafe-member-access`                |                847 |             847 |     0 |
| `typescript/no-unsafe-return`                       |                 83 |              83 |     0 |
| `typescript/no-unsafe-type-assertion`               |                  9 |               9 |     8 |
| `typescript/prefer-nullish-coalescing`              |                  2 |               2 |     0 |
| `typescript/prefer-readonly-parameter-types`        |                611 |             611 |     0 |
| `typescript/restrict-template-expressions`          |                  1 |               1 |     0 |
| `typescript/strict-boolean-expressions`             |                181 |             181 |     0 |
| `typescript/strict-void-return`                     |                  2 |               2 |     0 |
| `unicorn/consistent-assert`                         |                 26 |              26 |     0 |
| `unicorn/consistent-function-scoping`               |                  7 |               7 |     0 |
| `unicorn/escape-case`                               |                  2 |               2 |     0 |
| `unicorn/explicit-length-check`                     |                 15 |              15 |     0 |
| `unicorn/no-array-callback-reference`               |                  9 |               9 |     0 |
| `unicorn/no-hex-escape`                             |                  1 |               1 |     0 |
| `unicorn/no-lonely-if`                              |                  1 |               1 |     0 |
| `unicorn/no-negated-condition`                      |                  3 |               3 |     0 |
| `unicorn/no-useless-undefined`                      |                  5 |               5 |     0 |
| `unicorn/prefer-at`                                 |                  4 |               4 |     0 |
| `unicorn/prefer-code-point`                         |                  1 |               1 |     0 |
| `unicorn/prefer-dom-node-dataset`                   |                  4 |               4 |     0 |
| `unicorn/prefer-import-meta-properties`             |                  1 |               1 |     0 |
| `unicorn/prefer-number-coercion`                    |                  7 |               7 |     0 |
| `unicorn/prefer-query-selector`                     |                  2 |               2 |     0 |
| `unicorn/prefer-string-replace-all`                 |                 15 |              15 |     0 |

Totals: 3,297 originally; 3,296 in the upgraded before snapshot; 10 after. The
upgraded before difference includes the corrected StyleX factory declaration.
The unsafe cascades are removed through typed source and real boundaries, not
through turning off the unsafe rules.

## Deletions and necessary custom tooling

Against the completed migration, **22 obsolete tooling files / 2,935 lines /
96,271 bytes** were deleted: the 19-file, 2,221-line vendored anti-slop framework,
and `scripts/context.mjs`, `scripts/graph.mjs`, `scripts/verify-generated.mjs`.
Direct `@oxlint/plugins` and `yaml` dependencies were removed. Native Oxlint and
TypeScript replace the custom rule framework. Native `vp run` composes existing
generator check modes instead of copying the entire source tree.

Separately, the cancelled cleanup's 127 new application/demo/renderer/test helpers
were discarded and 144 originals restored to pre-task bytes before minimal safety
fixes were reapplied. Its renderer tooling was reduced from 23 modules / 2,216 lines
to nine / 1,802, deleting 14 style-driven helpers. API/tooling lost another 159 lines.
The temporary context-catalog helper was also discarded. These WIP reductions are
not counted again as deletions against the completed migration.

Necessary application tooling remains:

1. Vite site hooks and SSR entry preserve prerendering, agent documents, API/MCP,
   Markdown negotiation, redirects, HEAD and real 404 behavior. These are application
   contracts, not a replacement server or bundler.
2. Design/asset/deployment/index and mesh generators preserve domain output. Existing
   check modes verify all generated files and exact meshes. Duplicate asset groups
   are now checked (zero current groups). Consumed architecture data remains.
3. StyleX source/emitted-CSS checks retain meaningful policy without arbitrary
   create/props/token minimums. Bundle checks retain eager-closure and lazy-route
   budgets. Reproducibility checks hash both uncached builds; CI reuses the second
   build rather than paying for an unnecessary third one.
4. The WGSL loop checks all 55 authored files because the installed vgpu CLI accepts
   one entry per call, not a directory/glob. Auto validation does not prove a GPU
   was available. Capture coverage still requires real reference/capture inputs.
5. Native pack retains headless rendering scripts and one substantive loading-layer
   runtime entry, with typed imports, native dependencies external, and the original
   shader-mask clone behavior. No runtime compatibility shim was added.

Valibot validates real JSON/import/history/glTF boundaries. Official pngjs and
Clipper declarations replace untyped usage; earcut owns its declarations. Vendor
patches only correct declarations: the existing vgpu optional-depth type, its
actually forwarded Node backend option, and StyleX's published Vite factory type.

## Preservation and final validation

Frozen install, `vp check`, forced `tsc --build`, generated checks, all 55 shader
entries, production build, native headless pack and StyleX source/output checks
pass. Two production builds match all 106 output files within the same checkout.
Across matched-version before/after snapshots, 101 of 103 common output paths are
byte-identical, including CSS and public assets. The changed common paths are the
Vite manifest and index HTML; JavaScript chunk names also change. Native WGSL output
embeds checkout paths, so cross-directory JavaScript hashes are not claimed equal.
The 1,485-element SSR tag sequence and all 69 inline SVG elements match.

The user's dev warnings exposed six explicit `/public/` raw SVG imports that a
build alone did not reject. The final native `#sponsor-svg` alias resolves to the
served `/images/sponsors` URL. It keeps one authoritative public file per logo,
unchanged URLs and inline SVG bytes, without changing assertions or weakening
import rules. The focused native-resolution review found no actionable issue.
After the measurements, the user separately requested 14px footer and actual navbar
text, excluding dropdown and mobile menu sizes. GitHub keeps its normal foreground
color and turns chrome gray on hover; Products, Resources and Company retain their
gray-to-foreground hover. These intentional UI changes are not part of the timing
or pre-change CSS-preservation comparison above. Tooling, assertions, snapshots,
spacing and hit-area dimensions are unchanged.

The user then requested Tabler Icons and a centered homepage CTA. The application
and demo UI now use `@tabler/icons-react` 3.46.0 instead of `lucide-react`. The
existing demo registry aliases native Tabler exports; no compatibility wrappers
were added. Purpose-built panel-state glyphs remain. “AI that stays yours” and its
CTA buttons now share the existing centered layout. These changes are explicitly
outside the frozen benchmark and pre-change SVG/CSS-preservation measurements;
the final dependency graph and glyph output therefore differ from that snapshot.
Tabler 3.46.0 still names ReactSVG, removed by React 19.3 types; a declaration-only
patch uses the native SVGElementTagNameMap owner instead. Runtime icon code and
strict library checking are unchanged.

The full structured independent review found no actionable findings (confidence
0.73). A read-only follow-up also cleared the final sponsor alias. Neither review
is browser/GPU runtime proof.

After all user UI and icon requests, a fresh check and forced TypeScript build pass;
the unit suite remains 98 passed / 5 known failures, and two builds match all 106
outputs. StyleX output and frozen install pass. A final structured UI/dependency
review also reports no actionable findings (confidence 0.78).

Remaining failures and limits are explicit:

- Five unchanged unit failures: 18 existing mask color literals; approved 0.5s versus
  expected 0.3s ProductStory timing; an existing blur property excluded by another
  expectation; unregistered hero-atmosphere-day.png; and missing WebP dimensions.
  No assertions or snapshots were changed to manufacture passing results.
- Eager JavaScript is 290,375 gzip bytes, above the unchanged 122,880-byte budget.
  The budget already failed before this audit. It was not raised or suppressed.
- `vgpu doctor` cannot render: libvulkan.so.1 and a Vulkan ICD are absent, yielding
  VGPU-NODE-NO-ADAPTER. Resolving a Dawn binary is not GPU availability. An initial
  `doctor --json` call was invalid; the corrected bare command emits JSON by default.
- Optional intro coverage lacks capture/reference inputs. Live browser, HMR,
  preview, Poros and actual deployment remain user-run/CI validation. No agent
  started a local HTTP server or ran server-dependent browser tests.

## Evidence

[Machine-readable results](tooling-audit-data.json) retain the 70 final samples,
cache/load method, dependency versions, both experiment summaries, complete warning
census, exact deleted-file inventory and validation outcomes. Full temporary logs,
23 CPU profiles and rejected batches are under
`/tmp/site-localstudio-viteplus-benchmarks`; validation logs are under
`/tmp/site-localstudio-audit-validation`. Temporary evidence may not survive reboot.
