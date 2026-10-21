---
title: v1 / chain / get_producers
sidebar_label: get_producers
---

# v1 / chain / get_producers

`GET /v1/chain/get_producers` · `POST /v1/chain/get_producers`

This route forwards requests to the configured chain RPC. Its data and availability follow that node, rather than Hyperion indexed-history coverage.

Availability and returned data depend on the provider's enabled services, retained range and permissions.

## GET

Retrieves producers list

### Query parameters

| Name | Type | Required | Description |
|---|---|---|---|
| `limit` | string | No | total number of producers to retrieve |
| `lower_bound` | string | No | In conjunction with limit can be used to paginate through the results. For example, limit=10 and lower_bound=10 would be page 2 |
| `json` | boolean | No | return result in JSON format |



### HTTP 200

Response shape is not declared here; inspect the provider response and runtime API specification.

## POST

Retrieves producers list

No query parameters are declared for this method.

### Request body

```json
{
  "anyOf": [
    {
      "type": "object",
      "properties": {
        "limit": {
          "type": "string",
          "description": "total number of producers to retrieve"
        },
        "lower_bound": {
          "type": "string",
          "description": "In conjunction with limit can be used to paginate through the results. For example, limit=10 and lower_bound=10 would be page 2"
        },
        "json": {
          "type": "boolean",
          "description": "return result in JSON format"
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

[Route definition](https://github.com/eosrio/hyperion-history-api/blob/e1818923065d648a38009572d76badeab0684af1/src/api/routes/v1-chain/get_producers/index.ts) at `e1818923065d648a38009572d76badeab0684af1`. SHA-256: `b07e595a33a691eb5c59647caee3035af5f2b3a1bd4c34a5fff78dd2bebf5f6f`. [Download the core source OpenAPI](/reference/hyperion-source.openapi.json). Generated from the 4.5 source.
