---
title: QRY integration
---

# QRY integration

QRY is an external service-discovery and provider integration. Hyperion's chain configuration includes a `hub` section for the provider's instance credentials. Keep service registration separate from installation and data-path verification.

## Register and connect your provider

Follow the QRY service's current provider onboarding instructions. Confirm the destination and account before signing registration requests. Configure the public API URL, chain identity and service capabilities that the instance actually serves.

## Configure Hyperion

Store the instance key in the chain file, `config/chains/<chain>.config.json`, under `hub.instance_key`. The template also includes `hub.enabled` and `hub.custom_indexer_controller`. Use the selected deployment's integration requirements for those values.

```json
{
  "hub": {
    "enabled": true,
    "instance_key": "<provider-instance-key>",
    "custom_indexer_controller": ""
  }
}
```

This is a configuration fragment with a placeholder, not a usable key. Keep private instance credentials out of public repositories, screenshots and incident transcripts. Do not reuse credentials embedded in older examples.

## Restart the Hyperion API

Restart the affected API through its configured supervisor. Confirm the public URL still serves the intended chain and check the integration logs. Registration success and API/data readiness are independent checks.

## Access the QRY HUB

Use the provider service's current dashboard and support channels to confirm instance registration and expected metadata. Dashboard availability, rewards, eligibility and account flows are controlled by QRY; core configuration does not establish them.

## Verify

Verify health, a known historical query and required state endpoints before advertising capabilities. Retain the core/component pins and the observation time with the provider record.

## Source

[4.5 hub configuration fields](https://github.com/eosrio/hyperion-history-api/blob/e1818923065d648a38009572d76badeab0684af1/references/config.ref.json) and [configuration types](https://github.com/eosrio/hyperion-history-api/blob/e1818923065d648a38009572d76badeab0684af1/src/interfaces/hyperionConfig.ts). External onboarding must follow the service's own current instructions.
