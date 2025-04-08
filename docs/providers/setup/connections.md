[:fontawesome-solid-arrow-left-long: Hyperion Configuration](hyperion_configuration.md#initialize-connections)
# Connections Configuration Reference

!!! info
    <u>Failover option: </u> Now you can add an array of strings or array of objects to configure failover on Hyperion. Check `Chain Parameters` below on "ship" paramert to configure. 

### RabbitMQ parameters

- `"host":"127.0.0.1:5672"`
- `"api":"127.0.0.1:15672"`
- `"user":"my_user"`
- `"pass":"my_password"`
- `"vhost":"hyperion"`

### Elasticsearch parameters

- `"protocol": "http"` ⇒ Protocol used to connect to Elasticsearch (default: http).
- `"host":"127.0.0.1:9200"`
- `"ingest_nodes": [ "127.0.0.1:9200"]`
- `"user":""` ⇒ User defined on elasticsearch configuration.
- `"pass":""` ⇒ Password defined on elasticsearch configuration.

### Redis parameters

- `"host":"127.0.0.1"`
- `"port":"6379"`

### Chain Parameters

- `"name":"EOS Mainnet"`
- `"chain_id":"aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906"`
- `"http":"http://127.0.0.1:8888"`
- <u>`"ship": [ {"label": "primary", "url": "ws://127.0.0.1:8080"},   {"label": "secondary", "url": "ws://127.0.0.1:38080"}], or 
"ship": ["ws://127.0.0.1:8080","ws://127.0.0.1:38080"] `</u>
- `"WS_ROUTER_HOST": "127.0.0.1"` ⇒ Endpoint used by the Streaming API to connect to the Indexer. This is important when
  Indexer and API aren't on the same machine/instance.
- `"WS_ROUTER_PORT":7001` ⇒ Port used by the Streaming API to connect to the Indexer.

## Example

In this example we have a connection.json file with:

- Local RabbitMQ
    - user: admin
    - pass: 123456
- Local Elasticsearch
    - no user
    - no password
- Local Reddis
- State History connections: 
    - Remote EOS Mainnet
    - Remote sample chain



````json
{
  "amqp": {
    "host": "127.0.0.1:5672",
    "api": "127.0.0.1:15672",
    "user": "admin",
    "pass": "123456",
    "vhost": "hyperion"
  },
  "elasticsearch": {
    "protocol": "http",
    "host": "127.0.0.1:9200",
    "ingest_nodes": [
      "127.0.0.1:9200"
    ],
    "user": "",
    "pass": ""
  },
  "redis": {
    "host": "127.0.0.1",
    "port": "6379"
  },
  "chains": {
    "eos": {
      "name": "EOS Mainnet",
      "chain_id": "aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906",
      "http": "http://127.0.0.1:8888",
      "ship": "ws://127.0.0.1:8080",
      "WS_ROUTER_PORT": 7001
    },
    "sample": {
      "name": "Sample Mainnet",
      "chain_id": "9473887b3cd1a897ce03ae5b6a865651747e2e152090f99c1d19d4adf73238fas",
      "http": "https://sample.io",
      "ship": "ws://192.168.0.1:8080",
      "WS_ROUTER_HOST": "127.0.0.1",
      "WS_ROUTER_PORT": 8034
    }
  }
}
````

[:fontawesome-solid-arrow-left-long: Hyperion Configuration](hyperion_configuration.md#initialize-connections){ .md-button }
