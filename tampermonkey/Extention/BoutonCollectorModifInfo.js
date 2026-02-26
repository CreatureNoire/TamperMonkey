// ==UserScript==
// @name         Collector - Boutons Modifiables
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Ajoute des boutons personnalisables dans le panel Actions disponibles pour automatiser les actions répétitives
// @author       JH
// @match        https://prod.cloud-collectorplus.mt.sncf.fr/Prm/Reparation/*.html
// @icon         https://www.google.com/s2/favicons?sz=64&domain=sncf.fr
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Stockage local des boutons personnalisés
    const STORAGE_KEY = 'customButtonsConfig';
    const COLORS_KEY = 'customButtonsColors';

    // Couleurs par défaut
    const DEFAULT_COLORS = {
        infoAgentLinked: { gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', radial: 'radial-gradient(circle at 50% 100%, #ff6b9d 10%, #ff6b9d00 55%), linear-gradient(#c94b6b, #f5576c)' },
        infoAgentGlobal: { gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', radial: 'radial-gradient(circle at 50% 100%, #a8edea 10%, #a8edea00 55%), linear-gradient(#79d7ed, #a8edea)' },
        infoProdLinked: { gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', radial: 'radial-gradient(circle at 50% 100%, #667eea 10%, #667eea00 55%), linear-gradient(#5568d3, #667eea)' },
        infoProdGlobal: { gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', radial: 'radial-gradient(circle at 50% 100%, #ff6b9d 10%, #ff6b9d00 55%), linear-gradient(#c94b6b, #f5576c)' }
    };

    // Charger les couleurs personnalisées
    function loadCustomColors() {
        const stored = localStorage.getItem(COLORS_KEY);
        return stored ? JSON.parse(stored) : DEFAULT_COLORS;
    }

    // Sauvegarder les couleurs personnalisées
    function saveCustomColors(colors) {
        localStorage.setItem(COLORS_KEY, JSON.stringify(colors));
    }

    // Récupérer le symbole de la pièce (8 chiffres)
    function getCurrentSymbol() {
        const panelTitle = document.querySelector('.col-xs-7.text-center.panel-title .row');
        if (panelTitle) {
            const text = panelTitle.textContent.trim();
            const match = text.match(/^\d{8}/);
            if (match) {
                return match[0];
            }
        }
        return null;
    }

    // Charger les boutons depuis le localStorage
    function loadCustomButtons(symbolFilter = null) {
        const stored = localStorage.getItem(STORAGE_KEY);
        const allButtons = stored ? JSON.parse(stored) : [];
        
        if (symbolFilter === null) {
            // Retourner tous les boutons
            return allButtons;
        }
        
        // Filtrer par symbole ou boutons globaux
        return allButtons.filter(btn => btn.symbol === symbolFilter || btn.symbol === 'global');
    }

    // Sauvegarder les boutons dans le localStorage
    function saveCustomButtons(buttons) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(buttons));
    }

    // Injecter les styles CSS
    function injectStyles() {
        if (document.getElementById('custom-buttons-styles')) return;

        const style = document.createElement('style');
        style.id = 'custom-buttons-styles';
        style.textContent = `
            /* Bouton + pour ajouter des boutons personnalisés */
            .btn-add-custom {
                cursor: pointer;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border: none;
                border-radius: 50%;
                width: 32px;
                height: 32px;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                font-size: 20px;
                font-weight: bold;
                box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
                transition: all 0.3s ease;
                margin-left: 0;
            }

            .btn-add-custom:hover {
                transform: scale(1.1);
                box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
            }

            .btn-add-custom:active {
                transform: scale(0.95);
            }

            /* Bouton d'édition */
            .btn-edit-custom {
                cursor: pointer;
                background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
                color: white;
                border: none;
                border-radius: 50%;
                width: 32px;
                height: 32px;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                font-size: 16px;
                font-weight: bold;
                box-shadow: 0 4px 15px rgba(240, 147, 251, 0.4);
                transition: all 0.3s ease;
                margin-left: 5px;
            }

            .btn-edit-custom:hover {
                transform: scale(1.1);
                box-shadow: 0 6px 20px rgba(240, 147, 251, 0.6);
            }

            .btn-edit-custom:active {
                transform: scale(0.95);
            }

            /* Bouton de couleurs */
            .btn-colors-custom {
                cursor: pointer;
                background: linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%);
                color: white;
                border: none;
                border-radius: 50%;
                width: 32px;
                height: 32px;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                font-size: 16px;
                font-weight: bold;
                box-shadow: 0 4px 15px rgba(253, 203, 110, 0.4);
                transition: all 0.3s ease;
                margin-left: 5px;
            }

            .btn-colors-custom:hover {
                transform: scale(1.1);
                box-shadow: 0 6px 20px rgba(253, 203, 110, 0.6);
            }

            .btn-colors-custom:active {
                transform: scale(0.95);
            }

            /* Style pour les boutons personnalisés */
            .btn-custom-action {
                cursor: pointer;
                position: relative;
                padding: 1px;
                border-radius: 4px;
                border: 0;
                text-shadow: 1px 1px #000a;
                background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
                box-shadow: 0px 3px 5px 0px #0008;
                transition: 0.3s all;
                font-size: 12px;
                display: inline-flex;
                align-items: center;
                gap: 5px;
                height: 28px;
            }

            .btn-custom-action:hover {
                box-shadow: 0px 5px 10px 0px #0009;
            }

            .btn-custom-action .inner {
                position: relative;
                inset: 0px;
                padding: 0.3em 0.6em;
                border-radius: 3px;
                background: radial-gradient(circle at 50% 100%, #ff6b9d 10%, #ff6b9d00 55%),
                    linear-gradient(#c94b6b, #f5576c);
                overflow: hidden;
                transition: inherit;
                height: 100%;
                display: flex;
                align-items: center;
            }

            .btn-custom-action .text {
                position: relative;
                z-index: 1;
                color: white;
                font-weight: 550;
                font-size: 11px;
                white-space: nowrap;
            }

            /* Bouton de suppression */
            .btn-delete-custom {
                position: absolute;
                top: -10px;
                right: -10px;
                width: 26px;
                height: 26px;
                border-radius: 50%;
                background: #ff4444;
                color: white;
                border: 2px solid white;
                cursor: pointer;
                display: none;
                align-items: center;
                justify-content: center;
                font-size: 16px;
                font-weight: bold;
                z-index: 10;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
            }
            
            .btn-delete-custom:hover {
                background: #cc0000;
                transform: scale(1.1);
                transition: all 0.2s ease;
            }

            .btn-custom-wrapper:hover .btn-delete-custom {
                display: flex;
            }

            .btn-custom-wrapper {
                position: relative;
                display: inline-block;
            }

            /* Modal personnalisée */
            .custom-modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.7);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                backdrop-filter: blur(5px);
            }

            .custom-modal {
                background: white;
                border-radius: 12px;
                padding: 30px;
                max-width: 500px;
                width: 90%;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                animation: modalSlideIn 0.3s ease;
            }

            @keyframes modalSlideIn {
                from {
                    transform: translateY(-50px);
                    opacity: 0;
                }
                to {
                    transform: translateY(0);
                    opacity: 1;
                }
            }

            .custom-modal h3 {
                margin: 0 0 20px 0;
                color: #333;
                font-size: 24px;
                font-weight: 600;
            }

            .custom-modal-field {
                margin-bottom: 20px;
            }

            .custom-modal-field label {
                display: block;
                margin-bottom: 8px;
                color: #555;
                font-weight: 500;
                font-size: 14px;
            }

            .custom-modal-field input[type="text"],
            .custom-modal-field select,
            .custom-modal-field textarea {
                width: 100%;
                padding: 10px 12px;
                border: 2px solid #e0e0e0;
                border-radius: 6px;
                font-size: 14px;
                transition: border-color 0.3s;
                box-sizing: border-box;
            }

            .custom-modal-field input[type="text"]:focus,
            .custom-modal-field select:focus,
            .custom-modal-field textarea:focus {
                outline: none;
                border-color: #667eea;
            }

            .custom-modal-field textarea {
                resize: vertical;
                min-height: 80px;
                font-family: inherit;
            }

            .custom-modal-field-checkbox {
                display: flex;
                align-items: center;
                gap: 10px;
                margin-bottom: 20px;
            }

            .custom-modal-field-checkbox input[type="checkbox"] {
                width: 20px;
                height: 20px;
                cursor: pointer;
            }

            .custom-modal-field-checkbox label {
                margin: 0;
                cursor: pointer;
                user-select: none;
            }

            /* Modal de sélection des couleurs */
            .color-picker-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
                margin: 20px 0;
            }

            .color-picker-item {
                border: 2px solid #e0e0e0;
                border-radius: 8px;
                padding: 15px;
                transition: all 0.3s;
            }

            .color-picker-item:hover {
                border-color: #667eea;
                transform: translateY(-2px);
            }

            .color-picker-label {
                font-weight: 600;
                color: #333;
                margin-bottom: 10px;
                font-size: 14px;
            }

            .color-preview {
                width: 100%;
                height: 40px;
                border-radius: 6px;
                margin-bottom: 10px;
                cursor: pointer;
                position: relative;
                overflow: hidden;
            }

            .color-input-wrapper {
                display: flex;
                gap: 5px;
            }

            .color-input-wrapper input[type="color"] {
                width: 50%;
                height: 35px;
                border: none;
                border-radius: 4px;
                cursor: pointer;
            }

            .custom-modal-buttons {
                display: flex;
                gap: 10px;
                justify-content: flex-end;
                margin-top: 25px;
            }

            .custom-modal-btn {
                padding: 10px 20px;
                border: none;
                border-radius: 6px;
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.3s;
            }

            .custom-modal-btn-primary {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
            }

            .custom-modal-btn-primary:hover {
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
            }

            .custom-modal-btn-secondary {
                background: #e0e0e0;
                color: #555;
            }

            .custom-modal-btn-secondary:hover {
                background: #d0d0d0;
            }

            /* Modal de sélection pour l'édition */
            .custom-modal-select-list {
                max-height: 400px;
                overflow-y: auto;
                margin: 20px 0;
            }

            .custom-modal-select-item {
                padding: 15px;
                margin-bottom: 10px;
                border: 2px solid #e0e0e0;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.3s;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .custom-modal-select-item:hover {
                border-color: #667eea;
                background: #f5f7ff;
                transform: translateX(5px);
            }

            .custom-modal-select-item-name {
                font-weight: 600;
                color: #333;
                font-size: 16px;
            }

            .custom-modal-select-item-field {
                font-size: 12px;
                color: #888;
                margin-top: 4px;
            }

            .custom-modal-select-item-desc {
                font-size: 13px;
                color: #666;
                margin-top: 8px;
                line-height: 1.4;
            }

            /* Mode édition - Animation de tremblement */
            @keyframes shake {
                0%, 100% { transform: translateX(0) rotate(0deg); }
                10%, 30%, 50%, 70%, 90% { transform: translateX(-2px) rotate(-2deg); }
                20%, 40%, 60%, 80% { transform: translateX(2px) rotate(2deg); }
            }

            .edit-mode-shake {
                animation: shake 1.2s infinite;
                filter: brightness(1.2);
            }

            /* Overlay semi-transparent en mode édition */
            .edit-mode-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(102, 126, 234, 0.1);
                z-index: 9999;
                pointer-events: none;
            }

            /* Message d'instruction en mode édition */
            .edit-mode-message {
                position: fixed;
                top: 20px;
                left: 50%;
                transform: translateX(-50%);
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 15px 30px;
                border-radius: 8px;
                box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
                z-index: 10001;
                font-weight: 600;
                font-size: 16px;
                animation: slideDown 0.3s ease;
            }

            @keyframes slideDown {
                from {
                    transform: translateX(-50%) translateY(-20px);
                    opacity: 0;
                }
                to {
                    transform: translateX(-50%) translateY(0);
                    opacity: 1;
                }
            }

            /* Cacher le bouton de couleurs par défaut */
            .btn-colors-custom {
                display: none;
            }

            /* Afficher le bouton de couleurs en mode édition */
            .edit-mode-active .btn-colors-custom {
                display: inline-flex;
            }
        `;
        document.head.appendChild(style);
    }

    // Activer le mode édition (sélection directe sur la page)
    function enableEditMode(onSelect) {
        const currentSymbol = getCurrentSymbol();
        const buttons = loadCustomButtons(currentSymbol);

        if (buttons.length === 0) {
            alert('⚠️ Aucun bouton personnalisé à modifier pour ce symbole');
            return;
        }

        console.log('🎨 Mode édition activé');

        // Ajouter la classe pour afficher le bouton de couleurs
        const container = document.getElementById('custom-buttons-container');
        if (container) {
            container.classList.add('edit-mode-active');
        }

        // Créer l'overlay semi-transparent
        const overlay = document.createElement('div');
        overlay.className = 'edit-mode-overlay';
        document.body.appendChild(overlay);

        // Créer le message d'instruction
        const message = document.createElement('div');
        message.className = 'edit-mode-message';
        message.innerHTML = '✏️ Cliquez sur le bouton que vous souhaitez modifier (ESC pour annuler)';
        document.body.appendChild(message);

        // Récupérer tous les boutons personnalisés du DOM
        const buttonElements = document.querySelectorAll('.btn-custom-wrapper');
        
        // Ajouter l'animation de tremblement à tous les boutons
        buttonElements.forEach(btnWrapper => {
            const btn = btnWrapper.querySelector('.btn-custom-action');
            if (btn) {
                btn.classList.add('edit-mode-shake');
                btn.style.cursor = 'pointer';
            }
        });

        // Fonction pour désactiver le mode édition
        const disableEditMode = () => {
            overlay.remove();
            message.remove();
            
            // Retirer la classe pour cacher le bouton de couleurs
            if (container) {
                container.classList.remove('edit-mode-active');
            }
            
            // Retirer l'animation de tous les boutons
            buttonElements.forEach(btnWrapper => {
                const btn = btnWrapper.querySelector('.btn-custom-action');
                if (btn) {
                    btn.classList.remove('edit-mode-shake');
                }
            });

            // Retirer les event listeners
            buttonElements.forEach(btnWrapper => {
                btnWrapper.removeEventListener('click', btnWrapper._editClickHandler);
            });

            document.removeEventListener('keydown', escapeHandler);

            console.log('🎨 Mode édition désactivé');
        };

        // Gestionnaire de touche ESC pour annuler
        const escapeHandler = (e) => {
            if (e.key === 'Escape') {
                disableEditMode();
            }
        };
        document.addEventListener('keydown', escapeHandler);

        // Ajouter un event listener à chaque bouton
        buttonElements.forEach((btnWrapper, index) => {
            const config = buttons[index];
            
            const clickHandler = (e) => {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();

                console.log('✅ Bouton sélectionné pour édition:', config.name);

                // Désactiver le mode édition
                disableEditMode();

                // Appeler le callback avec la config
                onSelect(config);

                return false;
            };

            // Stocker le handler pour pouvoir le retirer plus tard
            btnWrapper._editClickHandler = clickHandler;

            // Ajouter le listener avec capture pour intercepter avant les autres handlers
            btnWrapper.addEventListener('click', clickHandler, true);
        });
    }

    // Créer la modal de configuration des couleurs
    function createColorConfigModal() {
        const colors = loadCustomColors();
        
        const overlay = document.createElement('div');
        overlay.className = 'custom-modal-overlay';

        const modal = document.createElement('div');
        modal.className = 'custom-modal';
        modal.style.maxWidth = '700px';

        modal.innerHTML = `
            <h3>🎨 Configuration des couleurs des boutons</h3>
            
            <div class="color-picker-grid">
                <div class="color-picker-item">
                    <div class="color-picker-label">Info Agent - Lié au symbole</div>
                    <div class="color-preview" id="preview-infoAgentLinked" style="background: ${colors.infoAgentLinked.gradient}"></div>
                    <div class="color-input-wrapper">
                        <input type="color" id="color1-infoAgentLinked" value="#f093fb">
                        <input type="color" id="color2-infoAgentLinked" value="#f5576c">
                    </div>
                </div>

                <div class="color-picker-item">
                    <div class="color-picker-label">Info Agent - Global</div>
                    <div class="color-preview" id="preview-infoAgentGlobal" style="background: ${colors.infoAgentGlobal.gradient}"></div>
                    <div class="color-input-wrapper">
                        <input type="color" id="color1-infoAgentGlobal" value="#a8edea">
                        <input type="color" id="color2-infoAgentGlobal" value="#fed6e3">
                    </div>
                </div>

                <div class="color-picker-item">
                    <div class="color-picker-label">Info Prod - Lié au symbole</div>
                    <div class="color-preview" id="preview-infoProdLinked" style="background: ${colors.infoProdLinked.gradient}"></div>
                    <div class="color-input-wrapper">
                        <input type="color" id="color1-infoProdLinked" value="#667eea">
                        <input type="color" id="color2-infoProdLinked" value="#764ba2">
                    </div>
                </div>

                <div class="color-picker-item">
                    <div class="color-picker-label">Info Prod - Global</div>
                    <div class="color-preview" id="preview-infoProdGlobal" style="background: ${colors.infoProdGlobal.gradient}"></div>
                    <div class="color-input-wrapper">
                        <input type="color" id="color1-infoProdGlobal" value="#f093fb">
                        <input type="color" id="color2-infoProdGlobal" value="#f5576c">
                    </div>
                </div>
            </div>

            <div class="custom-modal-buttons">
                <button class="custom-modal-btn custom-modal-btn-secondary" id="btn-reset">Réinitialiser</button>
                <button class="custom-modal-btn custom-modal-btn-secondary" id="btn-cancel">Annuler</button>
                <button class="custom-modal-btn custom-modal-btn-primary" id="btn-save">Enregistrer</button>
            </div>
        `;

        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        const cancelBtn = modal.querySelector('#btn-cancel');
        const saveBtn = modal.querySelector('#btn-save');
        const resetBtn = modal.querySelector('#btn-reset');

        // Fonction pour mettre à jour l'aperçu
        const updatePreview = (type) => {
            const color1 = modal.querySelector(`#color1-${type}`).value;
            const color2 = modal.querySelector(`#color2-${type}`).value;
            const preview = modal.querySelector(`#preview-${type}`);
            preview.style.background = `linear-gradient(135deg, ${color1} 0%, ${color2} 100%)`;
        };

        // Ajouter les event listeners pour les aperçus
        ['infoAgentLinked', 'infoAgentGlobal', 'infoProdLinked', 'infoProdGlobal'].forEach(type => {
            modal.querySelector(`#color1-${type}`).addEventListener('input', () => updatePreview(type));
            modal.querySelector(`#color2-${type}`).addEventListener('input', () => updatePreview(type));
        });

        // Annulation
        const closeModal = () => {
            overlay.remove();
        };

        cancelBtn.addEventListener('click', closeModal);
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeModal();
        });

        // Réinitialisation
        resetBtn.addEventListener('click', () => {
            if (confirm('Voulez-vous réinitialiser toutes les couleurs aux valeurs par défaut ?')) {
                saveCustomColors(DEFAULT_COLORS);
                closeModal();
                // Recharger la page pour appliquer les nouvelles couleurs
                location.reload();
            }
        });

        // Sauvegarde
        saveBtn.addEventListener('click', () => {
            const newColors = {
                infoAgentLinked: {
                    gradient: `linear-gradient(135deg, ${modal.querySelector('#color1-infoAgentLinked').value} 0%, ${modal.querySelector('#color2-infoAgentLinked').value} 100%)`,
                    radial: `radial-gradient(circle at 50% 100%, ${modal.querySelector('#color1-infoAgentLinked').value} 10%, ${modal.querySelector('#color1-infoAgentLinked').value}00 55%), linear-gradient(${modal.querySelector('#color1-infoAgentLinked').value}, ${modal.querySelector('#color2-infoAgentLinked').value})`
                },
                infoAgentGlobal: {
                    gradient: `linear-gradient(135deg, ${modal.querySelector('#color1-infoAgentGlobal').value} 0%, ${modal.querySelector('#color2-infoAgentGlobal').value} 100%)`,
                    radial: `radial-gradient(circle at 50% 100%, ${modal.querySelector('#color1-infoAgentGlobal').value} 10%, ${modal.querySelector('#color1-infoAgentGlobal').value}00 55%), linear-gradient(${modal.querySelector('#color1-infoAgentGlobal').value}, ${modal.querySelector('#color2-infoAgentGlobal').value})`
                },
                infoProdLinked: {
                    gradient: `linear-gradient(135deg, ${modal.querySelector('#color1-infoProdLinked').value} 0%, ${modal.querySelector('#color2-infoProdLinked').value} 100%)`,
                    radial: `radial-gradient(circle at 50% 100%, ${modal.querySelector('#color1-infoProdLinked').value} 10%, ${modal.querySelector('#color1-infoProdLinked').value}00 55%), linear-gradient(${modal.querySelector('#color1-infoProdLinked').value}, ${modal.querySelector('#color2-infoProdLinked').value})`
                },
                infoProdGlobal: {
                    gradient: `linear-gradient(135deg, ${modal.querySelector('#color1-infoProdGlobal').value} 0%, ${modal.querySelector('#color2-infoProdGlobal').value} 100%)`,
                    radial: `radial-gradient(circle at 50% 100%, ${modal.querySelector('#color1-infoProdGlobal').value} 10%, ${modal.querySelector('#color1-infoProdGlobal').value}00 55%), linear-gradient(${modal.querySelector('#color1-infoProdGlobal').value}, ${modal.querySelector('#color2-infoProdGlobal').value})`
                }
            };

            saveCustomColors(newColors);
            closeModal();

            // Recharger la page pour appliquer les nouvelles couleurs
            location.reload();
        });
    }

    // Créer la modal de configuration
    function createConfigModal(onSave, existingConfig = null) {
        const currentSymbol = getCurrentSymbol();
        const symbolDisplay = currentSymbol ? currentSymbol : 'Inconnu';
        
        const overlay = document.createElement('div');
        overlay.className = 'custom-modal-overlay';

        const modal = document.createElement('div');
        modal.className = 'custom-modal';

        modal.innerHTML = `
            <h3>${existingConfig ? 'Modifier le bouton' : 'Créer un nouveau bouton'}</h3>
            
            <div class="custom-modal-field">
                <label for="btn-name">Nom du bouton *</label>
                <input type="text" id="btn-name" placeholder="Ex: Test OK Platine" value="${existingConfig ? existingConfig.name : ''}" required>
            </div>

            <div class="custom-modal-field">
                <label for="btn-field">Champ à modifier *</label>
                <select id="btn-field">
                    <option value="S_info_agent" ${existingConfig && existingConfig.field === 'S_info_agent' ? 'selected' : ''}>Info Agent</option>
                    <option value="S_info_prod" ${existingConfig && existingConfig.field === 'S_info_prod' ? 'selected' : ''}>Info Prod</option>
                </select>
            </div>

            <div class="custom-modal-field">
                <label for="btn-description">Description *</label>
                <textarea id="btn-description" placeholder="Le texte qui sera inséré dans le champ..." required>${existingConfig ? existingConfig.description : ''}</textarea>
            </div>

            <div class="custom-modal-field-checkbox">
                <input type="checkbox" id="btn-global" ${existingConfig && existingConfig.symbol === 'global' ? 'checked' : ''}>
                <label for="btn-global">Afficher ce bouton sur tous les symboles (sinon uniquement sur ${symbolDisplay})</label>
            </div>

            <div class="custom-modal-field-checkbox">
                <input type="checkbox" id="btn-auto-validate" ${existingConfig && existingConfig.autoValidate !== false ? 'checked' : ''}>
                <label for="btn-auto-validate">Valider automatiquement après avoir rempli le champ</label>
            </div>

            <div class="custom-modal-buttons">
                <button class="custom-modal-btn custom-modal-btn-secondary" id="btn-cancel">Annuler</button>
                <button class="custom-modal-btn custom-modal-btn-primary" id="btn-save">Enregistrer</button>
            </div>
        `;

        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        // Gestion des événements
        const nameInput = modal.querySelector('#btn-name');
        const fieldSelect = modal.querySelector('#btn-field');
        const descriptionInput = modal.querySelector('#btn-description');
        const globalCheckbox = modal.querySelector('#btn-global');
        const autoValidateCheckbox = modal.querySelector('#btn-auto-validate');
        const cancelBtn = modal.querySelector('#btn-cancel');
        const saveBtn = modal.querySelector('#btn-save');

        // Focus sur le premier champ
        setTimeout(() => nameInput.focus(), 100);

        // Annulation
        const closeModal = () => {
            overlay.remove();
        };

        cancelBtn.addEventListener('click', closeModal);
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeModal();
        });

        // Sauvegarde
        saveBtn.addEventListener('click', () => {
            const name = nameInput.value.trim();
            const field = fieldSelect.value;
            const description = descriptionInput.value.trim();
            const isGlobal = globalCheckbox.checked;
            const autoValidate = autoValidateCheckbox.checked;

            if (!name || !description) {
                alert('⚠️ Veuillez remplir tous les champs obligatoires');
                return;
            }

            onSave({
                id: existingConfig ? existingConfig.id : Date.now(),
                name,
                field,
                description,
                symbol: isGlobal ? 'global' : currentSymbol,
                autoValidate: autoValidate
            });

            closeModal();
        });

        // Validation avec Enter
        [nameInput, descriptionInput].forEach(input => {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    saveBtn.click();
                }
            });
        });
    }

    // Exécuter l'action du bouton personnalisé
    function executeCustomAction(config) {
        console.log('🎯 Exécution de l\'action:', config.name);

        // Étape 1 : Cliquer sur le bouton "Modifier la réparation"
        const editButton = document.getElementById('editionReparation');
        
        if (!editButton) {
            console.log('❌ Bouton "Modifier la réparation" non trouvé');
            alert('❌ Impossible de trouver le bouton "Modifier la réparation"');
            return;
        }

        console.log('✅ Clic sur "Modifier la réparation"');
        editButton.click();

        // Étape 2 : Attendre que la modal se charge et remplir le champ
        setTimeout(() => {
            console.log('🔍 Recherche du champ:', config.field);

            const targetField = document.getElementById(config.field);

            if (targetField) {
                // Remplir le champ avec la description
                targetField.value = config.description;

                // Déclencher les événements nécessaires
                targetField.dispatchEvent(new Event('input', { bubbles: true }));
                targetField.dispatchEvent(new Event('change', { bubbles: true }));

                console.log('✅ Champ rempli avec:', config.description);

                // Mettre le focus
                targetField.focus();

                // Validation automatique optionnelle (selon la configuration du bouton)
                if (config.autoValidate !== false) {
                    setTimeout(() => {
                        const modal = targetField.closest('.modal');
                        if (modal) {
                            const okButton = modal.querySelector('[data-bb-handler="ok"]') ||
                                           modal.querySelector('.btn-success') ||
                                           modal.querySelector('button[type="submit"]');
                            
                            if (okButton) {
                                console.log('✅ Validation automatique...');
                                okButton.click();
                            }
                        }
                    }, 500);
                } else {
                    console.log('ℹ️ Validation automatique désactivée pour ce bouton');
                }

            } else {
                console.log('❌ Champ non trouvé:', config.field);
                alert('❌ Impossible de trouver le champ ' + config.field);
            }
        }, 1500);
    }

    // Créer un bouton personnalisé
    function createCustomButton(config, container) {
        const colors = loadCustomColors();
        
        // Déterminer quelle couleur utiliser
        let colorType;
        if (config.field === 'S_info_agent') {
            colorType = config.symbol === 'global' ? 'infoAgentGlobal' : 'infoAgentLinked';
        } else {
            colorType = config.symbol === 'global' ? 'infoProdGlobal' : 'infoProdLinked';
        }
        
        const wrapper = document.createElement('div');
        wrapper.className = 'btn-custom-wrapper';
        wrapper.style.display = 'inline-block';
        wrapper.style.position = 'relative';

        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'btn-custom-action';
        button.style.background = colors[colorType].gradient;
        button.innerHTML = `
            <div class="inner" style="background: ${colors[colorType].radial}">
                <span class="text">${config.name}</span>
            </div>
        `;

        // Action du bouton
        button.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            executeCustomAction(config);
        });

        // Bouton de suppression
        const deleteBtn = document.createElement('div');
        deleteBtn.className = 'btn-delete-custom';
        deleteBtn.innerHTML = '×';
        deleteBtn.title = 'Supprimer ce bouton';

        deleteBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();

            if (confirm(`Voulez-vous vraiment supprimer le bouton "${config.name}" ?`)) {
                // Supprimer de la configuration (TOUS les boutons)
                let allButtons = loadCustomButtons(null);
                allButtons = allButtons.filter(b => b.id !== config.id);
                saveCustomButtons(allButtons);

                // Retirer du DOM
                wrapper.remove();

                console.log('✅ Bouton supprimé:', config.name);
            }
        }, true);

        wrapper.appendChild(button);
        wrapper.appendChild(deleteBtn);

        return wrapper;
    }

    // Ajouter le bouton + et les boutons personnalisés
    function addCustomButtonsSection() {
        console.log('🔍 Recherche du panel repair_details_panel...');

        const repairPanel = document.getElementById('repair_details_panel');

        if (!repairPanel) {
            console.log('❌ Panel repair_details_panel non trouvé');
            return;
        }

        // Vérifier si le bouton + existe déjà
        if (repairPanel.querySelector('.btn-add-custom')) {
            console.log('✅ Boutons personnalisés déjà présents');
            return;
        }

        console.log('✅ Panel trouvé, ajout des boutons...');

        // Créer le conteneur pour les boutons personnalisés (en bas à gauche)
        const customButtonsContainer = document.createElement('div');
        customButtonsContainer.id = 'custom-buttons-container';
        customButtonsContainer.style.position = 'relative';
        customButtonsContainer.style.marginTop = '20px';
        customButtonsContainer.style.marginBottom = '10px';
        customButtonsContainer.style.paddingLeft = '0px';
        customButtonsContainer.style.display = 'flex';
        customButtonsContainer.style.gap = '8px';
        customButtonsContainer.style.alignItems = 'center';
        customButtonsContainer.style.flexWrap = 'wrap';

        // Créer le bouton + (ajouté en PREMIER)
        const addButton = document.createElement('button');
        addButton.type = 'button';
        addButton.className = 'btn-add-custom';
        addButton.innerHTML = '+';
        addButton.title = 'Ajouter un bouton personnalisé';

        addButton.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            createConfigModal((config) => {
                // Sauvegarder la configuration dans TOUS les boutons
                const allButtons = loadCustomButtons(null); // Charger tous les boutons
                allButtons.push(config);
                saveCustomButtons(allButtons);

                // Ajouter le bouton au DOM seulement si il doit être affiché
                const currentSymbol = getCurrentSymbol();
                if (config.symbol === 'global' || config.symbol === currentSymbol) {
                    const btn = createCustomButton(config, customButtonsContainer);
                    customButtonsContainer.appendChild(btn);
                }

                console.log('✅ Nouveau bouton créé:', config.name);
            });
        });

        customButtonsContainer.appendChild(addButton);

        // Créer le bouton d'édition (✏️)
        const editButton = document.createElement('button');
        editButton.type = 'button';
        editButton.className = 'btn-edit-custom';
        editButton.innerHTML = '✏️';
        editButton.title = 'Modifier un bouton existant';

        editButton.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            // Activer le mode édition (sélection directe sur la page)
            enableEditMode((selectedConfig) => {
                createConfigModal((updatedConfig) => {
                    // Mettre à jour la configuration dans TOUS les boutons
                    let allButtons = loadCustomButtons(null); // Charger tous les boutons
                    const index = allButtons.findIndex(b => b.id === selectedConfig.id);
                    if (index !== -1) {
                        allButtons[index] = updatedConfig;
                        saveCustomButtons(allButtons);

                        // Recharger tous les boutons affichables
                        const container = document.getElementById('custom-buttons-container');
                        if (container) {
                            // Supprimer tous les boutons personnalisés existants
                            container.querySelectorAll('.btn-custom-wrapper').forEach(btn => btn.remove());

                            // Recréer uniquement les boutons pour ce symbole
                            const currentSymbol = getCurrentSymbol();
                            const visibleButtons = loadCustomButtons(currentSymbol);
                            visibleButtons.forEach(config => {
                                const btn = createCustomButton(config, container);
                                container.appendChild(btn);
                            });
                        }

                        console.log('✅ Bouton modifié:', updatedConfig.name);
                    }
                }, selectedConfig);
            });
        });

        customButtonsContainer.appendChild(editButton);

        // Créer le bouton de couleurs (🎨)
        const colorsButton = document.createElement('button');
        colorsButton.type = 'button';
        colorsButton.className = 'btn-colors-custom';
        colorsButton.innerHTML = '🎨';
        colorsButton.title = 'Modifier les couleurs des boutons';

        colorsButton.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            createColorConfigModal();
        });

        customButtonsContainer.appendChild(colorsButton);

        // Charger et créer les boutons personnalisés existants (filtrés par symbole)
        const currentSymbol = getCurrentSymbol();
        const customButtons = loadCustomButtons(currentSymbol);
        customButtons.forEach(config => {
            const btn = createCustomButton(config, customButtonsContainer);
            customButtonsContainer.appendChild(btn);
        });

        // Ajouter le conteneur à la fin du panel repair_details
        repairPanel.appendChild(customButtonsContainer);
        console.log('✅ Section boutons personnalisés ajoutée en bas à gauche du panel !');
    }

    // Vérifier et ajouter périodiquement
    function checkAndAddButtons() {
        const repairPanel = document.getElementById('repair_details_panel');

        if (repairPanel && !repairPanel.querySelector('.btn-add-custom')) {
            addCustomButtonsSection();
        }
    }

    // Initialisation
    injectStyles();

    // Observer pour détecter les changements dans le DOM
    const observer = new MutationObserver(checkAndAddButtons);
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // Vérification initiale
    setTimeout(checkAndAddButtons, 1000);

    // Vérification périodique (fallback)
    setInterval(checkAndAddButtons, 3000);

    console.log('✅ Script Boutons Modifiables chargé !');

})();
