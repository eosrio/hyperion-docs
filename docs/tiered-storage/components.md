# Tiered Storage — Component Reference

Reference for the binaries and the bench stack that make up the cold-tier archive,
introduced in **Hyperion v4.5**. All of them live in the
[abi-scanner](https://github.com/eosrio/abi-scanner){:target="_blank"} repo and build
with a single `cargo build --release` (Rust 1.74+, **no C++/clang** — the pure-Rust
[rs_abieos](https://github.com/eosrio/rs-abieos){:target="_blank"} backend is used). The
API-side hydration layer ships in the main Hyperion repo and is documented separately in
[API hydration](api-hydration.md).

```text
github.com/eosrio/abi-scanner
├── abi-scanner        # ABI index builder (the decode key)
├── action-proto       # reader: action_traces -> NDJSON / ES (cold-tier emit lives here)
├── delta-proto        # reader: table-row deltas -> NDJSON
├── archive-server     # on-demand act.data over HTTP (the archive)
├── es-load            # fast Rust NDJSON -> ES _bulk loader (write-ceiling benchmark)
└── bench/             # local ES 9.x + Kibana (+ RabbitMQ/Redis/Mongo) + Hyperion templates
```

!!! info "Read-only and local-only by design"
    All of these are **read-only against the node**, and the ES-touching pieces are
    **local-only** (they refuse a non-loopback ES host). Nothing writes to a live node's
    data directory.

For how these pieces fit together, start with the [Overview](overview.md); for running
them in production, see [Operations](operations.md).

---

## abi-scanner — the ABI index builder

Builds the **abi-index**: one NDJSON line per `(account, block)` ABI version, the decode
key the reader and the archive both need to turn `act.data` bytes into JSON.

```bash
abi-scanner --from-disk /data/nodeos/state-history --start 2 --end 999999999 \
  --threads 12 --out wax-abi.ndjson --checkpoint wax.ckpt
```

Each line:

```json
{"account":"eosio.token","block":49,"abi":"{...}","abi_hex":"0e656f…","actions":["transfer","issue"],"tables":["accounts","stat"]}
```

Key flags:

| Flag | Meaning |
|---|---|
| `--from-disk <dir>` | Read the append-only `chain_state_history.{log,index}` directly. **No nodeos load**, scales ~linearly to cores. (Recommended.) |
| `--ship ws://…` | Stream SHiP from a node / fleet-router instead (use when you can't co-locate with the node's disk). |
| `--start` / `--end` | Block range (end clamped to last committed block). |
| `--threads N` | Parallel work-stealing readers (don't exceed physical cores). |
| `--checkpoint <file>` | Resumable scans: re-run the same command to continue / catch up new blocks. `--from-disk` only. |
| `--out <file>` | Output NDJSON. |

The archive server and the reader load this file once at startup and key it by the
contract's `u64` name, with a `partition_point` lookup for "the ABI version active at
block N" (greatest `valid_from <= N`). **Snapshot-restored nodes** can produce a complete
current-ABI set from a single init-delta block.

!!! tip "Full abi-scanner documentation"
    abi-scanner predates tiered storage and has its own operator page — see
    [ABI Scanner](../providers/operations/abi_scanner.md) for the `--ship` / fleet-router
    fan-out, `--checkpoint` resumable scans, the snapshot-restore fast path, and ingest
    recipes.

---

## action-proto — the reader (actions)

Decodes `action_traces` directly from the frozen `trace_history` log into Hyperion-shaped
action docs. This is what produces the **cold-tier metadata-only index** (and, for
benchmarking, can write straight to ES).

```bash
action-proto \
  --from-disk /path/to/state-history \
  --blocks-dir /path/to/blocks \
  --abi-index  wax-abi.ndjson \
  --start 437400000 --end 437410000 --threads 8 \
  --metadata-only \
  --out /tmp/cold-actions.ndjson
```

| Flag | Meaning |
|---|---|
| `--from-disk <dir>` | nodeos state-history dir (`trace_history.{log,index}`). |
| `--abi-index <ndjson>` | The abi-scanner output (decode key). |
| `--start` / `--end` | Block range. |
| `--threads N` | Parallel decode workers. |
| `--out <file>` | Output NDJSON. **Omit `--out` to measure pure decode throughput** (no write). |
| `--blocks-dir <dir>` | nodeos `blocks.{log,index}` — supplies the block-header `@timestamp` and `producer` fields (which live only in `signed_block`). Omit to leave them out. |
| `--index-transfer-memo` | Mirror Hyperion's `features.index_transfer_memo`: lift `memo` from a transfer's `act.data` into `@transfer.memo`. Default off (keep `memo` in `act.data`). |
| **`--metadata-only`** | **COLD TIER**: drop `act.data` from the emitted docs (the payload `archive-server` reconstructs on demand), keeping **all** searchable metadata + the computed `@`-fields. `block_num` + `global_sequence` are retained so the API/archive can fetch `act.data` later. |
| `--es <url>` | Direct ES `_bulk` sink (local benchmarking; ignores `--out`). |
| `--chain` / `--index-version` / `--partition-size` / `--es-batch` / `--es-workers` | ES `_index` naming + bulk tuning when `--es` is set. |

!!! success "This is the producer of the cold tier"
    Run it with `--metadata-only` over the range you want to freeze; load the NDJSON into
    your `<chain>-action-v1-*` indices (replacing the full docs for that range). The
    matching `archive-server` then serves the dropped `act.data` on demand.

---

## delta-proto — the reader (deltas)

The delta counterpart of `action-proto`: decodes `contract_row` table deltas from the
state-history log into Hyperion-shaped delta docs.

```bash
delta-proto --from-disk /path/to/state-history --abi-index wax-abi.ndjson \
  --start 437400000 --end 437410000 --threads 8 --out /tmp/deltas.ndjson
```

| Flag | Meaning |
|---|---|
| `--from-disk <dir>` | nodeos state-history dir (`chain_state_history.{log,index}`). |
| `--abi-index <ndjson>` | Decode key. |
| `--start` / `--end` / `--threads` | Range + parallelism. |
| `--out <file>` | Output NDJSON (omit to measure pure decode throughput). |

!!! warning "Delta cold-tiering is not wired end-to-end yet"
    `delta-proto` produces the docs, but the archive `/deltas` endpoint and the API
    delta-hydration contract are **not finalized** — see
    [API hydration § deltas](api-hydration.md). For now, deltas are reader/benchmark-only.
    Only the action `/actions` contract is finalized in v4.5.

---

## archive-server — the on-demand archive

The keystone. Fronts **one frozen block range** and serves `act.data` on demand by seeking
the `trace_history` index → log offset, inflating the block, parsing the traces, and
decoding `act.data` against the contract ABI active at that block. A pool of worker threads
each own their file handles, an ABI registry, and a small per-thread block cache (so
repeated/nearby requests skip the re-inflate).

```bash
archive-server \
  --from-disk /data/frozen/state-history \
  --abi-index wax-abi.ndjson \
  --port 8080 --threads 8
```

| Flag | Default | Meaning |
|---|---|---|
| `--from-disk <dir>` | — | Frozen state-history dir (must contain `trace_history.{log,index}`). |
| `--abi-index <ndjson>` | — | abi-scanner output (decode key). |
| `--port <p>` | `8080` | TCP port. |
| `--threads <n>` | `8` | Worker threads serving requests. |

On startup it reads `first_block` from the first log entry header and `last_block` from the
index length, then logs:

```text
[archive-server] serving blocks [<first>..<last>] on http://0.0.0.0:8080 with 8 worker(s)
```

The `[first_block..last_block]` range is what each API archive entry's
`first_block`/`last_block` must cover.

!!! info "Misconfigured ranges are rejected on the API side, not silently served"
    The API's archive registry **drops any archive entry that lacks a `url` or has
    `first_block > last_block`, logging a warning**. An inverted/misconfigured range is
    therefore visible in the API logs at startup — never a silent "phantom archive that
    hydrates nothing." See [API hydration](api-hydration.md) for the registry behaviour.

### Endpoints

| Method + path | Purpose |
|---|---|
| `GET /health` | Returns `ok` (text/plain). Liveness probe. |
| `GET /action?block_num=<N>&global_sequence=<G>` | One action: decode `act.data`, return one JSON object (incl. a `decode_us` timing field). |
| `GET /block/<N>` | All `action_traces` of block N as a JSON array. |
| **`POST /actions`** | **Batch hydration** — the endpoint the Hyperion API uses. |
| any non-GET/non-POST | `405`. |
| `POST` to any path other than `/actions` | `404`. |

### POST /actions — the batch contract (the one the API uses)

**Request** — `Content-Type: application/json`, a JSON **array**:

```json
[
  {"block_num": 123456789, "global_sequence": "987654321"},
  {"block_num": 123456789, "global_sequence": 987654322},
  {"block_num": 1, "global_sequence": 1}
]
```

- `global_sequence` is accepted as a JSON **number OR a decimal string** (both parsed to
  `u64` — strings preserve precision for large values).
- `block_num` must be a JSON **number** (`u64`, range-checked against the archived
  `[first_block..last_block]`).

**Response** — `200`, `{"actions":[ ... ]}` in the **same order** as the request:

```json
{"actions":[
  {"block_num":123456789,"global_sequence":987654321,"account":"eosio.token","name":"transfer","data":{"from":"...","to":"...","quantity":"1.0000 EOS","memo":""},"found":true},
  {"block_num":123456789,"global_sequence":987654322,"account":"somecontract","name":"customact","data":{"hex":"DEADBEEF"},"found":true},
  {"block_num":1,"global_sequence":1,"found":false}
]}
```

- **found** entry: `{block_num, global_sequence, account, name, data, found:true}`. `data`
  is the decoded `act.data` JSON, or `{"hex":"<UPPERCASE hex>"}` if the ABI could not decode
  it (every request still gets an answer).
- **not-found** entry: `{block_num, global_sequence, found:false}` (no `account`/`name`/`data`).
  Returned when the block is outside the archived range, the block has no traces, no action
  in that block has the requested `global_sequence`, or the per-request work bound was hit
  before that block was reached (see limits below). The API treats `found:false` as "no
  payload available."
- `block_num` and `global_sequence` are emitted as JSON **numbers** (not strings). For a
  found entry they echo the resolved block + matched sequence; for not-found they echo the
  request values verbatim.

**Errors** (all `application/json`):

| Status | When |
|---|---|
| `400 {"error":...}` | Malformed/unreadable body, non-array top-level, or a bad item shape (missing/non-numeric `block_num`, or `global_sequence` not number-or-string). |
| `413 {"error":...}` | More than **20000** items, **or** body larger than **64 MiB**. |

#### Limits & efficiency

Items are grouped by `block_num`, so each distinct block is read + inflated + parsed
**exactly once** through the per-thread cache; every requested `global_sequence` is then
resolved from a per-block `global_sequence → action` map (O(actions + requests), not a
product). Duplicate `(block, global_sequence)` pairs are each echoed independently (order
preserved), but the block is still decoded once. A per-block I/O/format fault makes only
that block's items `found:false` (partial success) rather than failing the whole batch.

!!! warning "Per-request work is bounded, in addition to the parse caps"
    The `20000`-item and `64 MiB` caps bound only **parsing**. The expensive axis of
    `POST /actions` is the number of **distinct blocks** a request makes the server seek,
    inflate, and parse — and a caller controls that almost independently of body size. So
    the server **also bounds the decode work per request**: it resolves at most **4096
    distinct blocks** and stops after a **~2-second wall-clock deadline**. Any requested
    items not reached within those bounds are returned as `"found":false` (best-effort and
    contract-safe — the API treats `found:false` exactly as "no payload available"). Keep
    batches well under 4096 distinct blocks per request to avoid short responses; the API's
    hydration layer already chunks its requests with this in mind.

`curl` smoke test:

```bash
curl -s -X POST http://archive-01:8080/actions \
  -H 'Content-Type: application/json' \
  -d '[{"block_num":123456789,"global_sequence":"987654321"},{"block_num":1,"global_sequence":1}]'
```

---

## es-load — the write-ceiling benchmark loader

A fast, **parallel, GIL-free** Rust loader that POSTs decoded NDJSON to ES `_bulk` applying
the Hyperion `_id`/`_index` rules. Its purpose is to **measure the ES write ceiling** — the
number that governs backfill cost.

```bash
es-load --file actions.ndjson --es http://localhost:9200 \
  --mode action --chain wax --workers 32 --batch 4000
```

| Flag | Default | Meaning |
|---|---|---|
| `--file <ndjson>` | — | Decoded docs (from `action-proto` / `delta-proto`). |
| `--es <url>` | `http://localhost:9200` | **Loopback only** unless `BENCH_ALLOW_EXTERNAL_ES=1`. |
| `--mode action\|delta` | `action` | `_id` rule: action → `global_sequence`; delta → `block-code-scope-table-pk`. |
| `--chain` / `--index-version` / `--partition-size` | `wax` / `v1` / `10_000_000` | `_index` = `<chain>-<mode>-<ver>-<partition>`. |
| `--batch <n>` | `4000` | Docs per `_bulk` request. |
| `--workers <n>` | `8` | Concurrent poster threads. |

!!! note "Reference ceiling — single environment, re-measure on your chain"
    Measured on one benchmark box (32-core, ES 9.4.2, 16g heap, `logsdb`, `refresh=-1`):
    `es-load` plateaus at **~384k docs/s / ~400 MB/s** at 32 workers (80% box CPU, 0 write
    rejections). The reader decodes ~3–4× faster than that — so **ES `_bulk` is the system
    write ceiling**, which is exactly why trimming the cold tier matters. Co-locate the
    loader with the ES under test (same box / LAN, not a WAN link), and treat these figures
    as a single-environment baseline — re-measure on your own hardware and chain.

---

## bench/ — the local benchmark stack

A self-contained Docker environment to load reader output into ES with Hyperion-compatible
mappings and measure write throughput + storage. **Composable index templates**
(`_index_template`) so they work on **Elasticsearch 8.x and 9.x**.

!!! danger "LOCAL ONLY — never point it at production ES"
    Runs against a throwaway ES on a machine you control. Both `apply-templates.sh` and
    `bulk-load.py` (and `es-load`) refuse a non-loopback ES host unless
    `BENCH_ALLOW_EXTERNAL_ES=1`. Never point it at production ES.

```bash
cd bench
cp .env.example .env            # edit CHAIN, ES_JAVA_OPTS, INDEX_MODE, …
docker compose up -d            # Elasticsearch + Kibana
./scripts/apply-templates.sh    # creates <chain>-action / -delta / -abi templates
# …run a reader, then load + measure with es-load or scripts/bulk-load.py…
docker compose --profile full up -d   # adds RabbitMQ + Redis + Mongo (for the eventual ingestor path)
```

Stack (from `bench/docker-compose.yml`):

| Service | Image | Profile |
|---|---|---|
| elasticsearch | `elasticsearch:9.4.2` (override `ELASTIC_VERSION`) | default |
| kibana | `kibana:9.4.2` | default |
| rabbitmq | `rabbitmq:3.13-management` | `full` |
| redis | `redis:7-alpine` | `full` |
| mongo | `mongo:7` | `full` |

### Storage-tuned action mapping

The action template (`bench/templates/action.json`) is tuned **beyond** Hyperion's stock
mapping, measured on a dense WAX range (412k action docs, 1 shard, `best_compression`,
force-merged — single environment, re-measure on your chain):

| Mapping | bytes/doc | vs stock | ES |
|---|---|---|---|
| Faithful (Hyperion stock) | 392 | — | 8.x / 9.x |
| **Field-tuned (this template)** | **239** | **−39%** | 8.x / 9.x |
| **Field-tuned + `logsdb`** | **224** | **−43%** | ≥ 8.17 / 9.x |

The win is from turning off `doc_values` / indexing on high-cardinality hex/sequence fields
that are never sorted or aggregated (`act_digest` alone was ~27% of the index) while keeping
everything the real queries need (sort by `global_sequence`, `act.account`/`act.name`,
`@transfer.*`, `receipts.receiver`, `trx_id` search). It is a **mapping** change (works on
8.x and 9.x); `logsdb` (ES ≥ 8.17/9.x) is an opt-in toggle (`INDEX_MODE=logsdb`) for a few
more points.

!!! note "Two independent levers — don't conflate them"
    This mapping tuning is **independent of** cold-tiering. The **storage-tuned mapping**
    shrinks *every* action doc, hot or cold (−39% field-tuned, −43% with `logsdb`).
    **Cold-tiering** is a separate lever: it drops `act.data` for frozen ranges (~−11% on
    WAX, more on data-heavy chains). Use either or both.

Full details and the contributing guide are in the
[abi-scanner bench README](https://github.com/eosrio/abi-scanner/tree/main/bench){:target="_blank"}.

---

## Status

!!! note "Implementation status — as of this release"
    - **archive-server** (including `POST /actions`) and the **API hydration layer** are
      **built and compile-clean** (`cargo check` and `tsc --noEmit` both pass) and have
      **passed an adversarial multi-agent review**. The per-request work bound on
      `POST /actions` and the API-side archive-entry validation described above were both
      findings from that review.
    - The full **API → Elasticsearch → archive round-trip** is being integration-tested on
      the local reference Docker stack: **in progress / pending maintainer sign-off**.
    - **Delta hydration is a deliberate no-op / TODO.** Only the action `/actions` contract
      is finalized in v4.5; `delta-proto` is reader/benchmark-only for now.
