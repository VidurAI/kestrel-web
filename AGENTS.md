# AGENTS.md — kestrel-web

<!-- Written by the team. Keep it short; agents read this on every task. Do NOT
     duplicate what pom.xml / csproj / pyproject / package.json / CODEOWNERS encode.
     Backticked paths must exist in THIS repo (lint checks). For paths in another repo
     write `repo:path`, e.g. `kestrel-ops:adr/0007-rate-limit-per-carrier.md`. -->

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
## Context routing (kit-owned — do not edit; `adlc init` rewrites this section)

Pick the tool by the shape of the question, not by habit:
- **Graph** (`/graphify query|path|explain`, or `adlc query --level project|org` for
  cross-repo questions): structural questions — who calls this, what breaks if this
  changes, path between two things, which subsystem/community owns it, *why* something
  exists (docs and ADRs are nodes too).
- **grep / file read**: literals — an error string, a config key, a feature flag, a
  column name, a log line. The graph will not beat grep here; do not try.
- **Serena (LSP)**: symbol-precise edits and references — rename, replace a symbol body,
  insert after a symbol, find references across files with type awareness.
- Before trusting the graph run `adlc stale`; exit 0 fresh, 1 usable, 2 rebuild first.
  On a feature branch run `adlc baseline --incremental` before structural queries.
- Levels: this repo's graph answers inside-repo questions; `--level project` answers
  "which consumer breaks"; `--level org` answers "which team/project is affected".
<!-- adlc:routing:end -->

```yaml
adlc:
  schema: 1
  context: [graphify, serena]
  artifact: graphify-out/graph.json
  sensitive: []
  freshness: two-tier
  kit: 0.1.0
```
