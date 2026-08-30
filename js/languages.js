/**
 * js/flagen.js
 * Steuert das Flaggen-Dropdown der Navbar und die Übersetzung
 */

// 1. Übersetzungswörterbuch nach Themen/Keys strukturiert
const translations = {
    music: {
        de: "Musikunterricht",
        fr: "Cours de musique",
        ar: "دروس الموسيقى"
    }
};

// 2. Zuordnung Sprache -> Flagge
const flagMap = {
    de: "🇩🇪",
    fr: "🇫🇷",
    ar: "🇸🇦"
};

window.initLanguageDropdown = function () {
    const langBtn = document.getElementById('lang-btn');
    const langMenu = document.getElementById('lang-menu');
    const currentFlag = document.getElementById('current-flag');
    const langOptions = document.querySelectorAll('.lang-option');

    if (!langBtn || !langMenu || !currentFlag) return;

    // Funktion zum Aktualisieren aller Texte und der Flagge
    function updateLanguage(lang) {
        document.documentElement.setAttribute('lang', lang);

        // Flagge im Button anpassen
        if (flagMap[lang]) {
            currentFlag.textContent = flagMap[lang];
        }

        // Alle Elemente mit data-key suchen und Text austauschen
        const translatableElements = document.querySelectorAll('[data-key]');
        translatableElements.forEach((el) => {
            const key = el.getAttribute('data-key');
            // Zugriff: Erst der Key (z.B. music), dann die Sprache (z.B. de)
            if (translations[key] && translations[key][lang]) {
                el.textContent = translations[key][lang];
            }
        });

        // Gewählte Sprache im Browser speichern
        localStorage.setItem('selectedLanguage', lang);
    }

    // Gespeicherte Sprache beim Laden abrufen (Standard: 'fr')
    const savedLang = localStorage.getItem('selectedLanguage') || 'fr';
    updateLanguage(savedLang);

    // Dropdown öffnen / schließen
    langBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        langMenu.classList.toggle('open');
    });

    // Klick auf eine Sprachoption
    langOptions.forEach(option => {
        option.addEventListener('click', () => {
            const selectedLang = option.getAttribute('data-lang');

            // Sprache anwenden & speichern
            updateLanguage(selectedLang);

            // Dropdown schließen
            langMenu.classList.remove('open');
        });
    });

    // Schließen bei Klick außerhalb des Menüs
    document.addEventListener('click', (e) => {
        if (!langMenu.contains(e.target) && !langBtn.contains(e.target)) {
            langMenu.classList.remove('open');
        }
    });
};

// Dropdown nach dem Laden des DOMs initialisieren
document.addEventListener('DOMContentLoaded', () => {
    window.initLanguageDropdown();
});