[:fontawesome-solid-arrow-left-long: Hyperion Configuration](../setup/hyperion_configuration.md)

# MongoDB Troubleshooting

This guide provides steps to diagnose and resolve common issues related to MongoDB when used with Hyperion. Remember, MongoDB is **conditionally required** by Hyperion; it's only used if you enable state tracking features (`features.tables.*` or `features.contract_state.enabled`) in your chain configuration file.

For installation details, refer to the [Manual Installation Guide](../install/manual_install.md#mongodb-conditional-requirement).

## Basic Service Management (`systemd`)

Ensure the MongoDB service (`mongod`) is running correctly on the host machine where it's installed.

*   **Check Status:**
    ```bash
    sudo systemctl status mongod
    ```
    Look for `active (running)`.

*   **Start Service:**
    ```bash
    sudo systemctl start mongod
    ```

*   **Stop Service:**
    ```bash
    sudo systemctl stop mongod
    ```

*   **Enable on Boot:** (Recommended)
    ```bash
    sudo systemctl enable mongod
    ```

*   **View Logs:**
    *   Systemd Journal: `sudo journalctl -u mongod -f`
    *   MongoDB Log File (Default): `sudo tail -f /var/log/mongodb/mongod.log`

## Connection Issues

If Hyperion (API or Indexer) cannot connect to MongoDB:

1.  **Verify Service is Running:** Use `sudo systemctl status mongod` on the MongoDB host.
2.  **Check `config/connections.json`:** Ensure the `mongodb` section has the correct `host`, `port`, `user`, `pass`, and `database_prefix`.
    ```json
    "mongodb": {
      "host": "127.0.0.1", // Or the correct IP/hostname
      "port": 27017,
      "database_prefix": "hyperion", // Ensure this matches expectations
      "user": "hyperion_user",   // Or blank if no auth
      "pass": "your_password"  // Or blank if no auth
    }
    ```
3.  **Test Connectivity with `hyp-config`:** Run this from your Hyperion installation directory. It specifically tests the configuration in `connections.json`.
    ```bash
    ./hyp-config connections test
    ```
    Look for the MongoDB test result.
4.  **Manual Connection Test (`mongosh`):** From the Hyperion machine, try connecting directly using the MongoDB Shell.
    *   **Without Authentication:**
        ```bash
        mongosh --host <mongodb_host> --port <mongodb_port>
        # Example: mongosh --host 192.168.1.100 --port 27017
        ```
    *   **With Authentication:**
        ```bash
        mongosh --host <mongodb_host> --port <mongodb_port> --username <user> --password <password> --authenticationDatabase <auth_db>
        # Example: mongosh --host 192.168.1.100 --port 27017 -u hyperion_user -p your_password --authenticationDatabase admin
        ```
    If the manual connection fails:
    *   **Check `bindIp`:** On the MongoDB host, check the `/etc/mongod.conf` file. Ensure the `net.bindIp` setting includes the IP address of your Hyperion machine or `0.0.0.0` (less secure). Restart `mongod` after changes.
    *   **Check Firewalls:** Ensure firewalls on both the MongoDB host and the Hyperion machine allow traffic on the MongoDB port (default `27017`).

## Authentication Errors

If Hyperion logs show authentication failures:

1.  **Verify Credentials:** Double-check the `user` and `pass` in `config/connections.json` against the actual user credentials configured within MongoDB.
2.  **Check User Existence & Permissions:** Use `mongosh` as an admin user on the MongoDB server to verify the Hyperion user exists and has the necessary roles (like `readWrite`) on the target Hyperion databases (e.g., `hyperion_wax`, `hyperion_eos`). Refer to MongoDB's documentation on [managing users and roles](https://www.mongodb.com/docs/manual/tutorial/manage-users-and-roles/){:target="_blank"}.

## Missing Data or Collections

If `/v2/state/` endpoints return empty results or errors about missing collections (e.g., `accounts`, `voters`, `<contract>-<table>`):

1.  **Check Feature Flags:** Ensure the corresponding features are enabled in `config/chains/<chain>.config.json`:
    *   `features.tables.accounts: true` (for token balances/holders)
    *   `features.tables.voters: true` (for voters)
    *   `features.tables.proposals: true` (for proposals)
    *   `features.contract_state.enabled: true` (for specific contract tables)
    *   Ensure the specific contracts/tables are defined under `features.contract_state.contracts` if using that feature.
2.  **Check Database/Collections Exist:** Use `mongosh` on the MongoDB server:
    ```bash
    mongosh --host ... # Connect first
    show dbs # Look for your hyperion_<chain> database
    use hyperion_<chain>
    show collections # Check if expected collections (accounts, voters, proposals, <contract>-<table>) exist
    ```
3.  **Data Not Yet Indexed/Synchronized:** If the features were enabled *after* the indexer processed the relevant historical blocks, the state data might be missing. You need to manually synchronize:
    *   **Requirement:** The Hyperion Indexer for the target chain must be running and its control port (configured in `connections.json`, default 7002) must be accessible from where you run the command.
    *   **Commands (run from Hyperion root dir):**
        ```bash
        # Sync specific contract state tables defined in config
        ./hyp-control sync contract-state <chain-name>

        # Sync system state tables (if enabled in config)
        ./hyp-control sync accounts <chain-name>
        ./hyp-control sync voters <chain-name>
        ./hyp-control sync proposals <chain-name>

        # Or sync everything configured
        ./hyp-control sync all <chain-name>
        ```
    *   This process can take time depending on the amount of data. Monitor indexer logs (`pm2 logs <chain>-indexer`).

## Performance Issues (Slow Queries/Indexing)

If `/v2/state/` queries are slow or the indexer seems bottlenecked during state updates:

1.  **Monitor Host Resources:** Check RAM, CPU, and especially Disk I/O usage on the MongoDB host using tools like `htop`, `iostat`, `vmstat`. High I/O wait often indicates storage bottlenecks.
2.  **Check MongoDB Logs:** Look for slow query logs in `/var/log/mongodb/mongod.log`. You might need to [configure the profiling level](https://www.mongodb.com/docs/manual/tutorial/manage-the-database-profiler/){:target="_blank"} in `mongod.conf` to capture these.
3.  **Verify Indexes:** Proper indexes are crucial for query performance.
    *   Use `mongosh` to check existing indexes:
        ```bash
        use hyperion_<chain>
        db.accounts.getIndexes() # Check indexes for 'accounts' collection
        db.voters.getIndexes()   # Check indexes for 'voters' collection
        db.<contract>-<table>.getIndexes() # Check indexes for a contract state table
        ```
    *   Ensure indexes exist for fields commonly used in your queries (especially for `get_table_rows` filters).
    *   Use `./hyp-config contracts ...` to manage indexes for `contract_state` tables (including setting `autoIndex: true`).
    *   The `hyp-control sync` tools generally create necessary indexes for the system tables (`accounts`, `voters`, `proposals`).
4.  **Hardware Resources:** Slow performance might simply indicate insufficient RAM, CPU, or slow disk speed for the workload, especially if indexing large contract state tables.

## Disk Space Issues

1.  **Check Disk Usage:** Use `df -h` on the MongoDB host to check available disk space.
2.  **Check Data Directory Size:** Find the MongoDB data directory path in `/etc/mongod.conf` (usually `/var/lib/mongodb`) and check its size: `sudo du -sh /var/lib/mongodb`.
3.  **Resolution:** If disk space is low, you may need to add more storage, prune unnecessary data (if applicable, less common for state DBs than time-series ES data), or investigate specific collections that are consuming excessive space.

## General Tips

*   Always check the Hyperion Indexer logs (`pm2 logs <chain>-indexer`) for specific errors related to MongoDB operations (bulk writes, etc.).
*   Consult the official [MongoDB Documentation](https://www.mongodb.com/docs/manual/){:target="_blank"} for detailed information on configuration, performance tuning, and troubleshooting.

[:fontawesome-solid-arrow-left-long: Hyperion Configuration](../setup/hyperion_configuration.md){ .md-button }