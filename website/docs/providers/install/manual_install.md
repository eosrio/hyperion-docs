---
title: Manual installation
---

# Manual installation

Install the application and its data services separately, then connect them with the configuration CLI. Use a dedicated Linux service account and retain the exact release artifact and lockfile used for the installation.

## Dependencies

| Component | Role and installation baseline |
|---|---|
| Node.js 22 or 24 | The application requires Node >=22; the source CI uses 22 and 24. Match native addons to the chosen runtime. |
| Linux and libc | Use a host compatible with the locked uWebSockets native build. Ubuntu 24.04 or a Debian 13 container avoids the older glibc baseline in Ubuntu 22.04. |
| Elasticsearch | Stores indexed history. Keep the cluster version and index compatibility explicit; the 4.5 source uses client 8.19.1 and includes bounded server 9.5.5 checks. |
| RabbitMQ | Carries reader, decoder, index and stream work. Configure a dedicated virtual host and application user. |
| Redis | Provides caching, coordination and runtime statistics. |
| MongoDB | Required by core startup checks as well as configured state features; it is not a substitute for indexed history. |
| Antelope node | Exposes chain RPC and the required retained SHiP range. |
| PM2 or systemd | Runs and supervises the API and indexer. |

For source builds, install Git and the native build prerequisites required by the pinned packages. The development checker uses TypeScript 7.0.2 and Bun 1.4.3; Bun is a development/checking tool, while emitted application code runs on Node.

## Elasticsearch

Follow the [official package installation guide](https://www.elastic.co/docs/deploy-manage/deploy/self-managed/install-elasticsearch-with-debian-package) for the selected server version. Enable authentication and TLS, save its CA certificate and use the configured credentials in Hyperion. Do not assume security is disabled by default.

Set the cluster name, data path and network binding for your deployment. Size heap and filesystem cache together; follow the server version's system and memory-lock guidance instead of copying a fixed heap size from another machine. If enabling `bootstrap.memory_lock`, configure the service's memory-lock limit and check the result.

```bash
sudo systemctl enable --now elasticsearch
curl --fail-with-body --cacert /path/to/http_ca.crt \
  --user elastic 'https://127.0.0.1:9200/_cluster/health?pretty'
```

The certificate path is a placeholder. Confirm the actual cluster identity and successful authentication before adding Hyperion.

## Kibana

Kibana is an optional operator interface. Match its version to the Elasticsearch deployment, configure the upstream CA and authentication, and restrict access. See [Kibana operations](/providers/help/kibana/).

## RabbitMQ

Install RabbitMQ using its [production deployment guidance](https://www.rabbitmq.com/docs/production-checklist). Create the `hyperion` virtual host and a dedicated user, then grant that user access to that exact virtual host. The management API and AMQP listener are separate endpoints; the connection template uses ports 15672 and 5672 respectively.

```bash
sudo rabbitmq-plugins enable rabbitmq_management
sudo rabbitmqctl add_vhost hyperion
sudo rabbitmqctl list_vhosts
```

Create credentials through your protected provisioning process. A virtual host named `/hyperion` is different from `hyperion`; use the exact configured name. Keep AMQP and the management interface private.

## Redis

Install Redis, enable its service, and configure authentication, network binding and persistence for your deployment. A local development check is:

```bash
redis-cli -h 127.0.0.1 -p 6379 ping
```

Expect `PONG`; use the service's authenticated/TLS invocation when enabled. Set the same connection details in Hyperion rather than weakening Redis to pass the check.

## MongoDB

Install MongoDB and initialize its application user/database access. Apply the [MongoDB security checklist](https://www.mongodb.com/docs/manual/administration/security-checklist/), including authentication and TLS. Verify service connectivity before state synchronization.

The portable projection adapter requires transaction-capable MongoDB topology; standalone MongoDB is refused by that adapter. This requirement is distinct from the existing state collections. See [state projections](/extend/projections/).

## NodeJS

Install Node 22 or 24 through your chosen package/version manager, then verify `node --version` and `npm --version`. Test the locked native addons on the target libc and CPU architecture. A native module load error must be resolved before starting the API or indexer; changing the JavaScript runtime alone does not fix a missing libc symbol.

## PM2

Install PM2 for the service account, configure startup using `pm2 startup`, and retain the generated service configuration. PM2 is the default supervisor for the `./run` wrapper. [Systemd units](/providers/setup/hyperion_configuration/#start-the-processes) provide an alternative; API worker scaling differs between supervisors.

## Antelope node (EOSIO)

Enable SHiP and chain RPC on the intended node:

```ini
plugin = eosio::chain_api_plugin
plugin = eosio::state_history_plugin
trace-history = true
chain-state-history = true
state-history-endpoint = 127.0.0.1:8080
```

Use the node version's own genesis and runtime configuration rules. Keep SHiP on a private interface. Confirm the chain ID through RPC and inspect the available SHiP range; a snapshot-based node does not automatically provide the chain's entire historical trace range.

## Hyperion

The commands below install the 4.5 source revision used by this documentation. For a later 4.5 patch, substitute its published revision and keep its lockfile:

```bash
git clone https://github.com/eosrio/hyperion-history-api.git
cd hyperion-history-api
git checkout e1818923065d648a38009572d76badeab0684af1
npm ci
```

Dependency preparation scripts build the pinned components and verify their artifacts. If npm rejects the locked Git dependencies with `EALLOWGIT`, use `npm ci --allow-git=all` for this installation, as the source CI does. Keep the committed lockfile and preparation scripts enabled. Do not substitute floating component versions.

## Proceed with Hyperion configuration

Run [configure a chain](/providers/setup/hyperion_configuration/), then [verify indexing and serving](/operate/verify-indexing/). A successful dependency install is separate from a verified indexing result.

## Source

[Package and runtime pins](https://github.com/eosrio/hyperion-history-api/blob/e1818923065d648a38009572d76badeab0684af1/package.json), [build policy](https://github.com/eosrio/hyperion-history-api/blob/e1818923065d648a38009572d76badeab0684af1/docs/development-build.md), and [connection template](https://github.com/eosrio/hyperion-history-api/blob/e1818923065d648a38009572d76badeab0684af1/references/connections.ref.json).
