---
title: v2 / stats / get_resource_usage
sidebar_label: get_resource_usage
---

# v2 / stats / get_resource_usage

`GET /v2/stats/get_resource_usage`

Availability and returned data depend on the provider's enabled services, retained range and permissions.

## GET

get resource usage stats for a specific action

### Query parameters

| Name | Type | Required | Description |
|---|---|---|---|
| `code` | string | Yes | contract |
| `action` | string | Yes | action name |



### HTTP 200

Response shape is not declared here; inspect the provider response and runtime API specification.

## Errors and provider capabilities

Check HTTP status before parsing JSON. Validation errors, unavailable dependencies, query failures and missing source coverage are distinct outcomes. The running provider's [OpenAPI interface](/reference/overview/#provider-api-specification) includes its installed plugins and configuration.

## Source

[Route definition](https://github.com/eosrio/hyperion-history-api/blob/e1818923065d648a38009572d76badeab0684af1/src/api/routes/v2-stats/get_resource_usage/index.ts) at `e1818923065d648a38009572d76badeab0684af1`. SHA-256: `a42221b2dd88f50c25a20eb5a9aa34b76bdd4733b359f04792986521a7eb517f`. [Download the core source OpenAPI](/reference/hyperion-source.openapi.json). Generated from the 4.5 source.
