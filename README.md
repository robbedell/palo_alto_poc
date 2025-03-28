# palo_alto_poc

## Website Overview
This repository provides a web-based tool (in the "docs" folder) for generating firewall configurations. The site (index.html) allows you to input and customize firewall settings, then download ready-to-use scripts.

## How to Use
1. Open the "index.html" file in your browser.  
2. Complete the required fields under “Firewall Configuration”:
   - Management IP (e.g., 192.168.1.1)
   - API Key (obtain from your firewall)
   - Firewall Hostname
3. Expand each section (Interfaces, Address Objects, etc.) to add or modify custom items.
4. Click “Generate Scripts” to download tailored Python, Terraform, and Ansible scripts containing your inputs.

## Configuration Items
• Interfaces: Choose an interface (e.g., ethernet1/1) and specify DHCP or a static IP/subnet.  
• Address Objects: Provide a name, IP, and optional description (e.g., web_server, 192.168.30.10).  
• Service Objects: Define a service name (e.g., http), protocol (tcp/udp), port, and description.  
• Virtual Routers: List router names to add or override defaults (e.g., trust, untrust).  
• Security Rules: Specify zones, source/destination, application, service, action (allow/deny), and any desired tags.

For more details on what each item represents and best practices for configuration, consult the official Palo Alto Networks documentation:
- https://docs.paloaltonetworks.com
