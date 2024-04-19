### Update and Build

!!! attention
    Check the latest release notes [here](https://github.com/eosrio/hyperion-history-api/releases/latest) for any special instructions before updating.

Checkout the main branch or the specific tag you wish to update to, fetch new changes with `git pull` and run `npm install` (it will update all packages and automatically build afterwards)

```shell
git checkout main
git pull
npm ci
```

After the rebuild, you need to restart the indexer and api.
```shell
cd ~/hyperion
./run.sh [chain name]-indexer
./run.sh [chain name]-api
```
