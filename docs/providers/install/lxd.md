# Configuring Hyperion with LXD

We host a [LXD](https://linuxcontainers.org/lxd/introduction/) image containing a pre-configured Hyperion instance.
Please follow the instructions below to get started.

For those unfamiliar with LXD, it is a native Linux containerization tool developed by Canonical, the company behind Ubuntu. Thus, it is very well-supported in recent Ubuntu distributions.

!!! windows "WSL2"
    For Windows installation using WSL2, refer to [this guide](wsl2.md) before proceeding to make sure **`systemd` is enabled.**

## 1. Install LXD

LXD is pre-installed on Ubuntu Server cloud images, but if it's not available, you can install it using Snap with the following command:

!!! linux "Linux Terminal"
    ```shell
    sudo snap install lxd
    ```

!!! tip "non-Snap installations"
    For other Linux distributions or non-Snap installations, please refer to the [documentation](https://linuxcontainers.org/lxd/getting-started-cli/#installing-a-package).

## 2. Initialize LXD

After installation, you must initialize LXD, which involves configuring the network interface, storage, and other things. For this process, run the command below. The prompt will ask some questions, it's fine to use the default values, just hit 'ENTER' to proceed.

When asked about the **default pool size**, you can use the default value or set it to a higher value if you have enough disk space. Later on, it's easy to expand to add more storage, but keep in mind **you can't shrink an existing pool**.

!!! linux "Linux Terminal"
    ```shell
    sudo lxd init
    ```

## 3. Download Hyperion image and configuration
Now that LXD is running, you need to download the Hyperion image from our repository and then launch the image. You also need to download the device configuration file, which will be used to configure the ports exposed by the container.

!!! linux "Linux Terminal"
    ```shell
    wget https://images.eosrio.io/hyperion_3.3.9-5.tar.zst
    wget https://raw.githubusercontent.com/eosrio/hyperion-lxd/main/hyperion-devices.yaml
    ```

!!! tip
    This process may take a few minutes, the size of the image is approximately 2.0GB



## 4. Import the Hyperion image

!!! info "LXC"
    The next command is LXC (Client), which is part of LXD (Daemon). This command is often used to manage resources, and you can learn more about it by typing:
    ```shell
    lxc --help
    ```


!!! linux "Linux Terminal"
    ```shell
    lxc image import hyperion_3.3.9-5.tar.zst --alias hyperion-starter
    ```

    When the image import is complete, you can check if it's present by running the command:

    ```shell
    lxc image ls
    ```

!!! tip
    Feel free to delete the downloaded file `hyperion_3.3.9-5.tar.zst` after importing the image.

## 5. Create the Hyperion container

Now let's create the container with the image. We provided the configuration file [`hyperion-devices.yaml`](https://raw.githubusercontent.com/eosrio/hyperion-lxd/main/hyperion-devices.yaml){:target="_blank"} to configure the ports exposed by the container. You can pass it to the launch command below to streamline the configuration. Feel free to modify the `listen` port values in the file if you need to. **Just keep the `connect` ports as they are.**

!!! linux "Linux Terminal"
    ```shell
    lxc launch hyperion-starter hyperion-1 < hyperion-devices.yaml
    ```

!!! tip
    If you want to change any device configuration after the container has been started you can use the `lxc config device ...` command

We can verify our created instance with the command **`lxc ls`**

You can also test if everything is working properly by accessing [http://localhost:7000/v2/health](http://localhost:7000/v2/health){:target="_blank"} to get a response from the Hyperion API.

## 6. Accessing the container

At this point the container should be running and you are ready to use Hyperion, you can open a shell inside it with:

!!! linux "Linux Terminal"
    ```shell
    lxc exec hyperion-1 -- bash -c 'sudo su - ubuntu'
    ```

    You can use the `pm2 ls` command in the terminal to see the status of the two Hyperion microservices (API and Indexer) and whether they are online or offline.

    Check PM2 logs to see if the indexer is running:
    ```shell
    pm2 logs
    ```
    Check your elastic password:
    ```shell
    cat ~/elastic.pass
    ```

!!! tip
    Using [Fish](https://fishshell.com/){:target="_blank"}, you can create an alias like the example below:
    ```shell
    alias hyperion-shell="lxc exec hyperion-1 -- bash -c 'sudo su - ubuntu'"
    funcsave hyperion-shell
    ```
    This way, you just need to type `hyperion-shell` and you're inside the container with everything you need configured.

??? abstract "What's inside the container?"
    inside the container you will find:

    - ElasticSearch
    - RabbitMq
    - Redis
    - Hyperion-API
    - Hyperion-Indexer
    - Nodeos(Leap)


## 7. Accessing the services

Our default device configuration includes proxies for Kibana, RabbitMQ Management and the Hyperion API.
They can be accessed at:

- Kibana: [http://localhost:5601](http://localhost:5601){:target="_blank"}
    - Username: elastic
    - Password: 
- RabbitMQ Management: [http://localhost:15672](http://localhost:15672){:target="_blank"}
    - Username: guest
    - Password: guest
- Hyperion API: [http://localhost:7000](http://localhost:7000){:target="_blank"}

## Next steps
Feel free to change configurations as you like. All configurations files are located in `~/hyperion` or `~/nodeos`

For more details, please refer to the [Hyperion Configuration Section](../setup/hyperion_configuration.md).
