/**
 * js/flagen.js
 * Steuert das Flaggen-Dropdown der Navbar
 */
window.initLanguageDropdown = function () {
    const langBtn = document.getElementById('lang-btn');
    const langMenu = document.getElementById('lang-menu');
    const currentFlag = document.getElementById('current-flag');
    const langOptions = document.querySelectorAll('.lang-option');

    if (!langBtn || !langMenu || !currentFlag) return;

    // 1. Dropdown öffnen / schließen
    langBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        langMenu.classList.toggle('open');
    });

    // 2. Klick auf eine Sprache/Flagge
    langOptions.forEach(option => {
        option.addEventListener('click', () => {
            const newFlag = option.getAttribute('data-flag');
            currentFlag.textContent = newFlag;
            langMenu.classList.remove('open');
        });
    });

    // 3. Schließen bei Klick ins Leere
    document.addEventListener('click', (e) => {
        if (!langMenu.contains(e.target) && e.target !== langBtn) {
            langMenu.classList.remove('open');
        }
    });
};