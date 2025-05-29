# Indexer Control CLI (`hyp-control`)

The `hyp-control` command-line interface (CLI) tool allows you to interact with and manage running Hyperion indexer processes for specific chains.

It communicates with the indexer's control port (configured in `config/connections.json`, defaults to port `7002` for the first chain, incrementing for subsequent chains).

!!! warning "Important"
    The Hyperion indexer process for the target chain must be running and its control port must be accessible from the machine where you execute `hyp-control` commands.

## General Usage

Commands typically follow the pattern:

`./hyp-control <command-group> <sub-command> <chainName> [options...]`

or

`./hyp-control <command> <chainName> [options...]`

The `<chainName>` argument usually refers to the short alias of the chain as defined in your Hyperion configuration (e.g., `wax`, `eos`).

---

## `indexer` Commands

This group of commands is used to control the operational state of an indexer.

### `indexer start <chainName>`

Sends a command to the specified chain's indexer master process to ensure it is actively processing blocks. If the indexer is already running and processing, this command acknowledges its current state. If it was paused or in a state where it could start/resume, it initiates processing.

*   **Purpose**: To start or confirm that the indexer is actively indexing data.
*   **Behavior**: Sends a `start_indexer` event. The indexer will respond with `indexer-started` or `indexer-already-running`.

**Usage:**
```bash
./hyp-control indexer start <chainName> [--host <indexerHost>]
```

**Arguments:**

*   `<chainName>`: The alias of the chain whose indexer you want to start.

**Options:**

*   `--host <indexerHost>`: (_Optional_) The hostname or IP address where the indexer's control port is listening. Defaults to `localhost` if not specified. Use this if `hyp-control` is run on a different machine than the indexer.

**Example:**
```bash
./hyp-control indexer start wax
./hyp-control indexer start eos-testnet --host 192.168.1.100
```

---
### `indexer stop <chainName>`

Sends a command to gracefully stop the indexer for the specified chain. The indexer will attempt to finish processing any data currently in its queues before shutting down its workers.

*   **Purpose**: To safely stop the indexer, allowing it to drain its internal queues and prevent data loss. This is the recommended way to stop an indexer before maintenance or updates.
*   **Behavior**: Sends a `stop_indexer` event. The indexer will log its shutdown progress and eventually respond with `indexer_stopped`. This process can take some time depending on queue sizes.

**Usage:**
```bash
./hyp-control indexer stop <chainName> [--host <indexerHost>]
```

**Arguments & Options:** Same as `indexer start`.

**Example:**
```bash
./hyp-control indexer stop wax
```

---

## `sync` Commands (State Synchronization)

This group of commands is used to manually trigger or re-trigger the synchronization of specific *current state* data into MongoDB. This is particularly useful if:

*   State tracking features (e.g., `features.tables.accounts`, `features.contract_state.enabled`) were enabled *after* the indexer had already processed the relevant historical blocks.
*   You suspect an inconsistency in the MongoDB state data and want to refresh it.

**Important:**

*   The corresponding feature must be enabled in the chain's configuration file (`config/chains/<chainName>.config.json`) for the sync command to have an effect for that specific data type.
*   These commands will attempt to **pause** the relevant indexer components during the sync process to ensure data consistency and then **resume** them. If the indexer cannot be paused (e.g., it's offline), the sync will proceed with a warning.

### `sync accounts <chainName>`

Triggers a full scan of the blockchain (via nodeos `get_table_rows` on system contract token tables, typically `eosio.token::accounts` or similar, by analyzing ABIs) to update the token balance information stored in the `accounts` collection in MongoDB for the specified chain.

*   **Requires**: `features.tables.accounts: true` in `config/chains/<chainName>.config.json`.

**Usage:**
```bash
./hyp-control sync accounts <chainName> [--host <indexerHost>]
```
**Arguments & Options:** Same as `indexer start`.

---
### `sync voters <chainName>`

Triggers a full scan of the `eosio::voters` table (or equivalent) to update voter registration and staking information in the `voters` collection in MongoDB.

*   **Requires**: `features.tables.voters: true` in `config/chains/<chainName>.config.json`.

**Usage:**
```bash
./hyp-control sync voters <chainName> [--host <indexerHost>]
```
**Arguments & Options:** Same as `indexer start`.

---
### `sync proposals <chainName>`

Triggers a full scan of the `eosio.msig::proposal` and `eosio.msig::approvals2` tables (or equivalents) to update multisig proposal information in the `proposals` collection in MongoDB.

*   **Requires**: `features.tables.proposals: true` in `config/chains/<chainName>.config.json`.

**Usage:**
```bash
./hyp-control sync proposals <chainName> [--host <indexerHost>]
```
**Arguments & Options:** Same as `indexer start`.

---
### `sync contract-state <chainName>`

Triggers a full scan for all contract tables explicitly defined for state indexing under `features.contract_state.contracts` in the `config/chains/<chainName>.config.json` file. It populates or updates their corresponding collections in MongoDB (e.g., `<contractName>-<tableName>`).

*   **Requires**: `features.contract_state.enabled: true` and contract/table definitions in `config/chains/<chainName>.config.json`.

**Usage:**
```bash
./hyp-control sync contract-state <chainName> [--host <indexerHost>]
```
**Arguments & Options:** Same as `indexer start`.

---
### `sync all <chainName>`

Sequentially triggers `sync voters`, `sync accounts`, `sync proposals`, and `sync contract-state` for the specified chain.

**Usage:**
```bash
./hyp-control sync all <chainName> [--host <indexerHost>]
```
**Arguments & Options:** Same as `indexer start`.

**Example for Syncing:**
```bash
# Sync token accounts for the WAX chain
./hyp-control sync accounts wax

# Sync all configured state types for the EOS chain, targeting a remote indexer
./hyp-control sync all eos --host hyperion-indexer.internal.net
```

---

## Diagnostic Commands

These commands provide insights into the indexer's performance and resource usage.

### `get-usage-map <chainName>`

Requests and displays a map of contract usage statistics from the indexer. This shows which smart contracts are generating the most action processing load, the percentage of total load, and which deserializer workers are assigned to them. It also includes information about the load distribution cycle.

*   **Purpose**: To identify high-traffic contracts and understand how the indexer is distributing its workload.

**Usage:**
```bash
./hyp-control get-usage-map <chainName> [--host <indexerHost>]
```
**Arguments & Options:** Same as `indexer start`.

---
### `get-memory-usage <chainName>`

Requests and displays the current memory usage (resident set size) for each active worker process within the indexer for the specified chain.

*   **Purpose**: To monitor the memory footprint of different indexer components.

**Usage:**
```bash
./hyp-control get-memory-usage <chainName> [--host <indexerHost>]
```
**Arguments & Options:** Same as `indexer start`.

---
### `get-heap <chainName>`

Requests and displays V8 JavaScript engine heap statistics for each active worker process within the indexer. This includes used heap size, total heap size, and heap size limit.

*   **Purpose**: To get a more detailed view of JavaScript memory allocation and identify potential memory leaks or pressure within the V8 engine.

**Usage:**
```bash
./hyp-control get-heap <chainName> [--host <indexerHost>]
```
**Arguments & Options:** Same as `indexer start`.

**Example for Diagnostics:**
```bash
# View contract processing load on the WAX indexer
./hyp-control get-usage-map wax

# Check memory usage of the EOS indexer workers
./hyp-control get-memory-usage eos
```

---

## Internal Indexer Control (Pause/Resume - Advanced)

The `hyp-control` tool itself uses `pause_indexer` and `resume_indexer` events internally when performing `sync` operations. While these are not exposed as direct top-level commands in `hyp-control`, the underlying `IndexerController` client (used by `hyp-control`) has methods for them. Direct manual pausing/resuming is generally an advanced operation and should be used with caution as it can disrupt the normal flow of indexing if not managed correctly.

*   `pause_indexer`: Temporarily halts a specific type of processing (e.g., "table-voters", "dynamic-table") within the indexer.
*   `resume_indexer`: Resumes the previously paused processing type.

These are typically orchestrated by the `sync` commands to ensure data consistency during state table rebuilds.
