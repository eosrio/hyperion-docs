# Hyperion Docker
Hyperion Docker is a multi-container Docker application intended to get Hyperion up and running as fast as possible. It will index data from a development chain where you can set your contracts, push some actions and see what happens when querying the Hyperion API.

!!! warning
    Using Hyperion Docker is not recommended for production environments, only for testing, debugging and local networks.

## Dependencies
- `docker` and `docker-compose`

## RUN
1. Make sure you are ok with all the configuration in `hyperion/config/connections.json` and `hyperion/config/chains/eos.config.json`
2. Change passwords in `docker-compose.yml` file
3. Run `docker-compose up`

## Usage
After running `docker-compose up` you should have a development chain producing blocks on a Docker container (eosio-node) as well as Hyperion Indexer and API on other two Docker containers (hyperion-indexer and hyperion-api).

### EOSIO-NODE
The port 8888 of this container is exposed so you can use it to interact with the chain. Example:
```
cleos -u http://127.0.0.1:8888 get info
```

### Hyperion API
Make queries to [http://127.0.0.1:7000/](http://127.0.0.1:7000). Example:
```
curl http://127.0.0.1:7000/v2/history/get_actions
```

### Kibana
Access [http://127.0.0.1:5601/](http://127.0.0.1:5601/)

### RabbitMQ
Access [http://127.0.0.1:15672/](http://127.0.0.1:15672/)

Feel free to change configurations as you like. All configurations files are located in `hyperion/config` or `eosio/config`.

## Troubleshooting
If you're having problems accesing Kibana or using Elasticsearch API, you could disable the xpack security
on the docker-compose.yml setting it to false:

```
xpack.security.enabled=false
```
