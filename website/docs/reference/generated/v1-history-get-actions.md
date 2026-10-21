---
title: v1 / history / get_actions
sidebar_label: get_actions
---

# v1 / history / get_actions

`POST /v1/history/get_actions`

Availability and returned data depend on the provider's enabled services, retained range and permissions.

## POST

legacy get actions query

No query parameters are declared for this method.

### Request body

```json
{
  "type": "object",
  "properties": {
    "account_name": {
      "description": "notified account",
      "type": "string",
      "minLength": 1,
      "maxLength": 12
    },
    "pos": {
      "description": "action position (pagination)",
      "type": "integer"
    },
    "offset": {
      "description": "limit of [n] actions per page",
      "type": "integer"
    },
    "filter": {
      "description": "code:name filter",
      "type": "string",
      "minLength": 3
    },
    "sort": {
      "description": "sort direction",
      "enum": [
        "desc",
        "asc",
        "1",
        "-1"
      ],
      "type": "string"
    },
    "after": {
      "description": "filter after specified date (ISO8601)",
      "type": "string",
      "format": "date-time"
    },
    "before": {
      "description": "filter before specified date (ISO8601)",
      "type": "string",
      "format": "date-time"
    },
    "parent": {
      "description": "filter by parent global sequence",
      "type": "integer",
      "minimum": 0
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
    "query_time": {
      "type": "number"
    },
    "last_irreversible_block": {
      "type": "number"
    },
    "actions": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "account_action_seq": {
            "type": "string"
          },
          "global_action_seq": {
            "type": "string"
          },
          "block_num": {
            "type": "number"
          },
          "block_time": {
            "type": "string"
          },
          "action_trace": {
            "type": "object",
            "properties": {
              "action_ordinal": {
                "type": "number"
              },
              "creator_action_ordinal": {
                "type": "number"
              },
              "receipt": {
                "type": "object",
                "properties": {
                  "receiver": {
                    "type": "string"
                  },
                  "global_sequence": {
                    "type": "string"
                  },
                  "recv_sequence": {
                    "type": "string"
                  },
                  "auth_sequence": {
                    "type": "array",
                    "items": {
                      "type": "object",
                      "properties": {
                        "account": {
                          "type": "string"
                        },
                        "sequence": {
                          "type": "string"
                        }
                      }
                    }
                  }
                }
              },
              "receiver": {
                "type": "string"
              },
              "act": {
                "type": "object",
                "properties": {
                  "account": {
                    "type": "string"
                  },
                  "name": {
                    "type": "string"
                  },
                  "authorization": {
                    "type": "array",
                    "items": {
                      "type": "object",
                      "additionalProperties": true
                    }
                  },
                  "data": {},
                  "hex_data": {
                    "type": "string"
                  },
                  "hex_encoder": {
                    "type": "string"
                  }
                }
              },
              "trx_id": {
                "type": "string"
              },
              "block_num": {
                "type": "number"
              },
              "block_time": {
                "type": "string"
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

[Route definition](https://github.com/eosrio/hyperion-history-api/blob/e1818923065d648a38009572d76badeab0684af1/src/api/routes/v1-history/get_actions/index.ts) at `e1818923065d648a38009572d76badeab0684af1`. SHA-256: `f3954724263d831d8b1f068dacdf363433e412230c049a56943f94e05e3ef275`. [Download the core source OpenAPI](/reference/hyperion-source.openapi.json). Generated from the 4.5 source.
