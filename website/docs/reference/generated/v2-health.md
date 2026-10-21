---
title: v2 / health
sidebar_label: health
---

# v2 / health

`GET /v2/health`

Availability and returned data depend on the provider's enabled services, retained range and permissions.

## GET

API Service Health Report

No query parameters are declared for this method.



### HTTP 200

Response shape is not declared here; inspect the provider response and runtime API specification.

## Errors and provider capabilities

Check HTTP status before parsing JSON. Validation errors, unavailable dependencies, query failures and missing source coverage are distinct outcomes. The running provider's [OpenAPI interface](/reference/overview/#provider-api-specification) includes its installed plugins and configuration.

## Source

[Route definition](https://github.com/eosrio/hyperion-history-api/blob/e1818923065d648a38009572d76badeab0684af1/src/api/routes/v2/health/index.ts) at `e1818923065d648a38009572d76badeab0684af1`. SHA-256: `cbca007b6e3b74190c81f579c41f3967430c83f81d6703cfdfc57b0d42c3ef62`. [Download the core source OpenAPI](/reference/hyperion-source.openapi.json). Generated from the 4.5 source.
