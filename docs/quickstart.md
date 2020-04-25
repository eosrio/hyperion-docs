## Installation Script
!!! tip
    The usage of this installation script is highly recommended for fresh installs. If you already have
    dependencies installed, update them manually before running the script.

We provide an automated shell script that installs all dependencies and then configure Hyperion.

The first step is to clone the Hyperion repository:
```bash
git clone https://github.com/eosrio/hyperion-history-api.git
cd hyperion-history-api
```

Then, you just need to run the script:
````
./install_env.sh
````

The script will ask you for some information:
````
Enter rabbitmq user [hyperion]:
````

Enter the desired rabbitmq user and hit enter. If you leave it blank, the default user
`hyperion` will be set.

Then, do the same for the rabbitmq password:
```
Enter rabbitmq password [123456]:
```

And finally, it will ask if you want to create the npm global folder:
````
Do you want to create a directory for npm global installations [Y/n] :
````
This is recommended. If you choose `n`, npm packages will be installed as root.

Now, the script will do the work, this can take a while. Get a cup of coffee and relax. =)

!!! info
    The installation script may ask you for the admin password. This is needed to install the dependencies, please, provide it.
   
If everything runs smoothly, the script will automatically generate elasticsearch passwords and save on `elastic_pass.txt` file.

To login into Kibana, use the `elastic` user credentials.

<br>

 Now it's time to install [hyperion](hyperion.md)!
