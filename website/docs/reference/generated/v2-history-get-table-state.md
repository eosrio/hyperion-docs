---
title: v2 / history / get_table_state
sidebar_label: get_table_state
---

# v2 / history / get_table_state

`GET /v2/history/get_table_state`

Availability and returned data depend on the provider's enabled services, retained range and permissions.

## GET

get table state at a specific block height

### Query parameters

| Name | Type | Required | Description |
|---|---|---|---|
| `code` | string | Yes | search by contract |
| `table` | string | Yes | search by key |
| `block_num` | integer | No | target block |
| `after_key` | string | No | last key for pagination |



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
    "code": {
      "type": "string"
    },
    "table": {
      "type": "string"
    },
    "block_num": {
      "type": "number"
    },
    "after_key": {
      "type": "string"
    },
    "next_key": {
      "type": "string"
    },
    "results": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "scope": {
            "type": "string"
          },
          "primary_key": {
            "type": "string"
          },
          "payer": {
            "type": "string"
          },
          "timestamp": {
            "type": "string"
          },
          "block_num": {
            "type": "number"
          },
          "block_id": {
            "type": "string"
          },
          "present": {
            "type": "number"
          },
          "data": {
            "type": "object",
            "additionalProperties": true
          }
        },
        "additionalProperties": true
      }
    }
  }
}
```

## Errors and provider capabilities

Check HTTP status before parsing JSON. Validation errors, unavailable dependencies, query failures and missing source coverage are distinct outcomes. The running provider's [OpenAPI interface](/reference/overview/#provider-api-specification) includes its installed plugins and configuration.

## Source

[Route definition](https://github.com/eosrio/hyperion-history-api/blob/e1818923065d648a38009572d76badeab0684af1/src/api/routes/v2-history/get_table_state/index.ts) at `e1818923065d648a38009572d76badeab0684af1`. SHA-256: `38586b6879a29e6f7f755892552a77980ef84149feb6cd83bd5e839ae57bef54`. [Download the core source OpenAPI](/reference/hyperion-source.openapi.json). Generated from the 4.5 source.
