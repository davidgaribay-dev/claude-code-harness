# Draw.io

Self-hosted diagramming application behind Caddy reverse proxy.

> **Note:** Replace all `{REPLACE_ME}` values with your actual IP address or domain (e.g., `https://192.168.1.100`).

## Setup

### 1. Create .env

```bash
cp example.env .env
```

### 2. Configure

Edit `.env` and set:
- `SITE_URL` (your domain or IP)
- `DRAWIO_PORT` (default: 8080)

### 3. Configure Caddy

```bash
sudo cp Caddyfile /etc/caddy/Caddyfile
sudo systemctl reload caddy
```

### 4. Start services

```bash
docker compose up -d
```

### 5. Access

Visit {REPLACE_ME} to use Draw.io.

## Usage

Draw.io runs in offline/self-contained mode by default. All diagrams are saved locally in your browser or can be exported.

## Logs

```bash
docker compose logs -f drawio
```

## Update

```bash
docker compose pull
docker compose up -d
```

## Docs

- [Draw.io Docker](https://github.com/jgraph/docker-drawio)
