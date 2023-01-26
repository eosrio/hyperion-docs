# Hyperion Set Up

## Set Up

We've developed a tool to automate the configuration of Hyperion. It basically initializes the connections with all the
dependencies and creates the configuration for each chain you are running.

!!! warning
    Make sure you are in the installation directory:
    ```shell
    cd ~/hyperion
    ```

!!! tip
    Run `./hyp-config --help` for more details.

### Initialize connections

First, let's initialize our configuration. Just run:

```
./hyp-config connections init
```

!!! note
    This command will also check the connection to Elasticsearch, Rabbitmq and Redis. Make sure everything is up and
    running.

You can use `./hyp-config connections test` to test connectivity at any point and `./hyp-config connections reset` to back up and remove the current configuration.

### Add new chain

Now you can proceed and add a new chain to your configuration. Run the following command:

```
./hyp-config new chain eos --http "http://127.0.0.1:8888" --ship "ws://127.0.0.1:8080"
```

### Check your chain configuration

Finally, check your configuration running:

```
./hyp-config list chains
```

You should see an output similar to:

[![indexer](../../assets/img/configured_chains.png)](../../assets/img/configured_chains.png)

## Running Hyperion

We provide scripts to simplify the process of starting and stopping your Hyperion Indexer or API instance.

### Starting

To run the indexer, execute `./run.sh [chain name]-indexer`

To run the api, execute `./run.sh [chain name]-api`

!!! example "Examples"
    Starting indexer for **"eos"** chain:
    ```
    ./run.sh eos-indexer
    ```
    Starting API for **"test"** chain:
    ```
    ./run.sh test-api
    ```

!!! note
    You need to pass the name of the chain you previously created followed by indexer or api to indicate the instance
    you want to start.

### Stopping

Use the stop.sh script to stop an instance as follows:

!!! example "Examples"
    Stop API for EOS mainnet:
    ```
    ./stop.sh eos-api
    ```
    Stop indexer for WAX mainnet:
    ```
    ./stop.sh wax-indexer
    ```

!!! note
    You need to pass the name of the chain you previously created followed by indexer or api to indicate the instance
    you want to stop.

!!! attention  
    The stop script won't stop Hyperion Indexer immediately, it will first flush the queues. Be aware that this
    operation could take some time.

## Indexer
The Hyperion Indexer is configured to perform an abi scan `("abi_scan_mode": true)` as default. So, on your first run,
you'll probably see something like this:

[![indexer](../../assets/img/indexer.png)](../../assets/img/indexer.png)

This an example of an ABI SCAN on the WAX chain.

Where:

  - W (Workers): Number of workers.
  - R (Read): Blocks read from state history and pushing into the blocks queue.
  - C (Consumed): Blocks consumed from blocks queue.
  - A (Actions): Actions being read out of processed blocks.
  - D (Deserialized): Deserializations of the actions.
  - I (Indexed): Indexing of all of the docs.


## API
After running the api, you should see a log like this:

 [![api](../../assets/img/api.png)](../../assets/img/api.png)

Now, it's time to play around making some queries. :fontawesome-regular-laugh-beam:

## Plugins Set Up

Plugins are optional. Follow the documentation on the required plugin page.

Official Plugins:

- [Hyperion Explorer](https://github.com/eosrio/hyperion-explorer-plugin/tree/develop)

!!! warning "Experimental Feature"
Running 3rd-party plugins could be dangerous, please make sure you review the published code before installing
