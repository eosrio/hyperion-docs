# Hyperion Docker

* [Hyperion Docker Repository](https://github.com/eosrio/hyperion-docker){:target="_blank"}

!!! warning
    Hyperion Docker is not recommended for production environments, only for testing, debugging and local networks.

Hyperion Docker is a multi-container Docker application designed to install and run Hyperion as quickly as possible. It will index data from a development chain where you can define your contracts, execute some actions, and observe the behavior when querying the Hyperion API.

!!! linux "Recommended Operating System"
    Ubuntu 24.04

## Architecture

### Layers

To simplify, we divide the microservices involved with Hyperion into layers.

1. Blockchain (Leap with state-history plugin)
2. Hyperion (API/Indexer)
3. Infrastructure (Redis, RabbitMQ, MongoDB, RedisCommander)
4. Elasticsearch/Kibana (New mandatory external layer)

The **first layer** would be the Blockchain itself - `Node Service`. For Hyperion to work, we need a blockchain to consume data from. In this layer, we have a single microservice:

!!! note "Leap Node"
    Local blockchain for data consumption

The **second layer** would be Hyperion itself, which is divided into 2 microservices:

!!! note "Hyperion API"
    This service allows interaction with the indexed data.

!!! note "Hyperion Indexer"
    As the name suggests, this service connects to the blockchain to fetch and index data.

The **third layer**, which we can understand as `Infrastructure Services`, includes 3 main microservices:

1. Redis
2. RabbitMQ
3. MongoDB

The **fourth layer** (new) is composed of Elasticsearch and Kibana, which are installed separately using the official Elastic method. This change allows for greater flexibility and alignment with best practices recommended by Elastic.

??? note "Infrastructure Diagram"
    [![infrastructure](../../assets/img/infrastructure.svg)](../../assets/img/infrastructure.svg)

Considering this structure, the [Project Repository](https://github.com/eosrio/hyperion-docker){:target="_blank"} contains 3 folders representing the first three layers mentioned:

* hyperion
* infra
* nodeos

In each directory mentioned above, we added a `docker-compose.yaml` file responsible for starting their respective microservices.

For those who have never used `docker-compose`, it allows the creation of multiple containers simultaneously. These containers are declared as services.

??? note "Example `docker-compose.yaml`"
    [![docker-compose](../../assets/img/docker-compose-file.png)](../../assets/img/docker-compose-file.png)

All services (containers) declared within a `docker-compose.yaml` share the same network by default. Since we separated the containers into different files, we need to create a network in Docker that will be shared. The procedure will be detailed below in the configuration process.

## Getting Started

### Prerequisites

Ensure that Docker and Docker Compose are installed on your system.

### Installing Elasticsearch and Kibana

Hyperion depends on Elasticsearch for indexing and searching data. Starting with this version, we recommend that the installation and management of Elasticsearch and Kibana be done using the official Elastic method, ensuring greater flexibility and ease of maintenance.

Execute the command below to install locally:

```bash
curl -fsSL https://elastic.co/start-local | sed 's/xpack.license.self_generated.type=trial/xpack.license.self_generated.type=basic/g' | sh
```

This command will create a folder called `elastic-start-local` with all the necessary files, including:

* Management scripts (`start.sh`, `stop.sh`, `uninstall.sh`)
* `.env` file with access credentials
* Elastic's `docker-compose.yml` file

After installation, start the Elasticsearch and Kibana services:

```bash
cd elastic-start-local
./start.sh
```

You can verify that the services are working by accessing:

* Elasticsearch: [http://localhost:9200](http://localhost:9200){:target="_blank"}
* Kibana: [http://localhost:5601](http://localhost:5601){:target="_blank"}

Access credentials will be available in the `.env` file. You will need them later to configure Hyperion.

!!! tip "Tip"
    To view the credentials in the `.env` file, you can use:
    ```bash
    cat elastic-start-local/.env
    ```

!!! note "Production Environments"
    For deployments in production environments, consult the official Elastic documentation for advanced configurations:
    [Elastic Docs - Self-Managed](https://www.elastic.co/docs/deploy-manage/deploy/self-managed/install-elasticsearch-docker-compose){:target="_blank"}

### Infrastructure Layer

#### 1. Clone the repository

Clone the repository to your local machine in the **same parent directory** where elastic-start-local folder was created:

```bash
# Make sure you're in the same directory where elastic-start-local was created
cd ..  # If you're currently in the elastic-start-local directory
git clone https://github.com/eosrio/hyperion-docker.git
cd hyperion-docker
```

!!! warning "Directory Structure"
    Your directory structure should look like this:
    ```
/your_parent_directory/
    ├── elastic-start-local/   # Elasticsearch installation
    └── hyperion-docker/       # Hyperion Docker repository
    ```
    This structure is required for the `start.sh` script to work correctly.

#### 2. Verify Docker is running

Make sure Docker is running by executing the following command in the terminal:

```bash
docker ps
```

!!! abstract "Expected result"
    ![infrastructure](../../assets/img/docker-ps.png)

#### 3. Create the shared network

Create a network that will be shared between containers by executing the command:

```bash
docker network create hyperion
```

!!! abstract "Expected result"
    ![infrastructure](../../assets/img/docker-create-network.png)

#### 4. Create the microservices

Now, let's start creating the microservices of the infrastructure layer.

Navigate to the **infra** directory of the repository and execute the following command:

```bash
cd infra
docker compose up -d
```

!!! info "Flag `-d`"
    Note that we use the `-d` flag to run in detached mode, allowing us to continue using the command line session.

This command will create the microservices (Redis, RabbitMQ, MongoDB) needed for Hyperion to work. Note that Elasticsearch and Kibana are no longer included in this layer, as they are now managed separately.

The first time you run the command, it may take some time for everything to be configured. You can follow the execution log using the command:

```bash
docker compose logs -f
```

Press ++ctrl+c++ to terminate the log reading process.

#### 5. Verify the services

Check if the services are working:

* RabbitMQ - [http://localhost:15672/](http://localhost:15672){:target="_blank"}

After completing the Infrastructure Layer configuration, we can proceed to the Leap Layer (nodeos).

### Leap Layer (nodeos)

Navigate to the nodeos directory in the repository and execute:

```bash
cd ../nodeos
docker compose up -d
```

This layer was added to the repository assuming that you don't have a configured blockchain from which the Hyperion Indexer will consume data.

After the infrastructure and blockchain node are configured, we can finally start **Hyperion**.

### Hyperion Layer

This layer has 2 microservices, **Hyperion API** and **Hyperion Indexer**.

#### Starting Hyperion services

To start the Hyperion services, we've created a convenient startup script that automatically handles the Elasticsearch password configuration. Navigate to the hyperion directory and execute the following command:

```bash
cd ../hyperion
./start.sh
```

The `start.sh` script performs the following operations:

1. **Retrieves Elasticsearch password**: Automatically reads the password from the `.env` file generated during the Elasticsearch installation (using the relative path `../../elastic-start-local/.env`)
2. **Updates configuration**: Replaces the password placeholder in the `connections.json` file with the actual password
3. **Starts services**: Executes `docker compose up -d` to start the Hyperion services

!!! note "Directory Structure Reminder"
    This automatic configuration depends on the directory structure mentioned earlier, with both `elastic-start-local` and `hyperion-docker` directories at the same level.

This automated process ensures that Hyperion is properly configured to communicate with the Elasticsearch instance without manual intervention.

!!! note "Alternative Manual Configuration"
    If you prefer to configure manually, you can edit the `connections.json` file in the `config` directory and replace `"ELASTIC_PASSWORD"` with the password found in the `elastic-start-local/.env` file, then run `docker compose up -d`.

## Troubleshooting

### Configuring `connections.json`

The `connections.json` file is crucial for the proper functioning of Hyperion as it defines how Hyperion connects to all required services. If you encounter connection issues, or if you're using a custom infrastructure setup, you may need to adjust the host configurations in this file.

!!! important "Host Configuration"
    The default configuration assumes that:

    * RabbitMQ and Redis are running as Docker services named "rabbitmq" and "redis" respectively
    * Elasticsearch and MongoDB are accessible via `host.docker.internal` (which resolves to the host machine from inside Docker containers)

Here's how to modify the configuration for different scenarios:

#### Using services outside Docker or with different names

```json
{
  "amqp": {
    "host": "your-rabbitmq-host:5672",  // Change if RabbitMQ is not running as "rabbitmq" service
    // ...other AMQP settings
  },
  "elasticsearch": {
    "host": "your-elasticsearch-host:9200",  // Change if Elasticsearch is at a different location
    "ingest_nodes": [
      "your-elasticsearch-host:9200"
    ],
    // ...other Elasticsearch settings
  },
  "redis": {
    "host": "your-redis-host",  // Change if Redis is not running as "redis" service
    "port": "6379"
  },
  "mongodb": {
    "host": "your-mongodb-host",  // Change if MongoDB is at a different location
    // ...other MongoDB settings
  }
}
```

#### Common connection issues and solutions

* **Connection refused errors**: Verify that the service is running and that the hostname/port is correct
* **Authentication failures**: Ensure that usernames and passwords are correctly set in the configuration
* **Docker networking issues**: If services can't reach each other, verify they are on the same Docker network (`hyperion`)
* **Host resolution issues**: If using custom hostnames, ensure they are properly resolved (you may need to add entries to `/etc/hosts` or use Docker's DNS)

!!! tip "Testing connections"
    You can test connections to each service using appropriate tools:
    *For Elasticsearch: `curl -u elastic:your_password http://host:9200`
    * For RabbitMQ: `curl -u rabbitmq:rabbitmq http://host:15672/api/overview`
    *For Redis: Use `redis-cli -h host -p 6379 ping`
    * For MongoDB: Use `mongosh --host host --port 27017`

For issues related to Elasticsearch/Kibana, consult the official Elastic documentation:

* [Elasticsearch Troubleshooting](https://www.elastic.co/guide/en/elasticsearch/reference/current/troubleshooting.html){:target="_blank"}
* [Kibana Troubleshooting](https://www.elastic.co/guide/en/kibana/current/troubleshooting.html){:target="_blank"}

For issues related to Hyperion:

* Check if all layers are working correctly
* Check if the Elasticsearch credentials are configured correctly in the `connections.json` file
* Check the service logs using `docker compose logs -f`

## Next steps

Feel free to modify the configurations according to your needs. All configuration files are located in `hyperion/config` or `nodeos/leap/config`.

For more details, consult the [Hyperion Configuration Section :fontawesome-solid-arrow-right-long:](../setup/hyperion_configuration.md).

## References and Useful Links

* [Official Elasticsearch Documentation](https://www.elastic.co/guide/en/elasticsearch/reference/current/index.html){:target="_blank"}
* [Official Kibana Documentation](https://www.elastic.co/guide/en/kibana/current/index.html){:target="_blank"}
* [Docker Compose Documentation](https://docs.docker.com/compose/){:target="_blank"}
* [Hyperion Repository](https://github.com/eosrio/hyperion-history-api){:target="_blank"}
