---
title: v1 / history / get_key_accounts
sidebar_label: get_key_accounts
---

# v1 / history / get_key_accounts

`POST /v1/history/get_key_accounts`

Availability and returned data depend on the provider's enabled services, retained range and permissions.

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

[Route definition](https://github.com/eosrio/hyperion-history-api/blob/e1818923065d648a38009572d76badeab0684af1/src/api/routes/v1-history/get_key_accounts/index.ts) at `e1818923065d648a38009572d76badeab0684af1`. SHA-256: `d771dfff53cfe840a0ce4170a9dccbf3a0b3677413dde10f577a6444350bd1c6`. [Download the core source OpenAPI](pathname:///reference/hyperion-source.openapi.json). Generated from the 4.5 source.
