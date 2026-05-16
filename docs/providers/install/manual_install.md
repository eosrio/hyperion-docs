# Manual Installation

This section describes how to manually install Hyperion and its environment. If you want more control of your
installation, this is the way to go.

!!! warning
    If you are running more than one node (Leap/Savanna), you can now configure the failover option directly in the `connections.json` file. Please refer to the section detailing the new parameters by clicking [here](../setup/connections.md)


!!! info
    Review the guidelines for configuring Hyperion for Provider Registration on Qry, a new decentralized ecosystem that provides access to a variety of data services and APIs. Follow the steps outlined in [Config Provider](../../providers/setup/qry_connection.md) steps

!!! warning "OS requirement: glibc ≥ 2.38 (Ubuntu 24.04+)"
    Recommended OS: **Ubuntu 24.04** (or any Linux with **glibc ≥ 2.38**).

    This is a **hard requirement**, not just a recommendation. The API/stream
    server and the indexer controller load the `uWebSockets.js` native binary,
    and its prebuilt binaries are compiled against **GLIBC_2.38**. On older
    distributions the process fails to start with an unhandled rejection like:

    ```
    Error: /lib/x86_64-linux-gnu/libc.so.6: version `GLIBC_2.38' not found
      (required by .../node_modules/uWebSockets.js/uws_linux_x64_127.node)
    ```

    (The accompanying "uWS.js supports only Node.js versions 20, 22, 24 and 25"
    line is a generic fallback message — the `GLIBC_2.38 not found` line is the
    real cause. Node.js version is unrelated.)

    **Ubuntu 22.04 ships glibc 2.35 and will not run Hyperion** with the
    prebuilt binaries. If you cannot upgrade the OS, options are:

    - Upgrade the host to Ubuntu 24.04+ (glibc ≥ 2.38) — recommended.
    - Run Hyperion in a container with a glibc ≥ 2.38 base image
      (e.g. `node:22-trixie-slim` / Debian 13, or an Ubuntu 24.04 base).
    - Build `uWebSockets.js` from source on the target host against its
      local glibc (unsupported by upstream, but the documented escape hatch:
      *"you can always build your own binaries on older Linux systems"*).

## Dependencies

Below you can find the list of all Hyperion's dependencies:

- [Elasticsearch 9.x](https://www.elastic.co/downloads/elasticsearch){:target="_blank"}
- [Kibana 9.x](https://www.elastic.co/downloads/kibana){:target="_blank"}
- [RabbitMQ](https://www.rabbitmq.com){:target="_blank"} (v 4.x+)
- [Redis](https://redis.io/topics/quickstart){:target="_blank"}
- [MongoDB 8.x+](https://www.mongodb.com/docs/manual/installation/){:target="_blank"}
- [Node.js v22+](https://nodejs.org/en/download){:target="_blank"}
- [PM2](http://pm2.keymetrics.io/docs/usage/quick-start/){:target="_blank"}
- [NODEOS (Spring 1.2.2+ or Leap 5.0.3)](https://github.com/AntelopeIO/spring/releases){:target="_blank"}

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
    [disable swapping](https://www.elastic.co/guide/en/elasticsearch/reference/current/setup-configuration-memory.html#setup-configuration-memory){:target="_blank"}
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
    "number": "9.3.1",
    "build_type": "deb",
    "build_hash": "...",
    "build_date": "...",
    "build_snapshot": false,
    "lucene_version": "10.2.1",
    "minimum_wire_compatibility_version": "8.18.0",
    "minimum_index_compatibility_version": "8.0.0"
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
[Kibana documentation](https://www.elastic.co/guide/en/kibana/current/deb.html#deb){:target="_blank"}. Return to this documentation before
running it.

!!! info
    Kibana is not started automatically after installation. We recommend running it with
    [systemd](https://www.elastic.co/guide/en/kibana/current/deb.html#deb-running-systemd){:target="_blank"}.

!!! note
    Like on Elasticsearch, it is very important to know the Kibana
    [directory layout](https://www.elastic.co/guide/en/kibana/current/deb.html#deb-layout){:target="_blank"} and to understand how the
    [configuration](https://www.elastic.co/guide/en/kibana/current/deb.html#deb-configuring){:target="_blank"} works.

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
    From Hyperion 4.x, RabbitMQ version 4.x+ is recommended. RabbitMQ 3.12+ is the minimum supported version.

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

## MongoDB

!!! attention
    MongoDB is **required** starting from Hyperion 4.x. It is used for state queries (accounts, permissions, proposals, voters) and custom contract state indexing.

Follow the official [MongoDB installation guide](https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-ubuntu/){:target="_blank"} for Ubuntu.

Quick install for Ubuntu 24.04:

```bash
# Import the MongoDB public GPG key
curl -fsSL https://www.mongodb.org/static/pgp/server-8.0.asc | \
  sudo gpg -o /usr/share/keyrings/mongodb-server-8.0.gpg --dearmor

# Add the MongoDB repository
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-8.0.gpg ] https://repo.mongodb.org/apt/ubuntu noble/mongodb-org/8.0 multiverse" | \
  sudo tee /etc/apt/sources.list.d/mongodb-org-8.0.list

# Install MongoDB
sudo apt update
sudo apt install -y mongodb-org
```

### Configuration

##### 1. Start MongoDB

```bash
sudo systemctl start mongod
sudo systemctl enable mongod
```

##### 2. Verify it's running

```bash
mongosh --eval 'db.runCommand({ ping: 1 })'
```

!!! note
    By default, MongoDB runs without authentication. For production deployments, you should enable authentication and create a dedicated user. See the [MongoDB Security Checklist](https://www.mongodb.com/docs/manual/administration/security-checklist/){:target="_blank"}.

!!! tip
    The `hyp-config connections init` wizard will prompt you for MongoDB host, port, user, and password. If running locally with defaults, you can press ENTER to accept all defaults.

## NodeJS

```bash
# installs fnm (Fast Node Manager)
curl -fsSL https://fnm.vercel.app/install | bash

# activate fnm
source ~/.bashrc

# download and install Node.js
fnm use --install-if-missing 22

# verifies the right Node.js version is in the environment
node -v # should print `v22.x.x`

# verifies the right npm version is in the environment
npm -v
```

!!! attention
    Make sure to configure npm not to use sudo when installing global packages.

## PM2

```bash
npm install pm2@latest -g
```

### Configuration

##### 1. Configure for system startup

```bash
pm2 startup
```

## Antelope Node (EOSIO)

You need either **Leap** or **Spring** (Savanna consensus) to serve state history to Hyperion.

### Leap (legacy)

```bash
wget https://github.com/AntelopeIO/leap/releases/download/v5.0.3/leap_5.0.3_amd64.deb
sudo apt install ./leap_5.0.3_amd64.deb
```

### Spring (Savanna consensus)

Spring is the successor to Leap, featuring the Savanna consensus algorithm. Use Spring 1.2.2+ for production deployments.

```bash
wget https://github.com/AntelopeIO/spring/releases/download/v1.2.2/spring_1.2.2_amd64.deb
sudo apt install ./spring_1.2.2_amd64.deb
```

!!! info
    Check the latest Spring releases at [github.com/AntelopeIO/spring/releases](https://github.com/AntelopeIO/spring/releases){:target="_blank"}

### Configuration

Add the following configuration to the `config.ini` file:

```ini
state-history-dir = "state-history"
trace-history = true
chain-state-history = true
state-history-endpoint = 127.0.0.1:8080
plugin = eosio::chain_api_plugin
plugin = eosio::state_history_plugin
```

!!! warning "Spring config.ini restrictions"
    Spring v1.2.2+ enforces stricter separation between genesis parameters and runtime configuration.
    Resource limit parameters (e.g., `max-block-net-usage`, `max-block-cpu-usage-threshold-us`) **must** be
    defined in `genesis.json`, not `config.ini`. Placing them in `config.ini` will cause `nodeos` to crash
    at startup with `Unknown option`.

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
