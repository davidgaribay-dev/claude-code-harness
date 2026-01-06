# Plane

Self-hosted project management platform behind Caddy reverse proxy.

> **Note:** Replace all `{REPLACE_ME}` values with your actual IP address or domain (e.g., `https://192.168.1.100:3000`).

## Architecture

```
Browser → {REPLACE_ME} (External Caddy SSL)
                    ↓
         localhost:3001 (Plane internal proxy HTTP)
                    ↓
         web/api/space/admin/live containers
```

## Setup

### 1. Configure

Edit `.env` and set:
- `APP_DOMAIN` - your IP or domain
- `WEB_URL` - full URL ({REPLACE_ME})
- `CORS_ALLOWED_ORIGINS` - must match WEB_URL
- `SECRET_KEY` - generate with `openssl rand -hex 32`
- `LIVE_SERVER_SECRET_KEY` - generate with `openssl rand -hex 16`
- `POSTGRES_PASSWORD` - generate with `openssl rand -base64 24`
- `RABBITMQ_PASSWORD` - generate with `openssl rand -base64 24`

### 2. Configure Caddy

Add to `/etc/caddy/Caddyfile`:

```caddyfile
{REPLACE_ME} {
    reverse_proxy localhost:3001 {
        header_up X-Forwarded-Proto {scheme}
        header_up X-Forwarded-Host {host}
        header_up X-Real-IP {remote_host}
        header_up X-Forwarded-For {remote_host}
        header_up Host {http.request.host}
        header_up Upgrade {http.request.header.Upgrade}
        header_up Connection {http.request.header.Connection}
    }

    request_body {
        max_size 10MB
    }

    encode gzip zstd

    log {
        output file /var/log/caddy/plane.log
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

### 3. Start services

```bash
docker compose up -d
```

### 4. Complete setup

Visit {REPLACE_ME} and create your admin account.

## Services

| Service | Description |
|---------|-------------|
| web | Frontend application |
| space | Public pages |
| admin | Admin panel |
| api | Backend API |
| worker | Background jobs |
| beat-worker | Scheduled tasks |
| live | Real-time updates (WebSocket) |
| plane-db | PostgreSQL database |
| plane-redis | Valkey (Redis) cache |
| plane-mq | RabbitMQ message queue |
| plane-minio | MinIO object storage |
| proxy | Internal reverse proxy (HTTP only) |

## Logs

```bash
docker compose logs -f api
docker compose logs -f worker
docker compose logs -f proxy
```

## Update

```bash
docker compose pull
docker compose up -d
```

## Backup

Important volumes to backup:
- `pgdata` - PostgreSQL database
- `uploads` - File uploads (MinIO)
- `redisdata` - Redis cache
- `rabbitmq_data` - Message queue data

## Troubleshooting

### WebSocket issues
Ensure Caddy config includes `Upgrade` and `Connection` headers.

### Redirect loops
Set `SITE_ADDRESS=:80` in `.env` (external Caddy handles HTTPS).

### SSL errors
External Caddy handles SSL. Plane's internal proxy runs HTTP only on port 3001.

## Docs

- [Plane Self-Hosting](https://developers.plane.so/self-hosting/methods/docker-compose)
- [Plane Reverse Proxy Config](https://developers.plane.so/self-hosting/govern/reverse-proxy)
- [Plane GitHub](https://github.com/makeplane/plane)
