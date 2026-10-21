---
title: v2 / history / get_created_accounts
sidebar_label: get_created_accounts
---

# v2 / history / get_created_accounts

`GET /v2/history/get_created_accounts`

Availability and returned data depend on the provider's enabled services, retained range and permissions.

## GET

get all accounts created by one creator

### Query parameters

| Name | Type | Required | Description |
|---|---|---|---|
| `limit` | integer | No | limit of [n] results per page |
| `skip` | integer | No | skip [n] results |
| `account` | string | Yes | creator account |



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
    "query_time": {
      "type": "number"
    },
    "accounts": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "name": {
            "type": "string"
          },
          "timestamp": {
            "type": "string"
          },
          "trx_id": {
            "type": "string"
          }
        }
      }
    }
  }
}
```

## Errors and provider capabilities

Check HTTP status before parsing JSON. Validation errors, unavailable dependencies, query failures and missing source coverage are distinct outcomes. The running provider's [OpenAPI interface](/reference/overview/#provider-api-specification) includes its installed plugins and configuration.

## Source

[Route definition](https://github.com/eosrio/hyperion-history-api/blob/e1818923065d648a38009572d76badeab0684af1/src/api/routes/v2-history/get_created_accounts/index.ts) at `e1818923065d648a38009572d76badeab0684af1`. SHA-256: `2fedc0948db4f0e834eebd3f2007ace2f41b8c0d08c1680e29000437033b4aeb`. [Download the core source OpenAPI](/reference/hyperion-source.openapi.json). Generated from the 4.5 source.
