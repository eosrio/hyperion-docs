# Hyperion Stream Client (v3.6+)

The Hyperion Stream Client is a powerful TypeScript/JavaScript library for connecting to and streaming real-time or historical data from **Hyperion History API servers** (version 3.6 and newer).

It simplifies handling WebSocket connections, message parsing, and stream management.

> **Compatibility Note**: Hyperion Stream Client v3.6 is **only** compatible with Hyperion servers from v3.6 onwards.

## Key Features

*   **Real-time Data Feeds**: Subscribe to live streams of blockchain actions and table state changes (deltas) as they occur.
*   **Historical Data Replay**: Efficiently fetch and process historical sequences of actions or deltas, with precise control over block ranges.
*   **Simplified Development**: Avoids the need to implement custom WebSocket handling and data deserialization logic.
*   **Flexible Data Consumption**: Choose between an intuitive event-driven API (`stream.on('message', ...)`) or the modern AsyncIterator pattern (`for await...of stream`) for processing data.
*   **Robust Filtering**: Utilize Hyperion's server-side filtering to receive only the data relevant to your application, saving bandwidth and client-side processing.
*   **Cross-Environment Support**: Seamlessly integrate into Node.js (v18+) backends or modern browser-based applications.
*   **Automatic Reconnection**: Leverages `socket.io-client`'s robust reconnection capabilities. 
*   **Debug Mode**: Optional detailed logging for development.


## Prerequisites

*   **Node.js**: Version 18 or higher is required for server-side usage or for building/bundling for the browser. For **direct In-Browser usage** [see here](./browser-usage.md)
*   **Hyperion API Endpoint**: Access to a running Hyperion History API (v3.6+) instance that has streaming enabled. You can find a list of public endpoints [here](../../dev/endpoint.md).

## Installation

Install the client using npm or yarn:

```bash
npm install @eosrio/hyperion-stream-client --save
```
or

```bash
yarn add @eosrio/hyperion-stream-client
```

## Getting Started

Ready to dive in?

*   For a quick hands-on example, see:

[Getting Started :fontawesome-solid-arrow-right-long:](./getting-started.md){ .md-button }

*   To understand how to configure the client, visit:

[Client Configuration :fontawesome-solid-arrow-right-long:](./configuration.md){ .md-button }


## Further Reading

Explore the following sections to learn more about specific aspects of the Hyperion Stream Client:

*   [**Streaming Actions**](./streaming-actions.md): Detailed guide on requesting and filtering action streams.
*   [**Streaming Table Deltas**](./streaming-deltas.md): Comprehensive information on streaming table state changes.
*   [**Handling Stream Data**](./data-handling.md): Learn about the event-driven API, the AsyncIterator pattern, and the structure of received data.
*   [**Block Range Parameters**](./block-ranges.md): Understand how to define `start_from` and `read_until`.
*   [**Browser Usage**](./browser-usage.md): Specific instructions for integrating the client in web browsers.
*   [**Error Handling**](./error-handling.md): Best practices for managing errors and disconnections.

[//]: # (*   [**Advanced Topics**]&#40;./advanced-topics.md&#41;: &#40;If applicable&#41; Discusses `libStream`, `libMonitor`, and other advanced configurations.)

