# Claude VM Infrastructure as Code

Automated provisioning and configuration of Claude development VMs on Proxmox VE.

## Prerequisites

### [OpenTofu](https://opentofu.org/docs/intro/install/snap/) (Terraform)

```sh
sudo snap install --classic opentofu
```

### [Ansible](https://docs.ansible.com/projects/ansible/latest/installation_guide/intro_installation.html)

#### [Pipx](https://github.com/pypa/pipx) (Prerequisite)

```sh
sudo apt update
sudo apt install pipx
pipx ensurepath
sudo pipx ensurepath --global
```

#### Ansible

```sh
pipx install --include-deps ansible
```

## Security

### API Token Configuration

**Never commit API tokens to version control.** Set the Proxmox API token via environment variable:

```sh
export TF_VAR_proxmox_api_token="user@realm!token-name=token-secret"
```

### TLS Certificate Verification

TLS verification is enabled by default. If using self-signed certificates, either:
1. Add your Proxmox CA to the system trust store, or
2. Set `insecure = true` in `provider.tf` (not recommended for production)

### SSH Host Key Verification

SSH is configured with `StrictHostKeyChecking=accept-new` which:
- Accepts host keys on first connection
- Detects and warns about changed host keys (potential MITM)

### Verified External Sources

All external resources are verified:

| Component | Source | Verification |
|-----------|--------|--------------|
| Docker | download.docker.com | GPG fingerprint: `9DC8 5822 9FC7 DD38 854A E2D8 8D81 803C 0EBF CD88` |
| GitHub CLI | cli.github.com | GPG fingerprint: `2C61 0620 1985 B60E 6C7A C873 23F3 D4EA 7571 6059` |
| tea CLI | dl.gitea.com | SHA256 checksum verification |
| NVM | github.com/nvm-sh/nvm | Official repository (GPG signed tags) |
| UV | astral.sh | Official source (GitHub attestations available) |
| Claude CLI | claude.ai | Official Anthropic source (signed binaries) |

### Pinned Versions

All dependencies are pinned to exact versions to prevent supply chain attacks:

- **Terraform Provider**: `bpg/proxmox = 0.93.0`
- **Ansible Collections**:
  - `devsec.hardening = 9.6.0`
  - `community.general = 10.2.0`
  - `ansible.posix = 2.0.0`

### Security Hardening Applied

The playbook applies security hardening via `devsec.hardening`:
- OS hardening (file permissions, kernel parameters)
- SSH hardening (key-only auth, modern ciphers)
- UFW firewall (deny incoming, allow SSH)
- fail2ban (SSH brute-force protection)
- Automatic security updates

## Usage

```sh
# Deploy a new VM
./deploy.sh --name claude-dev --provision --configure --harden

# Configure existing VM
./deploy.sh --name claude-dev --configure

# Deploy with GitHub CLI pre-authenticated
export ANSIBLE_GH_TOKEN="ghp_xxxxxxxxxxxx"
./deploy.sh --name claude-dev --configure -- -e "gh_token=$ANSIBLE_GH_TOKEN"

# Deploy with Gitea tea CLI
./deploy.sh --name claude-dev --configure -- -e "install_gitea_tea=true"
```

### GitHub CLI Authentication

The VM can start with GitHub CLI pre-authenticated. Pass your token during configuration:

```sh
# Using environment variable (recommended)
export ANSIBLE_GH_TOKEN="ghp_xxxxxxxxxxxx"
ansible-playbook playbook.yml -e "gh_token=$ANSIBLE_GH_TOKEN"

# Or directly (not recommended - visible in process list)
ansible-playbook playbook.yml -e "gh_token=ghp_xxxxxxxxxxxx"
```

**Token Requirements** (Fine-grained PAT recommended):
- `repo` - Full repository access
- `read:org` - Read organization membership

The VM will also have `GH_TOKEN` environment variable support - you can set it in `.bashrc` or pass it at runtime.

## Files

```
claude-vm/
├── deploy.sh              # Main deployment script
├── provision/             # OpenTofu/Terraform configs
│   ├── main.tf
│   ├── variables.tf
│   ├── versions.tf        # Provider version pinning
│   ├── provider.tf        # Proxmox provider config
│   └── terraform.tfvars   # Variables (no secrets!)
└── configuration/         # Ansible configs
    ├── ansible.cfg
    ├── playbook.yml       # Main playbook
    ├── requirements.yml   # Collection dependencies
    └── group_vars/
        └── all.yml        # Variables
```
