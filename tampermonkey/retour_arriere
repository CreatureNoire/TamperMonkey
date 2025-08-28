(function () {
    'use strict';

    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    function log(txt) {
        console.log(`[RETOUR ÉTAT] ${txt}`);
    }

    async function cliquerSurBoutonAvecTexte(texte) {
        const boutons = Array.from(document.querySelectorAll("button"));
        for (const bouton of boutons) {
            if (bouton.innerText.trim().includes(texte)) {
                bouton.click();
                log(`✅ Cliquez sur "${texte}"`);
                return true;
            }
        }
        log(`❌ Bouton "${texte}" introuvable`);
        return false;
    }

    async function actionRetourEnArriere() {
        const boutonRenvoi = document.querySelector('button[collector-trans-id="22758"]');
        if (!boutonRenvoi) {
            alert("❌ Bouton 'Renvoi Qualité Industrielle' non trouvé.");
            return;
        }

        boutonRenvoi.click();
        log("✅ Clique sur 'Renvoi Qualité Industrielle'");
        await delay(10001);

        const ok1 = await cliquerSurBoutonAvecTexte("Remise en production");
        if (!ok1) return;

        await delay(1000);

        const ok2 = await cliquerSurBoutonAvecTexte("Retour contrôle Qualité");
        if (!ok2) return;

        alert("✅ Séquence retour effectuée avec succès !");
    }

    function creerBouton() {
        if (document.getElementById("btnRevenirArriere")) return;

        const header = Array.from(document.querySelectorAll("h3.panel-title"))
            .find(el => el.textContent.trim() === "Actions disponibles");

        if (!header || !header.parentElement) return;

        const container = header.parentElement;

        // Style en flex pour l'affichage du bouton à droite
        container.style.display = "flex";
        container.style.justifyContent = "space-between";
        container.style.alignItems = "center";

        const bouton = document.createElement("button");
        bouton.id = "btnRevenirArriere";
        bouton.textContent = "⏪";
        bouton.className = "btn btn-warning";
        bouton.style.marginLeft = "auto";
        bouton.style.padding = "4px 12px";
        bouton.style.borderRadius = "5px";

        bouton.onclick = actionRetourEnArriere;

        container.appendChild(bouton);
    }

    // Observer le DOM car les éléments changent sans recharger la page
    const observer = new MutationObserver(() => {
        creerBouton();
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // Initialisation directe
    creerBouton();
})();
