---
title: v2 / history / check_transaction
sidebar_label: check_transaction
---

# v2 / history / check_transaction

`GET /v2/history/check_transaction`

Availability and returned data depend on the provider's enabled services, retained range and permissions.

## GET

check if a transaction was included in a block

### Query parameters

| Name | Type | Required | Description |
|---|---|---|---|
| `id` | string | Yes | transaction id |



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
    "id": {
      "type": "string"
    },
    "status": {
      "type": "string"
    },
    "block_num": {
      "type": "number"
    },
    "root_action": {
      "type": "object",
      "properties": {
        "account": {
          "type": "string"
        },
        "name": {
          "type": "string"
        },
        "authorization": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "actor": {
                "type": "string"
              },
              "permission": {
                "type": "string"
              }
            }
          }
        },
        "data": {
          "type": "string"
        }
      }
    },
    "signatures": {
      "type": "array",
      "items": {
        "type": "string"
      }
    }
  }
}
```

## Errors and provider capabilities

Check HTTP status before parsing JSON. Validation errors, unavailable dependencies, query failures and missing source coverage are distinct outcomes. The running provider's [OpenAPI interface](/reference/overview/#provider-api-specification) includes its installed plugins and configuration.

## Source

[Route definition](https://github.com/eosrio/hyperion-history-api/blob/e1818923065d648a38009572d76badeab0684af1/src/api/routes/v2-history/check_transaction/index.ts) at `e1818923065d648a38009572d76badeab0684af1`. SHA-256: `e54d13040c6cce70d96647c122dc9d64c63c9233f83f4e2284032df72eda2530`. [Download the core source OpenAPI](pathname:///reference/hyperion-source.openapi.json). Generated from the 4.5 source.
