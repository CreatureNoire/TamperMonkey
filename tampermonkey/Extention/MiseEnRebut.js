// ==UserScript==
// @name         Copie Colle Cause Rebut
// @namespace    https://github.com/Syfrost
// @version      1.0
// @description  Auto fill rebut form
// @author       Cedric G
// @match        runtime-app.powerplatform.com/*
// @grant        unsafeWindow
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function() {
    'use strict';

    // Define your values
    let numSer = '';
    let symbole = '';
    let designation = '';
    let causeRebut = '';
    let numOF = '';
    let originalLink = '';

    function fillPowerAppsInput(selector, value) {
        const input = unsafeWindow.document.querySelector(selector);
        if (input) {
            input.value = value;
            input.dispatchEvent(new unsafeWindow.Event('input', { bubbles: true }));
            input.dispatchEvent(new unsafeWindow.Event('change', { bubbles: true }));
        }
    }

    // Check if we're on the correct Rebut form by verifying the exact HTML structure
    function checkDemandeRebutStructure() {
        // Search for all divs with class "appmagic-label-text"
        const labelTexts = unsafeWindow.document.querySelectorAll('div.appmagic-label-text');

        for (const labelText of labelTexts) {
            // Check if this div contains the exact text
            if (labelText.textContent.trim() === 'Demande de mise en rebut d\'une PRM') {
                // Verify that the parent has the class "appmagic-label"
                const parent = labelText.closest('div.appmagic-label');
                if (parent) {
                    return true;
                }
            }
        }

        return false;
    }

    function fillInput() {
        // Only fill if we're on the correct form
        if (!checkDemandeRebutStructure()) {
            return;
        }
      fillPowerAppsInput("input[appmagic-control='TextInput1_46textbox']", numSer);
            fillPowerAppsInput("input[appmagic-control='TextInput1_45textbox']", symbole);
            fillPowerAppsInput("input[appmagic-control='TextInput1_42textbox']", designation);
            fillPowerAppsInput("input[appmagic-control='TextInput1_43textbox']", causeRebut);
            fillPowerAppsInput("input[appmagic-control='TextInput1_41textbox']", numOF);
            fillPowerAppsInput("input[appmagic-control='TextInput1_44textbox']", originalLink);
    }

    // Try to fill immediately with delay
    setTimeout(() => {
        if (checkDemandeRebutStructure()) {
            fillInput();
        }
    }, 500);

    // Also try after DOM changes
    const rebutObserver = new unsafeWindow.MutationObserver(() => {
        if (checkDemandeRebutStructure()) {
            fillInput();
        }
    });

    rebutObserver.observe(unsafeWindow.document.body, {
        childList: true,
        subtree: true
    });

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
        panel.setAttribute('data-autofill-panel', 'true');
        panel.setAttribute('data-script-type', 'causeRebut');
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
                    <h3 class="card-title">🔧 Rebut Copie/Colle</h3>
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
                            <input type="text" id="manualDesignation" value="${designation}" placeholder=" " class="glitch-input">
                            <label class="form-label" data-text="Désignation">Désignation</label>
                        </div>
                        <div class="form-group">
                            <input type="text" id="manualCauseRebut" value="${causeRebut}" placeholder=" " class="glitch-input">
                            <label class="form-label" data-text="Cause Rebut">Cause Rebut</label>
                        </div>
                        <div class="form-group">
                            <input type="text" id="manualNumOF" value="${numOF}" placeholder=" " class="glitch-input">
                            <label class="form-label" data-text="Numéro OF">Numéro OF</label>
                        </div>
                        <div class="form-group">
                            <input type="text" id="manualOriginalLink" value="${originalLink}" placeholder=" " class="glitch-input">
                            <label class="form-label" data-text="Lien Original">Lien Original</label>
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
        function updateConstants(newNumSer, newSymbole, newDesignation, newCauseRebut, newNumOF, newOriginalLink = '') {
            numSer = newNumSer;
            symbole = newSymbole;
            designation = newDesignation;
            causeRebut = newCauseRebut;
            numOF = newNumOF;
            if (newOriginalLink) originalLink = newOriginalLink;

            // Update UI inputs
            unsafeWindow.document.getElementById('manualNumSer').value = numSer;
            unsafeWindow.document.getElementById('manualSymbole').value = symbole;
            unsafeWindow.document.getElementById('manualDesignation').value = designation;
            unsafeWindow.document.getElementById('manualCauseRebut').value = causeRebut;
            unsafeWindow.document.getElementById('manualNumOF').value = numOF;
            unsafeWindow.document.getElementById('manualOriginalLink').value = originalLink;

            fillInput();
        }

        // Manual update button
        unsafeWindow.document.getElementById('updateValues').addEventListener('click', () => {
            const newNumSer = unsafeWindow.document.getElementById('manualNumSer').value;
            const newSymbole = unsafeWindow.document.getElementById('manualSymbole').value;
            const newDesignation = unsafeWindow.document.getElementById('manualDesignation').value;
            const newCauseRebut = unsafeWindow.document.getElementById('manualCauseRebut').value;
            const newNumOF = unsafeWindow.document.getElementById('manualNumOF').value;
            const newOriginalLink = unsafeWindow.document.getElementById('manualOriginalLink').value;

            updateConstants(newNumSer, newSymbole, newDesignation, newCauseRebut, newNumOF, newOriginalLink);
        });

        // Collector fetch button
        const input = unsafeWindow.document.getElementById('collectorLink');
        const button = unsafeWindow.document.getElementById('fetchData');

        button.addEventListener('click', () => {
            let lien = input.value.trim();
            if (!lien) return alert("Merci de mettre le lien CollectorPlus");

            const originalLinkValue = lien;
            originalLink = originalLinkValue;
            lien = lien.replace(/^.*\/(\d+)(\.html)?$/, '$1');

            const urlImpression = `https://prod.cloud-collectorplus.mt.sncf.fr/Prm/Impression/print/PV/${lien}`;
            GM_xmlhttpRequest({
                method: 'GET',
                url: urlImpression,
                onload: function(resp) {
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(resp.responseText, 'text/html');

                    // Extraction du symbole et de la désignation depuis h1
                    const h1 = doc.querySelector('h1.border-bottom.text-center.mx-auto.mt-4.text-info.border-info');
                    let newSymbole = "";
                    let newDesignation = "";
                    if (h1) {
                        const txt = h1.textContent.trim();
                        const parts = txt.split(' - ');
                        newSymbole = parts[0] ? parts[0].trim() : "";
                        newDesignation = parts[1] ? parts[1].trim() : "";
                    }

                    // Extraction du numéro de série
                    let newNumSer = "";
                    const serieBlock = Array.from(doc.querySelectorAll('div.d-flex.flex-row'))
                        .find(div => div.textContent.includes("Numéro de série :"));
                    if (serieBlock) {
                        const valueDiv = serieBlock.querySelector('.ml-3');
                        if (valueDiv) {
                            let rawNumSer = valueDiv.textContent.trim();
                            const match = rawNumSer.match(/(\d{15,})/);
                            newNumSer = match ? match[1] : rawNumSer;
                        }
                    }

                    // Extraction du numéro OF
                    let newNumOF = "";
                    const ofBlock = Array.from(doc.querySelectorAll('div.d-flex.flex-row'))
                        .find(div => div.textContent.includes("Numéro OF :"));
                    if (ofBlock) {
                        const valueDiv = ofBlock.querySelector('.ml-3');
                        if (valueDiv) {
                            newNumOF = valueDiv.textContent.trim();
                            console.log('[DEBUG] Numéro OF trouvé:', newNumOF);
                        } else {
                            console.log('[DEBUG] valueDiv .ml-3 non trouvé dans ofBlock');
                        }
                    } else {
                        console.log('[DEBUG] ofBlock "Numéro OF :" non trouvé');
                    }

                    console.log('[DEBUG] Valeurs extraites depuis Impression:', { newNumSer, newSymbole, newDesignation, newNumOF });

                    // Deuxième requête vers la page de réparation pour récupérer causeRebut
                    const urlReparation = `https://prod.cloud-collectorplus.mt.sncf.fr/Prm/Reparation/${lien}`;
                    GM_xmlhttpRequest({
                        method: 'GET',
                        url: urlReparation,
                        onload: function(respRep) {
                            const parserRep = new DOMParser();
                            const docRep = parserRep.parseFromString(respRep.responseText, 'text/html');

                            // Extraction de la cause de rebut depuis Info Agent
                            let newCauseRebut = "";
                            const allText = docRep.body.textContent;
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
                                        let extractedText = matchPattern[3].trim();
                                        console.log('[DEBUG] Extraction depuis Info Agent (après pattern):', extractedText);

                                        // Si le texte contient "Rebut cause : ", on récupère uniquement ce qui suit
                                        const rebutCauseMatch = extractedText.match(/Rebut cause\s*:\s*(.+)/i);
                                        if (rebutCauseMatch && rebutCauseMatch[1]) {
                                            newCauseRebut = rebutCauseMatch[1].trim();
                                            console.log('[DEBUG] Extraction causeRebut après "Rebut cause :" :', newCauseRebut);
                                        } else {
                                            newCauseRebut = extractedText;
                                            console.log('[DEBUG] Extraction causeRebut brute (pas de "Rebut cause :") :', newCauseRebut);
                                        }
                                    } else {
                                        // Si le pattern n'est pas trouvé, laisser vide
                                        newCauseRebut = "";
                                        console.log('[DEBUG] Pattern "XX -- DD/MM/YYYY -- " non trouvé, causeRebut laissée vide');
                                    }
                                }
                            }

                            console.log('[DEBUG] Valeurs extraites depuis Reparation:', { newCauseRebut });
                            console.log('[DEBUG] Toutes les valeurs:', { newNumSer, newSymbole, newDesignation, newCauseRebut, newNumOF, originalLink });
                            updateConstants(newNumSer, newSymbole, newDesignation, newCauseRebut, newNumOF, originalLink);
                        },
                        onerror: () => alert("Erreur HTTP lors de la récupération de la page Réparation")
                    });
                },
                onerror: () => alert("Erreur HTTP lors de la récupération du CollectorPlus")
            });
        });
    }

    if (unsafeWindow !== unsafeWindow.top) {
        const rebutPageObserver = new unsafeWindow.MutationObserver(() => {
            const foundDemandeRebut = checkDemandeRebutStructure();
            const existingPanel = unsafeWindow.document.querySelector('[data-script-type="causeRebut"]');

            // Only create panel if correct form is found and no existing panel
            if (foundDemandeRebut && !existingPanel) {
                createUIPanel();
            } else if (!foundDemandeRebut && existingPanel) {
                // Remove UI panel if form structure is no longer detected
                existingPanel.remove();
            }
        });

        rebutPageObserver.observe(unsafeWindow.document.body, {
            childList: true,
            subtree: true
        });

        // Also check immediately if content is already loaded with delay
        setTimeout(() => {
            const foundDemandeRebut = checkDemandeRebutStructure();

            if (foundDemandeRebut) {
                createUIPanel();
            }
        }, 1000);
    }
})();
