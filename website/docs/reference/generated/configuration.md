---
title: Chain configuration reference
slug: /providers/setup/chain/
---

# Chain configuration reference

Your chain file is `config/chains/<chain>.config.json`. Additional runtime options, including protocol selection and archive hydration, are described in [configure a chain](/providers/setup/hyperion_configuration/).

:::note Reference values are not effective defaults
These are values in the 4.5 creation template. Operator-specific credentials, endpoints and enabled capabilities must be configured for your installation. Validation and optional runtime fields are defined in the owning source.
:::

## api

| Key | Reference value type | Reference value |
|---|---|---|
| `api.enabled` | boolean | `true` |
| `api.pm2_scaling` | number | `1` |
| `api.chain_name` | string | `"EXAMPLE Chain"` |
| `api.server_addr` | string | `"127.0.0.1"` |
| `api.server_port` | number | `7000` |
| `api.stream_port` | number | `1234` |
| `api.stream_scroll_limit` | number | `-1` |
| `api.stream_scroll_batch` | number | `500` |
| `api.server_name` | string | `"127.0.0.1:7000"` |
| `api.provider_name` | string | `"Example Provider"` |
| `api.provider_url` | string | `"https://example.com"` |
| `api.chain_api` | string | `""` |
| `api.push_api` | string | `""` |
| `api.chain_logo_url` | string | `""` |
| `api.explorer.home_redirect` | boolean | `false` |
| `api.explorer.upstream` | string | `""` |
| `api.explorer.theme` | string | `""` |
| `api.enable_caching` | boolean | `true` |
| `api.cache_life` | number | `1` |
| `api.limits.get_actions` | number | `1000` |
| `api.limits.get_voters` | number | `100` |
| `api.limits.get_links` | number | `1000` |
| `api.limits.get_deltas` | number | `1000` |
| `api.limits.get_trx_actions` | number | `200` |
| `api.access_log` | boolean | `false` |
| `api.chain_api_error_log` | boolean | `false` |
| `api.log_errors` | boolean | `false` |
| `api.custom_core_token` | string | `""` |
| `api.enable_export_action` | boolean | `false` |
| `api.disable_rate_limit` | boolean | `false` |
| `api.rate_limit_rpm` | number | `1000` |
| `api.rate_limit_allow` | array | `[]` |
| `api.disable_tx_cache` | boolean | `false` |
| `api.tx_cache_expiration_sec` | number | `3600` |
| `api.v1_chain_cache` | array | `[&#123;"path":"get_block","ttl":3000&#125;,&#123;"path":"get_info","ttl":500&#125;]` |
| `api.node_max_old_space_size` | number | `1024` |
| `api.node_trace_deprecation` | boolean | `false` |
| `api.node_trace_warnings` | boolean | `false` |

## indexer

| Key | Reference value type | Reference value |
|---|---|---|
| `indexer.enabled` | boolean | `true` |
| `indexer.start_on` | number | `0` |
| `indexer.stop_on` | number | `0` |
| `indexer.rewrite` | boolean | `false` |
| `indexer.purge_queues` | boolean | `false` |
| `indexer.live_reader` | boolean | `false` |
| `indexer.live_only_mode` | boolean | `false` |
| `indexer.abi_scan_mode` | boolean | `true` |
| `indexer.fetch_block` | boolean | `true` |
| `indexer.fetch_traces` | boolean | `true` |
| `indexer.fetch_deltas` | boolean | `true` |
| `indexer.disable_reading` | boolean | `false` |
| `indexer.disable_indexing` | boolean | `false` |
| `indexer.process_deltas` | boolean | `true` |
| `indexer.node_max_old_space_size` | number | `4096` |
| `indexer.node_trace_deprecation` | boolean | `false` |
| `indexer.node_trace_warnings` | boolean | `false` |

## settings

| Key | Reference value type | Reference value |
|---|---|---|
| `settings.preview` | boolean | `false` |
| `settings.chain` | string | `"eos"` |
| `settings.parser` | string | `"3.2"` |
| `settings.auto_stop` | number | `0` |
| `settings.index_version` | string | `"v1"` |
| `settings.debug` | boolean | `false` |
| `settings.bp_logs` | boolean | `false` |
| `settings.bp_monitoring` | boolean | `false` |
| `settings.ipc_debug_rate` | number | `60000` |
| `settings.allow_custom_abi` | boolean | `false` |
| `settings.rate_monitoring` | boolean | `true` |
| `settings.max_ws_payload_mb` | number | `256` |
| `settings.ds_profiling` | boolean | `false` |
| `settings.auto_mode_switch` | boolean | `false` |
| `settings.use_global_agent` | boolean | `false` |
| `settings.index_partition_size` | number | `10000000` |
| `settings.max_retained_blocks` | number | `0` |
| `settings.es_replicas` | number | `0` |

## blacklists

| Key | Reference value type | Reference value |
|---|---|---|
| `blacklists.actions` | array | `[]` |
| `blacklists.deltas` | array | `[]` |

## whitelists

| Key | Reference value type | Reference value |
|---|---|---|
| `whitelists.actions` | array | `[]` |
| `whitelists.deltas` | array | `[]` |
| `whitelists.max_depth` | number | `10` |
| `whitelists.root_only` | boolean | `false` |

## scaling

| Key | Reference value type | Reference value |
|---|---|---|
| `scaling.readers` | number | `1` |
| `scaling.ds_queues` | number | `1` |
| `scaling.ds_threads` | number | `1` |
| `scaling.ds_pool_size` | number | `1` |
| `scaling.indexing_queues` | number | `1` |
| `scaling.ad_idx_queues` | number | `1` |
| `scaling.dyn_idx_queues` | number | `1` |
| `scaling.max_autoscale` | number | `4` |
| `scaling.batch_size` | number | `5000` |
| `scaling.resume_trigger` | number | `5000` |
| `scaling.auto_scale_trigger` | number | `20000` |
| `scaling.block_queue_limit` | number | `10000` |
| `scaling.max_queue_limit` | number | `100000` |
| `scaling.routing_mode` | string | `"round_robin"` |
| `scaling.polling_interval` | number | `10000` |

## features

| Key | Reference value type | Reference value |
|---|---|---|
| `features.streaming.enable` | boolean | `false` |
| `features.streaming.traces` | boolean | `false` |
| `features.streaming.deltas` | boolean | `false` |
| `features.tables.proposals` | boolean | `true` |
| `features.tables.accounts` | boolean | `true` |
| `features.tables.voters` | boolean | `true` |
| `features.tables.permissions` | boolean | `true` |
| `features.tables.user_resources` | boolean | `false` |
| `features.contract_state.contracts` | object | `&#123;&#125;` |
| `features.index_deltas` | boolean | `true` |
| `features.index_transfer_memo` | boolean | `true` |
| `features.index_all_deltas` | boolean | `true` |
| `features.index_deltas_deletions` | boolean | `false` |
| `features.deferred_trx` | boolean | `false` |
| `features.failed_trx` | boolean | `false` |
| `features.resource_limits` | boolean | `false` |
| `features.resource_usage` | boolean | `false` |

## prefetch

| Key | Reference value type | Reference value |
|---|---|---|
| `prefetch.read` | number | `50` |
| `prefetch.block` | number | `100` |
| `prefetch.index` | number | `500` |

## hub

| Key | Reference value type | Reference value |
|---|---|---|
| `hub.enabled` | boolean | `false` |
| `hub.instance_key` | string | `""` |
| `hub.custom_indexer_controller` | string | `""` |

## plugins

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
| `alerts.providers.http.server` | string | `"http://localhost:6200"` |
| `alerts.providers.http.path` | string | `"/notification"` |
| `alerts.providers.http.useAuth` | boolean | `false` |
| `alerts.providers.http.user` | string | `""` |
| `alerts.providers.http.pass` | string | `""` |
| `alerts.providers.email.enabled` | boolean | `false` |
| `alerts.providers.email.sourceEmail` | string | `"sender@example.com"` |
| `alerts.providers.email.destinationEmails` | array | `["receiverA@example.com","receiverB@example.com"]` |
| `alerts.providers.email.smtp` | string | `"smtp-relay.gmail.com (UPDATE THIS)"` |
| `alerts.providers.email.port` | number | `465` |
| `alerts.providers.email.tls` | boolean | `true` |
| `alerts.providers.email.user` | string | `""` |
| `alerts.providers.email.pass` | string | `""` |

## Source

[`references/config.ref.json`](https://github.com/eosrio/hyperion-history-api/blob/e1818923065d648a38009572d76badeab0684af1/references/config.ref.json) at `e1818923065d648a38009572d76badeab0684af1`. SHA-256: `3f3d13025d5ca1693ad43f8ea66b1571a6306f912509eab75dbc1bfb1956b713`. Generated from the 4.5 source; update the exporter rather than editing these tables.
