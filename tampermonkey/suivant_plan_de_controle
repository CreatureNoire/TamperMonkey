(function () {
    'use strict';

    // Récupère le code personnel de l'utilisateur
    const cpPersoValue = (document.getElementById("idUser") || {}).value || "";

    // Vérifie que la page contient un titre indiquant un plan de contrôle
    function verifierPlanDeControle() {
        const titrePC = document.querySelector('.TitrePC');
        return titrePC && (
            titrePC.textContent.includes("Plan de contrôle") ||
            titrePC.textContent.includes("PLAN DE CONTROLE GENERIQUE")
        );
    }

    // Crée et insère le bouton unique
    function ajouterBoutonUnique(titrePanel) {
        const conteneur = titrePanel.parentNode;

        // Ne pas insérer si le bouton est déjà présent
        if (conteneur.querySelector('#btnUniquePC')) return;

        conteneur.style.display = 'flex';
        conteneur.style.justifyContent = 'space-between';
        conteneur.style.alignItems = 'center';
        conteneur.style.paddingRight = '8px';

        const bouton = document.createElement('button');
        bouton.id = 'btnUniquePC';
        bouton.textContent = 'Suivant';
        bouton.className = 'btn btn-primary';
        bouton.style.padding = '4px 12px';
        bouton.style.borderRadius = '5px';
        bouton.style.cursor = 'pointer';

        bouton.onclick = () => {
            try {
                // Étape 1 : Cliquez sur tous les boutons "Conforme"
                const boutonsConformes = document.querySelectorAll('button[title="Conforme"]');
                boutonsConformes.forEach(b => b.click());

                // Étape 2 : Signature
                const boutonSigner = document.querySelector(`button[cp="${cpPersoValue}"]`);
                if (boutonSigner) {
                    boutonSigner.click();
                } else {
                    alert("⚠️ Bouton de signature non trouvé pour votre CP.");
                    return;
                }

                // Étape 3 : Validation
                const boutonValider = document.getElementById('fonctionnel_validateAndNext_form') ||
                                      document.getElementById('fonctionnel_validate_form');
                if (boutonValider) {
                    boutonValider.click();
                } else {
                    alert("⚠️ Bouton de validation introuvable.");
                }

            } catch (e) {
                alert("❌ Une erreur est survenue : " + e.message);
                console.error(e);
            }
        };

        conteneur.appendChild(bouton);
    }

    // Recherche la section cible et insère le bouton
    function surveillerSectionPC() {
        if (!verifierPlanDeControle()) return;

        const titres = document.querySelectorAll('h3.panel-title');
        for (const titre of titres) {
            if (titre.textContent.trim() === "Saisie du plan de contrôle") {
                ajouterBoutonUnique(titre);
                break;
            }
        }
    }

    // Vérifie toutes les 1 seconde si la page contient la bonne section
    setInterval(surveillerSectionPC, 1000);
})();
