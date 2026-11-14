---
title: Verify indexing and serving
---

# Verify indexing and serving

Verify the actual data path after configuring or upgrading Hyperion. Dependency health, indexed history, current state and a consumer's query each answer a different question.

## Check the API and dependencies

Set `HYPERION_URL` to your API base URL, then request health:

```bash
curl --fail-with-body "$HYPERION_URL/v2/health"
```

Inspect each reported component and the deployed version/hash where present. Record the time and chain identity with the result. A successful health response does not prove that every requested historical block or state projection is available.

## Check a known historical range

Choose a small block range containing an action you independently know exists. Query the contract/action and compare its block and transaction identifiers with the chain source.

```bash
curl --fail-with-body --get "$HYPERION_URL/v2/history/get_actions" \
  --data-urlencode "filter=eosio.token:transfer" \
  --data-urlencode "block_num=100000-100100" \
  --data-urlencode "limit=10"
```

The numbers above are placeholders for an illustrative range. Substitute your known range and use filter forms supported by the installed release. Check returned index progress and finality metadata as well as the action data.

## Check state independently

If consumers depend on a current-state endpoint, query a known account or table through that endpoint. Compare its values with the expected chain view and verify its initialization and coverage requirements. History progress alone does not prove state readiness.

For a 4.5 projection or backend change, use the [compatibility and readiness requirements](../releases/compatibility.md) for the exact component set. Do not infer readiness from a running worker or an SDK package being installed.

## Record an acceptance result

Keep the evidence small and reproducible:

| Evidence | Record |
|---|---|
| Artifact | Core version/commit and enabled component pins. |
| Chain | Chain ID, intended endpoints and source range. |
| Health | Component results and observation time. |
| History | Request, known expected action, response identifiers and coverage. |
| State | Required account/table, selected chain view and comparison result. |
| Remaining gaps | Missing inputs, incomplete ranges, unavailable capabilities or mismatches. |

Repeat the affected checks after a repair. Keep a mixed result explicit: history can be available while a state capability is not ready.
