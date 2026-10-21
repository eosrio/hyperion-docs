---
title: v2 / state / get_top_holders
sidebar_label: get_top_holders
---

# v2 / state / get_top_holders

`GET /v2/state/get_top_holders`

Availability and returned data depend on the provider's enabled services, retained range and permissions.

## GET

get the list of top holders for a given token

### Query parameters

| Name | Type | Required | Description |
|---|---|---|---|
| `limit` | integer | No | limit of [n] results per page |
| `skip` | integer | No | skip [n] results |
| `contract` | string | Yes | token contract account name |
| `symbol` | string | No | filter by token symbol |



### HTTP 200

Response shape is not declared here; inspect the provider response and runtime API specification.

## Errors and provider capabilities

Check HTTP status before parsing JSON. Validation errors, unavailable dependencies, query failures and missing source coverage are distinct outcomes. The running provider's [OpenAPI interface](/reference/overview/#provider-api-specification) includes its installed plugins and configuration.

## Source

[Route definition](https://github.com/eosrio/hyperion-history-api/blob/e1818923065d648a38009572d76badeab0684af1/src/api/routes/v2-state/get_top_holders/index.ts) at `e1818923065d648a38009572d76badeab0684af1`. SHA-256: `6e73a4920d40a263b6c661278b853f0555dedee7849f9bf96c348faa92e545e1`. [Download the core source OpenAPI](/reference/hyperion-source.openapi.json). Generated from the 4.5 source.
