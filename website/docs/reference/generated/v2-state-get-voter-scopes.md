---
title: v2 / state / get_voter_scopes
sidebar_label: get_voter_scopes
---

# v2 / state / get_voter_scopes

`GET /v2/state/get_voter_scopes`

Availability and returned data depend on the provider's enabled services, retained range and permissions.

## GET

find voter accounts from a wildcard string

### Query parameters

| Name | Type | Required | Description |
|---|---|---|---|
| `limit` | integer | No | limit of [n] results per page |
| `skip` | integer | No | skip [n] results |
| `term` | string | Yes | search string |



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
    "scopes": {
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

[Route definition](https://github.com/eosrio/hyperion-history-api/blob/e1818923065d648a38009572d76badeab0684af1/src/api/routes/v2-state/get_voter_scopes/index.ts) at `e1818923065d648a38009572d76badeab0684af1`. SHA-256: `e486619329db243db69bd23af5f2755e53d3444dea93367b10ed080a439fdaf5`. [Download the core source OpenAPI](/reference/hyperion-source.openapi.json). Generated from the 4.5 source.
