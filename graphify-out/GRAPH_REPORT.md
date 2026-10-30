# Graph Report - kestrel-web  (2026-10-30)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 338 nodes · 936 edges · 16 communities (14 shown, 2 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 3 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `7bcc08da`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Community 0
- Community 1
- Community 2
- Community 3
- Community 4
- Community 5
- Community 6
- Community 7
- Community 8
- Community 9
- Community 10
- Community 11
- Community 12
- Community 13
- Community 14
- Community 15

## God Nodes (most connected - your core abstractions)
1. `vitest` - 32 edges
2. `react` - 27 edges
3. `@testing-library/react` - 22 edges
4. `QuotePage()` - 18 edges
5. `BookingForm()` - 17 edges
6. `compilerOptions` - 17 edges
7. `AsyncStatus` - 15 edges
8. `Link()` - 15 edges
9. `ShipmentDetail()` - 14 edges
10. `Shipment` - 13 edges

## Surprising Connections (you probably didn't know these)
- `renderApp()` --calls--> `RouterProvider()`  [EXTRACTED]
  tests/helpers.tsx → src/lib/router.tsx
- `Harness()` --calls--> `Link()`  [EXTRACTED]
  tests/lib/router.test.tsx → src/lib/router.tsx
- `Harness()` --calls--> `Routes()`  [EXTRACTED]
  tests/lib/router.test.tsx → src/lib/router.tsx
- `Harness()` --calls--> `useNavigate()`  [EXTRACTED]
  tests/lib/router.test.tsx → src/lib/router.tsx
- `CarrierSelectProps` --references--> `Carrier`  [EXTRACTED]
  src/components/CarrierSelect.tsx → src/api/types.ts

## Import Cycles
- None detected.

## Communities (16 total, 2 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.10
Nodes (45): react, describeError(), CarrierSelect(), ErrorBanner(), ErrorBannerProps, FormField(), FormFieldProps, LoadingSpinner() (+37 more)

### Community 1 - "Community 1"
Cohesion: 0.10
Nodes (46): buildPath(), createShipment(), getShipment(), listCarriers(), RequestOptions, requestQuote(), reserveShipment(), RouteName (+38 more)

### Community 2 - "Community 2"
Cohesion: 0.07
Nodes (35): dependencies, react@18.3.1, react-dom@18.3.1, description, devDependencies, jsdom@25.0.1, @testing-library/dom@10.4.2, @testing-library/jest-dom@6.6.3 (+27 more)

### Community 3 - "Community 3"
Cohesion: 0.17
Nodes (17): @testing-library/react, @testing-library/user-event, vitest, listTrackedShipmentIds(), read(), trackShipment(), untrackShipment(), carriers (+9 more)

### Community 4 - "Community 4"
Cohesion: 0.12
Nodes (24): App(), appRoutes, EmptyState(), EmptyStateProps, Layout(), LINKS, NavBar(), matchPath() (+16 more)

### Community 5 - "Community 5"
Cohesion: 0.07
Nodes (28): if, permissions, uses, if, uses, if, uses, jobs (+20 more)

### Community 6 - "Community 6"
Cohesion: 0.11
Nodes (18): compilerOptions, exactOptionalPropertyTypes, isolatedModules, jsx, lib, module, moduleResolution, noEmit (+10 more)

### Community 7 - "Community 7"
Cohesion: 0.21
Nodes (6): baseUrl(), readBody(), request(), ApiError, extractDetail(), isApiError()

### Community 9 - "Community 9"
Cohesion: 0.33
Nodes (5): description, excluded_tools, prompt, single_project, tool_description_overrides

### Community 10 - "Community 10"
Cohesion: 0.53
Nodes (4): FlagEnv, isMultiCarrierQuotesEnabled(), parseFlag(), TRUTHY

### Community 11 - "Community 11"
Cohesion: 0.80
Nodes (4): formatMoney(), parseMoneyInput(), roundMoney(), sumMoney()

### Community 12 - "Community 12"
Cohesion: 0.50
Nodes (3): uvx, serena, start-mcp-server

### Community 13 - "Community 13"
Cohesion: 0.50
Nodes (3): github>kestrel-freight/adlc-kit//monitor/renovate-preset.json#v0.1.0, extends, $schema

### Community 14 - "Community 14"
Cohesion: 0.50
Nodes (3): encoding, language_servers, project_name

## Knowledge Gaps
- **3 isolated node(s):** `uvx`, `start-mcp-server`, `github>kestrel-freight/adlc-kit//monitor/renovate-preset.json#v0.1.0`
  These have ≤1 connection - possible missing edges. (Counts symbols only; 104 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `vitest` connect `Community 3` to `Community 0`, `Community 1`, `Community 2`, `Community 4`, `Community 7`, `Community 10`, `Community 11`?**
  _High betweenness centrality (0.135) - this node is a cross-community bridge._
- **What connects `uvx`, `start-mcp-server`, `github>kestrel-freight/adlc-kit//monitor/renovate-preset.json#v0.1.0` to the rest of the system?**
  _3 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.10023310023310024 - nodes in this community are weakly interconnected._
- **Why does `react` connect `Community 0` to `Community 1`, `Community 2`, `Community 3`, `Community 4`?**
  _High betweenness centrality (0.118) - this node is a cross-community bridge._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.1047065044949762 - nodes in this community are weakly interconnected._
- **Why does `@testing-library/react` connect `Community 3` to `Community 0`, `Community 1`, `Community 2`, `Community 4`?**
  _High betweenness centrality (0.041) - this node is a cross-community bridge._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.06756756756756757 - nodes in this community are weakly interconnected._