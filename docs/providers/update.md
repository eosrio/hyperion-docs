# Updating Hyperion

Keeping your Hyperion instance up-to-date is important for receiving bug fixes, performance improvements, and new features. This guide outlines the recommended steps for updating your Hyperion installation managed via Git and PM2.

## 1. Before You Update

!!! danger "Check Release Notes First!"
    **Always** check the [Release Notes](https://github.com/eosrio/hyperion-history-api/releases/latest) for the version you are updating to _before_ starting the update process.
    
    Release notes may contain:

    * Information about breaking changes.
    * Required configuration file updates.
    * Instructions for potential index migrations or specific repair steps.
    * Updates to dependency requirements (Node.js, Elasticsearch, etc.).

    **Failure to consult the release notes could lead to unexpected issues or downtime.**

!!! warning "Backup Configuration"
    It's highly recommended to back up your configuration files before updating, especially if the release notes indicate configuration changes.
    ```bash
    # Example backup command (run from Hyperion root directory)
    mkdir -p config_backups/$(date +%Y%m%d_%H%M%S)
    cp config/connections.json config_backups/$(date +%Y%m%d_%H%M%S)/
    cp -r config/chains config_backups/$(date +%Y%m%d_%H%M%S)/
    echo "Configuration backed up to config_backups/$(date +%Y%m%d_%H%M%S)/"
    ```

!!! info "Stop Services (Recommended)"
    While not strictly mandatory for all updates, stopping the Hyperion services (especially the indexer) before updating dependencies and rebuilding is the safest approach to prevent potential inconsistencies.
    ```bash
    # Example stopping services for 'wax' chain
    ./stop.sh wax-indexer
    ./stop.sh wax-api
    # Repeat for all chains you are running
    ```
    The `./stop.sh` script sends a graceful stop signal, allowing queues to drain. This might take some time for the indexer.


## 2. Update Process

#### Step 2.1: Navigate to Hyperion Directory
Ensure you are in the correct directory:
```bash
cd ~/hyperion-history-api # Or your specific installation path
```

#### Step 2.2: Fetch Latest Code
Fetch the latest changes from the remote repository:
```bash
git fetch origin
```

#### Step 2.3: Checkout Target Version
Decide which version you want to update to:

*   **Latest Stable Release (Recommended):** Find the latest version tag (e.g., `v3.5.0`) on the [Releases page](https://github.com/eosrio/hyperion-history-api/releases){:target="_blank"} and check it out directly.
    ```bash
    git checkout v3.5.0 # Replace v3.5.0 with the desired tag
    ```
*   **Latest Development Version (Use with caution):** Check out the `main` branch for the newest, potentially unstable code.
    ```bash
    git checkout main
    git pull origin main # Ensure you have the absolute latest from the branch
    ```

#### Step 2.4: Install Dependencies and Build
Use `npm ci` (Clean Install) to install the exact dependencies listed in `package-lock.json` and ensure a clean `node_modules` directory. This is generally safer than `npm install` for updates. The command will also trigger the build process automatically (`npm run build`).

```bash
npm ci
```
This command will:

1.  Delete the existing `node_modules` folder.
2.  Install dependencies precisely as specified in `package-lock.json`.
3.  Run the `tsc` build process, compiling TypeScript code into the `build/` directory.
4.  Run permission fixes (`chmod +x` on scripts).

Monitor the output for any installation or build errors.

## 3. After the Update

#### Step 3.1: Restart Services

Restart the Hyperion Indexer and API processes using PM2.

*   **If you stopped the services earlier:** Use the `./run.sh` script.
    ```bash
    # Example for 'wax' chain
    ./run.sh wax-indexer
    ./run.sh wax-api
    # Repeat for all chains
    ```
*   **If you did not stop the services:** You can use `pm2 restart`. This is generally okay for minor updates but restarting fully ensures all changes are loaded.
    ```bash
    # Example for 'wax' chain
    pm2 restart wax-indexer
    pm2 restart wax-api
    # Repeat for all chains
    ```

#### Step 3.2: Verify the Update
1.  **Check PM2 Status:** Ensure all processes are `online`.
    ```bash
    pm2 list
    ```
2.  **Check Logs:** Monitor logs for any startup errors or unexpected behavior.
    ```bash
    pm2 logs <app-name>
    # Example: pm2 logs wax-api
    ```
3.  **Check Hyperion Version:** Query the root endpoint of your API.
    ```bash
    curl http://localhost:7000/ # Use your API host/port
    ```
    Verify the `version` and `version_hash` match the updated code.

4.  **Check API Health:** Query the health endpoint.
    ```bash
    curl -Ss http://localhost:7000/v2/health | jq
    ```
    Ensure all components report an OK status.

## 4. Updating Plugins (If Applicable)

If you are using Hyperion Plugins managed by `hpm`, they might also need updating or rebuilding after a core Hyperion update, especially if there were significant changes to Hyperion's internal interfaces.

*   Refer to the specific plugin's documentation for update instructions.
*   You might need to run `hpm update <plugin-alias>` or potentially `hpm build-all` after updating Hyperion core.

## 5. Troubleshooting

*   **Build Errors:** Check the output of `npm ci`. Ensure you have the correct Node.js version (>= v22) and necessary build tools installed. Try removing `node_modules` (`rm -rf node_modules`) and running `npm ci` again.
*   **Service Start Failures:** Check `pm2 logs <app-name>` immediately after attempting to start. Errors often point to configuration issues or problems connecting to dependencies (Elasticsearch, RabbitMQ, etc.). Verify dependency services are running and reachable.
*   **Unexpected Behavior:** Consult the release notes for the version you updated to. If the issue persists, consider opening an issue on the [Hyperion GitHub repository](https://github.com/eosrio/hyperion-history-api/issues){:target="_blank"} or talking directly on the [Hyperion Telegram Group](https://t.me/EOSHyperion){:target="_blank"}.
