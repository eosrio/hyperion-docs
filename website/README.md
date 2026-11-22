# Hyperion 4.5 documentation

The Docusaurus site is the documentation implementation for Hyperion 4.5. It includes the full 24-page migration, preserves published URLs and content anchors, and uses release-facing language throughout.

## Build and validate

Use Node 22 or 24 and the committed npm lockfile:

```bash
npm ci
npm run typecheck
npm test
npm run build
npm run check:links
npm run check:migration
npm run serve
```

Open `http://127.0.0.1:3045/`. Production builds include the Pagefind index. The development server is useful while editing; search verification requires a built index.

## Source reference

The exporter reads immutable `release/4.5` commit `e1818923065d648a38009572d76badeab0684af1` using `git show`. It extracts all 53 TypeScript route definitions, their 70 declared methods, shared schemas and both configuration templates. The inventory accounts separately for node discovery, chain wildcard forwarding and non-TypeScript artifacts excluded from the compiler route tree.

```bash
node scripts/generate-reference.mjs --source /path/to/hyperion-history-api
```

The generator evaluates selected schema expressions/pure helpers in a bounded VM without importing handlers or connecting to services. Exports record exact source-file SHA-256 hashes. The source package metadata still reads 4.0.7 at this branch commit; documentation release identity is 4.5 and the export preserves that source metadata honestly. Update the pin and regenerate at the final publication revision.

These are core source declarations, not a live provider spec. Installed plugin routes, the upstream wildcard's full contract and runtime capability selection belong to the provider's `/docs` specification. Missing response declarations remain unspecified.

## URL and anchor contract

`legacy-anchors.json` captures the 24 published MkDocs pages and 410 article anchors. Every original page is a canonical rendered page. `foundation-anchors.json` retains 72 anchors from the earlier local site; 15 `/next/` aliases preserve query strings and fragments.

The MDX plugin inserts aliases beside matching sections before compilation, preserving the same targets under SSR and client navigation. Its contract hash invalidates the MDX cache when mapping/inventory/plugin behavior changes. `check:migration` verifies every expected path and anchor, unique target IDs, alias forwarding and released UI copy against the built artifact.

Original static assets remain available at their existing paths. `.impeccable/assets-provenance.json` records their original source and checksums. The old `../docs/` tree remains the migration baseline rather than the active site source.

## Publication

The release workflow builds and validates this site before publishing the complete static artifact to `gh-pages`. Publication requires a final `4.5.x` or `v4.5.x` tag, including manual workflow dispatches. Branch pushes, PRs and merges do not publish the site. Preserve `static/CNAME`, the Pagefind output and the alias pages in the deployed artifact.

Release source validation is separate from executing a real production installation, retained-history upgrade or database recovery. Internal migration evidence and remaining runtime/deployment checks are recorded in `../planning/4.5-docs-redesign/migration.md`, without adding work-in-progress labels to public docs.

## Dependency note

The pinned overrides resolve the initial critical/moderate toolchain advisories. The recorded audit still has 28 high dependency-chain entries rooted in one unpatched `braces` advisory, GHSA-vfj7-8cjw-p6xm. This build-tool issue remains recorded and is not called a clean audit. The CI matrix validates Node 22 and 24 when run; local checks identify their actual runtime separately.
