---
title: Connections configuration reference
slug: /providers/setup/connections/
---

# Connections configuration reference

Connection credentials and chain endpoints live in `config/connections.json`. The `chains` map is populated by `./hyp-config chains new`. SHiP failover accepts a URL, an array of URLs, or labeled URL objects. Use the exact AMQP virtual-host name configured in RabbitMQ.

:::note Reference values are not effective defaults
These are values in the 4.5 creation template. Operator-specific credentials, endpoints and enabled capabilities must be configured for your installation. Validation and optional runtime fields are defined in the owning source.
:::

## amqp

| Key | Reference value type | Reference value |
|---|---|---|
| `amqp.host` | string | `"127.0.0.1:5672"` |
| `amqp.api` | string | `"127.0.0.1:15672"` |
| `amqp.protocol` | string | `"http"` |
| `amqp.user` | string | `"username"` |
| `amqp.pass` | string | `"password"` |
| `amqp.vhost` | string | `"hyperion"` |
| `amqp.frameMax` | string | `"0x10000"` |

## elasticsearch

| Key | Reference value type | Reference value |
|---|---|---|
| `elasticsearch.protocol` | string | `"http"` |
| `elasticsearch.host` | string | `"127.0.0.1:9200"` |
| `elasticsearch.ingest_nodes` | array | `["127.0.0.1:9200"]` |
| `elasticsearch.user` | string | `"elastic"` |
| `elasticsearch.pass` | string | `"password"` |

## redis

| Key | Reference value type | Reference value |
|---|---|---|
| `redis.host` | string | `"127.0.0.1"` |
| `redis.port` | number | `6379` |

## mongodb

| Key | Reference value type | Reference value |
|---|---|---|
| `mongodb.enabled` | boolean | `true` |
| `mongodb.host` | string | `"127.0.0.1"` |
| `mongodb.port` | number | `27017` |
| `mongodb.database_prefix` | string | `"hyperion"` |
| `mongodb.user` | string | `""` |
| `mongodb.pass` | string | `""` |

## chains

| Key | Reference value type | Reference value |
|---|---|---|


## alerts

| Key | Reference value type | Reference value |
|---|---|---|
| `alerts.triggers.onApiStart.enabled` | boolean | `true` |
| `alerts.triggers.onApiStart.cooldown` | number | `30` |
| `alerts.triggers.onApiStart.emitOn` | array | `["http"]` |
| `alerts.triggers.onIndexerError.enabled` | boolean | `true` |
| `alerts.triggers.onIndexerError.cooldown` | number | `30` |
| `alerts.triggers.onIndexerError.emitOn` | array | `["telegram","email","http"]` |
| `alerts.providers.telegram.enabled` | boolean | `false` |
| `alerts.providers.telegram.botToken` | string | `""` |
| `alerts.providers.telegram.destinationIds` | array | `[1]` |
| `alerts.providers.http.enabled` | boolean | `false` |
| `alerts.providers.http.server` | string | `""` |
| `alerts.providers.http.path` | string | `""` |
| `alerts.providers.http.useAuth` | boolean | `false` |
| `alerts.providers.http.user` | string | `""` |
| `alerts.providers.http.pass` | string | `""` |
| `alerts.providers.email.enabled` | boolean | `false` |
| `alerts.providers.email.sourceEmail` | string | `""` |
| `alerts.providers.email.destinationEmails` | array | `[]` |
| `alerts.providers.email.smtp` | string | `""` |
| `alerts.providers.email.port` | number | `465` |
| `alerts.providers.email.tls` | boolean | `true` |
| `alerts.providers.email.user` | string | `""` |
| `alerts.providers.email.pass` | string | `""` |

## Source

[`references/connections.ref.json`](https://github.com/eosrio/hyperion-history-api/blob/e1818923065d648a38009572d76badeab0684af1/references/connections.ref.json) at `e1818923065d648a38009572d76badeab0684af1`. SHA-256: `e600b48375d878109dfb4413b7c7c90a9b8d2a2434fb420e56661ff5596aa32b`. Generated from the 4.5 source; update the exporter rather than editing these tables.
