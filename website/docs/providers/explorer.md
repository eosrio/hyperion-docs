---
title: Hyperion Explorer
---

# Hyperion Explorer

The [Hyperion Explorer](https://github.com/eosrio/hyperion-explorer) is a separate Angular application with a Fastify server-side rendering process. The core API proxies it under `/explorer` when `api.explorer.upstream` is configured.

## Features

Browse accounts, blocks, transactions, contract tables and token information through the underlying Hyperion APIs. The pages available to a user depend on the configured API's actual data and enabled capabilities.

## Requirements

The Explorer 1.4.1 source requires Node `^22.22.3 || ^24.15.0 || >=26.0.0`. Keep its package lock and release revision separate from the Hyperion core artifact. API and Explorer processes must agree on the upstream address, route base and chain identity.

## Installation

Clone the Explorer at the revision selected for your deployment, install its lockfile, and build:

```bash
git clone https://github.com/eosrio/hyperion-explorer.git explorer
cd explorer
npm ci
npm run build
npm run serve:ssr:hyperion-explorer
```

The source's server entry point is `dist/hyperion-explorer/server/server.mjs`. It binds to `127.0.0.1:4777` by default. Set `HYP_EXPLORER_HOST` and `HYP_EXPLORER_PORT` deliberately when using a different network layout. The repository also supplies `ecosystem.config.js` for PM2.

## Configuration

### Hyperion API — chain config

Merge this fragment into `config/chains/<chain>.config.json`:

```json
{
  "api": {
    "explorer": {
      "upstream": "http://127.0.0.1:4777",
      "theme": "default",
      "home_redirect": true
    }
  }
}
```

`upstream` identifies the SSR service; `theme` selects the provider's theme; `home_redirect` controls root redirection. Loopback works only when both processes share that host/network namespace.

### Proxy routes

Restart the affected API after changing proxy configuration. Open `/explorer` through the API's public address, then verify an account, block and transaction against known chain data. The historical plugin route `/v2/explore` belongs to older plugin arrangements; use the route exposed by your deployed integration.

## Custom themes

Use the Explorer repository's theme mechanism and test it against the selected Explorer artifact. Core API configuration selects a theme but does not build a new Explorer bundle for you.

## Troubleshooting

Inspect SSR logs, the upstream listener, base path and proxy response before changing API data settings. A successful SSR render does not prove every state endpoint is available. Verify account/table queries separately.

## Source

[Explorer package](https://github.com/eosrio/hyperion-explorer/blob/1b00573025a3e8e0db42e99bd17663cc02cc9eb2/package.json), [SSR binding](https://github.com/eosrio/hyperion-explorer/blob/1b00573025a3e8e0db42e99bd17663cc02cc9eb2/src/server.ts), and [core proxy](https://github.com/eosrio/hyperion-history-api/blob/e1818923065d648a38009572d76badeab0684af1/src/api/server.ts).
