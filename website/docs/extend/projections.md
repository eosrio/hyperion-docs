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

## Source

[Runtime and adapter scope](https://github.com/eosrio/hyperion-history-api/blob/e1818923065d648a38009572d76badeab0684af1/docs/portable-projection.md) and [MongoDB adapter](https://github.com/eosrio/hyperion-history-api/tree/e1818923065d648a38009572d76badeab0684af1/packages/backend-mongodb). [Stateful owner host](https://github.com/eosrio/hyperion-history-api/blob/6f3761608b083504ec844cb0d82c10ec283c61e2/docs/architecture/stateful-owner-v2-host.md).
