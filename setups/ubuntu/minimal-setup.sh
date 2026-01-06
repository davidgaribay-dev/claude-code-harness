#!/bin/bash

export DEBIAN_FRONTEND=noninteractive

BASE_PACKAGES=(
    ca-certificates
    curl
    git
    vim
    wget
)

DOCKER_PACKAGES=(
    docker-ce
    docker-ce-cli
    containerd.io
    docker-buildx-plugin
    docker-compose-plugin
)


install_base_packages() {
    echo "Installing base packages"
    sudo apt-get update
    sudo apt-get install -y "${BASE_PACKAGES[@]}"
    echo "Base packages installed"

    sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https curl
    curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
    curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
    chmod o+r /usr/share/keyrings/caddy-stable-archive-keyring.gpg
    chmod o+r /etc/apt/sources.list.d/caddy-stable.list
    sudo apt update
    sudo apt install caddy
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

setup() {
    echo "Starting setup"
    install_base_packages
    install_docker
    source $HOME/.local/bin/env
    sudo reboot now
}

setup