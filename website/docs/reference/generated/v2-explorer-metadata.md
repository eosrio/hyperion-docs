---
title: v2 / explorer_metadata
sidebar_label: explorer_metadata
---

# v2 / explorer_metadata

`GET /v2/explorer_metadata`

Availability and returned data depend on the provider's enabled services, retained range and permissions.

## GET

Get metadata for the Hyperion Explorer

No query parameters are declared for this method.



### HTTP 200

Response shape is not declared here; inspect the provider response and runtime API specification.

## Errors and provider capabilities

Check HTTP status before parsing JSON. Validation errors, unavailable dependencies, query failures and missing source coverage are distinct outcomes. The running provider's [OpenAPI interface](/reference/overview/#provider-api-specification) includes its installed plugins and configuration.

## Source

[Route definition](https://github.com/eosrio/hyperion-history-api/blob/e1818923065d648a38009572d76badeab0684af1/src/api/routes/v2/explorer_metadata/index.ts) at `e1818923065d648a38009572d76badeab0684af1`. SHA-256: `42380dbd4dfa218bd385c4cf51c63779589ee62f326c6b4b27e2a7e19cb7db59`. [Download the core source OpenAPI](pathname:///reference/hyperion-source.openapi.json). Generated from the 4.5 source.
