# Windows
## Installation instructions for Multipass on Windows 10 with Hyper-V

###  1. Create VM:
````bash 
multipass launch -m 16G -c 4 -d 16G -n hyperion
*adjust -m/-d/-c according to your needs
````

### 2. Stop the VM:
````bash 
multipass stop hyperion
```` 

### 3. Enable Dynamic Memory
   - Open the Hyper-V Manager
   - right click the "hyperion" VM 
   - go on "Settings..." -> "Memory" -> Uncheck "Enable Dynamic Memory"

### 4. Start the VM: 
`````bash
multipass start hyperion
`````

### 5. Proceed with the automated install:
````bash 
  git clone https://github.com/eosrio/hyperion-history-api.git
  cd hyperion-history-api
  ./install_env.sh
````

### 6. Check if elasticsearch memlock was successful:
````bash
systemctl status elasticsearch.service
````

!!!note 
    "Dynamic Memory" can be enabled after installation if desired, just stop the vm, update the settings and restart.