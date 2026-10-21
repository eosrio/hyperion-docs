---
title: v2 / state / get_key_accounts
sidebar_label: get_key_accounts
---

# v2 / state / get_key_accounts

`GET /v2/state/get_key_accounts` · `POST /v2/state/get_key_accounts`

Availability and returned data depend on the provider's enabled services, retained range and permissions.

## GET

get accounts by public key

### Query parameters

| Name | Type | Required | Description |
|---|---|---|---|
| `limit` | integer | No | limit of [n] results per page |
| `skip` | integer | No | skip [n] results |
| `public_key` | string | Yes | public key |
| `details` | boolean | No | include permission details |



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
    "public_key": {
      "type": "string"
    },
    "legacy_public_key": {
      "type": "string"
    },
    "account_names": {
      "type": "array",
      "items": {
        "type": "string"
      }
    },
    "permissions": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "owner": {
            "type": "string"
          },
          "block_num": {
            "type": "integer"
          },
          "parent": {
            "type": "string"
          },
          "last_updated": {
            "type": "string"
          },
          "auth": {},
          "name": {
            "type": "string"
          },
          "present": {
            "type": "number"
          },
          "weight": {
            "type": "number"
          },
          "threshold": {
            "type": "number"
          }
        }
      }
    }
  }
}
```

## POST

get accounts by public key

No query parameters are declared for this method.

### Request body

```json
{
  "type": "object",
  "properties": {
    "public_key": {
      "description": "public key",
      "type": "string"
    }
  },
  "required": [
    "public_key"
  ]
}
```

### HTTP 200

Declared JSON schema:

```json
{
  "type": "object",
  "properties": {
    "account_names": {
      "type": "array",
      "items": {
        "type": "string"
      }
    }
  }
}
```

## Errors and provider capabilities

Check HTTP status before parsing JSON. Validation errors, unavailable dependencies, query failures and missing source coverage are distinct outcomes. The running provider's [OpenAPI interface](/reference/overview/#provider-api-specification) includes its installed plugins and configuration.

## Source

[Route definition](https://github.com/eosrio/hyperion-history-api/blob/e1818923065d648a38009572d76badeab0684af1/src/api/routes/v2-state/get_key_accounts/index.ts) at `e1818923065d648a38009572d76badeab0684af1`. SHA-256: `cbce0f9b571c8e819339dda215ea1003e0b9284462f0b4f1b27263600b8fac74`. [Download the core source OpenAPI](/reference/hyperion-source.openapi.json). Generated from the 4.5 source.
