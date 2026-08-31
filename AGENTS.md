# Agent instructions

## Local server policy

- Never start a local HTTP server from an agent tool call.
- Forbidden commands include `bun run dev`, `bun run dev:lan`, `bun run preview`, and any command that starts scripts/serve.mjs or a local HTTP server.
- Do not run local Playwright E2E or visual commands that depend on a web server. The user starts the server manually.
- Build, typecheck, lint, unit, and static validation commands are allowed only when they do not start a server.
- Do not bypass this policy with raw Node scripts, shell backgrounding, alternate ports, or detached processes.

## Runtime policy

- Bun is the package manager, bundler, dev/preview server, and unit test runner. There is no Vite and no pnpm.
- StyleX-heavy scripts (`build`, `prerender`, `stylex:check`, `dev`) run with `BUN_JSC_useJIT=0`: Bun 1.4.0 miscompiles the StyleX-bundled CSS media-query parser after warmup. Drop the flag when Bun fixes it.
