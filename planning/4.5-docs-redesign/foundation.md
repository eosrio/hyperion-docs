# Hyperion 4.5 documentation foundation

Implementation snapshot: 2026-10-20. Branch: `feat/docs-4.5-foundation`.
Base: `3f6759653e2c2c3ccf5ed72ebe61cacde6d2b0d8`.

The task homepage and handbook direction from the proposal are implemented in
`website/`. API developers and node operators have equal entry paths. This is a
reviewable foundation for the redesign; the full content migration and release
qualification remain open.

## Implemented

- Docusaurus task homepage, six-section handbook, contextual sidebar and local
  table of contents, responsive navigation, and dark/light themes.
- Self-hosted Inter and JetBrains Mono, the approved Hyperion mark, and the Rio
  Blocks palette, hairlines and small corners.
- Fifteen guide, reference and release pages. Developer coverage includes a
  first query, action filtering/pagination and streaming boundaries. Operator
  coverage includes chain configuration and independent indexing/serving checks.
- Copyable cURL/JavaScript examples and PM2/systemd configuration tabs.
- Local Pagefind search, keyboard shortcut, result navigation, empty/loading/error
  states, and focus restoration after dismissal.
- A partial source-derived reference for three core API endpoints and chain
  configuration template values, plus a downloadable OpenAPI snapshot. Every
  export identifies its source commit and file hashes; it does not claim complete
  runtime registration or plugin coverage.
- A 24-path migration manifest, six preview URL bridges, and the API v2
  compatibility index with historical anchors. Unmigrated routes and guide
  fragments remain an explicit publication gate.
- Build-only GitHub Actions workflow for Node 22 and 24, producing a review
  artifact without changing the incumbent MkDocs publishing workflow.

## Local verification

Actual local runtime: Node 26.4.0 and npm 12.1.0. The configured Node 22/24 CI matrix
has not run remotely in this session.

| Check | Result |
| --- | --- |
| TypeScript check | Passed |
| Contract tests | 3 passed |
| Static production build | Passed |
| Pagefind | 16 indexed pages: homepage and 15 docs pages |
| Rendered internal links and anchors | 737 links across 23 HTML pages passed |
| Source export reproducibility | Repeated output hash matched |
| Mechanical design detector | One pass, no findings |
| Browser interactions | Language tabs, copy feedback, search/results/empty state, Escape/focus restoration, mobile navigation and theme toggle passed |
| Legacy browser navigation | `/dev/howtouse/` reached the first-query guide; `/api/v2/#v2historyget_actions` retained its anchor and linked to the generated reference |

The source exporter reads immutable API commit
`79af10986bc0e2aa84cce3788aea202d23547818` (package 4.0.7) through `git show`,
including its pure schema helpers. It does not load runtime handlers or inspect
dirty source files. The generated OpenAPI snapshot's SHA-256 was
`44F49406D7C1BE2BAF1D31177BAD585B2E421BDDD394FE5CEB927D9FC79F9A30`.

Representative desktop/mobile, article/reference, light-theme and search captures
are in `.impeccable/review/`. Viewport checks found no document-level horizontal
overflow at the sampled sizes. Representative text/link contrast checks exceed
5.5:1. The independent review found low-contrast stock syntax colors; the corrected
Prism palettes have minimum contrast of 6.10:1 in light mode and 8.03:1 in dark
mode across every configured text-token group. These samples are not a full
accessibility certification. Copy-button
feedback was observed; external clipboard contents were not independently
accepted as evidence.

The independent finish review is recorded in
`.impeccable/review/finish-review.md`. Its initial review found the syntax-contrast
defect above and otherwise matched the accepted direction. The subsequent verdict
pass scored that finding resolved and returned `ship` at the fix-list scope; all
12 recaptures were valid. That verdict is not production-release approval or full
content-migration acceptance.

The final built design is recorded in `DESIGN.md` and `.impeccable/design.json`.
These describe the actual tokens, component states and responsive rules, including
the corrected syntax palettes. Read them before extending the interface.

## Remaining release gates

1. Complete the migration manifest, including all old page and fragment URLs,
   meaningful redirects, historical archives and metadata.
2. Qualify the installation, upgrade, rollback and recovery procedures against
   supported runtime/component versions and realistic existing data.
3. Extend source exports to registered routes, response/error contracts, plugin
   availability and versioned configuration with runtime owners.
4. Convert accepted 4.5 architecture into release claims only after the owning
   integration and acceptance work passes. Preserve the distinction between
   current behavior, accepted design and qualified release behavior.
5. Run the CI matrix and address the remaining build-tool dependency advisory.
   The current audit reports 28 high-severity dependency-chain entries rooted in
   the single unpatched `braces` advisory GHSA-vfj7-8cjw-p6xm; it is not a clean
   audit. See `website/README.md` for the qualification boundary.
6. Accept the final built artifact in the intended hosting environment, including
   redirects, search assets, base paths, headers and indexed release metadata.

No commit, push, production deployment or domain cutover was performed. The new
preview has `publicationReady: false`; the existing documentation remains the
published operational reference.

## Continue locally

From `website/`, run `npm ci`, `npm run typecheck`, `npm test`, `npm run build`,
`npm run check:links`, then `npm run serve`. The production preview is served at
`http://127.0.0.1:3045/`; search requires the built Pagefind index.
