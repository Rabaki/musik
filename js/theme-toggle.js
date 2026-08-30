/**
 * js/theme-toggle.js
 */
(function () {
    const root = document.documentElement;

    function systemPrefersDark() {
        return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }

    function currentTheme() {
        return root.getAttribute("data-theme") || (systemPrefersDark() ? "dark" : "light");
    }

    function updateIcon(theme) {
        const icon = document.getElementById("theme-icon");
        if (!icon) return;
        icon.textContent = theme === "dark" ? "light_mode" : "dark_mode";
    }

    function applyTheme(theme, persist) {
        root.setAttribute("data-theme", theme);
        updateIcon(theme);
        if (persist) {
            localStorage.setItem("musik-theme", theme);
        }
    }

    // Gespeichertes Theme sofort beim Laden anwenden (verhindert weißes Aufblitzen)
    const saved = localStorage.getItem("musik-theme");
    if (saved === "light" || saved === "dark") {
        applyTheme(saved, false);
    } else {
        updateIcon(currentTheme());
    }

    // Global aufrufbare Funktion für geladene Navbar
    window.initThemeToggle = function () {
        const toggleBtn = document.getElementById("theme-toggle");
        if (!toggleBtn) return;

        // Icon synchronisieren
        updateIcon(currentTheme());

        toggleBtn.addEventListener("click", function () {
            const next = currentTheme() === "dark" ? "light" : "dark";
            applyTheme(next, true);
        });
    };

    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function () {
        if (!localStorage.getItem("musik-theme")) {
            updateIcon(currentTheme());
        }
    });
})();