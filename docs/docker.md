# Hyperion Docker
Hyperion Docker is a multi-container Docker application intended to get Hyperion up and running as fast as possible. It will index data from a development chain where you can set your contracts, push some actions and see what happens when querying the Hyperion API.

!!! warning
    Using Hyperion Docker is not recommended for production environments, only for testing, debugging and local networks.

## Dependencies
- `docker` and `docker-compose`

## RUN
Inside the `docker` folder you will find everything you need to run Hyperion Docker.

First of all, you need to generate Hyperion configuration files. To do that, from the `docker` folder, run `generate-config.sh` located inside `scripts` folder. You will have to pass an identificator and a name to the chain you will run. Example:
```
./scripts/generate-config.sh --chain eos --chain-name "EOS Testnet"
```
Feel free to change the generated files in `hyperion/config` folder the way it suits you.

Now you have three options to run it.

### docker-compose up
This is the simplest way to run Hyperion. Just run `sudo docker-compose up -d` and after some time all necessary docker containers will be running. You can start using it as you like.

To check logs run `sudo docker-compose logs -f` and to bring all containers down run `sudo docker-compose down`.

### Script
We created a script to start every container in a specific order to avoid problems like connection errors. From the `docker` folder run the `start.sh` script inside `scripts` folder. With this script you have the option to start the chain form a snapshot. Example:
```
./scripts/start.sh --snapshot snapshot-file.bin
```
Don't forget to move the snapshot file to the `eosio/data/snapshots` folder.

You can also use the `stop.sh` script to stop all or a specific service and also to bring all the containers down. Check the script usage for more info.

### Manual
If you have some experience with Docker Compose you can probably explore Hyperion Docker a bit more. Feel free to change the `docker-compose.yml` as you like.

We recomend to start services in the following order: `redis, rabbitmq, elasticsearch, kibana, eosio-node, hyperion-indexer and hyperion-api`. Wait until each of them are listening for connections before you start the next. Bellow you can find a simple example of how to control `hyperion-indexer` service:
```
sudo docker-compose up --no-start
sudo docker-compose start hyperion-indexer
sudo docker-compose stop hyperion-indexer
sudo docker-compose down
```
It's also possible to start the chain form a snapshot passing a variable to `docker-compose up`.

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
