# Manual Installation

This section describes how to manually install Hyperion and its environment. If you want more control of your
installation, this is the way to go.

!!! warning
    If you are running more than one SHIP node, you can now configure the failover option directly in the `connections.json` file. Please refer to the section detailing the new parameters by clicking [here](../setup/connections.md)


!!! info
    Review the guidelines for configuring Hyperion for Provider Registration on QRY, a new decentralized ecosystem that provides access to a variety of data services and APIs. Follow the steps outlined in [Config Provider](../../providers/setup/qry_connection.md) steps

!!! attention
    Recommended OS: Ubuntu 24.04

## Dependencies

Below you can find the list of all Hyperion's dependencies:

- [Elasticsearch 8.7+](https://www.elastic.co/downloads/elasticsearch){:target="_blank"} | **Required** for historical data indexing.
- [Kibana 8.7+](https://www.elastic.co/downloads/kibana){:target="_blank"} | Optional, for visualizing Elasticsearch data.
- [RabbitMQ 4.1+](https://github.com/rabbitmq/rabbitmq-server/releases){:target="_blank"} | **Required** for message queuing between indexer stages.
- [Redis](https://redis.io/topics/quickstart){:target="_blank"}  | **Required** for caching and inter-process communication.
- [MongoDB Community Server](https://www.mongodb.com/try/download/community){:target="_blank"} | **Conditionally Required**. Needed *only* if enabling state tracking features (`features.tables.*` or `features.contract_state.enabled` in chain config). See MongoDB section below for details.
- [Node.js 22+](https://nodejs.org/en/download){:target="_blank"} | **Required** runtime environment.
- [PM2](http://pm2.keymetrics.io/docs/usage/quick-start/){:target="_blank"} | **Required** process manager for Node.js applications.
- [NODEOS (spring 1.2.0 or leap 5.0.3)](https://github.com/AntelopeIO/spring/releases){:target="_blank"} | **Required** Antelope node with State History Plugin (SHIP) enabled.

On the next steps you will install and configure each one of them.

!!! note
    The Hyperion Indexer requires Node.js and pm2 to be on the same machine. All other dependencies (Elasticsearch,
    RabbitMQ, Redis and EOSIO) can be installed on different machines, preferably on a high speed and low latency
    network. Keep in mind that indexing speed will vary greatly depending on this configuration.

## Elasticsearch

Follow the detailed installation instructions on the
official [Elasticsearch documentation](https://www.elastic.co/guide/en/elasticsearch/reference/current/deb.html#deb){:target="_blank"} and
return to this guide before running it.

!!! info
    Elasticsearch is not started automatically after installation. We recommend running it
    with [systemd](https://www.elastic.co/guide/en/elasticsearch/reference/current/deb.html#deb-running-systemd){:target="_blank"}.

!!! note
    It is very important to know the Elasticsearch
    [directory layout](https://www.elastic.co/guide/en/elasticsearch/reference/current/deb.html#deb-layout){:target="_blank"}
    and to understand how the
    [configuration](https://www.elastic.co/guide/en/elasticsearch/reference/current/deb.html#deb-configuring){:target="_blank"} works.

### Configuration

##### 1. Elasticsearch configuration

Edit the following lines on `/etc/elasticsearch/elasticsearch.yml`:

```
cluster.name: CLUSTER_NAME
bootstrap.memory_lock: true
```

The memory lock option will prevent any Elasticsearch heap memory from being swapped out.

!!! warning
    Setting `bootstrap.memory_lock: true` will make Elasticsearch try to use all the RAM configured for JVM on startup (
    check next step). This can cause the application to crash if you allocate more RAM than available.

!!! note
    A different approach is to
    [disable swapping](https://www.elastic.co/guide/en/elasticsearch/reference/7.14/setup-configuration-memory.html#setup-configuration-memory){:target="_blank"}
    on your system.

!!! success "Testing"
    After starting Elasticsearch, you can see whether this setting was applied successfully by checking the value of
    `mlockall` in the output from this request:

    ```bash
    curl -X GET "localhost:9200/_nodes?filter_path=**.mlockall&pretty"
    ```

##### 2. Heap size configuration

For a optimized heap size, check how much RAM can be allocated by the JVM on your system. Run the following command:

```
java -Xms16g -Xmx16g -XX:+UseCompressedOops -XX:+PrintFlagsFinal Oops | grep Oops
```

Check if `UseCompressedOops` is true on the results and change `-Xms` and `-Xmx` to the desired value.

!!! note
    Elasticsearch includes a bundled version of OpenJDK from the JDK maintainers. You can find it on
    `/usr/share/elasticsearch/jdk`.

After that, change the heap size by editting the following lines on `/etc/elasticsearch/jvm.options`:

```
-Xms16g
-Xmx16g
```

!!! note
    Xms and Xmx must have the same value.

!!! warning
    Avoid allocating more than 31GB when setting your heap size, even if you have enough RAM.

##### 3. Allow memory lock

Override systemd configuration by running `sudo systemctl edit elasticsearch` and add the following lines:

```
[Service]
LimitMEMLOCK=infinity
```

Run the following command to reload units:

```bash
sudo systemctl daemon-reload
```

##### 4. Start Elasticsearch

Start Elasticsearch and check the logs:

```bash
sudo systemctl start elasticsearch.service
sudo less /var/log/elasticsearch/CLUSTE_NAME.log
```

Enable it to run at startup:

```bash
sudo systemctl enable elasticsearch.service
```

And finally, test the REST API:

```
curl -X GET "localhost:9200/?pretty"
```

!!! note
    Don't forget to check if memory lock worked.

The expected result should be something like this:

```json
{
  "name": "ip-172-31-5-121",
  "cluster_name": "CLUSTER_NAME",
  "cluster_uuid": "FFl8DNcOQV-dVk3p1JDNMA",
  "version": {
    "number": "7.14.1",
    "build_flavor": "default",
    "build_type": "deb",
    "build_hash": "606a173",
    "build_date": "2021-08-26T00:43:15.323135Z",
    "build_snapshot": false,
    "lucene_version": "8.9.0",
    "minimum_wire_compatibility_version": "6.8.0",
    "minimum_index_compatibility_version": "6.0.0-beta1"
  },
  "tagline": "You Know, for Search"
}
```

##### 5. Set up minimal security

The Elasticsearch security features are disabled by default. To avoid security problems, we recommend enabling the
security pack.

To do that, add the following line to the end of the `/etc/elasticsearch/elasticsearch.yml` file:

```
xpack.security.enabled: true
```

Restart Elasticsearch and set the passwords for the cluster:

```bash
sudo systemctl restart elasticsearch.service
sudo /usr/share/elasticsearch/bin/elasticsearch-setup-passwords auto
```

Keep track of these passwords, we’ll need them again soon.

!!! note
    You can alternatively use the `interactive` parameter to manually define your passwords.

!!! attention
    The minimal security scenario is not sufficient for production mode clusters. Check
    the [documentation](https://www.elastic.co/guide/en/elasticsearch/reference/current/security-basic-setup.html){:target="_blank"} for
    more information.

## Kibana

Follow the detailed installation instructions on the official
[Kibana documentation](https://www.elastic.co/guide/en/kibana/7.14/deb.html#deb){:target="_blank"}. Return to this documentation before
running it.

!!! info
    Kibana is not started automatically after installation. We recomend running it with
    [systemd](https://www.elastic.co/guide/en/kibana/7.14/deb.html#deb-running-systemd){:target="_blank"}.

!!! note
    Like on Elasticsearch, it is very important to know the Kibana
    [directory layout](https://www.elastic.co/guide/en/kibana/7.14/deb.html#deb-layout){:target="_blank"} and to understand how the
    [configuration](https://www.elastic.co/guide/en/kibana/7.14/deb.html#deb-configuring){:target="_blank"} works.

### Configuration

##### 1. Elasticsearch security

If you have enabled the security pack on Elasticsearch, you need to set up the password on Kibana. Edit the folowing
lines on the `/etc/kibana/kibana.yml` file:

```bash 
elasticsearch.username: "kibana_system"
elasticsearch.password: "password"
```

##### 2. Start Kibana

Start Kibana and check the logs:

```bash
sudo systemctl start kibana.service
sudo less /var/log/kibana/kibana.log
```

Enable it to run at startup:

```bash
sudo systemctl enable kibana.service
```

## RabbitMQ

!!! attention
    From Hyperion 3.3.10, RabbitMQ version 3.12+ is required.

Follow the detailed installation instructions on the
official [RabbitMQ documentation](https://www.rabbitmq.com/install-debian.html#installation-methods){:target="_blank"}.

RabbitMQ should automatically start after installation. Check
the [documentation](https://www.rabbitmq.com/install-debian.html#managing-service){:target="_blank"} for more details on how to manage its
service.

### Configuration

##### 1. Enable the WebUI

```bash
sudo rabbitmq-plugins enable rabbitmq_management
```

##### 2. Add vhost

```bash
sudo rabbitmqctl add_vhost hyperion
```

##### 3. Create a user and password

```bash
sudo rabbitmqctl add_user USER PASSWORD
```

##### 4. Set the user as administrator

```bash
sudo rabbitmqctl set_user_tags USER administrator
```

##### 5. Set the user permissions to the vhost

```bash
sudo rabbitmqctl set_permissions -p hyperion USER ".*" ".*" ".*"
```

##### 6. Check access to the WebUI

Try to access RabbitMQ WebUI at [http://localhost:15672](http://localhost:15672){:target="_blank"} with the user and password you just created.

## Redis

```bash
sudo apt install redis-server
```

Redis will also start automatically after installation.

### Configuration

##### 1. Update Redis supervision method

Change the `supervised` configuration from `supervised no` to  `supervised systemd` on `/etc/redis/redis.conf`.

!!! note
    By default, Redis binds to the localhost address. You need to edit `bind` in the config file if you want to
    listen to other network.

##### 2. Restart Redis

```bash
sudo systemctl restart redis.service
```

## MongoDB (Conditional Requirement)

!!! attention "Requirement Check"
    MongoDB is **only required** if you plan to enable specific state-tracking features in your Hyperion chain configuration (`config/chains/<chain>.config.json`). These features include:

    - **System Tables:** Setting `features.tables.proposals`, `features.tables.accounts`, or `features.tables.voters` to `true`.
    - **Contract State:** Setting `features.contract_state.enabled` to `true`.

    If you do not enable these features, you can skip the MongoDB installation. Hyperion will rely solely on Elasticsearch for historical action/delta data.

MongoDB is used by Hyperion to store the *current state* of specific on-chain data (like proposals, voter info, token balances, and configured contract tables), enabling fast lookups via the `/v2/state/*` API endpoints.

### Installation (Ubuntu Example)

Follow the official MongoDB Community Edition installation guide for your specific Ubuntu version:
[Install MongoDB Community Edition on Ubuntu](https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-ubuntu/){:target="_blank"}

The general steps involve:

1.  Importing the MongoDB public GPG Key.
2.  Creating a list file for MongoDB.
3.  Reloading the local package database (`sudo apt-get update`).
4.  Installing the MongoDB packages (`sudo apt-get install -y mongodb-org`).

### Configuration & Service Management

##### 1. Start MongoDB

After installation, start the MongoDB service:

```bash
sudo systemctl start mongod
```

Check if the service started successfully:

```bash
sudo systemctl status mongod
```


Look for `active (running)` in the output. You can also try connecting using the MongoDB Shell: `mongosh`.

To ensure MongoDB starts automatically on system boot:

```bash
sudo systemctl enable mongod
```

For production environments, it is highly recommended to [enable access control and configure authentication](https://www.mongodb.com/docs/manual/administration/security-checklist/){:target="_blank"} for MongoDB. This typically involves creating an administrative user and updating the configuration file (`/etc/mongod.conf`) to enforce authentication. The basic installation often allows unauthenticated access from localhost.

Hyperion connection details for MongoDB (host, port, user, password, database prefix) will be configured later in the `config/connections.json` file using the `./hyp-config connections init` tool or by manual editing.

## NodeJS

```bash
# installs fnm (Fast Node Manager)
curl -fsSL https://fnm.vercel.app/install | bash

# activate fnm
source ~/.bashrc

# download and install Node.js
fnm use --install-if-missing 22

# verifies the right Node.js version is in the environment
node -v # should print `v22.11.0`

# verifies the right npm version is in the environment
npm -v # should print `10.9.0`
```


## PM2

```bash
npm install pm2@latest -g
```

### Configuration

##### 1. Configure for system startup

```bash
pm2 startup
```

## Antelope Nodeos

### AntelopeIO Spring

Get the latest version from the [repository](https://github.com/AntelopeIO/spring/releases){:target="_blank"}

```
wget https://github.com/AntelopeIO/spring/releases/download/v1.2.0/antelope-spring_1.2.0_amd64.deb
sudo apt install ./antelope-spring_1.2.0_amd64.deb
```

### Leap

```
wget https://github.com/AntelopeIO/leap/releases/download/v5.0.3/leap_5.0.3_amd64.deb
sudo apt install ./leap_5.0.3_amd64.deb
```


### Configuration

Add the following configuration to the `config.ini` file:

```
state-history-dir = "state-history"
trace-history = true
chain-state-history = true
state-history-endpoint = 127.0.0.1:8080
plugin = eosio::chain_api_plugin
plugin = eosio::state_history_plugin
```

## Hyperion

If everything runs smoothly, it's time to install Hyperion! :fontawesome-solid-champagne-glasses:

To do that, simply run the following commands:

```bash
git clone https://github.com/eosrio/hyperion-history-api.git
cd hyperion-history-api
npm ci
```

## Proceed with Hyperion Configuration

[Hyperion Setup :fontawesome-solid-arrow-right-long:](../setup/hyperion_configuration.md){ .md-button }
