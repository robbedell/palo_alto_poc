provider "panos" {
  hostname = "192.168.1.1" # Replace with your firewall's management IP
  api_key  = "YOUR_API_KEY" # Replace with your valid API key
}

resource "panos_interface" "ethernet" {
  for_each = toset(["ethernet1/1", "ethernet1/2", "ethernet1/3", "ethernet1/4"])

  name = each.key
  mode = "layer3"

  dynamic "ip" {
    for_each = lookup({
      "ethernet1/1" = { ip = "192.168.10.1", subnet = "24" },
      "ethernet1/2" = { ip = "192.168.20.1", subnet = "24" }
    }, each.key, {})

    content {
      address = "${ip.value.ip}/${ip.value.subnet}"
    }
  }

  dhcp_client {
    enable = ip.value == null
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