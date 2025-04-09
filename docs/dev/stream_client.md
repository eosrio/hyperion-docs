# Hyperion Stream Client

The Hyperion Stream Client is a **Streaming API Client for Hyperion History API (v3+)**. 
It allows developers to receive real-time data streams of actions and deltas from Hyperion API v3 or later.

### Supported Environments

- Node.js v16 and up
    - ES Module
    - CommonJS
- Browsers
    - ES Module - Suitable for Angular, React and other modern frameworks
    - UMD

## Quick Start

### Installing via npm package

```bash
npm install @eosrio/hyperion-stream-client --save
```

#### Importing the client

ESM (Node and Browser):
```typescript
import {HyperionStreamClient} from "@eosrio/hyperion-stream-client";
```

CommonJs (Node):
```javascript
const {HyperionStreamClient} = require('@eosrio/hyperion-stream-client');
```

### Browser library (served from public Hyperion APIs)

Without installing via npm, you can also load the webpack bundle directly:

```html
<script src="https://<ENDPOINT>/stream-client.js"></script>
```

Where `<ENDPOINT>` is the Hyperion API (e.g. `https://eos.hyperion.eosrio.io`)

The bundle is also available at `dist/hyperion-stream-client.js` for other usages.

### 1. Connection

Set up the endpoint that you want to fetch data from:

```javascript
const client = new HyperionStreamClient({
    endpoint: 'https://example.com',
    debug: true,
    libStream: false
});
```

- `endpoint`: Specifies the host from where `https://<ENDPOINT>/v2/history/...` is served.
- `debug`: When set to `true`, enables the printing of debugging messages.
- `libStream`: If set to `true`, enables a stream of only **irreversible data**. You must also attach a handler using the `setAsyncLibDataHandler(handler: AsyncHandlerFunction)` method.

### 2. Making requests

to ensure the client is connected, requests should be made only after calling the `client.connect()` method, refer to examples
below;

#### 2.1 Action Stream - client.streamActions

`client.streamActions(request: StreamActionsRequest): void`

The `streamActions` method allows you to receive a stream of blockchain actions based on the provided `request` object, which includes the following parameters:

- `contract` - the contract account
- `action` - the action name
- `account` - the notified account name
- `start_from` - start reading on a specific block number (positive or negative relative to HEAD) or a specific date (ISO 8601 format). `0` disables this, meaning it will start from the HEAD block.
- `read_until` - stop reading on a specific block number (0=disable) or on a specific date (0=disabled) in ISO 8601 format.
- `filters` - An array of filters to refine the stream based on action data. See [Act Data Filters](#data-filters) below for more details.

!!! note "Notes"
    - Block number can be either positive or negative - E.g.: **700** (start from block 700)
    - In case of negative block number, it will be subtracted from the HEAD - E.g.: **-150** (since 150 blocks ago)
    - Date format (ISO 8601) - `E.g. 2020-01-01T00:00:00.000Z`
  
```typescript
import {HyperionStreamClient, StreamClientEvents} from "@eosrio/hyperion-stream-client";
const client = new HyperionStreamClient({
    endpoint: "https://sidechain.node.tibs.app",
    debug: true,
    libStream: false
});
client.on(StreamClientEvents.LIBUPDATE, (data: EventData) => {
    console.log(data);
});
client.on('connect', () => {
  console.log('connected!');
});
client.setAsyncDataHandler(async (data) => {
    console.log(data);
    // process incoming data, replace with your code
    // await processSomethingHere();
})
await client.connect();
client.streamActions({
  contract: 'eosio',
  action: 'voteproducer',
  account: '',
  start_from: '2020-03-15T00:00:00.000Z',
  read_until: 0,
  filters: [],
});
```
<a id='data-filters'></a>
#### 2.1.1 Act Data Filters

You can set up filters to refine your stream. Filters should use fields following the Hyperion Action Data Structure,
such as:

- `act.data.producers` (on `eosio::voteproducer`)
- `@transfer.to` (here the `@` prefix is required for special mappings like transfers)

Please refer to
the [mapping definitions](https://github.com/eosrio/Hyperion-History-API/blob/main/definitions/index-templates.ts){:target="_blank"} for available data fields

Example: to filter the stream for
every transfer made to the `eosio.ramfee` account:

```javascript
client.streamActions({
    contract: 'eosio.token',
    action: 'transfer',
    account: 'eosio',
    start_from: 0,
    read_until: 0,
    filters: [
        {field: '@transfer.to', value: 'eosio.ramfee'}
    ],
});
``` 

!!! warning "AND or OR operations"
    To refine even more your stream, you could add more filters. Remember that adding more filters will result in **AND** operations. For **OR** operations setup another request.

#### 2.2 Delta Stream (contract rows) - client.streamDeltas

`client.streamDeltas(request: StreamDeltasRequest): void`

- `code` - contract account
- `table` - table name
- `scope` - table scope
- `payer` - ram payer
- `start_from` - start reading on block or on a specific date. 0=disabled means it will read starting from HEAD block.
- `read_until` - stop reading on block  (0=disable) or on a specific date (0=disabled)

!!! example "Example:"  
    Referring to the same pattern as the action stream example above, one could also include a delta stream request
    ```javascript
    client.streamDeltas({
        code: 'eosio.token',
        table: '*',
        scope: '',
        payer: '',
        start_from: 0,
        read_until: 0,
    });
    ``` 

_Note: Delta filters are planned to be implemented soon._

#### 3. Handling Data

Incoming data handler is defined via the `client.setAsyncDataHandler(async (data)=> void)` method

if you set `libStream` to `true` another stream of only **irreversible data** will be available.
Don't forget to attach the handler using the method: `setAsyncLibDataHandler(handler: AsyncHandlerFunction)`

data object is structured as follows:

- `type` - _action_ | _delta_
- `mode` - _live_ | _history_
- `content` - Hyperion Data Structure (see [action index](https://github.com/eosrio/Hyperion-History-API/blob/main/definitions/index-templates.ts#L53){:target="_blank"}
  and [delta index](https://github.com/eosrio/Hyperion-History-API/blob/main/definitions/index-templates.ts#L212){:target="_blank"}
  templates)

```javascript
client.setAsyncDataHandler(async (data) => {
    console.log(data);
    // process incoming data, replace with your code
    // await processSomethingHere();
})
// irreversible data stream only for when libStream: true on client connection setup
client.setAsyncLibDataHandler(async (data) => {
  console.log(data);
  // process incoming data, replace with your code
  // await processSomethingHere();
})
```

!!! tip
    In this [link](https://socket.io/docs/v4/using-multiple-nodes/#NginX-configuration){:target="_blank"} you can find some useful information about load-balancing multiple Socket.IO servers.
