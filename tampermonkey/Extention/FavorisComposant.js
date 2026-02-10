// ==UserScript==
// @name         Power BI Favoris
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Système de favoris pour Power BI
// @match        https://app.powerbi.com/groups/me/apps/ab9bbd67-d4d2-48c1-8869-22d78efe9963/reports/*
// @match        https://app.powerbi.com/*/cvSandboxPack.cshtml*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        unsafeWindow
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    // Vérifier si on est dans l'iframe ou dans la page principale
    const isInIframe = window.self !== window.top;
    const isMainPage = !isInIframe;

    console.log('Script exécuté dans:', isInIframe ? 'IFRAME' : 'PAGE PRINCIPALE');

    // Si on est dans une iframe, attendre et exposer la fonction pour remplir l'input
    if (isInIframe) {
        console.log('Mode IFRAME activé');

        // Fonction pour remplir l'input dans l'iframe
        window.fillSearchInput = function(text) {
            const searchInput = document.querySelector('input[name="search-field"]') ||
                               document.querySelector('input.accessibility-compliant') ||
                               document.querySelector('input[placeholder="Search"]');

            if (searchInput) {
                console.log('✓ Input trouvé dans iframe!', text);
                searchInput.value = text;
                searchInput.focus();

                // Déclencher les événements
                const events = ['input', 'change', 'keyup', 'keydown'];
                events.forEach(eventType => {
                    const event = new Event(eventType, { bubbles: true, cancelable: true });
                    searchInput.dispatchEvent(event);
                });

                // Trouver et cliquer sur le bouton de recherche
                setTimeout(() => {
                    const searchButton = document.querySelector('button[name="search-button"]') ||
                                        document.querySelector('button.search-button') ||
                                        document.querySelector('.c-glyph.search-button');

                    if (searchButton) {
                        console.log('✓ Bouton de recherche trouvé, clic...');
                        searchButton.click();
                    } else {
                        console.log('⚠️ Bouton de recherche non trouvé');
                    }
                }, 100);

                return true;
            }
            return false;
        };

        // Fonction pour cliquer sur le bouton AppMagic dans l'iframe
        window.clickAppMagicButton = function() {
            const appmagicButton = document.querySelector('div.appmagic-button.middle.center') ||
                                   document.querySelector('div.appmagic-button') ||
                                   document.querySelector('div[data-bind*="appmagic-button"]');

            if (appmagicButton) {
                console.log('✓ Bouton AppMagic trouvé dans cette iframe, clic...');
                appmagicButton.click();
                return true;
            } else {
                const textDiv = document.querySelector('[data-control-part="text"]');
                if (textDiv && textDiv.parentElement && textDiv.parentElement.classList.contains('appmagic-button-label')) {
                    const button = textDiv.parentElement.parentElement;
                    if (button.classList.contains('appmagic-button')) {
                        console.log('✓ Bouton AppMagic trouvé via data-control-part dans cette iframe, clic...');
                        button.click();
                        return true;
                    }
                }
            }
            return false;
        };

        // Écouter les messages de la page principale
        window.addEventListener('message', function(event) {
            if (event.data && event.data.type === 'FILL_SEARCH') {
                const success = window.fillSearchInput(event.data.text);
                event.source.postMessage({
                    type: 'FILL_SEARCH_RESPONSE',
                    success: success
                }, event.origin);
            } else if (event.data && event.data.type === 'CLICK_APPMAGIC') {
                const success = window.clickAppMagicButton();
                event.source.postMessage({
                    type: 'CLICK_APPMAGIC_RESPONSE',
                    success: success
                }, event.origin);
            }
        });

        console.log('Iframe prête à recevoir des messages');
        return;
    }

    // === CODE POUR LA PAGE PRINCIPALE === //

    // Fonction pour créer la fenêtre modale de saisie
    function createInputModal() {
        const modal = document.createElement('div');
        modal.id = 'input-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: none;
            justify-content: center;
            align-items: center;
            z-index: 10002;
        `;

        modal.innerHTML = `
            <div style="
                background: white;
                padding: 20px;
                border-radius: 10px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.3);
                width: 600px;
                font-family: 'Segoe UI', sans-serif;
                display: flex;
                gap: 20px;
            ">
                <div style="flex: 1;">
                    <h3 style="margin: 0 0 20px 0; color: #2771c2; font-size: 18px;">⭐ Ajouter aux favoris</h3>

                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #333;">Numéro de Symbole: <span style="color: red;">*</span></label>
                        <input type="text" id="modal-symbole" style="
                            width: 100%;
                            padding: 8px 12px;
                            border: 1px solid #ddd;
                            border-radius: 5px;
                            font-size: 14px;
                            box-sizing: border-box;
                        " placeholder="Ex: SY123">
                    </div>

                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #333;">Désignation: <span style="color: #999; font-weight: normal;">(optionnel)</span></label>
                        <input type="text" id="modal-designation" style="
                            width: 100%;
                            padding: 8px 12px;
                            border: 1px solid #ddd;
                            border-radius: 5px;
                            font-size: 14px;
                            box-sizing: border-box;
                        " placeholder="Ex: Résistance 10kΩ">
                    </div>

                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #333;">Repère de composant: <span style="color: #999; font-weight: normal;">(optionnel)</span></label>
                        <input type="text" id="modal-repere" style="
                            width: 100%;
                            padding: 8px 12px;
                            border: 1px solid #ddd;
                            border-radius: 5px;
                            font-size: 14px;
                            box-sizing: border-box;
                        " placeholder="Ex: R1, C2, U3...">
                    </div>

                    <div style="display: flex; gap: 10px; justify-content: flex-end;">
                        <button id="modal-cancel" style="
                            padding: 10px 20px;
                            background: #6c757d;
                            color: white;
                            border: none;
                            border-radius: 5px;
                            cursor: pointer;
                            font-size: 14px;
                            font-weight: bold;
                        ">Annuler</button>
                        <button id="modal-confirm" style="
                            padding: 10px 20px;
                            background: #2771c2;
                            color: white;
                            border: none;
                            border-radius: 5px;
                            cursor: pointer;
                            font-size: 14px;
                            font-weight: bold;
                        ">Ajouter</button>
                    </div>
                </div>

                <div style="
                    width: 200px;
                    border-left: 1px solid #ddd;
                    padding-left: 20px;
                ">
                    <h4 style="margin: 0 0 10px 0; color: #333; font-size: 14px;">📋 Symboles existants</h4>
                    <div id="symbole-list" style="
                        max-height: 300px;
                        overflow-y: auto;
                        background: #f8f9fa;
                        border-radius: 5px;
                        padding: 5px;
                    ">
                        <p style="color: #999; font-size: 12px; padding: 10px; text-align: center;">Aucun symbole</p>
                    </div>
                </div>
            </div>
        `;

        return modal;
    }

    // Fonction pour afficher la modale et récupérer les valeurs
    function showInputModal() {
        return new Promise((resolve) => {
            const modal = document.getElementById('input-modal');
            const symboleInput = document.getElementById('modal-symbole');
            const designationInput = document.getElementById('modal-designation');
            const repereInput = document.getElementById('modal-repere');
            const confirmBtn = document.getElementById('modal-confirm');
            const cancelBtn = document.getElementById('modal-cancel');
            const symboleListDiv = document.getElementById('symbole-list');

            symboleInput.value = '';
            designationInput.value = '';
            repereInput.value = '';

            const favoris = GM_getValue('powerbi_favoris', []);
            const symboles = [...new Set(favoris.map(fav => fav.symbole).filter(s => s))];

            if (symboles.length > 0) {
                symboleListDiv.innerHTML = symboles.sort().map(symbole => `
                    <div class="symbole-item" data-symbole="${symbole}" style="
                        padding: 8px 10px;
                        margin: 3px 0;
                        background: white;
                        border: 1px solid #ddd;
                        border-radius: 4px;
                        cursor: pointer;
                        font-size: 13px;
                        transition: all 0.2s;
                    ">${symbole}</div>
                `).join('');

                document.querySelectorAll('.symbole-item').forEach(item => {
                    item.addEventListener('mouseenter', () => {
                        item.style.background = '#e3f2fd';
                        item.style.borderColor = '#2771c2';
                    });
                    item.addEventListener('mouseleave', () => {
                        item.style.background = 'white';
                        item.style.borderColor = '#ddd';
                    });
                    item.addEventListener('click', () => {
                        symboleInput.value = item.getAttribute('data-symbole');
                        symboleInput.focus();
                    });
                });
            }

            modal.style.display = 'flex';
            symboleInput.focus();

            const handleConfirm = () => {
                const symbole = symboleInput.value.trim();
                const designation = designationInput.value.trim();
                const repere = repereInput.value.trim();

                if (symbole === '') {
                    alert('Le numéro de symbole ne peut pas être vide');
                    return;
                }

                modal.style.display = 'none';
                cleanup();
                resolve({ symbole, designation, repere });
            };

            const handleCancel = () => {
                modal.style.display = 'none';
                cleanup();
                resolve(null);
            };

            const handleKeyPress = (e) => {
                if (e.key === 'Enter') {
                    handleConfirm();
                } else if (e.key === 'Escape') {
                    handleCancel();
                }
            };

            const cleanup = () => {
                confirmBtn.removeEventListener('click', handleConfirm);
                cancelBtn.removeEventListener('click', handleCancel);
                symboleInput.removeEventListener('keypress', handleKeyPress);
                designationInput.removeEventListener('keypress', handleKeyPress);
                repereInput.removeEventListener('keypress', handleKeyPress);
            };

            confirmBtn.addEventListener('click', handleConfirm);
            cancelBtn.addEventListener('click', handleCancel);
            symboleInput.addEventListener('keypress', handleKeyPress);
            designationInput.addEventListener('keypress', handleKeyPress);
            repereInput.addEventListener('keypress', handleKeyPress);
        });
    }

    // Fonction pour créer la fenêtre de favoris
    function createFavorisWindow() {
        const favorisDiv = document.createElement('div');
        favorisDiv.id = 'favoris-window';
        favorisDiv.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: none;
            justify-content: center;
            align-items: center;
            z-index: 10000;
        `;

        favorisDiv.innerHTML = `
            <div style="
                background: white;
                width: 90%;
                max-width: 1400px;
                height: 90%;
                border-radius: 15px;
                box-shadow: 0 8px 32px rgba(0,0,0,0.3);
                display: flex;
                flex-direction: column;
                font-family: 'Segoe UI', sans-serif;
            ">
                <div style="background: #2771c2; color: white; padding: 20px; border-radius: 15px 15px 0 0; display: flex; justify-content: space-between; align-items: center;">
                    <h2 style="margin: 0; font-size: 24px;">📌 Mes Favoris</h2>
                    <button id="close-favoris" style="background: none; border: none; color: white; font-size: 32px; cursor: pointer; padding: 0; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border-radius: 5px; transition: background 0.2s;">×</button>
                </div>

                <div style="display: flex; flex: 1; overflow: hidden;">
                    <div style="width: 300px; border-right: 2px solid #e0e0e0; display: flex; flex-direction: column; background: #f8f9fa;">
                        <div style="padding: 15px; border-bottom: 1px solid #ddd;">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                                <h3 style="margin: 0; font-size: 16px; color: #333;">📁 Dossiers</h3>
                                <button id="create-folder-btn" style="
                                    background: #28a745;
                                    color: white;
                                    border: none;
                                    width: 32px;
                                    height: 32px;
                                    border-radius: 50%;
                                    cursor: pointer;
                                    font-size: 20px;
                                    font-weight: bold;
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                    transition: all 0.2s;
                                    line-height: 1;
                                    padding: 0;
                                " title="Créer un nouveau dossier">+</button>
                            </div>
                            <input type="text" id="search-folders" placeholder="🔍 Rechercher..." style="
                                width: 100%;
                                padding: 10px 12px;
                                border: 2px solid #ddd;
                                border-radius: 6px;
                                font-size: 14px;
                                outline: none;
                                box-sizing: border-box;
                                transition: border-color 0.2s;
                            ">
                        </div>
                        <div id="folders-list" style="flex: 1; overflow-y: auto; padding: 10px;">
                            <p style="color: #999; font-style: italic; text-align: center; padding: 20px;">Aucun dossier</p>
                        </div>
                    </div>

                    <div style="flex: 1; display: flex; flex-direction: column;">
                        <div style="padding: 15px; border-bottom: 1px solid #ddd;">
                            <h3 style="margin: 0 0 10px 0; font-size: 16px; color: #333;">📂 Dossier<span id="current-folder-name" style="color: #2771c2; font-weight: normal;"></span></h3>
                            <input type="text" id="search-components" placeholder="🔍 Rechercher un composant..." style="
                                width: 100%;
                                padding: 10px 12px;
                                border: 2px solid #ddd;
                                border-radius: 6px;
                                font-size: 14px;
                                outline: none;
                                box-sizing: border-box;
                                transition: border-color 0.2s;
                            ">
                        </div>
                        <div id="components-list" style="flex: 1; overflow-y: auto; padding: 20px;">
                            <p style="color: #999; font-style: italic; text-align: center; padding: 50px 20px;">
                                Sélectionnez un dossier à gauche pour voir ses composants
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        `;

        return favorisDiv;
    }

    function createShowListButton() {
        const button = document.createElement('button');
        button.id = 'show-favoris-list';
        button.innerHTML = '📋 Liste Favoris';
        button.style.cssText = `
            position: fixed;
            top: 60px;
            right: 20px;
            background: #28a745;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 8px;
            cursor: pointer;
            font-weight: bold;
            font-size: 14px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            z-index: 10001;
            transition: background 0.3s;
        `;

        button.addEventListener('mouseenter', () => {
            button.style.background = '#218838';
        });
        button.addEventListener('mouseleave', () => {
            button.style.background = '#28a745';
        });

        return button;
    }

    function createAddButton() {
        const button = document.createElement('button');
        button.id = 'add-to-favoris';
        button.innerHTML = '⭐';
        button.title = 'Ajouter aux favoris';
        button.style.cssText = `
            position: fixed;
            top: 15px;
            right: 20px;
            background: #2771c2;
            color: white;
            border: none;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            cursor: pointer;
            font-size: 20px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            z-index: 10001;
            transition: all 0.3s;
            display: flex;
            align-items: center;
            justify-content: center;
        `;

        button.addEventListener('mouseenter', () => {
            button.style.background = '#1a5a9a';
            button.style.transform = 'scale(1.1)';
        });
        button.addEventListener('mouseleave', () => {
            button.style.background = '#2771c2';
            button.style.transform = 'scale(1)';
        });

        return button;
    }

    function createNewFolder() {
        const folderName = prompt('Entrez le nom du nouveau dossier (symbole) :');

        if (!folderName || folderName.trim() === '') {
            return;
        }

        const trimmedName = folderName.trim();
        const favoris = GM_getValue('powerbi_favoris', []);
        const exists = favoris.some(fav => fav.symbole === trimmedName);

        if (exists) {
            alert(`Le dossier "${trimmedName}" existe déjà.`);
            return;
        }

        const emptyFolder = {
            title: `__EMPTY_FOLDER_${trimmedName}__`,
            text: '',
            symbole: trimmedName,
            designation: '',
            repere: '',
            isEmpty: true
        };

        favoris.push(emptyFolder);
        GM_setValue('powerbi_favoris', favoris);
        updateFavorisList();

        alert(`✓ Dossier "${trimmedName}" créé avec succès !`);
    }

    function getSelectedItem() {
        const selectedDiv = document.querySelector('.slicerItemContainer[aria-checked="true"]');
        if (!selectedDiv) return null;

        const title = selectedDiv.getAttribute('title');
        const slicerText = selectedDiv.querySelector('.slicerText');
        const textContent = slicerText ? slicerText.textContent : title;

        return {
            title: title,
            text: textContent
        };
    }

    async function addToFavoris() {
        const selectedItem = getSelectedItem();
        if (!selectedItem) {
            alert('Aucun élément sélectionné');
            return;
        }

        const result = await showInputModal();

        if (!result) {
            return;
        }

        const { symbole, designation, repere } = result;
        let favoris = GM_getValue('powerbi_favoris', []);

        const exists = favoris.some(fav => fav.title === selectedItem.title && fav.symbole === symbole && fav.repere === repere);
        if (exists) {
            alert('Cet élément existe déjà dans ce symbole avec ce repère');
            return;
        }

        selectedItem.symbole = symbole;
        selectedItem.designation = designation;
        selectedItem.repere = repere;
        favoris.push(selectedItem);
        GM_setValue('powerbi_favoris', favoris);
        updateFavorisList();
        alert('✓ Ajouté aux favoris !');
    }

    function removeFavori(index) {
        let favoris = GM_getValue('powerbi_favoris', []);
        const removedItem = favoris[index];
        favoris.splice(index, 1);

        // Vérifier si c'était le dernier composant réel du symbole
        const symbole = removedItem.symbole;
        const hasOtherItems = favoris.some(fav => fav.symbole === symbole && !fav.isEmpty);

        // Si plus de composants réels dans ce symbole, créer un marqueur de dossier vide
        if (!hasOtherItems && !removedItem.isEmpty) {
            const emptyFolder = {
                title: `__EMPTY_FOLDER_${symbole}__`,
                text: '',
                symbole: symbole,
                designation: '',
                repere: '',
                isEmpty: true
            };
            favoris.push(emptyFolder);
        }

        GM_setValue('powerbi_favoris', favoris);
        updateFavorisList();
    }

    function renameFolder(oldSymbole) {
        const newSymbole = prompt(`Renommer le dossier "${oldSymbole}" :`, oldSymbole);

        if (!newSymbole || newSymbole.trim() === '' || newSymbole.trim() === oldSymbole) {
            return;
        }

        const trimmedName = newSymbole.trim();
        let favoris = GM_getValue('powerbi_favoris', []);

        // Vérifier si le nouveau nom existe déjà
        const exists = favoris.some(fav => fav.symbole === trimmedName && fav.symbole !== oldSymbole);
        if (exists) {
            alert(`Le dossier "${trimmedName}" existe déjà.`);
            return;
        }

        // Renommer tous les éléments de ce symbole
        favoris.forEach(fav => {
            if (fav.symbole === oldSymbole) {
                fav.symbole = trimmedName;
                if (fav.isEmpty) {
                    fav.title = `__EMPTY_FOLDER_${trimmedName}__`;
                }
            }
        });

        GM_setValue('powerbi_favoris', favoris);
        updateFavorisList();

        // Afficher le dossier renommé
        setTimeout(() => {
            const folderItem = document.querySelector(`.folder-item[data-symbole="${trimmedName}"]`);
            if (folderItem) {
                folderItem.click();
            }
        }, 100);

        alert(`✓ Dossier renommé en "${trimmedName}" !`);
    }

    function deleteFolder(symbole) {
        let favoris = GM_getValue('powerbi_favoris', []);
        const itemsInFolder = favoris.filter(fav => fav.symbole === symbole);
        const realItemsCount = itemsInFolder.filter(fav => !fav.isEmpty).length;

        let confirmMessage = `Êtes-vous sûr de vouloir supprimer le dossier "${symbole}"`;
        if (realItemsCount > 0) {
            confirmMessage += ` et ses ${realItemsCount} composant${realItemsCount > 1 ? 's' : ''}`;
        }
        confirmMessage += ' ?';

        if (!confirm(confirmMessage)) {
            return;
        }

        // Supprimer tous les éléments de ce symbole
        favoris = favoris.filter(fav => fav.symbole !== symbole);

        GM_setValue('powerbi_favoris', favoris);
        updateFavorisList();
        alert(`✓ Dossier "${symbole}" supprimé !`);
    }

    function updateFavorisList() {
        const foldersListDiv = document.getElementById('folders-list');
        const componentsListDiv = document.getElementById('components-list');

        if (!foldersListDiv || !componentsListDiv) return;

        const favoris = GM_getValue('powerbi_favoris', []);

        if (favoris.length === 0) {
            foldersListDiv.innerHTML = '<p style="color: #999; font-style: italic; text-align: center; padding: 20px;">Aucun dossier</p>';
            componentsListDiv.innerHTML = '<p style="color: #999; font-style: italic; text-align: center; padding: 50px 20px;">Aucun favori pour le moment</p>';
            return;
        }

        const groupedBySymbole = {};
        favoris.forEach((fav, index) => {
            const symbole = fav.symbole || 'Sans symbole';
            if (!groupedBySymbole[symbole]) {
                groupedBySymbole[symbole] = [];
            }
            groupedBySymbole[symbole].push({ ...fav, originalIndex: index });
        });

        let selectedFolder = null;

        function setupComponentEvents() {
            document.querySelectorAll('.remove-fav').forEach(btn => {
                btn.addEventListener('mouseenter', () => {
                    btn.style.background = '#c82333';
                    btn.style.transform = 'scale(1.1)';
                });
                btn.addEventListener('mouseleave', () => {
                    btn.style.background = '#dc3545';
                    btn.style.transform = 'scale(1)';
                });
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const index = parseInt(e.target.getAttribute('data-index'));
                    if (confirm('Êtes-vous sûr de vouloir supprimer ce favori ?')) {
                        removeFavori(index);
                    }
                });
            });

            let draggedElement = null;
            let draggedIndex = null;

            document.querySelectorAll('.component-item').forEach(item => {
                const dragHandle = item.querySelector('.drag-handle');

                if (dragHandle) {
                    dragHandle.addEventListener('mousedown', () => {
                        item.setAttribute('draggable', 'true');
                    });
                }

                item.addEventListener('dragstart', (e) => {
                    draggedElement = item;
                    draggedIndex = parseInt(item.getAttribute('data-index'));
                    item.style.opacity = '0.5';
                    e.dataTransfer.effectAllowed = 'move';
                });

                item.addEventListener('dragend', () => {
                    item.style.opacity = '1';
                    item.setAttribute('draggable', 'false');
                    document.querySelectorAll('.folder-item').forEach(folder => {
                        const folderSymbole = folder.getAttribute('data-symbole');
                        if (folderSymbole !== selectedFolder) {
                            folder.style.background = 'white';
                            folder.style.borderColor = '#e0e0e0';
                        }
                    });
                });

                const content = item.querySelector('.component-content');
                if (content) {
                    content.addEventListener('mouseenter', () => {
                        item.style.borderColor = '#2771c2';
                        item.style.transform = 'translateY(-2px)';
                        item.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                    });

                    content.addEventListener('mouseleave', () => {
                        item.style.borderColor = '#e0e0e0';
                        item.style.transform = 'translateY(0)';
                        item.style.boxShadow = '0 2px 6px rgba(0,0,0,0.08)';
                    });

                    content.addEventListener('click', (e) => {
                        if (e.target.classList.contains('remove-fav')) return;

                        const text = item.getAttribute('data-text');
                        document.getElementById('favoris-window').style.display = 'none';

                        const iframes = document.querySelectorAll('iframe');
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

                        const clickAppMagicInIframes = () => {
                            console.log('Envoi du message CLICK_APPMAGIC...');
                            let appMagicClicked = false;

                            const appMagicHandler = (event) => {
                                if (event.data && event.data.type === 'CLICK_APPMAGIC_RESPONSE') {
                                    if (event.data.success && !appMagicClicked) {
                                        console.log('✓ Bouton AppMagic cliqué avec succès!');
                                        appMagicClicked = true;
                                        window.removeEventListener('message', appMagicHandler);
                                    }
                                }
                            };

                            window.addEventListener('message', appMagicHandler);

                            iframes.forEach((iframe, index) => {
                                try {
                                    iframe.contentWindow.postMessage({
                                        type: 'CLICK_APPMAGIC'
                                    }, '*');
                                } catch (e) {
                                    console.log(`Erreur envoi CLICK_APPMAGIC iframe ${index}:`, e.message);
                                }
                            });

                            setTimeout(() => {
                                if (!appMagicClicked) {
                                    console.log('⚠️ Bouton AppMagic non trouvé');
                                }
                                window.removeEventListener('message', appMagicHandler);
                            }, 1000);
                        };

                        const messageHandler = (event) => {
                            if (event.data && event.data.type === 'FILL_SEARCH_RESPONSE') {
                                if (event.data.success && !responseReceived) {
                                    console.log('✓ Input rempli avec succès!');
                                    success = true;
                                    responseReceived = true;
                                    window.removeEventListener('message', messageHandler);

                                    setTimeout(() => {
                                        clickAppMagicInIframes();
                                    }, 300);
                                } else if (!responseReceived) {
                                    const currentIndex = Array.from(iframes).findIndex(iframe => {
                                        try {
                                            return iframe.contentWindow === event.source;
                                        } catch (e) {
                                            return false;
                                        }
                                    });
                                    tryIframe(currentIndex + 1);
                                }
                            }
                        };

                        window.addEventListener('message', messageHandler);
                        tryIframe(0);

                        setTimeout(() => {
                            if (!success) {
                                console.log('⚠️ Aucune iframe n\'a répondu');
                            }
                            window.removeEventListener('message', messageHandler);
                        }, 1000);
                    });
                }
            });

            document.querySelectorAll('.folder-item').forEach(folder => {
                folder.addEventListener('dragover', (e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'move';
                    const folderSymbole = folder.getAttribute('data-symbole');
                    if (folderSymbole !== selectedFolder) {
                        folder.style.background = '#c5e1a5';
                        folder.style.borderColor = '#4caf50';
                        folder.style.transform = 'scale(1.05)';
                    }
                });

                folder.addEventListener('dragleave', () => {
                    const folderSymbole = folder.getAttribute('data-symbole');
                    if (folderSymbole !== selectedFolder) {
                        folder.style.background = 'white';
                        folder.style.borderColor = '#e0e0e0';
                        folder.style.transform = 'scale(1)';
                    }
                });

                folder.addEventListener('drop', (e) => {
                    e.preventDefault();

                    if (draggedElement && draggedIndex !== null) {
                        const targetSymbole = folder.getAttribute('data-symbole');
                        const sourceSymbole = draggedElement.getAttribute('data-symbole');

                        if (targetSymbole !== sourceSymbole) {
                            let favoris = GM_getValue('powerbi_favoris', []);

                            if (draggedIndex >= 0 && draggedIndex < favoris.length) {
                                favoris[draggedIndex].symbole = targetSymbole;
                                GM_setValue('powerbi_favoris', favoris);

                                console.log(`✓ Favori déplacé vers ${targetSymbole}`);
                                updateFavorisList();
                                setTimeout(() => {
                                    displayComponents(targetSymbole);
                                }, 100);
                            }
                        }
                    }
                });
            });
        }

        // Compter le total de composants réels
        const totalRealComponents = favoris.filter(fav => !fav.isEmpty).length;

        // Ajouter le dossier "Tous les composants" en premier
        let foldersHtml = `
            <div class="folder-item" data-symbole="__ALL__" style="
                padding: 12px 15px;
                margin-bottom: 10px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border: 2px solid #667eea;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.2s;
                user-select: none;
                color: white;
            ">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <div style="font-weight: bold; font-size: 14px; color: white;">
                            📋 Tous les composants
                        </div>
                        <div style="font-size: 12px; margin-top: 2px; color: rgba(255,255,255,0.9);">
                            ${totalRealComponents} composant${totalRealComponents > 1 ? 's' : ''} au total
                        </div>
                    </div>
                    <div style="font-size: 20px; color: white;">›</div>
                </div>
            </div>
        `;

        Object.keys(groupedBySymbole).sort().forEach(symbole => {
            const items = groupedBySymbole[symbole];
            const realItemsCount = items.filter(item => !item.isEmpty).length;

            foldersHtml += `
                <div class="folder-item" data-symbole="${symbole}" style="
                    padding: 12px 15px;
                    margin-bottom: 5px;
                    background: white;
                    border: 2px solid #e0e0e0;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.2s;
                    user-select: none;
                    position: relative;
                ">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div style="flex: 1; min-width: 0;" class="folder-main-content">
                            <div style="font-weight: bold; color: #333; font-size: 14px;">
                                📁 ${symbole}
                            </div>
                            <div style="font-size: 12px; color: #666; margin-top: 2px;">
                                ${realItemsCount} composant${realItemsCount > 1 ? 's' : ''}
                            </div>
                        </div>
                        <div style="display: flex; gap: 5px; align-items: center;">
                            <button class="rename-folder-icon" data-symbole="${symbole}" style="
                                background: #ffc107;
                                color: #000;
                                border: none;
                                width: 28px;
                                height: 28px;
                                border-radius: 5px;
                                cursor: pointer;
                                font-size: 14px;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                transition: all 0.2s;
                                padding: 0;
                            " title="Renommer le dossier">✏️</button>
                            <button class="delete-folder-icon" data-symbole="${symbole}" style="
                                background: #dc3545;
                                color: white;
                                border: none;
                                width: 28px;
                                height: 28px;
                                border-radius: 5px;
                                cursor: pointer;
                                font-size: 14px;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                transition: all 0.2s;
                                padding: 0;
                            " title="Supprimer le dossier">🗑️</button>
                            <div style="font-size: 20px; color: #2771c2; margin-left: 5px;">›</div>
                        </div>
                    </div>
                </div>
            `;
        });

        foldersListDiv.innerHTML = foldersHtml;

        function displayComponents(symbole) {
            selectedFolder = symbole;

            // Si c'est le dossier "Tous les composants"
            if (symbole === '__ALL__') {
                document.getElementById('current-folder-name').textContent = ` - Tous les composants`;

                // Mettre à jour les styles des dossiers
                document.querySelectorAll('.folder-item').forEach(folder => {
                    if (folder.getAttribute('data-symbole') === '__ALL__') {
                        folder.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
                        folder.style.borderColor = '#667eea';
                        folder.style.color = 'white';
                        folder.querySelectorAll('div').forEach(div => div.style.color = 'white');
                    } else {
                        folder.style.background = 'white';
                        folder.style.borderColor = '#e0e0e0';
                        folder.style.color = '#333';
                        folder.querySelectorAll('div')[0].style.color = '#333';
                        folder.querySelectorAll('div')[1].style.color = '#666';
                        folder.querySelectorAll('div')[2].style.color = '#2771c2';
                    }
                });

                // Récupérer tous les composants réels (non vides)
                const allRealItems = favoris.filter(fav => !fav.isEmpty).map((fav, index) => ({
                    ...fav,
                    originalIndex: favoris.indexOf(fav)
                }));

                if (allRealItems.length === 0) {
                    componentsListDiv.innerHTML = '<p style="color: #999; font-style: italic; text-align: center; padding: 50px 20px;">Aucun composant pour le moment. Ajoutez-en en cliquant sur l\'étoile ⭐</p>';
                    return;
                }

                // Afficher tous les composants groupés par symbole
                let componentsHtml = '';
                const symbolesOrdered = Object.keys(groupedBySymbole).sort();

                symbolesOrdered.forEach(sym => {
                    const items = groupedBySymbole[sym].filter(item => !item.isEmpty);
                    if (items.length === 0) return;

                    componentsHtml += `<div style="margin-bottom: 20px; padding: 10px; background: #f8f9fa; border-radius: 8px;">
                        <h4 style="margin: 0 0 10px 0; color: #2771c2; font-size: 14px; font-weight: bold;">📁 ${sym}</h4>`;

                    items.forEach(item => {
                        componentsHtml += `
                            <div class="component-item"
                                 data-index="${item.originalIndex}"
                                 data-text="${item.text.replace(/"/g, '&quot;')}"
                                 data-repere="${item.repere || ''}"
                                 data-symbole="${item.symbole}"
                                 style="
                                    border: 2px solid #e0e0e0;
                                    border-radius: 10px;
                                    margin-bottom: 15px;
                                    position: relative;
                                    background: white;
                                    transition: all 0.2s;
                                    box-shadow: 0 2px 6px rgba(0,0,0,0.08);
                                    overflow: hidden;
                                ">
                                <div class="drag-handle" style="
                                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                                    padding: 8px 15px;
                                    cursor: move;
                                    color: white;
                                    font-size: 12px;
                                    font-weight: bold;
                                    display: flex;
                                    align-items: center;
                                    gap: 8px;
                                ">
                                    <span style="font-size: 16px;">⋮⋮</span>
                                    <span>Glisser pour déplacer</span>
                                </div>
                                <div class="component-content" style="padding: 15px; cursor: pointer; position: relative;">
                                    <button class="remove-fav" data-index="${item.originalIndex}" style="
                                        position: absolute;
                                        top: 15px;
                                        right: 12px;
                                        background: #dc3545;
                                        color: white;
                                        border: none;
                                        border-radius: 50%;
                                        width: 28px;
                                        height: 28px;
                                        cursor: pointer;
                                        font-size: 16px;
                                        z-index: 10;
                                        display: flex;
                                        align-items: center;
                                        justify-content: center;
                                        transition: background 0.2s;
                                        font-weight: bold;
                                    ">×</button>
                                    <div style="font-weight: bold; color: #333; padding-right: 45px; font-size: 15px; margin-bottom: 8px;">
                                        ${item.text}
                                    </div>
                                    ${item.designation ? `<div style="font-size: 13px; color: #666; margin-bottom: 6px; padding-left: 20px; border-left: 3px solid #2771c2;">📝 ${item.designation}</div>` : ''}
                                    ${item.repere ? `
                                        <div style="
                                            position: absolute;
                                            bottom: 10px;
                                            right: 10px;
                                            display: flex;
                                            flex-wrap: wrap;
                                            gap: 5px;
                                            justify-content: flex-end;
                                            max-width: 60%;
                                        ">
                                            ${item.repere.split(',').map(r => `
                                                <span style="
                                                    background: linear-gradient(135deg, #2771c2 0%, #1a5a9a 100%);
                                                    color: white;
                                                    padding: 4px 10px;
                                                    border-radius: 12px;
                                                    font-size: 12px;
                                                    font-weight: 600;
                                                    white-space: nowrap;
                                                    box-shadow: 0 2px 4px rgba(39, 113, 194, 0.3);
                                                ">📍 ${r.trim()}</span>
                                            `).join('')}
                                        </div>
                                    ` : ''}
                                </div>
                            </div>
                        `;
                    });

                    componentsHtml += '</div>';
                });

                componentsListDiv.innerHTML = componentsHtml;
                setupComponentEvents();
                return;
            }

            // Sinon, afficher un dossier spécifique
            const items = groupedBySymbole[symbole];
            document.getElementById('current-folder-name').textContent = ` - ${symbole}`;

            document.querySelectorAll('.folder-item').forEach(folder => {
                if (folder.getAttribute('data-symbole') === symbole) {
                    folder.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
                    folder.style.borderColor = '#667eea';
                    folder.style.color = 'white';
                    folder.querySelectorAll('div').forEach(div => div.style.color = 'white');
                } else if (folder.getAttribute('data-symbole') === '__ALL__') {
                    folder.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
                    folder.style.borderColor = '#667eea';
                    folder.style.color = 'white';
                } else {
                    folder.style.background = 'white';
                    folder.style.borderColor = '#e0e0e0';
                    folder.style.color = '#333';
                    folder.querySelectorAll('div')[0].style.color = '#333';
                    folder.querySelectorAll('div')[1].style.color = '#666';
                    folder.querySelectorAll('div')[2].style.color = '#2771c2';
                }
            });

            const realItems = items.filter(item => !item.isEmpty);

            if (realItems.length === 0) {
                componentsListDiv.innerHTML = '<p style="color: #999; font-style: italic; text-align: center; padding: 50px 20px;">Ce dossier est vide. Ajoutez des composants en cliquant sur l\'étoile ⭐</p>';
                return;
            }

            let componentsHtml = '';
            realItems.forEach(item => {
                componentsHtml += `
                    <div class="component-item"
                         data-index="${item.originalIndex}"
                         data-text="${item.text.replace(/"/g, '&quot;')}"
                         data-repere="${item.repere || ''}"
                         data-symbole="${item.symbole}"
                         style="
                            border: 2px solid #e0e0e0;
                            border-radius: 10px;
                            margin-bottom: 15px;
                            position: relative;
                            background: white;
                            transition: all 0.2s;
                            box-shadow: 0 2px 6px rgba(0,0,0,0.08);
                            overflow: hidden;
                        ">
                        <div class="drag-handle" style="
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            padding: 8px 15px;
                            cursor: move;
                            color: white;
                            font-size: 12px;
                            font-weight: bold;
                            display: flex;
                            align-items: center;
                            gap: 8px;
                        ">
                            <span style="font-size: 16px;">⋮⋮</span>
                            <span>Glisser pour déplacer</span>
                        </div>
                        <div class="component-content" style="padding: 15px; ${item.repere ? 'padding-bottom: 45px;' : ''} cursor: pointer; position: relative;">
                            <button class="remove-fav" data-index="${item.originalIndex}" style="
                                position: absolute;
                                top: 15px;
                                right: 12px;
                                background: #dc3545;
                                color: white;
                                border: none;
                                border-radius: 50%;
                                width: 28px;
                                height: 28px;
                                cursor: pointer;
                                font-size: 16px;
                                z-index: 10;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                transition: background 0.2s;
                                font-weight: bold;
                            ">×</button>
                            <div style="font-weight: bold; color: #333; padding-right: 45px; font-size: 15px; margin-bottom: 8px;">
                                ${item.text}
                            </div>
                            ${item.designation ? `<div style="font-size: 13px; color: #666; margin-bottom: 6px; padding-left: 20px; border-left: 3px solid #2771c2;">📝 ${item.designation}</div>` : ''}
                            ${item.repere ? `
                                <div style="
                                    position: absolute;
                                    bottom: 10px;
                                    right: 10px;
                                    display: flex;
                                    flex-wrap: wrap;
                                    gap: 5px;
                                    justify-content: flex-end;
                                    max-width: 60%;
                                ">
                                    ${item.repere.split(',').map(r => `
                                        <span style="
                                            background: linear-gradient(135deg, #2771c2 0%, #1a5a9a 100%);
                                            color: white;
                                            padding: 4px 10px;
                                            border-radius: 12px;
                                            font-size: 12px;
                                            font-weight: 600;
                                            white-space: nowrap;
                                            box-shadow: 0 2px 4px rgba(39, 113, 194, 0.3);
                                        ">📍 ${r.trim()}</span>
                                    `).join('')}
                                </div>
                            ` : ''}
                        </div>
                    </div>
                `;
            });

            componentsListDiv.innerHTML = componentsHtml;
            setupComponentEvents();
        }

        document.querySelectorAll('.folder-item').forEach(folder => {
            folder.addEventListener('mouseenter', function() {
                if (this.getAttribute('data-symbole') !== selectedFolder && this.getAttribute('data-symbole') !== '__ALL__') {
                    this.style.background = '#e3f2fd';
                    this.style.borderColor = '#2771c2';
                    this.style.transform = 'translateX(5px)';
                }
            });

            folder.addEventListener('mouseleave', function() {
                if (this.getAttribute('data-symbole') !== selectedFolder && this.getAttribute('data-symbole') !== '__ALL__') {
                    this.style.background = 'white';
                    this.style.borderColor = '#e0e0e0';
                    this.style.transform = 'translateX(0)';
                }
            });

            // Gérer le clic sur le contenu principal du dossier
            const mainContent = folder.querySelector('.folder-main-content');
            if (mainContent) {
                mainContent.addEventListener('click', function(e) {
                    e.stopPropagation();
                    const symbole = folder.getAttribute('data-symbole');
                    displayComponents(symbole);
                });
            }
        });

        // Attacher les événements pour les boutons renommer/supprimer
        document.querySelectorAll('.rename-folder-icon').forEach(btn => {
            btn.addEventListener('mouseenter', () => {
                btn.style.background = '#e0a800';
                btn.style.transform = 'scale(1.1)';
            });
            btn.addEventListener('mouseleave', () => {
                btn.style.background = '#ffc107';
                btn.style.transform = 'scale(1)';
            });
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const symbole = e.currentTarget.getAttribute('data-symbole');
                renameFolder(symbole);
            });
        });

        document.querySelectorAll('.delete-folder-icon').forEach(btn => {
            btn.addEventListener('mouseenter', () => {
                btn.style.background = '#c82333';
                btn.style.transform = 'scale(1.1)';
            });
            btn.addEventListener('mouseleave', () => {
                btn.style.background = '#dc3545';
                btn.style.transform = 'scale(1)';
            });
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const symbole = e.currentTarget.getAttribute('data-symbole');
                deleteFolder(symbole);
            });
        });

        // Afficher le dossier "Tous les composants" par défaut
        displayComponents('__ALL__');
    }

    function init() {
        const checkInterval = setInterval(() => {
            const viewport = document.querySelector('.displayAreaViewport');
            if (viewport) {
                clearInterval(checkInterval);

                const inputModal = createInputModal();
                document.body.appendChild(inputModal);

                const favorisWindow = createFavorisWindow();
                document.body.appendChild(favorisWindow);

                const addButton = createAddButton();
                document.body.appendChild(addButton);

                const showListButton = createShowListButton();
                document.body.appendChild(showListButton);

                const closeBtn = document.getElementById('close-favoris');
                closeBtn.addEventListener('mouseenter', () => {
                    closeBtn.style.background = 'rgba(255,255,255,0.2)';
                });
                closeBtn.addEventListener('mouseleave', () => {
                    closeBtn.style.background = 'none';
                });
                closeBtn.addEventListener('click', () => {
                    favorisWindow.style.display = 'none';
                });

                showListButton.addEventListener('click', () => {
                    favorisWindow.style.display = 'flex';
                    updateFavorisList();
                });

                addButton.addEventListener('click', addToFavoris);

                const createFolderBtn = document.getElementById('create-folder-btn');
                createFolderBtn.addEventListener('mouseenter', () => {
                    createFolderBtn.style.background = '#218838';
                });
                createFolderBtn.addEventListener('mouseleave', () => {
                    createFolderBtn.style.background = '#28a745';
                });
                createFolderBtn.addEventListener('click', createNewFolder);

                const searchFolders = document.getElementById('search-folders');
                const searchComponents = document.getElementById('search-components');

                searchFolders.addEventListener('focus', () => {
                    searchFolders.style.borderColor = '#2771c2';
                });
                searchFolders.addEventListener('blur', () => {
                    searchFolders.style.borderColor = '#ddd';
                });

                searchComponents.addEventListener('focus', () => {
                    searchComponents.style.borderColor = '#2771c2';
                });
                searchComponents.addEventListener('blur', () => {
                    searchComponents.style.borderColor = '#ddd';
                });

                searchFolders.addEventListener('input', (e) => {
                    const searchTerm = e.target.value.toLowerCase();
                    const favoris = GM_getValue('powerbi_favoris', []);

                    if (searchTerm === '') {
                        document.querySelectorAll('.folder-item').forEach(folder => {
                            folder.style.display = 'block';
                        });
                    } else {
                        const matchingSymboles = new Set();
                        favoris.forEach(fav => {
                            const symbole = fav.symbole || 'Sans symbole';
                            const itemText = (fav.text || '').toLowerCase();
                            const itemDesignation = (fav.designation || '').toLowerCase();
                            const itemRepere = (fav.repere || '').toLowerCase();
                            const symboleText = symbole.toLowerCase();

                            if (symboleText.includes(searchTerm) ||
                                itemText.includes(searchTerm) ||
                                itemDesignation.includes(searchTerm) ||
                                itemRepere.includes(searchTerm)) {
                                matchingSymboles.add(symbole);
                            }
                        });

                        document.querySelectorAll('.folder-item').forEach(folder => {
                            const folderSymbole = folder.getAttribute('data-symbole');
                            if (matchingSymboles.has(folderSymbole)) {
                                folder.style.display = 'block';
                            } else {
                                folder.style.display = 'none';
                            }
                        });
                    }
                });

                searchComponents.addEventListener('input', (e) => {
                    const searchTerm = e.target.value.toLowerCase();
                    const componentsListDiv = document.getElementById('components-list');

                    if (searchTerm === '') {
                        updateFavorisList();
                        return;
                    }

                    const favoris = GM_getValue('powerbi_favoris', []);
                    const matchingItems = [];

                    favoris.forEach((fav, index) => {
                        if (fav.isEmpty) return;

                        const itemText = (fav.text || '').toLowerCase();
                        const itemDesignation = (fav.designation || '').toLowerCase();
                        const itemRepere = (fav.repere || '').toLowerCase();
                        const itemSymbole = (fav.symbole || '').toLowerCase();

                        if (itemText.includes(searchTerm) ||
                            itemDesignation.includes(searchTerm) ||
                            itemRepere.includes(searchTerm) ||
                            itemSymbole.includes(searchTerm)) {
                            matchingItems.push({ ...fav, originalIndex: index });
                        }
                    });

                    if (matchingItems.length === 0) {
                        componentsListDiv.innerHTML = '<p style="color: #999; font-style: italic; text-align: center; padding: 50px 20px;">Aucun composant trouvé</p>';
                        document.getElementById('current-folder-name').textContent = ' - Résultats';
                        return;
                    }

                    document.getElementById('current-folder-name').textContent = ` - Résultats (${matchingItems.length})`;

                    let componentsHtml = '';
                    matchingItems.forEach(item => {
                        componentsHtml += `
                            <div class="component-item"
                                 data-index="${item.originalIndex}"
                                 data-text="${item.text.replace(/"/g, '&quot;')}"
                                 data-repere="${item.repere || ''}"
                                 data-symbole="${item.symbole}"
                                 style="
                                    border: 2px solid #e0e0e0;
                                    border-radius: 10px;
                                    margin-bottom: 15px;
                                    position: relative;
                                    background: white;
                                    transition: all 0.2s;
                                    box-shadow: 0 2px 6px rgba(0,0,0,0.08);
                                    overflow: hidden;
                                ">
                                <div class="drag-handle" style="
                                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                                    padding: 8px 15px;
                                    cursor: move;
                                    color: white;
                                    font-size: 12px;
                                    font-weight: bold;
                                    display: flex;
                                    align-items: center;
                                    gap: 8px;
                                ">
                                    <span style="font-size: 16px;">⋮⋮</span>
                                    <span>Glisser pour déplacer</span>
                                </div>
                                <div class="component-content" style="padding: 15px; ${item.repere ? 'padding-bottom: 45px;' : ''} cursor: pointer; position: relative;">
                                    <button class="remove-fav" data-index="${item.originalIndex}" style="
                                        position: absolute;
                                        top: 15px;
                                        right: 12px;
                                        background: #dc3545;
                                        color: white;
                                        border: none;
                                        border-radius: 50%;
                                        width: 28px;
                                        height: 28px;
                                        cursor: pointer;
                                        font-size: 16px;
                                        z-index: 10;
                                        display: flex;
                                        align-items: center;
                                        justify-content: center;
                                        transition: background 0.2s;
                                        font-weight: bold;
                                    ">×</button>
                                    <div style="font-size: 11px; color: #999; margin-bottom: 5px;">
                                        📁 ${item.symbole || 'Sans symbole'}
                                    </div>
                                    <div style="font-weight: bold; color: #333; padding-right: 45px; font-size: 15px; margin-bottom: 8px;">
                                        ${item.text}
                                    </div>
                                    ${item.designation ? `<div style="font-size: 13px; color: #666; margin-bottom: 6px; padding-left: 20px; border-left: 3px solid #2771c2;">📝 ${item.designation}</div>` : ''}
                                    ${item.repere ? `
                                        <div style="
                                            position: absolute;
                                            bottom: 10px;
                                            right: 10px;
                                            display: flex;
                                            flex-wrap: wrap;
                                            gap: 5px;
                                            justify-content: flex-end;
                                            max-width: 60%;
                                        ">
                                            ${item.repere.split(',').map(r => `
                                                <span style="
                                                    background: linear-gradient(135deg, #2771c2 0%, #1a5a9a 100%);
                                                    color: white;
                                                    padding: 4px 10px;
                                                    border-radius: 12px;
                                                    font-size: 12px;
                                                    font-weight: 600;
                                                    white-space: nowrap;
                                                    box-shadow: 0 2px 4px rgba(39, 113, 194, 0.3);
                                                ">📍 ${r.trim()}</span>
                                            `).join('')}
                                        </div>
                                    ` : ''}
                                </div>
                            </div>
                        `;
                    });

                    componentsListDiv.innerHTML = componentsHtml;

                    // Réattacher les événements uniquement pour les composants affichés
                    document.querySelectorAll('.remove-fav').forEach(btn => {
                        btn.addEventListener('mouseenter', () => {
                            btn.style.background = '#c82333';
                            btn.style.transform = 'scale(1.1)';
                        });
                        btn.addEventListener('mouseleave', () => {
                            btn.style.background = '#dc3545';
                            btn.style.transform = 'scale(1)';
                        });
                        btn.addEventListener('click', (e) => {
                            e.stopPropagation();
                            const index = parseInt(e.target.getAttribute('data-index'));
                            if (confirm('Êtes-vous sûr de vouloir supprimer ce favori ?')) {
                                removeFavori(index);
                            }
                        });
                    });

                    document.querySelectorAll('.component-item').forEach(item => {
                        const content = item.querySelector('.component-content');
                        if (content) {
                            content.addEventListener('mouseenter', () => {
                                item.style.borderColor = '#2771c2';
                                item.style.transform = 'translateY(-2px)';
                                item.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                            });

                            content.addEventListener('mouseleave', () => {
                                item.style.borderColor = '#e0e0e0';
                                item.style.transform = 'translateY(0)';
                                item.style.boxShadow = '0 2px 6px rgba(0,0,0,0.08)';
                            });

                            content.addEventListener('click', (e) => {
                                if (e.target.classList.contains('remove-fav')) return;

                                const text = item.getAttribute('data-text');
                                document.getElementById('favoris-window').style.display = 'none';

                                const iframes = document.querySelectorAll('iframe');
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

                                const clickAppMagicInIframes = () => {
                                    console.log('Envoi du message CLICK_APPMAGIC...');
                                    let appMagicClicked = false;

                                    const appMagicHandler = (event) => {
                                        if (event.data && event.data.type === 'CLICK_APPMAGIC_RESPONSE') {
                                            if (event.data.success && !appMagicClicked) {
                                                console.log('✓ Bouton AppMagic cliqué avec succès!');
                                                appMagicClicked = true;
                                                window.removeEventListener('message', appMagicHandler);
                                            }
                                        }
                                    };

                                    window.addEventListener('message', appMagicHandler);

                                    iframes.forEach((iframe, index) => {
                                        try {
                                            iframe.contentWindow.postMessage({
                                                type: 'CLICK_APPMAGIC'
                                            }, '*');
                                        } catch (e) {
                                            console.log(`Erreur envoi CLICK_APPMAGIC iframe ${index}:`, e.message);
                                        }
                                    });

                                    setTimeout(() => {
                                        if (!appMagicClicked) {
                                            console.log('⚠️ Bouton AppMagic non trouvé');
                                        }
                                        window.removeEventListener('message', appMagicHandler);
                                    }, 1000);
                                };

                                const messageHandler = (event) => {
                                    if (event.data && event.data.type === 'FILL_SEARCH_RESPONSE') {
                                        if (event.data.success && !responseReceived) {
                                            console.log('✓ Input rempli avec succès!');
                                            success = true;
                                            responseReceived = true;
                                            window.removeEventListener('message', messageHandler);

                                            setTimeout(() => {
                                                clickAppMagicInIframes();
                                            }, 300);
                                        } else if (!responseReceived) {
                                            const currentIndex = Array.from(iframes).findIndex(iframe => {
                                                try {
                                                    return iframe.contentWindow === event.source;
                                                } catch (e) {
                                                    return false;
                                                }
                                            });
                                            tryIframe(currentIndex + 1);
                                        }
                                    }
                                };

                                window.addEventListener('message', messageHandler);
                                tryIframe(0);

                                setTimeout(() => {
                                    if (!success) {
                                        console.log('⚠️ Aucune iframe n\'a répondu');
                                    }
                                    window.removeEventListener('message', messageHandler);
                                }, 1000);
                            });
                        }
                    });
                });
            }
        }, 500);
    }

    init();
})();
