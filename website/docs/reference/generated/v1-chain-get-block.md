---
title: v1 / chain / get_block
sidebar_label: get_block
---

# v1 / chain / get_block

`GET /v1/chain/get_block` · `POST /v1/chain/get_block`

This route forwards requests to the configured chain RPC. Its data and availability follow that node, rather than Hyperion indexed-history coverage.

Availability and returned data depend on the provider's enabled services, retained range and permissions.

## GET

Returns an object containing various details about a specific block on the blockchain.

### Query parameters

| Name | Type | Required | Description |
|---|---|---|---|
| `block_num_or_id` | string | Yes | Provide a `block number` or a `block id` |



### HTTP 200

Response shape is not declared here; inspect the provider response and runtime API specification.

## POST

Returns an object containing various details about a specific block on the blockchain.

No query parameters are declared for this method.

### Request body

```json
{
  "anyOf": [
    {
      "type": "object",
      "properties": {
        "block_num_or_id": {
          "description": "Provide a `block number` or a `block id`",
          "type": "string"
        }
      },
      "required": [
        "block_num_or_id"
      ]
    },
    {
      "type": "string"
    }
  ]
}
```

### HTTP 200

Response shape is not declared here; inspect the provider response and runtime API specification.

## Errors and provider capabilities

Check HTTP status before parsing JSON. Validation errors, unavailable dependencies, query failures and missing source coverage are distinct outcomes. The running provider's [OpenAPI interface](/reference/overview/#provider-api-specification) includes its installed plugins and configuration.

## Source

[Route definition](https://github.com/eosrio/hyperion-history-api/blob/e1818923065d648a38009572d76badeab0684af1/src/api/routes/v1-chain/get_block/index.ts) at `e1818923065d648a38009572d76badeab0684af1`. SHA-256: `f766544bd4fc1146bb6a3275727365a5797e702f9a4a022847a264e370b40802`. [Download the core source OpenAPI](pathname:///reference/hyperion-source.openapi.json). Generated from the 4.5 source.
