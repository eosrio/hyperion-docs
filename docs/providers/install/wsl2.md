# WSL2 + systemd

Guide on enabling systemd if you are using WSL2 on Windows.

!!! note
    Optimizing for performance is beyond the scope of this guide,
    this is intended for learning and development on Hyperion.
    systemd is now available in WSL2 and
    required for this guide. [Read more](https://devblogs.microsoft.com/commandline/systemd-support-is-now-available-in-wsl)

## 1. Make sure WSL2 is updated

!!! windows "Windows Terminal"
    ```
    wsl --update
    ```

## 2. Install and launch an Ubuntu 22.04 instance

[Ubuntu 22.04.1 LTS on Microsoft Store](https://www.microsoft.com/store/productId/9PN20MSR04DW)

## 3. Enable systemd

The infrastructure requires `systemd` to be enabled

!!! linux "Linux Terminal"
    As root edit the file **/etc/wsl.conf**
    ```shell
    sudo nano /etc/wsl.conf
    ```
    Add the following lines
    ```shell
    [boot]
    systemd=true
    ```

## 4. Restart the WSL2 engine

!!! windows "Windows Terminal"
    Shutdown all instances
    ```shell
    wsl --shutdown
    ```
    Start your instance
    ```shell
    wsl -d Ubuntu-22.04
    ```

## 5. Proceed with the installation

[Automatic Installation Script :fontawesome-solid-arrow-right-long:](auto_install.md){ .md-button }

[Manual Installation :fontawesome-solid-arrow-right-long:](manual_install.md){ .md-button }
