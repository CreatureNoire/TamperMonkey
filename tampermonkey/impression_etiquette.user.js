// ==UserScript==
// @name        🖨️ Imprimer Étiquette
// @namespace    https://sncf.fr/
// @version      3.0
// @description  Ajoute un bouton d'impression + confirmation après clic "Renvoi vers magasinier"
// @match        https://prod.cloud-collectorplus.mt.sncf.fr/Prm/Reparation/*.html
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    const match = window.location.href.match(/\/Reparation\/(\d+)\.html/);
    if (!match) return;
    const idReparation = match[1];
    const urlImpression = `https://prod.cloud-collectorplus.mt.sncf.fr/Commun/ConsulterRepV2/imprime?idReparation=${idReparation}`;

    // --------------------------
    // Fonction d'impression
    // --------------------------
    function imprimerEtiquette() {
        const iframe = document.createElement("iframe");
        iframe.style.display = "none";
        iframe.src = urlImpression;
        document.body.appendChild(iframe);

        iframe.onload = async () => {
            try {
                await delay(1000);
                const doc = iframe.contentDocument || iframe.contentWindow.document;
                const bouton = doc.getElementById("btnPrintEtiquette");

                if (bouton) {
                    bouton.click();
                    alert("✅ Étiquette imprimée avec succès !");
                } else {
                    alert("❌ Bouton 'Imprimer étiquette' introuvable.");
                }
            } catch (e) {
                console.error(e);
                alert("❌ Une erreur est survenue pendant l'impression.");
            }
        };
    }

    // --------------------------
    // Injection du bouton manuel 🖨️
    // --------------------------
    function createManualPrintButton() {
        if (document.getElementById("btnImprimerEtiquetteManuel")) return;

        const titleEl = Array.from(document.querySelectorAll("h3.panel-title"))
            .find(el => el.textContent.trim() === "Actions disponibles");
        if (!titleEl) return;

        const container = titleEl.closest(".panel-heading");
        if (!container) return;

        container.style.display = "flex";
        container.style.justifyContent = "space-between";
        container.style.alignItems = "center";

        const btn = document.createElement("button");
        btn.id = "btnImprimerEtiquetteManuel";
        btn.className = "btn btn-primary";
        btn.textContent = "🖨️";
        btn.title = "Imprimer étiquette";
        btn.style.padding = "4px 12px";
        btn.style.borderRadius = "5px";

        btn.onclick = imprimerEtiquette;

        container.appendChild(btn);
    }

    // --------------------------
    // Intercepter bouton "Renvoi vers magasinier"
    // --------------------------
    function intercepterBoutonRenvoi() {
        const boutonRenvoi = document.querySelector('button[collector-trans-id="286"]');

        if (!boutonRenvoi || boutonRenvoi.dataset.listener === "true") return;

        boutonRenvoi.dataset.listener = "true"; // éviter double écoute

        boutonRenvoi.addEventListener("click", function () {
            setTimeout(() => {
                const confirmer = confirm("Souhaitez-vous imprimer l'étiquette ?");
                if (confirmer) {
                    imprimerEtiquette();
                }
            }, 100); // petit délai pour laisser l'action native se faire
        });
    }

    // --------------------------
    // Observer les changements du DOM
    // --------------------------
    const observer = new MutationObserver(() => {
        createManualPrintButton();
        intercepterBoutonRenvoi();
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // Init au chargement
    createManualPrintButton();
    intercepterBoutonRenvoi();
})();
