---
title: v1 / trace_api / get_block
sidebar_label: get_block
---

# v1 / trace_api / get_block

`POST /v1/trace_api/get_block`

Availability and returned data depend on the provider's enabled services, retained range and permissions.

## POST

get block traces

No query parameters are declared for this method.

### Request body

```json
{
  "type": "object",
  "properties": {
    "block_num": {
      "description": "block number",
      "type": "integer"
    },
    "block_id": {
      "description": "block id",
      "type": "string"
    }
  }
}
```

### HTTP 200

Declared JSON schema:

```json
{
  "type": "object",
  "properties": {
    "query_time_ms": {
      "type": "number"
    },
    "cached": {
      "type": "boolean"
    },
    "hot_only": {
      "type": "boolean"
    },
    "lib": {
      "type": "number"
    },
    "last_indexed_block": {
      "type": "number"
    },
    "last_indexed_block_time": {
      "type": "string"
    },
    "total": {
      "type": "object",
      "properties": {
        "value": {
          "type": "number"
        },
        "relation": {
          "type": "string"
        }
      }
    },
    "id": {
      "type": "string"
    },
    "number": {
      "type": "integer"
    },
    "previous_id": {
      "type": "string"
    },
    "status": {
      "type": "string"
    },
    "timestamp": {
      "type": "string"
    },
    "producer": {
      "type": "string"
    },
    "transactions": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string"
          },
          "actions": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "receiver": {
                  "type": "string"
                },
                "account": {
                  "type": "string"
                },
                "action": {
                  "type": "string"
                },
                "authorization": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "properties": {
                      "account": {
                        "type": "string"
                      },
                      "permission": {
                        "type": "string"
                      }
                    }
                  }
                },
                "data": {
                  "additionalProperties": true
                }
              }
            }
          }
        }
      }
    }
  }
}
```

## Errors and provider capabilities

Check HTTP status before parsing JSON. Validation errors, unavailable dependencies, query failures and missing source coverage are distinct outcomes. The running provider's [OpenAPI interface](/reference/overview/#provider-api-specification) includes its installed plugins and configuration.

## Source

[Route definition](https://github.com/eosrio/hyperion-history-api/blob/e1818923065d648a38009572d76badeab0684af1/src/api/routes/v1-trace/get_block/index.ts) at `e1818923065d648a38009572d76badeab0684af1`. SHA-256: `fe732977870380b851d6d5e693d198d2f71f1fbcef6a79a9cce620a11d249ed1`. [Download the core source OpenAPI](/reference/hyperion-source.openapi.json). Generated from the 4.5 source.
