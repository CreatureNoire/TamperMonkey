
(function() {
    'use strict';

    // Define your values

    let numSer = '';
    let symbole = '';
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
        // Only fill if we're on the correct form
        if (!document.querySelector("body") || !document.body.textContent.includes('Demande de mise en rebut d\'une PRM')) {
            return;
        }
        // Remplir uniquement si les valeurs ne sont pas vides
        if (numSer || symbole || causeRebut || numOF) {
            fillPowerAppsInput("input[appmagic-control='TextInput7_3textbox']", numSer);
            fillPowerAppsInput("input[appmagic-control='TextInput7_2textbox']", symbole);
            fillPowerAppsInput("input[appmagic-control='TextInput7_5textbox']", causeRebut);
            fillPowerAppsInput("input[appmagic-control='TextInput7textbox']", numOF);
        } else {
            console.log('[DEBUG] Les variables sont vides, remplissage ignoré');
        }
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
                            <input type="text" id="manualCauseRebut" value="${causeRebut}" placeholder=" " class="glitch-input">
                            <label class="form-label" data-text="Cause Rebut">Cause Rebut</label>
                        </div>
                        <button id="updateValues" class="submit-btn" data-text="Mettre à jour">
                            <span class="btn-text">Mettre à jour</span>
                        </button>
                    </div>
                </div>
            </div>
        `;

        unsafeWindow.document.body.appendChild(panel);

        // Toggle edit section
        unsafeWindow.document.getElementById('toggleEdit').addEventListener('click', () => {
            const editSection = unsafeWindow.document.getElementById('editSection');
            editSection.style.display = editSection.style.display === 'none' ? 'block' : 'none';
        });

        // Update values function
        function updateConstants(newNumSer, newSymbole, newCauseRebut = '', newNumOF = '') {
            console.log('[DEBUG] updateConstants appelé avec:', {
                newNumSer,
                newSymbole,
                newCauseRebut,
                newNumOF
            });
            console.trace('[DEBUG] Stack trace updateConstants');
            numSer = newNumSer;
            symbole = newSymbole;
            causeRebut = newCauseRebut;
            numOF = newNumOF;
            console.log('[DEBUG] Variables mises à jour:', { numSer, symbole, causeRebut, numOF });
            // Si l'appel vient du bouton manuel, ne jamais écraser le champ
            if (unsafeWindow.document.activeElement && unsafeWindow.document.activeElement.id === 'updateValues') {
                // Edition manuelle : on ne touche pas aux champs HTML
            } else {
                // Synchronisation CollectorPlus : on met à jour tous les champs
                if (unsafeWindow.document.getElementById('manualNumSer')) unsafeWindow.document.getElementById('manualNumSer').value = numSer;
                if (unsafeWindow.document.getElementById('manualSymbole')) unsafeWindow.document.getElementById('manualSymbole').value = symbole;
                if (unsafeWindow.document.getElementById('manualCauseRebut')) unsafeWindow.document.getElementById('manualCauseRebut').value = causeRebut;
            }
            fillInput();
        }

        // Manual update button
        unsafeWindow.document.getElementById('updateValues').addEventListener('click', () => {
            // Protection contre double appel
            if (window._updateValuesClicked) return;
            window._updateValuesClicked = true;
            setTimeout(() => { window._updateValuesClicked = false; }, 500);
            const manualNumSerInput = unsafeWindow.document.getElementById('manualNumSer');
            const manualSymboleInput = unsafeWindow.document.getElementById('manualSymbole');
            const manualCauseRebutInput = unsafeWindow.document.getElementById('manualCauseRebut');
            const newNumSer = manualNumSerInput ? manualNumSerInput.value : '';
            const newSymbole = manualSymboleInput ? manualSymboleInput.value : '';
            const newCauseRebut = manualCauseRebutInput ? manualCauseRebutInput.value : '';
            console.log('[DEBUG] [Bouton] Valeurs lues avant updateConstants:', { newNumSer, newSymbole, newCauseRebut });
            updateConstants(newNumSer, newSymbole, newCauseRebut);
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
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(resp.responseText, 'text/html');

                    console.log('[DEBUG] Début extraction Info Agent');
                    let newComposant = "";
                    let newNumSer = "";
                    let newSymbole = "";
                    let newNumOF = "";
                    const allRows = doc.querySelectorAll('div.row');
                    console.log('[DEBUG] Nombre de div.row trouvées:', allRows.length);
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
                        // Extraction du symbole : nombre avant le tiret dans row[0] textContent
                            let txt = allRows[0].textContent;
                            // Nettoyage des espaces et retours à la ligne
                            txt = txt.replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim();
                            // Regex robuste : nombre avant le tiret, même avec espaces
                            const matchSymbole = txt.match(/(\d{5,})\s*-\s*[^\s]+/);
                            if (matchSymbole && matchSymbole[1]) {
                                newSymbole = matchSymbole[1].trim();
                                console.log('[DEBUG] Extraction symbole row[0]:', newSymbole);
                            } else {
                                console.log('[DEBUG] Extraction symbole row[0] échouée, txt:', txt);
                            }
                    }
                    // Extraction de la causeRebut (Info Agent) comme avant
                    allRows.forEach((row, idx) => {
                        const label = row.querySelector('span.pull-right.labelsPRM.editionReparation');
                        const valueDiv = row.querySelector('div.col-lg-5.col-sm-7.col-xs-6.text-left.no-margin');
                        if (label && label.textContent.includes('Info Agent') && valueDiv) {
                            let causeRebutText = valueDiv.textContent.trim();
                            // Extraction du nombre à 8 chiffres
                            const matchCauseRebut = causeRebutText.match(/(\d{8})/);
                            if (matchCauseRebut && matchCauseRebut[1]) {
                                newCauseRebut = matchCauseRebut[1];
                                console.log(`[DEBUG] Extraction 8 chiffres causeRebut:`, newCauseRebut);
                            } else {
                                newCauseRebut = '';
                                console.log(`[DEBUG] Aucun 8 chiffres trouvé, causeRebut vide.`);
                            }
                        }
                    });
                    if (!newCauseRebut) {
                        console.log('[DEBUG] Info Agent non trouvé dans les rows, fallback global...');
                        const allText = doc.body.textContent;
                        if (allText.includes('Info Agent :')) {
                            const regex = /Info Agent\s*:\s*([^\n]+)/;
                            const match = allText.match(regex);
                            if (match && match[1]) {
                                let causeRebutText = match[1].trim();
                                const matchCauseRebut = causeRebutText.match(/(\d{8})/);
                                if (matchCauseRebut && matchCauseRebut[1]) {
                                    newCauseRebut = matchCauseRebut[1];
                                    console.log('[DEBUG] Extraction fallback 8 chiffres Info Agent:', newCauseRebut);
                                } else {
                                    newCauseRebut = '';
                                    console.log('[DEBUG] Aucun 8 chiffres trouvé en fallback, causeRebut vide.');
                                }
                            }
                        }
                    }
                    updateConstants(newNumSer, newSymbole, newCauseRebut, newNumOF);
                },
                onerror: () => alert("Erreur HTTP lors de la récupération du CollectorPlus")
            });
        });
    }

    // Only create UI panel if in iframe and "Saisie pièce en attente symbolisé" text is found
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
                if (node.textContent.includes('Saisie pièce en attente symbolisé')) {
                    foundTargetForm = true;
                    break;
                }
            }

            const existingPanel = unsafeWindow.document.querySelector('[data-script-type="ComposantSY"]');

            // Only create panel if correct form is found and no existing panel
            if (foundTargetForm && !existingPanel) {
                createUIPanel();
                // Mark panel as created to avoid duplicates
                const panel = unsafeWindow.document.querySelector('div[style*="position: fixed"]');
                if (panel) {
                    panel.setAttribute('data-autofill-panel', 'true');
                    panel.setAttribute('data-script-type', 'ComposantSY');
                }
            } else if (!foundTargetForm && existingPanel) {
                // Remove UI panel if "Saisie pièce en attente symbolisé" is no longer detected
                existingPanel.remove();
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
                if (node.textContent.includes('Saisie pièce en attente symbolisé')) {
                    foundTargetForm = true;
                    break;
                }
            }

            if (foundTargetForm) {
                createUIPanel();
                const panel = unsafeWindow.document.querySelector('div[style*="position: fixed"]');
                if (panel) {
                    panel.setAttribute('data-autofill-panel', 'true');
                    panel.setAttribute('data-script-type', 'ComposantSY');
                }
            }
        }, 1000);
    }
})();
