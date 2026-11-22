---
title: Upgrade to Hyperion 4.5
---

# Upgrade to Hyperion 4.5

Upgrade the application and enabled components as a recorded, reversible deployment. Preserve existing Elasticsearch history; initializing a new state or ABI-coverage projection is a separate operation from reindexing history.

## Before upgrading

Record the current core commit, lockfile, plugin/protocol pins, Node version, chain ID, configuration, index names/mappings and retained block ranges. Identify every state endpoint and stream used by consumers. Rehearse the change against copies of the required data and establish the rollback boundary before touching production.

Back up configuration, database data and the exact old artifact. A source checkout alone is not a database backup. Elasticsearch upgrades require their own snapshot/compatibility plan and cannot be undone by checking out older Hyperion code.

## Stop writes cleanly

Drain consumer traffic according to your deployment, then stop the indexer through its controller:

```bash
./hyp-control indexer stop mychain
./stop mychain-api
```

Verify that the indexer has settled outstanding work. Capture queue depths, last indexed block and relevant state checkpoints. Use the installed systemd units when that is your supervisor.

## Update and build

Prepare a separate application directory at the exact 4.5 release tag or commit supplied with the deployment. Reuse reviewed configuration without overwriting the old copy, then install the committed dependency tree:

```bash
npm ci
./hyp-config connections test
./hyp-config chains validate mychain
./hyp-config chains test mychain
```

`npm ci` runs the build and package preparation. On npm versions that reject the locked Git dependencies, use the source CI's invocation-scoped `npm ci --allow-git=all`. Never work around artifact verification by skipping preparation scripts.

Review configuration differences explicitly. Do not use `chains validate --fix`, reset commands, `purge_queues`, a new index version or a new partition size as an automatic upgrade step.

## Preserve history and initialize new capabilities

Keep existing historical indices and read aliases usable. Apply additive mapping/template changes required by the new artifact before writing new metadata. Preserve `settings.index_version` and partitioning unless performing a deliberate data migration.

When enabling a protocol or state component, establish its source coverage and initialization inputs separately. Exact profile/component identity, canonical ABI coverage and current-state readiness cannot be inferred from the existence of older action documents. See [protocol selection](/extend/protocols/) and [projections](/extend/projections/).

## Restart and verify

Start the API/indexer with the configured supervisor. Compare health, a known historical query, state consumers, replay/live transitions and representative errors with the pre-upgrade result. Check existing v1 consumers as well as v2 consumers; preserve sequence strings through JSON clients.

Complete [indexing and serving verification](/operate/verify-indexing/) before restoring full traffic. A green process list is insufficient acceptance.

## Roll back

Stop new writes before switching artifacts. Restore the old application/configuration only when it can read the data and mappings produced since the upgrade. If the database format or enabled projection crossed the recorded rollback boundary, follow the rehearsed restore or forward-recovery plan. Preserve failed-work evidence and source ranges.

## Source

[Supervisor definitions](https://github.com/eosrio/hyperion-history-api/blob/e1818923065d648a38009572d76badeab0684af1/pm2/ecosystem_settings.cjs), [configuration CLI](https://github.com/eosrio/hyperion-history-api/blob/e1818923065d648a38009572d76badeab0684af1/src/cli/hyp-config.ts) and [protocol activation](https://github.com/eosrio/hyperion-history-api/blob/e1818923065d648a38009572d76badeab0684af1/src/indexer/protocol/selection.ts).
