import requests
import xml.etree.ElementTree as ET
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Palo Alto Firewall details
firewall_ip = '192.168.1.1'  # Replace with your firewall's management IP
api_key = 'YOUR_API_KEY'     # Replace with your valid API key

# Function to send requests to the firewall
def send_request(endpoint, params):
    url = f"https://{firewall_ip}/api/"
    params['key'] = api_key
    try:
        response = requests.get(url, params=params, verify=False)
        response.raise_for_status()  # Raise HTTPError for bad responses
        return response.text
    except requests.exceptions.RequestException as e:
        logging.error(f"Request to {url} failed: {e}")
        return None

# Function to check response success
def is_success(response):
    if response and 'success' in response:
        return True
    return False

# Configure interfaces 1-4 as Layer 3 with DHCP or custom IP and subnet
def configure_interfaces(custom_ips=None):
    for interface_id in range(1, 5):
        interface_name = f'ethernet1/{interface_id}'
        logging.info(f"Configuring interface {interface_name}...")

        # Determine if custom IP and subnet are provided
        if custom_ips and interface_name in custom_ips:
            ip_address = custom_ips[interface_name]['ip']
            subnet_mask = custom_ips[interface_name]['subnet']
            element = f"""
            <layer3>
                <ip>
                    <entry name="{ip_address}/{subnet_mask}"/>
                </ip>
            </layer3>
            """
        else:
            # Default to DHCP
            element = """
            <layer3>
                <dhcp-client>
                    <enable>yes</enable>
                    <create-default-route>no</create-default-route>
                </dhcp-client>
            </layer3>
            """

        # Set interface to Layer 3
        set_interface_url = f"/config/devices/entry[@name='localhost.localdomain']/network/interface/ethernet/entry[@name='{interface_name}']/layer3"
        set_interface_params = {
            'type': 'config',
            'action': 'set',
            'xpath': set_interface_url,
            'element': element
        }

        # Sending request to configure the interface
        response_set = send_request(set_interface_url, set_interface_params)

        # Check for success
        if is_success(response_set):
            logging.info(f"Interface {interface_name} configured successfully.")
        else:
            logging.error(f"Failed to configure Interface {interface_name}.")

# Add virtual routers
def add_virtual_routers():
    virtual_routers = ['trust', 'untrust', 'vpn', 'webtier']
    for vr_name in virtual_routers:
        logging.info(f"Adding virtual router {vr_name}...")
        vr_xpath = f"/config/devices/entry[@name='localhost.localdomain']/network/virtual-router/entry[@name='{vr_name}']"
        vr_element = f"<entry name='{vr_name}'></entry>"
        vr_params = {
            'type': 'config',
            'action': 'set',
            'xpath': vr_xpath,
            'element': vr_element
        }

        # Sending request to add the virtual router
        response_vr = send_request(vr_xpath, vr_params)

        # Check for success
        if is_success(response_vr):
            logging.info(f"Virtual router {vr_name} added successfully.")
        else:
            logging.error(f"Failed to add virtual router {vr_name}.")

# Add POC Any/Any security policy for testing
def add_security_policy():
    policy_name = "POC_Any_Any_premigrate"
    logging.info(f"Adding security policy {policy_name}...")
    policy_xpath = f"/config/devices/entry[@name='localhost.localdomain']/rulebase/security/rules/entry[@name='{policy_name}']"
    policy_element = f"""
    <entry name="{policy_name}">
        <from><member>any</member></from>
        <to><member>any</member></to>
        <source><member>any</member></source>
        <destination><member>any</member></destination>
        <service><member>any</member></service>
        <application><member>any</member></application>
        <action>allow</action>
        <tag><member>POC-DELETE</member></tag>
    </entry>
    """
    policy_params = {
        'type': 'config',
        'action': 'set',
        'xpath': policy_xpath,
        'element': policy_element
    }

    # Sending request to add the policy
    response_policy = send_request(policy_xpath, policy_params)

    # Check for success
    if is_success(response_policy):
        logging.info(f"Policy {policy_name} added successfully.")
    else:
        logging.error(f"Failed to add policy {policy_name}.")

# Main execution
if __name__ == "__main__":
    logging.info("Starting configuration...")
    custom_ips = {
        "ethernet1/1": {"ip": "192.168.10.1", "subnet": "24"},
        "ethernet1/2": {"ip": "192.168.20.1", "subnet": "24"}
    }
    configure_interfaces(custom_ips=custom_ips)
    add_virtual_routers()
    add_security_policy()
    logging.info("Configuration completed.")