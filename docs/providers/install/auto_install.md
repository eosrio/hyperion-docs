# Automated Installation Script

This installation script is maintained [here](https://github.com/eosrio/hyperion-auto-setup){:target="_blank"}

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

```shell
./install.sh
```

!!! info
    The installation script may ask you for the sudo password.



??? note "What Gets Installed"
    The installation script automatically sets up the following components:

    **<h2>1. System Tools** (`setup-tools.sh`)</h2>

    - **jq**: JSON processor for configuration parsing
      - **curl**: HTTP client for downloading packages
      - **git**: Version control system
      - **unzip**: Archive extraction utility
      - **gnupg**: GPG tools for package verification
      - **lsb-release**: Linux distribution information
      - **net-tools**: Network utilities
      - **apt-transport-https**: HTTPS transport for APT
    
    **<h2>2. Node.js Environment** (`setup-nodejs.sh`)</h2>

    - **FNM (Fast Node Manager)**: Node.js version manager
      - **Node.js 24.x**: Latest LTS version (or 22.16+ if compatible)
      - **npm**: Node.js package manager
      - Configures shell environment for FNM
    
    **<h2> 3. Process Manager** (`setup-pm2.sh`)</h2>

    - **PM2**: Production process manager for Node.js applications
      - Configures PM2 startup service for automatic application restart
      - Sets up system-level PM2 daemon
    
    **<h2> 4. Database Systems</h2>**
    
    **<h3> Elasticsearch** (`setup-elasticsearch.sh`)</h3>

    - **Elasticsearch 9.x**: Search and analytics engine (accepts v8/v9)
      - Configures security settings and certificates
      - Generates elastic user password (saved to `elastic.pass`)
      - Enables and starts Elasticsearch service
    
    **<h3> MongoDB** (`setup-mongodb.sh`)</h3>

    - **MongoDB 8.x**: Document database for configuration and metadata
      - Adds official MongoDB APT repository
      - Enables and starts MongoDB service
      - Creates version tracking file
    
    **<h3> Redis** (`setup-redis.sh`)</h3>

    - **Redis 8.x**: In-memory data store for caching (accepts v7+)
      - Adds official Redis APT repository
      - Enables and starts Redis service
      - Creates version tracking file
    
    **<h2> 5. Message Queue** (`setup-rabbitmq.sh`)</h2>

    - **RabbitMQ**: Message broker for distributed processing
      - **Erlang**: Required runtime environment
      - Enables RabbitMQ management plugin
      - Creates dedicated vhost and user:
          - VHost: `hyperion`
          - User: `hyperion_user`
          - Password: `hyperion_password`
      - Configures proper permissions and administrator access
    
    **<h2> 6. Hyperion History API** (`setup-hyperion.sh`)</h2>

    - Clones the official Hyperion repository to `~/hyperion`
      - Installs Node.js dependencies via npm
      - Ready for configuration and deployment

---
## 4. Post-Installation Steps

After successful installation:

1. **Navigate to Hyperion directory**:
   ```shell
   cd ~/hyperion
   ```

2. **Configure Hyperion**: Follow the [official configuration documentation](https://hyperion.docs.eosrio.io/providers/setup/hyperion_configuration/) for detailed setup instructions

3. **Start Services**: Ensure all services are running:
   ```shell
   sudo systemctl status elasticsearch
   sudo systemctl status mongod
   sudo systemctl status redis-server
   sudo systemctl status rabbitmq-server
   ```

4. **Access Credentials**:
   
    - Elasticsearch password: stored in `~/hyperion-installer/elastic.pass`
    - RabbitMQ: `hyperion_user` / `hyperion_password`
   
???+ key "Elasticsearch password"
      The **elastic** account password will be saved on the `~/.hyperion-installer/elastic.pass` file, please save this on a safe location, as you might need it later on. If you need to reset this password you can do it with the following command:
      ```shell
      sudo /usr/share/elasticsearch/bin/elasticsearch-reset-password -u elastic -a -s -b
      ```

???+ note "RabbitMQ Management UI"
    **RabbitMQ** Management UI will be available on port 15672

    - user: `hyperion_user`
    - password: `hyperion_password`
    - vhost: `hyperion`
    * _changing your credentials is recommended, specially if opening access to the management interface is planned_


## 5. Troubleshooting

### Common Issues

- **Unsupported OS**: Only Ubuntu 22.04 and 24.04 are supported
- **Insufficient Permissions**: Ensure your user has sudo access
- **Network Issues**: Check internet connectivity for package downloads
- **Port Conflicts**: Default ports used:
    - Elasticsearch: 9200, 9300
    - MongoDB: 27017
    - Redis: 6379
    - RabbitMQ: 5672, 15672

### Logs and Diagnostics

- Service logs: `sudo journalctl -u <service-name>`
- Elasticsearch logs: `/var/log/elasticsearch/`
- MongoDB logs: `/var/log/mongodb/`
- RabbitMQ logs: `/var/log/rabbitmq/`


## 6. Proceed with the configuration

[Hyperion Configuration :fontawesome-solid-arrow-right-long:](../setup/hyperion_configuration.md){ .md-button }

<br>