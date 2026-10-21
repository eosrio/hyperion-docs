---
title: v2 / history / get_abi_snapshot
sidebar_label: get_abi_snapshot
---

# v2 / history / get_abi_snapshot

`GET /v2/history/get_abi_snapshot`

Availability and returned data depend on the provider's enabled services, retained range and permissions.

## GET

fetch contract abi at specific block

### Query parameters

| Name | Type | Required | Description |
|---|---|---|---|
| `contract` | string | Yes | contract account |
| `block` | integer | No | target block |
| `fetch` | boolean | No | should fetch the ABI |



### HTTP 200

Response shape is not declared here; inspect the provider response and runtime API specification.

## Errors and provider capabilities

Check HTTP status before parsing JSON. Validation errors, unavailable dependencies, query failures and missing source coverage are distinct outcomes. The running provider's [OpenAPI interface](/reference/overview/#provider-api-specification) includes its installed plugins and configuration.

## Source

[Route definition](https://github.com/eosrio/hyperion-history-api/blob/e1818923065d648a38009572d76badeab0684af1/src/api/routes/v2-history/get_abi_snapshot/index.ts) at `e1818923065d648a38009572d76badeab0684af1`. SHA-256: `5c8504fa7fd96d63c5b70cafcdfa8a56994177442e8dff9a4c5f9c5c6652a220`. [Download the core source OpenAPI](/reference/hyperion-source.openapi.json). Generated from the 4.5 source.
