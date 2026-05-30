# ABI Scanner

[**abi-scanner**](https://github.com/eosrio/abi-scanner){:target="_blank"} is a standalone, high-performance tool that extracts **every contract ABI version** (`setabi`) across a chain's history into a portable snapshot that drops straight into Hyperion's ABI index (`<chain>-abi-v1`).

It is a fast, off-the-critical-path alternative to seeding ABIs by running the indexer in `abi_scan_mode`.

!!! info "Why a separate ABI index matters"
    Hyperion deserializes historical actions and deltas using the **exact ABI that was active at the block being processed** — contracts change their ABI over time via `setabi`, and using the wrong version yields garbled data. Every ABI version is therefore stored in `<chain>-abi-v1`, keyed by the block it took effect. A complete, correct ABI index is a prerequisite for correct history.

## Why use it

Normally this index is populated by an **ABI-scan pass**: you start the indexer with `indexer.abi_scan_mode = true`, which walks the chain writing only `account` (ABI) deltas, then run the full pipeline with `abi_scan_mode = false`. That pass runs through the entire indexer machinery (SHiP → RabbitMQ → deserializer → Elasticsearch) and processes on the order of ~100 blocks/s.

`abi-scanner` does the same job directly against the node's state-history, with none of that machinery in the path:

- **Much faster** — reading the state-history log from disk in parallel scales with CPU cores (measured well into the hundreds of thousands of blocks/s on dense WAX history), because it only touches the `account` table and skips the dense `contract_row` payload entirely.
- **Zero load on a running Hyperion** — it doesn't need the indexer, RabbitMQ, or a SHiP subscription. You can build or rebuild the ABI index out-of-band.
- **No C++ toolchain** — built on the pure-Rust [`rs_abieos`](https://github.com/eosrio/rs-abieos){:target="_blank"} backend.

!!! tip "Bootstrap pattern"
    Run `abi-scanner` to populate `<chain>-abi-v1` first, then start Hyperion with `abi_scan_mode = false` from the beginning — skipping the indexer's ABI-scan pass entirely.

## Output shape

Each line of output is one NDJSON document in the exact `<chain>-abi-v1` shape:

```json
{"account":"eosio.token","block":49,"abi":"{...abi json...}","abi_hex":"0e656f…","actions":["transfer","issue","…"],"tables":["accounts","stat"]}
```

| Field | Type | Notes |
|-------|------|-------|
| `account` | keyword | Contract account name |
| `block` | long | Block at which this ABI version took effect |
| `abi` | stored | ABI decoded to JSON |
| `abi_hex` | stored | Raw serialized ABI (preserved even if decoding fails) |
| `actions` | keyword[] | Action names, for fast lookup |
| `tables` | keyword[] | Table names |

The Elasticsearch document `_id` is `block + account` (e.g. `49eosio.token`), so re-ingesting the same scan is **idempotent**.

!!! note
    Hyperion's mapping also carries an optional `@timestamp`; abi-scanner omits it, since the ABI lookup keys on `block`. Malformed on-chain ABIs are tagged with an `abi_decode_error` field and keep their raw `abi_hex`, so a bad ABI never aborts a scan.

## Installation

A Rust toolchain (1.74+) is the only requirement — no C++/clang.

```bash
git clone https://github.com/eosrio/abi-scanner
cd abi-scanner
cargo build --release
# binary at target/release/abi-scanner
```

## Two modes

| | How | When to use |
|---|---|---|
| **`--from-disk`** (recommended) | Reads `chain_state_history.{log,index}` directly off the node's disk, in parallel, **read-only** | You can run it on (or mount the state-history dir from) the node |
| **`--ship`** | Streams deltas-only over the State-History (SHiP) websocket from a node or [fleet-router](https://github.com/eosrio/fleet-router){:target="_blank"} | The node's disk isn't reachable; remote scans |

## Direct-from-disk

Run on the node, or anywhere its `state-history` directory is mounted:

```bash
abi-scanner --from-disk /data/nodeos/state-history --start 2 --end 999999999 \
  --threads 12 --out wax-abi.ndjson
```

- `--threads N` parallel readers pull small chunks from a shared cursor (work-stealing), so every thread stays busy to the end even though recent blocks are far denser than early ones. Don't exceed physical cores.
- `--end 999999999` is clamped to the last committed (indexed) block, so the scan never races the entry nodeos is currently appending.

!!! success "Safe against a live node"
    `abi-scanner` opens the state-history files **read-only** and only ever reads blocks that nodeos has already committed to the index. It cannot corrupt the log or interfere with a running node.

### Resumable scans (`--checkpoint`)

For long full-chain scans, pass `--checkpoint <file>` to make the scan **stop-and-continue from any block** — the same capability as Hyperion's `abi_scan_mode`. The scanner records how far it is *contiguously* done; if it is interrupted (Ctrl-C, crash, reboot), **re-run the exact same command** and it picks up where it left off, appending to the same output:

```bash
abi-scanner --from-disk /data/nodeos/state-history --start 2 --end 999999999 \
  --threads 12 --out wax-abi.ndjson --checkpoint wax.ckpt
# ...interrupted... run the same line again — it resumes from the checkpoint:
abi-scanner --from-disk /data/nodeos/state-history --start 2 --end 999999999 \
  --threads 12 --out wax-abi.ndjson --checkpoint wax.ckpt
```

Once complete, re-running is a no-op. To **catch up new blocks later** (the chain advanced), re-run the same command — it resumes from the prior end and indexes only the new blocks.

!!! note
    Blocks scanned but not yet checkpointed at the moment of an interruption are re-scanned on resume. That's harmless: documents are keyed by `block + account`, so a `_bulk` re-ingest is idempotent.

### Snapshot-restored nodes → instant current-ABI set

When a node is started **from a chain snapshot**, the state-history plugin emits the *entire chain state as one delta* on the first block after the snapshot (the `Placing initial state in block N` log line). That single block's `account` table holds **every** contract's current ABI — so scanning just that one block yields a complete *current* ABI set in seconds, without walking history:

```bash
# N = the snapshot's head block (from the nodeos "Placing initial state in block N" log line)
abi-scanner --from-disk /data/nodeos/state-history --start N --end N --out current-abis.ndjson
```

!!! example "Measured on Telos (Spring 1.2.2)"
    A node restored from a ~1.6 GB snapshot produced a ~1.95 GB init-delta entry; abi-scanner extracted **796 contract ABIs from that one block in ~27 s**. This is the fastest way to capture a chain's *current* ABIs, though for full historical deserialization you still want a full scan.

## SHiP (remote node or fleet-router)

```bash
abi-scanner --ship ws://node:8080 --start 2 --end 999999999 --out wax-abi.ndjson

# fan out across a fleet of nodes via fleet-router
abi-scanner --ship ws://fleet-router:18080 --start 2 --end 999999999 \
  --connections 16 --in-flight 200 --out wax-abi.ndjson
```

A single node serializes SHiP from one thread, so throughput per node is bounded; point `--ship` at a [fleet-router](https://github.com/eosrio/fleet-router){:target="_blank"} to fan a scan across multiple nodes.

## Ingesting into Elasticsearch

Bulk the NDJSON into your chain's ABI index, deriving the `_id` exactly as Hyperion does (`block + account`) so the documents line up with what the indexer reads. With [`jq`](https://jqlang.github.io/jq/){:target="_blank"}:

```bash
jq -rc '"{\"index\":{\"_id\":\"\(.block)\(.account)\"}}", .' wax-abi.ndjson \
  | curl -s -H 'content-type: application/x-ndjson' --data-binary @- \
    "http://localhost:9200/wax-abi-v1/_bulk" > /dev/null
```

For very large snapshots, split the NDJSON into batches (e.g. `split -l 20000`) and bulk each batch so requests stay a reasonable size.

!!! warning
    Ingest into the index that matches your chain alias — `<chain>-abi-v1` (e.g. `wax-abi-v1`). The index template (`<chain>-abi-*`) must already exist; it is created automatically the first time Hyperion runs for that chain.

After ingesting, start (or restart) the indexer with `indexer.abi_scan_mode = false`.

## Reference

- Source & full README: [github.com/eosrio/abi-scanner](https://github.com/eosrio/abi-scanner){:target="_blank"}
- Pure-Rust abieos backend: [github.com/eosrio/rs-abieos](https://github.com/eosrio/rs-abieos){:target="_blank"}
- Multi-node SHiP fan-out: [github.com/eosrio/fleet-router](https://github.com/eosrio/fleet-router){:target="_blank"}
