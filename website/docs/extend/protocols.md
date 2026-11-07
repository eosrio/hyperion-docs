---
title: Protocol providers
---

# Protocol providers

Select the protocol before decoding a chain's SHiP requests, blocks, traces and deltas. Protocol interpretation is a separate boundary from contract projections, API domains and storage adapters.

## Default Antelope provider

Omitting `settings.protocol` keeps the Antelope provider. An explicit equivalent is:

```json
{"settings": {"protocol": {"provider": "antelope"}}}
```

Use the normal chain connection configuration for RPC and SHiP endpoints. Retain existing historical indices when upgrading; new ABI/protocol metadata is additive rather than a reason to discard history.

## Extension selection

An extension selection contains `provider: "extension"`, the installed package name and an exact `profileId`. The host verifies inert descriptors, source revisions, file hashes, executable entry coverage and compatible Node/Rust component identities before importing provider code.

Choose the profile that matches the node's actual protocol, contracts and genesis. Package installation alone does not select a chain profile. A profile rejected by artifact or source verification must not be activated by bypassing those checks.

## Wire package

`@eosrio/hyperion-wire-plugin` packages Wire-specific ABI/value/SHiP codecs. Its source-pinned profiles have explicit node/build identities; do not treat a profile for a different build as generic Wire compatibility. The Node and Rust members are one coordinated component package.

Executable provider changes require a controlled worker restart. A declarative mapping update is a different lifecycle and does not replace a native provider during a running session.

## Source and ABI coverage

ABI decoding requires the ABI that applies to the source block and action epoch. A latest ABI lookup cannot establish this. Missing or conflicting coverage must remain an explicit unavailable/error outcome; preserve original source bytes and identity for recovery.

Extension-state routes covered by the readiness guard return HTTP 503 with code `protocol_projection_unavailable` and retry guidance. This includes affected contract-state, row-history and permission views. They do not silently fall back to a stale legacy projection. Ordinary retained-history availability is evaluated separately.

`/v2/state/get_account` stays available for extension providers because it reads no unqualified projection. It returns the node's account record, every balance the node reports in the system token contract (`<eosio_alias>.token`, named in `token_contracts`), and the account's actions from the metadata-only action search. Parts it cannot serve are named in `unavailable` and left out of the response rather than returned empty: `links` always, and `tokens` when the node balance call fails.

## Validate a deployment

Record the chain ID, node revision, profile, package/component hashes, genesis/source range and enabled consumer capabilities. Verify canonical source coverage, replay, forks, restart, cancellation and representative API outcomes for that exact deployment.

## Source

[Provider activation](https://github.com/eosrio/hyperion-history-api/blob/e1818923065d648a38009572d76badeab0684af1/src/indexer/protocol/selection.ts), [state readiness guard](https://github.com/eosrio/hyperion-history-api/blob/e1818923065d648a38009572d76badeab0684af1/src/api/helpers/protocol-state-readiness.ts), and [source-pinned Wire package](https://github.com/eosrio/hyperion-wire-plugin/tree/e8c7162437a0d0f4e2211979b959f2d002bf3552).
