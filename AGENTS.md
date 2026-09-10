# Agent instructions

## Local server policy

- Never start a local HTTP server from an agent tool call.
- Do not run `vp dev`, `vp preview`, or any other command that starts a local HTTP server. The user starts servers manually.
- Do not run local Playwright E2E or visual commands that depend on a web server.
- Install, build, check, lint, format, unit, and static validation commands are allowed only when they do not start a server.
- Do not bypass this policy with raw scripts, alternate ports, or background processes.

## Toolchain

- Use Vite+ (`vp`) for package management, dev/build/preview, checks, formatting, and tests.
- `vp install` uses the default pnpm workflow and `pnpm-lock.yaml`.
- Configure the toolchain in `vite.config.ts`. Use the official StyleX and WGSL Vite plugins.
- `vp check` runs Oxfmt, Oxlint, and Vite+ typechecking. `vp test` runs the unit suite through Vitest.
- Require zero warnings and zero errors. Do not weaken rules, add exclusions, or suppress diagnostics to pass.
- Never use `any`, casts through `any`, or fake ambient type declarations. Validate external data before giving it a domain type.
- Keep every authored source file in a strict TypeScript project, including scripts, API handlers, and existing tests.
- Application-specific generated-output checks run with `vp run validate`. Playwright remains for browser and visual checks.
