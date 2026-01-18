# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

## Repository Overview

Claude Code Harness is a monorepo containing:

- **infra/** - Infrastructure as Code for deploying Claude development environments
- **marketplace/** - Claude Code plugin marketplace (git submodule)
- **rewind/** - Conversation analytics web application

## Directory Structure

```
claude-code-harness/
├── infra/                      # Infrastructure as Code
│   ├── orchestration/          # Python CLI (harness)
│   ├── neo4j/                  # Neo4j VM provisioning
│   ├── plane/                  # Plane VM provisioning
│   └── claude-vms/             # Claude VM provisioning
├── marketplace/                # Git submodule → dg-marketplace
│   ├── .claude-plugin/         # Marketplace manifest
│   └── plugins/                # Individual plugins
│       ├── worktree/
│       └── git-workflow/
└── rewind/                     # Conversation analytics app
    ├── packages/
    │   ├── api/                # Hono API server
    │   ├── web/                # React Router frontend
    │   └── shared/             # Shared types
    └── docker-compose.yml
```

## Key Technologies

- **Infrastructure**: OpenTofu, Ansible, Proxmox VE
- **Rewind App**: React Router, TypeScript, Hono, Neo4j
- **Plugins**: Claude Code plugin format with skills/commands

## Common Tasks

### Infrastructure (infra/)

```bash
cd infra/orchestration
uv sync --dev

# Deploy all components
uv run harness all -c 2

# Deploy individual components
uv run harness neo4j
uv run harness plane
uv run harness vms -c 3

# Check status
uv run harness status

# Destroy
uv run harness all --destroy
```

### Rewind App (rewind/)

```bash
cd rewind
pnpm install

# Development
pnpm dev

# Production (Docker)
docker-compose up -d
```

### Marketplace Submodule

```bash
# Update submodule
git submodule update --remote marketplace

# Work on marketplace
cd marketplace
# make changes
git add . && git commit -m "feat: ..."
git push
cd ..
git add marketplace && git commit -m "chore: update marketplace submodule"
```

## Plugin Development

Plugins in `marketplace/plugins/` follow this structure:

```
plugin-name/
├── .claude-plugin/
│   └── plugin.json       # Plugin manifest (name, description, version)
├── commands/             # Slash commands (markdown files)
│   └── command-name.md
├── skills/               # Agent skills
│   └── skill-name/
│       └── SKILL.md
└── scripts/              # Supporting scripts
```

## Configuration Files

### Claude VM Settings

The file `infra/claude-vms/configuration/files/claude-settings.json` defines:
- Enabled plugins (marketplace + official LSP plugins)
- MCP permission allow/deny lists
- Sandbox configuration
- Hooks (PreToolUse, etc.)

### Ansible Variables

Edit `infra/claude-vms/configuration/group_vars/all.yml` for:
- Development packages to install
- Git configuration
- Tool versions
- Security hardening settings

## Environment Variables

| Variable | Purpose | Component |
|----------|---------|-----------|
| `TF_VAR_proxmox_api_token` | Proxmox API authentication | All infra |
| `NEO4J_ADMIN_PASSWORD` | Neo4j initial password | Neo4j |
| `NEO4J_PASSWORD` | Neo4j MCP connection | Claude VMs |
| `ANSIBLE_GH_TOKEN` | GitHub CLI auth | Claude VMs |

See `infra/README.md` for complete list.
