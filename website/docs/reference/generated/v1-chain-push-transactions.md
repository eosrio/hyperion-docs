---
title: v1 / chain / push_transactions
sidebar_label: push_transactions
---

# v1 / chain / push_transactions

`POST /v1/chain/push_transactions`

This route forwards requests to the configured chain RPC. Its data and availability follow that node, rather than Hyperion indexed-history coverage.

Availability and returned data depend on the provider's enabled services, retained range and permissions.

## POST

This method expects a transaction in JSON format and will attempt to apply it to the blockchain.

No query parameters are declared for this method.

### Request body

```json
{
  "type": "array",
  "items": {
    "type": "object",
    "additionalProperties": false,
    "minProperties": 8,
    "required": [
      "expiration",
      "ref_block_num",
      "ref_block_prefix",
      "max_net_usage_words",
      "max_cpu_usage_ms",
      "delay_sec",
      "context_free_actions",
      "actions"
    ],
    "properties": {
      "expiration": {
        "$ref": "#/components/schemas/Expiration"
      },
      "ref_block_num": {
        "type": "integer"
      },
      "ref_block_prefix": {
        "type": "integer"
      },
      "max_net_usage_words": {
        "$ref": "#/components/schemas/WholeNumber"
      },
      "max_cpu_usage_ms": {
        "$ref": "#/components/schemas/WholeNumber"
      },
      "delay_sec": {
        "type": "integer"
      },
      "context_free_actions": {
        "type": "array",
        "items": {
          "$ref": "#/components/schemas/ActionItems"
        }
      },
      "actions": {
        "type": "array",
        "items": {
          "$ref": "#/components/schemas/ActionItems"
        }
      },
      "transaction_extensions": {
        "type": "array",
        "items": {
          "$ref": "#/components/schemas/BlockExtensions"
        }
      }
    }
  }
}
```

### HTTP 200

Response shape is not declared here; inspect the provider response and runtime API specification.

## Errors and provider capabilities

Check HTTP status before parsing JSON. Validation errors, unavailable dependencies, query failures and missing source coverage are distinct outcomes. The running provider's [OpenAPI interface](/reference/overview/#provider-api-specification) includes its installed plugins and configuration.

## Source

[Route definition](https://github.com/eosrio/hyperion-history-api/blob/e1818923065d648a38009572d76badeab0684af1/src/api/routes/v1-chain/push_transactions/index.ts) at `e1818923065d648a38009572d76badeab0684af1`. SHA-256: `42e2de95969ddbb812ccb5edd01c8aacc98b25dfd1c0e4df56dfe2ac8b8c0eda`. [Download the core source OpenAPI](pathname:///reference/hyperion-source.openapi.json). Generated from the 4.5 source.
