# Infrastructure as Code

## [Opentofu](https://opentofu.org/docs/intro/install/snap/) (Terraform)

```sh
sudo snap install --classic opentofu
```

## [Ansible](
https://docs.ansible.com/projects/ansible/latest/installation_guide/intro_installation.html)


### Pipx (prerequisite)

```sh
sudo apt update
sudo apt install pipx
pipx ensurepath
sudo pipx ensurepath --global
```

### Ansible

```sh
pipx install --include-deps ansible
```