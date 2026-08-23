# `ls-web` canonical functional refactor specification

## 0. Contract

Refactor `gildrb/ls-web` from the audited `main` state at commit `8a26cb837a57db111b43df463197a38b839386d6` into a deterministic, strongly typed, functionally organized React website whose complete first-party implementation context remains below 100,000 model tokens.

The contractual operating target is **90,000 tokens**, with an 80,000-token warning threshold and a non-negotiable 100,000-token ceiling. The 10,000-token reserve prevents normal maintenance from immediately violating the requirement.

The final system must satisfy all of the following:

1. One canonical semantic representation owns each fact, route, content unit, asset, motion recipe, design token, release value, and demonstration state.
2. React, Markdown, sitemap, machine-readable pages, discovery files, navigation, metadata, preload hints, redirects, and tests derive from canonical values instead of repeating them.
3. Pure functions own domain transformations and state transitions. Browser, React, network, clipboard, timer, observer, history, and WebGPU operations remain explicit boundary effects.
4. TypeScript rejects invalid states and unhandled variants. `any`, unchecked external data, accidental widening, unsafe assertions, and duplicated hand-written unions are prohibited.
5. Shared React components are retained only when they have multiple consumers or own a real semantic, behavioral, accessibility, performance, or styling invariant.
6. Product demonstrations reuse an intentional, versioned Local Studio demonstration package. They must not embed a partial fork of the Local Studio application.
7. Generated files are generated. They are not edited manually and are not committed unless a platform requires a small generated manifest before build; any such exception must be hash-verified and documented in the architecture allowlist.
8. The separate `ls-designmd` repository remains the documentation authority for design intent. It must reference semantic IDs and generated implementation evidence rather than hand-copying implementation values.
9. Two clean builds from the same commit, lockfile, toolchain, and environment produce equivalent manifests and hashes.
10. Every surviving file, export, dependency, component, token, asset, route field, test, and exception has a mechanically verifiable consumer or rationale.

This specification uses lambda calculus, functional programming, and HVM2 as architectural guidance, not as a false claim that React or TypeScript becomes an interaction-net evaluator. The useful translation is:

- **abstraction:** small functions and components with explicit inputs;
- **application/composition:** build behavior by composing functions rather than mutating shared state;
- **reduction:** transform canonical values into derived views through deterministic local rules;
- **normalization:** canonicalize paths, content, state, and effects once;
- **small IR plus interpreters:** author one semantic model and compile it into React, Markdown, XML, JSON, headers, and tests;
- **locality:** adding one route or feature requires one canonical entry and bounded downstream derivation;
- **atomic ownership:** each concern has one owner and does not require synchronized edits across unrelated files.

Do not imitate HVM syntax, claim formal optimality, replace readable names with compressed symbols, or force every DOM operation into an abstract effect algebra. “Hyper-optimized” here means minimal first-party context, no semantic duplication, bounded changes, exhaustive types, deterministic derivation, and deliberate runtime behavior.

## 1. Scope and fixed decisions

### 1.1 In scope

- React route composition and routing.
- TypeScript type architecture.
- Tailwind and CSS ownership.
- Motion recipes and reduced-motion behavior.
- Homepage hero and product-story demonstrations.
- Local Studio product UI reuse.
- WebGPU logo renderer ownership.
- Static content, Markdown twins, agent discovery, sitemap, machine page, headers, and redirects.
- Tests, build scripts, context tooling, graph tooling, CI, dependency pinning, assets, and reproducibility.
- The integration contract with the separate `ls-designmd` repository.

### 1.2 Out of scope

- Rewriting React, Tailwind, Motion, Vite, or TypeScript.
- Recreating Local Studio’s full application inside the website.
- Treating third-party dependency source as part of the first-party website context. If all transitive dependency source counted, React alone would invalidate the budget; the meaningful boundary is first-party authored implementation plus its tests and build logic.
- Replacing polished dynamic demonstrations with screenshots solely to reduce code.
- Minifying, obfuscating, stripping names, or deleting tests to manipulate token counts.
- Introducing a generic CMS, generic component framework, or universal effect system without concrete consumers.

### 1.3 Canonical HTML route set

Use the route set currently implemented by `src/routes.ts` and `src/agent/catalog.ts`:

- `/`
- `/product`
- `/docs`
- `/setup`
- `/download`
- `/overview`
- `/machine`

`NotFoundPage` remains the unmatched fallback and is not a canonical route entry.

`/mobile` and `/agents` are not current HTML routes. They occur in stale middleware, tests, and documentation. Remove them from HTML-route lists. Preserve compatibility through canonical redirects:

- `/mobile` → `/#mobile`
- `/agents` → `/setup`

Markdown-only documents such as `/mobile.md`, `/agents.md`, `/services.md`, and `/people.md` may remain if they carry useful machine-readable content. They belong to a separate document registry and must never be inferred to be HTML routes.

## 2. Static audit of the current repository

This audit is source-based. The baseline phase must run every current command locally and record actual pass/fail, bundle, token, and screenshot evidence before behavior changes. Do not claim the current test suite passes merely because files exist.

### 2.1 Current stack

`package.json` currently declares:

- React `19.2.8`
- React DOM `19.2.8`
- TypeScript `6.0.3`
- Vite `8.2.1`
- Tailwind CSS `4.3.3`
- Motion `13.1.0`
- Playwright `1.62.1`
- `@vgpu/*`, `phase`, Lucide, ESLint, and Oxlint
- pnpm `10.34.5`

The stack is suitable. The problem is representation and ownership, not the choice of React or TypeScript.

### 2.2 Proven minimum source volume

The following sizes are exact for the listed files/directories at the audited commit. The sum is a **minimum**, because it excludes most of `src/ls`, all of `src/ls-shared`, all of `src/ls-contracts`, most shader runtime/WGSL files, root application files, configs, and custom lint implementation.

| Area | Bytes |
|---|---:|
| `src/components` | 25,799 |
| `src/pages` | 20,385 |
| root `src/sections/*` files | 40,375 |
| `src/sections/hero` | 20,581 |
| `src/sections/story` | 34,857 |
| `src/hooks` | 4,594 |
| `src/demo/sequence.ts` | 8,285 |
| `src/agent/catalog.ts` | 42,473 |
| `src/content` | 12,017 |
| known CSS sources and generated CSS | 145,710 |
| `tests` | 105,547 |
| committed `.pi-vite.log` | 16,734 |
| `scripts` | 17,212 |
| **known minimum** | **494,569** |

This already exceeds a plausible 100,000-token context before the copied product application and shader implementation are counted. The refactor cannot reach the target through formatting changes. It requires architectural deletion, derivation, and extraction.

### 2.3 CSS duplication

Current CSS ownership:

- `src/styles/global.css`: 44,635 bytes.
- `src/styles/workbench-demo.css`: 4,258 bytes.
- `src/styles/ls/tokens.css`: 29,894 bytes.
- `src/styles/ls/base.css`: 5,012 bytes.
- `src/styles/ls/chat.css`: 13,373 bytes.
- `src/styles/ls/animations.css`: 1,954 bytes.
- committed generated `src/styles/ls-app.css`: 46,584 bytes.

`scripts/sync-ls-demo-styles.mjs` reads the Local Studio CSS copies, rewrites/scopes them, and writes another committed representation. The source projection plus generated output alone is 96,817 bytes. This is mechanically derived duplication and must disappear from tracked first-party context.

### 2.4 Copied product application boundary

`vite.config.ts` aliases:

- `@` → `src/ls`
- `@shared` → `src/ls-shared`
- `@local-studio/contracts` → `src/ls-contracts`
- multiple high-fan-out product imports → local stubs
- `next/link` and `next/navigation` → local shims

`tsconfig.app.json` excludes `src/ls`, `src/ls-shared`, and `src/ls-contracts`, while website modules import them through aliases. `exclude` is not a dependency boundary: imported modules can still enter the program. The repository then compensates with targeted stubs and linter ignores.

Both ESLint and Oxlint ignore the copied product trees. This yields a partial fork that is:

- transitively coupled to product internals;
- selectively type-checked;
- not fully linted;
- dependent on path aliases and Next shims;
- expensive for agent context;
- vulnerable to drift from the actual product;
- difficult to determine as live, copied, stubbed, or dead.

The final website must contain none of `src/ls`, `src/ls-shared`, or `src/ls-contracts`.

### 2.5 Route and metadata duplication

The same route facts currently appear independently in:

- `src/routes.ts`
- `src/App.tsx` lazy imports
- `src/App.tsx` prefetch imports
- `src/App.tsx` title map
- `src/App.tsx` route dispatch
- `src/agent/catalog.ts` HTML routes
- `src/agent/catalog.ts` document paths
- `src/main.tsx` preload-route set
- `src/components/Header.tsx`
- `src/components/Footer.tsx`
- `src/pages/NotFoundPage.tsx`
- `middleware.js`
- `vercel.json`
- multiple test-local route arrays
- `ls-designmd/design.md`

This is the main reason stale `/mobile` and `/agents` assumptions survive after their page components disappeared.

### 2.6 Agent-content duplication

`src/agent/catalog.ts` is 42,473 bytes and manually repeats:

- route titles and summaries;
- product and company prose;
- download metadata;
- machine-readable text;
- Markdown pages;
- discovery data;
- release values;
- route facts already held elsewhere.

The machine page then consumes this rendered structure and reparses route lines from presentation text. That is the inverse of the desired architecture.

Replace it with canonical semantic records plus pure renderers.

### 2.7 Current component reuse

Top-level shared component files observed:

- `PageShell`: broad route reuse; keep as a semantic shell.
- `PageIntro`: reused by most non-home routes; keep.
- `LocalLink`: widely reused; keep behavior but improve type/domain split.
- `CtaPair`, `TextLink`, `DownloadButton`: meaningful repeated interaction patterns; split into clearer primitives/patterns.
- `MediaFrame`: currently one obvious page consumer; keep only if the final product/media architecture has ≥2 consumers or because it owns a media invariant. Otherwise inline into ProductPage.
- `PageCta`: currently one route consumer while `FinalCallout` duplicates almost identical markup; merge both into one component.
- `PromptBlock` → `CopyIcon`: single vertical composition; reasonable because clipboard behavior is a separate invariant, but rename `CopyIcon` to `CopyButton` because it is not an icon primitive.
- `MobileConnectionDemo`: no current page consumer and stale tests expect it; delete unless an active route is deliberately restored.

A shared component is not valuable merely because React permits extraction. Extraction is justified when it reduces total semantic description length or owns an invariant. A one-use component that merely renames markup costs imports, files, props, and context.

### 2.8 Demonstration duplication

The homepage demo and five story scenes share a domain but currently combine two opposite strategies:

1. HeroDemo imports substantial Local Studio source modules and types.
2. Story demos manually recreate Local Studio-looking product surfaces.

Both are wrong as the long-term boundary. The goal is not “copy less UI by making more generic cards.” The goal is an intentional Local Studio **demo-kit** with stable presentational primitives and explicit demo data contracts.

### 2.9 Current functional strengths

Preserve these patterns:

- `src/demo/sequence.ts` already isolates a pure reducer and pure selectors for the hero scenario.
- `DemoShell` centralizes story frame geometry.
- `ProductStory` drives repeated feature behavior from `productFeatures`.
- `Footer` and several arrays use `as const satisfies`.
- Hooks isolate reduced-motion and element-activity behavior.
- `agent-ready.plugin.ts` already generates agent documents at build time and measures Markdown tokens.
- custom Oxlint anti-slop rules already target widening, unsafe dictionaries, type assertions, unknown use, and related issues.
- a separate `ls-designmd` authority already exists.

The refactor should sharpen these ideas rather than replace them with a fashionable framework.

### 2.10 Concrete defects and contradictions

Fix all of these:

1. `.pi-vite.log` is committed despite being transient. Add `.pi-vite.log` or `*.log` to `.gitignore` and remove it from Git.
2. `MachinePage` renders `<main id="content">` inside `PageShell`’s `<main id="content">`, causing duplicate IDs and nested main landmarks. `MachinePage` must render a section/div inside the shell or bypass PageShell deliberately with a separate shell variant that still produces exactly one main.
3. `agent-ready.spec.ts`, `local-routes.spec.ts`, `interface-guidelines.spec.ts`, and `design-audit.spec.ts` include stale `/mobile` and `/agents` assumptions.
4. `middleware.js` contains stale HTML routes and separately duplicates markdown-route mapping.
5. `vercel.json`, middleware, and agent catalog duplicate Link/route facts.
6. `FeatureScene` manually repeats the slugs already held in `productFeatures`.
7. `productFeatures` uses `ReactNode` and JSX in canonical content, preventing reuse by Markdown renderers without React knowledge.
8. release version/download URL is hardcoded in multiple places.
9. `Header.tsx` contains an unsafe `as CSSProperties` custom-property assertion even though the project’s stated direction is strong types.
10. several story/demo types are manually named despite being direct shapes of canonical values and can be derived.
11. site page geometry is duplicated as long class constants such as `mx-auto w-[min(1399px,calc(100%_-_48px))]` even though a semantic `.section-width` primitive already exists.
12. current node and app TypeScript configs both use `skipLibCheck: true`.
13. direct dependency ranges use carets; the lockfile pins resolution, but exact manifests are preferable for a deterministic artifact.
14. React Doctor CI is advisory and version-floating through `millionco/react-doctor@v2` with optional internal latest behavior. CI tooling used as a contract must be pinned or explicitly non-blocking.
15. tests contain large repeated route tables, hand-written geometry expectations, and long browser workflows that encode stale structure instead of consuming canonical invariants.

## 3. Target architecture

The entire website should behave as a compilation pipeline:

```text
canonical domain/content values
          |
          +--> React interpreter ------> browser UI
          +--> Markdown interpreter ---> *.md / llms
          +--> machine renderer --------> /machine
          +--> XML renderer ------------> sitemap
          +--> JSON renderer -----------> agent card / API catalog
          +--> header selectors --------> middleware / Vercel headers
          +--> preload selectors -------> document preload hints
          +--> test selectors ----------> route and invariant test tables
```

There must not be a second hand-authored representation between source and outputs.

### 3.1 Layer graph

Use this dependency direction:

```text
domain  -> nothing
content -> domain only
system  -> domain only
ui      -> domain + system
pages   -> content + ui + system
app     -> pages + domain + browser adapters
agent   -> domain + content
adapters-> domain; browser/platform APIs
main    -> app + global styles
```

No inverse imports. No `domain -> React`. No `content -> ReactNode`. No `agent -> pages`. No tests imported into production.

Suggested target tree:

```text
src/
  app/
    App.tsx
    browser-location.ts
    route-loader.ts
  domain/
    site.ts
    route.ts
    navigation.ts
    product.ts
    release.ts
    asset.ts
    motion.ts
  content/
    site.ts
    product.ts
    docs.ts
    resources.ts
    prompts.ts
  system/
    tokens.css
    motion.ts
    surfaces.css
  ui/
    SiteShell.tsx
    Header.tsx
    Footer.tsx
    PageIntro.tsx
    PageCta.tsx
    links.tsx
    Media.tsx
    CopyButton.tsx
  pages/
    HomePage.tsx
    ProductPage.tsx
    DocsPage.tsx
    PromptPage.tsx
    DownloadPage.tsx
    ResourcesPage.tsx
    MachinePage.tsx
    NotFoundPage.tsx
  demo/
    scenario.ts
    state.ts
    selectors.ts
    runtime.ts
    HeroDemo.tsx
    story/
  logo/
    LocalAiLogo.tsx          # adapter only; implementation externalized
  agent/
    markdown.ts
    discovery.ts
    sitemap.ts
    machine.ts
    robots.ts
  images.ts
  main.tsx
scripts/
  context.mjs
  graph.mjs
  generate-static.mjs
  verify-generated.mjs
  assets.mjs
tests/
  unit/
  e2e/
  visual/
```

Do not preserve this exact folder count if a smaller tree makes dependencies clearer. The invariant is ownership and direction, not folder aesthetics.

## 4. TypeScript policy: strong types without type ceremony

### 4.1 Anonymous structural types

TypeScript supports anonymous structural object types. Use them aggressively for local callbacks and one-use component props:

```ts
function Stat({ label, value }: { label: string; value: string }) { ... }
```

This is appropriate because the shape has one semantic location.

Name a type only when at least one is true:

1. it is exported across a module boundary;
2. it is recursive;
3. it is a discriminated domain union;
4. it is reused in ≥2 independent locations;
5. the name communicates a domain invariant better than the literal shape;
6. it is a boundary decoder/validated value;
7. declaration of the name reduces token count rather than increasing it.

Do **not** replace every named interface with anonymous syntax. Repeating the same five-field anonymous type six times is worse than one named type.

### 4.2 Values first; types derived

Prefer canonical runtime values, then derive types:

```ts
export const features = [
  { slug: "control", ... },
  { slug: "serve", ... },
] as const satisfies readonly ProductFeature[];

export type FeatureSlug = (typeof features)[number]["slug"];
```

Do not write a separate string union for the same slugs.

For routes:

```ts
export const routes = {
  "/": { ... },
  "/product": { ... },
  ...
} as const satisfies Record<string, RouteSpec>;

export type RoutePath = keyof typeof routes;
```

Permit `as const`; prohibit unchecked `as T` unless there is an audited boundary rationale.

### 4.3 `satisfies` over assertions

Use `satisfies` to verify shape without widening literal information. Example:

```ts
const download = {
  version: "2.11.2",
  bytes: 255_000_000,
  platform: "macos-arm64",
} satisfies Release;
```

Do not use `as Release`.

### 4.4 External data

Every external/untrusted value starts as `unknown`:

- `fetch().json()`;
- local/session storage;
- environment variables;
- URL query values when a finite domain is expected;
- postMessage;
- user-supplied persisted data.

Decode at the adapter edge and return a validated domain value or explicit error/result. Do not contaminate domain functions with `unknown`.

### 4.5 Compiler options

After copied Local Studio source is removed and third-party declarations are verified, target:

```jsonc
{
  "compilerOptions": {
    "strict": true,
    "skipLibCheck": false,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noPropertyAccessFromIndexSignature": true,
    "noUncheckedSideEffectImports": true,
    "allowUnreachableCode": false,
    "allowUnusedLabels": false,
    "verbatimModuleSyntax": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true
  }
}
```

Evaluate TypeScript 6’s `erasableSyntaxOnly` against all first-party code. Enable it if the build remains clean. If enabled, do not use enums, namespaces requiring runtime emit, or parameter properties. Prefer unions, objects, and functions anyway.

`noImplicitOverride` is irrelevant if classes are not used; do not add flags merely for symbolic strictness.

### 4.6 Lint policy

Keep the existing anti-slop rules and add typed linting for first-party authored code. At minimum enforce equivalents of:

- no explicit `any`;
- no unsafe assignment/call/member/return;
- no non-null assertions;
- no unhandled promises;
- no misused promises;
- switch exhaustiveness;
- no unnecessary assertions;
- no unnecessary conditions;
- strict boolean expressions where practical;
- type-only imports;
- no `@ts-ignore`; permit narrowly described `@ts-expect-error` only in boundary tests;
- no dynamic Tailwind class fragments.

Delete the lint ignores for `src/ls*` when those directories disappear. The final first-party source must all be type-checked and linted.

## 5. Functional programming contract

### 5.1 Core rule

Use:

```text
input value -> pure function -> output value
```

for every domain transformation possible.

Effects may schedule or observe pure transformations, but may not contain domain policy.

### 5.2 Pure state transitions

For interactive machines:

```ts
type State = Readonly<...>;
type Event = ...;

const update = (state: State, event: Event): State => ...;
```

If commands are needed:

```ts
type Update = readonly [State, readonly Effect[]];
```

The reducer does not call `window`, `document`, `navigator`, Motion, timers, or network APIs.

Use this for:

- hero demo sequence;
- hero demo task selection;
- computer-panel tabs;
- nav menu open/close state;
- optional story selected scene state;
- copy-state transitions if complexity justifies it.

Do not force trivial uncontrolled `<details>` or native browser semantics into custom reducers.

### 5.3 Effects at adapters

Explicit adapter concerns:

- history/pushState/popstate;
- scroll/focus;
- ResizeObserver;
- IntersectionObserver;
- timers/requestAnimationFrame;
- matchMedia;
- clipboard;
- WebGPU;
- preload tags;
- Vercel request/response;
- DOM measurement.

A useful division:

```text
domain/navigation.ts       normalizePath, resolveRoute, desiredFocus
app/browser-location.ts    reads location, subscribes to popstate, executes scroll/focus
```

### 5.4 No ambient nondeterminism in render

Never call in render/domain logic:

- `Date.now()`;
- `new Date()` for current time;
- `Math.random()`;
- `performance.now()`;
- environment-dependent global reads.

Inject clocks/seeds or generate deterministic demo timestamps. `control-demo.tsx` already uses a fixed UTC date; preserve that pattern.

## 6. Canonical site model

### 6.1 Site facts

Create one `site` value containing stable facts:

```ts
export const site = {
  origin: "https://localstudio.ai",
  company: { ... },
  products: { ... },
  repository: "https://github.com/sybil-solutions/local-studio",
  release: { ... },
  routes: { ... },
  documents: { ... },
  redirects: { ... },
} as const satisfies Site;
```

Avoid one giant file of prose. Split content by domain when it reduces locality, but each fact must have one source.

### 6.2 Route specification

Each route entry must own enough metadata to derive every route surface:

```ts
type RouteSpec = {
  readonly title: string;
  readonly summary: string;
  readonly load: () => Promise<{ default: ComponentType }>;
  readonly markdown: `/${string}.md`;
  readonly nav?: "primary" | "resource" | "footer";
  readonly priority: number;
  readonly preload?: readonly AssetId[];
  readonly machineLabel?: string;
};
```

Do not put JSX/page content in this object. It is routing/metadata, not CMS content.

Selectors:

```ts
routePaths(site)
isRoutePath(site, path)
routeTitle(site, path)
routeLoader(site, path)
markdownPath(site, path)
sitemapEntries(site)
footerRoutes(site)
navGroups(site)
preloadsFor(site, path)
```

All route consumers call selectors.

### 6.3 Header/footer navigation

Header nav must consume a navigation model, not own product/resource arrays. Footer must use a selector. NotFound suggestions derive from canonical routes with an explicit ordered selector.

### 6.4 Middleware and Vercel

Do not hand-maintain route maps in `middleware.js`.

Preferred path:

- export a platform-safe route/document selector module with no React dependency;
- middleware imports the selector if Vercel’s runtime/build supports it;
- otherwise `scripts/generate-static.mjs` emits the smallest platform-required generated manifest from canonical values before deployment and verifies its hash.

`vercel.json` should contain only deployment semantics that cannot be generated or imported. Do not repeat the entire Link header in both TypeScript and JSON. Prefer middleware for dynamic/semantic response headers and keep `vercel.json` minimal.

## 7. Canonical content and multiple interpreters

### 7.1 Remove React from canonical prose

Current `productFeatures` stores `ReactNode` fragments. Replace with a small semantic text representation only where markup is truly needed.

For mostly plain prose, use strings plus protected product-term markers generated by a helper. Do not invent a giant rich-text AST.

A compact option:

```ts
type Inline =
  | string
  | { readonly term: ProductTerm };

type Prose = readonly Inline[];
```

React interpreter:

```ts
renderInlineReact(prose)
```

Markdown interpreter:

```ts
renderInlineMarkdown(prose)
```

If a field is always plain text, keep it a string.

### 7.2 Product features

One canonical feature list must own:

- slug;
- story title/description;
- product title/text;
- screenshot asset ID;
- alt text;
- demo scene ID if separate;
- display order.

`FeatureScene` derives from `features[number].slug` or a `demo` field. Delete `scenes.ts`.

### 7.3 Resources/docs/setup

Data-drive repeated groups and TOCs where it reduces duplication. Do not convert every unique documentation paragraph into a complex schema. For long unique DocsPage prose, either:

- store canonical Markdown and render it to React using a controlled build-time compiler, or
- retain semantic TS content blocks if that produces fewer tokens and stronger integration.

Choose the representation with the smallest combined implementation + interpreter cost. Measure it.

## 8. React component policy

### 8.1 Extraction rule

Create or keep a component when:

```text
(reuse count >= 2) OR (owns a semantic/behavioral invariant)
```

Examples of valid one-use invariant components:

- `SiteShell`: owns landmarks/skip link/header/footer.
- `CopyButton`: owns clipboard state/a11y/fallback.
- `LocalAiLogo`: owns expensive renderer lifecycle boundary.
- `HeroDemo`: owns a major interactive feature.

Invalid one-use extraction:

```tsx
function ProductHeading({ children }) {
  return <h2 className="...">{children}</h2>;
}
```

if it expresses no independent invariant.

### 8.2 Merge current duplicate CTA structures

`FinalCallout` and `PageCta` are effectively the same semantic component. Delete `FinalCallout.tsx` and render:

```tsx
<PageCta id="download-title" />
```

from HomePage, with the exact approved homepage styling variant if required.

### 8.3 Link model

Use one link component capable of internal/external semantics, but do not hide all anchor behavior behind prop magic.

Internal navigation can be structurally typed:

```ts
type InternalHref = RoutePath | `/#${string}` | `${RoutePath}#${string}`;
```

External URLs may remain `string` or use a branded validated URL if required by safety-sensitive behavior.

`LocalLink` should intercept only same-origin navigable links and preserve modifier keys/targets, as it does now. Move URL normalization/decision logic to a pure helper and leave history mutation in the event adapter.

### 8.4 Avoid boolean soup

Prefer variants when booleans can contradict:

Bad:

```ts
{ centered?: boolean; split?: boolean; left?: boolean }
```

Good:

```ts
{ layout?: "centered" | "left" | "split" }
```

Current `PageIntro` already follows this pattern.

## 9. Local Studio demo-kit: remove the partial fork

This is the largest implementation change.

### 9.1 Goal

Create a stable, presentational, side-effect-light Local Studio demo package in the actual Local Studio repository/workspace, for example:

```text
packages/demo-ui/
  package.json
  src/
    index.ts
    tokens.css
    frame.tsx
    workbench/
    models/
    automation/
    machines/
    usage/
    diff/
    files/
```

Package name example:

```text
@local-studio/demo-ui
```

Exact naming is less important than ownership.

### 9.2 Package contract

The package must:

- contain only UI needed by public demos;
- take demo state/data through typed props;
- have no network calls;
- have no product store dependency;
- have no Next dependency;
- have no Electron dependency;
- have no controller/runtime dependency;
- have no global application providers;
- expose stable React components and semantic tokens;
- use Local Studio’s authoritative visual primitives internally;
- be versioned alongside product UI;
- compile independently;
- be tested in its owning repository.

The website dependency becomes one package, not hundreds of copied internal files.

### 9.3 Candidate primitives

Extract from product code where appropriate:

- sidebar/nav chrome;
- computer tab header;
- model cards;
- automation list/editor surfaces;
- usage heatmap;
- diff file rendering;
- filesystem tree;
- chat message/timeline primitives;
- composer;
- status metrics/panels;
- machine rows;
- buttons/inputs/pills/surfaces used by demos.

Do not expose the entire product API. The package is intentionally narrow.

### 9.4 Hero demo after extraction

The website keeps scenario-specific data and state:

```text
src/demo/scenario.ts   texts, files, tools, task names
src/demo/state.ts      pure State/Event/update
src/demo/selectors.ts  derived visible model
src/demo/runtime.ts    timer/activity adapter
src/demo/HeroDemo.tsx  binds selectors to demo-ui
```

The final HeroDemo should not import:

```text
@/features/*
@/ui/*
next/*
@shared/*
@local-studio/contracts
```

It imports `@local-studio/demo-ui` only.

### 9.5 Story demos after extraction

Replace each current large handwritten scene with data + composition over demo-kit.

Examples:

```tsx
<ModelPickerDemo models={featuredModels} machine={demoMachine} />
<AutomationDemo automations={demoAutomations} />
<MachineConfigDemo machines={demoMachines} />
<UsageDemo stats={demoUsage} />
<RuntimeStatusDemo status={demoRuntime} />
```

Unique story data belongs in website content/scenario files. Product visual implementation belongs in demo-kit.

### 9.6 Remove old fork

After parity is verified:

Delete:

```text
src/ls/
src/ls-shared/
src/ls-contracts/
```

Delete all Vite aliases and stubs that existed only to host those sources.

Delete the corresponding ESLint/Oxlint ignores.

This should be the largest token reduction in the project.

## 10. CSS and Tailwind normal form

### 10.1 One canonical design source per visual system

There are two intentional visual systems:

1. public website;
2. embedded Local Studio demo UI.

Public website owns a small semantic token layer. Demo UI package owns its own scoped product tokens.

The website must not store a copied product token source plus a generated product projection.

### 10.2 Public website CSS

Reduce `global.css` into:

- font faces;
- semantic tokens;
- reset/base;
- shell/layout invariants that Tailwind cannot express economically;
- shared surfaces;
- global accessibility/focus/touch policy;
- limited keyframes.

Move page-local geometry into Tailwind only when utility strings are shorter and clearer than reusable CSS. Keep semantic CSS classes when the same long utility pattern repeats.

Do not enforce “Tailwind everywhere” or “CSS everywhere.” Optimize total source entropy.

### 10.3 Remove repeated arbitrary geometry

Replace repeated:

```text
mx-auto w-[min(1399px,calc(100%_-_48px))]
```

with the existing `section-width` semantic primitive unless a route genuinely differs.

### 10.4 Token policy

Every public visual literal must be either:

- semantic token definition;
- one-off geometric value demonstrably unique;
- data content;
- an explicitly allowlisted escape hatch.

Do not copy a full Tailwind palette into custom CSS when only a few semantic aliases are used. Keep only consumed primitives or let Tailwind own its built-ins.

### 10.5 Dynamic classes

Never construct partial Tailwind classes dynamically:

```ts
`text-${tone}-500` // prohibited
```

Use finite maps:

```ts
const toneClass = {
  quiet: "text-white/50",
  body: "text-white/70",
} satisfies Record<Tone, string>;
```

### 10.6 Demo styles

`@local-studio/demo-ui` exports one scoped CSS entry. The website imports it only in lazy demo chunks if feasible. Delete:

```text
src/styles/ls/*
src/styles/ls-app.css
scripts/sync-ls-demo-styles.mjs
```

## 11. Motion architecture

### 11.1 Finite motion recipes

Centralize repeated values:

```ts
export const motion = {
  ease: [0.16, 1, 0.3, 1],
  heroEnter: { duration: 0.9, ... },
  quickFade: { duration: 0.2, ... },
  featureSwap: { duration: 0.45, ... },
} as const;
```

Do not put every unique animation into a registry. Registry entries exist when values or policy repeat.

### 11.2 Reduced motion

Every motion interpreter has an explicit reduced state. No critical content depends on transition completion. Reduced motion should immediately produce the final visible semantic state.

### 11.3 Activity lifecycle

Keep one shared observer hook for “work only while near/in viewport.” Hero demo, looping demos, and renderer use it or equivalent package lifecycle. Tests must verify offscreen work pauses.

## 12. WebGPU logo renderer

The Local AI logo renderer is another large specialized subsystem. Its implementation contains many renderer, shader, pipeline, mesh, pointer, environment-light, and runtime files; `index.tsx` alone is 11,613 bytes and the render directory includes multiple 3–10 KB modules.

It is legitimate complexity if the WebGPU mark is a deliberate product feature. It should not consume a large fraction of the website’s semantic context.

### 12.1 Extract it

Move renderer implementation into a focused package in its natural owning repository, e.g.:

```text
@local-ai/logo-renderer
```

Website keeps a tiny adapter:

```tsx
const LocalAiLogo = lazy(() => import("@local-ai/logo-renderer/react"));
```

The package owns:

- VGPU adapter;
- shaders;
- mesh;
- render passes;
- pointer mapping;
- frame loop;
- fallback lifecycle;
- renderer constants.

Website owns:

- placement;
- public-page fallback asset;
- lazy loading;
- user-facing reduced-motion policy if not wholly package-owned.

### 12.2 Dependency consequence

After extraction, remove `@vgpu/*`, `phase`, `@webgpu/types`, `earcut`, and shader loader dependencies from `ls-web` unless still directly needed. The package owns its dependencies.

This simultaneously reduces context, root config complexity, and eager dependency surface.

## 13. Agent-ready architecture

### 13.1 Semantic data first

Replace `agent/catalog.ts` with small modules:

```text
agent/markdown.ts
agent/discovery.ts
agent/machine.ts
agent/sitemap.ts
agent/robots.ts
```

All consume canonical `site` + content data.

### 13.2 Markdown twins

Each canonical HTML route provides a Markdown renderer or content selector. Do not duplicate full route prose manually if browser content can be rendered from semantic content.

Document registry separately owns Markdown-only docs.

### 13.3 Machine page

Machine renderer returns structured section values:

```ts
type MachineSection = readonly [name: string, lines: readonly string[]];
```

The page consumes those values directly.

Do not implement:

```ts
line.split(" ")[0]
```

to recover a route from rendered text. Use route objects and render the text afterward.

Fix nested main by changing MachinePage to:

```tsx
<PageShell>
  <div className="machine">...</div>
</PageShell>
```

or a dedicated shell mode with one `<main>` total.

### 13.4 Static output generation

`agent-ready.plugin.ts` can remain the Vite output adapter. It should become thin:

```ts
for (const document of renderAgentDocuments(site)) {
  emit(document.path, document.content)
}
```

Token count derives from the same document renderer used by middleware/tests.

### 13.5 Exact token count

Current middleware uses `ceil(body.length / 4)` while the Vite plugin exposes a catalog token-count helper. One definition must own this behavior.

For HTTP header display, an approximation is acceptable only if named `approximateMarkdownTokens`. For contractual source-context budgeting, use the tokenizer of the target model or an explicitly pinned tokenizer implementation. Do not use characters/4 for the 100K build gate.

## 14. Context budget: make <100K a build invariant

### 14.1 Define what counts

The contractual first-party implementation context includes:

- first-party `.ts`, `.tsx`, `.js`, `.mjs`, `.css`, `.wgsl` still located in `ls-web`;
- textual content imported into the app;
- first-party tests;
- build/config scripts needed to understand/reproduce the implementation;
- package manifest;
- relevant HTML template.

It excludes from the **count**, while still listing them in the full report:

- `node_modules`;
- `dist`;
- `.git`;
- binary images/fonts;
- lockfile;
- generated outputs;
- screenshots/test artifacts;
- external documentation repository;
- source of separately versioned dependencies such as demo-ui/logo-renderer.

Why exclude lockfile from token count: it is required for reproducibility but does not describe the website implementation and is mostly package-resolution noise. It remains committed and hash-visible.

Why exclude binaries: model text context cannot meaningfully reconstruct binary pixel/font bytes. Include an asset manifest with file path, role, dimensions/type, byte size, and SHA-256.

### 14.2 Budget categories

After the extraction work, enforce:

| Category | Target | Hard category ceiling |
|---|---:|---:|
| domain/content/agent semantic core | 15K | 18K |
| React pages/components/app | 22K | 26K |
| demos + scenario adapters | 15K | 18K |
| public CSS/motion | 10K | 12K |
| tests | 14K | 17K |
| build/config/tooling | 8K | 10K |
| package/html/misc text | 3K | 4K |
| **total target** | **87K** | **≤90K operating gate** |

These are starting ceilings. The total gate is authoritative. Rebalance only by committing an explicit budget change with measured justification; never silently let a category balloon.

### 14.3 Context script

Create `scripts/context.mjs` with commands:

```text
pnpm context:report
pnpm context:bundle
pnpm context:check
```

Behavior:

1. deterministic glob list;
2. normalize paths to `/`;
3. sort lexicographically;
4. read UTF-8;
5. normalize line endings to `\n`;
6. reject unexpected binary/null bytes;
7. tokenize each file with pinned target tokenizer;
8. classify by category;
9. print sorted per-file and per-category totals;
10. compare operating and hard budgets;
11. emit deterministic `.context/implementation.md` on bundle;
12. emit `.context/manifest.json` containing path, bytes, tokens, SHA-256, category;
13. fail if total >90K or any category hard ceiling is exceeded;
14. warn at ≥80K total;
15. display excluded lock/generated/binary manifest separately.

Example bundle format:

```md
<!-- file: src/domain/site.ts sha256:... -->
```ts
...
```
```

Do not include `node_modules` or generated files.

### 14.4 “Entire website as context” acceptance

A coding agent receiving only:

- `.context/implementation.md`;
- asset manifest;
- package lock available as a file when dependency resolution is needed;
- separately supplied design documentation when doing design work;

must be able to understand and rebuild the entire first-party site implementation.

The implementation bundle itself must remain <100K, with CI target ≤90K.

## 15. Graph minimality: operationalize “nothing removable”

Literal mathematical minimality is undecidable in a normal software project. Use mechanically testable proxies.

### 15.1 Reachability

Create `scripts/graph.mjs` or adopt one narrowly scoped graph tool. Roots:

```text
src/main.tsx
agent-ready.plugin.ts
middleware entry
Vite config/build scripts
test entrypoints
```

Every first-party implementation file must be reachable from a declared root or explicitly listed as a generator/source root.

Fail on unreachable source files.

### 15.2 Exports

Fail on unused exported symbols. Prefer non-exported local functions unless another module consumes them.

### 15.3 Dependencies

Fail on unused direct dependencies. Pin direct dependency versions exactly. Use `pnpm install --frozen-lockfile` in CI.

### 15.4 Components

Generate component import counts. Fail a shared-component module with one consumer unless listed in `architecture.json` with an invariant rationale.

Example:

```json
{
  "singleConsumerComponents": {
    "src/ui/CopyButton.tsx": "owns clipboard fallback and live-region behavior"
  }
}
```

### 15.5 Tokens/styles/assets

Fail on:

- unused public CSS custom properties, where statically checkable;
- orphan keyframes;
- orphan assets;
- duplicate asset content hashes with different names unless allowlisted;
- CSS generated files committed unexpectedly;
- raw public design values forbidden by the token policy.

Do not overfit static analysis to Tailwind internals; use build output and explicit registries for finite semantic assets/tokens.

## 16. Tests: reduce volume, increase information density

Current tests exceed 105 KB and several encode stale routes. Tests are part of the implementation context, so they require the same discipline.

### 16.1 Test layers

Use three layers.

#### Pure unit tests

Test:

- route normalization;
- route selectors;
- redirects;
- Markdown/machine/sitemap generation;
- demo reducer transitions;
- demo selectors;
- asset srcset generation;
- context categorization/budgets;
- exhaustiveness/registry invariants.

These should be fast and small.

#### Playwright behavioral tests

Only browser-required behavior:

- route render/title/heading/no console error/no overflow;
- SPA push/back/forward/hash/focus;
- nav keyboard/pointer/dialog semantics;
- clipboard;
- reduced motion;
- offscreen pause;
- demo interaction smoke paths;
- one main landmark/skip link;
- agent HTTP content negotiation;
- responsive critical breakpoints.

#### Visual regression

Use deterministic screenshots for:

- homepage desktop/mobile;
- major non-home shell;
- hero final demo state;
- each story scene final state;
- header open states.

This replaces dozens of brittle pixel/geometry assertions with higher-signal evidence while keeping a few semantic geometry tests for invariants.

### 16.2 Route tests derive from canonical model

Tests must import a test-safe route selector or generated fixture from the canonical site model. Never write a second route array.

Example:

```ts
for (const route of canonicalRoutes) {
  test(`${route.path} renders`, ...)
}
```

### 16.3 Deterministic demo clock

Do not make E2E wait 30 seconds for the hero demo. Provide an adapter-level test clock or a query/test harness that advances pure events deterministically while production uses timers.

The pure reducer can be exhaustively driven in milliseconds; browser tests only verify adapter wiring.

### 16.4 Test size target

Bring first-party tests below 17K tokens. Do not achieve this by dropping coverage. Achieve it through:

- canonical fixtures;
- table-driven assertions;
- helpers for repeated viewport/accessibility checks;
- pure tests instead of long browser scripts;
- visual snapshots for high-dimensional appearance.

## 17. Reproducible build and dependency policy

### 17.1 Package versions

Use exact direct dependency versions in `package.json`, not caret ranges. Keep `pnpm-lock.yaml` committed.

`packageManager` already pins pnpm. Add an explicit supported Node version through `.nvmrc`, `.node-version`, Volta, or `engines` + CI setup. Choose one source, not four.

### 17.2 CI install

```sh
corepack enable
pnpm install --frozen-lockfile
```

No dependency mutation in build/test.

### 17.3 Build determinism

Add:

```text
pnpm reproducible:check
```

It performs two clean builds and compares a canonical manifest of:

- output path;
- byte size;
- SHA-256;
- normalized metadata.

If Vite output embeds environment-dependent values, identify and remove them. Do not blindly require byte identity for platform metadata outside the app bundle; compare the meaningful build artifacts.

### 17.4 Generated content drift

`pnpm generated:check` regenerates all deterministic static outputs in a temp directory and compares hashes without modifying the working tree.

### 17.5 CI workflow

Create one blocking quality workflow:

```text
install
context:check
graph:check
generated:check
lint
tsc
unit tests
build
Playwright
visual regression
reproducible:check (main/nightly if too expensive per PR)
```

React Doctor may remain advisory, but pin the action/tool version. Do not use `@latest` anywhere in a reproducibility-sensitive check.

## 18. End-to-end implementation order

Do not attempt a single giant rewrite. Each phase ends green and reduces ambiguity.

### Phase 0 — Baseline and branch

Tasks:

1. create a refactor branch from current `main`;
2. record commit SHA;
3. run current commands exactly as README states;
4. capture pass/fail and known stale failures;
5. capture desktop/mobile screenshots for every current canonical route and major hero/story states;
6. save current production bundle manifest;
7. build a temporary token report over all first-party text;
8. build a temporary dependency/reachability report;
9. record current route matrix and redirect behavior.

Exit: baseline evidence committed to the PR description/artifact, not permanent source unless small.

### Phase 1 — Hygiene and semantic defects

Tasks:

1. delete `.pi-vite.log`; ignore logs;
2. fix MachinePage nested `<main>`/duplicate `#content`;
3. remove or quarantine unused `MobileConnectionDemo` and stale imports;
4. verify all current canonical routes load;
5. add tests for exactly one main and one content ID.

Exit: no obvious dead transient file or invalid landmark.

### Phase 2 — Context and graph gates first

Tasks:

1. implement `context:report/check/bundle`;
2. implement graph/dead export/dependency checks;
3. add initial budgets matching current state as non-blocking report only;
4. produce top 50 token files;
5. produce component fan-in report;
6. produce duplicate large literal/style report.

Exit: every later phase has measurable token/graph deltas.

### Phase 3 — Canonical route model

Tasks:

1. create site/route values;
2. derive `RoutePath` from keys;
3. refactor App dispatch/title/prefetch to selectors;
4. refactor Header/Footer/NotFound navigation;
5. refactor `main.tsx` preloads;
6. refactor middleware markdown negotiation;
7. implement `/mobile` and `/agents` redirects;
8. update tests to consume selectors;
9. update design docs route list.

Exit: a new route requires one canonical entry and optional page module only.

### Phase 4 — Canonical content + agent outputs

Tasks:

1. split semantic facts/content from renderers;
2. remove ReactNode from product feature domain data;
3. render React/Markdown from the same values;
4. generate machine/sitemap/llms/api-catalog/agent-card/robots from semantic data;
5. delete `src/agent/catalog.ts` after parity;
6. reduce middleware and plugin to adapters;
7. centralize release/download metadata.

Exit: browser and agent surfaces cannot drift semantically.

### Phase 5 — Type hardening

Tasks:

1. derive feature/route unions from values;
2. inline one-use structural props/types;
3. remove unsafe assertions;
4. add typed CSS custom-property type instead of `as CSSProperties`;
5. enable strict flags incrementally;
6. remove linter ignores for all surviving first-party source;
7. enable typed lint rules;
8. set `skipLibCheck:false` after dependency declaration issues are resolved.

Exit: no unchecked first-party escape hatch.

### Phase 6 — Component normal form

Tasks:

1. merge FinalCallout into PageCta;
2. audit every shared component by import count;
3. inline trivial single-use wrappers;
4. split behavioral primitives from convenience bundles;
5. collapse repeated container/prose classes to semantic primitive only when reused;
6. remove unused exports/components.

Exit: every shared component passes reuse/invariant rule.

### Phase 7 — Functional navigation/state

Tasks:

1. extract pure path/navigation decisions;
2. keep browser history/focus/scroll effects in adapter;
3. reduce Header menu state to explicit discriminated state if current booleans permit impossible combinations;
4. test reducer/state rules purely;
5. keep native dialog/details behavior where simpler.

Exit: navigation policy independently testable without DOM.

### Phase 8 — Local Studio demo-kit

Tasks in the Local Studio owning repository:

1. identify exact product primitives used by HeroDemo/story;
2. extract presentational subset to `@local-studio/demo-ui`;
3. remove runtime/store/network/Next coupling;
4. expose stable typed props;
5. expose scoped CSS entry;
6. create package-level visual tests;
7. version/publish or workspace-pin package.

Tasks in `ls-web`:

8. switch one story scene to package as proof;
9. switch remaining story scenes;
10. switch HeroDemo;
11. compare screenshots/semantics;
12. delete `src/ls*` and all aliases/stubs;
13. remove copied product CSS/projection scripts.

Exit: website has zero Local Studio internal-source copy.

### Phase 9 — Demo functional core

Tasks:

1. keep one canonical scenario file;
2. model demo state as immutable discriminated state, removing booleans derivable from phase when possible;
3. represent events explicitly;
4. derive visible UI through pure selectors;
5. timer/activity runtime dispatches events only;
6. inject deterministic test clock;
7. ensure reduced motion resolves directly to terminal state;
8. story scenes become pure data + demo-kit composition.

Exit: demo behavior can be exhaustively tested without time/browser.

### Phase 10 — CSS/motion reduction

Tasks:

1. delete generated copied product CSS;
2. shrink public tokens to consumed semantics;
3. consolidate repeated long class strings;
4. retain unique Tailwind composition where shortest;
5. centralize repeated easing/duration recipes;
6. run unused CSS/token/keyframe checks;
7. verify public/demo style isolation.

Exit: first-party website CSS ≤12K tokens; no duplicate product palette.

### Phase 11 — Logo renderer extraction

Tasks:

1. package WebGPU renderer in owning repository;
2. define tiny React adapter API;
3. preserve static fallback/reduced motion/device-loss behavior;
4. lazy import package;
5. remove renderer source and its build aliases/plugins if no longer required locally;
6. remove now-unused direct dependencies;
7. validate WebGPU/no-WebGPU screenshots.

Exit: website context contains only integration code for logo renderer.

### Phase 12 — Documentation integration

Tasks:

1. update `ls-designmd` route list to canonical current routes;
2. remove values that merely duplicate implementation when they can reference semantic IDs;
3. generate `design-manifest.json` from implementation with token names, route IDs, motion recipe IDs, component invariants, asset IDs;
4. store manifest hash in design docs or consume it in docs CI;
5. make docs validate referenced IDs.

Exit: docs explain intent; code owns executable values; drift is detected.

### Phase 13 — Test rewrite

Tasks:

1. build pure invariant test suite;
2. shrink Playwright to browser-only concerns;
3. introduce visual snapshots;
4. derive route/document test tables;
5. replace real-time demo waits with test clock;
6. preserve approved visual and accessibility behavior;
7. add graph/context/generated/dead-item tests;
8. delete stale old tests only after new coverage passes against baseline.

Exit:

- tests ≤17,000 tokens;
- no stale route assumptions;
- coverage is stronger and faster;
- browser suite protects browser behavior only.

### Phase 14 — Asset and runtime optimization

Tasks:

1. migrate all image references to asset registry;
2. remove orphan originals/variants;
3. generate deterministic variants;
4. lazy-load below-fold media;
5. preserve explicit width/height;
6. split demo and logo chunks;
7. add bundle report and budgets;
8. measure LCP, CLS, interaction long tasks, and memory;
9. optimize only measured hotspots.

Suggested initial runtime budgets, subject to baseline validation:

- homepage critical JS before demo/logo lazy chunks: ≤120 KB gzip;
- shared website CSS: ≤20 KB gzip;
- individual non-demo route chunk: ≤60 KB gzip;
- no unexpected eager product or WebGPU chunk;
- CLS: 0 in tested routes;
- no horizontal overflow at 320 px.

Exit:

- asset graph clean;
- intended chunks lazy;
- no regression from baseline;
- performance budgets blocking.

### Phase 15 — Final context and reproducibility gate

Tasks:

1. run context report and reduce every category to budget;
2. run full graph/dead/duplicate/token/asset checks;
3. build twice from clean state and compare manifests;
4. run all unit/E2E/visual tests;
5. update design-system docs and lock;
6. update compact README;
7. archive this migration spec outside final website context;
8. make architecture checks blocking;
9. merge only with a clean report.

Exit:

- total authored implementation ≤90,000 tokens;
- all category budgets pass;
- contractual ceiling has ≥10,000-token reserve;
- no copied product or shader source;
- all outputs deterministic;
- all acceptance criteria below pass.

## 19. File-level final actions

### Delete after replacement

```text
.pi-vite.log
src/machine.ts
src/routes.ts
src/agent/catalog.ts
src/sections/FinalCallout.tsx
src/components/MobileConnectionDemo.tsx
src/sections/story/scenes.ts
src/styles/ls-app.css
src/styles/ls/
scripts/sync-ls-demo-styles.mjs
src/ls/
src/ls-shared/
src/ls-contracts/
all product stubs and Next shims
stale monolithic tests after replacement
```

Potentially delete `@vgpu/*`, `phase`, `earcut`, and WebGPU dev types from the website package after logo extraction, but only if no remaining direct import exists.

### Replace or split

```text
src/App.tsx
  -> app/App.tsx + route model/selectors/effects

src/routing.ts
  -> app/browser-location.ts + pure domain route functions

src/components/Header.tsx
  -> shell Header + pure navigation reducer/model

src/components/Links.tsx
  -> ButtonLink, TextLink, CTA pattern

src/components/CopyIcon.tsx
  -> CopyButton + clipboard adapter

src/components/PageShell.tsx
  -> SiteShell with sole main landmark

src/content/product-features.tsx
  -> pure product feature registry without ReactNode

src/sections/HeroDemo.tsx
  -> scenario/state/selectors/runtime/view

src/sections/story/*
  -> small scene adapters over demo-kit

middleware.js
  -> edge-safe middleware using canonical selectors/renderers

vercel.json
  -> deployment-only rules without semantic route/header duplication

tests/*
  -> unit/e2e/visual structure
```

### Create

```text
domain site/route/navigation/product/release/asset/content/motion models
React and Markdown interpreters
machine/discovery/sitemap/robots renderers
context, graph, generation, asset scripts
architecture and context configs
design-system lock
primary CI workflow
demo-kit and logo-renderer packages in their owning repository
```

## 20. Acceptance criteria

The refactor is complete only when every item passes.

### Architecture

- [ ] One canonical route model owns all HTML paths and metadata.
- [ ] HTML routes, document-only outputs, and redirects are distinct.
- [ ] No route list exists in components, middleware, tests, or deployment config.
- [ ] No `src/ls*` tree or Local Studio internal import exists.
- [ ] No website shader implementation exists beyond the package adapter.
- [ ] No dependency cycle violates the layer graph.
- [ ] No dead first-party file or export exists.
- [ ] Every single-consumer shared module has an enforced rationale.
- [ ] Generated source is not committed except an explicitly verified platform exception.

### Types and functional core

- [ ] Required strict compiler flags pass.
- [ ] `skipLibCheck` is false.
- [ ] No `any`, `@ts-ignore`, non-null assertion, or unaudited assertion.
- [ ] Domain/content imports no React.
- [ ] Finite variants derive from values.
- [ ] Every discriminated union is exhaustively reduced.
- [ ] Navigation and demo state transitions are pure.
- [ ] Browser effects are isolated.
- [ ] Impossible demo/menu states are unrepresentable.

### Duplication and components

- [ ] FinalCallout duplication removed.
- [ ] Route/title/nav/preload/Markdown lists derive from site model.
- [ ] Product feature slugs exist once.
- [ ] Release metadata exists once.
- [ ] Content prose is not duplicated between React and Markdown.
- [ ] Product UI is reused through demo-kit, not recreated.
- [ ] CSS source is not committed beside a generated projection.
- [ ] No unused component, dependency, token, motion recipe, or asset.

### Semantics and behavior

- [ ] Exactly one main landmark and one `content` ID per page.
- [ ] Route focus, hash scrolling, history, keyboard navigation, dialog behavior, and touch targets pass.
- [ ] Reduced motion shows final visible states immediately.
- [ ] Offscreen demos stop work.
- [ ] Hero and story demos match approved states.
- [ ] Static fallback works without WebGPU.
- [ ] Internal and external links validate.
- [ ] Product names retain translation protection.
- [ ] All canonical routes have no console errors or horizontal overflow.

### Agent surfaces

- [ ] Every HTML route has a Markdown twin.
- [ ] Markdown-only documents are explicitly registered.
- [ ] Accept negotiation works.
- [ ] robots, sitemap, llms, llms-full, agent card, API catalog, and machine outputs are deterministic.
- [ ] Browser and machine-readable facts derive from canonical records.
- [ ] Middleware and Vite plugin use the same selectors/renderers.
- [ ] No machine renderer parses presentation text.

### Reproducibility and budget

- [ ] Direct dependencies pinned exactly.
- [ ] Frozen lockfile install succeeds.
- [ ] No `@latest` command in checks.
- [ ] Two clean builds produce equivalent manifests/hashes.
- [ ] Asset manifest validates.
- [ ] Production output contains no unexpected eager demo/WebGPU chunk.
- [ ] Authored implementation context ≤90,000 tokens.
- [ ] Every category budget passes.
- [ ] `.context/implementation.md` deterministically contains the whole first-party implementation and tests below the hard threshold.
- [ ] Full textual report exposes, but does not count, excluded lock/generated files.
- [ ] Large migration documentation is stored outside final website context.

### Commands

A clean checkout must pass:

```sh
corepack enable
pnpm install --frozen-lockfile
pnpm exec playwright install chromium
pnpm check
pnpm context:bundle
```

## 21. Agent execution rules

An implementation agent receiving this document must:

1. inspect the current branch and baseline before editing;
2. follow phases in order;
3. preserve behavior until a replacement is tested;
4. avoid a big-bang rewrite;
5. never add a second representation to “temporarily” solve drift without an explicit deletion step in the same phase;
6. use value-derived types and `satisfies`;
7. keep domain data React-free;
8. write pure tests before moving stateful browser logic;
9. report context and graph deltas after every phase;
10. stop and surface a product decision only when current rendered behavior and this fixed specification directly conflict;
11. default to deletion of stale `/mobile` and `/agents` HTML behavior while preserving redirects and optional Markdown-only documents;
12. not weaken tests to obtain a green build;
13. not exclude essential source from the context budget;
14. not create generic abstractions without at least two consumers or one explicit invariant;
15. not copy Local Studio internals;
16. not edit generated output;
17. not claim formal HVM optimality;
18. keep commits scoped to one ownership change;
19. include exact files changed, tests run, token delta, and remaining phase in each handoff;
20. finish only when the acceptance checklist is mechanically green.

## 22. Reference principles

- Lambda calculus models computation through abstraction, application, binding, and reduction. Apply those ideas as pure functions, composition, explicit inputs, and deterministic transformation.
- Victor Taelin’s “Towards an Optimal Computer” emphasizes that computational models influence design and that global mutation and nonlocal operations create practical complexity. Apply the locality lesson: canonical terms should reduce through bounded, explicit transformations.
- HVM2 presents a low-level IR and multiple execution backends, while recommending a separate human-facing frontend. Apply that separation: the site model/content IR is human-authored; React, Markdown, XML, JSON, headers, and machine text are derived backends.
- Do not transfer claims about interaction-combinator parallelism to a React website. Transfer the engineering discipline: small core representations, explicit boundaries, local rewrites, multiple deterministic interpreters, and no copied outputs.

Sources used for the conceptual framing:

- https://gist.github.com/VictorTaelin/46936b9fdfc3f982f07963c11756e36b
- https://en.wikipedia.org/wiki/Lambda_calculus
- https://github.com/HigherOrderCO/HVM2

Repository evidence used for the audit:

- `gildrb/ls-web` at `8a26cb837a57db111b43df463197a38b839386d6`
- `gildrb/ls-designmd/design.md`
