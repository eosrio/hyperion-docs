---
title: Protocol providers
---

# Protocol providers

Select the protocol before decoding a chain's SHiP requests, blocks, traces and deltas. Protocol interpretation is a separate boundary from contract projections, API domains and storage adapters.

## Default Antelope provider

Omitting `settings.protocol` keeps the Antelope provider. An explicit equivalent is:

```json
{"settings": {"protocol": {"provider": "antelope"}}}
```

Use the normal chain connection configuration for RPC and SHiP endpoints. Retain existing historical indices when upgrading; new ABI/protocol metadata is additive rather than a reason to discard history.

## Extension selection

An extension selection contains `provider: "extension"`, the installed package name and an exact `profileId`. The host verifies inert descriptors, source revisions, file hashes, executable entry coverage and compatible Node/Rust component identities before importing provider code.

Choose the profile that matches the node's actual protocol, contracts and genesis. Package installation alone does not select a chain profile. A profile rejected by artifact or source verification must not be activated by bypassing those checks.

## Wire package

`@eosrio/hyperion-wire-plugin` packages Wire-specific ABI/value/SHiP codecs. Its source-pinned profiles have explicit node/build identities; do not treat a profile for a different build as generic Wire compatibility. The Node and Rust members are one coordinated component package.

Executable provider changes require a controlled worker restart. A declarative mapping update is a different lifecycle and does not replace a native provider during a running session.

## Source and ABI coverage

ABI decoding requires the ABI that applies to the source block and action epoch. A latest ABI lookup cannot establish this. Missing or conflicting coverage must remain an explicit unavailable/error outcome; preserve original source bytes and identity for recovery.

Extension-state routes covered by the readiness guard return HTTP 503 with code `protocol_projection_unavailable` and retry guidance. This includes affected contract-state, row-history and permission views. They do not silently fall back to a stale legacy projection. Ordinary retained-history availability is evaluated separately.

A plugin can instead back `get_tokens`, `get_top_holders`, `get_voters`, `get_voter_scopes` or `get_links` with one of its owner-v2 projections. A backed route that is not ready answers 503 `stateful.query-unavailable`. See [plugin-backed core state routes](/extend/projections/#plugin-backed-core-state-routes) and the [Wire state plugin](/extend/projections/#wire-state-plugin).

`/v2/state/get_account` stays available for extension providers because it reads no unqualified projection. It returns the node's account record, every balance the node reports in the system token contract (`<eosio_alias>.token`, named in `token_contracts`), and the account's actions from the metadata-only action search. Parts it cannot serve are named in `unavailable` and left out of the response rather than returned empty: `links` always, and `tokens` when the node balance call fails.

## Disk ABI history, settling and proof-store rotation

Protocol-extension chains can add `settings.protocol_abi_history` to supply an immutable, operator-pinned ABI history catalog and, optionally, recompute covered proofs from local node logs, extend coverage with sealed segments, settle live documents to disk-backed metadata and rotate the Elasticsearch proof stores.

### Pinned catalog and `settings.protocol_abi_history`

The pinned catalog pins one genesis manifest (`interface_version: 1`, `manifest`, `manifest_sha256`, `producer_profile_id`, `node_revision`, `ship_abi_sha256`). Changing the pinned catalog requires a controlled worker and API restart. Optional sub-options extend it:

- `capture`: local read-only paths (`state_history_dir`, `blocks_dir`, `ship_abi`) so workers and the API recompute covered proofs from the node's logs instead of reading Elasticsearch proof stores.
- `segments_dir`: directory where a catalog sealer writes incremental `hyperion-abi-history-segment-v1` segments. Each segment is verified and checked against the ABI coordinator's own commits before adoption. Segment block IDs are kept in memory up to `4,194,304` blocks (32 bytes per block); past that limit, compact the chain into a new pinned catalog and restart.
- `settle` *(indexer only)*: pulls sealed ranges from `range-server` and rewrites live block and action documents in attested ranges to schema-3 disk proof metadata so settled history does not depend on Elasticsearch proof stores. Settle never overtakes within `128` blocks of the highest indexed block.
- `rotation` *(indexer only; requires `settle`)*: rotates the four proof-store record indices (`<chain>-protocol-abi-frontier-records-v1`, `<chain>-protocol-abi-observations-v1`, `<chain>-protocol-source-bindings-v1`, `<chain>-protocol-native-actions-v1`) to a new generation (`-g<N>`; generation `0` keeps the original names) anchored at a settled catalog link end once the current generation exceeds `max_bytes`. The control index (`<chain>-protocol-abi-frontier-v1`) is not generational.

| Setting under `settings.protocol_abi_history` | Default | Bounds / notes |
|---|---|---|
| `settle.range_server` | *(required)* | Base URL of `range-server`; must use `https://` unless on loopback (`127.0.0.1`, `localhost`, `::1`). |
| `settle.max_blocks` | `512` | Integer `1`–`100000`; blocks settled per step. |
| `settle.interval_ms` | `5000` | Integer `>= 100`; milliseconds between settle steps. |
| `settle.repair_after_blocks` | `1024` | Integer `>= 128`; missing live documents older than this below the indexed tip are written from disk rather than waited on. |
| `rotation.max_bytes` | `8589934592` (8 GiB) | Integer `>= 1048576`; size across the current generation's four indices that triggers rotation. |
| `rotation.retire_margin_blocks` | `1024` | Integer `>= 128`; settling must pass the switch block by this many blocks before retirement. |
| `rotation.retire_after_ms` | `600000` (10 min) | Integer `>= 10000`; minimum age after a switch before retirement. |
| `rotation.drop_previous` | `false` | Boolean. **Off by default.** When `true`, deletes the four Elasticsearch indices of retired and orphaned generations. |
| `rotation.check_interval_ms` | `60000` (60 s) | Integer `>= 1000`; milliseconds between rotation and retirement checks. |

:::warning `drop_previous` deletes Elasticsearch indices
`settings.protocol_abi_history.rotation.drop_previous` is `false` by default. Setting it to `true` causes the indexer to permanently delete the four Elasticsearch proof-store indices of each retired generation (after a 15-second grace wait) and any older unreferenced generation indices left behind by a restart. With `false`, the indexer logs the retired index names for manual deletion.
:::

### Running the catalog sealer (`range-server --seal`)

Run `range-server --seal` read-only next to the node's `state-history` and `blocks` directories:

```bash
range-server --protocol <producer_profile_id> \
  --state-history /path/to/node/state-history \
  --blocks-dir /path/to/node/blocks \
  --catalog-dir /path/to/catalogs \
  --genesis-catalog-sha256 <genesis_manifest_sha256> \
  --chain-id <chain_id> \
  --doc-profile-id <consumer_profile_id> \
  --listen 127.0.0.1:7180 \
  --seal --ship-abi /path/to/ship-schema.json
```

`--seal` (which requires `--ship-abi`) writes each sealed segment into `--seal-dir` (default `<catalog-dir>/segments`) as three files — `abi-history.<start>-<end>.ndjson`, `.ndjson.blocks.bin` and `.ndjson.manifest.json` (written last). Point `settings.protocol_abi_history.segments_dir` at that directory. By default it seals every `120` irreversible blocks (`--seal-blocks`) or after `60000` ms (`--seal-max-wait-ms`), polling every `500` ms (`--seal-poll-ms`) with `4` threads (`--seal-threads`).

**Every link of the catalog chain must remain present in `--catalog-dir`** (searched two levels deep by `range-server`) and every segment after the pinned manifest must remain in `segments_dir`. Each segment extends only its base's digest, end block and last block ID; removing an intermediate link prevents chain verification past that point.

### Indexer log signals

- **Startup:** `Catalog settle enabled from block <startBlock> via <range_server>` and `Proof store rotation enabled at <max_bytes> bytes per generation, retired generations are kept for an operator` (or `, dropping retired generations` when `drop_previous` is `true`).
- **Segment adoption and refusal:** Normal adoption is silent (the coordinator updates `catalog` in its control record). Errors log `Catalog attestation failed and will retry: <message>`; disagreements log `[WARNING] Catalog segment <manifestSha256> (blocks <startBlock>-<endBlock>) disagrees with this indexer's ABI commits and is not adopted: <message>`.
- **Settling:** Summarized at most once per minute as `Catalog settled through block <to> (<written> written, <repaired> repaired, <unchanged> unchanged)` or `Catalog settle waits for <missing> live documents in blocks <from>-<to>`. Refusals log `[WARNING] Catalog settle stopped at blocks <from>-<to>: <message>`; transient errors log `Catalog settle failed and will retry: <message>`.
- **Rotation, retirement and dropping:** `Rotated proof stores to generation <N> anchored at block <anchor> in <ms> ms (generation <prev> held <bytes> bytes)`, then either `Proof store generation <prev> is retired and no longer read; delete <indices> to reclaim it` (`drop_previous: false`) or `Dropped retired proof store generation <prev>: <indices>` and `Dropped proof store indices of generations no longer read: <indices>` (`drop_previous: true`). Errors log `Proof store rotation step failed and will retry: <message>`.

See [catalog segment refusal and settle troubleshooting](/providers/help/indexer/#catalog-segment-refused-or-settle-stopped) for recovery steps on a refusal.

## Validate a deployment

Record the chain ID, node revision, profile, package/component hashes, genesis/source range and enabled consumer capabilities. Verify canonical source coverage, replay, forks, restart, cancellation and representative API outcomes for that exact deployment.

## Source

[Provider activation](https://github.com/eosrio/hyperion-history-api/blob/e1818923065d648a38009572d76badeab0684af1/src/indexer/protocol/selection.ts), [state readiness guard](https://github.com/eosrio/hyperion-history-api/blob/e1818923065d648a38009572d76badeab0684af1/src/api/helpers/protocol-state-readiness.ts), and [source-pinned Wire package](https://github.com/eosrio/hyperion-wire-plugin/tree/e8c7162437a0d0f4e2211979b959f2d002bf3552).
