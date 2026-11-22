---
title: Docker deployment
---

# Hyperion Docker

Keep application, database and chain-node lifecycles separate. A container image must contain the same pinned 4.5 source, lockfile and prepared component artifacts as a native installation.

## Architecture

### Layers

| Layer | Services |
|---|---|
| Chain | RPC and SHiP node, with durable chain/history volumes. |
| Infrastructure | Elasticsearch, RabbitMQ, Redis and configured MongoDB. |
| Hyperion | API and indexer processes built from one release artifact. |
| Operator tools | Optional Kibana and management interfaces. |

### Image infrastructure

Use a Linux base compatible with the locked native addons, such as the glibc baseline in Debian 13. A `node:22` tag without a distribution suffix does not describe the libc contract precisely. Pin image digests in the deployment record.

## Getting started

### Prerequisites

Install Docker Engine and Compose, provision durable database volumes, and establish a private network for service traffic. Choose explicit host bindings only for the interfaces you intend to expose. The [manual guide](manual_install.md) describes service responsibilities and credentials.

### Infrastructure layer

Use a reviewed Compose definition for your selected service versions. Run `docker compose config` to inspect interpolation and effective volume/network bindings before `docker compose up -d`. Set the exact RabbitMQ virtual host in both the broker and Hyperion connection file.

The older [hyperion-docker repository](https://github.com/eosrio/hyperion-docker) has independently versioned examples. Inspect its pins before reusing a Compose file; it is not the source of core release compatibility.

### Leap (nodeos) layer

Run the selected Antelope node with RPC/SHiP enabled and durable history volumes. Use container service names or the intended host gateway in Hyperion connections; a loopback address inside the Hyperion container does not reach a different container.

### Hyperion layer

Build from the selected 4.5 revision with `npm ci`, keeping dependency preparation enabled. Mount the configuration under the application's `config/` directory and a persistent log directory. Run API and indexer as separate services using the emitted JavaScript entry points:

```bash
CONFIG_JSON=config/chains/mychain.config.json node build/indexer/launcher.js
CONFIG_JSON=config/chains/mychain.config.json node build/api/server.js
```

Check the release's PM2/systemd definitions for the actual entry points and environment variables before converting them into a container command. Do not nest a second supervisor unless your deployment requires it. Handle graceful indexer shutdown and allow its settlement timeout.

## Running extra tools

Enable optional Compose profiles only for tools you need. Keep Kibana, Redis tooling and RabbitMQ management interfaces private and authenticated.

## Troubleshooting

Inspect `docker compose ps`, application logs, service DNS, volume ownership and the effective configuration. For native addon failures, check image architecture, Node ABI and libc. Avoid deleting volumes or rebuilding databases to resolve a connection error.

## Next steps

Run the CLI's connection/chain checks within the same container network, then complete [indexing and serving verification](/operate/verify-indexing/). Record the image digest and retained source ranges with the result.
