---
title: Query action history
---

# Query action history

Use `/v2/history/get_actions` to retrieve indexed action traces. Start with a specific account, contract/action filter or block range rather than asking a provider to scan its full history.

## Filter actions

| Parameter | Purpose |
|---|---|
| `account` | Match a notified account. |
| `filter` | Select a `contract:action`, such as `eosio.token:transfer`. |
| `limit` | Bound the requested result count; the provider may apply a lower cap. |
| `after`, `before` | Bound the search by the forms supported by the provider's release. |
| `sort` | Request newest-first or oldest-first ordering. |

Generic indexed-field filters are combined with AND. Their availability depends on the mappings used by the installation. See the [generated parameter list](../reference/generated/get-actions.md) for the pinned source declarations.

## Read a bounded historical range

```bash
curl --fail-with-body --get "$HYPERION_URL/v2/history/get_actions" \
  --data-urlencode "filter=eosio.token:transfer" \
  --data-urlencode "block_num=100000-100100" \
  --data-urlencode "limit=10"
```

This block range is illustrative. Confirm that your provider supports this range filter and retains those blocks. A range is useful both for limiting work and for making the intended coverage explicit.

## Paginate carefully

`limit` and `skip` provide offset pagination in the source schema. For large exports, split the workload into bounded ranges and keep progress in your application. Deep offsets can become expensive.

Treat pages near the reversible head as a changing view. New blocks and forks can change results while you paginate. Choose an irreversible range when you need a stable historical export, verify its completeness, and use transaction/action identifiers to detect duplicates.

:::note Ascending queries require after/before bounds
The 4.5 source guard requires a valid `after` or `before` value for `sort=asc` or `sort=1`. A `block_num` or `global_sequence` filter alone does not satisfy this guard. Use positive block-number bounds in `after`/`before` for older ranges; an ISO-date `after` is checked against `api.max_asc_window_days` (runtime fallback 90 days). The v1 compatibility handler also reports invalid ascending bounds in its result; inspect its error body rather than assuming the same HTTP status as v2.
:::

```bash
curl --fail-with-body --get "$HYPERION_URL/v2/history/get_actions" \
  --data-urlencode "filter=eosio.token:transfer" \
  --data-urlencode "after=100000" \
  --data-urlencode "before=100100" \
  --data-urlencode "sort=asc" \
  --data-urlencode "limit=10"
```

Keep returned uint64 sequence identifiers as decimal strings. Do not convert them to JavaScript Number when comparing, storing checkpoints or constructing the next request.

## Interpret counts and coverage

The `track` option controls total-result tracking in the source contract. Check the returned `total.relation` before treating a count as exact. Index progress and provider retention are separate from result count.

For cold payloads, `hydrate` controls archive lookup where the provider supports it. Turning hydration off changes which payload details are returned; it does not extend the indexed time range.

On extension protocols, metadata filters and decoded contract-data filters have different readiness requirements. A decoded-field query without a ready projection returns an explicit unavailable result; hydration of returned rows does not supply a missing query-membership projection.

## Related guidance

- [First successful request](../start/first-query.mdx)
- [Get transaction](../reference/generated/get-transaction.md)
- [Verify index and API progress](../operate/verify-indexing.md)
