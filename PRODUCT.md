# Hyperion documentation

<!-- impeccable:product-schema 1 -->

## Platform

web

## Product Purpose

Documentation for Hyperion History API and its related tools, SDKs and plugins for Antelope chains. The user requested a complete documentation redesign ahead of 4.5 on 2026-10-20 and then authorized starting the recommended implementation. The full migration is built locally for publication with 4.5.

## Stack

Docusaurus, task-based homepage, handbook articles, Pagefind search, self-hosted fonts and GitHub Pages. The old MkDocs tree is retained as the migration baseline. The user authorized full content migration and released 4.5 wording on 2026-10-20. Publication builds the new site from a 4.5 tag or explicit workflow dispatch; no publication has run in this work.

## Users

The user confirmed balanced treatment of API developers and node operators in chat on 2026-10-20. Plugin authors and maintainers are proposed additional paths, supported by the companion repositories.

## Capabilities and Constraints

- Published documentation: https://hyperion.docs.eosrio.io/ ; source: this repository.
- Keep existing URLs and anchors recoverable during any future migration.
- Documentation version 4.5 and API route versions v1/v2 describe different things.
- Validate behavior against the pinned release/4.5 source. Architecture-only requirements are not implemented runtime behavior. Public docs present 4.5 as released, with concrete capability limits rather than preview labels.
- Work in planning/4.5-docs-redesign preserves the proposal and validation evidence. website/ is the active 4.5 documentation source. Preserve all published URLs/anchors and original asset paths; retain earlier local /next/ links as aliases.

## Brand Commitments

The adjacent hyperion-history-api PRODUCT.md records user-confirmed commitments on 2026-10-20: Hyperion mark and blue #0094d2 lead; Rio Blocks visual system; Inter and JetBrains Mono; dark and light themes; flat gem with heartbeat H; no rotating EOS-like solid. The old blue/orange Material theme is not brand authority. The user authorized starting the recommended task homepage and handbook composition.

## Evidence on Hand

- docs/, mkdocs.yml, requirements.txt and .github/workflows/deploy-docs.yml.
- hyperion-history-api source, hyperion-tools architecture and roadmap, SDK and plugin sources.
- planning/4.5-docs-redesign/research.md records current source evidence and its limits.
