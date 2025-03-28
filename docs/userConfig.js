function validateField(field, regex, errorMessage) {
    const errorElement = field.nextElementSibling;
    if (!regex.test(field.value.trim())) {
        field.style.borderColor = "red";
        errorElement.textContent = errorMessage;
        errorElement.classList.remove("hidden");
        return false;
    }
    field.style.borderColor = "";
    errorElement.textContent = "";
    errorElement.classList.add("hidden");
    return true;
}

function gatherUserConfig() {
    // Gather user input from the form
    const firewallIp = document.getElementById("firewallIp").value;
    const apiKey = document.getElementById("apiKey").value;
    const firewallHostname = document.getElementById("firewallHostname").value;

    // Example: Gather interfaces
    const interfaceRows = document.querySelectorAll("#customIpContainer .row");
    const interfaces = Array.from(interfaceRows).map(row => ({
        name: row.querySelector(".interface-name").value,
        ip: row.querySelector(".ip-address").value || null,
        subnet: row.querySelector(".subnet-mask").value || null,
        dhcp: !row.querySelector(".ip-address").value
    }));

    // Gather custom address objects
    const addressRows = document.querySelectorAll("#customAddressContainer .row");
    const address_objects = Array.from(addressRows).map(row => {
        return {
            name: row.querySelector(".address-name")?.value || "",
            ip: row.querySelector(".address-ip")?.value || "",
            description: row.querySelector(".address-description")?.value || ""
        };
    });

    // Gather custom service objects
    const serviceRows = document.querySelectorAll("#customServiceContainer .row");
    const service_objects = Array.from(serviceRows).map(row => {
        return {
            name: row.querySelector(".service-name")?.value || "",
            protocol: row.querySelector(".service-protocol")?.value || "",
            port: row.querySelector(".service-port")?.value || "",
            description: row.querySelector(".service-description")?.value || ""
        };
    });

    // Gather custom virtual routers
    const routerRows = document.querySelectorAll("#customRouterContainer .row");
    const virtual_routers = Array.from(routerRows).map(row => {
        return row.querySelector(".router-name")?.value || "";
    }).filter(r => r);

    // Gather custom security rules
    const securityRows = document.querySelectorAll("#customSecurityContainer .row");
    const security_rules = Array.from(securityRows).map(row => {
        return {
            name: row.querySelector(".rule-name")?.value || "",
            from_zone: [row.querySelector(".from-zone")?.value || "any"],
            to_zone: [row.querySelector(".to-zone")?.value || "any"],
            source: [row.querySelector(".source")?.value || "any"],
            destination: [row.querySelector(".destination")?.value || "any"],
            application: [row.querySelector(".application")?.value || "any"],
            service: [row.querySelector(".service")?.value || "any"],
            action: row.querySelector(".action")?.value || "allow",
            tag: [row.querySelector(".tag")?.value || "POC-DELETE"]
        };
    });

    // Gather DNS inputs
    const primaryDns = document.getElementById("primaryDns")?.value || "1.1.1.1";
    const secondaryDns = document.getElementById("secondaryDns")?.value || "8.8.8.8";

    // Gather time servers
    const timeRows = document.querySelectorAll("#customTimeServerContainer .row");
    const time_servers = Array.from(timeRows).map(row => {
        return row.querySelector(".time-server")?.value || "";
    }).filter(ts => ts);

    // Gather Panorama inputs
    const primaryPanorama = document.getElementById("primaryPanorama")?.value || "";
    const secondaryPanorama = document.getElementById("secondaryPanorama")?.value || "";

    return {
        firewall: { management_ip: firewallIp, api_key: apiKey, hostname: firewallHostname },
        interfaces,
        address_objects,
        service_objects,
        virtual_routers,
        security_rules,
        dns: {
            primary: primaryDns,
            secondary: secondaryDns
        },
        time_servers,
        panorama: {
            primary: primaryPanorama,
            secondary: secondaryPanorama
        }
    };
}

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const config = JSON.parse(e.target.result);
            updateFormFields(config);
        } catch (error) {
            alert("Invalid JSON file. Please upload a valid configuration.");
        }
    };
    reader.readAsText(file);
}

function updateFormFields(config) {
    // Update form fields based on the uploaded configuration
    if (config.firewall) {
        document.getElementById("firewallIp").value = config.firewall.management_ip || "";
        document.getElementById("apiKey").value = config.firewall.api_key || "";
        document.getElementById("firewallHostname").value = config.firewall.hostname || "";
    }
    // Add logic to update other sections (e.g., interfaces, address objects)
}

document.addEventListener("DOMContentLoaded", () => {
    // Add file upload event listener
    const uploadInput = document.createElement("input");
    uploadInput.type = "file";
    uploadInput.accept = "application/json";
    uploadInput.addEventListener("change", handleFileUpload);

    const sidebar = document.querySelector(".sidebar");
    const uploadLabel = document.createElement("label");
    uploadLabel.textContent = "Upload Configuration:";
    sidebar.appendChild(uploadLabel);
    sidebar.appendChild(uploadInput);
});
