// Theme-Toggle für die Navbar
// Bindet an <button id="theme-toggle"> mit <span id="theme-icon"> aus deinem
// Navbar-Markup. Merkt sich die manuelle Wahl in localStorage; ohne
// Auswahl entscheidet weiterhin das System-Farbschema (prefers-color-scheme).

(function () {
    const root = document.documentElement;

    function systemPrefersDark() {
        return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }

    function currentTheme() {
        return root.getAttribute("data-theme") || (systemPrefersDark() ? "dark" : "light");
    }

    function init() {
        const toggleBtn = document.getElementById("theme-toggle");
        const icon = document.getElementById("theme-icon");

        function updateIcon(theme) {
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

        const saved = localStorage.getItem("musik-theme");
        if (saved === "light" || saved === "dark") {
            applyTheme(saved, false);
        } else {
            updateIcon(currentTheme());
        }

        if (!toggleBtn) {
            console.warn('theme-toggle.js: Button mit id="theme-toggle" wurde nicht gefunden.');
            return;
        }

        toggleBtn.addEventListener("click", function () {
            const next = currentTheme() === "dark" ? "light" : "dark";
            applyTheme(next, true);
        });

        window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function () {
            if (!localStorage.getItem("musik-theme")) {
                updateIcon(currentTheme());
            }
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();



document.addEventListener("DOMContentLoaded", function () {

    // Map von Tonsilben zu ABCJS-Noten
    const tonsilbenZuNoten = {
        'la': 'A,', 'si': 'B,', 'do': 'C', 're': 'D', 'mi': 'E', 'fa': 'F', 'so': 'G',
        'sol': 'G', 'sol1': 'G', '2sol': 'g', '3sol': 'g',
        '2la': 'A', '2si': 'B', '2do': 'c', '2re': 'd', '2mi': 'e', '2fa': 'f', '2so': 'g',
        '3la': 'a', '3si': 'b', '3do': "c'"
    };

    // 1. Die großen Notenblätter verarbeiten
    const notenElemente = document.querySelectorAll('.noten');
    notenElemente.forEach(function (element) {
        let textInhalt = element.textContent;
        // Erkennt zuverlässig jedes K: F (mit oder ohne Leerzeichen)
        let brauchtBimoulStrich = /K:\s*F/i.test(textInhalt);

        let lines = textInhalt.split('\n').map(line => line.trim());

        let notation = lines.map(line => {
            // Header-Zeilen nicht übersetzen
            if (line.match(/^[TQLwK]:/) || line === "") {
                return line;
            }

            // Trennen nach Leerzeichen, Taktstrichen und Klammern
            let teile = line.split(/(\s+|\||\[.*?\]|\|:|:\||:\|:)/);

            let uebersetzteZeile = teile.map(teil => {
                let getrimmterTeil = teil.trim().toLowerCase();

                if (getrimmterTeil === 'faulenzer') {
                    return '"^faulenzer" x4';
                }

                if (getrimmterTeil === '|:' || getrimmterTeil === ':|' || getrimmterTeil === ':|:' || getrimmterTeil === '') {
                    return teil;
                }

                // Noten mit Unterstrich (z.B. "2so_2la")
                if (teil.includes('_')) {
                    return teil.split('_').map(einzelNoten => {
                        let treffer = einzelNoten.match(/^(\d?[a-zA-ZéRÉé]+)(\d*)$/i);
                        if (treffer) {
                            let silbe = treffer[1].toLowerCase();
                            let laenge = treffer[2];
                            if (tonsilbenZuNoten[silbe]) {
                                return tonsilbenZuNoten[silbe] + laenge;
                            }
                        }
                        return einzelNoten;
                    }).join('');
                }

                // Einzelne Note übersetzen
                let treffer = teil.match(/^(\d?[a-zA-ZéRÉé]+)(\d*)$/i);
                if (treffer) {
                    let silbe = treffer[1].toLowerCase();
                    let laenge = treffer[2];

                    if (tonsilbenZuNoten[silbe]) {
                        return tonsilbenZuNoten[silbe] + laenge;
                    }
                }
                return teil;
            }).join('');

            return uebersetzteZeile;
        }).join('\n');

        element.textContent = "";



        // Zeichnen durch ABCJS (VORHER: scale: 2, staffwidth: 1100)
        ABCJS.renderAbc(element, notation, {
            responsive: "resize",
            staffwidth: 740,
            add_classes: true
        });

        // --- FAULENZER INTEGRATION ---
        const alleTexte = element.querySelectorAll('text');
        alleTexte.forEach(textNode => {
            if (textNode.textContent.trim() === "faulenzer") {
                textNode.textContent = "%";
                textNode.setAttribute("font-family", "serif");
                textNode.setAttribute("font-size", "20");
                textNode.setAttribute("font-weight", "bold");
                textNode.setAttribute("font-style", "italic");
                textNode.setAttribute("text-anchor", "middle");

                let currentX = parseInt(textNode.getAttribute('x')) || 0;
                textNode.setAttribute('x', currentX + 25);

                let currentY = parseInt(textNode.getAttribute('y')) || 0;
                textNode.setAttribute('y', currentY + 45);
            }
        });

        // --- STRICH EXAKT DURCH DAS B-VORZEICHEN IN JEDER NOTENZEILE ---

        // --- STRICH GARANTIERT AUF JEDER NOTENZEILE ---
        // --- STRICH GARANTIERT AUF JEDER NOTENZEILE (INKL. DER LETZTEN) ---
        if (brauchtBimoulStrich) {
            const alleSvgs = element.querySelectorAll('svg');
            alleSvgs.forEach(svg => {
                // 1. Alle horizontalen Notenlinien finden, um die Zeilen zu erkennen
                const linien = Array.from(svg.querySelectorAll('line, path')).filter(el => {
                    try {
                        let b = el.getBBox();
                        return b.width > 120 && b.height < 6; // Notenlinien
                    } catch (e) { return false; }
                });

                // Gruppiere nach Y-Position der Notensysteme
                const zeilenY = [];
                linien.forEach(l => {
                    let y = Math.round(l.getBBox().y);
                    if (!zeilenY.some(zy => Math.abs(zy - y) < 30)) {
                        zeilenY.push(y);
                    }
                });

                // Von oben nach unten sortieren
                zeilenY.sort((a, b) => a - b);

                if (zeilenY.length === 0) {
                    zeilenY.push(0);
                }

                const allePfade = svg.querySelectorAll('path');

                // 2. Jede Notenzeile separat abarbeiten
                zeilenY.forEach(staffTopY => {
                    let bKandidaten = [];

                    allePfade.forEach(pfad => {
                        // Taktart (6/8), Noten und Pausen strikt ausschließen
                        if (
                            pfad.closest('.abcjs-time-signature') ||
                            pfad.closest('.abcjs-note') ||
                            pfad.closest('.abcjs-rest')
                        ) {
                            return;
                        }

                        let bbox;
                        try {
                            bbox = pfad.getBBox();
                        } catch (e) {
                            return;
                        }

                        // Vertikale Position: Großzügiger Bereich (85px) für die jeweilige Zeile
                        let inDieserZeile = staffTopY === 0 || Math.abs(bbox.y - staffTopY) < 85;

                        // Exakte Form/Größe eines b-Vorzeichens
                        let istBVorzeichen = bbox.width > 2 && bbox.width < 18 && bbox.height > 10 && bbox.height < 42;

                        if (inDieserZeile && istBVorzeichen) {
                            bKandidaten.push({ pfad: pfad, x: bbox.x, bbox: bbox });
                        }
                    });

                    // Von links nach rechts sortieren
                    bKandidaten.sort((a, b) => a.x - b.x);

                    // Genau das erste 'b' links am Schlüssel dieser Zeile durchstreichen
                    if (bKandidaten.length > 0) {
                        let bbox = bKandidaten[0].bbox;

                        let linie = document.createElementNS("http://www.w3.org/2000/svg", "line");
                        linie.setAttribute("x1", bbox.x - 3);
                        linie.setAttribute("y1", bbox.y + (bbox.height * 0.6));
                        linie.setAttribute("x2", bbox.x + bbox.width);
                        linie.setAttribute("y2", bbox.y + (bbox.height * 0.28));

                        linie.style.stroke = "var(--text)";
                        linie.setAttribute("stroke-width", "1");
                        linie.setAttribute("stroke-linecap", "round");

                        svg.appendChild(linie);
                    }
                });
            });
        }



    }); // Ende von notenElemente.forEach

    // 2. Kleine Tabellen-Symbole verarbeiten
    // 2. Kleine Tabellen-Symbole verarbeiten
    document.querySelectorAll('.note-render').forEach(function (el) {
        var abcCode = el.getAttribute('data-abc').replace(/\\n/g, '\n');
        ABCJS.renderAbc(el, abcCode, {
            scale: 1,
            staffwidth: 60,
            responsive: "resize"
        });

        // Strich NUR in der Tabellenzeile für Halb-B / Koron
        if (abcCode.includes('K:F') || abcCode.includes('_2/4') || abcCode.includes('K: F')) {
            const svg = el.querySelector('svg');
            if (svg) {
                const clef = svg.querySelector('.abcjs-clef') || svg.querySelector('path');
                let clefX = clef ? clef.getBBox().x : 0;

                const pfade = svg.querySelectorAll('path');
                let bGefunden = false;

                pfade.forEach(pfad => {
                    // Pausen, Noten und Schlüssel ausschließen
                    if (
                        pfad.closest('.abcjs-rest') ||
                        pfad.closest('.abcjs-note') ||
                        pfad.classList.contains('abcjs-clef')
                    ) {
                        return;
                    }

                    let bbox = pfad.getBBox();

                    // Nur das 'b'-Vorzeichen direkt neben dem Schlüssel
                    if (bbox.x > clefX + 5 && bbox.width > 2 && bbox.width < 15 && bbox.height > 10 && bbox.height < 35 && !bGefunden) {
                        bGefunden = true;

                        let linie = document.createElementNS("http://www.w3.org/2000/svg", "line");
                        linie.setAttribute("x1", bbox.x - 3);
                        linie.setAttribute("y1", bbox.y + (bbox.height * 0.6));
                        linie.setAttribute("x2", bbox.x + bbox.width);
                        linie.setAttribute("y2", bbox.y + (bbox.height * 0.28));

                        linie.style.stroke = "var(--text)";
                        linie.setAttribute("stroke-width", "1");
                        linie.setAttribute("stroke-linecap", "round");

                        svg.appendChild(linie);
                    }
                });
            }
        }
    });

});




document.addEventListener("DOMContentLoaded", function () {
    const tocList = document.getElementById("table-of-contents");
    // Alle h2-Überschriften auf der Seite auswählen (ausgenommen die h2 des Inhaltsverzeichnisses selbst)
    const headings = document.querySelectorAll(".noten-container:not(#toc-container) h2");

    headings.forEach((heading, index) => {
        // Prüfen, ob das Element sichtbar ist (ignoriert display: none)
        if (heading.offsetParent === null) return;

        // ID für die Überschrift vergeben, falls noch keine vorhanden ist
        if (!heading.id) {
            heading.id = "section-" + index;
        }

        // Listenelement und Link erstellen
        const li = document.createElement("li");
        const a = document.createElement("a");

        a.textContent = heading.textContent;
        a.href = "#" + heading.id;

        li.appendChild(a);
        tocList.appendChild(li);
    });
});





