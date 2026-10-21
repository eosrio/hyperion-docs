---
title: API and configuration reference
---

# API and configuration reference

Hyperion 4.5 exposes history, state, statistics and service endpoints, legacy v1 compatibility, and chain-RPC forwarding. API route versions are independent of the product release.

## Core APIs

- [API v2](/api/v2/): history, state, statistics and service routes.
- [API v1](/api/v1/): history compatibility and trace routes.
- [Chain configuration](/providers/setup/chain/) and [connections](/providers/setup/connections/).
- [CLI command guide](cli.md).

The per-route pages extract every TypeScript route definition in the pinned 4.5 core. They preserve declared parameters, required fields, request/response schemas and methods. An undeclared response shape remains undeclared; it is not an empty JSON response.

## Provider API specification

Open `/docs` on the running API, or the compatible `/v2/docs` route, to inspect that deployment's specification. Installed plugins, enabled services and upstream node capabilities are deployment-specific. `/v1/node/get_supported_apis` merges the core route list with the node's advertised APIs.

The core also forwards `/v1/chain/*` requests to the configured chain RPC. These responses follow the node's contract and availability rather than indexed-history retention. Generated forwarding pages describe the declared core wrappers.

## Download

[Download the source-derived OpenAPI document](pathname:///reference/hyperion-source.openapi.json). It contains declared core operations and shared schemas. Runtime plugin routes and the upstream wildcard's complete node contract must be inspected on the provider.

## Historical endpoint names

The old v2 reference mentioned `get_transfers` and `get_transacted_accounts`. Neither has a core TypeScript route definition in this source. Their [original anchors](/api/v2/#v2historyget_transfers) remain available with an explanation; use supported action filters or an explicitly installed extension.

## Source

[Core route registration](https://github.com/eosrio/hyperion-history-api/blob/e1818923065d648a38009572d76badeab0684af1/src/api/routes.ts) and [4.5 implementation](https://github.com/eosrio/hyperion-history-api/tree/e1818923065d648a38009572d76badeab0684af1). Each generated page records its source path and SHA-256 hash.
