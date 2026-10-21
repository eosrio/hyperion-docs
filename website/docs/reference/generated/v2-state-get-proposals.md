---
title: v2 / state / get_proposals
sidebar_label: get_proposals
---

# v2 / state / get_proposals

`GET /v2/state/get_proposals`

Availability and returned data depend on the provider's enabled services, retained range and permissions.

## GET

get proposals

### Query parameters

| Name | Type | Required | Description |
|---|---|---|---|
| `proposer` | string | No | filter by proposer |
| `proposal` | string | No | filter by proposal name |
| `account` | string | No | filter by either requested or provided account |
| `requested` | string | No | filter by requested account |
| `provided` | string | No | filter by provided account |
| `executed` | boolean | No | filter by execution status |
| `track` | string | No | total results to track (count) [number or true] |
| `skip` | integer | No | skip [n] actions (pagination) |
| `limit` | integer | No | limit of [n] actions per page |



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
    "error": {
      "type": "string",
      "description": "Error message when a condition fails (MongoDB disabled or feature disabled)"
    },
    "proposals": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "proposal_name": {
            "type": "string"
          },
          "expiration": {
            "type": "string"
          },
          "earliest_exec_time": {
            "type": "string",
            "nullable": true
          },
          "block_num": {
            "type": "number"
          },
          "proposer": {
            "type": "string"
          },
          "executed": {
            "type": "boolean"
          },
          "primary_key": {
            "type": "string"
          },
          "trx": {
            "type": "object",
            "properties": {
              "expiration": {
                "type": "string"
              },
              "ref_block_num": {
                "type": "number"
              },
              "ref_block_prefix": {
                "type": "number"
              },
              "max_net_usage_words": {
                "type": "number"
              },
              "max_cpu_usage_ms": {
                "type": "number"
              },
              "delay_sec": {
                "type": "number"
              },
              "context_free_actions": {
                "type": "array",
                "items": {
                  "type": "object"
                }
              },
              "actions": {
                "type": "array",
                "items": {
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
                    },
                    "data": {
                      "type": "object",
                      "properties": {
                        "from": {
                          "type": "string"
                        },
                        "to": {
                          "type": "string"
                        },
                        "quantity": {
                          "type": "string"
                        },
                        "memo": {
                          "type": "string"
                        }
                      }
                    }
                  }
                }
              },
              "transaction_extensions": {
                "type": "array",
                "items": {
                  "type": "object"
                }
              }
            }
          },
          "requested_approvals": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "actor": {
                  "type": "string"
                },
                "permission": {
                  "type": "string"
                },
                "time": {
                  "type": "string"
                }
              }
            }
          },
          "provided_approvals": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "actor": {
                  "type": "string"
                },
                "permission": {
                  "type": "string"
                },
                "time": {
                  "type": "string"
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

[Route definition](https://github.com/eosrio/hyperion-history-api/blob/e1818923065d648a38009572d76badeab0684af1/src/api/routes/v2-state/get_proposals/index.ts) at `e1818923065d648a38009572d76badeab0684af1`. SHA-256: `71fdb30dbd527391d43e06a558ef224db98ced3b4d88391a913f5f571c3ce004`. [Download the core source OpenAPI](/reference/hyperion-source.openapi.json). Generated from the 4.5 source.
