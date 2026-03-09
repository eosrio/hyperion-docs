# Indexer Troubleshooting

This page covers common issues encountered when starting or running the Hyperion indexer.

## AMQP Connection Refused

**Symptom:** All workers report `[AMQP] failed to connect!` with the error:

```
Expected ConnectionOpenOk; got <ConnectionClose channel:0>
```

**Cause:** The `vhost` value in `connections.json` does not match the actual RabbitMQ vhost name.

When RabbitMQ is configured with `RABBITMQ_DEFAULT_VHOST=/hyperion`, the full vhost name **includes the leading slash** — it is literally `/hyperion`, not `hyperion`.

**Fix:** Update the `vhost` field in your `connections.json` to include the leading `/`:

```json
{
  "amqp": {
    "host": "127.0.0.1:5672",
    "api": "127.0.0.1:15672",
    "user": "my_user",
    "pass": "my_password",
    "vhost": "/hyperion"
  }
}
```

!!! tip "How to verify your vhost name"
    Check the actual vhost name in RabbitMQ:
    ```bash
    rabbitmqctl list_vhosts
    ```
    Or via the management API:
    ```bash
    curl -u user:pass http://127.0.0.1:15672/api/vhosts
    ```
    Use the exact vhost name shown in the output.

---

## MongoDB Connection Failed

**Symptom:** The indexer exits with:

```
MongoDB connection failed! - connect ECONNREFUSED 127.0.0.1:27017
```

Even though `mongodb.enabled` is set to `false` in `connections.json`.

**Cause:** The indexer always attempts a MongoDB connection during startup, regardless of the `enabled` flag. If the connection fails, the process exits.

**Fix:** Ensure MongoDB is running and accessible at the host/port configured in `connections.json`, even if `mongodb.enabled` is set to `false`.

!!! warning "Known Behavior"
    Setting `mongodb.enabled: false` only disables MongoDB collection creation — it does **not** skip the connection attempt. A reachable MongoDB instance is required for the indexer to start.

---

## Indexer Stuck After ABI Scan

**Symptom:** The indexer completes the ABI scan phase and reports:

```
Parallel readers finished the requested range
No blocks processed! Indexer will stop in N seconds!
```

No block, action, or delta data is indexed — only ABI records appear in Elasticsearch.

**Cause:** On first run, the indexer must start in `abi_scan_mode: true` to discover contract ABIs. After the scan, it needs to switch to data indexing mode. Without `auto_mode_switch`, the indexer finishes the ABI scan and waits idle until `auto_stop` triggers.

**Fix:** Enable `auto_mode_switch` in your chain config file:

```json
{
  "settings": {
    "auto_mode_switch": true,
    "auto_stop": 300
  }
}
```

With `auto_mode_switch: true`, the indexer will automatically:

1. Complete the ABI scan
2. Save the ABI data
3. Restart itself in full indexing mode
4. Index all blocks, actions, and deltas

!!! info "After the first run"
    Once the ABI scan has completed and full indexing is done, you can set `abi_scan_mode: false` for subsequent runs. The `auto_mode_switch` setting is only needed for the initial ABI scan pass.

---

## Purge Queues Fails on Startup

**Symptom:** The indexer crashes on startup with:

```
Error running master: TypeError: result is not iterable
```

The error points to `ConnectionManager.purgeQueues`.

**Cause:** When `purge_queues: true` is set in the indexer config, the indexer calls the RabbitMQ management API to list and delete existing queues. If the configured `vhost` does not exist in RabbitMQ, or the management API credentials are incorrect, RabbitMQ returns an error object instead of the expected queue array — causing the iteration error.

**Fix:**

1. Verify the vhost exists in RabbitMQ (see [AMQP Connection Refused](#amqp-connection-refused) above)
2. Verify the management API credentials match the AMQP credentials
3. Verify the `api` field in `connections.json` points to the RabbitMQ **management** port (default: `15672`), not the AMQP port (`5672`)

```json
{
  "amqp": {
    "host": "127.0.0.1:5672",
    "api": "127.0.0.1:15672",
    "vhost": "/hyperion"
  }
}
```

!!! tip "Workaround"
    If you're running with a fresh RabbitMQ instance (no pre-existing queues), you can safely set `purge_queues: false` to skip this step entirely.
