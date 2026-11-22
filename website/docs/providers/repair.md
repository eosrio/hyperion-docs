---
title: Repair indexed data
---

# Repairing indexed data

Use `hyp-repair` to inspect missing or forked indexed blocks and request bounded replay. Repairing Elasticsearch documents is distinct from repairing a node's block/SHIP logs or rebuilding a state projection.

## Forks and missed blocks

First establish the affected chain, range and source availability. Retain an index/database backup and verify that the connected node can supply the needed blocks, traces and deltas. A requested replay cannot reconstruct source bytes that no retained source has.

### Test the connection

```bash
./hyp-repair connect --host ws://127.0.0.1:7002
```

The port is an example. Use the chain connection's `control_port`; keep the control endpoint private. A successful connection proves controller reachability, not historical completeness.

### Scan

```bash
./hyp-repair scan mychain --first 1000000 --last 1001000
```

The range is illustrative. Supply your affected range to bound the scan. Use `--out-file` when you need a specific output location; otherwise inspect the scan's reported `.repair` filename. `scan-actions` is a separate command for missing action coverage; block continuity alone does not prove all actions were indexed.

### Verify the saved scan file

```bash
./hyp-repair view .repair/<reported-scan-file>.json
```

Check the chain, endpoints and exact missing/forked ranges. Keep the unmodified scan as incident evidence.

### Request

For missing blocks, inspect the operation first:

```bash
./hyp-repair fill-missing mychain .repair/<missing-blocks-file>.json --dry
```

Remove `--dry` only after reviewing the range, source availability and effect. For a forked-block scan, use `./hyp-repair repair mychain .repair/<forked-blocks-file>.json --dry` before the actual repair. The repair path can remove indexed records before requesting replay; it is not a read-only command.

### Verify the results

Repeat the bounded scan and query known affected transactions/actions. Check state capabilities independently and inspect unsettled/retrying work. A controller accepting the request does not prove replay completion or source coverage.

## Source

[4.5 repair commands and flags](https://github.com/eosrio/hyperion-history-api/blob/e1818923065d648a38009572d76badeab0684af1/src/cli/hyp-repair.ts). Use `./hyp-repair --help` from the deployed artifact when diagnosing a version mismatch.
