---
title: Kibana operations
---

# Kibana

Kibana is an optional operator tool for inspecting Elasticsearch data. Its interface is independent of the Hyperion API and does not establish state or API coverage.

## Running Kibana with systemd

Install a Kibana version compatible with your Elasticsearch deployment. Configure its upstream endpoint, CA and service authentication, then inspect its logs after `sudo systemctl start kibana`. Keep the UI protected and restrict data access to operator roles.

## Opening Kibana

Open the configured operator URL, commonly a protected service on port 5601. If it cannot connect, check its Elasticsearch URL, TLS trust and credentials before changing the database configuration.

## Creating index pattern

Create a data view (called an index pattern in older interfaces) for the intended chain/index family. Inspect actual index names and aliases first. Select the timestamp field appropriate to that family, such as `@timestamp` for action history. Use the time picker and bounded filters when investigating an event.

Keep history, ABI metadata and current-state storage distinct. Finding an action document does not prove an ABI deployment or state projection is complete. Avoid using Discover edits or broad delete requests as an incident repair workflow.
