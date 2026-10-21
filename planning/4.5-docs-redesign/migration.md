# Full Hyperion 4.5 documentation migration

The user authorized the complete migration on 2026-10-20 and explicitly requested released 4.5 wording. Public docs now describe Hyperion 4.5, without preview banners, unreleased labels or self-referential links back to the old site.

## Source and content validation

- Core: immutable `release/4.5` commit `e1818923065d648a38009572d76badeab0684af1`, fetched before review in a separate source worktree. The original dirty API checkout was preserved.
- Source ledger: `source-validation.json` records SHA-256 hashes for 27 operator/runtime implementation files. The API export records its additional schema/route hashes.
- Stream Client: committed source `99ad2cf1ee47ee7c8c5cf3ea7a4f35bfbdf4ff11`; migrated examples use awaited stream objects and async iteration, rather than obsolete global handlers.
- Explorer: committed source `1b00573025a3e8e0db42e99bd17663cc02cc9eb2`; checked engine range, SSR script, bind variables, port and core proxy path.

The core branch package metadata still says 4.0.7. The public documentation release is 4.5; the source-export metadata preserves the actual source package version. At final publication, update the pin/export against the final release artifact rather than fabricating a tag or version bump in the API checkout.

Source checks corrected MongoDB startup requirements, `CONFIG_JSON` process invocation, PM2's reserved `example*` configs, actual ascending-query guards, stream replay limits, protocol readiness errors, portable projection boundaries, old configuration paths, historical phantom routes and unsafe broker-reset guidance.

Current upstream Elastic, RabbitMQ, MongoDB, Canonical LXD and Microsoft WSL documentation informed service-operating guidance. Their installation/upgrade procedures remain linked to their owning documentation rather than copied into a frozen dependency matrix.

## URL contract

`website/legacy-anchors.json` captures the currently published article content: 24 pages and 410 anchors. Every original page is now a canonical rendered Docusaurus page. Heading aliases are compiled into MDX beside corresponding sections and work under both SSR and client navigation. Source changes and contract changes invalidate the MDX cache explicitly.

`website/foundation-anchors.json` retains 72 anchors from the earlier 15 local `/next/` pages. Static aliases preserve query strings/fragments and point to current canonical pages. Existing asset paths are retained, with source provenance in `.impeccable/assets-provenance.json` and embedded origins for raster files.

## Coverage

All 24 incumbent content pages have migrated. The complete site currently contains 87 indexed pages: onboarding, installation variants, configuration, upgrades, repair/lifecycle runbooks, troubleshooting, provider discovery, Explorer/QRY integration, extensions, release guidance and generated references.

The exporter accounts for all 53 TypeScript route definitions and 70 declared methods, shared schemas and both creation templates. It separately records node discovery, chain wildcard forwarding and non-TypeScript artifacts outside the emitted core route tree. Provider plugin/runtime availability is not inferred from a static core export. Undeclared response shapes stay unspecified.

## Validation record

- TypeScript checking and three source/migration/example contract tests pass.
- Production Docusaurus build and Pagefind indexing pass.
- Every published path/anchor and earlier local alias/anchor is checked by `npm run check:migration` against rendered HTML; duplicate expected anchor IDs fail the check.
- `npm run check:links` validates 6,776 rendered internal paths and fragments across 103 HTML files, including compatibility bridges.
- Release-copy checks reject old preview/unreleased wording in rendered page text. Technical legacy IDs and the real `settings.preview` configuration key are preserved for compatibility/source accuracy, without appearing as a release-status label.
- CI runs the same migration check on Node 22 and 24. Local validation used Node 26.4.0; remote CI has not run in this session.

The independent final review returned `ship` with no material fixes. Its sampled content review, all 27 source-ledger hash comparisons, ten browser captures and design handoff are recorded under `.impeccable/review/migration/`. Desktop/mobile navigation, search, theme switching, published anchors and query/fragment-preserving local aliases were exercised in-browser. The final build also includes the legacy stylesheet/script asset URLs, CNAME and `.nojekyll`.

## Publication and runtime boundaries

The publishing workflow builds Docusaurus, runs the checks and deploys that exact artifact with search/aliases/CNAME intact. Publication requires a final `4.5.x` or `v4.5.x` tag for both tag-triggered and manually dispatched runs. Branch pushes, PRs and merges do not publish. The migration review itself did not commit, push or publish; subsequent PR preparation is separate from release publication.

This work validates documentation against source and the rendered site. It does not execute a production installation, retained-history upgrade, database restore, external QRY onboarding or arbitrary provider health certification. Runtime/source coverage and actual service compatibility remain deployment-specific and are documented as capabilities/limits, without calling the site a preview.

The previous recorded toolchain audit retains one unpatched `braces` root advisory (28 high dependency-chain entries). This task does not call the audit clean or claim remote Node 22/24 CI or publication acceptance.
