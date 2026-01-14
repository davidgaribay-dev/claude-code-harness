locals {
  ssh_key = var.ssh_public_key != "" ? var.ssh_public_key : (
    fileexists(pathexpand(var.ssh_public_key_file)) ? trimspace(file(pathexpand(var.ssh_public_key_file))) : ""
  )
  use_dhcp = var.ip_address == "dhcp"
}

resource "proxmox_virtual_environment_vm" "vm" {
  for_each = var.vms

  name        = each.key
  node_name   = var.proxmox_node
  description = "Cloned from template ${var.template_id} via OpenTofu"
  vm_id       = each.value.vm_id

  clone {
    vm_id        = var.template_id
    full         = true
    datastore_id = var.datastore_id
    retries      = 3
  }

  # VirtIO SCSI Single controller for best disk performance
  scsi_hardware = "virtio-scsi-single"

  cpu {
    cores   = coalesce(each.value.cpu_cores, var.cpu_cores)
    sockets = 1
    type    = "host"
  }

  memory {
    dedicated = coalesce(each.value.memory, var.memory)
  }

  # Disk configuration for performance
  # Note: When cloning, this resizes/reconfigures the cloned disk
  disk {
    datastore_id = var.datastore_id
    interface    = "scsi0"
    size         = coalesce(each.value.disk_size, var.disk_size)
    iothread     = true
    ssd          = var.ssd_emulation
    discard      = var.ssd_emulation ? "on" : "ignore"
    file_format  = "raw"
  }

  initialization {
    datastore_id = var.datastore_id

    dns {
      servers = var.dns_servers
    }

    ip_config {
      ipv4 {
        address = coalesce(each.value.ip_address, var.ip_address)
        gateway = local.use_dhcp ? null : var.gateway
      }
    }

    user_account {
      username = var.cloud_init_user
      keys     = local.ssh_key != "" ? [local.ssh_key] : []
    }
  }

  network_device {
    bridge  = var.network_bridge
    vlan_id = coalesce(each.value.vlan_id, var.vlan_id)
    model   = "virtio"
  }

  agent {
    enabled = true
  }

  started         = true
  stop_on_destroy = true

  lifecycle {
    # Prevents cloud-init from re-running on subsequent applies
    ignore_changes = [
      initialization,
    ]
  }
}