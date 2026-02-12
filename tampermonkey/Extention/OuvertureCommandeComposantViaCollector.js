(function () {
    'use strict';

    const powerAppsUrl = "https://apps.powerapps.com/play/e/8ce66143-5dbc-4269-9f4f-16af25fd3458/a/febd6197-b142-404c-a3e2-1530c6f57d04?tenantId=4a7c8238-5799-4b16-9fc6-9ad8fce5a7d9&hint=41bb906c-a7f6-4551-8d24-8d7e10a0c5eb&sourcetime=1739259513043";

    function ouvrirModalEtRemplirChamp(composantTexte) {
        const boutonActions = document.querySelector('button.btn.btn-default.btn-xs.dropdown-toggle.pull-right[data-toggle="dropdown"]');
        if (!boutonActions) {
            console.error('Bouton Actions non trouvé');
            return false;
        }

        boutonActions.click();

        setTimeout(() => {
            const lienModifier = document.querySelector('#editionReparation');
            if (!lienModifier) {
                console.error('Lien "Modifier la réparation" non trouvé');
                return false;
            }

            lienModifier.click();

            setTimeout(() => {
                const champInfoAgent = document.querySelector('#S_info_agent');
                if (champInfoAgent) {
                    // Récupérer les initiales de l'utilisateur
                    const userSpan = document.querySelector('.user-infos .user.ellipsis');
                    let initiales = 'JH'; // Valeur par défaut
                    if (userSpan) {
                        const nomComplet = userSpan.textContent.trim().replace(/\s+/g, ' ');
                        const parties = nomComplet.split(' ');
                        if (parties.length >= 2) {
                            initiales = parties[0].charAt(0).toUpperCase() + parties[1].charAt(0).toUpperCase();
                        }
                    }

                    const maintenant = new Date();
                    const jour = String(maintenant.getDate()).padStart(2, '0');
                    const mois = String(maintenant.getMonth() + 1).padStart(2, '0');
                    const annee = maintenant.getFullYear();
                    const dateFormatee = jour + '/' + mois + '/' + annee;

                    const valeur = initiales + ' -- ' + dateFormatee + ' -- Attente composant ' + composantTexte + '';
                    champInfoAgent.value = valeur;

                    champInfoAgent.dispatchEvent(new Event('input', { bubbles: true }));
                    champInfoAgent.dispatchEvent(new Event('change', { bubbles: true }));

                    // Attendre un peu puis cliquer sur le bouton Valider
                    setTimeout(() => {
                        const boutonValider = document.querySelector('button[data-bb-handler="ok"].btn-success');
                        if (boutonValider) {
                            boutonValider.click();
                            console.log('Bouton Valider cliqué');
                        } else {
                            console.error('Bouton Valider non trouvé');
                        }
                    }, 300);
                } else {
                    console.error('Champ S_info_agent non trouvé');
                }
            }, 500);

        }, 200);

        return true;
    }

    document.addEventListener('click', function (e) {
        const btn = e.target.closest('button.button-next_etat');
        if (!btn) return;

        const label = btn.getAttribute('collector-next-state-name') || '';
        if (label.includes("ACHAT DIRECT")) {
            e.preventDefault();
            e.stopPropagation();

            const composant = prompt("Composant à commander :");

            if (composant === null || composant.trim() === '') {
                return;
            }

            ouvrirModalEtRemplirChamp(composant.trim());

            setTimeout(() => {
                window.open(
                    powerAppsUrl,
                    'PowerAppsWindow',
                    'width=1920,height=1080,top=100,left=100,resizable,scrollbars'
                );
            }, 1000);
        }
    });
})();
