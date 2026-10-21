---
title: v1 / chain / get_info
sidebar_label: get_info
---

# v1 / chain / get_info

`GET /v1/chain/get_info` · `POST /v1/chain/get_info`

This route forwards requests to the configured chain RPC. Its data and availability follow that node, rather than Hyperion indexed-history coverage.

Availability and returned data depend on the provider's enabled services, retained range and permissions.

## GET

Returns an object containing various details about the blockchain.

No query parameters are declared for this method.



### HTTP 200

Response shape is not declared here; inspect the provider response and runtime API specification.

## POST

Returns an object containing various details about the blockchain.

No query parameters are declared for this method.

### Request body

```json
{}
```

### HTTP 200

Response shape is not declared here; inspect the provider response and runtime API specification.

## Errors and provider capabilities

Check HTTP status before parsing JSON. Validation errors, unavailable dependencies, query failures and missing source coverage are distinct outcomes. The running provider's [OpenAPI interface](/reference/overview/#provider-api-specification) includes its installed plugins and configuration.

## Source

[Route definition](https://github.com/eosrio/hyperion-history-api/blob/e1818923065d648a38009572d76badeab0684af1/src/api/routes/v1-chain/get_info/index.ts) at `e1818923065d648a38009572d76badeab0684af1`. SHA-256: `bcae7a6d9c6dd648e14bd72463a8d3079fdd5e09695f62e07edaff229cc2dd8a`. [Download the core source OpenAPI](/reference/hyperion-source.openapi.json). Generated from the 4.5 source.
