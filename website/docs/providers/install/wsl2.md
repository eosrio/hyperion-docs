---
title: WSL2 installation
---

# WSL2 pre-configuration

Use WSL2 to run the Linux installation on a Windows development machine. Choose a Linux distribution that meets the native-module libc requirement; the distribution's version matters independently of the Windows host.

## Install WSL2

From an elevated PowerShell session:

```powershell
wsl --list --online
wsl --install -d Ubuntu-24.04
wsl --list --verbose
```

If the distribution name differs in the online list, substitute that name. Follow [Microsoft's WSL installation guide](https://learn.microsoft.com/en-us/windows/wsl/install), including any required restart. Confirm the distribution is using WSL version 2.

## Prepare Linux

Create a Linux user, update the distribution packages and install build prerequisites. Keep the application and database files inside the Linux filesystem, such as `~/hyperion`, rather than a Windows-mounted source or data directory. Install Node and the service supervisor inside the distribution.

## Configure services

Use the [manual installation](manual_install.md). If using systemd services, confirm systemd is enabled in this WSL distribution. Keep the Hyperion API binding, Windows port forwarding and any container networking explicit; `127.0.0.1` refers to the environment making the connection.

## Verify

Run the same connection, chain and [data-path checks](/operate/verify-indexing/) as Linux. Starting a WSL terminal or forwarding port 7000 does not establish that indexing, state synchronization or service startup after a Windows restart works.
