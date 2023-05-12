# hyperion-docs

Hyperion History Documentation

Public URL: https://hyperion.docs.eosrio.io/

### Install dependencies

```shell
sudo apt install python3 python-is-python3 python3-pip libcairo2-dev libfreetype6-dev libffi-dev libjpeg-dev libpng-dev libz-dev pngquant
pip install -r requirements.txt
```

### Run development server

```bash
mkdocs serve
# Alternatively
npm run start
```

### Build static site

```bash
mkdocs build
# Alternatively
npm run build
```

### Deploy to gh-pages

```bash
mkdocs gh-deploy
```
