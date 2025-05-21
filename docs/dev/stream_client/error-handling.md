# Error Handling

Data streams can be interrupted, server requests can fail, and unexpected issues can arise. This guide outlines common error scenarios and best practices for handling them.

## Types of Errors

Errors can occur at different stages of interaction with the Hyperion Stream Client:

1.  **Client Instantiation Errors**: Rare, but could occur if invalid options are somehow passed (though TypeScript helps prevent this).
2.  **Initial Connection Errors**: When `client.connect()` is called.
3.  **Stream Request Errors**: When `client.streamActions()` or `client.streamDeltas()` is called.
4.  **Ongoing Connection Errors**: Disconnections or errors after a connection was established.
5.  **In-Stream Errors**: Errors specific to an active data stream after it has started.
6.  **AsyncIterator Errors**: Errors encountered while consuming data via the `for await...of` loop.

## 1. Client Instantiation

Usually, if you provide a syntactically correct options object (especially with TypeScript), instantiation itself won't throw. The primary concern here is ensuring the `endpoint` is a valid string.

```typescript
try {
  const client = new HyperionStreamClient({
    // endpoint: undefined, // This would likely be caught by TypeScript or cause issues later
    endpoint: "https://eos.hyperion.eosrio.io"
  });
} catch (e) {
  // Highly unlikely to catch here with proper options
  console.error("Client instantiation failed:", e);
}
```

## 2. Initial Connection Errors (`client.connect()`)

The `client.connect()` method returns a `Promise`. If the initial connection to the Hyperion server fails (e.g., server down, incorrect endpoint, network issue, CORS issue in browsers), the promise will reject.

Additionally, the client itself will emit an `'error'` event.

```typescript
// Assuming 'client' is an instance of HyperionStreamClient

client.on("error", (error) => {
  // This handler catches various client-level errors, including initial connection failures
  // if the connect() promise isn't explicitly caught, or for ongoing issues.
  console.error("Client-level error:", error);
});

async function connectToServer() {
  try {
    console.log("Attempting to connect...");
    await client.connect();
    console.log("Successfully connected!");
  } catch (error) {
    console.error("Failed to connect (Promise rejected):", error.message);
    // Handle specific error types if needed (e.g., check error.name or error.message)
    // Example: if (error.message.includes('timeout')) { ... }
  }
}

connectToServer();
```
**Common Causes:**

*   Invalid Hyperion endpoint URL.
*   Hyperion server is offline or unreachable.
*   Network connectivity problems (client-side or server-side).
*   **Browser Specific**: CORS (Cross-Origin Resource Sharing) issues. The Hyperion server must allow requests from your web application's origin. Check the browser console for CORS errors.
*   Connection timeout (see `connectionTimeout` in [Client Configuration](./configuration.md)).

## 3. Stream Request Errors (`streamActions()` & `streamDeltas()`)

When you call `client.streamActions(request)` or `client.streamDeltas(request)`, these methods also return Promises. The promise will reject if the Hyperion server cannot fulfill the stream request.

```typescript
async function requestMyStream() {
  if (!client.online) {
    console.error("Cannot request stream: Client is not connected.");
    return;
  }

  try {
    const stream = await client.streamActions({
      contract: "invalid.contract.name", // Example of a potentially invalid parameter
      action: "someaction",
      start_from: 0
    });
    // ... set up stream message handlers ...
  } catch (error) {
    console.error("Failed to initiate stream request:", error.message);
    // 'error' might be an object from the server indicating the problem
    // e.g., { status: "ERROR", error: "Invalid contract name" }
    // or a client-side error if the request couldn't even be made.
    if (error.error) { // Check if it's a structured error from Hyperion
        console.error("Server error details:", error.error);
    }
  }
}
```
**Common Causes:**

*   Invalid request parameters (e.g., non-existent contract, malformed filters).
*   Server-side issues preventing stream setup for the given parameters.
*   The client is not connected when the request is made.

## 4. Ongoing Connection Errors & Disconnections

The Hyperion Stream Client uses `socket.io-client` under the hood, which handles automatic reconnections by default.

*   **`client.on('disconnect', (reason) => { ... })`**:
    This event is fired when the client loses its connection to the server. The `reason` string often indicates why (e.g., `"io server disconnect"`, `"transport close"`).
    ```typescript
    client.on("disconnect", (reason) => {
      console.warn("Client disconnected. Reason:", reason);
      // Update UI to show disconnected status.
      // The client will attempt to reconnect automatically.
    });
    ```

*   **`client.on('connect', () => { ... })`**:
    This event is fired not only on the initial successful connection but also on successful reconnections.
    ```typescript
    client.on("connect", () => {
      console.log("Client connected (or reconnected)!");
      // If you have streams with `replayOnReconnect: true`, they will attempt to restart.
      // You might need to re-request streams that don't have `replayOnReconnect: true`.
    });
    ```

*   **`client.on('error', (error) => { ... })`**:
    This client-level error handler can also catch errors related to reconnection attempts or other general socket issues.

**Reconnection Behavior:**

*   Streams configured with `replayOnReconnect: true` in their request options will automatically attempt to re-establish and resume from where they left off (approximately) upon client reconnection.
*   For streams with `replayOnReconnect: false`, you would need to manually re-request the missed data after a `connect` event, otherwise it will resume from the current live data.

## 5. In-Stream Errors

Once a stream is successfully started, it can still encounter errors specific to that stream. Each stream object returned by `streamActions` or `streamDeltas` emits its own `'error'` event.

```typescript
// ... inside a function where 'stream' is an active HyperionStream object ...
stream.on("error", (streamError) => {
  console.error(`Error on stream ${stream.reqUUID}:`, streamError);
  // This error might indicate the server terminated this specific stream.
  // The stream might no longer be usable.
  // Consider logging, alerting, or attempting to set up a new stream.
});
```
**Common Causes:**

*   The server decides to terminate a specific stream for some reason (e.g., resource limits, internal server error related to the query).
*   Malformed messages from the server (less common).

## 6. AsyncIterator Errors

If you are consuming a stream using the `for await...of` loop, errors can occur during iteration. These should be caught using a `try...catch` block around the loop.

```typescript
async function processWithIterator() {
  let stream; // Keep stream reference outside try block for potential cleanup
  try {
    stream = await client.streamActions({ /* ... */ });
    for await (const message of stream) {
      if (message === null) {
        console.log("Stream ended gracefully.");
        break;
      }
      // Process message
      if (message.content.block_num % 1000 === 0) { // Artificial error condition
        throw new Error("Simulated processing error during iteration.");
      }
    }
  } catch (error) {
    console.error("Error during AsyncIterator processing:", error.message);
    // The 'stream' might be in an indeterminate state here.
    // It's often best to assume the iteration is compromised.
    // If 'stream' is defined, you might still try stream.stop() if appropriate,
    // though the connection or stream itself might already be closed.
  } finally {
    console.log("AsyncIterator loop finished or errored out.");
    // Perform any cleanup
  }
}
```
An error thrown from within the `for await...of` loop (either by your processing logic or an underlying issue with the stream yielding an error) will be caught by the `catch` block.

## Best Practices

*   **Always Attach Error Handlers**: Attach `'error'` handlers to the client instance and to every stream instance you create.
*   **Catch Promise Rejections**: Use `.catch()` or `try...catch` with `async/await` for `client.connect()`, `client.streamActions()`, and `client.streamDeltas()`.
*   **Monitor Connection State**: Use `client.on('connect', ...)` and `client.on('disconnect', ...)` to understand the current connection status and react accordingly (e.g., update UI, manage stream re-requests).
*   **`replayOnReconnect: true`**: For streams where historical data matters, set `replayOnReconnect: true` in the stream request options to allow the client to attempt to catch missed data after a disconnection.
*   **Logging**: Implement comprehensive logging, especially for errors, to help diagnose issues in development and production.
*   **Retry Strategies**: For critical applications, consider implementing custom retry strategies for `client.connect()` or for re-requesting streams if they fail, potentially with exponential backoff.
*   **User Feedback**: In UI applications, provide clear feedback to the user about connection status and any errors encountered.
*   **Test Error Conditions**: During development, try to simulate error conditions (e.g., stop your Hyperion server, disconnect network) to test how your application responds.

By thoughtfully handling these various error scenarios, you can build more resilient and reliable applications using the Hyperion Stream Client.

## Next Steps

*   **Client Configuration**: Review client settings in [Client Configuration](./configuration.md).
*   **Browser Usage**: Specific considerations for [Browser Usage](./browser-usage.md).

[//]: # (*   **Advanced Topics**: &#40;If applicable&#41; Explore `libStream` and other advanced features.)