# Streaming Table Deltas

The Hyperion Stream Client enables you to subscribe to a stream of table delta traces, providing real-time or historical insight into how data within smart contract tables changes over time. This is invaluable for tracking state changes, such as account balances, NFT ownership, game states, or any data stored in on-chain tables.

You initiate a table delta stream using the `client.streamDeltas(request)` method.

## `client.streamDeltas(request)`

This asynchronous method sends a request to the Hyperion server to start streaming table delta traces based on the criteria defined in the `request` object. It returns a `Promise` that resolves to a `HyperionStream` instance, which you can then use to listen for messages.

```typescript
import { HyperionStreamClient, StreamDeltasRequest, IncomingData, DeltaContent } from "@eosrio/hyperion-stream-client";

// Assuming 'client' is an initialized and connected HyperionStreamClient instance

async function setupDeltaStream() {
  const requestOptions: StreamDeltasRequest = {
    code: "eosio.token",
    table: "accounts",
    scope: "myuseraccnt", // Optional: filter by table scope
    payer: "",           // Optional: filter by RAM payer
    start_from: 0,       // Start from HEAD block
    read_until: 0,       // Stream indefinitely
    filters: [
      { field: "data.balance", value: "0.0000 EOS", operator: "ne" } // Only non-zero balances
    ]
  };

  try {
    const deltaStream = await client.streamDeltas(requestOptions);
    console.log("Delta stream request successful. UUID:", deltaStream.reqUUID);

    deltaStream.on("message", (message: IncomingData<DeltaContent>) => {
      console.log("Received delta:", message.content.data);
      console.log(`  Present (row exists after delta): ${message.content.present === 1}`);
    });

    deltaStream.on("error", (error) => {
      console.error("Stream error:", error);
    });

    // To stop the stream later:
    // deltaStream.stop();

  } catch (error) {
    console.error("Failed to initiate delta stream:", error);
  }
}
```

## Request Parameters (`StreamDeltasRequest`)

The `request` object passed to `client.streamDeltas()` can contain the following properties:

---

### `code`
*   **Type**: `string`
*   **Required**: Yes
*   **Description**: The account name of the smart contract that owns the table(s) you want to monitor.
*   **Example**: `"eosio.token"`, `"atomicassets"`

---

### `table`
*   **Type**: `string`
*   **Required**: Yes
*   **Description**: The name of the table within the `code` contract for which you want to stream deltas.
    *   You can specify a single table name (e.g., `"accounts"`).
    *   Use an asterisk (`"*"`) to stream deltas from all tables within the specified `code` contract.
*   **Example**: `"accounts"`, `"assets"`, `"*"`

---

### `scope`
*   **Type**: `string`
*   **Optional**: Yes
*   **Default**: `""` (empty string, meaning deltas from any scope within the table will be included)
*   **Description**: The specific scope within the table to filter by. Many contracts use account names as scopes.
*   **Example**: `"myuseraccnt1"`, `"eosio"`

---

### `payer`
*   **Type**: `string`
*   **Optional**: Yes
*   **Default**: `""` (empty string, meaning deltas paid for by any account will be included)
*   **Description**: Filter deltas by the account name that paid for the RAM for the table row.
*   **Example**: `"rampayeracct"`

---

### `start_from`
*   **Type**: `number | string`
*   **Optional**: Yes
*   **Default**: `0`
*   **Description**: Defines the starting point of the stream.
    *   `0`: Start from the current head block of the blockchain (live streaming).
    *   **Positive Number**: Start from this specific absolute block number (e.g., `150000000`).
    *   **Negative Number**: Start from a block relative to the current head block. For example, `-100` starts streaming 100 blocks before the current head.
    *   **ISO 8601 Timestamp String**: Start from the block closest to the specified date and time (e.g., `"2023-01-01T00:00:00.000Z"`).
*   **See Also**: [Block Range Parameters](./block-ranges.md) for a more detailed explanation.

---

### `read_until`
*   **Type**: `number | string`
*   **Optional**: Yes
*   **Default**: `0`
*   **Description**: Defines the ending point of the stream.
    *   `0`: Stream indefinitely (or until `ignore_live: true` and historical data is complete).
    *   **Positive Number**: Stop at this specific absolute block number.
    *   **Negative Number**: Stop at a block relative to the current head block.
    *   **ISO 8601 Timestamp String**: Stop at the block closest to this specified date and time.
*   **See Also**: [Block Range Parameters](./block-ranges.md)

---

### `filters`
*   **Type**: `RequestFilter[]` (Array of `RequestFilter` objects)
*   **Optional**: Yes
*   **Default**: `[]` (empty array, no additional data filters)
*   **Description**: An array of filter objects to perform server-side filtering based on the content of the table row data. Each `RequestFilter` object has:
    *   `field` (string): A dot-notation path to the field within the delta's `data` object (e.g., `"data.balance"`, `"payer"`, `"primary_key"`). Hyperion might also provide special `@` prefixed fields for decoded data from specific common tables (e.g., `@accounts.balance`).
    *   `value` (string | number | boolean): The value to compare against.
    *   `operator` (string, optional): The comparison operator. Defaults to `"eq"` (equals). Supported operators include:
        *   `"eq"`: equals
        *   `"ne"`: not equals
        *   `"gt"`: greater than
        *   `"lt"`: less than
        *   `"gte"`: greater than or equal to
        *   `"lte"`: less than or equal to
        *   `"contains"`: (for string fields) field contains the value
        *   `"starts_with"`: (for string fields) field starts with the value
        *   `"ends_with"`: (for string fields) field ends with the value
*   **Example**:
    ```typescript
    filters: [
      { field: "data.owner", value: "myuseraccnt1" }, // Row's owner field === 'myuseraccnt1'
      { field: "data.value", value: 100, operator: "gt" } // Row's value field > 100
      { field: "payer", value: "otheraccount" } // RAM payer for the row is 'otheraccount'
    ]
    ```
*   **Note**: Refer to Hyperion's [index template definitions](https://github.com/eosrio/Hyperion-History-API/blob/main/definitions/index-templates.ts) to understand available indexed fields for deltas and the structure of `data`.

---

### `filter_op`
*   **Type**: `'and' | 'or'`
*   **Optional**: Yes
*   **Default**: `"and"` (Note: Documentation for some client versions might imply "or" as default for deltas; always verify or specify explicitly. The provided source code for v3.6 client suggests it defaults to "and" behavior if not set, but the server might have its own default. It's best to specify this for clarity if using multiple filters).
*   **Description**: Specifies the logical operator to use when multiple `filters` are provided.
    *   `"and"`: All filter conditions must be met.
    *   `"or"`: At least one filter condition must be met.
*   **Example**:
    ```typescript
    // Deltas where data.fieldA IS 'X' OR data.fieldB IS 'Y'
    filters: [
      { field: "data.fieldA", value: "X" },
      { field: "data.fieldB", value: "Y" }
    ],
    filter_op: "or"
    ```

---

### `ignore_live`
*   **Type**: `boolean`
*   **Optional**: Yes
*   **Default**: `false`
*   **Description**:
    *   If `true`, the stream will stop after all historical data (up to `read_until` or the current head block if `read_until` is 0) has been sent. It will not send live blocks.
    *   If `false`, the stream will transition to sending live blocks after historical data is complete.

---

### `replayOnReconnect`
*   **Type**: `boolean`
*   **Optional**: Yes
*   **Default**: `false`
*   **Description**:
    *   If `true`, and the client disconnects and then reconnects, it will attempt to resend this stream request, automatically adjusting `start_from` to the block number *after* the last successfully received block for this stream.
    *   If `false`, the stream request is not automatically resent on reconnect.
*   **Recommendation**: Set to `true` for long-running, critical streams.

## Handling the Delta Stream

The `await client.streamDeltas(request)` method returns a `HyperionStream` object. You interact with it similarly to action streams:

*   **`stream.on("message", (data: IncomingData<DeltaContent>) => { ... })`**:
    This event is fired for each table delta received. The `data` object contains:
    *   `data.uuid`: The unique identifier for this stream request.
    *   `data.type`: Will be `"delta"`.
    *   `data.mode`: `"live"` or `"history"`.
    *   `data.content`: A `DeltaContent` object containing details of the table row change (e.g., `code`, `table`, `scope`, `data`, `present`).
        *   `data.content.present`: `1` if the row exists (or was created/updated) after this delta, `0` if the row was deleted.
    *   `data.irreversible`: `true` if this message is confirmed irreversible (relevant if `client.options.libStream` is true).
        See [Handling Stream Data](./data-handling.md) for more on `DeltaContent`.

*   **`stream.on("error", (error: any) => { ... })`**:
    Fired if an error occurs specific to this stream.

*   **`stream.on("start", (response: { status: string, reqUUID: string, startingBlock: number | string }) => { ... })`**:
    Fired when the Hyperion server acknowledges and successfully starts the stream request.

## Stopping a Delta Stream

To stop receiving data for a specific delta stream:

```typescript
// Assuming 'deltaStream' is the object returned by client.streamDeltas()
deltaStream.stop();
console.log("Requested to stop delta stream:", deltaStream.reqUUID);
```

## Examples

### 1. Monitor Live Changes to a Specific Account's Balances

```typescript
async function monitorUserBalances(userName: string) {
  if (!client.online) { console.error("Client not connected"); return; }
  try {
    const stream = await client.streamDeltas({
      code: "eosio.token",
      table: "accounts",
      scope: userName, // Scope is often the user's account name for balances
      start_from: 0,   // Live
      replayOnReconnect: true
    });

    stream.on("message", (msg) => {
      console.log(`Live balance update for ${userName}:`, msg.content.data.balance);
    });
    console.log(`Listening for live eosio.token balance changes for ${userName}...`);
  } catch (e) { console.error(e); }
}
```

### 2. Get Historical Deltas for a Specific Table with Data Filtering

```typescript
async function getHistoricalAssetChanges(ownerName: string) {
  if (!client.online) { console.error("Client not connected"); return; }
  try {
    const stream = await client.streamDeltas({
      code: "atomicassets", // Example contract
      table: "assets",       // Example table
      start_from: "2023-01-01T00:00:00.000Z",
      read_until: "2023-01-02T00:00:00.000Z",
      ignore_live: true,
      filters: [
        { field: "data.owner", value: ownerName }
      ]
    });

    console.log(`Fetching historical asset deltas for owner ${ownerName}:`);
    for await (const message of stream) {
      if (message === null) break;
      console.log(`  Asset ID ${message.content.primary_key}:`, message.content.data);
    }
    console.log("Finished fetching asset deltas.");
  } catch (e) { console.error(e); }
}
```

## Next Steps

*   **Handling Stream Data**: Learn more about the `DeltaContent` structure and using the AsyncIterator pattern in [Handling Stream Data](./data-handling.md).
*   **Streaming Actions**: If you need to track contract actions rather than table state, see [Streaming Actions](./streaming-actions.md).
*   **Client Configuration**: Review all [Client Configuration](./configuration.md) options.