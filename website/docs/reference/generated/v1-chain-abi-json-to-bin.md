---
title: v1 / chain / abi_json_to_bin
sidebar_label: abi_json_to_bin
---

# v1 / chain / abi_json_to_bin

`GET /v1/chain/abi_json_to_bin` · `POST /v1/chain/abi_json_to_bin`

This route forwards requests to the configured chain RPC. Its data and availability follow that node, rather than Hyperion indexed-history coverage.

Availability and returned data depend on the provider's enabled services, retained range and permissions.

## GET

Convert JSON object to binary

### Query parameters

| Name | Type | Required | Description |
|---|---|---|---|
| `code` | AccountName | Yes |  |
| `action` | AccountName | Yes |  |
| `args` | object | Yes |  |



### HTTP 200

Response shape is not declared here; inspect the provider response and runtime API specification.

## POST

Convert JSON object to binary

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
        "args": {
          "type": "object",
          "additionalProperties": true
        }
      },
      "required": [
        "code",
        "action",
        "args"
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

[Route definition](https://github.com/eosrio/hyperion-history-api/blob/e1818923065d648a38009572d76badeab0684af1/src/api/routes/v1-chain/abi_json_to_bin/index.ts) at `e1818923065d648a38009572d76badeab0684af1`. SHA-256: `99eebb03ff8007dd434a99d822e2ee300e2ae9a449b6d52f9f792cea5f74e1e1`. [Download the core source OpenAPI](pathname:///reference/hyperion-source.openapi.json). Generated from the 4.5 source.
