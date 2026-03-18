(function() {
    'use strict';

// Fonction pour vérifier si le symbole de la pièce est 08663935
function checkSymboleNoria() {
    console.log('🔍 Vérification du symbole de la pièce...');

    // Chercher dans le panel-heading > col-xs-7 text-center panel-title > row
    const panelTitle = document.querySelector('.panel-heading .col-xs-7.text-center.panel-title .row');

    if (panelTitle) {
        const symbolText = panelTitle.textContent.trim();
        console.log('Texte trouvé dans panel-title:', symbolText);

        // Vérifier si le texte contient "08663935"
        if (symbolText.includes('08663935')) {
            console.log('✅ Symbole 08663935 détecté - PLATINE NORIA V2');
            return true;
        } else {
            console.log('❌ Symbole différent détecté:', symbolText);
            return false;
        }
    } else {
        console.log('❌ Panel-title non trouvé');
        return false;
    }
}

// Fonction pour ajouter le bouton personnalisé
function addCustomButton() {
    console.log('Tentative d\'ajout du bouton...');

    // VÉRIFICATION PRÉALABLE : Vérifier si c'est bien une PLATINE NORIA V2
    if (!checkSymboleNoria()) {
        console.log('⚠️ Ce n\'est pas une PLATINE NORIA V2 (08663935) - Bouton non ajouté');
        return;
    }

    console.log('✅ PLATINE NORIA V2 confirmée - Poursuite de l\'ajout du bouton');

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
    if (actionsPanel.querySelector('.btn-noria')) {
        console.log('Boutons déjà présents dans Actions disponibles');
        return;
    }

    console.log('✅ Zone "Actions disponibles" trouvée - Ajout du bouton...');

    // Injecter le CSS pour le style du bouton (style Frutiger)
    if (!document.getElementById('noria-button-styles')) {
        const style = document.createElement('style');
        style.id = 'noria-button-styles';
        style.textContent = `
            /* From Uiverse.io by SelfMadeSystem */
            .btn-noria {
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

            .btn-noria:hover {
                box-shadow: 0px 5px 10px 0px #0009;
            }

            .btn-noria:active {
                box-shadow: 0px 0px 0px 0px #0000;
            }

            .btn-noria .inner {
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

            .btn-noria .inner::before {
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

            .btn-noria .top-white {
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

            .btn-noria .inner::after {
                content: "";
                position: absolute;
                inset: 0;
                border-radius: inherit;
                transition: inherit;
                box-shadow: inset 0px 2px 8px -2px #0000;
            }

            .btn-noria:active .inner::after {
                box-shadow: inset 0px 2px 8px -2px #000a;
            }

            .btn-noria .text {
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

    // Créer le premier bouton "Noria V2"
    const customButton = document.createElement('button');
    customButton.type = 'button';
    customButton.className = 'btn-noria';
    customButton.style.marginRight = '10px'; // Espacement entre les boutons
    customButton.innerHTML = `
        <div class="inner">
            <div class="top-white"></div>
            <span class="text">Noria V2</span>
        </div>
    `;

    // Ajouter l'événement click
    customButton.addEventListener('click', function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        console.log('🛡️ Bouton Noria V2 cliqué');

        initializeDate(false); // false = pas de U21

        return false;
    });

    // Créer le deuxième bouton "Noria + U21"
    const customButtonU21 = document.createElement('button');
    customButtonU21.type = 'button';
    customButtonU21.className = 'btn-noria';
    customButtonU21.innerHTML = `
        <div class="inner">
            <div class="top-white"></div>
            <span class="text">Noria + U21</span>
        </div>
    `;

    // Ajouter l'événement click pour U21
    customButtonU21.addEventListener('click', function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        console.log('🛡️ Bouton Noria + U21 cliqué');

        initializeDate(true); // true = avec U21

        return false;
    });

    // S'assurer que le panel a position: relative pour le positionnement absolu
    if (actionsPanel.style.position !== 'relative') {
        actionsPanel.style.position = 'relative';
    }

    // Créer un conteneur pour les deux boutons
    const buttonContainer = document.createElement('div');
    buttonContainer.style.position = 'absolute';
    buttonContainer.style.left = '50%';
    buttonContainer.style.top = '50%';
    buttonContainer.style.transform = 'translate(-50%, -50%)';
    buttonContainer.style.display = 'flex';
    buttonContainer.style.gap = '10px';

    // Ajouter les boutons au conteneur
    buttonContainer.appendChild(customButton);
    buttonContainer.appendChild(customButtonU21);

    // Ajouter le conteneur au panel
    actionsPanel.appendChild(buttonContainer);
    console.log('✅ Boutons Noria ajoutés avec succès au centre de Actions disponibles !');
}

// Fonction à exécuter lors du clic sur le bouton
function initializeDate(withU21) {
    console.log('🟦 === DÉBUT INITIALISATION DATE ===');
    console.log('Mode U21:', withU21 ? 'OUI' : 'NON');

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

        // Définir le texte
        const today = new Date();
        const formattedDate = today.toLocaleDateString('fr-FR'); // Format DD/MM/YYYY
        const infoAgentText = withU21
            ? `JH -- ${formattedDate} -- Envoi en SST pour faire Noria V2 + Retrait du support U21 à faire.`
            : `JH -- ${formattedDate} -- Envoi en SST pour faire Noria V2`;

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

            // VALIDATION AUTOMATIQUE après remplissage
            console.log('🔄 Démarrage de la validation automatique...');
            setTimeout(function() {
                validateForm();
            }, 500); // Délai de 500ms pour laisser le temps au champ d'être traité

        } else {
            console.log('❌ Champ S_info_agent non trouvé');
            // Fallback : afficher dans la console
            console.log('📋 TEXTE À COPIER-COLLER :');
            console.log(infoAgentText);
        }
    }, 1500); // Attendre 1.5 secondes que la modal se charge

    console.log('🟦 === FIN INITIALISATION DATE ===');
}

// Fonction de validation automatique
function validateForm() {
    console.log('🔍 === DÉBUT VALIDATION AUTOMATIQUE ===');

    // Chercher le bouton OK/Valider dans la modal
    const modal = document.getElementById('d_date_fab').closest('.modal');
    if (!modal) {
        console.log('❌ Modal non trouvée pour validation');
        return;
    }

    const okButton = modal.querySelector('[data-bb-handler="ok"]') ||
                    modal.querySelector('.btn-success') ||
                    modal.querySelector('button[type="submit"]');

    if (okButton) {
        console.log('✅ Bouton de validation trouvé:', okButton.textContent.trim());
        console.log('🚀 Clic automatique sur le bouton de validation...');

        // Cliquer sur le bouton de validation
        okButton.click();

        console.log('✅ Validation automatique déclenchée !');
    } else {
        console.log('❌ Bouton de validation non trouvé');
        console.log('Boutons disponibles dans la modal:',
                   Array.from(modal.querySelectorAll('button')).map(b => b.textContent.trim()));
    }

    console.log('🔍 === FIN VALIDATION AUTOMATIQUE ===');
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

    if (actionsPanel && !actionsPanel.querySelector('.btn-noria')) {
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
