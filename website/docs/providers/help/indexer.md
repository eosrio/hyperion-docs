---
title: Indexer troubleshooting
---

# Indexer troubleshooting

Collect the chain configuration, process logs, queue depths and last confirmed indexed range before changing the installation. Fix the failing dependency or scope and repeat its verification.

## AMQP connection refused

For `Expected ConnectionOpenOk` / `ConnectionClose`, inspect broker reachability, credentials, permissions and the exact virtual host. `hyperion` and `/hyperion` are different names. Use `rabbitmqctl list_vhosts` and compare the value with `config/connections.json`.

Keep the AMQP listener (`amqp.host`) distinct from the HTTP management endpoint (`amqp.api`). TLS and container service names must match the actual network path. A TCP connection alone does not establish authentication or vhost access.

## MongoDB connection failed

Core startup constructs and checks a MongoDB client. Setting `mongodb.enabled: false` skips relevant collection creation; it does not remove the startup connectivity requirement. Verify the configured host, port, credentials and service logs. Do not assume an API-only process can start without this check either.

For retrying writes, inspect the first database error and outstanding queue work. A failed batch remains pending and is retried rather than being counted as successfully indexed. Persistent failures can therefore keep progress behind head.

## Indexer stuck after ABI scan

Inspect `indexer.abi_scan_mode` and `settings.auto_mode_switch`. ABI-scan mode forces trace/block fetching off while scanning deltas. If automatic switching is not enabled, completion of the ABI pass does not start full action indexing for you. Confirm completion and source coverage before switching modes and restarting.

## Purge queues fails on startup

`indexer.purge_queues` is a destructive startup option. For management API failures, check the HTTP endpoint, vhost and credentials. Do not reset the broker to repair a wrong endpoint. Preserve pending deliveries unless deliberate replay and recovery are part of the plan.

## Protocol or coverage unavailable

HTTP 503 `protocol_projection_unavailable` means the requested extension projection is not ready for serving; it is not an empty data result. Keep unaffected retained-history reads separate. Inspect the provider/profile identity, initialization inputs and ABI/source coverage before retrying the affected scope.

If a route you expected a plugin to back still answers `protocol_projection_unavailable`, it has no backing. Check that the plugin is enabled for the API, that `features.stateful_owner_v2.maximumServingLagBlocks` is set and that no other plugin claims the same route.

HTTP 503 `stateful.query-unavailable` on a backed route means its owner or view is not ready, or the view trails its finality target by more than `maximumServingLagBlocks`. HTTP 400 `invalid_state_request` means the backing refused the parameters themselves; retrying the same request will not help. See [plugin-backed core state routes](/extend/projections/#plugin-backed-core-state-routes).

## Source

[Startup MongoDB check](https://github.com/eosrio/hyperion-history-api/blob/e1818923065d648a38009572d76badeab0684af1/src/indexer/modules/master.ts), [configuration mode handling](https://github.com/eosrio/hyperion-history-api/blob/e1818923065d648a38009572d76badeab0684af1/src/indexer/modules/config.ts), and [projection readiness](https://github.com/eosrio/hyperion-history-api/blob/e1818923065d648a38009572d76badeab0684af1/src/api/helpers/protocol-state-readiness.ts).
