---
title: v1 / chain / get_table_by_scope
sidebar_label: get_table_by_scope
---

# v1 / chain / get_table_by_scope

`GET /v1/chain/get_table_by_scope` · `POST /v1/chain/get_table_by_scope`

This route forwards requests to the configured chain RPC. Its data and availability follow that node, rather than Hyperion indexed-history coverage.

Availability and returned data depend on the provider's enabled services, retained range and permissions.

## GET

Retrieves table scope

### Query parameters

| Name | Type | Required | Description |
|---|---|---|---|
| `code` | string | Yes | `name` of the contract to return table data for |
| `table` | string | No | Filter results by table |
| `lower_bound` | string | No | Filters results to return the first element that is not less than provided value in set |
| `upper_bound` | string | No | Filters results to return the first element that is greater than provided value in set |
| `limit` | integer | No | Limit number of results returned. |
| `reverse` | boolean | No | Reverse the order of returned results |



### HTTP 200

Response shape is not declared here; inspect the provider response and runtime API specification.

## POST

Retrieves table scope

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
          "description": "`name` of the contract to return table data for"
        },
        "table": {
          "type": "string",
          "description": "Filter results by table"
        },
        "lower_bound": {
          "type": "string",
          "description": "Filters results to return the first element that is not less than provided value in set"
        },
        "upper_bound": {
          "type": "string",
          "description": "Filters results to return the first element that is greater than provided value in set"
        },
        "limit": {
          "type": "integer",
          "description": "Limit number of results returned."
        },
        "reverse": {
          "type": "boolean",
          "description": "Reverse the order of returned results"
        }
      },
      "required": [
        "code"
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

[Route definition](https://github.com/eosrio/hyperion-history-api/blob/e1818923065d648a38009572d76badeab0684af1/src/api/routes/v1-chain/get_table_by_scope/index.ts) at `e1818923065d648a38009572d76badeab0684af1`. SHA-256: `55483bf78d19c498c722042efb1c47a333acf834fb788b3f8ae8bfb55373065a`. [Download the core source OpenAPI](pathname:///reference/hyperion-source.openapi.json). Generated from the 4.5 source.
