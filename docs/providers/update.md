### Update and Build

Checkout the main branch or the specific tag you wish to update to, fetch new changes with `git pull` and run `npm install` (it will update all packages and automatically build afterwards)
```shell
git checkout main
git pull
npm install
```

After the rebuild, you need to restart the indexer and api.
```shell
cd ~/hyperion
./run.sh [chain name]-indexer
./run.sh [chain name]-api
```
