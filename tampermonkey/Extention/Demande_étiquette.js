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
        if (!document.querySelector("body") || !document.body.textContent.includes('Demande d'impression étiquette')) {
            return;
        }
        fillPowerAppsInput("input[appmagic-control='TextInput2_10textbox']", numSer);
        fillPowerAppsInput("input[appmagic-control='TextInput2_5textbox']", symbole);
        fillPowerAppsInput("input[appmagic-control='TextInput2_1textbox']", numOF);
    
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
            <label style="font-size: 11px;">Info Agent:</label>
            <input type="text" id="manualInfoAgent" value="${infoAgent}" style="width: 100%; margin: 2px 0; padding: 2px; border-radius: 4px; border: 1px solid #ccc; font-size: 11px;">
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
        function updateConstants(newNumSer, newSymbole, newNumOF, newInfoAgent) {
            numSer = newNumSer;
            symbole = newSymbole;
            numOF = newNumOF || '';
            infoAgent = newInfoAgent || '';

            // Update UI inputs
            unsafeWindow.document.getElementById('manualNumSer').value = numSer;
            unsafeWindow.document.getElementById('manualSymbole').value = symbole;
            unsafeWindow.document.getElementById('manualNumOF').value = numOF;
            unsafeWindow.document.getElementById('manualInfoAgent').value = infoAgent;

            fillInput();
        }

        // Manual update button
        unsafeWindow.document.getElementById('updateValues').addEventListener('click', () => {
            const newNumSer = unsafeWindow.document.getElementById('manualNumSer').value;
            const newSymbole = unsafeWindow.document.getElementById('manualSymbole').value;
            const newNumOF = unsafeWindow.document.getElementById('manualNumOF').value;
            const newInfoAgent = unsafeWindow.document.getElementById('manualInfoAgent').value;

            updateConstants(newNumSer, newSymbole, newNumOF, newInfoAgent);
        });

        // Collector fetch button
        const input = unsafeWindow.document.getElementById('collectorLink');
        const button = unsafeWindow.document.getElementById('fetchData');

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

                    let newInfoAgent = "";
                    console.log('[CollectorPlus Script] Recherche Info Agent...');
                    console.log('[CollectorPlus Script] HTML reçu:', resp.responseText.substring(0, 500) + '...');
                    
                    // Méthode ciblée pour récupérer l'info agent dans la structure spécifique
                    const allRows = doc.querySelectorAll('div.row');
                    console.log('[CollectorPlus Script] Nombre de rows trouvées:', allRows.length);
                    
                    allRows.forEach((row, index) => {
                        if (row.textContent.includes("Info Agent :")) {
                            console.log(`[CollectorPlus Script] Row ${index + 1} contient "Info Agent :"`);
                            console.log(`[CollectorPlus Script] HTML de la row:`, row.innerHTML);
                            
                            // Cibler exactement la div avec la classe spécifiée
                            const infoAgentDiv = row.querySelector('div.col-lg-5.col-sm-7.col-xs-6.text-left.no-margin');
                            if (infoAgentDiv) {
                                newInfoAgent = infoAgentDiv.textContent.trim();
                                console.log(`[CollectorPlus Script] ✅ Info Agent trouvé avec sélecteur exact: "${newInfoAgent}"`);
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
                                        newInfoAgent = alternateDiv.textContent.trim();
                                        console.log(`[CollectorPlus Script] ✅ Info Agent trouvé avec sélecteur "${selector}": "${newInfoAgent}"`);
                                        break;
                                    }
                                }
                            }
                            
                            // Si toujours pas trouvé, afficher tous les divs de la row pour debug
                            if (!newInfoAgent) {
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
                    if (newInfoAgent) {
                        console.log(`[CollectorPlus Script] 🎯 RÉSULTAT BRUT - Info Agent récupéré: "${newInfoAgent}"`);
                        
                        // Extraire seulement les 8 chiffres consécutifs
                        const eightDigitsMatch = newInfoAgent.match(/\d{8}/);
                        if (eightDigitsMatch) {
                            newInfoAgent = eightDigitsMatch[0];
                            console.log(`[CollectorPlus Script] 🎯 RÉSULTAT FINAL - 8 chiffres extraits: "${newInfoAgent}"`);
                        } else {
                            console.log(`[CollectorPlus Script] ⚠️ Aucune séquence de 8 chiffres trouvée dans: "${newInfoAgent}"`);
                            // Chercher d'autres patterns de chiffres
                            const allDigits = newInfoAgent.match(/\d+/g);
                            if (allDigits) {
                                console.log(`[CollectorPlus Script] 🔍 Séquences de chiffres trouvées:`, allDigits);
                                // Prendre la plus longue séquence de chiffres
                                const longestDigits = allDigits.reduce((a, b) => a.length > b.length ? a : b);
                                console.log(`[CollectorPlus Script] 📏 Plus longue séquence: "${longestDigits}"`);
                            }
                        }
                    } else {
                        console.log('[CollectorPlus Script] ❌ ÉCHEC - Info Agent non trouvé');
                        
                        // Dernière tentative: recherche globale dans le document
                        console.log('[CollectorPlus Script] Tentative de recherche globale...');
                        const allText = doc.body.textContent;
                        if (allText.includes("Info Agent :")) {
                            console.log('[CollectorPlus Script] "Info Agent :" trouvé dans le texte global');
                            // Recherche par regex pour extraire ce qui suit "Info Agent :"
                            const regex = /Info Agent\s*:\s*([^\s\n]+)/;
                            const match = allText.match(regex);
                            if (match && match[1]) {
                                let tempInfoAgent = match[1].trim();
                                console.log(`[CollectorPlus Script] 🎯 RÉSULTAT BRUT par regex: "${tempInfoAgent}"`);
                                
                                // Extraire les 8 chiffres de ce résultat
                                const eightDigitsMatch = tempInfoAgent.match(/\d{8}/);
                                if (eightDigitsMatch) {
                                    newInfoAgent = eightDigitsMatch[0];
                                    console.log(`[CollectorPlus Script] ✅ 8 chiffres extraits par regex: "${newInfoAgent}"`);
                                }
                            }
                        }
                    }

                    updateConstants(newNumSer, newSymbole, newNumOF, newInfoAgent);
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
