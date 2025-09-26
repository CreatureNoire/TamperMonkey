(function () {
    'use strict';

    const cpPersoValue = (document.getElementById("idUser") || {}).value || "";

    function verifierTitrePC() {
        const span = document.querySelector('.TitrePC');
        return span && (
            span.textContent.includes("Plan de contrôle") ||
            span.textContent.includes("PLAN DE CONTROLE GENERIQUE")
            span.textContent.includes("Tiroir EMC 846")
        );
    }

    function afficherBoutons(contenant) {
        const parent = contenant.parentNode;

        // Supprimer l'ancien conteneur de boutons s'il existe
        const ancienContainer = parent.querySelector('#custom_button_container');
        if (ancienContainer) {
            ancienContainer.remove();
        }

        // Styliser le parent
        parent.style.display = 'flex';
        parent.style.justifyContent = 'space-between';
        parent.style.alignItems = 'center';
        parent.style.paddingRight = '5px';

        // Créer le conteneur de boutons
        const buttonContainer = document.createElement('div');
        buttonContainer.id = 'custom_button_container';
        buttonContainer.style.display = 'inline-flex';
        buttonContainer.style.gap = '5px';

        // Bouton "Oui"
        const btnOui = document.createElement('button');
        btnOui.innerText = 'Oui';
        btnOui.className = 'btn btn-info';
        btnOui.style.padding = '2px 10px';
        btnOui.style.borderRadius = '5px';
        btnOui.style.cursor = 'pointer';
        btnOui.onclick = () => {
            document.querySelectorAll('button[collector-value="1"]').forEach(btn => {
                if (!btn.title.toLowerCase().includes('conforme')) {
                    btn.click();
                }
            });
        };
        buttonContainer.appendChild(btnOui);

        // Bouton "Non"
        const btnNon = document.createElement('button');
        btnNon.innerText = 'Non';
        btnNon.className = 'btn btn-danger';
        btnNon.style.padding = '2px 10px';
        btnNon.style.borderRadius = '5px';
        btnNon.style.cursor = 'pointer';
        btnNon.onclick = () => {
            document.querySelectorAll('button[collector-value="0"]').forEach(btn => {
                if (!btn.title.toLowerCase().includes('conforme')) {
                    btn.click();
                }
            });
        };
        buttonContainer.appendChild(btnNon);

        // Bouton "Conforme"
        const btnConforme = document.createElement('button');
        btnConforme.innerText = 'Conforme';
        btnConforme.className = 'btn btn-primary';
        btnConforme.style.padding = '2px 10px';
        btnConforme.style.borderRadius = '5px';
        btnConforme.style.cursor = 'pointer';
        btnConforme.onclick = () => {
            document.querySelectorAll('button[title="Conforme"]').forEach(btn => btn.click());
        };
        buttonContainer.appendChild(btnConforme);

        // Bouton "Signer"
        const btnSigner = document.createElement('button');
        btnSigner.id = 'custom_sign_button';
        btnSigner.innerText = 'Signer';
        btnSigner.className = 'btn btn-warning';
        btnSigner.style.padding = '2px 10px';
        btnSigner.style.borderRadius = '5px';
        btnSigner.style.cursor = 'pointer';
        btnSigner.onclick = () => {
            document.querySelectorAll(`button[cp="${cpPersoValue}"]`).forEach(btn => btn.click());
        };
        buttonContainer.appendChild(btnSigner);

        // Bouton "Valider"
        const btnValider = document.createElement('button');
        btnValider.id = 'custom_validate_button';
        btnValider.innerText = 'Valider';
        btnValider.className = 'btn btn-success';
        btnValider.style.padding = '2px 10px';
        btnValider.style.borderRadius = '5px';
        btnValider.style.cursor = 'pointer';
        btnValider.onclick = () => {
            const validerBtn = document.getElementById('fonctionnel_validateAndNext_form') ||
                               document.getElementById('fonctionnel_validate_form');
            if (validerBtn) {
                validerBtn.click();
            } else {
                alert("Bouton 'Valider' introuvable.");
            }
        };
        buttonContainer.appendChild(btnValider);

        // Ajouter tous les boutons au DOM
        parent.appendChild(buttonContainer);
    }

    function verifierEtAjouter() {
        if (!verifierTitrePC()) return;

        const titres = document.querySelectorAll('h3.panel-title');
        for (const titre of titres) {
            if (titre.textContent.trim() === "Saisie du plan de contrôle") {
                const parent = titre.parentNode;
                const boutonPresent = parent.querySelector('#custom_sign_button');

                if (!boutonPresent) {
                    afficherBoutons(titre);
                }
                break;
            }
        }
    }

    // Vérifie toutes les 1 sec que les boutons sont présents, sinon les ajoute
    setInterval(verifierEtAjouter, 1000);
})();
