---
title: v1 / chain / get_activated_protocol_features
sidebar_label: get_activated_protocol_features
---

# v1 / chain / get_activated_protocol_features

`GET /v1/chain/get_activated_protocol_features` · `POST /v1/chain/get_activated_protocol_features`

This route forwards requests to the configured chain RPC. Its data and availability follow that node, rather than Hyperion indexed-history coverage.

Availability and returned data depend on the provider's enabled services, retained range and permissions.

## GET

Retrieves the activated protocol features for producer node

### Query parameters

| Name | Type | Required | Description |
|---|---|---|---|
| `lower_bound` | integer | No | Lower bound |
| `upper_bound` | integer | No | Upper bound |
| `limit` | integer | No | The limit, default is 10 |
| `search_by_block_num` | boolean | No | Flag to indicate it is has to search by block number |
| `reverse` | boolean | No | Flag to indicate it has to search in reverse |



### HTTP 200

Response shape is not declared here; inspect the provider response and runtime API specification.

## POST

Retrieves the activated protocol features for producer node

No query parameters are declared for this method.

### Request body

```json
{
  "anyOf": [
    {
      "type": "object",
      "properties": {
        "lower_bound": {
          "type": "integer",
          "description": "Lower bound"
        },
        "upper_bound": {
          "type": "integer",
          "description": "Upper bound"
        },
        "limit": {
          "type": "integer",
          "description": "The limit, default is 10"
        },
        "search_by_block_num": {
          "type": "boolean",
          "description": "Flag to indicate it is has to search by block number"
        },
        "reverse": {
          "type": "boolean",
          "description": "Flag to indicate it has to search in reverse"
        }
      }
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

[Route definition](https://github.com/eosrio/hyperion-history-api/blob/e1818923065d648a38009572d76badeab0684af1/src/api/routes/v1-chain/get_activated_protocol_features/index.ts) at `e1818923065d648a38009572d76badeab0684af1`. SHA-256: `18269e91818eb6d96fde03ba1adbc9d2d3e214e3a5fd8107ee78dc620d9fb959`. [Download the core source OpenAPI](/reference/hyperion-source.openapi.json). Generated from the 4.5 source.
