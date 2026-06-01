# Tiered Storage — Overview & Architecture

A **tiered storage** archive lets a Hyperion deployment keep only the lean, *searchable* index for old ("cold" / frozen) block ranges in Elasticsearch, while the bulky `act.data` payloads are served on demand straight from the compressed nodeos state-history logs. The data is **never duplicated**: Elasticsearch holds the metadata, the frozen logs hold the payload, and a small Rust archive server decodes `act.data` exactly when a request for it arrives. The Hyperion API stitches the two halves back together transparently, so a client sees a perfectly normal Hyperion response.

!!! info "New in Hyperion v4.5 — opt-in, non-breaking"
    Tiered storage is introduced in **Hyperion v4.5** and is **strictly additive and opt-in**. A deployment that does not configure `api.archives` behaves byte-for-byte exactly as before — existing deployments are unaffected unless they opt in via `api.archives`. This follows from the config-gated design (hydration is fully skipped when `api.archives` is absent) and was confirmed in the adversarial review.

This section documents the system for operators:

| Page | What it covers |
|---|---|
| **overview.md** (this page) | Architecture, motivation, the lossless property, measured facts, the wire contract, and the honest status. |
| [Component reference](components.md) | Every binary in the [abi-scanner](https://github.com/eosrio/hyperion-tools){:target="_blank"} repo (reader, archive-server, es-load, bench stack) — flags, endpoints, and the exact `POST /actions` wire contract. |
| [API hydration](api-hydration.md) | The API side built in the Hyperion repo: the `api.archives` config block, the `ArchiveRegistry`, the `?hydrate` param, multi-archive routing, and the known limitations. |
| [Operations](operations.md) | Step-by-step: build the ABI index, freeze a range, run one (or many) archive servers, point the API at them, and verify. |

## Quickstart (TL;DR)

Three moving parts. From a frozen state-history range you (1) build an ABI index, (2) run an archive server over the range, and (3) tell the Hyperion API where it is.

```bash
# (0) Build the tools (Rust toolchain 1.74+, no C++ needed — pure-Rust abieos).
git clone https://github.com/eosrio/hyperion-tools && cd hyperion-tools
cargo build --release            # abi-scanner, action-proto, delta-proto, archive-server, es-load

# (1) Build the ABI index for the chain (needed to decode act.data).
#     Direct-from-disk is fastest and puts ZERO load on nodeos.
./target/release/abi-scanner \
  --from-disk /data/nodeos/state-history --start 2 --end 999999999 \
  --threads 12 --out wax-abi.ndjson --checkpoint wax.ckpt

# (2) Run an archive server over the frozen trace_history range.
./target/release/archive-server \
  --from-disk /data/frozen/state-history \
  --abi-index wax-abi.ndjson \
  --port 8080 --threads 8
# -> serving blocks [first..last] on http://0.0.0.0:8080

# (3) Point the Hyperion API at it (config/<chain>.config.json -> "api").
```

```jsonc
"api": {
  "archives": {
    "enabled": true,
    "timeout_ms": 2000,
    "max_batch": 20000,
    "actions": [
      { "url": "http://archive-01:8080", "first_block": 1, "last_block": 100000000 }
    ],
    "deltas": []
  }
}
```

Restart the API. Now a `get_actions` / `get_transaction` query that lands on a cold block transparently re-fetches `act.data` from the archive. A client cannot tell the difference from a hot document. Per-request opt-out with `?hydrate=false`.

Full walkthrough in the [operator runbook](operations.md).

## Architecture & motivation

### The problem: storage at 500M-block scale

A full Hyperion history index stores, for **every** action, the complete decoded trace: `act.data` (decoded args), signatures, receipts, console output, the raw hex, and more. Action documents are the largest in the index — a dense WAX range measures **~392 bytes/doc** in the stock Hyperion mapping. At EOS / Vaulta / WAX scale (WAX alone is **~437M blocks** and growing toward the half-billion-block horizon), the action index is by far the dominant long-term cost, and it grows forever.

Yet the bulk of that storage — the `act.data` payload — is **already on disk**, in the node's append-only, zlib-compressed state-history logs. Hyperion was storing a second, decoded copy of it in Elasticsearch.

### The tiering idea

Split the history into two tiers along a block boundary you choose:

```text
   HOT (recent)                         COLD / FROZEN (old)
 ┌───────────────────┐               ┌─────────────────────────────┐
 │ full action docs  │               │ metadata-only action docs   │
 │ in Elasticsearch  │   boundary    │ in Elasticsearch            │
 │ (act.data stored) │ ────────────► │ (act.data DROPPED)          │
 └───────────────────┘               └──────────────┬──────────────┘
                                                     │  on a query for a cold doc,
                                                     │  act.data is re-fetched live:
                                                     ▼
                              ┌────────────────────────────────────────┐
                              │ archive-server (Rust)                  │
                              │  reads frozen trace_history.{log,index}│
                              │  inflates + decodes act.data on demand │
                              └────────────────────────────────────────┘
```

- **Hot tier** — recent blocks indexed exactly as today: full `act.data` in Elasticsearch.
- **Cold tier** — old blocks indexed **metadata-only**: every searchable field stays (`block_num`, `global_sequence`, `act.account`, `act.name`, the computed `@transfer.*` / `@`-fields, receipts, `trx_id`), but the heavy `act.data` payload is dropped. The reader does this with `action-proto --metadata-only`.
- **Archive server** — fronts one frozen block range. On request it seeks the `trace_history` index to a log offset, inflates the block once, parses the traces, finds the action by `global_sequence`, decodes `act.data` against the contract ABI **active at that block**, and returns JSON. No data is duplicated; the payload lives only in the frozen log.
- **API hydration** — when a v2 route returns a cold hit whose `act.data` is absent, the API batches all such hits and POSTs them to the owning archive, splicing the returned `data` back into each hit before shaping the response.

### Why it matters

- **Storage stops being a copy.** The decoded `act.data` is no longer stored twice (Elasticsearch + log) — only the searchable metadata is in Elasticsearch; the payload stays in the log you already keep for the node. Measured cold-storage reduction is **~−11% on WAX** for the action index and **larger on data-heavy chains** (measured on one benchmark box / one WAX range — re-measure on your chain; see the *Single-environment numbers* note below). The win scales with how big the average `act.data` is; WAX has many small token transfers, so it is a conservative floor.
- **The frozen logs become a queryable asset.** A state-history range you would otherwise archive to cold object storage now directly backs live API responses.
- **It is read-only and safe.** The reader and the archive server open the logs **read-only**; they never write to the node's data. The Elasticsearch side of the bench tooling is explicitly **local-only** (it refuses a non-loopback ES host). Nothing here touches a live node's write path.

## The lossless property

The headline correctness guarantee: **a hydrated cold response is byte-equivalent to the hot response a client would have gotten**, for every action whose `act.data` was not rewritten by a Hyperion `@`-handler.

- The archive decodes `act.data` with the **same** `rs_abieos` engine and the **same** "ABI version active at this block" lookup (`partition_point` over the contract's sorted `setabi` versions) that the indexer used originally. Same bytes in, same decoded JSON out. On any decode failure it returns the **raw uppercase hex** under a `{"hex":"..."}` key, so every request still gets an answer (exactly as the indexer's hex-fallback path does).
- For `@`-rewritten actions (e.g. `eosio.token::transfer`, where Hyperion lifts `memo` into `@transfer.memo` when `index_transfer_memo` is on), the **cold doc keeps the computed `@transfer` fields** and the **archive supplies the raw `act.data`** — so the transfer reconstructs from both halves exactly as a hot doc would present it. After hydration the API still runs `mergeActionMeta`, so `@<actionname>` ABI metadata is merged into the hydrated `act.data` identically to a hot document.

!!! success "Lossless by construction"
    The archive's decode path is the same code as the reader's, and the API splices `data` back by request index under a strict same-order, same-length contract — so a hydrated cold response reconstructs the original document field-for-field.

## Measured facts

!!! warning "Single-environment numbers"
    All numbers below were measured on **one benchmark box / one WAX range**. Treat the relative relationships as the signal, not the absolute values, and **re-measure on your chain** before quoting them as production targets.

| Fact | Value | Where measured |
|---|---|---|
| Archive `act.data` decode (warm cache) | **~111 µs** typical; **sub-ms** warm | `archive-server` (`decode_us` field on `GET /action`) |
| Cold block read (cache miss) | **~42 ms / block**, I/O-bound (seek + inflate + parse) | `archive-server` per-thread cache miss path |
| Reader decode throughput | **~1.4M docs/s** decode (direct-from-disk, many cores) | abi-scanner bench docs |
| ES write ceiling (`es-load`) | **~384k docs/s / ~400 MB/s** at 32 workers (ES-bound) | 32-core box, ES 9.4.2, `logsdb`, `refresh=-1` |
| → consequence | **ES `_bulk` is the system write ceiling**, ~3–4× slower than decode | abi-scanner bench docs |
| Cold-tier storage reduction (action index) | **~−11% on WAX**; larger on data-heavy chains | this repo, cold metadata-only emit |
| Storage tuning (mapping, separate lever) | **−39%** field-tuned, **−43%** + `logsdb` vs stock | abi-scanner bench docs (412k WAX action docs) |
| ABI-index build, direct-from-disk | **~168k dense blk/s** (24 threads), ~linear to cores | abi-scanner README |

!!! note "Two independent storage levers — do not conflate them"
    1. **Cold tiering** (this system) drops `act.data` from Elasticsearch for frozen ranges → **~−11% on WAX**, scaling with payload size.
    2. **Mapping tuning** (the bench `action.json` template) makes *every* action doc smaller → **−39% / −43%**. This is independent of tiering — you can use either or both. See the [component reference](components.md) for the mapping details.

## Components at a glance

All five binaries live in the [abi-scanner](https://github.com/eosrio/hyperion-tools){:target="_blank"} repo (`cargo build --release`). Full reference in the [component reference](components.md).

| Binary | Role |
|---|---|
| `abi-scanner` | Builds the **ABI index** NDJSON (every `setabi` version, keyed by block) — the decode key the archive and reader need. |
| `action-proto` | The **reader** for actions: decodes `action_traces` from `trace_history` to Hyperion-shaped NDJSON or straight to ES (`--es`). `--metadata-only` emits the cold-tier doc (drops `act.data`); `--blocks-dir` adds `@timestamp` / `producer`. |
| `delta-proto` | The reader for **deltas** (table rows). |
| `archive-server` | The **on-demand archive**: `GET /action`, `GET /block/<N>`, `GET /health`, and the **`POST /actions` batch** the API uses. |
| `es-load` | Fast parallel Rust NDJSON → ES `_bulk` loader for **measuring the write ceiling** (local-only). |
| `bench/` | A composable Docker stack (ES 9.x + Kibana, plus RabbitMQ / Redis / Mongo under `--profile full`) plus Hyperion-shaped, storage-tuned index templates. **Local benchmarking only.** |

The API-side hydration layer lives in the Hyperion repo (`src/api/helpers/archive-*.ts`) and is documented in [API hydration](api-hydration.md).

## The wire contract (one line)

The API and the archive talk over exactly one endpoint:

```text
POST <archive>/actions
  body: [{ "block_num": <number>, "global_sequence": <number|string> }, ...]   # ≤ 20000 items
  200 : { "actions": [ ...same order as request... ] }
        found:     { "block_num":<n>, "global_sequence":<g>, "account":"..", "name":"..",
                     "data": <decoded JSON | {"hex":"<UPPER>"}>, "found":true }
        not-found: { "block_num":<n>, "global_sequence":<g>, "found":false }
```

The archive groups the request by `block_num` so each distinct block is read, inflated, and parsed **exactly once** (per-thread cache), then resolves every requested `global_sequence` within it. Response order is guaranteed identical to the request.

!!! info "The archive bounds per-request work"
    Besides the parse caps (more than **20000** items → `413`; body larger than **64 MiB** → `413`; malformed / non-array / bad-item → `400`), `POST /actions` also bounds the actual decode work per request: it resolves at most **4096 distinct blocks** and stops after a **~2-second wall-clock deadline**. Any requested items not reached within those bounds come back as `"found":false` — best-effort and contract-safe, since the API treats `found:false` as "no payload available". Full details (error codes, size caps, the `GET` endpoints) in the [component reference](components.md).

## Status — what is and isn't verified

!!! success "Built and verified"
    - `archive-server` (including `POST /actions`) and the API hydration layer are **built** and **compile-clean** — both `cargo check` and `tsc --noEmit` pass.
    - The work has **passed an adversarial multi-agent review**. Two findings from that review are now in the code: the per-request work-bound on `POST /actions` (the 4096-distinct-block / ~2-second deadline above), and the API's `ArchiveRegistry` now **drops any archive entry that lacks a `url` or has `first_block > last_block`, logging a warning** — so a misconfigured (inverted) range is visible, never a silent phantom archive that hydrates nothing.

!!! warning "Integration testing in progress"
    The full **API → Elasticsearch → archive** round-trip is being integration-tested on the local reference Docker stack. This is **in progress / pending maintainer sign-off**. Validate on a staging chain before a production rollout.

!!! success "Deltas are supported too"
    Deltas are cold-tiered exactly like actions: `delta-proto --metadata-only` produces the cold delta index (dropping the row `data`/`value` payload), the **same** `archive-server` serves `POST /deltas` from the `chain_state_history` log in the same `--from-disk` dir, and the API `hydrateDeltas` splices the payload back into cold delta hits. `POST /deltas` and `hydrateDeltas` were **live-verified read-only against a WAX node**; the full Docker-stack round-trip is the one outstanding integration item (for both actions and deltas). See [API hydration § delta hydration](api-hydration.md#delta-hydration) for the contract and details.

## See also

- [Component reference](components.md) — every binary, flag, and endpoint.
- [API hydration](api-hydration.md) — the `api.archives` config, the API plumbing, and the known limitations.
- [Operations](operations.md) — the full step-by-step operator runbook.
- [github.com/eosrio/hyperion-tools](https://github.com/eosrio/hyperion-tools){:target="_blank"} — the reader / archive / bench repo.
- [github.com/eosrio/hyperion-history-api](https://github.com/eosrio/hyperion-history-api){:target="_blank"} — the Hyperion API repo (hydration layer).
