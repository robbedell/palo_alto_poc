# palo_alto_poc

Palo Alto Firewall / Panorama Automations

## Overview

This repository contains automation scripts for configuring Palo Alto Firewalls using Python, Terraform, and Ansible. Additionally, a webpage is provided to dynamically generate these scripts based on user inputs, including custom interface configurations.

## Prerequisites

1. **Palo Alto Firewall**:
   - Ensure the firewall is accessible via its management IP.
   - Generate an API key for authentication. Refer to the [Palo Alto API Key Generation Guide](https://docs.paloaltonetworks.com/pan-os/10-1/pan-os-panorama-api/get-started-with-the-pan-os-xml-api/get-your-api-key).

2. **Python Environment**:
   - Install Python 3.x.
   - Install required libraries using:
     ```bash
     pip install requests
     ```

3. **Terraform**:
   - Install Terraform. Refer to the [Terraform Installation Guide](https://developer.hashicorp.com/terraform/tutorials/aws-get-started/install-cli).

4. **Ansible**:
   - Install Ansible. Refer to the [Ansible Installation Guide](https://docs.ansible.com/ansible/latest/installation_guide/intro_installation.html).

## Webpage for Script Generation

A webpage is included in the `docs` folder to dynamically generate the automation scripts.

### Features:
- **Firewall Management IP and API Key**: Input fields to specify the firewall's management IP and API key.
- **Custom Interface Configuration**: Add custom IP addresses and subnets for specific interfaces.

### Usage:
1. Open the `index.html` file in the `docs` folder in any modern web browser.
2. Enter the required information:
   - **Firewall Management IP**: The management IP of your firewall.
   - **API Key**: The API key generated from the firewall.
3. (Optional) Add custom interface configurations:
   - Click the "Add Interface" button.
   - Specify the interface name (e.g., `ethernet1/1`), IP address, and subnet mask.
   - Repeat for additional interfaces as needed.
4. Click the "Generate Scripts" button to download the Python, Terraform, and Ansible scripts pre-filled with your inputs.

## Scripts Overview

### 1. Python Script: `east-fw-config.py`

This script configures:
- Interfaces (`ethernet1/1` to `ethernet1/4`) as Layer 3 with DHCP enabled or custom IPs and subnets.
- Virtual routers (`trust`, `untrust`, `vpn`, `webtier`).
- A security policy (`POC_Any_Any_premigrate`) allowing any-to-any traffic.

#### Usage:
1. Update the `firewall_ip` and `api_key` variables in the script.
2. (Optional) Update the `custom_ips` dictionary to specify custom IPs and subnets for interfaces.
3. Run the script:
   ```bash
   python east-fw-config.py
   ```

### 2. Terraform Script: `palo_alto_firewall.tf`

This script uses Terraform to configure the firewall with the same settings as the Python script.

#### Usage:
1. Update the `hostname` and `api_key` in the `provider` block.
2. (Optional) Update the `ip` and `subnet` values in the `panos_interface` resource for custom interface configurations.
3. Initialize Terraform:
   ```bash
   terraform init
   ```
4. Apply the configuration:
   ```bash
   terraform apply
   ```

### 3. Ansible Playbook: `ansible_playbook.yml`

This playbook configures the firewall using Ansible.

#### Usage:
1. Update the `ip_address` and `api_key` in the `provider` sections.
2. (Optional) Update the `loop` section to specify custom IPs and subnets for interfaces.
3. Run the playbook:
   ```bash
   ansible-playbook ansible_playbook.yml
   ```

## Custom Interface Configuration

You can configure interfaces with custom IPs and subnets by modifying the respective script:
- **Python**: Update the `custom_ips` dictionary in `east-fw-config.py`.
- **Terraform**: Update the `ip` and `subnet` values in the `panos_interface` resource.
- **Ansible**: Update the `loop` section in `ansible_playbook.yml` with the desired IPs and subnets.

For interfaces without custom IPs, DHCP will be enabled by default.

## Required User Inputs

- **Firewall Management IP**: Replace `192.168.1.1` with the actual management IP of your firewall.
- **API Key**: Replace `YOUR_API_KEY` with the API key generated from the firewall.

## Additional Configuration Options

### Custom Address Objects
You can define custom address objects for specific IPs. For example:
- **Name**: `web_server`
- **IP Address**: `192.168.30.10`
- **Description**: `Web Server Address`

#### Python:
Update the `custom_addresses` dictionary in `east-fw-config.py`.

#### Ansible:
Update the `loop` section in the `Add custom address objects` task in `ansible_playbook.yml`.

### Custom Service Objects
You can define custom service objects for specific protocols and ports. For example:
- **Name**: `http`
- **Protocol**: `tcp`
- **Port**: `80`
- **Description**: `HTTP Service`

#### Python:
Update the `custom_services` dictionary in `east-fw-config.py`.

#### Ansible:
Update the `loop` section in the `Add custom service objects` task in `ansible_playbook.yml`.

These options can also be configured via the webpage or directly in the Terraform script.

## References

- [Palo Alto Networks XML API Documentation](https://docs.paloaltonetworks.com/pan-os/10-1/pan-os-panorama-api)
- [Terraform Palo Alto Provider Documentation](https://registry.terraform.io/providers/PaloAltoNetworks/panos/latest/docs)
- [Ansible Palo Alto Modules Documentation](https://docs.ansible.com/ansible/latest/collections/paloaltonetworks/panos/index.html)
