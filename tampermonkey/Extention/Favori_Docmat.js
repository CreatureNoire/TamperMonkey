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
        /* Bouton d'ajout aux favoris */
        .add-favorite-button {
            cursor: pointer;
            font-size: 24px;
            color: #d8b4fe;
            background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
            border: 2px solid #d8b4fe;
            padding: 10px 15px;
            margin-left: 15px;
            transition: all 0.3s ease;
            display: inline-flex;
            align-items: center;
            vertical-align: middle;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(216, 180, 254, 0.3);
        }

        .add-favorite-button:hover {
            transform: scale(1.1);
            background: linear-gradient(135deg, #7e22ce 0%, #a855f7 100%);
            box-shadow: 0 6px 20px rgba(216, 180, 254, 0.5);
            border-color: #a855f7;
        }

        .add-favorite-button.added {
            color: #22c55e;
            border-color: #22c55e;
            animation: pulse 0.5s ease;
            background: linear-gradient(135deg, #166534 0%, #15803d 100%);
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
            background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
            border: 1px solid #333;
            color: white;
            cursor: pointer;
            padding: 10px 16px;
            margin-left: 10px;
            font-size: 16px;
            transition: all 0.3s ease;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
        }

        .favorites-button:hover {
            background: linear-gradient(135deg, #7e22ce 0%, #a855f7 100%);
            border-color: #d8b4fe;
            transform: translateY(-2px);
            box-shadow: 0 4px 15px rgba(216, 180, 254, 0.4);
        }

        .favorites-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.85);
            display: none;
            justify-content: center;
            align-items: center;
            z-index: 10000;
            backdrop-filter: blur(8px);
        }

        .favorites-modal.show {
            display: flex;
            animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }

        .favorites-content {
            background: #000;
            padding: 30px;
            border-radius: 24px;
            max-width: 1200px;
            width: 95%;
            max-height: 85vh;
            overflow: hidden;
            box-shadow: 0 0 40px rgba(216, 180, 254, 0.3);
            display: flex;
            flex-direction: column;
            border: 1px solid #1a1a1a;
        }

        .favorites-body {
            display: flex;
            gap: 20px;
            flex: 1;
            overflow: hidden;
        }

        .folders-sidebar {
            width: 280px;
            border-right: 2px solid #1a1a1a;
            padding-right: 20px;
            overflow-y: auto;
            flex-shrink: 0;
            background: rgba(26, 26, 26, 0.3);
            padding: 20px;
            border-radius: 12px;
        }

        .folders-sidebar h3 {
            color: #d8b4fe;
            margin: 0 0 15px 0;
            font-size: 18px;
            display: flex;
            align-items: center;
            gap: 8px;
            font-weight: 600;
        }

        .search-box {
            width: 100%;
            padding: 14px;
            margin-bottom: 15px;
            border: 1px solid #1a1a1a;
            border-radius: 8px;
            font-size: 14px;
            transition: all 0.3s ease;
            background: #121212;
            color: white;
            font-family: 'Inter', sans-serif;
        }

        .search-box:focus {
            outline: none;
            border-color: #7e22ce;
            box-shadow: 0 0 12px rgba(126, 34, 206, 0.4);
            background: #1a1a1a;
        }

        .search-box::placeholder {
            color: #666;
        }

        .highlight-match {
            background: #7e22ce;
            color: white;
            padding: 2px 6px;
            border-radius: 4px;
            font-weight: bold;
        }

        .folder-path {
            font-size: 12px;
            color: #888;
            margin-top: 3px;
            font-style: italic;
        }

        .favorites-list-container {
            flex: 1;
            overflow-y: auto;
            padding-left: 20px;
        }

        .favorites-list-container h3 {
            color: #d8b4fe;
            margin: 0 0 15px 0;
            font-size: 18px;
            font-weight: 600;
        }

        .favorites-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 2px solid #1a1a1a;
        }

        .favorites-header h2 {
            margin: 0;
            color: #d8b4fe;
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 26px;
            font-weight: 600;
        }

        .close-modal {
            background: transparent;
            border: 1px solid #333;
            font-size: 24px;
            cursor: pointer;
            color: #888;
            width: 35px;
            height: 35px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 8px;
            transition: all 0.3s ease;
        }

        .close-modal:hover {
            background: #1a1a1a;
            color: white;
            border-color: #555;
        }

        .favorite-item {
            padding: 16px;
            margin-bottom: 12px;
            border: 1px solid #1a1a1a;
            border-radius: 12px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            transition: all 0.3s ease;
            cursor: move;
            background: rgba(26, 26, 26, 0.5);
        }

        .favorite-item:hover {
            background: #1a1a1a;
            border-color: #7e22ce;
            box-shadow: 0 4px 15px rgba(126, 34, 206, 0.3);
            transform: translateY(-2px);
        }

        .favorite-item.dragging {
            opacity: 0.6;
            background: rgba(126, 34, 206, 0.2);
            border-color: #7e22ce;
            transform: rotate(2deg);
        }

        .favorite-item .drag-handle {
            margin-right: 12px;
            color: #666;
            cursor: move;
            font-size: 18px;
        }

        .favorite-info {
            flex: 1;
        }

        .favorite-title {
            font-weight: 600;
            color: #d8b4fe;
            margin-bottom: 6px;
            cursor: pointer;
            font-size: 16px;
            transition: all 0.2s ease;
        }

        .favorite-title:hover {
            color: #a855f7;
        }

        .favorite-number {
            font-size: 13px;
            color: #888;
            margin-top: 5px;
            font-family: 'Courier New', monospace;
        }

        .favorite-actions {
            display: flex;
            gap: 10px;
        }

        .edit-favorite {
            background: linear-gradient(135deg, #d97706 0%, #f59e0b 100%);
            color: white;
            border: none;
            padding: 10px 16px;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s ease;
            font-weight: 600;
            font-size: 13px;
            box-shadow: 0 2px 8px rgba(217, 119, 6, 0.3);
        }

        .edit-favorite:hover {
            background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%);
            transform: scale(1.05);
            box-shadow: 0 4px 12px rgba(217, 119, 6, 0.5);
        }

        .remove-favorite {
            background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%);
            color: white;
            border: none;
            padding: 10px 16px;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s ease;
            font-weight: 600;
            font-size: 13px;
            box-shadow: 0 2px 8px rgba(220, 38, 38, 0.3);
        }

        .remove-favorite:hover {
            background: linear-gradient(135deg, #ef4444 0%, #f87171 100%);
            transform: scale(1.05);
            box-shadow: 0 4px 12px rgba(220, 38, 38, 0.5);
        }

        .no-favorites {
            text-align: center;
            padding: 60px 40px;
            color: #666;
            font-style: italic;
            font-size: 15px;
        }

        .favorites-count {
            background: linear-gradient(135deg, #7e22ce 0%, #a855f7 100%);
            color: white;
            border-radius: 50%;
            padding: 3px 10px;
            font-size: 12px;
            font-weight: bold;
            margin-left: 8px;
            box-shadow: 0 2px 8px rgba(126, 34, 206, 0.4);
        }

        .folder-section {
            margin-bottom: 8px;
        }

        .folder-header {
            display: flex;
            align-items: center;
            padding: 12px 14px;
            background: rgba(255, 255, 255, 0.05);
            color: white;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s ease;
            margin-bottom: 6px;
            border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .folder-header:hover {
            background: rgba(255, 255, 255, 0.08);
            border-color: rgba(216, 180, 254, 0.3);
            transform: translateX(4px);
        }

        .folder-header.active {
            background: linear-gradient(135deg, #7e22ce 0%, #a855f7 100%);
            color: white;
            border-color: #d8b4fe;
            box-shadow: 0 4px 12px rgba(126, 34, 206, 0.4);
        }

        .folder-header.drag-over {
            background: linear-gradient(135deg, #16a34a 0%, #22c55e 100%);
            color: white;
            transform: scale(1.05);
            box-shadow: 0 4px 15px rgba(34, 197, 94, 0.5);
        }

        .folder-icon {
            font-size: 16px;
            margin-right: 10px;
        }

        .folder-header.collapsed .folder-icon {
            transform: none;
        }

        .folder-name {
            flex: 1;
            font-weight: 600;
            font-size: 14px;
        }

        .folder-count {
            background: rgba(0, 0, 0, 0.3);
            padding: 3px 10px;
            border-radius: 12px;
            font-size: 11px;
            margin-left: auto;
            font-weight: 600;
        }

        .folder-header.active .folder-count {
            background: rgba(255, 255, 255, 0.25);
        }

        .folder-actions {
            display: none;
            gap: 6px;
            margin-left: 10px;
        }

        .folder-header:hover .folder-actions {
            display: flex;
        }

        .folder-header.active .folder-actions {
            display: flex;
        }

        .folder-actions button {
            background: rgba(0, 0, 0, 0.3);
            border: 1px solid rgba(255, 255, 255, 0.1);
            color: white;
            padding: 4px 10px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 11px;
            transition: all 0.2s ease;
        }

        .folder-header.active .folder-actions button {
            background: rgba(255, 255, 255, 0.2);
            color: white;
            border-color: rgba(255, 255, 255, 0.3);
        }

        .folder-actions button:hover {
            background: rgba(255, 255, 255, 0.3);
            transform: scale(1.1);
        }

        .folder-header.active .folder-actions button:hover {
            background: rgba(255, 255, 255, 0.4);
        }

        .folder-content {
            display: none;
        }

        .toolbar {
            display: flex;
            gap: 12px;
            margin-bottom: 24px;
            padding: 16px;
            background: rgba(26, 26, 26, 0.5);
            border-radius: 12px;
            border: 1px solid #1a1a1a;
        }

        .toolbar button {
            background: linear-gradient(135deg, #7e22ce 0%, #a855f7 100%);
            color: white;
            border: none;
            padding: 12px 18px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 600;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 8px;
            box-shadow: 0 2px 10px rgba(126, 34, 206, 0.3);
        }

        .toolbar button:hover {
            background: linear-gradient(135deg, #a855f7 0%, #c084fc 100%);
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(126, 34, 206, 0.5);
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

        /* Styles pour la modal des termes personnalisés */
        .custom-terms-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.85);
            display: none;
            justify-content: center;
            align-items: center;
            z-index: 10001;
            backdrop-filter: blur(8px);
        }

        .custom-terms-modal.show {
            display: flex;
            animation: fadeIn 0.3s ease;
        }

        .custom-terms-content {
            background: #000;
            padding: 30px;
            border-radius: 24px;
            max-width: 600px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
            box-shadow: 0 0 40px rgba(216, 180, 254, 0.3);
            border: 1px solid #1a1a1a;
        }

        .custom-terms-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 24px;
            padding-bottom: 16px;
            border-bottom: 2px solid #1a1a1a;
        }

        .custom-terms-header h3 {
            margin: 0;
            color: #d8b4fe;
            font-size: 22px;
            font-weight: 600;
        }

        .terms-section {
            margin-bottom: 28px;
        }

        .terms-section h4 {
            color: #ccc;
            margin-bottom: 12px;
            font-size: 15px;
            font-weight: 600;
        }

        .terms-buttons {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            margin-bottom: 16px;
        }

        .term-button {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            padding: 10px 16px;
            border-radius: 20px;
            cursor: pointer;
            transition: all 0.3s ease;
            font-size: 14px;
            display: flex;
            align-items: center;
            gap: 8px;
            color: white;
        }

        .term-button:hover {
            background: rgba(255, 255, 255, 0.1);
            border-color: rgba(216, 180, 254, 0.4);
            transform: translateY(-2px);
        }

        .term-button.selected {
            background: linear-gradient(135deg, #7e22ce 0%, #a855f7 100%);
            color: white;
            border-color: #d8b4fe;
            box-shadow: 0 4px 12px rgba(126, 34, 206, 0.4);
        }

        .term-button .remove-term {
            margin-left: 6px;
            color: #ef4444;
            font-weight: bold;
            cursor: pointer;
            font-size: 18px;
            transition: all 0.2s ease;
        }

        .term-button.selected .remove-term {
            color: #fca5a5;
        }

        .term-button .remove-term:hover {
            transform: scale(1.2);
        }

        .add-term-input {
            display: flex;
            gap: 12px;
            margin-top: 12px;
        }

        .add-term-input input {
            flex: 1;
            padding: 14px;
            border: 1px solid #1a1a1a;
            border-radius: 8px;
            font-size: 14px;
            background: #121212;
            color: white;
            font-family: 'Inter', sans-serif;
            transition: all 0.3s ease;
        }

        .add-term-input input:focus {
            outline: none;
            border-color: #7e22ce;
            box-shadow: 0 0 12px rgba(126, 34, 206, 0.4);
            background: #1a1a1a;
        }

        .add-term-input button {
            background: linear-gradient(135deg, #16a34a 0%, #22c55e 100%);
            color: white;
            border: none;
            padding: 14px 24px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 600;
            transition: all 0.3s ease;
            box-shadow: 0 2px 10px rgba(34, 197, 94, 0.3);
        }

        .add-term-input button:hover {
            background: linear-gradient(135deg, #22c55e 0%, #4ade80 100%);
            transform: scale(1.05);
            box-shadow: 0 4px 15px rgba(34, 197, 94, 0.5);
        }

        .preview-section {
            background: rgba(26, 26, 26, 0.5);
            padding: 18px;
            border-radius: 12px;
            margin-bottom: 24px;
            border: 1px solid #1a1a1a;
        }

        .preview-section h4 {
            margin-top: 0;
            margin-bottom: 10px;
            color: #d8b4fe;
            font-size: 13px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .preview-text {
            font-size: 16px;
            font-weight: 600;
            color: white;
            word-wrap: break-word;
            line-height: 1.4;
        }

        .modal-actions {
            display: flex;
            gap: 12px;
            justify-content: flex-end;
        }

        .modal-actions button {
            padding: 12px 28px;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 600;
            transition: all 0.3s ease;
        }

        .btn-validate {
            background: linear-gradient(135deg, #7e22ce 0%, #a855f7 100%);
            color: white;
            box-shadow: 0 2px 10px rgba(126, 34, 206, 0.3);
        }

        .btn-validate:hover {
            background: linear-gradient(135deg, #a855f7 0%, #c084fc 100%);
            transform: scale(1.05);
            box-shadow: 0 4px 15px rgba(126, 34, 206, 0.5);
        }

        .btn-cancel {
            background: transparent;
            color: white;
            border: 1px solid #333;
        }

        .btn-cancel:hover {
            background: #1a1a1a;
            border-color: #555;
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

    function getCustomTerms() {
        const terms = GM_getValue('docmat_custom_terms', '[]');
        return JSON.parse(terms);
    }

    function saveCustomTerms(terms) {
        GM_setValue('docmat_custom_terms', JSON.stringify(terms));
    }

    function addCustomTerm(term) {
        const terms = getCustomTerms();
        if (term && term.trim() !== '' && !terms.includes(term.trim())) {
            terms.push(term.trim());
            saveCustomTerms(terms);
            return true;
        }
        return false;
    }

    function removeCustomTerm(term) {
        let terms = getCustomTerms();
        terms = terms.filter(t => t !== term);
        saveCustomTerms(terms);
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

    function updateFavorite(number, newTitle) {
        let favorites = getFavorites();
        const favorite = favorites.find(fav => fav.number === number);
        if (favorite) {
            favorite.title = newTitle;
            saveFavorites(favorites);
            return true;
        }
        return false;
    }

    function isFavorite(number) {
        const favorites = getFavorites();
        return favorites.some(fav => fav.number === number);
    }

    function getFavoriteByNumber(number) {
        const favorites = getFavorites();
        return favorites.find(fav => fav.number === number);
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
                        <button class="edit-favorite" data-number="${fav.number}">
                            ✏️ Modifier
                        </button>
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

        // Modifier un favori
        listContainer.querySelectorAll('.edit-favorite').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const number = e.target.getAttribute('data-number');
                openEditModal(number);
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

                // Ouvrir la modal de personnalisation
                openCustomTermsModal(number);
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

    // Créer la modal des termes personnalisés
    function createCustomTermsModal() {
        if (document.querySelector('.custom-terms-modal')) return;

        const modal = document.createElement('div');
        modal.className = 'custom-terms-modal';
        modal.innerHTML = `
            <div class="custom-terms-content">
                <div class="custom-terms-header">
                    <h3>🏷️ Personnaliser le nom du document</h3>
                    <button class="close-modal">&times;</button>
                </div>
                
                <div class="preview-section">
                    <h4>Aperçu du nom final :</h4>
                    <div class="preview-text" id="term-preview"></div>
                </div>

                <div class="terms-section">
                    <h4>Sélectionnez des termes à ajouter :</h4>
                    <div class="terms-buttons" id="terms-list"></div>
                    <div class="add-term-input">
                        <input type="text" id="new-term-input" placeholder="Ajouter un nouveau terme...">
                        <button id="add-term-btn">➕ Ajouter</button>
                    </div>
                </div>

                <div class="modal-actions">
                    <button class="btn-cancel">Annuler</button>
                    <button class="btn-validate">✅ Valider</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Fermer la modal
        modal.querySelector('.close-modal').addEventListener('click', closeCustomTermsModal);
        modal.querySelector('.btn-cancel').addEventListener('click', closeCustomTermsModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeCustomTermsModal();
            }
        });
    }

    let currentDocNumber = '';
    let selectedTerms = [];
    let isEditMode = false;

    function openCustomTermsModal(number) {
        currentDocNumber = number;
        selectedTerms = [];
        isEditMode = false;

        createCustomTermsModal();
        const modal = document.querySelector('.custom-terms-modal');
        
        // Changer le titre
        modal.querySelector('.custom-terms-header h3').textContent = '🏷️ Personnaliser le nom du document';
        
        updateTermsList();
        updatePreview();

        // Valider
        const validateBtn = modal.querySelector('.btn-validate');
        validateBtn.onclick = () => {
            const finalTitle = buildFinalTitle();
            if (addFavorite(number, finalTitle)) {
                const addButton = document.querySelector('.add-favorite-button');
                if (addButton) {
                    addButton.classList.add('added');
                    setTimeout(() => addButton.classList.remove('added'), 500);
                }
                showNotification('✅ Ajouté aux favoris !');
                closeCustomTermsModal();
            }
        };

        // Ajouter un nouveau terme
        const addTermBtn = modal.querySelector('#add-term-btn');
        const newTermInput = modal.querySelector('#new-term-input');
        
        addTermBtn.onclick = () => {
            const term = newTermInput.value.trim();
            if (term !== '') {
                if (addCustomTerm(term)) {
                    newTermInput.value = '';
                    updateTermsList();
                    showNotification('✅ Terme ajouté !');
                } else {
                    alert('⚠️ Ce terme existe déjà ou est invalide.');
                }
            }
        };

        // Permettre d'ajouter avec Enter
        newTermInput.onkeypress = (e) => {
            if (e.key === 'Enter') {
                addTermBtn.click();
            }
        };

        modal.classList.add('show');
    }

    function openEditModal(number) {
        const favorite = getFavoriteByNumber(number);
        if (!favorite) return;

        currentDocNumber = number;
        isEditMode = true;

        // Extraire les termes existants du titre
        selectedTerms = extractTermsFromTitle(favorite.title, number);

        createCustomTermsModal();
        const modal = document.querySelector('.custom-terms-modal');
        
        // Changer le titre
        modal.querySelector('.custom-terms-header h3').textContent = '✏️ Modifier le nom du document';
        
        updateTermsList();
        updatePreview();

        // Valider
        const validateBtn = modal.querySelector('.btn-validate');
        validateBtn.textContent = '✅ Enregistrer';
        validateBtn.onclick = () => {
            const finalTitle = buildFinalTitle();
            if (updateFavorite(number, finalTitle)) {
                showNotification('✅ Favori modifié !');
                closeCustomTermsModal();
                updateFavoritesList();
            }
        };

        // Ajouter un nouveau terme
        const addTermBtn = modal.querySelector('#add-term-btn');
        const newTermInput = modal.querySelector('#new-term-input');
        
        addTermBtn.onclick = () => {
            const term = newTermInput.value.trim();
            if (term !== '') {
                if (addCustomTerm(term)) {
                    newTermInput.value = '';
                    updateTermsList();
                    showNotification('✅ Terme ajouté !');
                } else {
                    alert('⚠️ Ce terme existe déjà ou est invalide.');
                }
            }
        };

        // Permettre d'ajouter avec Enter
        newTermInput.onkeypress = (e) => {
            if (e.key === 'Enter') {
                addTermBtn.click();
            }
        };

        modal.classList.add('show');
    }

    function extractTermsFromTitle(title, number) {
        // Si le titre est juste le numéro, pas de termes
        if (title === number) {
            return [];
        }

        // Format attendu: "Terme1 + Terme2 - Numéro"
        const parts = title.split(' - ');
        if (parts.length < 2) {
            return [];
        }

        // Prendre tout sauf la dernière partie (qui est le numéro)
        const termsPart = parts.slice(0, -1).join(' - ');
        
        // Séparer par " + "
        const terms = termsPart.split(' + ').map(t => t.trim()).filter(t => t !== '');
        
        return terms;
    }

    function closeCustomTermsModal() {
        const modal = document.querySelector('.custom-terms-modal');
        if (modal) {
            modal.classList.remove('show');
        }
        currentDocNumber = '';
        selectedTerms = [];
        isEditMode = false;
    }

    function updateTermsList() {
        const termsList = document.querySelector('#terms-list');
        if (!termsList) return;

        const terms = getCustomTerms();
        
        if (terms.length === 0) {
            termsList.innerHTML = '<p style="color: #999; font-style: italic;">Aucun terme personnalisé. Ajoutez-en un ci-dessous.</p>';
            return;
        }

        termsList.innerHTML = terms.map(term => {
            const isSelected = selectedTerms.includes(term);
            return `
                <div class="term-button ${isSelected ? 'selected' : ''}" data-term="${term}">
                    ${term}
                    <span class="remove-term" data-term="${term}" title="Supprimer ce terme">×</span>
                </div>
            `;
        }).join('');

        // Événements pour sélectionner/désélectionner
        termsList.querySelectorAll('.term-button').forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (e.target.classList.contains('remove-term')) {
                    return; // Géré par l'événement suivant
                }
                const term = btn.getAttribute('data-term');
                toggleTerm(term);
            });
        });

        // Événements pour supprimer un terme
        termsList.querySelectorAll('.remove-term').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const term = btn.getAttribute('data-term');
                if (confirm(`Supprimer le terme "${term}" ?\n(Il sera retiré de la liste des termes mémorisés)`)) {
                    removeCustomTerm(term);
                    // Retirer de la sélection si présent
                    selectedTerms = selectedTerms.filter(t => t !== term);
                    updateTermsList();
                    updatePreview();
                    showNotification('🗑️ Terme supprimé');
                }
            });
        });
    }

    function toggleTerm(term) {
        if (selectedTerms.includes(term)) {
            selectedTerms = selectedTerms.filter(t => t !== term);
        } else {
            selectedTerms.push(term);
        }
        updateTermsList();
        updatePreview();
    }

    function buildFinalTitle() {
        if (selectedTerms.length === 0) {
            return currentDocNumber;
        }
        return `${selectedTerms.join(' + ')} - ${currentDocNumber}`;
    }

    function updatePreview() {
        const previewElement = document.querySelector('#term-preview');
        if (previewElement) {
            previewElement.textContent = buildFinalTitle();
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
