# palo_alto_poc

Palo Alto Firewall / Panorama Automations

## Overview

This repository contains automation scripts for configuring Palo Alto Firewalls using Python, Terraform, and Ansible. Additionally, a webpage is provided to generate these scripts dynamically based on user inputs.

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

A webpage is included in the `web` folder to dynamically generate the automation scripts.

### Usage:
1. Open the `index.html` file in the `web` folder in any modern web browser.
2. Enter the required information:
   - **Firewall Management IP**: The management IP of your firewall.
   - **API Key**: The API key generated from the firewall.
3. Click the "Generate Scripts" button to download the Python, Terraform, and Ansible scripts pre-filled with your inputs.

## Scripts Overview

### 1. Python Script: `east-fw-config.py`

This script configures:
- Interfaces (`ethernet1/1` to `ethernet1/4`) as Layer 3 with DHCP enabled.
- Virtual routers (`trust`, `untrust`, `vpn`, `webtier`).
- A security policy (`POC_Any_Any_premigrate`) allowing any-to-any traffic.

#### Usage:
1. Update the `firewall_ip` and `api_key` variables in the script.
2. Run the script:
   ```bash
   python east-fw-config.py
   ```

### 2. Terraform Script: `palo_alto_firewall.tf`

This script uses Terraform to configure the firewall with the same settings as the Python script.

#### Usage:
1. Update the `hostname` and `api_key` in the `provider` block.
2. Initialize Terraform:
   ```bash
   terraform init
   ```
3. Apply the configuration:
   ```bash
   terraform apply
   ```

### 3. Ansible Playbook: `ansible_playbook.yml`

This playbook configures the firewall using Ansible.

#### Usage:
1. Update the `ip_address` and `api_key` in the `provider` sections.
2. Run the playbook:
   ```bash
   ansible-playbook ansible_playbook.yml
   ```

## Required User Inputs

- **Firewall Management IP**: Replace `192.168.1.1` with the actual management IP of your firewall.
- **API Key**: Replace `YOUR_API_KEY` with the API key generated from the firewall.

## References

- [Palo Alto Networks XML API Documentation](https://docs.paloaltonetworks.com/pan-os/10-1/pan-os-panorama-api)
- [Terraform Palo Alto Provider Documentation](https://registry.terraform.io/providers/PaloAltoNetworks/panos/latest/docs)
- [Ansible Palo Alto Modules Documentation](https://docs.ansible.com/ansible/latest/collections/paloaltonetworks/panos/index.html)
