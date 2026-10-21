---
title: v1 / chain / get_account
sidebar_label: get_account
---

# v1 / chain / get_account

`GET /v1/chain/get_account` · `POST /v1/chain/get_account`

This route forwards requests to the configured chain RPC. Its data and availability follow that node, rather than Hyperion indexed-history coverage.

Availability and returned data depend on the provider's enabled services, retained range and permissions.

## GET

Returns an object containing various details about a specific account on the blockchain.

### Query parameters

| Name | Type | Required | Description |
|---|---|---|---|
| `account_name` | AccountName | Yes |  |



### HTTP 200

Response shape is not declared here; inspect the provider response and runtime API specification.

## POST

Returns an object containing various details about a specific account on the blockchain.

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
        }
      },
      "required": [
        "account_name"
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

[Route definition](https://github.com/eosrio/hyperion-history-api/blob/e1818923065d648a38009572d76badeab0684af1/src/api/routes/v1-chain/get_account/index.ts) at `e1818923065d648a38009572d76badeab0684af1`. SHA-256: `80ca8c29266c1fb880586c4ae09775727d307be503df333a5e9a41895751c464`. [Download the core source OpenAPI](/reference/hyperion-source.openapi.json). Generated from the 4.5 source.
