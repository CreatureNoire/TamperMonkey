// @description  Ajoute un bouton JTS plan de contrôle n°1 qui enchaîne Non -> Conforme -> Oui -> Signer -> Valider


(function () {
    'use strict';

    const cpPersoValue = (document.getElementById("idUser") || {}).value || "";

    function ajouterBoutonJTS(titrePanel) {
        const conteneur = titrePanel.parentNode;
        if (document.querySelector('#btnJTS')) return; // Évite doublons

        const bouton = document.createElement('button');
        bouton.id = 'btnJTS';
        bouton.textContent = 'JTS plan de contrôle n°1';
        bouton.className = 'btn btn-primary';
        bouton.style.marginLeft = '5px';
        bouton.style.padding = '4px 12px';
        bouton.style.borderRadius = '5px';
        bouton.style.cursor = 'pointer';

        bouton.onclick = () => {
            try {
                // 1 - Non (collector-value=0 sauf conforme)
                document.querySelectorAll('button[collector-value="0"]').forEach(btn => {
                    if (!btn.title.toLowerCase().includes('conforme')) {
                        btn.click();
                    }
                });

                // 2 - Conforme
                document.querySelectorAll('button[title="Conforme"]').forEach(b => b.click());

                // 3 - Oui (collector-value=1 sauf conforme)
                document.querySelectorAll('button[collector-value="1"]').forEach(btn => {
                    if (!btn.title.toLowerCase().includes('conforme')) {
                        btn.click();
                    }
                });

                // 4 - Signer
                document.querySelectorAll(`button[cp="${cpPersoValue}"]`).forEach(b => b.click());

                // 5 - Valider
                const boutonValider = document.getElementById('fonctionnel_validateAndNext_form') ||
                                      document.getElementById('fonctionnel_validate_form');
                if (boutonValider) boutonValider.click();
                else alert("⚠️ Bouton de validation introuvable.");
            } catch (e) {
                alert("❌ Erreur : " + e.message);
                console.error(e);
            }
        };

        // On ajoute le bouton sans supprimer ton ancien conteneur
        conteneur.appendChild(bouton);
    }

    function detecterEtAjouter() {
        const titrePC = document.querySelector('.TitrePC');
        if (!titrePC) return;

        if (titrePC.textContent.includes("Plan de contrôle JTS")) {
            document.querySelectorAll('h3.panel-title').forEach(titre => {
                if (titre.textContent.trim() === "Saisie du plan de contrôle") {
                    ajouterBoutonJTS(titre);
                }
            });
        }
    }

    // Surveille les changements du DOM
    const observer = new MutationObserver(detecterEtAjouter);
    observer.observe(document.body, { childList: true, subtree: true });

    // Vérif initiale
    detecterEtAjouter();
})();
