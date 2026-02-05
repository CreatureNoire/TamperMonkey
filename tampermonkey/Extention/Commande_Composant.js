
(function() {
    'use strict';

    // Define your values
    let numSer = '';
    let symbole = '';
    let numOF = ''; // Remis vide pour tester le remplissage automatique
    let composant = '';

    function fillPowerAppsInput(selector, value) {
        const input = document.querySelector(selector);
        if (input) {
            // Méthode 1: Remplissage standard
            input.value = value;
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));

            // Si la valeur n'a pas été définie, essayer d'autres méthodes
            if (input.value !== value) {
                // Méthode 2: Focus + simulation de saisie
                input.focus();
                input.select();
                input.value = '';
                input.value = value;

                // Déclencher plus d'événements
                input.dispatchEvent(new Event('keydown', { bubbles: true }));
                input.dispatchEvent(new Event('keyup', { bubbles: true }));
                input.dispatchEvent(new Event('input', { bubbles: true }));
                input.dispatchEvent(new Event('change', { bubbles: true }));
                input.dispatchEvent(new Event('blur', { bubbles: true }));
            }
        }
    }

    function fillInput() {
        fillPowerAppsInput("input[appmagic-control='TextInputNewDemSerietextbox']", numSer);
        fillPowerAppsInput("input[appmagic-control='TextInputNewDemSymboletextbox']", symbole);
        fillPowerAppsInput("input[appmagic-control='TextInputNewDemOFtextbox']", numOF);
        fillPowerAppsInput("input[appmagic-control='TextInputNewDemComposanttextbox']", composant);

        // Méthodes spéciales pour tous les champs si le remplissage standard échoue
        setTimeout(() => {
            fillSerieFieldSpecial();
            fillSymboleFieldSpecial();
            fillOFFieldSpecial();
            fillComposantFieldSpecial();
        }, 1000);
    }

    // Fonction spéciale pour le champ Série
    function fillSerieFieldSpecial() {
        console.log(`[DEBUG] Vérification spéciale du champ Série...`);

        // Vérifier si on a une valeur à insérer
        if (!numSer || numSer.trim() === '') {
            console.log(`[DEBUG] ATTENTION: Variable numSer est vide: "${numSer}"`);
            return;
        }

        const serieInput = document.querySelector("input[appmagic-control='TextInputNewDemSerietextbox']");

        if (serieInput && (serieInput.value === '' || serieInput.value !== numSer)) {
            console.log(`[DEBUG] Le champ Série est vide ou incorrect, tentative de remplissage forcé...`);
            console.log(`[DEBUG] Valeur actuelle du champ Série:`, serieInput.value);
            console.log(`[DEBUG] Valeur à insérer:`, numSer);

            // Méthode aggressive
            serieInput.focus();
            serieInput.click();

            // Effacer le contenu existant
            serieInput.setSelectionRange(0, serieInput.value.length);

            // Simuler la suppression
            serieInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Delete', bubbles: true }));

            // Insérer caractère par caractère
            serieInput.value = '';
            for (let i = 0; i < numSer.length; i++) {
                serieInput.value += numSer[i];
                serieInput.dispatchEvent(new KeyboardEvent('keydown', { key: numSer[i], bubbles: true }));
                serieInput.dispatchEvent(new KeyboardEvent('keyup', { key: numSer[i], bubbles: true }));
                serieInput.dispatchEvent(new Event('input', { bubbles: true }));
            }

            // Finaliser
            serieInput.dispatchEvent(new Event('change', { bubbles: true }));
            serieInput.blur();

            console.log(`[DEBUG] Valeur finale du champ Série:`, serieInput.value);
        } else if (serieInput) {
            console.log(`[DEBUG] Le champ Série contient déjà la bonne valeur:`, serieInput.value);
        } else {
            console.log(`[DEBUG] ERREUR: Champ Série introuvable !`);
        }
    }

    // Fonction spéciale pour le champ Symbole
    function fillSymboleFieldSpecial() {
        console.log(`[DEBUG] Vérification spéciale du champ Symbole...`);

        // Vérifier si on a une valeur à insérer
        if (!symbole || symbole.trim() === '') {
            console.log(`[DEBUG] ATTENTION: Variable symbole est vide: "${symbole}"`);
            return;
        }

        const symboleInput = document.querySelector("input[appmagic-control='TextInputNewDemSymboletextbox']");

        if (symboleInput && (symboleInput.value === '' || symboleInput.value !== symbole)) {
            console.log(`[DEBUG] Le champ Symbole est vide ou incorrect, tentative de remplissage forcé...`);
            console.log(`[DEBUG] Valeur actuelle du champ Symbole:`, symboleInput.value);
            console.log(`[DEBUG] Valeur à insérer:`, symbole);

            // Méthode aggressive
            symboleInput.focus();
            symboleInput.click();

            // Effacer le contenu existant
            symboleInput.setSelectionRange(0, symboleInput.value.length);

            // Simuler la suppression
            symboleInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Delete', bubbles: true }));

            // Insérer caractère par caractère
            symboleInput.value = '';
            for (let i = 0; i < symbole.length; i++) {
                symboleInput.value += symbole[i];
                symboleInput.dispatchEvent(new KeyboardEvent('keydown', { key: symbole[i], bubbles: true }));
                symboleInput.dispatchEvent(new KeyboardEvent('keyup', { key: symbole[i], bubbles: true }));
                symboleInput.dispatchEvent(new Event('input', { bubbles: true }));
            }

            // Finaliser
            symboleInput.dispatchEvent(new Event('change', { bubbles: true }));
            symboleInput.blur();

            console.log(`[DEBUG] Valeur finale du champ Symbole:`, symboleInput.value);
        } else if (symboleInput) {
            console.log(`[DEBUG] Le champ Symbole contient déjà la bonne valeur:`, symboleInput.value);
        } else {
            console.log(`[DEBUG] ERREUR: Champ Symbole introuvable !`);
        }
    }

    // Fonction spéciale pour le champ OF
    function fillOFFieldSpecial() {
        console.log(`[DEBUG] Vérification spéciale du champ OF...`);

        // Vérifier si on a une valeur à insérer
        if (!numOF || numOF.trim() === '') {
            console.log(`[DEBUG] ATTENTION: Variable numOF est vide: "${numOF}"`);
            return;
        }

        const ofInput = document.querySelector("input[appmagic-control='TextInputNewDemOFtextbox']");

        if (ofInput && (ofInput.value === '' || ofInput.value !== numOF)) {
            console.log(`[DEBUG] Le champ OF est vide ou incorrect, tentative de remplissage forcé...`);
            console.log(`[DEBUG] Valeur actuelle du champ OF:`, ofInput.value);
            console.log(`[DEBUG] Valeur à insérer:`, numOF);

            // Méthode aggressive
            ofInput.focus();
            ofInput.click();

            // Effacer le contenu existant
            ofInput.setSelectionRange(0, ofInput.value.length);

            // Simuler la suppression
            ofInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Delete', bubbles: true }));

            // Insérer caractère par caractère
            ofInput.value = '';
            for (let i = 0; i < numOF.length; i++) {
                ofInput.value += numOF[i];
                ofInput.dispatchEvent(new KeyboardEvent('keydown', { key: numOF[i], bubbles: true }));
                ofInput.dispatchEvent(new KeyboardEvent('keyup', { key: numOF[i], bubbles: true }));
                ofInput.dispatchEvent(new Event('input', { bubbles: true }));
            }

            // Finaliser
            ofInput.dispatchEvent(new Event('change', { bubbles: true }));
            ofInput.blur();

            console.log(`[DEBUG] Valeur finale du champ OF:`, ofInput.value);
        } else if (ofInput) {
            console.log(`[DEBUG] Le champ OF contient déjà la bonne valeur:`, ofInput.value);
        } else {
            console.log(`[DEBUG] ERREUR: Champ OF introuvable !`);
        }
    }

    // Fonction spéciale pour le champ Composant
    function fillComposantFieldSpecial() {
        // Vérifier si on a une valeur à insérer
        if (!composant || composant.trim() === '') {
            return;
        }

        const composantInput = document.querySelector("input[appmagic-control='TextInputNewDemComposanttextbox']");

        if (composantInput && (composantInput.value === '' || composantInput.value !== composant)) {
            // Méthode aggressive
            composantInput.focus();
            composantInput.click();

            // Effacer le contenu existant
            composantInput.setSelectionRange(0, composantInput.value.length);

            // Simuler la suppression
            composantInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Delete', bubbles: true }));

            // Insérer caractère par caractère
            composantInput.value = '';
            for (let i = 0; i < composant.length; i++) {
                composantInput.value += composant[i];
                composantInput.dispatchEvent(new KeyboardEvent('keydown', { key: composant[i], bubbles: true }));
                composantInput.dispatchEvent(new KeyboardEvent('keyup', { key: composant[i], bubbles: true }));
                composantInput.dispatchEvent(new Event('input', { bubbles: true }));
            }

            // Finaliser
            composantInput.dispatchEvent(new Event('change', { bubbles: true }));
            composantInput.blur();
        }
    }

    // Fonction de test pour vérifier tous les champs PowerApps
    function testPowerAppsFields() {
        console.log('[DEBUG TEST] === Vérification de tous les champs PowerApps ===');
        console.log(`[DEBUG TEST] Page actuelle: ${window.location.href}`);

        const selectors = [
            "input[appmagic-control='TextInputNewDemSerietextbox']",  // Numéro série
            "input[appmagic-control='TextInputNewDemSymboletextbox']",  // Symbole
            "input[appmagic-control='TextInputNewDemOFtextbox']", // Numéro OF
            "input[appmagic-control='TextInputNewDemComposanttextbox']"   // Info Agent
        ];

        const names = ['Numéro série', 'Symbole', 'Numéro OF', 'Composant'];
        const values = [numSer, symbole, numOF, composant];

        selectors.forEach((selector, index) => {
            const input = document.querySelector(selector);
            if (input) {
                console.log(`[DEBUG TEST] ✅ ${names[index]} - Trouvé: valeur="${input.value}" (attendu="${values[index]}")`);
                console.log(`[DEBUG TEST] Élément:`, input);
            } else {
                console.log(`[DEBUG TEST] ❌ ${names[index]} - NON TROUVÉ avec sélecteur: ${selector}`);
            }
        });

        // Rechercher tous les inputs PowerApps
        console.log('[DEBUG TEST] === Recherche de tous les inputs PowerApps ===');
        const allInputs = document.querySelectorAll('input[appmagic-control]');
        console.log(`[DEBUG TEST] ${allInputs.length} inputs PowerApps trouvés:`);

        if (allInputs.length === 0) {
            console.log('[DEBUG TEST] ⚠️ Aucun input PowerApps trouvé ! Recherche alternative...');

            // Recherche alternative 1: tous les inputs
            const allRegularInputs = document.querySelectorAll('input');
            console.log(`[DEBUG TEST] ${allRegularInputs.length} inputs totaux sur la page:`);
            allRegularInputs.forEach((input, index) => {
                if (index < 10) { // Limiter à 10 pour éviter le spam
                    console.log(`[DEBUG TEST] Input ${index + 1}: type="${input.type}" class="${input.className}" id="${input.id}" placeholder="${input.placeholder}"`);
                }
            });

            // Recherche alternative 2: inputs avec des attributs spéciaux
            const specialInputs = document.querySelectorAll('input[data-bind], input[data-control-part]');
            console.log(`[DEBUG TEST] ${specialInputs.length} inputs avec attributs spéciaux:`);
            specialInputs.forEach((input, index) => {
                console.log(`[DEBUG TEST] Special ${index + 1}: data-bind="${input.getAttribute('data-bind')}" data-control-part="${input.getAttribute('data-control-part')}"`);
            });

        } else {
            allInputs.forEach((input, index) => {
                console.log(`[DEBUG TEST] ${index + 1}. appmagic-control="${input.getAttribute('appmagic-control')}" value="${input.value}"`);
            });
        }

        // Forcer le remplissage de tous les champs si ils existent mais sont vides ou incorrects
        console.log('[DEBUG TEST] 🔄 Vérification et remplissage forcé de tous les champs...');

        const serieInput = document.querySelector("input[appmagic-control='TextInputNewDemSerietextbox']");
        if (serieInput && serieInput.value !== numSer) {
            console.log(`[DEBUG TEST] 🔄 Tentative de remplissage forcé du champ Série...`);
            fillSerieFieldSpecial();
        } else if (!serieInput) {
            console.log(`[DEBUG TEST] ❌ Champ Série introuvable - impossible de remplir`);
        }

        const symboleInput = document.querySelector("input[appmagic-control='TextInputNewDemSymboletextbox']");
        if (symboleInput && symboleInput.value !== symbole) {
            console.log(`[DEBUG TEST] 🔄 Tentative de remplissage forcé du champ Symbole...`);
            fillSymboleFieldSpecial();
        } else if (!symboleInput) {
            console.log(`[DEBUG TEST] ❌ Champ Symbole introuvable - impossible de remplir`);
        }

        const ofInput = document.querySelector("input[appmagic-control='TextInputNewDemOFtextbox']");
        if (ofInput && ofInput.value !== numOF) {
            console.log(`[DEBUG TEST] 🔄 Tentative de remplissage forcé du champ OF...`);
            fillOFFieldSpecial();
        } else if (!ofInput) {
            console.log(`[DEBUG TEST] ❌ Champ OF introuvable - impossible de remplir`);
        }

        const composantInput = document.querySelector("input[appmagic-control='TextInputNewDemComposanttextbox']");
        if (composantInput && composantInput.value !== composant) {
            console.log(`[DEBUG TEST] 🔄 Tentative de remplissage forcé du champ Composant...`);
            fillComposantFieldSpecial();
        } else if (!composantInput) {
            console.log(`[DEBUG TEST] ❌ Champ Composant introuvable - impossible de remplir`);
        }
    }

    // Try to fill immediately with delay - avec vérification de l'existence des champs
    setTimeout(() => {
        console.log('[AUTO FILL] Page détectée, attente du chargement des champs...');
        waitForFieldsAndFill();
    }, 500);

    // Fonction d'attente intelligente pour les champs
    function waitForFieldsAndFill() {
        const maxAttempts = 20; // 10 secondes max
        let attempts = 0;

        const checkInterval = setInterval(() => {
            attempts++;
            console.log(`[AUTO FILL] Tentative ${attempts}/${maxAttempts} - Vérification des champs...`);

            // Vérifier si au moins un champ PowerApps existe
            const testInput = document.querySelector("input[appmagic-control='TextInputNewDemOFtextbox']");

            if (testInput) {
                console.log('[AUTO FILL] ✅ Champs détectés ! Remplissage automatique...');
                clearInterval(checkInterval);
                fillInput();
            } else if (attempts >= maxAttempts) {
                console.log('[AUTO FILL] ❌ Timeout - Champs non trouvés après 10 secondes');
                clearInterval(checkInterval);
            }
        }, 500);
    }

    // Also try after DOM changes with renamed observer - avec vérification intelligente
    const commandeObserver = new MutationObserver(() => {
        // Attendre un peu pour que les changements DOM se stabilisent
        setTimeout(() => {
            const testInput = document.querySelector("input[appmagic-control='TextInputNewDemOFtextbox']");
            if (testInput) {
                console.log('[AUTO FILL] Champs détectés via MutationObserver - Remplissage...');
                fillInput();
            }
        }, 300);
    });

    commandeObserver.observe(document.body, {
        childList: true,
        subtree: true
    });

    // Fonction pour créer le panel principal (affiché quand on clique sur "Nouvelle demande")
    function createPanel() {
        // Vérifier si le panel existe déjà
        if (document.getElementById('tampermonkey-panel')) {
            return;
        }

        // Attendre un peu que le DOM soit complètement chargé
        setTimeout(() => {
            // DEBUG: Afficher tous les conteneurs possibles
            console.log('[DEBUG PANEL] === Recherche du conteneur cible ===');
            const allContainers = document.querySelectorAll('[data-container-control-id]');
            console.log(`[DEBUG PANEL] ${allContainers.length} conteneurs trouvés avec data-container-control-id:`);
            allContainers.forEach((container, index) => {
                const id = container.getAttribute('data-container-control-id');
                const rect = container.getBoundingClientRect();
                console.log(`[DEBUG PANEL] ${index + 1}. ID="${id}" Position: top=${Math.round(rect.top)}px, left=${Math.round(rect.left)}px, width=${Math.round(rect.width)}px, height=${Math.round(rect.height)}px`);

                // Afficher le contenu pour identifier le bon
                const buttons = container.querySelectorAll('.appmagic-button-label');
                if (buttons.length > 0) {
                    const buttonTexts = Array.from(buttons).map(b => b.textContent.trim()).join(', ');
                    console.log(`[DEBUG PANEL]    Boutons trouvés: ${buttonTexts}`);
                }
            });

            // Trouver le conteneur avec l'attribut data-container-control-id="185"
            const targetContainer = document.querySelector('[data-container-control-id="185"]');

            if (!targetContainer) {
                console.log('[DEBUG PANEL] ❌ Conteneur cible (ID=185) non trouvé !');

                // Chercher le conteneur par son nom
                const containerByName = document.querySelector('[data-container-name="ContainerNewDemBoutons-container"]');
                if (containerByName) {
                    console.log('[DEBUG PANEL] ✅ Conteneur trouvé par nom: ContainerNewDemBoutons-container');
                    insertPanelIntoContainer(containerByName);
                } else {
                    console.log('[DEBUG PANEL] ❌ Aucun conteneur trouvé, abandon...');
                    return;
                }
            } else {
                console.log(`[DEBUG PANEL] ✅ Conteneur cible trouvé (ID=185)`);

                // Chercher le div parent avec la classe appmagic-group
                const groupDiv = targetContainer.querySelector('.appmagic-group.appmagic-autolayout.horizontal');
                if (groupDiv) {
                    console.log('[DEBUG PANEL] ✅ Div groupe horizontal trouvé, insertion du panel...');
                    insertPanelIntoContainer(groupDiv);
                } else {
                    console.log('[DEBUG PANEL] ⚠️ Div groupe non trouvé, insertion dans le conteneur principal...');
                    insertPanelIntoContainer(targetContainer);
                }
            }
        }, 500);
    }

    // Fonction pour insérer le panel dans le conteneur
    function insertPanelIntoContainer(container) {
        console.log('[DEBUG PANEL] 📍 Insertion du panel dans le conteneur...');

        const panel = document.createElement('div');
        panel.id = 'tampermonkey-panel';

        // Style pour s'intégrer dans le flex container
        panel.style.cssText = `
            position: relative;
            flex: 0 0 auto;
            width: 300px;
            margin-left: 20px;
            animation: slideIn 0.3s ease-out;
        `;

        // Intégrer votre interface complète dans le panel avec le style cyberpunk
        panel.innerHTML = `
            <div class="glitch-form-wrapper">
                <div class="glitch-card">
                    <div class="card-header">
                        <div class="card-title">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="3"/>
                                <path d="M12 1v6m0 6v6"/>
                                <path d="m9 9 3 3 3-3"/>
                            </svg>
                            Interface Commande
                        </div>
                        <div class="card-dots">
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                    </div>
                    <div class="card-body">
                        <div class="form-group-inline">
                            <div class="form-group" style="flex: 1;">
                                <input type="text" id="collectorLink" placeholder=" " />
                                <label class="form-label" data-text="Lien CollectorPlus">Lien CollectorPlus</label>
                            </div>
                            <div class="button-group-inline">
                                <button id="fetchData" class="submit-btn-mini" data-text="🔍" title="Récupérer">
                                    <span class="btn-text">🔍</span>
                                </button>
                                <button id="toggleEdit" class="submit-btn-mini" data-text="✏️" title="Éditer">
                                    <span class="btn-text">✏️</span>
                                </button>
                                <button id="closePanel" class="submit-btn-mini" data-text="❌" title="Fermer" style="border-color: #dc3545; color: #dc3545;">
                                    <span class="btn-text">❌</span>
                                </button>
                            </div>
                        </div>

                        <div id="editSection" style="display: none; margin-top: 0.5rem; padding-top: 0.5rem; border-top: 1px solid rgba(0, 242, 234, 0.2);">
                            <div class="form-group" style="margin-bottom: 0.5rem;">
                                <input type="text" id="manualNumSer" value="${numSer}" placeholder=" " />
                                <label class="form-label" data-text="N° Série">N° Série</label>
                            </div>

                            <div class="form-group" style="margin-bottom: 0.5rem;">
                                <input type="text" id="manualSymbole" value="${symbole}" placeholder=" " />
                                <label class="form-label" data-text="Symbole">Symbole</label>
                            </div>

                            <div class="form-group" style="margin-bottom: 0.5rem;">
                                <input type="text" id="manualNumOF" value="${numOF}" placeholder=" " />
                                <label class="form-label" data-text="N° OF">N° OF</label>
                            </div>

                            <div class="form-group" style="margin-bottom: 0.5rem;">
                                <input type="text" id="manualComposant" value="${composant}" placeholder=" " />
                                <label class="form-label" data-text="Composant">Composant</label>
                            </div>

                            <button id="updateValues" class="submit-btn" data-text="Update">
                                <span class="btn-text">💾 Update</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Ajouter le panel au conteneur
        container.appendChild(panel);
        console.log('[DEBUG PANEL] ✅ Panel inséré dans le conteneur !');

        // Ajouter les styles CSS cyberpunk complets
        const style = document.createElement('style');
        style.textContent = `
            /* --- Root Variables for the component --- */
            .glitch-form-wrapper {
              --bg-color: #0d0d0d;
              --primary-color: #00f2ea;
              --secondary-color: #a855f7;
              --text-color: #e5e5e5;
              --font-family: "Fira Code", Consolas, "Courier New", Courier, monospace;
              --glitch-anim-duration: 0.5s;
            }

            .glitch-form-wrapper {
              display: flex;
              justify-content: center;
              align-items: center;
              font-family: var(--font-family);
              background-color: #050505;
            }

            /* --- Card Structure (Compact) --- */
            .glitch-card {
              background-color: var(--bg-color);
              width: 100%;
              max-width: 300px;
              border: 1px solid rgba(0, 242, 234, 0.2);
              box-shadow:
                0 0 15px rgba(0, 242, 234, 0.1),
                inset 0 0 8px rgba(0, 0, 0, 0.5);
              overflow: hidden;
              margin: 0;
            }

            .card-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              background-color: rgba(0, 0, 0, 0.3);
              padding: 0.3em 0.5em;
              border-bottom: 1px solid rgba(0, 242, 234, 0.2);
            }

            .card-title {
              color: var(--primary-color);
              font-size: 0.6rem;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 0.05em;
              display: flex;
              align-items: center;
              gap: 0.3em;
            }

            .card-title svg {
              width: 0.8em;
              height: 0.8em;
              stroke: var(--primary-color);
            }

            .card-dots span {
              display: inline-block;
              width: 4px;
              height: 4px;
              border-radius: 50%;
              background-color: #333;
              margin-left: 2px;
            }

            .card-body {
              padding: 0.6rem;
            }

            /* --- Form Elements (Compact) --- */
            .form-group {
              position: relative;
              margin-bottom: 0.6rem;
            }

            .form-group-inline {
              display: flex;
              align-items: flex-end;
              gap: 0.3rem;
              margin-bottom: 0.6rem;
            }

            .button-group-inline {
              display: flex;
              gap: 0.2rem;
              flex-shrink: 0;
            }

            .form-label {
              position: absolute;
              top: 0.4em;
              left: 0;
              font-size: 0.65rem;
              color: var(--primary-color);
              opacity: 0.6;
              text-transform: uppercase;
              letter-spacing: 0.05em;
              pointer-events: none;
              transition: all 0.3s ease;
            }

            .form-group input {
              width: 100%;
              background: transparent;
              border: none;
              border-bottom: 2px solid rgba(0, 242, 234, 0.3);
              padding: 0.4em 0;
              font-size: 0.75rem;
              color: var(--text-color);
              font-family: inherit;
              outline: none;
              transition: border-color 0.3s ease;
            }

            .form-group input:focus {
              border-color: var(--primary-color);
            }

            .form-group input:focus + .form-label,
            .form-group input:not(:placeholder-shown) + .form-label {
              top: -0.8em;
              font-size: 0.6rem;
              opacity: 1;
            }

            .form-group input:focus + .form-label::before,
            .form-group input:focus + .form-label::after {
              content: attr(data-text);
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              background-color: var(--bg-color);
            }

            .form-group input:focus + .form-label::before {
              color: var(--secondary-color);
              animation: glitch-anim var(--glitch-anim-duration)
                cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
            }

            .form-group input:focus + .form-label::after {
              color: var(--primary-color);
              animation: glitch-anim var(--glitch-anim-duration)
                cubic-bezier(0.25, 0.46, 0.45, 0.94) reverse both;
            }

            @keyframes glitch-anim {
              0% {
                transform: translate(0);
                clip-path: inset(0 0 0 0);
              }
              20% {
                transform: translate(-5px, 3px);
                clip-path: inset(50% 0 20% 0);
              }
              40% {
                transform: translate(3px, -2px);
                clip-path: inset(20% 0 60% 0);
              }
              60% {
                transform: translate(-4px, 2px);
                clip-path: inset(80% 0 5% 0);
              }
              80% {
                transform: translate(4px, -3px);
                clip-path: inset(30% 0 45% 0);
              }
              100% {
                transform: translate(0);
                clip-path: inset(0 0 0 0);
              }
            }

            /* --- Button Styling (Compact) --- */
            .submit-btn {
              width: 100%;
              padding: 0.4em;
              margin-top: 0.5rem;
              background-color: transparent;
              border: 2px solid var(--primary-color);
              color: var(--primary-color);
              font-family: inherit;
              font-size: 0.7rem;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 0.1em;
              cursor: pointer;
              position: relative;
              transition: all 0.3s;
              overflow: hidden;
            }

            .submit-btn-mini {
              padding: 0.35em 0.6em;
              background-color: transparent;
              border: 2px solid var(--primary-color);
              color: var(--primary-color);
              font-family: inherit;
              font-size: 0.85rem;
              font-weight: 700;
              cursor: pointer;
              position: relative;
              transition: all 0.3s;
              overflow: hidden;
              border-radius: 4px;
              min-width: 32px;
            }

            .submit-btn-mini:hover,
            .submit-btn-mini:focus {
              background-color: var(--primary-color);
              color: var(--bg-color);
              box-shadow: 0 0 15px var(--primary-color);
              outline: none;
            }

            .submit-btn-mini:active {
              transform: scale(0.95);
            }

            .submit-btn:hover,
            .submit-btn:focus {
              background-color: var(--primary-color);
              color: var(--bg-color);
              box-shadow: 0 0 25px var(--primary-color);
              outline: none;
            }

            .submit-btn:active {
              transform: scale(0.97);
            }

            /* --- Glitch Effect for Button --- */
            .submit-btn .btn-text {
              position: relative;
              z-index: 1;
              transition: opacity 0.2s ease;
            }

            .submit-btn:hover .btn-text {
              opacity: 0;
            }

            .submit-btn::before,
            .submit-btn::after {
              content: attr(data-text);
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              display: flex;
              align-items: center;
              justify-content: center;
              opacity: 0;
              background-color: var(--primary-color);
              transition: opacity 0.2s ease;
            }

            .submit-btn:hover::before,
            .submit-btn:focus::before {
              opacity: 1;
              color: var(--secondary-color);
              animation: glitch-anim var(--glitch-anim-duration)
                cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
            }

            .submit-btn:hover::after,
            .submit-btn:focus::after {
              opacity: 1;
              color: var(--bg-color);
              animation: glitch-anim var(--glitch-anim-duration)
                cubic-bezier(0.25, 0.46, 0.45, 0.94) reverse both;
            }

            @media (prefers-reduced-motion: reduce) {
              .form-group input:focus + .form-label::before,
              .form-group input:focus + .form-label::after,
              .submit-btn:hover::before,
              .submit-btn:focus::before,
              .submit-btn:hover::after,
              .submit-btn:focus::after {
                animation: none;
                opacity: 0;
              }

              .submit-btn:hover .btn-text {
                opacity: 1;
              }
            }

            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            @keyframes fadeOut {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);

        // Ajouter les event listeners pour votre interface

        // Toggle edit section
        document.getElementById('toggleEdit').addEventListener('click', () => {
            const editSection = document.getElementById('editSection');
            editSection.style.display = editSection.style.display === 'none' ? 'block' : 'none';
        });

        // Close panel button
        document.getElementById('closePanel').addEventListener('click', () => {
            if (panel && panel.parentNode) {
                panel.style.animation = 'fadeOut 0.3s ease-in';
                setTimeout(() => {
                    if (panel && panel.parentNode) {
                        panel.parentNode.removeChild(panel);
                    }
                }, 300);
            }
        });

        // Update values function
        function updateConstants(newNumSer, newSymbole, newNumOF, newComposant) {
            numSer = newNumSer;
            symbole = newSymbole;
            numOF = newNumOF || '';
            composant = newComposant || '';

            // Update UI inputs
            document.getElementById('manualNumSer').value = numSer;
            document.getElementById('manualSymbole').value = symbole;
            document.getElementById('manualNumOF').value = numOF;
            document.getElementById('manualComposant').value = composant;

            fillInput();
        }

        // Manual update button
        document.getElementById('updateValues').addEventListener('click', () => {
            const newNumSer = document.getElementById('manualNumSer').value;
            const newSymbole = document.getElementById('manualSymbole').value;
            const newNumOF = document.getElementById('manualNumOF').value;
            const newComposant = document.getElementById('manualComposant').value;

            updateConstants(newNumSer, newSymbole, newNumOF, newComposant);

            // Ajouter la même logique de test que "Tester champs"
            console.log('[MANUAL UPDATE] Mise à jour effectuée, vérification et remplissage forcé...');
            setTimeout(() => {
                testPowerAppsFields();
            }, 500);
        });

        // Collector fetch button
        const input = document.getElementById('collectorLink');
        const button = document.getElementById('fetchData');

        button.addEventListener('click', () => {
            let lien = input.value.trim();
            if (!lien) return alert("Merci de mettre le lien CollectorPlus");

            // Utiliser directement l'URL fournie sans conversion
            console.log('[CollectorPlus Script] URL utilisée:', lien);

            GM_xmlhttpRequest({
                method: 'GET',
                url: lien,
                onload: function(resp) {
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(resp.responseText, 'text/html');

                    console.log('[CollectorPlus Script] Début de l\'extraction des données...');

                    // Récupération du symbole - cibler la structure spécifique
                    let newSymbole = "";
                    console.log('[CollectorPlus Script] Recherche du symbole...');

                    // Chercher dans .col-xs-7.text-center.panel-title
                    const symboleContainer = doc.querySelector('.col-xs-7.text-center.panel-title');
                    if (symboleContainer) {
                        const symboleRow = symboleContainer.querySelector('.row');
                        if (symboleRow) {
                            const fullText = symboleRow.textContent.trim();
                            console.log(`[CollectorPlus Script] Texte symbole trouvé: "${fullText}"`);
                            // Extraire juste le numéro (avant le " - ")
                            if (fullText.includes(' - ')) {
                                newSymbole = fullText.split(' - ')[0].trim();
                                console.log(`[CollectorPlus Script] ✅ Symbole extrait: "${newSymbole}"`);
                            } else {
                                newSymbole = fullText;
                                console.log(`[CollectorPlus Script] ✅ Symbole complet: "${newSymbole}"`);
                            }
                        }
                    }

                    // Fallback pour symbole si pas trouvé
                    if (!newSymbole) {
                        console.log('[CollectorPlus Script] Recherche symbole avec méthode alternative...');
                        const allRows = doc.querySelectorAll('div.row');
                        allRows.forEach((row, index) => {
                            if (!newSymbole && row.textContent.includes(' - ') && /\d{8}/.test(row.textContent)) {
                                const text = row.textContent.trim();
                                if (text.includes(' - ')) {
                                    newSymbole = text.split(' - ')[0].trim();
                                    console.log(`[CollectorPlus Script] ✅ Symbole trouvé (fallback): "${newSymbole}"`);
                                }
                            }
                        });
                    }

                    // Récupération du numéro de série - cibler la structure spécifique
                    let newNumSer = "";
                    console.log('[CollectorPlus Script] Recherche du numéro de série...');

                    const allRowsForSerie = doc.querySelectorAll('div.row');
                    allRowsForSerie.forEach((row, index) => {
                        if (!newNumSer && row.textContent.includes("N° série :")) {
                            console.log(`[CollectorPlus Script] Row ${index + 1} contient "N° série :"`);
                            console.log(`[CollectorPlus Script] HTML de la row série:`, row.innerHTML);

                            // Cibler exactement la div avec la classe spécifiée pour la série
                            const serieDiv = row.querySelector('div.col-lg-5.col-sm-7.col-xs-6.text-left.no-margin');
                            if (serieDiv) {
                                let serieText = serieDiv.textContent.trim();
                                console.log(`[CollectorPlus Script] Texte brut série: "${serieText}"`);

                                // Règle spéciale pour extraire le bon numéro de série
                                // Chercher un numéro long (20+ caractères) qui ressemble à 8004361455400000000006133431
                                const longSerialMatch = serieText.match(/\d{20,}/);
                                if (longSerialMatch) {
                                    newNumSer = longSerialMatch[0];
                                    console.log(`[CollectorPlus Script] ✅ Numéro de série long trouvé: "${newNumSer}"`);
                                } else {
                                    // Si pas de numéro long, traitement normal
                                    // Extraire le numéro après la flèche (si présent)
                                    if (serieText.includes('→') || serieText.includes('»')) {
                                        const parts = serieText.split(/→|»/);
                                        if (parts.length > 1) {
                                            const afterArrow = parts[1].trim();
                                            // Chercher encore un numéro long dans la partie après la flèche
                                            const longInArrow = afterArrow.match(/\d{20,}/);
                                            if (longInArrow) {
                                                newNumSer = longInArrow[0];
                                                console.log(`[CollectorPlus Script] ✅ Numéro de série long trouvé après flèche: "${newNumSer}"`);
                                            } else {
                                                newNumSer = afterArrow;
                                                console.log(`[CollectorPlus Script] ✅ Numéro de série après flèche: "${newNumSer}"`);
                                            }
                                        }
                                    } else {
                                        // Chercher le span avec id repair_details_organ_serial
                                        const spanElement = serieDiv.querySelector('#repair_details_organ_serial, span[id*="repair"]');
                                        if (spanElement) {
                                            const spanText = spanElement.textContent.trim();
                                            // Chercher un numéro long dans le span
                                            const longInSpan = spanText.match(/\d{20,}/);
                                            if (longInSpan) {
                                                newNumSer = longInSpan[0];
                                                console.log(`[CollectorPlus Script] ✅ Numéro de série long trouvé dans span: "${newNumSer}"`);
                                            } else {
                                                newNumSer = spanText;
                                                console.log(`[CollectorPlus Script] ✅ Numéro de série du span: "${newNumSer}"`);
                                            }
                                        } else {
                                            // Dernière option: chercher dans tout le texte
                                            const anyLong = serieText.match(/\d{15,}/); // Un peu plus souple
                                            if (anyLong) {
                                                newNumSer = anyLong[0];
                                                console.log(`[CollectorPlus Script] ✅ Numéro de série long trouvé (fallback): "${newNumSer}"`);
                                            } else {
                                                newNumSer = serieText;
                                                console.log(`[CollectorPlus Script] ✅ Numéro de série complet: "${newNumSer}"`);
                                            }
                                        }
                                    }
                                }
                                console.log(`[CollectorPlus Script] ✅ Numéro de série final: "${newNumSer}"`);
                            }
                        }
                    });

                    // Récupération du numéro OF - cibler la structure spécifique
                    let newNumOF = "";
                    console.log('[CollectorPlus Script] Recherche du numéro OF...');

                    const allRowsForOF = doc.querySelectorAll('div.row');
                    console.log(`[CollectorPlus Script] Recherche OF - ${allRowsForOF.length} rows à examiner`);

                    allRowsForOF.forEach((row, index) => {
                        if (!newNumOF && row.textContent.includes("N° OF ")) {
                            console.log(`[CollectorPlus Script] *** ATTENTION *** Row ${index + 1} contient "N° OF "`);
                            console.log(`[CollectorPlus Script] Texte complet de cette row:`, row.textContent.trim());
                            console.log(`[CollectorPlus Script] HTML de la row OF:`, row.innerHTML);

                            // Vérifier si c'est vraiment une row OF et pas série
                            if (row.textContent.includes("N° série")) {
                                console.log(`[CollectorPlus Script] ⚠️ ERREUR: Cette row contient aussi "N° série", on passe`);
                                return; // Skip cette row
                            }

                            // Cibler exactement la div avec la classe spécifiée pour OF
                            const ofDiv = row.querySelector('div.col-lg-5.col-sm-7.col-xs-6.text-left.no-margin');
                            if (ofDiv) {
                                newNumOF = ofDiv.textContent.trim();
                                console.log(`[CollectorPlus Script] ✅ Numéro OF trouvé: "${newNumOF}"`);
                            } else {
                                console.log(`[CollectorPlus Script] ❌ Div OF avec classes exactes non trouvée, recherche alternative...`);

                                // Essayer différents sélecteurs alternatifs pour OF
                                const possibleOFSelectors = [
                                    'div.col-lg-5',
                                    'div[class*="col-lg-5"]',
                                    'div[class*="text-left"]',
                                    'div[class*="no-margin"]'
                                ];

                                for (const selector of possibleOFSelectors) {
                                    const alternateDiv = row.querySelector(selector);
                                    if (alternateDiv && alternateDiv.textContent.trim() && !alternateDiv.textContent.includes("N° OF") && !alternateDiv.textContent.includes("N° série")) {
                                        newNumOF = alternateDiv.textContent.trim();
                                        console.log(`[CollectorPlus Script] ✅ Numéro OF trouvé avec sélecteur "${selector}": "${newNumOF}"`);
                                        break;
                                    }
                                }
                            }
                        }
                    });

                    // Si toujours pas trouvé, recherche spécifique pour OF
                    if (!newNumOF) {
                        console.log('[CollectorPlus Script] Recherche OF alternative...');
                        allRowsForOF.forEach((row, index) => {
                            if (!newNumOF && row.innerHTML.includes("N° OF") && !row.innerHTML.includes("N° série")) {
                                console.log(`[CollectorPlus Script] Row ${index + 1} contient "N° OF" mais pas "N° série"`);
                                const ofDiv = row.querySelector('div.col-lg-5.col-sm-7.col-xs-6.text-left.no-margin');
                                if (ofDiv) {
                                    newNumOF = ofDiv.textContent.trim();
                                    console.log(`[CollectorPlus Script] ✅ Numéro OF trouvé (méthode alternative): "${newNumOF}"`);
                                }
                            }
                        });
                    }

                    let newComposant = "";
                    console.log('[CollectorPlus Script] Recherche Composant...');
                    console.log('[CollectorPlus Script] HTML reçu:', resp.responseText.substring(0, 500) + '...');

                    // Méthode ciblée pour récupérer l'info agent dans la structure spécifique
                    const allRows = doc.querySelectorAll('div.row');
                    console.log('[CollectorPlus Script] Nombre de rows trouvées:', allRows.length);

                    allRows.forEach((row, index) => {
                        if (row.textContent.includes("Info Agent :")) {
                            console.log(`[CollectorPlus Script] Row ${index + 1} contient "Info Agent :"`);
                            console.log(`[CollectorPlus Script] HTML de la row:`, row.innerHTML);

                            // Cibler exactement la div avec la classe spécifiée
                            const composantDiv = row.querySelector('div.col-lg-5.col-sm-7.col-xs-6.text-left.no-margin');
                            if (composantDiv) {
                                newComposant = composantDiv.textContent.trim();
                                console.log(`[CollectorPlus Script] ✅ Composant trouvé avec sélecteur exact: "${newComposant}"`);
                            } else {
                                console.log(`[CollectorPlus Script] ❌ Div avec classes exactes non trouvée, recherche alternative...`);

                                // Essayer différents sélecteurs alternatifs
                                const possibleSelectors = [
                                    'div.col-lg-5',
                                    'div[class*="col-lg-5"]',
                                    'div[class*="text-left"]',
                                    'div[class*="no-margin"]'
                                ];

                                for (const selector of possibleSelectors) {
                                    const alternateDiv = row.querySelector(selector);
                                    if (alternateDiv && alternateDiv.textContent.trim() && !alternateDiv.textContent.includes("Info Agent :")) {
                                        newComposant = alternateDiv.textContent.trim();
                                        console.log(`[CollectorPlus Script] ✅ Composant trouvé avec sélecteur "${selector}": "${newComposant}"`);
                                        break;
                                    }
                                }
                            }

                            // Si toujours pas trouvé, afficher tous les divs de la row pour debug
                            if (!newComposant) {
                                console.log(`[CollectorPlus Script] 🔍 Tous les divs dans cette row:`);
                                const allDivsInRow = row.querySelectorAll('div');
                                allDivsInRow.forEach((div, divIndex) => {
                                    if (div.textContent.trim() && !div.textContent.includes("Info Agent :")) {
                                        console.log(`  Div ${divIndex}: classe="${div.className}" contenu="${div.textContent.trim()}"`);
                                    }
                                });
                            }
                        }
                    });

                    // Affichage final dans la console
                    if (newComposant) {
                        console.log(`[CollectorPlus Script] 🎯 RÉSULTAT BRUT - Composant récupéré: "${newComposant}"`);

                        // Chercher l'information après le pattern "JH -- 05/09/2025 -- " ou similaire
                        // Pattern flexible : [Lettres] -- [date] -- [info]
                        const datePattern = /[A-Z]{2}\s*--\s*\d{2}\/\d{2}\/\d{4}\s*--\s*(.+)/i;

                        const match = newComposant.match(datePattern);
                        if (match && match[1]) {
                            let extractedInfo = match[1].trim();

                            console.log(`[CollectorPlus Script] ✅ Information trouvée après le pattern date: "${extractedInfo}"`);
                            newComposant = extractedInfo;
                            console.log(`[CollectorPlus Script] 🎯 RÉSULTAT FINAL - Composant après extraction: "${newComposant}"`);
                        } else {
                            console.log(`[CollectorPlus Script] ⚠️ Pattern date non trouvé, garde la valeur complète: "${newComposant}"`);
                        }
                    } else {
                        console.log('[CollectorPlus Script] ❌ ÉCHEC - Composant non trouvé');

                        // Dernière tentative: recherche globale dans le document
                        console.log('[CollectorPlus Script] Tentative de recherche globale...');
                        const allText = doc.body.textContent;
                        if (allText.includes("Info Agent :")) {
                            console.log('[CollectorPlus Script] "Info Agent :" trouvé dans le texte global');
                            // Recherche par regex pour extraire ce qui suit "Info Agent :"
                            const regex = /Info Agent\s*:\s*([^\s\n]+)/;
                            const match = allText.match(regex);
                            if (match && match[1]) {
                                newComposant = match[1].trim();
                                console.log(`[CollectorPlus Script] 🎯 RÉSULTAT BRUT par regex: "${newComposant}"`);

                                // Chercher l'information après le pattern "JH -- 05/09/2025 -- " ou similaire
                                // Pattern flexible : [Lettres] -- [date] -- [info]
                                const datePattern = /[A-Z]{2}\s*--\s*\d{2}\/\d{2}\/\d{4}\s*--\s*(.+)/i;

                                const matchAttente = newComposant.match(datePattern);
                                if (matchAttente && matchAttente[1]) {
                                    let extractedInfo = matchAttente[1].trim();

                                    console.log(`[CollectorPlus Script] ✅ Information trouvée après pattern date (regex): "${extractedInfo}"`);
                                    newComposant = extractedInfo;
                                    console.log(`[CollectorPlus Script] ✅ Composant final par regex: "${newComposant}"`);
                                } else {
                                    console.log(`[CollectorPlus Script] ✅ Composant trouvé par regex (pas d'extraction): "${newComposant}"`);
                                }
                            }
                        }
                    }

                    updateConstants(newNumSer, newSymbole, newNumOF, newComposant);

                    // Test immédiat pour vérifier les champs
                    setTimeout(() => {
                        console.log('[DEBUG TEST] Vérification des champs PowerApps...');
                        testPowerAppsFields();
                    }, 2000);

                    //alert(`Données récupérées:\nSymbole: ${newSymbole}\nNuméro de série: ${newNumSer}\nNuméro OF: ${newNumOF}`);
                },
                onerror: () => alert("Erreur HTTP lors de la récupération du CollectorPlus")
            });
        });
    }

    // Fonction pour ajouter l'event listener au bouton "Nouvelle demande"
    function addClickListener() {
        // Chercher le bouton avec le texte "Nouvelle demande"
        const buttons = document.querySelectorAll('.appmagic-button');

        buttons.forEach(button => {
            const labelElement = button.querySelector('.appmagic-button-label');
            if (labelElement && labelElement.textContent.trim() === 'Nouvelle demande') {
                // Vérifier si l'event listener n'est pas déjà ajouté
                if (!button.hasAttribute('data-tampermonkey-listener')) {
                    button.setAttribute('data-tampermonkey-listener', 'true');
                    button.addEventListener('click', function(e) {
                        console.log('Bouton "Nouvelle demande" cliqué !');
                        createPanel();
                    });
                    console.log('Event listener ajouté au bouton "Nouvelle demande"');
                }
            }
        });
    }

    // Observer les changements du DOM pour détecter les nouveaux éléments
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList') {
                // Attendre un peu pour que les éléments soient complètement chargés
                setTimeout(addClickListener, 100);
            }
        });
    });

    // Démarrer l'observation
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // Exécuter une première fois au chargement de la page
    setTimeout(addClickListener, 1000);

    // Vérifier périodiquement si le bouton existe (au cas où il se chargerait plus tard)
    const intervalCheck = setInterval(() => {
        addClickListener();

        // Arrêter la vérification après 30 secondes
        setTimeout(() => {
            clearInterval(intervalCheck);
        }, 30000);
    }, 2000);

    console.log('Script Tampermonkey PowerApps Panel avec Commande Composant chargé');




})();
