# Index Lifecycle Management

Hyperion includes a built-in **Lifecycle Manager** that handles automatic pruning of old indexed data and tiered storage allocation for Elasticsearch indices. These features operate independently of Elastic's built-in ILM policies, giving operators direct control over data retention and storage tiering.

!!! warning
    Auto pruning **permanently deletes** indexed data. Make sure you understand the retention window before enabling it.

## Index Partitioning

Before configuring lifecycle management, it's important to understand how Hyperion organizes data on Elasticsearch.

Hyperion splits action, delta, and block data into multiple Elasticsearch indices based on block ranges. The `index_partition_size` setting in `settings` controls how many blocks each index partition holds.

For example, with the default `index_partition_size` of `10000000` (10 million blocks), the indices would look like:

```
eos-action-v1-000001   → blocks 1 to 10,000,000
eos-action-v1-000002   → blocks 10,000,001 to 20,000,000
eos-action-v1-000003   → blocks 20,000,001 to 30,000,000
...
```

!!! danger "Do not change `index_partition_size` after indexing has started"
    The `index_partition_size` defines the physical boundary of every index. Changing it after data has been indexed
    will cause misalignment between existing indices and new ones, leading to data gaps and query errors.
    Choose a value that fits your chain's block production rate and expected data volume **before** you start indexing.

## Auto Pruning

Auto pruning allows you to cap the amount of historical data retained on Elasticsearch. Once enabled, the indexer will automatically delete action, delta, and block indices that fall outside the configured retention window.

This is useful for operators that don't need full history and want to keep disk usage bounded.

### Configuration

To enable auto pruning, set `max_retained_blocks` to a positive value in your chain config under `settings`:

```json
"settings": {
    "index_partition_size": 10000000,
    "max_retained_blocks": 50000000
}
```

- `"max_retained_blocks": 50000000` ⇒ Keep only the last 50 million blocks. Older data is deleted automatically. Set to `0` to disable.

!!! note
    `max_retained_blocks` must be a multiple of `index_partition_size`. If it isn't, Hyperion will automatically round it **up** to the nearest multiple.

### How It Works

1. When the indexer starts, the lifecycle manager runs an initial pruning check
2. During live indexing, a new check is triggered every time the indexer crosses a partition boundary (i.e., every `index_partition_size` blocks)
3. For each check, the manager evaluates all action and delta indices and deletes any that fall entirely outside the retention window
4. Block indices are handled separately:
    - If blocks are stored in a **single index**, old blocks are removed using an Elasticsearch `delete_by_query` operation
    - If blocks are **partitioned** across multiple indices, entire old indices are dropped

After pruning, the `first_indexed_block` cache on Redis is invalidated so the health endpoint reflects the new starting point.

### Monitoring

The `/v2/health` endpoint includes a `pruning` section when auto pruning is enabled:

```json
{
  "pruning": {
    "auto_pruning_enabled": true,
    "max_retained_blocks": 50000000,
    "pruning_check_interval_sec": 5000,
    "next_prune_eta_sec": 2130
  }
}
```

| Field | Description |
|-------|-------------|
| `auto_pruning_enabled` | Whether auto pruning is active |
| `max_retained_blocks` | Configured retention window in blocks |
| `pruning_check_interval_sec` | Time between pruning checks (derived from partition size and block time) |
| `next_prune_eta_sec` | Estimated seconds until the next pruning check |

You can also monitor pruning activity in the indexer logs. The lifecycle manager logs a detailed report for each pruning cycle, including which indices were evaluated and which were deleted.

## Tiered Index Allocation

Tiered index allocation allows you to move aged indices to different Elasticsearch node tiers (e.g., hot → warm → cold). This is useful for clusters with mixed storage, where recent data should live on fast NVMe nodes and older data can be moved to larger, slower disks.

### Prerequisites

Your Elasticsearch nodes must be configured with custom node attributes that identify their tier. Add the following to each node's `elasticsearch.yml`:

```yaml
# Hot tier node (fast SSD/NVMe storage)
node.attr.data: hot

# Warm tier node (larger, slower storage)
node.attr.data: warm
```

After updating the configuration, restart each Elasticsearch node for the attribute to take effect.

You can verify the attributes are set correctly:

```bash
curl -sk "https://localhost:9200/_cat/nodeattrs?v&h=name,attr,value" -u <user>:<password>
```

### Configuration

Add the `tiered_index_allocation` object to `settings` in your chain config:

```json
"settings": {
    "index_partition_size": 10000000,
    "max_retained_blocks": 50000000,
    "tiered_index_allocation": {
        "enabled": true,
        "max_age_days": 30,
        "require_node_attributes": {
            "data": "warm"
        }
    }
}
```

| Option | Type | Description |
|--------|------|-------------|
| `enabled` | `boolean` | Enable or disable tiered allocation |
| `max_age_days` | `number` | Move indices older than this many days (based on index creation date) |
| `max_age_blocks` | `number` | Move indices whose final block is more than this many blocks behind head |
| `require_node_attributes` | `object` | Node attributes that **must** be present on the target node |
| `include_node_attributes` | `object` | Node attributes to **prefer** on the target node |
| `exclude_node_attributes` | `object` | Node attributes to **avoid** on the target node |

You can use `max_age_days`, `max_age_blocks`, or both. If both are set, an index is eligible for tiered allocation if **either** condition is met.

!!! tip
    `require_node_attributes` is the most common option. Use it to enforce that old indices are moved to a specific tier.
    `include_node_attributes` and `exclude_node_attributes` provide more flexible routing when you have multiple tiers.

### How It Works

Tiered allocation runs as part of the pruning cycle. After old indices are pruned (if auto pruning is enabled), the lifecycle manager checks the remaining action and delta indices against the configured age thresholds.

For each index that exceeds the threshold, the manager applies the configured allocation rules using the Elasticsearch [index-level shard allocation](https://www.elastic.co/guide/en/elasticsearch/reference/current/shard-allocation-filtering.html){:target="_blank"} settings. This tells Elasticsearch to relocate the index's shards to nodes matching the specified attributes.

!!! note
    Tiered allocation only applies to **action** and **delta** indices. Block indices are not affected.

## Why Not Use Elasticsearch ILM?

Elasticsearch ships with its own [Index Lifecycle Management (ILM)](https://www.elastic.co/guide/en/elasticsearch/reference/current/index-lifecycle-management.html){:target="_blank"} that can handle rollover, shrink, and delete operations. While ILM is a powerful general-purpose tool, Hyperion's built-in lifecycle manager is specifically designed around how Hyperion organizes and queries blockchain data.

Here's why Hyperion manages its own index lifecycle:

| | Hyperion Lifecycle Manager | Elasticsearch ILM |
|---|---|---|
| **Partition awareness** | Understands Hyperion's block-range partitioning scheme. Pruning decisions are based on block numbers, not index age or document count | Operates on generic rollover triggers (size, age, doc count) with no knowledge of block ranges |
| **Block-based retention** | Retention is defined in blocks (`max_retained_blocks`), which maps directly to chain history depth | Retention is defined in time or size, making it hard to guarantee a specific block range |
| **Coordinated cleanup** | Prunes action, delta, and block indices together in a single cycle, keeping them aligned | Each index type would need a separate ILM policy, with no coordination between them |
| **Health API integration** | Pruning status is exposed on `/v2/health` with ETA and retention info. The `first_indexed_block` cache is automatically invalidated after pruning | No integration with Hyperion's health endpoint. Stale `first_indexed_block` values could be served until cache expires |
| **Tiered allocation by block age** | Can move indices based on how far behind the chain head they are (`max_age_blocks`), which is more meaningful for blockchain data | Only supports time-based age triggers, which don't account for chain halt or catch-up scenarios |
| **No license requirements** | Works with any Elasticsearch distribution, including the free/open versions | Some ILM features require a paid Elastic license |

!!! tip
    If you are already using Elasticsearch ILM for other workloads, you can still use it alongside Hyperion's lifecycle manager — just make sure your ILM policies **do not** target Hyperion's indices (e.g., `<chain>-action-*`, `<chain>-delta-*`, `<chain>-block-*`). Let the Hyperion lifecycle manager handle those.

## Configuration Reference

All index lifecycle settings are placed under the `settings` section of your chain config file:

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `index_partition_size` | `number` | `10000000` | Number of blocks per index partition. **Do not change after indexing.** |
| `max_retained_blocks` | `number` | `0` | Maximum blocks to retain. Older data is auto-pruned. `0` = disabled |
| `tiered_index_allocation.enabled` | `boolean` | `false` | Enable tiered index allocation |
| `tiered_index_allocation.max_age_days` | `number` | — | Age threshold in days for allocation |
| `tiered_index_allocation.max_age_blocks` | `number` | — | Age threshold in blocks for allocation |
| `tiered_index_allocation.require_node_attributes` | `object` | — | Required node attributes for allocation targets |
| `tiered_index_allocation.include_node_attributes` | `object` | — | Preferred node attributes for allocation targets |
| `tiered_index_allocation.exclude_node_attributes` | `object` | — | Excluded node attributes for allocation targets |

See the [Chain Configuration Reference](../setup/chain.md) for the complete list of settings.

