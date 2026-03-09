# Elasticsearch Cluster Operations

This guide covers common Elasticsearch cluster maintenance tasks for Hyperion providers running multi-node ES clusters.

## Cluster Health Check

Check the overall cluster health:

```bash
curl -sk "https://localhost:9200/_cluster/health?pretty" -u <user>:<password>
```

!!! success "Healthy Cluster"
    A healthy cluster shows `"status" : "green"`, all nodes present, and `"unassigned_shards" : 0`.

Check individual node status:

```bash
curl -sk "https://localhost:9200/_cat/nodes?v&h=name,ip,version,heap.percent,ram.percent,cpu,load_1m,master" \
  -u <user>:<password>
```

Check for unassigned shards:

```bash
curl -sk "https://localhost:9200/_cat/shards?v" -u <user>:<password> | grep UNASSIGNED
```

## Rolling Upgrade (Zero Downtime)

To upgrade Elasticsearch across a multi-node cluster without downtime, upgrade one node at a time.

### Prerequisites

- Cluster must be **green** before starting
- All nodes must have the target version available via `apt` or as a `.deb` package
- Upgrade non-master nodes first, master node last

### Step 1: Add the Elastic APT Repository (if not present)

```bash
curl -fsSL https://artifacts.elastic.co/GPG-KEY-elasticsearch | \
  gpg --batch --dearmor -o /usr/share/keyrings/elasticsearch-keyring.gpg

echo "deb [signed-by=/usr/share/keyrings/elasticsearch-keyring.gpg] \
  https://artifacts.elastic.co/packages/9.x/apt stable main" \
  > /etc/apt/sources.list.d/elastic-9.x.list

apt-get update
```

Verify the target version is available:

```bash
apt-cache policy elasticsearch
```

### Step 2: Disable Shard Allocation

This prevents the cluster from rebalancing shards while a node is down:

```bash
curl -sk -X PUT "https://localhost:9200/_cluster/settings" \
  -H "Content-Type: application/json" \
  -u <user>:<password> \
  -d '{ "transient": { "cluster.routing.allocation.enable": "primaries" } }'
```

### Step 3: Upgrade Each Node

For **each node** (non-master first, master last):

```bash
# Stop ES
sudo systemctl stop elasticsearch

# Upgrade the package
sudo systemctl daemon-reload
sudo apt-get install -y elasticsearch=<VERSION>

# Start ES
sudo systemctl start elasticsearch
```

Wait for the node to rejoin the cluster before proceeding to the next node:

```bash
curl -sk "https://localhost:9200/_cat/nodes?v&h=name,version,master" -u <user>:<password>
```

### Step 4: Re-enable Shard Allocation

After **all** nodes are upgraded:

```bash
curl -sk -X PUT "https://localhost:9200/_cluster/settings" \
  -H "Content-Type: application/json" \
  -u <user>:<password> \
  -d '{ "transient": { "cluster.routing.allocation.enable": "all" } }'
```

### Step 5: Verify

```bash
curl -sk "https://localhost:9200/_cluster/health?pretty" -u <user>:<password>
```

The cluster should return to **green** once all shards are reallocated.

!!! tip "Kibana Upgrade"
    Kibana should be upgraded to match the ES version:
    `sudo apt-get install -y kibana=<VERSION>`

## Troubleshooting

### HTTP Port 9200 Not Listening

If a node's transport port (9300) is active but HTTP (9200) is not responding:

```bash
# Check if the port is listening
ss -tlnp | grep -E "9200|9300"

# Check ES thread pools for saturation
curl -sk "https://localhost:9200/_cat/thread_pool?v&h=name,active,queue,rejected&s=rejected:desc" \
  -u <user>:<password>
```

!!! warning "Thread Pool Saturation"
    If the `system_read` thread pool shows maximum active threads and a full queue, the HTTP layer may be unresponsive. Restart Elasticsearch to recover.

### Node Won't Restart (node.lock Error)

If you see `LockObtainFailedException: Lock held by another program: /data/ES/data/node.lock`:

```bash
# Check what process holds the lock
fuser /path/to/es/data/node.lock

# Check if the process is a zombie or stuck in D-state
cat /proc/<PID>/status | grep State
```

- **Zombie (Z)**: The parent process was killed. Try `systemctl reset-failed elasticsearch`.
- **D-state (uninterruptible sleep)**: Threads stuck in kernel I/O. **A reboot is required** — no signal can kill D-state threads.

### Preventing Automatic ES Restarts

On Ubuntu/Debian systems, `unattended-upgrades` with `needrestart` can automatically restart Elasticsearch after security patches. This is dangerous for production clusters because:

1. Mass service restarts can cause ES shutdown to race with disk I/O
2. Stuck shutdowns can leave threads in D-state, holding the `node.lock`
3. The node becomes unrecoverable without a reboot

To prevent this, create a `needrestart` exclusion:

```bash
sudo mkdir -p /etc/needrestart/conf.d
echo '$nrconf{override_rc}{qr(^elasticsearch)} = 0;' | \
  sudo tee /etc/needrestart/conf.d/no-restart-elasticsearch.conf
```

!!! danger "Apply to All Nodes"
    This exclusion should be applied to **every** ES node in your cluster. Elasticsearch restarts should only be performed manually using the rolling upgrade procedure above.

### Cluster RED After Node Restart

This is **expected** and temporary. When a node leaves the cluster, its shards become unassigned. The cluster will:

1. Immediately go **red** (if primaries are missing) or **yellow** (if only replicas are missing)
2. Wait for the node to rejoin
3. Reallocate shards automatically
4. Return to **green**

The recovery time depends on the number of shards and data size. Monitor progress with:

```bash
curl -sk "https://localhost:9200/_cluster/health?pretty" -u <user>:<password>
```
