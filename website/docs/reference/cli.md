---
title: CLI command guide
---

# CLI command guide

Run commands from the installed Hyperion root. Use `--help` from the deployed artifact for complete flags. Commands that mutate configuration, queues or indexed data have different effects from inspection commands.

| Tool | Inspection and setup | Mutating operations to review separately |
|---|---|---|
| `hyp-config` | `connections test`, `chains list`, `chains validate`, `chains test`, `get`, `list-paths` | `connections init/reset`, `chains new/remove`, `set`, validation fixes, contract configuration. |
| `hyp-control` | `stats`, `queues list`, `queues details`, worker inspection | Indexer start/stop, queue purge, state synchronization and snapshots. |
| `hyp-repair` | `connect`, `scan`, `scan-actions`, `quick-scan`, `view` | `repair` and `fill-missing`; inspect `--dry` first. |
| `hyp-es-config` | `list`, `tasks` | `repartition`, `cleanup` and their destructive flags. |

## Configuration editing

```bash
./hyp-config get mychain api.server_port
./hyp-config list-paths mychain --filter api
./hyp-config chains validate mychain
```

Validation does not prove a source range is available. `--fix` changes the configuration and creates a backup; review its effect before using it on an existing installation.

## Process control

`./run mychain-api` and `./run mychain-indexer` use PM2 by default. The PM2 configuration ignores files whose names start with `example`; choose a real chain short name. `HYP_NO_PM2=1` opts into already-installed systemd units. The emitted Node entry points use `CONFIG_JSON=config/chains/mychain.config.json`.

## State synchronization

Synchronization requests need a reachable indexer controller and successful worker pause/drain coordination. An unreachable controller is not permission to write over active state. Use the [configuration guide](/providers/setup/hyperion_configuration/#state-synchronization-mongodb) and check the command result before resuming traffic.

## Source

[CLI sources](https://github.com/eosrio/hyperion-history-api/tree/e1818923065d648a38009572d76badeab0684af1/src/cli) and [PM2 entry points](https://github.com/eosrio/hyperion-history-api/blob/e1818923065d648a38009572d76badeab0684af1/pm2/ecosystem_settings.cjs).
