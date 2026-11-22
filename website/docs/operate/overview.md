---
title: Run Hyperion
slug: /providers/get-started/
---

# Run Hyperion

Operate Hyperion 4.5 by establishing its source, storage and serving paths separately. Start with a supported host/runtime combination, configure the chain, then verify data that consumers actually need.

## Choose an installation

| Environment | Guide |
|---|---|
| Managed Linux services | [Manual installation](/providers/install/manual_install/) |
| Reproducible provisioning | [Automated installation](/providers/install/auto_install/) |
| Windows development host | [WSL2](/providers/install/wsl2/) |
| Containers and separate services | [Docker](/providers/install/docker/) |
| Linux system container | [LXD](/providers/install/lxd/) |

Node 22/24, native-addon ABI/libc compatibility and the data-service versions are independent choices. See [component compatibility](/releases/compatibility/) before reusing a historical image or changing a database major version.

## Prepare the source

Confirm the chain ID, RPC endpoint, SHiP endpoint and retained source range. Source coverage must include the blocks, traces, deltas and ABI inputs required by the capabilities you enable. A snapshot or running node does not imply complete historical input.

## Configure Hyperion

Create `config/connections.json` and `config/chains/<chain>.config.json` using the [configuration guide](configure-chain.mdx). Validate dependencies and the selected chain before starting the workers. Keep control/management services private and bind only the intended public API.

## Verify indexing and serving

Check dependency health, known indexed history, state consumers and the API independently. Follow [verification](verify-indexing.md), then retain the exact artifact/component pins and observed source ranges with the result.

## Operate and recover

- [Upgrade while preserving history](/providers/update/).
- [Manage retention and tiered storage](/providers/operations/index_management/).
- [Repair missing/forked indexed data](/providers/repair/).
- Diagnose [indexer](/providers/help/indexer/), [Elasticsearch](/providers/help/elasticsearch/) and [RabbitMQ](/providers/help/rabbit/) failures before resetting data.

Current-state initialization, new protocol activation and retained-history upgrades have different prerequisites. Limit a recovery action to the affected scope and verify it afterward.
