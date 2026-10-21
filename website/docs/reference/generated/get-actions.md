---
title: v2 / history / get_actions
sidebar_label: get_actions
---

# v2 / history / get_actions

`GET /v2/history/get_actions`

Use bounded historical ranges. Keep sequence values as decimal strings rather than JavaScript Number. Generic indexed-field filters combine with AND. Archive hydration restores returned payloads; it does not make missing payload fields searchable. See [action filtering and pagination](/build/query-actions/).

## GET

get actions based on notified account. this endpoint also accepts generic filters based on indexed fields (e.g. act.authorization.actor=eosio or act.name=delegatebw), if included they will be combined with a AND operator

### Query parameters

| Name | Type | Required | Description |
|---|---|---|---|
| `limit` | integer | No | limit of [n] results per page |
| `skip` | integer | No | skip [n] results |
| `account` | string | No | notified account |
| `track` | string | No | total results to track (count) [number or true] |
| `filter` | string | No | code:name filter |
| `sort` | string | No | sort direction Values: `desc`, `asc`, `1`, `-1`. |
| `after` | string | No | filter after specified date (ISO8601) |
| `before` | string | No | filter before specified date (ISO8601) |
| `simple` | boolean | No | simplified output mode |
| `hot_only` | boolean | No | search only the latest hot index |
| `noBinary` | boolean | No | exclude large binary data |
| `checkLib` | boolean | No | perform reversibility check |
| `hydrate` | boolean | No | hydrate cold-tier act.data from the configured archive (default: true). Set false to skip archive lookups. |



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
    "simple_actions": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "block": {
            "type": "number"
          },
          "timestamp": {
            "type": "string"
          },
          "irreversible": {
            "type": "boolean"
          },
          "contract": {
            "type": "string"
          },
          "action": {
            "type": "string"
          },
          "actors": {
            "type": "string"
          },
          "notified": {
            "type": "string"
          },
          "transaction_id": {
            "type": "string"
          },
          "data": {
            "additionalProperties": true
          }
        }
      }
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

[Route definition](https://github.com/eosrio/hyperion-history-api/blob/e1818923065d648a38009572d76badeab0684af1/src/api/routes/v2-history/get_actions/index.ts) at `e1818923065d648a38009572d76badeab0684af1`. SHA-256: `c189e9e98466121e6307c13cd27dc4d9019e0ce4228cf9bda1c263cfd4932264`. [Download the core source OpenAPI](pathname:///reference/hyperion-source.openapi.json). Generated from the 4.5 source.
