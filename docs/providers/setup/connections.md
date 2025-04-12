[:fontawesome-solid-arrow-left-long: Hyperion Configuration](hyperion_configuration.md#initialize-connections)
# Connections Configuration Reference `config/connections.json`

The `config/connections.json` file is the central place where Hyperion defines how to connect to its essential infrastructure components (RabbitMQ, Elasticsearch, Redis, MongoDB) and the specific Antelope blockchain nodes it needs to interact with.

!!! tip "Management"
    While you can edit this file manually, it's highly recommended to use the `./hyp-config connections init` command for initial setup and `./hyp-config connections test` to verify connectivity. Chain-specific entries under the `chains` key are typically added automatically when using `./hyp-config chains new <short-name> ...`.

!!! info
    <u>Failover option: </u> Now you can add an array of strings or array of objects to configure failover on Hyperion. Check `Chain Parameters` below on "ship" paramert to configure. 

This file contains several top-level objects:

### RabbitMQ parameters

Configures the connection to your RabbitMQ server, which acts as the message queue backbone for the Hyperion indexer pipeline.

`amqp:`

*   `"host"`: **Required**. Address and AMQP port of the RabbitMQ server (e.g., `"127.0.0.1:5672"`).
*   `"api"`: **Required**. Address and port for the RabbitMQ Management HTTP API (e.g., `"127.0.0.1:15672"`). Used for queue management and monitoring.
*   `"protocol"`: Protocol for the RabbitMQ Management API (`"http"` or `"https"`). Defaults to `"http"`.
*   `"user"`: **Required**. Username for RabbitMQ authentication.
*   `"pass"`: **Required**. Password for RabbitMQ authentication.
*   `"vhost"`: **Required**. The virtual host within RabbitMQ that Hyperion should use (e.g., `"hyperion"`). This isolates Hyperion's queues. Needs to be created in RabbitMQ beforehand (e.g., via `sudo rabbitmqctl add_vhost hyperion`).
*   `"frameMax"`: Optional. Maximum frame size for AMQP connection (e.g., `"0x10000"`). Adjust if needed for large messages, but the default is usually sufficient.


### Elasticsearch parameters

Configures the connection to your Elasticsearch cluster, where historical action, delta, and block data are stored.

`elasticsearch:`

*   `"protocol"`: **Required**. Protocol used to connect (`"http"` or `"https"`).
*   `"host"`: **Required**. Address and port of at least one Elasticsearch node (e.g., `"127.0.0.1:9200"`). The client will discover other nodes.
*   `"ingest_nodes"`: **Required**. An array of Elasticsearch node addresses (host:port) specifically designated for data ingestion. Can be the same as `"host"` if you have a single node or all nodes handle ingestion (e.g., `["127.0.0.1:9200"]`). Hyperion distributes indexing load across these nodes.
*   `"user"`: Elasticsearch username if security is enabled (e.g., `"elastic"`). Leave empty (`""`) if security is disabled.
*   `"pass"`: Elasticsearch password if security is enabled. Leave empty (`""`) if security is disabled.

### Redis parameters

Configures the connection to your Redis server, used for caching, transaction lookups, and inter-process communication.

`redis:`

*   `"host"`: **Required**. Address of the Redis server (e.g., `"127.0.0.1"`).
*   `"port"`: **Required**. Port number for the Redis server (e.g., `6379`).


## MongoDB parameters

!!! attention "Conditional Requirement"
    MongoDB connection details are **only required** if you enable state-tracking features (`features.tables.*` or `features.contract_state.enabled`) in a specific chain's configuration file (`config/chains/<chain>.config.json`). If these features are disabled for all chains, this section can be omitted or left blank, but the top-level `mongodb` key might still be expected by some tools like `hyp-config`.

Configures the connection to your MongoDB server, used for storing the *current state* of specific on-chain data.


`mongodb:`

* `"enabled"`: **Required (if using state features)**. Enable MongoDB features for state-tracking features (e.g., `"true"` or `"false"`).
*   `"host"`: **Required (if using state features)**. Address of the MongoDB server (e.g., `"127.0.0.1"`).
*   `"port"`: **Required (if using state features)**. Port number for the MongoDB server (e.g., `27017`).
*   `"database_prefix"`: **Required (if using state features)**. Prefix for database names created by Hyperion. The final database name will be `<database_prefix>_<chain_alias>` (e.g., `"hyperion_wax"`). Defaults to `"hyperion"`.
*   `"user"`: MongoDB username if authentication is enabled. Leave empty (`""`) otherwise.
*   `"pass"`: MongoDB password if authentication is enabled. Leave empty (`""`) otherwise.

## Chain Parameters

This object contains connection details specific to each blockchain that Hyperion will index. The *key* for each entry **must** match the `settings.chain` alias defined in the corresponding `config/chains/<key>.config.json` file.

```json
{
    "chains": {
      "<chain_alias>": { ... chain details ... },
      "<another_chain_alias>": { ... chain details ... }
    }
}
```

*   **`<chain_alias>` Object:**
    *   `"name"`: **Required**. A descriptive name for the chain (e.g., `"WAX Mainnet"`).
    *   `"chain_id"`: **Required**. The unique Chain ID hash. This is automatically populated by `hyp-config chains new` and verified during startup and testing.
    *   `"http"`: **Required**. The URL for the chain's Nodeos HTTP API endpoint (e.g., `"http://127.0.0.1:8888"`). Used for fetching ABIs, chain info, etc.
    *    `"ship"`: **Required**. The WebSocket endpoint(s) for the Nodeos State History Plugin (SHIP). This is where the indexer gets its primary block data feed.
        *   **Simple Format (Single Endpoint):** A single WebSocket URL string. No automatic failover.
      
          ```json
          "ship": "ws://127.0.0.1:8080"
          ```
      
        *   **Failover Format (Multiple Endpoints):** An array of objects, each with a `label` (optional description) and a `url` (the WebSocket URL). Hyperion will attempt to connect to them sequentially if the primary connection fails.
    
          ```json
          "ship": [
            {"label": "primary-ship", "url": "ws://ship-primary.example.com:8080"},
            {"label": "backup-ship", "url": "ws://ship-backup.example.com:8080"}
          ]
          ```
        
        *  Alternatively, a **simple array of strings** can be used, but labels are lost:
    
          ```json
          "ship": ["ws://ship-primary.example.com:8080", "ws://ship-backup.example.com:8080"]
          ```
        
    *   `"WS_ROUTER_HOST"`: **Required**. The hostname or IP address the *API server* should use to connect to the Hyperion Indexer's internal WebSocket router (ws-router worker). Defaults to `"127.0.0.1"`. **Important:** If your API and Indexer run on different machines, set this to the Indexer machine's reachable IP/hostname.
    *   `"WS_ROUTER_PORT"`: **Required**. The TCP port the API server should use to connect to the Indexer's internal WebSocket router. Defaults to `7001` for the first chain added via `hyp-config`, increments thereafter.
    *   `"control_port"`: **Required**. The TCP port the Hyperion Indexer listens on for control commands (used by `./hyp-control` tool). Defaults to `7002` for the first chain, increments thereafter.


## Alert parameters

This section configures providers (Telegram, Email, HTTP) for sending system alerts (e.g., API start, Indexer errors).

!!! note
    The trigger conditions for these alerts are usually defined within the specific chain's configuration file (`config/chains/<chain>.config.json`) under its own `alerts` section. Ensure consistency if configuring providers in both locations. It's generally recommended to define providers here in `connections.json` if they are shared across multiple chains, or in the chain-specific config if they are unique to that chain.

`alerts:`

*   **`triggers`**: (Usually defined in chain config, shown here for completeness based on reference) Defines *when* alerts fire 
    * (e.g., `onApiStart`, `onIndexerError`).
        *   `"enabled"`: `true` or `false`.
          *   `"cooldown"`: number, minimum seconds between alerts of the same type.
          *   `"emitOn"`: Array of provider names (e.g., `["telegram", "http"]`) to send this trigger to.
<span id="providers-alerts"></span>
  * **`providers`**: Defines *how* alerts are sent.
      *   **`telegram`**:
          *   `"enabled"`: `true` or `false`.
          *   `"botToken"`: Your Telegram Bot Token.
          *   `"destinationIds"`: Array of numeric Telegram Chat IDs to send alerts to.
      *   **`http`**:
          *   `"enabled"`: `true` or `false`.
          *   `"server"`: URL of the receiving HTTP endpoint (e.g., `"http://my-alert-server.com"`).
          *   `"path"`: Path on the server (e.g., `"/notification"`).
          *   `"useAuth"`: `true` if basic authentication is required.
          *   `"user"`: Username for basic auth.
          *   `"pass"`: Password for basic auth.
      *   **`email`**:
          *   `"enabled"`: `true` or `false`.
          *   `"sourceEmail"`: Email address to send from.
          *   `"destinationEmails"`: Array of recipient email addresses.
          *   `"smtp"`: SMTP server hostname (e.g., `"smtp.example.com"`).
          *   `"port"`: SMTP server port (e.g., `465` or `587`).
          *   `"tls"`: `true` for implicit TLS (usually port 465), `false` otherwise (STARTTLS might be used on port 587 depending on server).
          *   `"user"`: SMTP username for authentication.
          *   `"pass"`: SMTP password for authentication.

## Full Reference Example (`references/connections.ref.json`)

See [references/connections.ref.json on Github](https://github.com/eosrio/hyperion-history-api/blob/release/3.6/references/connections.ref.json){:target="_blank"}

````json
{
  "amqp": {
    "host": "127.0.0.1:5672",
    "api": "127.0.0.1:15672",
    "protocol": "http",
    "user": "username",
    "pass": "password",
    "vhost": "hyperion",
    "frameMax": "0x10000"
  },
  "elasticsearch": {
    "protocol": "http",
    "host": "127.0.0.1:9200",
    "ingest_nodes": [
      "127.0.0.1:9200"
    ],
    "user": "elastic",
    "pass": "password"
  },
  "redis": {
    "host": "127.0.0.1",
    "port": 6379
   },
  
   "mongodb": {
    "enabled": false,
    "host": "127.0.0.1",
    "port": 27017,
    "database_prefix": "hyperion",
    "user": "",
    "pass": ""
  },
  "chains": {
    "eos": {
      "name": "",
      "chain_id": "",
      "http": "http://127.0.0.1:8888",
      "ship": [
        {"label": "primary", "url": "ws://127.0.0.1:8080"}
      ],
      "WS_ROUTER_HOST": "127.0.0.1",
      "WS_ROUTER_PORT": 7001,
      "control_port": 7002
    }
  },
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
        "server": "",
        "path": "",
        "useAuth": false,
        "user": "",
        "pass": ""
      },
      "email": {
        "enabled": false,
        "sourceEmail": "",
        "destinationEmails": [],
        "smtp": "",
        "port": 465,
        "tls": true,
        "user": "",
        "pass": ""
      }
    }
  }
}
````

[:fontawesome-solid-arrow-left-long: Hyperion Configuration](hyperion_configuration.md#initialize-connections){ .md-button }
[Chain Config Reference :fontawesome-solid-arrow-right-long:](chain.md){ .md-button }
