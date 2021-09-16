# Manual Installation

This section describes how to manually set up the environment needed to run Hyperion. If you want more control of your installation, this is the way to go.

!!! attention  
    Recommended OS: Ubuntu 20.04

## Dependencies

Below you can find the list of all Hyperion's dependencies:

 - [Elasticsearch 7.14.X](https://www.elastic.co/downloads/elasticsearch)
 - [Kibana 7.14.X](https://www.elastic.co/downloads/kibana)
 - [RabbitMQ](https://www.rabbitmq.com)
 - [Redis](https://redis.io/topics/quickstart)
 - [Node.js v16](https://github.com/nodesource/distributions/blob/master/README.md#installation-instructions)
 - [PM2](http://pm2.keymetrics.io/docs/usage/quick-start/)
 - [EOSIO 2.0](https://github.com/EOSIO/eos/releases/latest)

On the next steps you will install and configure each one of them.

!!! note  
    The Hyperion Indexer requires Node.js and pm2 to be on the same machine. All other dependencies (Elasticsearch, RabbitMQ, Redis and EOSIO) can be installed on different machines, preferably on a high speed and low latency network. Keep in mind that indexing speed will vary greatly depending on this configuration.

## Elasticsearch Installation

Follow the detailed installation instructions on the official [Elasticsearch documentation](https://www.elastic.co/guide/en/elasticsearch/reference/current/deb.html#deb). Return to this documentation before running it.

!!! info  
    Elasticsearch is not started automatically after installation. We recomend running it with [systemd](https://www.elastic.co/guide/en/elasticsearch/reference/current/deb.html#deb-running-systemd).

!!! note  
    It is very important to know the Elasticsearch [directory layout](https://www.elastic.co/guide/en/elasticsearch/reference/current/deb.html#deb-layout) and to understand how the [configuration](https://www.elastic.co/guide/en/elasticsearch/reference/current/deb.html#deb-configuring) works.

### Configuration
##### 1. Elasticsearch configuration

Edit the following lines on `/etc/elasticsearch/elasticsearch.yml`:

```
cluster.name: CLUSTER_NAME
bootstrap.memory_lock: true
```

The memory lock option will prevent any Elasticsearch heap memory from being swapped out.

!!! warning  
    Setting `bootstrap.memory_lock: true` will make Elasticsearch try to use all the RAM configured for JVM on startup (check next step). This can cause the application to crash if you allocate more RAM than available.

!!! note  
    A different approach is to [disable swapping](https://www.elastic.co/guide/en/elasticsearch/reference/7.14/setup-configuration-memory.html#setup-configuration-memory) on your system.

!!! success "Testing"
    After starting Elasticsearch, you can see whether this setting was applied successfully by checking the value of `mlockall` in the output from this request:
        
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
    Elasticsearch includes a bundled version of OpenJDK from the JDK maintainers. You can find it on `/usr/share/elasticsearch/jdk`.

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

Override sysmted configuration by running `sudo systemctl edit elasticsearch` and add the following lines:

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

The expeted result should be something like this:

```json
{
  "name" : "ip-172-31-5-121",
  "cluster_name" : "CLUSTER_NAME",
  "cluster_uuid" : "FFl8DNcOQV-dVk3p1JDNMA",
  "version" : {
    "number" : "7.14.1",
    "build_flavor" : "default",
    "build_type" : "deb",
    "build_hash" : "606a173",
    "build_date" : "2021-08-26T00:43:15.323135Z",
    "build_snapshot" : false,
    "lucene_version" : "8.9.0",
    "minimum_wire_compatibility_version" : "6.8.0",
    "minimum_index_compatibility_version" : "6.0.0-beta1"
  },
  "tagline" : "You Know, for Search"
}
```

##### 5. Set up minimal security

The Elasticsearch security features are disabled by default. To avoid security problems, we recommend enabling the security pack.

To do that, add the following line to the end of the `/etc/elasticsearch/elasticsearch.yml` file:

```
xpack.security.enabled: true
```

Now, set the passwords for the cluster:

```bash
sudo /usr/share/elasticsearch/bin/elasticsearch-setup-passwords auto
```

Keep track of these passwords, we’ll need them again soon.

!!! note  
    You can alternatively use the `interactive` parameter to manually define your passwords.

!!! attention
    The minimal security scenario is not sufficient for production mode clusters. Check the [documentation](https://www.elastic.co/guide/en/elasticsearch/reference/current/security-basic-setup.html) for more information.

## Kibana Installation

Follow the detailed installation instructions on the official [Kibana documentation](https://www.elastic.co/guide/en/kibana/7.14/deb.html#deb-repo). Return to this documentation before running it.

!!! info  
    Kibana is not started automatically after installation. We recomend running it with [systemd](https://www.elastic.co/guide/en/kibana/7.14/deb.html#deb-running-systemd).

!!! note  
    Like on Elasticsearch, it is very important to know the Kibana [directory layout](https://www.elastic.co/guide/en/kibana/7.14/deb.html#deb-layout) and to understand how the [configuration](https://www.elastic.co/guide/en/kibana/7.14/deb.html#deb-configuring) works.


### Configuration

##### 1. Elasticsearch security

If you have enabled the security pack on Elasticsearch, you need to set up the password on Kibana. Edit the folowing lines on the `/etc/kibana/kibana.yml` file:

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

## RabbitMQ Installation

Follow the detailed installation instructions on the official [RabbitMQ documentation](https://www.rabbitmq.com/install-debian.html#installation-methods).

RabbitMQ should automatically start after installation. Check the [documentation](https://www.rabbitmq.com/install-debian.html#managing-service) for more details on how to manage its service.

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

[http://localhost:15672](http://localhost:15672)

## Redis Installation

```bash
sudo apt install redis-server
```

Redis will also start automatically after installation.

### Configuration

##### 1. Update Redis supervision method

Change the `supervised` configuration to `systemd` on `/etc/redis/redis.conf`.

!!! note
    By default, Redis binds to the localhost address. You need to edit `bind` in the config file if you want to listen to other network.


##### 2. Restart Redis
```bash
sudo systemctl restart redis.service
```

## NodeJS Instalation

```bash
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt-get install -y nodejs
```

!!! attention  
    Make sure to configure npm not to use sudo when installing global packages.

## PM2 Instalation

```bash
npm install pm2@latest -g
```

### Configuration

##### 1. Configure for system startup

```bash
pm2 startup
```

#### nodeos config.ini

 w/ state_history_plugin and chain_api_plugin
 
```
state-history-dir = "state-history"
trace-history = true
chain-state-history = true
state-history-endpoint = 127.0.0.1:8080
plugin = eosio::state_history_plugin
```

!!!tip
    On EOSIO version higher or equal to 2.0.x, use wasm-runtime = eos-vm-jit to improve
    performance.

If everything runs smoothly, now it's time to install [hyperion](hyperion.md)! :fontawesome-solid-glass-cheers:

<br>
