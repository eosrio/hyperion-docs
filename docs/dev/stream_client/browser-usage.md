# Browser Usage

The Hyperion Stream Client is designed to work in modern web browsers, allowing you to build front-end applications that can directly stream and react to blockchain data from a Hyperion API.

There are several ways to include and use the client in your browser-based projects:

## 1. ES Modules with a Bundler (Recommended for Modern Applications)

If you're using a modern JavaScript framework like React, Vue, Angular, or a build tool like Webpack, Rollup, or Vite, you can install the client via npm/yarn and import it directly as an ES Module.

**Installation (if not already done):**
```bash
npm install @eosrio/hyperion-stream-client --save
# or
yarn add @eosrio/hyperion-stream-client
```

**Usage in your JavaScript/TypeScript code:**

```javascript
import { HyperionStreamClient } from "@eosrio/hyperion-stream-client";

// Example: Initialize client in a component or main script
const client = new HyperionStreamClient({
  endpoint: "https://eos.hyperion.eosrio.io", // Your Hyperion endpoint
  // other options...
});

async function startStreaming() {
  try {
    await client.connect();
    console.log("Connected to Hyperion in the browser!");

    const stream = await client.streamActions({
      contract: "eosio.token",
      action: "transfer",
      start_from: 0, // Live data
      filters: [{ field: "act.data.to", value: "somebrowserapp" }]
    });

    stream.on("message", (data) => {
      // Update your UI or application state with the new data
      console.log("Browser received action:", data.content.act.data);
      const displayElement = document.getElementById("stream-output");
      if (displayElement) {
        displayElement.innerHTML += `<p>Transfer: ${JSON.stringify(data.content.act.data)}</p>`;
      }
    });

  } catch (error) {
    console.error("Browser streaming error:", error);
  }
}

// Call startStreaming() when appropriate (e.g., on component mount, button click)
// Ensure the DOM is ready if you're manipulating it directly as in the example.
// document.addEventListener('DOMContentLoaded', startStreaming);
startStreaming(); // Or trigger as needed
```

Your bundler will handle resolving the module and including it in your final application bundle.

## 2. UMD (Universal Module Definition) Bundle

The client is also distributed as a UMD bundle, which can be included directly in an HTML file using a `<script>` tag. This makes the `HyperionStreamClient` available as a global variable (e.g., `window.HyperionStreamClient` or just `HyperionStreamClient`).

This method is suitable for simpler projects, quick prototypes, or when not using a module bundler.

**You can source the UMD bundle from:**

*   A CDN like unpkg or jsDelivr.
*   Your local `node_modules` directory after installation (`node_modules/@eosrio/hyperion-stream-client/dist/hyperion-stream-client.js`).

**Example HTML:**

```html
<!DOCTYPE html>
<html>
<head>
  <title>Hyperion Stream Client - UMD Example</title>
  <!-- Option 1: From CDN -->
  <script src="https://unpkg.com/@eosrio/hyperion-stream-client/dist/hyperion-stream-client.js"></script>

  <!-- Option 2: From local path (if you've copied it or are serving node_modules) -->
  <!-- <script src="/path/to/hyperion-stream-client.js"></script> -->
</head>
<body>
  <h1>Hyperion Stream Output</h1>
  <div id="stream-output"></div>

  <script>
    const client = new HyperionStreamClient({ // or window.HyperionStreamClient
      endpoint: "https://wax.hyperion.eosrio.io",
      debug: true
    });

    async function initializeStream() {
      client.on('connect', () => console.log('UMD Client Connected!'));
      client.on('error', (err) => console.error('UMD Client Error:', err));

      try {
        await client.connect();

        const stream = await client.streamActions({
          contract: "eosio.token",
          action: "transfer",
          start_from: -5, // Last 5 and live
          read_until: 0
        });

        const outputDiv = document.getElementById('stream-output');
        stream.on("message", (data) => {
          console.log("UMD received:", data.content);
          if (outputDiv) {
            const p = document.createElement('p');
            p.textContent = `Block ${data.content.block_num}: ${data.content.act.name} - ${JSON.stringify(data.content.act.data)}`;
            outputDiv.appendChild(p);
          }
        });
      } catch (e) {
        console.error("Error setting up UMD stream:", e);
      }
    }

    initializeStream();
  </script>
</body>
</html>
```

## 3. Import Maps (Modern Browsers)

Import Maps are a newer browser feature that allows you to control how JavaScript modules are resolved, similar to how `paths` work in `tsconfig.json` or aliases in Webpack. This lets you use bare module specifiers (like `import { HyperionStreamClient } from "@eosrio/hyperion-stream-client";`) directly in `<script type="module">` tags without a build step, provided the browser supports import maps.

> **Browser Compatibility**: Import maps are supported in Chrome 89+, Edge 89+, Safari 16.4+, and Firefox 108+. For older browsers, you'll need a polyfill like [es-module-shims](https://github.com/guybedford/es-module-shims).

There are two main approaches with import maps:

### 3.1. Mapping to the UMD Bundle (Simpler)

This approach maps the `@eosrio/hyperion-stream-client` specifier to its UMD bundle. It's simpler because the UMD bundle has its dependencies (like `socket.io-client`, `async`) already bundled or handled internally.

```html
<!DOCTYPE html>
<html>
<head>
  <title>Hyperion - Import Map (UMD) Example</title>
  <!-- Optional: Polyfill for older browsers -->
  <!-- <script async src="https://ga.jspm.io/npm:es-module-shims@1.8.0/dist/es-module-shims.js"></script> -->

  <script type="importmap">
  {
    "imports": {
      "@eosrio/hyperion-stream-client": "https://unpkg.com/@eosrio/hyperion-stream-client/dist/hyperion-stream-client.js"
    }
  }
  </script>
</head>
<body>
  <h1>Import Map (UMD) Output</h1>
  <div id="output"></div>

  <script type="module">
    import { HyperionStreamClient } from "@eosrio/hyperion-stream-client";

    const client = new HyperionStreamClient({
      endpoint: "https://jungle4.dfuse.eosnation.io", // Example public testnet endpoint
      debug: true
    });

    const outputDiv = document.getElementById('output');

    client.on('connect', () => outputDiv.innerHTML += '<p>Import Map (UMD) Client Connected!</p>');
    client.on('error', (err) => outputDiv.innerHTML += `<p style="color:red;">Import Map (UMD) Client Error: ${err}</p>`);

    async function start() {
      await client.connect();
      const stream = await client.streamActions({ contract: "eosio", action: "onblock", start_from: -1, read_until: 0, ignore_live: true });
      stream.on('message', data => {
        outputDiv.innerHTML += `<p>Block ${data.content.block_num} by ${data.content.producer}</p>`;
      });
    }
    start();
  </script>
</body>
</html>
```

### 3.2. Mapping to the ESM Bundle (More Complex, Requires Dependency Mapping)

This approach maps directly to the client's ES Module entry point (e.g., `lib/esm/index.js`). This is cleaner in terms of module purity but **requires you to also map all of its direct and transitive dependencies** (like `socket.io-client`, `async`, `cross-fetch`) in the import map.

```html
<!DOCTYPE html>
<html>
<head>
  <title>Hyperion - Import Map (ESM) Example</title>
  <!-- Optional: Polyfill for older browsers -->
  <!-- <script async src="https://ga.jspm.io/npm:es-module-shims@1.8.0/dist/es-module-shims.js"></script> -->

  <script type="importmap">
  {
    "imports": {
      "@eosrio/hyperion-stream-client": "https://unpkg.com/@eosrio/hyperion-stream-client/lib/esm/index.js",
      "socket.io-client": "https://cdn.jsdelivr.net/npm/socket.io-client@4.7.5/+esm",   انرژی Ensure version matches package.json
      "async": "https://cdn.jsdelivr.net/npm/async@3.2.5/+esm",                         // Ensure version matches
      "cross-fetch": "https://cdn.jsdelivr.net/npm/cross-fetch@4.0.0/+esm"             // Ensure version matches
      // You might need to map further dependencies of socket.io-client, etc.
      // if they are not self-contained in their +esm distributions.
    }
  }
  </script>
</head>
<body>
  <h1>Import Map (ESM) Output</h1>
  <div id="output-esm"></div>

  <script type="module">
    import { HyperionStreamClient } from "@eosrio/hyperion-stream-client";

    const client = new HyperionStreamClient({
      endpoint: "https://telos.eosusa.io", // Example public endpoint
      debug: true
    });
    const outputDiv = document.getElementById('output-esm');
    // ... rest of the client usage logic as in the UMD import map example ...
    client.on('connect', () => outputDiv.innerHTML += '<p>Import Map (ESM) Client Connected!</p>');
    // ...
    async function startEsm() {
      await client.connect();
      // ...
    }
    startEsm();
  </script>
</body>
</html>
```
**Note on ESM Dependency Mapping**: Keeping track of and correctly mapping all transitive dependencies for the direct ESM approach can be challenging and error-prone. For simpler browser use without a bundler, the UMD bundle (either directly or via an import map) is often more straightforward.

## Considerations for Browser Environments

*   **CORS (Cross-Origin Resource Sharing)**: The Hyperion API endpoint you are connecting to must have CORS headers configured correctly to allow connections from the domain your web application is served from. If not, you'll encounter CORS errors in the browser console.
*   **WebSocket Support**: All modern browsers support WebSockets, which the client uses under the hood via `socket.io-client`.
*   **Resource Management**: Be mindful of the number of streams and the volume of data being processed in the browser, as it can impact performance and memory usage. Stop streams when they are no longer needed.
*   **Error Handling**: Implement robust error handling for connection issues and stream errors to provide a good user experience.

## Next Steps

*   **Client Configuration**: Learn about all the options for `new HyperionStreamClient()` in [Client Configuration](configuration.md).
*   **Streaming Actions**: Dive into the details of requesting action streams in [Streaming Actions](streaming-actions.md).
*   **Streaming Table Deltas**: Understand how to stream table changes in [Streaming Table Deltas](streaming-deltas.md).
*   **Handling Stream Data**: Explore methods for processing data in [Handling Stream Data](data-handling.md).
