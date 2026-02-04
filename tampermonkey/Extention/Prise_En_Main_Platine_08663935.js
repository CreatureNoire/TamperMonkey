(function() {
    'use strict';

    // Délai entre chaque clic (en millisecondes)
    const DELAI = 1500;
    const MAX_TENTATIVES = 10; // Nombre max de tentatives pour trouver un élément
    const DELAI_TENTATIVE = 500; // Délai entre chaque tentative

    // Fonction pour attendre un délai
    function attendre(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Fonction pour attendre qu'un élément soit présent dans le DOM
    async function attendreElement(selecteur, tentatives = MAX_TENTATIVES) {
        for (let i = 0; i < tentatives; i++) {
            const element = document.querySelector(selecteur);
            if (element && element.offsetParent !== null) { // Vérifie aussi que l'élément est visible
                return element;
            }
            console.log(`Tentative ${i + 1}/${tentatives} pour trouver: ${selecteur}`);
            await attendre(DELAI_TENTATIVE);
        }
        return null;
    }

    // Fonction pour trouver et cliquer sur un bouton par son texte
    async function cliquerSurBouton(texte, tentatives = MAX_TENTATIVES) {
        console.log(`🔍 Recherche du bouton: "${texte}"`);

        for (let i = 0; i < tentatives; i++) {
            // Chercher dans tous les boutons
            let elements = Array.from(document.querySelectorAll('button'));
            let element = elements.find(el => {
                const text = el.textContent.trim();
                return text.includes(texte) && el.offsetParent !== null;
            });

            // Si pas trouvé dans les boutons, chercher dans les spans clickables
            if (!element) {
                elements = Array.from(document.querySelectorAll('span'));
                element = elements.find(el => {
                    const text = el.textContent.trim();
                    return text === texte && el.offsetParent !== null;
                });
            }

            if (element) {
                console.log(`✅ Bouton trouvé: "${texte}"`);
                element.click();
                return true;
            }

            if (i < tentatives - 1) {
                console.log(`⏳ Tentative ${i + 1}/${tentatives} - Attente...`);
                await attendre(DELAI_TENTATIVE);
            }
        }

        console.error(`❌ Bouton non trouvé après ${tentatives} tentatives: "${texte}"`);
        return false;
    }

    // Fonction pour cliquer sur le bouton "Valider" avec l'ID spécifique
    async function cliquerSurValider() {
        console.log(`🔍 Recherche du bouton Valider (ID: fonctionnel_validateAndNext_form)`);

        const boutonValider = await attendreElement('#fonctionnel_validateAndNext_form');

        if (boutonValider) {
            console.log('✅ Bouton Valider trouvé');
            boutonValider.click();
            return true;
        } else {
            console.error('❌ Bouton Valider non trouvé');
            return false;
        }
    }

    // Fonction principale pour cliquer sur tous les boutons en séquence
    async function clicSequentiel() {
        console.log('=== Début de la séquence de clics ===');

        // 1. Prise en main
        await cliquerSurBouton('Prise en main');
        await attendre(DELAI);

        // 2. Saisir l'intervention
        await cliquerSurBouton("Saisir l'intervention");
        await attendre(DELAI);

        // 3. Valider (bouton avec ID)
        await cliquerSurValider();
        await attendre(DELAI);

        // 4. SAISIE DU REX
        await cliquerSurBouton('SAISIE DU REX');

        console.log('=== Séquence terminée ===');
    }

    // Vérifier si le bouton "Prise en main" est présent
    function verifierBoutonPriseEnMain() {
        const elements = Array.from(document.querySelectorAll('button, span'));
        const boutonPriseEnMain = elements.find(el => {
            const text = el.textContent.trim();
            return text.includes('Prise en main') && el.offsetParent !== null;
        });
        return boutonPriseEnMain !== undefined;
    }

    // Ajouter un bouton pour déclencher la séquence manuellement
    function ajouterBoutonDeclencheur() {
        // Vérifier si le bouton "Prise en main" est présent
        if (!verifierBoutonPriseEnMain()) {
            console.log('❌ Bouton "Prise en main" non trouvé, le bouton Clic Auto ne sera pas ajouté');
            return;
        }

        // Vérifier si le bouton existe déjà
        if (document.getElementById('btnClicAuto')) {
            console.log('Le bouton Clic Auto existe déjà');
            return;
        }

        // Trouver la zone "Actions disponibles"
        const panelHeadings = Array.from(document.querySelectorAll('.panel-heading'));
        const actionsPanel = panelHeadings.find(panel => {
            const title = panel.querySelector('.panel-title');
            return title && title.textContent.includes('Actions disponibles');
        });

        if (!actionsPanel) {
            console.log('❌ Zone "Actions disponibles" non trouvée');
            return;
        }

        // S'assurer que le panel a le bon style flex
        actionsPanel.style.display = 'flex';
        actionsPanel.style.justifyContent = 'space-between';
        actionsPanel.style.alignItems = 'center';

        // Créer le bouton avec le style Frutiger
        const bouton = document.createElement('button');
        bouton.id = 'btnClicAuto';
        bouton.type = 'button';
        bouton.className = 'frutiger-button';
        bouton.style.cssText = `
            cursor: pointer;
            position: absolute;
            left: 50%;
            transform: translateX(-50%);
            padding: 1px;
            border-radius: 4px;
            border: 0;
            text-shadow: 1px 1px #000a;
            background: linear-gradient(#006caa, #00c3ff);
            box-shadow: 0px 2px 4px 0px #0008;
            transition: 0.3s all;
        `;

        // Créer la structure interne du bouton
        const innerDiv = document.createElement('div');
        innerDiv.className = 'inner';
        innerDiv.style.cssText = `
            position: relative;
            inset: 0px;
            padding: 0.5em 1.2em;
            border-radius: 3px;
            background: radial-gradient(circle at 50% 100%, #30f8f8 10%, #30f8f800 55%), linear-gradient(#00526a, #009dcd);
            overflow: hidden;
            transition: inherit;
            font-size: 15px;
        `;

        // Animation shine
        const shineDiv = document.createElement('div');
        shineDiv.style.cssText = `
            content: "";
            position: absolute;
            inset: 0;
            background: linear-gradient(-65deg, #0000 40%, #fff7 50%, #0000 70%);
            background-size: 200% 100%;
            background-repeat: no-repeat;
            animation: shine 3s ease infinite;
            pointer-events: none;
        `;

        // Ajouter l'animation keyframes si elle n'existe pas
        if (!document.querySelector('#shineAnimation')) {
            const style = document.createElement('style');
            style.id = 'shineAnimation';
            style.textContent = `
                @keyframes shine {
                    0% {
                        background-position: 130%;
                        opacity: 1;
                    }
                    to {
                        background-position: -166%;
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }

        // Top white gradient
        const topWhiteDiv = document.createElement('div');
        topWhiteDiv.className = 'top-white';
        topWhiteDiv.style.cssText = `
            position: absolute;
            border-radius: inherit;
            inset: 0 -8em;
            background: radial-gradient(circle at 50% -270%, #fff 45%, #fff6 60%, #fff0 60%);
            transition: inherit;
            pointer-events: none;
        `;

        // Texte du bouton
        const textSpan = document.createElement('span');
        textSpan.className = 'text';
        textSpan.style.cssText = `
            position: relative;
            z-index: 1;
            color: white;
            font-weight: 550;
            transition: inherit;
            display: flex;
            align-items: center;
            gap: 3px;
            font-size: 15px;
            line-height: 1;
        `;
        textSpan.textContent = 'Prise en main';

        // Assembler les éléments
        innerDiv.appendChild(shineDiv);
        innerDiv.appendChild(topWhiteDiv);
        innerDiv.appendChild(textSpan);
        bouton.appendChild(innerDiv);

        // Ajouter les événements
        bouton.addEventListener('mouseenter', function() {
            this.style.boxShadow = '0px 4px 8px 0px #0009';
        });

        bouton.addEventListener('mouseleave', function() {
            this.style.boxShadow = '0px 2px 4px 0px #0008';
        });

        bouton.addEventListener('mousedown', function() {
            this.style.boxShadow = '0px 0px 0px 0px #0000';
        });

        bouton.addEventListener('mouseup', function() {
            this.style.boxShadow = '0px 2px 4px 0px #0008';
        });

        bouton.addEventListener('click', function() {
            this.disabled = true;
            textSpan.textContent = '⏳ En cours...';
            clicSequentiel().then(() => {
                this.disabled = false;
                textSpan.textContent = 'Prise en main';
            });
        });

        // Insérer le bouton directement dans le panel (pas après le titre)
        actionsPanel.appendChild(bouton);

        console.log('✅ Bouton Clic Auto ajouté dans "Actions disponibles"');
    }

    // Observer les changements DOM pour détecter le chargement dynamique du bouton "Prise en main"
    const observer = new MutationObserver(function(mutations) {
        ajouterBoutonDeclencheur();
    });

    // Attendre que la page soit complètement chargée
    window.addEventListener('load', function() {
        console.log('Script Clic Auto chargé');
        setTimeout(ajouterBoutonDeclencheur, 1000);
        // Observer les changements pour les chargements AJAX
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    });

    // Alternative: démarrer automatiquement après chargement (décommenter si souhaité)
    // window.addEventListener('load', function() {
    //     setTimeout(clicSequentiel, 2000); // Attendre 2 secondes après le chargement
    // });

})();
