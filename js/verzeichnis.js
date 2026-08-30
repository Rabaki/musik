/**
 * inhaltverzeichnis.js
 * - Lädt navbar.html nach
 * - Baut das Inhaltsverzeichnis aus der zentralen Seitenliste auf
 * - Hebt die aktuell aktive Seite hervor
 * - Steuert das Ein-/Ausblenden des Menüs
 */

const SEITEN_LISTE = [
    { url: "index.html", title: "Startseite" },
    { url: "pano_tuner.html", title: "Pano Tuner" },
    { url: "oktaven.html", title: "2,5 Oktaven (Gesamtübersicht)" },
    { url: "notenwerte.html", title: "Notenwerte und Symbole" },
    { url: "pausen.html", title: "Nom du silence (Pausenwerte)" },
    { url: "vorzeichen.html", title: "Vorzeichen (Maqam-Intervalle)" },
    { url: "notennamen.html", title: "Notennamen im Vergleich" },
    { url: "uebung_la_mi.html", title: "Übung: la, mi" },
    { url: "uebung_la_mi_re.html", title: "Übung: la, mi, re" },
    { url: "tonleiter_uebung.html", title: "Tonleiter-Übungen" },
    { url: "de_lori_lori.html", title: "De Lorî Lorî" },
    { url: "le_dine.html", title: "Lê dînê" },
    { url: "buke_delale.html", title: "Bûkê Delalê" },
    { url: "buka_barane.html", title: "Bûka baranê" }
];

/* ==========================================================================
   1. NAVBAR DYNAMISCH LADEN (Fetch)
   Lädt die Datei 'navbar.html' und fügt sie in den Platzhalter (#navbar-placeholder) ein.
   ========================================================================== */
document.addEventListener("DOMContentLoaded", () => {
    // 1. Navbar laden
    fetch("navbar.html")
        .then(response => {
            if (!response.ok) throw new Error("Navbar konnte nicht geladen werden.");
            return response.text();
        })
        .then(data => {
            const placeholder = document.getElementById("navbar-placeholder");
            if (placeholder) {
                placeholder.innerHTML = data;

                // Hier initialisieren, sobald die Navbar im DOM ist:
                if (typeof window.initThemeToggle === "function") {
                    window.initThemeToggle();
                }

                if (typeof window.initLanguageDropdown === "function") {
                    window.initLanguageDropdown();
                }
                if (typeof initMenuInteractions === "function") {
                    initMenuInteractions();
                }

                if (typeof print_button === "function") {
                    print_button();
                }

            }
        })
        .catch(error => console.error("Fehler beim Laden der Navbar:", error));

    // 2. Inhaltsverzeichnis mit Links befüllen
    renderTocList();
});

// Erzeugt die <li><a href="...">...</a></li> Einträge
function renderTocList() {
    const tocList = document.getElementById("table-of-contents");
    if (!tocList) return;

    tocList.innerHTML = "";
    const aktuelleSeite = window.location.pathname.split("/").pop() || "index.html";

    SEITEN_LISTE.forEach(seite => {
        const li = document.createElement("li");
        const a = document.createElement("a");
        a.href = seite.url;
        a.textContent = seite.title;

        // Aktuelle Seite optisch markieren
        if (seite.url === aktuelleSeite) {
            a.classList.add("aktive-seite");
        }

        li.appendChild(a);
        tocList.appendChild(li);
    });
}

// Menü öffnen, schließen, Hover & Click-Events
function initMenuInteractions() {
    const trigger = document.getElementById("inhaltverzeichnis_ein");
    const toc = document.getElementById("toc-container");
    let closeTimeout;

    if (!trigger || !toc) return;

    function showMenu() {
        clearTimeout(closeTimeout);
        toc.style.display = "block";
    }

    function hideMenu() {
        closeTimeout = setTimeout(() => {
            toc.style.display = "none";
        }, 250);
    }

    // Desktop: Hover
    if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
        trigger.addEventListener("mouseenter", showMenu);
        trigger.addEventListener("mouseleave", hideMenu);
        toc.addEventListener("mouseenter", showMenu);
        toc.addEventListener("mouseleave", hideMenu);
    }

    // Mobile / Klick: Umschalten
    trigger.addEventListener("click", (e) => {
        e.stopPropagation();
        toc.style.display = (toc.style.display === "block") ? "none" : "block";
    });

    // Klick außerhalb schließt
    document.addEventListener("click", (e) => {
        if (!toc.contains(e.target) && e.target !== trigger) {
            toc.style.display = "none";
        }
    });

    // Klick auf Menü-Link schließt
    toc.addEventListener("click", (e) => {
        if (e.target.tagName === "A") {
            toc.style.display = "none";
        }
    });
}

// Drucken-Button Logik
function print_button() {
    const printBtn = document.getElementById("print-btn");
    if (printBtn) {
        printBtn.addEventListener("click", () => {
            window.print();
        });
    }
}


