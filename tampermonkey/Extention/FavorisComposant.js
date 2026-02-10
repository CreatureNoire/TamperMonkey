// ==UserScript==
// @name         Où est mon composant Favoris
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
                }, 100); // Petit délai pour s'assurer que l'input est bien rempli

                return true;
            }
            return false;
        };

        // Fonction pour cliquer sur le bouton AppMagic dans l'iframe
        window.clickAppMagicButton = function() {
            // Chercher la div avec la classe appmagic-button
            const appmagicButton = document.querySelector('div.appmagic-button.middle.center') ||
                                   document.querySelector('div.appmagic-button') ||
                                   document.querySelector('div[data-bind*="appmagic-button"]');

            if (appmagicButton) {
                console.log('✓ Bouton AppMagic trouvé dans cette iframe, clic...');
                appmagicButton.click();
                return true;
            } else {
                // Essayer de le trouver via le data-control-part
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
                // Renvoyer une confirmation
                event.source.postMessage({
                    type: 'FILL_SEARCH_RESPONSE',
                    success: success
                }, event.origin);
            } else if (event.data && event.data.type === 'CLICK_APPMAGIC') {
                const success = window.clickAppMagicButton();
                // Renvoyer une confirmation
                event.source.postMessage({
                    type: 'CLICK_APPMAGIC_RESPONSE',
                    success: success
                }, event.origin);
            }
        });

        console.log('Iframe prête à recevoir des messages');
        return; // Ne pas exécuter le reste du script dans l'iframe
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
                width: 400px;
                font-family: 'Segoe UI', sans-serif;
            ">
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
        `;

        return modal;
    }

    // Fonction pour afficher la modale et récupérer les valeurs
    function showInputModal() {
        return new Promise((resolve) => {
            const modal = document.getElementById('input-modal');
            const symboleInput = document.getElementById('modal-symbole');
            const repereInput = document.getElementById('modal-repere');
            const confirmBtn = document.getElementById('modal-confirm');
            const cancelBtn = document.getElementById('modal-cancel');

            // Réinitialiser les champs
            symboleInput.value = '';
            repereInput.value = '';

            // Afficher la modale
            modal.style.display = 'flex';
            symboleInput.focus();

            // Gestion de la confirmation
            const handleConfirm = () => {
                const symbole = symboleInput.value.trim();
                const repere = repereInput.value.trim();

                if (symbole === '') {
                    alert('Le numéro de symbole ne peut pas être vide');
                    return;
                }

                modal.style.display = 'none';
                cleanup();
                resolve({ symbole, repere });
            };

            // Gestion de l'annulation
            const handleCancel = () => {
                modal.style.display = 'none';
                cleanup();
                resolve(null);
            };

            // Gestion de la touche Entrée
            const handleKeyPress = (e) => {
                if (e.key === 'Enter') {
                    handleConfirm();
                } else if (e.key === 'Escape') {
                    handleCancel();
                }
            };

            // Nettoyer les événements
            const cleanup = () => {
                confirmBtn.removeEventListener('click', handleConfirm);
                cancelBtn.removeEventListener('click', handleCancel);
                symboleInput.removeEventListener('keypress', handleKeyPress);
                repereInput.removeEventListener('keypress', handleKeyPress);
            };

            // Ajouter les événements
            confirmBtn.addEventListener('click', handleConfirm);
            cancelBtn.addEventListener('click', handleCancel);
            symboleInput.addEventListener('keypress', handleKeyPress);
            repereInput.addEventListener('keypress', handleKeyPress);
        });
    }

    // Fonction pour créer la fenêtre de favoris
    function createFavorisWindow() {
        const favorisDiv = document.createElement('div');
        favorisDiv.id = 'favoris-window';
        favorisDiv.style.cssText = `
            position: fixed;
            top: 60px;
            right: 20px;
            width: 400px;
            max-height: 500px;
            background: white;
            border: 2px solid #2771c2;
            border-radius: 10px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            overflow: hidden;
            font-family: 'Segoe UI', sans-serif;
        `;

        favorisDiv.innerHTML = `
            <div style="background: #2771c2; color: white; padding: 12px; font-weight: bold; display: flex; justify-content: space-between; align-items: center;">
                <span>📌 Mes Favoris</span>
                <button id="close-favoris" style="background: none; border: none; color: white; font-size: 20px; cursor: pointer;">×</button>
            </div>
            <div style="padding: 10px; border-bottom: 1px solid #eee;">
                <input type="text" id="search-favoris" placeholder="🔍 Rechercher..." style="
                    width: 100%;
                    padding: 8px 12px;
                    border: 1px solid #ddd;
                    border-radius: 5px;
                    font-size: 13px;
                    outline: none;
                    box-sizing: border-box;
                ">
            </div>
            <div id="favoris-list" style="max-height: 350px; overflow-y: auto; padding: 10px;">
                <p style="color: #666; font-style: italic; text-align: center;">Aucun favori pour le moment</p>
            </div>
        `;

        return favorisDiv;
    }

    // Fonction pour créer le bouton d'ajout
    function createAddButton() {
        const button = document.createElement('button');
        button.id = 'add-to-favoris';
        button.innerHTML = '⭐ Ajouter aux favoris';
        button.style.cssText = `
            position: fixed;
            top: 60px;
            right: 440px;
            background: #2771c2;
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
            button.style.background = '#1a5a9a';
        });

        button.addEventListener('mouseleave', () => {
            button.style.background = '#2771c2';
        });

        return button;
    }

    // Fonction pour récupérer l'élément sélectionné
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

    // Fonction pour sauvegarder un favori
    async function addToFavoris() {
        const selectedItem = getSelectedItem();
        if (!selectedItem) {
            alert('Aucun élément sélectionné');
            return;
        }

        // Afficher la modale pour saisir symbole et repère
        const result = await showInputModal();

        if (!result) {
            // L'utilisateur a annulé
            return;
        }

        const { symbole, repere } = result;

        let favoris = GM_getValue('powerbi_favoris', []);

        // Vérifier si l'élément existe déjà
        const exists = favoris.some(fav => fav.title === selectedItem.title && fav.symbole === symbole && fav.repere === repere);
        if (exists) {
            alert('Cet élément existe déjà dans ce symbole avec ce repère');
            return;
        }

        selectedItem.symbole = symbole;
        selectedItem.repere = repere;
        favoris.push(selectedItem);
        GM_setValue('powerbi_favoris', favoris);
        updateFavorisList();
        alert('✓ Ajouté aux favoris !');
    }

    // Fonction pour mettre à jour la liste des favoris
    function updateFavorisList() {
        const listDiv = document.getElementById('favoris-list');
        if (!listDiv) return;

        const favoris = GM_getValue('powerbi_favoris', []);

        if (favoris.length === 0) {
            listDiv.innerHTML = '<p style="color: #666; font-style: italic; text-align: center;">Aucun favori pour le moment</p>';
            return;
        }

        // Grouper les favoris par symbole
        const groupedBySymbole = {};
        favoris.forEach((fav, index) => {
            const symbole = fav.symbole || 'Sans symbole';
            if (!groupedBySymbole[symbole]) {
                groupedBySymbole[symbole] = [];
            }
            groupedBySymbole[symbole].push({ ...fav, originalIndex: index });
        });

        // Générer le HTML par dossier
        let html = '';
        Object.keys(groupedBySymbole).sort().forEach(symbole => {
            const items = groupedBySymbole[symbole];
            const folderId = `folder-${symbole.replace(/\s+/g, '-')}`;

            html += `
                <div style="margin-bottom: 10px;">
                    <div class="folder-header" data-folder="${folderId}" style="
                        background: #f0f0f0;
                        padding: 8px 10px;
                        cursor: pointer;
                        border-radius: 5px;
                        font-weight: bold;
                        color: #2771c2;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        user-select: none;
                    ">
                        <span>
                            <span class="folder-icon">📁</span> ${symbole} (${items.length})
                        </span>
                        <span style="font-size: 12px; color: #666;">▼</span>
                    </div>
                    <div id="${folderId}" class="folder-content" style="display: block; margin-left: 10px;">
                        ${items.map(item => `
                            <div class="favori-item" data-text="${item.text.replace(/"/g, '&quot;')}" data-repere="${item.repere || ''}" style="border-bottom: 1px solid #eee; padding: 10px; position: relative; background: white; cursor: pointer; transition: background 0.2s;">
                                <button class="remove-fav" data-index="${item.originalIndex}" style="position: absolute; top: 5px; right: 5px; background: #dc3545; color: white; border: none; border-radius: 3px; padding: 2px 6px; cursor: pointer; font-size: 12px; z-index: 10;">×</button>
                                <div style="font-weight: bold; color: #333; padding-right: 25px; font-size: 13px;">${item.text}</div>
                                ${item.repere ? `<div style="font-size: 12px; color: #2771c2; margin-top: 5px; font-weight: 600;">📍 Repère: ${item.repere}</div>` : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        });

        listDiv.innerHTML = html;

        // Ajouter les événements pour plier/déplier les dossiers
        document.querySelectorAll('.folder-header').forEach(header => {
            header.addEventListener('click', (e) => {
                const folderId = e.currentTarget.getAttribute('data-folder');
                const content = document.getElementById(folderId);
                const icon = e.currentTarget.querySelector('.folder-icon');
                const arrow = e.currentTarget.querySelector('span:last-child');

                if (content.style.display === 'none') {
                    content.style.display = 'block';
                    icon.textContent = '📁';
                    arrow.textContent = '▼';
                } else {
                    content.style.display = 'none';
                    icon.textContent = '📂';
                    arrow.textContent = '▶';
                }
            });
        });

        // Ajouter les événements de suppression
        document.querySelectorAll('.remove-fav').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation(); // Empêcher la propagation au favori-item
                const index = parseInt(e.target.getAttribute('data-index'));
                removeFavori(index);
            });
        });

        // Ajouter les événements de clic sur les favoris
        document.querySelectorAll('.favori-item').forEach(item => {
            item.addEventListener('mouseenter', () => {
                item.style.background = '#f5f5f5';
            });

            item.addEventListener('mouseleave', () => {
                item.style.background = 'white';
            });

            item.addEventListener('click', (e) => {
                // Ne pas déclencher si on clique sur le bouton de suppression
                if (e.target.classList.contains('remove-fav')) return;

                const text = item.getAttribute('data-text');

                // Envoyer un message aux iframes une par une jusqu'à ce qu'une réponde
                const iframes = document.querySelectorAll('iframe');
                let success = false;
                let responseReceived = false;

                // Fonction pour essayer chaque iframe pour remplir le champ de recherche
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
                        // Essayer la suivante
                        tryIframe(index + 1);
                    }
                };

                // Fonction pour envoyer le message de clic AppMagic à toutes les iframes
                const clickAppMagicInIframes = () => {
                    console.log('Envoi du message CLICK_APPMAGIC à toutes les iframes...');
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

                    // Envoyer le message à toutes les iframes
                    iframes.forEach((iframe, index) => {
                        try {
                            iframe.contentWindow.postMessage({
                                type: 'CLICK_APPMAGIC'
                            }, '*');
                            console.log(`Message CLICK_APPMAGIC envoyé à iframe ${index}`);
                        } catch (e) {
                            console.log(`Erreur envoi CLICK_APPMAGIC iframe ${index}:`, e.message);
                        }
                    });

                    // Timeout pour nettoyer
                    setTimeout(() => {
                        if (!appMagicClicked) {
                            console.log('⚠️ Bouton AppMagic non trouvé dans aucune iframe');
                        }
                        window.removeEventListener('message', appMagicHandler);
                    }, 1000);
                };

                // Écouter la réponse pour le remplissage du champ
                const messageHandler = (event) => {
                    if (event.data && event.data.type === 'FILL_SEARCH_RESPONSE') {
                        if (event.data.success && !responseReceived) {
                            console.log('✓ Input rempli avec succès!');
                            success = true;
                            responseReceived = true;
                            window.removeEventListener('message', messageHandler);

                            // Attendre un peu puis cliquer sur le bouton AppMagic
                            setTimeout(() => {
                                clickAppMagicInIframes();
                            }, 300);
                        } else if (!responseReceived) {
                            // Cette iframe n'a pas l'input, essayer la suivante
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

                // Commencer par la première iframe
                tryIframe(0);

                // Afficher une notification visuelle
                item.style.background = '#d4edda';
                setTimeout(() => {
                    item.style.background = 'white';
                }, 300);

                // Timeout si pas de réponse
                setTimeout(() => {
                    if (!success) {
                        console.log('⚠️ Aucune iframe n\'a répondu pour FILL_SEARCH');
                    }
                    window.removeEventListener('message', messageHandler);
                }, 1000);
            });
        });
    }

    // Fonction pour supprimer un favori
    function removeFavori(index) {
        let favoris = GM_getValue('powerbi_favoris', []);
        favoris.splice(index, 1);
        GM_setValue('powerbi_favoris', favoris);
        updateFavorisList();
    }

    // Initialisation
    function init() {
        // Attendre que le DOM soit chargé
        const checkInterval = setInterval(() => {
            const viewport = document.querySelector('.displayAreaViewport');
            if (viewport) {
                clearInterval(checkInterval);

                // Créer et ajouter la modale de saisie
                const inputModal = createInputModal();
                document.body.appendChild(inputModal);

                // Créer et ajouter la fenêtre de favoris
                const favorisWindow = createFavorisWindow();
                document.body.appendChild(favorisWindow);

                // Créer et ajouter le bouton d'ajout
                const addButton = createAddButton();
                document.body.appendChild(addButton);

                // Événements
                document.getElementById('close-favoris').addEventListener('click', () => {
                    favorisWindow.style.display = 'none';
                });

                addButton.addEventListener('click', addToFavoris);

                // Ajouter l'événement de recherche
                document.getElementById('search-favoris').addEventListener('input', (e) => {
                    const searchTerm = e.target.value.toLowerCase();
                    const folders = document.querySelectorAll('.folder-header').length > 0;

                    if (!folders) return;

                    document.querySelectorAll('.folder-header').forEach(folderHeader => {
                        const folderId = folderHeader.getAttribute('data-folder');
                        const folderContent = document.getElementById(folderId);
                        const folderName = folderHeader.textContent.toLowerCase();

                        let hasVisibleItems = false;

                        // Filtrer les éléments dans le dossier
                        folderContent.querySelectorAll('.favori-item').forEach(item => {
                            const itemText = item.textContent.toLowerCase();
                            const itemRepere = (item.getAttribute('data-repere') || '').toLowerCase();

                            // Rechercher dans le texte OU dans le repère
                            if (itemText.includes(searchTerm) || itemRepere.includes(searchTerm)) {
                                item.style.display = 'block';
                                hasVisibleItems = true;
                            } else {
                                item.style.display = 'none';
                            }
                        });

                        // Afficher/masquer le dossier selon si le nom du dossier correspond ou s'il contient des éléments visibles
                        if (folderName.includes(searchTerm) || hasVisibleItems) {
                            folderHeader.parentElement.style.display = 'block';
                            // Si on recherche, ouvrir automatiquement les dossiers
                            if (searchTerm !== '') {
                                folderContent.style.display = 'block';
                                folderHeader.querySelector('.folder-icon').textContent = '📁';
                                folderHeader.querySelector('span:last-child').textContent = '▼';

                                // Si c'est le nom du dossier qui correspond, montrer tous les items
                                if (folderName.includes(searchTerm)) {
                                    folderContent.querySelectorAll('.favori-item').forEach(item => {
                                        item.style.display = 'block';
                                    });
                                }
                            }
                        } else {
                            folderHeader.parentElement.style.display = 'none';
                        }
                    });
                });

                // Charger les favoris
                updateFavorisList();
            }
        }, 500);
    }

    // Démarrer le script
    init();
})();
