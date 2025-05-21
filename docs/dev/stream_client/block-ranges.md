# Block Range Parameters (`start_from` & `read_until`)

When requesting action or delta streams using the Hyperion Stream Client, the `start_from` and `read_until` parameters are crucial for defining the range of blockchain history you're interested in, or for controlling live data flow. Both parameters accept the same types of values.

## Overview

*   **`start_from`**: Defines the point in the blockchain's history (or live feed) from which the stream should begin sending data.
*   **`read_until`**: Defines the point at which the stream should stop sending data. If `ignore_live: false` (the default), and `read_until` is set to a point in the past or `0`, the stream will continue with live data after historical data is exhausted.

If both `start_from` and `read_until` specify a range that has already passed, and `ignore_live: true`, the stream will send the historical data within that range and then end.

## Accepted Value Types

Both `start_from` and `read_until` accept the following three types of values:

### 1. Positive Number (Absolute Block Number)

*   **Description**: Represents a specific, absolute block number on the blockchain. The stream will start or stop at this exact block.
*   **Type**: `number`
*   **Example Usage**:
    *   `start_from: 150000000` (Start streaming data from block 150,000,000 onwards)
    *   `read_until: 150000100` (Stop streaming after block 150,000,100 has been processed)

```typescript
// Example: Stream actions from block 10,000,000 to 10,000,050
const stream = await client.streamActions({
  contract: "eosio.token",
  action: "transfer",
  start_from: 10000000,
  read_until: 10000050,
  ignore_live: true // Important if you only want this specific historical range
});
```

### 2. Zero or Negative Number (Relative to Head Block)

*   **Description**: Represents a block number relative to the current head block of the blockchain *at the time the stream request is processed by the Hyperion server* (for `start_from`) or *as the stream progresses* (for `read_until` in live mode).
    *   `0`: Represents the current head block.
        *   `start_from: 0`: Start streaming live data from the current head.
        *   `read_until: 0`: If `start_from` is in the past, read history up to the current head, then continue live indefinitely (if `ignore_live: false`). If `start_from` is also `0`, this means stream live indefinitely. If `ignore_live: true`, read up to the current head and stop.
    *   **Negative Number** (e.g., `-100`): Represents N blocks *before* the current head block.
        *   `start_from: -100`: Start streaming from 100 blocks prior to the current head block.
        *   `read_until: -50`: Stop streaming when the block 50 blocks prior to the current head (dynamically, if live) is processed.
*   **Type**: `number`
*   **Example Usage**:
    *   `start_from: 0` (Start live streaming from the current moment)
    *   `start_from: -500` (Start streaming from 500 blocks ago)
    *   `read_until: -10` (If live, stop when the block that is 10 blocks behind the *then-current* head is processed. If historical, stop 10 blocks before the head at the end of the historical replay).

```typescript
// Example: Stream the last 100 blocks of actions and then continue live
const stream = await client.streamActions({
  contract: "eosio.token",
  action: "transfer",
  start_from: -100,
  read_until: 0, // Continue live
  // ignore_live: false (default)
});

// Example: Stream only the last 20 blocks and then stop
const historicalStream = await client.streamActions({
  contract: "eosio.token",
  action: "transfer",
  start_from: -20,
  read_until: 0,    // Read up to current head
  ignore_live: true // Then stop
});
```

### 3. ISO 8601 Timestamp String (Specific Point in Time)

*   **Description**: Represents a specific date and time. Hyperion will find the block produced at or closest (usually just after) this timestamp to start or stop the stream. The timestamp should be in UTC.
*   **Format**: `YYYY-MM-DDTHH:mm:ss.sssZ` (milliseconds `.sss` are optional; `Z` denotes UTC).
*   **Type**: `string`
*   **Example Usage**:
    *   `start_from: "2023-01-01T00:00:00Z"` (Start streaming from the first block on or after Jan 1, 2023, 00:00 UTC)
    *   `read_until: "2023-01-31T23:59:59.999Z"` (Stop streaming after the last block on or before Jan 31, 2023, 23:59:59.999 UTC)

```typescript
// Example: Stream actions from a specific hour on a specific day
const stream = await client.streamActions({
  contract: "eosio.system",
  action: "voteproducer",
  start_from: "2024-03-15T14:00:00Z",
  read_until: "2024-03-15T15:00:00Z",
  ignore_live: true
});
```

## Common Scenarios and Combinations

*   **Live Streaming from Now:**
    *   `start_from: 0`
    *   `read_until: 0` (or omitted, with `ignore_live: false`)

*   **Recent History then Live:**
    *   `start_from: -N` (e.g., `-1000` for last 1000 blocks)
    *   `read_until: 0` (or omitted, with `ignore_live: false`)

*   **Specific Historical Range Only:**
    *   `start_from: <block_num_A | timestamp_A>`
    *   `read_until: <block_num_B | timestamp_B>`
    *   `ignore_live: true` (crucial to ensure it stops after the range)

*   **All History from a Point then Live:**
    *   `start_from: <block_num | timestamp>`
    *   `read_until: 0` (or omitted, with `ignore_live: false`)

*   **Stream Only the Last N Blocks and Stop:**
    *   `start_from: -N`
    *   `read_until: 0` (Hyperion reads up to the head when historical fetch completes)
    *   `ignore_live: true`

## Important Considerations

*   **`ignore_live: true`**: If you want the stream to definitively stop after processing a historical range (defined by `start_from` and `read_until`), you **must** set `ignore_live: true`. Otherwise, if `read_until` is `0` or a point in the past, the stream will transition to live data.
*   **Server-Side Resolution**: The exact block numbers corresponding to negative offsets or timestamps are determined by the Hyperion server.
*   **Block Production Rate**: When using negative numbers or timestamps, be mindful of the blockchain's block production rate to estimate the number of blocks or duration.
*   **Stream Termination**: When `read_until` is reached and `ignore_live: true`, the stream will naturally end. If using the AsyncIterator pattern, it will yield `null`. If using the event-driven API, no more `'message'` events will be emitted for that stream. You might also receive a specific "history_end" type message from the server internally, which the client handles to terminate the async iterator.

Understanding these parameters allows you to precisely control the data window for your streams, whether you're replaying history or tapping into the live pulse of the blockchain.

## Next Steps

*   **Streaming Actions**: See how these parameters are used in [Streaming Actions](./streaming-actions.md).
*   **Streaming Table Deltas**: See their application in [Streaming Table Deltas](./streaming-table-deltas.md).
*   **Handling Stream Data**: Learn how to process the data you receive in [Handling Stream Data](./data-handling.md).