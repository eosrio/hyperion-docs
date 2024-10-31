# hyperion-docs

Hyperion History Documentation

Public URL: https://hyperion.docs.eosrio.io/

### Install dependencies

```shell
sudo apt install python3 python-is-python3 python3-pip libcairo2-dev libfreetype6-dev libffi-dev libjpeg-dev libpng-dev libz-dev pngquant python3.12-venv
python -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
```


### Windows 

```cmd
python -m venv .venv
.\.venv\Scripts\activate.bat
```
Trouble installing cairo on Windows:
https://squidfunk.github.io/mkdocs-material/plugins/requirements/image-processing/#cairo-graphics-windows


### Run development server

```bash
source .venv/bin/activate
mkdocs serve
# Alternatively
npm run start
```

### Build static site

```bash
source .venv/bin/activate
mkdocs build
# Alternatively
npm run build
```

### Deploy to gh-pages

```bash
source .venv/bin/activate
mkdocs gh-deploy
```
