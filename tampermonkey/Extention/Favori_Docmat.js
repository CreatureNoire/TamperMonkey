// ==UserScript==
// @name         DOCMAT - Système de Favoris
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Ajoute un système de favoris avec étoiles sur DOCMAT
// @author       Vous
// @match        https://docmat.sncf.fr/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addStyle
// ==/UserScript==

(function() {
    'use strict';

    // Styles CSS
    GM_addStyle(`
        .add-favorite-button {
            cursor: pointer;
            font-size: 24px;
            color: #ffd700;
            background: white;
            border: 2px solid #ffd700;
            padding: 10px 15px;
            margin-left: 15px;
            transition: all 0.3s ease;
            display: inline-flex;
            align-items: center;
            vertical-align: middle;
            border-radius: 5px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }

        .add-favorite-button:hover {
            transform: scale(1.1);
            text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
            background: #fffef5;
            box-shadow: 0 4px 10px rgba(255, 215, 0, 0.3);
        }

        .add-favorite-button.added {
            color: #28a745;
            border-color: #28a745;
            animation: pulse 0.5s ease;
        }

        @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.3); }
        }

        .nav-tabs-container {
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        .favorites-button {
            background: transparent;
            border: none;
            color: white;
            cursor: pointer;
            padding: 8px 12px;
            margin-left: 10px;
            font-size: 16px;
            transition: all 0.3s ease;
            display: inline-flex;
            align-items: center;
            gap: 5px;
        }

        .favorites-button:hover {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 4px;
        }

        .favorites-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            display: none;
            justify-content: center;
            align-items: center;
            z-index: 10000;
        }

        .favorites-modal.show {
            display: flex;
        }

        .favorites-content {
            background: white;
            padding: 30px;
            border-radius: 8px;
            max-width: 1200px;
            width: 95%;
            max-height: 85vh;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
            display: flex;
            flex-direction: column;
        }

        .favorites-body {
            display: flex;
            gap: 20px;
            flex: 1;
            overflow: hidden;
        }

        .folders-sidebar {
            width: 280px;
            border-right: 2px solid #e0e0e0;
            padding-right: 20px;
            overflow-y: auto;
            flex-shrink: 0;
        }

        .folders-sidebar h3 {
            color: #0088ce;
            margin: 0 0 15px 0;
            font-size: 18px;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .search-box {
            width: 100%;
            padding: 10px;
            margin-bottom: 15px;
            border: 2px solid #ddd;
            border-radius: 5px;
            font-size: 14px;
            transition: all 0.3s ease;
        }

        .search-box:focus {
            outline: none;
            border-color: #0088ce;
            box-shadow: 0 0 8px rgba(0, 136, 206, 0.3);
        }

        .search-box::placeholder {
            color: #999;
        }

        .highlight-match {
            background: #fff3cd;
            padding: 2px 4px;
            border-radius: 3px;
            font-weight: bold;
        }

        .folder-path {
            font-size: 12px;
            color: #666;
            margin-top: 3px;
            font-style: italic;
        }

        .favorites-list-container {
            flex: 1;
            overflow-y: auto;
            padding-left: 20px;
        }

        .favorites-list-container h3 {
            color: #0088ce;
            margin: 0 0 15px 0;
            font-size: 18px;
        }

        .favorites-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 2px solid #0088ce;
        }

        .favorites-header h2 {
            margin: 0;
            color: #0088ce;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .close-modal {
            background: none;
            border: none;
            font-size: 28px;
            cursor: pointer;
            color: #666;
            width: 35px;
            height: 35px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            transition: all 0.3s ease;
        }

        .close-modal:hover {
            background: #f0f0f0;
            color: #000;
        }

        .favorite-item {
            padding: 15px;
            margin-bottom: 10px;
            border: 1px solid #ddd;
            border-radius: 5px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            transition: all 0.3s ease;
            cursor: move;
        }

        .favorite-item:hover {
            background: #f8f9fa;
            border-color: #0088ce;
            box-shadow: 0 2px 8px rgba(0, 136, 206, 0.1);
        }

        .favorite-item.dragging {
            opacity: 0.5;
            background: #e3f2fd;
            border-color: #0088ce;
            transform: rotate(2deg);
        }

        .favorite-item .drag-handle {
            margin-right: 10px;
            color: #999;
            cursor: move;
            font-size: 18px;
        }

        .favorite-info {
            flex: 1;
        }

        .favorite-title {
            font-weight: bold;
            color: #0088ce;
            margin-bottom: 5px;
            cursor: pointer;
            font-size: 18px;
        }

        .favorite-title:hover {
            text-decoration: underline;
            color: #005a9e;
        }

        .favorite-number {
            font-size: 14px;
            color: #666;
            margin-top: 5px;
            font-family: monospace;
        }

        .favorite-actions {
            display: flex;
            gap: 10px;
        }

        .remove-favorite {
            background: #dc3545;
            color: white;
            border: none;
            padding: 8px 15px;
            border-radius: 4px;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .remove-favorite:hover {
            background: #c82333;
            transform: scale(1.05);
        }

        .no-favorites {
            text-align: center;
            padding: 40px;
            color: #666;
            font-style: italic;
        }

        .favorites-count {
            background: #ffd700;
            color: #333;
            border-radius: 50%;
            padding: 2px 8px;
            font-size: 12px;
            font-weight: bold;
            margin-left: 5px;
        }

        .folder-section {
            margin-bottom: 8px;
        }

        .folder-header {
            display: flex;
            align-items: center;
            padding: 10px 12px;
            background: #f8f9fa;
            color: #333;
            border-radius: 5px;
            cursor: pointer;
            transition: all 0.3s ease;
            margin-bottom: 5px;
            border: 2px solid transparent;
        }

        .folder-header:hover {
            background: #e9ecef;
            transform: translateX(3px);
        }

        .folder-header.active {
            background: linear-gradient(135deg, #0088ce 0%, #005a9e 100%);
            color: white;
            border-color: #0088ce;
        }

        .folder-header.drag-over {
            background: linear-gradient(135deg, #28a745 0%, #1e7e34 100%);
            color: white;
            transform: scale(1.05);
            box-shadow: 0 4px 15px rgba(40, 167, 69, 0.4);
        }

        .folder-icon {
            font-size: 16px;
            margin-right: 8px;
        }

        .folder-header.collapsed .folder-icon {
            transform: none;
        }

        .folder-name {
            flex: 1;
            font-weight: bold;
            font-size: 16px;
        }

        .folder-count {
            background: rgba(0, 0, 0, 0.1);
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 11px;
            margin-left: auto;
        }

        .folder-header.active .folder-count {
            background: rgba(255, 255, 255, 0.3);
        }

        .folder-actions {
            display: none;
            gap: 5px;
            margin-left: 8px;
        }

        .folder-header:hover .folder-actions {
            display: flex;
        }

        .folder-header.active .folder-actions {
            display: flex;
        }

        .folder-actions button {
            background: rgba(0, 0, 0, 0.2);
            border: none;
            color: #333;
            padding: 3px 8px;
            border-radius: 3px;
            cursor: pointer;
            font-size: 11px;
            transition: all 0.2s ease;
        }

        .folder-header.active .folder-actions button {
            background: rgba(255, 255, 255, 0.3);
            color: white;
        }

        .folder-actions button:hover {
            background: rgba(0, 0, 0, 0.4);
        }

        .folder-header.active .folder-actions button:hover {
            background: rgba(255, 255, 255, 0.5);
        }

        .folder-content {
            display: none;
        }

        .toolbar {
            display: flex;
            gap: 10px;
            margin-bottom: 20px;
            padding: 15px;
            background: #f8f9fa;
            border-radius: 5px;
        }

        .toolbar button {
            background: #0088ce;
            color: white;
            border: none;
            padding: 10px 15px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 5px;
        }

        .toolbar button:hover {
            background: #006bb3;
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0, 136, 206, 0.3);
        }

        .favorite-item .favorite-folder {
            font-size: 11px;
            color: #999;
            margin-top: 3px;
        }



        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }

        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
    `);

    // Fonctions de gestion des favoris
    function getFavorites() {
        const favorites = GM_getValue('docmat_favorites', '[]');
        return JSON.parse(favorites);
    }

    function saveFavorites(favorites) {
        GM_setValue('docmat_favorites', JSON.stringify(favorites));
    }

    function getFolders() {
        const folders = GM_getValue('docmat_folders', '[]');
        return JSON.parse(folders);
    }

    function saveFolders(folders) {
        GM_setValue('docmat_folders', JSON.stringify(folders));
    }

    function createFolder(name) {
        const folders = getFolders();
        const exists = folders.some(folder => folder.name === name);

        if (!exists && name && name.trim() !== '') {
            folders.push({
                id: Date.now().toString(),
                name: name,
                collapsed: false,
                date: new Date().toISOString()
            });
            saveFolders(folders);
            return true;
        }
        return false;
    }

    function deleteFolder(folderId) {
        let folders = getFolders();
        folders = folders.filter(folder => folder.id !== folderId);
        saveFolders(folders);

        // Retirer le dossier des favoris
        let favorites = getFavorites();
        favorites = favorites.map(fav => {
            if (fav.folderId === folderId) {
                delete fav.folderId;
            }
            return fav;
        });
        saveFavorites(favorites);
    }

    function renameFolder(folderId, newName) {
        let folders = getFolders();
        const folder = folders.find(f => f.id === folderId);
        if (folder && newName && newName.trim() !== '') {
            folder.name = newName;
            saveFolders(folders);
            return true;
        }
        return false;
    }

    function toggleFolder(folderId) {
        let folders = getFolders();
        const folder = folders.find(f => f.id === folderId);
        if (folder) {
            folder.collapsed = !folder.collapsed;
            saveFolders(folders);
        }
    }

    function moveToFolder(number, folderId) {
        let favorites = getFavorites();
        const favorite = favorites.find(fav => fav.number === number);
        if (favorite) {
            if (folderId) {
                favorite.folderId = folderId;
            } else {
                delete favorite.folderId;
            }
            saveFavorites(favorites);
            return true;
        }
        return false;
    }

    function addFavorite(number, title, folderId = null) {
        const favorites = getFavorites();
        const exists = favorites.some(fav => fav.number === number);

        if (!exists && number && number.trim() !== '') {
            const favorite = {
                number: number,
                title: title || number,
                date: new Date().toISOString()
            };
            if (folderId) {
                favorite.folderId = folderId;
            }
            favorites.push(favorite);
            saveFavorites(favorites);
            updateFavoritesCount();
            return true;
        }
        return false;
    }

    function removeFavorite(number) {
        let favorites = getFavorites();
        favorites = favorites.filter(fav => fav.number !== number);
        saveFavorites(favorites);
        updateFavoritesCount();
    }

    function isFavorite(number) {
        const favorites = getFavorites();
        return favorites.some(fav => fav.number === number);
    }

    function updateFavoritesCount() {
        const count = getFavorites().length;
        const countBadge = document.querySelector('.favorites-count');
        if (countBadge) {
            countBadge.textContent = count;
        }
    }

    // Créer le bouton favoris dans le header
    function createFavoritesButton() {
        const headerTitle = document.querySelector('.mastheader-title');

        if (headerTitle && !document.querySelector('.favorites-button')) {
            const favCount = getFavorites().length;
            const button = document.createElement('button');
            button.className = 'favorites-button';
            button.innerHTML = `
                <span style="font-size: 20px;">⭐</span>
                Mes Favoris
                <span class="favorites-count">${favCount}</span>
            `;

            button.addEventListener('click', openFavoritesModal);
            headerTitle.appendChild(button);
        }
    }

    // Créer la modal des favoris
    function createFavoritesModal() {
        if (document.querySelector('.favorites-modal')) return;

        const modal = document.createElement('div');
        modal.className = 'favorites-modal';
        modal.innerHTML = `
            <div class="favorites-content">
                <div class="favorites-header">
                    <h2>
                        <span style="font-size: 28px;">⭐</span>
                        Mes Documents Favoris
                    </h2>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="toolbar">
                    <button class="create-folder-btn">📁 Nouveau Dossier</button>
                </div>
                <div class="favorites-body">
                    <div class="folders-sidebar">
                        <h3>📁 Dossiers</h3>
                        <input type="text" class="search-box" id="folder-search" placeholder="🔍 Rechercher un dossier...">
                        <div class="folders-tree"></div>
                    </div>
                    <div class="favorites-list-container">
                        <h3 id="current-folder-title">📄 Tous les favoris</h3>
                        <input type="text" class="search-box" id="favorites-search" placeholder="🔍 Rechercher un favori...">
                        <div class="favorites-list"></div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Fermer la modal
        modal.querySelector('.close-modal').addEventListener('click', closeFavoritesModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeFavoritesModal();
            }
        });

        // Bouton créer un dossier
        modal.querySelector('.create-folder-btn').addEventListener('click', createNewFolder);

        // Recherche dans les dossiers
        modal.querySelector('#folder-search').addEventListener('input', (e) => {
            filterFolders(e.target.value);
        });

        // Recherche dans les favoris
        modal.querySelector('#favorites-search').addEventListener('input', (e) => {
            filterFavorites(e.target.value);
        });
    }

    function openFavoritesModal() {
        createFavoritesModal();
        updateFavoritesList();
        document.querySelector('.favorites-modal').classList.add('show');
    }

    function closeFavoritesModal() {
        const modal = document.querySelector('.favorites-modal');
        if (modal) {
            modal.classList.remove('show');
        }
    }

    let currentFolderId = 'all';
    let folderSearchQuery = '';
    let favoritesSearchQuery = '';

    function updateFavoritesList() {
        updateFoldersTree();
        updateFavoritesDisplay();
    }

    function updateFoldersTree() {
        const treeContainer = document.querySelector('.folders-tree');
        if (!treeContainer) return;

        const favorites = getFavorites();
        const folders = getFolders();

        // Filtrer les dossiers selon la recherche
        const filteredFolders = folderSearchQuery
            ? folders.filter(f => f.name.toLowerCase().includes(folderSearchQuery.toLowerCase()))
            : folders;

        let html = '';

        // Option "Tous les favoris" (toujours visible)
        const allCount = favorites.length;
        html += `<div class="folder-section">`;
        html += `<div class="folder-header ${currentFolderId === 'all' ? 'active' : ''}" data-folder-id="all">`;
        html += '<span class="folder-icon">⭐</span>';
        html += '<span class="folder-name">Tous</span>';
        html += `<span class="folder-count">${allCount}</span>`;
        html += '</div></div>';

        // Favoris sans dossier (toujours visible si > 0)
        const unfolderedCount = favorites.filter(fav => !fav.folderId).length;
        if (unfolderedCount > 0) {
            html += `<div class="folder-section">`;
            html += `<div class="folder-header ${currentFolderId === '' ? 'active' : ''}" data-folder-id="">`;
            html += '<span class="folder-icon">📄</span>';
            html += '<span class="folder-name">Sans dossier</span>';
            html += `<span class="folder-count">${unfolderedCount}</span>`;
            html += '</div></div>';
        }

        // Dossiers filtrés
        filteredFolders.forEach(folder => {
            const folderCount = favorites.filter(fav => fav.folderId === folder.id).length;
            html += `<div class="folder-section">`;
            html += `<div class="folder-header ${currentFolderId === folder.id ? 'active' : ''}" data-folder-id="${folder.id}">`;
            html += '<span class="folder-icon">📁</span>';

            // Highlight le texte recherché
            let folderNameHtml = folder.name;
            if (folderSearchQuery) {
                const regex = new RegExp(`(${folderSearchQuery})`, 'gi');
                folderNameHtml = folder.name.replace(regex, '<span class="highlight-match">$1</span>');
            }
            html += `<span class="folder-name">${folderNameHtml}</span>`;
            html += `<span class="folder-count">${folderCount}</span>`;
            html += '<div class="folder-actions">';
            html += `<button class="rename-folder" data-folder-id="${folder.id}" title="Renommer">✏️</button>`;
            html += `<button class="delete-folder" data-folder-id="${folder.id}" title="Supprimer">🗑️</button>`;
            html += '</div></div></div>';
        });

        if (folderSearchQuery && filteredFolders.length === 0) {
            html += '<div class="no-favorites" style="padding: 20px; font-size: 14px;">Aucun dossier trouvé</div>';
        }

        treeContainer.innerHTML = html;

        // Événements pour sélectionner un dossier
        treeContainer.querySelectorAll('.folder-header').forEach(header => {
            header.addEventListener('click', (e) => {
                if (e.target.classList.contains('rename-folder') ||
                    e.target.classList.contains('delete-folder')) {
                    return;
                }
                const folderId = header.getAttribute('data-folder-id');
                currentFolderId = folderId;
                updateFavoritesList();
            });
        });

        // Événements pour renommer
        treeContainer.querySelectorAll('.rename-folder').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const folderId = e.target.getAttribute('data-folder-id');
                const folders = getFolders();
                const folder = folders.find(f => f.id === folderId);
                if (folder) {
                    const newName = prompt('Nouveau nom du dossier:', folder.name);
                    if (newName && newName.trim() !== '') {
                        renameFolder(folderId, newName);
                        updateFavoritesList();
                    }
                }
            });
        });

        // Événements pour supprimer
        treeContainer.querySelectorAll('.delete-folder').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const folderId = e.target.getAttribute('data-folder-id');
                if (confirm('Supprimer ce dossier ? (Les favoris seront déplacés dans "Sans dossier")')) {
                    deleteFolder(folderId);
                    if (currentFolderId === folderId) {
                        currentFolderId = 'all';
                    }
                    updateFavoritesList();
                }
            });
        });

        // Drop zones sur les dossiers de l'arborescence
        treeContainer.querySelectorAll('.folder-header').forEach(header => {
            header.addEventListener('dragover', handleDragOver);
            header.addEventListener('dragleave', handleDragLeave);
            header.addEventListener('drop', handleDrop);
        });
    }

    function updateFavoritesDisplay() {
        const listContainer = document.querySelector('.favorites-list');
        const titleElement = document.querySelector('#current-folder-title');
        if (!listContainer) return;

        const favorites = getFavorites();
        const folders = getFolders();

        // Filtrer selon le dossier sélectionné
        let filteredFavorites;
        let folderTitle;

        if (currentFolderId === 'all') {
            filteredFavorites = favorites;
            folderTitle = '⭐ Tous les favoris';
        } else if (currentFolderId === '') {
            filteredFavorites = favorites.filter(fav => !fav.folderId);
            folderTitle = '📄 Sans dossier';
        } else {
            filteredFavorites = favorites.filter(fav => fav.folderId === currentFolderId);
            const folder = folders.find(f => f.id === currentFolderId);
            folderTitle = folder ? `📁 ${folder.name}` : '📁 Dossier';
        }

        // Filtrer selon la recherche
        if (favoritesSearchQuery) {
            filteredFavorites = filteredFavorites.filter(fav =>
                fav.title.toLowerCase().includes(favoritesSearchQuery.toLowerCase()) ||
                fav.number.toLowerCase().includes(favoritesSearchQuery.toLowerCase())
            );
        }

        if (titleElement) {
            titleElement.textContent = folderTitle;
        }

        if (filteredFavorites.length === 0) {
            if (favoritesSearchQuery) {
                listContainer.innerHTML = '<div class="no-favorites">Aucun favori trouvé pour cette recherche.</div>';
            } else {
                listContainer.innerHTML = '<div class="no-favorites">Aucun document dans cette catégorie.</div>';
            }
            return;
        }

        listContainer.innerHTML = renderFavorites(filteredFavorites);

        // Attacher les événements
        attachFavoriteEvents();
    }

    function renderFavorites(favorites) {
        const folders = getFolders();
        return favorites.map(fav => {
            // Highlight le texte recherché
            let titleHtml = fav.title;
            let numberHtml = fav.number;

            if (favoritesSearchQuery) {
                const regex = new RegExp(`(${favoritesSearchQuery})`, 'gi');
                titleHtml = fav.title.replace(regex, '<span class="highlight-match">$1</span>');
                numberHtml = fav.number.replace(regex, '<span class="highlight-match">$1</span>');
            }

            // Afficher le chemin du dossier si on est en mode recherche
            let folderPath = '';
            if (favoritesSearchQuery && fav.folderId) {
                const folder = folders.find(f => f.id === fav.folderId);
                if (folder) {
                    folderPath = `<div class="folder-path">📁 ${folder.name}</div>`;
                }
            } else if (favoritesSearchQuery && !fav.folderId) {
                folderPath = `<div class="folder-path">📄 Sans dossier</div>`;
            }

            return `
                <div class="favorite-item" draggable="true" data-number="${fav.number}">
                    <span class="drag-handle">⋮⋮</span>
                    <div class="favorite-info">
                        <div class="favorite-title" data-number="${fav.number}">${titleHtml}</div>
                        <div class="favorite-number">Numéro: ${numberHtml}</div>
                        ${folderPath}
                    </div>
                    <div class="favorite-actions">
                        <button class="remove-favorite" data-number="${fav.number}">
                            🗑️ Supprimer
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    function attachFavoriteEvents() {
        const listContainer = document.querySelector('.favorites-list');
        if (!listContainer) return;

        // Cliquer sur le titre pour remplir le champ
        listContainer.querySelectorAll('.favorite-title').forEach(title => {
            title.addEventListener('click', (e) => {
                const number = e.target.getAttribute('data-number');
                fillSearchField(number);
                closeFavoritesModal();
            });
        });

        // Supprimer un favori
        listContainer.querySelectorAll('.remove-favorite').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const number = e.target.getAttribute('data-number');
                removeFavorite(number);
                updateFavoritesList();
            });
        });

        // Drag & Drop pour les favoris
        listContainer.querySelectorAll('.favorite-item').forEach(item => {
            item.addEventListener('dragstart', handleDragStart);
            item.addEventListener('dragend', handleDragEnd);
        });
    }

    let draggedNumber = null;

    function handleDragStart(e) {
        draggedNumber = e.currentTarget.getAttribute('data-number');
        e.currentTarget.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', e.currentTarget.innerHTML);
    }

    function handleDragEnd(e) {
        e.currentTarget.classList.remove('dragging');
        draggedNumber = null;
    }

    function handleDragOver(e) {
        if (e.preventDefault) {
            e.preventDefault();
        }
        e.dataTransfer.dropEffect = 'move';
        e.currentTarget.classList.add('drag-over');
        return false;
    }

    function handleDragLeave(e) {
        e.currentTarget.classList.remove('drag-over');
    }

    function handleDrop(e) {
        if (e.stopPropagation) {
            e.stopPropagation();
        }
        e.preventDefault();

        e.currentTarget.classList.remove('drag-over');

        if (draggedNumber) {
            const folderId = e.currentTarget.getAttribute('data-folder-id');

            // Si c'est "Tous", ne rien faire
            if (folderId === 'all') {
                return false;
            }

            // Si c'est le dossier "Sans dossier", passer null
            if (folderId === '' || !folderId) {
                moveToFolder(draggedNumber, null);
                showNotification('📄 Déplacé vers "Sans dossier"');
            } else {
                const folders = getFolders();
                const folder = folders.find(f => f.id === folderId);
                moveToFolder(draggedNumber, folderId);
                showNotification(`📁 Déplacé vers "${folder.name}"`);
            }

            updateFavoritesList();
        }

        return false;
    }

    function showFolderSelectionDialog(number) {
        const folders = getFolders();

        if (folders.length === 0) {
            alert('Aucun dossier disponible. Créez d\'abord un dossier !');
            return;
        }

        let options = 'Choisissez un dossier:\n\n0. Sans dossier\n';
        folders.forEach((folder, index) => {
            options += `${index + 1}. ${folder.name}\n`;
        });

        const choice = prompt(options + '\nEntrez le numéro:');

        if (choice === null) return;

        const index = parseInt(choice);
        if (index === 0) {
            moveToFolder(number, null);
            updateFavoritesList();
        } else if (index > 0 && index <= folders.length) {
            const folderId = folders[index - 1].id;
            moveToFolder(number, folderId);
            updateFavoritesList();
        } else {
            alert('Choix invalide !');
        }
    }

    // Fonction pour créer un nouveau dossier
    function createNewFolder() {
        const name = prompt('Nom du nouveau dossier:');
        if (name && name.trim() !== '') {
            if (createFolder(name)) {
                updateFavoritesList();
                showNotification('✅ Dossier créé !');
            } else {
                alert('⚠️ Ce dossier existe déjà !');
            }
        }
    }

    // Filtrer les dossiers
    function filterFolders(query) {
        folderSearchQuery = query.trim();
        updateFoldersTree();
    }

    // Filtrer les favoris
    function filterFavorites(query) {
        favoritesSearchQuery = query.trim();
        updateFavoritesDisplay();
    }

    // Remplir le champ de recherche avec un numéro
    function fillSearchField(number) {
        const searchInput = document.querySelector('#input-search-field');
        if (searchInput) {
            searchInput.value = number;
            // Déclencher les événements pour que l'application détecte le changement
            searchInput.dispatchEvent(new Event('input', { bubbles: true }));
            searchInput.dispatchEvent(new Event('change', { bubbles: true }));
            searchInput.focus();
        }
    }

    // Créer le bouton pour ajouter aux favoris à droite des onglets de navigation
    function createAddFavoriteButton() {
        const navTabs = document.querySelector('nav.nav-tabs');

        if (navTabs && !document.querySelector('.add-favorite-button')) {
            const button = document.createElement('button');
            button.className = 'add-favorite-button';
            button.innerHTML = '⭐';
            button.title = 'Ajouter ce numéro aux favoris';

            button.addEventListener('click', (e) => {
                e.preventDefault();
                const searchInput = document.querySelector('#input-search-field');

                if (!searchInput) {
                    alert('⚠️ Champ de recherche non trouvé.');
                    return;
                }

                const number = searchInput.value.trim();

                if (number === '') {
                    alert('⚠️ Veuillez entrer un numéro de document avant de l\'ajouter aux favoris.');
                    return;
                }

                if (isFavorite(number)) {
                    alert('ℹ️ Ce numéro est déjà dans vos favoris.');
                    return;
                }

                // Demander un titre personnalisé (optionnel)
                const title = prompt('Donnez un nom à ce favori (optionnel):', number);

                if (title !== null) { // L'utilisateur n'a pas annulé
                    const finalTitle = title.trim() || number;
                    if (addFavorite(number, finalTitle)) {
                        button.classList.add('added');
                        setTimeout(() => button.classList.remove('added'), 500);

                        // Notification de succès
                        showNotification('✅ Ajouté aux favoris !');
                    }
                }
            });

            // Créer un conteneur pour aligner les onglets et le bouton
            const parent = navTabs.parentElement;
            if (parent) {
                const container = document.createElement('div');
                container.className = 'nav-tabs-container';

                // Remplacer la nav dans le DOM
                parent.insertBefore(container, navTabs);
                container.appendChild(navTabs);
                container.appendChild(button);
            }
        }
    }

    // Afficher une notification temporaire
    function showNotification(message) {
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #28a745;
            color: white;
            padding: 15px 25px;
            border-radius: 5px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 10001;
            font-weight: bold;
            animation: slideIn 0.3s ease;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    }

    // Initialisation et observation
    function init() {
        createFavoritesButton();
        createAddFavoriteButton();

        // Observer les changements dans le DOM
        const observer = new MutationObserver(() => {
            createFavoritesButton();
            createAddFavoriteButton();
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // Attendre que le DOM soit chargé
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
