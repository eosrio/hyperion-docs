# Handling Stream Data

Once you've initiated a stream for actions or table deltas using the Hyperion Stream Client, you need a way to process the incoming data. The client offers two primary mechanisms for this: 

* the **[Event-Driven API](#11-event-driven-api-streamonmessage)** (`stream.on('message', ...)`)
* or the **[AsyncIterator Pattern](#12-asynciterator-pattern-for-awaitof)** (`for await...of`).

This guide also details the structure of the data messages you'll receive.

## 1. Data Consumption Methods

You can choose the method that best fits your application's architecture and coding style.

### 1.1. **Event-Driven API** (`stream.on('message', ...)`)

This is a reactive approach where you register a callback function (handler) that gets executed every time a new data message arrives on the stream.

**How it works:**
Each stream object returned by `client.streamActions()` or `client.streamDeltas()` is an event emitter.

```typescript
import { HyperionStreamClient, IncomingData, ActionContent, DeltaContent } from "@eosrio/hyperion-stream-client";
// Assuming 'client' is an initialized and connected HyperionStreamClient instance

async function useEventDrivenAPI() {
  try {
    const actionStream = await client.streamActions({
      contract: "eosio.token",
      action: "transfer",
      start_from: -10, // Last 10 blocks and then live
      replayOnReconnect: true
    });

    actionStream.on("message", (data: IncomingData<ActionContent>) => {
      console.log(`[EVENT] Action (Block ${data.content.block_num}):`, data.content.act.data);
      // Process the 'data' object here
    });

    actionStream.on("error", (error) => {
      console.error("[EVENT] Stream Error:", error);
    });

    actionStream.on("start", (startInfo) => {
      console.log("[EVENT] Stream Started:", startInfo);
    });

    // You can also listen for 'message' on delta streams
    const deltaStream = await client.streamDeltas({
      code: "eosio.token",
      table: "accounts",
      scope: "eosio",
      start_from: 0, // Live
    });

    deltaStream.on("message", (data: IncomingData<DeltaContent>) => {
      console.log(`[EVENT] Delta (Block ${data.content.block_num}):`, data.content.data);
    });

  } catch (error) {
    console.error("Failed to set up streams for event-driven API:", error);
  }
}
```

**Pros:**

*   Well-suited for applications that need to react immediately to incoming data.
*   Natural fit for UIs or systems that update based on real-time events.
*   Allows multiple listeners for the same stream if needed (though less common).

**Cons:**

*   Can lead to "callback hell" if complex sequential processing is required.
*   Managing state across multiple asynchronous callbacks can sometimes be more complex.

### 1.2. **AsyncIterator Pattern** (`for await...of`)

This modern JavaScript feature allows you to consume data from the stream in a way that looks synchronous, making sequential processing much cleaner, especially when combined with `async/await`.

**How it works:**
The stream objects are also Async Iterables.

```typescript
import { HyperionStreamClient, IncomingData, ActionContent } from "@eosrio/hyperion-stream-client";
// Assuming 'client' is an initialized and connected HyperionStreamClient instance

async function useAsyncIterator() {
  try {
    const actionStream = await client.streamActions({
      contract: "eosio.token",
      action: "transfer",
      start_from: -5,
      read_until: 0, // Get 5 historical blocks then stop for this example
      ignore_live: true,
    });

    console.log("Processing actions with AsyncIterator...");
    for await (const message of actionStream) {
      // The stream yields `null` when it ends cleanly (e.g., `read_until` is reached and `ignore_live: true`).
      if (message === null) {
        console.log("[ITERATOR] Stream ended.");
        break;
      }

      // 'message' is an IncomingData<ActionContent> object
      console.log(`[ITERATOR] Action (Block ${message.content.block_num}):`, message.content.act.data);
      // Perform asynchronous operations if needed before processing the next message
      // await someAsyncProcessing(message.content);
    }
    console.log("[ITERATOR] Finished processing all messages.");

  } catch (error) {
    console.error("[ITERATOR] Error during stream iteration:", error);
  }
}
```

**Pros:**

*   Significantly improves readability for sequential data processing.
*   Works naturally with `async/await` for performing asynchronous tasks per message without complex callback management.
*   Easier to manage state within the loop.
*   Provides a clear way to detect when a finite stream has ended (by yielding `null`).

**Cons:**

*   If you need to process multiple messages concurrently *without* waiting for the previous one to finish (and order doesn't strictly matter), the event-driven approach might be more direct, though you can also manage concurrency within an async iterator loop.

**Choosing a Method:**

*   For simple, reactive updates or when you need to handle messages as fast as they arrive without strict order for processing logic: **Event-Driven API**.
*   For processing messages one by one, especially if each involves async operations or complex state management: **AsyncIterator Pattern**.

## 2. Message Payload Structure

Regardless of how you consume the data, each message you receive from a stream will be an object conforming to the `IncomingData<T>` interface.

### `IncomingData<T>`

```typescript
interface IncomingData<T extends ActionContent | DeltaContent> {
  /** Unique identifier for the stream request that generated this message. */
  uuid: string;

  /** Type of data payload: "action" or "delta". */
  type: "action" | "delta";

  /**
   * Mode of the data:
   * - "history": Data replayed from historical blocks.
   * - "live": Data from new, live blocks.
   */
  mode: "live" | "history";

  /**
   * The actual data payload, which will be either ActionContent or DeltaContent.
   */
  content: T;

  /**
   * Indicates if the data is from an irreversible block.
   * This is primarily relevant if the client was configured with `libStream: true`.
   * If `libStream: false` (default), this will likely always be `false` for messages
   * received via `stream.on('message', ...)` or the async iterator, as those are
   * emitted immediately. Use `client.on('libData', ...)` for an irreversible-only feed
   * when `libStream: true`.
   */
  irreversible: boolean;
}
```

### `ActionContent` (when `type` is "action")

This object contains the details of a specific action trace. Key fields include:

```typescript
interface ActionContent {
  /** ISO 8601 timestamp of the block containing the action. */
  "@timestamp": string;
  /** Global sequence number of this action. */
  global_sequence: number;
  /** Block number where the action occurred. */
  block_num: number;
  /** Transaction ID the action belongs to. */
  trx_id: string;
  /** Producer of the block. */
  producer: string;
  /** Array of accounts notified by this action. */
  notified: string[];

  /** Details of the action itself. */
  act: {
    /** Account that executed the action (the contract). */
    account: string;
    /** Name of the action. */
    name: string;
    /** Authorization array (actor, permission). */
    authorization: { actor: string; permission: string; }[];
    /**
     * Decoded action data. The structure of this object depends on the action's ABI.
     * For common actions like `eosio.token::transfer`, this will be well-structured.
     * For custom actions, it might be a hex string if Hyperion doesn't have the ABI
     * for that block, or a JSON object if it does.
     */
    data: any;
    /** Hex representation of the action data (often present if `data` is an object). */
    hex_data?: string;
  };

  /** CPU usage in microseconds for this action. */
  cpu_usage_us?: number;
  /** Net usage in words for this action. */
  net_usage_words?: number;

  /**
   * Special decoded fields provided by Hyperion (prefixed with '@').
   * Example for eosio.token::transfer:
   * "@transfer.from"?: string;
   * "@transfer.to"?: string;
   * "@transfer.quantity"?: string;
   * "@transfer.memo"?: string;
   */
  [key: string]: any; // Allows for these @-prefixed fields
}
```
**Note**: The `functions.replaceMetaFields` utility within the client automatically moves data from fields like `@transfer` into `act.data` if `act.data` is initially missing or incomplete for that specific meta field. This helps normalize the data structure.

### `DeltaContent` (when `type` is "delta")

This object contains details about a change to a row in a contract's table. Key fields include:

```typescript
interface DeltaContent {
  /** ISO 8601 timestamp of the block containing the delta. */
  "@timestamp": string;
  /** Contract account that owns the table. */
  code: string;
  /** Scope of the table where the change occurred. */
  scope: string;
  /** Name of the table. */
  table: string;
  /** Primary key of the row (as a string). */
  primary_key: string;
  /** Account that paid for the RAM for this row. */
  payer: string;
  /**
   * Indicates if the row is present after this delta operation.
   * - `1`: Row exists (was created or updated).
   * - `0`: Row was deleted.
   */
  present: number;
  /** Block number where the delta occurred. */
  block_num: number;
  /** Block ID where the delta occurred. */
  block_id: string; // Typically the block ID hash

  /**
   * Decoded row data after the change. The structure depends on the table's ABI.
   * If `present` is 0 (deleted), this `data` object might represent the state *before* deletion
   * or be minimal, depending on the Hyperion version and configuration.
   */
  data: Record<string, any>;

  /**
   * Special decoded fields provided by Hyperion (prefixed with '@').
   * Example for a table named 'mydata':
   * "@mydata.field1"?: any;
   */
  [key: string]: any; // Allows for these @-prefixed fields
}
```
**Note**: Similar to `ActionContent`, `functions.replaceMetaFields` also works on `DeltaContent` to move data from fields like `@tablename.data` into the main `data` object if it's initially missing for those meta fields.

## Handling Data Irreversibility

* If you initialize the client with `libStream: true`:
    *   Data messages processed via `stream.on("message", ...)` or the `for await...of` loop will have their `irreversible` flag set to `true` only when the data has become irreversible.
    *   Alternatively, you can listen to `client.on("libData", (data) => { ... })` for a global feed of all irreversible data from all streams associated with that client instance.

* If `libStream: false` (default):
    *   The `irreversible` flag on messages from `stream.on("message", ...)` or the async iterator will generally be `false`. Your application receives data as soon as Hyperion processes it, which might be before it's irreversible.
    *   You can still monitor irreversibility using `client.on("libUpdate", ...)` if `libMonitor: true`.

Choose the approach based on your application's tolerance for potentially reversible data.

## Next Steps

*   **Streaming Actions**: Learn the specifics of requesting action streams in [Streaming Actions](streaming-actions.md).
*   **Streaming Table Deltas**: Understand how to stream table state changes in [Streaming Table Deltas](streaming-deltas.md).
*   **Error Handling**: Review best practices in [Error Handling](error-handling.md).
