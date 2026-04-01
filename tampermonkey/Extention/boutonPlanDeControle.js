(function () {
    'use strict';

    const cpPersoValue = (document.getElementById("idUser") || {}).value || "";

    // --- Récupérer le symbole (nombre à 8 chiffres) depuis la div panel-title ---
    function getSymbole() {
        const div = document.querySelector('.col-xs-7.text-center.panel-title');
        if (div) {
            const match = div.textContent.match(/\b(\d{8})\b/);
            if (match) return match[1];
        }
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

        // Liste des titres existants
        const listContainer = document.createElement('div');
        Object.assign(listContainer.style, {
            marginBottom: '20px', padding: '15px', background: '#f8f9fa',
            borderRadius: '8px', maxHeight: '300px', overflow: 'auto'
        });

        const listTitle = document.createElement('h4');
        Object.assign(listTitle.style, { marginTop: '0', marginBottom: '12px', fontSize: '15px' });
        listTitle.textContent = 'Titres configurés :';
        listContainer.appendChild(listTitle);

        const renderList = () => {
            const existingList = listContainer.querySelector('#titres_list');
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
                        ouvrirModaleBoutonsSelection(item.titre, (nouveauxBoutons) => {
                            let allTitres = getSavedTitresPC();
                            const existingIndex = allTitres.findIndex(c => c.titre === item.titre);

                            if (existingIndex >= 0) {
                                if (typeof allTitres[existingIndex] === 'string') {
                                    allTitres[existingIndex] = { titre: item.titre, boutons: nouveauxBoutons };
                                } else {
                                    allTitres[existingIndex].boutons = nouveauxBoutons;
                                }
                            } else {
                                allTitres.push({ titre: item.titre, boutons: nouveauxBoutons });
                            }

                            saveTitresPC(allTitres);
                            renderList();
                        }, item.boutons);
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

            listContainer.appendChild(ul);
        };

        renderList();
        modal.appendChild(listContainer);

        // Formulaire d'ajout
        const addSection = document.createElement('div');
        Object.assign(addSection.style, { marginTop: '20px' });

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
            ouvrirModaleBoutonsSelection(newTitre, (boutons) => {
                titres.push({ titre: newTitre, boutons: boutons });
                saveTitresPC(titres);
                input.value = '';
                renderList();
            });
        };
        inputRow.appendChild(btnAdd);

        addSection.appendChild(inputRow);
        modal.appendChild(addSection);

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

    // --- Modale de sélection des boutons pour un nouveau titre ---
    function ouvrirModaleBoutonsSelection(titre, callback, boutonsActuels = null) {
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
            overlay.remove();
            callback(selected);
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
            ouvrirModaleBoutonsSelection(newTitre, (boutons) => {
                titres.push({ titre: newTitre, boutons: boutons });
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
