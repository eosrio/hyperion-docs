# Automated Installation Script

This installation script is maintained [here](https://github.com/eosrio/hyperion-auto-setup)

!!! attention
    Learning about the software components of the Hyperion architecture is recommended.
    This automatic setup will use defaults that are not suitable for all scenarios.

!!! tip
    The usage of this script is recommended only for fresh installations. 
    If you already have some dependencies installed,
    please proceed with the [manual setup](manual_installation.md)

!!! note
    For Windows installation using WSL2, refer to [this guide](windows.md)

### 1. Create a directory for the installer files
```shell
mkdir -p ~/.hyperion-installer && cd ~/.hyperion-installer
```

### 2. Unpack the latest installer

```shell
wget -qO- https://github.com/eosrio/hyperion-auto-setup/raw/main/install.tar.gz | tar -xvz
```

### 3. Install by running
```./install.sh```

!!! info
    The installation script may ask you for the sudo password.

- The **elastic** account password will be saved on the `elastic.pass` file
- **RabbitMQ** will be available on `http://localhost:15672`
    - user: `hyperion_user`
    - password: `hyperion_password`
    - vhost: `hyperion`
    * _changing your credentials is recommended, specially if opening access to the management interface is planned_
