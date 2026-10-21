---
title: v2 / history / get_block
sidebar_label: get_block
---

# v2 / history / get_block

`GET /v2/history/get_block`

Availability and returned data depend on the provider's enabled services, retained range and permissions.

## GET

get block by number

### Query parameters

| Name | Type | Required | Description |
|---|---|---|---|
| `block_num` | integer | Yes | block number |



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
```

## Errors and provider capabilities

Check HTTP status before parsing JSON. Validation errors, unavailable dependencies, query failures and missing source coverage are distinct outcomes. The running provider's [OpenAPI interface](/reference/overview/#provider-api-specification) includes its installed plugins and configuration.

## Source

[Route definition](https://github.com/eosrio/hyperion-history-api/blob/e1818923065d648a38009572d76badeab0684af1/src/api/routes/v2-history/get_block/index.ts) at `e1818923065d648a38009572d76badeab0684af1`. SHA-256: `aebd33c168c483abd187581f71ce22653a2123e5a813cfd326858ead68162514`. [Download the core source OpenAPI](/reference/hyperion-source.openapi.json). Generated from the 4.5 source.
