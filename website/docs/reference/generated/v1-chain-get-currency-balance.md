---
title: v1 / chain / get_currency_balance
sidebar_label: get_currency_balance
---

# v1 / chain / get_currency_balance

`GET /v1/chain/get_currency_balance` · `POST /v1/chain/get_currency_balance`

This route forwards requests to the configured chain RPC. Its data and availability follow that node, rather than Hyperion indexed-history coverage.

Availability and returned data depend on the provider's enabled services, retained range and permissions.

## GET

Retrieves the current balance

### Query parameters

| Name | Type | Required | Description |
|---|---|---|---|
| `code` | AccountName | Yes |  |
| `account` | AccountName | Yes |  |
| `symbol` | Symbol | Yes |  |



### HTTP 200

Response shape is not declared here; inspect the provider response and runtime API specification.

## POST

Retrieves the current balance

No query parameters are declared for this method.

### Request body

```json
{
  "anyOf": [
    {
      "type": "object",
      "properties": {
        "code": {
          "$ref": "#/components/schemas/AccountName"
        },
        "account": {
          "$ref": "#/components/schemas/AccountName"
        },
        "symbol": {
          "$ref": "#/components/schemas/Symbol"
        }
      },
      "required": [
        "code",
        "account",
        "symbol"
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

[Route definition](https://github.com/eosrio/hyperion-history-api/blob/e1818923065d648a38009572d76badeab0684af1/src/api/routes/v1-chain/get_currency_balance/index.ts) at `e1818923065d648a38009572d76badeab0684af1`. SHA-256: `c6c029a8def206839de017356c7849d5c4dd38d3c6be3daf4129d50c58e1bfbb`. [Download the core source OpenAPI](pathname:///reference/hyperion-source.openapi.json). Generated from the 4.5 source.
