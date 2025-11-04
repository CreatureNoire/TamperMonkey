(function() {
    'use strict';

    // Define your values

    let numSer = '';
    let symbole = '';
    let nomModule = '';
    let causeRebut = '';
    let numOF = '';

    function fillPowerAppsInput(selector, value) {
        const input = unsafeWindow.document.querySelector(selector);
        if (input) {
            input.value = value;
            input.dispatchEvent(new unsafeWindow.Event('input', { bubbles: true }));
            input.dispatchEvent(new unsafeWindow.Event('change', { bubbles: true }));
            console.log(`[DEBUG] Remplissage réussi: selector='${selector}', value='${value}'`);
        } else {
            console.log(`[DEBUG] Champ non trouvé: selector='${selector}'`);
        }
    }

    function fillInput() {
        console.log('[DEBUG] fillInput() appelée');
        // Only fill if we're on the correct form
        if (!document.querySelector("body") || !document.body.textContent.includes('Demande de mise en rebut d\'une PRM')) {
            console.log('[DEBUG] Forme incorrecte détectée, remplissage ignoré');
            return;
        }
        console.log('[DEBUG] Forme correcte détectée, valeurs:', { numSer, symbole, nomModule, causeRebut, numOF });
        // Remplir uniquement si les valeurs ne sont pas vides
        if (numSer || symbole || nomModule || causeRebut || numOF) {
            console.log('[DEBUG] Remplissage des inputs PowerApps');
            fillPowerAppsInput("input[appmagic-control='TextInput7_3textbox']", numSer);
            fillPowerAppsInput("input[appmagic-control='TextInput7_2textbox']", symbole);
            fillPowerAppsInput("input[appmagic-control='TextInput7_4textbox']", nomModule);
            fillPowerAppsInput("input[appmagic-control='TextInput7_5textbox']", causeRebut);
            fillPowerAppsInput("input[appmagic-control='TextInput7textbox']", numOF);
            
            // Remplir le lien CollectorPlus si disponible
            const collectorLinkInput = unsafeWindow.document.getElementById('collectorLink');
            if (collectorLinkInput && collectorLinkInput.value.trim()) {
                fillPowerAppsInput("input[appmagic-control='TextInput7_6textbox']", collectorLinkInput.value.trim());
                console.log('[DEBUG] Lien CollectorPlus rempli:', collectorLinkInput.value.trim());
            }
            
            // Contourner la validation d'image obligatoire
            bypassImageValidation();
        } else {
            console.log('[DEBUG] Les variables sont vides, remplissage ignoré');
        }
    }

    function bypassImageValidation() {
        console.log('[DEBUG] Tentative de contournement de la validation d\'image');
        
        // Simuler la présence d'une image en modifiant les éléments DOM
        setTimeout(() => {
            // Chercher le bouton d'envoi qui pourrait être bloqué
            const sendButton = unsafeWindow.document.querySelector('div[data-appmagic-icon-name="Basel_Send"]');
            if (sendButton) {
                console.log('[DEBUG] Bouton d\'envoi trouvé, suppression des restrictions');
                
                // Supprimer les attributs qui pourraient bloquer l'envoi
                const parentButton = sendButton.closest('.powerapps-icon');
                if (parentButton) {
                    parentButton.removeAttribute('aria-disabled');
                    parentButton.style.pointerEvents = 'auto';
                    parentButton.style.opacity = '1';
                    console.log('[DEBUG] Restrictions du bouton d\'envoi supprimées');
                }
            }
            
            // Masquer le message "Image PRM :" si présent
            const imageLabels = unsafeWindow.document.querySelectorAll('.appmagic-label-text');
            imageLabels.forEach(label => {
                if (label.textContent && label.textContent.includes('Image PRM')) {
                    console.log('[DEBUG] Label "Image PRM" trouvé, masquage');
                    const container = label.closest('.appmagic-group');
                    if (container) {
                        container.style.display = 'none';
                        console.log('[DEBUG] Container d\'image masqué');
                    }
                }
            });
            
            // Simuler qu'une image est présente en modifiant les classes
            const addMediaButtons = unsafeWindow.document.querySelectorAll('.addmedia-no-media');
            addMediaButtons.forEach(button => {
                button.style.display = 'none';
                console.log('[DEBUG] Bouton "ajouter image" masqué');
            });
            
            const hasMediaButtons = unsafeWindow.document.querySelectorAll('.addmedia-has-media');
            hasMediaButtons.forEach(button => {
                button.style.display = 'block';
                console.log('[DEBUG] État "image présente" activé');
            });
            
            // Créer une image fictive si nécessaire
            const imageContainers = unsafeWindow.document.querySelectorAll('.appmagic-image');
            imageContainers.forEach(container => {
                const img = container.querySelector('img');
                if (img && (!img.src || img.src.includes('blob:'))) {
                    // Créer une image 1x1 pixel transparente
                    const transparentPixel = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
                    img.src = transparentPixel;
                    img.style.visibility = 'visible';
                    console.log('[DEBUG] Image fictive créée');
                }
            });
            
        }, 500);
    }

    // Suppression du remplissage automatique au chargement et via MutationObserver

    // Add glitch CSS styles
    function addGlitchStyles() {
        const style = unsafeWindow.document.createElement('style');
        style.textContent = `
            .glitch-form-wrapper {
                --bg-color: #0d0d0d;
                --primary-color: #00f2ea;
                --secondary-color: #a855f7;
                --text-color: #e5e5e5;
                --font-family: "Fira Code", Consolas, "Courier New", Courier, monospace;
                --glitch-anim-duration: 0.5s;
                font-family: var(--font-family);
            }

            .glitch-card {
                background-color: var(--bg-color);
                border: 1px solid rgba(0, 242, 234, 0.2);
                box-shadow: 0 0 20px rgba(0, 242, 234, 0.1), inset 0 0 10px rgba(0, 0, 0, 0.5);
                overflow: hidden;
                opacity: 0.75;
                backdrop-filter: blur(5px);
                border-radius: 12px;
            }

            .card-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                background-color: rgba(0, 0, 0, 0.3);
                padding: 0.5em 1em;
                border-bottom: 1px solid rgba(0, 242, 234, 0.2);
            }

            .card-title {
                color: var(--primary-color);
                font-size: 0.8rem;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 0.1em;
                margin: 0;
            }

            .card-body {
                padding: 1rem;
            }

            .form-group {
                position: relative;
                margin-bottom: 1rem;
            }

            .form-label {
                position: absolute;
                top: 0.75em;
                left: 0;
                font-size: 0.8rem;
                color: var(--primary-color);
                opacity: 0.6;
                text-transform: uppercase;
                letter-spacing: 0.1em;
                pointer-events: none;
                transition: all 0.3s ease;
            }

            .glitch-input {
                width: 100%;
                background: transparent;
                border: none;
                border-bottom: 2px solid rgba(0, 242, 234, 0.3);
                padding: 0.75em 0;
                font-size: 0.9rem;
                color: var(--text-color);
                font-family: inherit;
                outline: none;
                transition: border-color 0.3s ease;
            }

            .glitch-input:focus {
                border-color: var(--primary-color);
            }

            .glitch-input:focus + .form-label,
            .glitch-input:not(:placeholder-shown) + .form-label {
                top: -1.2em;
                font-size: 0.7rem;
                opacity: 1;
            }

            .submit-btn {
                width: 100%;
                padding: 0.6em;
                margin: 0.5rem 0;
                background-color: transparent;
                border: 2px solid var(--primary-color);
                color: var(--primary-color);
                font-family: inherit;
                font-size: 0.8rem;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 0.1em;
                cursor: pointer;
                transition: all 0.3s;
                overflow: hidden;
                border-radius: 8px;
            }

            .submit-btn:hover,
            .submit-btn:focus {
                background-color: var(--primary-color);
                color: var(--bg-color);
                box-shadow: 0 0 15px var(--primary-color);
                outline: none;
            }

            .submit-btn:active {
                transform: scale(0.97);
            }

            .edit-section {
                border-top: 1px solid rgba(0, 242, 234, 0.2);
                margin-top: 1rem;
                padding-top: 1rem;
            }
        `;
        unsafeWindow.document.head.appendChild(style);
    }

    // Create UI panel for input modification
    function createUIPanel() {
        // Add CSS styles first
        addGlitchStyles();

        const panel = unsafeWindow.document.createElement('div');
        panel.className = 'glitch-form-wrapper';
        panel.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            width: 200px;
            z-index: 10000;
        `;
        panel.innerHTML = `
            <div class="glitch-card">
                <div class="card-header">
                    <h3 class="card-title">🔧 Copie/Colle Cause Rebut</h3>
                </div>
                <div class="card-body">
                    <div class="form-group">
                        <input type="text" id="collectorLink" placeholder=" " class="glitch-input">
                        <label class="form-label" data-text="Lien CollectorPlus">Lien CollectorPlus</label>
                    </div>
                    <button id="fetchData" class="submit-btn" data-text="Récupérer données">
                        <span class="btn-text">Récupérer données</span>
                    </button>
                    <button id="toggleEdit" class="submit-btn" data-text="Édition manuelle">
                        <span class="btn-text">Édition manuelle</span>
                    </button>
                    <div id="editSection" class="edit-section" style="display: none;">

                        <div class="form-group">
                            <input type="text" id="manualNumSer" value="${numSer}" placeholder=" " class="glitch-input">
                            <label class="form-label" data-text="Numéro Série">Numéro Série</label>
                        </div>
                        <div class="form-group">
                            <input type="text" id="manualSymbole" value="${symbole}" placeholder=" " class="glitch-input">
                            <label class="form-label" data-text="Symbole">Symbole</label>
                        </div>
                        <div class="form-group">
                            <input type="text" id="manualNomModule" value="${nomModule}" placeholder=" " class="glitch-input">
                            <label class="form-label" data-text="Nom Module">Nom Module</label>
                        </div>
                        <div class="form-group">
                            <input type="text" id="manualCauseRebut" value="${causeRebut}" placeholder=" " class="glitch-input">
                            <label class="form-label" data-text="Cause Rebut">Cause Rebut</label>
                        </div>
                        <div class="form-group">
                            <input type="text" id="manualNumOF" value="${numOF}" placeholder=" " class="glitch-input">
                            <label class="form-label" data-text="Numéro OF">Numéro OF</label>
                        </div>
                        <button id="updateValues" class="submit-btn" data-text="Mettre à jour">
                            <span class="btn-text">Mettre à jour</span>
                        </button>
                        <button id="bypassImage" class="submit-btn" data-text="Contourner Image">
                            <span class="btn-text">Contourner Image</span>
                        </button>
                    </div>
                </div>
            </div>
        `;

        unsafeWindow.document.body.appendChild(panel);
        console.log('[DEBUG] Panneau créé et ajouté au DOM');

        // Toggle edit section
        unsafeWindow.document.getElementById('toggleEdit').addEventListener('click', () => {
            const editSection = unsafeWindow.document.getElementById('editSection');
            editSection.style.display = editSection.style.display === 'none' ? 'block' : 'none';
        });

        // Update values function
        function updateConstants(newNumSer, newSymbole, newNomModule, newCauseRebut, newNumOF) {
            console.log('[DEBUG] updateConstants appelée avec:', {
                newNumSer,
                newSymbole,
                newNomModule,
                newCauseRebut,
                newNumOF
            });
            console.trace('[DEBUG] Stack trace updateConstants');
            numSer = newNumSer;
            symbole = newSymbole;
            nomModule = newNomModule;
            causeRebut = newCauseRebut;
            numOF = newNumOF;
            console.log('[DEBUG] Variables mises à jour:', { numSer, symbole, nomModule, causeRebut, numOF });
            // Si l'appel vient du bouton manuel, ne jamais écraser le champ
            if (unsafeWindow.document.activeElement && unsafeWindow.document.activeElement.id === 'updateValues') {
                console.log('[DEBUG] Edition manuelle détectée, champs HTML non écrasés');
                // Edition manuelle : on ne touche pas aux champs HTML
            } else {
                console.log('[DEBUG] Synchronisation CollectorPlus, mise à jour des champs HTML');
                // Synchronisation CollectorPlus : on met à jour tous les champs
                if (unsafeWindow.document.getElementById('manualNumSer')) unsafeWindow.document.getElementById('manualNumSer').value = numSer;
                if (unsafeWindow.document.getElementById('manualSymbole')) unsafeWindow.document.getElementById('manualSymbole').value = symbole;
                if (unsafeWindow.document.getElementById('manualNomModule')) unsafeWindow.document.getElementById('manualNomModule').value = nomModule;
                if (unsafeWindow.document.getElementById('manualCauseRebut')) unsafeWindow.document.getElementById('manualCauseRebut').value = causeRebut;
                if (unsafeWindow.document.getElementById('manualNumOF')) unsafeWindow.document.getElementById('manualNumOF').value = numOF;
            }
            fillInput();
        }

        // Manual update button
        unsafeWindow.document.getElementById('updateValues').addEventListener('click', () => {
            console.log('[DEBUG] Bouton Mettre à jour cliqué');
            // Protection contre double appel
            if (window._updateValuesClicked) return;
            window._updateValuesClicked = true;
            setTimeout(() => { window._updateValuesClicked = false; }, 500);
            const manualNumSerInput = unsafeWindow.document.getElementById('manualNumSer');
            const manualSymboleInput = unsafeWindow.document.getElementById('manualSymbole');
            const manualNomModuleInput = unsafeWindow.document.getElementById('manualNomModule');
            const manualCauseRebutInput = unsafeWindow.document.getElementById('manualCauseRebut');
            const manualNumOFInput = unsafeWindow.document.getElementById('manualNumOF');
            const newNumSer = manualNumSerInput ? manualNumSerInput.value : '';
            const newSymbole = manualSymboleInput ? manualSymboleInput.value : '';
            const newNomModule = manualNomModuleInput ? manualNomModuleInput.value : '';
            const newCauseRebut = manualCauseRebutInput ? manualCauseRebutInput.value : '';
            const newNumOF = manualNumOFInput ? manualNumOFInput.value : '';
            console.log('[DEBUG] [Bouton] Valeurs lues avant updateConstants:', { newNumSer, newSymbole, newNomModule, newCauseRebut, newNumOF });
            updateConstants(newNumSer, newSymbole, newNomModule, newCauseRebut, newNumOF);
        });

        // Bypass image validation button
        unsafeWindow.document.getElementById('bypassImage').addEventListener('click', () => {
            console.log('[DEBUG] Bouton Contourner Image cliqué');
            bypassImageValidation();
        });

        // Collector fetch button
        const input = unsafeWindow.document.getElementById('collectorLink');
        const button = unsafeWindow.document.getElementById('fetchData');

        button.addEventListener('click', () => {
            let lien = input.value.trim();
            if (!lien) return alert("Merci de mettre le lien CollectorPlus");

            lien = lien.replace(/^.*\/(\d+)(\.html)?$/, '$1');

            const urlImpression = `https://prod.cloud-collectorplus.mt.sncf.fr/Prm/Reparation/${lien}`;
            GM_xmlhttpRequest({
                method: 'GET',
                url: urlImpression,
                onload: function(resp) {
                    console.log('[DEBUG] Réponse HTTP reçue, parsing du HTML');
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(resp.responseText, 'text/html');

                    console.log('[DEBUG] Début extraction Info Agent');
                    
                    let newNumSer = "";
                    let newSymbole = "";
                    let newNomModule = "";
                    let newCauseRebut = "";
                    let newNumOF = "";
                    const allRows = doc.querySelectorAll('div.row');
                    console.log('[DEBUG] Nombre de div.row trouvées:', allRows.length);
                    
                    // Extraction du symbole et nom de module depuis div.col-xs-7.text-center.panel-title
                    const symboleDivs = doc.querySelectorAll('div.col-xs-7.text-center.panel-title');
                    console.log('[DEBUG] Nombre de div.col-xs-7.text-center.panel-title trouvées:', symboleDivs.length);
                    symboleDivs.forEach((div, idx) => {
                        const textContent = div.textContent.trim();
                        console.log(`[DEBUG] Contenu div.col-xs-7.text-center.panel-title ${idx}:`, textContent);
                        
                        // Cherche le pattern: nombre à 8 chiffres - nom du module
                        const matchSymboleEtNom = textContent.match(/^(\d{8})\s*-\s*(.+?)$/);
                        if (matchSymboleEtNom && matchSymboleEtNom[1] && matchSymboleEtNom[2]) {
                            newSymbole = matchSymboleEtNom[1];
                            newNomModule = matchSymboleEtNom[2].trim();
                            console.log(`[DEBUG] Extraction symbole et nom depuis div.col-xs-7.text-center.panel-title ${idx}:`, { symbole: newSymbole, nomModule: newNomModule });
                        } else {
                            console.log(`[DEBUG] Pattern non trouvé dans div ${idx}, tentative de recherche alternative`);
                            
                            // Alternative: chercher dans les rows enfants
                            const rows = div.querySelectorAll('div.row');
                            rows.forEach((row, rowIdx) => {
                                const rowText = row.textContent.trim();
                                console.log(`[DEBUG] Contenu row ${rowIdx} dans div ${idx}:`, rowText);
                                const altMatch = rowText.match(/^(\d{8})\s*-\s*(.+?)$/);
                                if (altMatch && altMatch[1] && altMatch[2]) {
                                    newSymbole = altMatch[1];
                                    newNomModule = altMatch[2].trim();
                                    console.log(`[DEBUG] Extraction alternative symbole et nom depuis row ${rowIdx}:`, { symbole: newSymbole, nomModule: newNomModule });
                                }
                            });
                        }
                    });
                    
                    // Extraction du n° OF
                    allRows.forEach((row, idx) => {
                        // Cherche label ou texte contenant n° OF
                        const labelOF = row.querySelector('span.pull-right.labelsPRM.editionReparation');
                        const valueDivOF = row.querySelector('div.col-lg-5.col-sm-7.col-xs-6.text-left.no-margin');
                        if (labelOF && valueDivOF) {
                            let ofText = valueDivOF.textContent.trim();
                            // Extraction du numéro OF au format OF12345678
                            const matchOF = ofText.match(/OF\s*(\d{8})/i);
                            if (matchOF && matchOF[1]) {
                                newNumOF = `OF${matchOF[1]}`;
                                console.log(`[DEBUG] Extraction n° OF (row ${idx}):`, newNumOF);
                            } else {
                                console.log(`[DEBUG] n° OF non trouvé dans row ${idx}, texte:`, ofText);
                            }
                        }
                    });
                    if (allRows.length > 0) {
                        // Extraction du numéro de série depuis valueDiv de row[0]
                        const valueDiv = allRows[0].querySelector('div.col-lg-5.col-sm-7.col-xs-6.text-left.no-margin');
                        if (valueDiv) {
                            let numSerText = valueDiv.textContent.trim();
                            // Cherche un numéro de série long commençant par 8004
                            const matchLongNumSer = numSerText.match(/(8004\d{21,})/);
                            if (matchLongNumSer && matchLongNumSer[1]) {
                                newNumSer = matchLongNumSer[1];
                                console.log('[DEBUG] Extraction numSerie long:', newNumSer);
                            } else {
                                newNumSer = numSerText;
                                console.log('[DEBUG] Extraction numéro de série row[0]:', newNumSer);
                            }
                        }
                        // Extraction du causeRebut comme symbole (ancienne logique)
                        let txt = allRows[0].textContent;
                        // Nettoyage des espaces et retours à la ligne
                        txt = txt.replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim();
                        // Regex pour le premier nombre dans le texte
                        const matchCauseRebut = txt.match(/(\d+)/);
                        if (matchCauseRebut && matchCauseRebut[1]) {
                            newCauseRebut = matchCauseRebut[1].trim();
                            console.log('[DEBUG] Extraction causeRebut comme premier nombre row[0]:', newCauseRebut);
                        } else {
                            console.log('[DEBUG] Extraction causeRebut comme premier nombre row[0] échouée, txt:', txt);
                        }
                    }
                    // Extraction de la causeRebut depuis les rows avec ' -- ', prendre après le dernier --
                    allRows.forEach((row, idx) => {
                        if (row.textContent.includes(' -- ')) {
                            let txt = row.textContent.replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim();
                            let parts = txt.split(' -- ');
                            if (parts.length > 2) {
                                newCauseRebut = parts[parts.length - 1].trim();
                                console.log(`[DEBUG] Extraction causeRebut depuis row ${idx} après dernier -- :`, newCauseRebut);
                            }
                        }
                    });
                    // Extraction de la causeRebut depuis Info Agent global, priorité
                    const allText = doc.body.textContent;
                    if (allText.includes('Info Agent :')) {
                        const regex = /Info Agent\s*:\s*([^\n]+)/;
                        const match = allText.match(regex);
                        if (match && match[1]) {
                            let causeRebutText = match[1].trim();
                            console.log('[DEBUG] Texte Info Agent complet:', causeRebutText);
                            
                            // Regex pour extraire SEULEMENT ce qui vient après "XX -- DD/MM/YYYY -- "
                            const pattern = /([A-Z]{2})\s*--\s*(\d{2}\/\d{2}\/\d{4})\s*--\s*(.+)/;
                            const matchPattern = causeRebutText.match(pattern);
                            if (matchPattern && matchPattern[3]) {
                                newCauseRebut = matchPattern[3].trim();
                                console.log('[DEBUG] Extraction causeRebut depuis Info Agent (après pattern):', newCauseRebut);
                            } else {
                                // Si le pattern n'est pas trouvé, laisser vide
                                newCauseRebut = "";
                                console.log('[DEBUG] Pattern "XX -- DD/MM/YYYY -- " non trouvé, causeRebut laissée vide');
                            }
                        }
                    }
                    console.log('[DEBUG] Valeurs extraites:', { newNumSer, newSymbole, newNomModule, newCauseRebut, newNumOF });
                    updateConstants(newNumSer, newSymbole, newNomModule, newCauseRebut, newNumOF);
                },
                onerror: () => alert("Erreur HTTP lors de la récupération du CollectorPlus")
            });
        });
    }

    // ...existing code...
    if (unsafeWindow !== unsafeWindow.top) {
        const pageObserver = new unsafeWindow.MutationObserver(() => {
            const walker = unsafeWindow.document.createTreeWalker(
                unsafeWindow.document.body,
                NodeFilter.SHOW_TEXT,
                null,
                false
            );

            let foundTargetForm = false;
            let node;
            while (node = walker.nextNode()) {
                if (node.textContent.includes('Demande de mise en rebut d\'une PRM')) {
                    foundTargetForm = true;
                    console.log('[DEBUG] Texte cible trouvé dans le DOM (observer)');
                    break;
                }
            }
            if (!foundTargetForm) {
                console.log('[DEBUG] Texte cible non trouvé dans le DOM (observer)');
            }

            const existingPanel = unsafeWindow.document.querySelector('[data-script-type="causeRebut"]');

             // Only create panel if correct form is found and no existing panel
            if (foundTargetForm && !existingPanel) {
                console.log('[DEBUG] Forme cible trouvée, création du panneau');
                createUIPanel();
                // Mark panel as created to avoid duplicates
                const panel = unsafeWindow.document.querySelector('div[style*="position: fixed"]');
                if (panel) {
                    panel.setAttribute('data-autofill-panel', 'true');
                    panel.setAttribute('data-script-type', 'causeRebut');
                }
            } else if (!foundTargetForm && existingPanel) {
                console.log('[DEBUG] Forme cible perdue, suppression du panneau');
                // Remove UI panel if "Demande de mise en rebut d'une PRM" is no longer detected
                existingPanel.remove();
            } else {
                console.log('[DEBUG] État inchangé: foundTargetForm=', foundTargetForm, ', existingPanel=', !!existingPanel);
            }
        });

        pageObserver.observe(unsafeWindow.document.body, {
            childList: true,
            subtree: true
        });

        // Also check immediately if content is already loaded with delay
        setTimeout(() => {
            const walker = unsafeWindow.document.createTreeWalker(
                unsafeWindow.document.body,
                NodeFilter.SHOW_TEXT,
                null,
                false
            );

            let foundTargetForm = false;
            let node;
            while (node = walker.nextNode()) {
                if (node.textContent.includes('Demande de mise en rebut d\'une PRM')) {
                    foundTargetForm = true;
                    console.log('[DEBUG] Texte cible trouvé dans le DOM (setTimeout)');
                    break;
                }
            }
            if (!foundTargetForm) {
                console.log('[DEBUG] Texte cible non trouvé dans le DOM (setTimeout)');
            }

              if (foundTargetForm) {
                console.log('[DEBUG] Forme cible trouvée au chargement, création du panneau');
                createUIPanel();
                const panel = unsafeWindow.document.querySelector('div[style*="position: fixed"]');
                if (panel) {
                    panel.setAttribute('data-autofill-panel', 'true');
                    panel.setAttribute('data-script-type', 'causeRebut');
                }
            } else {
                console.log('[DEBUG] Forme cible non trouvée au chargement');
            }
        }, 1000);
    }
})();
