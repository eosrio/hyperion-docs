# Hyperion documentation

Documentation for Hyperion 4.5. Published URL: [hyperion.docs.eosrio.io](https://hyperion.docs.eosrio.io/).

The active site lives in [`website/`](website/README.md), built with Docusaurus and local Pagefind search.

```bash
cd website
npm ci
npm run typecheck
npm test
npm run build
npm run check:links
npm run check:migration
npm run serve
```

Open `http://127.0.0.1:3045/`. Use Node 22 or 24 and the committed npm lockfile.

The migration preserves all 24 published page paths, 410 published content anchors, earlier local links and existing static-asset paths. API and configuration references are generated from the pinned `release/4.5` source. See [migration evidence](planning/4.5-docs-redesign/migration.md), [the original proposal](planning/4.5-docs-redesign/proposal.md) and [the design system](DESIGN.md).

The old `docs/` and MkDocs configuration remain as the historical migration baseline. They are not the active publication source. The release workflow publishes the validated Docusaurus artifact to `gh-pages` only from a final `4.5.x` or `v4.5.x` tag, including manual dispatches. Branch pushes, PRs and merges do not publish the site.
