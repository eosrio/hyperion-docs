---
title: v2 / state / get_account
sidebar_label: get_account
---

# v2 / state / get_account

`GET /v2/state/get_account`

The `account` parameter is required. This account aggregate can include data from different configured services; inspect provider capabilities and each response section.

## GET

get account data

### Query parameters

| Name | Type | Required | Description |
|---|---|---|---|
| `limit` | integer | No | limit of [n] results per page |
| `skip` | integer | No | skip [n] results |
| `account` | string | Yes | account name |



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
    "account": {
      "additionalProperties": true
    },
    "links": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "timestamp": {
            "type": "string"
          },
          "permission": {
            "type": "string"
          },
          "code": {
            "type": "string"
          },
          "action": {
            "type": "string"
          }
        }
      }
    },
    "tokens": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "symbol": {
            "type": "string"
          },
          "precision": {
            "type": "integer"
          },
          "amount": {
            "type": "number"
          },
          "contract": {
            "type": "string"
          }
        }
      }
    },
    "total_actions": {
      "type": "number"
    },
    "actions": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "@timestamp": {
            "type": "string"
          },
          "timestamp": {
            "type": "string"
          },
          "block_num": {
            "type": "number"
          },
          "block_id": {
            "type": "string"
          },
          "trx_id": {
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
                  "properties": {
                    "actor": {
                      "type": "string"
                    },
                    "permission": {
                      "type": "string"
                    }
                  }
                }
              }
            },
            "additionalProperties": true
          },
          "receipts": {
            "type": "array",
            "items": {
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
            }
          },
          "cpu_usage_us": {
            "type": "number"
          },
          "net_usage_words": {
            "type": "number"
          },
          "account_ram_deltas": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "account": {
                  "type": "string"
                },
                "delta": {
                  "type": "number"
                }
              },
              "additionalProperties": true
            }
          },
          "global_sequence": {
            "type": "string"
          },
          "producer": {
            "type": "string"
          },
          "parent": {
            "type": "number"
          },
          "action_ordinal": {
            "type": "number"
          },
          "creator_action_ordinal": {
            "type": "number"
          },
          "signatures": {
            "type": "array",
            "items": {
              "type": "string"
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

[Route definition](https://github.com/eosrio/hyperion-history-api/blob/e1818923065d648a38009572d76badeab0684af1/src/api/routes/v2-state/get_account/index.ts) at `e1818923065d648a38009572d76badeab0684af1`. SHA-256: `348e3d06f0468203582632d9adaf0707fd8d6116956ace6c82acd9ae6539d322`. [Download the core source OpenAPI](/reference/hyperion-source.openapi.json). Generated from the 4.5 source.
