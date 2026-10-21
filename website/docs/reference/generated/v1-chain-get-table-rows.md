---
title: v1 / chain / get_table_rows
sidebar_label: get_table_rows
---

# v1 / chain / get_table_rows

`GET /v1/chain/get_table_rows` · `POST /v1/chain/get_table_rows`

This route forwards requests to the configured chain RPC. Its data and availability follow that node, rather than Hyperion indexed-history coverage.

Availability and returned data depend on the provider's enabled services, retained range and permissions.

## GET

Returns an object containing rows from the specified table.

### Query parameters

| Name | Type | Required | Description |
|---|---|---|---|
| `code` | string | Yes | The name of the smart contract that controls the provided table |
| `table` | string | Yes | The name of the table to query |
| `scope` | string | Yes | The account to which this data belongs |
| `index_position` | string | No | Position of the index used, accepted parameters `primary`, `secondary`, `tertiary`, `fourth`, `fifth`, `sixth`, `seventh`, `eighth`, `ninth` , `tenth` |
| `key_type` | string | No | Type of key specified by index_position (for example - `uint64_t` or `name`) |
| `encode_type` | string | No |  |
| `upper_bound` | string | No |  |
| `lower_bound` | string | No |  |



### HTTP 200

Response shape is not declared here; inspect the provider response and runtime API specification.

## POST

Returns an object containing rows from the specified table.

No query parameters are declared for this method.

### Request body

```json
{
  "anyOf": [
    {
      "type": "object",
      "properties": {
        "code": {
          "type": "string",
          "description": "The name of the smart contract that controls the provided table"
        },
        "table": {
          "type": "string",
          "description": "The name of the table to query"
        },
        "scope": {
          "type": "string",
          "description": "The account to which this data belongs"
        },
        "index_position": {
          "type": "string",
          "description": "Position of the index used, accepted parameters `primary`, `secondary`, `tertiary`, `fourth`, `fifth`, `sixth`, `seventh`, `eighth`, `ninth` , `tenth`"
        },
        "key_type": {
          "type": "string",
          "description": "Type of key specified by index_position (for example - `uint64_t` or `name`)"
        },
        "encode_type": {
          "type": "string"
        },
        "upper_bound": {
          "type": "string"
        },
        "lower_bound": {
          "type": "string"
        }
      },
      "required": [
        "code",
        "table",
        "scope"
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

[Route definition](https://github.com/eosrio/hyperion-history-api/blob/e1818923065d648a38009572d76badeab0684af1/src/api/routes/v1-chain/get_table_rows/index.ts) at `e1818923065d648a38009572d76badeab0684af1`. SHA-256: `fa3781267eef2a000181ffc777081faa3481c47ed7528228317b6fb600a5ef66`. [Download the core source OpenAPI](/reference/hyperion-source.openapi.json). Generated from the 4.5 source.
