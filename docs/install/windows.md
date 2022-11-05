# Windows + WSL2 + systemd

!!! note
    Optimizing for performance is beyond the scope of this guide,
    this is intended for learning and development on Hyperion.
    systemd is now available in WSL2 and
    required for this guide. [Read more](https://devblogs.microsoft.com/commandline/systemd-support-is-now-available-in-wsl)

## 1. Make sure WSL2 is updated

```
wsl --update
```

## 2. Install and launch an Ubuntu 22.04 instance

[Ubuntu 22.04.1 LTS on Microsoft Store](https://www.microsoft.com/store/productId/9PN20MSR04DW)

## 3. Enable systemd

(sudo) Add the following to **/etc/wsl.conf**

```
[boot]
systemd=true
```

## 4. Restart the WSL2 engine

```
wsl --shutdown
wsl -d Ubuntu-22.04
```

## 5. Proceed with the [automated install](installation_script.md)
