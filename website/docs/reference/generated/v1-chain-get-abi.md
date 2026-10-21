---
title: v1 / chain / get_abi
sidebar_label: get_abi
---

# v1 / chain / get_abi

`GET /v1/chain/get_abi` · `POST /v1/chain/get_abi`

This route forwards requests to the configured chain RPC. Its data and availability follow that node, rather than Hyperion indexed-history coverage.

Availability and returned data depend on the provider's enabled services, retained range and permissions.

## GET

Retrieves the ABI for a contract based on its account name

### Query parameters

| Name | Type | Required | Description |
|---|---|---|---|
| `account_name` | AccountName | Yes |  |



### HTTP 200

Response shape is not declared here; inspect the provider response and runtime API specification.

## POST

Retrieves the ABI for a contract based on its account name

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

[Route definition](https://github.com/eosrio/hyperion-history-api/blob/e1818923065d648a38009572d76badeab0684af1/src/api/routes/v1-chain/get_abi/index.ts) at `e1818923065d648a38009572d76badeab0684af1`. SHA-256: `41cd2b2367c2e0f22e816d87808c21eb1601c2775333bea59af8b9b9ef5fdf7c`. [Download the core source OpenAPI](/reference/hyperion-source.openapi.json). Generated from the 4.5 source.
