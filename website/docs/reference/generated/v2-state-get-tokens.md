---
title: v2 / state / get_tokens
sidebar_label: get_tokens
---

# v2 / state / get_tokens

`GET /v2/state/get_tokens`

Availability and returned data depend on the provider's enabled services, retained range and permissions.

## GET

get tokens from an account

### Query parameters

| Name | Type | Required | Description |
|---|---|---|---|
| `limit` | integer | No | limit of [n] results per page |
| `skip` | integer | No | skip [n] results |
| `account` | string | Yes | account name |



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
    "tokens": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "symbol": {
            "type": "string"
          },
          "precision": {
            "type": "number"
          },
          "amount": {
            "type": "number"
          },
          "contract": {
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

[Route definition](https://github.com/eosrio/hyperion-history-api/blob/e1818923065d648a38009572d76badeab0684af1/src/api/routes/v2-state/get_tokens/index.ts) at `e1818923065d648a38009572d76badeab0684af1`. SHA-256: `b076ffb1d0d2677e531733f8644f996dad5916809e3cf5f6a49053813c4fcdb6`. [Download the core source OpenAPI](/reference/hyperion-source.openapi.json). Generated from the 4.5 source.
