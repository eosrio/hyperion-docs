---
title: v2 / stats / get_action_usage
sidebar_label: get_action_usage
---

# v2 / stats / get_action_usage

`GET /v2/stats/get_action_usage`

Availability and returned data depend on the provider's enabled services, retained range and permissions.

## GET

get action and transaction stats for a given period

### Query parameters

| Name | Type | Required | Description |
|---|---|---|---|
| `period` | string | Yes | analysis period |
| `end_date` | string | No | final date |
| `unique_actors` | boolean | No | compute unique actors |



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
    "action_count": {
      "type": "string",
      "pattern": "^(0|[1-9][0-9]*)$",
      "description": "Exact decimal action count"
    },
    "tx_count": {
      "type": "number"
    },
    "unique_actors": {
      "type": "number"
    },
    "period": {
      "type": "string"
    },
    "from": {
      "type": "string"
    },
    "to": {
      "type": "string"
    },
    "cache_exp": {
      "type": "number"
    }
  }
}
```

## Errors and provider capabilities

Check HTTP status before parsing JSON. Validation errors, unavailable dependencies, query failures and missing source coverage are distinct outcomes. The running provider's [OpenAPI interface](/reference/overview/#provider-api-specification) includes its installed plugins and configuration.

## Source

[Route definition](https://github.com/eosrio/hyperion-history-api/blob/e1818923065d648a38009572d76badeab0684af1/src/api/routes/v2-stats/get_action_usage/index.ts) at `e1818923065d648a38009572d76badeab0684af1`. SHA-256: `3e8c0f64aa2cbcb3058e8ef27931a9547ac271b6e3dc369de5254939df58387b`. [Download the core source OpenAPI](/reference/hyperion-source.openapi.json). Generated from the 4.5 source.
