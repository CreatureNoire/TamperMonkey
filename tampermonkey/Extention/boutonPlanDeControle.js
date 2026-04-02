(function () {
    'use strict';

    const cpPersoValue = (document.getElementById("idUser") || {}).value || "";

    // --- Récupérer le symbole/référentiel depuis la div panel-title ---
    // Supporte plusieurs formats : codes alphanumériques (ex: L42290SCPRSDAAT) et nombres à 8 chiffres
    function getSymbole() {
        const div = document.querySelector('.col-xs-7.text-center.panel-title');
        if (!div) return null;

        const text = div.textContent.trim();

        // 1. D'abord chercher un code alphanumérique avant le premier "-"
        // Format: commence par une lettre, suit par lettres/chiffres (ex: L42290SCPRSDAAT)
        const alphaMatch = text.match(/^([A-Z]\w+)\s*-/);
        if (alphaMatch) return alphaMatch[1];

        // 2. Sinon chercher un nombre à 8 chiffres (format historique)
        const numMatch = text.match(/\b(\d{8})\b/);
        if (numMatch) return numMatch[1];

        return null;
    }

    // --- LocalStorage : structure { "_global": [...], "07341678": [...] } ---
    // Chaque entrée est un tableau de combos : [{ id, nom, actions }, ...]
    function getSavedCombos() {
        try { return JSON.parse(localStorage.getItem('pc_combos_v2') || '{}'); } catch (e) { return {}; }
    }
    function saveCombos(combos) {
        localStorage.setItem('pc_combos_v2', JSON.stringify(combos));
    }
    function genId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    }

    // Récupérer la liste des combos applicables (globaux + liés au symbole)
    function getCombosForCurrentPage() {
        const symbole = getSymbole();
        const all = getSavedCombos();
        const result = [];
        if (all['_global']) result.push(...all['_global'].map(c => ({ ...c, _key: '_global' })));
        if (symbole && all[symbole]) result.push(...all[symbole].map(c => ({ ...c, _key: symbole })));
        return result;
    }

    // --- Définition des actions disponibles ---
    function getActions() {
        return [
            { id: 'oui', label: 'Oui', fn: () => { document.querySelectorAll('button[collector-value="1"]').forEach(btn => { if (!btn.title.toLowerCase().includes('conforme')) btn.click(); }); }},
            { id: 'non', label: 'Non', fn: () => { document.querySelectorAll('button[collector-value="0"]').forEach(btn => { if (!btn.title.toLowerCase().includes('conforme')) btn.click(); }); }},
            { id: 'conforme', label: 'Conforme', fn: () => { document.querySelectorAll('button[title="Conforme"]').forEach(btn => btn.click()); }},
            { id: 'remplir', label: 'Valeur', fn: () => {
                document.querySelectorAll('input[type="tel"][data-min][data-max]').forEach(input => {
                    const min = parseFloat(input.getAttribute('data-min'));
                    const max = parseFloat(input.getAttribute('data-max'));
                    if (!isNaN(min) && !isNaN(max)) {
                        const valeur = Math.round((min + Math.random() * (max - min)) * 100) / 100;
                        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
                        setter.call(input, valeur);
                        input.dispatchEvent(new Event('input', { bubbles: true }));
                        input.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                });
            }},
            { id: 'signer', label: 'Signer', fn: () => { document.querySelectorAll(`button[cp="${cpPersoValue}"]`).forEach(btn => btn.click()); }},
            { id: 'valider', label: 'Valider', fn: () => {
                const validerBtn = document.getElementById('fonctionnel_validateAndNext_form') || document.getElementById('fonctionnel_validate_form');
                if (validerBtn) validerBtn.click(); else alert("Bouton 'Valider' introuvable.");
            }},
        ];
    }

    // --- Modale d'ajout d'un nouveau combo ---
    function ouvrirModaleAjout(rightGroup) {
        const old = document.getElementById('combo_modal_overlay');
        if (old) old.remove();

        const symbole = getSymbole();

        const overlay = document.createElement('div');
        overlay.id = 'combo_modal_overlay';
        Object.assign(overlay.style, {
            position: 'fixed', top: '0', left: '0', width: '100%', height: '100%',
            background: 'rgba(0,0,0,0.5)', zIndex: '99999', display: 'flex',
            justifyContent: 'center', alignItems: 'center'
        });

        const modal = document.createElement('div');
        Object.assign(modal.style, {
            background: '#fff', borderRadius: '12px', padding: '25px', minWidth: '340px',
            maxWidth: '420px', boxShadow: '0 8px 32px rgba(0,0,0,0.25)', fontFamily: 'Arial, sans-serif'
        });

        const title = document.createElement('h3');
        Object.assign(title.style, { marginTop: '0', marginBottom: '5px' });
        title.textContent = 'Ajouter un bouton combo';
        modal.appendChild(title);

        const symInfo = document.createElement('p');
        Object.assign(symInfo.style, { color: '#666', fontSize: '13px', marginBottom: '15px' });
        symInfo.textContent = symbole ? `Symbole détecté : ${symbole}` : 'Aucun symbole détecté';
        modal.appendChild(symInfo);

        // Checkbox lier au symbole
        const rowLier = document.createElement('div');
        Object.assign(rowLier.style, { marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' });
        const cbLier = document.createElement('input');
        cbLier.type = 'checkbox';
        cbLier.id = 'combo_cb_lier';
        cbLier.checked = !!symbole;
        cbLier.disabled = !symbole;
        Object.assign(cbLier.style, { width: '18px', height: '18px' });
        const lblLier = document.createElement('label');
        lblLier.htmlFor = 'combo_cb_lier';
        lblLier.textContent = symbole ? `Lier au symbole ${symbole}` : 'Aucun symbole (combo global)';
        Object.assign(lblLier.style, { cursor: symbole ? 'pointer' : 'default', fontSize: '13px', color: symbole ? '#333' : '#999' });
        rowLier.appendChild(cbLier);
        rowLier.appendChild(lblLier);
        modal.appendChild(rowLier);

        // Nom
        const labelNom = document.createElement('label');
        labelNom.textContent = 'Nom du bouton :';
        Object.assign(labelNom.style, { fontWeight: 'bold', display: 'block', marginBottom: '4px' });
        modal.appendChild(labelNom);
        const inputNom = document.createElement('input');
        inputNom.type = 'text';
        inputNom.value = 'Auto';
        inputNom.placeholder = 'Ex: Auto';
        Object.assign(inputNom.style, {
            width: '100%', padding: '6px 10px', borderRadius: '6px',
            border: '1px solid #ccc', marginBottom: '15px', boxSizing: 'border-box'
        });
        modal.appendChild(inputNom);

        // Checkboxes actions
        const labelActions = document.createElement('label');
        labelActions.textContent = 'Actions à enchaîner (dans l\'ordre) :';
        Object.assign(labelActions.style, { fontWeight: 'bold', display: 'block', marginBottom: '8px' });
        modal.appendChild(labelActions);

        const actions = getActions();
        const checkboxes = [];
        actions.forEach(action => {
            const row = document.createElement('div');
            Object.assign(row.style, { marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' });
            const cb = document.createElement('input');
            cb.type = 'checkbox';
            cb.value = action.id;
            cb.id = 'combo_cb_' + action.id;
            Object.assign(cb.style, { width: '18px', height: '18px' });
            const lbl = document.createElement('label');
            lbl.htmlFor = cb.id;
            lbl.textContent = action.label;
            Object.assign(lbl.style, { cursor: 'pointer', fontSize: '14px' });
            row.appendChild(cb);
            row.appendChild(lbl);
            modal.appendChild(row);
            checkboxes.push(cb);
        });

        // Boutons modale
        const btnRow = document.createElement('div');
        Object.assign(btnRow.style, { display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '18px' });

        const btnAnnuler = document.createElement('button');
        btnAnnuler.textContent = 'Annuler';
        btnAnnuler.className = 'btn btn-default';
        Object.assign(btnAnnuler.style, { padding: '6px 16px', borderRadius: '6px', cursor: 'pointer' });
        btnAnnuler.onclick = () => overlay.remove();
        btnRow.appendChild(btnAnnuler);

        const btnSave = document.createElement('button');
        btnSave.textContent = 'Ajouter';
        btnSave.className = 'btn btn-success';
        Object.assign(btnSave.style, { padding: '6px 16px', borderRadius: '6px', cursor: 'pointer' });
        btnSave.onclick = () => {
            const selected = checkboxes.filter(cb => cb.checked).map(cb => cb.value);
            if (selected.length === 0) { alert('Sélectionne au moins une action.'); return; }
            const nom = inputNom.value.trim() || 'Auto';
            const lierAuSymbole = cbLier.checked && symbole;
            const key = lierAuSymbole ? symbole : '_global';
            const c = getSavedCombos();
            if (!c[key]) c[key] = [];
            c[key].push({ id: genId(), nom, actions: selected });
            saveCombos(c);
            overlay.remove();
            rafraichirCombos(rightGroup);
        };
        btnRow.appendChild(btnSave);

        modal.appendChild(btnRow);
        overlay.appendChild(modal);
        overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
        document.body.appendChild(overlay);
    }

    // --- Modale de gestion (liste des combos avec suppression) ---
    function ouvrirModaleGestion(rightGroup) {
        const old = document.getElementById('combo_modal_overlay');
        if (old) old.remove();

        const combos = getCombosForCurrentPage();

        const overlay = document.createElement('div');
        overlay.id = 'combo_modal_overlay';
        Object.assign(overlay.style, {
            position: 'fixed', top: '0', left: '0', width: '100%', height: '100%',
            background: 'rgba(0,0,0,0.5)', zIndex: '99999', display: 'flex',
            justifyContent: 'center', alignItems: 'center'
        });

        const modal = document.createElement('div');
        Object.assign(modal.style, {
            background: '#fff', borderRadius: '12px', padding: '25px', minWidth: '360px',
            maxWidth: '460px', boxShadow: '0 8px 32px rgba(0,0,0,0.25)', fontFamily: 'Arial, sans-serif'
        });

        const title = document.createElement('h3');
        Object.assign(title.style, { marginTop: '0', marginBottom: '15px' });
        title.textContent = 'Gérer les boutons combo';
        modal.appendChild(title);

        if (combos.length === 0) {
            const p = document.createElement('p');
            p.textContent = 'Aucun combo enregistré.';
            p.style.color = '#999';
            modal.appendChild(p);
        } else {
            const actions = getActions();
            combos.forEach(combo => {
                const row = document.createElement('div');
                row.setAttribute('data-combo-row', combo.id);
                Object.assign(row.style, {
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '8px 12px', marginBottom: '8px', borderRadius: '8px',
                    background: '#f8f8f8', border: '1px solid #eee'
                });

                const info = document.createElement('div');
                const nameSpan = document.createElement('strong');
                nameSpan.textContent = combo.nom;
                info.appendChild(nameSpan);

                const detail = document.createElement('div');
                Object.assign(detail.style, { fontSize: '11px', color: '#888', marginTop: '2px' });
                const actionLabels = combo.actions.map(id => {
                    const a = actions.find(x => x.id === id);
                    return a ? a.label : id;
                }).join(' → ');
                detail.textContent = actionLabels + (combo._key === '_global' ? ' (global)' : ` (symbole ${combo._key})`);
                info.appendChild(detail);

                const btnSuppr = document.createElement('button');
                btnSuppr.textContent = '✕';
                Object.assign(btnSuppr.style, {
                    padding: '2px 8px', borderRadius: '50%', cursor: 'pointer',
                    fontSize: '14px', lineHeight: '1', border: 'none',
                    background: '#e74c3c', color: '#fff', fontWeight: 'bold',
                    minWidth: '28px', minHeight: '28px'
                });
                btnSuppr.title = 'Supprimer ce combo';
                btnSuppr.onclick = () => {
                    const c = getSavedCombos();
                    const key = combo._key;
                    if (c[key]) {
                        c[key] = c[key].filter(x => x.id !== combo.id);
                        if (c[key].length === 0) delete c[key];
                        saveCombos(c);
                    }
                    row.remove();
                    rafraichirCombos(rightGroup);
                };

                row.appendChild(info);
                row.appendChild(btnSuppr);
                modal.appendChild(row);
            });
        }

        const btnRow = document.createElement('div');
        Object.assign(btnRow.style, { display: 'flex', justifyContent: 'flex-end', marginTop: '15px' });
        const btnFermer = document.createElement('button');
        btnFermer.textContent = 'Fermer';
        btnFermer.className = 'btn btn-default';
        Object.assign(btnFermer.style, { padding: '6px 16px', borderRadius: '6px', cursor: 'pointer' });
        btnFermer.onclick = () => overlay.remove();
        btnRow.appendChild(btnFermer);
        modal.appendChild(btnRow);

        overlay.appendChild(modal);
        overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
        document.body.appendChild(overlay);
    }

    // --- Rafraîchir les boutons combo dans le rightGroup ---
    function rafraichirCombos(rightGroup) {
        rightGroup.querySelectorAll('.custom-combo-wrapper').forEach(el => el.remove());

        const combos = getCombosForCurrentPage();
        const actions = getActions();
        const btnPlus = rightGroup.querySelector('#custom_plus_button');

        combos.forEach(combo => {
            // Wrapper pour positionner la croix
            const wrapper = document.createElement('div');
            wrapper.className = 'custom-combo-wrapper';
            Object.assign(wrapper.style, {
                position: 'relative', display: 'inline-block'
            });

            const btnCombo = document.createElement('button');
            btnCombo.className = combo._key === '_global' ? 'btn btn-warning' : 'btn btn-info';
            btnCombo.innerText = combo.nom;
            Object.assign(btnCombo.style, {
                padding: '2px 10px', borderRadius: '5px', cursor: 'pointer',
                fontSize: '14px', lineHeight: '1.42857'
            });
            const actionLabels = combo.actions.map(id => {
                const a = actions.find(x => x.id === id);
                return a ? a.label : id;
            }).join(' → ');
            btnCombo.title = combo.nom + ' : ' + actionLabels
                + (combo._key === '_global' ? ' (global)' : ` (symbole ${combo._key})`);
            btnCombo.onclick = () => {
                const selectedActions = combo.actions
                    .map(id => actions.find(a => a.id === id))
                    .filter(Boolean);
                selectedActions.forEach((action, i) => {
                    action.fn();
                });
            };
            wrapper.appendChild(btnCombo);

            // Croix de suppression en haut à droite
            const btnClose = document.createElement('span');
            btnClose.textContent = '✕';
            Object.assign(btnClose.style, {
                position: 'absolute', top: '-6px', right: '-6px',
                background: '#e74c3c', color: '#fff',
                borderRadius: '50%', width: '14px', height: '14px',
                fontSize: '9px', lineHeight: '14px', textAlign: 'center',
                cursor: 'pointer', fontWeight: 'bold',
                boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                display: 'none', zIndex: '1'
            });
            btnClose.title = 'Supprimer ce combo';
            btnClose.onclick = (e) => {
                e.stopPropagation();
                if (confirm(`Supprimer le combo "${combo.nom}" ?`)) {
                    const c = getSavedCombos();
                    const key = combo._key;
                    if (c[key]) {
                        c[key] = c[key].filter(x => x.id !== combo.id);
                        if (c[key].length === 0) delete c[key];
                        saveCombos(c);
                    }
                    rafraichirCombos(rightGroup);
                }
            };
            wrapper.appendChild(btnClose);

            // Afficher/masquer la croix au survol du wrapper
            wrapper.onmouseenter = () => { btnClose.style.display = 'block'; };
            wrapper.onmouseleave = () => { btnClose.style.display = 'none'; };

            if (btnPlus) {
                rightGroup.insertBefore(wrapper, btnPlus);
            } else {
                rightGroup.appendChild(wrapper);
            }
        });
    }

    // --- Gestion des titres personnalisés pour le Plan de Contrôle ---
    function getSavedTitresPC() {
        try {
            const titres = localStorage.getItem('pc_titres_custom');
            return titres ? JSON.parse(titres) : [];
        } catch (e) {
            return [];
        }
    }

    function saveTitresPC(titres) {
        localStorage.setItem('pc_titres_custom', JSON.stringify(titres));
    }

    // Récupérer les boutons configurés pour le titre actuel
    function getBoutonsForTitre() {
        const span = document.querySelector('.TitrePC');
        if (!span) return null;

        const titresCustom = getSavedTitresPC();

        // Chercher parmi les titres personnalisés
        for (const config of titresCustom) {
            if (span.textContent.includes(config.titre)) {
                return config.boutons || null;
            }
        }

        // Si c'est un titre par défaut, retourner null (afficher tous les boutons)
        return null;
    }

    // Récupérer les données BFO pour le titre actuel
    function getBFOForTitre() {
        const span = document.querySelector('.TitrePC');
        if (!span) return null;

        const titresCustom = getSavedTitresPC();
        const symbole = getSymbole();

        // Chercher parmi les titres personnalisés
        for (const config of titresCustom) {
            if (span.textContent.includes(config.titre)) {
                const bfo = config.bfo || null;
                if (!bfo) return null;

                // Si on a un symbole et des référentiels par symbole, vérifier si ce symbole a un référentiel spécifique
                if (symbole && bfo.referentiels_par_symbole && bfo.referentiels_par_symbole[symbole]) {
                    // Cloner le BFO et ajouter le référentiel spécifique au symbole
                    const bfoClone = { ...bfo };
                    bfoClone.referentiel = bfo.referentiels_par_symbole[symbole];
                    return bfoClone;
                }

                // Sinon retourner le BFO sans référentiel (sera null)
                return { ...bfo, referentiel: null };
            }
        }

        return null;
    }

    // Variables globales pour stocker les dates BFO à injecter
    let bfoDatesEnAttente = [];
    window._bfoDatesValues = [];

    // Variable pour tracker les champs déjà remplis par BFO (éviter les doublons)
    let bfoChampsRemplis = {
        numeroSerie: null,  // ID du champ où le numéro de série a été mis
        dateVerification: null,  // ID du champ où la date a été mise
        dateHeure: null,
        constat: null,
        referentiel: null
    };

    // Intercepter les requêtes POST pour injecter les dates BFO
    (function intercepterRequetes() {
        // Log pour vérifier que l'interception est installée
        console.log('[BFO INTERCEPT] Installation des intercepteurs fetch et XHR');

        // ========== Interception de fetch ==========
        const originalFetch = window.fetch;
        window.fetch = function(...args) {
            const [url, options] = args;

            console.log('[BFO INTERCEPT] Fetch détecté:', url);

            // Si c'est une requête POST vers processTransitionForm
            if (options && options.method === 'POST' &&
                url && url.includes('/Prm/Reparation/processTransitionForm')) {

                console.log('[BFO INTERCEPT] 🎯 Requête fetch processTransitionForm détectée');
                console.log('[BFO INTERCEPT] Dates en attente:', bfoDatesEnAttente.length, bfoDatesEnAttente);

                // Si on a des dates mappées, les injecter
                if (bfoDatesEnAttente.length > 0) {
                    console.log('[BFO INTERCEPT] ⚡ Injection des dates BFO mappées dans fetch');

                    if (options.body) {
                        if (typeof options.body === 'string') {
                            const params = new URLSearchParams(options.body);
                            for (const dateInfo of bfoDatesEnAttente) {
                                params.set(dateInfo.key, dateInfo.value);
                                console.log(`[BFO INTERCEPT] ✅ Date ajoutée au fetch: ${dateInfo.key} = ${dateInfo.value}`);
                            }
                            options.body = params.toString();
                        } else if (options.body instanceof FormData) {
                            for (const dateInfo of bfoDatesEnAttente) {
                                options.body.set(dateInfo.key, dateInfo.value);
                                console.log(`[BFO INTERCEPT] ✅ Date ajoutée au fetch FormData: ${dateInfo.key} = ${dateInfo.value}`);
                            }
                        }
                    }
                }
                // Si pas de dates mappées mais qu'on a des valeurs stockées
                else if (window._bfoDatesValues && window._bfoDatesValues.length > 0 && options.body) {
                    console.log('[BFO INTERCEPT] ⚡ Fallback fetch: injection des dates dans les champs vides');

                    if (typeof options.body === 'string') {
                        const params = new URLSearchParams(options.body);
                        const dateValues = [...window._bfoDatesValues];
                        let dateIndex = 0;

                        // Chercher tous les champs date_input_ vides
                        for (const [key, value] of params.entries()) {
                            if (key.startsWith('date_input_') && (!value || value.trim() === '')) {
                                if (dateIndex < dateValues.length) {
                                    params.set(key, dateValues[dateIndex]);
                                    console.log(`[BFO INTERCEPT] ✅ Date injectée dans fetch: ${key} = ${dateValues[dateIndex]}`);
                                    dateIndex++;
                                }
                            }
                        }

                        options.body = params.toString();
                    }
                }

                // Injecter l'observation BFO si elle existe
                if (window._bfoObservation && options.body) {
                    console.log('[BFO INTERCEPT] 📝 Injection de l\'observation BFO');

                    if (typeof options.body === 'string') {
                        const params = new URLSearchParams(options.body);
                        // Chercher le champ observation
                        for (const [key, value] of params.entries()) {
                            if (key.startsWith('input_observation_') && (!value || value.trim() === '')) {
                                params.set(key, window._bfoObservation);
                                console.log(`[BFO INTERCEPT] ✅ Observation injectée dans fetch: ${key}`);
                                break;
                            }
                        }
                        options.body = params.toString();
                    } else if (options.body instanceof FormData) {
                        // Chercher le champ observation dans FormData
                        for (const key of options.body.keys()) {
                            if (key.startsWith('input_observation_')) {
                                const currentValue = options.body.get(key);
                                if (!currentValue || currentValue.trim() === '') {
                                    options.body.set(key, window._bfoObservation);
                                    console.log(`[BFO INTERCEPT] ✅ Observation injectée dans fetch FormData: ${key}`);
                                    break;
                                }
                            }
                        }
                    }
                }

                // Nettoyer après envoi
                bfoDatesEnAttente = [];
            }

            return originalFetch.apply(this, args);
        };

        // ========== Interception de XMLHttpRequest ==========
        const originalOpen = XMLHttpRequest.prototype.open;
        const originalSend = XMLHttpRequest.prototype.send;

        XMLHttpRequest.prototype.open = function(method, url) {
            this._url = url;
            this._method = method;
            console.log('[BFO INTERCEPT] XHR open:', method, url);
            return originalOpen.apply(this, arguments);
        };

        XMLHttpRequest.prototype.send = function(data) {
            console.log('[BFO INTERCEPT] XHR send:', this._url);

            // Si c'est une requête POST vers processTransitionForm
            if (this._method === 'POST' &&
                this._url &&
                this._url.includes('/Prm/Reparation/processTransitionForm')) {

                console.log('[BFO INTERCEPT] 🎯 Requête processTransitionForm détectée');
                console.log('[BFO INTERCEPT] Dates en attente:', bfoDatesEnAttente.length, bfoDatesEnAttente);

                // Si on a des dates mappées, les injecter
                if (bfoDatesEnAttente.length > 0) {
                    console.log('[BFO INTERCEPT] ⚡ Injection des dates BFO mappées');

                    if (data instanceof FormData) {
                        for (const dateInfo of bfoDatesEnAttente) {
                            data.set(dateInfo.key, dateInfo.value);
                            console.log(`[BFO INTERCEPT] ✅ Date ajoutée au XHR FormData: ${dateInfo.key} = ${dateInfo.value}`);
                        }
                    } else if (typeof data === 'string') {
                        const params = new URLSearchParams(data);
                        for (const dateInfo of bfoDatesEnAttente) {
                            params.set(dateInfo.key, dateInfo.value);
                            console.log(`[BFO INTERCEPT] ✅ Date ajoutée au XHR string: ${dateInfo.key} = ${dateInfo.value}`);
                        }
                        data = params.toString();
                    }
                }
                // Si pas de dates mappées mais qu'on a des valeurs de dates stockées
                else if (window._bfoDatesValues && window._bfoDatesValues.length > 0) {
                    console.log('[BFO INTERCEPT] ⚡ Fallback: injection des dates dans les champs vides');

                    if (typeof data === 'string') {
                        const params = new URLSearchParams(data);
                        const dateValues = [...window._bfoDatesValues];
                        let dateIndex = 0;

                        // Chercher tous les champs date_input_ dans le payload
                        for (const [key, value] of params.entries()) {
                            if (key.startsWith('date_input_') && (!value || value.trim() === '')) {
                                if (dateIndex < dateValues.length) {
                                    params.set(key, dateValues[dateIndex]);
                                    console.log(`[BFO INTERCEPT] ✅ Date injectée: ${key} = ${dateValues[dateIndex]}`);
                                    dateIndex++;
                                }
                            }
                        }

                        data = params.toString();
                    }
                }

                // Injecter l'observation BFO si elle existe
                if (window._bfoObservation) {
                    console.log('[BFO INTERCEPT] 📝 Injection de l\'observation BFO dans XHR');

                    if (typeof data === 'string') {
                        const params = new URLSearchParams(data);
                        // Chercher le champ observation
                        for (const [key, value] of params.entries()) {
                            if (key.startsWith('input_observation_') && (!value || value.trim() === '')) {
                                params.set(key, window._bfoObservation);
                                console.log(`[BFO INTERCEPT] ✅ Observation injectée dans XHR: ${key}`);
                                break;
                            }
                        }
                        data = params.toString();
                    } else if (data instanceof FormData) {
                        // Chercher le champ observation dans FormData
                        for (const key of data.keys()) {
                            if (key.startsWith('input_observation_')) {
                                const currentValue = data.get(key);
                                if (!currentValue || currentValue.trim() === '') {
                                    data.set(key, window._bfoObservation);
                                    console.log(`[BFO INTERCEPT] ✅ Observation injectée dans XHR FormData: ${key}`);
                                    break;
                                }
                            }
                        }
                    }
                }

                // Nettoyer après envoi
                bfoDatesEnAttente = [];
            }

            return originalSend.call(this, data);
        };
    })();

    // Remplir automatiquement les appareils de mesure avec les données BFO
    function remplirAppareilsBFO() {
        const bfoData = getBFOForTitre();
        console.log('[BFO DEBUG] Données BFO récupérées:', bfoData);

        // Réinitialiser le tracking des champs remplis
        bfoChampsRemplis = {
            numeroSerie: null,
            dateVerification: null,
            dateHeure: null,
            constat: null,
            referentiel: null
        };
        console.log('[BFO DEBUG] Tracking des champs réinitialisé');

        if (!bfoData || !bfoData.enabled) {
            alert('⚠️ Aucune donnée BFO configurée pour ce plan de contrôle');
            return;
        }

        // Vérifier si des dates de validité sont dépassées
        const aujourdhui = new Date();
        aujourdhui.setHours(0, 0, 0, 0); // Comparer uniquement les dates, pas les heures

        const appareilsPerimes = [];

        if (bfoData.oscilloscope_date && bfoData.oscilloscope_date.trim() !== '') {
            const dateValidite = new Date(bfoData.oscilloscope_date);
            dateValidite.setHours(0, 0, 0, 0);
            if (dateValidite < aujourdhui) {
                const joursDepasses = Math.floor((aujourdhui - dateValidite) / (1000 * 60 * 60 * 24));
                appareilsPerimes.push(`Oscilloscope (${bfoData.oscilloscope || 'N/A'}): périmé depuis ${joursDepasses} jour(s)`);
            }
        }

        if (bfoData.multimetre_date && bfoData.multimetre_date.trim() !== '') {
            const dateValidite = new Date(bfoData.multimetre_date);
            dateValidite.setHours(0, 0, 0, 0);
            if (dateValidite < aujourdhui) {
                const joursDepasses = Math.floor((aujourdhui - dateValidite) / (1000 * 60 * 60 * 24));
                appareilsPerimes.push(`Multimètre (${bfoData.multimetre || 'N/A'}): périmé depuis ${joursDepasses} jour(s)`);
            }
        }

        if (bfoData.gbf_date && bfoData.gbf_date.trim() !== '') {
            const dateValidite = new Date(bfoData.gbf_date);
            dateValidite.setHours(0, 0, 0, 0);
            if (dateValidite < aujourdhui) {
                const joursDepasses = Math.floor((aujourdhui - dateValidite) / (1000 * 60 * 60 * 24));
                appareilsPerimes.push(`GBF (${bfoData.gbf || 'N/A'}): périmé depuis ${joursDepasses} jour(s)`);
            }
        }

        // Afficher l'alerte si des appareils sont périmés
        if (appareilsPerimes.length > 0) {
            const message = '⚠️ ATTENTION : Appareil(s) de mesure périmé(s) !\n\n' +
                          appareilsPerimes.join('\n') +
                          '\n\n⚠️ Les dates de validité sont dépassées !';
            alert(message);
            console.warn('[BFO ALERTE] Appareils périmés détectés:', appareilsPerimes);
        }

        // Réinitialiser les dates en attente
        bfoDatesEnAttente = [];

        // Stocker TOUTES les dates configurées immédiatement
        const datesAInjecter = [];

        if (bfoData.oscilloscope_date && bfoData.oscilloscope_date.trim() !== '') {
            const dateObj = new Date(bfoData.oscilloscope_date);
            const day = String(dateObj.getDate()).padStart(2, '0');
            const month = String(dateObj.getMonth() + 1).padStart(2, '0');
            const year = dateObj.getFullYear();
            datesAInjecter.push(`${day}/${month}/${year}`);
            console.log(`[BFO DEBUG] Date Oscilloscope préparée: ${day}/${month}/${year}`);
        }

        if (bfoData.multimetre_date && bfoData.multimetre_date.trim() !== '') {
            const dateObj = new Date(bfoData.multimetre_date);
            const day = String(dateObj.getDate()).padStart(2, '0');
            const month = String(dateObj.getMonth() + 1).padStart(2, '0');
            const year = dateObj.getFullYear();
            datesAInjecter.push(`${day}/${month}/${year}`);
            console.log(`[BFO DEBUG] Date Multimètre préparée: ${day}/${month}/${year}`);
        }

        if (bfoData.gbf_date && bfoData.gbf_date.trim() !== '') {
            const dateObj = new Date(bfoData.gbf_date);
            const day = String(dateObj.getDate()).padStart(2, '0');
            const month = String(dateObj.getMonth() + 1).padStart(2, '0');
            const year = dateObj.getFullYear();
            datesAInjecter.push(`${day}/${month}/${year}`);
            console.log(`[BFO DEBUG] Date GBF préparée: ${day}/${month}/${year}`);
        }

        console.log(`[BFO DEBUG] 📅 Total dates à injecter:`, datesAInjecter.length, datesAInjecter);

        // Stocker globalement pour l'interception
        window._bfoDatesValues = datesAInjecter;

        // Stocker l'observation du symbole actuel pour l'interception
        const symboleActuel = getSymbole();
        if (symboleActuel && bfoData.observations_par_symbole && bfoData.observations_par_symbole[symboleActuel]) {
            window._bfoObservation = bfoData.observations_par_symbole[symboleActuel].trim();
            console.log(`[BFO DEBUG] 📝 Observation du symbole ${symboleActuel} à injecter:`, window._bfoObservation);
        } else {
            window._bfoObservation = null;
        }

        // Fonction pour chercher et mappe les IDs de champs date
        const mapperChampsDates = (tentative = 0) => {
            // Chercher TOUS les champs date_input_ dans la page
            const allDateInputs = document.querySelectorAll('input[id^="date_input_"]');
            console.log(`[BFO DEBUG] Tentative ${tentative + 1} - Champs date trouvés:`, allDateInputs.length);

            if (allDateInputs.length > 0) {
                let index = 0;
                for (const input of allDateInputs) {
                    // Ne prendre que les champs vides
                    if (!input.value || input.value.trim() === '') {
                        if (index < datesAInjecter.length) {
                            bfoDatesEnAttente.push({
                                key: input.id,
                                value: datesAInjecter[index]
                            });
                            console.log(`[BFO DEBUG] ✅ Mapping: ${input.id} => ${datesAInjecter[index]}`);
                            index++;
                        }
                    }
                }

                console.log(`[BFO DEBUG] 📋 Dates mappées:`, bfoDatesEnAttente.length, bfoDatesEnAttente);
            } else if (tentative < 20) {
                // Réessayer si pas trouvé
                setTimeout(() => mapperChampsDates(tentative + 1), 300);
            } else {
                console.error(`[BFO DEBUG] ❌ Aucun champ date trouvé après ${tentative + 1} tentatives`);
            }
        };

        // Démarrer la recherche des champs
        setTimeout(() => mapperChampsDates(), 500);

        // Fonction pour injecter l'observation
        const injecterObservation = (tentative = 0) => {
            if (window._bfoObservation) {
                // Chercher le champ observation qui commence par input_observation_
                const obsField = document.querySelector('textarea[id^="input_observation_"]');

                if (obsField) {
                    obsField.value = window._bfoObservation;
                    console.log(`[BFO DEBUG] ✅ Observation injectée dans ${obsField.id}:`, window._bfoObservation);

                    // Déclencher l'événement change pour que l'application détecte la modification
                    const event = new Event('change', { bubbles: true });
                    obsField.dispatchEvent(event);
                } else if (tentative < 20) {
                    // Réessayer si pas trouvé
                    setTimeout(() => injecterObservation(tentative + 1), 300);
                } else {
                    console.warn(`[BFO DEBUG] ⚠️ Champ observation non trouvé après ${tentative + 1} tentatives`);
                }
            }
        };

        // Démarrer l'injection de l'observation
        setTimeout(() => injecterObservation(), 500);

        // Essayer aussi de remplir les appareils et numéros si possible
        const appareilsMapping = {
            oscilloscope: {
                value: 'Oscilloscope',
                numero: bfoData.oscilloscope
            },
            multimetre: {
                value: 'Multimètre',
                numero: bfoData.multimetre
            },
            gbf: {
                value: 'GBF',
                numero: bfoData.gbf
            }
        };

        let nbRemplis = 0;

        // Chercher TOUS les dropdowns d'appareils (pas seulement "Aucune sélection")
        const allDropdowns = document.querySelectorAll('button.btn.dropdown-toggle[data-id^="liste_input_"]');
        console.log(`[BFO DEBUG] Dropdowns d'appareils trouvés:`, allDropdowns.length);

        for (const [key, data] of Object.entries(appareilsMapping)) {
            if (!data.numero || data.numero.trim() === '') {
                console.log(`[BFO DEBUG] Appareil ${key} ignoré (pas de numéro)`);
                continue;
            }

            for (const button of allDropdowns) {
                const dataId = button.getAttribute('data-id');
                const currentTitle = button.getAttribute('title');

                // Seulement si vide OU si correspond déjà à l'appareil
                if (currentTitle === 'Aucune sélection' || currentTitle === data.value) {
                    const panelId = dataId.replace('liste_input_', '');
                    const select = document.getElementById(dataId);
                    if (!select) continue;

                    const option = Array.from(select.options).find(opt =>
                        opt.value.toLowerCase() === data.value.toLowerCase()
                    );
                    if (!option) continue;

                    // Sélectionner l'appareil
                    option.selected = true;
                    select.dispatchEvent(new Event('change', { bubbles: true }));

                    const filterOption = button.querySelector('.filter-option');
                    if (filterOption) filterOption.textContent = data.value;
                    button.setAttribute('title', data.value);
                    button.classList.remove('bs-placeholder');

                    // Remplir le numéro
                    const numeroInput = document.getElementById('input_outil_' + panelId);
                    if (numeroInput) {
                        numeroInput.value = data.numero;
                        numeroInput.dispatchEvent(new Event('input', { bubbles: true }));
                        numeroInput.dispatchEvent(new Event('change', { bubbles: true }));
                        console.log(`[BFO DEBUG] ✅ ${key} rempli: ${data.numero}`);
                        nbRemplis++;
                    }

                    break;
                }
            }
        }

        if (nbRemplis > 0) {
            console.log(`[BFO DEBUG] ${nbRemplis} appareil(s) rempli(s)`);
        }

        // === REMPLISSAGES AUTOMATIQUES SUPPLÉMENTAIRES ===
        // Chercher les champs par leur contexte (titre du panel parent)

        const aujourdhuiFormatDate = new Date();
        const dayNow = String(aujourdhuiFormatDate.getDate()).padStart(2, '0');
        const monthNow = String(aujourdhuiFormatDate.getMonth() + 1).padStart(2, '0');
        const yearNow = aujourdhuiFormatDate.getFullYear();
        const heureNow = String(aujourdhuiFormatDate.getHours()).padStart(2, '0');
        const minuteNow = String(aujourdhuiFormatDate.getMinutes()).padStart(2, '0');

        const dateAujourdhui = `${dayNow}/${monthNow}/${yearNow}`;
        const dateHeureFormat = `${dayNow}${monthNow}${yearNow}${heureNow}${minuteNow}`;

        // Afficher tous les champs disponibles pour debug
        const tousLesChampsChaine = document.querySelectorAll('input[id^="chaine_input_"]');
        const tousLesChampsDate = document.querySelectorAll('input[id^="date_input_"]');
        console.log(`[BFO DEBUG] === CHAMPS DISPONIBLES ===`);
        console.log(`[BFO DEBUG] Champs chaine_input trouvés: ${tousLesChampsChaine.length}`);
        tousLesChampsChaine.forEach((c, i) => {
            // Chercher le label associé à ce champ
            let labelAssocie = 'Inconnu';
            const parent = c.closest('.panel, .form-group, .row');
            if (parent) {
                const labelEl = parent.querySelector('.panel-heading, .title-panel, label, .labelsPRM');
                if (labelEl) labelAssocie = labelEl.textContent.trim();
            }
            console.log(`  ${i + 1}. ${c.id} - value: "${c.value}" - label: "${labelAssocie}"`);
        });
        console.log(`[BFO DEBUG] Champs date_input trouvés: ${tousLesChampsDate.length}`);
        tousLesChampsDate.forEach((c, i) => {
            let labelAssocie = 'Inconnu';
            const parent = c.closest('.panel, .form-group, .row');
            if (parent) {
                const labelEl = parent.querySelector('.panel-heading, .title-panel, label, .labelsPRM');
                if (labelEl) labelAssocie = labelEl.textContent.trim();
            }
            console.log(`  ${i + 1}. ${c.id} - value: "${c.value}" - label: "${labelAssocie}"`);
        });
        console.log(`[BFO DEBUG] ===========================`);

        // Fonction pour trouver un champ par le texte du label/titre parent
        const trouverChampParContexte = (texteContexte, typeChamp = 'input') => {
            // EXCLURE le panel d'informations en lecture seule
            const panelInfos = document.getElementById('repair_details_panel');

            // PRIORITÉ 1: Chercher dans les .title-panel (labels des champs du formulaire PC)
            const titlePanels = document.querySelectorAll('.title-panel');
            console.log(`[BFO DEBUG] Recherche de "${texteContexte}" dans ${titlePanels.length} title-panel`);

            for (const titlePanel of titlePanels) {
                // Ignorer si dans le panel d'infos
                if (panelInfos && panelInfos.contains(titlePanel)) {
                    continue;
                }

                const text = titlePanel.textContent.trim().toLowerCase();
                const searchText = texteContexte.toLowerCase();

                if (text.includes(searchText)) {
                    console.log(`[BFO DEBUG] ✓ Title-panel trouvé: "${titlePanel.textContent.trim()}"`);

                    // Remonter au panel-heading, puis chercher le champ dans le même niveau
                    const panelHeading = titlePanel.closest('.panel-heading');
                    if (panelHeading) {
                        // Chercher le champ dans le même panel-heading (à côté du titre)
                        let champ = panelHeading.querySelector(typeChamp + '[id^="chaine_input_"], ' + typeChamp + '[id^="date_input_"]');
                        if (champ) {
                            console.log(`[BFO DEBUG] ✓ Champ trouvé dans panel-heading: ${champ.id}`);
                            return champ;
                        }
                    }
                }
            }

            console.log(`[BFO DEBUG] ✗ Aucun champ trouvé pour "${texteContexte}" dans title-panel`);
            return null;
        };

        // 1. Numéro de série depuis repair_details_organ_serial
        const serialSpan = document.getElementById('repair_details_organ_serial');
        if (serialSpan && serialSpan.textContent.trim() !== '' && !bfoChampsRemplis.numeroSerie) {
            const numeroSerie = serialSpan.textContent.trim();
            console.log(`[BFO DEBUG] Numéro de série trouvé dans span: ${numeroSerie}`);

            // Méthode 1: Recherche contextuelle dans title-panel avec "N° de série:"
            let champSerie = trouverChampParContexte('n° de série:') ||
                             trouverChampParContexte('n° de série') ||
                             trouverChampParContexte('numéro de série');

            // Méthode 2: Fallback - chercher le premier champ chaine_input VIDE (hors repair_details_panel)
            if (!champSerie) {
                console.log(`[BFO DEBUG] Méthode contextuelle échouée, utilisation du fallback`);
                const panelInfos = document.getElementById('repair_details_panel');
                const allChamps = document.querySelectorAll('input[id^="chaine_input_"]');

                for (const champ of allChamps) {
                    // Ignorer les champs dans le panel d'infos
                    if (panelInfos && panelInfos.contains(champ)) continue;

                    // Chercher un champ vide et pas encore utilisé
                    if ((!champ.value || champ.value.trim() === '') && !Object.values(bfoChampsRemplis).includes(champ.id)) {
                        champSerie = champ;
                        console.log(`[BFO DEBUG] FALLBACK: Premier champ chaine_input vide trouvé: ${champSerie.id}`);
                        break;
                    }
                }
            }

            if (champSerie && (!champSerie.value || champSerie.value.trim() === '')) {
                champSerie.value = numeroSerie;
                champSerie.dispatchEvent(new Event('input', { bubbles: true }));
                champSerie.dispatchEvent(new Event('change', { bubbles: true }));
                bfoChampsRemplis.numeroSerie = champSerie.id;  // MARQUER comme rempli
                console.log(`[BFO DEBUG] ✅ Numéro de série rempli: ${champSerie.id} = ${numeroSerie}`);
            } else if (!champSerie) {
                console.log(`[BFO DEBUG] ❌ AUCUN champ numéro de série trouvé`);
            } else {
                console.log(`[BFO DEBUG] ⚠️ Champ numéro de série déjà rempli: ${champSerie.value}`);
            }
        } else if (bfoChampsRemplis.numeroSerie) {
            console.log(`[BFO DEBUG] ⏭️ Numéro de série déjà rempli dans: ${bfoChampsRemplis.numeroSerie}`);
        } else {
            console.log(`[BFO DEBUG] ⚠️ Span repair_details_organ_serial non trouvé ou vide`);
        }

        // 2. Date d'aujourd'hui dans le champ "Date intervention:"
        if (!bfoChampsRemplis.dateVerification) {
            // Chercher "Date intervention:" dans title-panel
            let champDateIntervention = trouverChampParContexte('date intervention:') ||
                                        trouverChampParContexte('date intervention') ||
                                        trouverChampParContexte('date de vérification') ||
                                        trouverChampParContexte('date vérification');

            // Fallback si non trouvé par contexte
            if (!champDateIntervention) {
                console.log(`[BFO DEBUG] Date intervention: Méthode contextuelle échouée, utilisation du fallback`);
                const panelInfos = document.getElementById('repair_details_panel');
                const allChampsDate = document.querySelectorAll('input[id^="date_input_"]');

                for (const champ of allChampsDate) {
                    if (panelInfos && panelInfos.contains(champ)) continue;
                    // Chercher un champ vide et pas encore utilisé
                    if ((!champ.value || champ.value.trim() === '') && !Object.values(bfoChampsRemplis).includes(champ.id)) {
                        champDateIntervention = champ;
                        console.log(`[BFO DEBUG] FALLBACK: Premier champ date_input vide trouvé: ${champDateIntervention.id}`);
                        break;
                    }
                }
            }

            if (champDateIntervention && (!champDateIntervention.value || champDateIntervention.value.trim() === '')) {
                champDateIntervention.value = dateAujourdhui;
                champDateIntervention.dispatchEvent(new Event('input', { bubbles: true }));
                champDateIntervention.dispatchEvent(new Event('change', { bubbles: true }));
                bfoChampsRemplis.dateVerification = champDateIntervention.id;  // MARQUER comme rempli
                console.log(`[BFO DEBUG] ✅ Date intervention remplie: ${champDateIntervention.id} = ${dateAujourdhui}`);
            } else if (!champDateIntervention) {
                console.log(`[BFO DEBUG] ❌ AUCUN champ date intervention trouvé`);
            } else {
                console.log(`[BFO DEBUG] ⚠️ Champ date intervention déjà rempli: ${champDateIntervention.value}`);
            }
        } else {
            console.log(`[BFO DEBUG] ⏭️ Date intervention déjà remplie dans: ${bfoChampsRemplis.dateVerification}`);
        }

        // 3. N° de constat de vérification (format DDMMYYYYHHMM sans "/" ni espaces)
        if (!bfoChampsRemplis.constat) {
            let champConstat = trouverChampParContexte('n° de constat de vérification:') ||
                               trouverChampParContexte('n° de constat de vérification') ||
                               trouverChampParContexte('constat de vérification') ||
                               trouverChampParContexte('n° de constat') ||
                               trouverChampParContexte('constat');

            // Fallback si non trouvé par contexte
            if (!champConstat) {
                console.log(`[BFO DEBUG] Constat: Méthode contextuelle échouée, utilisation du fallback`);
                const panelInfos = document.getElementById('repair_details_panel');
                const allChampsChaine = document.querySelectorAll('input[id^="chaine_input_"]');

                for (const champ of allChampsChaine) {
                    if (panelInfos && panelInfos.contains(champ)) continue;
                    // Chercher un champ vide et pas encore utilisé
                    if ((!champ.value || champ.value.trim() === '') && !Object.values(bfoChampsRemplis).includes(champ.id)) {
                        champConstat = champ;
                        console.log(`[BFO DEBUG] FALLBACK: Champ chaine_input vide trouvé pour constat: ${champConstat.id}`);
                        break;
                    }
                }
            }

            if (champConstat && (!champConstat.value || champConstat.value.trim() === '')) {
                champConstat.value = dateHeureFormat;
                champConstat.dispatchEvent(new Event('input', { bubbles: true }));
                champConstat.dispatchEvent(new Event('change', { bubbles: true }));
                bfoChampsRemplis.constat = champConstat.id;  // MARQUER comme rempli
                console.log(`[BFO DEBUG] ✅ N° de constat rempli: ${champConstat.id} = ${dateHeureFormat}`);
            } else if (!champConstat) {
                console.log(`[BFO DEBUG] ❌ AUCUN champ constat trouvé`);
            } else {
                console.log(`[BFO DEBUG] ⚠️ Champ constat déjà rempli: ${champConstat.value}`);
            }
        } else {
            console.log(`[BFO DEBUG] ⏭️ Constat déjà rempli dans: ${bfoChampsRemplis.constat}`);
        }

        // 4. Sélectionner "VERIFICATION" dans le dropdown approprié (Type d'action)
        const labelVerif = Array.from(document.querySelectorAll('.panel-heading, label, .form-group')).find(el =>
            el.textContent.toLowerCase().includes('type') ||
            el.textContent.toLowerCase().includes('action') ||
            el.textContent.toLowerCase().includes('opération')
        );

        if (labelVerif) {
            const panelParent = labelVerif.closest('.panel, .form-group') || labelVerif.parentElement;
            const dropdown = panelParent?.querySelector('button.btn.dropdown-toggle[data-id^="liste_input_"]');

            if (dropdown) {
                const currentTitle = dropdown.getAttribute('title');
                if (currentTitle === 'Aucune sélection' || currentTitle === '') {
                    const dataId = dropdown.getAttribute('data-id');
                    const select = document.getElementById(dataId);

                    if (select) {
                        const optionVerif = Array.from(select.options).find(opt =>
                            opt.value.toUpperCase().includes('VERIFICATION') ||
                            opt.textContent.toUpperCase().includes('VERIFICATION')
                        );

                        if (optionVerif) {
                            optionVerif.selected = true;
                            select.dispatchEvent(new Event('change', { bubbles: true }));

                            const filterOption = dropdown.querySelector('.filter-option');
                            if (filterOption) filterOption.textContent = optionVerif.textContent;
                            dropdown.setAttribute('title', optionVerif.textContent);
                            dropdown.classList.remove('bs-placeholder');

                            console.log(`[BFO DEBUG] ✅ VERIFICATION sélectionné (Type): ${dataId}`);
                        } else {
                            console.log(`[BFO DEBUG] ⚠️ Option VERIFICATION non trouvée dans le dropdown Type`);
                        }
                    }
                } else {
                    console.log(`[BFO DEBUG] ⚠️ Dropdown Type déjà rempli: ${currentTitle}`);
                }
            } else {
                console.log(`[BFO DEBUG] ⚠️ Dropdown Type non trouvé`);
            }
        } else {
            console.log(`[BFO DEBUG] ⚠️ Label Type/Action non trouvé`);
        }

        // 4b. Sélectionner "VERIFICATION" dans le dropdown "Motif de dépose"
        const labelMotif = Array.from(document.querySelectorAll('.panel-heading, label, .form-group')).find(el =>
            el.textContent.toLowerCase().includes('motif de dépose') ||
            el.textContent.toLowerCase().includes('motif dépose') ||
            el.textContent.toLowerCase().includes('motif')
        );

        if (labelMotif) {
            const panelParent = labelMotif.closest('.panel, .form-group') || labelMotif.parentElement;
            const dropdown = panelParent?.querySelector('button.btn.dropdown-toggle[data-id^="liste_input_"]');

            if (dropdown) {
                const currentTitle = dropdown.getAttribute('title');
                if (currentTitle === 'Aucune sélection' || currentTitle === '') {
                    const dataId = dropdown.getAttribute('data-id');
                    const select = document.getElementById(dataId);

                    if (select) {
                        const optionVerif = Array.from(select.options).find(opt =>
                            opt.value.toUpperCase().includes('VERIFICATION') ||
                            opt.textContent.toUpperCase().includes('VERIFICATION')
                        );

                        if (optionVerif) {
                            optionVerif.selected = true;
                            select.dispatchEvent(new Event('change', { bubbles: true }));

                            const filterOption = dropdown.querySelector('.filter-option');
                            if (filterOption) filterOption.textContent = optionVerif.textContent;
                            dropdown.setAttribute('title', optionVerif.textContent);
                            dropdown.classList.remove('bs-placeholder');

                            console.log(`[BFO DEBUG] ✅ VERIFICATION sélectionné (Motif): ${dataId}`);
                        } else {
                            console.log(`[BFO DEBUG] ⚠️ Option VERIFICATION non trouvée dans le dropdown Motif`);
                        }
                    }
                } else {
                    console.log(`[BFO DEBUG] ⚠️ Dropdown Motif déjà rempli: ${currentTitle}`);
                }
            } else {
                console.log(`[BFO DEBUG] ⚠️ Dropdown Motif non trouvé`);
            }
        } else {
            console.log(`[BFO DEBUG] ⚠️ Label Motif de dépose non trouvé`);
        }

        // 5. Remplir le référentiel utilisé
        if (bfoData.referentiel && bfoData.referentiel.trim() !== '') {
            const champReferentiel = trouverChampParContexte('référentiel') ||
                                     trouverChampParContexte('referentiel') ||
                                     trouverChampParContexte('norme');

            if (champReferentiel && (!champReferentiel.value || champReferentiel.value.trim() === '')) {
                champReferentiel.value = bfoData.referentiel;
                champReferentiel.dispatchEvent(new Event('input', { bubbles: true }));
                champReferentiel.dispatchEvent(new Event('change', { bubbles: true }));
                console.log(`[BFO DEBUG] ✅ Référentiel rempli: ${champReferentiel.id} = ${bfoData.referentiel}`);
            } else {
                console.log(`[BFO DEBUG] ⚠️ Champ référentiel non trouvé ou déjà rempli`);
            }
        }

        console.log('[BFO DEBUG] === FIN DES REMPLISSAGES AUTOMATIQUES ===');
        console.log('[BFO DEBUG] Champs remplis:', bfoChampsRemplis);
    }

    function verifierTitrePC() {
        const span = document.querySelector('.TitrePC');
        if (!span) return false;

        // Titres par défaut
        const titresDefaut = [
            "Plan de contrôle",
            "PLAN DE CONTROLE",
            "PLAN DE CONTRÔLE",
            "Tiroir EMC 846",
            "PLATINE DE CMDE DE PORTE"
        ];

        // Titres personnalisés
        const titresCustom = getSavedTitresPC();

        // Vérifier titres par défaut
        if (titresDefaut.some(titre => span.textContent.includes(titre))) {
            return true;
        }

        // Vérifier titres personnalisés
        return titresCustom.some(config => span.textContent.includes(config.titre));
    }

    // --- Modale de gestion des titres personnalisés ---
    function ouvrirModaleGestionTitres() {
        const old = document.getElementById('titres_modal_overlay');
        if (old) old.remove();

        const overlay = document.createElement('div');
        overlay.id = 'titres_modal_overlay';
        Object.assign(overlay.style, {
            position: 'fixed', top: '0', left: '0', width: '100%', height: '100%',
            background: 'rgba(0,0,0,0.6)', zIndex: '99999', display: 'flex',
            justifyContent: 'center', alignItems: 'center'
        });

        const modal = document.createElement('div');
        Object.assign(modal.style, {
            background: '#fff', borderRadius: '12px', padding: '25px',
            minWidth: '500px', maxWidth: '600px', maxHeight: '80vh',
            boxShadow: '0 8px 32px rgba(0,0,0,0.25)', fontFamily: 'Arial, sans-serif',
            overflow: 'auto'
        });

        const title = document.createElement('h3');
        Object.assign(title.style, { marginTop: '0', marginBottom: '15px', color: '#333' });
        title.textContent = '🎯 Gestion des titres du Plan de Contrôle';
        modal.appendChild(title);

        // Formulaire d'ajout (placé en haut)
        const addSection = document.createElement('div');
        Object.assign(addSection.style, { marginTop: '20px', marginBottom: '20px' });

        const addTitle = document.createElement('h4');
        Object.assign(addTitle.style, { marginTop: '0', marginBottom: '10px', fontSize: '15px' });
        addTitle.textContent = 'Ajouter un nouveau titre :';
        addSection.appendChild(addTitle);

        const inputRow = document.createElement('div');
        Object.assign(inputRow.style, { display: 'flex', gap: '10px', marginBottom: '15px' });

        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = 'Ex: PLATINE TEST 2024';
        Object.assign(input.style, {
            flex: '1', padding: '8px 12px', borderRadius: '6px',
            border: '1px solid #ced4da', fontSize: '14px'
        });
        inputRow.appendChild(input);

        const btnAdd = document.createElement('button');
        btnAdd.textContent = '✅ Ajouter';
        Object.assign(btnAdd.style, {
            background: '#28a745', color: '#fff', border: 'none',
            borderRadius: '6px', padding: '8px 16px', cursor: 'pointer',
            fontSize: '14px', fontWeight: 'bold'
        });

        inputRow.appendChild(btnAdd);
        addSection.appendChild(inputRow);

        // Logique du bouton ajouter (à définir après renderList)
        const setupAddButton = () => {
            btnAdd.onclick = () => {
                const newTitre = input.value.trim();
                if (!newTitre) {
                    alert('⚠️ Veuillez entrer un titre');
                    return;
                }

                const titres = getSavedTitresPC();
                if (titres.some(config => (config.titre || config) === newTitre)) {
                    alert('⚠️ Ce titre existe déjà');
                    return;
                }

                // Ouvrir la modale de sélection des boutons
                ouvrirModaleBoutonsSelection(newTitre, (nouvelleConfig) => {
                    // Normaliser la configuration
                    const boutons = Array.isArray(nouvelleConfig) ? nouvelleConfig : nouvelleConfig.boutons;
                    const bfo = Array.isArray(nouvelleConfig) ? null : nouvelleConfig.bfo;

                    const newConfig = { titre: newTitre, boutons: boutons };
                    if (bfo) newConfig.bfo = bfo;

                    titres.push(newConfig);
                    saveTitresPC(titres);
                    input.value = '';
                    renderList();
                });
            };
        };

        // Liste des titres existants
        const listContainer = document.createElement('div');
        Object.assign(listContainer.style, {
            marginBottom: '20px', padding: '15px', background: '#f8f9fa',
            borderRadius: '8px'
        });

        // État du collapse (caché par défaut)
        let isListExpanded = false;

        // Header avec flèche cliquable
        const listHeader = document.createElement('div');
        Object.assign(listHeader.style, {
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            marginTop: '0',
            marginBottom: '12px',
            userSelect: 'none'
        });

        const arrowIcon = document.createElement('span');
        arrowIcon.textContent = '▼';
        Object.assign(arrowIcon.style, {
            fontSize: '12px',
            marginRight: '8px',
            transition: 'transform 0.2s ease',
            display: 'inline-block',
            transform: 'rotate(-90deg)'
        });

        const listTitle = document.createElement('h4');
        Object.assign(listTitle.style, {
            margin: '0',
            fontSize: '15px',
            display: 'inline'
        });
        listTitle.textContent = 'Titres configurés :';

        listHeader.appendChild(arrowIcon);
        listHeader.appendChild(listTitle);
        listContainer.appendChild(listHeader);

        // Conteneur scrollable pour la liste
        const listScrollContainer = document.createElement('div');
        listScrollContainer.id = 'titres_scroll_container';
        Object.assign(listScrollContainer.style, {
            maxHeight: '0',
            overflow: 'auto',
            transition: 'max-height 0.3s ease, opacity 0.3s ease',
            opacity: '0'
        });
        listContainer.appendChild(listScrollContainer);

        // Fonction toggle
        const toggleList = () => {
            isListExpanded = !isListExpanded;
            if (isListExpanded) {
                arrowIcon.style.transform = 'rotate(0deg)';
                listScrollContainer.style.maxHeight = '300px';
                listScrollContainer.style.opacity = '1';
            } else {
                arrowIcon.style.transform = 'rotate(-90deg)';
                listScrollContainer.style.maxHeight = '0';
                listScrollContainer.style.opacity = '0';
            }
        };

        listHeader.onclick = toggleList;

        const renderList = () => {
            const existingList = listScrollContainer.querySelector('#titres_list');
            if (existingList) existingList.remove();

            const titres = getSavedTitresPC();
            const titresDefaut = [
                "Plan de contrôle",
                "PLAN DE CONTROLE",
                "PLAN DE CONTRÔLE",
                "Tiroir EMC 846",
                "PLATINE DE CMDE DE PORTE"
            ];

            const ul = document.createElement('div');
            ul.id = 'titres_list';

            // Combiner tous les titres dans une seule liste
            const tousTitres = [];

            // Ajouter les titres par défaut
            titresDefaut.forEach(titreDefaut => {
                const config = titres.find(c => c.titre === titreDefaut);
                tousTitres.push({
                    titre: titreDefaut,
                    boutons: config ? config.boutons : null,
                    bfo: config ? config.bfo : null,
                    isDefault: true
                });
            });

            // Ajouter les titres personnalisés
            titres.forEach(config => {
                const titreName = config.titre || config;
                if (!titresDefaut.includes(titreName)) {
                    tousTitres.push({
                        titre: titreName,
                        boutons: config.boutons || null,
                        bfo: config.bfo || null,
                        isDefault: false
                    });
                }
            });

            if (tousTitres.length === 0) {
                const empty = document.createElement('p');
                Object.assign(empty.style, { color: '#999', fontStyle: 'italic', margin: '0' });
                empty.textContent = 'Aucun titre configuré';
                ul.appendChild(empty);
            } else {
                tousTitres.forEach((item) => {
                    const row = document.createElement('div');
                    Object.assign(row.style, {
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '10px', marginBottom: '8px', background: '#fff',
                        borderRadius: '6px', border: '1px solid #dee2e6'
                    });

                    const infoDiv = document.createElement('div');
                    Object.assign(infoDiv.style, { flex: '1' });

                    const titreText = document.createElement('div');
                    Object.assign(titreText.style, {
                        wordBreak: 'break-word',
                        fontFamily: 'monospace',
                        fontWeight: 'bold',
                        marginBottom: '4px'
                    });
                    titreText.textContent = item.titre;
                    infoDiv.appendChild(titreText);

                    // Afficher la config des boutons
                    const boutonsText = document.createElement('div');
                    Object.assign(boutonsText.style, { fontSize: '11px', color: '#666' });
                    if (item.boutons && item.boutons.length > 0) {
                        boutonsText.textContent = '🔘 Boutons: ' + item.boutons.join(', ');
                    } else {
                        Object.assign(boutonsText.style, { color: '#999' });
                        boutonsText.textContent = '🔘 Tous les boutons';
                    }
                    infoDiv.appendChild(boutonsText);

                    // Afficher si BFO est activé
                    if (item.bfo && item.bfo.enabled) {
                        const bfoText = document.createElement('div');
                        Object.assign(bfoText.style, { fontSize: '11px', color: '#0056b3', marginTop: '3px', fontWeight: '500' });
                        bfoText.textContent = '🔧 BFO activé';
                        infoDiv.appendChild(bfoText);
                    }

                    row.appendChild(infoDiv);

                    const btnGroup = document.createElement('div');
                    Object.assign(btnGroup.style, { display: 'flex', gap: '5px' });

                    // Bouton Modifier
                    const btnModif = document.createElement('button');
                    btnModif.textContent = '✏️';
                    btnModif.title = 'Modifier les boutons';
                    Object.assign(btnModif.style, {
                        background: '#ffc107', color: '#000', border: 'none',
                        borderRadius: '4px', padding: '4px 10px', cursor: 'pointer',
                        fontSize: '14px'
                    });
                    btnModif.onclick = () => {
                        // Passer la configuration complète (boutons + bfo)
                        const configActuelle = item.bfo ? { boutons: item.boutons, bfo: item.bfo } : item.boutons;
                        ouvrirModaleBoutonsSelection(item.titre, (nouvelleConfig) => {
                            let allTitres = getSavedTitresPC();
                            const existingIndex = allTitres.findIndex(c => c.titre === item.titre);

                            // Normaliser la configuration reçue
                            const boutons = Array.isArray(nouvelleConfig) ? nouvelleConfig : nouvelleConfig.boutons;
                            const bfo = Array.isArray(nouvelleConfig) ? null : nouvelleConfig.bfo;

                            if (existingIndex >= 0) {
                                if (typeof allTitres[existingIndex] === 'string') {
                                    allTitres[existingIndex] = { titre: item.titre, boutons: boutons };
                                } else {
                                    allTitres[existingIndex].boutons = boutons;
                                }
                                // Ajouter ou supprimer BFO
                                if (bfo) {
                                    allTitres[existingIndex].bfo = bfo;
                                } else {
                                    delete allTitres[existingIndex].bfo;
                                }
                            } else {
                                const newConfig = { titre: item.titre, boutons: boutons };
                                if (bfo) newConfig.bfo = bfo;
                                allTitres.push(newConfig);
                            }

                            saveTitresPC(allTitres);
                            renderList();
                        }, configActuelle);
                    };
                    btnGroup.appendChild(btnModif);

                    // Bouton Supprimer
                    const btnDelete = document.createElement('button');
                    btnDelete.textContent = '❌';
                    btnDelete.title = item.isDefault ? 'Réinitialiser ce titre' : 'Supprimer ce titre';
                    Object.assign(btnDelete.style, {
                        background: '#dc3545', color: '#fff', border: 'none',
                        borderRadius: '4px', padding: '4px 10px', cursor: 'pointer',
                        fontSize: '14px'
                    });
                    btnDelete.onclick = () => {
                        const message = item.isDefault
                            ? `Réinitialiser "${item.titre}" (afficher tous les boutons) ?`
                            : `Supprimer le titre "${item.titre}" ?`;

                        if (confirm(message)) {
                            let allTitres = getSavedTitresPC();
                            allTitres = allTitres.filter(t => (t.titre || t) !== item.titre);
                            saveTitresPC(allTitres);
                            renderList();
                        }
                    };
                    btnGroup.appendChild(btnDelete);

                    row.appendChild(btnGroup);
                    ul.appendChild(row);
                });
            }

            listScrollContainer.appendChild(ul);
        };

        renderList();
        setupAddButton();
        modal.appendChild(addSection);
        modal.appendChild(listContainer);

        // Bouton fermer
        const btnClose = document.createElement('button');
        btnClose.textContent = 'Fermer';
        Object.assign(btnClose.style, {
            background: '#6c757d', color: '#fff', border: 'none',
            borderRadius: '6px', padding: '10px 20px', cursor: 'pointer',
            fontSize: '14px', marginTop: '20px', width: '100%'
        });
        btnClose.onclick = () => overlay.remove();
        modal.appendChild(btnClose);

        overlay.appendChild(modal);
        overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
        document.body.appendChild(overlay);
    }

    // --- Modale de configuration des référentiels par symbole ---
    function ouvrirModaleReferentiels(referentielsActuels, bfoActuel, callback) {
        const old = document.getElementById('referentiels_config_overlay');
        if (old) old.remove();

        const symboleActuel = getSymbole();

        const overlay = document.createElement('div');
        overlay.id = 'referentiels_config_overlay';
        Object.assign(overlay.style, {
            position: 'fixed', top: '0', left: '0', width: '100%', height: '100%',
            background: 'rgba(0,0,0,0.6)', zIndex: '100001', display: 'flex',
            justifyContent: 'center', alignItems: 'center'
        });

        const modal = document.createElement('div');
        Object.assign(modal.style, {
            background: '#fff', borderRadius: '12px', padding: '25px',
            minWidth: '500px', maxWidth: '650px', maxHeight: '90vh', overflowY: 'auto',
            boxShadow: '0 8px 32px rgba(0,0,0,0.25)', fontFamily: 'Arial, sans-serif'
        });

        const title = document.createElement('h3');
        Object.assign(title.style, { marginTop: '0', marginBottom: '15px', color: '#333' });
        title.textContent = '⚙️ Configuration BFO';
        modal.appendChild(title);

        // Afficher le symbole détecté
        if (symboleActuel) {
            const symboleInfo = document.createElement('div');
            Object.assign(symboleInfo.style, {
                color: '#fff',
                background: '#17a2b8',
                fontSize: '12px',
                marginBottom: '15px',
                padding: '8px 12px',
                borderRadius: '6px',
                fontWeight: 'bold'
            });
            symboleInfo.textContent = `🔍 Symbole détecté : ${symboleActuel}`;
            modal.appendChild(symboleInfo);
        }

        const description = document.createElement('p');
        Object.assign(description.style, { color: '#666', fontSize: '13px', marginBottom: '20px' });
        description.textContent = 'Configurez un référentiel différent pour chaque symbole';
        modal.appendChild(description);

        // Variables pour la gestion des référentiels par symbole
        let referentielsParSymbole = referentielsActuels ? {...referentielsActuels} : {};
        let observationsParSymbole = (bfoActuel && bfoActuel.observations_par_symbole) ? {...bfoActuel.observations_par_symbole} : {};

        // Container pour la liste des symboles
        const symbolesList = document.createElement('div');
        symbolesList.id = 'referentiels_symboles_list';
        Object.assign(symbolesList.style, {
            marginBottom: '15px',
            maxHeight: '300px',
            overflowY: 'auto'
        });

        // Fonction pour afficher la liste des symboles
        const rafraichirListeSymboles = () => {
            symbolesList.innerHTML = '';

            const entries = Object.entries(referentielsParSymbole);
            if (entries.length === 0) {
                const emptyMsg = document.createElement('div');
                Object.assign(emptyMsg.style, {
                    textAlign: 'center',
                    color: '#999',
                    padding: '20px',
                    fontSize: '13px'
                });
                emptyMsg.textContent = 'Aucun référentiel configuré';
                symbolesList.appendChild(emptyMsg);
                return;
            }

            for (const [symbole, ref] of entries) {
                const row = document.createElement('div');
                Object.assign(row.style, {
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    padding: '10px 12px',
                    background: '#f8f9fa',
                    borderRadius: '6px',
                    marginBottom: '8px',
                    fontSize: '13px'
                });

                // Première ligne : symbole, référentiel, bouton supprimer
                const topRow = document.createElement('div');
                Object.assign(topRow.style, {
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                });

                const symboleText = document.createElement('span');
                symboleText.textContent = `${symbole}:`;
                Object.assign(symboleText.style, {
                    fontWeight: 'bold',
                    minWidth: '130px',
                    color: '#495057'
                });

                const refText = document.createElement('span');
                refText.textContent = ref;
                Object.assign(refText.style, {
                    flex: '1',
                    color: '#212529'
                });

                const btnSuppr = document.createElement('button');
                btnSuppr.textContent = '✕';
                Object.assign(btnSuppr.style, {
                    background: '#dc3545',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '4px 8px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    lineHeight: '1'
                });
                btnSuppr.onclick = () => {
                    delete referentielsParSymbole[symbole];
                    delete observationsParSymbole[symbole];
                    rafraichirListeSymboles();
                };

                topRow.appendChild(symboleText);
                topRow.appendChild(refText);
                topRow.appendChild(btnSuppr);
                row.appendChild(topRow);

                // Deuxième ligne : observation si elle existe
                if (observationsParSymbole[symbole]) {
                    const obsRow = document.createElement('div');
                    Object.assign(obsRow.style, {
                        fontSize: '12px',
                        color: '#6c757d',
                        fontStyle: 'italic',
                        paddingLeft: '10px',
                        borderLeft: '3px solid #17a2b8'
                    });
                    obsRow.textContent = `📝 ${observationsParSymbole[symbole]}`;
                    row.appendChild(obsRow);
                }

                symbolesList.appendChild(row);
            }
        };

        rafraichirListeSymboles();
        modal.appendChild(symbolesList);

        // Séparateur
        const sep = document.createElement('hr');
        Object.assign(sep.style, {
            margin: '20px 0',
            border: 'none',
            borderTop: '1px solid #dee2e6'
        });
        modal.appendChild(sep);

        // Formulaire d'ajout - Header avec titre et bouton
        const ajoutHeader = document.createElement('div');
        Object.assign(ajoutHeader.style, {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '10px'
        });

        const ajoutTitle = document.createElement('div');
        ajoutTitle.textContent = 'Ajouter un référentiel :';
        Object.assign(ajoutTitle.style, {
            fontSize: '13px',
            fontWeight: 'bold',
            color: '#495057'
        });
        ajoutHeader.appendChild(ajoutTitle);

        // Bouton ajouter (sera rempli après la définition du formulaire)
        const btnAjout = document.createElement('button');
        btnAjout.textContent = '✅ Ajouter';
        Object.assign(btnAjout.style, {
            background: '#28a745',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            padding: '6px 12px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 'bold'
        });
        ajoutHeader.appendChild(btnAjout);

        modal.appendChild(ajoutHeader);

        const ajoutForm = document.createElement('div');
        Object.assign(ajoutForm.style, {
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            marginBottom: '20px'
        });

        // Première ligne : symbole et référentiel
        const inputsRow = document.createElement('div');
        Object.assign(inputsRow.style, {
            display: 'flex',
            gap: '8px'
        });

        const symboleInput = document.createElement('input');
        symboleInput.type = 'text';
        symboleInput.placeholder = 'Symbole (ex: L42290SCPRSDAAT)';
        if (symboleActuel) {
            symboleInput.value = symboleActuel;
        }
        Object.assign(symboleInput.style, {
            flex: '1',
            padding: '8px 10px',
            borderRadius: '6px',
            border: '1px solid #ced4da',
            fontSize: '13px'
        });

        const refSymboleInput = document.createElement('input');
        refSymboleInput.type = 'text';
        refSymboleInput.placeholder = 'Référentiel';
        Object.assign(refSymboleInput.style, {
            flex: '1',
            padding: '8px 10px',
            borderRadius: '6px',
            border: '1px solid #ced4da',
            fontSize: '13px'
        });

        inputsRow.appendChild(symboleInput);
        inputsRow.appendChild(refSymboleInput);
        ajoutForm.appendChild(inputsRow);

        // Deuxième ligne : observation
        const observationInput = document.createElement('textarea');
        observationInput.placeholder = 'Observation (optionnel)';
        Object.assign(observationInput.style, {
            width: '100%',
            padding: '8px 10px',
            borderRadius: '6px',
            border: '1px solid #ced4da',
            fontSize: '13px',
            minHeight: '50px',
            resize: 'vertical',
            fontFamily: 'Arial, sans-serif',
            boxSizing: 'border-box'
        });

        ajoutForm.appendChild(observationInput);
        modal.appendChild(ajoutForm);

        // Définir l'action du bouton ajouter (déjà ajouté dans le header)
        btnAjout.onclick = () => {
            const symbole = symboleInput.value.trim();
            const ref = refSymboleInput.value.trim();
            const obs = observationInput.value.trim();
            if (symbole && ref) {
                referentielsParSymbole[symbole] = ref;
                if (obs) {
                    observationsParSymbole[symbole] = obs;
                }
                rafraichirListeSymboles();
                symboleInput.value = symboleActuel || '';
                refSymboleInput.value = '';
                observationInput.value = '';
                refSymboleInput.focus();
            } else {
                alert('⚠️ Veuillez remplir le symbole et le référentiel');
            }
        };

        ajoutForm.appendChild(btnAjout);
        modal.appendChild(ajoutForm);

        // ===== SECTION CHAMPS BFO =====
        const sepBFO = document.createElement('hr');
        Object.assign(sepBFO.style, {
            margin: '25px 0',
            border: 'none',
            borderTop: '2px solid #dee2e6'
        });
        modal.appendChild(sepBFO);

        const bfoTitle = document.createElement('div');
        bfoTitle.textContent = '🔧 Informations matériel BFO';
        Object.assign(bfoTitle.style, {
            fontSize: '15px',
            fontWeight: 'bold',
            marginBottom: '15px',
            color: '#0056b3'
        });
        modal.appendChild(bfoTitle);

        const bfoFieldsContainer = document.createElement('div');
        Object.assign(bfoFieldsContainer.style, {
            padding: '15px',
            background: '#f8f9fa',
            borderRadius: '6px',
            border: '1px solid #b3d9ff'
        });

        const bfoInputs = {};
        const bfoFields = [
            { id: 'oscilloscope', label: 'Numéro Oscilloscope', hasDate: true },
            { id: 'multimetre', label: 'Numéro Multimètre', hasDate: true },
            { id: 'gbf', label: 'Numéro GBF', hasDate: true }
        ];

        bfoFields.forEach(field => {
            const fieldGroup = document.createElement('div');
            Object.assign(fieldGroup.style, { marginBottom: '12px' });

            const label = document.createElement('label');
            label.textContent = field.label + ' :';
            Object.assign(label.style, { display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: '500' });
            fieldGroup.appendChild(label);

            const input = document.createElement('input');
            input.type = 'text';
            input.id = 'bfo_' + field.id;
            input.placeholder = 'Ex: ' + field.label;
            if (bfoActuel && bfoActuel[field.id]) {
                input.value = bfoActuel[field.id];
            }
            Object.assign(input.style, {
                width: '100%', padding: '8px 10px', borderRadius: '4px',
                border: '1px solid #ced4da', fontSize: '13px', boxSizing: 'border-box'
            });
            fieldGroup.appendChild(input);
            bfoInputs[field.id] = input;

            if (field.hasDate) {
                const dateLabel = document.createElement('label');
                dateLabel.textContent = 'Date de vérification :';
                Object.assign(dateLabel.style, { display: 'block', marginBottom: '5px', marginTop: '8px', fontSize: '13px', fontWeight: '500' });
                fieldGroup.appendChild(dateLabel);

                const dateInput = document.createElement('input');
                dateInput.type = 'date';
                dateInput.id = 'bfo_' + field.id + '_date';
                if (bfoActuel && bfoActuel[field.id + '_date']) {
                    dateInput.value = bfoActuel[field.id + '_date'];
                }
                Object.assign(dateInput.style, {
                    width: '100%', padding: '8px 10px', borderRadius: '4px',
                    border: '1px solid #ced4da', fontSize: '13px', boxSizing: 'border-box'
                });
                fieldGroup.appendChild(dateInput);
                bfoInputs[field.id + '_date'] = dateInput;
            }

            bfoFieldsContainer.appendChild(fieldGroup);
        });

        modal.appendChild(bfoFieldsContainer);

        // Boutons d'action
        const btnRow = document.createElement('div');
        Object.assign(btnRow.style, {
            display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px'
        });

        const btnAnnuler = document.createElement('button');
        btnAnnuler.textContent = 'Annuler';
        Object.assign(btnAnnuler.style, {
            background: '#6c757d', color: '#fff', border: 'none',
            borderRadius: '6px', padding: '8px 16px', cursor: 'pointer', fontSize: '14px'
        });
        btnAnnuler.onclick = () => overlay.remove();
        btnRow.appendChild(btnAnnuler);

        const btnValider = document.createElement('button');
        btnValider.textContent = '✅ Valider';
        Object.assign(btnValider.style, {
            background: '#28a745', color: '#fff', border: 'none',
            borderRadius: '6px', padding: '8px 16px', cursor: 'pointer',
            fontSize: '14px', fontWeight: 'bold'
        });
        btnValider.onclick = () => {
            const bfoData = {
                oscilloscope: bfoInputs.oscilloscope.value.trim(),
                oscilloscope_date: bfoInputs.oscilloscope_date.value.trim(),
                multimetre: bfoInputs.multimetre.value.trim(),
                multimetre_date: bfoInputs.multimetre_date.value.trim(),
                gbf: bfoInputs.gbf.value.trim(),
                gbf_date: bfoInputs.gbf_date.value.trim()
            };
            overlay.remove();
            callback({ referentiels: referentielsParSymbole, observations: observationsParSymbole, bfoData: bfoData });
        };
        btnRow.appendChild(btnValider);

        modal.appendChild(btnRow);
        overlay.appendChild(modal);
        overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
        document.body.appendChild(overlay);

        // Focus sur le champ référentiel
        setTimeout(() => refSymboleInput.focus(), 100);
    }

    // --- Modale de sélection des boutons pour un nouveau titre ---
    function ouvrirModaleBoutonsSelection(titre, callback, configActuelle = null) {
        // Support ancien format (array) et nouveau format (object)
        const boutonsActuels = configActuelle ? (Array.isArray(configActuelle) ? configActuelle : configActuelle.boutons) : null;
        const bfoActuel = configActuelle && !Array.isArray(configActuelle) ? configActuelle.bfo : null;
        const old = document.getElementById('boutons_selection_overlay');
        if (old) old.remove();

        const overlay = document.createElement('div');
        overlay.id = 'boutons_selection_overlay';
        Object.assign(overlay.style, {
            position: 'fixed', top: '0', left: '0', width: '100%', height: '100%',
            background: 'rgba(0,0,0,0.6)', zIndex: '100000', display: 'flex',
            justifyContent: 'center', alignItems: 'center'
        });

        const modal = document.createElement('div');
        Object.assign(modal.style, {
            background: '#fff', borderRadius: '12px', padding: '25px',
            minWidth: '400px', maxWidth: '500px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.25)', fontFamily: 'Arial, sans-serif'
        });

        const title = document.createElement('h3');
        Object.assign(title.style, { marginTop: '0', marginBottom: '15px', color: '#333' });
        title.innerHTML = `🔘 Boutons pour "${titre}"`;
        modal.appendChild(title);

        const info = document.createElement('p');
        Object.assign(info.style, { color: '#666', fontSize: '13px', marginBottom: '20px' });
        info.textContent = 'Sélectionnez les boutons à afficher pour ce plan de contrôle :';
        modal.appendChild(info);

        // Liste des boutons disponibles
        const boutonsDisponibles = [
            { id: 'oui', label: 'Oui' },
            { id: 'non', label: 'Non' },
            { id: 'conforme', label: 'Conforme' },
            { id: 'valeur', label: 'Valeur' },
            { id: 'signer', label: 'Signer' },
            { id: 'valider', label: 'Valider' }
        ];

        const checkboxes = [];
        boutonsDisponibles.forEach(btn => {
            const row = document.createElement('div');
            Object.assign(row.style, {
                marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px',
                padding: '8px', background: '#f8f9fa', borderRadius: '6px'
            });

            const cb = document.createElement('input');
            cb.type = 'checkbox';
            cb.value = btn.id;
            cb.id = 'btn_select_' + btn.id;
            // Cocher en fonction de la config actuelle, ou tous par défaut
            cb.checked = boutonsActuels ? boutonsActuels.includes(btn.id) : true;
            Object.assign(cb.style, { width: '20px', height: '20px', cursor: 'pointer' });
            checkboxes.push(cb);

            const lbl = document.createElement('label');
            lbl.htmlFor = cb.id;
            lbl.textContent = btn.label;
            Object.assign(lbl.style, { cursor: 'pointer', fontSize: '14px', fontWeight: '500' });

            row.appendChild(cb);
            row.appendChild(lbl);
            modal.appendChild(row);
        });

        // Séparateur
        const separator = document.createElement('hr');
        Object.assign(separator.style, { margin: '20px 0', border: 'none', borderTop: '1px solid #dee2e6' });
        modal.appendChild(separator);

        // ===== SECTION BFO =====
        let referentielsParSymbole = (bfoActuel && bfoActuel.referentiels_par_symbole) ? {...bfoActuel.referentiels_par_symbole} : {};
        let observationsParSymbole = (bfoActuel && bfoActuel.observations_par_symbole) ? {...bfoActuel.observations_par_symbole} : {};
        let bfoData = bfoActuel ? {
            oscilloscope: bfoActuel.oscilloscope || '',
            oscilloscope_date: bfoActuel.oscilloscope_date || '',
            multimetre: bfoActuel.multimetre || '',
            multimetre_date: bfoActuel.multimetre_date || '',
            gbf: bfoActuel.gbf || '',
            gbf_date: bfoActuel.gbf_date || ''
        } : {};

        const bfoSection = document.createElement('div');
        Object.assign(bfoSection.style, { marginBottom: '15px' });

        const bfoRow = document.createElement('div');
        Object.assign(bfoRow.style, {
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '10px', background: '#e7f3ff', borderRadius: '6px'
        });

        // Partie gauche : checkbox + label
        const bfoLeft = document.createElement('div');
        Object.assign(bfoLeft.style, { display: 'flex', alignItems: 'center', gap: '10px' });

        const cbBFO = document.createElement('input');
        cbBFO.type = 'checkbox';
        cbBFO.id = 'cb_bfo';
        cbBFO.checked = bfoActuel && bfoActuel.enabled ? true : false;
        Object.assign(cbBFO.style, { width: '20px', height: '20px', cursor: 'pointer' });

        const lblBFO = document.createElement('label');
        lblBFO.htmlFor = 'cb_bfo';
        lblBFO.textContent = 'Activer le mode BFO';
        Object.assign(lblBFO.style, { cursor: 'pointer', fontSize: '14px', fontWeight: 'bold', color: '#0056b3' });

        bfoLeft.appendChild(cbBFO);
        bfoLeft.appendChild(lblBFO);

        // Bouton Modifier à droite (juste icône)
        const btnModifierRef = document.createElement('button');
        btnModifierRef.textContent = '✏️';
        btnModifierRef.title = 'Configurer BFO et référentiels';
        Object.assign(btnModifierRef.style, {
            background: '#17a2b8', color: '#fff', border: 'none',
            borderRadius: '6px', padding: '2px 6px', cursor: 'pointer',
            fontSize: '12px'
        });
        btnModifierRef.onclick = () => {
            ouvrirModaleReferentiels(referentielsParSymbole, bfoData, (result) => {
                referentielsParSymbole = result.referentiels;
                observationsParSymbole = result.observations;
                bfoData = result.bfoData;
            });
        };

        bfoRow.appendChild(bfoLeft);
        bfoRow.appendChild(btnModifierRef);
        bfoSection.appendChild(bfoRow);
        modal.appendChild(bfoSection);

        // Boutons d'action
        const btnRow = document.createElement('div');
        Object.assign(btnRow.style, {
            display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px'
        });

        const btnAnnuler = document.createElement('button');
        btnAnnuler.textContent = 'Annuler';
        Object.assign(btnAnnuler.style, {
            background: '#6c757d', color: '#fff', border: 'none',
            borderRadius: '6px', padding: '8px 16px', cursor: 'pointer', fontSize: '14px'
        });
        btnAnnuler.onclick = () => overlay.remove();
        btnRow.appendChild(btnAnnuler);

        const btnValider = document.createElement('button');
        btnValider.textContent = '✅ Valider';
        Object.assign(btnValider.style, {
            background: '#28a745', color: '#fff', border: 'none',
            borderRadius: '6px', padding: '8px 16px', cursor: 'pointer',
            fontSize: '14px', fontWeight: 'bold'
        });
        btnValider.onclick = () => {
            const selected = checkboxes.filter(cb => cb.checked).map(cb => cb.value);
            if (selected.length === 0) {
                alert('⚠️ Veuillez sélectionner au moins un bouton');
                return;
            }

            const result = { boutons: selected };

            // Si BFO est activé, ajouter les données
            if (cbBFO.checked) {
                result.bfo = {
                    enabled: true,
                    referentiels_par_symbole: referentielsParSymbole,
                    observations_par_symbole: observationsParSymbole,
                    oscilloscope: bfoData.oscilloscope,
                    oscilloscope_date: bfoData.oscilloscope_date,
                    multimetre: bfoData.multimetre,
                    multimetre_date: bfoData.multimetre_date,
                    gbf: bfoData.gbf,
                    gbf_date: bfoData.gbf_date
                };
            }

            overlay.remove();
            callback(result);
        };
        btnRow.appendChild(btnValider);

        modal.appendChild(btnRow);
        overlay.appendChild(modal);
        overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
        document.body.appendChild(overlay);
    }

    // --- Modale d'ajout rapide d'un titre ---
    function ouvrirModaleAjoutTitre() {
        const old = document.getElementById('ajout_titre_overlay');
        if (old) old.remove();

        const overlay = document.createElement('div');
        overlay.id = 'ajout_titre_overlay';
        Object.assign(overlay.style, {
            position: 'fixed', top: '0', left: '0', width: '100%', height: '100%',
            background: 'rgba(0,0,0,0.6)', zIndex: '99999', display: 'flex',
            justifyContent: 'center', alignItems: 'center'
        });

        const modal = document.createElement('div');
        Object.assign(modal.style, {
            background: '#fff', borderRadius: '12px', padding: '25px',
            minWidth: '450px', maxWidth: '500px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.25)', fontFamily: 'Arial, sans-serif'
        });

        const title = document.createElement('h3');
        Object.assign(title.style, { marginTop: '0', marginBottom: '15px', color: '#333' });
        title.textContent = '🎯 Ajouter un titre Plan de Contrôle';
        modal.appendChild(title);

        // Champ de saisie
        const labelTitre = document.createElement('label');
        labelTitre.textContent = 'Nom du titre :';
        Object.assign(labelTitre.style, { fontWeight: 'bold', display: 'block', marginBottom: '8px' });
        modal.appendChild(labelTitre);

        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = 'Ex: PLATINE TEST 2024';
        Object.assign(input.style, {
            width: '100%', padding: '10px 12px', borderRadius: '6px',
            border: '1px solid #ced4da', fontSize: '14px', marginBottom: '20px',
            boxSizing: 'border-box'
        });
        modal.appendChild(input);

        // Boutons d'action
        const btnRow = document.createElement('div');
        Object.assign(btnRow.style, {
            display: 'flex', gap: '10px', justifyContent: 'space-between', marginTop: '20px'
        });

        // Bouton Gérer (à gauche)
        const btnGerer = document.createElement('button');
        btnGerer.textContent = '📋 Gérer les titres';
        Object.assign(btnGerer.style, {
            background: '#17a2b8', color: '#fff', border: 'none',
            borderRadius: '6px', padding: '10px 16px', cursor: 'pointer',
            fontSize: '14px', fontWeight: 'bold'
        });
        btnGerer.onclick = () => {
            overlay.remove();
            ouvrirModaleGestionTitres();
        };
        btnRow.appendChild(btnGerer);

        const rightButtons = document.createElement('div');
        Object.assign(rightButtons.style, { display: 'flex', gap: '10px' });

        // Bouton Annuler
        const btnAnnuler = document.createElement('button');
        btnAnnuler.textContent = 'Annuler';
        Object.assign(btnAnnuler.style, {
            background: '#6c757d', color: '#fff', border: 'none',
            borderRadius: '6px', padding: '10px 16px', cursor: 'pointer', fontSize: '14px'
        });
        btnAnnuler.onclick = () => overlay.remove();
        rightButtons.appendChild(btnAnnuler);

        // Bouton Ajouter
        const btnAdd = document.createElement('button');
        btnAdd.textContent = '✅ Ajouter';
        Object.assign(btnAdd.style, {
            background: '#28a745', color: '#fff', border: 'none',
            borderRadius: '6px', padding: '10px 16px', cursor: 'pointer',
            fontSize: '14px', fontWeight: 'bold'
        });
        btnAdd.onclick = () => {
            const newTitre = input.value.trim();
            if (!newTitre) {
                alert('⚠️ Veuillez entrer un titre');
                return;
            }

            const titres = getSavedTitresPC();
            if (titres.some(config => (config.titre || config) === newTitre)) {
                alert('⚠️ Ce titre existe déjà');
                return;
            }

            // Ouvrir la modale de sélection des boutons
            ouvrirModaleBoutonsSelection(newTitre, (nouvelleConfig) => {
                // Normaliser la configuration
                const boutons = Array.isArray(nouvelleConfig) ? nouvelleConfig : nouvelleConfig.boutons;
                const bfo = Array.isArray(nouvelleConfig) ? null : nouvelleConfig.bfo;

                const newConfig = { titre: newTitre, boutons: boutons };
                if (bfo) newConfig.bfo = bfo;

                titres.push(newConfig);
                saveTitresPC(titres);
                overlay.remove();
                alert(`✅ Titre "${newTitre}" ajouté avec succès !`);
            });
        };
        rightButtons.appendChild(btnAdd);

        btnRow.appendChild(rightButtons);
        modal.appendChild(btnRow);

        overlay.appendChild(modal);
        overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
        document.body.appendChild(overlay);

        // Focus sur l'input
        setTimeout(() => input.focus(), 100);
    }

    // Ajouter le menu GM si disponible
    try {
        if (typeof GM_registerMenuCommand !== 'undefined') {
            GM_registerMenuCommand('🎯 Ajouter un titre Plan de Contrôle', ouvrirModaleAjoutTitre);
        } else if (typeof unsafeWindow !== 'undefined' && unsafeWindow.GM_registerMenuCommand) {
            unsafeWindow.GM_registerMenuCommand('🎯 Ajouter un titre Plan de Contrôle', ouvrirModaleAjoutTitre);
        }
    } catch (e) {
        console.log('GM_registerMenuCommand non disponible:', e);
    }

    function afficherBoutons(contenant) {
        const parent = contenant.parentNode;

        const ancienContainer = parent.querySelector('#custom_button_container');
        if (ancienContainer) ancienContainer.remove();

        parent.style.display = 'flex';
        parent.style.justifyContent = 'space-between';
        parent.style.alignItems = 'center';
        parent.style.paddingRight = '5px';

        const buttonContainer = document.createElement('div');
        buttonContainer.id = 'custom_button_container';
        Object.assign(buttonContainer.style, {
            display: 'flex', width: '100%', alignItems: 'center', position: 'relative'
        });

        const centerGroup = document.createElement('div');
        centerGroup.id = 'custom_center_group';
        Object.assign(centerGroup.style, { display: 'inline-flex', gap: '5px', margin: '0 auto' });

        const rightGroup = document.createElement('div');
        rightGroup.id = 'custom_right_group';
        Object.assign(rightGroup.style, {
            display: 'inline-flex', gap: '5px', position: 'absolute', right: '0', alignItems: 'center'
        });

        // Récupérer les boutons configurés pour ce titre
        const boutonsConfig = getBoutonsForTitre();
        const afficherBouton = (id) => {
            // Si pas de config spécifique, afficher tous les boutons
            if (!boutonsConfig) return true;
            return boutonsConfig.includes(id);
        };

        // === Bouton BFO (à gauche si activé) ===
        const bfoData = getBFOForTitre();
        if (bfoData && bfoData.enabled) {
            const btnBFO = document.createElement('button');
            btnBFO.id = 'custom_bfo_button';
            btnBFO.innerText = '🔧 BFO';
            btnBFO.className = 'btn btn-primary';
            Object.assign(btnBFO.style, {
                padding: '2px 10px', borderRadius: '5px', cursor: 'pointer',
                transition: 'opacity 0.2s', opacity: '0.9'
            });
            btnBFO.onmouseenter = () => { btnBFO.style.opacity = '1'; };
            btnBFO.onmouseleave = () => { btnBFO.style.opacity = '0.9'; };
            btnBFO.title = 'Remplir les appareils avec les données BFO';
            btnBFO.onclick = () => remplirAppareilsBFO();
            centerGroup.appendChild(btnBFO);
        }

        // === Boutons principaux (centre) ===

        if (afficherBouton('oui')) {
            const btnOui = document.createElement('button');
            btnOui.innerText = 'Oui';
            btnOui.className = 'btn btn-info';
            Object.assign(btnOui.style, { padding: '2px 10px', borderRadius: '5px', cursor: 'pointer' });
            btnOui.onclick = () => {
                document.querySelectorAll('button[collector-value="1"]').forEach(btn => {
                    if (!btn.title.toLowerCase().includes('conforme')) btn.click();
                });
            };
            centerGroup.appendChild(btnOui);
        }

        if (afficherBouton('non')) {
            const btnNon = document.createElement('button');
            btnNon.innerText = 'Non';
            btnNon.className = 'btn btn-danger';
            Object.assign(btnNon.style, { padding: '2px 10px', borderRadius: '5px', cursor: 'pointer' });
            btnNon.onclick = () => {
                document.querySelectorAll('button[collector-value="0"]').forEach(btn => {
                    if (!btn.title.toLowerCase().includes('conforme')) btn.click();
                });
            };
            centerGroup.appendChild(btnNon);
        }

        if (afficherBouton('conforme')) {
            const btnConforme = document.createElement('button');
            btnConforme.innerText = 'Conforme';
            btnConforme.className = 'btn btn-primary';
            Object.assign(btnConforme.style, { padding: '2px 10px', borderRadius: '5px', cursor: 'pointer' });
            btnConforme.onclick = () => {
                document.querySelectorAll('button[title="Conforme"]').forEach(btn => btn.click());
            };
            centerGroup.appendChild(btnConforme);
        }

        if (afficherBouton('valeur')) {
            const btnRemplir = document.createElement('button');
            btnRemplir.innerText = 'Valeur';
            btnRemplir.className = 'btn btn-secondary';
            Object.assign(btnRemplir.style, { padding: '2px 10px', borderRadius: '5px', cursor: 'pointer' });
            btnRemplir.onclick = () => {
                document.querySelectorAll('input[type="tel"][data-min][data-max]').forEach(input => {
                    const min = parseFloat(input.getAttribute('data-min'));
                    const max = parseFloat(input.getAttribute('data-max'));
                    if (!isNaN(min) && !isNaN(max)) {
                        const valeur = Math.round((min + Math.random() * (max - min)) * 100) / 100;
                        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
                            window.HTMLInputElement.prototype, 'value'
                        ).set;
                        nativeInputValueSetter.call(input, valeur);
                        input.dispatchEvent(new Event('input', { bubbles: true }));
                        input.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                });
            };
            centerGroup.appendChild(btnRemplir);
        }

        if (afficherBouton('signer')) {
            const btnSigner = document.createElement('button');
            btnSigner.id = 'custom_sign_button';
            btnSigner.innerText = 'Signer';
            btnSigner.className = 'btn btn-warning';
            Object.assign(btnSigner.style, { padding: '2px 10px', borderRadius: '5px', cursor: 'pointer' });
            btnSigner.onclick = () => {
                document.querySelectorAll(`button[cp="${cpPersoValue}"]`).forEach(btn => btn.click());
            };
            centerGroup.appendChild(btnSigner);
        }

        if (afficherBouton('valider')) {
            const btnValider = document.createElement('button');
            btnValider.id = 'custom_validate_button';
            btnValider.innerText = 'Valider';
            btnValider.className = 'btn btn-success';
            Object.assign(btnValider.style, { padding: '2px 10px', borderRadius: '5px', cursor: 'pointer' });
            btnValider.onclick = () => {
                const validerBtn = document.getElementById('fonctionnel_validateAndNext_form') ||
                                   document.getElementById('fonctionnel_validate_form');
                if (validerBtn) validerBtn.click();
                else alert("Bouton 'Valider' introuvable.");
            };
            centerGroup.appendChild(btnValider);
        }

        // === Groupe droit : bouton Ajouter ===

        const btnPlus = document.createElement('button');
        btnPlus.id = 'custom_plus_button';
        btnPlus.innerText = 'Ajouter';
        btnPlus.className = 'btn btn-success';
        Object.assign(btnPlus.style, {
            padding: '2px 10px', borderRadius: '5px', cursor: 'pointer',
            transition: 'opacity 0.2s', opacity: '0.9'
        });
        btnPlus.onmouseenter = () => { btnPlus.style.opacity = '1'; };
        btnPlus.onmouseleave = () => { btnPlus.style.opacity = '0.9'; };
        btnPlus.title = 'Ajouter un bouton combo';
        btnPlus.onclick = () => ouvrirModaleAjout(rightGroup);
        rightGroup.appendChild(btnPlus);

        // Charger les combos sauvegardés
        rafraichirCombos(rightGroup);

        buttonContainer.appendChild(centerGroup);
        buttonContainer.appendChild(rightGroup);
        parent.appendChild(buttonContainer);
    }

    function verifierEtAjouter() {
        if (!verifierTitrePC()) return;

        const titres = document.querySelectorAll('h3.panel-title');
        for (const titre of titres) {
            if (titre.textContent.trim() === "Saisie du plan de contrôle") {
                const parent = titre.parentNode;
                const boutonPresent = parent.querySelector('#custom_sign_button');

                if (!boutonPresent) {
                    afficherBoutons(titre);
                }
                break;
            }
        }
    }

    setInterval(verifierEtAjouter, 100);
})();
