---
title: v2 / explorer_logo
sidebar_label: explorer_logo
---

# v2 / explorer_logo

`GET /v2/explorer_logo`

Availability and returned data depend on the provider's enabled services, retained range and permissions.

## GET

explorer_logo

No query parameters are declared for this method.



### HTTP 200

Response shape is not declared here; inspect the provider response and runtime API specification.

## Errors and provider capabilities

Check HTTP status before parsing JSON. Validation errors, unavailable dependencies, query failures and missing source coverage are distinct outcomes. The running provider's [OpenAPI interface](/reference/overview/#provider-api-specification) includes its installed plugins and configuration.

## Source

[Route definition](https://github.com/eosrio/hyperion-history-api/blob/e1818923065d648a38009572d76badeab0684af1/src/api/routes/v2/explorer_logo/index.ts) at `e1818923065d648a38009572d76badeab0684af1`. SHA-256: `abc496fbd01f6b472c829dadc36283d82a47da27a29e04b2b5aec70a43da98f7`. [Download the core source OpenAPI](/reference/hyperion-source.openapi.json). Generated from the 4.5 source.
