# Gitea + PostgreSQL 18 + Runners

Self-hosted Git service with CI/CD, behind Caddy reverse proxy.

## Setup

### 1. Generate secrets

```bash
docker run --rm gitea/gitea:1.25 gitea generate secret SECRET_KEY
docker run --rm gitea/gitea:1.25 gitea generate secret INTERNAL_TOKEN
docker run --rm gitea/gitea:1.25 gitea generate secret LFS_JWT_SECRET
docker run --rm gitea/gitea:1.25 gitea generate secret JWT_SECRET
```

Add each to `.env`:
- `GITEA_SECRET_KEY`
- `GITEA_INTERNAL_TOKEN`
- `GITEA_LFS_JWT_SECRET`
- `GITEA_OAUTH2_JWT_SECRET`

### 2. Set passwords

Edit `.env` and set matching passwords:
- `POSTGRES_PASSWORD`
- `GITEA_DB_PASSWD`

### 3. Configure Caddy

```bash
sudo cp Caddyfile /etc/caddy/Caddyfile
sudo systemctl reload caddy
```

### 4. Start services

```bash
docker compose up -d db gitea
```

### 5. Complete setup

Visit IP ADDRESS of the value you set for {REPLACE_ME} and finish the wizard.

### 6. Get runner token

1. Site Administration → Actions → Runners
2. Copy the registration token
3. Add to `.env` as `GITEA_RUNNER_REGISTRATION_TOKEN`

### 7. Start runners

```bash
docker compose up -d
```

## Usage

```bash
# SSH
git clone ssh://git@{REPLACE_ME}:2222/user/repo.git

# HTTPS
git clone {REPLACE_ME}/user/repo.git
```

## Logs

```bash
docker compose logs -f gitea
docker compose logs -f db
docker compose logs -f runner-1
```

## Update

```bash
docker compose pull
docker compose up -d
```

## Docs

- [Gitea Docker](https://docs.gitea.com/installation/install-with-docker)
- [Act Runner](https://docs.gitea.com/usage/actions/act-runner)
- [PostgreSQL 18 Docker](https://github.com/docker-library/docs/blob/master/postgres/README.md)
