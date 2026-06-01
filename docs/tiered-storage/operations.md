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
    The abi-scanner has its own operator page covering the snapshot fast-path, SHiP fan-out, and resumable scans. See the [ABI Scanner](../providers/operations/abi_scanner.md) guide and the [abi-scanner README](https://github.com/eosrio/hyperion-tools){:target="_blank"}.

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

## Step 7 — Cold-tier the deltas (optional, same archive)

Deltas are cold-tiered exactly like actions: produce a metadata-only delta index with `delta-proto --metadata-only`, let the **same** `archive-server` serve `POST /deltas` from the same `--from-disk` dir, and add an `api.archives.deltas` block. This step is independent of and parallel to the action steps — do it if you also want to drop cold delta payloads.

### 7a — Produce + load the cold delta index

Re-emit the frozen range as **metadata-only** delta docs. This drops the `data`/`value` row payload but keeps `block_num`/`code`/`scope`/`table`/`primary_key`/`payer`/`present` — everything searchable plus the key the archive needs to re-fetch the row. This is the delta analog of [Step 2](#step-2-produce-load-the-cold-tier-metadata-only-index):

```bash
delta-proto \
  --from-disk /data/frozen/state-history \
  --abi-index  wax-abi.ndjson \
  --start 2 --end 99999999 --threads 8 \
  --metadata-only \
  --out /tmp/cold-deltas.ndjson
```

Load it into your `<chain>-delta-v1-*` indices, **replacing** the full docs for that range. Delta docs are keyed by `block-code-scope-table-pk` (the Hyperion `_id` rule), so re-loading the same range with metadata-only docs overwrites the full ones idempotently.

### 7b — The same archive already serves /deltas

You do **not** start a second process. The `archive-server` from [Step 3](#step-3-run-an-archive-server-over-the-frozen-range) reads `chain_state_history` from the **same** `--from-disk` dir as the trace log, and serves both `POST /actions` and `POST /deltas`. At startup it logs the delta range alongside the action range:

```text
[archive-server] serving blocks [2..99999999] on http://0.0.0.0:8080 with 8 worker(s)
[archive-server]   delta blocks [2..99999999] (chain_state_history)
```

!!! note "The chain_state_history log is optional"
    If the `--from-disk` dir has no `chain_state_history.{log,index}`, the archive still serves actions and the `GET` endpoints normally — only `POST /deltas` is disabled and returns `503`. The startup log then shows `delta blocks: none — POST /deltas disabled`.

### 7c — Configure `api.archives.deltas`

Add a `deltas` array — **same shape** as `actions`, typically the **same** archive URLs (one archive serves both):

```jsonc
"api": {
  "archives": {
    "enabled": true,
    "timeout_ms": 2000,
    "max_batch": 20000,
    "actions": [
      { "url": "http://archive-01:8080", "first_block": 2, "last_block": 99999999 }
    ],
    "deltas": [
      { "url": "http://archive-01:8080", "first_block": 2, "last_block": 99999999 }
    ]
  }
}
```

Restart the API. A `get_deltas` query that lands on a cold block now transparently re-fetches the row payload. Per-request opt-out with `?hydrate=false`, identical to actions.

### Verify POST /deltas directly

```bash
# the batch endpoint the API uses (a real row + a bogus pk + an out-of-range block)
curl -s -X POST http://archive-01:8080/deltas \
  -H 'Content-Type: application/json' \
  -d '[{"block_num":49,"code":"eosio.token","scope":"eosio","table":"accounts","primary_key":"5459781"},{"block_num":49,"code":"eosio.token","scope":"eosio","table":"accounts","primary_key":"999999999999"},{"block_num":999999999,"code":"eosio.token","scope":"eosio","table":"accounts","primary_key":"1"}]'
# -> {"deltas":[ {... "data":{...}, "found":true}, {... "found":false}, {... "found":false} ]}
```

A decoded row carries `data` (decoded JSON); an undecodable row carries `value` (lowercase hex); a not-found row carries neither. `primary_key` is echoed as a string (so large `u64` keys round-trip without precision loss), and `scope` is matched by its name (arbitrary integer scopes work). The same caps apply as `/actions`: a 21000-item array or a >64 MiB body returns `413`, a non-array/garbage body returns `400`, and the per-request 4096-block / ~2-second work-bound leaves unreached items `found:false`. See [API hydration § delta hydration](api-hydration.md#delta-hydration).

---

## Operational notes & safety

!!! success "Read-only and best-effort by design"
    - **Read-only.** The reader and the archive open the state-history logs read-only. They cannot corrupt the node's data, and the range is clamped to committed blocks.
    - **Best-effort hydration.** Every archive failure (timeout / non-200 / bad-JSON / length-mismatch / work-bound `found:false`) is logged and degrades to "cold doc without `act.data`" — it never fails the API request.
    - **Bench tooling is local-only.** `es-load`, `bulk-load.py`, and `apply-templates.sh` refuse a non-loopback ES host unless `BENCH_ALLOW_EXTERNAL_ES=1`. Keep benchmark ES separate from production.

### Status — what is and isn't verified

!!! note "Current status (pending maintainer sign-off)"
    The `archive-server` (including `POST /actions` **and `POST /deltas`**) and the API hydration layer are **built and compile-clean** — `cargo check` and `tsc --noEmit` both pass — and have **passed an adversarial multi-agent review**. The per-request work-bound (Step 6) and the inverted-range validation (Step 4) were findings from that review and are now in the code.

    Both `POST /deltas` and the real `hydrateDeltas` have additionally been **live-verified read-only against a WAX node** versus a `delta-proto` oracle (byte-identical decoded + raw-`value` rows, `scope != code`, primary keys above `2^53`, ordering, `400`/`413`, and the work-bound all pass). The action path is verified the same way.

    The full **API → Elasticsearch → archive** round-trip — for **both** actions and deltas — is being integration-tested on the local reference Docker stack — **in progress / pending maintainer sign-off**. Validate on a staging chain before a production rollout.
