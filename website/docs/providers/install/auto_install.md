---
title: Automated installation
---

# Automated installation

Use automation to reproduce the same dependency, source, configuration and verification steps as the [manual installation](manual_install.md). Start from a fresh host or an explicitly planned migration; an installer should not overwrite an existing data-service configuration.

## Choose an installer revision

The [Hyperion auto-setup repository](https://github.com/eosrio/hyperion-auto-setup) is maintained separately from the core. Pin its revision and inspect which Hyperion, Node and data-service versions it installs. An installer repository's default branch is not a Hyperion 4.5 release artifact.

## Download and inspect

Clone the installer to a dedicated directory, check out the revision selected by your deployment, and review its service bindings, credentials, storage directories and upgrade behavior. Verify its archive/checksum or source revision before execution. Avoid unpacking a changing remote archive directly into a privileged shell.

## Install by running

Follow the selected installer's README and run its entry point from the checked-out directory. Give it only the privilege required to install the selected services. Retain its revision, generated configuration paths and result logs.

## Verify installation

1. Verify Node/native addon loading and dependency-service authentication.
2. Run `./hyp-config connections test` from the installed Hyperion root.
3. Validate the chain's RPC/SHiP endpoints and configuration.
4. Start the indexer/API with the selected supervisor.
5. Complete [indexing and serving verification](/operate/verify-indexing/).

If the installer pins incompatible software, use the manual installation instead of forcing it over an existing deployment. Windows users should prepare [WSL2](wsl2.md) first.
