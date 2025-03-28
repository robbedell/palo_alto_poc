provider "panos" {
  hostname = "192.168.1.1" # Default management IP
  api_key  = "YOUR_API_KEY" # Replace with your valid API key
}

resource "panos_device" "firewall" {
  hostname = "PANFW01" # Default hostname
}

resource "panos_interface" "ethernet" {
  for_each = toset(["ethernet1/1", "ethernet1/2", "ethernet1/3", "ethernet1/4"])

  name = each.key
  mode = "layer3"

  dynamic "ip" {
    for_each = lookup({
      "ethernet1/1" = { ip = null, subnet = null },
      "ethernet1/2" = { ip = null, subnet = null },
      "ethernet1/3" = { ip = null, subnet = null },
      "ethernet1/4" = { ip = null, subnet = null }
    }, each.key, {})

    content {
      address = "${each.value.ip}/${each.value.subnet}"
    }
  }

  dhcp_client {
    enable = each.value.ip == null
    create_default_route = false
  }
}

resource "panos_virtual_router" "routers" {
  for_each = toset(["trust", "untrust", "vpn", "webtier"])

  name = each.key
}

resource "panos_security_rule" "poc_any_any" {
  name          = "POC_Any_Any_premigrate"
  from_zones    = ["any"]
  to_zones      = ["any"]
  source_addresses = ["any"]
  destination_addresses = ["any"]
  applications  = ["any"]
  services      = ["any"]
  action        = "allow"
  tags          = ["POC-DELETE"]
}

// Additional configuration options
resource "panos_address_object" "custom_addresses" {
  for_each = {
    "web_server" = { ip = "192.168.30.10", description = "Web Server Address" },
    "db_server"  = { ip = "192.168.40.10", description = "Database Server Address" }
  }

  name        = each.key
  value       = each.value.ip
  description = each.value.description
}

resource "panos_service_object" "custom_services" {
  for_each = {
    "http"  = { protocol = "tcp", port = "80", description = "HTTP Service" },
    "https" = { protocol = "tcp", port = "443", description = "HTTPS Service" }
  }

  name        = each.key
  protocol    = each.value.protocol
  destination_port = each.value.port
  description = each.value.description
}