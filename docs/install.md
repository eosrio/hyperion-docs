# Manual Installation

This section describes how to manually setup the environment needed to run Hyperion. If you want more control of your installation, this is the way to go.

!!! attention  
    Recommended OS: Ubuntu 20.04

### Dependencies

 - [Elasticsearch 7.14.X](https://www.elastic.co/downloads/elasticsearch)
 - [RabbitMQ](https://www.rabbitmq.com/install-debian.html)
 - [Redis](https://redis.io/topics/quickstart)
 - [Node.js v16](https://github.com/nodesource/distributions/blob/master/README.md#installation-instructions)
 - [PM2](http://pm2.keymetrics.io/docs/usage/quick-start/)
 - [EOSIO 2.0](https://github.com/EOSIO/eos/releases/latest)

!!! note  
    The indexer requires Node.js and pm2 to be on the same machine. All other dependencies (Elasticsearch, RabbitMQ, Redis and EOSIO) can be installed on different machines, preferably on a high speed and low latency network. Keep in mind that indexing speed will vary greatly depending on this configuration.

### Elasticsearch Installation

Follow the detailed installation instructions on the official [Elasticsearch documentation](https://www.elastic.co/guide/en/elasticsearch/reference/current/deb.html#deb).

!!! info  
    Elasticsearch is not started automatically after installation. We recomend running it with [systemd](https://www.elastic.co/guide/en/elasticsearch/reference/current/deb.html#deb-running-systemd).

!!! note  
    It is very important to know the Elasticsearch [directory layout](https://www.elastic.co/guide/en/elasticsearch/reference/current/deb.html#deb-layout) and to understand how [its configuration](https://www.elastic.co/guide/en/elasticsearch/reference/current/deb.html#deb-configuring) works.

#### Configuration
##### 1. Elasticsearch configuration

Edit the following lines on `/etc/elasticsearch/elasticsearch.yml`.

```
cluster.name: CLUSTER_NAME
bootstrap.memory_lock: true
```

The memory lock option will prevent any Elasticsearch heap memory from being swapped out.

!!! warning  
    Setting `bootstrap.memory_lock: true` will make elasticsearch try to use all the RAM configured for JVM on startup (check next step). This can cause Elasticsearch to crash if you allocate more RAM than available.

!!! note  
    A different approach is to [disable swapping](https://www.elastic.co/guide/en/elasticsearch/reference/7.14/setup-configuration-memory.html#setup-configuration-memory) on your system.

!!! success "Testing"
    After starting Elasticsearch, you can see whether this setting was applied successfully by checking the value of `mlockall` in the output from this request:
        
    ````
    curl -X GET "localhost:9200/_nodes?filter_path=**.mlockall&pretty"
    ````

##### 2. Heap size configuration

For a optimized heap size, check how much RAM can be allocated by the JVM on your system. Run the following command:

    ````   
    java -Xms16g -Xmx16g -XX:+UseCompressedOops -XX:+PrintFlagsFinal Oops | grep Oops
    ````

Check if `UseCompressedOops` is true on the results and change `-Xms` and `-Xmx` to the desired value.

!!! note  
    Elasticsearch includes a bundled version of OpenJDK from the JDK maintainers. You can find it on `/usr/share/elasticsearch/jdk`.

After that, change the heap size by editting the following lines on `/etc/elasticsearch/jvm.options`.

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

 ```
 sudo systemctl daemon-reload
 ```
 
##### 4. Start Elasticsearch

Start Elasticsearch and check the logs:

```
sudo systemctl start elasticsearch.service
sudo less /var/log/elasticsearch/CLUSTE_NAME.log
```

Finally, enable it to run at startup:

```
sudo systemctl enable elasticsearch.service
```

!!! note  
    Don't forget to check if memory lock worked.

Test the REST API:

```
curl -X GET "localhost:9200/?pretty"
```

The expeted result should be something like this:

```json
{
  "name" : "ip-172-31-5-121",
  "cluster_name" : "CLUSTER_NAME",
  "cluster_uuid" : "....",
  "version" : {
    "number" : "7.1.0",
    "build_flavor" : "default",
    "build_type" : "deb",
    "build_hash" : "606a173",
    "build_date" : "2019-05-16T00:43:15.323135Z",
    "build_snapshot" : false,
    "lucene_version" : "8.0.0",
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
`xpack.security.enabled: true` to the end of
```

Now, set the passwords for the cluster:

```
sudo /usr/share/elasticsearch/bin/elasticsearch-setup-passwords auto
```

Keep track of these passwords, we’ll need them again soon.

!!! note  
    You can alternatively use the `interactive` parameter to manually define your passwords.

!!! note
    The minimal security scenario is not sufficient for production mode clusters. Check the [documentation](https://www.elastic.co/guide/en/elasticsearch/reference/current/security-basic-setup.html) for more information.


#### RabbitMQ Installation

!!! info
    Follow the detailed installation instructions on the official [RabbitMQ documentation](https://www.rabbitmq.com/install-debian.html#installation-methods)

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
sudo rabbitmqctl add_user {my_user} {my_password}
```

##### 4. Set the user as administrator
```bash
sudo rabbitmqctl set_user_tags {my_user} administrator
```

##### 5. Set the user permissions to the vhost
```bash
sudo rabbitmqctl set_permissions -p hyperion {my_user} ".*" ".*" ".*"
```

##### 6. Check access to the WebUI

[http://localhost:15672](http://localhost:15672)

<br>

#### Redis Installation

##### 1. Install
```bash
sudo apt install redis-server
```

##### 2. Edit `/etc/redis/redis.conf`

Change `supervised` to `systemd`

!!! note
    By default, redis binds to the localhost address. You need to edit `bind` in
    the config file if you want to listen to other network.


##### 3. Restart redis
```bash
sudo systemctl restart redis.service
```

<br>

#### NodeJS

##### 1. Add the nodejs source
```bash
curl -sL https://deb.nodesource.com/setup_13.x | sudo -E bash -
```

##### 2. Install nodejs
```bash
sudo apt-get install -y nodejs
```

<br>

#### PM2

##### 1. Install
```bash
sudo npm install pm2@latest -g
```

##### 2. Configure for system startup
```bash
sudo pm2 startup
```

<br>

#### Kibana Installation

!!! info
    Follow the detailed installation instructions on the [official documentation](https://www.elastic.co/downloads/kibana)

If you have enabled the security pack on elastic, you'll need to setup the password on Kibana. Edit the `/etc/kibana/kibana.yml` file, find the lines that look like this:

`````bash 
#elasticsearch.username: "user"
#elasticsearch.password: "pass"
`````                        
                
Uncomment the username and password fields by removing the # character at the beginning of the line. Change "user" to "kibana" 
and then change "pass" to whatever the setup-passwords command tells us the Kibana password is. 
Save the file, then we can restart Kibana.

```
systemctl restart kibana
```
<br>

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
