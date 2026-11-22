---
title: v1 / chain / get_raw_abi
sidebar_label: get_raw_abi
---

# v1 / chain / get_raw_abi

`GET /v1/chain/get_raw_abi` · `POST /v1/chain/get_raw_abi`

This route forwards requests to the configured chain RPC. Its data and availability follow that node, rather than Hyperion indexed-history coverage.

Availability and returned data depend on the provider's enabled services, retained range and permissions.

## GET

Retrieves raw ABI for a contract based on account name

### Query parameters

| Name | Type | Required | Description |
|---|---|---|---|
| `account_name` | AccountName | Yes |  |



### HTTP 200

Response shape is not declared here; inspect the provider response and runtime API specification.

## POST

Retrieves raw ABI for a contract based on account name

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

[Route definition](https://github.com/eosrio/hyperion-history-api/blob/e1818923065d648a38009572d76badeab0684af1/src/api/routes/v1-chain/get_raw_abi/index.ts) at `e1818923065d648a38009572d76badeab0684af1`. SHA-256: `8a8f6d6403403ec64aa50828a400ed9b7cda79a346fde22be4f8ed771b599a36`. [Download the core source OpenAPI](pathname:///reference/hyperion-source.openapi.json). Generated from the 4.5 source.
