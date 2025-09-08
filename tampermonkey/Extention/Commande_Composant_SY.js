(function() {
    'use strict';

    // Define your values
    let numSer = '';
    let symbole = '';
    let numOF = '';

    function fillPowerAppsInput(selector, value) {
        const input = unsafeWindow.document.querySelector(selector);
        if (input) {
            input.value = value;
            input.dispatchEvent(new unsafeWindow.Event('input', { bubbles: true }));
            input.dispatchEvent(new unsafeWindow.Event('change', { bubbles: true }));
        }
    }

    function fillInput() {
        // Only fill if we're on the correct form
        if (!document.querySelector("body") || !document.body.textContent.includes('Saisie pièce en attente symbolisé')) {
            return;
        }
        fillPowerAppsInput("input[appmagic-control='TextInput8_3textbox']", numSer);
        fillPowerAppsInput("input[appmagic-control='TextInput8_2textbox']", symbole);
     fillPowerAppsInput("input[appmagic-control='TextInput8textbox']", numOF);
    }

    // Try to fill immediately with delay
    setTimeout(() => {
        if (document.body && document.body.textContent.includes('Saisie pièce en attente symbolisé')) {
            fillInput();
        }
    }, 500);

    // Also try after DOM changes with renamed observer
    const commandeObserver = new unsafeWindow.MutationObserver(() => {
        if (document.body && document.body.textContent.includes('Saisie pièce en attente symbolisé')) {
            fillInput();
        }
    });

    commandeObserver.observe(unsafeWindow.document.body, {
        childList: true,
        subtree: true
    });

    // Create UI panel for input modification
    function createUIPanel() {
        const panel = unsafeWindow.document.createElement('div');
        panel.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            width: 110px;
            background: rgba(255, 0, 0, 0);
            border: 2px solid #6909b8ff;
            padding: 15px;
            z-index: 10000;
            font-family: Arial, sans-serif;
        `;
        panel.innerHTML = `
            <input type="text" id="collectorLink" placeholder="Lien CollectorPlus" style="width: 100%; margin: 3px 0; padding: 2px; border-radius: 4px; border: 1px solid #ccc; font-size: 12px;">
            <button id="fetchData" style="width: 100%; padding: 4px; margin: 3px 0; border-radius: 4px; border: none; background: #007cba; color: white; cursor: pointer; font-size: 12px;">Récupérer données</button>
            <button id="toggleEdit" style="width: 100%; padding: 4px; margin: 3px 0; border-radius: 4px; border: none; background: #666; color: white; cursor: pointer; font-size: 12px;">Edit</button>
            <div id="editSection" style="display: none;">
            <hr>
            <label style="font-size: 11px;">Numéro Série:</label>
            <input type="text" id="manualNumSer" value="${numSer}" style="width: 100%; margin: 2px 0; padding: 2px; border-radius: 4px; border: 1px solid #ccc; font-size: 11px;">
            <label style="font-size: 11px;">Symbole:</label>
            <input type="text" id="manualSymbole" value="${symbole}" style="width: 100%; margin: 2px 0; padding: 2px; border-radius: 4px; border: 1px solid #ccc; font-size: 11px;">
            <label style="font-size: 11px;">Numéro OF:</label>
            <input type="text" id="manualNumOF" value="${numOF}" style="width: 100%; margin: 2px 0; padding: 2px; border-radius: 4px; border: 1px solid #ccc; font-size: 11px;">
            <button id="updateValues" style="width: 100%; padding: 4px; margin: 3px 0; border-radius: 4px; border: none; background: #28a745; color: white; cursor: pointer; font-size: 12px;">Mettre à jour</button>
            </div>
        `;

        unsafeWindow.document.body.appendChild(panel);

        // Toggle edit section
        unsafeWindow.document.getElementById('toggleEdit').addEventListener('click', () => {
            const editSection = unsafeWindow.document.getElementById('editSection');
            editSection.style.display = editSection.style.display === 'none' ? 'block' : 'none';
        });

        // Update values function
        function updateConstants(newNumSer, newSymbole, newNumOF) {
            numSer = newNumSer;
            symbole = newSymbole;
            numOF = newNumOF || '';

            // Update UI inputs
            unsafeWindow.document.getElementById('manualNumSer').value = numSer;
            unsafeWindow.document.getElementById('manualSymbole').value = symbole;
            unsafeWindow.document.getElementById('manualNumOF').value = numOF;

            fillInput();
        }

        // Manual update button
        unsafeWindow.document.getElementById('updateValues').addEventListener('click', () => {
            const newNumSer = unsafeWindow.document.getElementById('manualNumSer').value;
            const newSymbole = unsafeWindow.document.getElementById('manualSymbole').value;
            const newNumOF = unsafeWindow.document.getElementById('manualNumOF').value;

            updateConstants(newNumSer, newSymbole, newNumOF);
        });

        // Collector fetch button
        const input = unsafeWindow.document.getElementById('collectorLink');
        const button = unsafeWindow.document.getElementById('fetchData');

        button.addEventListener('click', () => {
            let lien = input.value.trim();
            if (!lien) return alert("Merci de mettre le lien CollectorPlus");

            lien = lien.replace(/^.*\/(\d+)(\.html)?$/, '$1');

            const urlImpression = `https://prod.cloud-collectorplus.mt.sncf.fr/Prm/Impression/print/PV/${lien}`;
            GM_xmlhttpRequest({
                method: 'GET',
                url: urlImpression,
                onload: function(resp) {
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(resp.responseText, 'text/html');

                    const h1 = doc.querySelector('h1.border-bottom.text-center.mx-auto.mt-4.text-info.border-info');
                    let newSymbole = "";
                    if (h1) {
                        const txt = h1.textContent.trim();
                        const parts = txt.split(' - ');
                        newSymbole = parts[0] ? parts[0].trim() : "";
                    }

                    let newNumSer = "";
                    const serieBlock = Array.from(doc.querySelectorAll('div.d-flex.flex-row'))
                        .find(div => div.textContent.includes("Numéro de série :"));
                    if (serieBlock) {
                        const valueDiv = serieBlock.querySelector('.ml-3');
                        if (valueDiv) newNumSer = valueDiv.textContent.trim();
                    }

                    let newNumOF = "";
                    const ofBlock = Array.from(doc.querySelectorAll('div.d-flex.flex-row'))
                        .find(div => div.textContent.includes("Numéro OF :"));
                    if (ofBlock) {
                        const valueDiv = ofBlock.querySelector('.ml-3');
                        if (valueDiv) newNumOF = valueDiv.textContent.trim();
                    }

                    updateConstants(newNumSer, newSymbole, newNumOF);
                    //alert(`Données récupérées:\nSymbole: ${newSymbole}\nNuméro de série: ${newNumSer}\nNuméro OF: ${newNumOF}`);
                },
                onerror: () => alert("Erreur HTTP lors de la récupération du CollectorPlus")
            });
        });
    }

    // Only create UI panel if in iframe and correct form is found
    if (unsafeWindow !== unsafeWindow.top) {
        const pageObserver = new unsafeWindow.MutationObserver(() => {
            const walker = unsafeWindow.document.createTreeWalker(
                unsafeWindow.document.body,
                NodeFilter.SHOW_TEXT,
                null,
                false
            );

            let foundCorrectForm = false;
            let node;
            while (node = walker.nextNode()) {
                if (node.textContent.includes('Saisie pièce en attente symbolisé')) {
                    foundCorrectForm = true;
                    break;
                }
            }

            const existingPanel = unsafeWindow.document.querySelector('[data-script-type="CommandeComposantSY"]');

            // Only create panel if correct form is found and no existing panel
            if (foundCorrectForm && !existingPanel) {
                createUIPanel();
                // Mark panel as created to avoid duplicates
                const panel = unsafeWindow.document.querySelector('div[style*="position: fixed"]');
                if (panel) {
                    panel.setAttribute('data-autofill-panel', 'true');
                    panel.setAttribute('data-script-type', 'CommandeComposantSY');
                }
            } else if (!foundCorrectForm && existingPanel) {
                // Remove UI panel if correct form is no longer detected
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

            let foundCorrectForm = false;
            let node;
            while (node = walker.nextNode()) {
                if (node.textContent.includes('Saisie pièce en attente symbolisé')) {
                    foundCorrectForm = true;
                    break;
                }
            }

            if (foundCorrectForm) {
                createUIPanel();
                const panel = unsafeWindow.document.querySelector('div[style*="position: fixed"]');
                if (panel) {
                    panel.setAttribute('data-autofill-panel', 'true');
                    panel.setAttribute('data-script-type', 'CommandeComposantSY');
                }
            }
        }, 1500);
    }
})();
