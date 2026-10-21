---
title: v2 / stats / get_trx_count
sidebar_label: get_trx_count
---

# v2 / stats / get_trx_count

`GET /v2/stats/get_trx_count`

Availability and returned data depend on the provider's enabled services, retained range and permissions.

## GET

get transaction count statistics from block range

### Query parameters

| Name | Type | Required | Description |
|---|---|---|---|
| `start_block` | integer | No | start block number (inclusive) |
| `end_block` | integer | No | end block number (inclusive) |
| `after` | string | No | filter after specified date (ISO8601) |
| `before` | string | No | filter before specified date (ISO8601) |
| `producer` | string | No | filter by specific producer |
| `group_by` | string | No | group results by field (producer, hour, day) Values: `producer`, `hour`, `day`. |
| `validate_actions` | boolean | No | validate transaction count against action count to detect missing actions (excludes eosio::onblock system actions) |



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
    "total_trx_count": {
      "type": "integer",
      "description": "Total transaction count in the range"
    },
    "block_count": {
      "type": "integer",
      "description": "Number of blocks in the range"
    },
    "avg_trx_per_block": {
      "type": "number",
      "description": "Average transactions per block"
    },
    "start_block": {
      "type": "integer"
    },
    "end_block": {
      "type": "integer"
    },
    "grouped_stats": {
      "type": "object",
      "description": "Statistics grouped by specified field",
      "additionalProperties": true
    },
    "validation": {
      "type": "object",
      "description": "Validation results when validate_actions is true",
      "properties": {
        "total_action_count": {
          "type": "integer",
          "description": "Total actions found in action index (excluding eosio::onblock system actions)"
        },
        "transaction_count_from_blocks": {
          "type": "integer",
          "description": "Total transaction count from block index"
        },
        "is_valid": {
          "type": "boolean",
          "description": "Whether action count matches transaction count"
        },
        "missing_actions": {
          "type": "integer",
          "description": "Number of missing actions (negative if excess actions)"
        }
      }
    }
  }
}
```

## Errors and provider capabilities

Check HTTP status before parsing JSON. Validation errors, unavailable dependencies, query failures and missing source coverage are distinct outcomes. The running provider's [OpenAPI interface](/reference/overview/#provider-api-specification) includes its installed plugins and configuration.

## Source

[Route definition](https://github.com/eosrio/hyperion-history-api/blob/e1818923065d648a38009572d76badeab0684af1/src/api/routes/v2-stats/get_trx_count/index.ts) at `e1818923065d648a38009572d76badeab0684af1`. SHA-256: `84a6afb68b97152e159ec960702a087114e835c6cf8164ba53c84240e17b763c`. [Download the core source OpenAPI](/reference/hyperion-source.openapi.json). Generated from the 4.5 source.
