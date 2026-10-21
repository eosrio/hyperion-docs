---
title: v2 / history / get_creator
sidebar_label: get_creator
---

# v2 / history / get_creator

`GET /v2/history/get_creator`

Availability and returned data depend on the provider's enabled services, retained range and permissions.

## GET

get account creator

### Query parameters

| Name | Type | Required | Description |
|---|---|---|---|
| `account` | string | Yes | created account |



### HTTP 200

Declared JSON schema:

```json
{
  "type": "object",
  "properties": {
    "query_time_ms": {
      "type": "number"
    },
    "cached": {
      "type": "boolean"
    },
    "hot_only": {
      "type": "boolean"
    },
    "lib": {
      "type": "number"
    },
    "last_indexed_block": {
      "type": "number"
    },
    "last_indexed_block_time": {
      "type": "string"
    },
    "total": {
      "type": "object",
      "properties": {
        "value": {
          "type": "number"
        },
        "relation": {
          "type": "string"
        }
      }
    },
    "account": {
      "type": "string"
    },
    "creator": {
      "type": "string"
    },
    "timestamp": {
      "type": "string"
    },
    "block_num": {
      "type": "integer"
    },
    "trx_id": {
      "type": "string"
    },
    "indirect_creator": {
      "type": "string"
    }
  }
}
```

## Errors and provider capabilities

Check HTTP status before parsing JSON. Validation errors, unavailable dependencies, query failures and missing source coverage are distinct outcomes. The running provider's [OpenAPI interface](/reference/overview/#provider-api-specification) includes its installed plugins and configuration.

## Source

[Route definition](https://github.com/eosrio/hyperion-history-api/blob/e1818923065d648a38009572d76badeab0684af1/src/api/routes/v2-history/get_creator/index.ts) at `e1818923065d648a38009572d76badeab0684af1`. SHA-256: `fe7e2e4f748136890f0efc60269708f3e833a9ba6201e930f8b167cbbac18f42`. [Download the core source OpenAPI](/reference/hyperion-source.openapi.json). Generated from the 4.5 source.
