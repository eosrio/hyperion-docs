---
title: v2 / history / get_deltas
sidebar_label: get_deltas
---

# v2 / history / get_deltas

`GET /v2/history/get_deltas`

Availability and returned data depend on the provider's enabled services, retained range and permissions.

## GET

get state deltas

### Query parameters

| Name | Type | Required | Description |
|---|---|---|---|
| `limit` | integer | No | limit of [n] results per page |
| `skip` | integer | No | skip [n] results |
| `code` | string | No | contract account |
| `scope` | string | No | table scope |
| `table` | string | No | table name |
| `payer` | string | No | payer account |
| `after` | string | No | filter after specified date (ISO8601) |
| `before` | string | No | filter before specified date (ISO8601) |
| `present` | number | No | delta present flag |
| `hydrate` | boolean | No | hydrate cold-tier delta value/data from the configured delta archive (default: true). No-op unless a delta archive is configured (TODO). |



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
    "deltas": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "timestamp": {
            "type": "string"
          },
          "present": {
            "type": "number"
          },
          "code": {
            "type": "string"
          },
          "scope": {
            "type": "string"
          },
          "table": {
            "type": "string"
          },
          "primary_key": {
            "type": "string"
          },
          "payer": {
            "type": "string"
          },
          "block_num": {
            "type": "number"
          },
          "block_id": {
            "type": "string"
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

[Route definition](https://github.com/eosrio/hyperion-history-api/blob/e1818923065d648a38009572d76badeab0684af1/src/api/routes/v2-history/get_deltas/index.ts) at `e1818923065d648a38009572d76badeab0684af1`. SHA-256: `38ff3494bba76b8b4dac9dcf7984ec9b75b54724f990c9ff4997f8210fceb6fb`. [Download the core source OpenAPI](pathname:///reference/hyperion-source.openapi.json). Generated from the 4.5 source.
