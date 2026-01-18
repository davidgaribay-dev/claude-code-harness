# Claude Code Harness

A monorepo containing infrastructure, plugins, and tools for Claude Code development environments.

## Repository Structure

```
claude-code-harness/
├── infra/              # Infrastructure as Code (Ansible, OpenTofu)
├── marketplace/        # Claude Code plugin marketplace (git submodule)
└── rewind/             # Conversation analytics web app
```

## Components

### [infra/](infra/)

Infrastructure orchestration for deploying Claude development environments on Proxmox VE:

- **Neo4j database server** - Graph database with MCP integration
- **Plane project management** - Self-hosted project management with MCP integration
- **Claude development VMs** - Ephemeral sandboxed environments with Claude Code CLI

Features:
- OpenTofu/Terraform for VM provisioning
- Ansible for configuration management
- Security hardening (devsec.hardening)
- Pre-configured MCP servers (Context7, Playwright, Neo4j, Plane)
- Claude Code plugins auto-installed from marketplace

See [infra/README.md](infra/README.md) for detailed documentation.

### [marketplace/](marketplace/)

Git submodule containing Claude Code plugins ([dg-marketplace](https://github.com/davidgaribay-dev/dg-marketplace)):

- **worktree** - Create Git worktrees for parallel development
- **git-workflow** - Interactive git commit and push with approval gates

Plugins are automatically installed on Claude VMs via settings configuration.

### [rewind/](rewind/)

Web application for analyzing Claude Code conversation history:

- View and search conversation history
- Analyze token usage and costs
- Track project activity
- Neo4j-backed storage

Built with React Router, TypeScript, and Hono.

## Quick Start

### Deploy Infrastructure

```bash
cd infra/orchestration
uv sync --dev

# Set required environment variables
export TF_VAR_proxmox_api_token="user@realm!token-name=token-secret"
export NEO4J_ADMIN_PASSWORD="your-secure-password"

# Deploy everything
uv run harness all -c 2
```

### Clone with Submodules

```bash
git clone --recurse-submodules https://github.com/davidgaribay-dev/claude-code-harness.git

# Or if already cloned
git submodule update --init --recursive
```

## Pre-configured Claude Code Settings

The infrastructure deploys Claude VMs with:

**Plugins:**
- `worktree@dg-marketplace`
- `git-workflow@dg-marketplace`
- `gopls-lsp@claude-plugins-official`
- `pyright-lsp@claude-plugins-official`
- `typescript-lsp@claude-plugins-official`

**MCP Servers:**
- Context7 - Library documentation lookup
- Playwright - Browser automation
- Neo4j Cypher - Graph database queries
- Plane - Project management (optional)

**Security:**
- Sandbox mode enabled
- Permission restrictions on sensitive directories
- Pre-configured hooks

## License

MIT
