---
title: Component compatibility
---

# Component compatibility

Keep the core, runtime, protocol, SDK, client, plugin and database identities separate. A package name or API path alone does not describe a complete working deployment.

## Source component set

| Component | 4.5 source baseline |
|---|---|
| Hyperion core | `e1818923065d648a38009572d76badeab0684af1` on `release/4.5`. |
| Application runtime | Node >=22; source CI uses Node 22 and 24. Match native ABI and libc. |
| Compiler/checker | TypeScript 7.0.2; Bun 1.4.3 for checks/tests. |
| Hyperion SDK | Source pin `38dfdb08d3145ad7fdff1a004e9ae94a43c1fe83` in the core lockfile. |
| Wire package | Source pin `e8c7162437a0d0f4e2211979b959f2d002bf3552`; exact profile/node identity is additional. |
| Elasticsearch client | 8.19.1. Server-version compatibility is a separate contract. |
| MongoDB driver | 7.2.0. Portable projections require transaction-capable server topology. |
| Stream Client | Independent package; this guide uses source `99ad2cf1ee47ee7c8c5cf3ea7a4f35bfbdf4ff11` and its async stream interface. |
| Explorer | Independent application; source 1.4.1 uses its own Node engine range and SSR build. |

## Data-service compatibility

Do not derive a supported server major version from the JavaScript client version. The source contains scoped Elasticsearch 9.5.5 and MongoDB adapter evidence; inspect its coverage and your required workloads before changing service versions. Existing index formats, plugins, snapshots and topology impose additional constraints.

The core startup path checks MongoDB connectivity even when relevant collection creation is disabled. A portable projection's transaction/topology requirement is additional to that legacy startup behavior.

## Provider capability checks

Record chain ID, deployed artifact, enabled routes/components, retained history, state initialization and finality behavior. A provider exposing `/v2` does not necessarily have your required protocol profile, projection, archive or stream policy.

Check the provider's `/docs` specification and health, then verify known history/state data. Do not translate HTTP 503 source/projection unavailability into a successful empty result.

## Upgrade and rollback

Keep database compatibility, application artifact rollback and projection recovery as separate plans. Preserve existing Elasticsearch history and record where new data/schema writes make rollback unsafe. Follow [the upgrade guide](/providers/update/).

## Source

[Package pins](https://github.com/eosrio/hyperion-history-api/blob/e1818923065d648a38009572d76badeab0684af1/package.json), [CI/runtime policy](https://github.com/eosrio/hyperion-history-api/blob/e1818923065d648a38009572d76badeab0684af1/docs/development-build.md), and [database adapter scope](https://github.com/eosrio/hyperion-history-api/blob/e1818923065d648a38009572d76badeab0684af1/docs/portable-projection.md).
