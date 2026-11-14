---
title: v2 / stats / get_api_usage
sidebar_label: get_api_usage
---

# v2 / stats / get_api_usage

`GET /v2/stats/get_api_usage`

Availability and returned data depend on the provider's enabled services, retained range and permissions.

## GET

get hyperion api usage statistics

No query parameters are declared for this method.



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
        "responses": {
          "additionalProperties": true
        }
      }
    },
    "buckets": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "timestamp": {
            "type": "string"
          },
          "responses": {
            "additionalProperties": true
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

[Route definition](https://github.com/eosrio/hyperion-history-api/blob/e1818923065d648a38009572d76badeab0684af1/src/api/routes/v2-stats/get_api_usage/index.ts) at `e1818923065d648a38009572d76badeab0684af1`. SHA-256: `b5513d03a12590462a2a4cd3263a0247424a29dfeebe9e1027c3b67c59643882`. [Download the core source OpenAPI](pathname:///reference/hyperion-source.openapi.json). Generated from the 4.5 source.
