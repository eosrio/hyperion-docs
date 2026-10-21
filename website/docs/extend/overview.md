---
title: Extend Hyperion
---

# Extend Hyperion

Choose the boundary that owns the behavior you need. Keep protocol decoding, contract state, API queries and database operations independent so each component has a clear compatibility and failure contract.

## Choose the boundary

| Need | Extension |
|---|---|
| Decode a chain's SHiP/native values | [Protocol provider](protocols.md). |
| Build state from contract changes | [Contract projection](projections.md). |
| Serve domain-specific routes | API plugin with declared data and readiness requirements. |
| Support a database engine | Backend adapter with explicit capabilities and query semantics. |

## Existing plugins

The [plugin catalog](https://github.com/eosrio/hyperion-plugins) and legacy `hpm` manager belong to the existing extension path. Pin the plugin/core pair and inspect the plugin's own installation instructions. A legacy handler is not automatically a portable SDK projection or a protocol provider.

## SDK, protocol and storage components

The SDK defines portable contracts; the host selects executable protocol components before decoding. Declarative projections use backend-neutral operations, while database-native storage and query execution remain inside the adapter. Read the component's exact source and supported integration path before wiring it into an operator deployment.

## Lifecycle

Declare supported core/SDK versions, source/ABI initialization inputs, required backend capabilities, query scope and failure behavior. Executable package changes use an operator-controlled installation and restart. A declarative mapping activation is a different operation.

## Validate an integration

Verify initialization, contiguous replay, duplicate detection, forks, restart, gaps, cancellation and failure isolation. Match row and count reads to the same declared checkpoint. Record exact component pins and expected unavailable/error behavior alongside successful queries.

See [component compatibility](../releases/compatibility.md) and [the CLI guide](../reference/cli.md).
