---
title: Elasticsearch operations
---

# Elasticsearch cluster operations

Inspect cluster identity, shard state and the exact failing query or write before changing cluster settings. Preserve index and source ranges with the incident record.

## Cluster health check

Use authenticated TLS requests appropriate to your cluster:

```bash
curl --fail-with-body --cacert /path/to/http_ca.crt --user elastic \
  'https://127.0.0.1:9200/_cluster/health?pretty'
curl --fail-with-body --cacert /path/to/http_ca.crt --user elastic \
  'https://127.0.0.1:9200/_cat/shards?v'
```

The CA path and credentials are deployment-specific. Check unassigned primaries, disk watermarks, node departures and active recovery. A yellow single-node cluster can reflect unassigned replicas; red means at least one primary is unavailable.

## Rolling upgrade

Follow [Elastic's version-specific upgrade procedure](https://www.elastic.co/docs/deploy-manage/upgrade/deployment-or-cluster/elasticsearch). Verify the supported source/target path, plugin compatibility, snapshots and recovery plan. Do not promise zero downtime merely because a procedure is called rolling.

### Prerequisites

Verify the snapshot can be restored, required indices are compatible and the cluster has sufficient redundancy/capacity. Coordinate Hyperion read/write traffic and query verification separately.

### Upgrade each node

Apply the upstream node order, allocation controls and recovery checks for the chosen versions. Retain every temporary setting so it can be restored. Confirm each node rejoins and shards recover before continuing. Installing a newer package on all nodes simultaneously is a different downtime/availability plan.

### Verify

Restore temporary allocation settings, check cluster/shard health and execute representative Hyperion reads and writes. Elasticsearch downgrades are not supported; returning to an earlier server normally requires an empty compatible cluster and a suitable snapshot restore.

## Troubleshooting

### HTTP port 9200 not listening

Inspect `systemctl status elasticsearch`, service logs, bind addresses, TLS settings and container port mappings. Separate HTTP authentication/TLS failure from a missing listener. Check memory, disk and file limits when startup fails.

### Node won't restart (node.lock error)

Establish which process owns the data directory and whether another container/service has mounted it. Preserve the data path and lock evidence. Removing a lock file while another process owns the storage can corrupt the deployment.

### Preventing automatic ES restarts

Review the service manager and container restart policy during planned maintenance. Restore the intended policy afterward. Preventing a restart does not make outstanding writes durable or substitute for a graceful shutdown.

### Cluster red after node restart

Inspect allocation explanations, missing data paths, node roles and shard recovery. Do not delete indices or force stale primary allocation without understanding the data-loss boundary and recovery source.

## Hyperion query failures

Timed-out or incomplete shard responses must not be treated as complete successful history. Preserve the HTTP status/error and bounds. Reduce a query's scope or repair the dependency; returning an empty array would hide unavailable data.

## Source

[4.5 Elasticsearch evidence and limits](https://github.com/eosrio/hyperion-history-api/blob/e1818923065d648a38009572d76badeab0684af1/docs/es955-qualification.md) and [query implementation](https://github.com/eosrio/hyperion-history-api/blob/e1818923065d648a38009572d76badeab0684af1/src/api/routes/v2-history/get_actions/get_actions.ts).
