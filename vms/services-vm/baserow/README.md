# Baserow

Self-hosted no-code database platform behind Caddy reverse proxy.

> **Note:** Replace all `{REPLACE_ME}` values with your actual IP address or domain (e.g., `https://192.168.1.100:8443`).

## Setup

### 1. Create .env

```bash
cp example.env .env
```

### 2. Generate secrets

```bash
# Generate and set the three required secrets
openssl rand -hex 32  # SECRET_KEY
openssl rand -hex 32  # DATABASE_PASSWORD
openssl rand -hex 32  # REDIS_PASSWORD
```

Edit `.env` and set:
- `SECRET_KEY`
- `DATABASE_PASSWORD`
- `REDIS_PASSWORD`
- `BASEROW_PUBLIC_URL` (your access URL)

### 3. Configure system Caddy

Add to `/etc/caddy/Caddyfile`:

```caddy
{REPLACE_ME} {
    reverse_proxy localhost:8585 {
        header_up Upgrade {http.request.header.Upgrade}
        header_up Connection {http.request.header.Connection}
    }

    request_body {
        max_size 100MB
    }

    encode gzip zstd

    log {
        output file /var/log/caddy/baserow.log
        format json
    }

    header {
        Strict-Transport-Security "max-age=31536000; includeSubDomains"
        X-Frame-Options "SAMEORIGIN"
        X-Content-Type-Options "nosniff"
    }
}
```

Reload Caddy:

```bash
sudo systemctl reload caddy
```

### 4. Start services

```bash
docker compose up -d
```

First startup may take a few minutes as migrations run.

### 5. Access

Visit {REPLACE_ME} to create your admin account.

## Services

- **backend** - Django API server
- **web-frontend** - Nuxt.js frontend
- **celery** - Background task worker
- **celery-export-worker** - Export job worker
- **celery-beat-worker** - Scheduled task runner
- **db** - PostgreSQL with pgvector
- **redis** - Cache and message broker
- **caddy** - Internal reverse proxy

## Logs

```bash
docker compose logs -f
docker compose logs -f backend
```

## Update

```bash
docker compose pull
docker compose up -d
```

## Backup

```bash
# Database
docker compose exec db pg_dump -U baserow baserow > backup.sql

# Media files
docker compose cp caddy:/baserow/media ./media-backup
```

## Docs

- [Baserow Documentation](https://baserow.io/docs)
- [Configuration Options](https://baserow.io/docs/installation/configuration)
- [Docker Compose Install](https://baserow.io/docs/installation/install-with-docker-compose)
