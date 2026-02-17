(function() {
    'use strict';

// Fonction pour vérifier si on est sur le bon symbole
function isCorrectSymbol() {
    // Chercher le symbole dans la page (à adapter selon la structure HTML)
    const symboleElement = document.querySelector('[id*="symbole"], [class*="symbole"]');
    if (symboleElement && symboleElement.textContent.includes('08662590')) {
        return true;
    }
    
    // Vérifier aussi dans l'URL ou d'autres éléments
    if (window.location.href.includes('08662590')) {
        return true;
    }
    
    // Chercher dans tous les éléments texte visibles
    const pageText = document.body.innerText;
    if (pageText.includes('08662590')) {
        return true;
    }
    
    return false;
}

// Fonction pour ajouter le bouton personnalisé
function addCustomButton() {
    console.log('Tentative d\'ajout du bouton Problème initialisation SST...');

    // Vérifier si on est sur le bon symbole
    if (!isCorrectSymbol()) {
        console.log('❌ Symbole 08662590 non détecté - bouton non ajouté');
        return;
    }

    console.log('✅ Symbole 08662590 détecté');

    // Chercher la zone "Actions disponibles"
    const panelHeadings = document.querySelectorAll('.panel-heading');
    let actionsPanel = null;

    panelHeadings.forEach(panel => {
        const title = panel.querySelector('.panel-title');
        if (title && title.textContent.trim() === 'Actions disponibles') {
            actionsPanel = panel;
        }
    });

    if (!actionsPanel) {
        console.log('❌ Zone "Actions disponibles" non trouvée');
        return;
    }

    // Vérifier si le bouton existe déjà
    if (actionsPanel.querySelector('.btn-sst-init')) {
        console.log('Bouton déjà présent dans Actions disponibles');
        return;
    }

    console.log('✅ Zone "Actions disponibles" trouvée - Ajout du bouton...');

    // Injecter le CSS pour le style du bouton (style Frutiger)
    if (!document.getElementById('sst-init-button-styles')) {
        const style = document.createElement('style');
        style.id = 'sst-init-button-styles';
        style.textContent = `
            /* From Uiverse.io by SelfMadeSystem */
            .btn-sst-init {
                cursor: pointer;
                position: relative;
                padding: 1px;
                border-radius: 4px;
                border: 0;
                text-shadow: 1px 1px #000a;
                background: linear-gradient(#006caa, #00c3ff);
                box-shadow: 0px 3px 5px 0px #0008;
                transition: 0.3s all;
                font-size: 12px;
                display: inline-flex;
                align-items: center;
                gap: 5px;
                height: 28px;
            }

            .btn-sst-init:hover {
                box-shadow: 0px 5px 10px 0px #0009;
            }

            .btn-sst-init:active {
                box-shadow: 0px 0px 0px 0px #0000;
            }

            .btn-sst-init .inner {
                position: relative;
                inset: 0px;
                padding: 0.3em 0.6em;
                border-radius: 3px;
                background: radial-gradient(circle at 50% 100%, #30f8f8 10%, #30f8f800 55%),
                    linear-gradient(#00526a, #009dcd);
                overflow: hidden;
                transition: inherit;
                height: 100%;
                display: flex;
                align-items: center;
            }

            .btn-sst-init .inner::before {
                content: "";
                position: absolute;
                inset: 0;
                background: linear-gradient(-65deg, #0000 40%, #fff7 50%, #0000 70%);
                background-size: 200% 100%;
                background-repeat: no-repeat;
                animation: thing 3s ease infinite;
            }

            @keyframes thing {
                0% {
                    background-position: 130%;
                    opacity: 1;
                }

                to {
                    background-position: -166%;
                    opacity: 0;
                }
            }

            .btn-sst-init .top-white {
                position: absolute;
                border-radius: inherit;
                inset: 0 -8em;
                background: radial-gradient(
                    circle at 50% -270%,
                    #fff 45%,
                    #fff6 60%,
                    #fff0 60%
                );
                transition: inherit;
            }

            .btn-sst-init .inner::after {
                content: "";
                position: absolute;
                inset: 0;
                border-radius: inherit;
                transition: inherit;
                box-shadow: inset 0px 2px 8px -2px #0000;
            }

            .btn-sst-init:active .inner::after {
                box-shadow: inset 0px 2px 8px -2px #000a;
            }

            .btn-sst-init .text {
                position: relative;
                z-index: 1;
                color: white;
                font-weight: 550;
                transition: inherit;
                font-size: 11px;
                white-space: nowrap;
            }
        `;
        document.head.appendChild(style);
    }

    // Créer le bouton "Problème initialisation SST"
    const customButton = document.createElement('button');
    customButton.type = 'button';
    customButton.className = 'btn-sst-init';
    customButton.innerHTML = `
        <div class="inner">
            <div class="top-white"></div>
            <span class="text">Problème initialisation SST</span>
        </div>
    `;

    // Ajouter l'événement click
    customButton.addEventListener('click', function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        console.log('🛡️ Bouton Problème initialisation SST cliqué');

        initializeDate();

        return false;
    });

    // S'assurer que le panel a position: relative pour le positionnement absolu
    if (actionsPanel.style.position !== 'relative') {
        actionsPanel.style.position = 'relative';
    }

    // Créer un conteneur pour le bouton
    const buttonContainer = document.createElement('div');
    buttonContainer.style.position = 'absolute';
    buttonContainer.style.left = '50%';
    buttonContainer.style.top = '50%';
    buttonContainer.style.transform = 'translate(-50%, -50%)';
    buttonContainer.style.display = 'flex';

    // Ajouter le bouton au conteneur
    buttonContainer.appendChild(customButton);

    // Ajouter le conteneur au panel
    actionsPanel.appendChild(buttonContainer);
    console.log('✅ Bouton Problème initialisation SST ajouté avec succès au centre de Actions disponibles !');
}

// Fonction à exécuter lors du clic sur le bouton
function initializeDate() {
    console.log('🟦 === DÉBUT INITIALISATION DATE ===');

    // Étape 1 : Cliquer sur le bouton "Modifier la réparation"
    const editButton = document.getElementById('editionReparation');
    
    if (!editButton) {
        console.log('❌ Bouton "Modifier la réparation" non trouvé');
        return;
    }

    console.log('✅ Bouton "Modifier la réparation" trouvé, clic...');
    editButton.click();

    // Étape 2 : Attendre que la modal se charge et remplir le champ
    setTimeout(function() {
        console.log('🔍 Recherche du champ Info Agent dans la modal...');

        // Définir le texte avec la date du jour
        const today = new Date();
        const formattedDate = today.toLocaleDateString('fr-FR'); // Format DD/MM/YYYY
        const infoAgentText = `JH -- ${formattedDate} -- \nProblème initialisation --> Envoi en SST`;

        // Chercher le champ Info Agent (S_info_agent)
        const infoAgentField = document.getElementById('S_info_agent');

        if (infoAgentField) {
            // Remplir le champ
            infoAgentField.value = infoAgentText;

            // Déclencher les événements nécessaires pour que le champ soit reconnu comme modifié
            infoAgentField.dispatchEvent(new Event('input', { bubbles: true }));
            infoAgentField.dispatchEvent(new Event('change', { bubbles: true }));

            console.log('✅ Champ Info Agent rempli avec:', infoAgentText);
            console.log('✅ Événements input/change déclenchés');

            // Optionnel : mettre le focus sur le champ
            infoAgentField.focus();

            // Étape 3 : Cliquer sur le bouton Valider après un court délai
            setTimeout(function() {
                console.log('🔍 Recherche du bouton Valider...');
                
                // Chercher le bouton Valider avec la classe btn-success et le data-bb-handler="ok"
                const validateButton = document.querySelector('button[data-bb-handler="ok"].btn-success');
                
                if (validateButton) {
                    console.log('✅ Bouton Valider trouvé, clic...');
                    validateButton.click();
                    console.log('✅ Validation effectuée !');
                } else {
                    console.log('❌ Bouton Valider non trouvé');
                }
            }, 500); // Attendre 500ms après le remplissage du champ

        } else {
            console.log('❌ Champ S_info_agent non trouvé');
            // Fallback : afficher dans la console
            console.log('📋 TEXTE À COPIER-COLLER :');
            console.log(infoAgentText);
        }
    }, 1500); // Attendre 1.5 secondes que la modal se charge

    console.log('🟦 === FIN INITIALISATION DATE ===');
}

// Attendre que la page soit chargée et vérifier périodiquement si on doit ajouter le bouton
function checkAndAddButton() {
    const panelHeadings = document.querySelectorAll('.panel-heading');
    let actionsPanel = null;

    panelHeadings.forEach(panel => {
        const title = panel.querySelector('.panel-title');
        if (title && title.textContent.trim() === 'Actions disponibles') {
            actionsPanel = panel;
        }
    });

    if (actionsPanel && !actionsPanel.querySelector('.btn-sst-init')) {
        addCustomButton();
    }
}

// Observer pour détecter les changements dans le DOM
const observer = new MutationObserver(function(mutations) {
    checkAndAddButton();
});

// Démarrer l'observation
observer.observe(document.body, {
    childList: true,
    subtree: true
});

// Vérifier immédiatement au chargement
setTimeout(checkAndAddButton, 1000);

// Vérifier périodiquement (fallback)
setInterval(checkAndAddButton, 3000);

})();
