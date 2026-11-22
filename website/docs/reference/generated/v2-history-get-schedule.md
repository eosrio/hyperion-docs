---
title: v2 / history / get_schedule
sidebar_label: get_schedule
---

# v2 / history / get_schedule

`GET /v2/history/get_schedule`

Availability and returned data depend on the provider's enabled services, retained range and permissions.

## GET

get producer schedule by version

### Query parameters

| Name | Type | Required | Description |
|---|---|---|---|
| `producer` | string | No | search by producer |
| `key` | string | No | search by signing key |
| `after` | string | No | filter after specified date (ISO8601) |
| `before` | string | No | filter before specified date (ISO8601) |
| `mode` | string | No | search mode (activated or proposed) |
| `version` | integer | No | schedule version |



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
    "timestamp": {
      "type": "string"
    },
    "block_num": {
      "type": "number"
    },
    "proposed_block_num": {
      "type": "number"
    },
    "version": {
      "type": "number"
    },
    "producers": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "producer_name": {
            "type": "string"
          },
          "name": {
            "type": "string"
          },
          "block_signing_key": {
            "type": "string"
          },
          "legacy_key": {
            "type": "string"
          },
          "keys": {
            "type": "array",
            "items": {
              "type": "string"
            }
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

[Route definition](https://github.com/eosrio/hyperion-history-api/blob/e1818923065d648a38009572d76badeab0684af1/src/api/routes/v2-history/get_schedule/index.ts) at `e1818923065d648a38009572d76badeab0684af1`. SHA-256: `a9d2fe41df041a9e13bbb76896ab32711c3ef853f79b70fc520de21bb07cf8b8`. [Download the core source OpenAPI](pathname:///reference/hyperion-source.openapi.json). Generated from the 4.5 source.
