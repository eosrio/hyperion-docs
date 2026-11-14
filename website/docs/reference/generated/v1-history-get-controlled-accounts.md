---
title: v1 / history / get_controlled_accounts
sidebar_label: get_controlled_accounts
---

# v1 / history / get_controlled_accounts

`POST /v1/history/get_controlled_accounts`

Availability and returned data depend on the provider's enabled services, retained range and permissions.

## POST

get controlled accounts by controlling accounts

No query parameters are declared for this method.

### Request body

```json
{
  "type": "object",
  "properties": {
    "controlling_account": {
      "description": "controlling account",
      "type": "string"
    }
  },
  "required": [
    "controlling_account"
  ]
}
```

### HTTP 200

Declared JSON schema:

```json
{
  "type": "object",
  "properties": {
    "controlled_accounts": {
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

[Route definition](https://github.com/eosrio/hyperion-history-api/blob/e1818923065d648a38009572d76badeab0684af1/src/api/routes/v1-history/get_controlled_accounts/index.ts) at `e1818923065d648a38009572d76badeab0684af1`. SHA-256: `2b1b71f6139ecadda0554049e4d1a4ddf4ceabe21aeb3d8058032d7ff042965c`. [Download the core source OpenAPI](pathname:///reference/hyperion-source.openapi.json). Generated from the 4.5 source.
