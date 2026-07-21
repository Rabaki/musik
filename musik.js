document.addEventListener("DOMContentLoaded", function () {

    // Deine Map von Tonsilben zu ABCJS-Noten
    const tonsilbenZuNoten = {
        'la': 'A,', 'si': 'B,', 'do': 'C', 're': 'D', 'mi': 'E', 'fa': 'F', 'so': 'G',
        'sol': 'G', 'sol1': 'G', '2sol': 'g', '3sol': 'g',
        '2la': 'A', '2si': 'B', '2do': 'c', '2re': 'd', '2mi': 'e', '2fa': 'f', '2so': 'g',
        '3la': 'a', '3si': 'b', '3do': "c'"
    };

    // 1. Die großen Notenblätter verarbeiten
    const notenElemente = document.querySelectorAll('.noten');
    notenElemente.forEach(function (element) {
        let lines = element.textContent.split('\n').map(line => line.trim());

        let notation = lines.map(line => {
            if (line.match(/^[TQLw]:/) || line === "") {
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

                // Wenn Noten mit Unterstrich verbunden sind (z.B. "2so_2la"), splitten wir sie hier
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
                    }).join(''); // Werden im ABC-Code ohne Leerzeichen zusammengefügt -> Balken entsteht!
                }

                // Normale, einzelne Note übersetzen
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

        // Zeichnen durch ABCJS
        ABCJS.renderAbc(element, notation, {
            scale: 2,
            staffwidth: 1100
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
    });

    // 2. Kleine Tabellen-Symbole verarbeiten
    document.querySelectorAll('.note-render').forEach(function (el) {
        var abcCode = el.getAttribute('data-abc').replace(/\\n/g, '\n');
        ABCJS.renderAbc(el, abcCode, {
            scale: 1,
            staffwidth: 60,
            responsive: "resize"
        });
    });
});