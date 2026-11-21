---
title: Indexer troubleshooting
---

# Indexer troubleshooting

Collect the chain configuration, process logs, queue depths and last confirmed indexed range before changing the installation. Fix the failing dependency or scope and repeat its verification.

## AMQP connection refused

For `Expected ConnectionOpenOk` / `ConnectionClose`, inspect broker reachability, credentials, permissions and the exact virtual host. `hyperion` and `/hyperion` are different names. Use `rabbitmqctl list_vhosts` and compare the value with `config/connections.json`.

Keep the AMQP listener (`amqp.host`) distinct from the HTTP management endpoint (`amqp.api`). TLS and container service names must match the actual network path. A TCP connection alone does not establish authentication or vhost access.

## MongoDB connection failed

Core startup constructs and checks a MongoDB client. Setting `mongodb.enabled: false` skips relevant collection creation; it does not remove the startup connectivity requirement. Verify the configured host, port, credentials and service logs. Do not assume an API-only process can start without this check either.

For retrying writes, inspect the first database error and outstanding queue work. A failed batch remains pending and is retried rather than being counted as successfully indexed. Persistent failures can therefore keep progress behind head.

## Indexer stuck after ABI scan

Inspect `indexer.abi_scan_mode` and `settings.auto_mode_switch`. ABI-scan mode forces trace/block fetching off while scanning deltas. If automatic switching is not enabled, completion of the ABI pass does not start full action indexing for you. Confirm completion and source coverage before switching modes and restarting.

## Purge queues fails on startup

`indexer.purge_queues` is a destructive startup option. For management API failures, check the HTTP endpoint, vhost and credentials. Do not reset the broker to repair a wrong endpoint. Preserve pending deliveries unless deliberate replay and recovery are part of the plan.

## Protocol or coverage unavailable

HTTP 503 `protocol_projection_unavailable` means the requested extension projection is not ready for serving; it is not an empty data result. Keep unaffected retained-history reads separate. Inspect the provider/profile identity, initialization inputs and ABI/source coverage before retrying the affected scope.

If a route you expected a plugin to back still answers `protocol_projection_unavailable`, it has no backing. Check that the plugin is enabled for the API, that `features.stateful_owner_v2.maximumServingLagBlocks` is set and that no other plugin claims the same route.

HTTP 503 `stateful.query-unavailable` on a backed route means its owner or view is not ready, or the view trails its finality target by more than `maximumServingLagBlocks`. HTTP 400 `invalid_state_request` means the backing refused the parameters themselves; retrying the same request will not help. See [plugin-backed core state routes](/extend/projections/#plugin-backed-core-state-routes).

## Catalog segment refused or settle stopped

Neither an attestation refusal nor a settle refusal stops live indexing, but both stop `settled` and proof-store rotation from advancing past the affected block range. Do not delete proof-store indices while a refusal is active.

- **Segment attestation refusal** (`[WARNING] Catalog segment <manifestSha256> (blocks <startBlock>-<endBlock>) disagrees with this indexer's ABI commits and is not adopted: <message>`): the coordinator refuses that `manifestSha256` for the rest of its run. Compare `range-server --seal`'s inputs (`--protocol`, `--ship-abi`, `--state-history`, `--blocks-dir`, `--catalog-dir`, node revision) with the indexer's protocol package and SHiP source, and check that `segments_dir` does not hold competing segments for the same base. Once fixed, remove the bad segment and any segments chained on top of it from `--seal-dir` / `segments_dir` and let `range-server --seal` reseal from the last good link; the coordinator attests the replacement automatically when it is the sole candidate for that base.
- **Settle refusal** (`[WARNING] Catalog settle stopped at blocks <from>-<to>: <message>`): inspect the reason. Common causes are a body mismatch beyond `protocol` metadata (align `range-server` flags such as `--index-prefix`, `--index-version`, `--partition-size`, `--system-contract`, `--index-transfer-memo` and `--doc-profile-id` with the chain config), a live document in Elasticsearch with no matching disk document, a segment not yet adopted by the coordinator, or a repair ID already occupied by a document outside the range. Settling retries automatically on `settle.interval_ms` once the mismatch is resolved.

## Proof store rotation and retirement

With `settings.protocol_abi_history.rotation`, the indexer logs `Rotated proof stores to generation <N> ...` on each switch and `Proof store generation <prev> is retired and no longer read; delete <indices> to reclaim it` once settling is `retire_margin_blocks` past the switch block and `retire_after_ms` has elapsed. `drop_previous` is `false` by default; only set it to `true` when you want the indexer to delete those four Elasticsearch indices (and any older unreferenced generation indices left by a restart) automatically. See [disk ABI history, settling and proof-store rotation](/extend/protocols/#disk-abi-history-settling-and-proof-store-rotation).

## Source

[Startup MongoDB check](https://github.com/eosrio/hyperion-history-api/blob/e1818923065d648a38009572d76badeab0684af1/src/indexer/modules/master.ts), [configuration mode handling](https://github.com/eosrio/hyperion-history-api/blob/e1818923065d648a38009572d76badeab0684af1/src/indexer/modules/config.ts), and [projection readiness](https://github.com/eosrio/hyperion-history-api/blob/e1818923065d648a38009572d76badeab0684af1/src/api/helpers/protocol-state-readiness.ts).
