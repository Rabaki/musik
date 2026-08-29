
window.addEventListener('DOMContentLoaded', () => {
    const trigger = document.getElementById('inhaltverzeichnis_ein');
    const toc = document.getElementById('toc-container');
    const tocList = document.getElementById('table-of-contents');
    const sections = Array.from(document.querySelectorAll('.noten-container:not(#toc-container)'));
    let closeTimeout;

    // 1. Inhaltsverzeichnis aus allen Sektionen & H2 erstellen
    tocList.innerHTML = '';
    
    sections.forEach((sec, idx) => {
        // ID vergeben
        const secId = 'section-id-' + idx;
        sec.id = secId;

        // Alle H2-Titel in dieser Sektion finden
        const headings = sec.querySelectorAll('h2');
        
        headings.forEach(h2 => {
            const title = h2.textContent.trim();
            if (!title) return;

            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = '#' + secId;
            a.textContent = title;
            a.dataset.targetId = secId;
            
            li.appendChild(a);
            tocList.appendChild(li);
        });
    });

    // 2. Klick auf einen Eintrag im Menü
    toc.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (!link) return;

        e.preventDefault();
        const targetId = link.dataset.targetId;
        const targetSec = document.getElementById(targetId);

        if (targetSec) {
            // Alle Sektionen verstecken
            sections.forEach(s => s.classList.remove('aktiv'));
            
            // Gewählte Sektion einblenden
            targetSec.classList.add('aktiv');

            // ABCJS Notenanzeige aktualisieren
            window.dispatchEvent(new Event('resize'));
        }

        // Dropdown schließen
        toc.style.display = 'none';
    });

    // 3. Menüsteuerung (Hover PC + Klick Handy)
    function showMenu() {
        clearTimeout(closeTimeout);
        toc.style.display = 'block';
    }

    function hideMenu() {
        closeTimeout = setTimeout(() => {
            toc.style.display = 'none';
        }, 250);
    }

    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
        trigger.addEventListener('mouseenter', showMenu);
        trigger.addEventListener('mouseleave', hideMenu);
        toc.addEventListener('mouseenter', showMenu);
        toc.addEventListener('mouseleave', hideMenu);
    }

    trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        toc.style.display = (toc.style.display === 'block') ? 'none' : 'block';
    });

    document.addEventListener('click', (e) => {
        if (!toc.contains(e.target) && e.target !== trigger) {
            toc.style.display = 'none';
        }
    });
});



document.getElementById('print-btn').addEventListener('click', () => {
    const activeSection = document.querySelector('.noten-container.aktiv');
    if (!activeSection) {
        alert('Bitte wähle zuerst einen Abschnitt aus.');
        return;
    }
    window.print();
});


