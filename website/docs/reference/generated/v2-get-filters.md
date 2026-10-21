---
title: v2 / get_filters
sidebar_label: get_filters
---

# v2 / get_filters

`GET /v2/get_filters`

Availability and returned data depend on the provider's enabled services, retained range and permissions.

## GET

Active Filters on the Indexer

No query parameters are declared for this method.



### HTTP 200

Response shape is not declared here; inspect the provider response and runtime API specification.

## Errors and provider capabilities

Check HTTP status before parsing JSON. Validation errors, unavailable dependencies, query failures and missing source coverage are distinct outcomes. The running provider's [OpenAPI interface](/reference/overview/#provider-api-specification) includes its installed plugins and configuration.

## Source

[Route definition](https://github.com/eosrio/hyperion-history-api/blob/e1818923065d648a38009572d76badeab0684af1/src/api/routes/v2/get_filters/index.ts) at `e1818923065d648a38009572d76badeab0684af1`. SHA-256: `572376a1fc33804c55944a71c44deeedeef042049cd3e2f830cb184296c84c5a`. [Download the core source OpenAPI](/reference/hyperion-source.openapi.json). Generated from the 4.5 source.
