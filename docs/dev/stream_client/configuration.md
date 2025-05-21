# Client Configuration

When you create an instance of the `HyperionStreamClient`, you can pass a configuration object to customize its behavior. This guide details each available option.

## Basic Instantiation

Here's a typical instantiation with some common options:

```typescript
import { HyperionStreamClient } from "@eosrio/hyperion-stream-client";

const client = new HyperionStreamClient({
  // Required: Hyperion API endpoint
  endpoint: "https://eos.hyperion.eosrio.io",
    
  // Optional: Enable debug logging (default: false)
  debug: false,
    
  // Optional: Stream irreversible blocks only (default: false)  
  libStream: false,
    
  // Optional: Monitor last irreversible block and emit 'libUpdate' events. (default: false)
  libMonitor: false,
    
  // Optional: Connection timeout in ms (default: 5000)
  connectionTimeout: 5000
});
```

## Configuration Options

The constructor `new HyperionStreamClient(options)` accepts an `options` object with the following properties:

---

### `endpoint`

*   **Type**: `string`
*   **Required**: Yes
*   **Description**: The base HTTP(S) URL of the Hyperion API server you want to connect to. The client will automatically manage WebSocket connections to the `/stream` path on this endpoint.
*   **Example**: `"https://wax.hyperion.eosrio.io"`, `"http://localhost:7000"`

```typescript
const client = new HyperionStreamClient({
  endpoint: "https://telos.hyperion.eosrio.io"
});
```

---

### `debug`

*   **Type**: `boolean`
*   **Optional**: Yes
*   **Default**: `false`
*   **Description**: If set to `true`, the client will output verbose debugging messages to the console. This is useful during development to understand connection states, message flows, and potential issues.
*   **Example**:
    ```typescript
    const client = new HyperionStreamClient({
      endpoint: "https://eos.hyperion.eosrio.io",
      debug: true
    });
    ```

---

### `libStream`

*   **Type**: `boolean`
*   **Optional**: Yes
*   **Default**: `false`
*   **Description**:
    *   If `true`, data messages from streams will be buffered internally until they are confirmed as part of an irreversible block (LIB - Last Irreversible Block).
    *   When a message becomes irreversible:
        *   If you are listening to `client.on('libData', ...)`: The message will be emitted through this event.
        *   If you are listening to `stream.on('message', ...)` for a specific stream: The `irreversible` property of the `IncomingData` object will be set to `true`.
    *   This option introduces latency as data is held until LIB, but it ensures that your application only processes data that is final and will not be reversed due to a microfork.
    *   If `false`, data is emitted as soon as it's received from Hyperion, regardless of its irreversibility status (though `data.mode` will still indicate "live" or "history").
*   **Example**:
    ```typescript
    const client = new HyperionStreamClient({
      endpoint: "https://eos.hyperion.eosrio.io",
      libStream: true
    });

    // Option 1: Listen on the client for all irreversible data
    client.on('libData', (data) => {
      console.log('Irreversible data (client-level):', data.content);
    });

    // Option 2: Read individual stream messages (irreversable only, reversible messages will not be emitted)
    const stream = await client.streamActions({...});
    stream.on('message', (data) => {
        console.log('Irreversible data (stream-level):', data.content);
    });
    ```

---

### `libMonitor`

*   **Type**: `boolean`
*   **Optional**: Yes
*   **Default**: `false`
*   **Description**: If set to `true`, the client will actively monitor and listen for Last Irreversible Block (LIB) updates from the Hyperion server. When a new LIB is reported, the client will emit a `libUpdate` event with the LIB data (`{ chain_id, block_num, block_id }`). This is useful for applications that need to track the chain's finality status independently of data streams.
*   **Example**:
    ```typescript
    const client = new HyperionStreamClient({
      endpoint: "https://eos.hyperion.eosrio.io",
      libMonitor: true
    });

    client.on('libUpdate', (libInfo) => {
      console.log(`New LIB: Block ${libInfo.block_num}, ID: ${libInfo.block_id}`);
    });
    ```

---

### `connectionTimeout`

*   **Type**: `number`
*   **Optional**: Yes
*   **Default**: `5000` (milliseconds)
*   **Description**: The timeout duration in milliseconds for the initial WebSocket connection attempt to the Hyperion server. If the connection is not established within this time, the `client.connect()` promise will reject, and a `connect_error` event may be emitted internally by `socket.io-client`.
*   **Example**:
    ```typescript
    const client = new HyperionStreamClient({
      endpoint: "https://eos.hyperion.eosrio.io",
      connectionTimeout: 10000 // 10 seconds
    });
    ```

---

### `chainApi` (Advanced/Rarely Needed)

*   **Type**: `string`
*   **Optional**: Yes
*   **Default**: `undefined`
*   **Description**: The HTTP(S) URL of a standard Antelope chain API endpoint (e.g., a `nodeos` instance). This is **not typically required** for basic streaming operations, as the Hyperion endpoint itself usually provides necessary chain metadata. It might be used in specific scenarios if the client needs to fetch chain information (like `get_info`) directly from a node separate from the Hyperion instance, but the current client implementation primarily relies on the Hyperion endpoint for its operational data.
*   **Example**:
    ```typescript
    const client = new HyperionStreamClient({
      endpoint: "https://eos.hyperion.eosrio.io",
      // chainApi: "https://eos.greymass.com" // Example, usually not needed
    });
    ```

## Summary Table

| Option              | Type      | Required | Default          | Description                                                                         |
|---------------------|-----------|----------|------------------|-------------------------------------------------------------------------------------|
| `endpoint`          | `string`  | Yes      |                  | Base URL of the Hyperion API server.                                                |
| `debug`             | `boolean` | No       | `false`          | Enable/disable verbose console debug logging.                                       |
| `libStream`         | `boolean` | No       | `false`          | Stream only irreversible data (introduces latency).                                 |
| `libMonitor`        | `boolean` | No       | `false`          | Monitor and emit Last Irreversible Block updates.                                   |
| `connectionTimeout` | `number`  | No       | `5000` (ms)      | Timeout for the initial WebSocket connection.                                       |
| `chainApi`          | `string`  | No       | `undefined`      | (Advanced) URL of a standard Antelope chain API. Usually not needed.                |

## Next Steps

*   **Getting Started**: If you haven't already, check out the [Getting Started Guide](./getting-started.md) for a practical example.
*   **Streaming Actions**: Learn how to request and filter action streams in [Streaming Actions](./streaming-actions.md).
*   **Streaming Table Deltas**: Discover how to stream table state changes in [Streaming Table Deltas](./streaming-deltas.md).