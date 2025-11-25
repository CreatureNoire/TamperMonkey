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

    // Vérifier si on a le champ de date
    const dateFabField = document.getElementById('d_date_fab');
    console.log('Champ d_date_fab trouvé:', !!dateFabField);

    if (!dateFabField) {
        console.log('Pas de champ date, on arrête');
        return;
    }

    // Trouver la modal qui CONTIENT le champ d_date_fab
    const modalWithDateField = dateFabField.closest('.modal');
    if (!modalWithDateField) {
        console.log('Impossible de trouver la modal contenant le champ d_date_fab');
        return;
    }

    // Chercher le modal footer de CETTE modal spécifique
    const targetModalFooter = modalWithDateField.querySelector('.modal-footer');

    console.log('Modal contenant d_date_fab trouvée');
    console.log('Footer de cette modal trouvé:', !!targetModalFooter);

    if (!targetModalFooter) {
        console.log('Pas de footer dans la modal avec d_date_fab');
        return;
    }

    // Vérifier si le bouton existe déjà dans CETTE modal spécifique
    if (targetModalFooter.querySelector('.btn-noria')) {
        console.log('Bouton déjà présent dans la modal de réparation');
        return;
    }

    // Analyser les boutons de cette modal
    const allButtons = targetModalFooter.querySelectorAll('button');
    console.log('Boutons dans la modal de réparation:', allButtons.length);
    console.log('HTML du footer de réparation:', targetModalFooter.innerHTML);

    // Chercher les boutons par data-bb-handler (comme dans votre HTML original)
    const cancelButton = targetModalFooter.querySelector('[data-bb-handler="cancel"]');
    const okButton = targetModalFooter.querySelector('[data-bb-handler="ok"]');

    console.log('Boutons data-bb-handler trouvés:');
    console.log('- Cancel:', !!cancelButton);
    console.log('- OK:', !!okButton);

    if (cancelButton || allButtons.length > 0) {
        console.log('Ajout du bouton dans LA BONNE modal de réparation...');

        // Injecter le CSS pour le style du bouton (style Frutiger)
        if (!document.getElementById('noria-button-styles')) {
            const style = document.createElement('style');
            style.id = 'noria-button-styles';
            style.textContent = `
                /* From Uiverse.io by SelfMadeSystem */
                .btn-noria {
                    cursor: pointer;
                    position: relative;
                    padding: 2px;
                    border-radius: 6px;
                    border: 0;
                    text-shadow: 1px 1px #000a;
                    background: linear-gradient(#006caa, #00c3ff);
                    box-shadow: 0px 4px 6px 0px #0008;
                    transition: 0.3s all;
                    margin: 0 5px;
                    font-size: 14px;
                    display: inline-flex;
                    align-items: center;
                    gap: 5px;
                }

                .btn-noria:hover {
                    box-shadow: 0px 6px 12px 0px #0009;
                }

                .btn-noria:active {
                    box-shadow: 0px 0px 0px 0px #0000;
                }

                .btn-noria .inner {
                    position: relative;
                    inset: 0px;
                    padding: 0.4em;
                    border-radius: 4px;
                    background: radial-gradient(circle at 50% 100%, #30f8f8 10%, #30f8f800 55%),
                        linear-gradient(#00526a, #009dcd);
                    overflow: hidden;
                    transition: inherit;
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
                }
            `;
            document.head.appendChild(style);
        }

        // Créer le nouveau bouton avec le style Frutiger
        const customButton = document.createElement('button');
        customButton.type = 'button';
        customButton.className = 'btn-noria';
        customButton.innerHTML = `
            <div class="inner">
                <div class="top-white"></div>
                <span class="text">Noria V2</span>
            </div>
        `;

        // Ajouter l'événement click avec protection contre la fermeture de modal
        customButton.addEventListener('click', function(event) {
            // EMPÊCHER que le clic se propage et ferme la modal !
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();

            console.log('🛡️ Événement de clic bloqué pour éviter la fermeture de modal');

            initializeDate();

            // Retourner false pour être sûr d'annuler l'événement
            return false;
        });

        // Chercher le bouton Annuler pour positionner notre bouton à gauche
        if (cancelButton) {
            // Insérer AVANT le bouton Annuler (à gauche)
            targetModalFooter.insertBefore(customButton, cancelButton);
            console.log('Bouton inséré à gauche du bouton Annuler');
        } else {
            // Fallback : ajouter au début
            targetModalFooter.insertBefore(customButton, targetModalFooter.firstChild);
            console.log('Bouton ajouté au début du footer');
        }

        console.log('Bouton Noria ajouté avec succès dans la VRAIE modal de réparation !');

    } else {
        console.log('Aucun bouton trouvé dans la modal de réparation');
    }
}

// Fonction à exécuter lors du clic sur le bouton
function initializeDate() {
    console.log('🟦 === DÉBUT INITIALISATION DATE ===');

    // Définir le texte
    const today = new Date();
    const formattedDate = today.toLocaleDateString('fr-FR'); // Format DD/MM/YYYY
    const infoAgentText = `JH -- ${formattedDate} -- Envoi en SST pour faire Noria V2`;

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

// Observer pour détecter l'ouverture de la modal
const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
        mutation.addedNodes.forEach(function(node) {
            if (node.nodeType === 1 && node.querySelector && node.querySelector('.modal-content')) {
                // Modal détectée, ajouter le bouton avec un délai pour s'assurer que tout est chargé
                setTimeout(addCustomButton, 100);
            }
        });
    });
});

// Démarrer l'observation
observer.observe(document.body, {
    childList: true,
    subtree: true
});

// Intercepter les requêtes AJAX pour détecter l'appel editReparation et validationEditReparation
const originalXhrOpen = XMLHttpRequest.prototype.open;
const originalFetch = window.fetch;

// Intercepter XMLHttpRequest
XMLHttpRequest.prototype.open = function(method, url, ...rest) {
    if (url && url.includes('/Prm/Reparation/editReparation')) {
        console.log('Requête editReparation détectée:', url);
        this.addEventListener('load', function() {
            if (this.status === 200) {
                console.log('Réponse editReparation reçue, attente de la modal...');
                // Attendre que la modal se charge complètement
                setTimeout(addCustomButton, 1000);
            }
        });
    }

    if (url && url.includes('/Prm/Reparation/validationEditReparation')) {
        console.log('Requête validationEditReparation détectée:', url);
        this.addEventListener('load', function() {
            if (this.status === 200) {
                console.log('Réponse validationEditReparation reçue - validation réussie !');
            }
        });
    }

    return originalXhrOpen.call(this, method, url, ...rest);
};

// Intercepter fetch (au cas où)
window.fetch = function(input, init) {
    const url = typeof input === 'string' ? input : input.url;

    if (url && url.includes('/Prm/Reparation/editReparation')) {
        console.log('Fetch editReparation détecté:', url);
        return originalFetch.call(this, input, init).then(response => {
            if (response.ok) {
                console.log('Réponse fetch editReparation reçue, attente de la modal...');
                setTimeout(addCustomButton, 1000);
            }
            return response;
        });
    }

    if (url && url.includes('/Prm/Reparation/validationEditReparation')) {
        console.log('Fetch validationEditReparation détecté:', url);
        return originalFetch.call(this, input, init).then(response => {
            if (response.ok) {
                console.log('Réponse fetch validationEditReparation reçue - validation réussie !');
            }
            return response;
        });
    }

    return originalFetch.call(this, input, init);
};

// Ajouter un listener pour détecter les clics sur "Modifier la réparation"
document.addEventListener('click', function(event) {
    if (event.target && event.target.id === 'editionReparation') {
        console.log('Clic détecté sur "Modifier la réparation"');
        // Attendre que la modal se charge
        setTimeout(function() {
            addCustomButton();
        }, 1500);
    }
});

// Vérifier périodiquement si la modal est présente (fallback)
setInterval(function() {
    const modalFooter = document.querySelector('.modal-footer');
    const dateFabField = document.getElementById('d_date_fab');
    const existingButton = modalFooter ? modalFooter.querySelector('.btn-noria') : null;

    if (modalFooter && dateFabField && !existingButton) {
        addCustomButton();
    }
}, 2000);

})();
