(function () {
    'use strict';

    const powerAppsUrl = "https://apps.powerapps.com/play/e/8ce66143-5dbc-4269-9f4f-16af25fd3458/a/febd6197-b142-404c-a3e2-1530c6f57d04?tenantId=4a7c8238-5799-4b16-9fc6-9ad8fce5a7d9&hint=41bb906c-a7f6-4551-8d24-8d7e10a0c5eb&sourcetime=1739259513043";

    // Fonction d'écoute globale sur tout le document
    document.addEventListener('click', function (e) {
        const btn = e.target.closest('button.button-next_etat');
        if (!btn) return;

        const label = btn.getAttribute('collector-next-state-name') || '';
        if (label.includes("ACHAT DIRECT")) {
            // Ouvrir dans une nouvelle fenêtre
            window.open(
                powerAppsUrl,
                'PowerAppsWindow', // nom de la fenêtre (permet d’éviter d’en ouvrir 50 si clic répété)
                'width=1920,height=1080,top=100,left=100,resizable,scrollbars'
            );
        }
    });
})();
