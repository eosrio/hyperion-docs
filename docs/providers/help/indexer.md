# Indexer Troubleshooting

This page covers common issues encountered when starting or running the Hyperion indexer.

## AMQP Connection Refused

**Symptom:** All workers report `[AMQP] failed to connect!` with the error:

```
Expected ConnectionOpenOk; got <ConnectionClose channel:0>
```

**Cause:** The `vhost` value in `connections.json` does not match the actual RabbitMQ vhost name.

When RabbitMQ is configured with `RABBITMQ_DEFAULT_VHOST=/hyperion`, the full vhost name **includes the leading slash** — it is literally `/hyperion`, not `hyperion`.

**Fix:** Update the `vhost` field in your `connections.json` to include the leading `/`:

```json
{
  "amqp": {
    "host": "127.0.0.1:5672",
    "api": "127.0.0.1:15672",
    "user": "my_user",
    "pass": "my_password",
    "vhost": "/hyperion"
  }
}
```

!!! tip "How to verify your vhost name"
    Check the actual vhost name in RabbitMQ:
    ```bash
    rabbitmqctl list_vhosts
    ```
    Or via the management API:
    ```bash
    curl -u user:pass http://127.0.0.1:15672/api/vhosts
    ```
    Use the exact vhost name shown in the output.

---

## MongoDB Connection Failed

**Symptom:** The indexer exits with:

```
MongoDB connection failed! - connect ECONNREFUSED 127.0.0.1:27017
```

Even though `mongodb.enabled` is set to `false` in `connections.json`.

**Cause:** The indexer always attempts a MongoDB connection during startup, regardless of the `enabled` flag. If the connection fails, the process exits.

**Fix:** Ensure MongoDB is running and accessible at the host/port configured in `connections.json`, even if `mongodb.enabled` is set to `false`.

!!! warning "Known Behavior"
    Setting `mongodb.enabled: false` only disables MongoDB collection creation — it does **not** skip the connection attempt. A reachable MongoDB instance is required for the indexer to start.

---

## Indexer Stuck After ABI Scan

**Symptom:** The indexer completes the ABI scan phase and reports:

```
Parallel readers finished the requested range
No blocks processed! Indexer will stop in N seconds!
```

No block, action, or delta data is indexed — only ABI records appear in Elasticsearch.

**Cause:** On first run, the indexer must start in `abi_scan_mode: true` to discover contract ABIs. After the scan, it needs to switch to data indexing mode. Without `auto_mode_switch`, the indexer finishes the ABI scan and waits idle until `auto_stop` triggers.

**Fix:** Enable `auto_mode_switch` in your chain config file:

```json
{
  "settings": {
    "auto_mode_switch": true,
    "auto_stop": 300
  }
}
```

With `auto_mode_switch: true`, the indexer will automatically:

1. Complete the ABI scan
2. Save the ABI data
3. Restart itself in full indexing mode
4. Index all blocks, actions, and deltas

!!! info "After the first run"
    Once the ABI scan has completed and full indexing is done, you can set `abi_scan_mode: false` for subsequent runs. The `auto_mode_switch` setting is only needed for the initial ABI scan pass.

---

## Purge Queues Fails on Startup

**Symptom:** The indexer exits on startup with:

```
Failed to purge <chain> queues: RabbitMQ management API returned HTTP 404 listing queues of vhost "..."
```

Versions before 4.5 crashed instead with `TypeError: result is not iterable` in `ConnectionManager.purgeQueues`.

**Cause:** When `purge_queues` is `true` or `"force"`, the indexer calls the RabbitMQ management API to list the chain's queues before deciding what to delete. If the configured `vhost` does not exist in RabbitMQ, or the management API credentials are incorrect, the listing fails.

**Fix:**

1. Verify the vhost exists in RabbitMQ (see [AMQP Connection Refused](#amqp-connection-refused) above)
2. Verify the management API credentials match the AMQP credentials
3. Verify the `api` field in `connections.json` points to the RabbitMQ **management** port (default: `15672`), not the AMQP port (`5672`)

```json
{
  "amqp": {
    "host": "127.0.0.1:5672",
    "api": "127.0.0.1:15672",
    "vhost": "/hyperion"
  }
}
```

!!! tip "Workaround"
    `purge_queues: false` skips this step entirely, and is the recommended setting.

---

## Queues Kept on Startup

**Symptom:** With `purge_queues: true`, the indexer logs on startup:

```
[WARNING] purge_queues is on, but 1841 messages are waiting in <chain> queues and rewrite is off.
[WARNING] The queues were kept: they hold work for blocks this start does not read again, so deleting them would lose it.
```

followed by one line per queue that still holds messages.

**Cause:** The previous run stopped (a crash, a kill, or a restart by the supervisor) while blocks were still queued. A start without `rewrite` resumes at the first block missing from the block index, so blocks below that point are not read again. Their actions and deltas may still be waiting in the queues, and deleting them would lose those documents for good. The indexer keeps them and processes them as it starts.

**Fix:** Nothing is needed; the queued work is indexed normally. To discard it on purpose:

1. Rewrite the affected range from a known block: set `start_on` to that block and `rewrite: true`, or
2. Set `purge_queues: "force"` for one start. Anything those messages held is lost unless that range is rewritten.

---

## Catalog Sealer, Settling and Proof-Store Rotation

On protocol-extension chains with `settings.protocol_abi_history`, an operator can run `range-server --seal` next to the indexer so coverage extends continuously, settled blocks and actions become disk-backed, and the four proof-store indices rotate instead of growing without bound.

### Running the catalog sealer (`range-server --seal`)

Start `range-server` read-only against the node's `state-history` and `blocks` directories, pointing `--catalog-dir` at the directory holding the genesis catalog and its extensions (`--genesis-catalog-sha256` may instead name a [compaction](#compacting-the-catalog-chain)):

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

- **What it writes and where:** By default, `--seal` writes incremental segments (`hyperion-abi-history-segment-v1`) into `<catalog-dir>/segments` (override with `--seal-dir`). Each sealed segment writes three files — `abi-history.<start>-<end>.ndjson` (sparse ABI epochs), `.ndjson.blocks.bin` (32-byte block IDs), and `.ndjson.manifest.json` (written last, naming its base link's `manifestSha256`, `endBlock`, and `lastBlockId`). Set `settings.protocol_abi_history.segments_dir` in the chain config to that same directory.
- **When it seals:** Once `--seal-blocks` irreversible blocks (default `120`) follow the chain tip, or once the oldest unsealed irreversible block has waited `--seal-max-wait-ms` (default `60000` ms). The sealer polls the block log every `--seal-poll-ms` (default `500` ms) using `--seal-threads` (default `4`).
- **Keep every link in `--catalog-dir`:** `range-server` discovers the chain under `--catalog-dir` (searched two levels deep) starting from `--genesis-catalog-sha256`, and Hyperion readers follow links in order from the pinned manifest through `segments_dir`. **Every link of the catalog chain must remain present in `--catalog-dir`** (and every segment after the pinned manifest in `segments_dir`). Deleting or moving an intermediate segment breaks chain verification and prevents the sealer and readers from advancing past the gap. Links at or below a pinned [compaction](#compacting-the-catalog-chain) are the exception: they are no longer read once every process is configured with it.

### Compacting the catalog chain

A sealer adds a segment about once a minute. Every process that starts verifies each segment since the pinned catalog and keeps its block IDs in memory, and `range-server` opens every link, so a long chain makes starts slower and eventually reaches the 4,194,304-block limit. A **compaction** is the chain through one of its links as a single complete catalog, byte for byte. Pinning it shortens the chain without replacing the proof stores and without indexing any block again.

**1. Find where to compact.** The chain in the proof stores starts at a link end: the pinned catalog's end, or the anchor of the last rotation (`Rotated proof stores to generation <N> anchored at block <anchor>` in the indexer log, `anchor` in the coordinator's control record). The compaction must end at or below that block, so compact through the anchor. A deployment that never rotated is anchored at its pinned catalog's end and cannot move onto a compaction of a later link.

**2. Write the compaction.** `abi-scanner` reads only the chain's files, not the node's logs:

```bash
abi-scanner --protocol <producer_profile_id> --compact \
  --catalog-dir /path/to/catalogs \
  --genesis-catalog-sha256 <currently_pinned_manifest_sha256> \
  --chain-id <chain_id> \
  --start 1 --end <anchor> \
  --lineage <lineage_manifest_sha256> \
  --out /path/to/catalogs/<new_directory>
```

- The chain is compacted through its newest link that ends at or below `--end`. The output is `abi-history.ndjson`, `abi-history.ndjson.blocks.bin` and `abi-history.ndjson.manifest.json`, in a directory that must not hold them yet. Write it inside `--catalog-dir` so `range-server` can find it. The command prints the new manifest's path and SHA-256 as one JSON line.
- `--lineage` is the `manifest_sha256` Hyperion was configured with before its first compaction. It can be omitted when the chain is read from a manifest that is itself a compaction, or from the catalog Hyperion first pinned: the lineage is then kept or started there.
- The manifest names the link it stands in for (`compacts`) and the lineage (`lineage`). Segments after that link continue the compaction unchanged, and the existing chain is not modified.

**3. Pin it.** In the API and indexer chain configuration, point `manifest` and `manifest_sha256` at the compaction and set `lineage_sha256`:

```json
{
  "protocol_abi_history": {
    "manifest": "/path/to/catalogs/<new_directory>/abi-history.ndjson.manifest.json",
    "manifest_sha256": "<compaction_manifest_sha256>",
    "lineage_sha256": "<lineage_manifest_sha256>"
  }
}
```

The other settings stay as they are. The catalog keeps the identity of its lineage, so the proof stores, the coordinator's control record and the indexed documents stay valid.

**4. Restart.** Restart the API, then stop the indexer, restart `range-server` with `--genesis-catalog-sha256 <compaction_manifest_sha256>`, and start the indexer.

- A process on the old manifest and a process on the compaction give the same answers, so the API can move first. The old configuration is the rollback as long as the old catalog and its segments are still in place.
- Move the sealer together with the indexer. The settler accepts a range only when the catalog that seals it is one the indexer's catalog holds, and for blocks at or below the compaction's end the two agree only when both read the compaction.
- If the compaction ends past the anchor, the indexer refuses to start with `Retained ABI progress is anchored at catalog block <anchor>, ... (a pinned compaction must end at or below the anchor)` and replaces nothing. Compact through the anchor or an earlier link and try again.
- A manifest that does not name the configured lineage is refused with `the pinned catalog is not a compaction of the configured lineage`.

Once no process is configured with the old manifest, the segments at or below the compacted link are no longer read and can be archived. Repeat after later rotations: each compaction is written from the currently pinned one and keeps the same lineage.

### What the indexer logs

- **Startup:**
  - `Catalog settle enabled from block <startBlock> via <range_server>`
  - `Proof store rotation enabled at <max_bytes> bytes per generation, retired generations are kept for an operator` (or `, dropping retired generations` when `rotation.drop_previous` is `true`)
- **Segment attestation:** Normal segment adoption is silent — the ABI coordinator verifies each new segment in the background (at most every 2 seconds) and publishes its link in the coordinator control record. Failures and refusals are logged:
  - Transient error (retried): `Catalog attestation failed and will retry: <message>`
  - Disagreement (not adopted): `[WARNING] Catalog segment <manifestSha256> (blocks <startBlock>-<endBlock>) disagrees with this indexer's ABI commits and is not adopted: <message>`
- **Settling:**
  - Progress (summarized at most once a minute): `Catalog settled through block <to> (<written> written, <repaired> repaired, <unchanged> unchanged)`
  - Waiting on in-flight live documents (at most once a minute): `Catalog settle waits for <missing> live documents in blocks <from>-<to>`
  - Settled documents written again and repaired: `Catalog settle found <N> settled blocks in <from>-<to> written again and made them disk-backed again (<written> written)`
  - Refusal (retried on `settle.interval_ms`, indexing continues): `[WARNING] Catalog settle stopped at blocks <from>-<to>: <message>`
  - Transient error (retried): `Catalog settle failed and will retry: <message>`
- **Rotation, retirement and dropping:**
  - Switch to a new generation: `Rotated proof stores to generation <N> anchored at block <anchor> in <ms> ms (generation <prev> held <bytes> bytes)`
  - Retired with `drop_previous: false` *(default)*: `Proof store generation <prev> is retired and no longer read; delete <indices> to reclaim it`
  - Retired and deleted with `drop_previous: true`: `Dropped retired proof store generation <prev>: <indices>`
  - Orphaned generation cleanup on check/restart with `drop_previous: true`: `Dropped proof store indices of generations no longer read: <indices>`
  - Transient error (retried, indexing continues): `Proof store rotation step failed and will retry: <message>`

Settling does not assume a settled range stays settled. An action document at or below the settled block can be written again later (by index work that was still queued, by a repair or bulk reader, by a tool). Before each step the indexer reads which of those documents changed since it last looked and settles their blocks again. The first run after an upgrade reads every action document at or below the settled block once, 50,000 a step.

A previous generation is retired only when all of these hold:

- settling is `retire_margin_blocks` past the switch block and the switch is `retire_after_ms` old;
- every action document at or below the settled block is disk-backed at that moment;
- every proof record the unsettled blocks reference has been copied into the current generation (this waits while more than 50,000 blocks are unsettled).

!!! note "Keep `rotation` configured once the stores have rotated"
    Indexer processes find the current store generation by reading the coordinator's control record, which they only do when `rotation` is configured. Once the stores are past generation 0 the indexer refuses to start without it; to stop rotating, keep `rotation` and raise `max_bytes`. The API needs no `rotation` block: it follows generations whenever `segments_dir` is configured.

!!! warning "`rotation` and `features.stateful_owner_v2` are mutually exclusive"
    Projections read every source from the proof stores, whatever the catalog covers. The indexer refuses to start with both configured.

!!! warning "`drop_previous` deletes Elasticsearch indices"
    `settings.protocol_abi_history.rotation.drop_previous` is `false` by default. When enabled, the indexer permanently deletes the four Elasticsearch proof-store indices of each retired generation (and any older unreferenced generation left behind by a restart). Keep it `false` until you have verified that settled documents serve cleanly from disk and you are ready to reclaim space automatically.

### What to do on a refusal

Neither a segment attestation refusal nor a settle refusal stops live indexing, but both stop `settled` and proof-store rotation from advancing past the refused block range. Do not manually delete proof-store indices while a refusal is active.

- **On a segment attestation refusal** (`[WARNING] Catalog segment ... disagrees with this indexer's ABI commits and is not adopted`):
  1. Read the reason at the end of the warning (block ID or parent mismatch, unexpected/missing ABI state change, action ABI mismatch, or last global sequence mismatch).
  2. Verify that `range-server --seal` and the indexer are reading the same chain, node revision, `--ship-abi` handshake file, and matching protocol profile, and that no stray or competing manifest exists for the same base in `segments_dir`.
  3. The running coordinator will not adopt a refused `manifestSha256` again. Once the mismatch is fixed, remove the bad segment (and any later segments chained onto it) from `--seal-dir` / `segments_dir` and let `range-server --seal` reseal from the last good link; the coordinator will attest the newly sealed segment automatically once it is the sole candidate for that base.
- **On a settle refusal** (`[WARNING] Catalog settle stopped at blocks <from>-<to>`):
  1. Read the refusal message. Common causes are a body mismatch beyond `protocol` metadata (for example `range-server` flags `--index-prefix`, `--index-version`, `--partition-size`, `--system-contract`, `--index-transfer-memo`, or `--doc-profile-id` not matching the chain config), a live document in Elasticsearch that has no matching disk document, a segment not yet adopted by the coordinator, or a repair target ID already held by a document outside the range.
  2. Align the `range-server` flags with the chain configuration (or repair the discrepant live documents). Settling retries automatically on `settle.interval_ms` and resumes once the range matches.
