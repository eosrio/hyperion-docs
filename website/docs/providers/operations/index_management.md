---
title: Index lifecycle management
---

# Index lifecycle management

Hyperion partitions indexed history and can prune retained data or move aged indices using node attributes. These application policies are separate from Elasticsearch ILM.

## Index partitioning

`settings.index_partition_size` defines the block ranges used for action/delta partitions. The reference value is 10,000,000. Preserve this value after indexing starts unless performing an explicit repartitioning migration; simply editing the number does not move existing documents.

Inspect index names, aliases, document counts and block coverage before changing storage policy. `./hyp-es-config list` lists indices and `./hyp-es-config tasks` inspects reindexing work. Repartition and cleanup commands mutate data and require a separate migration/verification plan.

## Auto pruning

Set `settings.max_retained_blocks` to a positive block window to enable pruning; zero disables it. The lifecycle manager rounds a nonmultiple up to a partition boundary. Pruning permanently removes old indexed data.

```json
{
  "settings": {
    "index_partition_size": 10000000,
    "max_retained_blocks": 50000000
  }
}
```

This fragment illustrates a 50-million-block retention window. Merge it into your reviewed chain configuration, preserving its other fields. Verify backups and advertised API coverage before enabling it.

### How it works

The lifecycle manager checks eligible old action/delta partitions and handles block retention according to the index layout. Live partition-boundary crossings trigger checks. A cached health starting block is invalidated when pruning changes retained coverage.

### Monitoring

Inspect lifecycle logs, actual index ranges and `/v2/health`. The health response can include pruning configuration and an estimated next-check time. Treat the estimate as scheduling information; verify deletion and retained coverage through the stored data.

## Tiered index allocation

### Prerequisites

Assign deliberate node attributes and ensure the destination nodes have capacity. Follow the Elasticsearch version's allocation and shard-recovery rules. Attribute names are deployment-specific.

### Configuration

```json
{
  "settings": {
    "tiered_index_allocation": {
      "enabled": true,
      "max_age_days": 30,
      "require_node_attributes": {"data": "warm"}
    }
  }
}
```

The manager requires meaningful attribute constraints before enabling allocation. Age and capacity choices belong to the deployment. Inspect shard placement and allocation explanations after changing policy; a configured target does not establish successful relocation.

## Recovery and changes

Do not combine a retention change with an unplanned partition-size or index-version change. Record pre/post ranges and verify both API queries and any archive/projection dependency on the affected source. Tier movement preserves indexed content; pruning removes it.

## Configuration reference

| Setting under `settings` | Meaning |
|---|---|
| `index_partition_size` | Block span per partition; template 10,000,000. |
| `max_retained_blocks` | Retention window; template zero disables pruning. |
| `tiered_index_allocation.enabled` | Enables attribute-based movement when meaningful constraints exist. |
| `tiered_index_allocation.max_age_days` | Age threshold based on index creation time. |
| `tiered_index_allocation.max_age_blocks` | Block-age threshold relative to the observed chain/index progress. |
| `tiered_index_allocation.require_node_attributes` | Required destination attributes. |
| `tiered_index_allocation.include_node_attributes` | Included destination attributes. |
| `tiered_index_allocation.exclude_node_attributes` | Excluded destination attributes. |

Pruning health fields include `auto_pruning_enabled`, `max_retained_blocks`, `pruning_check_interval_sec` and `next_prune_eta_sec` when supplied by the running implementation. Interpret them alongside actual index/shard state. Avoid overlapping Elasticsearch ILM policies that compete with Hyperion's allocation or retention decisions.

## Source

[Lifecycle implementation](https://github.com/eosrio/hyperion-history-api/blob/e1818923065d648a38009572d76badeab0684af1/src/indexer/modules/lifecycleManager.ts) and [index migration CLI](https://github.com/eosrio/hyperion-history-api/blob/e1818923065d648a38009572d76badeab0684af1/src/cli/hyp-es-config.ts).
