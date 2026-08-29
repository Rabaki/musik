document.addEventListener('DOMContentLoaded', () => {
    const langBtn = document.getElementById('lang-btn');
    const langMenu = document.getElementById('lang-menu');
    const currentFlag = document.getElementById('current-flag');
    const langOptions = document.querySelectorAll('.lang-option');

    // 1. Dropdown öffnen / schließen beim Klick auf den Flaggen-Button
    langBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        langMenu.classList.toggle('open');
    });

    // 2. Klick auf eine Flagge in der Liste: Symbol im Button austauschen
    langOptions.forEach(option => {
        option.addEventListener('click', () => {
            // Holt die neue Flagge aus data-flag (z. B. "🇩🇪")
            const newFlag = option.getAttribute('data-flag');
            
            // Setzt das Symbol im Navbar-Button
            currentFlag.textContent = newFlag;
            
            // Schließt das Menü
            langMenu.classList.remove('open');
        });
    });

    // 3. Menü schließen, wenn man irgendwo anders hinklickt
    document.addEventListener('click', (e) => {
        if (!langMenu.contains(e.target) && e.target !== langBtn) {
            langMenu.classList.remove('open');
        }
    });
});