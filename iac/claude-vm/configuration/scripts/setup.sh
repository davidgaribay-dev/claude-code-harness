#!/bin/bash

export DEBIAN_FRONTEND=noninteractive

NVM_VERSION="v0.40.3"
GIT_EMAIL="me@davidgaribay.dev"
GIT_NAME="David Garibay"

DOCKER_PACKAGES=(
    docker-ce
    docker-ce-cli
    containerd.io
    docker-buildx-plugin
    docker-compose-plugin
)

install_npm_packages() {
    echo "Installing global npm packages"
    npm install -g pnpm@latest-10
    # npm install -g opencode-ai@latest
    echo "npm packages installed"
}

install_claude_cli() {
    echo "Installing Claude CLI"
    curl -fsSL https://claude.ai/install.sh | bash
    echo "Claude CLI installed"
}

install_uv() {
    echo "Installing UV"
    curl -LsSf https://astral.sh/uv/install.sh | sh
    echo "UV installed"
}

install_docker() {
    echo "Installing Docker"
    sudo install -m 0755 -d /etc/apt/keyrings
    sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
    sudo chmod a+r /etc/apt/keyrings/docker.asc
    echo \
    "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
    $(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}") stable" | \
    sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    sudo apt-get update
    sudo apt-get install -y "${DOCKER_PACKAGES[@]}"
    sudo groupadd docker 2>/dev/null || true
    sudo usermod -aG docker "$USER"
    echo "Docker installed"
}

install_tea() {
    echo "Installing tea"
    curl -L -o tea https://dl.gitea.com/tea/0.11.1/tea-0.11.1-linux-amd64
    ls -la
    chmod +x tea
    sudo mv tea /usr/local/bin/
    echo "Installed tea"
}

configure_git() {
    echo "Configuring Git"
    git config --global user.email "$GIT_EMAIL"
    git config --global user.name "$GIT_NAME"
    echo "Git configured"
}

setup() {
    echo "Starting setup"
    install_npm_packages
    install_claude_cli
    install_uv
    install_docker
    install_tea
    configure_git
    echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
    [ -f "$HOME/.local/bin/env" ] && source "$HOME/.local/bin/env"
    echo "Setup complete!"
}

setup