# Streaming Actions

The Hyperion Stream Client allows you to subscribe to a real-time or historical stream of action traces from the
blockchain. This is useful for tracking specific smart contract interactions, monitoring account activity, or building
applications that react to on-chain events.

You initiate an action stream using the `client.streamActions(request)` method.

## `client.streamActions(request)`

This asynchronous method sends a request to the Hyperion server to start streaming action traces based on the criteria
defined in the `request` object. It returns a `Promise` that resolves to a `HyperionStream` instance, which you can then
use to listen for messages.

```typescript
import { HyperionStreamClient, StreamActionsRequest, IncomingData, ActionContent } from "@eosrio/hyperion-stream-client";

// Assuming 'client' is an initialized and connected HyperionStreamClient instance

try {
    const actionStream = await client.streamActions({
        contract: "eosio.token",
        action: "transfer",
        account: "",    // Optional: filter by notified account
        start_from: 0, // Start from HEAD block
        read_until: 0, // Stream indefinitely
        filters: [
          { field: "act.data.to", value: "eosio.ram" }
        ]
    });
    console.log("Action stream request successful. UUID:", actionStream.reqUUID);

    actionStream.on("message", (message: IncomingData<ActionContent>) => {
      console.log("Received action:", message.content.act.data);
    });
    
    actionStream.on("error", (error) => {
      console.error("Stream error:", error);
    });

} catch (error) {
    console.error("Failed to initiate action stream:", error);
}
```

## Request Parameters (`StreamActionsRequest`)

The `request` object passed to `client.streamActions()` can contain the following properties:

---

### `contract`

* **Type**: `string`
* **Required**: Yes
* **Description**: The account name of the smart contract whose actions you want to stream.
* **Example**: `"eosio.token"`, `"alien.worlds"`

---

### `action`

* **Type**: `string`
* **Required**: Yes
* **Description**: The name of the action you want to stream.
    * You can specify a single action name (e.g., `"transfer"`).
    * Use an asterisk (`"*"`) to stream all actions executed by the specified `contract`.
* **Example**: `"transfer"`, `"newaccount"`, `"*"`

---

### `account`

* **Type**: `string`
* **Optional**: Yes
* **Default**: `""` (empty string, meaning no account-specific filtering beyond `contract` and `action`)
* **Description**: If provided, the stream will only include actions where this account is involved. Involvement can
  mean:
    * The account is listed in the `act.authorization` array (i.e., authorized the action).
    * The account is the recipient of a notification triggered by the action (i.e., listed in the `notified` array of
      the action trace).
* **Example**: `"myuseraccnt1"`

---

### `start_from`

* **Type**: `number | string`
* **Optional**: Yes
* **Default**: `0`
* **Description**: Defines the starting point of the stream.
    * `0`: Start from the current head block of the blockchain (live streaming).
    * **Positive Number**: Start from this specific absolute block number (e.g., `150000000`).
    * **Negative Number**: Start from a block relative to the current head block. For example, `-100` starts streaming
      100 blocks before the current head.
    * **ISO 8601 Timestamp String**: Start from the block closest to the specified date and time (e.g.,
      `"2023-01-01T00:00:00.000Z"`).
* **See Also**: [Block Range Parameters](./block-ranges.md) for a more detailed explanation.

---

### `read_until`

* **Type**: `number | string`
* **Optional**: Yes
* **Default**: `0`
* **Description**: Defines the ending point of the stream.
    * `0`: Stream indefinitely (or until `ignore_live: true` and historical data is complete).
    * **Positive Number**: Stop at this specific absolute block number.
    * **Negative Number**: Stop at a block relative to the current head block.
    * **ISO 8601 Timestamp String**: Stop at the block closest to this specified date and time.
* **See Also**: [Block Range Parameters](./block-ranges.md)

---

### `filters`

* **Type**: `RequestFilter[]` (Array of `RequestFilter` objects)
* **Optional**: Yes
* **Default**: `[]` (empty array, no additional data filters)
* **Description**: An array of filter objects to perform server-side filtering based on the content of the action data.
  Each `RequestFilter` object has:
    * `field` (string): A dot-notation path to the field within the action's data structure (e.g., `"act.data.to"`,
      `"@transfer.from"`, `"act.authorization.actor"`). Hyperion often provides special `@` prefixed fields for commonly
      accessed, decoded data (like `@transfer.from`, `@transfer.to`, `@transfer.quantity`).
    * `value` (string | number | boolean): The value to compare against.
    * `operator` (string, optional): The comparison operator. Defaults to `"eq"` (equals). Supported operators include:
        * `"eq"`: equals
        * `"ne"`: not equals
        * `"gt"`: greater than
        * `"lt"`: less than
        * `"gte"`: greater than or equal to
        * `"lte"`: less than or equal to
        * `"contains"`: (for string fields) field contains the value
        * `"starts_with"`: (for string fields) field starts with the value
        * `"ends_with"`: (for string fields) field ends with the value
* **Example**:
  ```typescript
  filters: [
    { field: "act.data.to", value: "teamgreymass" }, // transfer.to === 'teamgreymass'
    { field: "act.data.amount", value: 10000, operator: "gte" } // data.amount >= 10000 (assuming amount is numeric)
    { field: "@transfer.memo", value: "payment", operator: "contains" } // memo contains "payment"
  ]
  ```
* **Note**: Refer to
  Hyperion's [index template definitions](https://github.com/eosrio/Hyperion-History-API/blob/main/definitions/index-templates.ts)
  to understand available indexed fields for actions.

---

### `filter_op`

* **Type**: `'and' | 'or'`
* **Optional**: Yes
* **Default**: `"and"`
* **Description**: Specifies the logical operator to use when multiple `filters` are provided.
    * `"and"`: All filter conditions must be met.
    * `"or"`: At least one filter condition must be met.
* **Example**:
  ```typescript
  // Actions where act.data.to IS 'userA' OR act.data.from IS 'userA'
  filters: [
    { field: "act.data.to", value: "userA" },
    { field: "act.data.from", value: "userA" }
  ],
  filter_op: "or"
  ```

---

### `ignore_live`

* **Type**: `boolean`
* **Optional**: Yes
* **Default**: `false`
* **Description**:
    * If `true`, the stream will stop after all historical data (up to `read_until` or the current head block if
      `read_until` is 0) has been sent. It will not send live blocks.
    * If `false`, the stream will transition to sending live blocks after historical data is complete.
* **Example**: To get only the last 100 blocks of `eosio.token::transfer` actions and then stop:
  ```typescript
  {
    contract: "eosio.token",
    action: "transfer",
    start_from: -100,
    read_until: 0, // Read up to current head
    ignore_live: true
  }
  ```

---

### `replayOnReconnect`

* **Type**: `boolean`
* **Optional**: Yes
* **Default**: `false`
* **Description**:
    * If `true`, and the client disconnects and then reconnects, it will attempt to resend this stream request,
      automatically adjusting `start_from` to the block number *after* the last successfully received block for this
      stream. This helps prevent data loss during transient network issues.
    * If `false`, the stream request will not automatically replay data from the offline time on reconnect. You would need to manually
      set up a new stream. Current live data will keep streaming after reconnection, but you will miss the data from the offline period.
* **Recommendation**: Set to `true` if you need the full missed sequence of data even after reconnections.

## Handling the Action Stream

Once `await client.streamActions(request)` resolves, it returns a `HyperionStream` object. You primarily interact with
this object by listening to its events:

* **`stream.on("message", (data: IncomingData<ActionContent>) => { ... })`**:
  This is the event fired for each action trace received from the stream. The `data` object contains:
    * `data.uuid`: The unique identifier for this stream request.
    * `data.type`: Will be `"action"`.
    * `data.mode`: `"live"` or `"history"`.
    * `data.content`: An `ActionContent` object containing the detailed action trace (e.g., `act.data`, `block_num`,
      `trx_id`).
    * `data.irreversible`: `true` if this message is confirmed irreversible (relevant if `client.options.libStream` is
      true).
      See [Handling Stream Data](./data-handling.md) for more on `ActionContent`.

> For cleaner sequential processing of the data check the [AsyncIterator Pattern](data-handling.md#12-asynciterator-pattern-for-awaitof)

* **`stream.on("error", (error: any) => { ... })`**:
  Fired if an error occurs that is specific to this stream (e.g., the server terminates the stream due to an issue).

* **`stream.on("start", (response: { status: string, reqUUID: string, startingBlock: number | string }) => { ... })`**:
  Fired when the Hyperion server acknowledges and successfully starts the stream request. `response.reqUUID` will match
  `stream.reqUUID`. `startingBlock` reflects the effective `start_from` resolved by the server.



## Stopping an Action Stream

To stop receiving data for a specific action stream and notify the server to close it:

```typescript
// Assuming 'actionStream' is the object returned by client.streamActions()
actionStream.stop();
console.log("Requested to stop action stream:", actionStream.reqUUID);
```

## Examples

### 1. Stream Live Transfers to a Specific Account

```typescript
const stream = await client.streamActions({
  contract: "eosio.token",
  action: "transfer",
  start_from: 0, // Live
  filters: [
    { field: "act.data.to", value: USER_ACCOUNT_NAME }
  ],
  replayOnReconnect: true
});

stream.on("message", (msg) => {
  console.log(`Live transfer to ${USER_ACCOUNT_NAME}:`, msg.content.act.data);
});
```

### 2. Get All Actions by a Contract from a Specific Block Range

```typescript
const stream = await client.streamActions({
  contract: CONTRACT_NAME,
  action: "*", // All actions
  start_from: START_BLOCK_NUM,
  read_until: END_BLOCK_NUM,
  ignore_live: true   // Stop after this block
});

// Using AsyncIterator for this example
for await (const message of stream) {
  if (message === null) break; // Stream ended
  console.log(`  ${message.content.act.name}:`, message.content.act.data);
}
```

## Next Steps

* **[Handling Stream Data](./data-handling.md)**: Dive deeper into the structure of `ActionContent` and explore the AsyncIterator pattern.
* **[Streaming Table Deltas](./streaming-deltas.md)**: Learn about monitoring contract table changes.
* **[Client Configuration](./configuration.md)**: Review all Client Configuration options.
  <br><br><br>
