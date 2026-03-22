---
hide:
  - navigation
---

# Hyperion Explorer

The Hyperion Explorer is a lightweight blockchain explorer built with **Angular** and **server-side rendering (SSR)**. It connects to a Hyperion API instance and provides a web interface for browsing accounts, blocks, transactions, and more.

!!! info "Repository"
    [:fontawesome-brands-github: eosrio/hyperion-explorer](https://github.com/eosrio/hyperion-explorer){:target="_blank"}

## Features

- **Server-Side Rendering** — Fastify-based SSR for fast initial loads and SEO
- **Account Viewer** — balances, resources, tokens, and action history
- **Block Inspector** — producer info, block ID, and transaction list
- **Transaction Details** — actions, authorizations, and inline traces
- **Public Key Lookup** — find accounts associated with a public key
- **Contract Tables** — browse smart contract table data
- **Token Top Holders** — distribution charts for any token
- **Custom Themes** — pluggable theme files for per-chain branding

## Requirements

- **Node.js** ≥ 22
- **npm** ≥ 10
- **Hyperion History API** ≥ v4.0.0

---

## Installation

### 1. Clone the repository

Clone the explorer inside the `hyperion-history-api` folder. The conventional directory name is `explorer`:

```bash
cd hyperion-history-api
git clone https://github.com/eosrio/hyperion-explorer.git explorer
cd explorer
```

### 2. Install dependencies and build

```bash
npm install
npm run build
```

The build output is placed in `dist/hyperion-explorer/`.

### 3. Start the SSR server

=== "Node.js (direct)"

    ```bash
    npm run serve:ssr:hyperion-explorer
    ```

=== "PM2 (recommended)"

    ```bash
    pm2 start ecosystem.config.js
    ```

The SSR server listens on **port 4777** by default.

---

## Configuration

### Hyperion API — Chain Config

To enable the explorer, add the `explorer` block to the `api` section of your chain configuration file at `config/chains/<chain>.config.json`:

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

| Field | Type | Description |
|---|---|---|
| `upstream` | `string` | URL of the explorer SSR server. The API will proxy all `/explorer/*` requests to this address. |
| `theme` | `string` | Theme name to apply. Must match a `<name>.theme.mjs` file in the `explorer/themes/` directory. |
| `home_redirect` | `boolean` | When `true`, the API root (`/`) redirects to `/explorer/`. |

!!! warning "Deprecated: `enable_explorer`"
    The old `enable_explorer: true/false` flag from Hyperion v3.x is **deprecated**. Use the `explorer.upstream` configuration instead.

After updating the chain config, **restart the Hyperion API** to apply changes.

### Environment Variables

The SSR server accepts the following environment variables:

| Variable | Default | Description |
|---|---|---|
| `HYP_EXPLORER_PORT` | `4777` | Port the SSR server listens on |
| `HYP_EXPLORER_HOST` | `127.0.0.1` | Bind address for the SSR server |

These can be set in the PM2 ecosystem file (`ecosystem.config.js`) or passed directly when starting with Node.js:

```bash
HYP_EXPLORER_PORT=4777 HYP_EXPLORER_HOST=0.0.0.0 npm run serve:ssr:hyperion-explorer
```

---

## Architecture

The explorer runs as a **separate process** from the Hyperion API. The API acts as a reverse proxy, forwarding browser requests at `/explorer/*` to the SSR server:

```
┌──────────┐       ┌──────────────────┐        ┌──────────────────┐
│  Browser  │──────>│  Hyperion API    │──proxy──>│  Explorer SSR    │
│           │       │  (port 7000)     │         │  (port 4777)     │
│           │       │  /explorer/*     │         │  Angular + Fastify│
│           │<──────│  /v2/*  /v1/*    │         │                  │
└──────────┘       └──────────────────┘        └──────────────────┘
```

The explorer's Angular application makes API calls directly to the Hyperion `/v2/*` endpoints for data (accounts, blocks, transactions, etc.).

---

## Custom Themes

Themes let you customize the explorer's appearance per chain (logos, colors, labels).

### Creating a theme

1. Create a file at `explorer/themes/<name>.theme.mjs`
2. Define a `themeData` object:

```javascript
themeData = {
  logo: '/assets/my-logo.png',
  title: 'My Chain Explorer',
  // additional theme properties
};
```

3. Set `"theme": "<name>"` in the chain config's `explorer` block
4. Restart the Hyperion API

### Available themes

The explorer ships with several built-in themes:

| Theme | Chain |
|---|---|
| `vaulta` | Vaulta (formerly EOS) |
| `wax` | WAX |
| `telos` | Telos |
| `jungle` | Jungle Testnet |
| `libre` | Libre |
| `qry` | QRY Network |
| `ultra` | Ultra |
| `xpr` | XPR Network |

---

## Updating

To update the explorer to the latest version:

```bash
cd hyperion-history-api/explorer
git pull origin master
npm install
npm run build
pm2 restart hyperion-explorer
```

!!! tip
    No changes to the Hyperion API are needed when updating the explorer — just rebuild and restart the SSR server.

---

## Troubleshooting

### Explorer not loading

1. Verify the SSR server is running: `curl http://127.0.0.1:4777/`
2. Check that `explorer.upstream` in the chain config points to the correct address
3. Ensure the Hyperion API was restarted after config changes

### SSRF warning (Angular v21+)

If you see `URL with hostname "127.0.0.1" is not allowed`, set the `NG_ALLOWED_HOSTS` environment variable:

```bash
NG_ALLOWED_HOSTS="127.0.0.1,localhost,your-domain.com" npm run serve:ssr:hyperion-explorer
```

Or add it to `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'hyperion-explorer',
    script: './dist/hyperion-explorer/server/server.mjs',
    env: {
      HYP_EXPLORER_PORT: 4777,
      HYP_EXPLORER_HOST: '127.0.0.1',
      NG_ALLOWED_HOSTS: '127.0.0.1,localhost,your-domain.com'
    }
  }]
};
```

### Missing themes directory

If the SSR server logs `ENOENT: no such file or directory, scandir './themes'`, create the themes directory:

```bash
mkdir -p explorer/dist/hyperion-explorer/themes
```
