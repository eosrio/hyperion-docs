---
title: v1 / chain / get_currency_stats
sidebar_label: get_currency_stats
---

# v1 / chain / get_currency_stats

`GET /v1/chain/get_currency_stats` · `POST /v1/chain/get_currency_stats`

This route forwards requests to the configured chain RPC. Its data and availability follow that node, rather than Hyperion indexed-history coverage.

Availability and returned data depend on the provider's enabled services, retained range and permissions.

## GET

Retrieves currency stats

### Query parameters

| Name | Type | Required | Description |
|---|---|---|---|
| `code` | AccountName | Yes |  |
| `symbol` | string | Yes | token symbol |



### HTTP 200

Response shape is not declared here; inspect the provider response and runtime API specification.

## POST

Retrieves currency stats

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
        "symbol": {
          "description": "token symbol",
          "type": "string"
        }
      },
      "required": [
        "code",
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

[Route definition](https://github.com/eosrio/hyperion-history-api/blob/e1818923065d648a38009572d76badeab0684af1/src/api/routes/v1-chain/get_currency_stats/index.ts) at `e1818923065d648a38009572d76badeab0684af1`. SHA-256: `23efc416ba3a5ce366064f343263e9d55f043c930b340a66f58d7a7ce08bcbe9`. [Download the core source OpenAPI](pathname:///reference/hyperion-source.openapi.json). Generated from the 4.5 source.
