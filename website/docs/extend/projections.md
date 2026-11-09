---
title: State projections and backends
---

# State projections and backends

A projection defines how normalized contract changes become queryable state. Keep that definition independent of database-native operations. The SDK, shared runtime and backend adapter have distinct responsibilities.

## Definition and runtime

A declarative definition selects the contract/table and ABI deployment, maps required fields, and declares initialization inputs. The runtime needs contiguous source blocks, including empty blocks, to establish ordering and coverage. Missing predecessors cannot be treated as a successful checkpoint.

The fixed-ABI portable runtime accepts backend-neutral replacement/delete operations and keeps an ordered work queue per projection. Other projections can continue when one scope fails.

## MongoDB adapter

The independently packaged MongoDB adapter requires a transaction-capable replica set or sharded cluster. It refuses standalone topology before projection storage is initialized. Source intent, effects, replay receipts and completed checkpoints participate in its durability contract.

Queries bind a complete projection/backend identity and a ready checkpoint. Row and count reads use a consistent read view, and readiness is rechecked before publication. There is no implicit cross-projection or history/state snapshot barrier.

## Existing state collections

Existing system-table and custom-contract MongoDB collections have a different integration path. Adding a portable projection does not automatically migrate them, expose a new HTTP domain or enable canonical fork rollback. Use the component's declared query interface and integration boundaries.

## Recovery

Track initialization/source coverage, applied checkpoints, incomplete markers and the exact pending recovery target. A future frame cannot clear an earlier gap. Preserve failed-work evidence and return unavailable for affected queries until their readiness contract is satisfied.

## Stateful owner

`features.stateful_owner_v2` is the host path for chain state. Each projection has one owner, which recovers canonical forks through retained undo and serves a view only after rechecking it against the original source.

The earlier `features.portable_state` host path and `POST /v2/state/query` were removed before any release. Setting that key now stops startup with an error that points to `stateful_owner_v2`. The SDK family and packaged adapter described above remain.

### Finality

`features.stateful_owner_v2.finality` selects what a view can contain. Stateful responses report the mode in the `Hyperion-State-Finality` header.

| Mode | Follows | Forks |
|---|---|---|
| `reversible` (default) | Canonical head | Recovered through retained undo |
| `irreversible` | Last irreversible block, proved on the canonical branch | Never rolled back |

Consider these rules before choosing `irreversible`:

- It uses its own generation, so reversible effects can never seed it. Changing mode needs a controlled restart and fresh state initialization.
- An orphaned checkpoint or a retained rollback leaves the view unavailable, because applied effects are never undone.
- If the source reports an older or different last irreversible block, the view stays unavailable until the source catches up. Durable input waits and is not failed.
- The last irreversible block must be provable. If it trails the head by more than `protocol_abi_coordination.recovery_window_blocks`, the chain needs `historical_certificates`; otherwise the view is unavailable.

### Serving lag bound

`features.stateful_owner_v2.maximumServingLagBlocks` is a positive whole number of blocks. A view that trails its finality target by more than that answers 503. The target is the head in `reversible` mode and the eligible last irreversible block in `irreversible` mode.

The bound only ever refuses a request; it never changes what a view contains. It stays out of the configuration digest, so changing it does not disturb an existing instance or need a new `generation`.

Leave it unset to keep the owner's own readiness rules alone. Set it before enabling plugin-backed core routes: they install only when it is set.

## Plugin-backed core state routes

An extension provider's legacy state routes each resolve a backing. Without one, a route keeps answering 503 `protocol_projection_unavailable`, refused before any response-cache or storage read. That is the default, and the only outcome for `get_table_rows`, `get_proposals` and row history (`get_deltas`, `get_table_state` and delta streams).

A plugin can back a route with one of its owner-v2 projections through the optional `getLegacyStateRoutesV1` method. Plugin routes register before core routes, so a plugin cannot take over a core path any other way. For each route, the method declares the projection ID, the read it needs (`keyed`, or `complete-kind` where the host offers it), a `compose(reader, request)` callback and an optional `validate(request)`.

Only these routes accept a backing:

- `/v2/state/get_tokens`
- `/v2/state/get_top_holders`
- `/v2/state/get_voters`
- `/v2/state/get_voter_scopes`
- `/v2/state/get_links`

A route that two plugins claim stays unavailable. Backed routes also need `maximumServingLagBlocks`; without it, the API logs that and keeps them unavailable.

The host opens the request's read itself and gives the plugin only validated query parameters and the route's `api.limits` entry. A backed route answers like other stateful responses:

| Outcome | Response |
|---|---|
| Served | 200, with the `hyperion-state-*` view headers and `cache-control: no-store` |
| Owner or view not ready, or the view trails the lag bound | 503 `stateful.query-unavailable`, retryable |
| `validate` returns a message | 400 `invalid_state_request`, before any read |

Backed routes never read or fill the Redis response cache. The owner and view are checked around the composition and again before the response is sent.

### Token balances

The legacy token responses report balances as float `amount` values, which cannot hold large supplies exactly. A projection-backed `get_tokens` or `get_top_holders` also returns `balance`, the exact asset text, for example `75323.350694444 WIRE`. Clients that add balances up should read `balance`. Responses from the MongoDB state path keep `amount` only.

## Wire state plugin

The Wire state plugin is the `state/` package of the Wire plugin repository, `@eosrio/hyperion-wire-state`. Its `wire-token-balances-v1` projection reads the `accounts` and `stat` tables of `sysio.token`, `sysio.liq` and `sysio.swap`, and backs `get_tokens` and `get_top_holders`. It is separate from the Wire protocol provider and is still a development package.

Build it in that repository and install it into the Hyperion checkout:

```sh
npm ci --allow-git=all
npx tsc -p state/tsconfig.json
node state/scripts/install.mjs <hyperion-root>
```

The install script copies the plugin to `<hyperion-root>/plugins/wire-state` and enables it in `plugins/.state.json`. Install byte-identical copies wherever the indexer and API run, because the projection's declaration includes the plugin's code.

Enable it in the chain configuration of both the indexer and the API:

```json
{
  "plugins": {
    "wire-state": {
      "enabled": true,
      "tokens": {
        "rankedSymbols": [{"contract": "sysio.token", "symbol": "WIRE"}]
      }
    }
  }
}
```

- `tokens.rankedSymbols` selects the symbols `get_top_holders` can rank. It answers 400 for any other symbol.
- `tokens.contracts` defaults to the three contracts above. `tokens.verifiedAbis` adds checked ABI hashes per contract; a row from any other ABI stops the projection.
- Changing this configuration changes the projection's declaration, so it needs a new `features.stateful_owner_v2.generation`.

The host also needs `features.stateful_owner_v2` with `maximumServingLagBlocks`, and its `complete-kind` read for ranking.

The projection fails closed. It stops serving when a touched symbol's balances no longer add up to its supply, a row's key disagrees with its value, a deletion removes a balance it never projected, or a row comes from an unverified ABI.

## Source

[Runtime and adapter scope](https://github.com/eosrio/hyperion-history-api/blob/e1818923065d648a38009572d76badeab0684af1/docs/portable-projection.md) and [MongoDB adapter](https://github.com/eosrio/hyperion-history-api/tree/e1818923065d648a38009572d76badeab0684af1/packages/backend-mongodb). [Stateful owner host and core state routes](https://github.com/eosrio/hyperion-history-api/blob/3741c3d50910912aa72eefe776a2aaf0168151d4/docs/architecture/stateful-owner-v2-host.md). [Wire state plugin](https://github.com/eosrio/hyperion-wire-plugin/blob/7796e84827206201cffa0c8a371c50c9bbad24c7/state/README.md).
