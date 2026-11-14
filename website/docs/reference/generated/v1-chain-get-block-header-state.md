---
title: v1 / chain / get_block_header_state
sidebar_label: get_block_header_state
---

# v1 / chain / get_block_header_state

`GET /v1/chain/get_block_header_state` · `POST /v1/chain/get_block_header_state`

This route forwards requests to the configured chain RPC. Its data and availability follow that node, rather than Hyperion indexed-history coverage.

Availability and returned data depend on the provider's enabled services, retained range and permissions.

## GET

Retrieves the block header state

### Query parameters

| Name | Type | Required | Description |
|---|---|---|---|
| `block_num_or_id` | string | Yes | Provide a block_number or a block_id |



### HTTP 200

Response shape is not declared here; inspect the provider response and runtime API specification.

## POST

Retrieves the block header state

No query parameters are declared for this method.

### Request body

```json
{
  "anyOf": [
    {
      "type": "object",
      "properties": {
        "block_num_or_id": {
          "type": "string",
          "description": "Provide a block_number or a block_id"
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

[Route definition](https://github.com/eosrio/hyperion-history-api/blob/e1818923065d648a38009572d76badeab0684af1/src/api/routes/v1-chain/get_block_header_state/index.ts) at `e1818923065d648a38009572d76badeab0684af1`. SHA-256: `632caf4f91644f4fa30be7d72554e3e88b96fae7c16ed93e5137ce059a46a4a8`. [Download the core source OpenAPI](pathname:///reference/hyperion-source.openapi.json). Generated from the 4.5 source.
