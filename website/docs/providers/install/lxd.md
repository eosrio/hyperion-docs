---
title: LXD deployment
---

# Hyperion in LXD

Use a current Linux instance and install the 4.5 application inside it. The historical `3.3.9-5` appliance image is not a 4.5 installation or upgrade method.

## Installing LXD

Install and initialize LXD using [Canonical's first-steps guide](https://canonical.com/lxd/docs/latest/tutorial/first_steps/). Choose storage and networking for the host's capacity and isolation needs.

## Preparing the configuration

Create an Ubuntu 24.04 instance and enter its shell:

```bash
lxc launch ubuntu:24.04 hyperion-1
lxc exec hyperion-1 -- bash
```

Create a dedicated application user and follow the [manual installation](manual_install.md). Keep database paths on appropriately provisioned persistent storage; a CPU/RAM limit does not reserve disk capacity.

## Creating and configuring the instance

Configure instance limits, storage devices and a private network before loading chain data. Use LXD's documented device configuration for deliberate host mounts and port forwarding. Restrict access to forwarded management ports.

## Starting the instance

After the application and dependencies are configured, start the instance if stopped and inspect it:

```bash
lxc start hyperion-1
lxc list
```

Start Hyperion through its configured in-instance supervisor and verify the API's [health and data path](/operate/verify-indexing/).

## Accessing the container

Use `lxc exec hyperion-1 -- bash`, then switch to the application user. Inspect PM2 or systemd logs. Credentials belong in protected configuration, not a shared default password or image login.

## Accessing the services

Expose only the intended API address. Reach Kibana and broker management through protected operator access. Verify network binding from both the instance and the client machine.

## Stopping the instance

Gracefully stop the Hyperion indexer and API inside the instance before `lxc stop hyperion-1`. Verify settled work and database shutdown according to their own procedures.

## Deleting

Deleting an instance can remove its writable storage. Verify backups and attached-volume ownership before removal; retaining the instance until recovery is verified is safer than treating image recreation as a backup.

## Next steps

Use the normal [4.5 upgrade procedure](/providers/update/) inside the instance. LXD snapshots complement database-consistent backups; they do not establish application-level recovery by themselves.
