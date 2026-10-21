---
title: v2 / history / get_transaction
sidebar_label: get_transaction
---

# v2 / history / get_transaction

`GET /v2/history/get_transaction`

Supply the required transaction `id`. `block_hint` narrows the search. A source-coverage failure is different from an empty result; handle non-success HTTP responses before parsing a transaction.

## GET

get all actions belonging to the same transaction

### Query parameters

| Name | Type | Required | Description |
|---|---|---|---|
| `id` | string | Yes | transaction id |
| `block_hint` | integer | No | block hint to speed up tx recovery |
| `hydrate` | boolean | No | hydrate cold-tier act.data from the configured archive (default: true). Set false to skip archive lookups. |



### HTTP 200

Response shape is not declared here; inspect the provider response and runtime API specification.

## Errors and provider capabilities

Check HTTP status before parsing JSON. Validation errors, unavailable dependencies, query failures and missing source coverage are distinct outcomes. The running provider's [OpenAPI interface](/reference/overview/#provider-api-specification) includes its installed plugins and configuration.

## Source

[Route definition](https://github.com/eosrio/hyperion-history-api/blob/e1818923065d648a38009572d76badeab0684af1/src/api/routes/v2-history/get_transaction/index.ts) at `e1818923065d648a38009572d76badeab0684af1`. SHA-256: `b4f9871835b45b9df6ce2115082f068c5785ee45fa6e8b10c8072ead8396b708`. [Download the core source OpenAPI](/reference/hyperion-source.openapi.json). Generated from the 4.5 source.
