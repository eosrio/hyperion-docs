## Detailed description of the chains/example.config.json

This section is a quick guide of config.json file. Here you gonna find a brief explanation of each parameter
with its default value and an example of real usage.

### API Configuration

  - `"chain_name": "EXAMPLE Chain"`
  - `"server_addr": "127.0.0.1"`
  - `"server_port": 7000`
  - `"server_name": "127.0.0.1:7000"`
  - `"provider_name": "Example Provider"`
  - `"provider_url": "https://example.com"`
  - `"chain_logo_url": ""`
  - `"enable_caching": true` --> Set API cache
  - `"cache_life": 1` --> Define the cache life
  - `"limits"` --> Setting API response limits
    - `"get_actions": 1000`
    - `"get_voters": 100`
    - `"get_links": 1000`
    - `"get_deltas": 1000`
  - `"access_log": false` --> Enable log API access.
  - `"enable_explorer": false`
    
### Settings

   - `"preview": false` -> Preview mode - prints worker map and exit
   - `"chain": "eos"` --> Chain named (The same used on ecosystem.config.js)
   - `"eosio_alias": "eosio"`
   - `"parser": "1.8"` --> Version of the parser to be used
   - `"auto_stop": 300` --> Automatically stop Indexer after X seconds if no more blocks are being processed (0=disable)
   - `"index_version": "v1"` --> Set the index version
   - `"debug": false` --> Enable debug mode
   - `"rate_monitoring": true` --> Print data rates for each phase every 5s
   - `"bp_logs": false` --> Enable logs
   - `"bp_monitoring": false` --> Allow monitoring and logging of missed blocks and rounds
   - `"ipc_debug_rate": 60000` --> interval between IPC messaging rate debug messages, setting it to false or 0 will disable the logging
   - `"allow_custom_abi": false` --> allow using custom ABIs from the custom-abi/<CHAIN_NAME> folder, they must match the pattern <contract>-<start_block>-<end_block>.json. 
   Those ABIs will overwrite on-chain data for the given range.


### Blacklists
 Blacklist for actions and deltas
 
   - "actions": [],
   - "deltas": []

### Whitelists
 Whitelist for actions and deltas
 
   - actions": []
   - "deltas": []
 
### Scalling options

   - `"batch_size": 10000` --> Parallel reader batch size in blocks
   - `"queue_limit": 50000` --> Queue size limit on rabbitmq
   - `"readers": 1` --> Number of readers
   - `"ds_queues": 1` --> Number of deserializer queues
   - `"ds_threads": 1` --> Number of deserializer threads
   - `"ds_pool_size": 1` --> Deserializer pool size
   - `"indexing_queues": 1` --> Number of indexing queues
   - `"ad_idx_queues": 1` --> Multiplier for action indexing queues
   - `"max_autoscale": 4` --> Max number of readers to autoscale
   - `"auto_scale_trigger": 20000` --> Number of itens on queue to trigger autoscale

### Indexer configuration

   - `"start_on": 0` --> Start indexing on block (0=disable)
   - `"stop_on": 0` --> Stop indexing on block  (0=disable)
   - `"rewrite": false` -->Force rewrite the target replay range
   - `"purge_queues": true` --> Clear rabbitmq queues before starting the indexer
   - `"live_reader": false` --> Enable live reader
   - `"live_only_mode": false` --> Only reads realtime data serially
   - `"abi_scan_mode": true` --> Enable abi scan mode (<b>Indicated on the first run</b>)
   - `"fetch_block": true` --> Request full blocks from the state history plugin
   - `"fetch_traces": true` --> Request traces from the state history plugin
   - `"disable_reading": false` --> Completely disable block reading, for lagged queue processing
   - `"disable_indexing": false` --> Disable indexing
   - `"process_deltas": true` --> Read table deltas
   - `"max_inline": 20` --> Max inline actions depth to index

### Features

   - `"index_deltas": true` --> Index common table deltas (see delta on definitions/mappings)
   - `"index_transfer_memo": true` --> Index transfers memo
   - `"index_all_deltas": true` --> Index all table deltas
   
#### 1 - Streaming
Enable live streaming

   - `"enable": false`
   - `"traces": false`
   - `"deltas": false`

#### 2 - Tables
Tables to fetch

   - `"proposals": true`
   - `"accounts": true`
   - `"voters": true`
   - `"userres": false`
   - `"delband": false`
 
### Prefetch

   - `"read": 50` --> Stage 1 prefecth size
   - `"block": 100` --> Stage 2 prefecth size
   - `"index": 500` --> Stage 3 prefecth size

## Example

Let's suppose that we gonna start Indexing the EOS Mainnet with:

 - Locally exposed API
 - 2 Readers
 - 2 Deserializer Queues
 - Live Streaming Enabled with Traces
 - ABI scan already done
 
The first step is to make a copy of the config file and rename it: `chains/example.config.json` to `chains/eos.config.json`.
The next step is to edit the file as the following:

````json
{
  "api": {
    "chain_name": "eos",
    "server_addr": "127.0.0.1",
    "server_port": 7000,
    "server_name": "127.0.0.1:7000",
    "provider_name": "Example Provider",
    "provider_url": "https://example.com",
    "chain_logo_url": "",
    "enable_caching": true,
    "cache_life": 1,
    "limits": {
      "get_actions": 1000,
      "get_voters": 100,
      "get_links": 1000,
      "get_deltas": 1000
    },
    "access_log": false,
    "enable_explorer": false
  },
  "settings": {
    "preview": false,
    "chain": "eos",
    "eosio_alias": "eosio",
    "parser": "1.8",
    "auto_stop": 300,
    "index_version": "v1",
    "debug": false,
    "rate_monitoring": true,
    "bp_logs": false,
    "bp_monitoring": false,
    "ipc_debug_rate": 60000,
    "allow_custom_abi": false
  },
  "blacklists": {
    "actions": [],
    "deltas": []
  },
  "whitelists": {
    "actions": [],
    "deltas": []
  },
  "scaling": {
    "batch_size": 10000,
    "queue_limit": 50000,
    "readers": 2,
    "ds_queues": 2,
    "ds_threads": 1,
    "ds_pool_size": 1,
    "indexing_queues": 1,
    "ad_idx_queues": 1,
    "max_autoscale": 4,
    "auto_scale_trigger": 20000
  },
  "indexer": {
    "start_on": 1,
    "stop_on": 0,
    "rewrite": false,
    "purge_queues": true,
    "live_reader": false,
    "live_only_mode": false,
    "abi_scan_mode": false,
    "fetch_block": true,
    "fetch_traces": true,
    "disable_reading": false,
    "disable_indexing": false,
    "process_deltas": true,
    "max_inline": 20
  },
  "features": {
    "streaming": {
      "enable": true,
      "traces": true,
      "deltas": false
    },
    "tables": {
      "proposals": true,
      "accounts": true,
      "voters": true,
      "userres": false,
      "delband": false
    },
    "index_deltas": true,
    "index_transfer_memo": true,
    "index_all_deltas": true
  },
  "prefetch": {
    "read": 50,
    "block": 100,
    "index": 500
  }
}
````

!!! tip
    For multiple chains, you should have one config file for each chain.