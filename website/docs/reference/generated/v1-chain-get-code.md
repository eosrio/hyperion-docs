---
title: v1 / chain / get_code
sidebar_label: get_code
---

# v1 / chain / get_code

`GET /v1/chain/get_code` · `POST /v1/chain/get_code`

This route forwards requests to the configured chain RPC. Its data and availability follow that node, rather than Hyperion indexed-history coverage.

Availability and returned data depend on the provider's enabled services, retained range and permissions.

## GET

Retrieves contract code

### Query parameters

| Name | Type | Required | Description |
|---|---|---|---|
| `account_name` | AccountName | Yes |  |
| `code_as_wasm` | integer | Yes | This must be 1 (true) Default: `1`. |



### HTTP 200

Response shape is not declared here; inspect the provider response and runtime API specification.

## POST

Retrieves contract code

No query parameters are declared for this method.

### Request body

```json
{
  "anyOf": [
    {
      "type": "object",
      "properties": {
        "account_name": {
          "$ref": "#/components/schemas/AccountName"
        },
        "code_as_wasm": {
          "type": "integer",
          "default": 1,
          "description": "This must be 1 (true)"
        }
      },
      "required": [
        "account_name",
        "code_as_wasm"
      ]
    },
    {
      "type": "string"
    }
  ]
}
```

### HTTP 200

Response shape is not declared here; inspect the provider response and runtime API specification.

## Errors and provider capabilities

Check HTTP status before parsing JSON. Validation errors, unavailable dependencies, query failures and missing source coverage are distinct outcomes. The running provider's [OpenAPI interface](/reference/overview/#provider-api-specification) includes its installed plugins and configuration.

## Source

[Route definition](https://github.com/eosrio/hyperion-history-api/blob/e1818923065d648a38009572d76badeab0684af1/src/api/routes/v1-chain/get_code/index.ts) at `e1818923065d648a38009572d76badeab0684af1`. SHA-256: `94eeb7e3a938f5a5ec3f5a26d0bb22ef4da07b557987109eae768f31d0936ea6`. [Download the core source OpenAPI](pathname:///reference/hyperion-source.openapi.json). Generated from the 4.5 source.
