---
title: v2 / state / get_table_rows
sidebar_label: get_table_rows
---

# v2 / state / get_table_rows

`GET /v2/state/get_table_rows`

Availability and returned data depend on the provider's enabled services, retained range and permissions.

## GET

get table rows from contract table

### Query parameters

| Name | Type | Required | Description |
|---|---|---|---|
| `limit` | integer | No | limit of [n] results per page |
| `skip` | integer | No | skip [n] results |
| `contract` | string | No | contract name |
| `table` | string | No | table name |
| `primary_key` | string | No | filter by primary key |
| `scope` | string | No | filter by scope |
| `block_id` | string | No | filter by block ID |
| `block_num` | integer | No | filter by block number |
| `block_time` | string | No | filter by block time |
| `payer` | string | No | filter by payer account |
| `filters` | string | No | JSON string containing dynamic filters to apply to table rows. Example: &#123;"is_active":true,"total_votes":&#123;"$gt":1000000&#125;&#125;. For date ranges: &#123;"creation_date":&#123;"$gte":"2023-01-01T00:00:00Z","$lte":"2023-12-31T23:59:59Z"&#125;&#125;. Date strings are automatically converted to proper MongoDB date objects for comparison. Supports MongoDB query operators like $gt, $lt, $gte, $lte, $in, etc. |
| `sort_by` | string | No | Field name to sort results by. Can be any field in the table rows. |
| `sort_direction` | string | No | Sort direction: "asc" for ascending, "desc" for descending Values: `asc`, `desc`. Default: `"asc"`. |



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
    "rows_count": {
      "type": "integer"
    },
    "sort_by": {
      "type": "string",
      "description": "Field used for sorting the results"
    },
    "sort_direction": {
      "type": "string",
      "description": "Direction of sorting (asc or desc)"
    },
    "rows": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "@pk": {
            "type": "string",
            "description": "Primary key value"
          },
          "@scope": {
            "type": "string",
            "description": "Scope of the table row"
          },
          "@block_id": {
            "type": "string",
            "description": "Block ID when the row was last modified"
          },
          "@block_num": {
            "type": "integer",
            "description": "Block number when the row was last modified"
          },
          "@block_time": {
            "type": "string",
            "description": "Block timestamp when the row was last modified"
          },
          "@payer": {
            "type": "string",
            "description": "Account name that paid for this row"
          }
        },
        "additionalProperties": true
      }
    }
  }
}
```

## Errors and provider capabilities

Check HTTP status before parsing JSON. Validation errors, unavailable dependencies, query failures and missing source coverage are distinct outcomes. The running provider's [OpenAPI interface](/reference/overview/#provider-api-specification) includes its installed plugins and configuration.

## Source

[Route definition](https://github.com/eosrio/hyperion-history-api/blob/e1818923065d648a38009572d76badeab0684af1/src/api/routes/v2-state/get_table_rows/index.ts) at `e1818923065d648a38009572d76badeab0684af1`. SHA-256: `7164484e4f2ac67b8dab6262f762b0e19e4f981922cc533ad7f2d8c926285cb7`. [Download the core source OpenAPI](pathname:///reference/hyperion-source.openapi.json). Generated from the 4.5 source.
