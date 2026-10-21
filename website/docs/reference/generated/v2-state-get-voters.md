---
title: v2 / state / get_voters
sidebar_label: get_voters
---

# v2 / state / get_voters

`GET /v2/state/get_voters`

Availability and returned data depend on the provider's enabled services, retained range and permissions.

## GET

get voters

### Query parameters

| Name | Type | Required | Description |
|---|---|---|---|
| `limit` | integer | No | limit of [n] results per page |
| `skip` | integer | No | skip [n] results |
| `producer` | string | No | filter by voted producer (comma separated) |



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
    "voter_count": {
      "type": "integer"
    },
    "error": {
      "type": "string",
      "description": "Error message when a condition fails (MongoDB disabled or feature disabled)"
    },
    "voters": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "account": {
            "type": "string"
          },
          "is_proxy": {
            "type": "boolean"
          },
          "weight": {
            "type": "number"
          },
          "staked": {
            "type": "number"
          },
          "last_vote_block": {
            "type": "number"
          },
          "producers": {
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

[Route definition](https://github.com/eosrio/hyperion-history-api/blob/e1818923065d648a38009572d76badeab0684af1/src/api/routes/v2-state/get_voters/index.ts) at `e1818923065d648a38009572d76badeab0684af1`. SHA-256: `3dcd791bebf8e13bcd40d8f1c4bedbbfb37ea8416c6b48fb7fb38f66566d3203`. [Download the core source OpenAPI](/reference/hyperion-source.openapi.json). Generated from the 4.5 source.
