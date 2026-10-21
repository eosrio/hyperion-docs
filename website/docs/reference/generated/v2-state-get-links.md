---
title: v2 / state / get_links
sidebar_label: get_links
---

# v2 / state / get_links

`GET /v2/state/get_links`

Availability and returned data depend on the provider's enabled services, retained range and permissions.

## GET

get permission links

### Query parameters

| Name | Type | Required | Description |
|---|---|---|---|
| `account` | string | No | account name |
| `code` | string | No | contract name |
| `action` | string | No | method name |
| `permission` | string | No | permission name |



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
    "links": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "block_num": {
            "type": "number"
          },
          "timestamp": {
            "type": "string"
          },
          "account": {
            "type": "string"
          },
          "permission": {
            "type": "string"
          },
          "code": {
            "type": "string"
          },
          "action": {
            "type": "string"
          },
          "irreversible": {
            "type": "boolean"
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

[Route definition](https://github.com/eosrio/hyperion-history-api/blob/e1818923065d648a38009572d76badeab0684af1/src/api/routes/v2-state/get_links/index.ts) at `e1818923065d648a38009572d76badeab0684af1`. SHA-256: `3367992f28c4bb771703fd873fc725017de84b3f31e37b269704d19e01b2798b`. [Download the core source OpenAPI](/reference/hyperion-source.openapi.json). Generated from the 4.5 source.
