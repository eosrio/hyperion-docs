# Hyperion Docker
Hyperion Docker is a multi-container Docker application intended to get Hyperion up and running as fast as possible. It will index data from a development chain where you can set your contracts, push some actions and see what happens when querying the Hyperion API.

!!! warning
    Using Hyperion Docker is not recommended for production environments, only for testing, debugging and local networks.

!!! attention ""
    Recommend OS: Ubuntu 18.04

## 1. Dependencies
- `docker` and `docker-compose`

<br>

## 2. RUN
Inside the `docker` folder you will find everything you need to run Hyperion Docker.

First of all, you need to generate the Hyperion configuration files. To do that, from the `docker` folder, run `generate-config.sh` located inside the `scripts` folder. You will have to pass an identifier and a name to the chain you will run. Example:
```
./scripts/generate-config.sh --chain eos --chain-name "EOS Testnet"
```
Feel free to change the configuration files in `hyperion/config` folder the way it suits you. For more details, please refer to the [Hyperion Setup Section](hyperion.md).

Now you have three options to run it:

### Option 1: docker-compose up
This is the simplest way to run Hyperion. Just run `sudo docker-compose up -d` and after some time all necessary docker containers will be running. You can start using it as you like.

!!! warning
    We recommend using the Script to run Hyperion Docker as the order in which containers are started is important.

To check logs run: 

```
sudo docker-compose logs -f
```

And to bring all containers down run: 

```
sudo docker-compose down
```

### Option 2: Script
We created a script to start every container in a specific order to avoid problems like connection errors. From the `docker` folder run the `start.sh` script located inside the `scripts` folder. Example:
```
./scripts/start.sh --chain eos
```

With this script, you also have the option to start the chain from a snapshot. 

!!! abstract "Example"
    ```
    ./scripts/start.sh --chain eos --snapshot snapshot-file.bin
    ```

Don't forget to move the snapshot file to the `eosio/data/snapshots` folder and make sure to change the `chain_id` on `connections.json` file.

You can also use the `stop.sh` script to stop all or a specific service and also to bring all the containers down. Check the script usage for more information.

### Option 3: Manual
If you have some experience with Docker Compose you can probably explore Hyperion Docker a bit more.

We recommend starting services in the following order: `redis, rabbitmq, elasticsearch, kibana, eosio-node, hyperion-indexer and hyperion-api`. Wait until each of them is listening for connections before you start the next. Feel free to change the `docker-compose.yml` as you like.

Bellow, you can find a simple example of how to control `hyperion-indexer` service:
```
sudo docker-compose up --no-start
sudo docker-compose start hyperion-indexer
sudo docker-compose stop hyperion-indexer
sudo docker-compose down
```
It's also possible to start the chain form a snapshot passing a variable named `SNAPSHOT` to `docker-compose up`.

<br>

## 3. Usage

After running Hyperion Docker, you should have a development chain producing blocks on a Docker container (eosio-node) as well as Hyperion Indexer and API on the other two Docker containers (hyperion-indexer and hyperion-api).

If for some reason you decide to start it fresh again, make sure to clean all generated data. To do that just run `clean-up.sh` script inside `scripts` folder.

### EOSIO-NODE
The port 8888 of this container is exposed so you can use it to interact with the chain.

!!! abstract "Example"
    ```
    cleos -u http://127.0.0.1:8888 get info
    ```

### Hyperion API
Perform queries on the endpoint at [http://127.0.0.1:7000/](http://127.0.0.1:7000).

The complete API reference can be found at [API section: v2](v2.md)

!!! abstract "Example"
    ```
    curl http://127.0.0.1:7000/v2/history/get_actions
    ```
    
### Kibana
Access [http://127.0.0.1:5601/](http://127.0.0.1:5601/)

### RabbitMQ
Access [http://127.0.0.1:15672/](http://127.0.0.1:15672/)

<br>

## 4. Troubleshooting
If you're having problems accessing Kibana or using Elasticsearch API, you could disable the xpack security
on the docker-compose.yml setting it to false:

```
xpack.security.enabled=false
```

## 5. Next steps

Feel free to change configurations as you like. All configurations files are located in `hyperion/config` or `eosio/config`. 

For more details, please refer to the [Hyperion Setup Section](hyperion.md).

<br>
