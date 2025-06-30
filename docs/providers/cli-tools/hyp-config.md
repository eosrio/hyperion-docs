# Hyperion Configuration CLI (`hyp-config`)

The `hyp-config` command-line interface (CLI) tool is your primary utility for initializing and managing Hyperion's configuration files. It helps you set up connections to infrastructure services, add and manage configurations for different blockchain chains, and define how Hyperion should index specific contract states.

## General Usage

Commands typically follow the pattern:

`./hyp-config <command-group> <sub-command> [arguments...] [options...]`

---

## `connections` Commands

This group of commands manages the main `config/connections.json` file. This file stores the connection details for essential infrastructure services that Hyperion relies on, such as RabbitMQ, Elasticsearch, Redis, and MongoDB.

### `connections init`

Initializes or re-initializes the `config/connections.json` file. It interactively prompts you for connection details for RabbitMQ, Elasticsearch, Redis, and MongoDB. After gathering the information, it tests connectivity to each service.

*   **Purpose**: To create a valid `connections.json` file, ensuring Hyperion can communicate with its dependencies. This is often the first command you'll run when setting up a new Hyperion instance.


**Usage:**
```bash
./hyp-config connections init
```
(Follow the on-screen prompts)

or 

```bash
./hyp-config connections init [options]
```

#### Options (for non-interactive setup):

*   `--amqp-user <user>`: RabbitMQ username
*   `--amqp-pass <password>`: RabbitMQ password
*   `--amqp-vhost <vhost>`: RabbitMQ vhost
*   `--es-user <user>`: Elasticsearch username
*   `--es-pass <password>`: Elasticsearch password
*   `--es-protocol <protocol>`: Elasticsearch protocol (http/https)
*   `--redis-host <host>`: Redis server host
*   `--redis-port <port>`: Redis server port
*   `--mongo-enabled <boolean>`: Enable MongoDB integration (true/false)
*   `--mongo-host <host>`: MongoDB server host
*   `--mongo-port <port>`: MongoDB server port
*   `--mongo-user <user>`: MongoDB username
*   `--mongo-pass <password>`: MongoDB password
*   `--mongo-prefix <prefix>`: MongoDB database prefix

<br>
**Example (Non-Interactive with some options):**

```bash
./hyp-config connections init --es-user myelasticuser --es-pass mysecret --mongo-enabled true
```
*(The tool will use provided options and prompt for any missing required details).*

### `connections test`

Tests the connectivity to the infrastructure services defined in `connections.json` (Redis, Elasticsearch, RabbitMQ, MongoDB).

*   **Purpose**: To verify that Hyperion can successfully connect to all its dependencies after `connections.json` has been configured.
*   **Behavior**: Outputs the status of each connection test.

**Usage:**
```bash
./hyp-config connections test
```

### `connections reset`

Removes the existing `connections.json` file. Before deletion, a backup of the current file is created as `connections.json.bak` in the `config/configuration_backups/` directory. You will be prompted for confirmation.

*   **Purpose**: To clear the current connection settings and start fresh, for example, if you need to reconfigure everything.
*   **Behavior**: Prompts for confirmation. If confirmed, deletes the file after backing it up.

**Usage:**
```bash
./hyp-config connections reset
```

!!! warning
    If you remove an existing `connections.json` file but you already have chain files configured, those chains will now have the `pending` status. To solve this, after creating a new `connections.json` file, you can run the `chains new` command with `--use-pending` to link this chain again to the new `connections.json` file and change the chain status to configured again. Please refer to the [chains new Section](#chains-new-shortname-http-http_endpoint-ship-ship_endpoint) below for a more in-depth explanation
    ```bash
    `./hyp-config chains new <shortName> --http <http_endpoint> --ship <ship_endpoint> --use-pending` 
    ```


---

## `chains` Commands

Manage individual chain configuration files typically located in `config/chains/` (e.g., `config/chains/wax.config.json`). Each file details how Hyperion should index and serve data for a specific blockchain.

### `chains new <shortName> --http <http_endpoint> --ship <ship_endpoint>`

Creates a new chain configuration file named `<shortName>.config.json` within the `config/chains/` directory. The new file is based on Hyperion's example template (`references/config.ref.json`).

This command also needs the required connection details for this new chain (like SHIP and HTTP endpoints) and it generates the WS/control ports to `config/connections.json`. It also attempts to determine the parser version and chain ID automatically.

*   **Purpose**: To quickly set up Hyperion to index a new blockchain.
*   **Behavior**:
    1.  Tests connectivity to the provided HTTP and SHIP endpoints.
    2.  Attempts to automatically determine the Chain ID and a suitable parser version.
    3.  Creates `config/chains/<shortName>.config.json`.
    4.  Updates `config/connections.json` with the new chain's endpoint details.
    *   **Important**: After running this command, you **must** review and customize the generated `config/chains/<shortName>.config.json` to tailor Hyperion's indexing behavior (e.g., scaling, filters, features) for that specific chain.

**Usage:**
```bash
./hyp-config chains new <shortName> --http <http_endpoint> --ship <ship_endpoint>
```

**Arguments:**

*   `<shortName>`: A short, unique identifier for the chain (e.g., `wax`, `eos-testnet`).

**Options:**

*   `--http <http_endpoint>`: **_Required_**. The HTTP API endpoint for the chain's nodeos instance (e.g., `https://wax.greymass.com`).
*   `--ship <ship_endpoint>`: **_Required_**. The State History Plugin (SHIP) WebSocket endpoint (e.g., `wss://ship.wax.eosusa.io`).
*  `--use-pending`: **_Optional_**. Updates the `config/connections.json` to include the chain and updates the status of an already existing chain file to configured

### `chains list`
> **Alias:** `ls`

Lists all configured chains found in the `config/chains/` directory. It displays details for each chain, such as chain name, configured endpoints, parser version, and status (configured or pending).

**Usage:**
```bash
./hyp-config chains list [options]
```

**Options:**

*   `--valid`: Only display chains that have corresponding entries in `connections.json`.
*   `--fix-missing-fields`: Automatically add missing configuration fields with default values based on the reference configuration (`config.ref.json`).

**Example:**

```bash
./hyp-config chains list --fix-missing-fields
```

### `chains remove <shortName>`

Removes the configuration file `config/chains/<shortName>.config.json` and deletes the corresponding chain entry from `config/connections.json`. Backups of both modified files are created in the `config/configuration_backups/` directory before deletion.

*   **Purpose**: To remove a chain from Hyperion's configuration.
*   **Behavior**: Prompts for confirmation.

**Usage:**
```bash
./hyp-config chains remove <shortName>
```

**Arguments:**

*   `<shortName>`: The alias of the chain configuration to remove.

**Example:**
```bash
./hyp-config chains remove wax-testnet
```

### `chains test <shortName>`

Tests the configured HTTP and SHIP endpoints for a specific chain. It verifies:

1.  Connectivity to both endpoints.
2.  That the Chain ID reported by the HTTP endpoint matches the Chain ID from the SHIP endpoint(s).
3.  That both of these match the Chain ID stored in `config/connections.json` for this chain.
---
* **Purpose**: To ensure the configured endpoints for a chain are operational and consistent.
* **Behavior**: Outputs test results, highlighting any mismatches or connectivity issues.

**Usage:**
```bash
./hyp-config chains test <shortName>
```

**Arguments:**

*   `<shortName>`: The alias of the chain configuration to test.

**Example:**
```bash
./hyp-config chains test wax
```

### `chains validate <shortName> [options]`

Validates a chain configuration file against the Zod schema to ensure all required fields are present and have correct types. Can automatically fix missing or invalid fields using reference defaults.

*   **Purpose**: To ensure a chain's configuration file meets Hyperion's requirements and has all necessary fields.
*   **Behavior**: Validates the configuration and reports any issues. With the `--fix` option, it can automatically correct problems.

**Usage:**
```bash
./hyp-config chains validate <shortName> [options]
```

**Arguments:**

*   `<shortName>`: The alias of the chain configuration to validate.

**Options:**

*   `--fix`: Automatically fix missing or invalid fields using reference configuration and sensible defaults. Creates a backup before making changes.

**Validation Features:**

* **Schema Validation**: Validates the entire configuration structure using comprehensive Zod schemas
* **Detailed Error Reporting**: Groups validation errors by configuration path for easy debugging
* **Configuration Summary**: On successful validation, displays key configuration details
* **JSON Syntax Checking**: Catches and reports JSON parsing errors
* **Auto-Fix Capability**: Automatically adds missing fields with appropriate defaults

**Auto-Fix Behavior:**
When using the `--fix` option, the command will:

1. Create a timestamped backup in `config/configuration_backups/`
2. Apply values from the reference configuration (`config.ref.json`) where available
3. Use sensible defaults for fields not present in the reference
4. Save the fixed configuration and report all changes made

**Examples:**

```bash
# Validate configuration only (shows errors if any)
./hyp-config chains validate wax

# Validate and automatically fix missing fields
./hyp-config chains validate wax --fix
```

**Sample Output (with --fix):**

```
Validating chain config for wax...
🔧 Attempting to fix configuration issues...
📦 Backup created: config/configuration_backups/wax.config.backup.1748562368468.json
   ✓ Fixed missing field: api.provider_logo = "" (default)
   ✓ Fixed missing field: settings.ship_request_rev = "" (default)
   ✓ Fixed missing field: settings.bypass_index_map = false (default)
💾 Fixed configuration saved to config/chains/wax.config.json
🎉 Successfully fixed 3 field(s)!
✅ Chain config for wax is valid!

📋 Configuration Summary:
   Chain: wax
   API Port: 7000
   Stream Port: 1234
   Indexer Enabled: true
   API Enabled: true
   Debug Mode: false
```

---

## `contracts` Commands

This group of commands manages contract-specific state indexing configurations. These settings are stored within each chain's configuration file (e.g., `config/chains/wax.config.json` under `features.contract_state.contracts`). This feature allows Hyperion to index the current state of specified contract tables into MongoDB for fast querying via `/v2/state/get_table_rows`.

**Requirement**: MongoDB integration must be enabled and correctly configured in `config/connections.json`. The `features.contract_state.enabled` flag in the chain's config file must also be `true`.

### `contracts list <chainName>`

Displays the current contract state indexing configuration for the specified chain.
It shows which contract accounts and tables within those accounts are configured for state indexing, along with their MongoDB index definitions.

*   **Purpose**: To review which contracts and tables are being tracked for their current state.

[//]: # (showing which accounts and tables are configured for indexing and their specific index definitions.)

**Usage:**
```bash
./hyp-config contracts list <chainName>
```

**Arguments:**

*   `<chainName>`: The alias of the chain whose contract configuration should be listed.

**Example:**
```bash
./hyp-config contracts list wax
```


### `contracts add-single <chainName> <account> <table> <autoIndex> [indicesJson]`


Adds or updates the state indexing configuration for a single table within a specified contract account for the given chain.

*   **Purpose**: To configure Hyperion to track the current state of a specific contract table in MongoDB.
*   **Behavior**: Modifies the `features.contract_state.contracts` section in `config/chains/<chainName>.config.json`.

**Usage:**
```bash
./hyp-config contracts add-single <chainName> <account> <table> <autoIndex> '[indicesJson]'
```

>**Note the single quotes around `[indicesJson]` to ensure the shell passes it as a single argument.**

**Arguments:**

*   `<chainName>`: The alias of the chain.
*   `<account>`: The contract account name.
*   `<table>`: The table name within the contract.
*   `<autoIndex>`: _Boolean_ (`true` or `false`) indicating if default indices should be automatically created.
      *   `true`: Hyperion will attempt to automatically create MongoDB indexes based on the table's ABI structure.
      *   `false`: You must provide custom index definitions via `indicesJson`.
*   `[indicesJson]`: (optional if `autoIndex` is `true`, required if `false`): A JSON string defining custom MongoDB indexes.
      * Keys are field names (dot-notation for nested fields).
      * Values define index type: `1` (ascending), `-1` (descending), `"text"` (text search), `"date"` (for date fields if special handling needed by Hyperion).


**Example (Auto-indexing):**
```bash
./hyp-config contracts add-single wax eosio.token accounts true
```

**Example (Manual Indexing):**
```bash
./hyp-config contracts add-single wax mycontract userdata false '{"user_id": 1, "profile.email": "text"}'
```

### `contracts add-multiple <chainName> <account> '<tablesJson[]>'`

> **Note the single quotes around `<tablesJson>` to ensure the shell passes it as a single argument.**

Adds or updates the state indexing configuration for multiple tables within a specific contract account using a single JSON string input.

*   **Purpose**: Conveniently configure multiple tables for a contract at once.
*   **Behavior**: Modifies `config/chains/<chainName>.config.json`.

**Usage:**
```bash
./hyp-config contracts add-multiple <chainName> <account> '<tablesJson[]>'
```

**Arguments:**

*   `<chainName>`: The alias of the chain.
*   `<account>`: The contract account name.
*   `<tablesJson[]>`: A JSON string representing an array of table configuration objects.
      *  `name` (_string_): The table name.
      * `autoIndex` (_boolean_): Whether to auto-index.
      * `indices` (_object_, _optional_ if `autoIndex` is `true`, required if `false`): Custom MongoDB index definitions (same format as `indicesJson` in `add-single`).

**Example:**
```bash
./hyp-config contracts add-multiple wax eosio.token '[{"name":"accounts","autoIndex":true},{"name":"stat","autoIndex":false,"indices":{"issuer":1,"supply":-1}}]'
```

---

## Configuration Editing

Edit and manage configuration values within chain configuration files with automatic validation against the reference configuration.

### `get <chain> <configPath>`

Retrieves a specific configuration value from a chain's configuration file. The configuration path is validated against the reference configuration to ensure it exists and is valid.

**Usage:**

```bash
./hyp-config get <chain> <configPath>
```

**Arguments:**

* `<chain>`: The short name of the chain whose configuration to read.
* `<configPath>`: The dot-notation path to the configuration value (e.g., `indexer.start_on`, `scaling.readers`, `api.server_port`).

**Examples:**

```bash
./hyp-config get wax indexer.start_on
./hyp-config get eos scaling.readers
./hyp-config get telos api.server_port
```

### `set <chain> <configPath> <value>`

Sets a specific configuration value in a chain's configuration file. The configuration path and value type are validated against the reference configuration. Creates an automatic backup before making changes.

**Usage:**

```bash
./hyp-config set <chain> <configPath> <value>
```

**Arguments:**

* `<chain>`: The short name of the chain whose configuration to modify.
* `<configPath>`: The dot-notation path to the configuration value.
* `<value>`: The new value to set. Can be a string, number, boolean, or JSON for complex values.

**Type Validation:** The value must match the expected type from the reference configuration:

* **Numbers:** `1000`, `4096`
* **Booleans:** `true`, `false`
* **Strings:** `"example_string"`
* **Arrays:** `[1,2,3]` or `["item1","item2"]`
* **Objects:** `{"key":"value"}`

**Examples:**

```bash
./hyp-config set wax indexer.start_on 1000
./hyp-config set eos scaling.readers 4
./hyp-config set telos api.enabled true
./hyp-config set wax api.limits '{"get_actions": 2000}'
```

### `set-default <chain> <configPath>`

Resets a specific configuration value to its default value from the reference configuration. Creates an automatic backup before making changes.

**Usage:**

```bash
./hyp-config set-default <chain> <configPath>
```

**Arguments:**

* `<chain>`: The short name of the chain whose configuration to reset.
* `<configPath>`: The dot-notation path to the configuration value to reset.

**Examples:**

```bash
./hyp-config set-default wax indexer.start_on
./hyp-config set-default eos api.server_port
./hyp-config set-default telos scaling.readers
```

### `list-paths <chain> [--filter <category>]`

Lists all valid configuration paths available for modification. Useful for discovering available configuration options and their current values and types.

**Usage:**

```bash
./hyp-config list-paths <chain> [options]
```

**Arguments:**

* `<chain>`: The short name of the chain (used for command context, but paths are from reference config).

**Options:**

* `--filter <category>`: Filter paths by category (e.g., `api`, `indexer`, `scaling`, `features`).

**Examples:**

```bash
./hyp-config list-paths wax
./hyp-config list-paths wax --filter indexer
./hyp-config list-paths wax --filter scaling
./hyp-config list-paths wax --filter api
```

**Available Categories:**

* `api` - API server configuration
* `indexer` - Indexer process configuration  
* `settings` - General settings
* `scaling` - Performance and scaling options
* `features` - Feature toggles
* `blacklists` - Action and delta blacklists
* `whitelists` - Action and delta whitelists
* `prefetch` - Prefetch settings
* `hub` - Hub configuration
* `plugins` - Plugin settings
* `alerts` - Alert system configuration

## Commands Alias

The following commands are alias for the commands above.

*   `list chains` (for `chains list`)
    *   Alias: `ls chains`
*   `new chain <shortName>` (for `chains new <shortName>`)
    *   Alias: `n chain <shortName>`
*   `remove chain <shortName>` (for `chains remove <shortName>`)
    *   Alias: `rm chain <shortName>`
