# Agent instructions

## Local server policy

- Never start a local HTTP server from an agent tool call.
- Forbidden commands include `bun dev`, `bun run dev`, `bun run dev:lan`, `bun run preview`, `vite`, `vite preview`, `bun --bun vite`, and equivalent direct or background commands.
- Do not run local Playwright E2E or visual commands that depend on a web server. The user starts the server manually.
- Build, typecheck, lint, unit, and static validation commands are allowed only when they do not start a server.
- Do not bypass this policy with raw Node scripts, shell backgrounding, alternate ports, or detached processes.

## Runtime policy

- Bun is the package manager, script runner, and unit test runner (`bun install`, `bun run`, `bun test tests/unit`).
- The Vite/StyleX pipeline (`vite`, `scripts/prerender.mjs`, `scripts/stylex-check.mjs`) runs on the Node runtime: Bun 1.3.14 miscompiles the StyleX-bundled CSS media-query parser after warmup (deterministic; any code perturbation hides it). `BUN_JSC_useJIT=0` works around it if a pure-Bun build is needed; revisit when Bun ships a fix.
