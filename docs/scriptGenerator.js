function mergeByName(defaultArray, customArray) {
    const merged = {};
    for (const item of defaultArray) merged[item.name] = { ...item };
    for (const item of customArray) merged[item.name] = { ...merged[item.name], ...item };
    return Object.values(merged);
}

function mergeStrings(defaultArray, customArray) {
    const set = new Set([...defaultArray, ...customArray]);
    return Array.from(set);
}

function generateScriptsFromConfig(config) {
    const defaultConfig = {
        firewall: {
            management_ip: "192.168.1.1",
            api_key: "YOUR_API_KEY",
            hostname: "PANFW01"
        },
        interfaces: [
            { name: "ethernet1/1", ip: null, subnet: null, dhcp: true },
            { name: "ethernet1/2", ip: null, subnet: null, dhcp: true },
            { name: "ethernet1/3", ip: null, subnet: null, dhcp: true },
            { name: "ethernet1/4", ip: null, subnet: null, dhcp: true }
        ],
        address_objects: [
            { name: "web_server", ip: "192.168.30.10", description: "Web Server Address" },
            { name: "db_server", ip: "192.168.40.10", description: "Database Server Address" }
        ],
        service_objects: [
            { name: "http", protocol: "tcp", port: "80", description: "HTTP Service" },
            { name: "https", protocol: "tcp", port: "443", description: "HTTPS Service" }
        ],
        virtual_routers: ["trust", "untrust", "vpn", "webtier"],
        security_rules: [
            {
                name: "POC_Any_Any_premigrate",
                from_zone: ["any"],
                to_zone: ["any"],
                source: ["any"],
                destination: ["any"],
                application: ["any"],
                service: ["any"],
                action: "allow",
                tag: ["POC-DELETE"]
            }
        ]
    };

    // Overwrite with custom values
    config = {
        firewall: { ...defaultConfig.firewall, ...(config.firewall || {}) },
        interfaces: mergeByName(defaultConfig.interfaces, config.interfaces || []),
        address_objects: mergeByName(defaultConfig.address_objects, config.address_objects || []),
        service_objects: mergeByName(defaultConfig.service_objects, config.service_objects || []),
        virtual_routers: mergeStrings(defaultConfig.virtual_routers, config.virtual_routers || []),
        security_rules: mergeByName(defaultConfig.security_rules, config.security_rules || [])
    };

    const firewallIp = config.firewall.management_ip;
    const apiKey = config.firewall.api_key;
    const firewallHostname = config.firewall.hostname;

    const interfaces = config.interfaces;
    const addressObjects = config.address_objects;
    const serviceObjects = config.service_objects;
    const virtualRouters = config.virtual_routers;
    const securityRules = config.security_rules;

    const scripts = {
        pythonScript: `
import requests
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

firewall_ip = '${firewallIp}'
api_key = '${apiKey}'
firewall_hostname = '${firewallHostname}'

custom_ips = ${JSON.stringify(interfaces, null, 4)}
custom_addresses = ${JSON.stringify(addressObjects, null, 4)}
custom_services = ${JSON.stringify(serviceObjects, null, 4)}
custom_routers = ${JSON.stringify(virtualRouters, null, 4)}
custom_security_rules = ${JSON.stringify(securityRules, null, 4)}

# Add your Python logic here
`,
        terraformScript: `
provider "panos" {
  hostname = "${firewallIp}"
  api_key  = "${apiKey}"
}

resource "panos_interface" "ethernet" {
  for_each = toset(${JSON.stringify(interfaces.map(i => i.name))})

  name = each.key
  mode = "layer3"

  dynamic "ip" {
    for_each = lookup(${JSON.stringify(interfaces.reduce((acc, i) => {
                        acc[i.name] = { ip: i.ip, subnet: i.subnet };
                        return acc;
                    }, {}))}, each.key, {})

    content {
      address = "\${each.value.ip}/\${each.value.subnet}"
    }
  }

  dhcp_client {
    enable = each.value.ip == null
    create_default_route = false
  }
}

resource "panos_address_object" "custom_addresses" {
  for_each = ${JSON.stringify(addressObjects.reduce((acc, obj) => {
                        acc[obj.name] = { ip: obj.ip, description: obj.description };
                        return acc;
                    }, {}))}

  name        = each.key
  value       = each.value.ip
  description = each.value.description
}

resource "panos_service_object" "custom_services" {
  for_each = ${JSON.stringify(serviceObjects.reduce((acc, svc) => {
                        acc[svc.name] = { protocol: svc.protocol, port: svc.port, description: svc.description };
                        return acc;
                    }, {}))}

  name        = each.key
  protocol    = each.value.protocol
  destination_port = each.value.port
  description = each.value.description
}

resource "panos_virtual_router" "custom_routers" {
  for_each = toset(${JSON.stringify(virtualRouters)})

  name = each.key
}

resource "panos_security_rule" "custom_security_rules" {
  for_each = ${JSON.stringify(securityRules.reduce((acc, rule) => {
                        acc[rule.name] = rule;
                        return acc;
                    }, {}))}

  name        = each.key
  from        = each.value.from_zone
  to          = each.value.to_zone
  source      = each.value.source
  destination = each.value.destination
  application = each.value.application
  service     = each.value.service
  action      = each.value.action
  tag         = each.value.tag
}
`,
        ansibleScript: `
- name: Configure Palo Alto Firewall
  hosts: localhost
  connection: local
  gather_facts: no
  tasks:
    - name: Configure interfaces
      panos_interface:
        provider:
          ip_address: "${firewallIp}"
          api_key: "${apiKey}"
        name: "{{ item.name }}"
        mode: "layer3"
        ip: "{{ item.ip }}"
        dhcp_client:
          enable: "{{ item.dhcp }}"
          create_default_route: false
      loop: ${JSON.stringify(interfaces)}

    - name: Add custom address objects
      panos_address_object:
        provider:
          ip_address: "${firewallIp}"
          api_key: "${apiKey}"
        name: "{{ item.name }}"
        value: "{{ item.ip }}"
        description: "{{ item.description }}"
      loop: ${JSON.stringify(addressObjects)}

    - name: Add custom service objects
      panos_service_object:
        provider:
          ip_address: "${firewallIp}"
          api_key: "${apiKey}"
        name: "{{ item.name }}"
        protocol: "{{ item.protocol }}"
        destination_port: "{{ item.port }}"
        description: "{{ item.description }}"
      loop: ${JSON.stringify(serviceObjects)}

    - name: Add custom virtual routers
      panos_virtual_router:
        provider:
          ip_address: "${firewallIp}"
          api_key: "${apiKey}"
        name: "{{ item }}"
      loop: ${JSON.stringify(virtualRouters)}

    - name: Add custom security rules
      panos_security_rule:
        provider:
          ip_address: "${firewallIp}"
          api_key: "${apiKey}"
        name: "{{ item.name }}"
        from: "{{ item.from_zone }}"
        to: "{{ item.to_zone }}"
        source: "{{ item.source }}"
        destination: "{{ item.destination }}"
        application: "{{ item.application }}"
        service: "{{ item.service }}"
        action: "{{ item.action }}"
        tag: "{{ item.tag }}"
      loop: ${JSON.stringify(securityRules)}
`
    };

    return scripts;
}

function downloadFile(filename, content) {
    const blob = new Blob([content], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
}

function generateAndDownloadScripts(config) {
    try {
        const scripts = generateScriptsFromConfig(config);
        downloadFile("east-fw-config.py", scripts.pythonScript);
        downloadFile("palo_alto_firewall.tf", scripts.terraformScript);
        downloadFile("ansible_playbook.yml", scripts.ansibleScript);
    } catch (error) {
        console.error(error.message);
        alert(error.message);
    }
}
