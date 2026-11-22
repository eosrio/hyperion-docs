---
title: RabbitMQ operations
---

# RabbitMQ

Inspect pending deliveries, consumers and broker health before purging or deleting any queue. Queue data can be the only pending copy between source ingestion and durable storage.

## How to delete all the queues from RabbitMQ?

Prefer an exact, scoped operation over resetting the broker. First stop or pause the affected Hyperion producers/consumers cleanly, identify the chain's virtual host and queue names, and establish which retained source will replay any removed work.

### Using policies — management console

Inspect the virtual host, matching pattern and policy priority in the management console. An expiry policy can affect more queues than intended and is not a recovery method for failed database writes. Use a narrowly scoped policy only for a deliberate maintenance plan and remove it after verification.

### Using command line

List the queues for the exact virtual host:

```bash
rabbitmqctl list_queues -p hyperion name messages_ready messages_unacknowledged consumers
```

Use the installed broker version's CLI or management API to target the reviewed queue. Purging removes queued messages; deleting removes the queue itself. Neither should be combined with a broker-wide reset to fix an authentication or connection problem.

## Verify recovery

Confirm consumers reconnect, pending work settles, database writes succeed and known source data appears through the API. A zero queue depth can mean successful processing or lost work; compare it with durable output and source coverage.

See [indexer troubleshooting](indexer.md) and [RabbitMQ production guidance](https://www.rabbitmq.com/docs/production-checklist).
