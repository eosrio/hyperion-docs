# What is QRY
QRY is a decentralized ecosystem designed to provide seamless access to various data services and APIs. The initial release of QRY prioritizes the Antelope Web3 ecosystem, granting users dependable access to these services while offering rewards to incentivize service providers.

For Antelope Service Providers, QRY introduces new revenue streams for essential services like Hyperion, Chain API, and Atomic Assets, which have previously lacked defined rewards.

With QRY actively under development, the ecosystem is currently in its foundational phase. The QRY team invites interested providers to register and contribute to the ongoing development of the QRY HUB.

### QRY HUB Hyperion Dashboard
This guide provides a step-by-step walkthrough for Provider Registration and establishing a connection to the QRY HUB.

#### Register and Connect Your Provider
This guide outlines the steps required to register as a provider and participate in the QRY ecosystem:

1. **Complete Your Provider Profile**
2. **Add Your Service Instances**
3. **Configure Hyperion (version 3.5.0)**
4. **Restart the Hyperion API**
5. **Access the QRY HUB**
6. **Connect to the QRY HUB Bot**

---

### Detailed Steps

#### **Complete Your Provider Profile**
   - Navigate to the [QRY Provider Registration Page](https://provider.qry.network/).
   - Choose the blockchain network to register, such as the Jungle in this example.
   - Log in with your producer account using either Anchor wallet for simplicity or `cleos` for a more secure, air-gapped method. 
   - Follow the steps below to log in with `cleos`:
      - Select `cleos`, enter your Account Name and Permission, and generate the Cleos Command.
      - Copy the generated command and paste it into your `cleos` CLI to produce your signature. Submit this signature on the registration page.
   - Complete the Provider Registration Page and select the **Register** button.

#### **Add Your Service Instances**
   - After registering, go to the **Manage Instances** page and select **Add Instance**.
   - Complete the **Register Instance Page** by adding a Keypair, selecting "Hyperion" as the Service Type, and entering your Public API.
   - Save the keys generated here for QRY HUB authentication.

#### **Configure Hyperion**
   - Ensure that Hyperion is upgraded to version 3.5.0 to connect with the QRY HUB. [Hyperion 3.5.0 Repository](https://github.com/eosrio/hyperion-history-api/tree/3.5.0).
   - Edit the `chains/wax.config.json` file to include the instance key under the `"hub"` section.

      ```json
      "hub": {
        "instance_key": "PVT_K1_2VGf8RznDRPkNNofhRwvHYs2puU5YQkVcB7bnWFhmFKE6gPdm1"
      },
      ```

#### **Restart the Hyperion API**
   - Restart the Hyperion API to connect to the QRY HUB:

      ```shell
      cd ~/hyperion-history-api
      pm2 start --only wax-api --update-env
      ```

   - PM2 logs will confirm the API’s connection to the QRY HUB.

#### **Access the QRY HUB**
   - Go to the [QRY HUB Page](https://hub.qry.network/) to view the status of your service and ensure your API is operational.

#### **Connect to the QRY HUB Bot**
   - The QRY HUB Bot provides updates on your service status. If a Telegram account was configured, start receiving alerts by launching the [QRY HUB Bot](https://t.me/qry_hub_bot).

---

You are now successfully registered and active within the QRY Ecosystem. Join the QRY Network [Telegram Group](https://t.me/qry_network) for further updates and support.
