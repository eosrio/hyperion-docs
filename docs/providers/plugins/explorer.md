# Hyperion Block Explorer

* [Hyperion Explorer Repository](https://github.com/eosrio/hyperion-explorer){:target="_blank"}

Hyperion lightweight Explorer is a user-friendly block explorer focused on speed and reliability.


- **Requires Hyperion v3.5.2 or above**

## Deployment Instructions

```bash
# Clone the repository inside the hyperion-history-api folder
cd hyperion-history-api

git clone https://github.com/eosrio/hyperion-explorer.git explorer
cd explorer

npm install
npm run build

# Start the server with node directly
npm run serve:ssr:hyperion-explorer

# Start the server with pm2 (recommended for production)
pm2 start
```

## Per Chain Configuration
```bash
# edit the config file at hyperion-history-api/config/chains/<chain>.config.json
# under api section add
"explorer": {
      "upstream": "http://127.0.0.1:4777",
      "theme": "default"
}
# custom theme can be added to explorer/themes using the pattern <name>.theme.mjs
```