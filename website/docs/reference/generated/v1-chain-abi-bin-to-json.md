---
title: v1 / chain / abi_bin_to_json
sidebar_label: abi_bin_to_json
---

# v1 / chain / abi_bin_to_json

`GET /v1/chain/abi_bin_to_json` · `POST /v1/chain/abi_bin_to_json`

This route forwards requests to the configured chain RPC. Its data and availability follow that node, rather than Hyperion indexed-history coverage.

Availability and returned data depend on the provider's enabled services, retained range and permissions.

## GET

Returns an object containing rows from the specified table.

### Query parameters

| Name | Type | Required | Description |
|---|---|---|---|
| `code` | AccountName | Yes |  |
| `action` | AccountName | Yes |  |
| `binargs` | string | Yes |  |



### HTTP 200

Response shape is not declared here; inspect the provider response and runtime API specification.

## POST

Returns an object containing rows from the specified table.

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
        "action": {
          "$ref": "#/components/schemas/AccountName"
        },
        "binargs": {
          "type": "string"
        }
      },
      "required": [
        "code",
        "action",
        "binargs"
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

[Route definition](https://github.com/eosrio/hyperion-history-api/blob/e1818923065d648a38009572d76badeab0684af1/src/api/routes/v1-chain/abi_bin_to_json/index.ts) at `e1818923065d648a38009572d76badeab0684af1`. SHA-256: `a49fce2b3ce830e9464849c59300726effbd39b0a33e720c4aa10ca741b9f882`. [Download the core source OpenAPI](pathname:///reference/hyperion-source.openapi.json). Generated from the 4.5 source.
