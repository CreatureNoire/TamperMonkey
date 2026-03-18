(function () {
    'use strict';

    document.addEventListener("DOMContentLoaded", verifierPresenceTitre);

    const storageKey = "formCopies";
    const componentStorageKey = "componentFailures";
    
    // Tableau temporaire pour les requÃªtes EditComponentFailure
    let componentFailureRequests = [];

    // Initialiser le stockage s'il n'existe pas
    if (!localStorage.getItem(storageKey)) {
        resetStorage();
    }

    function resetStorage() {
        const vide = {};
        localStorage.setItem(storageKey, JSON.stringify(vide));
    }

    // Fonction pour rÃ©cupÃ©rer le numÃ©ro de symbole depuis le panel-heading
    function getCurrentSymbole() {
        const panelTitle = document.querySelector('.panel-heading .panel-title .row');
        if (panelTitle) {
            const text = panelTitle.textContent.trim();
            // Extraire le numÃ©ro avant le tiret (exemple: "78660169 - TIROIR EQUIPE ALIM-104")
            const match = text.match(/^(\d+)\s*-/);
            if (match) {
                return match[1];
            }
        }
        return null;
    }

    // Gestion de l'ordre des boutons pour le drag & drop
    const orderKey = "buttonOrder";

    function getButtonOrder() {
        const order = localStorage.getItem(orderKey);
        return order ? JSON.parse(order) : [];
    }

    function setButtonOrder(order) {
        localStorage.setItem(orderKey, JSON.stringify(order));
    }

    function getOrderedKeys(storedCopies) {
        const currentOrder = getButtonOrder();
        const allKeys = Object.keys(storedCopies);
        
        // Filtrer l'ordre existant pour ne garder que les clÃ©s valides
        const validOrder = currentOrder.filter(key => allKeys.includes(key));
        
        // Ajouter les nouvelles clÃ©s qui ne sont pas dans l'ordre (Ã  la fin)
        const newKeys = allKeys.filter(key => !validOrder.includes(key));
        
        // Combiner l'ordre existant avec les nouvelles clÃ©s
        const finalOrder = [...validOrder, ...newKeys];
        
        // Mettre Ã  jour l'ordre stockÃ© SEULEMENT s'il y a de nouvelles clÃ©s
        if (newKeys.length > 0) {
            setButtonOrder(finalOrder);
        }
        
        return finalOrder;
    }

    // Fonction pour supprimer toutes les copies (Ã  exÃ©cuter dans la console)
    window.clearAllCopies = function() {
        localStorage.removeItem(storageKey);
        localStorage.removeItem(orderKey);
        location.reload();
    };

    // Fonction de diagnostic pour identifier les problÃ¨mes entre utilisateurs
    window.diagnosticFormulaire = function() {
        
        // 1. Informations systÃ¨me
        
        // 2. VÃ©rifier la prÃ©sence du formulaire
        const formulaire = document.querySelector('#panel-body-general');
        if (formulaire) {
            const inputs = formulaire.querySelectorAll('input, select, textarea');
        }
        
        // 3. VÃ©rifier les champs d'indices
        const indices = [
            'S_indice_organe_arr',
            'S_indice_organe_dep',
            'S_indice_logiciel_arr',
            'S_indice_logiciel_dep'
        ];
        indices.forEach(id => {
            const element = document.getElementById(id);
        });
        
        // 4. VÃ©rifier le bouton de validation
        const validateBtn = document.getElementById('fonctionnel_validate_form');
        if (validateBtn) {
        }
        
        // 5. VÃ©rifier les boutons de consistance
        const btnGroup = document.querySelector('.btn-group.pull-right[aria-label="Consistance RÃ©paration"]');
        if (btnGroup) {
            const buttons = btnGroup.querySelectorAll('button[collector-value]');
            buttons.forEach((btn, i) => {
            });
        }
        
        // 6. VÃ©rifier le localStorage
        const storedCopies = JSON.parse(localStorage.getItem(storageKey) || '{}');
        Object.keys(storedCopies).forEach(key => {
            const preset = storedCopies[key];
        });
        
        // 7. VÃ©rifier les Ã©lÃ©ments critiques
        const criticalElements = [
            { id: 'idUser', label: 'ID Utilisateur' },
            { id: 'idRep', label: 'ID RÃ©paration' },
            { id: 'fonctionnel_transition_id', label: 'ID Transition' }
        ];
        criticalElements.forEach(item => {
            const el = document.getElementById(item.id);
        });
        
        // 8. **NOUVEAU** - VÃ©rifier les dÃ©pendances pour l'affichage des boutons
        
        // VÃ©rifier la prÃ©sence du panel-heading "Saisie REX"
        const panelHeadings = document.querySelectorAll('.panel-heading h3.panel-title');
        let saisieRexFound = false;
        for (let heading of panelHeadings) {
            if (heading.textContent.trim() === "Saisie REX") {
                saisieRexFound = true;
                break;
            }
        }
        
        // VÃ©rifier le conteneur de boutons crÃ©Ã© par le script
        const buttonContainer = document.querySelector('.copie-rex-button-container');
        if (buttonContainer) {
            const buttons = buttonContainer.querySelectorAll('button');
            buttons.forEach((btn, i) => {
            });
        }
        
        // VÃ©rifier window.styleButton
        
        return {
            formulairePresent: !!formulaire,
            indicesPresents: indices.map(id => ({ id, present: !!document.getElementById(id) })),
            boutonValidationPresent: !!validateBtn,
            nombrePresets: Object.keys(storedCopies).length,
            hasConsistanceLabel: hasConsistanceLabel,
            hasButtonContainer: !!buttonContainer,
            hasStyleButton: typeof window.styleButton === 'function'
        };
    };

    // Fonction de debug pour vÃ©rifier l'ordre actuel
    window.debugButtonOrder = function() {
        const order = getButtonOrder();
        const copies = JSON.parse(localStorage.getItem(storageKey) || '{}');
        
        // VÃ©rifier l'ordre visual dans le DOM
        const buttonContainer = document.querySelector('div[style*="position: fixed;"][style*="bottom: 10px;"][style*="right: 10px;"]');
        if (buttonContainer) {
            const visualOrder = Array.from(buttonContainer.querySelectorAll('[id^="btnColler-"]')).map(btn => btn.dataset.buttonKey);
        }
        
        return { order, copies: Object.keys(copies) };
    };

    // Fonction de debug pour le drag & drop (Ã  exÃ©cuter dans la console)
    window.debugDragDrop = function() {
        const buttons = document.querySelectorAll('[id^="btnColler-"]');
        
        buttons.forEach((btn, index) => {
        });
        
        // Tester si les Ã©vÃ©nements sont bien attachÃ©s
        if (buttons.length > 0) {
            const testBtn = buttons[0];
        }
    };

    function verifierPresenceTitre() {
        // Chercher le panel-heading avec "Saisie REX"
        const panelHeadings = document.querySelectorAll('.panel-heading h3.panel-title');
        for (let heading of panelHeadings) {
            if (heading.textContent.trim() === "Saisie REX") {
                return true;
            }
        }
        return false;
    }
    
    // Fonction pour crÃ©er ou rÃ©cupÃ©rer le conteneur de boutons dans le panel-heading "Saisie REX"
    function getOrCreateButtonContainer() {
        
        // Chercher le panel-heading existant
        const panelHeadings = document.querySelectorAll('.panel-heading');
        
        let saisieRexHeading = null;
        
        for (let heading of panelHeadings) {
            const title = heading.querySelector('h3.panel-title');
            if (title) {
                if (title.textContent.trim() === "Saisie REX") {
                    saisieRexHeading = heading;
                    break;
                }
            }
        }
        
        if (!saisieRexHeading) {
            return null;
        }
        
        // VÃ©rifier si le conteneur existe dÃ©jÃ 
        let buttonContainer = saisieRexHeading.querySelector('.copie-rex-button-container');
        
        if (!buttonContainer) {
            // CrÃ©er le conteneur de boutons
            buttonContainer = document.createElement('div');
            buttonContainer.className = 'copie-rex-button-container';
            buttonContainer.style.cssText = `
                display: flex;
                flex-wrap: wrap;
                gap: 0px;
                justify-content: flex-start;
                align-items: center;
                margin-top: 0px;
                padding: 0px;
                background-color: rgba(0, 0, 0, 0.03);
                border-radius: 0px;
            `;
            
            // Ajouter le conteneur au panel-heading
            saisieRexHeading.appendChild(buttonContainer);
        } else {
        }
        
        return buttonContainer;
    }

    let intervalCheck = setInterval(() => {
        const presenceTitre = verifierPresenceTitre();
        
        // Debug: afficher l'Ã©tat de vÃ©rification toutes les 10 secondes
        if (Date.now() % 10000 < 1000) {
            const panelHeadings = document.querySelectorAll('.panel-heading h3.panel-title');
        }
        
        if (presenceTitre) {
            ajouterBoutons();
        } else {
            retirerBoutons();
        }
        
        // VÃ©rifier la prÃ©sence de l'Ã©lÃ©ment "Saisie REX"
        checkSaisieRexPresence();
    }, 1000);

    // VÃ©rification simple de la prÃ©sence de l'Ã©lÃ©ment "Saisie REX"
    function checkSaisieRexPresence() {
        const saisieRexTitle = document.querySelector('h3.panel-title');
        const isSaisieRexPresent = saisieRexTitle && saisieRexTitle.textContent.trim() === "Saisie REX";
        
        // GÃ©rer les changements d'Ã©tat
        if (isSaisieRexPresent && !window.isSaisieRexPageActive) {
            // L'Ã©lÃ©ment vient d'apparaÃ®tre - activer l'interception
            if (!window.fetchIntercepted) {
                interceptComponentFailureRequests();
            }
            window.isSaisieRexPageActive = true;
            
        } else if (!isSaisieRexPresent && window.isSaisieRexPageActive) {
            // L'Ã©lÃ©ment vient de disparaÃ®tre - dÃ©sactiver l'interception
            window.isSaisieRexPageActive = false;
            
        }
        
        // Afficher le statut si changement
        if (window.isSaisieRexPageActive !== window.previousRexState) {
            window.previousRexState = window.isSaisieRexPageActive;
        }
    }

    // Intercepter les requÃªtes POST vers EditComponentFailure - INTERCEPTION PERMANENTE
    function interceptComponentFailureRequests() {
        // Ã‰viter la double interception
        if (window.fetchIntercepted) return;
        
        // === INTERCEPTION XMLHttpRequest ===
        const originalXHROpen = XMLHttpRequest.prototype.open;
        const originalXHRSend = XMLHttpRequest.prototype.send;
        
        XMLHttpRequest.prototype.open = function(method, url, async, user, password) {
            this._method = method;
            this._url = url;
            return originalXHROpen.apply(this, arguments);
        };

        XMLHttpRequest.prototype.send = function(data) {
            if (this._method === 'POST') {
                
                const isEditComponentFailure = this._url && (
                    this._url.includes('EditComponentFailure') ||
                    this._url.includes('/Prm/ReparationForms/Saisie_Intervention/EditComponentFailure')
                );

                if (window.isSaisieRexPageActive && isEditComponentFailure) {
                    
                    let formData = {};
                    
                    // Traiter les donnÃ©es FormData
                    if (data instanceof FormData) {
                        for (let [key, value] of data.entries()) {
                            formData[key] = value;
                        }
                    } 
                    // Traiter les donnÃ©es URL-encodÃ©es (string)
                    else if (typeof data === 'string' && data.includes('=')) {
                        const pairs = data.split('&');
                        for (let pair of pairs) {
                            const [key, value] = pair.split('=');
                            if (key && value) {
                                formData[decodeURIComponent(key)] = decodeURIComponent(value);
                            }
                        }
                    }
                    
                    // Extraire seulement les champs requis si ils existent
                    const filteredData = {
                        fk_dico_constituant: formData.fk_dico_constituant,
                        fk_dico_defaut_constituant: formData.fk_dico_defaut_constituant,
                        S_repere: formData.S_repere,
                        idt_t_reparation_has_lst_dico_constituant: formData.idt_t_reparation_has_lst_dico_constituant
                    };
                    
                    // VÃ©rifier qu'on a au moins un champ requis
                    if (filteredData.fk_dico_constituant || filteredData.fk_dico_defaut_constituant || filteredData.S_repere) {
                        componentFailureRequests.push(filteredData);
                        
                        // Ajouter une div dans le panel-heading "DÃ©fauts composant"
                        const panelHeading = Array.from(document.querySelectorAll('.panel-heading')).find(heading => 
                            heading.textContent.includes('DÃ©fauts composant')
                        );
                        
                        if (panelHeading) {
                            // Supprimer l'ancienne div d'enregistrement si elle existe
                            const existingDiv = panelHeading.querySelector('.xhr-recording-info');
                            if (existingDiv) {
                                existingDiv.remove();
                            }
                            
                            // CrÃ©er une nouvelle div d'information
                            const recordingDiv = document.createElement('div');
                            recordingDiv.className = 'xhr-recording-info xhr-recording-glow';
                            
                            // CrÃ©er la div circulaire rouge
                            const indicatorDot = document.createElement('div');
                            indicatorDot.className = 'xhr-indicator-dot';
                            
                            // Ajouter le texte
                            const textSpan = document.createElement('span');
                            textSpan.textContent = `Enregistrement: ${componentFailureRequests.length} constituant${componentFailureRequests.length > 1 ? 's' : ''}`;
                            
                            recordingDiv.appendChild(indicatorDot);
                            recordingDiv.appendChild(textSpan);
                            
                            panelHeading.appendChild(recordingDiv);
                        }
                    } else {
                    }
                }
            }
            
            return originalXHRSend.apply(this, arguments);
        };
        
        window.fetchIntercepted = true;
    }

    function ajouterBoutons() {
        
        // Utiliser le nouveau conteneur dans le panel-heading "Saisie REX"
        const buttonContainer = getOrCreateButtonContainer();
        
        if (!buttonContainer) {
            return;
        }
        
        if (document.getElementById("btnCopier")) {
            return;
        }
        
        // VÃ©rifier si window.styleButton existe, sinon crÃ©er une version de fallback
        if (typeof window.styleButton !== 'function') {
            window.styleButton = function(button, color, iconClass) {
                // Appliquer le style Frutiger
                button.className = 'frutiger-button';
                
                // DÃ©terminer les couleurs selon le type de bouton
                let gradient1, gradient2, radialColor;
                if (color === "#28a745") { // Vert pour Copier
                    gradient1 = "#28a745";
                    gradient2 = "#5cd67d";
                    radialColor = "#5cd67d";
                } else if (color === "#6f42c1") { // Mauve pour symbole
                    gradient1 = "#6f42c1";
                    gradient2 = "#9d6edb";
                    radialColor = "#9d6edb";
                } else { // Bleu par dÃ©faut
                    gradient1 = "#006caa";
                    gradient2 = "#00c3ff";
                    radialColor = "#30f8f8";
                }
                
                button.style.cssText = `
                    cursor: pointer;
                    position: relative;
                    padding: 1px;
                    border-radius: 4px;
                    border: 0;
                    text-shadow: 1px 1px #000a;
                    background: linear-gradient(${gradient1}, ${gradient2});
                    box-shadow: 0px 2px 4px 0px #0008;
                    transition: 0.3s all;
                    margin: 3px;
                `;
                
                // CrÃ©er la structure interne
                const inner = document.createElement('div');
                inner.className = 'inner';
                inner.style.cssText = `
                    position: relative;
                    inset: 0px;
                    padding: 0.5em 1em;
                    border-radius: 5px;
                    background: radial-gradient(circle at 50% 100%, ${radialColor} 10%, ${radialColor}00 55%),
                        linear-gradient(${gradient1}aa, ${gradient2}dd);
                    overflow: hidden;
                    transition: inherit;
                    font-size: 13px;
                `;
                
                // Effet de brillance
                const beforeEffect = document.createElement('div');
                beforeEffect.style.cssText = `
                    content: "";
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(-65deg, #0000 40%, #fff7 50%, #0000 70%);
                    background-size: 200% 100%;
                    background-repeat: no-repeat;
                    animation: shine 3s ease infinite;
                    pointer-events: none;
                `;
                
                // Top white effect
                const topWhite = document.createElement('div');
                topWhite.className = 'top-white';
                topWhite.style.cssText = `
                    position: absolute;
                    border-radius: inherit;
                    inset: 0 -8em;
                    background: radial-gradient(circle at 50% -270%, #fff 45%, #fff6 60%, #fff0 60%);
                    transition: inherit;
                    pointer-events: none;
                `;
                
                // Texte
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
                    gap: 4px;
                    font-size: 13px;
                    line-height: 1.2;
                `;
                
                // DÃ©placer le texte existant dans textSpan
                while (button.firstChild) {
                    textSpan.appendChild(button.firstChild);
                }
                
                // Assembler la structure
                inner.appendChild(beforeEffect);
                inner.appendChild(topWhite);
                inner.appendChild(textSpan);
                button.appendChild(inner);
                
                // Ajouter l'animation CSS
                if (!document.getElementById('frutiger-animation')) {
                    const style = document.createElement('style');
                    style.id = 'frutiger-animation';
                    style.textContent = `
                        @keyframes shine {
                            0% {
                                background-position: 130%;
                                opacity: 1;
                            }
                            100% {
                                background-position: -166%;
                                opacity: 0;
                            }
                        }
                        .frutiger-button:hover {
                            box-shadow: 0px 6px 12px 0px #0009;
                        }
                        .frutiger-button:active {
                            box-shadow: 0px 0px 0px 0px #0000;
                        }
                        .frutiger-button:active .inner::after {
                            box-shadow: inset 0px 2px 8px -2px #000a;
                        }
                    `;
                    document.head.appendChild(style);
                }
            };
        }

        let btnCopier = document.createElement("button");
        btnCopier.id = "btnCopier";
        const spanCopier = document.createElement("span");
        spanCopier.innerText = "Copier";
        btnCopier.appendChild(spanCopier);
        btnCopier.onclick = copierFormulaire;
        window.styleButton(btnCopier, "#28a745", "fa-copy"); // Vert pour le bouton Copier

        buttonContainer.appendChild(btnCopier); // Utiliser appendChild au lieu de prepend

        let storedCopies = JSON.parse(localStorage.getItem(storageKey));
        
        // Utiliser l'ordre pour afficher les boutons
        const orderedKeys = getOrderedKeys(storedCopies);
        orderedKeys.forEach(key => {
            const slotData = storedCopies[key];
            // VÃ©rifier si le bouton existe dÃ©jÃ 
            if (document.getElementById(`btnColler-${key}`)) return;
            
            // VÃ©rifier si l'Ã©lÃ©ment est liÃ© Ã  un symbole
            const currentSymbole = getCurrentSymbole();
            const isSymbolLinked = slotData.linkedSymbole;
            
            // Si l'Ã©lÃ©ment est liÃ© Ã  un symbole, vÃ©rifier la correspondance
            if (isSymbolLinked && isSymbolLinked !== currentSymbole) {
                return; // Ne pas afficher le bouton si le symbole ne correspond pas
            }
            
            let btnColler = document.createElement("button");
            btnColler.id = `btnColler-${key}`;
            btnColler.style.position = "relative"; // Pour positionner la croix
            btnColler.draggable = true; // Rendre le bouton draggable
            btnColler.className = "draggable-button"; // Ajouter la classe CSS
            btnColler.dataset.buttonKey = key; // Stocker la clÃ© pour le drag & drop
            
            const spanColler = document.createElement("span");
            spanColler.innerText = slotData.label || key;
            btnColler.appendChild(spanColler);
            btnColler.onclick = () => collerFormulaire(key);
            
            // Coloration diffÃ©rente si liÃ© Ã  un symbole
            const buttonColor = isSymbolLinked ? "#6f42c1" : "#007bff"; // Mauve si liÃ© Ã  un symbole, bleu sinon
            window.styleButton(btnColler, buttonColor, "fa-paste");
            
            // Ajouter la gestion du hover pour la suppression
            addDeleteFunctionality(btnColler, key);
            
            // Ajouter les event listeners pour le drag & drop
            addDragAndDropListeners(btnColler, buttonContainer);
            
            // Marquer que les listeners ont Ã©tÃ© ajoutÃ©s
            btnColler.setAttribute('data-drag-listeners', 'true');
            
            // Utiliser appendChild pour l'ordre naturel
            buttonContainer.appendChild(btnColler);
        });
    }

    function retirerBoutons() {
        document.getElementById("btnCopier")?.remove();
        const storedCopies = JSON.parse(localStorage.getItem(storageKey));
        Object.keys(storedCopies).forEach(key => {
            document.getElementById(`btnColler-${key}`)?.remove();
        });
    }

    function copierFormulaire() {
        const formulaire = document.querySelector('#panel-body-general');
        if (!formulaire) {
            sytoast('error', 'Formulaire non trouvÃ© sur cette page.');
            return;
        }

        const formData = {};
        formulaire.querySelectorAll('input, select, textarea').forEach((element) => {
            if (element.tagName === 'SELECT' && element.multiple) {
                formData[element.name] = Array.from(element.selectedOptions).map(option => option.value);
            } else {
                formData[element.name] = element.value;
            }
        });

        // Capturer les donnÃ©es des boutons de consistance
        let consistanceData = null;
        const btnGroup = document.querySelector('.btn-group.pull-right[aria-label="Consistance RÃ©paration"]');
        if (btnGroup) {
            // Chercher d'abord le bouton avec btn-primary (actuellement sÃ©lectionnÃ©)
            let selectedButton = btnGroup.querySelector('button.btn-primary');
            
            // Si aucun bouton btn-primary trouvÃ©, chercher le bouton avec btn-success ou autre classe active
            if (!selectedButton) {
                selectedButton = btnGroup.querySelector('button.btn-success, button.active, button[class*="selected"]');
            }
            
            // Si toujours rien, ne pas crÃ©er de donnÃ©es de consistance (aucune sÃ©lection)
            if (selectedButton) {
                consistanceData = {
                    collectorValue: selectedButton.getAttribute('collector-value'),
                    buttonText: selectedButton.textContent.trim(),
                    buttonId: selectedButton.id
                };
            } else {
            }
        } else {
        }

        // Capturer les valeurs des indices (organe et logiciel)
        let indicesData = null;
        const indiceOrganeArr = document.getElementById('S_indice_organe_arr');
        const indiceOrganeDep = document.getElementById('S_indice_organe_dep');
        const indiceLogicielArr = document.getElementById('S_indice_logiciel_arr');
        const indiceLogicielDep = document.getElementById('S_indice_logiciel_dep');
        
        if (indiceOrganeArr || indiceOrganeDep || indiceLogicielArr || indiceLogicielDep) {
            indicesData = {
                S_indice_organe_arr: indiceOrganeArr?.value || '',
                S_indice_organe_dep: indiceOrganeDep?.value || '',
                S_indice_logiciel_arr: indiceLogicielArr?.value || '',
                S_indice_logiciel_dep: indiceLogicielDep?.value || ''
            };
        } else {
        }

        // CrÃ©er une boÃ®te de dialogue personnalisÃ©e pour la copie
        const dialog = document.createElement('div');
        dialog.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            border: 2px solid #ccc;
            border-radius: 10px;
            padding: 20px;
            z-index: 10000;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            min-width: 400px;
        `;

        const currentSymbole = getCurrentSymbole();
        
        dialog.innerHTML = `
            <h3 style="margin-top: 0;">Copier le formulaire</h3>
            <div style="margin-bottom: 15px;">
                <label for="presetName">Nom du preset :</label><br>
                <input type="text" id="presetName" style="width: 100%; padding: 5px; margin-top: 5px;" placeholder="Entrez un nom...">
            </div>
            <div style="margin-bottom: 15px;">
                <label>
                    <input type="checkbox" id="linkToSymbol" style="margin-right: 8px;">
                    Lier au symbole actuel (${currentSymbole || 'Non dÃ©tectÃ©'})
                </label>
            </div>
            <div style="text-align: right;">
                <button id="cancelCopy" style="margin-right: 10px; padding: 8px 16px;">Annuler</button>
                <button id="confirmCopy" style="padding: 8px 16px; background: #007bff; color: white; border: none; border-radius: 4px;">Copier</button>
            </div>
        `;

        document.body.appendChild(dialog);

        // GÃ©rer les Ã©vÃ©nements
        document.getElementById('cancelCopy').onclick = () => {
            document.body.removeChild(dialog);
        };

        document.getElementById('confirmCopy').onclick = () => {
            const presetName = document.getElementById('presetName').value.trim();
            const linkToSymbol = document.getElementById('linkToSymbol').checked;
            
            if (!presetName) {
                sytoast('warning', 'Veuillez entrer un nom pour le preset.');
                return;
            }

            const storedCopies = JSON.parse(localStorage.getItem(storageKey));
            const uniqueKey = Date.now().toString(); // Utiliser timestamp comme clÃ© unique
            
            const copyData = {
                data: formData,
                label: presetName,
                componentFailures: [...componentFailureRequests],
                consistanceData: consistanceData, // Ajouter les donnÃ©es de consistance
                indicesData: indicesData, // Ajouter les donnÃ©es des indices
                linkedSymbole: linkToSymbol ? currentSymbole : null,
                createdAt: new Date().toISOString()
            };

            storedCopies[uniqueKey] = copyData;
            localStorage.setItem(storageKey, JSON.stringify(storedCopies));
            
            sytoast('success', `Formulaire copiÃ© sous '${presetName}' !<br>RequÃªtes de composants enregistrÃ©es: ${componentFailureRequests.length}<br>LiÃ© au symbole: ${linkToSymbol ? currentSymbole : 'Non'}`);
            
            document.body.removeChild(dialog);
            location.reload(); // pour mettre Ã  jour les boutons
        };

        // Focus sur le champ de nom
        document.getElementById('presetName').focus();
    }

    // Fonction pour ajouter la fonctionnalitÃ© de suppression avec hover
    function addDeleteFunctionality(button, key) {
        let hoverTimeout;
        let deleteButton;
        
        button.addEventListener('mouseenter', () => {
            // DÃ©marrer le timer de 3 secondes
            hoverTimeout = setTimeout(() => {
                // CrÃ©er la croix de suppression
                deleteButton = document.createElement('div');
                deleteButton.innerHTML = '<i class="fa fa-times"></i>';
                deleteButton.style.cssText = `
                    position: absolute;
                    top: -8px;
                    right: -8px;
                    width: 18px;
                    height: 18px;
                    background: #dc3545;
                    color: white;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 10px;
                    font-weight: bold;
                    cursor: pointer;
                    z-index: 1001;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                    transition: all 0.2s ease;
                    transform: none;
                `;
                
                deleteButton.addEventListener('mouseenter', () => {
                    deleteButton.style.transform = 'scale(1.2)';
                    deleteButton.style.background = '#c82333';
                });
                
                deleteButton.addEventListener('mouseleave', () => {
                    deleteButton.style.transform = 'scale(1)';
                    deleteButton.style.background = '#dc3545';
                });
                
                deleteButton.addEventListener('click', (e) => {
                    e.stopPropagation(); // EmpÃªcher le clic sur le bouton principal
                    deletePreset(key);
                });
                
                button.appendChild(deleteButton);
            }, 500); // 2 secondes (modifiez cette valeur pour changer le dÃ©lai)
        });
        
        button.addEventListener('mouseleave', () => {
            // Annuler le timer si on quitte avant 3 secondes
            if (hoverTimeout) {
                clearTimeout(hoverTimeout);
            }
            
            // Supprimer la croix si elle existe
            if (deleteButton && button.contains(deleteButton)) {
                button.removeChild(deleteButton);
                deleteButton = null;
            }
        });
    }

    // Variables globales pour le drag & drop
    let draggedElement = null;
    let ghostButton = null;

    // Fonction pour ajouter les fonctionnalitÃ©s de drag & drop
    function addDragAndDropListeners(button, container) {

        button.addEventListener('dragstart', (e) => {
            draggedElement = button;
            button.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', button.dataset.buttonKey);
        });

        button.addEventListener('dragend', (e) => {
            button.classList.remove('dragging');
            if (ghostButton && ghostButton.parentNode) {
                ghostButton.parentNode.removeChild(ghostButton);
                ghostButton = null;
            }
            draggedElement = null;
        });

        button.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            
            if (draggedElement && draggedElement !== button) {
                // CrÃ©er ou dÃ©placer le ghost button
                if (!ghostButton) {
                    ghostButton = draggedElement.cloneNode(true);
                    ghostButton.className = ghostButton.className + ' ghost-button';
                    ghostButton.id = 'ghost-' + draggedElement.id;
                    // Nettoyer les event listeners du clone
                    ghostButton.onclick = null;
                    ghostButton.removeAttribute('draggable');
                }
                
                // DÃ©terminer la position du ghost
                const rect = button.getBoundingClientRect();
                const midpoint = rect.left + rect.width / 2;
                const mouseX = e.clientX;
                
                // Placer le ghost Ã  la bonne position
                if (mouseX < midpoint) {
                    // InsÃ©rer avant le bouton
                    if (button.previousSibling !== ghostButton) {
                        container.insertBefore(ghostButton, button);
                    }
                } else {
                    // InsÃ©rer aprÃ¨s le bouton
                    if (button.nextSibling !== ghostButton) {
                        container.insertBefore(ghostButton, button.nextSibling);
                    }
                }
            }
        });

        button.addEventListener('drop', (e) => {
            e.preventDefault();
            
            if (draggedElement && draggedElement !== button && ghostButton) {
                const draggedKey = draggedElement.dataset.buttonKey;
                
                // Reconstruire la liste complÃ¨te en fonction de la position actuelle du ghost
                rebuildOrderFromGhostPosition(draggedKey);
            }
            
            if (ghostButton && ghostButton.parentNode) {
                ghostButton.parentNode.removeChild(ghostButton);
                ghostButton = null;
            }
        });

        // Ajouter aussi des listeners sur le conteneur pour gÃ©rer les drops entre les boutons
        container.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            
            // Si on survole une zone vide, positionner le ghost Ã  la fin
            if (draggedElement && e.target === container) {
                if (!ghostButton) {
                    ghostButton = draggedElement.cloneNode(true);
                    ghostButton.className = ghostButton.className + ' ghost-button';
                    ghostButton.id = 'ghost-' + draggedElement.id;
                    ghostButton.onclick = null;
                    ghostButton.removeAttribute('draggable');
                }
                
                // Placer le ghost Ã  la fin du conteneur (mais avant le sÃ©parateur et le bouton copier)
                const separator = container.querySelector('span[style*="width: 100%"]');
                if (separator && ghostButton.parentNode !== container) {
                    container.insertBefore(ghostButton, separator);
                }
            }
        });

        container.addEventListener('drop', (e) => {
            e.preventDefault();
            
            // Si on drop sur le conteneur (zone vide) et qu'il y a un ghost
            if (draggedElement && ghostButton && e.target === container) {
                const draggedKey = draggedElement.dataset.buttonKey;
                
                // Utiliser la mÃªme logique de reconstruction
                rebuildOrderFromGhostPosition(draggedKey);
            }
            
            if (ghostButton && ghostButton.parentNode) {
                ghostButton.parentNode.removeChild(ghostButton);
                ghostButton = null;
            }
        });
    }

    // Fonction pour reconstruire l'ordre complet basé sur la position du ghost
    function rebuildOrderFromGhostPosition(draggedKey) {
        
        if (!ghostButton || !ghostButton.parentNode) {
            return;
        }
        
        const container = ghostButton.parentNode;
        const newOrder = [];
        
        // Parcourir tous les Ã©lÃ©ments dans le conteneur pour crÃ©er le nouvel ordre
        const allElements = Array.from(container.children);
        
        allElements.forEach(element => {
            // Si c'est le ghost, ajouter l'Ã©lÃ©ment drag
            if (element === ghostButton) {
                newOrder.push(draggedKey);
            }
            // Si c'est un bouton coller (pas le drag), l'ajouter Ã  la liste
            else if (element.id && element.id.startsWith('btnColler-') && element !== draggedElement) {
                const buttonKey = element.dataset.buttonKey;
                if (buttonKey && buttonKey !== draggedKey) {
                    newOrder.push(buttonKey);
                }
            }
        });
        
        
        // CORRECTION: Inverser pour compenser le prepend() dans refreshButtons
        // L'ordre DOM [A,B,C] avec prepend() s'affiche comme [C,B,A]
        // Donc pour avoir [A,B,C] Ã  l'affichage, on sauvegarde [C,B,A]
        const orderForSaving = [...newOrder].reverse();
        
        // Sauvegarder l'ordre inversÃ© pour compenser le prepend()
        setButtonOrder(orderForSaving);
        
        // VÃ©rification immÃ©diate de la sauvegarde
        const savedOrder = getButtonOrder();
        
        refreshButtons();
    }

    // Fonction pour rÃ©organiser l'ordre des boutons
    function reorderButtons(draggedKey, targetKey, insertBefore) {
        
        const currentOrder = getButtonOrder();
        
        // Retirer l'Ã©lÃ©ment dÃ©placÃ© de sa position actuelle
        const draggedIndex = currentOrder.indexOf(draggedKey);
        if (draggedIndex > -1) {
            currentOrder.splice(draggedIndex, 1);
        }
        
        // Trouver la nouvelle position
        const targetIndex = currentOrder.indexOf(targetKey);
        const newIndex = insertBefore ? targetIndex : targetIndex + 1;
        
        // InsÃ©rer l'Ã©lÃ©ment Ã  sa nouvelle position
        currentOrder.splice(newIndex, 0, draggedKey);
        
        // Sauvegarder le nouvel ordre
        setButtonOrder(currentOrder);
        
        // VÃ©rification immÃ©diate de la sauvegarde
        const savedOrder = getButtonOrder();
        
        // RafraÃ®chir l'affichage des boutons
        refreshButtons();
    }

    // Fonction pour rafraÃ®chir l'affichage des boutons
    function refreshButtons() {
        
        // Retirer tous les boutons de collage existants
        const existingButtons = document.querySelectorAll('[id^="btnColler-"]');
        existingButtons.forEach(btn => btn.remove());
        
        // RecrÃ©er les boutons dans le bon ordre
        const buttonContainer = getOrCreateButtonContainer();
        if (buttonContainer) {
            const storedCopies = JSON.parse(localStorage.getItem(storageKey));
            
            // Utiliser directement getButtonOrder pour garder l'ordre exact sauvÃ©
            const savedOrder = getButtonOrder();
            
            // Filtrer pour ne garder que les clÃ©s valides
            const validOrder = savedOrder.filter(key => storedCopies[key]);
            
            // CrÃ©er les boutons dans l'ordre sauvÃ© (avec appendChild, l'ordre est naturel)
            validOrder.forEach(key => {
                if (storedCopies[key]) {
                    createPasteButton(key, storedCopies[key], buttonContainer);
                }
            });
        }
    }

    // Fonction helper pour crÃ©er un bouton de collage
    function createPasteButton(key, slotData, buttonContainer) {
        // VÃ©rifier si l'Ã©lÃ©ment est liÃ© Ã  un symbole
        const currentSymbole = getCurrentSymbole();
        const isSymbolLinked = slotData.linkedSymbole;
        
        // Si l'Ã©lÃ©ment est liÃ© Ã  un symbole, vÃ©rifier la correspondance
        if (isSymbolLinked && isSymbolLinked !== currentSymbole) {
            return; // Ne pas afficher le bouton si le symbole ne correspond pas
        }
        
        let btnColler = document.createElement("button");
        btnColler.id = `btnColler-${key}`;
        btnColler.style.position = "relative";
        btnColler.draggable = true;
        btnColler.className = "draggable-button";
        btnColler.dataset.buttonKey = key;
        
        const spanColler = document.createElement("span");
        spanColler.innerText = slotData.label || key;
        btnColler.appendChild(spanColler);
        btnColler.onclick = () => collerFormulaire(key);
        
        // Coloration diffÃ©rente si liÃ© Ã  un symbole
        const buttonColor = isSymbolLinked ? "#6f42c1" : "#007bff";
        window.styleButton(btnColler, buttonColor, "fa-paste");
        
        // Ajouter la gestion du hover pour la suppression
        addDeleteFunctionality(btnColler, key);
        
        // Ajouter les event listeners pour le drag & drop
        addDragAndDropListeners(btnColler, buttonContainer);
        
        // Utiliser appendChild pour l'ordre naturel
        buttonContainer.appendChild(btnColler);
    }

    // Fonction pour supprimer un preset
    function deletePreset(key) {
        const storedCopies = JSON.parse(localStorage.getItem(storageKey));
        const presetName = storedCopies[key]?.label || key;
        
        if (confirm(`ÃŠtes-vous sÃ»r de vouloir supprimer le preset "${presetName}" ?`)) {
            delete storedCopies[key];
            localStorage.setItem(storageKey, JSON.stringify(storedCopies));
            
            // Mettre Ã  jour l'ordre en retirant la clÃ© supprimÃ©e
            const currentOrder = getButtonOrder();
            const updatedOrder = currentOrder.filter(orderKey => orderKey !== key);
            setButtonOrder(updatedOrder);
            
            // Retirer le bouton du DOM
            const buttonToRemove = document.getElementById(`btnColler-${key}`);
            if (buttonToRemove) {
                buttonToRemove.remove();
            }
            
            sytoast('success', `Preset "${presetName}" supprimÃ© avec succÃ¨s !`);
        }
    }


    // Fonction pour valider le textarea via l'API
    async function validateTextarea(textValue) {
        try {
            // RÃ©cupÃ©rer les valeurs nÃ©cessaires du DOM
            const idUserElement = document.getElementById('idUser');
            const idRepElement = document.getElementById('idRep');

            if (!idUserElement || !idRepElement) {
                return false;
            }

            const payload = new FormData();
            payload.append('S_observation_reparation', textValue);
            payload.append('field', 'S_observation_reparation');
            payload.append('fonctionnel_transition_id', '277');
            payload.append('form_id', 'Saisie_Intervention');
            payload.append('save_on_validate', 'true');
            payload.append('idUser', idUserElement.value);
            payload.append('current_repair_id', idRepElement.value);

            const response = await fetch('https://prod.cloud-collectorplus.mt.sncf.fr/Prm/Reparation/Validate', {
                method: 'POST',
                body: payload,
                credentials: 'include' // Pour inclure les cookies de session
            });

            if (response.ok) {
                return true;
            } else {
                return false;
            }
        } catch (error) {
            return false;
        }
    }

    function collerFormulaire(slot) {
        
        // Fonction pour attendre que le formulaire soit prÃ©sent
        function attendreFormulaire(callback, maxAttempts = 20) {
            let attempts = 0;
            const checkInterval = setInterval(() => {
                attempts++;
                const formulaire = document.querySelector('#panel-body-general');
                
                if (formulaire) {
                    clearInterval(checkInterval);
                    callback();
                } else {
                    
                    if (attempts >= maxAttempts) {
                        clearInterval(checkInterval);
                        sytoast('error', 'Formulaire non trouvÃ© - Veuillez ouvrir une rÃ©paration avant de coller.');
                    }
                }
            }, 500); // VÃ©rifier toutes les 500ms
        }
        
        // Attendre que le formulaire soit prÃ©sent avant de continuer
        attendreFormulaire(() => {
            
            // Modifier la classe du bouton de consistance
            const consistanceButton = document.getElementById('id_dico_consistance_1');
            if (consistanceButton) {
                consistanceButton.className = 'btn btn-primary';
            } else {
            }

            // Ajouter 1 seconde de latence avant de lancer la fonction actuelle
            setTimeout(() => {
                
                const formulaire = document.querySelector('#panel-body-general');
                if (!formulaire) {
                    sytoast('error', 'Formulaire non trouvÃ© sur cette page.');
                    return;
                }

                let storedCopies = JSON.parse(localStorage.getItem(storageKey));
                const formData = storedCopies[slot]?.data;
                if (!formData) {
                    sytoast('error', 'Aucune donnÃ©e enregistrÃ©e pour ' + slot);
                    return;
                }

                // RÃ©pÃ©ter plusieurs fois la saisie
                let repeatCount = 4; // nombre de fois que tu veux injecter les donnÃ©es
                let delay = 200; // en millisecondes

                let current = 0;

                const remplir = () => {
                    formulaire.querySelectorAll('input, select, textarea').forEach((element) => {
                        const value = formData[element.name];
                        if (value !== undefined) {
                            if (element.tagName === 'SELECT' && element.multiple) {
                                Array.from(element.options).forEach(option => {
                                    option.selected = value.includes(option.value);
                                });

                                const container = element.closest('.bootstrap-select');
                                if (container) {
                                    const display = container.querySelector('.filter-option-inner-inner');
                                    if (display) {
                                        display.textContent = Array.from(element.selectedOptions).map(opt => opt.textContent).join(', ');
                                    }
                                }

                            } else {
                                element.value = value;
                            }

                            element.dispatchEvent(new Event('input', { bubbles: true }));
                            element.dispatchEvent(new Event('change', { bubbles: true }));
                            element.dispatchEvent(new Event('blur', { bubbles: true }));
                        }
                    });
                };

                const loop = () => {
                if (current < repeatCount) {
                    remplir();
                    current++;
                    setTimeout(loop, delay);
                } else {

                    // Cliquer sur le bouton de consistance si les donnÃ©es existent
                    const consistanceData = storedCopies[slot]?.consistanceData;
                    if (consistanceData && consistanceData.collectorValue) {
                        setTimeout(() => {
                            try {
                                clickConsistanceButtonByValue(consistanceData.collectorValue);
                            } catch (error) {
                            }
                        }, 500); // DÃ©lai pour laisser le DOM se stabiliser
                    } else {
                    }

                    // Restaurer les valeurs des indices si elles existent (avec dÃ©lais entre chaque)
                    const indicesData = storedCopies[slot]?.indicesData;
                    if (indicesData) {
                        
                        // Restaurer S_indice_organe_arr (premier champ - dÃ©lai 700ms)
                        setTimeout(() => {
                            try {
                                const indiceOrganeArr = document.getElementById('S_indice_organe_arr');
                                if (indiceOrganeArr && indicesData.S_indice_organe_arr) {
                                    indiceOrganeArr.value = indicesData.S_indice_organe_arr;
                                    indiceOrganeArr.dispatchEvent(new Event('input', { bubbles: true }));
                                    indiceOrganeArr.dispatchEvent(new Event('change', { bubbles: true }));
                                    indiceOrganeArr.dispatchEvent(new Event('blur', { bubbles: true }));
                                } else {
                                }
                            } catch (error) {
                            }
                        }, 700);
                        
                        // Restaurer S_indice_organe_dep (deuxiÃ¨me champ - dÃ©lai 1200ms)
                        setTimeout(() => {
                            try {
                                const indiceOrganeDep = document.getElementById('S_indice_organe_dep');
                                if (indiceOrganeDep && indicesData.S_indice_organe_dep) {
                                    indiceOrganeDep.value = indicesData.S_indice_organe_dep;
                                    indiceOrganeDep.dispatchEvent(new Event('input', { bubbles: true }));
                                    indiceOrganeDep.dispatchEvent(new Event('change', { bubbles: true }));
                                    indiceOrganeDep.dispatchEvent(new Event('blur', { bubbles: true }));
                                } else {
                                }
                            } catch (error) {
                            }
                        }, 1200);
                        
                        // Restaurer S_indice_logiciel_arr (troisiÃ¨me champ - dÃ©lai 1700ms)
                        setTimeout(() => {
                            try {
                                const indiceLogicielArr = document.getElementById('S_indice_logiciel_arr');
                                if (indiceLogicielArr && indicesData.S_indice_logiciel_arr) {
                                    indiceLogicielArr.value = indicesData.S_indice_logiciel_arr;
                                    indiceLogicielArr.dispatchEvent(new Event('input', { bubbles: true }));
                                    indiceLogicielArr.dispatchEvent(new Event('change', { bubbles: true }));
                                    indiceLogicielArr.dispatchEvent(new Event('blur', { bubbles: true }));
                                } else {
                                }
                            } catch (error) {
                            }
                        }, 1700);
                        
                        // Restaurer S_indice_logiciel_dep (quatriÃ¨me champ - dÃ©lai 2200ms)
                        setTimeout(() => {
                            try {
                                const indiceLogicielDep = document.getElementById('S_indice_logiciel_dep');
                                if (indiceLogicielDep && indicesData.S_indice_logiciel_dep) {
                                    indiceLogicielDep.value = indicesData.S_indice_logiciel_dep;
                                    indiceLogicielDep.dispatchEvent(new Event('input', { bubbles: true }));
                                    indiceLogicielDep.dispatchEvent(new Event('change', { bubbles: true }));
                                    indiceLogicielDep.dispatchEvent(new Event('blur', { bubbles: true }));
                                } else {
                                }
                            } catch (error) {
                            }
                        }, 2200);
                        
                        // Cliquer sur le bouton "Valider" aprÃ¨s la restauration de tous les indices (dÃ©lai 3000ms)
                        setTimeout(() => {
                            try {
                                const validateButton = document.getElementById('fonctionnel_validate_form');
                                if (validateButton) {
                                    
                                    validateButton.click();
                                } else {
                                    const alternativeButtons = document.querySelectorAll('.btn-success');
                                    alternativeButtons.forEach((btn, i) => {
                                    });
                                }
                            } catch (error) {
                            }
                        }, 3000);
                    } else {
                    }

                    // Validation du textarea aprÃ¨s remplissage
                    const textareaElement = document.getElementById('S_observation_reparation');
                    if (textareaElement && textareaElement.value) {
                        validateTextarea(textareaElement.value).then((ok) => {
                            if (ok) {
                                const presetLabel = storedCopies[slot]?.label || slot;
                                sytoast('success', 'DonnÃ©es collÃ©es et validÃ©es avec succÃ¨s pour ' + presetLabel);
                            } else {
                                sytoast('error', "Ã‰chec de la validation du textarea.");
                            }
                        });
                    }
                }
                };

                loop();

                // Rejouer les requÃªtes de composants aprÃ¨s le remplissage
                const componentFailures = storedCopies[slot]?.componentFailures;
                if (componentFailures && componentFailures.length > 0) {
                    setTimeout(() => {
                        replayComponentFailureRequests(componentFailures);
                    }, 1000); // Attendre 1 seconde aprÃ¨s le remplissage du formulaire
                }
            }, 1000); // Latence d'1 seconde avant de lancer la fonction actuelle
        }); // Fin du callback attendreFormulaire
    }

    // Rejouer les requÃªtes EditComponentFailure
    async function replayComponentFailureRequests(componentFailures) {
        const idRepElement = document.getElementById('idRep');
        const idUserElement = document.getElementById('idUser');

        if (!idRepElement || !idUserElement) {
            return;
        }

        const idRep = idRepElement.value;
        const idUser = idUserElement.value;

        for (let i = 0; i < componentFailures.length; i++) {
            const componentData = componentFailures[i];
            
            try {
                const formData = new FormData();
                formData.append('fk_dico_constituant', componentData.fk_dico_constituant);
                formData.append('fk_dico_defaut_constituant', componentData.fk_dico_defaut_constituant);
                formData.append('S_repere', componentData.S_repere);
                formData.append('idt_t_reparation_has_lst_dico_constituant', componentData.idt_t_reparation_has_lst_dico_constituant);
                formData.append('t_reparation_idt_reparation', idRep);
                formData.append('idUser', idUser);
                formData.append('current_repair_id', idRep);

                const response = await fetch('https://prod.cloud-collectorplus.mt.sncf.fr/Prm/ReparationForms/Saisie_Intervention/EditComponentFailure', {
                    method: 'POST',
                    body: formData,
                    credentials: 'include'
                });

                if (response.ok) {
                    
                    // RÃ©cupÃ©rer et traiter la rÃ©ponse JSON
                    try {
                        const responseData = await response.json();
                        
                        // VÃ©rifier si la rÃ©ponse contient du HTML pour les composants
                        if (responseData.status === "OK" && responseData.component_panel) {
                            updateComponentsTable(responseData.component_panel);
                        } else {
                        }
                    } catch (jsonError) {
                    }
                } else {
                }

                // DÃ©lai entre les requÃªtes pour Ã©viter la surcharge
                if (i < componentFailures.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 300));
                }

            } catch (error) {
            }
        }
        sytoast('success', 'Composant ajoutÃ© avec succÃ¨s !');
    }

    // Fonction pour mettre Ã  jour le tableau des composants avec le HTML reÃ§u
    function updateComponentsTable(htmlContent) {
        try {
            
            // Trouver le tableau dans .dataTables_scrollBody
            const scrollBodyTable = document.querySelector('.dataTables_scrollBody #components_panel_table');
            
            if (scrollBodyTable) {
                
                // Parser le nouveau HTML pour extraire le tbody
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = htmlContent;
                const newTable = tempDiv.querySelector('#components_panel_table');
                
                if (newTable) {
                    const newTbody = newTable.querySelector('tbody');
                    const existingTbody = scrollBodyTable.querySelector('tbody');
                    
                    if (newTbody && existingTbody) {
                        
                        // Copier les nouvelles lignes avec leurs attributs DataTables
                        const newRows = Array.from(newTbody.querySelectorAll('tr'));
                        
                        // Vider le tbody existant
                        existingTbody.innerHTML = '';
                        
                        // Ajouter les nouvelles lignes avec les classes DataTables appropriÃ©es
                        newRows.forEach((row, index) => {
                            // Ajouter les classes DataTables pour le tri et les styles
                            row.setAttribute('role', 'row');
                            row.classList.add(index % 2 === 0 ? 'odd' : 'even');
                            
                            // Ajouter les classes sorting aux cellules si nÃ©cessaire
                            const cells = row.querySelectorAll('td');
                            cells.forEach(cell => {
                                if (cell.classList.contains('component_default')) {
                                    cell.classList.add('sorting_1');
                                }
                            });
                            
                            existingTbody.appendChild(row);
                        });
                        
                        // DÃ©clencher des Ã©vÃ©nements DataTables pour rÃ©initialiser le tri/pagination
                        if (window.$ && $.fn.DataTable) {
                            const dataTable = $('#components_panel_table').DataTable();
                            if (dataTable) {
                                dataTable.draw(false);
                            }
                        }
                        
                        // DÃ©clencher un Ã©vÃ©nement personnalisÃ©
                        scrollBodyTable.dispatchEvent(new Event('contentUpdated', { bubbles: true }));
                        
                        // Cliquer automatiquement sur le bouton avec btn-primary aprÃ¨s l'hydratation
                        setTimeout(() => {
                            clickConsistanceButton();
                        }, 900); // DÃ©lai pour laisser le DOM se stabiliser
                        
                    } else {
                        scrollBodyTable.replaceWith(newTable);
                        
                        // Cliquer sur le bouton mÃªme en cas de remplacement complet
                        setTimeout(() => {
                            clickConsistanceButton();
                        }, 900);
                    }
                } else {
                }
                
            } else {
                
                // Fallback vers l'ancien comportement
                const existingContainer = document.getElementById('components_table_container');
                if (existingContainer) {
                    existingContainer.innerHTML = htmlContent;
                } else {
                }
            }
            
        } catch (error) {
        }
    }

    // Fonction pour envoyer la requÃªte de validation de consistance comme le fait le systÃ¨me
    async function sendConsistanceValidationRequest(collectorValue) {
        try {
            
            // RÃ©cupÃ©rer les valeurs nÃ©cessaires du DOM
            const idUserElement = document.getElementById('idUser');
            const currentRepairIdElement = document.getElementById('idRep');
            const fonctionnelTransitionIdElement = document.getElementById('fonctionnel_transition_id');

            if (!idUserElement || !currentRepairIdElement) {
                return false;
            }

            // Construire le payload comme dans la vraie requÃªte
            const formData = new FormData();
            formData.append('id_dico_consistance', collectorValue);
            formData.append('field', 'id_dico_consistance');
            formData.append('fonctionnel_transition_id', fonctionnelTransitionIdElement?.value || '284');
            formData.append('do_not_redraw_form', '0');
            formData.append('form_id', 'Saisie_Intervention');
            formData.append('save_on_validate', 'true');
            formData.append('idUser', idUserElement.value);
            formData.append('current_repair_id', currentRepairIdElement.value);
            for (let [key, value] of formData.entries()) {
            }

            const response = await fetch('https://prod.cloud-collectorplus.mt.sncf.fr/Prm/Reparation/Validate', {
                method: 'POST',
                body: formData,
                credentials: 'include'
            });

            if (response.ok) {
                const responseData = await response.json();
                
                if (responseData.status === "OK" && responseData.form) {
                    
                    // Remplacer le contenu du formulaire avec la rÃ©ponse du serveur
                    // Chercher le formulaire principal
                    const mainForm = document.getElementById('Saisie_Intervention');
                    if (mainForm) {
                        // Parser la rÃ©ponse HTML
                        const tempDiv = document.createElement('div');
                        tempDiv.innerHTML = responseData.form;
                        const newForm = tempDiv.querySelector('#Saisie_Intervention');
                        
                        if (newForm) {
                            // Remplacer le formulaire existant par le nouveau
                            mainForm.innerHTML = newForm.innerHTML;
                            
                            // DÃ©clencher les Ã©vÃ©nements nÃ©cessaires pour rÃ©initialiser les plugins
                            if (window.$ && $.fn.selectpicker) {
                                $('.selectpicker').selectpicker('refresh');
                            }
                        }
                    } else {
                        
                        // Fallback: mettre Ã  jour uniquement la section de consistance
                        updateConsistanceSection(responseData.form);
                    }
                    
                    return true;
                } else {
                    return false;
                }
                
            } else {
                return false;
            }
            
        } catch (error) {
            return false;
        }
    }

    // Fonction pour mettre Ã  jour uniquement la section de consistance
    function updateConsistanceSection(newFormHTML) {
        try {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = newFormHTML;
            
            // Chercher la nouvelle section de consistance
            const newBtnGroup = tempDiv.querySelector('.btn-group.pull-right[aria-label="Consistance RÃ©paration"]');
            const existingBtnGroup = document.querySelector('.btn-group.pull-right[aria-label="Consistance RÃ©paration"]');
            
            if (newBtnGroup && existingBtnGroup) {
                // Remplacer les boutons existants par les nouveaux
                existingBtnGroup.innerHTML = newBtnGroup.innerHTML;
            } else {
            }
        } catch (error) {
        }
    }

    // Fonction pour cliquer sur le bouton de consistance par valeur collector-value
    function clickConsistanceButtonByValue(targetCollectorValue) {
        try {
            
            // Trouver le conteneur des boutons de consistance
            const btnGroup = document.querySelector('.btn-group.pull-right[aria-label="Consistance RÃ©paration"]');
            
            if (btnGroup) {
                
                // Chercher le bouton avec la collector-value correspondante
                const targetButton = btnGroup.querySelector(`button[collector-value="${targetCollectorValue}"]`);
                
                if (targetButton) {
                    
                    // Au lieu de modifier les classes manuellement, envoyer la requÃªte de validation
                    // comme le fait le vrai systÃ¨me
                    sendConsistanceValidationRequest(targetCollectorValue);
                    
                } else {
                    
                    // Lister tous les boutons disponibles pour debug
                    const allButtons = btnGroup.querySelectorAll('button[collector-value]');
                    allButtons.forEach((btn, index) => {
                    });
                }
                
            } else {
                
                // Recherche alternative plus large
                const alternativeButton = document.querySelector(`button[collector-value="${targetCollectorValue}"]`);
                if (alternativeButton) {
                    sendConsistanceValidationRequest(targetCollectorValue);
                } else {
                }
            }
            
        } catch (error) {
        }
    }

    // Fonction pour cliquer sur le bouton de consistance avec la classe btn-primary
    function clickConsistanceButton() {
        try {
            
            // Trouver le conteneur des boutons de consistance
            const btnGroup = document.querySelector('.btn-group.pull-right[aria-label="Consistance RÃ©paration"]');
            
            if (btnGroup) {
                
                // Chercher le bouton avec la classe btn-primary dans ce groupe
                const primaryButton = btnGroup.querySelector('button.btn-primary');
                
                if (primaryButton) {
                    
                    // Simuler un clic sur le bouton
                    primaryButton.click();
                    
                    // DÃ©clencher aussi les Ã©vÃ©nements manuellement au cas oÃ¹
                    primaryButton.dispatchEvent(new Event('click', { bubbles: true }));
                    primaryButton.dispatchEvent(new Event('change', { bubbles: true }));
                    
                } else {
                    
                    // Lister tous les boutons disponibles pour debug
                    const allButtons = btnGroup.querySelectorAll('button');
                    allButtons.forEach((btn, index) => {
                    });
                }
                
            } else {
                
                // Recherche alternative plus large
                const alternativeButton = document.querySelector('button.btn-primary[collector-value]');
                if (alternativeButton) {
                    alternativeButton.click();
                } else {
                }
            }
            
        } catch (error) {
        }
    }

})();
