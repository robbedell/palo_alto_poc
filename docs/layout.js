function toggleSection(section) {
    section.classList.toggle("collapsed");
}

function toggleDarkMode() {
    const body = document.body;
    const toggleButton = document.getElementById('darkModeToggle');
    body.classList.toggle('dark-mode');
    toggleButton.textContent = body.classList.contains('dark-mode') ? '☀️' : '🌙';
    localStorage.setItem('darkMode', body.classList.contains('dark-mode') ? 'enabled' : 'disabled');
}

document.addEventListener("DOMContentLoaded", () => {
    // Set dark mode based on user preference
    const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode === 'enabled' || (savedDarkMode === null && prefersDarkMode)) {
        document.body.classList.add('dark-mode');
    }

    // Add dark mode toggle button
    const darkModeToggle = document.createElement('button');
    darkModeToggle.id = 'darkModeToggle';
    darkModeToggle.className = 'dark-mode-toggle';
    darkModeToggle.textContent = document.body.classList.contains('dark-mode') ? '☀️' : '🌙';
    darkModeToggle.onclick = toggleDarkMode;
    document.body.appendChild(darkModeToggle);

    // Add event listeners for collapsible sections
    document.querySelectorAll(".form-section h2").forEach(header => {
        header.addEventListener("click", () => toggleSection(header.parentElement));
    });
});
