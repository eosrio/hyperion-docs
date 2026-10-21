---
title: v2 / history / get_blocks
sidebar_label: get_blocks
---

# v2 / history / get_blocks

`GET /v2/history/get_blocks`

Availability and returned data depend on the provider's enabled services, retained range and permissions.

## GET

get blocks with various filters

### Query parameters

| Name | Type | Required | Description |
|---|---|---|---|
| `block_num` | integer | No | specific block number (returns single block) |
| `block_id` | string | No | specific block id (returns single block) |
| `producer` | string | No | filter by block producer |
| `trx_count` | integer | No | filter by transaction count |
| `min_trx_count` | integer | No | minimum transaction count |
| `max_trx_count` | integer | No | maximum transaction count |
| `after` | string | No | filter after specified date as ISO string |
| `before` | string | No | filter before specified date as ISO string |
| `limit` | integer | No | number of blocks to return (default: 10) |
| `skip` | integer | No | number of blocks to skip (default: 0) |
| `sort` | string | No | sort direction (asc, desc, 1, -1) |



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
    "blocks": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "@timestamp": {
            "type": "string"
          },
          "block_num": {
            "type": "integer"
          },
          "block_id": {
            "type": "string"
          },
          "prev_id": {
            "type": "string"
          },
          "producer": {
            "type": "string"
          },
          "new_producers": {
            "type": "object",
            "additionalProperties": true
          },
          "schedule_version": {
            "type": "integer"
          },
          "cpu_usage": {
            "type": "integer"
          },
          "net_usage": {
            "type": "integer"
          },
          "trx_count": {
            "type": "integer"
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

[Route definition](https://github.com/eosrio/hyperion-history-api/blob/e1818923065d648a38009572d76badeab0684af1/src/api/routes/v2-history/get_blocks/index.ts) at `e1818923065d648a38009572d76badeab0684af1`. SHA-256: `7efb21fec65cc3a407d06157b5c367c80a7d3e0a0affc367587d7f1d833d6f6f`. [Download the core source OpenAPI](/reference/hyperion-source.openapi.json). Generated from the 4.5 source.
