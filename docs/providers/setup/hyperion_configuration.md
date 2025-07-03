# Hyperion Configuration

This guide walks you through configuring Hyperion after you have successfully installed the necessary [dependencies](../install/manual_install.md) and cloned/built the [Hyperion codebase](https://github.com/eosrio/hyperion-history-api).

We will primarily use the `hyp-config` command-line tool provided with Hyperion. This tool helps initialize connection settings, manage configurations for different blockchain chains, and set up contract state indexing.

!!! tip "CLI Tool"
    Ensure you are in the root directory of your Hyperion installation (`hyperion-history-api/`) when running `./hyp-config` commands. Run `./hyp-config --help` for a full list of commands and options.

!!! warning "New failover option"
    Check [Connections Reference](connections.md) to add the new <u>failover</u> option.

## Step 1: Configure Infrastructure Connections

Hyperion needs to know how to connect to shared infrastructure components like Elasticsearch, RabbitMQ, Redis, and optionally MongoDB.

### 1.1 Initialize `connections.json`

Run the `init` command. It will prompt you for connection details and test connectivity to each service. If `config/connections.json` already exists, it will ask for confirmation before overwriting.

```bash
# Navigate to your Hyperion installation directory first
cd ~/hyperion-history-api # Or your specific path

./hyp-config connections init
```

Follow the interactive prompts to enter details for RabbitMQ, Elasticsearch, Redis, and MongoDB (if you plan to use state features).

The initialization command will create a `connections.json` file that follows the template in the [Connections Reference Guide](connections.md).

!!! note "MongoDB setup"
    If you skip MongoDB setup here but later enable state features, you will need to manually edit `config/connections.json` to add the MongoDB connection details.

### 1.2 Test Connections

After initialization or manual editing, verify that Hyperion can connect to all configured services:

```bash
./hyp-config connections test
```

Address any connection errors reported by this command before proceeding.

### 1.3 (Optional) Reset Connections

If you need to start over with connection settings, you can reset the file (a backup will be created):

```bash
./hyp-config connections reset
```

!!! info "Connections Reference"
    For detailed information on the structure and parameters within `config/connections.json`, see the [Connections Reference Guide](connections.md).

## Step 2: Add and Configure Chains

Each blockchain you want Hyperion to index requires its own configuration file located in `config/chains/`.

### 2.1 Add a New Chain Configuration

Use the `chains new` command, providing a short alias for your chain (e.g., `wax`, `eos`, `jungle4`) and the required HTTP API and SHIP WebSocket endpoints for its node.

```bash
./hyp-config chains new <short-name> --http <node-http-url> --ship <node-ship-url>

# Example for WAX Mainnet:
./hyp-config chains new eos --http "http://127.0.0.1:8888" --ship "ws://127.0.0.1:8080"
```

This command performs several actions:

1. Tests connectivity to the provided HTTP and SHIP endpoints.
2. Determines the Chain ID and default parser version.
3. Creates the chain configuration file: `config/chains/<short-name>.config.json` based on a template.
4. Adds the chain's connection details (HTTP, SHIP, Chain ID, default ports) to `config/connections.json`.

### 2.2 Customize Chain Configuration

!!! tip "Tailor Hyperion for your specific needs"
    The newly created `config/chains/<short-name>.config.json` file contains default settings. **You MUST review and edit this file** if you need to tailor Hyperion's behavior for your specific needs.

Key sections to review and potentially modify:

- **`api`**: Server address/port, provider info, caching, rate limits, logos.
- **`indexer`**: `start_on`/`stop_on` blocks, `rewrite`, `live_reader`, filtering options.
- **`settings`**: Parser version, debug flags, index partitioning.
- **`scaling`**: Number of reader/indexer workers, queue sizes, batch sizes (critical for performance).
- **`features`**: Enable/disable functionalities like state table indexing (`tables`, `contract_state`), streaming, specific data indexing (`index_transfer_memo`).
- **`blacklists/whitelists`**: Define specific contracts/actions/tables to include or exclude.

!!! info "Chain Config Reference"
    Consult the [Chain Config Reference](chain.md) for a detailed explanation of all available parameters.

### 2.3 Verify Chain Configurations

After adding chains and editing their configurations, list them to ensure they are recognized:

```bash
./hyp-config chains list
```

Test the specific endpoints configured for a chain:

```bash
./hyp-config chains test <short-name>

# Example:
./hyp-config chains test wax
```

### 2.4 (Optional) Remove a Chain

To remove a chain's configuration file and its entry in connections.json (backups are created):

```bash
./hyp-config chains remove <short-name>
```

## Step 3: Configure State Indexing (Optional)

Hyperion can index the *current state* of specific contract tables into MongoDB, enabling fast queries via the `/v2/state/` API endpoints (especially `get_table_rows`). This is optional and complements the historical data stored in Elasticsearch.

!!! requires "Requirement: MongoDB"
    Enabling state indexing requires a correctly configured MongoDB connection in `config/connections.json` (See Step 1).

### 3.1 Enable State Features

Edit your `config/chains/<short-name>.config.json` file:

- To index system tables (balances, voters, proposals), set the relevant flags under `features.tables` to `true`.
- To index specific contract tables, set `features.contract_state.enabled` to `true`.

### 3.2 Define Contracts/Tables for State Indexing

Use the `hyp-config` contracts commands to specify which contract tables should have their state indexed in MongoDB.

- **List current configuration:**

```bash
./hyp-config contracts list <chain-name>
```

- **Add/Update a single table:** (Indices JSON defines MongoDB indexes: `1`=asc, `-1`=desc, `"text"`=text, etc.)

```bash
./hyp-config contracts add-single <chainName> <account> <table> <autoIndex> [indicesJson]

# Example: Index 'accounts' table in 'eosio.token', auto-create basic indexes
./hyp-config contracts add-single wax eosio.token accounts true

# Example: Index 'mydata' in 'mycontract', disable auto-index, add custom index on 'field1'
./hyp-config contracts add-single wax mycontract mydata false '{"field1": 1}'
```

- **Add/Update multiple tables:** (Uses a JSON array string for table definitions)

```bash
./hyp-config contracts add-multiple <chainName> <account> '<tablesJsonArray>'

# Example for eosio.token:
./hyp-config contracts add-multiple wax eosio.token '[{"name":"accounts","autoIndex":true,"indices":{"balance":-1}},{"name":"stat","autoIndex":true,"indices":{}}]'
```

!!! note
    Changes made using `hyp-config` contracts modify the `features.contract_state.contracts` section of your `config/chains/<chain>.config.json` file.

### 3.3 Synchronize State Data

- **Initial Sync:** If you enable state indexing *after* the indexer has already processed blocks containing the relevant contract data, the MongoDB state tables might be incomplete. You will need to run a manual synchronization using the `hyp-control` tool *after* starting the indexer (See Step 4).

```bash
# After indexer is running and connected via control port
./hyp-control sync contract-state <chain-name>
./hyp-control sync accounts <chain-name>  # If features.tables.accounts = true
./hyp-control sync voters <chain-name>    # If features.tables.voters = true
./hyp-control sync proposals <chain-name> # If features.tables.proposals = true
```

- **Indexing During Run:** If state features are enabled *before* the indexer starts processing the relevant blocks, it should populate the MongoDB state tables automatically as it processes the deltas.

## Step 4: Running Hyperion Services

Hyperion uses the **PM2** process manager. The primary way to manage services is via the ecosystem configuration file.

We provide scripts to simplify the process of starting and stopping your Hyperion Indexer or API instance.

### 4.1 Starting Individual Components (using convenience scripts)

You can use the provided scripts to start specific components for a single chain:

- To **run the indexer**, execute `./run.sh [chain name]-indexer`

- To **run the api**, execute `./run.sh [chain name]-api`

!!! example "Examples"
    ```bash
    # Start indexer for "wax" chain:
    ./run.sh wax-indexer

    # Start API server(s) for "wax" chain:
    ./run.sh wax-api
    ```

!!! warning
    The Hyperion Indexer is configured to perform an abi scan (`"abi_scan_mode": true`) as default. The `abi_scan_mode` is required to perform full history indexing. If you are starting from a snapshot, you can disable it and use the live reader directly (`live_reader: true`)

### 4.2 Stopping Components

Use the `stop.sh` script to stop an instance or the `pm2` trigger:

!!! example "Examples"
    ```bash
    # Stop API for "wax" chain:
    ./stop.sh wax-api

    # Stop indexer for "eos" chain (allows graceful queue flush):
    ./stop.sh eos-indexer
    # OR
    pm2 trigger eos-indexer stop
    ```

!!! warning "Indexer Stop Behavior"
    Stopping the indexer with `./stop.sh` or `pm2 trigger` sends a signal allowing it to finish processing items currently in memory and queues before shutting down fully. This can take time. Use `pm2 stop <app-name>` for an immediate (but potentially data-lossy) stop.

## Step 5: Verify Operation

### 5.1 Check Process Status

List running processes managed by PM2:

```bash
pm2 list
```

Ensure your `<chain>-indexer` and `<chain>-api` processes are online.

### 5.2 Monitor Logs

View logs for specific components:

```bash
pm2 logs <app-name>
# Example:
pm2 logs wax-indexer
pm2 logs wax-api
```

Look for healthy indexing progress messages in the indexer logs and successful API startup messages (`Hyperion API for <chain> ready...`) in the API logs.

### 5.3 Check API Health

Query the health endpoint of your running API server (default port 7000):

```bash
curl -Ss "http://127.0.0.1:7000/v2/health" | jq # Use your API server IP/port
```

Review the status of Elasticsearch, RabbitMQ, Redis, Nodeos, and SHIP connections.

### 5.4 Perform Basic Queries

Test fundamental history endpoints:

```bash
# Get latest action
curl -Ss "http://127.0.0.1:7000/v2/history/get_actions?limit=1" | jq

# Get latest delta
curl -Ss "http://127.0.0.1:7000/v2/history/get_deltas?limit=1" | jq
```

If you enabled state features, test relevant `/v2/state` endpoints (e.g., `get_tokens`, `get_voters`, `get_table_rows`).

### 5.5 Check Data Stores (Optional)

- Use Kibana (if installed) to explore Elasticsearch indices (`<chain>-action-*`, `<chain>-delta-*`, etc.).
- Use `redis-cli` or **RedisCommander** (if installed via Docker) to inspect cached data.
- Use `mongosh` to inspect MongoDB databases (`hyperion_<chain>`) and collections (`accounts`, `voters`, `proposals`, `<contract>-<table>`).

## Step 6: Configure Advanced Features (Optional)

Once the basic setup is running and verified, you can enable advanced features by editing your `config/chains/<chain>.config.json` file and restarting the relevant services (`pm2 restart <app-name>`).

### **Live Streaming**

- Enable flags under `features.streaming.`

```json
{
    "features": {
        "streaming": {
        "enable": true,
        "traces": true,
        "deltas": true
        }
    }
}
```

- By default, the stream api will be available on the port 1234, this can be configured by the `api.stream_port` property in the chain config file.
- Once you're done configuring, just restart both the indexer and api.
- A quick test using `curl 127.0.0.1:1234/stream/` should result in the output `{"code":0,"message":"Transport unknown"}` meaning the port is ready for websocket connections. Alternatively, you can check the api logs after restart for a `Websocket manager loaded!` message

- Configure your reverse proxy (like NGINX) to handle WebSocket upgrades for the `/stream/` path.

???+ abstract "NGINX"
    ```nginx
    # Example NGINX location block for streaming
    location /stream/ {
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Host $host;
        proxy_pass http://127.0.0.1:1234/stream/; # Use configured stream_port
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
    ```

- See the [Stream Client Guide](../../dev/stream_client/index.md) for usage.

### **Plugins**

- Install and manage plugins using the `./hpm` tool (Refer to `hpm --help` and future plugin documentation).
- Enable and configure installed plugins under the `plugins` section in your chain config file.

### **QRY Hub Integration**

- Enable and configure connection under the `hub` section in your chain config file.
- See the [Connect to QRY Guide](qry_connection.md).

## Next Steps

With Hyperion configured and running, you can now:

- Explore the full [API Reference](../../api/v2.md) in the Swagger UI (`/v2/docs`).
- Learn how to query the API effectively in the [Developer Guide](../../dev/howtouse.md).
- Consult the [Troubleshooting Guides](../help/kibana.md) if you encounter issues.

[API Reference :fontawesome-solid-arrow-right-long:](../../api/v2.md){ .md-button }
[Developer Guide :fontawesome-solid-arrow-right-long:](../../dev/howtouse.md){ .md-button }
[Troubleshooting Guides :fontawesome-solid-arrow-right-long:](../help/kibana.md){ .md-button }

<br>