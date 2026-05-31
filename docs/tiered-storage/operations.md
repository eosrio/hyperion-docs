# Tiered Storage — Operator Runbook

A start-to-finish walkthrough for putting a frozen state-history range behind a Hyperion API. This is the ordered procedure; read the [overview](overview.md) for the architecture, the [component reference](components.md) for full flag lists, and [API hydration](api-hydration.md) for the config and routing detail.

!!! info "Introduced in Hyperion v4.5 — opt-in, non-breaking"
    Tiered storage is **strictly additive**. A deployment that never configures `api.archives` behaves byte-for-byte exactly as before — this runbook only changes anything once you opt in. Roll it out one frozen range at a time.

!!! note "Prerequisites"
    - A built `abi-scanner` checkout (`cargo build --release` produces `abi-scanner`, `action-proto`, `delta-proto`, `archive-server`, `es-load`). Rust 1.74+, no C++/clang — the pure-Rust [`rs_abieos`](https://github.com/eosrio/rs-abieos){:target="_blank"} backend is used.
    - Read access to the chain's state-history dir for the range you want to freeze (`trace_history.{log,index}`, plus `blocks.{log,index}` if you want `@timestamp`/`producer`).
    - A running Hyperion API (v4.5+) whose config you can edit and restart.

---

## Step 0 — Decide the hot/cold boundary

Pick a block `B`. Blocks `< B` become the **cold** (frozen) tier; blocks `>= B` stay **hot** (full `act.data` in Elasticsearch, indexed as today). Good boundaries:

- Old enough that the range is stable / immutable (frozen).
- Aligned to your index partitions (`partition_size`, default 10,000,000) so a whole partition flips tier at once.

You can freeze in several chunks and run one archive per chunk — see [Step 5](#step-5-scale-out-one-archive-per-frozen-range).

---

## Step 1 — Build the ABI index

The reader and the archive both need the abi-index to decode `act.data`. Build it once per chain, direct-from-disk (no nodeos load):

```bash
abi-scanner --from-disk /data/nodeos/state-history \
  --start 2 --end 999999999 \
  --threads 12 --out wax-abi.ndjson --checkpoint wax.ckpt
```

- `--checkpoint` makes it resumable and lets you re-run later to catch up new blocks.
- Keep `wax-abi.ndjson` alongside the archive — it is loaded at archive startup.

For a node restored from a chain **snapshot**, you can get the complete current-ABI set from the single init-delta block. For historical decode across the whole range, the full scan above is what you want.

!!! tip "Full ABI Scanner reference"
    The abi-scanner has its own operator page covering the snapshot fast-path, SHiP fan-out, and resumable scans. See the [ABI Scanner](../providers/operations/abi_scanner.md) guide and the [abi-scanner README](https://github.com/eosrio/abi-scanner){:target="_blank"}.

---

## Step 2 — Produce + load the cold-tier (metadata-only) index

Re-emit the frozen range as **metadata-only** action docs. This drops `act.data` but keeps all searchable metadata, the computed `@`-fields, and `block_num`/`global_sequence`:

```bash
action-proto \
  --from-disk /data/frozen/state-history \
  --blocks-dir /data/frozen/blocks \
  --abi-index  wax-abi.ndjson \
  --start 2 --end 99999999 --threads 8 \
  --metadata-only \
  --out /tmp/cold-actions.ndjson
```

Load it into your `<chain>-action-v1-*` indices, **replacing** the full docs for that range. Because action docs are keyed by `global_sequence` (the Hyperion `_id` rule), re-loading the same range with metadata-only docs overwrites the full ones idempotently.

!!! warning "Test the load locally first"
    Measure the write ceiling against a throwaway ES with the [bench stack](components.md#bench-the-local-benchmark-stack) and `es-load` / `bulk-load.py`. **Never** point the bench tooling at production ES — `es-load`, `bulk-load.py`, and `apply-templates.sh` refuse a non-loopback ES host unless `BENCH_ALLOW_EXTERNAL_ES=1`, by design.

!!! note "Two independent storage levers — don't conflate them"
    Dropping `act.data` for the frozen range is one lever: **~−11% on WAX** for the action index, larger on data-heavy chains. The storage-tuned **mapping** is a *separate* lever (**−39%** field-tuned, **−43%** with `logsdb`) that shrinks *every* doc, hot or cold. Use either or both — see [Component reference](components.md#storage-tuned-action-mapping). These figures were measured on one benchmark box / one WAX range; re-measure on your chain.

---

## Step 3 — Run an archive server over the frozen range

Start an `archive-server` pointed at the **same** frozen state-history dir, with the same abi-index:

```bash
archive-server \
  --from-disk /data/frozen/state-history \
  --abi-index wax-abi.ndjson \
  --port 8080 --threads 8
```

It logs the range it owns:

```text
[archive-server] serving blocks [2..99999999] on http://0.0.0.0:8080 with 8 worker(s)
```

Note the `[first..last]` — those numbers are what the API archive entry's `first_block`/`last_block` must cover.

### Verify it directly before wiring the API

```bash
# liveness
curl -s http://archive-01:8080/health                      # -> ok

# one known action (note the decode_us timing in the response)
curl -s 'http://archive-01:8080/action?block_num=49&global_sequence=1'

# the batch endpoint the API uses (a real pair + a bogus pair + an out-of-range block)
curl -s -X POST http://archive-01:8080/actions \
  -H 'Content-Type: application/json' \
  -d '[{"block_num":49,"global_sequence":1},{"block_num":49,"global_sequence":999999999999},{"block_num":999999999,"global_sequence":1}]'
# -> {"actions":[ {... "found":true}, {... "found":false}, {... "found":false} ]}
```

A good smoke test: assert the batch entry's `data` for a known pair matches the single `GET /action` `data` exactly, ordering is preserved, the bogus/out-of-range entries are `found:false`, a 21000-item array returns `413`, and a non-array/garbage body returns `400`.

!!! tip "Running it as a service"
    `archive-server` is a single long-lived process. Run it under your usual supervisor (systemd / pm2 / docker). It is read-only and stateless apart from per-thread caches, so it restarts cleanly. Size `--threads` to the request concurrency you expect; each thread holds its own file handles plus a small (64-slot) block cache. On the single benchmark box, cold reads were ~42 ms/block (I/O-bound); warm/cached reads were sub-ms and a warm decode ~111 µs. Re-measure on your hardware.

---

## Step 4 — Point the Hyperion API at the archive

Add the `archives` block under `api` in `config/<chain>.config.json`:

```jsonc
"api": {
  "archives": {
    "enabled": true,
    "timeout_ms": 2000,
    "max_batch": 20000,
    "actions": [
      { "url": "http://archive-01:8080", "first_block": 2, "last_block": 99999999 }
    ],
    "deltas": []
  }
}
```

Make `first_block`/`last_block` match the range the archive logged. Restart the API.

!!! warning "A misconfigured range is dropped, not silently honored"
    The API's `ArchiveRegistry` **drops** any archive entry that lacks a `url` or has `first_block > last_block` (an inverted range), logging a warning. So a typo'd or inverted range is **visible in the logs**, never a phantom archive that owns zero blocks and silently hydrates nothing. Fix the warning and restart.

### Verify hydration end-to-end

```bash
# A cold-range action — act.data should be present (hydrated from the archive):
curl 'http://hyperion-api/v2/history/get_actions?account=eosio.token&limit=1&sort=asc'

# Same query, hydration off — cold docs come back WITHOUT act.data:
curl 'http://hyperion-api/v2/history/get_actions?account=eosio.token&limit=1&sort=asc&hydrate=false'
```

The first response should look identical to a hot document. If the archive is down or slow, the API logs (`[archive-hydration] ...`) and returns the cold doc **without** `act.data` rather than failing — hydration is best-effort.

See [API hydration](api-hydration.md) for the full `api.archives` field reference, the `?hydrate` param, and how cold hits are routed.

---

## Step 5 — Scale out: one archive per frozen range

Freeze in chunks and run one `archive-server` per chunk, each on its own port/host, then list them all. The API routes each cold hit to the archive whose range owns its block:

```bash
archive-server --from-disk /data/frozen/0-100M   --abi-index wax-abi.ndjson --port 8080
archive-server --from-disk /data/frozen/100M-200M --abi-index wax-abi.ndjson --port 8081
archive-server --from-disk /data/frozen/200M-300M --abi-index wax-abi.ndjson --port 8082
```

```jsonc
"actions": [
  { "url": "http://archive-01:8080", "first_block": 1,         "last_block": 100000000 },
  { "url": "http://archive-01:8081", "first_block": 100000001, "last_block": 200000000 },
  { "url": "http://archive-01:8082", "first_block": 200000001, "last_block": 300000000 }
]
```

The API groups cold hits per owning archive and POSTs them **in parallel**; one archive being down only affects its own range. Keep ranges contiguous and non-overlapping (on overlap, the first matching entry in config order wins). Inverted entries are dropped with a warning, as in Step 4.

---

## Step 6 — Tune hydration

| Knob | Where | Guidance |
|---|---|---|
| `timeout_ms` | `api.archives` | Per-archive HTTP timeout. Raise if cold (uncached) reads on a busy archive exceed 2 s; a timeout just leaves `act.data` absent. |
| `max_batch` | `api.archives` | Items per POST (capped at 20000). The API already chunks large result sets; rarely needs changing. |
| `--threads` | `archive-server` | Request concurrency. More threads means more parallel block reads, at the cost of more open file handles plus cache copies. |
| `?hydrate=false` | client | Let clients that don't need `act.data` skip the round-trip entirely. |

The archive's per-thread block cache makes repeated/nearby lookups within a batch (or across requests) nearly free, which is why grouping by block matters — a `get_actions` page over one contract often hits a handful of distinct blocks.

!!! info "The archive bounds per-request work"
    Independent of `max_batch`, each `POST /actions` request is bounded on the archive side: it resolves **at most 4096 distinct blocks** per request and stops after a **~2-second wall-clock deadline**. Any requested items not reached within those bounds come back as `found:false` (best-effort and contract-safe — the API treats `found:false` as "no payload available" and simply returns the cold doc without `act.data`). The other caps still apply: more than **20000** items returns `413`, a body larger than **64 MiB** returns `413`, and a malformed / non-array / bad-item body returns `400`.

    Practically: keep API result pages reasonable and ranges contiguous so each page maps to a small set of distinct blocks well under the 4096-block / 2-second bound. The bound is a backstop against a pathological request, not a normal-path limit.

---

## Step 7 — Deltas (not yet available)

Delta cold-tiering is **not wired end-to-end**. `delta-proto` produces delta docs and the API scaffolding exists, but the archive `/deltas` endpoint and the delta-hydration wire contract are **not finalized**.

!!! warning "Do not rely on delta hydration yet"
    If you configure `api.archives.deltas`, the API logs a one-line TODO and leaves delta values untouched — it refuses to guess a contract and risk corrupting responses. Only the action `/actions` contract is finalized. See [API hydration § delta hydration](api-hydration.md#delta-hydration-a-deliberate-no-op).

---

## Operational notes & safety

!!! success "Read-only and best-effort by design"
    - **Read-only.** The reader and the archive open the state-history logs read-only. They cannot corrupt the node's data, and the range is clamped to committed blocks.
    - **Best-effort hydration.** Every archive failure (timeout / non-200 / bad-JSON / length-mismatch / work-bound `found:false`) is logged and degrades to "cold doc without `act.data`" — it never fails the API request.
    - **Bench tooling is local-only.** `es-load`, `bulk-load.py`, and `apply-templates.sh` refuse a non-loopback ES host unless `BENCH_ALLOW_EXTERNAL_ES=1`. Keep benchmark ES separate from production.

### Status — what is and isn't verified

!!! note "Current status (pending maintainer sign-off)"
    The `archive-server` (including `POST /actions`) and the API hydration layer are **built and compile-clean** — `cargo check` and `tsc --noEmit` both pass — and have **passed an adversarial multi-agent review**. The per-request work-bound (Step 6) and the inverted-range validation (Step 4) were findings from that review and are now in the code.

    The full **API → Elasticsearch → archive** round-trip is being integration-tested on the local reference Docker stack — **in progress / pending maintainer sign-off**. Validate on a staging chain before a production rollout.

    Delta hydration is a **deliberate no-op / TODO**: only the action `/actions` contract is finalized.
