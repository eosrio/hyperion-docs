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

## Source

[Runtime and adapter scope](https://github.com/eosrio/hyperion-history-api/blob/e1818923065d648a38009572d76badeab0684af1/docs/portable-projection.md) and [MongoDB adapter](https://github.com/eosrio/hyperion-history-api/tree/e1818923065d648a38009572d76badeab0684af1/packages/backend-mongodb).
