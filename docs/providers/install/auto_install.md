# Automated Installation Script

This installation script is maintained [here](https://github.com/eosrio/hyperion-auto-setup)

!!! info "Tip"
    Learning about the software components of the Hyperion architecture is recommended.
    This automatic setup will use defaults that are not suitable for all scenarios.

!!! tip "Already have some dependencies installed?"
    The usage of this script is recommended only for fresh installations. 
    If you already have some dependencies installed,
    please proceed with the [manual setup](manual_install.md)

!!! windows "WSL2"
    For Windows installation using WSL2, refer to [this guide](wsl2.md)

### 1. Create a directory for the installer files
```shell
mkdir -p ~/.hyperion-installer && cd ~/.hyperion-installer
```

### 2. Unpack the latest installer

```shell
wget -qO- https://github.com/eosrio/hyperion-auto-setup/raw/main/install.tar.gz | tar -xvz
```

### 3. Install by running

!!! info
    The installation script may ask you for the sudo password.

```shell
./install.sh
```

### 4. Verify installation

- **Elasticsearch** will be listening on port **9200/9300**
- **Redis** will be listening on port **6379**
- **RabbitMQ** will be listening on port **5672/15672/25672**

!!! key "Elasticsearch password"
    The **elastic** account password will be saved on the `~/.hyperion-installer/elastic.pass` file, please save this on a safe location, as you might need it later on. If you need to reset this password you can do it with the following command:
      ```shell
      sudo /usr/share/elasticsearch/bin/elasticsearch-reset-password -u elastic -a -s -b
      ```


- **RabbitMQ Management UI** will be available on `http://localhost:15672`
    - user: `hyperion_user`
    - password: `hyperion_password`
    - vhost: `hyperion`
    * _changing your credentials is recommended, specially if opening access to the management interface is planned_

To check if Hyperion was successfully built after the auto install script, verify if `launcher.js` was generated
```shell
cd ~/hyperion
stat launcher.js
```

### 5. Proceed with the configuration

[Hyperion Configuration :fontawesome-solid-arrow-right-long:](../setup/hyperion_configuration.md){ .md-button }
