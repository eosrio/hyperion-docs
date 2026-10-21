---
title: v2 / stats / get_missed_blocks
sidebar_label: get_missed_blocks
---

# v2 / stats / get_missed_blocks

`GET /v2/stats/get_missed_blocks`

Availability and returned data depend on the provider's enabled services, retained range and permissions.

## GET

get missed blocks

### Query parameters

| Name | Type | Required | Description |
|---|---|---|---|
| `producer` | string | No | filter by producer |
| `after` | string | No | filter after specified date (ISO8601) |
| `before` | string | No | filter before specified date (ISO8601) |
| `min_blocks` | integer | No | min. blocks threshold |



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
    "stats": {
      "type": "object",
      "properties": {
        "by_producer": {}
      }
    },
    "events": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "@timestamp": {
            "type": "string"
          },
          "last_block": {
            "type": "number"
          },
          "schedule_version": {
            "type": "number"
          },
          "size": {
            "type": "number"
          },
          "producer": {
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

[Route definition](https://github.com/eosrio/hyperion-history-api/blob/e1818923065d648a38009572d76badeab0684af1/src/api/routes/v2-stats/get_missed_blocks/index.ts) at `e1818923065d648a38009572d76badeab0684af1`. SHA-256: `36e38b282126ff3dbccb6375d2f7d96f82e5396802334f44c8382ea342661774`. [Download the core source OpenAPI](pathname:///reference/hyperion-source.openapi.json). Generated from the 4.5 source.
