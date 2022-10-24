# Hyperion Stream Client


## Streaming Client for Hyperion History API (v3+)


### Usage

#### Supported Environments

- Node.js v16 and up
    - ES Module
    - CommonJS
- Browsers
    - ES Module - Angular, React and other frameworks
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

<br>

### Browser library (served from public Hyperion APIs)

Without installing via npm, you can also load the webpack bundle directly:

```html
<script src="https://<ENDPOINT>/stream-client.js"></script>
```

Where `<ENDPOINT>` is the Hyperion API (e.g. `https://eos.hyperion.eosrio.io`)

For other usages, the bundle is also available at `dist/hyperion-stream-client.js`

<br>


### 1. Connection

Set up the endpoint that you want to fetch data from:

```javascript
const client = new HyperionStreamClient({
    endpoint: 'https://example.com',
    debug: true,
    libStream: false
});
```

`https://example.com` is the host, from where `https://example.com/v2/history/...` is served.

- set `libStream` to `true` if you want to enable a stream of only **irreversible data**.
  Don't forget to attach the handler using the method: `setAsyncLibDataHandler(handler: AsyncHandlerFunction)`
- set `debug`  to `true` to print debugging messages

### 2. Making requests

to ensure the client is connected, requests should be made only after calling the `client.connect()` method, refer to examples
below;

#### 2.1 Action Stream - client.streamActions

`client.streamActions(request: StreamActionsRequest): void`


- `contract` - contract account
- `action` - action name
- `account` - notified account name
- `start_from` - start reading on block or on a specific date. 0=disabled means it will read starting from HEAD block.
- `read_until` - stop reading on block  (0=disable) or on a specific date (0=disabled)
- `filters` - actions filter (more details below)

**Notes**

- Block number can be either positive or negative - E.g.: **700** (start from block 700)
- In case of negative block number, it will be subtracted from the HEAD - E.g.: **-150** (since 150 blocks ago)
- Date format (ISO 8601) - e.g. 2020-01-01T00:00:00.000Z

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

#### 2.1.1 Act Data Filters

You can set up filters to refine your stream. Filters should use fields following the Hyperion Action Data Structure,
such as:

- `act.data.producers` (on eosio::voteproducer)
- `@transfer.to` (here the @ prefix is required since transfers have special mappings)

Please refer to
the [mapping definitions](https://github.com/eosrio/Hyperion-History-API/blob/main/definitions/index-templates.ts) to
know which data fields are available

For example, to filter the stream for
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

To refine even more your stream, you could add more filters. Remember that adding more filters
will result in **AND** operations. For **OR** operations setup another request.

#### 2.2 Delta Stream (contract rows) - client.streamDeltas

`client.streamDeltas(request: StreamDeltasRequest): void`

- `code` - contract account
- `table` - table name
- `scope` - table scope
- `payer` - ram payer
- `start_from` - start reading on block or on a specific date. 0=disabled means it will read starting from HEAD block.
- `read_until` - stop reading on block  (0=disable) or on a specific date (0=disabled)



Example:

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

<br>

#### 3. Handling Data

Incoming data handler is defined via the `client.setAsyncDataHandler(async (data)=> void)` method

if you set `libStream` to `true` another stream of only **irreversible data** will be available.
Don't forget to attach the handler using the method: `setAsyncLibDataHandler(handler: AsyncHandlerFunction)`

data object is structured as follows:

- `type` - _action_ | _delta_
- `mode` - _live_ | _history_
- `content` - Hyperion Data Structure (
  see [action index](https://github.com/eosrio/Hyperion-History-API/blob/main/definitions/index-templates.ts#L53)
  and [delta index](https://github.com/eosrio/Hyperion-History-API/blob/main/definitions/index-templates.ts#L212)
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



Useful information about load-balancing multiple Socket.IO servers:
https://socket.io/docs/v4/using-multiple-nodes/#NginX-configuration
