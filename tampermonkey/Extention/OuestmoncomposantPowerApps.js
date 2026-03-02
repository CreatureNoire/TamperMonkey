// ==UserScript==
// @name         PowerApp Gallery Favoris
// @namespace    http://tampermonkey.net/
// @version      3.0
// @description  Gestion des favoris pour PowerApps (avec postMessage)
// @author       Vous
// @match        https://apps.powerapps.com/play/e/8ce66143-5dbc-4269-9f4f-16af25fd3458/a/cb3ad194-69f8-47e8-8d8b-3ab7cb9816a4*
// @match        https://apps.powerapps.com/*
// @match        https://runtime-app.powerplatform.com/*
// @grant        GM_setValue
// @grant        GM_getValue
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';

    // Détection du contexte : page principale ou iframe
    const isInIframe = window.self !== window.top;
    const isRuntimeApp = window.location.hostname === 'runtime-app.powerplatform.com';

    console.log(`🔍 Contexte détecté: ${isInIframe ? 'IFRAME' : 'PAGE PRINCIPALE'}`);
    console.log(`🌐 Domaine: ${window.location.hostname}`);

    // ========================================
    // CODE POUR L'IFRAME (runtime-app.powerplatform.com)
    // ========================================
    if (isRuntimeApp) {
        console.log('✅ Script actif dans l\'iframe PowerApps Runtime');

        // Injection des boutons dans l'iframe
        function injectButtonsInIframe() {
            console.log('🔍 [IFRAME] Recherche des labels pour injection des boutons...');
            const labels = document.querySelectorAll('.appmagic-label-text');
            console.log(`📊 [IFRAME] ${labels.length} labels trouvés`);

            // Afficher tous les textes trouvés
            labels.forEach((label, idx) => {
                const text = label.textContent.trim();
                if (idx < 20) { // Limiter à 20 pour ne pas surcharger
                    console.log(`   Label ${idx}: "${text}"`);
                }
            });

            labels.forEach(label => {
                const text = label.textContent.trim();

                // Bouton "Mes Favoris" à côté de "Où est mon composant ?"
                if (text === "Où est mon composant ?" && !document.getElementById('btn-favoris-gallery-iframe')) {
                    console.log('✅ [IFRAME] Trouvé "Où est mon composant ?" - Injection du bouton Favoris');
                    const btnFavoris = document.createElement('button');
                    btnFavoris.id = 'btn-favoris-gallery-iframe';
                    btnFavoris.textContent = '📋 Mes Favoris';
                    btnFavoris.style.cssText = 'margin-left: 15px; background: #4CAF50; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 600; box-shadow: 0 2px 6px rgba(0,0,0,0.15); transition: all 0.2s ease; display: inline-block;';
                    btnFavoris.addEventListener('mouseenter', () => {
                        btnFavoris.style.background = '#45a049';
                        btnFavoris.style.transform = 'translateY(-1px)';
                    });
                    btnFavoris.addEventListener('mouseleave', () => {
                        btnFavoris.style.background = '#4CAF50';
                        btnFavoris.style.transform = 'translateY(0)';
                    });
                    btnFavoris.addEventListener('click', (e) => {
                        e.stopPropagation();
                        console.log('🖱️ [IFRAME] Clic sur bouton Favoris - Envoi du message');
                        window.parent.postMessage({
                            type: 'OPEN_FAVORIS_MODAL'
                        }, 'https://apps.powerapps.com');
                    });

                    // Ajouter le bouton directement dans le div du label
                    label.style.display = 'inline-block';
                    label.appendChild(btnFavoris);
                    console.log('✅ [IFRAME] Bouton Favoris ajouté au DOM');
                }

                // Bouton "Ajouter aux Favoris" à côté de "Retirer un composant :"
                if (text === "Retirer un composant :" && !document.getElementById('btn-add-favoris-gallery-iframe')) {
                    console.log('✅ [IFRAME] Trouvé "Retirer un composant :" - Injection du bouton Ajouter');
                    const btnAddFavoris = document.createElement('button');
                    btnAddFavoris.id = 'btn-add-favoris-gallery-iframe';
                    btnAddFavoris.textContent = '⭐ Ajouter aux Favoris';
                    btnAddFavoris.style.cssText = 'margin-left: 15px; background: #2196F3; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 600; box-shadow: 0 2px 6px rgba(0,0,0,0.15); transition: all 0.2s ease; display: inline-block;';
                    btnAddFavoris.addEventListener('mouseenter', () => {
                        btnAddFavoris.style.background = '#1976D2';
                        btnAddFavoris.style.transform = 'translateY(-1px)';
                    });
                    btnAddFavoris.addEventListener('mouseleave', () => {
                        btnAddFavoris.style.background = '#2196F3';
                        btnAddFavoris.style.transform = 'translateY(0)';
                    });
                    btnAddFavoris.addEventListener('click', (e) => {
                        e.stopPropagation();
                        console.log('🖱️ [IFRAME] Clic sur bouton Ajouter - Envoi du message');
                        window.parent.postMessage({
                            type: 'ADD_TO_FAVORIS'
                        }, 'https://apps.powerapps.com');
                    });

                    // Ajouter le bouton directement dans le div du label
                    label.style.display = 'inline-block';
                    label.appendChild(btnAddFavoris);
                    console.log('✅ [IFRAME] Bouton Ajouter ajouté au DOM');
                }
            });

            console.log('🏁 [IFRAME] Fin de l\'injection des boutons');
        }

        // Observer pour réinjecter les boutons si le DOM change dans l'iframe
        const iframeObserver = new MutationObserver(() => {
            injectButtonsInIframe();
        });

        iframeObserver.observe(document.body, {
            childList: true,
            subtree: true
        });

        console.log('👀 [IFRAME] Observer démarré');

        // Injection initiale dans l'iframe
        setTimeout(() => {
            console.log('⏰ [IFRAME] Injection initiale après 1 seconde');
            injectButtonsInIframe();
        }, 1000);

        setTimeout(() => {
            console.log('⏰ [IFRAME] Injection de secours après 3 secondes');
            injectButtonsInIframe();
        }, 3000);

        // Écouter les demandes de la page parent
        window.addEventListener('message', (event) => {
            // Sécurité : vérifier l'origine
            if (event.origin !== 'https://apps.powerapps.com') {
                return;
            }

            if (event.data.type === 'GET_FIELD_VALUES') {
                // Fonction pour chercher les champs avec patterns élargis
                const findTargetFields = () => {
                    const allInputs = document.querySelectorAll('input[type="text"], input:not([type])');

                    // Stratégie 1: Filtrer par ID avec patterns élargis
                    let targetInputs = Array.from(allInputs).filter(input => {
                        const id = input.id || '';
                        const name = input.name || '';
                        return id.includes('field-5__control') || id.includes('field-5_') || id.includes('field5') ||
                               id.includes('field-6__control') || id.includes('field-6_') || id.includes('field6') ||
                               name.includes('field-5') || name.includes('field-6');
                    });

                    // Stratégie 2: Si aucun champ trouvé par numéro, prendre les 2 premiers champs avec valeur
                    if (targetInputs.length === 0 && allInputs.length >= 2) {
                        targetInputs = Array.from(allInputs)
                            .filter(input => input.value && input.value.trim().length > 0)
                            .slice(0, 2);
                    }

                    return targetInputs;
                };

                // Fonction de retry pour la récupération
                const tryGetValues = (attempt = 1, maxAttempts = 4) => {
                    const targetInputs = findTargetFields();

                    if (targetInputs.length > 0) {
                        const values = targetInputs
                            .map(input => input.value.trim())
                            .filter(val => val.length > 0);

                        window.parent.postMessage({
                            type: 'FIELD_VALUES_RESPONSE',
                            values: values,
                            success: true
                        }, 'https://apps.powerapps.com');
                    } else if (attempt < maxAttempts) {
                        const delay = attempt * 400;
                        setTimeout(() => tryGetValues(attempt + 1, maxAttempts), delay);
                    } else {
                        window.parent.postMessage({
                            type: 'FIELD_VALUES_RESPONSE',
                            values: [],
                            success: false,
                            error: 'Champs introuvables.'
                        }, 'https://apps.powerapps.com');
                    }
                };

                tryGetValues();
            }

            if (event.data.type === 'SET_FIELD2_VALUE') {
                console.log('💉 Demande reçue d\'injecter les valeurs:', event.data.value);

                try {
                    // Splitter le texte au niveau du "|"
                    const parts = event.data.value.split('|').map(part => part.trim());
                    const textField2 = parts[0] || '';
                    const textField3 = parts[1] || '';

                    console.log('📝 Texte pour field-2:', textField2);
                    console.log('📝 Texte pour field-3:', textField3);

                    // Chercher les champs avec retry multiple
                    const findFields = () => {
                        const allInputs = document.querySelectorAll('input[type="text"], input:not([type])');

                        // Stratégie 1: Recherche par numéro de champ classique
                        let field2Input = Array.from(allInputs).find(input => {
                            const id = input.id || '';
                            return id.includes('field-2__control') || id.includes('field-2_') || id.includes('field2');
                        });
                        let field3Input = Array.from(allInputs).find(input => {
                            const id = input.id || '';
                            return id.includes('field-3__control') || id.includes('field-3_') || id.includes('field3');
                        });

                        // Stratégie 2: Si non trouvés, utiliser les positions (1er et 2ème champs)
                        if (!field2Input && allInputs.length >= 1) {
                            field2Input = allInputs[0];
                        }
                        if (!field3Input && allInputs.length >= 2) {
                            field3Input = allInputs[1];
                        }

                        return { field2Input, field3Input };
                    };

                    // Fonction de retry avec tentatives multiples
                    const tryFindAndInject = (attempt = 1, maxAttempts = 5) => {
                        const { field2Input, field3Input } = findFields();

                        if (field2Input) {
                            performInjection(field2Input, field3Input, textField2, textField3);
                        } else if (attempt < maxAttempts) {
                            const delay = attempt * 300;
                            setTimeout(() => tryFindAndInject(attempt + 1, maxAttempts), delay);
                        } else {
                            window.parent.postMessage({
                                type: 'SET_FIELD2_ERROR',
                                message: 'Champs introuvables.'
                            }, 'https://apps.powerapps.com');
                        }
                    };

                    tryFindAndInject();

                } catch (error) {
                    window.parent.postMessage({
                        type: 'SET_FIELD2_ERROR',
                        message: 'Erreur: ' + error.message
                    }, 'https://apps.powerapps.com');
                }
            }

            // Fonction pour effectuer l'injection
            function performInjection(field2Input, field3Input, textField2, textField3) {
                const injectIntoField = (input, text) => {
                    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
                        window.HTMLInputElement.prototype,
                        'value'
                    ).set;

                    input.focus();
                    input.click();
                    nativeInputValueSetter.call(input, '');
                    input.dispatchEvent(new Event('input', { bubbles: true }));

                    setTimeout(() => {
                        nativeInputValueSetter.call(input, text);

                        const events = [
                            new Event('input', { bubbles: true }),
                            new Event('change', { bubbles: true }),
                            new InputEvent('input', {
                                data: text,
                                inputType: 'insertText',
                                bubbles: true
                            }),
                            new KeyboardEvent('keydown', { bubbles: true }),
                            new KeyboardEvent('keyup', { bubbles: true }),
                            new KeyboardEvent('keypress', { bubbles: true }),
                            new Event('blur', { bubbles: true }),
                            new Event('focus', { bubbles: true })
                        ];

                        events.forEach(evt => {
                            try {
                                input.dispatchEvent(evt);
                            } catch (e) {}
                        });

                        input.blur();
                        setTimeout(() => {
                            input.focus();
                            setTimeout(() => {
                                input.blur();
                            }, 50);
                        }, 50);
                    }, 100);
                };

                // Vider d'abord les deux champs
                const clearField = (input) => {
                    if (!input) return;
                    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
                        window.HTMLInputElement.prototype,
                        'value'
                    ).set;

                    input.focus();
                    nativeInputValueSetter.call(input, '');
                    input.dispatchEvent(new Event('input', { bubbles: true }));
                    input.dispatchEvent(new Event('change', { bubbles: true }));
                    input.blur();
                };

                // Nettoyer les deux champs
                clearField(field2Input);
                if (field3Input) {
                    clearField(field3Input);
                }

                // Attendre un peu avant d'injecter
                setTimeout(() => {
                    // Injecter dans field-2
                    injectIntoField(field2Input, textField2);

                    // Injecter dans field-3 si présent et si texte disponible
                    if (field3Input && textField3) {
                        setTimeout(() => {
                            injectIntoField(field3Input, textField3);
                        }, 300); // Attendre que field-2 soit terminé
                    }
                }, 150);

                // Confirmer après tout
                setTimeout(() => {
                    window.parent.postMessage({
                        type: 'SET_FIELD2_SUCCESS'
                    }, 'https://apps.powerapps.com');
                }, 700);
            }
        });

        return;
    }

    // ========================================
    // CODE POUR LA PAGE PRINCIPALE (apps.powerapps.com)
    // ========================================

    console.log('✅ Script actif dans la page principale PowerApps');

    // Stockage des favoris et dossiers
    let favoris = GM_getValue('favoris_gallery', []);
    let dossiers = GM_getValue('dossiers_gallery', []);
    let currentFolder = null; // null = racine
    let folderMode = 'normal'; // 'normal', 'delete', 'edit'
    let selectedFolderForEdit = null;

    // Styles CSS pour le modal et les boutons
    const styles = `
        <style id="favoris-gallery-styles">
            #btn-favoris-gallery {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 25px;
                font-size: 16px;
                font-weight: bold;
                cursor: pointer;
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
                transition: all 0.3s ease;
            }

            #btn-favoris-gallery:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
            }

            #btn-add-favoris-gallery {
                position: fixed;
                top: 20px;
                right: 180px;
                z-index: 10000;
                background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 25px;
                font-size: 16px;
                font-weight: bold;
                cursor: pointer;
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
                transition: all 0.3s ease;
            }

            #btn-add-favoris-gallery:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
            }

            #modal-favoris-gallery {
                display: none;
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                z-index: 9999;
                backdrop-filter: blur(5px);
            }

            #modal-favoris-gallery.active {
                display: flex;
                justify-content: center;
                align-items: center;
            }

            .modal-content-favoris {
                background: white;
                border-radius: 15px;
                padding: 30px;
                max-width: 1000px;
                width: 90%;
                max-height: 80vh;
                display: flex;
                gap: 20px;
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
                animation: slideIn 0.3s ease;
            }

            .sidebar-folders {
                width: 250px;
                border-right: 2px solid #e0e0e0;
                padding-right: 20px;
                overflow-y: auto;
                max-height: calc(80vh - 60px);
            }

            .main-content-favoris {
                flex: 1;
                overflow-y: auto;
                max-height: calc(80vh - 60px);
            }

            #modal-add-favoris {
                display: none;
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                z-index: 10001;
                backdrop-filter: blur(5px);
            }

            #modal-add-favoris.active {
                display: flex;
                justify-content: center;
                align-items: center;
            }

            .modal-add-content {
                background: white;
                border-radius: 15px;
                padding: 30px;
                max-width: 1200px;
                width: 95%;
                max-height: 85vh;
                display: flex !important;
                flex-direction: row;
                gap: 20px;
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
                animation: slideIn 0.3s ease;
                overflow: visible;
            }

            .add-sidebar {
                width: 280px;
                min-width: 280px;
                max-width: 280px;
                flex-shrink: 0;
                flex-grow: 0;
                border-right: 2px solid #e0e0e0;
                padding-right: 20px;
                padding-left: 0;
                overflow-y: auto;
                max-height: calc(85vh - 60px);
                background: #f8f9fa;
                display: block !important;
                visibility: visible !important;
                opacity: 1 !important;
            }

            .add-main-form {
                flex: 1;
                min-width: 400px;
                overflow-y: auto;
                max-height: calc(85vh - 60px);
            }

            .search-bar {
                margin-bottom: 20px;
                position: relative;
            }

            .search-bar input {
                width: 100%;
                padding: 10px 40px 10px 15px;
                border: 2px solid #667eea;
                border-radius: 25px;
                font-size: 14px;
                outline: none;
                transition: all 0.3s ease;
            }

            .search-bar input:focus {
                border-color: #5568d3;
                box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
            }

            .search-icon {
                position: absolute;
                right: 15px;
                top: 50%;
                transform: translateY(-50%);
                color: #667eea;
                font-size: 18px;
            }

            .category-section {
                margin-bottom: 20px;
            }

            .category-header {
                display: flex;
                align-items: center;
                padding: 4px 10px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border-radius: 8px 8px 0 0;
                font-weight: bold;
                font-size: 13px;
                margin-bottom: 0;
            }

            .category-icon {
                margin-right: 6px;
                font-size: 14px;
            }

            .category-content {
                border: 2px solid #667eea;
                border-top: none;
                border-radius: 0 0 10px 10px;
                padding: 10px;
                background: #f8f9fa;
            }

            .form-group {
                margin-bottom: 15px;
            }

            .form-group label {
                display: block;
                margin-bottom: 5px;
                font-weight: bold;
                color: #333;
                font-size: 14px;
            }

            .form-group input,
            .form-group textarea,
            .form-group select {
                width: 100%;
                padding: 10px;
                border: 1px solid #ddd;
                border-radius: 5px;
                font-size: 14px;
                font-family: inherit;
            }

            .form-group textarea {
                resize: vertical;
                min-height: 80px;
            }

            .folder-selector {
                max-height: 200px;
                overflow-y: auto;
                border: 1px solid #ddd;
                border-radius: 5px;
                padding: 10px;
                background: white;
                display: block !important;
                visibility: visible !important;
            }

            .folder-option {
                padding: 8px 12px;
                margin: 5px 0;
                border-radius: 5px;
                cursor: pointer;
                transition: all 0.3s ease;
                background: white;
            }

            .folder-option:hover {
                background: #e0e8ff;
            }

            .folder-option.selected {
                background: #667eea;
                color: white;
                font-weight: bold;
            }

            .btn-primary, .btn-secondary {
                padding: 10px 20px;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                font-size: 14px;
                font-weight: bold;
                transition: all 0.3s ease;
                margin-right: 10px;
            }

            .btn-primary {
                background: #667eea;
                color: white;
            }

            .btn-primary:hover {
                background: #5568d3;
            }

            .btn-secondary {
                background: #ccc;
                color: #333;
            }

            .btn-secondary:hover {
                background: #bbb;
            }

            .quick-folder-create {
                display: flex;
                flex-direction: column;
                gap: 8px;
                margin-top: 10px;
                padding: 10px;
                background: #f0f4ff;
                border-radius: 5px;
            }

            .quick-folder-create input {
                width: 100%;
                padding: 8px;
                border: 1px solid #ddd;
                border-radius: 3px;
                font-size: 13px;
                box-sizing: border-box;
            }

            .quick-folder-create button {
                width: 100%;
                padding: 8px 15px;
                background: #38ef7d;
                color: white;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                font-size: 12px;
                font-weight: bold;
            }

            @keyframes slideIn {
                from {
                    opacity: 0;
                    transform: translateY(-50px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            .modal-header-favoris {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
                border-bottom: 2px solid #667eea;
                padding-bottom: 15px;
            }

            .modal-header-favoris h2 {
                margin: 0;
                color: #667eea;
                font-size: 24px;
            }

            .modal-close-btn {
                background: none;
                border: none;
                font-size: 28px;
                cursor: pointer;
                color: #999;
                transition: color 0.3s ease;
            }

            .modal-close-btn:hover {
                color: #333;
            }

            .favoris-list {
                list-style: none;
                padding: 0;
                margin: 0;
            }

            .favoris-item {
                background: #f8f9fa;
                border-left: 4px solid #667eea;
                padding: 15px;
                margin-bottom: 10px;
                border-radius: 5px;
                display: flex;
                flex-direction: column;
                position: relative;
                transition: all 0.3s ease;
            }

            .favoris-item:hover {
                background: #e9ecef;
                transform: translateX(5px);
            }

            .favoris-item-text {
                flex: 1;
                font-size: 14px;
                color: #333;
                word-break: break-word;
                padding-right: 80px;
                cursor: pointer;
                transition: color 0.2s ease;
            }

            .favoris-item-text:hover {
                color: #667eea;
            }

            .favoris-item-actions {
                position: absolute;
                top: 10px;
                right: 10px;
                display: flex;
                gap: 5px;
            }

            .favoris-item-reperes {
                position: absolute;
                bottom: 10px;
                right: 10px;
                display: flex;
                gap: 5px;
                flex-wrap: wrap;
                justify-content: flex-end;
                max-width: 50%;
            }

            .btn-copy-favoris, .btn-delete-favoris, .btn-edit-favoris {
                padding: 2px 5px;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-size: 11px;
                font-weight: bold;
                transition: all 0.3s ease;
            }

            .btn-inject-favoris {
                background: #38ef7d;
                color: white;
                padding: 8px 15px;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                font-size: 12px;
                font-weight: bold;
                transition: all 0.3s ease;
            }

            .btn-inject-favoris:hover {
                background: #2dd46f;
            }

            .btn-edit-favoris {
                background: #f39c12;
                color: white;
            }

            .btn-edit-favoris:hover {
                background: #e67e22;
            }

            .btn-copy-favoris {
                background: #667eea;
                color: white;
            }

            .btn-copy-favoris:hover {
                background: #5568d3;
            }

            .btn-delete-favoris {
                background: #ff6b6b;
                color: white;
            }

            .btn-delete-favoris:hover {
                background: #ee5a52;
            }

            .empty-favoris {
                text-align: center;
                padding: 40px;
                color: #999;
                font-size: 16px;
            }

            .folder-tree {
                margin-bottom: 20px;
                border-bottom: 1px solid #e0e0e0;
                padding-bottom: 15px;
            }

            .folder-item {
                display: flex;
                align-items: center;
                padding: 8px 12px;
                margin: 5px 0;
                border-radius: 5px;
                cursor: pointer;
                transition: all 0.3s ease;
                background: #f0f4ff;
            }

            .folder-item:hover {
                background: #e0e8ff;
                transform: translateX(5px);
            }

            .folder-item.active {
                background: #667eea;
                color: white;
                font-weight: bold;
            }

            .folder-icon {
                margin-right: 10px;
                font-size: 18px;
            }

            .folder-name {
                flex: 1;
            }

            .folder-actions {
                display: flex;
                gap: 5px;
            }

            .btn-delete-folder {
                background: #ff6b6b;
                color: white;
                border: none;
                padding: 4px 8px;
                border-radius: 3px;
                cursor: pointer;
                font-size: 11px;
            }

            .btn-delete-folder:hover {
                background: #ee5a52;
            }

            .btn-create-folder {
                background: #667eea;
                color: white;
                border: none;
                padding: 0;
                border-radius: 5px;
                cursor: pointer;
                font-size: 14px;
                font-weight: bold;
                transition: all 0.3s ease;
            }

            .btn-create-folder:hover {
                background: #5568d3;
            }

            .folder-form {
                background: #f8f9fa;
                padding: 15px;
                border-radius: 5px;
                margin-bottom: 15px;
                display: none;
            }

            .folder-form.active {
                display: block;
            }

            .folder-form input {
                width: calc(100% - 10px);
                padding: 10px;
                margin: 5px;
                border: 1px solid #ddd;
                border-radius: 5px;
                font-size: 14px;
                box-sizing: border-box;
            }

            .folder-form-actions {
                display: flex;
                gap: 10px;
                margin-top: 10px;
            }

            .btn-save-folder, .btn-cancel-folder {
                padding: 8px 15px;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                font-size: 12px;
                font-weight: bold;
            }

            .btn-save-folder {
                background: #38ef7d;
                color: white;
            }

            .btn-cancel-folder {
                background: #ccc;
                color: #333;
            }

            .breadcrumb {
                display: flex;
                align-items: center;
                padding: 10px 0;
                font-size: 14px;
                color: #666;
            }

            .breadcrumb-item {
                cursor: pointer;
                color: #667eea;
            }

            .breadcrumb-item:hover {
                text-decoration: underline;
            }

            .breadcrumb-separator {
                margin: 0 8px;
            }

            .notification-favoris {
                position: fixed;
                top: 80px;
                right: 20px;
                background: #38ef7d;
                color: white;
                padding: 15px 25px;
                border-radius: 10px;
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
                z-index: 10001;
                animation: slideInNotif 0.3s ease;
                display: none;
            }

            .notification-favoris.error {
                background: #ff6b6b;
            }

            .notification-favoris.active {
                display: block;
            }

            @keyframes slideInNotif {
                from {
                    opacity: 0;
                    transform: translateX(50px);
                }
                to {
                    opacity: 1;
                    transform: translateX(0);
                }
            }
        </style>
    `;

    // Injection des styles
    document.head.insertAdjacentHTML('beforeend', styles);

    // Création du modal principal (liste des favoris)
    const modal = document.createElement('div');
    modal.id = 'modal-favoris-gallery';
    modal.innerHTML = `
        <div class="modal-content-favoris">
            <div class="sidebar-folders">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <h3 style="margin: 0; color: #667eea; line-height: 1;">📁 Dossiers</h3>
                    <div style="display: flex; gap: 5px; align-items: center;">
                        <button class="btn-create-folder" id="btn-create-folder" style="background: #38ef7d; color: white; border: none; padding: 0; width: 26px; height: 26px; border-radius: 4px; cursor: pointer; font-size: 13px; display: flex; align-items: center; justify-content: center;">➕</button>
                        <button class="btn-mode-edit-folder" id="btn-mode-edit-folder" style="background: #f39c12; color: white; border: none; padding: 0; width: 26px; height: 26px; border-radius: 4px; cursor: pointer; font-size: 13px; display: flex; align-items: center; justify-content: center;">✏️</button>
                        <button class="btn-mode-delete-folder" id="btn-mode-delete-folder" style="background: #e74c3c; color: white; border: none; padding: 0; width: 26px; height: 26px; border-radius: 4px; cursor: pointer; font-size: 13px; display: flex; align-items: center; justify-content: center;">🗑️</button>
                    </div>
                </div>

                <div class="folder-form" id="folder-form">
                    <input type="text" id="input-symbole" placeholder="Symbole" style="width: calc(100% - 10px); padding: 10px; margin: 5px; border: 1px solid #ddd; border-radius: 5px; font-size: 14px; box-sizing: border-box;" />
                    <input type="text" id="input-designation" placeholder="Désignation" style="width: calc(100% - 10px); padding: 10px; margin: 5px; border: 1px solid #ddd; border-radius: 5px; font-size: 14px; box-sizing: border-box;" />
                    <label style="display: block; font-weight: bold; color: #667eea; margin: 8px 5px 2px 5px; font-size: 13px;">Rajouter dans :</label>
                    <select id="input-parent-folder" style="width: calc(100% - 10px); padding: 10px; margin: 5px; border: 1px solid #ddd; border-radius: 5px; font-size: 14px; box-sizing: border-box;">
                        <option value="null">Sans Dossier</option>
                    </select>
                    <div class="folder-form-actions">
                        <button class="btn-save-folder" id="btn-save-folder">✅ Créer</button>
                        <button class="btn-cancel-folder" id="btn-cancel-folder">❌ Annuler</button>
                    </div>
                </div>

                <div id="folder-edit-form" style="display: none; background: #fff3cd; padding: 10px; border-radius: 5px; margin-bottom: 10px; border: 2px solid #ffc107;">
                    <h4 style="margin: 0 0 10px 0; color: #856404;">✏️ Modifier le dossier</h4>
                    <input type="text" id="edit-symbole" placeholder="Symbole" style="width: calc(100% - 10px); padding: 8px; margin: 5px; border: 1px solid #ddd; border-radius: 5px; font-size: 14px; box-sizing: border-box;" />
                    <input type="text" id="edit-designation" placeholder="Désignation" style="width: calc(100% - 10px); padding: 8px; margin: 5px; border: 1px solid #ddd; border-radius: 5px; font-size: 14px; box-sizing: border-box;" />
                    <div style="display: flex; gap: 5px; margin-top: 10px;">
                        <button class="btn-save-edit-folder" id="btn-save-edit-folder" style="flex: 1; background: #38ef7d; color: white; border: none; padding: 8px; border-radius: 5px; cursor: pointer; font-weight: bold;">✅ Enregistrer</button>
                        <button class="btn-cancel-edit-folder" id="btn-cancel-edit-folder" style="flex: 1; background: #95a5a6; color: white; border: none; padding: 8px; border-radius: 5px; cursor: pointer; font-weight: bold;">❌ Annuler</button>
                    </div>
                </div>

                <div id="folder-list"></div>
            </div>

            <div class="main-content-favoris">
                <div class="modal-header-favoris">
                    <h2>📋 Mes Favoris</h2>
                    <button class="modal-close-btn">&times;</button>
                </div>

                <div class="search-bar">
                    <input type="text" id="search-favoris" placeholder="🔍 Rechercher dans tous les favoris..." />
                    <span class="search-icon">🔍</span>
                </div>

                <ul class="favoris-list" id="favoris-list-content"></ul>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    // Création du modal d'ajout de favori - VERSION SIMPLIFIÉE
    const modalAdd = document.createElement('div');
    modalAdd.id = 'modal-add-favoris';
    modalAdd.innerHTML = `
        <div class="modal-add-content" id="modal-add-content-main">
            <!-- Le contenu sera ajouté dynamiquement -->
        </div>
    `;
    document.body.appendChild(modalAdd);

    // Création de la notification
    const notification = document.createElement('div');
    notification.className = 'notification-favoris';
    document.body.appendChild(notification);

    // Fonction pour afficher une notification
    function showNotification(message, isError = false) {
        notification.textContent = message;
        notification.classList.toggle('error', isError);
        notification.classList.add('active');

        setTimeout(() => {
            notification.classList.remove('active');
        }, 3000);
    }

    // Fonction pour ajouter aux favoris
    function addToFavoris() {
        console.log('🎯 Fonction addToFavoris appelée');
        console.log('📤 Envoi d\'une demande à l\'iframe...');

        // Trouver l'iframe runtime
        const iframe = document.getElementById('fullscreen-app-host');
        if (!iframe) {
            console.error('❌ Iframe fullscreen-app-host introuvable');
            showNotification('❌ Erreur : iframe non trouvée. Rechargez la page.', true);
            return;
        }

        // Vérifier que l'iframe est chargée
        if (!iframe.contentWindow) {
            console.error('❌ Iframe contentWindow non disponible');
            showNotification('❌ Erreur : iframe non chargée. Attendez le chargement complet.', true);
            return;
        }

        try {
            // Envoyer un message à l'iframe pour récupérer les valeurs
            iframe.contentWindow.postMessage({
                type: 'GET_FIELD_VALUES'
            }, 'https://runtime-app.powerplatform.com');

            console.log('✅ Message envoyé à l\'iframe, en attente de réponse...');
            showNotification('🔍 Recherche des valeurs en cours...', false);
        } catch (error) {
            console.error('❌ Erreur lors de l\'envoi du message:', error);
            showNotification('❌ Erreur : Impossible de communiquer avec l\'iframe. Changez de page et réessayez.', true);
        }
    }

    // Écouter les réponses de l'iframe
    window.addEventListener('message', (event) => {
        // Log de tous les messages reçus pour debug
        console.log('📨 [PARENT] Message reçu:', event.data.type, 'de', event.origin);

        // Sécurité : vérifier l'origine
        if (event.origin !== 'https://runtime-app.powerplatform.com') {
            console.warn('⚠️ [PARENT] Origine non autorisée:', event.origin);
            return;
        }

        // Handler pour ouvrir le modal depuis l'iframe
        if (event.data.type === 'OPEN_FAVORIS_MODAL') {
            console.log('✅ [PARENT] Ouverture du modal favoris');
            displayFavoris();
            modal.classList.add('active');
            return;
        }

        // Handler pour ajouter aux favoris depuis l'iframe
        if (event.data.type === 'ADD_TO_FAVORIS') {
            console.log('✅ [PARENT] Ajout aux favoris déclenché');
            addToFavoris();
            return;
        }

        if (event.data.type === 'SET_FIELD2_ERROR') {
            console.error('❌ Erreur d\'injection reçue de l\'iframe:', event.data.message);
            const message = event.data.message || 'Erreur lors de l\'injection';
            showNotification('❌ ' + message, true);
            return;
        }

        if (event.data.type === 'SET_FIELD2_SUCCESS') {
            console.log('✅ Injection confirmée par l\'iframe');
            return;
        }

        if (event.data.type === 'FIELD_VALUES_RESPONSE') {
            console.log('📥 Réponse reçue de l\'iframe:', event.data);

            // Vérifier si c'est un échec
            if (event.data.success === false) {
                console.error('❌ Échec de récupération:', event.data.error);
                const errorMsg = event.data.error || 'Aucun élément trouvé à ajouter';
                showNotification('❌ ' + errorMsg, true);
                return;
            }

            const values = event.data.values || [];

            if (values.length === 0) {
                console.log('❌ Aucune valeur trouvée');
                showNotification('❌ Aucune valeur dans les champs field-5/field-6', true);
                return;
            }

            // Combiner les valeurs (déduplication automatique avec Set)
            const uniqueValues = [...new Set(values)];
            const textToAdd = uniqueValues.join(' | ');

            console.log('✅ Texte à ajouter:', textToAdd);
            console.log(`📊 ${uniqueValues.length} valeur(s) unique(s) extraite(s)`);


            // Ouvrir le modal d'ajout avec la valeur
            openAddModal(textToAdd);
        }

        if (event.data.type === 'SET_FIELD2_SUCCESS') {
            console.log('✅ Confirmation : valeur injectée avec succès');
        }

        if (event.data.type === 'SET_FIELD2_ERROR') {
            console.error('❌ Erreur : impossible d\'injecter la valeur');
            showNotification('❌ Erreur lors de l\'injection', true);
        }
    });

    // Fonction pour ouvrir le modal d'édition/suppression d'une catégorie
    function openCategoryEditModal(categoryName) {
        const modal = document.getElementById('modal-add-favoris');
        if (!modal) {
            console.error('❌ Modal introuvable');
            return;
        }

        const modalContent = document.getElementById('modal-add-content-main');
        modalContent.innerHTML = '';
        modalContent.style.cssText = 'display: flex; flex-direction: column; gap: 20px; padding: 30px; background: white; border-radius: 15px; max-width: 500px; width: 90%;';

        // Titre
        const title = document.createElement('h2');
        title.textContent = '✏️ Gérer la catégorie';
        title.style.cssText = 'margin: 0; color: #667eea; text-align: center;';
        modalContent.appendChild(title);

        // Nom de la catégorie actuelle
        const categoryInfo = document.createElement('div');
        categoryInfo.style.cssText = 'background: #f0f0f0; padding: 15px; border-radius: 8px; text-align: center;';
        categoryInfo.innerHTML = `<strong>🏷️ ${categoryName}</strong>`;
        modalContent.appendChild(categoryInfo);

        // Input pour renommer
        const renameLabel = document.createElement('label');
        renameLabel.textContent = 'Nouveau nom :';
        renameLabel.style.cssText = 'font-weight: bold; color: #333;';
        modalContent.appendChild(renameLabel);

        const inputNewName = document.createElement('input');
        inputNewName.type = 'text';
        inputNewName.value = categoryName;
        inputNewName.placeholder = 'Nouveau nom de la catégorie';
        inputNewName.style.cssText = 'width: 100%; padding: 12px; border: 2px solid #667eea; border-radius: 8px; font-size: 14px; box-sizing: border-box;';
        modalContent.appendChild(inputNewName);

        // Compter les favoris dans cette catégorie
        const favCount = favoris.filter(f => f.categorie === categoryName).length;
        const countInfo = document.createElement('div');
        countInfo.style.cssText = 'font-size: 12px; color: #666; text-align: center;';
        countInfo.textContent = `📊 ${favCount} favori(s) dans cette catégorie`;
        modalContent.appendChild(countInfo);

        // Boutons d'action
        const btnContainer = document.createElement('div');
        btnContainer.style.cssText = 'display: flex; gap: 10px; margin-top: 20px;';

        // Bouton Renommer
        const btnRename = document.createElement('button');
        btnRename.textContent = '✅ Renommer';
        btnRename.style.cssText = 'flex: 1; padding: 12px; background: #667eea; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 14px;';
        btnRename.addEventListener('click', () => {
            const newName = inputNewName.value.trim();
            if (!newName) {
                showNotification('❌ Le nom ne peut pas être vide', true);
                return;
            }
            if (newName === categoryName) {
                showNotification('ℹ️ Le nom n\'a pas changé', false);
                modal.classList.remove('active');
                return;
            }

            // Renommer dans tous les favoris
            favoris.forEach(fav => {
                if (fav.categorie === categoryName) {
                    fav.categorie = newName;
                }
            });

            GM_setValue('favoris', favoris);
            showNotification(`✅ Catégorie renommée : "${categoryName}" → "${newName}"`);
            modal.classList.remove('active');
            displayFavoris();
        });
        btnContainer.appendChild(btnRename);

        // Bouton Supprimer
        const btnDelete = document.createElement('button');
        btnDelete.textContent = '🗑️ Supprimer';
        btnDelete.style.cssText = 'flex: 1; padding: 12px; background: #dc3545; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 14px;';
        btnDelete.addEventListener('click', () => {
            const confirmMsg = favCount > 0
                ? `⚠️ Supprimer la catégorie "${categoryName}" ?\n\n${favCount} favori(s) seront déplacés vers "Sans catégorie".`
                : `Supprimer la catégorie "${categoryName}" ?`;

            if (confirm(confirmMsg)) {
                // Supprimer la catégorie (mettre à null ou vide)
                favoris.forEach(fav => {
                    if (fav.categorie === categoryName) {
                        fav.categorie = '';
                    }
                });

                GM_setValue('favoris', favoris);
                showNotification(`✅ Catégorie "${categoryName}" supprimée`);
                modal.classList.remove('active');
                displayFavoris();
            }
        });
        btnContainer.appendChild(btnDelete);

        // Bouton Annuler
        const btnCancel = document.createElement('button');
        btnCancel.textContent = '❌ Annuler';
        btnCancel.style.cssText = 'flex: 1; padding: 12px; background: #6c757d; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 14px;';
        btnCancel.addEventListener('click', () => {
            modal.classList.remove('active');
        });
        btnContainer.appendChild(btnCancel);

        modalContent.appendChild(btnContainer);

        // Afficher le modal
        modal.classList.add('active');
        inputNewName.focus();
        inputNewName.select();
    }

    // Fonction pour ouvrir le modal d'édition d'un favori existant
    function openEditModal(index) {
        const favori = favoris[index];
        if (!favori) return;

        console.log('✏️ Ouverture du modal d\'édition pour:', favori);

        // Récupérer le conteneur principal
        const modalContent = document.getElementById('modal-add-content-main');

        // Construire le modal (similaire à openAddModal)
        modalContent.innerHTML = '';
        modalContent.style.cssText = 'display: flex; flex-direction: row; gap: 20px; padding: 20px; background: white; border-radius: 15px; max-width: 1200px; width: 95%; max-height: 85vh; overflow: visible; box-sizing: border-box;';

        // === SIDEBAR (GAUCHE) ===
        const sidebar = document.createElement('div');
        sidebar.style.cssText = 'width: 300px; min-width: 300px; background: #f0f4ff; padding: 20px; border-right: 3px solid #667eea; border-radius: 10px 0 0 10px;';

        // Titre avec compteur
        const titleContainer = document.createElement('div');
        titleContainer.style.cssText = 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;';

        const title = document.createElement('h3');
        title.textContent = '📁 Changer de dossier';
        title.style.cssText = 'margin: 0; color: #667eea; font-size: 18px;';
        titleContainer.appendChild(title);

        sidebar.appendChild(titleContainer);

        // Zone de sélection des dossiers (hiérarchique)
        const folderZone = document.createElement('div');
        folderZone.id = 'folder-selector-dynamic';
        folderZone.style.cssText = 'background: white; border: 2px solid #667eea; border-radius: 8px; padding: 10px; margin-bottom: 20px; max-height: 200px; overflow-y: auto;';

        // Option "Sans Dossier"
        const optionRoot = document.createElement('label');
        optionRoot.className = 'folder-option-dyn';
        optionRoot.style.cssText = 'display: flex; align-items: center; padding: 10px; margin: 5px 0; background: #f8f9fa; border-radius: 5px; cursor: pointer; transition: all 0.2s; user-select: none;';
        optionRoot.innerHTML = `
            <input type="checkbox" class="folder-checkbox" data-folder="null" ${favori.folder === null ? 'checked' : ''} style="margin-right: 10px; width: 18px; height: 18px; cursor: pointer;">
            <span>Sans Dossier</span>
        `;
        optionRoot.addEventListener('mouseenter', () => { optionRoot.style.background = '#e0e8ff'; });
        optionRoot.addEventListener('mouseleave', () => { optionRoot.style.background = '#f8f9fa'; });
        folderZone.appendChild(optionRoot);

        // Fonction récursive pour ajouter les dossiers avec indentation
        function addFolderOptionsRecursive(parentId, level = 0) {
            const childDossiers = dossiers.filter(d => d.parent === parentId);

            childDossiers.forEach(dossier => {
                const opt = document.createElement('label');
                opt.className = 'folder-option-dyn';
                opt.style.cssText = 'display: flex; align-items: center; padding: 10px; margin: 5px 0; padding-left: ' + (10 + level * 20) + 'px; background: #f8f9fa; border-radius: 5px; cursor: pointer; transition: all 0.2s; user-select: none;';
                opt.innerHTML = `
                    <input type="checkbox" class="folder-checkbox" data-folder="${dossier.id}" ${favori.folder === dossier.id ? 'checked' : ''} style="margin-right: 10px; width: 18px; height: 18px; cursor: pointer;">
                    <span>📁 ${dossier.name}</span>
                `;
                opt.addEventListener('mouseenter', () => { opt.style.background = '#e0e8ff'; });
                opt.addEventListener('mouseleave', () => { opt.style.background = '#f8f9fa'; });
                folderZone.appendChild(opt);

                // Ajouter les sous-dossiers
                addFolderOptionsRecursive(dossier.id, level + 1);
            });
        }

        addFolderOptionsRecursive(null);
        sidebar.appendChild(folderZone);

        // Séparateur
        const sep = document.createElement('hr');
        sep.style.cssText = 'border: none; border-top: 2px solid #667eea; margin: 20px 0;';
        sidebar.appendChild(sep);

        // Zone de création rapide
        const createTitle = document.createElement('h4');
        createTitle.textContent = '➕ Créer un nouveau dossier';
        createTitle.style.cssText = 'margin: 0 0 10px 0; color: #667eea; font-size: 16px;';
        sidebar.appendChild(createTitle);

        const quickZone = document.createElement('div');
        quickZone.style.cssText = 'background: white; padding: 15px; border-radius: 8px; border: 2px solid #38ef7d;';

        const inputSymbole = document.createElement('input');
        inputSymbole.type = 'text';
        inputSymbole.id = 'quick-symbole-dyn';
        inputSymbole.placeholder = 'Symbole';
        inputSymbole.style.cssText = 'width: 100%; padding: 8px; margin-bottom: 8px; border: 1px solid #ddd; border-radius: 5px; box-sizing: border-box; font-size: 14px;';
        quickZone.appendChild(inputSymbole);

        const inputDesignation = document.createElement('input');
        inputDesignation.type = 'text';
        inputDesignation.id = 'quick-designation-dyn';
        inputDesignation.placeholder = 'Désignation';
        inputDesignation.style.cssText = 'width: 100%; padding: 8px; margin-bottom: 8px; border: 1px solid #ddd; border-radius: 5px; box-sizing: border-box; font-size: 14px;';
        quickZone.appendChild(inputDesignation);

        const labelParent = document.createElement('label');
        labelParent.textContent = 'Rajouter dans :';
        labelParent.style.cssText = 'display: block; font-weight: bold; color: #667eea; margin-bottom: 5px; font-size: 13px;';
        quickZone.appendChild(labelParent);

        const selectParent = document.createElement('select');
        selectParent.id = 'quick-parent-dyn';
        selectParent.style.cssText = 'width: 100%; padding: 8px; margin-bottom: 10px; border: 1px solid #ddd; border-radius: 5px; box-sizing: border-box; font-size: 14px;';
        selectParent.innerHTML = '<option value="null">📁 Sans Dossier</option>';

        function addParentOptions(parentId, level = 0) {
            const childDossiers = dossiers.filter(d => d.parent === parentId);
            childDossiers.forEach(dossier => {
                const option = document.createElement('option');
                option.value = dossier.id;
                option.textContent = '  '.repeat(level) + '📁 ' + dossier.name;
                selectParent.appendChild(option);
                addParentOptions(dossier.id, level + 1);
            });
        }
        addParentOptions(null);
        quickZone.appendChild(selectParent);

        const btnCreate = document.createElement('button');
        btnCreate.textContent = '✅ Créer le dossier';
        btnCreate.style.cssText = 'width: 100%; padding: 10px; background: #38ef7d; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: bold; font-size: 14px;';
        btnCreate.addEventListener('click', () => {
            const symbole = inputSymbole.value.trim();
            const designation = inputDesignation.value.trim();
            const parent = selectParent.value === 'null' ? null : selectParent.value;
            if (symbole && designation) {
                const newId = createFolder(symbole, designation, parent);
                openEditModal(index);
                showNotification('✅ Dossier créé !');
            } else {
                showNotification('❌ Veuillez remplir les deux champs', true);
            }
        });
        quickZone.appendChild(btnCreate);

        sidebar.appendChild(quickZone);
        modalContent.appendChild(sidebar);

        // === FORMULAIRE PRINCIPAL (DROITE) ===
        const mainForm = document.createElement('div');
        mainForm.style.cssText = 'flex: 1; padding: 20px; overflow-y: auto;';

        const mainTitle = document.createElement('h2');
        mainTitle.textContent = '✏️ Modifier le Favori';
        mainTitle.style.cssText = 'margin: 0 0 20px 0; color: #667eea;';
        mainForm.appendChild(mainTitle);

        // Champ valeur
        const grp1 = document.createElement('div');
        grp1.className = 'form-group';
        grp1.innerHTML = `
            <label>📝 Valeur</label>
            <input type="text" id="edit-value-dyn" value="${favori.text || favori}" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px; font-size: 14px;" />
        `;
        mainForm.appendChild(grp1);

        // Champ catégorie
        const grp2 = document.createElement('div');
        grp2.className = 'form-group';
        const label2 = document.createElement('label');
        label2.textContent = '🏷️ Catégorie';
        grp2.appendChild(label2);

        // Container pour select + bouton sur la même ligne
        const catContainer = document.createElement('div');
        catContainer.style.cssText = 'display: flex; gap: 10px; align-items: center;';

        const selectCat = document.createElement('select');
        selectCat.id = 'edit-categorie-dyn';
        selectCat.style.cssText = 'flex: 1; padding: 10px; border: 1px solid #ddd; border-radius: 5px; font-size: 14px;';

        // Ajouter option vide
        const emptyOption = document.createElement('option');
        emptyOption.value = '';
        emptyOption.textContent = '-- Sélectionner --';
        selectCat.appendChild(emptyOption);

        // Ajouter les catégories existantes
        const categoriesEdit = [...new Set(favoris.map(fav => fav.categorie).filter(cat => cat))];
        categoriesEdit.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat;
            option.textContent = cat;
            if (cat === favori.categorie) option.selected = true;
            selectCat.appendChild(option);
        });

        catContainer.appendChild(selectCat);

        // Bouton "ou Créer" visible en permanence
        const btnNewCat = document.createElement('button');
        btnNewCat.textContent = '➕ Nouveau';
        btnNewCat.type = 'button';
        btnNewCat.style.cssText = 'padding: 10px 15px; background: #667eea; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: bold; font-size: 14px; white-space: nowrap;';
        catContainer.appendChild(btnNewCat);

        grp2.appendChild(catContainer);

        // Zone de saisie pour nouvelle catégorie (cachée au départ)
        const customZone = document.createElement('div');
        customZone.id = 'custom-cat-zone-edit';
        customZone.style.cssText = 'display: none; margin-top: 8px;';

        const customContainer = document.createElement('div');
        customContainer.style.cssText = 'display: flex; gap: 10px; align-items: center;';

        const inputCustomCat = document.createElement('input');
        inputCustomCat.type = 'text';
        inputCustomCat.id = 'edit-categorie-custom-dyn';
        inputCustomCat.placeholder = 'Nom de la nouvelle catégorie...';
        inputCustomCat.style.cssText = 'flex: 1; padding: 10px; border: 1px solid #ddd; border-radius: 5px; font-size: 14px;';
        customContainer.appendChild(inputCustomCat);

        const btnAddCat = document.createElement('button');
        btnAddCat.textContent = '✅ Créer';
        btnAddCat.type = 'button';
        btnAddCat.style.cssText = 'padding: 10px 15px; background: #38ef7d; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: bold; font-size: 14px; white-space: nowrap;';
        btnAddCat.addEventListener('click', () => {
            const newCat = inputCustomCat.value.trim();
            if (newCat) {
                // Ajouter la nouvelle catégorie au select
                const newOption = document.createElement('option');
                newOption.value = newCat;
                newOption.textContent = newCat;
                newOption.selected = true;
                selectCat.appendChild(newOption);
                // Cacher la zone de saisie
                customZone.style.display = 'none';
                inputCustomCat.value = '';
                showNotification('✅ Catégorie "' + newCat + '" ajoutée !');
            } else {
                showNotification('❌ Veuillez saisir un nom de catégorie', true);
            }
        });
        customContainer.appendChild(btnAddCat);

        const btnCancelCat = document.createElement('button');
        btnCancelCat.textContent = '❌';
        btnCancelCat.type = 'button';
        btnCancelCat.style.cssText = 'padding: 10px 12px; background: #ccc; color: #333; border: none; border-radius: 5px; cursor: pointer; font-weight: bold; font-size: 14px;';
        btnCancelCat.addEventListener('click', () => {
            customZone.style.display = 'none';
            inputCustomCat.value = '';
        });
        customContainer.appendChild(btnCancelCat);

        customZone.appendChild(customContainer);
        grp2.appendChild(customZone);

        // Événement pour afficher la zone de saisie
        btnNewCat.addEventListener('click', () => {
            customZone.style.display = 'block';
            inputCustomCat.focus();
        });

        mainForm.appendChild(grp2);

        // Champ repère
        const grp3 = document.createElement('div');
        grp3.className = 'form-group';
        grp3.innerHTML = `
            <label>📍 Repère</label>
            <input type="text" id="edit-repere-dyn" value="${favori.repere || ''}" placeholder="Ex: Zone A, Secteur 3... (séparez par des virgules)" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px; font-size: 14px;" />
            <small style="color: #666; font-size: 12px; display: block; margin-top: 5px;">💡 Séparez les repères par des virgules</small>
        `;
        mainForm.appendChild(grp3);

        // Champ commentaire
        const grp4 = document.createElement('div');
        grp4.className = 'form-group';
        grp4.innerHTML = `
            <label>💬 Commentaire</label>
            <textarea id="edit-commentaire-dyn" placeholder="Ajoutez un commentaire..." style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px; font-size: 14px; min-height: 80px; resize: vertical;">${favori.commentaire || ''}</textarea>
        `;
        mainForm.appendChild(grp4);

        // Boutons d'action
        const btnZone = document.createElement('div');
        btnZone.style.cssText = 'margin-top: 20px;';

        const btnConfirm = document.createElement('button');
        btnConfirm.textContent = '✅ Enregistrer';
        btnConfirm.style.cssText = 'padding: 10px 20px; background: #667eea; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: bold; margin-right: 10px; font-size: 14px;';
        btnConfirm.addEventListener('click', () => {
            const val = document.getElementById('edit-value-dyn').value;
            const selectCat = document.getElementById('edit-categorie-dyn');
            const cat = selectCat.value.trim();
            const rep = document.getElementById('edit-repere-dyn').value.trim();
            const com = document.getElementById('edit-commentaire-dyn').value.trim();

            const checkedBoxes = document.querySelectorAll('.folder-checkbox:checked');
            const selectedFolders = Array.from(checkedBoxes).map(cb =>
                cb.dataset.folder === 'null' ? null : cb.dataset.folder
            );

            if (selectedFolders.length === 0) {
                showNotification('⚠️ Veuillez sélectionner au moins un dossier', true);
                return;
            }

            // Supprimer l'ancien favori
            favoris.splice(index, 1);

            // Ajouter dans tous les dossiers sélectionnés
            selectedFolders.forEach(folderId => {
                favoris.push({
                    text: val,
                    folder: folderId,
                    commentaire: com,
                    categorie: cat,
                    repere: rep,
                    dateAjout: new Date().toISOString()
                });
            });

            GM_setValue('favoris_gallery', favoris);
            document.getElementById('modal-add-favoris').classList.remove('active');
            displayFavoris();

            if (selectedFolders.length === 1) {
                showNotification('✅ Favori modifié avec succès !');
            } else {
                showNotification(`✅ Favori copié dans ${selectedFolders.length} dossiers !`);
            }
        });
        btnZone.appendChild(btnConfirm);

        const btnCancel = document.createElement('button');
        btnCancel.textContent = '❌ Annuler';
        btnCancel.style.cssText = 'padding: 10px 20px; background: #ccc; color: #333; border: none; border-radius: 5px; cursor: pointer; font-weight: bold; font-size: 14px;';
        btnCancel.addEventListener('click', () => {
            document.getElementById('modal-add-favoris').classList.remove('active');
        });
        btnZone.appendChild(btnCancel);

        mainForm.appendChild(btnZone);
        modalContent.appendChild(mainForm);

        // Gestion des checkboxes
        const checkboxes = document.querySelectorAll('.folder-checkbox');
        const updateCounter = () => {
            const count = document.querySelectorAll('.folder-checkbox:checked').length;
            counter.textContent = count === 1 ? '1 sélectionné' : `${count} sélectionnés`;
            counter.style.background = count > 1 ? '#38ef7d' : '#667eea';
        };

        checkboxes.forEach(cb => {
            cb.addEventListener('change', updateCounter);
        });

        updateCounter();

        // Afficher le modal
        document.getElementById('modal-add-favoris').classList.add('active');

        console.log('✅ Modal d\'édition affiché');
    }

    // Fonction pour ouvrir le modal d'ajout - VERSION DYNAMIQUE
    function openAddModal(value) {
        console.log('🎬 Ouverture du modal d\'ajout avec la valeur:', value);

        // Récupérer le conteneur principal
        const modalContent = document.getElementById('modal-add-content-main');

        // CONSTRUIRE TOUT LE HTML DYNAMIQUEMENT
        modalContent.innerHTML = '';
        modalContent.style.cssText = 'display: flex; flex-direction: row; gap: 20px; padding: 20px; background: white; border-radius: 15px; max-width: 1200px; width: 95%; max-height: 85vh; overflow: visible; box-sizing: border-box;';

        // === SIDEBAR (GAUCHE) ===
        const sidebar = document.createElement('div');
        sidebar.style.cssText = 'width: 300px; min-width: 300px; background: #f0f4ff; padding: 20px; border-right: 3px solid #667eea; border-radius: 10px 0 0 10px;';

        // Titre avec compteur
        const titleContainer = document.createElement('div');
        titleContainer.style.cssText = 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;';

        const title = document.createElement('h3');
        title.textContent = '📁 Sélectionner un dossier';
        title.style.cssText = 'margin: 0; color: #667eea; font-size: 18px;';
        titleContainer.appendChild(title);

        sidebar.appendChild(titleContainer);

        // Zone de sélection des dossiers
        const folderZone = document.createElement('div');
        folderZone.id = 'folder-selector-dynamic';
        folderZone.style.cssText = 'background: white; border: 2px solid #667eea; border-radius: 8px; padding: 10px; margin-bottom: 20px; max-height: 200px; overflow-y: auto;';

        // Option "Sans Dossier"
        const optionRoot = document.createElement('label');
        optionRoot.className = 'folder-option-dyn';
        optionRoot.style.cssText = 'display: flex; align-items: center; padding: 10px; margin: 5px 0; background: #f8f9fa; border-radius: 5px; cursor: pointer; transition: all 0.2s; user-select: none;';
        optionRoot.innerHTML = `
            <input type="checkbox" class="folder-checkbox" data-folder="null" checked style="margin-right: 10px; width: 18px; height: 18px; cursor: pointer;">
            <span>Sans Dossier</span>
        `;
        optionRoot.addEventListener('mouseenter', () => {
            optionRoot.style.background = '#e0e8ff';
        });
        optionRoot.addEventListener('mouseleave', () => {
            optionRoot.style.background = '#f8f9fa';
        });
        folderZone.appendChild(optionRoot);

        // Fonction récursive pour ajouter les dossiers avec hiérarchie
        function addFolderOptionsRecursive(parentId, level = 0) {
            const childDossiers = dossiers.filter(d => d.parent === parentId);

            childDossiers.forEach(dossier => {
                const opt = document.createElement('label');
                opt.className = 'folder-option-dyn';
                opt.style.cssText = 'display: flex; align-items: center; padding: 10px; margin: 5px 0; padding-left: ' + (10 + level * 20) + 'px; background: #f8f9fa; border-radius: 5px; cursor: pointer; transition: all 0.2s; user-select: none;';
                opt.innerHTML = `
                    <input type="checkbox" class="folder-checkbox" data-folder="${dossier.id}" style="margin-right: 10px; width: 18px; height: 18px; cursor: pointer;">
                    <span>📁 ${dossier.name}</span>
                `;
                opt.addEventListener('mouseenter', () => {
                    opt.style.background = '#e0e8ff';
                });
                opt.addEventListener('mouseleave', () => {
                    opt.style.background = '#f8f9fa';
                });
                folderZone.appendChild(opt);

                // Ajouter récursivement les sous-dossiers
                addFolderOptionsRecursive(dossier.id, level + 1);
            });
        }

        // Ajouter tous les dossiers avec hiérarchie
        addFolderOptionsRecursive(null);

        sidebar.appendChild(folderZone);

        // Séparateur
        const sep = document.createElement('hr');
        sep.style.cssText = 'border: none; border-top: 2px solid #667eea; margin: 20px 0;';
        sidebar.appendChild(sep);

        // Zone de création rapide
        const createTitle = document.createElement('h4');
        createTitle.textContent = '➕ Créer un nouveau dossier';
        createTitle.style.cssText = 'margin: 0 0 10px 0; color: #667eea; font-size: 16px;';
        sidebar.appendChild(createTitle);

        const quickZone = document.createElement('div');
        quickZone.style.cssText = 'background: white; padding: 15px; border-radius: 8px; border: 2px solid #38ef7d;';

        const inputSymbole = document.createElement('input');
        inputSymbole.type = 'text';
        inputSymbole.id = 'quick-symbole-dyn';
        inputSymbole.placeholder = 'Symbole';
        inputSymbole.style.cssText = 'width: 100%; padding: 8px; margin-bottom: 8px; border: 1px solid #ddd; border-radius: 5px; box-sizing: border-box; font-size: 14px;';
        quickZone.appendChild(inputSymbole);

        const inputDesignation = document.createElement('input');
        inputDesignation.type = 'text';
        inputDesignation.id = 'quick-designation-dyn';
        inputDesignation.placeholder = 'Désignation';
        inputDesignation.style.cssText = 'width: 100%; padding: 8px; margin-bottom: 8px; border: 1px solid #ddd; border-radius: 5px; box-sizing: border-box; font-size: 14px;';
        quickZone.appendChild(inputDesignation);

        const labelParent = document.createElement('label');
        labelParent.textContent = 'Rajouter dans :';
        labelParent.style.cssText = 'display: block; font-weight: bold; color: #667eea; margin-bottom: 5px; font-size: 13px;';
        quickZone.appendChild(labelParent);

        const selectParent = document.createElement('select');
        selectParent.id = 'quick-parent-dyn';
        selectParent.style.cssText = 'width: 100%; padding: 8px; margin-bottom: 10px; border: 1px solid #ddd; border-radius: 5px; box-sizing: border-box; font-size: 14px;';
        selectParent.innerHTML = '<option value="null">📁 Sans Dossier</option>';

        function addParentOptions(parentId, level = 0) {
            const childDossiers = dossiers.filter(d => d.parent === parentId);
            childDossiers.forEach(dossier => {
                const option = document.createElement('option');
                option.value = dossier.id;
                option.textContent = '  '.repeat(level) + '📁 ' + dossier.name;
                selectParent.appendChild(option);
                addParentOptions(dossier.id, level + 1);
            });
        }
        addParentOptions(null);
        quickZone.appendChild(selectParent);

        const btnCreate = document.createElement('button');
        btnCreate.textContent = '✅ Créer le dossier';
        btnCreate.style.cssText = 'width: 100%; padding: 10px; background: #38ef7d; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: bold; font-size: 14px;';
        btnCreate.addEventListener('click', () => {
            const symbole = inputSymbole.value.trim();
            const designation = inputDesignation.value.trim();
            const parent = selectParent.value === 'null' ? null : selectParent.value;
            if (symbole && designation) {
                const newId = createFolder(symbole, designation, parent);
                // Recréer le modal pour afficher le nouveau dossier
                openAddModal(value);
                showNotification('✅ Dossier créé !');
            } else {
                showNotification('❌ Veuillez remplir les deux champs', true);
            }
        });
        quickZone.appendChild(btnCreate);

        sidebar.appendChild(quickZone);
        modalContent.appendChild(sidebar);

        // === FORMULAIRE PRINCIPAL (DROITE) ===
        const mainForm = document.createElement('div');
        mainForm.style.cssText = 'flex: 1; padding: 20px; overflow-y: auto;';

        const mainTitle = document.createElement('h2');
        mainTitle.textContent = '⭐ Ajouter aux Favoris';
        mainTitle.style.cssText = 'margin: 0 0 20px 0; color: #667eea;';
        mainForm.appendChild(mainTitle);

        // Champ valeur détectée
        const grp1 = document.createElement('div');
        grp1.className = 'form-group';
        grp1.innerHTML = `
            <label>📝 Valeur détectée</label>
            <input type="text" id="add-value-dyn" readonly value="${value}" style="width: 100%; padding: 10px; background: #f0f0f0; border: 1px solid #ddd; border-radius: 5px; font-size: 14px;" />
        `;
        mainForm.appendChild(grp1);

        // Champ catégorie
        const grp2 = document.createElement('div');
        grp2.className = 'form-group';
        const label2 = document.createElement('label');
        label2.textContent = '🏷️ Catégorie';
        grp2.appendChild(label2);

        // Container pour select + bouton sur la même ligne
        const catContainer = document.createElement('div');
        catContainer.style.cssText = 'display: flex; gap: 10px; align-items: center;';

        const selectCat = document.createElement('select');
        selectCat.id = 'add-categorie-dyn';
        selectCat.style.cssText = 'flex: 1; padding: 10px; border: 1px solid #ddd; border-radius: 5px; font-size: 14px;';

        // Ajouter option vide
        const emptyOption = document.createElement('option');
        emptyOption.value = '';
        emptyOption.textContent = '-- Sélectionner --';
        selectCat.appendChild(emptyOption);

        // Ajouter les catégories existantes
        const categoriesAdd = [...new Set(favoris.map(fav => fav.categorie).filter(cat => cat))];
        categoriesAdd.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat;
            option.textContent = cat;
            selectCat.appendChild(option);
        });

        catContainer.appendChild(selectCat);

        // Bouton "ou Créer" visible en permanence
        const btnNewCat = document.createElement('button');
        btnNewCat.textContent = '➕ Nouveau';
        btnNewCat.type = 'button';
        btnNewCat.style.cssText = 'padding: 10px 15px; background: #667eea; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: bold; font-size: 14px; white-space: nowrap;';
        catContainer.appendChild(btnNewCat);

        grp2.appendChild(catContainer);

        // Zone de saisie pour nouvelle catégorie (cachée au départ)
        const customZone = document.createElement('div');
        customZone.id = 'custom-cat-zone-add';
        customZone.style.cssText = 'display: none; margin-top: 8px;';

        const customContainer = document.createElement('div');
        customContainer.style.cssText = 'display: flex; gap: 10px; align-items: center;';

        const inputCustomCat = document.createElement('input');
        inputCustomCat.type = 'text';
        inputCustomCat.id = 'add-categorie-custom-dyn';
        inputCustomCat.placeholder = 'Nom de la nouvelle catégorie...';
        inputCustomCat.style.cssText = 'flex: 1; padding: 10px; border: 1px solid #ddd; border-radius: 5px; font-size: 14px;';
        customContainer.appendChild(inputCustomCat);

        const btnAddCat = document.createElement('button');
        btnAddCat.textContent = '✅ Créer';
        btnAddCat.type = 'button';
        btnAddCat.style.cssText = 'padding: 10px 15px; background: #38ef7d; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: bold; font-size: 14px; white-space: nowrap;';
        btnAddCat.addEventListener('click', () => {
            const newCat = inputCustomCat.value.trim();
            if (newCat) {
                // Ajouter la nouvelle catégorie au select
                const newOption = document.createElement('option');
                newOption.value = newCat;
                newOption.textContent = newCat;
                newOption.selected = true;
                selectCat.appendChild(newOption);
                // Cacher la zone de saisie
                customZone.style.display = 'none';
                inputCustomCat.value = '';
                showNotification('✅ Catégorie "' + newCat + '" ajoutée !');
            } else {
                showNotification('❌ Veuillez saisir un nom de catégorie', true);
            }
        });
        customContainer.appendChild(btnAddCat);

        const btnCancelCat = document.createElement('button');
        btnCancelCat.textContent = '❌';
        btnCancelCat.type = 'button';
        btnCancelCat.style.cssText = 'padding: 10px 12px; background: #ccc; color: #333; border: none; border-radius: 5px; cursor: pointer; font-weight: bold; font-size: 14px;';
        btnCancelCat.addEventListener('click', () => {
            customZone.style.display = 'none';
            inputCustomCat.value = '';
        });
        customContainer.appendChild(btnCancelCat);

        customZone.appendChild(customContainer);
        grp2.appendChild(customZone);

        // Événement pour afficher la zone de saisie
        btnNewCat.addEventListener('click', () => {
            customZone.style.display = 'block';
            inputCustomCat.focus();
        });

        mainForm.appendChild(grp2);

        // Champ repère
        const grp3 = document.createElement('div');
        grp3.className = 'form-group';
        grp3.innerHTML = `
            <label>📍 Repère</label>
            <input type="text" id="add-repere-dyn" placeholder="Ex: Zone A, Secteur 3... (séparez par des virgules)" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px; font-size: 14px;" />
            <small style="color: #666; font-size: 12px; display: block; margin-top: 5px;">💡 Séparez les repères par des virgules</small>
        `;
        mainForm.appendChild(grp3);

        // Champ commentaire
        const grp4 = document.createElement('div');
        grp4.className = 'form-group';
        grp4.innerHTML = `
            <label>💬 Commentaire</label>
            <textarea id="add-commentaire-dyn" placeholder="Ajoutez un commentaire..." style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px; font-size: 14px; min-height: 80px; resize: vertical;"></textarea>
        `;
        mainForm.appendChild(grp4);

        // Boutons d'action
        const btnZone = document.createElement('div');
        btnZone.style.cssText = 'margin-top: 20px;';

        const btnConfirm = document.createElement('button');
        btnConfirm.textContent = '✅ Ajouter';
        btnConfirm.style.cssText = 'padding: 10px 20px; background: #667eea; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: bold; margin-right: 10px; font-size: 14px;';
        btnConfirm.addEventListener('click', () => {
            const val = document.getElementById('add-value-dyn').value;
            const selectCat = document.getElementById('add-categorie-dyn');
            const cat = selectCat.value.trim();
            const rep = document.getElementById('add-repere-dyn').value.trim();
            const com = document.getElementById('add-commentaire-dyn').value.trim();

            // Récupérer TOUS les dossiers cochés
            const checkedBoxes = document.querySelectorAll('.folder-checkbox:checked');
            const selectedFolders = Array.from(checkedBoxes).map(cb =>
                cb.dataset.folder === 'null' ? null : cb.dataset.folder
            );

            if (selectedFolders.length === 0) {
                showNotification('⚠️ Veuillez sélectionner au moins un dossier', true);
                return;
            }

            // Vérifier les doublons
            const doublons = [];
            const nouveaux = [];

            selectedFolders.forEach(folderId => {
                const exists = favoris.some(fav => fav.text === val && fav.folder === folderId);
                if (exists) {
                    // Trouver le nom du dossier
                    if (folderId === null) {
                        doublons.push('Sans Dossier');
                    } else {
                        const folder = dossiers.find(d => d.id === folderId);
                        doublons.push(folder ? folder.name : 'Dossier inconnu');
                    }
                } else {
                    nouveaux.push(folderId);
                }
            });

            // Si TOUS sont des doublons
            if (doublons.length > 0 && nouveaux.length === 0) {
                const msg = `⚠️ Ce favori existe déjà dans :\n\n${doublons.map(d => `• ${d}`).join('\n')}\n\nAucun ajout effectué.`;
                alert(msg);
                return;
            }

            // Si certains sont des doublons
            if (doublons.length > 0) {
                const msg = `⚠️ Ce favori existe déjà dans :\n\n${doublons.map(d => `• ${d}`).join('\n')}\n\nIl sera ajouté uniquement dans les ${nouveaux.length} autre(s) dossier(s).\n\nContinuer ?`;
                if (!confirm(msg)) {
                    return;
                }
            }

            // Ajouter dans tous les dossiers NON-doublons
            nouveaux.forEach(folderId => {
                favoris.push({
                    text: val,
                    folder: folderId,
                    commentaire: com,
                    categorie: cat,
                    repere: rep,
                    dateAjout: new Date().toISOString()
                });
            });

            GM_setValue('favoris_gallery', favoris);
            document.getElementById('modal-add-favoris').classList.remove('active');

            if (nouveaux.length === 1) {
                showNotification('✅ Favori ajouté avec succès !');
            } else {
                showNotification(`✅ Favori ajouté dans ${nouveaux.length} dossiers !`);
            }
        });
        btnZone.appendChild(btnConfirm);

        const btnCancel = document.createElement('button');
        btnCancel.textContent = '❌ Annuler';
        btnCancel.style.cssText = 'padding: 10px 20px; background: #ccc; color: #333; border: none; border-radius: 5px; cursor: pointer; font-weight: bold; font-size: 14px;';
        btnCancel.addEventListener('click', () => {
            document.getElementById('modal-add-favoris').classList.remove('active');
        });
        btnZone.appendChild(btnCancel);

        mainForm.appendChild(btnZone);
        modalContent.appendChild(mainForm);

        // Gestion de la sélection multiple des dossiers avec cases à cocher
        document.querySelectorAll('.folder-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                // Mettre à jour le compteur
                const count = document.querySelectorAll('.folder-checkbox:checked').length;
                const counter = document.getElementById('folder-counter');
                counter.textContent = count === 1 ? '1 sélectionné' : `${count} sélectionnés`;
                counter.style.background = count > 1 ? '#38ef7d' : '#667eea';
            });
        });

        // Afficher le modal
        document.getElementById('modal-add-favoris').classList.add('active');

        console.log('✅ Modal construit dynamiquement et affiché');
    }

    // Anciennes fonctions supprimées - tout est maintenant dans openAddModal()

    // Fonction pour afficher les favoris
    function displayFavoris(searchTerm = '') {
        displayFolders();
        displayBreadcrumb();

        const listContent = document.getElementById('favoris-list-content');
        listContent.innerHTML = '';

        // Filtrer les favoris
        let filteredFavoris;
        if (searchTerm) {
            // Recherche globale dans tous les favoris
            filteredFavoris = favoris.filter(fav => {
                const text = (fav.text || fav).toLowerCase();
                const commentaire = (fav.commentaire || '').toLowerCase();
                const categorie = (fav.categorie || '').toLowerCase();
                const repere = (fav.repere || '').toLowerCase();
                const search = searchTerm.toLowerCase();

                return text.includes(search) ||
                       commentaire.includes(search) ||
                       categorie.includes(search) ||
                       repere.includes(search);
            });
        } else if (currentFolder === 'all') {
            // Afficher TOUS les favoris
            filteredFavoris = favoris;
        } else {
            // Filtrer par dossier actuel
            filteredFavoris = favoris.filter(fav => fav.folder === currentFolder);
        }

        if (filteredFavoris.length === 0) {
            listContent.innerHTML = searchTerm ?
                '<div class="empty-favoris">Aucun résultat trouvé</div>' :
                '<div class="empty-favoris">Aucun favori dans ce dossier</div>';
            return;
        }

        // Grouper par catégorie
        const categories = {};

        // Récupérer toutes les catégories existantes (même vides)
        favoris.forEach(fav => {
            const cat = fav.categorie || 'Sans catégorie';
            if (!categories[cat]) {
                categories[cat] = [];
            }
        });

        // Ajouter les favoris filtrés dans les catégories
        filteredFavoris.forEach(fav => {
            const cat = fav.categorie || 'Sans catégorie';
            if (!categories[cat]) {
                categories[cat] = [];
            }
            categories[cat].push(fav);
        });

        // Afficher par catégorie
        Object.keys(categories).sort().forEach(categorie => {
            const section = document.createElement('div');
            section.className = 'category-section';

            const header = document.createElement('div');
            header.className = 'category-header';
            header.style.cssText = 'position: relative; display: flex; align-items: center; gap: 8px; cursor: pointer; user-select: none;';

            // Icône de collapse/expand
            const collapseIcon = document.createElement('span');
            collapseIcon.className = 'collapse-icon';
            collapseIcon.textContent = '▼';
            collapseIcon.style.cssText = 'font-size: 10px; transition: transform 0.3s; display: inline-block;';
            header.appendChild(collapseIcon);

            const headerContent = document.createElement('span');
            headerContent.innerHTML = `
                <span class="category-icon">🏷️</span>
                <span>${categorie} (${categories[categorie].length})</span>
            `;
            header.appendChild(headerContent);

            // Bouton d'édition (visible au survol) - sauf pour "Sans catégorie"
            if (categorie !== 'Sans catégorie') {
                const editBtn = document.createElement('button');
                editBtn.className = 'btn-edit-category';
                editBtn.textContent = '✏️';
                editBtn.style.cssText = 'opacity: 0; transition: opacity 0.2s; background: #667eea; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 12px; margin-left: auto;';
                editBtn.dataset.category = categorie;
                header.appendChild(editBtn);

                // Afficher le bouton au survol
                header.addEventListener('mouseenter', () => {
                    editBtn.style.opacity = '1';
                });
                header.addEventListener('mouseleave', () => {
                    editBtn.style.opacity = '0';
                });
            }

            const content = document.createElement('div');
            content.className = 'category-content';
            content.style.transition = 'max-height 0.3s ease, opacity 0.3s ease';
            content.style.overflow = 'hidden';

            const ul = document.createElement('ul');
            ul.className = 'favoris-list';
            ul.style.margin = '0';

            categories[categorie].forEach(favori => {
                const globalIndex = favoris.indexOf(favori);
                const li = document.createElement('li');
                li.className = 'favoris-item';
                li.style.margin = '5px 0';

                // Construire le texte du composant
                let displayText = favori.text || favori;

                // Construire le badge du dossier
                let folderBadge = '';
                if (favori.folder) {
                    const folder = dossiers.find(d => d.id === favori.folder);
                    if (folder) {
                        folderBadge = `<div style="margin-top: 5px;"><small style="background: #e8f4f8; color: #0066cc; padding: 2px 8px; border-radius: 4px; border: 1px solid #0066cc; font-weight: 600; display: inline-block;">📁 ${folder.name}</small></div>`;
                    }
                } else if (!searchTerm) {
                    // Afficher "Sans Dossier" seulement si pas en mode recherche
                    folderBadge = `<div style="margin-top: 5px;"><small style="background: #f0f0f0; color: #666; padding: 2px 8px; border-radius: 4px; border: 1px solid #999; font-weight: 600; display: inline-block;">Sans Dossier</small></div>`;
                }

                // Gérer les repères multiples (séparés par des virgules) - en bas à droite
                let reperesHTML = '';
                if (favori.repere) {
                    const reperes = favori.repere.split(',').map(r => r.trim()).filter(r => r);
                    if (reperes.length > 0) {
                        reperesHTML = reperes.map(r =>
                            `<span style="background: #fff3cd; color: #856404; padding: 2px 6px; border-radius: 4px; border: 1px solid #ffc107; font-size: 0.85em; font-weight: 600; white-space: nowrap; display: inline-block;">📍 ${r}</span>`
                        ).join(' ');
                    }
                }

                // Ajouter le commentaire
                let commentaireHTML = '';
                if (favori.commentaire) {
                    commentaireHTML = `<div style="margin-top: 5px;"><small style="color: #666;">💬 ${favori.commentaire}</small></div>`;
                }

                // Override pour le mode recherche
                if (searchTerm) {
                    if (favori.folder) {
                        const folder = dossiers.find(d => d.id === favori.folder);
                        if (folder) {
                            folderBadge = `<div style="margin-top: 5px;"><small style="background: #e8f4f8; color: #0066cc; padding: 2px 8px; border-radius: 4px; border: 1px solid #0066cc; font-weight: 600; display: inline-block;">📁 ${folder.name}</small></div>`;
                        }
                    } else {
                        folderBadge = `<div style="margin-top: 5px;"><small style="background: #f0f0f0; color: #666; padding: 2px 8px; border-radius: 4px; border: 1px solid #999; font-weight: 600; display: inline-block;">Sans Dossier</small></div>`;
                    }
                }

                li.innerHTML = `
                    <div class="favoris-item-text" data-index="${globalIndex}">
                        <div>${displayText}</div>
                        ${folderBadge}
                        ${commentaireHTML}
                    </div>
                    <div class="favoris-item-actions">
                        <button class="btn-edit-favoris" data-index="${globalIndex}">✏️</button>
                        <button class="btn-delete-favoris" data-index="${globalIndex}">🗑️</button>
                    </div>
                    ${reperesHTML ? `<div class="favoris-item-reperes">${reperesHTML}</div>` : ''}
                `;
                ul.appendChild(li);
            });

            content.appendChild(ul);
            section.appendChild(header);
            section.appendChild(content);
            listContent.appendChild(section);
        });

        // Ajouter les événements
        document.querySelectorAll('.btn-edit-favoris').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const index = parseInt(e.target.dataset.index);
                openEditModal(index);
            });
        });

        document.querySelectorAll('.btn-delete-favoris').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const index = parseInt(e.target.dataset.index);
                deleteFavori(index);
            });
        });

        // Ajouter l'événement de clic sur la zone du favori pour injecter
        document.querySelectorAll('.favoris-item-text').forEach(textZone => {
            textZone.addEventListener('click', (e) => {
                const index = parseInt(textZone.dataset.index);
                const favori = favoris[index];
                if (favori) {
                    // Fermer le modal
                    const modal = document.getElementById('modal-favoris-gallery');
                    if (modal) {
                        modal.classList.remove('active');
                    }

                    // Injecter la valeur
                    injectValueToField2(favori.text || favori);
                }
            });
            // Ajouter un style pour indiquer que c'est cliquable
            textZone.style.cursor = 'pointer';
        });

        // Ajouter les événements pour les boutons d'édition de catégorie
        document.querySelectorAll('.btn-edit-category').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const categoryName = e.target.dataset.category;
                openCategoryEditModal(categoryName);
            });
        });

        // Ajouter les événements pour le collapse/expand des catégories
        document.querySelectorAll('.category-header').forEach(header => {
            header.addEventListener('click', (e) => {
                // Ne pas déclencher si on clique sur le bouton d'édition
                if (e.target.classList.contains('btn-edit-category')) {
                    return;
                }

                const section = header.parentElement;
                const content = section.querySelector('.category-content');
                const icon = header.querySelector('.collapse-icon');

                if (content.style.maxHeight && content.style.maxHeight !== '0px') {
                    // Réduire
                    content.style.maxHeight = '0px';
                    content.style.opacity = '0';
                    icon.style.transform = 'rotate(-90deg)';
                } else {
                    // Agrandir
                    content.style.maxHeight = content.scrollHeight + 'px';
                    content.style.opacity = '1';
                    icon.style.transform = 'rotate(0deg)';
                }
            });
        });

        // Initialiser toutes les catégories en mode ouvert après un court délai
        setTimeout(() => {
            document.querySelectorAll('.category-header').forEach(header => {
                const section = header.parentElement;
                const content = section.querySelector('.category-content');
                const icon = header.querySelector('.collapse-icon');

                if (content) {
                    content.style.maxHeight = content.scrollHeight + 'px';
                    content.style.opacity = '1';
                }
                if (icon) {
                    icon.style.transform = 'rotate(0deg)';
                }
            });
        }, 50);
    }

    // Fonction pour afficher les dossiers avec hiérarchie
    function displayFolders() {
        const folderList = document.getElementById('folder-list');
        folderList.innerHTML = '';

        // Ajouter "Tous les favoris" en premier (seulement en mode normal)
        if (folderMode === 'normal') {
            const divAll = document.createElement('div');
            divAll.className = 'folder-item' + (currentFolder === 'all' ? ' active' : '');
            divAll.innerHTML = `
                <span class="folder-icon">📋</span>
                <span class="folder-name">Tous les favoris</span>
            `;
            divAll.addEventListener('click', () => {
                currentFolder = 'all';
                displayFavoris();
            });
            folderList.appendChild(divAll);

            // Ajouter "Sans Dossier"
            const divRoot = document.createElement('div');
            divRoot.className = 'folder-item' + (currentFolder === null ? ' active' : '');
            divRoot.innerHTML = `
                <span class="folder-icon"></span>
                <span class="folder-name">Sans Dossier</span>
            `;
            divRoot.addEventListener('click', () => {
                currentFolder = null;
                displayFavoris();
            });
            folderList.appendChild(divRoot);

            // Ajouter un séparateur
            const separator = document.createElement('div');
            separator.style.cssText = 'height: 1px; background: #ddd; margin: 10px 0;';
            folderList.appendChild(separator);
        }

        // Fonction récursive pour afficher les dossiers avec indentation
        function displayFolderTree(parentId, level = 0) {
            const childDossiers = dossiers.filter(d => d.parent === parentId);

            childDossiers.forEach((dossier) => {
                const div = document.createElement('div');
                div.className = 'folder-item' + (currentFolder === dossier.id ? ' active' : '');
                div.style.paddingLeft = (12 + level * 20) + 'px';

                // Affichage différent selon le mode
                if (folderMode === 'delete') {
                    div.style.background = '#ffe6e6';
                    div.style.cursor = 'pointer';
                    div.innerHTML = `
                        <span class="folder-icon">🗑️</span>
                        <span class="folder-name">${dossier.name}</span>
                    `;
                    div.addEventListener('click', () => {
                        if (confirm(`Supprimer le dossier "${dossier.name}" ?`)) {
                            deleteFolder(dossier.id);
                        }
                    });
                } else if (folderMode === 'edit') {
                    div.style.background = '#fff3cd';
                    div.style.cursor = 'pointer';
                    div.innerHTML = `
                        <span class="folder-icon">✏️</span>
                        <span class="folder-name">${dossier.name}</span>
                    `;
                    div.addEventListener('click', () => {
                        selectedFolderForEdit = dossier;
                        document.getElementById('edit-symbole').value = dossier.name.split(' - ')[0] || '';
                        document.getElementById('edit-designation').value = dossier.name.split(' - ')[1] || '';
                        document.getElementById('folder-edit-form').style.display = 'block';
                    });
                } else {
                    // Mode normal
                    div.innerHTML = `
                        <span class="folder-icon">📁</span>
                        <span class="folder-name">${dossier.name}</span>
                    `;
                    div.addEventListener('click', () => {
                        currentFolder = dossier.id;
                        displayFavoris();
                    });
                }

                folderList.appendChild(div);

                // Afficher les sous-dossiers récursivement
                displayFolderTree(dossier.id, level + 1);
            });
        }

        // Afficher tous les dossiers à partir de la racine
        displayFolderTree(null);

        // Mettre à jour le select des parents dans le formulaire
        updateParentFolderSelect();
    }

    // Fonction pour mettre à jour la liste des dossiers parents possibles
    function updateParentFolderSelect() {
        const select = document.getElementById('input-parent-folder');
        if (!select) return;

        select.innerHTML = '<option value="null">Sans Dossier</option>';

        // Fonction récursive pour ajouter les dossiers avec indentation
        function addFolderOptions(parentId, level = 0) {
            const childDossiers = dossiers.filter(d => d.parent === parentId);

            childDossiers.forEach(dossier => {
                const option = document.createElement('option');
                option.value = dossier.id;
                option.textContent = '  '.repeat(level) + '📁 ' + dossier.name;
                select.appendChild(option);

                // Ajouter les sous-dossiers
                addFolderOptions(dossier.id, level + 1);
            });
        }

        addFolderOptions(null);
    }

    // Fonction pour afficher le fil d'Ariane (désactivée, remplacée par le panneau gauche)
    function displayBreadcrumb() {
        // Plus utilisée - l'arborescence dans le panneau gauche remplace le breadcrumb
    }

    // Fonction pour créer un dossier
    function createFolder(symbole, designation, parentId = null) {
        const folderName = `${symbole} - ${designation}`;
        const newFolder = {
            id: Date.now().toString(),
            name: folderName,
            parent: parentId
        };

        dossiers.push(newFolder);
        GM_setValue('dossiers_gallery', dossiers);
        displayFolders();
        showNotification('✅ Dossier créé : ' + folderName);
        return newFolder.id;
    }

    // Fonction pour supprimer un dossier
    function deleteFolder(id) {
        // Supprimer les favoris du dossier
        favoris = favoris.filter(fav => fav.folder !== id);
        GM_setValue('favoris_gallery', favoris);

        // Supprimer les sous-dossiers
        const subFolders = dossiers.filter(d => d.parent === id);
        subFolders.forEach(sf => deleteFolder(sf.id));

        // Supprimer le dossier
        dossiers = dossiers.filter(d => d.id !== id);
        GM_setValue('dossiers_gallery', dossiers);

        displayFavoris();
        showNotification('🗑️ Dossier supprimé');
    }

    // Fonction pour copier dans le presse-papiers
    function copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            showNotification('✅ Copié dans le presse-papiers !');
        }).catch(err => {
            showNotification('❌ Erreur lors de la copie', true);
            console.error('Erreur de copie:', err);
        });
    }

    // Fonction pour injecter la valeur dans le champ field-2
    function injectValueToField2(text) {
        console.log('💉 Injection de la valeur dans field-2:', text);

        // Trouver l'iframe runtime
        const iframe = document.getElementById('fullscreen-app-host');
        if (!iframe) {
            console.error('❌ Iframe fullscreen-app-host introuvable');
            showNotification('❌ Erreur : iframe non trouvée. Rechargez la page.', true);
            return;
        }

        // Vérifier que l'iframe est bien chargée
        if (!iframe.contentWindow) {
            console.error('❌ Iframe contentWindow non disponible');
            showNotification('❌ Erreur : iframe non chargée. Attendez le chargement complet.', true);
            return;
        }

        try {
            // Envoyer un message à l'iframe pour injecter la valeur
            iframe.contentWindow.postMessage({
                type: 'SET_FIELD2_VALUE',
                value: text
            }, 'https://runtime-app.powerplatform.com');

            console.log('✅ Message d\'injection envoyé à l\'iframe');
            showNotification('✅ Valeur injectée dans le champ !', false);
        } catch (error) {
            console.error('❌ Erreur lors de l\'envoi du message:', error);
            showNotification('❌ Erreur : Impossible d\'injecter. Changez de fenêtre et réessayez.', true);
        }
    }

    // Fonction pour supprimer un favori
    function deleteFavori(index) {
        favoris.splice(index, 1);
        GM_setValue('favoris_gallery', favoris);
        displayFavoris();
        showNotification('🗑️ Favori supprimé');
    }

    // Événement pour fermer le modal
    modal.querySelector('.modal-close-btn').addEventListener('click', () => {
        modal.classList.remove('active');
    });

    // Fermer le modal en cliquant à l'extérieur
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });

    // Événement pour la recherche
    const searchInput = document.getElementById('search-favoris');
    searchInput.addEventListener('input', (e) => {
        displayFavoris(e.target.value.trim());
    });

    // Événements pour la gestion des dossiers
    document.getElementById('btn-create-folder').addEventListener('click', () => {
        document.getElementById('folder-form').classList.add('active');
    });

    document.getElementById('btn-cancel-folder').addEventListener('click', () => {
        document.getElementById('folder-form').classList.remove('active');
        document.getElementById('input-symbole').value = '';
        document.getElementById('input-designation').value = '';
    });

    document.getElementById('btn-save-folder').addEventListener('click', () => {
        const symbole = document.getElementById('input-symbole').value.trim();
        const designation = document.getElementById('input-designation').value.trim();
        const parentSelect = document.getElementById('input-parent-folder');
        const parent = parentSelect.value === 'null' ? null : parentSelect.value;

        if (!symbole || !designation) {
            showNotification('❌ Veuillez remplir Symbole et Désignation', true);
            return;
        }

        createFolder(symbole, designation, parent);

        document.getElementById('folder-form').classList.remove('active');
        document.getElementById('input-symbole').value = '';
        document.getElementById('input-designation').value = '';
    });

    // Événements pour les modes de gestion de dossiers
    document.getElementById('btn-mode-edit-folder').addEventListener('click', () => {
        if (folderMode === 'edit') {
            // Désactiver le mode édition
            folderMode = 'normal';
            showNotification('Mode normal activé');
        } else {
            // Activer le mode édition
            folderMode = 'edit';
            document.getElementById('folder-edit-form').style.display = 'none';
            selectedFolderForEdit = null;
            showNotification('✏️ Mode édition activé - Cliquez sur un dossier pour le modifier');
        }
        displayFolders();
    });

    document.getElementById('btn-mode-delete-folder').addEventListener('click', () => {
        if (folderMode === 'delete') {
            // Désactiver le mode suppression
            folderMode = 'normal';
            showNotification('Mode normal activé');
        } else {
            // Activer le mode suppression
            folderMode = 'delete';
            showNotification('🗑️ Mode suppression activé - Cliquez sur un dossier pour le supprimer');
        }
        displayFolders();
    });

    document.getElementById('btn-save-edit-folder').addEventListener('click', () => {
        if (!selectedFolderForEdit) return;

        const symbole = document.getElementById('edit-symbole').value.trim();
        const designation = document.getElementById('edit-designation').value.trim();

        if (!symbole || !designation) {
            showNotification('❌ Veuillez remplir Symbole et Désignation', true);
            return;
        }

        const newName = symbole + ' - ' + designation;
        const folder = dossiers.find(d => d.id === selectedFolderForEdit.id);
        if (folder) {
            folder.name = newName;
            GM_setValue('dossiers', dossiers);
            showNotification('✅ Dossier modifié avec succès');
        }

        // Réinitialiser et sortir du mode édition
        folderMode = 'normal';
        selectedFolderForEdit = null;
        document.getElementById('folder-edit-form').style.display = 'none';
        displayFolders();
    });

    document.getElementById('btn-cancel-edit-folder').addEventListener('click', () => {
        folderMode = 'normal';
        selectedFolderForEdit = null;
        document.getElementById('folder-edit-form').style.display = 'none';
        displayFolders();
    });

    // Événements pour le modal d'ajout - Plus besoin, tout est géré dynamiquement dans openAddModal()

    // Fermer les modals en cliquant à l'extérieur
    document.getElementById('modal-add-favoris').addEventListener('click', (e) => {
        if (e.target.id === 'modal-add-favoris') {
            document.getElementById('modal-add-favoris').classList.remove('active');
        }
    });

    console.log('✅ Script PowerApp Gallery Favoris chargé (version simplifiée)');
    console.log('💡 Prêt pour la nouvelle méthode de sélection');
})();

