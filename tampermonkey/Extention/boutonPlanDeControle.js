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
                    setTimeout(() => action.fn(), i * 500);
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

            // Afficher/masquer la croix au survol du wrapper (délai 1s)
            let hoverTimer = null;
            wrapper.onmouseenter = () => { hoverTimer = setTimeout(() => { btnClose.style.display = 'block'; }, 1000); };
            wrapper.onmouseleave = () => { clearTimeout(hoverTimer); btnClose.style.display = 'none'; };

            if (btnPlus) {
                rightGroup.insertBefore(wrapper, btnPlus);
            } else {
                rightGroup.appendChild(wrapper);
            }
        });
    }

    function verifierTitrePC() {
        const span = document.querySelector('.TitrePC');
        return span && (
            span.textContent.includes("Plan de contrôle") ||
            span.textContent.includes("PLAN DE CONTROLE") ||
            span.textContent.includes("PLAN DE CONTRÔLE") ||
            span.textContent.includes("Tiroir EMC 846") ||
            span.textContent.includes("PLATINE")
        );
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

        // === Boutons principaux (centre) ===

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

        const btnConforme = document.createElement('button');
        btnConforme.innerText = 'Conforme';
        btnConforme.className = 'btn btn-primary';
        Object.assign(btnConforme.style, { padding: '2px 10px', borderRadius: '5px', cursor: 'pointer' });
        btnConforme.onclick = () => {
            document.querySelectorAll('button[title="Conforme"]').forEach(btn => btn.click());
        };
        centerGroup.appendChild(btnConforme);

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

        const btnSigner = document.createElement('button');
        btnSigner.id = 'custom_sign_button';
        btnSigner.innerText = 'Signer';
        btnSigner.className = 'btn btn-warning';
        Object.assign(btnSigner.style, { padding: '2px 10px', borderRadius: '5px', cursor: 'pointer' });
        btnSigner.onclick = () => {
            document.querySelectorAll(`button[cp="${cpPersoValue}"]`).forEach(btn => btn.click());
        };
        centerGroup.appendChild(btnSigner);

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

    setInterval(verifierEtAjouter, 1000);
})();
