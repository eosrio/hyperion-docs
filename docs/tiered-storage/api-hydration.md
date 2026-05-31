# API Hydration & Configuration

How the Hyperion API transparently re-fetches cold-tier `act.data` from an archive before shaping a v2 history response. This is the consumer side of the `POST /actions` contract documented on the [Component reference](components.md) page.

Introduced in **Hyperion v4.5**, hydration is **strictly additive and opt-in**: a deployment that does not configure `api.archives` behaves byte-for-byte exactly as before.

!!! info "Status — built, reviewed, integration pending"
    The archive-server (including `POST /actions` **and `POST /deltas`**) and this API hydration layer are **built and compile-clean** — both `cargo check` and `tsc --noEmit` pass — and have **passed an adversarial multi-agent review**. Both `POST /deltas` and the real `hydrateDeltas` have additionally been **live-verified read-only against a WAX node** (see [Delta hydration](#delta-hydration)). The full API → Elasticsearch → archive round-trip (for **both** actions and deltas) is being integration-tested on the local reference Docker stack: **in progress / pending maintainer sign-off**. See [Operations](operations.md) for the broader rollout status.

## What it does

When a v2 history route returns an Elasticsearch hit whose `act.data` is absent (a cold, metadata-only document), the API:

1. Collects every such hit's `{block_num, global_sequence}`.
2. Groups them by the archive that **owns** each block (via the `ArchiveRegistry`).
3. Fans out to all owning archives **in parallel**, chunking each batch at `max_batch` (hard-capped at 20000).
4. Splices the returned `data` back into each hit **by request index** before the response is shaped.

The result is indistinguishable from a hot document. After hydration the API still runs `mergeActionMeta`, so `@<actionname>` ABI metadata is merged into the hydrated `act.data` exactly as for hot docs, and `?noBinary=true` truncation (in `get_actions`) runs **after** hydration, so hydrated data is correctly truncated.

Hydration is wired into three routes:

- `GET /v2/history/get_actions`
- `GET /v2/history/get_transaction`
- `GET /v2/history/get_deltas` (cold delta payloads are hydrated by `hydrateDeltas` — see [Delta hydration](#delta-hydration))

!!! tip "Hydration never fails a request"
    Hydration is **strictly best-effort**. Any archive timeout, non-200 status, malformed body, or order/length mismatch is logged via `hLog` and the affected hits are simply left without `act.data` — exactly the pre-hydration behavior. Hydration never fails the surrounding request.

## Configuration: `api.archives`

Add an `archives` block under `api` in your chain config (`config/<chain>.config.json`):

```jsonc
"api": {
  // ...existing api config...
  "archives": {
    "enabled": true,            // master switch; false/absent => hydration fully skipped
    "timeout_ms": 2000,         // per-archive HTTP timeout (default 2000)
    "max_batch": 20000,         // items per POST, capped at 20000
    "actions": [
      { "url": "http://archive-01:8080", "first_block": 1,         "last_block": 100000000 },
      { "url": "http://archive-02:8080", "first_block": 100000001, "last_block": 200000000 }
    ],
    "deltas": [                 // delta archives: same shape as actions; serve POST /deltas
      { "url": "http://archive-01:8080", "first_block": 1,         "last_block": 100000000 },
      { "url": "http://archive-02:8080", "first_block": 100000001, "last_block": 200000000 }
    ]
  }
}
```

| Field | Type | Default | Meaning |
|---|---|---|---|
| `enabled` | bool | `false` | Master switch. When false/absent, hydration is fully skipped (routes behave exactly as before). |
| `timeout_ms` | number | `2000` | Per-archive HTTP request timeout. |
| `max_batch` | number | `20000` | Items per `POST /actions`; **capped at 20000** even if set higher. |
| `actions[]` | array | `[]` | The action archives. Each entry: `{ url, first_block, last_block }`. |
| `deltas[]` | array | `[]` | The delta archives. Each entry has the **same shape** as `actions[]` (`{ url, first_block, last_block }`). Typically the **same** `archive-server` URLs as `actions[]`, since one archive serves both `POST /actions` and `POST /deltas`. Empty/absent ⇒ delta hydration no-ops. |

Each `ArchiveEntry`:

| Field | Meaning |
|---|---|
| `url` | Base URL of an `archive-server` (e.g. `http://archive-01:8080`). Trailing slashes are trimmed automatically. |
| `first_block` | First block owned by this archive (**inclusive**). |
| `last_block` | Last block owned by this archive (**inclusive**). |

The `ArchivesConfig` / `ArchiveEntry` interfaces and a matching Zod schema (`ArchivesConfigSchema`, wired into `HyperionApiConfigSchema`) live in [`src/interfaces/hyperionConfig.ts`](https://github.com/eosrio/hyperion-history-api/blob/main/src/interfaces/hyperionConfig.ts){:target="_blank"}, so existing config validation accepts the new section without any extra wiring.

!!! warning "Misconfigured ranges are dropped and logged, never silent"
    The `ArchiveRegistry` validates every entry as it loads. An entry with **no `url`** or an **inverted range** (`first_block > last_block`) is dropped and a warning is logged via `hLog`. An inverted range would silently own zero blocks; rather than let it pass as a phantom archive that hydrates nothing, the registry makes the misconfiguration visible at startup.

### When is hydration "live"?

A registry is only **enabled** when `enabled: true` **AND** at least one usable entry exists for that kind (actions / deltas). Otherwise `archiveFor()` returns `null` and the routes behave byte-for-byte as before.

The block-to-archive match is an inclusive `[first_block, last_block]` range scan; on overlap, the first matching entry in config order wins. Ranges are assumed non-overlapping and contiguous in practice.

## The `?hydrate` request param

Hydration can be opted out per request, on all three routes:

| Query | Effect |
|---|---|
| (absent) / `?hydrate=true` / `?hydrate=1` | **Hydration ON** (default). |
| `?hydrate=false` / `?hydrate=0` / `?hydrate=no` (string or boolean `false`) | **Hydration SKIPPED** for this request. |

```bash
# Default — cold act.data is hydrated from the archive:
curl 'http://hyperion-api/v2/history/get_actions?account=eosio.token&limit=10'

# Opt out — return cold docs without act.data (faster; no archive round-trip):
curl 'http://hyperion-api/v2/history/get_actions?account=eosio.token&limit=10&hydrate=false'
```

!!! note "Param behavior"
    - `?simple=true` responses are **still hydrated** unless `?hydrate=false` is also passed — the two params are orthogonal.
    - The `hydrate` param is documented in each route's OpenAPI querystring schema.
    - In `get_deltas`, `hydrate` is explicitly consumed (so it is never turned into an Elasticsearch term filter). In `get_actions` it is ignored as a query term naturally.

Shared parsing lives in `archive-query.ts` (`isHydrationDisabled`): default ON, opt-out only on an explicit falsy value.

## Per-request work bounds and limits

The archive's `POST /actions` endpoint **bounds the decode work per request**, in addition to the parse caps. Within a single request it resolves at most **4096 distinct blocks** and stops after a **~2-second wall-clock deadline**; any requested items not reached within those bounds are returned as `"found": false` (best-effort, contract-safe — the API treats `found:false` as "no payload available" and simply leaves `act.data` absent).

The parse caps also apply:

| Condition | Response |
|---|---|
| More than 20000 items in the request | `413` |
| Body larger than 64 MiB | `413` |
| Malformed body / non-array / bad item | `400` |
| More than 4096 distinct blocks resolved, or ~2-second deadline reached | items not reached returned as `"found": false` |

On the API side, `max_batch` (capped at 20000) keeps each chunk under the item cap, so the API never trips the `413` item limit; the per-request work-bound on the archive ensures a single oversized request can never monopolize an archive-server, while still returning a well-formed, same-order, same-length response.

## Multiple archives, one per frozen range

A deployment that has frozen several ranges runs **one `archive-server` per range** and lists them all under `api.archives.actions`. The API routes each cold hit to the archive whose range owns its `block_num`:

```text
cold hit block_num = 150,000,123
        │
        ▼  ArchiveRegistry.archiveFor(150000123)
  ┌─────────────────────────────────────────────┐
  │ archive-01  [1 .. 100,000,000]      → no     │
  │ archive-02  [100,000,001 .. 200M]   → YES ───┼──► POST http://archive-02:8080/actions
  │ archive-03  [200,000,001 .. 300M]   → no     │
  └─────────────────────────────────────────────┘
```

Hits are grouped per owning archive and each archive is POSTed **in parallel** (`Promise.all`); each archive's batch is chunked at `max_batch`. A failure of one archive only affects its own hits — the others still hydrate. Make each entry's `first_block`/`last_block` match the range its `archive-server` logs at startup (`serving blocks [first..last]`).

## Programmatic API

For reuse and future wiring:

```ts
import { hydrateActions } from 'src/api/helpers/archive-hydration.js';
import { ArchiveRegistry } from 'src/api/helpers/archive-registry.js';

// Mutates ES hits in place (sets hit._source.act.data) — best-effort, never throws.
await hydrateActions(fastify, hits);

// The registry (built from config) — also intended to feed future QRY Network state reporting.
const reg = ArchiveRegistry.forActions(fastify.manager.config.api.archives);
reg.archiveFor(block_num);  // => string | null  (owning archive URL, or null if hot)
reg.list();                 // => ArchiveEntry[]  (live-capable accessor)
```

- `ArchiveRegistry` is an instantiable class (not a hardcoded const), built from config via the static factories `forActions()` / `forDeltas()`. It is designed for **live refresh** and to surface deployment state to **QRY Network** reporting via `list()` — the registry is the basis for future network-wide cold-range state reporting.
- `hydrateActions` skips hits that already carry `act.data` (hot / cached — e.g. the Redis-cached `get_transaction` hits are a no-op), and skips hits with no `global_sequence` (the action cannot be identified). `global_sequence` is sent as-is (number or string) to preserve precision.

The registry source is `archive-registry.ts` and the hydration logic is `archive-hydration.ts`, both under [`src/api/helpers/`](https://github.com/eosrio/hyperion-history-api/tree/main/src/api/helpers){:target="_blank"}.

!!! warning "Known limitation: very large global_sequence"
    `global_sequence` is indexed in Elasticsearch as a `long` and surfaces in Node.js as a float64 number. This is **exact for every real Antelope chain today** — WAX, for example, is around `1e11`, while the JavaScript safe-integer limit (`2^53` ≈ `9.0e15`) is decades of throughput away.

    Only **above `2^53`** could a cold action fail to hydrate: it would come back as `found:false` with `act.data` absent — **never wrong data**. The durable fix (indexing `global_sequence` as a string / keyword) is a **breaking mapping change** and is intentionally deferred beyond the non-breaking v4.5 release.

## Delta hydration

`hydrateDeltas` (in `archive-hydration.ts`) is the real delta analog of `hydrateActions`: when a cold-tier delta hit has its payload dropped, it re-fetches the row from the owning delta archive's `POST /deltas` and splices it back in. It is wired into `get_deltas`.

!!! note "Delta hydration is supported in v4.5"
    Cold delta payloads are re-fetched on demand from the archive, exactly as action `act.data` is. Configure `api.archives.deltas` (same shape as `actions[]`, typically the same archive URLs) to enable it. When `api.archives.deltas` is empty / absent, delta hydration cleanly no-ops and cold delta docs simply lack their payload — byte-for-byte the pre-hydration behavior.

### How a cold delta is detected

A Hyperion delta `_source` carries its row payload as **either** a decoded `data` object **or** a raw `value` hex string. A **cold** (metadata-only) delta doc — produced by `delta-proto --metadata-only` — carries **NEITHER**. `hydrateDeltas` hydrates exactly the hits that have neither `data` nor `value` (and whose `block_num` maps to a configured delta archive). A hot delta that already carries `data` or `value` is skipped (untouched).

### The `/deltas` wire contract

```text
POST <archive>/deltas
  body: [{ "block_num": <number>, "code": "<name>", "scope": "<name>",
           "table": "<name>", "primary_key": <u64 number | decimal string> }, ...]
  200 : { "deltas": [ ...same order as request... ] }
    found + decoded:     { block_num, code, scope, table, primary_key, "data": <decoded row JSON>, "found": true }
    found + undecodable: { block_num, code, scope, table, primary_key, "value": "<lowercase hex>", "found": true }
    not-found:           { block_num, code, scope, table, primary_key, "found": false }
```

- **Same caps and work-bound as `/actions`**: a malformed / non-array / bad-item body returns `400`; more than **20000** items or a body larger than **64 MiB** returns `413`; per request the archive resolves at most **4096 distinct blocks** and stops after a **~2-second** deadline, leaving unreached items `found:false`.
- `scope` is matched by its **name string**, so arbitrary integer scopes work.
- `primary_key` accepts a JSON **number or a decimal string** and is **echoed back as a string**, so large `u64` primary keys round-trip without precision loss — unlike the action `global_sequence > 2^53` caveat below, which applies to **actions only**.
- Undecodable rows come back as **lowercase** hex under `value` (matching `delta-proto`, the validated producer of the cold doc), so a hydrated `value` is byte-identical to what a hot doc would carry. (Note: this is lowercase, whereas an undecodable action `data` hex from `/actions` is uppercase.)

### Assignment back onto the hit

`hydrateDeltas` collects cold delta hits, groups them by owning delta archive (`api.archives.deltas` via the `ArchiveRegistry`), batch-POSTs `/deltas` per archive **in parallel** (chunked at `max_batch`), and splices the result back **by request index**:

- `found:true` + `data` ⇒ sets `hit._source.data` (decoded row JSON).
- `found:true` + `value` ⇒ sets `hit._source.value` (raw hex).
- `found:false` (or neither field) ⇒ the hit is left untouched (stays cold).

Like `hydrateActions`, it is **strictly best-effort and never throws**: any archive timeout, non-200, malformed body, or order/length mismatch is logged via `hLog` and the affected hits are left without `data`/`value` — exactly the pre-hydration behavior. It is **non-breaking**: with no `api.archives.deltas` configured it is an effective no-op.

!!! success "Live-verified read-only against a WAX node"
    `POST /deltas` was live-tested read-only against a WAX node versus a `delta-proto` oracle: 68 decoded + 3 raw-`value` rows were byte-identical, including `scope != code` rows, primary keys above `2^53`, request ordering, the `400`/`413` errors, and the 4096-block / ~2-second work-bound. The real compiled `hydrateDeltas` hydrated cold delta hits to byte-identical `data` (a hot hit was left untouched, an out-of-range hit stayed cold, and a disabled registry was a no-op). The full local Docker-stack ES + API + archive round-trip is still the one outstanding integration item — for **both** actions and deltas.

## Storage levers (for context)

Cold-tiering and the storage-tuned mapping are **two independent levers** — do not conflate them. The numbers below are single-environment, measured on one benchmark box over one WAX range; re-measure on your own chain.

| Lever | What it does | Measured effect |
|---|---|---|
| Cold-tiering | Drops `act.data` for frozen ranges (re-served on demand by an archive) | ~-11% on WAX, more on data-heavy chains |
| Storage-tuned mapping | Field-tuned mapping that shrinks **every** doc | -39% field-tuned, -43% with `+logsdb` |

See the [Overview](overview.md) for how these fit the wider tiered-storage design.

## Files

| File | Role |
|---|---|
| `src/api/helpers/archive-registry.ts` | `ArchiveRegistry` — config-built, range lookup with validation, `list()`. |
| `src/api/helpers/archive-hydration.ts` | `hydrateActions` and `hydrateDeltas` (both real). |
| `src/api/helpers/archive-query.ts` | `isHydrationDisabled` — the `?hydrate` param parser. |
| `src/interfaces/hyperionConfig.ts` | `ArchivesConfig` / `ArchiveEntry` + Zod schema. |
| `src/api/routes/v2-history/get_actions/*` | Hydration wired before the response loop; `hydrate` in OpenAPI schema. |
| `src/api/routes/v2-history/get_transaction/*` | Hydration wired before the action loop. |
| `src/api/routes/v2-history/get_deltas/*` | `hydrateDeltas` wired before the response loop; `hydrate` param consumed so it isn't an ES filter. |

All helper sources live under [`src/api/helpers/`](https://github.com/eosrio/hyperion-history-api/tree/main/src/api/helpers){:target="_blank"} in the [Hyperion history API repo](https://github.com/eosrio/hyperion-history-api){:target="_blank"}.
