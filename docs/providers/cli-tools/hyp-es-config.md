# Elasticsearch Index Management CLI (`hyp-es-config`)

## Overview

The `hyp-es-config` command-line interface (CLI) tool is designed for managing Hyperion's Elasticsearch indices. Its primary functions include listing indices, repartitioning existing indices to new sizes, cleaning up old or new indices post-repartitioning, and monitoring active reindexing tasks.

**Why Repartition?**

Elasticsearch performance, especially for time-series data like blockchain history, can be significantly impacted by shard and index size. Over time, as data grows, individual index partitions might become too large, leading to slower queries and indexing. Repartitioning allows you to reorganize your data into more optimally sized indices, which can improve search performance and cluster stability.

**Key Concepts:**

*   **Index Partitioning:** Hyperion typically splits historical data (blocks, actions, deltas) into multiple Elasticsearch indices based on block number ranges. Each such index is a "partition."
*   **Partition Size:** The number of blocks contained within a single index partition (e.g., 1 million blocks per action index).
*   **Reindexing:** The process of copying data from old indices to newly structured (repartitioned) indices. This is an I/O intensive operation.

## Before You Start: **Critical Prerequisites**

* **Stop the Hyperion Indexer:**

    ‼️Before running any repartitioning or cleanup commands, you **must** stop the Hyperion indexer process for the chain you are working on. This prevents conflicts and data inconsistencies.

    ```bash
    # Example for the 'wax' chain
    ./hyp-control indexer stop wax
    ```

* **Backup (Recommended)** 

    While `hyp-es-config` aims to be safe, backing up your Elasticsearch data or at least your Hyperion configuration files is always a good practice before major operations.


* **Sufficient Disk Space** 

    Reindexing temporarily duplicates data. Ensure your Elasticsearch cluster has enough free disk space to accommodate the new indices before the old ones are removed.

*   **Elasticsearch Access:** 

    Ensure the machine running `hyp-es-config` can connect to your Elasticsearch cluster as configured in `config/connections.json`.

## `.indices-registry.json` File

The `hyp-es-config` tool creates and uses a file named `.indices-registry.json` located in a `.cli/` directory at the root of your Hyperion project.

*   **Purpose:** This file tracks the state of repartitioning operations, specifically listing which indices are considered "old" (pre-repartition) and "new" (post-repartition) for each chain and index type (blocks, actions, deltas).
*   **Importance:** It's essential for the `cleanup` command to correctly identify which set of indices to remove. **Do not manually delete or modify this file unless you understand the implications.**
*   **Creation:** It's created automatically if it doesn't exist when repartitioning commands are run.

---


[//]: # (The repartitioning process keeps the old indices intact to ensure data safety. After validating that the new indices are functioning correctly, it is essential to manually remove the old indices to free up storage, maintain optimal performance, and ensure that no duplicate data is displayed.)

[//]: # ()
[//]: # (The tool creates a file named `.indices-registry.json` inside a `.cli` directory at the root of the project to track information about old and new indices during repartitioning. This file is essential for managing cleanup operations and ensuring that indices are correctly classified. If the `.cli` directory does not exist, it will be created automatically.)

## Commands

### List Indices (`list`)
> **Alias**: `ls`

Displays all Elasticsearch indices currently present in your cluster that Hyperion might be using or has used.


*   **Purpose**: To get an overview of existing indices, their document counts, sizes, and health.
*   **Usage:**

    ```bash
    ./hyp-es-config list
    ```


### 2. List Tasks  (`tasks`)

Lists and monitors active reindexing tasks currently running within your Elasticsearch cluster. Reindexing operations initiated by `repartition` run as background tasks in Elasticsearch.

*   **Purpose**: To check the progress and status of ongoing repartitioning efforts.
*   **Usage:**
    ```bash
    ./hyp-es-config tasks
    ```
    *(Output will show task IDs, actions, running times, and descriptions.)*


### Repartition Indices (`repartition <chainName>`)

Initiates the repartitioning process for block, action, and/or delta indices for the specified chain. This involves creating new indices with the target partition size(s) and starting Elasticsearch reindex tasks to copy data from the old indices to the new ones.

*   **Purpose**: To reorganize historical data into new index partitions of a specified size, aiming to improve query performance and manageability.
*   **Behavior**:
    1.  Analyzes existing indices for the chain and type.
    2.  Determines the new index structure based on the provided partition sizes.
    3.  If not run with `-y`, it will prompt for confirmation before proceeding.
    4.  Updates the chain's configuration file (`config/chains/<chainName>.config.json`) with the new partition sizes.
    5.  Creates new Elasticsearch index templates and target indices.
    6.  Starts asynchronous Elasticsearch `_reindex` tasks to populate the new indices.
    7.  Updates the `.cli/.indices-registry.json` file. 
    >The old indices are **not** deleted by this command; they remain until explicitly removed via the `cleanup` command.

**Usage:**
```bash
./hyp-es-config repartition <chainName> [options]
```

**Arguments:**

*   `<chainName>`: The alias of the chain whose indices you want to repartition (e.g., `wax`, `eos`).

**Options:**

*   `--global <size>`: Sets the *same new partition size* (number of blocks) for all index types (block, action, delta).
*   `--blocks <size>`: Sets a specific new partition size for block indices.
*   `--actions <size>`: Sets a specific new partition size for action indices.
*   `--deltas <size>`: Sets a specific new partition size for delta indices.
     *   **Note on Action/Delta Sizes**: These sizes are relative to block numbers. For example, if actions are partitioned by 1,000,000 blocks, an action index will contain actions from a 1,000,000 block range.
*   `--force`: If target (new) indices already exist, delete and recreate them. Use with caution.
*   `--skip-missing`: If one type of index (e.g., deltas) is not found for the chain, continue repartitioning other found types instead of exiting.
*   `--skip-cleanup`: Suppresses the informational message about running the `cleanup` command after repartitioning.
*   `--continue-on-error`: If an error occurs during one part of the operation (e.g., reindexing one partition), attempt to continue with others.
*   `-y, --yes`: Skips all confirmation prompts, making the command non-interactive. Useful for scripts.


**Example:**

```bash
# Repartition all index types with the same size
./hyp-es-config repartition telos --global 1000000 -y

# Repartition specific index types with different sizes
./hyp-es-config repartition telos --blocks 500000 --actions 1000000 --deltas 750000 -y
```

!!! attention
    When specifying sizes for `--actions` and `--deltas`, note that these sizes are always related to the block indices. The partitioning logic uses block sizes as the reference point, and the sizes for actions and deltas are aligned accordingly.

**After Running `repartition`:**

*   Use `./hyp-es-config tasks` to monitor the progress of the reindex tasks.
*   Once all tasks are completed and you have verified the new indices are correct and Hyperion (after restart) is functioning as expected, **proceed to the `cleanup` command**.


### 4. Cleanup Indices (`cleanup <chainName>`)

Removes either the old set of indices (pre-repartition) or the new set of indices (post-repartition) for the specified chain. This command relies on the `.cli/.indices-registry.json` file to identify which indices belong to which set.

!!! warning "The importance of removing old indices"
    The goal of repartitioning is to divide indices for better performance. To ensure everything is working correctly, old indices are kept. However, after validation, **it is crucial to remove old indices** to **avoid unnecessary storage usage**.

!!! warning
    The cleanup will only remove old indices. To remove new ones, use the `--delete-new-indices` option.

*   **Purpose**: To free up disk space by deleting the now-redundant set of indices after a successful repartition and verification.
*   **Behavior**:
    *   By default, it targets the "old" indices for deletion. Use  `--delete-new-indices` to delete new ones
    *   If not run with `-y`, it will prompt for confirmation before deleting indices.
    *   Updates the `.cli/.indices-registry.json` file to reflect the removed indices.

**Usage:**

```bash
./hyp-es-config cleanup <chainName> [options]
```

**Arguments:**

*   `<chainName>`: The short name of the chain for which to clean up indices.

**Options:**

*   `--blocks`: Removes only block indices.
*   `--actions`: Removes only action indices.
*   `--deltas`: Remove only delta indices.
    *(If none of `--blocks`, `--actions`, `--deltas` are specified, all types are targeted for cleanup based on the registry.)*
*   `--delete-new-indices`: **‼️USE WITH EXTREME CAUTION.** Reverses the cleanup target. Instead of deleting old indices, this will delete the *newly created* indices. This is typically only used if the repartitioning failed or resulted in problematic new indices, and you want to revert to using the old ones.
*   `-y, --yes`: Skips confirmation prompts.
*   `--continue-on-error`: If an error occurs deleting one index, attempt to continue deleting others.

**Example:**

```bash
# Remove old block indices
./hyp-es-config cleanup telos --blocks -y

# Remove new indices instead of old ones
./hyp-es-config cleanup telos --delete-new-indices -y
```

## Important Notes & Troubleshooting

*   **Always Stop the Indexer**: Failure to stop the Hyperion indexer before `repartition` or `cleanup` can lead to data corruption or incomplete operations.
*   **Disk Space**: Repartitioning requires significant free disk space in Elasticsearch as data is temporarily duplicated.
*   **Time**: Reindexing large amounts of data can take a very long time (hours or even days for large chains). Plan accordingly.
*   **Monitoring Tasks**: Use `./hyp-es-config tasks` frequently during repartitioning to monitor progress. You can also use Elasticsearch's native Task Management API.
*   **Configuration File (`config/chains/<chainName>.config.json`):** The `repartition` command updates the partition size settings in this file. If you manually revert a repartition (e.g., by deleting new indices), ensure this configuration file accurately reflects the partition sizes of the indices Hyperion should be using.
* If no partition size is provided, the tool attempts to fetch sizes from the configuration file.
*   **`--continue-on-error`**: While useful for partial successes, be sure to investigate any errors that occur even if the command continues.
*   **Log Files**: Check Hyperion and Elasticsearch logs for detailed error messages if issues arise. Check the `logs/` directory.

## Typical Workflow and Examples

1.  **Repartition (Example for 'wax' chain):**
    ```bash
    ./hyp-control indexer stop wax  # Stop the indexer first!
    ./hyp-es-config repartition wax --global 2000000 -y
    ```
2.  **Monitor Reindex Tasks:**
    ```bash
    ./hyp-es-config tasks
    ```
    *(Wait until all reindex tasks for 'wax' are complete.)*

3.  **Verify (Important!):**

     *   Restart the Hyperion indexer for 'wax': `./run.sh wax-indexer`
     *   Restart the Hyperion API for 'wax': `./run.sh wax-api`
     *   Thoroughly test Hyperion queries to ensure data integrity and accessibility with the new indices.
     *   Check Elasticsearch logs for any issues.

4.  **Cleanup Old Indices (after successful verification):**
    ```bash
    ./hyp-control indexer stop wax  # Stop the indexer again for safety
    ./hyp-es-config cleanup wax -y   # This will delete the old indices
    ```
    *(After cleanup, you can restart the 'wax' indexer and API again.)*
___

*  **Example:** Cleanup **only old action indices** for 'eos':
    ```bash
    ./hyp-es-config cleanup eos --actions -y
    ```

*  **Example:** Revert - Delete **new indices if repartitioning was problematic** for 'telos':**
    ```bash
    ./hyp-es-config cleanup telos --delete-new-indices -y
    ```
    *(Remember to adjust `config/chains/telos.config.json` back to old partition sizes if you do this, or re-run `repartition` correctly.)*
