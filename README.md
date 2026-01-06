# dev-setup

Personal development environment configuration including setup scripts, guides, and container definitions.

## Contents

- [setups/](setups/) - Environment setup guides for different platforms
- [containers/](containers/) - Container configurations and definitions
- [vms/](vms/) - Virtual machine configurations for self-hosted services

## Self-Hosted Services

### Gitea VM
- [Gitea](vms/gitea-vm/gitea/) - Self-hosted Git server with CI/CD runners

### Services VM
- [Baserow](vms/services-vm/baserow/) - No-code database platform
- [Draw.io](vms/services-vm/drawio/) - Diagramming application
- [Plane](vms/services-vm/plane/) - Project management platform

> **Note:** Replace all `{REPLACE_ME}` values in config files with your actual IP addresses or domains before deploying.

## Setup Guides

### macOS Setup

See [setups/mac.md](setups/mac.md) for a complete macOS development environment setup including:

- Homebrew package manager
- AeroSpace window manager
- Node.js via NVM
- Development tools (Git, GitHub CLI, usql)
- Package managers (PNPM, Bun)
- Python tooling (uv)
- Claude Code CLI

## Usage

Navigate to the relevant setup guide and follow the installation commands for your platform.

## License

MIT
