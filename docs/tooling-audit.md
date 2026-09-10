# Vite+ maintainability and performance audit

Status: integration validation and final matched-version benchmarks are in progress.
The latest request replaces the earlier blanket zero-warning cleanup. Application
behavior and all existing assertions remain the contract; no server was started.

## Measured decisions

Five paired, alternating-order samples per operation, same ce2a5c4 source and
original locked dependencies, show:

| Operation | Eager config median (range), seconds | Native lazy config median (range), seconds |
| --------- | ------------------------------------ | ------------------------------------------ |
| vp test   | 2.007 (1.931–2.212)                  | 1.827 (1.761–2.292)                        |
| vp check  | 3.435 (3.377–3.460)                  | 2.890 (2.863–2.914)                        |
| vp build  | 6.877 (6.798–6.987)                  | 6.842 (6.798–6.916)                        |

The build difference is noise. Every paired build produced the same106 file hashes.
Tests retained103 cases and the same98 passes/5 baseline failures. The lint policy
was unchanged in this experiment (3297 versus3295 warnings due to config shape).
The final source/dependency/policy workload is measured separately below.

Native `lazyPlugins` skips plugin imports during metadata-only checks and leaves
StyleX/React/site imports behind the existing VITEST guard during unit tests.
WGSL remains active; test isolation remains enabled. A three-file direct-import
experiment produced only a1.5% median difference with overlapping ranges and was
rejected; no extra renderer refactor was kept for that result.

## Where test time goes

The original ~0.6s Bun figure and ~2.0s Vite+ figure were single historical samples
with different test populations (seven obsolete tooling tests were removed by
the completed migration). They are not a controlled speed ratio. No Bun path was
reintroduced.

A35-sample initial batch ran under load22–28 on16 logical CPUs: warm check9.370s,
test5.412s, build14.569s, fresh warm-cache install1.269s. The unchanged unit suite
later took2.216s when load fell below2. This is contention, not an optimization.
Those high-load measurements are retained as evidence but not used for gains.

Source-aligned profiling separated:

- Startup/API import206ms, initialization including config263ms, discovery6.4ms
  for21 files, close7.9ms in one diagnostic. `vp node` probe51ms is not an exact
  subtraction control for `vp test`.
- Config-file bundle/evaluation223ms in a debug run. Babel/StyleX eager module
  evaluation appears in the main profile even though their test factories skip.
- TS/JSX syntax transform hooks21.4ms; WGSL hooks163.2ms; import-analysis61.1ms
  in a serial diagnostic. Semantic TypeScript checking is OFF in `vp test`.
- Worker imports/initialization repeat in21 isolated forks. Import/transform/test
  timing sums overlap and must not be added as wall-clock slices.
- Large mesh deep-equality assertions dominate costly workers: @vitest/expect
  equality accounts for58–65% of their non-idle samples. Tests and comparisons
  were not weakened. A serial isolated diagnostic was slower, not a speed fix.

Raw CPU profiles (2 launcher/main +21 workers), commands, exit statuses, load
records, and phase analysis are in `/tmp/site-localstudio-viteplus-benchmarks/`.
CPU profiles are sampling evidence, not complete native/process CPU accounting.
No inspector listener or HTTP server was opened.

## High-signal check

Correctness/suspicious rules and important unsafe/async rules are errors.
Broad pedantic, deep-readonly, line/import counts, scope advice, calibrated-number
heuristics and intentional coercion rules are not global gates. Standard safe
`unknown` narrowing is allowed. No explicit `any`, fake ambient declarations or
new suppressions were introduced. Strict authored source has project coverage.
Node/tooling configs skip checking third-party declaration interiors, avoiding
irrelevant optional Farm/Rspack/Webpack dependencies; authored code stays strict.

Latest integrated lint:0 errors/10 warnings. Eight warnings are existing CPU-only
GPU fixture assertions; one is an intentional navigation effect trigger; one is
the unchanged async clipboard event handler. These are review items, not an
excuse to redesign renderer ownership or remove the clipboard fallback.

| Rule                                                | Completed migration before | Current after |
| --------------------------------------------------- | -------------------------: | ------------: |
| `eslint/array-callback-return`                      |                          2 |             0 |
| `eslint/max-depth`                                  |                         22 |             0 |
| `eslint/max-lines`                                  |                         25 |             0 |
| `eslint/max-lines-per-function`                     |                         98 |             0 |
| `eslint/no-inline-comments`                         |                          3 |             0 |
| `eslint/no-loop-func`                               |                          1 |             0 |
| `eslint/no-negated-condition`                       |                          3 |             0 |
| `eslint/require-await`                              |                          1 |             0 |
| `eslint/require-unicode-regexp`                     |                        105 |             0 |
| `eslint/sort-vars`                                  |                         17 |             0 |
| `import/max-dependencies`                           |                         13 |             0 |
| `react-hooks/exhaustive-deps`                       |                          1 |             1 |
| `react/exhaustive-effect-dependencies`              |                          3 |             0 |
| `react/no-unescaped-entities`                       |                          2 |             0 |
| `typescript/consistent-return`                      |                         28 |             0 |
| `typescript/no-base-to-string`                      |                          1 |             0 |
| `typescript/no-confusing-void-expression`           |                         78 |             0 |
| `typescript/no-deprecated`                          |                          6 |             0 |
| `typescript/no-misused-promises`                    |                          1 |             1 |
| `typescript/no-unnecessary-boolean-literal-compare` |                          1 |             0 |
| `typescript/no-unnecessary-type-conversion`         |                          1 |             0 |
| `typescript/no-unsafe-argument`                     |                        109 |             0 |
| `typescript/no-unsafe-assignment`                   |                        342 |             0 |
| `typescript/no-unsafe-call`                         |                        595 |             0 |
| `typescript/no-unsafe-member-access`                |                        847 |             0 |
| `typescript/no-unsafe-return`                       |                         83 |             0 |
| `typescript/no-unsafe-type-assertion`               |                          9 |             8 |
| `typescript/prefer-nullish-coalescing`              |                          2 |             0 |
| `typescript/prefer-readonly-parameter-types`        |                        611 |             0 |
| `typescript/restrict-template-expressions`          |                          1 |             0 |
| `typescript/strict-boolean-expressions`             |                        181 |             0 |
| `typescript/strict-void-return`                     |                          2 |             0 |
| `unicorn/consistent-assert`                         |                         26 |             0 |
| `unicorn/consistent-function-scoping`               |                          7 |             0 |
| `unicorn/escape-case`                               |                          2 |             0 |
| `unicorn/explicit-length-check`                     |                         15 |             0 |
| `unicorn/no-array-callback-reference`               |                          9 |             0 |
| `unicorn/no-hex-escape`                             |                          1 |             0 |
| `unicorn/no-lonely-if`                              |                          1 |             0 |
| `unicorn/no-negated-condition`                      |                          3 |             0 |
| `unicorn/no-useless-undefined`                      |                          5 |             0 |
| `unicorn/prefer-at`                                 |                          4 |             0 |
| `unicorn/prefer-code-point`                         |                          1 |             0 |
| `unicorn/prefer-dom-node-dataset`                   |                          4 |             0 |
| `unicorn/prefer-import-meta-properties`             |                          1 |             0 |
| `unicorn/prefer-number-coercion`                    |                          7 |             0 |
| `unicorn/prefer-query-selector`                     |                          2 |             0 |
| `unicorn/prefer-string-replace-all`                 |                         15 |             0 |

## Deletions and retained tooling

Removed the19-file/2221-line vendored anti-slop framework and direct
`@oxlint/plugins` dependency. It duplicated partial type reasoning and blocked
valid unknown/typeof boundary guards. Native Oxlint and TypeScript replace its
useful safety intent.

Removed context token-budget/bundle machinery, direct YAML dependency, the
regex import-graph gate and whole-tree copying generated-output wrapper. Native
`vp run` composes existing generator check modes. It additionally checks duplicate
asset groups (current count0). This does not prove whole-file dead-code absence;
the four documented baseline unreachable files were not deleted to hide findings.
Architecture data consumed by the design manifest remains.

Discarded the cancelled cleanup's127 new app/demo/renderer/test helper files and
restored144 originals to exact pre-task bytes. Renderer scripts were reduced from
23 modules/2216 lines to9/1802 while retaining real TS types;14 style-driven helpers
were removed. API/tooling ports lost another158 lines of unnecessary scaffolding.
These are separate from deletions against the completed migration baseline.

Remaining custom tooling is application-specific:

- sitePlugin and SSR entry: agent documents, homepage prerender, content negotiation,
  API/MCP, redirects, HEAD and true404 behavior through public Vite hooks.
- Asset/design/deployment/index and mesh generators: authored domain/output contracts
  absent from generic frontend tooling, with existing read-only check modes.
- StyleX source/output check: source policy and emitted CSS, without arbitrary
  minimum create/props/token counts.
- Shader loop: checks all55 authored files; installed vgpu accepts one file per CLI
  call. GPU-auto validation is not proof a GPU was available. Capture-based coverage
  remains optional and needs reference/capture inputs.
- Bundle budgets and reproducibility: eager static-import closure/lazy routes and
  all-output hashing are not native chunk-size warnings. CI reuses the second
  reproducibility build rather than doing a redundant third build.
- A substantive loading-layer pack entry supports typed static imports and native
  pack while preserving shader-mask cloning/native dependency ownership.

Only declaration corrections are patched in dependencies: the existing vgpu
optional-depth owner, its Node backend option actually forwarded at runtime, and
StyleX's Vite factory return type. No runtime compiler/server/compatibility shim.

## Final validation and matched-version performance

Pending final recorded results. Do not treat this draft as a completion claim.
Known baseline limitations:5 unit failures, eager JS budget exceeded, missing GPU
adapter/Vulkan, missing optional capture inputs. Browser/HMR/preview/Poros and
actual deployment require user-run or CI validation and are not claimed here.
