provider "proxmox" {
  endpoint = var.proxmox_endpoint
  insecure = false # SECURITY: Enable TLS certificate verification

  api_token = var.proxmox_api_token

  ssh {
    agent    = true
    username = "opentofu"
  }
}
