# Local Studio web design contract

This is the source of truth for the landing page and its embedded Local Studio React DOM showcases. It documents the intentional boundary between the public website and the product UI so that neither system accidentally inherits the other.

`MUST`, `MUST NOT`, and `SHOULD` are normative.

## 1. Two visual systems, one page

| Surface | Purpose | Styling authority | React authority |
| --- | --- | --- | --- |
| Public website | Marketing pages, navigation, story copy, calls to action | `src/styles/global.css` | `src/main.tsx`, `src/App.tsx`, page and section components |
| Embedded Local Studio | Hero workbench and five product showcase scenes | `src/styles/ls/*.css`, projected to `src/styles/ls-app.css`, then adapted by `src/styles/workbench-demo.css` | `src/sections/HeroDemo.tsx` and `src/sections/story/*.tsx` |

The public page and embedded app deliberately use different type ramps, spacing, radii, colors, and control density.

- Landing-page components MUST use the semantic page tokens in `global.css`.
- Product DOM inside `.demo` MUST use Local Studio tokens such as `--ui-*`, `--fs-*`, `--rad-*`, `--bg`, `--fg`, and `--separator`.
- Landing typography such as `--type-body` and `.button` MUST NOT leak into `.demo`.
- Local Studio resets and component selectors MUST remain scoped below `.demo`; they MUST NOT restyle the website after the lazy demo chunk loads.
- Product screenshots are reference material. The homepage showcase itself MUST remain live React DOM.

## 2. File ownership

### Public website

- `src/styles/global.css`: page tokens, typography, navigation, hero, sticky story, responsive rules, reduced motion, and public focus treatment.
- `src/main.tsx`: the single `createRoot` call, `StrictMode`, global input-mode tracking, and image behavior.
- `src/App.tsx`: local routing and lazy route boundaries.
- `src/sections/Hero.tsx`: immediate hearth plus the neutral lazy boundary for the hero workbench.
- `src/sections/ProductStory.tsx`: sticky story state, proximity mounting, neutral placeholder, and announcements.
- `src/content/product-features.tsx`: ordered public story copy and scene slugs.

### Embedded Local Studio

- `src/styles/ls/tokens.css`: canonical product tokens.
- `src/styles/ls/base.css`: canonical product reset and base behavior.
- `src/styles/ls/chat.css`: canonical product message styling.
- `src/styles/ls-app.css`: generated, `.demo`-scoped projection of the three files above. Do not edit it by hand.
- `src/styles/workbench-demo.css`: hand-maintained bridge for framing, compact typography, clipping, and website-specific product-preview behavior.
- `src/sections/HeroDemo.tsx`: interactive workbench preview.
- `src/sections/story/demo-frame.ts`: shared story geometry and responsive scaling.
- `src/sections/story/demo-shell.tsx`: product theme host and transformed render plane.
- `src/sections/story/FeatureDemo.tsx`: typed scene registry.
- `src/sections/story/{control,serve,work,automate,configure}-demo.tsx`: feature-focused scenes.
- `src/sections/demo-tab-boundary.ts`: removes embedded controls from the website tab order.
- `src/hooks/use-element-activity.ts`: pauses hero work when offscreen or when the document is hidden.

## 3. Token and typography boundary

### Public website

The website uses semantic tokens rather than component-local color literals. The primary groups are:

- Color: `--background`, `--foreground`, `--dim`, `--subtlest`, `--border*`, `--hover`, `--surface-faint`.
- Typography: `--type-hero-title`, `--type-header-title`, `--type-subheadline`, `--type-section-title`, `--type-compact-heading`, `--type-body`, `--type-meta`.
- Shape: `--radius-control`, `--radius-compact`, `--radius-frame`, `--radius-card`, `--radius-panel*`.
- Layout: `--page-width`, `--page-gutter`, `--homepage-story-gap`, `--nav-height`.

New page colors MUST be reusable semantic tokens. Embedded product palettes are the documented exception because they reproduce a separate application.

### Local Studio product DOM

Local Studio is denser than the landing page. The effective embedded ramp is:

| Role | Token | Size |
| --- | --- | --- |
| Micro metadata | `--fs-2xs` | 10px |
| Labels and secondary metadata | `--fs-xs` | 11px |
| Buttons and compact controls | `--fs-sm` | 12px |
| Product base text | `--fs-base` | 14px |
| Product headings | `--fs-lg` through `--fs-3xl` | 16px through 24px |
| Hero composer exception | `#hero-demo-composer` | 16px minimum |

Rules:

1. Local Studio buttons SHOULD be 28px high with 11–12px labels. They MUST NOT inherit the landing page’s 16px button text.
2. The composer stays at least 16px to avoid browser zoom and preserve readable text entry.
3. `workbench-demo.css` explicitly maps product class strings such as `text-[length:var(--fs-sm)]` because this website’s Tailwind build does not emit those source-app arbitrary utilities reliably. Removing the bridge requires computed-style verification first.
4. Product headings MUST be reset to Local Studio’s family, weight, line-height, and tracking when a broad website heading rule could win.
5. Controls MUST use Local Studio radii and surface tokens, never the public `.button` class.

## 4. React DOM architecture

There is one React tree.

- `src/main.tsx` calls `createRoot` once and renders `App` inside `StrictMode`.
- The hero and story use lazy React components, not additional roots, iframes, static screenshots, or injected HTML.
- `Hero.tsx` lazy-loads `HeroDemo` behind `.hero__demo-placeholder`.
- `ProductStory.tsx` lazy-loads `FeatureDemo` only when the visual is within an `800px` root margin.
- `FeatureDemo` maps the typed `FeatureScene` union to one scene component.
- A scene change remounts the selected scene through the keyed wrapper in `ProductStory`.
- `DemoShell` supplies `.demo.ls-app`, `data-theme="zai-dark"`, the scene identifier, a semantic label, and the transformed render plane.

The story is a visual showcase rather than a second application navigation surface:

- `useDemoTabBoundary` forces descendants to `tabIndex=-1`, including descendants added later.
- Story controls have pointer events disabled by `global.css`.
- The selected feature is announced through a visually hidden polite status.
- The hero workbench remains interactive with pointer input while still staying outside the normal tab sequence.

## 5. Frame geometry

Geometry is policy, not per-scene decoration.

### Hero workbench

| Value | Contract |
| --- | --- |
| Logical canvas | `1392 × 787px` |
| Mobile breakpoint | `900px` |
| Mobile fit width | `950px` |
| Desktop behavior | Native scale; clip only when the centered stage is narrower than the app |
| Mobile behavior | Scale from host width and crop the right/bottom edges deliberately |

The hero frame is owned by `HeroDemo.tsx`. It includes workbench shell context because the hero demonstrates a complete session.

### Product story

| Value | Contract |
| --- | --- |
| Render plane | `1168 × 787px` |
| Desktop scene fit | `820px` |
| Mobile scene fit | `680px` |
| Desktop crop height | `787px` |
| Mobile crop height | `580px` |
| Mobile breakpoint | `900px` |

`STORY_CROP` in `demo-frame.ts` is the only shared story crop policy. Every story scene MUST pass `crop={STORY_CROP}`.

- Scene content uses one 820px desktop canvas and one 680px mobile canvas.
- A scene MUST NOT add private zoom, transform, or crop values to compensate for its layout.
- Feature content should fill the shared frame without unrelated sidebar, Finder, chat, or shell chrome.
- Mobile may hide secondary details when needed, but primary functionality MUST remain complete and unclipped.
- The frame keeps the product’s compact density; do not enlarge content merely to fill unused space.

## 6. Frame treatment and loading

The visible product frame is created by `.demo` in `workbench-demo.css`:

- Product background and foreground come from Local Studio tokens.
- A 10px frame radius and product-depth shadow are shared.
- `::before` draws the one-pixel frame edge.
- `::after` adds a very restrained product-surface highlight.

Loading rules prevent the old “light, disappear, fade back in” artifact:

1. Hero and story fallbacks MUST be neutral dimension-preserving blocks.
2. A fallback MUST NOT have the `.demo` class or frame pseudo-elements.
3. Frame lighting and product content appear in the same React commit.
4. Story scenes MUST NOT use an opacity entrance after Suspense resolves.
5. Placeholder dimensions MUST match the desktop/mobile crop to avoid layout shift.

## 7. Sticky story sequencing

`ProductStory` and the `.story__*` rules in `global.css` form one system:

- `ResizeObserver` measures the showcase and sticky stage.
- Passive scroll events schedule one `requestAnimationFrame` update.
- Scroll progress selects one of the ordered `productFeatures` and writes `--story-progress` for the active hairline timer.
- Desktop keeps the feature list and visual pinned in a two-column stage.
- At 900px and below, only active copy is shown above the visual; the same scroll track still advances scenes.
- The scroll track owns progression. Do not add manual carousel controls or an independent autoplay loop.

## 8. Scene contracts and provenance

All scenes reproduce product layout and labels from `src/ls/`; illustrative values may be static, but the UI must show a useful populated state.

| Scene | What it demonstrates | Product sources to compare |
| --- | --- | --- |
| `control` | Proxied token totals, request/session statistics, and token activity | `src/ls/features/usage/usage-page.tsx`, `token-activity-heatmap.tsx` |
| `serve` | Hardware-matched model choices and weight selection | `src/ls-contracts/model-index.json`, `src/ls/features/recipes/recipes-content/picks-shared.tsx` |
| `work` | Loaded model, live inference metrics, trends, GPUs, and controller logs | `src/ls/features/dashboard/control-panel/*` |
| `automate` | Populated schedules, task instructions, run controls, model assignment, and run history | `src/ls/features/agent/automations/*` |
| `configure` | Local and remote machines plus a distributed serving pool | `src/ls/features/configure/rigs-section.tsx`, `rig-node-card.tsx` |

Content rules:

1. Show functionality, not catalog errors, disconnected hardware, or “nothing here yet” states.
2. Empty states may be tested elsewhere, but they are not homepage showcase content.
3. Use names, labels, descriptions, and structures from product source or contracts. Do not invent marketing dashboards, metrics cards, or foreign navigation.
4. Static metrics are illustrative loaded-state data. Their labels, units, hierarchy, and visual treatment MUST match the product.
5. Model examples MUST exist in `src/ls-contracts/model-index.json`.
6. Automation examples MUST track the built-in examples in `automation-editor.tsx`.
7. Configure rows MUST track the machine grouping and node-row structure in the product source.
8. Primary actions must remain compact. Do not duplicate a large call to action in the middle of a populated screen.

## 9. Motion and lifecycle

- The hero hearth is visible immediately; only lightweight foreground content enters.
- Ambient hero work is finite and reduced-motion aware.
- `useElementActive` requires at least 10% intersection and a visible document before hero timers or scrolling work continues.
- Story scenes do not run indefinite animation or polling.
- Off-range story demos unmount; the placeholder preserves geometry.
- Global reduced-motion rules collapse transition/animation duration and disable decorative entrances.
- Native CSS and SVG are preferred over a motion runtime for simple presentation.

## 10. Performance contract

The visual result is not enough; embedded UI must remain cheap while idle.

- Hero and story code stay in separate lazy chunks.
- Do not import product controllers, stores, or API clients just to render a view.
- Runtime-dependent product screens should use view-only DOM with local static props.
- Reuse small source view components only when they do not pull unavailable or heavyweight runtime dependencies.
- Story scenes should not create intervals, polling, or background subscriptions.
- Prefer static SVG paths and CSS over canvas loops.
- Preserve frame dimensions while unmounting content to maintain CLS 0.

After a material demo change, inspect production gzip output. Current guardrails are:

- Initial application chunk: no more than 70kB gzip.
- `FeatureDemo` chunk: no more than 15kB gzip.
- `HeroDemo` chunk: no more than 30kB gzip.
- Idle page: no running animations after bounded entrances settle.

These are ceilings, not targets; smaller is better.

## 11. Keeping the projection current

`src/styles/ls-app.css` is generated from the canonical Local Studio CSS. The generator:

1. scopes root theme selectors to `.demo`;
2. removes app-level `html`/`body` ownership and remote font declarations;
3. removes the source app’s Tailwind `@theme` block because this website owns its Tailwind theme;
4. scopes all remaining product selectors below `.demo`;
5. adapts product-only foreground aliases used by the embedded dark theme.

Commands:

```sh
pnpm design:sync   # regenerate src/styles/ls-app.css
pnpm design:check  # fail when the projection is stale
```

Run `design:sync` whenever `src/styles/ls/tokens.css`, `base.css`, or `chat.css` changes. Website-specific fixes belong in `workbench-demo.css`, not in the generated file.

## 12. Required change workflow

When changing the landing page, hero demo, story, product source snapshot, or design tokens:

1. Read this file and the authoritative product component before editing.
2. Update product source snapshots first, then run `pnpm design:sync` when CSS changed.
3. Keep scene slugs, `FeatureDemo`, `productFeatures`, and this scene table aligned.
4. Verify desktop at 1920×1080 and mobile at 390×844 with the same shared crop values.
5. Check computed product typography: base 14px, controls 11–12px, composer at least 16px.
6. Delay hero/story chunks during one reload check: fallback must have no `.demo`, background, or pseudo-element lighting.
7. Run:

```sh
pnpm design:check
pnpm lint
pnpm build
pnpm exec playwright test tests/ls-design.spec.js tests/interface-guidelines.spec.ts tests/color-tokens.spec.js
```

1. For major changes, rerun the complete Playwright suite and profile cold load, story scrolling, idle CPU, heap, renderer RSS, DOM count, and active animations.

A change is not complete when documentation, generated product CSS, source scenes, or visual verification disagree.
