---
title: v1 / history / get_transaction
sidebar_label: get_transaction
---

# v1 / history / get_transaction

`POST /v1/history/get_transaction`

Availability and returned data depend on the provider's enabled services, retained range and permissions.

## POST

get all actions belonging to the same transaction

No query parameters are declared for this method.

### Request body

```json
{
  "type": "object",
  "properties": {
    "id": {
      "description": "transaction id",
      "type": "string"
    },
    "block_num_hint": {
      "description": "block number hint",
      "type": "integer"
    }
  },
  "required": [
    "id"
  ]
}
```

### HTTP 200

Response shape is not declared here; inspect the provider response and runtime API specification.

## Errors and provider capabilities

Check HTTP status before parsing JSON. Validation errors, unavailable dependencies, query failures and missing source coverage are distinct outcomes. The running provider's [OpenAPI interface](/reference/overview/#provider-api-specification) includes its installed plugins and configuration.

## Source

[Route definition](https://github.com/eosrio/hyperion-history-api/blob/e1818923065d648a38009572d76badeab0684af1/src/api/routes/v1-history/get_transaction/index.ts) at `e1818923065d648a38009572d76badeab0684af1`. SHA-256: `ef7599ccbf0b485e9e533faac1c8ffe03d9cb76fdcebeaca854d2dd365876632`. [Download the core source OpenAPI](/reference/hyperion-source.openapi.json). Generated from the 4.5 source.
