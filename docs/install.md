# Manual Installation

### Dependencies

Recommended OS: Ubuntu 18.04

 - [Elasticsearch 7.6.X](https://www.elastic.co/downloads/elasticsearch)
 - [RabbitMQ](https://www.rabbitmq.com/install-debian.html)
 - [Node.js v13](https://github.com/nodesource/distributions/blob/master/README.md#installation-instructions)
 - [PM2](http://pm2.keymetrics.io/docs/usage/quick-start/)
 - [Nodeos 1.8+](https://github.com/EOSIO/eos/releases/latest) w/ state_history_plugin and chain_api_plugin
 - [Redis](https://redis.io/topics/quickstart) (only for the API caching layer)

!!! note  
    The indexer requires pm2 and node.js to be on the same machine. The other dependencies (Elasticsearch, RabbitMQ and Nodeos) can be installed on other machines, preferably on a high speed and low latency network. Indexing speed will vary greatly depending on this configuration.

#### Elasticsearch Installation

!!! info
    Follow the detailed installation instructions on the official [elasticsearch documentation](https://www.elastic.co/guide/en/elasticsearch/reference/current/deb.html)

##### 1. Edit `/etc/elasticsearch/elasticsearch.yml`

```
cluster.name: myCluster
bootstrap.memory_lock: true
```

!!! warning  
    Setting `bootstrap.memory_lock: true` will make elasticsearch try to use all the RAM configured for JVM on startup  (check next step).
    This could crash if you allocate more RAM than available on the system. 
    Setting mem_lock as `false` with swap disabled might cause the JVM or shell session to exit if elasticsearch tries to allocate more memory than is available!
    
After starting Elasticsearch, you can see whether this setting was applied successfully by checking the value of `mlockall` in the output from this request:

````
GET _nodes?filter_path=**.mlockall
```` 

##### 2. Edit `/etc/elasticsearch/jvm.options`

Avoid allocating more than 31GB when setting your heap size, even if you have enough RAM.

You can test on your system by running the following command with the desired size (change `-Xmx32g`):

`java -Xmx32g -XX:+UseCompressedOops -XX:+PrintFlagsFinal Oops | grep Oops`

Check if `UseCompressedOops` is true on the results for a valid optimized heap size. 

After that, edit the following lines on `jvm.options`, note that Xms and Xmx must have the same value.
```
-Xms16g
-Xmx16g
```

##### 3. Allow memlock
run `sudo systemctl edit elasticsearch` and add the following lines:

```
[Service]
LimitMEMLOCK=infinity
```

##### 4. Start elasticsearch and check the logs (verify if the memory lock was successful)

```bash
sudo service elasticsearch start
sudo less /var/log/elasticsearch/myCluster.log
sudo systemctl enable elasticsearch
```

##### 5. Test the REST API

`curl http://localhost:9200`

The expeted result should be something like this:

```json
{
  "name" : "ip-172-31-5-121",
  "cluster_name" : "hyperion",
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

##### 6. Security
By default, elasticsearch comes without a password configured. To avoid security problems, we recommend to
enable the security pack on elasticsearch. 

To do that, add `xpack.security.enabled: true` to the end of `/etc/elasticsearch/elasticsearch.yml` file.

Now it’s time to set the passwords for the cluster:

`````bash
sudo /usr/share/elasticsearch/bin/elasticsearch-setup-passwords auto
`````

You can alternatively skip the auto parameter to manually define your passwords using the interactive parameter. 
Keep track of these passwords, we’ll need them again soon.

<br>

#### RabbitMQ Installation

!!! info
    Follow the detailed installation instructions on the official [RabbitMQ documentation](https://www.rabbitmq.com/install-debian.html#installation-methods)

##### 1. Enable the WebUI

```bash
sudo rabbitmq-plugins enable rabbitmq_management
```

##### 2. Add vhost
```bash
sudo rabbitmqctl add_vhost /hyperion
```

##### 2. Create a user and password
```bash
sudo rabbitmqctl add_user {my_user} {my_password}
```

##### 3. Set the user as administrator
```bash
sudo rabbitmqctl set_user_tags {my_user} administrator
```

##### 4. Set the user permissions to the vhost
```bash
sudo rabbitmqctl set_permissions -p /hyperion {my_user} ".*" ".*" ".*"
```

##### 5. Check access to the WebUI

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

<br>

#### nodeos config.ini
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

If everything runs smoothly, now it's time to install [hyperion](hyperion.md)!

<br>
