# Getting Started

This guide will walk you through the basic steps to connect to a Hyperion server and start streaming your first set of blockchain data using the Hyperion Stream Client.

## Prerequisites

Before you begin, ensure you have:

1.  **Installed the Client**: If you haven't already, install the client via npm or yarn:
    ```bash
    npm install @eosrio/hyperion-stream-client --save
    ```
    or

    ```bash
    yarn add @eosrio/hyperion-stream-client
    ```

2. **Hyperion Endpoint**: Have a Hyperion API endpoint URL (v3.6+) ready. You can find public endpoints [here](../../dev/endpoint.md) or use your own.

3. **Node.js Environment**: This guide assumes a Node.js environment (v18+).
> **Browser usage**: For other ways to include and use the client in browser-based projects, see the [Browser Usage Guide](./browser-usage.md).


## Steps

Let's create a simple Node.js script to stream `transfer` actions from the `eosio.token` contract.

### 1. Import the Client

At the top of your file, import `HyperionStreamClient`:

- **For ES Modules  (Recommended)**

```javascript
import { HyperionStreamClient } from "@eosrio/hyperion-stream-client";
```

- **For CommonJS**

```javascript
const { HyperionStreamClient } = require("@eosrio/hyperion-stream-client");
```

### 2. Initialize the Client

Instantiate the client with your Hyperion endpoint.

```javascript
const client = new HyperionStreamClient({
  endpoint: "https://eos.hyperion.eosrio.io", // Replace with your chosen Hyperion v3.6+ endpoint
  debug: false, // Set to true to enable debug logging during development
});
```

> **Tip**: For a full list of configuration options, see the [Client Configuration](./configuration.md) guide.

### 3. Set up event handlers (Optional but Recommended)

It's good practice to listen for connection events to know the client's status.

```javascript
client.on("connect", () => {
  console.log("Successfully connected to Hyperion Stream API!");
});

client.on("error", (error) => {
  console.error("Connection Error:", error);
});
```

### 4. Connect to the Server

Use the `client.connect()` method, which returns a Promise.

```javascript
  try {
    await client.connect();
  } catch (error) {
    console.error("Failed to establish initial connection:", error.message);
  }
```

### 5. Request a Data Stream

Once connected, you can request a stream. Let's stream the 5 most recent `transfer` actions from the `eosio.token` contract and then stop.

```javascript
  try {
    const stream = await client.streamActions({
      contract: "eosio.token", //required field
      action: "transfer", //required field
      account: "", // Track all transfers, not specific to one account
      start_from: -5, // Start from 5 blocks before the current head block
      read_until: 0,   // Read until the current head block 
      filters: [],     // No additional data filters for this basic example
      // For this example, we want it to stop after fetching recent history.
      // If you wanted live data, you'd set read_until: 0 and ignore_live: false (default)
      ignore_live: true // Stop after historical data is fetched
    });

    // Handle incoming messages for this specific stream
    stream.on("message", (data) => {
      console.log("\nReceived Action:");
      console.log(`  Data:`, data.content.act.data);
    });

    // Handle errors specific to this stream
    stream.on("error", (error) => {
      console.error("\nStream Error:", error);
    });

  } catch (error) {
    console.error("Error starting action stream:", error.message);
  }
```

### 6. Handling Stream data

Once you've initiated a stream for actions or table deltas, you need a way to process the incoming data. The client offers two primary mechanisms for this:

* the **Event-Driven API** (`stream.on('message', ...)`)
    * Listen to events on individual `actionStream` or `deltaStream` instances
  

* or the **AsyncIterator Pattern** (`for await...of`).
    * allows for more readable, sequential processing of stream data, especially useful with `async/await`

[Handling Stream Data :fontawesome-solid-arrow-right-long:](./data-handling.md){ .md-button }

## Next Steps

Congratulations! You've successfully streamed data using the Hyperion Stream Client.

From here, you can explore:

*   **[Streaming Actions]((./streaming-actions.md))**: Learn more on how to monitor action traces.
*   **[Streaming Table Deltas](./streaming-deltas.md)**: Learn how to monitor changes in contract tables.
*   **Advanced Filtering**: Dive deeper into the `filters` option for [**Streaming Actions**](./streaming-actions.md) and [**Streaming Table Deltas**](./streaming-deltas.md).
*   **[Full Configuration Options](./configuration.md)**: See all available settings.
*   **[Error Handling](./error-handling.md)**: See common error scenarios and best practices.
<br><br><br>