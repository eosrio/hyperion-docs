---
title: Stream Client and replay
slug: /dev/stream_client/
---

# Hyperion Stream Client

Subscribe to action or delta streams from a Hyperion 4.5 provider. Streaming must be enabled by the operator; match the client API and server behavior before depending on replay or finality.

## Supported environments

The current client source requires Node 22 or later and supplies ESM, CommonJS and a browser bundle. Its package version is independent of the Hyperion server version. Pin the client release used by your application and retain its lockfile.

## Quick start

Install `@eosrio/hyperion-stream-client` at the version selected for your application. The example below uses the async stream interface in the [source-pinned client](https://github.com/eosrio/hyperion-stream-client/tree/99ad2cf1ee47ee7c8c5cf3ea7a4f35bfbdf4ff11).

```javascript
import {HyperionStreamClient} from '@eosrio/hyperion-stream-client';

const client = new HyperionStreamClient({
  endpoint: 'https://your-provider.example',
  debug: false,
  libStream: false,
});
client.on('error', error => console.error(error));
await client.connect();
const stream = await client.streamActions({
  contract: 'eosio.token',
  action: 'transfer',
  start_from: 0,
  read_until: 0,
  replayOnReconnect: true,
});
try {
  for await (const message of stream) {
    console.log(message.mode, message.content);
    // Persist application progress after successful processing.
  }
} finally {
  stream.stop();
  client.disconnect();
}
```

The provider hostname is a placeholder. `streamActions` and `streamDeltas` return promises for independent stream objects. Older examples using a global `setAsyncDataHandler` target a different client API.

## Connection

`connect()` waits for connection setup. Attach an error handler and handle subscription rejection. Client options include connection/request deadlines and bounded buffers. An open socket does not prove that a historical replay or consumer side effect completed.

## Making requests

### Action stream

Use `contract`, `action` and/or notified `account`, plus `start_from`, `read_until` and optional filters. A start of zero requests live data; positive block numbers or ISO dates request a historical starting point. Negative block starts are interpreted relative to chain head. Use a bounded irreversible range for reproducible historical processing.

### Act data filters

Filter entries contain `field` and `value`, with supported operators declared by the client. `filter_op` selects AND/OR. Match these fields with the provider's indexed mappings and protocol readiness. Metadata fields and decoded contract payload fields can have different availability; an unavailable decoded-field projection must not become a successful empty stream.

### Delta stream

Use `streamDeltas({code, table, ...})` with optional scope, payer and bounds. Check whether the selected chain/protocol actually serves that state or row-history projection before consuming it.

## Replay limits

The core template sets `api.stream_scroll_limit` to `-1`. A positive configured cap rejects a replay whose matching result count exceeds it. Do not assume a universal 50,000-document limit or a four-replay concurrency limit. Check the provider's policy and handle its exact error.

History scroll contexts are cleared during completion/failure cleanup. Client cancellation, HTTP historical pagination, consumer persistence and reconnect behavior still require their own handling.

## Events and recovery

Stream objects emit `message`, `error`, `historyEnd` and `end`; the client also exposes connection, LIB and fork events. `historyEnd` distinguishes replay completion from continuing live data. Stop the stream to cancel it and disconnect the client when all work ends.

Persist a checkpoint only after application processing succeeds. Reconnect replay can redeliver messages; deduplicate using stable source/action identity and retain decimal sequence strings. A LIB notification does not by itself make an application side effect transactional. Reversible data needs explicit fork handling.

## Browser library

Prefer the pinned package in a bundled application. The client repository also builds `dist/hyperion-stream-client.js`; host the matching bundle when using script tags rather than assuming every provider serves your selected client revision.

## Source

[Client interface](https://github.com/eosrio/hyperion-stream-client/blob/99ad2cf1ee47ee7c8c5cf3ea7a4f35bfbdf4ff11/src/interfaces.ts), [stream lifecycle](https://github.com/eosrio/hyperion-stream-client/blob/99ad2cf1ee47ee7c8c5cf3ea7a4f35bfbdf4ff11/src/hyperion-stream.ts), and [server replay implementation](https://github.com/eosrio/hyperion-history-api/blob/e1818923065d648a38009572d76badeab0684af1/src/api/helpers/functions.ts).
