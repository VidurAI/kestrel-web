# adlc_contract — kestrel-web

Derived from AGENTS.md by `adlc baseline`; do not edit here, edit AGENTS.md.

## Build, test, run, lint
- Install: `npm ci`. Test: `npm test` (vitest, jsdom) — the oracle for "an edit landed".
- Build/typecheck: `npm run build` (`tsc --noEmit && vite build`). Dev server: `npm run dev`.

## Conventions
- TypeScript strict. Wire payloads are snake_case and typed in `src/api/wire.ts`; domain
  types are camelCase in `src/api/types.ts`; `src/api/mappers.ts` converts. Never use a
  wire type in a component.
- All HTTP goes through `src/api/client.ts` and its `routes` map; no inline URLs.
- Money formatting and rounding only via `src/lib/money.ts`.
- User-facing copy lives in `src/lib/copy.ts`.

## Do not touch
- `dist/` (build output); `package-lock.json` by hand (use npm).

## Where things are explained
- Backend contract and decisions: the kestrel-services and kestrel-ops repos. Ticket
  ids `WEB-*` in commit messages map to `kestrel-ops:tickets/`.

<!-- adlc:routing:start -->

## Context layer
- context: graphify, serena
- artifact: `graphify-out/graph.json` (check `adlc stale`)
- sensitive paths: none declared
