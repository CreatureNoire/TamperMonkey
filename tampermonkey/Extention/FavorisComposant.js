// ==UserScript==
// @name         Power BI Favoris - Modern UI
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  Système de favoris moderne pour Power BI
// @match        https://app.powerbi.com/groups/me/apps/*
// @match        https://app.powerbi.com/*/cvSandboxPack.cshtml*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        unsafeWindow
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    const isInIframe = window.self !== window.top;
    const isMainPage = !isInIframe;
    
    console.log('Script Modern UI:', isInIframe ? 'IFRAME' : 'PAGE PRINCIPALE');

    // ============================================================================
    // PARTIE IFRAME - Gestion de la recherche
    // ============================================================================
    if (isInIframe) {
        window.fillSearchInput = function(text) {
            const searchInput = document.querySelector('input[name="search-field"]') || 
                               document.querySelector('input.accessibility-compliant') ||
                               document.querySelector('input[placeholder="Search"]');
            
            if (searchInput) {
                console.log('✓ Input trouvé:', text);
                searchInput.value = text;
                searchInput.focus();
                
                const events = ['input', 'change', 'keyup', 'keydown'];
                events.forEach(eventType => {
                    searchInput.dispatchEvent(new Event(eventType, { bubbles: true, cancelable: true }));
                });
                
                setTimeout(() => {
                    const searchButton = document.querySelector('button[name="search-button"]') ||
                                        document.querySelector('button.search-button') ||
                                        document.querySelector('.c-glyph.search-button');
                    if (searchButton) {
                        console.log('✓ Bouton trouvé, clic!');
                        searchButton.click();
                    }
                }, 100);
                
                return true;
            }
            return false;
        };
        
        // Écouter les messages de la page principale
        window.addEventListener('message', (event) => {
            if (event.data && event.data.type === 'FILL_SEARCH') {
                console.log('Message FILL_SEARCH reçu dans iframe:', event.data.text);
                const success = window.fillSearchInput(event.data.text);
                
                // Répondre à la page principale
                event.source.postMessage({
                    type: 'FILL_SEARCH_RESPONSE',
                    success: success
                }, event.origin);
            }
        });
        
        console.log('Iframe prête à recevoir des messages');
        return;
    }

    // ============================================================================
    // PARTIE PRINCIPALE - Interface et logique
    // ============================================================================
    
    // ===== STYLES GLOBAUX =====
    function injectGlobalStyles() {
        const style = document.createElement('style');
        style.textContent = `
            * { box-sizing: border-box; }
            
            /* Scrollbar personnalisée */
            .modern-scrollbar::-webkit-scrollbar {
                width: 8px;
                height: 8px;
            }
            .modern-scrollbar::-webkit-scrollbar-track {
                background: rgba(255,255,255,0.05);
                border-radius: 4px;
            }
            .modern-scrollbar::-webkit-scrollbar-thumb {
                background: rgba(255,255,255,0.2);
                border-radius: 4px;
            }
            .modern-scrollbar::-webkit-scrollbar-thumb:hover {
                background: rgba(255,255,255,0.3);
            }
            
            /* Animations */
            @keyframes fadeIn {
                from { opacity: 0; transform: scale(0.95); }
                to { opacity: 1; transform: scale(1); }
            }
            
            @keyframes slideIn {
                from { opacity: 0; transform: translateY(-20px); }
                to { opacity: 1; transform: translateY(0); }
            }
            
            .fade-in {
                animation: fadeIn 0.3s ease-out;
            }
            
            .slide-in {
                animation: slideIn 0.3s ease-out;
            }
            
            /* Drag and Drop styles */
            .dragging {
                opacity: 0.5;
                transform: scale(0.95);
                transition: all 0.2s;
            }
            
            .drag-over {
                border-top: 3px solid #4a90e2 !important;
            }
            
            .drag-ghost {
                position: fixed;
                pointer-events: none;
                z-index: 10000;
                opacity: 0.8;
                transform: rotate(2deg) scale(1.05);
                box-shadow: 0 10px 40px rgba(0,0,0,0.5) !important;
                transition: none;
            }
        `;
        document.head.appendChild(style);
    }

    // ===== MODAL D'AJOUT =====
    function createModal() {
        const modal = document.createElement('div');
        modal.id = 'favoris-modal';
        modal.innerHTML = `
            <div class="modal-overlay" style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.85);
                backdrop-filter: blur(8px);
                display: none;
                align-items: center;
                justify-content: center;
                z-index: 99999;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            ">
                <div class="modal-content fade-in" style="
                    background: linear-gradient(145deg, #2a2a2a 0%, #1f1f1f 100%);
                    border-radius: 20px;
                    box-shadow: 0 25px 50px rgba(0,0,0,0.5);
                    width: 90%;
                    max-width: 900px;
                    max-height: 90vh;
                    overflow: hidden;
                    border: 1px solid rgba(255,255,255,0.1);
                    display: flex;
                    flex-direction: column;
                ">
                    <!-- Header -->
                    <div style="
                        background: linear-gradient(135deg, #3d3d3d 0%, #2d2d2d 100%);
                        padding: 28px 32px;
                        border-bottom: 1px solid rgba(255,255,255,0.08);
                    ">
                        <div style="display: flex; align-items: center; justify-content: space-between;">
                            <div>
                                <h2 id="modal-title" style="
                                    margin: 0;
                                    font-size: 26px;
                                    font-weight: 700;
                                    color: #ffffff;
                                    letter-spacing: -0.5px;
                                ">✨ Nouveau Favori</h2>
                                <p id="modal-subtitle" style="
                                    margin: 6px 0 0 0;
                                    font-size: 14px;
                                    color: rgba(255,255,255,0.5);
                                ">Ajouter un composant à vos favoris</p>
                            </div>
                            <button class="close-modal" style="
                                background: rgba(255,255,255,0.1);
                                border: none;
                                width: 36px;
                                height: 36px;
                                border-radius: 8px;
                                color: rgba(255,255,255,0.7);
                                font-size: 24px;
                                cursor: pointer;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                transition: all 0.2s;
                            ">×</button>
                        </div>
                    </div>
                    
                    <!-- Body with 2 columns -->
                    <div style="
                        display: flex;
                        flex: 1;
                        overflow: hidden;
                    ">
                        <!-- Left Column - Dossiers existants -->
                        <div style="
                            width: 320px;
                            background: rgba(0,0,0,0.3);
                            border-right: 1px solid rgba(255,255,255,0.08);
                            display: flex;
                            flex-direction: column;
                        ">
                            <div style="padding: 20px; border-bottom: 1px solid rgba(255,255,255,0.08);">
                                <h3 style="
                                    margin: 0 0 12px 0;
                                    font-size: 13px;
                                    font-weight: 600;
                                    color: rgba(255,255,255,0.8);
                                    text-transform: uppercase;
                                    letter-spacing: 1px;
                                ">📁 Sélectionner les dossiers</h3>
                                
                                <!-- Nouveau dossier - Symbole -->
                                <div style="margin-bottom: 12px;">
                                    <label style="
                                        display: block;
                                        margin-bottom: 6px;
                                        font-size: 11px;
                                        font-weight: 600;
                                        color: rgba(255,255,255,0.6);
                                        text-transform: uppercase;
                                        letter-spacing: 0.5px;
                                    ">Nouveau Symbole</label>
                                    <input type="text" id="input-symbole" class="modern-input" placeholder="Ex: 08661123" style="font-size: 14px; padding: 10px 12px;" />
                                </div>
                                
                                <!-- Nouveau dossier - Désignation -->
                                <div style="margin-bottom: 12px;">
                                    <label style="
                                        display: block;
                                        margin-bottom: 6px;
                                        font-size: 11px;
                                        font-weight: 600;
                                        color: rgba(255,255,255,0.6);
                                        text-transform: uppercase;
                                        letter-spacing: 0.5px;
                                    ">Nouvelle Désignation</label>
                                    <input type="text" id="input-designation" class="modern-input" placeholder="Ex: PRM Tiroir JTS 3C" style="font-size: 14px; padding: 10px 12px;" />
                                </div>
                                
                                <!-- Bouton Ajouter dossier -->
                                <button id="btn-add-folder" style="
                                    width: 100%;
                                    padding: 10px 16px;
                                    background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
                                    border: none;
                                    border-radius: 8px;
                                    color: #ffffff;
                                    font-size: 13px;
                                    font-weight: 600;
                                    cursor: pointer;
                                    transition: all 0.2s;
                                    box-shadow: 0 2px 8px rgba(76,175,80,0.3);
                                ">+ Ajouter ce dossier</button>
                            </div>
                            
                            <div style="
                                flex: 1;
                                overflow-y: auto;
                                padding: 12px;
                            " class="modern-scrollbar" id="folders-checkboxes">
                                <!-- Liste des dossiers avec checkboxes -->
                            </div>
                        </div>
                        
                        <!-- Right Column - Détails du composant -->
                        <div style="
                            flex: 1;
                            padding: 32px;
                            overflow-y: auto;
                        " class="modern-scrollbar">
                            <!-- Nom du composant sélectionné -->
                            <div id="selected-component-display" style="
                                margin-bottom: 24px;
                                padding: 16px;
                                background: linear-gradient(135deg, rgba(74,144,226,0.15) 0%, rgba(53,122,189,0.15) 100%);
                                border: 1px solid rgba(74,144,226,0.3);
                                border-radius: 12px;
                                display: none;
                            ">
                                <div style="
                                    font-size: 11px;
                                    font-weight: 600;
                                    color: rgba(255,255,255,0.6);
                                    text-transform: uppercase;
                                    letter-spacing: 0.5px;
                                    margin-bottom: 8px;
                                ">Composant sélectionné</div>
                                <div id="selected-component-name" style="
                                    font-size: 16px;
                                    font-weight: 600;
                                    color: #4a90e2;
                                    word-wrap: break-word;
                                "></div>
                            </div>
                            
                            <!-- Repère -->
                            <div class="form-group" style="margin-bottom: 24px;">
                                <label style="
                                    display: block;
                                    margin-bottom: 10px;
                                    font-size: 13px;
                                    font-weight: 600;
                                    color: rgba(255,255,255,0.8);
                                    text-transform: uppercase;
                                    letter-spacing: 1px;
                                ">Repère</label>
                                <input type="text" id="input-repere" class="modern-input" placeholder="Ex: R1, R2, R3" />
                            </div>
                            
                            <!-- Commentaire -->
                            <div class="form-group" style="margin-bottom: 0;">
                                <label style="
                                    display: block;
                                    margin-bottom: 10px;
                                    font-size: 13px;
                                    font-weight: 600;
                                    color: rgba(255,255,255,0.8);
                                    text-transform: uppercase;
                                    letter-spacing: 1px;
                                ">Commentaire</label>
                                <textarea id="input-commentaire" class="modern-input" placeholder="Notes supplémentaires..." style="
                                    min-height: 200px;
                                    resize: vertical;
                                    font-family: inherit;
                                "></textarea>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Footer -->
                    <div style="
                        padding: 24px 32px;
                        background: rgba(0,0,0,0.3);
                        border-top: 1px solid rgba(255,255,255,0.08);
                        display: flex;
                        gap: 12px;
                        justify-content: flex-end;
                    ">
                        <button class="btn-cancel" style="
                            padding: 12px 28px;
                            background: rgba(255,255,255,0.08);
                            border: 1px solid rgba(255,255,255,0.12);
                            border-radius: 10px;
                            color: rgba(255,255,255,0.7);
                            font-size: 15px;
                            font-weight: 600;
                            cursor: pointer;
                            transition: all 0.2s;
                        ">Annuler</button>
                        <button class="btn-save" style="
                            padding: 12px 36px;
                            background: linear-gradient(135deg, #4a90e2 0%, #357abd 100%);
                            border: none;
                            border-radius: 10px;
                            color: #ffffff;
                            font-size: 15px;
                            font-weight: 600;
                            cursor: pointer;
                            transition: all 0.2s;
                            box-shadow: 0 4px 15px rgba(74,144,226,0.4);
                        ">Enregistrer</button>
                    </div>
                </div>
            </div>
        `;
        
        // Styles pour les inputs
        const inputStyles = document.createElement('style');
        inputStyles.textContent = `
            .modern-input {
                width: 100%;
                padding: 14px 16px;
                background: rgba(255,255,255,0.06);
                border: 1.5px solid rgba(255,255,255,0.12);
                border-radius: 10px;
                color: #ffffff;
                font-size: 15px;
                outline: none;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }
            
            .modern-input:focus {
                background: rgba(255,255,255,0.09);
                border-color: #4a90e2;
                box-shadow: 0 0 0 4px rgba(74,144,226,0.15);
            }
            
            .modern-input::placeholder {
                color: rgba(255,255,255,0.35);
            }
            
            .close-modal:hover {
                background: rgba(255,255,255,0.15) !important;
                color: #ffffff !important;
            }
            
            .btn-cancel:hover {
                background: rgba(255,255,255,0.12) !important;
                border-color: rgba(255,255,255,0.2) !important;
                color: #ffffff !important;
                transform: translateY(-1px);
            }
            
            .btn-save:hover {
                background: linear-gradient(135deg, #5a9ef2 0%, #4580cd 100%) !important;
                box-shadow: 0 6px 20px rgba(74,144,226,0.5) !important;
                transform: translateY(-2px);
            }
            
            .btn-cancel:active, .btn-save:active {
                transform: translateY(0);
            }
            
            .folder-checkbox-item {
                padding: 10px 12px;
                background: rgba(255,255,255,0.05);
                border: 1px solid rgba(255,255,255,0.1);
                border-radius: 8px;
                margin-bottom: 8px;
                cursor: pointer;
                transition: all 0.2s;
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .folder-checkbox-item:hover {
                background: rgba(255,255,255,0.08);
                border-color: rgba(255,255,255,0.2);
            }
            
            .folder-checkbox-item input[type="checkbox"] {
                width: 18px;
                height: 18px;
                cursor: pointer;
                accent-color: #4a90e2;
            }
            
            .folder-checkbox-item label {
                flex: 1;
                cursor: pointer;
                color: rgba(255,255,255,0.8);
                font-size: 13px;
                font-weight: 500;
            }
            
            .folder-checkbox-item.checked {
                background: rgba(74,144,226,0.2);
                border-color: rgba(74,144,226,0.4);
            }
            
            #btn-add-folder:hover {
                background: linear-gradient(135deg, #5cbd5f 0%, #4db84d 100%) !important;
                box-shadow: 0 4px 12px rgba(76,175,80,0.4) !important;
                transform: translateY(-1px);
            }
            
            #btn-add-folder:active {
                transform: translateY(0);
            }
        `;
        document.head.appendChild(inputStyles);
        
        return modal;
    }

    // ===== FONCTION POUR REMPLIR LA LISTE DES DOSSIERS =====
    function updateFoldersCheckboxes() {
        const container = document.getElementById('folders-checkboxes');
        if (!container) return;
        
        const favoris = loadFavoris();
        const existingFolders = GM_getValue('powerbi_folders', []);
        const folders = {};
        
        // D'abord, initialiser tous les dossiers existants
        existingFolders.forEach(folderKey => {
            if (folderKey !== 'Sans PRM associé') { // Ne pas afficher "Sans PRM associé" dans la modal
                folders[folderKey] = true;
            }
        });
        
        // Ensuite, ajouter les dossiers des favoris existants
        favoris.forEach(item => {
            // Si symbole et désignation sont vides, c'est "Sans PRM associé"
            if (!item.symbole && !item.designation) {
                return; // Ne pas l'ajouter à la liste
            }
            
            const key = [item.symbole, item.designation].filter(Boolean).join(' - ');
            if (key) {
                folders[key] = true;
                // Ajouter ce dossier à la liste s'il n'existe pas encore
                if (!existingFolders.includes(key)) {
                    existingFolders.push(key);
                    GM_setValue('powerbi_folders', existingFolders);
                }
            }
        });
        
        const folderKeys = Object.keys(folders).sort();
        
        if (folderKeys.length === 0) {
            container.innerHTML = `
                <div style="
                    text-align: center;
                    padding: 20px;
                    color: rgba(255,255,255,0.4);
                    font-size: 12px;
                ">
                    Aucun dossier existant<br>
                    Créez-en un ci-dessus
                </div>
            `;
        } else {
            container.innerHTML = folderKeys.map(key => `
                <div class="folder-checkbox-item" data-folder="${key}">
                    <input type="checkbox" id="folder-${key}" value="${key}">
                    <label for="folder-${key}">${key}</label>
                </div>
            `).join('');
            
            // Ajouter les event listeners pour le toggle de classe
            container.querySelectorAll('.folder-checkbox-item').forEach(item => {
                const checkbox = item.querySelector('input[type="checkbox"]');
                const label = item.querySelector('label');
                
                const toggleChecked = () => {
                    if (checkbox.checked) {
                        item.classList.add('checked');
                    } else {
                        item.classList.remove('checked');
                    }
                };
                
                checkbox.addEventListener('change', toggleChecked);
                label.addEventListener('click', (e) => {
                    e.preventDefault();
                    checkbox.checked = !checkbox.checked;
                    checkbox.dispatchEvent(new Event('change'));
                });
            });
        }
    }

    // ===== FENÊTRE PRINCIPALE DES FAVORIS =====
    function createMainWindow() {
        const win = document.createElement('div');
        win.id = 'favoris-window';
        win.innerHTML = `
            <div class="window-overlay" style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.9);
                backdrop-filter: blur(12px);
                display: none;
                align-items: center;
                justify-content: center;
                z-index: 99998;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            ">
                <div class="window-content fade-in" style="
                    background: linear-gradient(145deg, #252525 0%, #1a1a1a 100%);
                    border-radius: 24px;
                    box-shadow: 0 30px 60px rgba(0,0,0,0.6);
                    width: 95%;
                    max-width: 1400px;
                    height: 90vh;
                    display: flex;
                    flex-direction: column;
                    border: 1px solid rgba(255,255,255,0.1);
                    overflow: hidden;
                ">
                    <!-- Header -->
                    <div style="
                        background: linear-gradient(135deg, #3d3d3d 0%, #2d2d2d 100%);
                        padding: 24px 32px;
                        border-bottom: 1px solid rgba(255,255,255,0.08);
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                    ">
                        <div>
                            <h1 style="
                                margin: 0;
                                font-size: 32px;
                                font-weight: 800;
                                color: #ffffff;
                                letter-spacing: -1px;
                            ">⭐ Mes Favoris</h1>
                            <p style="
                                margin: 4px 0 0 0;
                                font-size: 14px;
                                color: rgba(255,255,255,0.5);
                            ">Gérez vos composants favoris</p>
                        </div>
                        <button class="close-window" style="
                            background: rgba(255,255,255,0.1);
                            border: none;
                            width: 44px;
                            height: 44px;
                            border-radius: 12px;
                            color: rgba(255,255,255,0.7);
                            font-size: 28px;
                            cursor: pointer;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            transition: all 0.2s;
                        ">×</button>
                    </div>
                    
                    <!-- Content -->
                    <div style="
                        flex: 1;
                        display: flex;
                        overflow: hidden;
                    ">
                        <!-- Sidebar -->
                        <div style="
                            width: 33%;
                            min-width: 350px;
                            background: rgba(0,0,0,0.3);
                            border-right: 1px solid rgba(255,255,255,0.08);
                            display: flex;
                            flex-direction: column;
                        ">
                            <div style="padding: 20px; border-bottom: 1px solid rgba(255,255,255,0.08);">
                                <h3 style="
                                    margin: 0 0 16px 0;
                                    font-size: 16px;
                                    font-weight: 600;
                                    color: rgba(255,255,255,0.9);
                                    text-transform: uppercase;
                                    letter-spacing: 1px;
                                ">📁 Dossiers</h3>
                                <button id="btn-all-folders" class="folder-btn active" data-folder="__ALL__" style="
                                    width: 100%;
                                    padding: 14px 16px;
                                    background: linear-gradient(135deg, #4a90e2 0%, #357abd 100%);
                                    border: none;
                                    border-radius: 10px;
                                    color: #ffffff;
                                    font-size: 14px;
                                    font-weight: 600;
                                    cursor: pointer;
                                    transition: all 0.2s;
                                    text-align: left;
                                    display: flex;
                                    align-items: center;
                                    justify-content: space-between;
                                    box-shadow: 0 4px 12px rgba(74,144,226,0.3);
                                ">
                                    <span>Tous les composants</span>
                                    <span class="count-badge" style="
                                        background: rgba(255,255,255,0.2);
                                        padding: 4px 10px;
                                        border-radius: 20px;
                                        font-size: 12px;
                                        font-weight: 700;
                                    ">0</span>
                                </button>
                                <button id="btn-sans-prm" class="folder-btn" data-folder="Sans PRM associé" style="
                                    width: 100%;
                                    padding: 14px 16px;
                                    background: rgba(244,67,54,0.2);
                                    border: 1px solid rgba(244,67,54,0.4);
                                    border-radius: 10px;
                                    color: #f44336;
                                    font-size: 14px;
                                    font-weight: 600;
                                    cursor: pointer;
                                    transition: all 0.2s;
                                    text-align: left;
                                    display: flex;
                                    align-items: center;
                                    justify-content: space-between;
                                    margin-top: 8px;
                                ">
                                    <span>Sans PRM associé</span>
                                    <span class="count-badge" style="
                                        background: rgba(255,255,255,0.15);
                                        padding: 4px 10px;
                                        border-radius: 20px;
                                        font-size: 12px;
                                        font-weight: 700;
                                    ">0</span>
                                </button>
                            </div>
                            <div id="folders-list" style="
                                flex: 1;
                                overflow-y: auto;
                                padding: 12px;
                            " class="modern-scrollbar"></div>
                        </div>
                        
                        <!-- Main Content -->
                        <div style="
                            flex: 1;
                            display: flex;
                            flex-direction: column;
                            background: rgba(0,0,0,0.2);
                        ">
                            <div style="
                                padding: 20px 32px;
                                border-bottom: 1px solid rgba(255,255,255,0.08);
                            ">
                                <input type="text" id="search-input" placeholder="🔍 Rechercher un composant..." class="modern-input" style="
                                    width: 100%;
                                " />
                            </div>
                            <div id="components-list" style="
                                flex: 1;
                                overflow-y: auto;
                                padding: 24px 32px;
                            " class="modern-scrollbar">
                                <div style="
                                    text-align: center;
                                    padding: 60px 20px;
                                    color: rgba(255,255,255,0.4);
                                ">
                                    <div style="font-size: 48px; margin-bottom: 16px;">📂</div>
                                    <p style="font-size: 16px; margin: 0;">Aucun favori pour le moment</p>
                                    <p style="font-size: 14px; margin: 8px 0 0 0;">Cliquez sur "+ Ajouter" pour commencer</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Styles supplémentaires
        const styles = document.createElement('style');
        styles.textContent = `
            .close-window:hover {
                background: rgba(255,90,90,0.2) !important;
                color: #ff5a5a !important;
            }
            
            .folder-btn {
                width: 100%;
                padding: 14px 16px;
                background: rgba(255,255,255,0.05);
                border: 1px solid rgba(255,255,255,0.1);
                border-radius: 10px;
                color: rgba(255,255,255,0.7);
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s;
                text-align: left;
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-bottom: 8px;
            }
            
            .folder-btn:hover {
                background: rgba(255,255,255,0.08);
                border-color: rgba(255,255,255,0.2);
                color: #ffffff;
                transform: translateX(4px);
            }
            
            .folder-btn.active {
                background: linear-gradient(135deg, #4a90e2 0%, #357abd 100%);
                border-color: transparent;
                color: #ffffff;
                box-shadow: 0 4px 12px rgba(74,144,226,0.3);
            }
            
            .component-card {
                background: rgba(255,255,255,0.05);
                border: 1px solid rgba(255,255,255,0.1);
                border-radius: 12px;
                padding: 20px;
                margin-bottom: 16px;
                transition: all 0.2s;
                position: relative;
            }
            
            .component-card:hover {
                background: rgba(255,255,255,0.08);
                border-color: rgba(255,255,255,0.2);
                transform: translateY(-2px);
                box-shadow: 0 8px 24px rgba(0,0,0,0.3);
            }
        `;
        document.head.appendChild(styles);
        
        return win;
    }

    // ===== BOUTONS D'ACTION =====
    function createActionButtons() {
        const addBtn = document.createElement('button');
        addBtn.id = 'btn-add-favori';
        addBtn.innerHTML = '⭐ Ajouter';
        addBtn.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 14px 28px;
            background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
            border: none;
            border-radius: 12px;
            color: #ffffff;
            font-size: 15px;
            font-weight: 600;
            cursor: pointer;
            box-shadow: 0 6px 20px rgba(76,175,80,0.4);
            transition: all 0.2s;
            z-index: 99997;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        `;
        
        const listBtn = document.createElement('button');
        listBtn.id = 'btn-show-list';
        listBtn.innerHTML = '📋 Mes Favoris';
        listBtn.style.cssText = `
            position: fixed;
            top: 70px;
            right: 20px;
            padding: 14px 28px;
            background: linear-gradient(135deg, #4a90e2 0%, #357abd 100%);
            border: none;
            border-radius: 12px;
            color: #ffffff;
            font-size: 15px;
            font-weight: 600;
            cursor: pointer;
            box-shadow: 0 6px 20px rgba(74,144,226,0.4);
            transition: all 0.2s;
            z-index: 99997;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        `;
        
        const hoverStyle = document.createElement('style');
        hoverStyle.textContent = `
            #btn-add-favori:hover {
                background: linear-gradient(135deg, #5cbd5f 0%, #4db84d 100%) !important;
                box-shadow: 0 8px 25px rgba(76,175,80,0.5) !important;
                transform: translateY(-2px);
            }
            #btn-show-list:hover {
                background: linear-gradient(135deg, #5a9ef2 0%, #4580cd 100%) !important;
                box-shadow: 0 8px 25px rgba(74,144,226,0.5) !important;
                transform: translateY(-2px);
            }
            #btn-add-favori:active, #btn-show-list:active {
                transform: translateY(0);
            }
        `;
        document.head.appendChild(hoverStyle);
        
        return { addBtn, listBtn };
    }

    // ===== VARIABLES GLOBALES POUR DRAG AND DROP =====
    let draggedCard = null;  // Carte en cours de déplacement
    let ghostElement = null; // Élément fantôme pour le drag

    // ===== FONCTIONS DE GESTION DES DONNÉES =====
    function loadFavoris() {
        return GM_getValue('powerbi_favoris', []);
    }

    function saveFavoris(favoris) {
        GM_setValue('powerbi_favoris', favoris);
    }
    
    function loadFoldersOrder() {
        return GM_getValue('powerbi_folders_order', []);
    }
    
    function saveFoldersOrder(order) {
        GM_setValue('powerbi_folders_order', order);
    }

    function addFavori(data) {
        const favoris = loadFavoris();
        favoris.push({
            ...data,
            timestamp: Date.now()
        });
        saveFavoris(favoris);
        return favoris;
    }

    function deleteFavori(index) {
        const favoris = loadFavoris();
        favoris.splice(index, 1);
        saveFavoris(favoris);
        return favoris;
    }

    function deleteFolder(folderKey) {
        // Supprimer tous les composants du dossier
        const favoris = loadFavoris();
        const filtered = favoris.filter(item => {
            // Déterminer la clé du dossier pour ce favori
            let itemKey;
            if (!item.symbole && !item.designation) {
                itemKey = 'Sans PRM associé';
            } else {
                itemKey = [item.symbole, item.designation].filter(Boolean).join(' - ');
            }
            return itemKey !== folderKey;
        });
        saveFavoris(filtered);
        
        // Supprimer le dossier de la liste des dossiers
        const existingFolders = GM_getValue('powerbi_folders', []);
        const updatedFolders = existingFolders.filter(f => f !== folderKey);
        GM_setValue('powerbi_folders', updatedFolders);
        
        updateFoldersList();
        displayComponents('__ALL__');
        document.getElementById('btn-all-folders').classList.add('active');
        document.querySelectorAll('.folder-btn[data-folder]').forEach(b => b.classList.remove('active'));
    }

    function renameFolder(oldKey, newKey) {
        const favoris = loadFavoris();
        const [oldSymbole, oldDesignation] = oldKey.includes(' - ') ? oldKey.split(' - ') : [oldKey, ''];
        const [newSymbole, newDesignation] = newKey.includes(' - ') ? newKey.split(' - ') : [newKey, ''];
        
        favoris.forEach(item => {
            // Déterminer la clé du dossier pour ce favori
            let itemKey;
            if (!item.symbole && !item.designation) {
                itemKey = 'Sans PRM associé';
            } else {
                itemKey = [item.symbole, item.designation].filter(Boolean).join(' - ');
            }
            
            if (itemKey === oldKey) {
                // Mettre à jour uniquement le symbole et la désignation du dossier
                item.symbole = newSymbole || '';
                item.designation = newDesignation || '';
                // NE PAS modifier item.text car c'est le nom du composant Power BI
            }
        });
        
        saveFavoris(favoris);
        
        // Mettre à jour la liste des dossiers
        const existingFolders = GM_getValue('powerbi_folders', []);
        const folderIndex = existingFolders.indexOf(oldKey);
        if (folderIndex !== -1) {
            existingFolders[folderIndex] = newKey;
            GM_setValue('powerbi_folders', existingFolders);
        }
        
        updateFoldersList();
        displayComponents(newKey);
        
        // Sélectionner le dossier renommé
        setTimeout(() => {
            const renamedBtn = document.querySelector(`.folder-btn[data-folder="${newKey}"]`);
            if (renamedBtn) {
                document.querySelectorAll('.folder-btn').forEach(b => b.classList.remove('active'));
                renamedBtn.classList.add('active');
            }
        }, 100);
    }

    // ===== RÉCUPÉRATION SÉLECTION POWER BI =====
    function getSelectedItem() {
        try {
            // Essayer d'abord avec aria-selected="true" (slicer moderne)
            let slicerItem = document.querySelector('.slicerItemContainer[aria-selected="true"]');
            
            // Si pas trouvé, essayer avec aria-checked="true" (ancien format)
            if (!slicerItem) {
                slicerItem = document.querySelector('.slicerItemContainer[aria-checked="true"]');
            }
            
            console.log('🔍 Recherche élément sélectionné dans Power BI...');
            console.log('   Élément trouvé:', slicerItem);
            
            if (!slicerItem) {
                console.log('   ❌ Aucun élément .slicerItemContainer avec aria-selected ou aria-checked trouvé');
                return null;
            }

            // Récupérer le texte depuis le span.slicerText
            const textSpan = slicerItem.querySelector('.slicerText');
            const text = textSpan ? textSpan.textContent.trim() : slicerItem.textContent.trim();
            const title = slicerItem.getAttribute('title') || text;
            
            console.log('   ✅ Texte extrait:', text);
            console.log('   ✅ Title extrait:', title);

            return { title: title, text: text };
        } catch (error) {
            console.error('❌ Erreur lors de la récupération de l\'élément sélectionné:', error);
            return null;
        }
    }

    // ===== AFFICHAGE DES COMPOSANTS =====
    function displayComponents(folder = '__ALL__', openModalFn = null) {
        const favoris = loadFavoris();
        const container = document.getElementById('components-list');
        
        if (favoris.length === 0) {
            container.innerHTML = `
                <div style="
                    text-align: center;
                    padding: 60px 20px;
                    color: rgba(255,255,255,0.4);
                ">
                    <div style="font-size: 48px; margin-bottom: 16px;">📂</div>
                    <p style="font-size: 16px; margin: 0;">Aucun favori pour le moment</p>
                    <p style="font-size: 14px; margin: 8px 0 0 0;">Cliquez sur "+ Ajouter" pour commencer</p>
                </div>
            `;
            return;
        }
        
        const filtered = folder === '__ALL__' ? favoris : favoris.filter(f => {
            // Déterminer la clé du dossier pour ce favori
            let folderKey;
            if (!f.symbole && !f.designation) {
                folderKey = 'Sans PRM associé';
            } else {
                folderKey = [f.symbole, f.designation].filter(Boolean).join(' - ');
            }
            return folderKey === folder;
        });
        
        if (filtered.length === 0) {
            container.innerHTML = `
                <div style="
                    text-align: center;
                    padding: 60px 20px;
                    color: rgba(255,255,255,0.4);
                ">
                    <div style="font-size: 48px; margin-bottom: 16px;">🔍</div>
                    <p style="font-size: 16px; margin: 0;">Aucun composant dans ce dossier</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = filtered.map((item, index) => `
            <div class="component-card" draggable="false" data-index="${favoris.indexOf(item)}" data-folder="${folder}" style="position: relative; padding-right: 100px; word-wrap: break-word; overflow-wrap: break-word;">
                <!-- Poignée de drag à gauche -->
                <div class="drag-handle" draggable="true" style="
                    position: absolute;
                    top: 20px;
                    left: 20px;
                    width: 32px;
                    height: 32px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: rgba(255,255,255,0.05);
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 6px;
                    color: rgba(255,255,255,0.4);
                    font-size: 18px;
                    cursor: grab;
                    transition: all 0.2s;
                    z-index: 10;
                " title="Glisser pour réorganiser">⋮⋮</div>
                
                <!-- Boutons en position absolue à droite -->
                <div style="
                    position: absolute;
                    top: 20px;
                    right: 20px;
                    display: flex;
                    gap: 8px;
                    z-index: 10;
                ">
                    <button class="btn-edit" data-index="${favoris.indexOf(item)}" style="
                        background: rgba(255,193,7,0.2);
                        border: 1px solid rgba(255,193,7,0.4);
                        width: 36px;
                        height: 36px;
                        border-radius: 8px;
                        color: #ffc107;
                        font-size: 16px;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        transition: all 0.2s;
                        flex-shrink: 0;
                    ">✏️</button>
                    <button class="btn-delete" data-index="${favoris.indexOf(item)}" style="
                        background: rgba(244,67,54,0.2);
                        border: 1px solid rgba(244,67,54,0.4);
                        width: 36px;
                        height: 36px;
                        border-radius: 8px;
                        color: #f44336;
                        font-size: 18px;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        transition: all 0.2s;
                        flex-shrink: 0;
                    ">×</button>
                </div>
                
                <!-- Contenu de la carte -->
                <div style="margin-bottom: 12px; margin-left: 44px; max-width: calc(100% - 144px);">
                    <h4 style="
                        margin: 0 0 8px 0;
                        font-size: 18px;
                        font-weight: 600;
                        color: #ffffff;
                        word-wrap: break-word;
                        overflow-wrap: break-word;
                        white-space: normal;
                        line-height: 1.4;
                    ">${item.text}</h4>
                    
                    <!-- Ligne combinée Dossier et Repère -->
                    ${(item.symbole || item.designation || item.repere) ? `
                    <div style="margin-bottom: 12px;">
                        <!-- Ligne des libellés -->
                        <div style="display: flex; gap: 24px; margin-bottom: 6px;">
                            ${item.symbole || item.designation ? `
                            <div style="flex: 1; min-width: 200px;">
                                <div style="
                                    font-size: 11px;
                                    color: rgba(255,255,255,0.5);
                                    text-transform: uppercase;
                                    letter-spacing: 0.5px;
                                    font-weight: 600;
                                ">📁 Dossier</div>
                            </div>
                            ` : ''}
                            ${item.repere ? `
                            <div style="flex: 1; min-width: 200px;">
                                <div style="
                                    font-size: 11px;
                                    color: rgba(255,255,255,0.5);
                                    text-transform: uppercase;
                                    letter-spacing: 0.5px;
                                    font-weight: 600;
                                ">📍 Repère</div>
                            </div>
                            ` : ''}
                        </div>
                        
                        <!-- Ligne des badges -->
                        <div style="display: flex; gap: 24px; flex-wrap: wrap; align-items: flex-start;">
                            ${item.symbole || item.designation ? `
                            <div style="flex: 1; min-width: 200px;">
                                <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                                    ${item.symbole ? `<div style="
                                        display: inline-block;
                                        padding: 4px 10px;
                                        background: rgba(74,144,226,0.2);
                                        border: 1px solid rgba(74,144,226,0.4);
                                        border-radius: 6px;
                                        color: #4a90e2;
                                        font-size: 12px;
                                        font-weight: 600;
                                        word-wrap: break-word;
                                        overflow-wrap: break-word;
                                    ">${item.symbole}</div>` : ''}
                                    ${item.designation ? `<div style="
                                        display: inline-block;
                                        padding: 4px 10px;
                                        background: rgba(156,39,176,0.2);
                                        border: 1px solid rgba(156,39,176,0.4);
                                        border-radius: 6px;
                                        color: #9c27b0;
                                        font-size: 12px;
                                        font-weight: 600;
                                        word-wrap: break-word;
                                        overflow-wrap: break-word;
                                    ">${item.designation}</div>` : ''}
                                </div>
                            </div>
                            ` : ''}
                            ${item.repere ? `
                            <div style="flex: 1; min-width: 200px;">
                                <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                                    ${item.repere.split(',').map(r => `
                                        <span style="
                                            padding: 6px 12px;
                                            background: rgba(255,193,7,0.2);
                                            border: 1px solid rgba(255,193,7,0.4);
                                            border-radius: 20px;
                                            color: #ffc107;
                                            font-size: 12px;
                                            font-weight: 600;
                                        ">${r.trim()}</span>
                                    `).join('')}
                                </div>
                            </div>
                            ` : ''}
                        </div>
                    </div>
                    ` : ''}
                </div>
                ${item.designationComposant ? `
                    <div style="
                        padding: 12px;
                        background: rgba(255,255,255,0.03);
                        border-left: 3px solid #4a90e2;
                        border-radius: 6px;
                        margin-bottom: 12px;
                        margin-left: 44px;
                        word-wrap: break-word;
                        overflow-wrap: break-word;
                    ">
                        <div style="
                            font-size: 12px;
                            color: rgba(255,255,255,0.5);
                            margin-bottom: 4px;
                            text-transform: uppercase;
                            letter-spacing: 0.5px;
                        ">💬 Commentaire</div>
                        <div style="
                            color: rgba(255,255,255,0.8); 
                            font-size: 14px;
                            word-wrap: break-word;
                            overflow-wrap: break-word;
                            white-space: pre-wrap;
                        ">${item.designationComposant}</div>
                    </div>
                ` : ''}
            </div>
        `).join('');
        
        // Event listeners pour suppression
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const index = parseInt(btn.dataset.index);
                if (confirm('Supprimer ce favori ?')) {
                    deleteFavori(index);
                    displayComponents(folder, openModalFn);
                    updateFoldersList();
                }
            });
            
            btn.addEventListener('mouseenter', () => {
                btn.style.background = 'rgba(244,67,54,0.3)';
                btn.style.borderColor = 'rgba(244,67,54,0.6)';
            });
            
            btn.addEventListener('mouseleave', () => {
                btn.style.background = 'rgba(244,67,54,0.2)';
                btn.style.borderColor = 'rgba(244,67,54,0.4)';
            });
        });
        
        // Event listeners pour éditer les composants
        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const index = parseInt(btn.dataset.index);
                const favoris = loadFavoris();
                const item = favoris[index];
                
                console.log('✏️ Bouton Éditer cliqué');
                console.log('   Index:', index);
                console.log('   Item:', item);
                console.log('   openModalFn disponible:', !!openModalFn);
                
                if (item && openModalFn) {
                    console.log('✅ Ouverture de la modal pour édition');
                    openModalFn({
                        symbole: item.symbole,
                        designation: item.designation,
                        designationComposant: item.designationComposant,
                        repere: item.repere,
                        title: item.title
                    }, index);
                } else {
                    console.error('❌ Impossible d\'ouvrir la modal - item:', !!item, 'openModalFn:', !!openModalFn);
                }
            });
            
            btn.addEventListener('mouseenter', () => {
                btn.style.background = 'rgba(255,193,7,0.3)';
                btn.style.borderColor = 'rgba(255,193,7,0.6)';
            });
            
            btn.addEventListener('mouseleave', () => {
                btn.style.background = 'rgba(255,193,7,0.2)';
                btn.style.borderColor = 'rgba(255,193,7,0.4)';
            });
        });
        
        // Event listener pour clic sur carte
        document.querySelectorAll('.component-card').forEach(card => {
            card.addEventListener('click', () => {
                const index = parseInt(card.dataset.index);
                const item = favoris[index];
                
                // Construire le texte de recherche
                const searchText = item.text || [item.symbole, item.designation].filter(Boolean).join(' ');
                
                console.log('Clic sur composant:', searchText);
                searchInIframe(searchText);
                
                // Fermer la fenêtre principale
                const windowOverlay = document.querySelector('.window-overlay');
                if (windowOverlay) {
                    windowOverlay.style.display = 'none';
                }
            });
        });
        
        // ===== DRAG AND DROP pour les composants =====
        const componentCards = document.querySelectorAll('.component-card');
        
        componentCards.forEach(card => {
            const dragHandle = card.querySelector('.drag-handle');
            
            // Effet hover sur la poignée
            dragHandle.addEventListener('mouseenter', () => {
                dragHandle.style.background = 'rgba(255,255,255,0.1)';
                dragHandle.style.borderColor = 'rgba(255,255,255,0.2)';
                dragHandle.style.color = 'rgba(255,255,255,0.7)';
            });
            
            dragHandle.addEventListener('mouseleave', () => {
                dragHandle.style.background = 'rgba(255,255,255,0.05)';
                dragHandle.style.borderColor = 'rgba(255,255,255,0.1)';
                dragHandle.style.color = 'rgba(255,255,255,0.4)';
            });
            
            // Le drag commence depuis la poignée
            dragHandle.addEventListener('dragstart', (e) => {
                e.stopPropagation();
                draggedCard = card;
                card.classList.add('dragging');
                dragHandle.style.cursor = 'grabbing';
                
                // Créer un élément fantôme
                ghostElement = card.cloneNode(true);
                ghostElement.classList.add('drag-ghost');
                ghostElement.style.position = 'fixed';
                ghostElement.style.width = card.offsetWidth + 'px';
                ghostElement.style.left = '-9999px';
                document.body.appendChild(ghostElement);
                
                // Utiliser le clone comme image de drag
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setDragImage(ghostElement, e.offsetX, e.offsetY);
            });
            
            dragHandle.addEventListener('dragend', (e) => {
                e.stopPropagation();
                card.classList.remove('dragging');
                document.querySelectorAll('.component-card').forEach(c => {
                    c.classList.remove('drag-over');
                });
                dragHandle.style.cursor = 'grab';
                
                // Supprimer l'élément fantôme
                if (ghostElement && ghostElement.parentNode) {
                    ghostElement.parentNode.removeChild(ghostElement);
                }
                ghostElement = null;
                draggedCard = null;
            });
            
            // Les événements de drop sur la carte entière
            card.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                
                if (draggedCard && draggedCard !== card && 
                    draggedCard.dataset.folder === card.dataset.folder) {
                    card.classList.add('drag-over');
                }
            });
            
            card.addEventListener('dragleave', () => {
                card.classList.remove('drag-over');
            });
            
            card.addEventListener('drop', (e) => {
                e.preventDefault();
                e.stopPropagation();
                card.classList.remove('drag-over');
                
                if (draggedCard && draggedCard !== card && 
                    draggedCard.dataset.folder === card.dataset.folder) {
                    
                    const draggedIndex = parseInt(draggedCard.dataset.index);
                    const targetIndex = parseInt(card.dataset.index);
                    
                    // Réorganiser dans le tableau favoris
                    const favoris = loadFavoris();
                    const [movedItem] = favoris.splice(draggedIndex, 1);
                    
                    // Recalculer l'index cible après la suppression
                    let newTargetIndex = targetIndex;
                    if (draggedIndex < targetIndex) {
                        newTargetIndex--;
                    }
                    
                    favoris.splice(newTargetIndex + 1, 0, movedItem);
                    saveFavoris(favoris);
                    
                    // Rafraîchir l'affichage
                    displayComponents(folder, openModalFn);
                }
            });
        });
    }

    // ===== MISE À JOUR DE LA LISTE DES DOSSIERS =====
    function updateFoldersList() {
        const favoris = loadFavoris();
        const foldersList = document.getElementById('folders-list');
        
        // Récupérer les dossiers existants (y compris les vides)
        const existingFolders = GM_getValue('powerbi_folders', []);
        
        // Grouper par dossier
        const folders = {};
        
        // D'abord, initialiser tous les dossiers existants avec des tableaux vides
        existingFolders.forEach(folderKey => {
            folders[folderKey] = [];
        });
        
        // Ensuite, ajouter les composants dans leurs dossiers respectifs
        favoris.forEach(item => {
            // Si symbole et désignation sont vides, c'est "Sans PRM associé"
            let key;
            if (!item.symbole && !item.designation) {
                key = 'Sans PRM associé';
            } else {
                key = [item.symbole, item.designation].filter(Boolean).join(' - ');
            }
            
            if (!folders[key]) {
                folders[key] = [];
                // Ajouter ce nouveau dossier à la liste des dossiers existants
                if (!existingFolders.includes(key)) {
                    existingFolders.push(key);
                }
            }
            folders[key].push(item);
        });
        
        // Sauvegarder la liste des dossiers
        GM_setValue('powerbi_folders', existingFolders);
        
        // Mettre à jour le compteur "Tous"
        const allCount = document.querySelector('#btn-all-folders .count-badge');
        if (allCount) {
            allCount.textContent = favoris.length;
        }
        
        // Mettre à jour le compteur "Sans PRM associé"
        const sansPRMCount = document.querySelector('#btn-sans-prm .count-badge');
        if (sansPRMCount && folders['Sans PRM associé']) {
            sansPRMCount.textContent = folders['Sans PRM associé'].length;
        } else if (sansPRMCount) {
            sansPRMCount.textContent = '0';
        }
        
        // Afficher les dossiers
        if (Object.keys(folders).length === 0) {
            foldersList.innerHTML = `
                <div style="
                    text-align: center;
                    padding: 40px 20px;
                    color: rgba(255,255,255,0.3);
                ">
                    <p style="font-size: 14px; margin: 0;">Aucun dossier</p>
                </div>
            `;
        } else {
            // Ne pas afficher "Sans PRM associé" dans la liste dynamique (il est maintenant fixe en haut)
            const otherFolders = Object.entries(folders).filter(([key]) => key !== 'Sans PRM associé');
            
            // Charger l'ordre des dossiers
            const foldersOrder = loadFoldersOrder();
            
            // Trier les autres dossiers selon l'ordre sauvegardé
            otherFolders.sort((a, b) => {
                const indexA = foldersOrder.indexOf(a[0]);
                const indexB = foldersOrder.indexOf(b[0]);
                if (indexA === -1 && indexB === -1) return 0;
                if (indexA === -1) return 1;
                if (indexB === -1) return -1;
                return indexA - indexB;
            });
            
            let html = '';
            
            // Ajouter les dossiers (déplaçables)
            html += otherFolders.map(([key, items]) => `
                <div class="draggable-folder" draggable="false" data-folder-key="${key}" style="
                    display: flex; 
                    align-items: center; 
                    gap: 8px; 
                    margin-bottom: 8px;
                    border: 2px solid transparent;
                    padding: 2px;
                    transition: all 0.2s;
                ">
                    <div class="folder-drag-handle" draggable="true" style="
                        width: 28px;
                        height: 28px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        background: rgba(255,255,255,0.05);
                        border: 1px solid rgba(255,255,255,0.1);
                        border-radius: 6px;
                        color: rgba(255,255,255,0.4);
                        font-size: 14px;
                        cursor: grab;
                        transition: all 0.2s;
                        flex-shrink: 0;
                    " title="Glisser pour réorganiser">⋮⋮</div>
                    <button class="folder-btn" data-folder="${key}" style="
                        flex: 1;
                        margin-bottom: 0;
                        min-width: 0;
                    ">
                        <span style="
                            overflow: hidden;
                            text-overflow: ellipsis;
                            white-space: nowrap;
                            flex: 1;
                            min-width: 0;
                        ">${key}</span>
                        <span class="count-badge" style="
                            background: rgba(255,255,255,0.15);
                            padding: 4px 10px;
                            border-radius: 20px;
                            font-size: 12px;
                            font-weight: 700;
                            flex-shrink: 0;
                            margin-left: 8px;
                        ">${items.length}</span>
                    </button>
                    <button class="btn-rename-folder" data-folder="${key}" style="
                        background: rgba(255,193,7,0.2);
                        border: 1px solid rgba(255,193,7,0.4);
                        width: 36px;
                        height: 36px;
                        border-radius: 8px;
                        color: #ffc107;
                        font-size: 14px;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        transition: all 0.2s;
                        flex-shrink: 0;
                    " title="Renommer le dossier">✏️</button>
                    <button class="btn-delete-folder" data-folder="${key}" style="
                        background: rgba(244,67,54,0.2);
                        border: 1px solid rgba(244,67,54,0.4);
                        width: 36px;
                        height: 36px;
                        border-radius: 8px;
                        color: #f44336;
                        font-size: 16px;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        transition: all 0.2s;
                        flex-shrink: 0;
                    " title="Supprimer le dossier">🗑️</button>
                </div>
            `).join('');
            
            foldersList.innerHTML = html;
            
            // ===== DRAG AND DROP pour les dossiers =====
            const draggableFolders = document.querySelectorAll('.draggable-folder');
            let draggedFolder = null;
            let folderGhostElement = null;
            
            draggableFolders.forEach(folder => {
                const dragHandle = folder.querySelector('.folder-drag-handle');
                
                // Effet hover sur la poignée
                dragHandle.addEventListener('mouseenter', () => {
                    dragHandle.style.background = 'rgba(255,255,255,0.1)';
                    dragHandle.style.borderColor = 'rgba(255,255,255,0.2)';
                    dragHandle.style.color = 'rgba(255,255,255,0.7)';
                });
                
                dragHandle.addEventListener('mouseleave', () => {
                    dragHandle.style.background = 'rgba(255,255,255,0.05)';
                    dragHandle.style.borderColor = 'rgba(255,255,255,0.1)';
                    dragHandle.style.color = 'rgba(255,255,255,0.4)';
                });
                
                // Le drag commence depuis la poignée
                dragHandle.addEventListener('dragstart', (e) => {
                    e.stopPropagation();
                    draggedFolder = folder;
                    folder.classList.add('dragging');
                    dragHandle.style.cursor = 'grabbing';
                    
                    // Créer un élément fantôme
                    folderGhostElement = folder.cloneNode(true);
                    folderGhostElement.classList.add('drag-ghost');
                    folderGhostElement.style.position = 'fixed';
                    folderGhostElement.style.width = folder.offsetWidth + 'px';
                    folderGhostElement.style.left = '-9999px';
                    document.body.appendChild(folderGhostElement);
                    
                    e.dataTransfer.effectAllowed = 'move';
                    e.dataTransfer.setDragImage(folderGhostElement, e.offsetX, e.offsetY);
                });
                
                dragHandle.addEventListener('dragend', (e) => {
                    e.stopPropagation();
                    folder.classList.remove('dragging');
                    document.querySelectorAll('.draggable-folder').forEach(f => {
                        f.classList.remove('drag-over');
                    });
                    dragHandle.style.cursor = 'grab';
                    
                    // Supprimer l'élément fantôme
                    if (folderGhostElement && folderGhostElement.parentNode) {
                        folderGhostElement.parentNode.removeChild(folderGhostElement);
                    }
                    folderGhostElement = null;
                    draggedFolder = null;
                });
                
                // Les événements de drop sur le dossier entier
                folder.addEventListener('dragover', (e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'move';
                    
                    if (draggedFolder && draggedFolder !== folder) {
                        folder.classList.add('drag-over');
                    }
                });
                
                folder.addEventListener('dragleave', () => {
                    folder.classList.remove('drag-over');
                });
                
                folder.addEventListener('drop', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    folder.classList.remove('drag-over');
                    
                    if (draggedFolder && draggedFolder !== folder) {
                        // Réorganiser les dossiers
                        const allFolders = Array.from(document.querySelectorAll('.draggable-folder'));
                        const draggedIndex = allFolders.indexOf(draggedFolder);
                        const targetIndex = allFolders.indexOf(folder);
                        
                        if (draggedIndex < targetIndex) {
                            folder.parentNode.insertBefore(draggedFolder, folder.nextSibling);
                        } else {
                            folder.parentNode.insertBefore(draggedFolder, folder);
                        }
                        
                        // Sauvegarder le nouvel ordre
                        const newOrder = Array.from(document.querySelectorAll('.draggable-folder'))
                            .map(f => f.dataset.folderKey);
                        saveFoldersOrder(newOrder);
                    }
                });
            });
            
            // Event listeners pour les dossiers
            document.querySelectorAll('.folder-btn[data-folder]').forEach(btn => {
                const parentDiv = btn.closest('div[style*="display: flex"]');
                
                btn.addEventListener('click', () => {
                    document.querySelectorAll('.folder-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    displayComponents(btn.dataset.folder, window.openModalFunction);
                });
                
                // ===== DRAG AND DROP - Accepter les favoris =====
                if (parentDiv && btn.dataset.folder !== '__ALL__') {
                    parentDiv.addEventListener('dragover', (e) => {
                        // Vérifier si c'est un favori qui est en cours de drag
                        if (draggedCard) {
                            e.preventDefault();
                            e.stopPropagation();
                            e.dataTransfer.dropEffect = 'move';
                            parentDiv.style.background = 'rgba(74,144,226,0.2)';
                            parentDiv.style.borderColor = 'rgba(74,144,226,0.6)';
                        }
                    });
                    
                    parentDiv.addEventListener('dragleave', (e) => {
                        if (draggedCard) {
                            e.stopPropagation();
                            parentDiv.style.background = '';
                            parentDiv.style.borderColor = '';
                        }
                    });
                    
                    parentDiv.addEventListener('drop', (e) => {
                        if (draggedCard) {
                            e.preventDefault();
                            e.stopPropagation();
                            parentDiv.style.background = '';
                            parentDiv.style.borderColor = '';
                            
                            const targetFolder = btn.dataset.folder;
                            const draggedIndex = parseInt(draggedCard.dataset.index);
                            
                            // Déplacer le favori vers le nouveau dossier
                            const favoris = loadFavoris();
                            const item = favoris[draggedIndex];
                            
                            if (targetFolder === 'Sans PRM associé') {
                                // Mettre à vide pour "Sans PRM associé"
                                item.symbole = '';
                                item.designation = '';
                            } else {
                                // Extraire symbole et désignation du nom du dossier
                                const parts = targetFolder.split(' - ');
                                if (parts.length === 2) {
                                    item.symbole = parts[0];
                                    item.designation = parts[1];
                                } else if (parts.length === 1) {
                                    // Si un seul élément, le mettre dans symbole
                                    item.symbole = parts[0];
                                    item.designation = '';
                                }
                            }
                            
                            saveFavoris(favoris);
                            
                            // Rafraîchir l'affichage
                            updateFoldersList();
                            displayComponents(targetFolder, window.openModalFunction);
                            
                            // Activer le dossier cible
                            document.querySelectorAll('.folder-btn').forEach(b => b.classList.remove('active'));
                            btn.classList.add('active');
                        }
                    });
                }
            });
            
            // Event listeners pour renommer les dossiers
            document.querySelectorAll('.btn-rename-folder').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const oldKey = btn.dataset.folder;
                    const newName = prompt('Nouveau nom du dossier:', oldKey);
                    
                    if (newName && newName.trim() && newName !== oldKey) {
                        renameFolder(oldKey, newName.trim());
                    }
                });
                
                btn.addEventListener('mouseenter', () => {
                    btn.style.background = 'rgba(255,193,7,0.3)';
                    btn.style.borderColor = 'rgba(255,193,7,0.6)';
                });
                
                btn.addEventListener('mouseleave', () => {
                    btn.style.background = 'rgba(255,193,7,0.2)';
                    btn.style.borderColor = 'rgba(255,193,7,0.4)';
                });
            });
            
            // Event listeners pour supprimer les dossiers
            document.querySelectorAll('.btn-delete-folder').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const folderKey = btn.dataset.folder;
                    const count = folders[folderKey].length;
                    
                    if (confirm(`Supprimer le dossier "${folderKey}" et ses ${count} composant(s) ?`)) {
                        deleteFolder(folderKey);
                    }
                });
                
                btn.addEventListener('mouseenter', () => {
                    btn.style.background = 'rgba(244,67,54,0.3)';
                    btn.style.borderColor = 'rgba(244,67,54,0.6)';
                });
                
                btn.addEventListener('mouseleave', () => {
                    btn.style.background = 'rgba(244,67,54,0.2)';
                    btn.style.borderColor = 'rgba(244,67,54,0.4)';
                });
            });
            
        }
    }

    // ===== RECHERCHE DANS IFRAME =====
    function searchInIframe(text) {
        const iframes = document.querySelectorAll('iframe');
        console.log(`Tentative de remplissage avec: "${text}"`);
        
        let success = false;
        let responseReceived = false;
        
        const tryIframe = (index) => {
            if (index >= iframes.length || success) return;
            
            try {
                iframes[index].contentWindow.postMessage({
                    type: 'FILL_SEARCH',
                    text: text
                }, '*');
                console.log(`Message FILL_SEARCH envoyé à iframe ${index}`);
            } catch (e) {
                console.log(`Erreur iframe ${index}:`, e.message);
                tryIframe(index + 1);
            }
        };
        
        const messageHandler = (event) => {
            if (event.data && event.data.type === 'FILL_SEARCH_RESPONSE') {
                if (event.data.success && !responseReceived) {
                    console.log('✓ Recherche effectuée avec succès!');
                    responseReceived = true;
                    success = true;
                    window.removeEventListener('message', messageHandler);
                } else if (!responseReceived) {
                    console.log('Iframe ne peut pas remplir, essai suivant...');
                    const currentIndex = Array.from(iframes).findIndex(iframe => {
                        try {
                            return iframe.contentWindow === event.source;
                        } catch (e) {
                            return false;
                        }
                    });
                    if (currentIndex !== -1) {
                        tryIframe(currentIndex + 1);
                    }
                }
            }
        };
        
        window.addEventListener('message', messageHandler);
        tryIframe(0);
        
        setTimeout(() => {
            if (!responseReceived) {
                console.log('⚠️ Aucun iframe n\'a pu remplir le champ');
            }
            window.removeEventListener('message', messageHandler);
        }, 3000);
    }

    // ===== INITIALISATION =====
    function init() {
        console.log('🚀 Initialisation de l\'interface moderne');
        
        // Injecter les styles globaux
        injectGlobalStyles();
        
        // Créer les éléments
        const modal = createModal();
        const mainWindow = createMainWindow();
        const { addBtn, listBtn } = createActionButtons();
        
        // Ajouter au DOM
        document.body.appendChild(modal);
        document.body.appendChild(mainWindow);
        document.body.appendChild(addBtn);
        document.body.appendChild(listBtn);
        
        // Event listeners - Modal
        const overlay = modal.querySelector('.modal-overlay');
        const closeModal = modal.querySelector('.close-modal');
        const cancelBtn = modal.querySelector('.btn-cancel');
        const saveBtn = modal.querySelector('.btn-save');
        
        const openModal = (initialValues = {}, editIndex = null) => {
            console.log('🔍 openModal appelé avec:', initialValues);
            console.log('   - title:', initialValues.title);
            console.log('   - designation:', initialValues.designation);
            console.log('   - symbole:', initialValues.symbole);
            console.log('   - editIndex:', editIndex);
            
            overlay.style.display = 'flex';
            
            // Charger la liste des dossiers existants
            updateFoldersCheckboxes();
            
            // Afficher le nom du composant sélectionné si présent
            const selectedDisplay = document.getElementById('selected-component-display');
            const selectedName = document.getElementById('selected-component-name');
            
            console.log('📦 Élément d\'affichage trouvé:', selectedDisplay);
            console.log('📦 Élément nom trouvé:', selectedName);
            
            if (initialValues.title || initialValues.designation) {
                console.log('✅ Affichage du composant sélectionné:', initialValues.title || initialValues.designation);
                selectedDisplay.style.display = 'block';
                selectedName.textContent = initialValues.title || initialValues.designation;
            } else {
                console.log('❌ Pas de composant à afficher');
                selectedDisplay.style.display = 'none';
            }
            
            // Ne PAS pré-remplir les champs en mode édition
            // Les champs restent vides pour permettre la modification
            document.getElementById('input-symbole').value = '';
            document.getElementById('input-designation').value = '';
            document.getElementById('input-repere').value = initialValues.repere || '';
            document.getElementById('input-commentaire').value = initialValues.designationComposant || '';
            
            // Stocker l'index d'édition et le title sur le bouton de sauvegarde
            if (editIndex !== null) {
                saveBtn.dataset.editIndex = editIndex;
                document.getElementById('modal-title').textContent = '✏️ Modifier le Favori';
                document.getElementById('modal-subtitle').textContent = 'Modifier les informations du composant';
                
                // En mode édition, cocher le dossier actuel
                const currentFolder = [initialValues.symbole, initialValues.designation].filter(Boolean).join(' - ');
                if (currentFolder) {
                    setTimeout(() => {
                        const checkbox = document.querySelector(`#folder-${CSS.escape(currentFolder)}`);
                        if (checkbox) {
                            checkbox.checked = true;
                            checkbox.closest('.folder-checkbox-item').classList.add('checked');
                        }
                    }, 50);
                }
            } else {
                delete saveBtn.dataset.editIndex;
                document.getElementById('modal-title').textContent = '✨ Nouveau Favori';
                document.getElementById('modal-subtitle').textContent = 'Ajouter un composant à vos favoris';
            }
            
            // Stocker le title original (pour la recherche Power BI)
            if (initialValues.title) {
                saveBtn.dataset.title = initialValues.title;
            } else {
                delete saveBtn.dataset.title;
            }
            
            document.getElementById('input-repere').focus();
        };
        
        // Rendre openModal accessible globalement pour displayComponents
        window.openModalFunction = openModal;
        
        const closeModalFn = () => {
            overlay.style.display = 'none';
            // Clear inputs
            document.getElementById('input-symbole').value = '';
            document.getElementById('input-designation').value = '';
            document.getElementById('input-repere').value = '';
            document.getElementById('input-commentaire').value = '';
        };
        
        // Bouton Ajouter dossier dans la modal
        const addFolderBtn = modal.querySelector('#btn-add-folder');
        addFolderBtn.addEventListener('click', () => {
            const symbole = document.getElementById('input-symbole').value.trim();
            const designation = document.getElementById('input-designation').value.trim();
            
            if (!symbole && !designation) {
                alert('Veuillez remplir au moins le symbole ou la désignation');
                return;
            }
            
            // Validation : le symbole doit avoir exactement 8 chiffres si renseigné
            if (symbole && !/^\d{8}$/.test(symbole)) {
                alert('❌ Le symbole doit contenir exactement 8 chiffres !');
                return;
            }
            
            const newFolder = [symbole, designation].filter(Boolean).join(' - ');
            
            // Vérifier si le dossier existe déjà
            const existingFolders = GM_getValue('powerbi_folders', []);
            if (existingFolders.includes(newFolder)) {
                alert(`Le dossier "${newFolder}" existe déjà !`);
                return;
            }
            
            // Ajouter le dossier à la liste des dossiers
            existingFolders.push(newFolder);
            GM_setValue('powerbi_folders', existingFolders);
            
            // Recharger la liste des checkboxes
            updateFoldersCheckboxes();
            
            // Cocher le nouveau dossier
            setTimeout(() => {
                const checkbox = document.querySelector(`input[value="${newFolder}"]`);
                if (checkbox) {
                    checkbox.checked = true;
                    checkbox.closest('.folder-checkbox-item').classList.add('checked');
                }
            }, 100);
            
            // Clear les champs symbole et désignation
            document.getElementById('input-symbole').value = '';
            document.getElementById('input-designation').value = '';
            
            alert(`✓ Dossier "${newFolder}" créé !`);
        });
        
        addBtn.addEventListener('click', () => {
            // Récupérer l'élément sélectionné dans Power BI
            const selectedItem = getSelectedItem();
            
            console.log('🎯 Bouton Ajouter cliqué');
            console.log('   Élément sélectionné:', selectedItem);
            
            if (selectedItem) {
                console.log('✅ Composant Power BI trouvé:', selectedItem.text);
                // Pré-remplir UNIQUEMENT le title pour affichage, PAS la désignation
                openModal({ title: selectedItem.title });
            } else {
                console.log('⚠️ Aucun composant Power BI sélectionné');
                // Ouvrir vide si rien n'est sélectionné
                openModal();
            }
        });
        closeModal.addEventListener('click', closeModalFn);
        cancelBtn.addEventListener('click', closeModalFn);
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeModalFn();
        });
        
        saveBtn.addEventListener('click', () => {
            const symbole = document.getElementById('input-symbole').value.trim();
            const designation = document.getElementById('input-designation').value.trim();
            const repere = document.getElementById('input-repere').value.trim();
            const commentaire = document.getElementById('input-commentaire').value.trim();
            
            // Validation : le symbole doit avoir exactement 8 chiffres si renseigné
            if (symbole && !/^\d{8}$/.test(symbole)) {
                alert('❌ Le symbole doit contenir exactement 8 chiffres !');
                return;
            }
            
            // Récupérer les dossiers sélectionnés
            const selectedFolders = [];
            document.querySelectorAll('#folders-checkboxes input[type="checkbox"]:checked').forEach(checkbox => {
                selectedFolders.push(checkbox.value);
            });
            
            // Ajouter le nouveau dossier si symbole ou désignation est rempli
            if (symbole || designation) {
                const newFolder = [symbole, designation].filter(Boolean).join(' - ');
                if (!selectedFolders.includes(newFolder)) {
                    selectedFolders.push(newFolder);
                }
            }
            
            // Si aucun dossier sélectionné, utiliser "Sans PRM associé"
            if (selectedFolders.length === 0) {
                selectedFolders.push('Sans PRM associé');
            }
            
            // Mode édition ou ajout
            if (saveBtn.dataset.editIndex !== undefined) {
                // Mode édition - mettre à jour l'élément existant
                const favoris = loadFavoris();
                const index = parseInt(saveBtn.dataset.editIndex);
                const folder = selectedFolders[0]; // En mode édition, on prend le premier dossier
                const [folderSymbole, folderDesignation] = folder === 'Sans PRM associé' ? ['', ''] : 
                    (folder.includes(' - ') ? folder.split(' - ') : [folder, '']);
                
                // Le text doit TOUJOURS être le nom du composant Power BI (title)
                // Ne jamais utiliser le nom du dossier pour le text
                const text = saveBtn.dataset.title || favoris[index].text || 'Sans nom';
                
                favoris[index] = {
                    ...favoris[index],
                    text: text,
                    title: saveBtn.dataset.title || favoris[index].title || text,
                    symbole: folderSymbole,
                    designation: folderDesignation,
                    designationComposant: commentaire,
                    repere,
                    timestamp: Date.now()
                };
                saveFavoris(favoris);
                
                // Ajouter le dossier à la liste s'il n'existe pas
                const existingFolders = GM_getValue('powerbi_folders', []);
                if (!existingFolders.includes(folder)) {
                    existingFolders.push(folder);
                    GM_setValue('powerbi_folders', existingFolders);
                }
            } else {
                // Mode ajout - créer un favori pour chaque dossier sélectionné
                const existingFolders = GM_getValue('powerbi_folders', []);
                const favoris = loadFavoris();
                
                // Vérifier si le composant existe déjà dans un des dossiers sélectionnés
                const componentTitle = saveBtn.dataset.title;
                const duplicatesInFolders = [];
                const foldersToAdd = [];
                
                selectedFolders.forEach(folder => {
                    const [folderSymbole, folderDesignation] = folder === 'Sans PRM associé' ? ['', ''] : 
                        (folder.includes(' - ') ? folder.split(' - ') : [folder, '']);
                    
                    // Chercher si ce composant existe déjà dans ce dossier
                    const exists = favoris.some(f => 
                        (f.title === componentTitle || f.text === componentTitle) &&
                        f.symbole === folderSymbole &&
                        f.designation === folderDesignation
                    );
                    
                    if (exists) {
                        duplicatesInFolders.push(folder);
                    } else {
                        foldersToAdd.push(folder);
                    }
                });
                
                // Si des doublons existent, afficher un pop-up d'information
                if (duplicatesInFolders.length > 0) {
                    const folderList = duplicatesInFolders.join('\n• ');
                    const message = foldersToAdd.length > 0
                        ? `ℹ️ Ce composant existe déjà dans le(s) dossier(s) suivant(s) :\n\n• ${folderList}\n\nIl sera ajouté uniquement dans les autres dossiers sélectionnés.`
                        : `⚠️ Ce composant existe déjà dans tous les dossiers sélectionnés :\n\n• ${folderList}\n\nAucun ajout effectué.`;
                    alert(message);
                    
                    // Si tous les dossiers contiennent déjà le composant, arrêter
                    if (foldersToAdd.length === 0) {
                        return;
                    }
                }
                
                // Ajouter uniquement dans les dossiers où le composant n'existe pas
                foldersToAdd.forEach(folder => {
                    const [folderSymbole, folderDesignation] = folder === 'Sans PRM associé' ? ['', ''] : 
                        (folder.includes(' - ') ? folder.split(' - ') : [folder, '']);
                    
                    // Le text doit TOUJOURS être le nom du composant Power BI (title)
                    // Ne jamais utiliser le nom du dossier pour le text
                    const displayText = saveBtn.dataset.title || 'Sans nom';
                    
                    const favoriData = {
                        text: displayText,
                        title: saveBtn.dataset.title || displayText,
                        symbole: folderSymbole,
                        designation: folderDesignation,
                        designationComposant: commentaire,
                        repere
                    };
                    
                    addFavori(favoriData);
                    
                    // Ajouter le dossier à la liste s'il n'existe pas
                    if (!existingFolders.includes(folder)) {
                        existingFolders.push(folder);
                    }
                });
                
                GM_setValue('powerbi_folders', existingFolders);
            }
            
            closeModalFn();
            updateFoldersList();
            
            // Si la fenêtre est ouverte, rafraîchir
            const windowOverlay = mainWindow.querySelector('.window-overlay');
            if (windowOverlay.style.display === 'flex') {
                displayComponents('__ALL__', openModal);
                document.getElementById('btn-all-folders').classList.add('active');
                document.querySelectorAll('.folder-btn[data-folder]').forEach(b => b.classList.remove('active'));
            }
        });
        
        // Event listeners - Main Window
        const windowOverlay = mainWindow.querySelector('.window-overlay');
        const closeWindow = mainWindow.querySelector('.close-window');
        
        const openWindow = () => {
            windowOverlay.style.display = 'flex';
            updateFoldersList();
            displayComponents('__ALL__', window.openModalFunction);
            document.getElementById('btn-all-folders').classList.add('active');
        };
        
        const closeWindowFn = () => {
            windowOverlay.style.display = 'none';
        };
        
        listBtn.addEventListener('click', openWindow);
        closeWindow.addEventListener('click', closeWindowFn);
        windowOverlay.addEventListener('click', (e) => {
            if (e.target === windowOverlay) closeWindowFn();
        });
        
        // Bouton "Tous les composants"
        document.getElementById('btn-all-folders').addEventListener('click', () => {
            document.querySelectorAll('.folder-btn').forEach(b => b.classList.remove('active'));
            document.getElementById('btn-all-folders').classList.add('active');
            displayComponents('__ALL__', window.openModalFunction);
        });
        
        // Bouton "Sans PRM associé"
        const btnSansPRM = document.getElementById('btn-sans-prm');
        btnSansPRM.addEventListener('click', () => {
            document.querySelectorAll('.folder-btn').forEach(b => b.classList.remove('active'));
            btnSansPRM.classList.add('active');
            displayComponents('Sans PRM associé', window.openModalFunction);
        });
        
        // Drag and drop pour "Sans PRM associé"
        btnSansPRM.addEventListener('dragover', (e) => {
            if (draggedCard) {
                e.preventDefault();
                e.stopPropagation();
                e.dataTransfer.dropEffect = 'move';
                btnSansPRM.style.background = 'rgba(244,67,54,0.4)';
                btnSansPRM.style.borderColor = 'rgba(244,67,54,0.8)';
            }
        });
        
        btnSansPRM.addEventListener('dragleave', (e) => {
            if (draggedCard) {
                e.stopPropagation();
                btnSansPRM.style.background = 'rgba(244,67,54,0.2)';
                btnSansPRM.style.borderColor = 'rgba(244,67,54,0.4)';
            }
        });
        
        btnSansPRM.addEventListener('drop', (e) => {
            if (draggedCard) {
                e.preventDefault();
                e.stopPropagation();
                btnSansPRM.style.background = 'rgba(244,67,54,0.2)';
                btnSansPRM.style.borderColor = 'rgba(244,67,54,0.4)';
                
                const draggedIndex = parseInt(draggedCard.dataset.index);
                
                // Déplacer le favori vers "Sans PRM associé"
                const favoris = loadFavoris();
                const item = favoris[draggedIndex];
                
                // Mettre à vide pour "Sans PRM associé"
                item.symbole = '';
                item.designation = '';
                
                saveFavoris(favoris);
                
                // Rafraîchir l'affichage
                updateFoldersList();
                displayComponents('Sans PRM associé', window.openModalFunction);
                
                // Activer le dossier cible
                document.querySelectorAll('.folder-btn').forEach(b => b.classList.remove('active'));
                btnSansPRM.classList.add('active');
            }
        });
        
        // Recherche
        document.getElementById('search-input').addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            const cards = document.querySelectorAll('.component-card');
            
            cards.forEach(card => {
                const text = card.textContent.toLowerCase();
                card.style.display = text.includes(query) ? 'block' : 'none';
            });
        });
        
        console.log('✅ Interface moderne initialisée avec succès');
    }

    // Attendre que le DOM soit prêt
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
