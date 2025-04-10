<div id="homepage" markdown="1"></div>

# Hyperion History API

[![Hyperion](assets/img/cover.png)](assets/img/cover.png)

!!! abstract ""
    Scalable Full History & State Solution for [Antelope](https://antelope.io/){:target="_blank"} (former EOSIO) based blockchains.
    <br> Made with ♥ by [Rio Blocks / EOS Rio](https://rioblocks.io/?lang=en){:target="_blank"}

## Official documentation

!!! quote ""
    ### For **Providers**
    ---

    [Getting Started](providers/get-started.md){ .md-button .md-button--primary}
    [Configuring](providers/setup/hyperion_configuration.md){ .md-button }
    [Updating](providers/update.md){ .md-button }
    [Repairing](providers/repair.md){ .md-button }

!!! quote ""
    ### For **Developers**
    ---

    [Getting Started](dev/howtouse.md){ .md-button .md-button--primary}
    [Stream Client](dev/stream_client.md){ .md-button }
    [Endpoints List](dev/endpoint.md){ .md-button }
    

    ---
    Testing/Development environment:

    [Running Docker](providers/install/docker.md){ .md-button}
    [Running LXD](providers/install/lxd.md){ .md-button}

!!! quote ""
    ### **API Reference**

    [V2](api/v2.md){ .md-button }
    [V1 Compatible](api/v1.md){ .md-button }


### Official plugins:

- [Hyperion Lightweight Explorer](https://github.com/eosrio/hyperion-explorer-plugin){:target="_blank"}

## 1. Overview

Hyperion is a high-performance, scalable solution designed to index, store, and retrieve the full history and current state of Antelope-based blockchains (formerly EOSIO). Antelope chains can generate vast amounts of data, demanding robust indexing, optimized storage, and efficient querying capabilities. Hyperion addresses these challenges by providing open-source software tailored for block producers, infrastructure providers, and dApp developers.

**Key Features:**

*   **Scalable Indexing:** Designed to handle high-throughput Antelope chains.
*   **Full History:** Captures and stores every action and state change.
*   **Optimized Data Structure:** Actions are stored flattened, with inline actions linked via transaction IDs, reducing redundancy (e.g., notifications identical to parent actions are omitted). Full blocks/transactions are reconstructed on demand, saving storage space.
*   **Current State Indexing:** Optionally stores the latest state of specific contracts/tables in MongoDB for fast lookups.
*   **Modern API (v2):** Offers comprehensive endpoints for history, state, and statistics. Legacy v1 API support is maintained for compatibility.
*   **Live Streaming:** Provides real-time action and state delta streams via WebSockets.
*   **Extensible:** Features a plugin system managed by the `hpm` tool.

## 2. Core Concepts

Hyperion operates by separating the concerns of historical event streams and current on-chain state:

1.  **Data Ingestion:** The **Indexer** connects to an Antelope node's State History Plugin (SHIP) WebSocket endpoint.
2.  **Processing & Queuing:** The Indexer deserializes action traces and state deltas, applies filtering (whitelists/blacklists), enriches data, and pushes processed data onto **RabbitMQ** queues.
3.  **History Storage:** Indexer worker processes consume data from RabbitMQ and index historical action traces and state deltas into **Elasticsearch**. This forms the backbone for historical queries.
4.  **State Storage:** If configured, Indexer workers (or dedicated sync tools) process deltas or perform full scans to maintain the *current state* of specified accounts, proposals, voters, or contract tables within **MongoDB**.
5.  **Data Serving:** The **API Server** handles client requests. It queries:
*   **Elasticsearch** for historical data (`/v2/history/*`, `/v1/*`).
*   **MongoDB** for current state data (`/v2/state/*`).
*   **Redis** for cached responses and transaction lookups.
*   The **Antelope Node** directly for real-time chain info or as a fallback.


## 3. Architecture

A typical Hyperion deployment involves the following components. While they can run on a single machine for smaller chains or development, production environments benefit from distributing them across multiple servers connected via a high-speed network.

### 3.1 Antelope Node (SHIP Enabled)
The source of blockchain data. A node (e.g., built from the [AntelopeIO/leap](https://github.com/AntelopeIO/leap){:target="_blank"} repository) running the `state_history_plugin` provides action traces and state deltas via a WebSocket connection to the Hyperion Indexer.

### 3.2 RabbitMQ
A robust message queuing system. Used as a buffer and transport layer between the different stages of the Hyperion Indexer (Reader -> Deserializer -> Indexer Workers) and for routing real-time data streams to connected API clients.

### 3.3 Redis
An in-memory data store used for:
*   **API Response Caching:** Temporarily storing results of frequent API queries.
*   **Preemptive Transaction Caching:** Storing recent transaction details for fast lookups via `v2/history/get_transaction` and `check_transaction`.
*   **API Usage Statistics:** Tracking API endpoint usage rates.
*   **Inter-process Communication:** Facilitating coordination, e.g., for rate limiting across clustered API instances (via `@fastify/rate-limit`).
*   **Live Streaming Coordination:** Used by the Socket.IO Redis adapter for managing stream subscriptions across clustered API instances.

### 3.4 Elasticsearch Cluster

The primary datastore for **indexed historical data**. It stores processed action traces, state deltas, and block headers.
*   **Role:** Enables powerful search and aggregation capabilities for historical queries (e.g., `get_actions`, `get_deltas`).
*   **Requirement:** Essential for all Hyperion history functionalities.
*   **Recommendation:** Requires significant RAM (32GB+ per node recommended), CPU, and fast storage (SSD/NVMe recommended for ingest nodes, HDDs can be used for cold storage nodes). Multi-node clusters are highly recommended for production.

### 3.5 MongoDB

This MongoDB integration complements Elasticsearch by focusing on **current state data** rather than historical actions, enabling efficient state queries without scanning history.
*   **Recommendation:** Requires adequate RAM, CPU, and Disk I/O, particularly if indexing large amounts of contract state.

**System Contract State Storage:**
- Stores searchable state data for Antelope system contracts like token balances, proposals, and voter information
- Maintains three primary collections by default:
    - `accounts`: Stores token balances with indexes for code, scope, and symbol
    - `proposals`: Tracks governance proposals with detailed approval status
    - `voters`: Manages staking and voting records with optimized query paths

**Custom Contract State Tracking:**

- Supports operator-defined custom contracts and tables
- Uses a flexible configuration system to define which contract tables to synchronize
- Automatically creates appropriate indexes based on contract schemas
- Stores tables in collections named `{contract}-{table}`


**State Synchronization:**

- Enables state synchronization even when starting from snapshots, providing a complete view of the blockchain state
- Managed through the `hyp-control` CLI tool, allowing for targeted synchronization of specific contracts
- Maintains block references to track state changes over time


**Query Optimization:**

- Creates specialized indexes based on common query patterns
- Supports advanced query capabilities including MongoDB operators like `$gt`, `$lt`, `$in` for filters
- Automatically handles date fields for time-based queries


**API Integration:**

- Provides dedicated API endpoints for querying state data
- Supports endpoints like `/v2/state/*` API endpoints
- Offers flexible filtering options with pagination


**Dynamic Contract Schema Support:**

- Either automatically creates indexes based on contract ABIs
- Or allows for manual index configuration for custom query patterns
- Supports text search indexes for specific fields when configured


### 3.6 Hyperion Indexer

A Node.js application responsible for fetching data from SHIP, deserializing it, processing actions and deltas according to configured filters/handlers, and publishing data to RabbitMQ queues for indexing and state updates. Managed by the [PM2](https://pm2.keymetrics.io/){:target="_blank"} process manager.

### 3.7 Hyperion API Server
A Node.js (Fastify framework) application that serves the HTTP API endpoints (v1 and v2). It queries Elasticsearch, MongoDB, Redis, and the Antelope node as needed. It also manages the Swagger documentation UI and handles WebSocket connections for live streaming. Typically run in cluster mode using PM2 for scalability and resilience.

### 3.8 Hyperion Stream Client (Optional)
A client library (for Web and Node.js) simplifying connection to the real-time streaming endpoints offered by enabled Hyperion providers. 

See [Stream Client Documentation](https://hyperion.docs.eosrio.io/dev/stream_client/).

### 3.9 Hyperion Plugins (Optional)
Hyperion features an extensible plugin architecture. Plugins can add custom data handlers, API routes, or other functionalities. Managed via the `hpm` (hyperion plugin manager) command-line tool.
 
* **Example:** [Hyperion Lightweight Explorer](https://github.com/eosrio/hyperion-explorer-plugin){:target="_blank"}


<br>
