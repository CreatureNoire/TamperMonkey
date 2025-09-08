(function() {
    'use strict';

    // Define your values
    let numREL = '';
    let numSer = '';
    let symbole = '';
    let designation = '';
    let originalLink = '';
    let commentCri = '';

    function fillPowerAppsInput(selector, value) {
        const input = unsafeWindow.document.querySelector(selector);
        if (input) {
            input.value = value;
            input.dispatchEvent(new unsafeWindow.Event('input', { bubbles: true }));
            input.dispatchEvent(new unsafeWindow.Event('change', { bubbles: true }));
        }
    }

    function fillInput() {
        fillPowerAppsInput("input[appmagic-control='TextInput20textbox']", numREL);
        fillPowerAppsInput("input[appmagic-control='TextInput20_2textbox']", numSer);
        fillPowerAppsInput("input[appmagic-control='TextInput13_2textbox']", symbole);
        fillPowerAppsInput("input[appmagic-control='TextInput2_8textbox']", designation);
        fillPowerAppsInput("input[appmagic-control='TextInput2_11textbox']", originalLink);
        fillPowerAppsInput("input[appmagic-control='TextInput2_6textbox']", commentCri);
    }

    // Try to fill immediately
    fillInput();

    // Also try after DOM changes
    const observer = new unsafeWindow.MutationObserver(() => {
        fillInput();
    });

    observer.observe(unsafeWindow.document.body, {
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
            <label style="font-size: 11px;">Numéro REL:</label>
            <input type="text" id="manualNumREL" value="${numREL}" style="width: 100%; margin: 2px 0; padding: 2px; border-radius: 4px; border: 1px solid #ccc; font-size: 11px;">
            <label style="font-size: 11px;">Numéro Série:</label>
            <input type="text" id="manualNumSer" value="${numSer}" style="width: 100%; margin: 2px 0; padding: 2px; border-radius: 4px; border: 1px solid #ccc; font-size: 11px;">
            <label style="font-size: 11px;">Symbole:</label>
            <input type="text" id="manualSymbole" value="${symbole}" style="width: 100%; margin: 2px 0; padding: 2px; border-radius: 4px; border: 1px solid #ccc; font-size: 11px;">
            <label style="font-size: 11px;">Désignation:</label>
            <input type="text" id="manualDesignation" value="${designation}" style="width: 100%; margin: 2px 0; padding: 2px; border-radius: 4px; border: 1px solid #ccc; font-size: 11px;">
            <label style="font-size: 11px;">Lien Original:</label>
            <input type="text" id="manualOriginalLink" value="${originalLink}" style="width: 100%; margin: 2px 0; padding: 2px; border-radius: 4px; border: 1px solid #ccc; font-size: 11px;">
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
        function updateConstants(newNumREL, newNumSer, newSymbole, newDesignation, newCommentCri = '', newOriginalLink = '') {
            numREL = newNumREL;
            numSer = newNumSer;
            symbole = newSymbole;
            designation = newDesignation;
            if (newCommentCri) commentCri = newCommentCri;
            if (newOriginalLink) originalLink = newOriginalLink;

            // Update UI inputs
            unsafeWindow.document.getElementById('manualNumREL').value = numREL;
            unsafeWindow.document.getElementById('manualNumSer').value = numSer;
            unsafeWindow.document.getElementById('manualSymbole').value = symbole;
            unsafeWindow.document.getElementById('manualDesignation').value = designation;
            unsafeWindow.document.getElementById('manualOriginalLink').value = originalLink;

            fillInput();
        }

        // Manual update button
        unsafeWindow.document.getElementById('updateValues').addEventListener('click', () => {
            const newNumREL = unsafeWindow.document.getElementById('manualNumREL').value;
            const newNumSer = unsafeWindow.document.getElementById('manualNumSer').value;
            const newSymbole = unsafeWindow.document.getElementById('manualSymbole').value;
            const newDesignation = unsafeWindow.document.getElementById('manualDesignation').value;
            const newOriginalLink = unsafeWindow.document.getElementById('manualOriginalLink').value;

            updateConstants(newNumREL, newNumSer, newSymbole, newDesignation, commentCri, newOriginalLink);
        });

        // Collector fetch button
        const input = unsafeWindow.document.getElementById('collectorLink');
        const button = unsafeWindow.document.getElementById('fetchData');

        button.addEventListener('click', () => {
            let lien = input.value.trim();
            const originalLinkValue = lien;
            originalLink = originalLinkValue;
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
                    let newDesignation = "";
                    if (h1) {
                        const txt = h1.textContent.trim();
                        const parts = txt.split(' - ');
                        newSymbole = parts[0] ? parts[0].trim() : "";
                        newDesignation = parts[1] ? parts[1].trim() : "";
                    }

                    let newNumSer = "";
                    const serieBlock = Array.from(doc.querySelectorAll('div.d-flex.flex-row'))
                        .find(div => div.textContent.includes("Numéro de série :"));
                    if (serieBlock) {
                        const valueDiv = serieBlock.querySelector('.ml-3');
                        if (valueDiv) newNumSer = valueDiv.textContent.trim();
                    }

                    let newNumREL = "";
                    const relBlock = Array.from(doc.querySelectorAll('div.d-flex.flex-row'))
                        .find(div => div.textContent.includes("Numéro FCA :"));
                    if (relBlock) {
                        const valueDiv = relBlock.querySelector('.ml-3');
                        if (valueDiv) newNumREL = valueDiv.textContent.trim();
                    }

                    let commentCri = "";
                    const commentBlock = Array.from(doc.querySelectorAll('div.d-flex.flex-row'))
                        .find(div => {
                            const boldDiv = div.querySelector('div.font-weight-bold');
                            return boldDiv && boldDiv.textContent.includes("Commentaire :");
                        });
                    if (commentBlock) {
                        const valueDiv = commentBlock.querySelector('.ml-3');
                        if (valueDiv) commentCri = valueDiv.textContent.trim();
                    }

                    updateConstants(newNumREL, newNumSer, newSymbole, newDesignation, commentCri);
                    //alert(`Données récupérées:\nSymbole: ${newSymbole}\nDésignation: ${newDesignation}\nNuméro de série: ${newNumSer}\nNuméro REL: ${newNumREL}`);
                },
                onerror: () => alert("Erreur HTTP lors de la récupération du CollectorPlus")
            });
        });
    }

    // Only create UI panel if in iframe and "Formulaire FCA" text is found
    if (unsafeWindow !== unsafeWindow.top) {
        const observer = new unsafeWindow.MutationObserver(() => {
            const walker = unsafeWindow.document.createTreeWalker(
                unsafeWindow.document.body,
                NodeFilter.SHOW_TEXT,
                null,
                false
            );

            let foundFormulaireFCA = false;
            let node;
            while (node = walker.nextNode()) {
                if (node.textContent.includes('Formulaire FCA')) {
                    foundFormulaireFCA = true;
                    break;
                }
            }

            const existingPanel = unsafeWindow.document.querySelector('[data-autofill-panel]');

            if (foundFormulaireFCA && !existingPanel) {
                createUIPanel();
                // Mark panel as created to avoid duplicates
                const panel = unsafeWindow.document.querySelector('div[style*="position: fixed"]');
                if (panel) panel.setAttribute('data-autofill-panel', 'true');
            } else if (!foundFormulaireFCA && existingPanel) {
                // Remove UI panel if "Formulaire FCA" is no longer detected
                existingPanel.remove();
            }
        });

        observer.observe(unsafeWindow.document.body, {
            childList: true,
            subtree: true
        });

        // Also check immediately if content is already loaded
        setTimeout(() => {
            const walker = unsafeWindow.document.createTreeWalker(
                unsafeWindow.document.body,
                NodeFilter.SHOW_TEXT,
                null,
                false
            );

            let foundFormulaireFCA = false;
            let node;
            while (node = walker.nextNode()) {
                if (node.textContent.includes('Formulaire FCA')) {
                    foundFormulaireFCA = true;
                    break;
                }
            }

            if (foundFormulaireFCA) {
                createUIPanel();
            }
        }, 1000);
    }
})();
