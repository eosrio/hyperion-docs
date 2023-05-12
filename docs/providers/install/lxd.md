# LXD

We host a [LXD](https://linuxcontainers.org/lxd/introduction/) image containing a pre-configured Hyperion instance.
Please follow the instructions below to get started.

## 1. Install LXD

!!! linux "Linux Terminal"
    ```shell
    sudo snap install lxd
    ```

## 2. Initialize LXD

!!! linux "Linux Terminal"
    ```shell
    sudo lxd init
    ```

## 3. Download the Hyperion image and network configuration file

!!! linux "Linux Terminal"
    ```shell
    wget https://images.eosrio.io/hyperion_3.3.9-5.tar.zst
    wget https://raw.githubusercontent.com/eosrio/hyperion-lxd/main/hyperion-devices.yaml
    ```

## 4. Import the Hyperion image

!!! linux "Linux Terminal"
    ```shell
    lxc image import hyperion_3.3.9-5.tar.zst --alias hyperion-starter
    ```

## 5. Create the Hyperion container

!!! linux "Linux Terminal"
    ```shell
    lxc launch hyperion-starter hyperion-1 < hyperion-devices.yaml
    ```

At this point the container should be running, and you can open a shell inside it with:

!!! linux "Linux Terminal"
    ```shell
    lxc exec hyperion-1 -- bash -c 'sudo su - ubuntu'
    ```
    Check PM2 logs to see if the indexer is running:
    ```shell
    pm2 logs
    ```
    Check your elastic password:
    ```shell
    cat ~/elastic.pass
    ```

## 6. Accessing the services

Our default device configuration includes proxies for Kibana, RabbitMQ Management and the Hyperion API.
They can be accessed at:

- Kibana: [http://localhost:5601](http://localhost:5601){:target="_blank"}
    - Username: elastic
    - Password: 
- RabbitMQ Management: [http://localhost:15672](http://localhost:15672){:target="_blank"}
    - Username: guest
    - Password: guest
- Hyperion API: [http://localhost:7000](http://localhost:7000){:target="_blank"}
