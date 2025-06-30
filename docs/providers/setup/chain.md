[:fontawesome-solid-arrow-left-long: Hyperion Configuration](hyperion_configuration.md#21-add-a-new-chain-configuration)
# Chain Configuration Reference `config/chains/<chain>.config.json`

This file contains all the specific settings for **one particular blockchain** that Hyperion will index. You will typically create and manage the basic structure of this file using the `./hyp-config chains new ...` command, but **you must review and customize this file** to tailor Hyperion's behavior, performance, and features for your specific needs and the characteristics of the chain being indexed.

!!! attention "Review Required"
    Review each section below and adjust parameters according to your hardware resources, chain traffic, and desired features.

The configuration is divided into several main sections:


## API Server Configuration

Settings related to the Hyperion HTTP API server instances for this chain.

`api:`

*   `enabled`: (`true`|`false`) - Whether to launch API server instances for this chain via PM2. Default: `true`.
*   `pm2_scaling`: (integer) - Number of API server instances to launch in cluster mode via PM2. Adjust based on expected load and CPU cores. Default: `1`.
*   `chain_name`: (string) - Display name for the chain used in API responses and documentation (e.g., "WAX Mainnet").
*   `server_addr`: (string) - IP address the API server should bind to (e.g., `"127.0.0.1"` for local only, `"0.0.0.0"` for all interfaces). Default: `"127.0.0.1"`.
*   `server_port`: (integer) - Port number for the HTTP API server. Default: `7000`.
*   `stream_port`: (integer) - Port number for the WebSocket streaming server (if `features.streaming.enable` is true). Default: `1234`.
*   `stream_scroll_limit`: (integer) - Maximum number of historical documents (actions/deltas) allowed in a single streaming request scroll query. `-1` disables the limit. Default: `-1`.
*   `stream_scroll_batch`: (integer) - Number of documents to fetch per Elasticsearch scroll request during historical streaming. Default: `500`.
*   `server_name`: (string) - Publicly accessible domain name and port for this API (e.g., `"wax.hyperion.example.com:443"`). Used in documentation links. Default: `"127.0.0.1:7000"`.
*   `provider_name`: (string) - Name of the entity providing this Hyperion instance. Used in documentation. Default: `"Example Provider"`.
*   `provider_url`: (string) - URL associated with the provider. Used in documentation. Default: `"https://example.com"`.
*   `chain_logo_url`: (string) - URL to a logo image for the chain. Used in documentation.
*   `chain_api`: (string) - Override the default Nodeos HTTP endpoint (defined in `connections.json`) specifically for `/v1/chain` requests handled by this API instance. Leave empty (`""`) to use the default.
*   `push_api`: (string) - Define a separate Nodeos endpoint specifically for handling `push_transaction` requests. Useful for directing write operations to dedicated nodes. Leave empty (`""`) to use the `chain_api` or the default from `connections.json`.
*   `explorer`: (object) - Configuration for the integrated lightweight explorer plugin.
    *   `home_redirect`: (`true`|`false`) - Redirect the API root `/` to `/explorer`. Default: `false`.
    *   `upstream`: (string) - URL to proxy explorer requests to (if using a separate explorer service). Requires `@fastify/http-proxy`. Leave empty if serving locally.
    *   `theme`: (string) - Name of a custom theme file (e.g., `mytheme`) located in `hyperion-history-api/explorer/themes/mytheme.theme.mjs`.
*   `enable_caching`: (`true`|`false`) - Enable Redis caching for API responses. Default: `true`.
*   `cache_life`: (integer) - Default cache expiration time in seconds. Default: `1`.
*   `limits`: (object) - Maximum number of results returned per page for various API endpoints. Helps prevent excessively large responses.
    * `get_table_rows`: (integer);
    * `get_top_holders`: (integer);
    * `get_links`: (integer);
    * `get_actions`: (integer);
    * `get_blocks`: (integer);
    * `get_created_accounts`: (integer);
    * `get_deltas`: (integer);
    * `get_key_accounts`: (integer);
    * `get_proposals`: (integer);
    * `get_tokens`: (integer);
    * `get_transfers`: (integer);
    * `get_voters`: (integer);
    * `get_trx_actions`: (integer);

*   `access_log`: (`true`|`false`) - Enable logging of API requests to `logs/<chain>/api.access.log`. Default: `false`.
*   `chain_api_error_log`: (`true`|`false`) - Log errors received when proxying requests to the Nodeos `chain_api`. Default: `false`.
*   `log_errors`: (`true`|`false`) - Log internal API server errors. Default: `false`.
*   `custom_core_token`: (string) - Override the default core token symbol (e.g., "EOS", "WAX") used for display purposes (e.g., legacy key conversion).
*   `disable_rate_limit`: (`true`|`false`) - Disable API rate limiting (requires `@fastify/rate-limit`). Default: `false`.
*   `rate_limit_rpm`: (integer) - Maximum requests per minute per IP address. Default: `1000`.
*   `rate_limit_allow`: (array) - List of IP addresses exempt from rate limiting.
*   `disable_tx_cache`: (`true`|`false`) - Disable the Redis cache specifically for `get_transaction` lookups. Default: `false`.
*   `tx_cache_expiration_sec`: (integer) - Expiration time in seconds for transaction details cached in Redis. Default: `3600` (1 hour).
*   `v1_chain_cache`: (array) - Configure specific caching TTLs (time-to-live in *milliseconds*) for proxied `/v1/chain` endpoints.
    *   `path`: (string) - The endpoint path (e.g., `"get_block"`).
    *   `ttl`: (integer) - Cache duration in milliseconds.
*   `node_max_old_space_size`: (integer) - Max heap size (in MB) for the Node.js API server process (`--max-old-space-size`). Default: `1024`.
*   `node_trace_deprecation`: (`true`|`false`) - Enable Node.js deprecation tracing (`--trace-deprecation`). Default: `false`.
*   `node_trace_warnings`: (`true`|`false`) - Enable Node.js warning tracing (`--trace-warnings`). Default: `false`.



- `"chain_name": "EXAMPLE Chain"`
- `"server_addr": "127.0.0.1"`
- `"server_port": 7000`
- `"server_name": "127.0.0.1:7000"`
- `"provider_name": "Example Provider"`
- `"provider_url": "https://example.com"`
- `"chain_logo_url": ""`
- `"enable_caching": true` ⇒ Set API cache
- `"cache_life": 1` ⇒ Define the cache life
- `"limits"` ⇒ Set API response limits
  - `"get_actions": 1000`
  - `"get_voters": 100`
  - `"get_links": 1000`
  - `"get_deltas": 1000`
- `"access_log": false` ⇒ Enable log API access.
- `"enable_explorer": false`

## Indexer Process Configuration

Settings controlling the behavior of the Hyperion Indexer process(es) for this chain.

`indexer`:

*   `enabled`: (`true`|`false`) - Whether to launch indexer instances for this chain via PM2. Default: `true`.
*   `start_on`: (integer) - Block number to start indexing from. `0` or `1` starts from the earliest available block in SHIP. Useful for catching up or partial history. Default: `0`.
*   `stop_on`: (integer) - Block number to stop indexing at. `0` disables the stop block. Default: `0`.
*   `rewrite`: (`true`|`false`) - If `true`, forces the indexer to re-process blocks within the `start_on`/`stop_on` range, even if they were previously indexed. Useful for repairs or reprocessing after configuration changes. Default: `false`.
*   `purge_queues`: (`true`|`false`) - If `true`, clears all RabbitMQ queues associated with this chain before the indexer starts. Useful for ensuring a clean start, especially after configuration changes or errors. Default: `false`.
*   `live_reader`: (`true`|`false`) - Instructs the reader process to continuously request blocks from SHIP, aiming to stay near the head of the chain. Default: `false`. Should generally be `true` for ongoing indexing.
*   `live_only_mode`: (`true`|`false`) - If `true`, disables historical range processing and only reads live blocks sequentially. Requires `live_reader: true`. Default: `false`.
*   `abi_scan_mode`: (`true`|`false`) - Optimizes the indexer for quickly scanning the chain history solely to capture contract ABIs. Disables trace and most delta processing. Recommended for the *first run* on a new chain to ensure ABIs are available for later deserialization. **Must be manually set back to `false`** for normal history indexing. Default: `true`.
*   `fetch_block`: (`true`|`false`) - Request block header information from SHIP. Required for most operations. Default: `true`.
*   `fetch_traces`: (`true`|`false`) - Request action trace information from SHIP. Required for action history. Default: `true`.
*   `disable_reading`: (`true`|`false`) - Completely disable the SHIP reader process(es). Useful if you only want to run deserializer/indexer workers to process existing data in queues. Default: `false`.
*   `disable_indexing`: (`true`|`false`) - Disable the final indexing stage (writing to Elasticsearch/MongoDB). Useful for debugging the deserialization stage. Default: `false`.
*   `process_deltas`: (`true`|`false`) - Process state deltas received from SHIP. Required for state features. Default: `true`.
*   `disable_delta_rm`: (`true`|`false`) - Disable the background process that marks older versions of state rows as deleted in Elasticsearch delta indices. Can save resources but may lead to inaccurate historical delta queries. Default: `true`.
*   `node_max_old_space_size`: (integer) - Max heap size (in MB) for the Node.js Indexer master process. Default: `4096`.
*   `node_trace_deprecation`: (`true`|`false`) - Enable Node.js deprecation tracing. Default: `false`.
*   `node_trace_warnings`: (`true`|`false`) - Enable Node.js warning tracing. Default: `false`.



## Settings - Global & Core Configuration

Core operational settings for this chain's Hyperion instance.

`settings:`

* `preview`: (`true`|`false`) - Preview mode, prints worker map and exit. Default: `false`
*   `chain`: (string) - **Required**. Short alias for the chain (e.g., `wax`, `eos`). **Must match** the key used in `config/connections.json`.
*   `eosio_alias`: (string) - The account name considered the "system" account (e.g., `eosio`, `wax`). Used for filtering some default system actions/deltas. Default: `"eosio"`.
*   `parser`: (string) - Version of the SHIP data parser to use. Should match the version used by your Nodeos SHIP plugin (e.g., `"3.2"` for Leap 3.2+). Default: `"3.2"`.
*   `auto_stop`: (integer) - Automatically stop the Indexer (master process) after X seconds of inactivity (no new blocks received). `0` disables auto-stop. Default: `0`.
*   `index_version`: (string) - A suffix appended to Elasticsearch index names (e.g., `wax-action-v1`). Allows for versioning or separating different index sets. Default: `"v1"`.
*   `debug`: (`true`|`false`) - Enable verbose debug logging. Default: `false`.
*   `rate_monitoring`: (`true`|`false`) - Print internal processing rates (blocks/s, actions/s, etc.) to the console. Default: `true`.
*   `bp_logs`: (`true`|`false`) - Enable specific logging related to block producers (requires `bp_monitoring`). Default: `false`.
*   `bp_monitoring`: (`true`|`false`) - Enable monitoring and logging of missed blocks and producer schedule changes. Default: `false`.
*   `ipc_debug_rate`: (integer) - Interval (in milliseconds) for logging inter-process communication statistics. `0` disables it. Default: `60000`.
*   `allow_custom_abi`: (`true`|`false`) - Allow loading ABIs from local files (`src/indexer/custom-abi/<chain>/<contract>-<start>-<end>.json`) which override on-chain ABIs for specific block ranges. Default: `false`.
*   `rate_monitoring`: (`true`|`false`) - Enable internal performance rate monitoring logs. Default: `true`.
*   `max_ws_payload_mb`: (integer) - Maximum allowed WebSocket message size (in MB) when connecting to SHIP. Default: `256`.
*   `ds_profiling`: (`true`|`false`) - Enable detailed profiling of the deserialization process (writes to `ds_profiling.csv`). Default: `false`.
*   `auto_mode_switch`: (`true`|`false`) - Allow the indexer master process to automatically switch `abi_scan_mode` off after its initial run. Default: `false`.
*   `hot_warm_policy`: (`true`|`false`) - Enable basic Elasticsearch hot/warm index lifecycle management routing (requires corresponding ILM policy setup in Elasticsearch). Default: `false`.
*   `custom_policy`: (string) - Name of a custom Elasticsearch Index Lifecycle Management (ILM) policy to apply to indices. Requires setup in Elasticsearch. Default: `""`.
*   `use_global_agent`: (`true`|`false`) - Use `global-agent` for proxy support in outgoing HTTP/HTTPS requests (e.g., to Nodeos). Requires `global-agent` configuration via environment variables. Default: `false`.
*   `index_partition_size`: (integer) - The block number range size used for partitioning time-series indices (actions, deltas). E.g., `10000000` creates indices like `chain-action-v1-000001`, `chain-action-v1-000002`. Affects index management and query performance. Default: `10000000`.
*   `es_replicas`: (integer) - Number of replicas to configure for Elasticsearch indices created by Hyperion. `0` means no replicas. Default: `0`.


##  Blacklists & Whitelists - Filtering

Define rules to include or exclude specific actions or deltas from being indexed.

**Format:** Rules use the format `"chain::contract::action"` or `"chain::contract::*"`. For deltas, use `"chain::contract::table"`. The `chain` part **must match** `settings.chain`.

*   **`blacklists`**:
    *   `actions`: (array) - List of action patterns to **exclude**.
    *    `deltas`: (array) - List of delta patterns to **exclude**.
*   **`whitelists`**:
    *   `actions`: (array) - List of action patterns to **include**. If non-empty, *only* matching actions are indexed.
    *   `deltas`: (array) - List of delta patterns to **include**. If non-empty, *only* matching deltas are indexed.
    *   `max_depth`: (integer) - Maximum inline action depth to check against whitelists. Default: `10`.
    *   `root_only`: (`true`|`false`) - If `true`, only check root-level actions against the whitelist. If `false`, check inline actions as well. Default: `false`.

!!! note "Default Blacklists"
    Hyperion automatically blacklists `eosio.null::*` actions.


## Scaling - Performance & Resource Tuning

Parameters controlling the number of worker processes and queue behavior, critical for tuning performance and resource usage.

*   `readers`: (integer) - Number of parallel SHIP reader processes to fetch block ranges. Default: `1`.
*   `ds_queues`: (integer) - Number of separate RabbitMQ queues for deserialization tasks. Default: `1`.
*   `ds_threads`: (integer) - Number of deserializer worker processes *per* deserializer queue. Default: `1`.
*   `ds_pool_size`: (integer) - Number of blocks buffered in memory by each deserializer thread before processing. Higher values increase RAM usage but can smooth out processing bursts. Default: `1`.
*   `indexing_queues`: (integer) - Number of separate RabbitMQ queues for the final indexing stage (writing to ES/Mongo). Default: `1`.
*   `ad_idx_queues`: (integer) - Number of indexer worker processes *per* action/delta indexing queue. Default: `1`.
*   `dyn_idx_queues`: (integer) - Number of indexer worker processes *per* dynamic state table indexing queue. Default: `1`.
*   `max_autoscale`: (integer) - Maximum number of *additional* reader processes the master can spawn if queues back up. Default: `4`.
*   `batch_size`: (integer) - Number of blocks requested in a single range by a reader process during catch-up. Default: `5000`.
*   `resume_trigger`: (integer) - Queue size threshold below which a paused component (like readers) will resume. Default: `5000`.
*   `auto_scale_trigger`: (integer) - Queue size threshold that triggers the master to potentially spawn additional reader processes (up to `max_autoscale`). Default: `20000`.
*   `block_queue_limit`: (integer) - Maximum number of blocks allowed in the reader-to-deserializer queues before readers pause. Default: `10000`.
*   `max_queue_limit`: (integer) - Global maximum size for *any* single processing queue before components feeding it might pause. Default: `100000`.
*   `routing_mode`: (`"round_robin"`|`"heatmap"`) - Algorithm for distributing blocks from readers to deserializer queues. `"round_robin"` distributes evenly. `"heatmap"` attempts to send blocks with similar action patterns to the same queue (can improve deserialization caching but might lead to uneven load). Default: `"round_robin"`.
*   `polling_interval`: (integer) - Interval (in milliseconds) at which the master process checks queue sizes for scaling decisions. Default: `10000`.


## Features Flags

`features`: 

#### Streaming

*   **`streaming`**:
    *   `enable`: (`true`|`false`) - Enable the WebSocket live streaming API. Default: `false`.
    *   `traces`: (`true`|`false`) - Stream action traces. Default: `false`.
    *   `deltas`: (`true`|`false`) - Stream state deltas. Default: `false`.

#### Tables

*   **`tables`**: Enable indexing of specific system table states into MongoDB. **Requires MongoDB.**
    *   `proposals`: (`true`|`false`) - Index `eosio.msig` proposals state. Default: `true`.
    *   `accounts`: (`true`|`false`) - Index token balances state (`accounts` table in token contracts). Default: `true`.
    *   `voters`: (`true`|`false`) - Index `eosio` voters table state. Default: `true`.
*
#### Contract State

  *   **`contract_state`**: Enable indexing of arbitrary contract table states into MongoDB. **Requires MongoDB.**
      *   `enabled`: (`true`|`false`) - Master switch for this feature. Default: `false`.
      *   `contracts`: (object) - Defines which contracts and tables to index state for. Managed via `./hyp-config contracts ...`.
      
        ```json
        "contracts": {
          "eosio.token": { // Contract account name
            "accounts": { // Table name
              "auto_index": true, // Auto-create basic Mongo indexes?
              "indices": { // Custom Mongo indexes
                "balance": -1 // Field name: direction (1=asc, -1=desc)
              }
            },
            "stat": { /* ... more tables ... */ }
          },
          "another.contract": { /* ... more contracts ... */ }
        }
        ```
      
*   `index_deltas`: (`true`|`false`) - Index state deltas to Elasticsearch (for `/v2/history/get_deltas`). Default: `true`.
*   `index_transfer_memo`: (`true`|`false`) - Include the `memo` field within the `@transfer` data of indexed actions. Increases index size. Default: `true`.
*   `index_all_deltas`: (`true`|`false`) - Index *all* state deltas, regardless of whitelists/blacklists (if `index_deltas` is true). Default: `true`.
*   `deferred_trx`: (`true`|`false`) - Index information about deferred transactions. Default: `false`.
*   `failed_trx`: (`true`|`false`) - Index information about failed transactions. Default: `false`.
*   `resource_limits`: (`true`|`false`) - Index account resource limits state (`userres` table). Default: `false`.
*   `resource_usage`: (`true`|`false`) - Index account resource usage state (`userres` table). Default: `false`.


##  Prefetch - Internal Buffer Sizes

Configure internal buffer sizes between processing stages. Defaults are usually sufficient.

`prefetch:`

*   `read`: (integer) - Max blocks buffered by reader before sending to deserializer queue. Default: `50`.
*   `block`: (integer) - Max blocks buffered by deserializer before sending to indexer queue. Default: `100`.
*   `index`: (integer) - Max items buffered by indexer worker before writing to ES/Mongo. Default: `500`.

## Hub - QRY Hub Integration (Optional)

Settings for connecting this Hyperion instance to the [QRY Hub](https://hub.qry.network/){:target="_blank"}.

`hub:`

*   `enabled`: (`true`|`false`) - Enable connection to the QRY Hub. Default: `false`.
*   `instance_key`: (string) - Your unique instance private key obtained from QRY provider registration. **Required if enabled.**
*   `custom_indexer_controller`: (string) - Override the default address (`localhost:<control_port>`) the API server uses to connect to the indexer's control port for status updates needed by the Hub.

## Plugin Configuration

Enable and configure specific settings for installed plugins managed by `hpm`. The structure depends on the plugin itself.

```json
"plugins": {
  "my-plugin-alias": { // Alias used during `hpm install`
    "enabled": true,
    "some_plugin_setting": "value"
  }
}
```

## Alerts - Chain-Specific Alert Triggers

Define *when* specific alert events trigger and *which* providers (configured in `connections.json` or here) should receive them for *this chain*.

`alerts:`

*   **`triggers`**: Object containing trigger definitions 
    * (e.g., `onApiStart`, `onIndexerError`).
        *   `"enabled"`: (`true`|`false`) - Enable this specific trigger.
        *   `"cooldown"`: (integer) - Minimum seconds between alerts of this type.
        *   `"emitOn"`: (array) - List of provider names (e.g., `["telegram", "http"]`) to send this alert to.
*   **`providers`**: Can optionally define provider connection details *here* instead of `connections.json` if they are specific to this chain. See the [Connections Reference](connections.md#providers-alerts) for provider structure.


## Full Reference Example

!!! tip 
    For multiple chains, you should have one config file for each chain.

For a complete example showing all default values, refer to the reference file [`references/config.ref.json`](https://github.com/eosrio/hyperion-history-api/blob/release/3.6/references/config.ref.json){:target="_blank"}


````json
{
  "api": {
    "enabled": true,
    "pm2_scaling": 1,
    "chain_name": "EXAMPLE Chain",
    "server_addr": "127.0.0.1",
    "server_port": 7000,
    "stream_port": 1234,
    "stream_scroll_limit": -1,
    "stream_scroll_batch": 500,
    "server_name": "127.0.0.1:7000",
    "provider_name": "Example Provider",
    "provider_url": "https://example.com",
    "chain_api": "",
    "push_api": "",
    "chain_logo_url": "",
    "explorer": {
      "home_redirect": false,
      "upstream": "",
      "theme": ""
    },
    "enable_caching": true,
    "cache_life": 1,
    "limits": {
      "get_actions": 1000,
      "get_voters": 100,
      "get_links": 1000,
      "get_deltas": 1000,
      "get_trx_actions": 200
    },
    "access_log": false,
    "chain_api_error_log": false,
    "log_errors": false,
    "custom_core_token": "",
    "enable_export_action": false,
    "disable_rate_limit": false,
    "rate_limit_rpm": 1000,
    "rate_limit_allow": [],
    "disable_tx_cache": false,
    "tx_cache_expiration_sec": 3600,
    "v1_chain_cache": [
      {
        "path": "get_block",
        "ttl": 3000
      },
      {
        "path": "get_info",
        "ttl": 500
      }
    ],
    "node_max_old_space_size": 1024,
    "node_trace_deprecation": false,
    "node_trace_warnings": false
  },
  "indexer": {
    "enabled": true,
    "start_on": 0,
    "stop_on": 0,
    "rewrite": false,
    "purge_queues": false,
    "live_reader": false,
    "live_only_mode": false,
    "abi_scan_mode": true,
    "fetch_block": true,
    "fetch_traces": true,
    "disable_reading": false,
    "disable_indexing": false,
    "process_deltas": true,
    "disable_delta_rm": true,
    "node_max_old_space_size": 4096,
    "node_trace_deprecation": false,
    "node_trace_warnings": false
  },
  "settings": {
    "preview": false,
    "chain": "eos",
    "eosio_alias": "eosio",
    "parser": "3.2",
    "auto_stop": 0,
    "index_version": "v1",
    "debug": false,
    "bp_logs": false,
    "bp_monitoring": false,
    "ipc_debug_rate": 60000,
    "allow_custom_abi": false,
    "rate_monitoring": true,
    "max_ws_payload_mb": 256,
    "ds_profiling": false,
    "auto_mode_switch": false,
    "hot_warm_policy": false,
    "custom_policy": "",
    "use_global_agent": false,
    "index_partition_size": 10000000,
    "es_replicas": 0
  },
  "blacklists": {
    "actions": [],
    "deltas": []
  },
  "whitelists": {
    "actions": [],
    "deltas": [],
    "max_depth": 10,
    "root_only": false
  },
  "scaling": {
    "readers": 1,
    "ds_queues": 1,
    "ds_threads": 1,
    "ds_pool_size": 1,
    "indexing_queues": 1,
    "ad_idx_queues": 1,
    "dyn_idx_queues": 1,
    "max_autoscale": 4,
    "batch_size": 5000,
    "resume_trigger": 5000,
    "auto_scale_trigger": 20000,
    "block_queue_limit": 10000,
    "max_queue_limit": 100000,
    "routing_mode": "round_robin",
    "polling_interval": 10000
  },
  "features": {
    "streaming": {
      "enable": false,
      "traces": false,
      "deltas": false
    },
    "tables": {
      "proposals": true,
      "accounts": true,
      "voters": true
    },
    "contract_state": {},
    "index_deltas": true,
    "index_transfer_memo": true,
    "index_all_deltas": true,
    "deferred_trx": false,
    "failed_trx": false,
    "resource_limits": false,
    "resource_usage": false
  },
  "prefetch": {
    "read": 50,
    "block": 100,
    "index": 500
  },
  "hub": {
    "enabled": false,
    "instance_key": "",
    "custom_indexer_controller": ""
  },
  "plugins": {},
  "alerts": {
    "triggers": {
      "onApiStart": {
        "enabled": true,
        "cooldown": 30,
        "emitOn": ["http"]
      },
      "onIndexerError": {
        "enabled": true,
        "cooldown": 30,
        "emitOn": ["telegram", "email", "http"]
      }
    },
    "providers": {
      "telegram": {
        "enabled": false,
        "botToken": "",
        "destinationIds": [1]
      },
      "http": {
        "enabled": false,
        "server": "http://localhost:6200",
        "path": "/notification",
        "useAuth": false,
        "user": "",
        "pass": ""
      },
      "email": {
        "enabled": false,
        "sourceEmail": "sender@example.com",
        "destinationEmails": ["receiverA@example.com","receiverB@example.com"],
        "smtp": "smtp-relay.gmail.com (UPDATE THIS)",
        "port": 465,
        "tls": true,
        "user": "",
        "pass": ""
      }
    }
  }
}
````

[:fontawesome-solid-arrow-left-long: Hyperion Configuration](hyperion_configuration.md#21-add-a-new-chain-configuration){ .md-button }
[Connect to QRY Hub :fontawesome-solid-arrow-right-long:](qry_connection.md){ .md-button }
