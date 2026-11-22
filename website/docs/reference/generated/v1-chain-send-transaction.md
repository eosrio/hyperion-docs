---
title: v1 / chain / send_transaction
sidebar_label: send_transaction
---

# v1 / chain / send_transaction

`POST /v1/chain/send_transaction`

This route forwards requests to the configured chain RPC. Its data and availability follow that node, rather than Hyperion indexed-history coverage.

Availability and returned data depend on the provider's enabled services, retained range and permissions.

## POST

This method expects a transaction in JSON format and will attempt to apply it to the blockchain.

No query parameters are declared for this method.

### Request body

```json
{
  "type": "object",
  "properties": {
    "signatures": {
      "type": "array",
      "description": "array of signatures required to authorize transaction",
      "items": {
        "$ref": "#/components/schemas/Signature"
      }
    },
    "compression": {
      "type": "boolean",
      "description": "Compression used, usually false"
    },
    "packed_context_free_data": {
      "type": "string",
      "description": "json to hex"
    },
    "packed_trx": {
      "type": "string",
      "description": "Transaction object json to hex"
    }
  }
}
```

### HTTP 200

Response shape is not declared here; inspect the provider response and runtime API specification.

## Errors and provider capabilities

Check HTTP status before parsing JSON. Validation errors, unavailable dependencies, query failures and missing source coverage are distinct outcomes. The running provider's [OpenAPI interface](/reference/overview/#provider-api-specification) includes its installed plugins and configuration.

## Source

[Route definition](https://github.com/eosrio/hyperion-history-api/blob/e1818923065d648a38009572d76badeab0684af1/src/api/routes/v1-chain/send_transaction/index.ts) at `e1818923065d648a38009572d76badeab0684af1`. SHA-256: `0de2a7d78b74ac4dad4b2311afddf8196c9181dfbdf5180aad11ca448fdf9b8d`. [Download the core source OpenAPI](pathname:///reference/hyperion-source.openapi.json). Generated from the 4.5 source.
