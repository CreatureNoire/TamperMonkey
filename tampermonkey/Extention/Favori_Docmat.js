(function() {
    'use strict';

    // Fonction pour ajouter les styles CSS (compatible sans GM_addStyle)
    function addStyles(css) {
        const style = document.createElement('style');
        style.textContent = css;
        document.head.appendChild(style);
    }

    // Styles CSS - Interface moderne et épurée isolée uniquement pour le script
    addStyles(`
        /* Variables CSS globales pour les éléments du script uniquement */
        .favorites-modal,
        .custom-terms-modal,
        .add-favorite-button,
        .favorites-button {
            --primary-color: #3b82f6;
            --primary-hover: #2563eb;
            --success-color: #10b981;
            --danger-color: #ef4444;
            --warning-color: #f59e0b;
            --bg-dark: #0f172a;
            --bg-card: #1e293b;
            --bg-hover: #334155;
            --text-primary: #f1f5f9;
            --text-secondary: #94a3b8;
            --border-color: #334155;
        }

        /* Bouton d'ajout aux favoris */
        .add-favorite-button {
            cursor: pointer;
            font-size: 22px;
            color: var(--primary-color);
            background: var(--bg-card);
            border: 2px solid var(--primary-color);
            padding: 10px 15px;
            margin-left: 15px;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            display: inline-flex;
            align-items: center;
            vertical-align: middle;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .add-favorite-button:hover {
            transform: translateY(-2px);
            background: var(--primary-color);
            color: white;
            box-shadow: 0 10px 20px rgba(59, 130, 246, 0.3);
        }

        .add-favorite-button.added {
            color: white;
            background: var(--success-color);
            border-color: var(--success-color);
            animation: pulse 0.5s ease;
        }

        @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.15); }
        }

        .nav-tabs-container {
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        .favorites-button {
            background: var(--bg-card);
            border: 2px solid var(--border-color);
            color: var(--text-primary);
            cursor: pointer;
            padding: 10px 18px;
            margin-left: 10px;
            font-size: 15px;
            font-weight: 600;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            display: inline-flex;
            align-items: center;
            gap: 8px;
            border-radius: 10px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .favorites-button:hover {
            background: var(--primary-color);
            border-color: var(--primary-color);
            color: white;
            transform: translateY(-2px);
            box-shadow: 0 8px 16px rgba(59, 130, 246, 0.3);
        }

        .favorites-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(15, 23, 42, 0.95);
            display: none;
            justify-content: center;
            align-items: center;
            z-index: 10000;
            backdrop-filter: blur(10px);
        }

        .favorites-modal.show {
            display: flex;
            animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
        }

        .favorites-modal .favorites-content {
            background: var(--bg-dark);
            padding: 32px;
            border-radius: 20px;
            max-width: 1200px;
            width: 95%;
            max-height: 85vh;
            overflow: hidden;
            box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
            display: flex;
            flex-direction: column;
            border: 1px solid var(--border-color);
        }

        .favorites-modal .favorites-body {
            display: flex;
            gap: 24px;
            flex: 1;
            overflow: hidden;
        }

        .favorites-modal .folders-sidebar {
            width: 400px;
            overflow-y: auto;
            flex-shrink: 0;
            background: rgba(30, 41, 59, 0.3);
            padding: 20px;
            border-radius: 12px;
        }

        .favorites-modal .folders-sidebar h3 {
            color: var(--primary-color);
            margin: 0 0 16px 0;
            font-size: 17px;
            display: flex;
            align-items: center;
            gap: 8px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .favorites-modal .search-box {
            width: 100%;
            padding: 12px 16px;
            margin-bottom: 16px;
            border: 2px solid var(--border-color);
            border-radius: 10px;
            font-size: 14px;
            transition: all 0.3s ease;
            background: var(--bg-card);
            color: var(--text-primary);
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }

        .favorites-modal .search-box:focus {
            outline: none;
            border-color: var(--primary-color);
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
            background: var(--bg-hover);
        }

        .favorites-modal .search-box::placeholder {
            color: var(--text-secondary);
        }

        .favorites-modal .highlight-match {
            background: var(--primary-color);
            color: white;
            padding: 2px 6px;
            border-radius: 4px;
            font-weight: 600;
        }

        .favorites-modal .folder-path {
            font-size: 11px;
            color: var(--text-secondary);
            margin-top: 4px;
            font-style: italic;
        }

        .favorites-modal .favorites-list-container {
            flex: 1;
            overflow-y: auto;
            padding-left: 60px;
            overflow-x: visible;
        }

        .favorites-modal .favorites-list-container h3 {
            color: var(--primary-color);
            margin: 0 0 16px 0;
            font-size: 17px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .favorites-modal .favorites-list {
            padding-left: 0;
            margin-left: 0;
        }

        .favorites-modal .favorites-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 24px;
            padding-bottom: 20px;
            border-bottom: 2px solid var(--border-color);
        }

        .favorites-modal .favorites-header h2 {
            margin: 0;
            color: var(--text-primary);
            display: flex;
            align-items: center;
            gap: 12px;
            font-size: 28px;
            font-weight: 700;
        }

        .favorites-modal .close-modal,
        .custom-terms-modal .close-modal {
            background: var(--bg-card);
            border: 2px solid var(--border-color);
            font-size: 24px;
            cursor: pointer;
            color: var(--text-secondary);
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 10px;
            transition: all 0.3s ease;
        }

        .favorites-modal .close-modal:hover,
        .custom-terms-modal .close-modal:hover {
            background: var(--danger-color);
            color: white;
            border-color: var(--danger-color);
            transform: scale(1.05);
        }

        .favorites-modal .favorite-item {
            padding: 14px;
            margin-bottom: 10px;
            border: 2px solid var(--border-color);
            border-radius: 12px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            transition: transform 0.3s ease, margin 0.3s ease, background 0.3s ease;
            cursor: move;
            background: var(--bg-card);
            position: relative;
        }

        .favorites-modal .favorite-item[data-category] {
            border-width: 3px;
            border-style: solid;
        }

        .favorites-modal .favorite-item.indent-level-1 {
            margin-left: -15px;
            padding-left: 18px;
        }

        .favorites-modal .favorite-item.indent-level-2 {
            margin-left: -30px;
            padding-left: 34px;
        }

        .favorites-modal .favorite-item.dragging {
            opacity: 0.4;
            background: #f0f0f0;
        }

        .favorites-modal .favorite-item.shift-down {
            transform: translateY(70px);
        }

        .favorites-modal .favorite-item.shift-up {
            transform: translateY(-70px);
        }

        .favorites-modal .drop-zone {
            height: 10px;
            margin: 5px 0;
            position: relative;
            transition: all 0.3s ease;
        }

        .favorites-modal .drop-zone.active {
            height: 60px;
            background: linear-gradient(to bottom, rgba(59, 130, 246, 0.1), rgba(59, 130, 246, 0.2), rgba(59, 130, 246, 0.1));
            border: 2px dashed var(--primary-color);
            border-radius: 8px;
            margin: 10px 0;
        }

        .favorites-modal .drop-zone.active::before {
            content: '↓ Déposer ici ↓';
            display: block;
            text-align: center;
            color: var(--primary-color);
            font-weight: bold;
            line-height: 60px;
            font-size: 14px;
        }

        .favorites-modal .favorite-item:hover {
            background: var(--bg-hover);
            border-color: var(--primary-color);
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
        }

        .favorites-modal .favorite-item.dragging:hover {
            transform: none;
            box-shadow: none;
        }

        .favorites-modal .favorite-item.dragging {
            opacity: 0.5;
            background: rgba(59, 130, 246, 0.1);
            border-color: var(--primary-color);
            transform: rotate(3deg) scale(1.02);
        }

        .favorites-modal .favorite-item .drag-handle {
            margin-right: 14px;
            color: var(--text-secondary);
            cursor: grab;
            font-size: 20px;
            transition: color 0.3s ease;
        }

        .favorites-modal .favorite-item .drag-handle:active {
            cursor: grabbing;
        }

        .favorites-modal .favorite-item:hover .drag-handle {
            color: var(--primary-color);
        }

        .favorites-modal .favorite-info {
            flex: 1;
        }

        .favorites-modal .favorite-title {
            font-weight: 600;
            color: var(--text-primary);
            margin-bottom: 6px;
            cursor: pointer;
            font-size: 15px;
            transition: all 0.2s ease;
        }

        .favorites-modal .favorite-title:hover {
            color: var(--primary-color);
        }

        .favorites-modal .favorite-number {
            font-size: 12px;
            color: var(--text-secondary);
            margin-top: 5px;
            font-family: 'SF Mono', 'Monaco', 'Courier New', monospace;
        }

        .favorites-modal .favorite-actions {
            display: flex;
            gap: 6px;
        }

        .favorites-modal .edit-favorite {
            background: var(--warning-color);
            color: white;
            border: none;
            padding: 8px 14px;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s ease;
            font-weight: 600;
            font-size: 13px;
            box-shadow: 0 2px 8px rgba(245, 158, 11, 0.3);
        }

        .favorites-modal .edit-favorite:hover {
            background: #d97706;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);
        }

        .favorites-modal .remove-favorite {
            background: var(--danger-color);
            color: white;
            border: none;
            padding: 8px 14px;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s ease;
            font-weight: 600;
            font-size: 13px;
            box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
        }

        .favorites-modal .remove-favorite:hover {
            background: #dc2626;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
        }

        .favorites-modal .no-favorites {
            text-align: center;
            padding: 60px 40px;
            color: var(--text-secondary);
            font-style: italic;
            font-size: 15px;
        }

        .favorites-button .favorites-count {
            background: var(--primary-color);
            color: white;
            border-radius: 50%;
            padding: 4px 10px;
            font-size: 12px;
            font-weight: 700;
            margin-left: 10px;
            box-shadow: 0 2px 8px rgba(59, 130, 246, 0.4);
        }

        .favorites-modal .folder-section {
            margin-bottom: 8px;
        }

        .favorites-modal .folder-header {
            display: flex;
            align-items: center;
            padding: 12px 16px;
            background: rgba(30, 41, 59, 0.5);
            color: var(--text-primary);
            border-radius: 10px;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            margin-bottom: 6px;
            border: 2px solid transparent;
        }

        .favorites-modal .folder-header:hover {
            background: var(--bg-hover);
            border-color: var(--primary-color);
            transform: translateX(4px);
        }

        .favorites-modal .folder-header.active {
            background: var(--primary-color);
            color: white;
            border-color: var(--primary-color);
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
        }

        .favorites-modal .folder-header.drag-over {
            background: var(--success-color);
            color: white;
            transform: scale(1.02);
            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.5);
            border-color: var(--success-color);
        }

        .favorites-modal .folder-icon {
            font-size: 18px;
            margin-right: 10px;
            transition: transform 0.3s ease;
        }

        .favorites-modal .folder-icon.expandable {
            cursor: pointer;
        }

        .favorites-modal .folder-header.collapsed .folder-icon.expandable {
            transform: rotate(-90deg);
        }

        .favorites-modal .folder-children {
            margin-left: 20px;
            margin-top: 6px;
        }

        .favorites-modal .folder-children.hidden {
            display: none;
        }

        .favorites-modal .folder-name {
            flex: 1;
            font-weight: 600;
            font-size: 14px;
        }

        .favorites-modal .folder-count {
            background: rgba(0, 0, 0, 0.4);
            padding: 3px 10px;
            border-radius: 12px;
            font-size: 11px;
            margin-left: auto;
            font-weight: 600;
        }

        .favorites-modal .folder-header.active .folder-count {
            background: rgba(255, 255, 255, 0.3);
        }

        .favorites-modal .folder-actions {
            display: none;
            gap: 6px;
            margin-left: 10px;
        }

        .favorites-modal .folder-header:hover .folder-actions {
            display: flex;
        }

        .favorites-modal .folder-header.active .folder-actions {
            display: flex;
        }

        .favorites-modal .folder-actions button {
            background: rgba(0, 0, 0, 0.4);
            border: 1px solid rgba(255, 255, 255, 0.2);
            color: white;
            padding: 5px 10px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 11px;
            font-weight: 600;
            transition: all 0.2s ease;
        }

        .favorites-modal .folder-header.active .folder-actions button {
            background: rgba(255, 255, 255, 0.2);
            color: white;
            border-color: rgba(255, 255, 255, 0.3);
        }

        .favorites-modal .folder-actions button:hover {
            background: rgba(255, 255, 255, 0.3);
            transform: scale(1.08);
        }

        .favorites-modal .folder-header.active .folder-actions button:hover {
            background: rgba(255, 255, 255, 0.4);
        }

        .favorites-modal .folder-content {
            display: none;
        }

        .favorites-modal .toolbar {
            display: flex;
            gap: 12px;
            margin-bottom: 24px;
            padding: 18px;
            background: rgba(30, 41, 59, 0.5);
            border-radius: 12px;
            border: 2px solid var(--border-color);
        }

        .toolbar button {
            background: var(--primary-color);
            color: white;
            border: none;
            padding: 8px 14px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 12px;
            font-weight: 600;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 6px;
            box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
        }

        .toolbar button:hover {
            background: var(--primary-hover);
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
        }

        .toolbar .export-btn {
            background: var(--success-color);
        }

        .toolbar .export-btn:hover {
            background: #059669;
        }

        .toolbar .import-btn {
            background: var(--warning-color);
        }

        .toolbar .import-btn:hover {
            background: #d97706;
        }

        .favorite-item .favorite-folder {
            font-size: 11px;
            color: var(--text-secondary);
            margin-top: 4px;
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

        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }

        @keyframes slideOutRight {
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
            background: rgba(15, 23, 42, 0.95);
            display: none;
            justify-content: center;
            align-items: center;
            z-index: 10001;
            backdrop-filter: blur(10px);
        }

        .custom-terms-modal.show {
            display: flex;
            animation: fadeIn 0.3s ease;
        }

        .custom-terms-modal .custom-terms-content {
            background: var(--bg-dark);
            padding: 32px;
            border-radius: 20px;
            max-width: 1200px;
            width: 95%;
            max-height: 85vh;
            overflow: hidden;
            box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
            border: 1px solid var(--border-color);
            display: flex;
            flex-direction: column;
        }

        .custom-terms-modal .custom-terms-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 28px;
            padding-bottom: 20px;
            border-bottom: 2px solid var(--border-color);
        }

        .custom-terms-modal .custom-terms-header h3 {
            margin: 0;
            color: var(--text-primary);
            font-size: 24px;
            font-weight: 700;
        }

        .custom-terms-modal .custom-terms-body {
            display: flex;
            gap: 24px;
            flex: 1;
            overflow: hidden;
        }

        .custom-terms-modal .left-panel {
            width: 280px;
            flex-shrink: 0;
            background: rgba(30, 41, 59, 0.3);
            padding: 20px;
            border-radius: 12px;
            overflow-y: auto;
        }

        .custom-terms-modal .center-panel {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 20px;
            overflow-y: auto;
            padding: 0 10px;
        }

        .custom-terms-modal .right-panel {
            width: 450px;
            flex-shrink: 0;
            background: rgba(30, 41, 59, 0.3);
            padding: 20px;
            border-radius: 12px;
            overflow-y: auto;
        }

        .custom-terms-modal .folder-selector {
            margin-bottom: 16px;
        }

        .custom-terms-modal .folder-search {
            width: 100%;
            padding: 10px 14px;
            margin-bottom: 12px;
            border: 2px solid var(--border-color);
            border-radius: 8px;
            font-size: 13px;
            background: var(--bg-card);
            color: var(--text-primary);
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            transition: all 0.3s ease;
            box-sizing: border-box;
        }

        .custom-terms-modal .folder-search:focus {
            outline: none;
            border-color: var(--primary-color);
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .custom-terms-modal .folder-search::placeholder {
            color: var(--text-secondary);
        }

        .custom-terms-modal .folder-tree-item {
            margin-bottom: 6px;
        }

        .custom-terms-modal .folder-item-header {
            padding: 10px 12px;
            background: var(--bg-card);
            border: 2px solid var(--border-color);
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .custom-terms-modal .folder-item-header:hover {
            background: var(--bg-hover);
            border-color: var(--primary-color);
        }

        .custom-terms-modal .folder-item-header.selected {
            background: var(--primary-color);
            color: white;
            border-color: var(--primary-color);
        }

        .custom-terms-modal .folder-expand-icon {
            font-size: 14px;
            cursor: pointer;
            transition: transform 0.3s ease;
            min-width: 14px;
            display: inline-block;
            user-select: none;
        }

        .custom-terms-modal .folder-expand-icon.collapsed {
            transform: rotate(-90deg);
        }

        .custom-terms-modal .folder-expand-icon.hidden {
            visibility: hidden;
        }

        .custom-terms-modal .folder-children {
            margin-left: 24px;
            margin-top: 6px;
            display: none;
        }

        .custom-terms-modal .folder-children.expanded {
            display: block;
        }

        .custom-terms-modal .folder-item-header input[type="checkbox"] {
            width: 18px;
            height: 18px;
            cursor: pointer;
            accent-color: var(--primary-color);
        }

        /* Styles pour le drag & drop des catégories */
        .category-item {
            transition: all 0.3s ease;
        }

        .category-item:hover {
            background: var(--bg-hover) !important;
            transform: scale(1.02);
        }

        .category-item.dragging {
            opacity: 0.5;
        }

        .category-item.drag-over {
            border-color: var(--primary-color) !important;
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
        }

        .custom-terms-modal .folder-item-header label {
            flex: 1;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
        }

        .custom-terms-modal .folder-icon-small {
            font-size: 16px;
        }

        .custom-terms-modal .terms-section {
            margin-bottom: 0;
        }

        .custom-terms-modal .terms-section h4 {
            color: var(--primary-color);
            margin-bottom: 14px;
            font-size: 15px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .custom-terms-modal .terms-buttons {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            margin-bottom: 16px;
        }

        .custom-terms-modal .term-button {
            background: var(--bg-card);
            border: 2px solid var(--border-color);
            padding: 10px 16px;
            border-radius: 20px;
            cursor: pointer;
            transition: all 0.3s ease;
            font-size: 14px;
            display: flex;
            align-items: center;
            gap: 8px;
            color: var(--text-primary);
            font-weight: 500;
        }

        .custom-terms-modal .term-button:hover {
            background: var(--bg-hover);
            border-color: var(--primary-color);
            transform: translateY(-2px);
        }

        .custom-terms-modal .term-button.selected {
            background: var(--primary-color);
            color: white;
            border-color: var(--primary-color);
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
        }

        .custom-terms-modal .term-button .term-drag-handle {
            color: var(--text-secondary);
            user-select: none;
            cursor: grab;
        }

        .custom-terms-modal .term-button .term-drag-handle:active {
            cursor: grabbing;
        }

        .custom-terms-modal .term-button.selected .term-drag-handle {
            color: rgba(255, 255, 255, 0.7);
        }

        .custom-terms-modal .term-button .term-name-editable {
            cursor: pointer;
            user-select: none;
        }

        .custom-terms-modal .term-button .term-name-editable:hover {
            text-decoration: underline;
            text-decoration-style: dotted;
        }

        .custom-terms-modal .term-button .remove-term {
            margin-left: auto;
            color: var(--danger-color);
            font-weight: bold;
            cursor: pointer;
            font-size: 18px;
            transition: all 0.2s ease;
        }

        .custom-terms-modal .term-button.selected .remove-term {
            color: #fca5a5;
        }

        .custom-terms-modal .term-button .remove-term:hover {
            transform: scale(1.2);
        }

        .custom-terms-modal .add-term-input {
            display: flex;
            gap: 12px;
            margin-top: 12px;
        }

        .custom-terms-modal .add-term-input input {
            flex: 1;
            padding: 12px 16px;
            border: 2px solid var(--border-color);
            border-radius: 10px;
            font-size: 14px;
            background: var(--bg-card);
            color: var(--text-primary);
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            transition: all 0.3s ease;
        }

        .custom-terms-modal .add-term-input input:focus {
            outline: none;
            border-color: var(--primary-color);
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
            background: var(--bg-hover);
        }

        /* Style pour le champ de nom personnalisé */
        .custom-terms-modal #custom-doc-name {
            width: 100%;
            padding: 12px 16px;
            border: 2px solid var(--border-color);
            border-radius: 10px;
            font-size: 14px;
            background: var(--bg-card);
            color: var(--text-primary);
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            transition: all 0.3s ease;
            box-sizing: border-box;
        }

        .custom-terms-modal #custom-doc-name:focus {
            outline: none;
            border-color: var(--primary-color);
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
            background: var(--bg-hover);
        }

        .custom-terms-modal #custom-doc-name::placeholder {
            color: var(--text-secondary);
        }

        .custom-terms-modal .add-term-input button {
            background: var(--success-color);
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 10px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 600;
            transition: all 0.3s ease;
            box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
        }

        .custom-terms-modal .add-term-input button:hover {
            background: #059669;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
        }

        .custom-terms-modal .preview-section {
            background: rgba(30, 41, 59, 0.5);
            padding: 20px;
            border-radius: 12px;
            margin-bottom: 28px;
            border: 2px solid var(--border-color);
        }

        .custom-terms-modal .preview-section h4 {
            margin-top: 0;
            margin-bottom: 12px;
            color: var(--primary-color);
            font-size: 13px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .custom-terms-modal .preview-text {
            font-size: 17px;
            font-weight: 600;
            color: var(--text-primary);
            word-wrap: break-word;
            line-height: 1.5;
        }

        .custom-terms-modal .modal-actions {
            display: flex;
            gap: 12px;
            justify-content: flex-end;
        }

        .custom-terms-modal .modal-actions button {
            padding: 12px 24px;
            border: none;
            border-radius: 10px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 600;
            transition: all 0.3s ease;
        }

        .custom-terms-modal .btn-validate {
            background: var(--primary-color);
            color: white;
            box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
        }

        .custom-terms-modal .btn-validate:hover {
            background: var(--primary-hover);
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
        }

        .custom-terms-modal .btn-cancel {
            background: transparent;
            color: var(--text-primary);
            border: 2px solid var(--border-color);
        }

        .custom-terms-modal .btn-cancel:hover {
            background: var(--bg-hover);
            border-color: var(--text-secondary);
            transform: translateY(-2px);
        }

        /* Styles pour les modales de confirmation personnalisées */
        .custom-dialog-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(15, 23, 42, 0.95);
            display: none;
            justify-content: center;
            align-items: center;
            z-index: 10002;
            backdrop-filter: blur(10px);
        }

        .custom-dialog-modal.show {
            display: flex;
            animation: fadeIn 0.3s ease;
        }

        .custom-dialog-modal .dialog-content {
            background: var(--bg-dark);
            padding: 28px 32px;
            border-radius: 16px;
            max-width: 450px;
            width: 90%;
            box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
            border: 1px solid var(--border-color);
        }

        .custom-dialog-modal .dialog-icon {
            font-size: 48px;
            text-align: center;
            margin-bottom: 16px;
        }

        .custom-dialog-modal .dialog-message {
            color: var(--text-primary);
            font-size: 15px;
            text-align: center;
            margin-bottom: 24px;
            line-height: 1.6;
            white-space: pre-line;
        }

        .custom-dialog-modal .dialog-input {
            width: 100%;
            padding: 12px 16px;
            border: 2px solid var(--border-color);
            border-radius: 10px;
            font-size: 14px;
            background: var(--bg-card);
            color: var(--text-primary);
            margin-bottom: 20px;
            box-sizing: border-box;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }

        .custom-dialog-modal .dialog-input:focus {
            outline: none;
            border-color: var(--primary-color);
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .custom-dialog-modal .dialog-actions {
            display: flex;
            gap: 12px;
            justify-content: center;
        }

        .custom-dialog-modal .dialog-btn {
            padding: 12px 24px;
            border: none;
            border-radius: 10px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 600;
            transition: all 0.3s ease;
        }

        .custom-dialog-modal .dialog-btn-primary {
            background: var(--primary-color);
            color: white;
            box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
        }

        .custom-dialog-modal .dialog-btn-primary:hover {
            background: var(--primary-hover);
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
        }

        .custom-dialog-modal .dialog-btn-danger {
            background: var(--danger-color);
            color: white;
            box-shadow: 0 2px 6px rgba(239, 68, 68, 0.3);
        }

        .custom-dialog-modal .dialog-btn-danger:hover {
            background: #dc2626;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
        }

        .custom-dialog-modal .dialog-btn-secondary {
            background: transparent;
            color: var(--text-primary);
            border: 2px solid var(--border-color);
        }

        .custom-dialog-modal .dialog-btn-secondary:hover {
            background: var(--bg-hover);
            border-color: var(--text-secondary);
            transform: translateY(-2px);
        }

        /* Styles pour la création de dossier rapide */
        .custom-terms-modal .create-folder-section {
            margin-top: 20px;
            padding: 16px;
            background: rgba(59, 130, 246, 0.1);
            border: 2px solid var(--primary-color);
            border-radius: 12px;
        }

        .custom-terms-modal .create-folder-section h4 {
            color: var(--primary-color);
            margin-bottom: 12px;
            font-size: 14px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .custom-terms-modal .create-folder-inputs {
            display: flex;
            flex-direction: column;
            gap: 10px;
        }

        .custom-terms-modal .create-folder-inputs input {
            width: 100%;
            padding: 10px 14px;
            border: 2px solid var(--border-color);
            border-radius: 8px;
            font-size: 13px;
            background: var(--bg-card);
            color: var(--text-primary);
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            transition: all 0.3s ease;
            box-sizing: border-box;
        }

        .custom-terms-modal .create-folder-inputs input:focus {
            outline: none;
            border-color: var(--primary-color);
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .custom-terms-modal .create-folder-inputs input::placeholder {
            color: var(--text-secondary);
        }

        .custom-terms-modal .create-folder-inputs input.error {
            border-color: var(--danger-color);
            background: rgba(239, 68, 68, 0.1);
        }

        .custom-terms-modal .parent-folder-select {
            width: 100%;
            padding: 10px 14px;
            border: 2px solid var(--border-color);
            border-radius: 8px;
            font-size: 13px;
            background: var(--bg-card);
            color: var(--text-primary);
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            transition: all 0.3s ease;
            cursor: pointer;
            box-sizing: border-box;
        }

        .custom-terms-modal .parent-folder-select:focus {
            outline: none;
            border-color: var(--primary-color);
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .custom-terms-modal .parent-folder-select option {
            background: var(--bg-card);
            color: var(--text-primary);
            padding: 8px;
        }

        .custom-terms-modal .create-folder-inputs .input-hint {
            font-size: 11px;
            color: var(--text-secondary);
            margin-top: -6px;
            font-style: italic;
        }

        .custom-terms-modal .create-folder-inputs .input-hint.error {
            color: var(--danger-color);
            font-weight: 600;
        }

        .custom-terms-modal .create-folder-btn-submit {
            background: var(--success-color);
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 13px;
            font-weight: 600;
            transition: all 0.3s ease;
            box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
            margin-top: 8px;
        }

        .custom-terms-modal .create-folder-btn-submit:hover {
            background: #059669;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
        }

        .custom-terms-modal .create-folder-btn-submit:disabled {
            background: var(--text-secondary);
            cursor: not-allowed;
            opacity: 0.5;
            transform: none;
        }
    `);

    // Fonctions de dialogue personnalisées
    function customAlert(message, icon = 'ℹ️') {
        return new Promise((resolve) => {
            const modal = document.createElement('div');
            modal.className = 'custom-dialog-modal';
            modal.style.zIndex = '10004'; // Plus élevé que la fenêtre de gestion des catégories (10003)
            modal.innerHTML = `
                <div class="dialog-content">
                    <div class="dialog-icon">${icon}</div>
                    <div class="dialog-message">${message}</div>
                    <div class="dialog-actions">
                        <button class="dialog-btn dialog-btn-primary">OK</button>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);
            modal.classList.add('show');

            modal.querySelector('.dialog-btn-primary').addEventListener('click', () => {
                modal.classList.remove('show');
                setTimeout(() => modal.remove(), 300);
                resolve(true);
            });

            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('show');
                    setTimeout(() => modal.remove(), 300);
                    resolve(true);
                }
            });
        });
    }

    function customConfirm(message, icon = '❓') {
        return new Promise((resolve) => {
            const modal = document.createElement('div');
            modal.className = 'custom-dialog-modal';
            modal.style.zIndex = '10004'; // Plus élevé que la fenêtre de gestion des catégories (10003)
            modal.innerHTML = `
                <div class="dialog-content">
                    <div class="dialog-icon">${icon}</div>
                    <div class="dialog-message">${message}</div>
                    <div class="dialog-actions">
                        <button class="dialog-btn dialog-btn-secondary">Annuler</button>
                        <button class="dialog-btn dialog-btn-danger">Confirmer</button>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);
            modal.classList.add('show');

            modal.querySelector('.dialog-btn-danger').addEventListener('click', () => {
                modal.classList.remove('show');
                setTimeout(() => modal.remove(), 300);
                resolve(true);
            });

            modal.querySelector('.dialog-btn-secondary').addEventListener('click', () => {
                modal.classList.remove('show');
                setTimeout(() => modal.remove(), 300);
                resolve(false);
            });

            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('show');
                    setTimeout(() => modal.remove(), 300);
                    resolve(false);
                }
            });
        });
    }

    function customPrompt(message, defaultValue = '', icon = '✏️') {
        return new Promise((resolve) => {
            const modal = document.createElement('div');
            modal.className = 'custom-dialog-modal';
            modal.innerHTML = `
                <div class="dialog-content">
                    <div class="dialog-icon">${icon}</div>
                    <div class="dialog-message">${message}</div>
                    <input type="text" class="dialog-input" value="${defaultValue}" placeholder="Entrez une valeur...">
                    <div class="dialog-actions">
                        <button class="dialog-btn dialog-btn-secondary">Annuler</button>
                        <button class="dialog-btn dialog-btn-primary">Valider</button>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);
            modal.classList.add('show');

            const input = modal.querySelector('.dialog-input');
            input.focus();
            input.select();

            const validate = () => {
                const value = input.value;
                modal.classList.remove('show');
                setTimeout(() => modal.remove(), 300);
                resolve(value || null);
            };

            modal.querySelector('.dialog-btn-primary').addEventListener('click', validate);

            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    validate();
                }
            });

            modal.querySelector('.dialog-btn-secondary').addEventListener('click', () => {
                modal.classList.remove('show');
                setTimeout(() => modal.remove(), 300);
                resolve(null);
            });

            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('show');
                    setTimeout(() => modal.remove(), 300);
                    resolve(null);
                }
            });
        });
    }

    // Fonction de migration des données de GM_getValue vers localStorage
    function migrateFromGMStorage() {
        try {
            // Vérifier si GM_getValue existe (Tampermonkey)
            if (typeof GM_getValue !== 'undefined') {
                console.log('🔄 Début de la migration des données Tampermonkey vers localStorage...');

                // Migrer les favoris
                if (!localStorage.getItem('docmat_favorites')) {
                    const oldFavorites = GM_getValue('docmat_favorites', '[]');
                    if (oldFavorites !== '[]') {
                        localStorage.setItem('docmat_favorites', oldFavorites);
                        console.log('✅ Favoris migrés:', JSON.parse(oldFavorites).length, 'éléments');
                    }
                }

                // Migrer les termes personnalisés
                if (!localStorage.getItem('docmat_custom_terms')) {
                    const oldTerms = GM_getValue('docmat_custom_terms', '[]');
                    if (oldTerms !== '[]') {
                        localStorage.setItem('docmat_custom_terms', oldTerms);
                        console.log('✅ Termes personnalisés migrés:', JSON.parse(oldTerms).length, 'éléments');
                    }
                }

                // Migrer les dossiers
                if (!localStorage.getItem('docmat_folders')) {
                    const oldFolders = GM_getValue('docmat_folders', '[]');
                    if (oldFolders !== '[]') {
                        localStorage.setItem('docmat_folders', oldFolders);
                        console.log('✅ Dossiers migrés:', JSON.parse(oldFolders).length, 'éléments');
                    }
                }

                // Migrer les catégories
                if (!localStorage.getItem('docmat_categories')) {
                    const defaultCategories = JSON.stringify([
                        { id: 'dossier-reparation', name: 'Dossier de Réparation', color: '#3b82f6', indentLevel: 2 },
                        { id: 'recapitulatif', name: 'Récapitulatif', color: '#10b981', indentLevel: 1 },
                        { id: 'nomenclature', name: 'Nomenclature', color: '#f59e0b', indentLevel: 0 },
                        { id: 'schema', name: 'Schéma', color: '#f59e0b', indentLevel: 0 },
                        { id: 'implantation', name: 'Implantation', color: '#f59e0b', indentLevel: 0 }
                    ]);
                    const oldCategories = GM_getValue('docmat_categories', defaultCategories);
                    if (oldCategories !== defaultCategories) {
                        localStorage.setItem('docmat_categories', oldCategories);
                        console.log('✅ Catégories migrées');
                    }
                }

                console.log('✅ Migration terminée avec succès !');
            }
        } catch (e) {
            console.log('ℹ️ Migration non nécessaire ou impossible:', e.message);
        }
    }

    // Exécuter la migration au démarrage
    migrateFromGMStorage();

    function backupToGM(key, value) {
        if (typeof GM_setValue === 'function') {
            try {
                GM_setValue(key, JSON.stringify(value));
            } catch (e) {
                console.warn('⚠️ Sauvegarde GM échouée:', key, e);
            }
        }
    }

    function restoreFromGMIfEmpty(key, currentValue) {
        if (Array.isArray(currentValue) && currentValue.length > 0) {
            return currentValue;
        }
        if (typeof GM_getValue !== 'undefined') {
            try {
                const gmValue = GM_getValue(key, '[]');
                const parsed = JSON.parse(gmValue);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    localStorage.setItem(key, JSON.stringify(parsed));
                    return parsed;
                }
            } catch (e) {
                console.warn('⚠️ Restauration GM échouée:', key, e);
            }
        }
        return currentValue;
    }

    // Fonctions de gestion des favoris
    function getFavorites() {
        try {
            const favorites = localStorage.getItem('docmat_favorites') || '[]';
            return restoreFromGMIfEmpty('docmat_favorites', JSON.parse(favorites));
        } catch (e) {
            console.error('Erreur lors de la récupération des favoris:', e);
            return [];
        }
    }

    function saveFavorites(favorites) {
        try {
            localStorage.setItem('docmat_favorites', JSON.stringify(favorites));
            backupToGM('docmat_favorites', favorites);
        } catch (e) {
            console.error('Erreur lors de la sauvegarde des favoris:', e);
        }
    }

    function formatDocumentNumber(number) {
        // Si le numéro a exactement 9 caractères, le formater en "00-0000 00"
        if (number && number.length === 9 && /^\d{9}$/.test(number)) {
            return `${number.substring(0, 2)}-${number.substring(2, 6)} ${number.substring(6, 9)}`;
        }
        return number;
    }

    function getCustomTerms() {
        try {
            const terms = localStorage.getItem('docmat_custom_terms') || '[]';
            return restoreFromGMIfEmpty('docmat_custom_terms', JSON.parse(terms));
        } catch (e) {
            console.error('Erreur lors de la récupération des termes personnalisés:', e);
            return [];
        }
    }

    function saveCustomTerms(terms) {
        try {
            localStorage.setItem('docmat_custom_terms', JSON.stringify(terms));
            backupToGM('docmat_custom_terms', terms);
        } catch (e) {
            console.error('Erreur lors de la sauvegarde des termes personnalisés:', e);
        }
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

    // Fonctions de gestion des catégories de documents
    function getDocumentCategories() {
        const defaultCategories = [
            { id: 'dossier-reparation', name: 'Dossier de Réparation', color: '#3b82f6', indentLevel: 2 },
            { id: 'recapitulatif', name: 'Récapitulatif', color: '#10b981', indentLevel: 1 },
            { id: 'nomenclature', name: 'Nomenclature', color: '#f59e0b', indentLevel: 0 },
            { id: 'schema', name: 'Schéma', color: '#f59e0b', indentLevel: 0 },
            { id: 'implantation', name: 'Implantation', color: '#f59e0b', indentLevel: 0 }
        ];
        try {
            const categories = localStorage.getItem('docmat_categories') || JSON.stringify(defaultCategories);
            return restoreFromGMIfEmpty('docmat_categories', JSON.parse(categories));
        } catch (e) {
            console.error('Erreur lors de la récupération des catégories:', e);
            return defaultCategories;
        }
    }

    function saveDocumentCategories(categories) {
        try {
            localStorage.setItem('docmat_categories', JSON.stringify(categories));
            backupToGM('docmat_categories', categories);
        } catch (e) {
            console.error('Erreur lors de la sauvegarde des catégories:', e);
        }
    }

    function addDocumentCategory(name, color, indentLevel = 0) {
        const categories = getDocumentCategories();
        const id = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        if (!categories.find(c => c.id === id)) {
            categories.push({ id, name, color, indentLevel });
            saveDocumentCategories(categories);
            return true;
        }
        return false;
    }

    function updateDocumentCategory(id, name, color, indentLevel) {
        const categories = getDocumentCategories();
        const category = categories.find(c => c.id === id);
        if (category) {
            category.name = name;
            category.color = color;
            category.indentLevel = indentLevel;
            saveDocumentCategories(categories);
            return true;
        }
        return false;
    }

    function removeDocumentCategory(id) {
        let categories = getDocumentCategories();
        categories = categories.filter(c => c.id !== id);
        saveDocumentCategories(categories);
    }

    function getCategoryForTitle(title) {
        const categories = getDocumentCategories();
        const titleLower = title.toLowerCase();

        // Chercher une catégorie dont le nom est contenu dans le titre
        for (const category of categories) {
            if (titleLower.includes(category.name.toLowerCase())) {
                return category;
            }
        }
        return null;
    }

    function getFolders() {
        try {
            const folders = localStorage.getItem('docmat_folders') || '[]';
            return restoreFromGMIfEmpty('docmat_folders', JSON.parse(folders));
        } catch (e) {
            console.error('Erreur lors de la récupération des dossiers:', e);
            return [];
        }
    }

    function saveFolders(folders) {
        try {
            localStorage.setItem('docmat_folders', JSON.stringify(folders));
            backupToGM('docmat_folders', folders);
        } catch (e) {
            console.error('Erreur lors de la sauvegarde des dossiers:', e);
        }
    }

    function createFolder(name, parentId = null) {
        const folders = getFolders();

        // Vérifier si un dossier avec le même nom existe déjà au même niveau
        const exists = folders.some(folder =>
            folder.name === name && folder.parentId === parentId
        );

        if (!exists && name && name.trim() !== '') {
            folders.push({
                id: Date.now().toString(),
                name: name,
                parentId: parentId,
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

        // Récupérer tous les sous-dossiers récursivement
        const getAllSubfolders = (parentId) => {
            const subfolders = folders.filter(f => f.parentId === parentId);
            let allSubs = [...subfolders];
            subfolders.forEach(sub => {
                allSubs = allSubs.concat(getAllSubfolders(sub.id));
            });
            return allSubs;
        };

        const subfoldersToDelete = getAllSubfolders(folderId);
        const allFolderIds = [folderId, ...subfoldersToDelete.map(f => f.id)];

        // Supprimer tous les dossiers et sous-dossiers
        folders = folders.filter(folder => !allFolderIds.includes(folder.id));
        saveFolders(folders);

        // Retirer le dossier des favoris
        let favorites = getFavorites();
        favorites = favorites.map(fav => {
            if (allFolderIds.includes(fav.folderId)) {
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

    // ========================================
    // AUTO-EXPORT LOCAL AUTOMATIQUE TOUTES LES 3H
    // ========================================

    // Config auto-export (persistée dans localStorage)
    let autoExportFileName = localStorage.getItem('docmat_autoExportFileName') || 'DocMatExport';
    let autoExportEnabled = localStorage.getItem('docmat_autoExportEnabled') !== 'false'; // true par défaut
    let autoExportIntervalId = null;
    let lastAutoExportTime = localStorage.getItem('docmat_lastAutoExportTime') || null;
    let autoExportDirHandle = null;
    let autoExportDirName = localStorage.getItem('docmat_autoExportDirName') || '';

    const AUTO_EXPORT_TARGET_HOUR = 9; // Heure cible : 9H du matin
    const AUTO_EXPORT_CHECK_INTERVAL_MS = 60 * 1000; // Vérification toutes les 60 secondes

    // ── IndexedDB : persister le FileSystemDirectoryHandle ──
    const DOCMAT_IDB_NAME = 'DocMatAutoExportDB';
    const DOCMAT_IDB_STORE = 'dirHandles';
    const DOCMAT_IDB_KEY = 'autoExportDirHandle';

    function openDocmatIDB() {
        return new Promise((resolve, reject) => {
            const idb = (typeof unsafeWindow !== 'undefined' ? unsafeWindow : window).indexedDB;
            const request = idb.open(DOCMAT_IDB_NAME, 1);
            request.onupgradeneeded = (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains(DOCMAT_IDB_STORE)) {
                    db.createObjectStore(DOCMAT_IDB_STORE);
                }
            };
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async function saveDirHandleToIDB(handle) {
        try {
            const db = await openDocmatIDB();
            const tx = db.transaction(DOCMAT_IDB_STORE, 'readwrite');
            tx.objectStore(DOCMAT_IDB_STORE).put(handle, DOCMAT_IDB_KEY);
            await new Promise((resolve, reject) => {
                tx.oncomplete = resolve;
                tx.onerror = () => reject(tx.error);
            });
            db.close();
            console.log('💾 [DocMat] DirHandle sauvegardé dans IndexedDB');
        } catch (err) {
            console.warn('⚠️ [DocMat] Impossible de sauvegarder le DirHandle dans IDB:', err);
        }
    }

    async function loadDirHandleFromIDB() {
        try {
            const db = await openDocmatIDB();
            console.log('🔄 [DocMat] IDB ouverte, db.name:', db.name, 'objectStoreNames:', [...db.objectStoreNames]);
            const tx = db.transaction(DOCMAT_IDB_STORE, 'readonly');
            const store = tx.objectStore(DOCMAT_IDB_STORE);
            const request = store.get(DOCMAT_IDB_KEY);
            const handle = await new Promise((resolve, reject) => {
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            });
            db.close();
            console.log('🔄 [DocMat] Handle lu depuis IDB:', handle ? '✅ trouvé (' + handle.name + ')' : '❌ null/undefined');
            return handle || null;
        } catch (err) {
            console.warn('⚠️ [DocMat] Impossible de charger le DirHandle depuis IDB:', err);
            return null;
        }
    }

    async function restoreDirHandle() {
        if (autoExportDirHandle) return; // déjà en mémoire
        const handle = await loadDirHandleFromIDB();
        if (!handle) return;
        try {
            // Vérifier/demander la permission
            const perm = await handle.queryPermission({ mode: 'readwrite' });
            if (perm === 'granted') {
                autoExportDirHandle = handle;
                console.log('✅ [DocMat] DirHandle restauré depuis IDB → ' + handle.name);
            } else if (perm === 'prompt') {
                // On ne peut demander la permission qu'après un geste utilisateur,
                // on stocke le handle en attente pour le demander plus tard
                autoExportDirHandle = handle;
                console.log('⏳ [DocMat] DirHandle restauré (permission en attente) → ' + handle.name);
            }
        } catch (err) {
            console.warn('⚠️ [DocMat] DirHandle invalide, ignoré:', err);
        }
    }

    function downloadJsonFileAuto(data, fileName) {
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
    }

    async function performAutoExport() {
        if (!autoExportEnabled) return;

        console.log('🔄 [DocMat] Début performAutoExport…');
        console.log('🔄 [DocMat] autoExportDirHandle:', autoExportDirHandle ? '✅ présent (' + autoExportDirHandle.name + ')' : '❌ null');
        console.log('🔄 [DocMat] autoExportDirName:', autoExportDirName || '(vide)');

        // Tenter de restaurer le handle depuis IndexedDB si absent
        if (!autoExportDirHandle && autoExportDirName) {
            console.log('🔄 [DocMat] Tentative de restauration du handle depuis IndexedDB…');
            await restoreDirHandle();
            console.log('🔄 [DocMat] Après restauration, handle:', autoExportDirHandle ? '✅ présent' : '❌ toujours null');
        }

        // Si le handle est restauré, tenter de demander la permission
        if (autoExportDirHandle) {
            try {
                const perm = await autoExportDirHandle.queryPermission({ mode: 'readwrite' });
                console.log('🔄 [DocMat] Permission actuelle:', perm);
                if (perm !== 'granted') {
                    console.log('🔄 [DocMat] Demande de permission readwrite…');
                    const req = await autoExportDirHandle.requestPermission({ mode: 'readwrite' });
                    console.log('🔄 [DocMat] Résultat demande permission:', req);
                    if (req !== 'granted') {
                        console.warn('⚠️ [DocMat] Permission refusée pour le dossier, fallback téléchargement');
                        autoExportDirHandle = null;
                    }
                }
            } catch (err) {
                console.warn('⚠️ [DocMat] Erreur de permission, fallback téléchargement:', err);
                autoExportDirHandle = null;
            }
        }

        const payload = {
            version: '1.0',
            exportDate: new Date().toISOString(),
            favorites: getFavorites(),
            folders: getFolders(),
            categories: getDocumentCategories(),
            customTerms: getCustomTerms()
        };

        const dateStamp = new Date().toISOString().slice(0, 10);
        const timeStamp = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }).replace(':', 'h');
        const fileName = `${autoExportFileName}_${dateStamp}_${timeStamp}.json`;
        const jsonData = JSON.stringify(payload, null, 2);

        if (autoExportDirHandle) {
            try {
                console.log('🔄 [DocMat] Écriture dans le dossier:', autoExportDirHandle.name, '→', fileName);
                const fileHandle = await autoExportDirHandle.getFileHandle(fileName, { create: true });
                const writable = await fileHandle.createWritable();
                await writable.write(jsonData);
                await writable.close();
                lastAutoExportTime = new Date().toISOString();
                localStorage.setItem('docmat_lastAutoExportTime', lastAutoExportTime);
                console.log('✅ [DocMat] Auto-export direct réussi → ' + autoExportDirName + '/' + fileName);
                showExportPanel('✅ Export réussi !', '📂 ' + autoExportDirName + ' → ' + fileName, lastAutoExportTime);
            } catch (err) {
                console.warn('⚠️ [DocMat] Écriture directe échouée, fallback téléchargement:', err);
                downloadJsonFileAuto(payload, fileName);
                lastAutoExportTime = new Date().toISOString();
                localStorage.setItem('docmat_lastAutoExportTime', lastAutoExportTime);
                showExportPanel('⚠️ Dossier inaccessible — téléchargé', '📥 ' + fileName + '\n❌ Erreur: ' + err.message, lastAutoExportTime);
            }
        } else {
            console.log('⚠️ [DocMat] Pas de handle de dossier → téléchargement classique');
            downloadJsonFileAuto(payload, fileName);
            lastAutoExportTime = new Date().toISOString();
            localStorage.setItem('docmat_lastAutoExportTime', lastAutoExportTime);
            console.log('✅ [DocMat] Auto-export téléchargé → ' + fileName);
            showExportPanel('⚠️ Pas de dossier configuré — téléchargé', '📥 Téléchargé → ' + fileName, lastAutoExportTime);
        }
    }

    // Panel persistant après un export (reste affiché jusqu'au clic sur la croix)
    function showExportPanel(title, detail, timestamp) {
        const existing = document.getElementById('docmat-export-success-panel');
        if (existing) existing.remove();

        const timeStr = new Date(timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const dateStr = new Date(timestamp).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });

        const panel = document.createElement('div');
        panel.id = 'docmat-export-success-panel';
        panel.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 100001;
            background: linear-gradient(135deg, #1a2a1a, #1e2e1e);
            color: #e0e0e0;
            border-radius: 14px;
            padding: 16px 20px;
            min-width: 320px;
            max-width: 420px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(74, 222, 128, 0.2);
            border: 1px solid rgba(74, 222, 128, 0.3);
            font-family: 'Segoe UI', sans-serif;
            animation: slideInExportPanelDocmat 0.3s ease;
            display: flex;
            flex-direction: column;
            gap: 6px;
        `;

        panel.innerHTML = `
            <style>
                @keyframes slideInExportPanelDocmat {
                    from { transform: translateX(100px); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOutExportPanelDocmat {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100px); opacity: 0; }
                }
                #docmat-export-success-panel .panel-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }
                #docmat-export-success-panel .panel-title {
                    font-size: 15px;
                    font-weight: 700;
                    color: #4ade80;
                }
                #docmat-export-success-panel .panel-close {
                    background: none;
                    border: none;
                    color: #888;
                    font-size: 20px;
                    cursor: pointer;
                    padding: 2px 6px;
                    border-radius: 6px;
                    transition: all 0.2s;
                    line-height: 1;
                }
                #docmat-export-success-panel .panel-close:hover {
                    background: rgba(255,255,255,0.1);
                    color: #fff;
                }
                #docmat-export-success-panel .panel-detail {
                    font-size: 13px;
                    color: #b0d0b0;
                    word-break: break-all;
                }
                #docmat-export-success-panel .panel-time {
                    font-size: 11px;
                    color: #667;
                    margin-top: 2px;
                }
                #docmat-export-success-panel .panel-bar {
                    height: 3px;
                    background: rgba(74, 222, 128, 0.3);
                    border-radius: 3px;
                    margin-top: 6px;
                    overflow: hidden;
                }
                #docmat-export-success-panel .panel-bar-fill {
                    height: 100%;
                    background: #4ade80;
                    border-radius: 3px;
                    width: 100%;
                }
            </style>
            <div class="panel-header">
                <span class="panel-title">${title}</span>
                <button class="panel-close" id="docmat-export-panel-close-btn" title="Fermer">✕</button>
            </div>
            <div class="panel-detail">${detail}</div>
            <div class="panel-time">🕐 ${dateStr} à ${timeStr}</div>
            <div class="panel-bar"><div class="panel-bar-fill"></div></div>
        `;

        document.body.appendChild(panel);

        document.getElementById('docmat-export-panel-close-btn').addEventListener('click', () => {
            panel.style.animation = 'slideOutExportPanelDocmat 0.25s ease forwards';
            setTimeout(() => panel.remove(), 250);
        });
    }

    // Vérifie si un export est nécessaire (1x/jour à 9H)
    function shouldAutoExportNow() {
        const now = new Date();
        const currentHour = now.getHours();
        const todayDateStr = now.toISOString().slice(0, 10);

        if (currentHour < AUTO_EXPORT_TARGET_HOUR) return false;

        if (lastAutoExportTime) {
            const lastExportDateStr = new Date(lastAutoExportTime).toISOString().slice(0, 10);
            if (lastExportDateStr === todayDateStr) return false;
        }

        return true;
    }

    function startAutoExportTimer() {
        if (autoExportIntervalId) {
            clearInterval(autoExportIntervalId);
        }
        if (autoExportEnabled) {
            // Vérifier immédiatement si un export est nécessaire
            if (shouldAutoExportNow()) {
                performAutoExport();
            }
            // Vérifier toutes les 60 secondes si l'heure cible est atteinte
            autoExportIntervalId = setInterval(() => {
                if (shouldAutoExportNow()) {
                    performAutoExport();
                }
            }, AUTO_EXPORT_CHECK_INTERVAL_MS);
            console.log('⏱️ [DocMat] Auto-export local activé : 1x/jour à 9H → fichier:', autoExportFileName);
        }
    }

    function stopAutoExportTimer() {
        if (autoExportIntervalId) {
            clearInterval(autoExportIntervalId);
            autoExportIntervalId = null;
        }
    }

    // Modal de configuration auto-export (CTRL+ALT+R)
    function openAutoExportConfig() {
        const old = document.getElementById('modal-docmat-auto-export-config');
        if (old) old.remove();

        const modal = document.createElement('div');
        modal.id = 'modal-docmat-auto-export-config';
        modal.style.cssText = `
            position: fixed;
            inset: 0;
            z-index: 100000;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(0, 0, 0, 0.6);
            backdrop-filter: blur(4px);
            animation: fadeInAutoExportDocmat 0.2s ease;
        `;

        modal.innerHTML = `
            <style>
                @keyframes fadeInAutoExportDocmat { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideUpAutoExportDocmat { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                #docmat-auto-export-config-box {
                    background: #1e1e1e;
                    border-radius: 16px;
                    padding: 28px 32px;
                    min-width: 440px;
                    max-width: 520px;
                    box-shadow: 0 20px 60px rgba(0,0,0,0.5);
                    border: 1px solid rgba(255,255,255,0.1);
                    animation: slideUpAutoExportDocmat 0.3s ease;
                    font-family: 'Segoe UI', sans-serif;
                    color: #e0e0e0;
                }
                #docmat-auto-export-config-box h2 {
                    margin: 0 0 8px 0;
                    font-size: 20px;
                    color: #fff;
                }
                #docmat-auto-export-config-box .subtitle {
                    font-size: 13px;
                    color: #888;
                    margin-bottom: 20px;
                }
                #docmat-auto-export-config-box label.field-label {
                    display: block;
                    font-size: 13px;
                    margin-bottom: 6px;
                    color: #bbb;
                    font-weight: 600;
                }
                #docmat-export-filename-input {
                    width: 100%;
                    box-sizing: border-box;
                    padding: 10px 14px;
                    border-radius: 8px;
                    border: 1px solid rgba(255,255,255,0.15);
                    background: #2a2a2a;
                    color: #fff;
                    font-size: 14px;
                    outline: none;
                    transition: border-color 0.2s;
                    margin-bottom: 6px;
                }
                #docmat-export-filename-input:focus {
                    border-color: #667eea;
                }
                #docmat-export-filename-input::placeholder {
                    color: #666;
                }
                .docmat-auto-export-filename-preview {
                    font-size: 11px;
                    color: #777;
                    margin-bottom: 18px;
                    font-style: italic;
                }
                .docmat-auto-export-toggle-row {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 20px;
                }
                .docmat-auto-export-toggle-label {
                    font-size: 14px;
                    color: #ccc;
                }
                .docmat-auto-export-toggle {
                    position: relative;
                    width: 48px;
                    height: 26px;
                    cursor: pointer;
                }
                .docmat-auto-export-toggle input {
                    opacity: 0;
                    width: 0;
                    height: 0;
                }
                .docmat-auto-export-toggle .slider {
                    position: absolute;
                    inset: 0;
                    background: #444;
                    border-radius: 26px;
                    transition: background 0.3s;
                }
                .docmat-auto-export-toggle .slider:before {
                    content: '';
                    position: absolute;
                    width: 20px;
                    height: 20px;
                    background: #fff;
                    border-radius: 50%;
                    left: 3px;
                    top: 3px;
                    transition: transform 0.3s;
                }
                .docmat-auto-export-toggle input:checked + .slider {
                    background: #667eea;
                }
                .docmat-auto-export-toggle input:checked + .slider:before {
                    transform: translateX(22px);
                }
                .docmat-auto-export-btn-row {
                    display: flex;
                    gap: 10px;
                    justify-content: space-between;
                }
                .docmat-auto-export-btn {
                    padding: 10px 22px;
                    border: none;
                    border-radius: 10px;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .docmat-auto-export-btn-save {
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    color: #fff;
                }
                .docmat-auto-export-btn-save:hover {
                    filter: brightness(1.15);
                    transform: translateY(-1px);
                }
                .docmat-auto-export-btn-cancel {
                    background: #333;
                    color: #ccc;
                }
                .docmat-auto-export-btn-cancel:hover {
                    background: #444;
                }
                .docmat-auto-export-info {
                    background: rgba(102, 126, 234, 0.1);
                    border: 1px solid rgba(102, 126, 234, 0.2);
                    border-radius: 8px;
                    padding: 10px 14px;
                    font-size: 12px;
                    color: #a0b0e0;
                    margin-bottom: 18px;
                    line-height: 1.5;
                }
                .docmat-auto-export-timer {
                    font-size: 11px;
                    font-weight: 600;
                    color: #4ade80;
                    background: rgba(74, 222, 128, 0.1);
                    border: 1px solid rgba(74, 222, 128, 0.2);
                    padding: 3px 8px;
                    border-radius: 6px;
                    margin-left: 12px;
                    white-space: nowrap;
                    font-family: 'Consolas', 'Courier New', monospace;
                    letter-spacing: 0.5px;
                    min-width: 70px;
                    text-align: center;
                    display: inline-block;
                    vertical-align: middle;
                }
                .docmat-auto-export-timer.off {
                    color: #888;
                    background: rgba(255, 255, 255, 0.05);
                    border-color: rgba(255, 255, 255, 0.1);
                }
            </style>
            <div id="docmat-auto-export-config-box">
                <h2>📄 Configuration Auto-Export DocMat <span id="docmat-auto-export-timer" class="docmat-auto-export-timer">${autoExportEnabled ? '⏳ …' : '⏸️ OFF'}</span></h2>
                <p class="subtitle">Exporte automatiquement vos favoris DocMat sur votre PC 1 fois par jour à 9H</p>

                <div id="docmat-auto-export-last-info" style="font-size:12px;color:#888;margin-bottom:12px;">
                    ${lastAutoExportTime
                        ? '📅 Dernier export : ' + new Date(lastAutoExportTime).toLocaleDateString('fr-FR') + ' à ' + new Date(lastAutoExportTime).toLocaleTimeString('fr-FR', {hour:'2-digit',minute:'2-digit'})
                        : '📅 Aucun export effectué pour le moment'}
                </div>

                <div class="docmat-auto-export-info">
                    💡 Choisissez un <b>dossier de destination</b> et le fichier JSON y sera sauvegardé directement.<br>
                    Un nouveau fichier sera créé automatiquement <b>1 fois par jour à 9H</b>.<br>
                    ⚠️ Le timer ne tourne <b>que quand la page est ouverte</b>. Si la page est ouverte après 9H et qu'aucun export n'a eu lieu aujourd'hui, l'export se fera immédiatement.<br>
                    Raccourci : <b>Ctrl + Alt + R</b> pour rouvrir cette fenêtre.
                </div>

                <label class="field-label">📂 Dossier de destination</label>
                <div style="display:flex;gap:8px;align-items:center;margin-bottom:6px;">
                    <div id="docmat-auto-export-path-display" style="flex:1;padding:10px 14px;border-radius:8px;border:1px solid rgba(255,255,255,0.15);background:#2a2a2a;color:#fff;font-size:13px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-height:20px;">${autoExportDirName ? '📁 ' + autoExportDirName : '<span style=&quot;color:#666;&quot;>Aucun dossier sélectionné</span>'}</div>
                    <button id="docmat-auto-export-btn-browse" style="padding:10px 16px;border:none;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;background:#3a3a5c;color:#c0c0ff;transition:all 0.2s;white-space:nowrap;">📁 Parcourir…</button>
                </div>
                <div id="docmat-auto-export-path-hint" style="font-size:11px;color:#666;margin-bottom:18px;font-style:italic;">
                    ${autoExportDirName ? '✅ Les fichiers seront enregistrés dans ce dossier' : 'Cliquez sur Parcourir pour choisir le dossier, sinon → Téléchargements'}
                </div>

                <label class="field-label" for="docmat-export-filename-input">📄 Nom du fichier d'export</label>
                <input type="text" id="docmat-export-filename-input" placeholder="DocMatExport" value="${autoExportFileName.replace(/"/g, '&quot;')}" />
                <div class="docmat-auto-export-filename-preview" id="docmat-auto-export-filename-preview">
                    Aperçu : ${autoExportFileName}_2026-03-20_09h00.json
                </div>

                <div class="docmat-auto-export-toggle-row">
                    <span class="docmat-auto-export-toggle-label">⏱️ Activer l'auto-export quotidien à 9H</span>
                    <label class="docmat-auto-export-toggle">
                        <input type="checkbox" id="docmat-auto-export-enabled-toggle" ${autoExportEnabled ? 'checked' : ''} />
                        <span class="slider"></span>
                    </label>
                </div>

                <div style="border-top:1px solid rgba(255,255,255,0.08);margin:8px 0 16px 0;padding-top:16px;">
                    <label class="field-label" style="margin-bottom:10px;">📦 Import / Export Manuel</label>
                    <div style="display:flex;gap:10px;margin-bottom:16px;">
                        <button class="docmat-auto-export-btn" id="docmat-auto-export-btn-manual-export" style="flex:1;background:#1e3a5f;color:#7db8f0;">📤 Exporter JSON</button>
                        <button class="docmat-auto-export-btn" id="docmat-auto-export-btn-manual-import" style="flex:1;background:#3a1e5f;color:#c0a0f0;">📥 Importer JSON</button>
                    </div>
                </div>

                <div class="docmat-auto-export-btn-row">
                    <button class="docmat-auto-export-btn docmat-auto-export-btn-cancel" id="docmat-auto-export-btn-cancel">Annuler</button>
                    <button class="docmat-auto-export-btn docmat-auto-export-btn-save" id="docmat-auto-export-btn-save">💾 Sauvegarder</button>
                </div>
                <button class="docmat-auto-export-btn" id="docmat-auto-export-btn-test" style="width:100%;margin-top:10px;background:linear-gradient(135deg,#1e5f3a,#2a8050);color:#7df0b8;">🧪 Tester l'export maintenant</button>
            </div>
        `;

        document.body.appendChild(modal);

        // ── Timer countdown dans le header ──
        const timerEl = document.getElementById('docmat-auto-export-timer');
        let timerInterval = null;

        function updateTimerDisplay() {
            if (!autoExportEnabled) {
                timerEl.textContent = '⏸️ OFF';
                timerEl.classList.add('off');
                return;
            }
            timerEl.classList.remove('off');

            if (!lastAutoExportTime) {
                timerEl.textContent = '⏳ Prochain : 9H';
                return;
            }

            // Calculer le prochain export à 9H
            const now = new Date();
            const todayDateStr = now.toISOString().slice(0, 10);
            const lastExportDateStr = new Date(lastAutoExportTime).toISOString().slice(0, 10);

            if (lastExportDateStr === todayDateStr) {
                // Déjà exporté aujourd'hui → prochain demain à 9H
                const tomorrow9H = new Date(now);
                tomorrow9H.setDate(tomorrow9H.getDate() + 1);
                tomorrow9H.setHours(AUTO_EXPORT_TARGET_HOUR, 0, 0, 0);
                const remaining = tomorrow9H.getTime() - now.getTime();

                if (remaining <= 0) {
                    timerEl.textContent = '🔄 Imminent';
                    return;
                }

                const totalSec = Math.floor(remaining / 1000);
                const h = Math.floor(totalSec / 3600);
                const m = Math.floor((totalSec % 3600) / 60);
                const s = totalSec % 60;
                timerEl.textContent = '⏳ ' + String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
            } else {
                // Pas encore exporté aujourd'hui
                if (now.getHours() >= AUTO_EXPORT_TARGET_HOUR) {
                    timerEl.textContent = '🔄 Imminent';
                } else {
                    const today9H = new Date(now);
                    today9H.setHours(AUTO_EXPORT_TARGET_HOUR, 0, 0, 0);
                    const remaining = today9H.getTime() - now.getTime();
                    const totalSec = Math.floor(remaining / 1000);
                    const h = Math.floor(totalSec / 3600);
                    const m = Math.floor((totalSec % 3600) / 60);
                    const s = totalSec % 60;
                    timerEl.textContent = '⏳ ' + String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
                }
            }
        }

        updateTimerDisplay();
        timerInterval = setInterval(updateTimerDisplay, 1000);

        // Nettoyer l'interval quand le modal est fermé
        const originalRemove = modal.remove.bind(modal);
        modal.remove = () => {
            if (timerInterval) clearInterval(timerInterval);
            originalRemove();
        };

        // Bouton Parcourir
        document.getElementById('docmat-auto-export-btn-browse').addEventListener('click', async () => {
            if (typeof window.showDirectoryPicker === 'function') {
                try {
                    autoExportDirHandle = await window.showDirectoryPicker({ mode: 'readwrite' });
                    autoExportDirName = autoExportDirHandle.name;
                    localStorage.setItem('docmat_autoExportDirName', autoExportDirName);
                    await saveDirHandleToIDB(autoExportDirHandle);
                    document.getElementById('docmat-auto-export-path-display').textContent = '📁 ' + autoExportDirName;
                    document.getElementById('docmat-auto-export-path-hint').textContent = '✅ Les fichiers seront enregistrés dans ce dossier';
                    document.getElementById('docmat-auto-export-path-hint').style.color = '#4ade80';
                    showNotification('📂 Dossier sélectionné : ' + autoExportDirName, 'success');
                } catch (err) {
                    if (err.name !== 'AbortError') {
                        console.error('❌ Erreur sélection dossier:', err);
                        showNotification('❌ Erreur lors de la sélection du dossier', 'error');
                    }
                }
            } else {
                showNotification('⚠️ Votre navigateur ne supporte pas le choix de dossier. Les fichiers iront dans vos Téléchargements.', 'error');
            }
        });

        // Preview dynamique du nom de fichier
        const filenameInput = document.getElementById('docmat-export-filename-input');
        const filenamePreview = document.getElementById('docmat-auto-export-filename-preview');
        filenameInput.addEventListener('input', () => {
            const name = filenameInput.value.trim() || 'DocMatExport';
            filenamePreview.textContent = 'Aperçu : ' + name + '_2026-03-20_09h00.json';
        });

        // Fermer en cliquant en dehors
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });

        // Bouton Annuler
        document.getElementById('docmat-auto-export-btn-cancel').addEventListener('click', () => {
            modal.remove();
        });

        // Bouton Sauvegarder
        document.getElementById('docmat-auto-export-btn-save').addEventListener('click', () => {
            const nameInput = document.getElementById('docmat-export-filename-input').value.trim();
            const enabledToggle = document.getElementById('docmat-auto-export-enabled-toggle').checked;

            autoExportFileName = nameInput || 'DocMatExport';
            autoExportEnabled = enabledToggle;
            localStorage.setItem('docmat_autoExportFileName', autoExportFileName);
            localStorage.setItem('docmat_autoExportEnabled', String(autoExportEnabled));
            localStorage.setItem('docmat_autoExportDirName', autoExportDirName);

            if (autoExportEnabled) {
                startAutoExportTimer();
                const dest = autoExportDirName ? '📂 ' + autoExportDirName : '📥 Téléchargements';
                showNotification('✅ Auto-export activé ! → ' + dest + ' — Prochain export à 9H.', 'success');
                updateTimerDisplay();
            } else {
                stopAutoExportTimer();
                showNotification('⏸️ Auto-export désactivé.', 'info');
                updateTimerDisplay();
            }

            modal.remove();
        });

        // Bouton Tester l'export
        document.getElementById('docmat-auto-export-btn-test').addEventListener('click', async () => {
            showNotification('🧪 Test d\'export en cours…', 'info');
            // Forcer l'export même si auto-export désactivé (c'est un test manuel)
            const wasEnabled = autoExportEnabled;
            autoExportEnabled = true;
            await performAutoExport();
            autoExportEnabled = wasEnabled;
            modal.remove();
        });

        // Bouton Export Manuel
        document.getElementById('docmat-auto-export-btn-manual-export').addEventListener('click', () => {
            exportToJSON();
            modal.remove();
        });

        // Bouton Import Manuel
        document.getElementById('docmat-auto-export-btn-manual-import').addEventListener('click', () => {
            modal.remove();
            importFromJSON();
        });

        // Fermer avec Escape
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                modal.remove();
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);
    }

    // Raccourci clavier CTRL + ALT + R
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.altKey && (e.key === 'r' || e.key === 'R')) {
            e.preventDefault();
            e.stopPropagation();
            openAutoExportConfig();
        }
    });

    // Menu Tampermonkey
    if (typeof GM_registerMenuCommand === 'function') {
        GM_registerMenuCommand('Configuration Export/Import (Ctrl+Alt+R)', openAutoExportConfig);
    }

    function exportToJSON() {
        try {
            const data = {
                version: '1.0',
                exportDate: new Date().toISOString(),
                favorites: getFavorites(),
                folders: getFolders(),
                categories: getDocumentCategories(),
                customTerms: getCustomTerms()
            };

            const jsonStr = JSON.stringify(data, null, 2);
            const blob = new Blob([jsonStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `docmat-favoris-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            showNotification('✅ Export réussi !', 'success');
        } catch (error) {
            console.error('Erreur lors de l\'export:', error);
            showNotification('❌ Erreur lors de l\'export', 'error');
        }
    }

    function importFromJSON() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';

        input.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            try {
                const text = await file.text();
                const data = JSON.parse(text);

                // Validation basique
                if (!data.favorites || !data.folders) {
                    throw new Error('Format de fichier invalide');
                }

                // Demander confirmation
                const confirmed = await showConfirm(
                    '⚠️ Confirmer l\'importation',
                    `Voulez-vous fusionner (Oui) ou remplacer (Non) les données actuelles ?

📊 Fichier à importer :
- ${data.favorites.length} favoris
- ${data.folders.length} dossiers
- ${data.categories?.length || 0} catégories
- ${data.customTerms?.length || 0} termes personnalisés`
                );

                if (confirmed === null) return; // Annulé

                if (confirmed) {
                    // Fusion des données
                    mergeFavoritesData(data);
                    showNotification('✅ Données fusionnées avec succès !', 'success');
                } else {
                    // Remplacement complet
                    replaceFavoritesData(data);
                    showNotification('✅ Données remplacées avec succès !', 'success');
                }

                // Rafraîchir l'affichage
                console.log('🔄 Rafraîchissement de l\'affichage...');
                console.log('📊 Favoris après import:', getFavorites().length);
                console.log('📁 Dossiers après import:', getFolders().length);

                updateFavoritesList();
                updateFavoritesCount();

                console.log('✅ Affichage mis à jour');

            } catch (error) {
                console.error('Erreur lors de l\'import:', error);
                showNotification('❌ Erreur lors de l\'import: ' + error.message, 'error');
            }
        });

        input.click();
    }

    function mergeFavoritesData(data) {
        console.log('🔄 Début de la fusion des données...');
        console.log('📊 Données actuelles avant fusion:', {
            favoris: getFavorites().length,
            dossiers: getFolders().length
        });
        console.log('📦 Données à importer:', {
            favoris: data.favorites?.length || 0,
            dossiers: data.folders?.length || 0
        });

        // Fusion des dossiers d'abord (pour créer le mapping des IDs)
        const currentFolders = getFolders();
        const folderIdMap = {}; // Pour mapper les anciens IDs aux nouveaux

        data.folders.forEach(folder => {
            const exists = currentFolders.find(cf =>
                cf.name === folder.name && cf.parentId === folder.parentId
            );

            if (!exists) {
                const newId = Date.now().toString() + Math.random();
                folderIdMap[folder.id] = newId;
                currentFolders.push({
                    ...folder,
                    id: newId,
                    date: new Date().toISOString()
                });
                console.log(`📁 Nouveau dossier ajouté: ${folder.name}`);
            } else {
                folderIdMap[folder.id] = exists.id;
                console.log(`📁 Dossier existant conservé: ${folder.name}`);
            }
        });
        saveFolders(currentFolders);

        // Fusion des favoris en gardant la mémoire de ceux déjà enregistrés
        const currentFavorites = getFavorites();
        const mergedFavorites = [...currentFavorites]; // On garde TOUS les favoris actuels

        let addedCount = 0;
        let keptCount = 0;

        data.favorites.forEach(importedFav => {
            const existingFav = currentFavorites.find(cf => cf.number === importedFav.number);

            if (existingFav) {
                // Le favori existe déjà : on GARDE les données actuelles (priorité aux données locales)
                keptCount++;
                console.log(`⭐ Favori ${existingFav.number} déjà présent, conservation des données locales (dossier: ${existingFav.folderId || 'aucun'})`);
            } else {
                // Nouveau favori : on l'ajoute en mappant son folderId si nécessaire
                const newFav = { ...importedFav };
                if (newFav.folderId && folderIdMap[newFav.folderId]) {
                    newFav.folderId = folderIdMap[newFav.folderId];
                    console.log(`⭐ Nouveau favori ${newFav.number} ajouté avec mapping dossier`);
                } else {
                    console.log(`⭐ Nouveau favori ${newFav.number} ajouté`);
                }
                mergedFavorites.push(newFav);
                addedCount++;
            }
        });

        console.log(`✅ Fusion terminée: ${keptCount} favoris conservés, ${addedCount} favoris ajoutés`);
        console.log(`📊 Total final: ${mergedFavorites.length} favoris`);

        saveFavorites(mergedFavorites);

        // Fusion des catégories
        if (data.categories) {
            const currentCategories = getDocumentCategories();
            const newCategories = data.categories.filter(cat =>
                !currentCategories.some(cc => cc.name === cat.name)
            );
            saveDocumentCategories([...currentCategories, ...newCategories]);
        }

        // Fusion des termes personnalisés
        if (data.customTerms) {
            const currentTerms = getCustomTerms();
            const newTerms = data.customTerms.filter(term =>
                !currentTerms.some(ct => ct.term === term.term)
            );
            saveCustomTerms([...currentTerms, ...newTerms]);
        }
    }

    function replaceFavoritesData(data) {
        // Remplacement complet des données
        saveFavorites(data.favorites || []);
        saveFolders(data.folders || []);

        if (data.categories) {
            saveDocumentCategories(data.categories);
        }

        if (data.customTerms) {
            saveCustomTerms(data.customTerms);
        }
    }

    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 16px 24px;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
            color: white;
            border-radius: 12px;
            font-size: 14px;
            font-weight: 600;
            z-index: 100000;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
            animation: slideInRight 0.3s ease;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    function showConfirm(title, message) {
        return new Promise((resolve) => {
            const modal = document.createElement('div');
            modal.className = 'confirm-dialog-modal';
            modal.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(15, 23, 42, 0.95);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 100001;
                backdrop-filter: blur(10px);
            `;

            modal.innerHTML = `
                <div style="
                    background: #1e293b;
                    padding: 32px;
                    border-radius: 20px;
                    max-width: 500px;
                    width: 90%;
                    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
                    border: 2px solid #334155;
                ">
                    <div style="font-size: 24px; font-weight: 700; color: #f1f5f9; margin-bottom: 16px;">
                        ${title}
                    </div>
                    <div style="color: #94a3b8; margin-bottom: 24px; white-space: pre-line; line-height: 1.6;">
                        ${message}
                    </div>
                    <div style="display: flex; gap: 12px; justify-content: flex-end;">
                        <button class="confirm-cancel" style="
                            background: #334155;
                            border: 2px solid #475569;
                            color: #f1f5f9;
                            padding: 12px 24px;
                            border-radius: 10px;
                            cursor: pointer;
                            font-size: 14px;
                            font-weight: 600;
                            transition: all 0.3s ease;
                        ">Annuler</button>
                        <button class="confirm-no" style="
                            background: #ef4444;
                            border: none;
                            color: white;
                            padding: 12px 24px;
                            border-radius: 10px;
                            cursor: pointer;
                            font-size: 14px;
                            font-weight: 600;
                            transition: all 0.3s ease;
                        ">Non (Remplacer)</button>
                        <button class="confirm-yes" style="
                            background: #10b981;
                            border: none;
                            color: white;
                            padding: 12px 24px;
                            border-radius: 10px;
                            cursor: pointer;
                            font-size: 14px;
                            font-weight: 600;
                            transition: all 0.3s ease;
                        ">Oui (Fusionner)</button>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);

            modal.querySelector('.confirm-yes').addEventListener('click', () => {
                modal.remove();
                resolve(true);
            });

            modal.querySelector('.confirm-no').addEventListener('click', () => {
                modal.remove();
                resolve(false);
            });

            modal.querySelector('.confirm-cancel').addEventListener('click', () => {
                modal.remove();
                resolve(null);
            });

            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.remove();
                    resolve(null);
                }
            });
        });
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
                    <button class="manage-categories-btn">🎨 Gérer les Catégories</button>
                    <button class="export-btn">💾 Exporter JSON</button>
                    <button class="import-btn">📥 Importer JSON</button>
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

        // Bouton gérer les catégories
        modal.querySelector('.manage-categories-btn').addEventListener('click', openCategoriesModal);

        // Bouton exporter
        modal.querySelector('.export-btn').addEventListener('click', exportToJSON);

        // Bouton importer
        modal.querySelector('.import-btn').addEventListener('click', importFromJSON);

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
        try {
            createFavoritesModal();
            updateFavoritesList();
            const modal = document.querySelector('.favorites-modal');
            if (modal) {
                modal.classList.add('show');
            }
        } catch (error) {
            console.error('Erreur lors de l\'ouverture de la modal:', error);
            console.error('Stack:', error.stack);
            alert('Erreur lors de l\'ouverture des favoris. Vérifiez la console (F12) pour plus de détails.');
        }
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

        // Fonction récursive pour compter les favoris dans un dossier et ses sous-dossiers
        const countFavoritesInFolder = (folderId) => {
            const subfolders = folders.filter(f => f.parentId === folderId);
            let count = favorites.filter(fav => fav.folderId === folderId).length;
            subfolders.forEach(sub => {
                count += countFavoritesInFolder(sub.id);
            });
            return count;
        };

        // Fonction récursive pour construire l'arborescence
        const buildFolderTree = (parentId = null, level = 0) => {
            let html = '';
            const childFolders = folders.filter(f => f.parentId === parentId);

            // Filtrer selon la recherche
            const filteredChildFolders = folderSearchQuery
                ? childFolders.filter(f => f.name.toLowerCase().includes(folderSearchQuery.toLowerCase()))
                : childFolders;

            filteredChildFolders.forEach(folder => {
                const hasChildren = folders.some(f => f.parentId === folder.id);
                const folderCount = countFavoritesInFolder(folder.id);

                html += `<div class="folder-section">`;
                html += `<div class="folder-header ${folder.collapsed ? 'collapsed' : ''} ${currentFolderId === folder.id ? 'active' : ''}" data-folder-id="${folder.id}">`;

                // Icône d'expansion si le dossier a des enfants
                if (hasChildren) {
                    html += `<span class="folder-icon expandable" data-folder-id="${folder.id}">🔽</span>`;
                } else {
                    html += '<span class="folder-icon">📁</span>';
                }

                // Highlight le texte recherché
                let folderNameHtml = folder.name;
                if (folderSearchQuery) {
                    const regex = new RegExp(`(${folderSearchQuery})`, 'gi');
                    folderNameHtml = folder.name.replace(regex, '<span class="highlight-match">$1</span>');
                }
                html += `<span class="folder-name">${folderNameHtml}</span>`;
                html += `<span class="folder-count">${folderCount}</span>`;
                html += '<div class="folder-actions">';
                html += `<button class="add-subfolder" data-folder-id="${folder.id}" title="Nouveau sous-dossier">➕</button>`;
                html += `<button class="rename-folder" data-folder-id="${folder.id}" title="Renommer">✏️</button>`;
                html += `<button class="delete-folder" data-folder-id="${folder.id}" title="Supprimer">🗑️</button>`;
                html += '</div></div>';

                // Sous-dossiers
                if (hasChildren) {
                    html += `<div class="folder-children ${folder.collapsed ? 'hidden' : ''}" data-parent-id="${folder.id}">`;
                    html += buildFolderTree(folder.id, level + 1);
                    html += '</div>';
                }

                html += '</div>';
            });

            return html;
        };

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

        // Construire l'arborescence à partir des dossiers racines
        html += buildFolderTree(null, 0);

        if (folderSearchQuery && folders.length > 0 && !html.includes('folder-name')) {
            html += '<div class="no-favorites" style="padding: 20px; font-size: 14px;">Aucun dossier trouvé</div>';
        }

        treeContainer.innerHTML = html;

        // Événements pour sélectionner un dossier
        treeContainer.querySelectorAll('.folder-header').forEach(header => {
            header.addEventListener('click', (e) => {
                if (e.target.classList.contains('rename-folder') ||
                    e.target.classList.contains('delete-folder') ||
                    e.target.classList.contains('add-subfolder') ||
                    e.target.classList.contains('folder-icon')) {
                    return;
                }
                const folderId = header.getAttribute('data-folder-id');
                currentFolderId = folderId;
                updateFavoritesList();
            });
        });

        // Événements pour expand/collapse les dossiers
        treeContainer.querySelectorAll('.folder-icon.expandable').forEach(icon => {
            icon.addEventListener('click', (e) => {
                e.stopPropagation();
                const folderId = icon.getAttribute('data-folder-id');
                toggleFolder(folderId);
                updateFoldersTree();
            });
        });

        // Événements pour ajouter un sous-dossier
        treeContainer.querySelectorAll('.add-subfolder').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const parentId = e.target.getAttribute('data-folder-id');
                const name = await customPrompt('Nom du nouveau sous-dossier:', '', '📁');
                if (name && name.trim() !== '') {
                    if (createFolder(name, parentId)) {
                        updateFavoritesList();
                        showNotification('✅ Sous-dossier créé !');
                    } else {
                        await customAlert('Un dossier avec ce nom existe déjà à cet emplacement !', '⚠️');
                    }
                }
            });
        });

        // Événements pour renommer
        treeContainer.querySelectorAll('.rename-folder').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const folderId = e.target.getAttribute('data-folder-id');
                const folders = getFolders();
                const folder = folders.find(f => f.id === folderId);
                if (folder) {
                    const newName = await customPrompt('Nouveau nom du dossier:', folder.name, '📁');
                    if (newName && newName.trim() !== '') {
                        renameFolder(folderId, newName);
                        updateFavoritesList();
                    }
                }
            });
        });

        // Événements pour supprimer
        treeContainer.querySelectorAll('.delete-folder').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const folderId = e.target.getAttribute('data-folder-id');
                const folders = getFolders();
                const hasSubfolders = folders.some(f => f.parentId === folderId);
                const message = hasSubfolders
                    ? 'Supprimer ce dossier et tous ses sous-dossiers ?\n(Les favoris seront déplacés dans "Sans dossier")'
                    : 'Supprimer ce dossier ?\n(Les favoris seront déplacés dans "Sans dossier")';
                const confirmed = await customConfirm(message, '🗑️');
                if (confirmed) {
                    deleteFolder(folderId);
                    if (currentFolderId === folderId) {
                        currentFolderId = 'all';
                    }
                    updateFavoritesList();
                }
            });
        });

        // Drag & Drop pour déplacer des favoris vers les dossiers
        treeContainer.querySelectorAll('.folder-header').forEach(header => {
            header.addEventListener('dragover', handleFolderDragOver);
            header.addEventListener('dragenter', handleFolderDragEnter);
            header.addEventListener('dragleave', handleFolderDragLeave);
            header.addEventListener('drop', handleFolderDrop);
        });
    }

    function updateFavoritesDisplay() {
        const listContainer = document.querySelector('.favorites-list');
        const titleElement = document.querySelector('#current-folder-title');
        if (!listContainer) return;

        const favorites = getFavorites();
        const folders = getFolders();

        // Fonction pour récupérer tous les IDs de sous-dossiers récursivement
        const getAllSubfolderIds = (folderId) => {
            let ids = [folderId];
            const children = folders.filter(f => f.parentId === folderId);
            children.forEach(child => {
                ids = ids.concat(getAllSubfolderIds(child.id));
            });
            return ids;
        };

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
            // Récupérer tous les sous-dossiers récursivement
            const folderIds = getAllSubfolderIds(currentFolderId);
            // Filtrer les favoris qui sont dans ce dossier OU dans un de ses sous-dossiers
            filteredFavorites = favorites.filter(fav => folderIds.includes(fav.folderId));
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
        try {
            attachFavoriteEvents();
        } catch (error) {
            console.error('Erreur lors de l\'attachement des événements:', error);
        }
    }

    function renderFavorites(favorites) {
        try {
            const folders = getFolders();
            const categories = getDocumentCategories();
            let html = '';

            // Trier les favoris par niveau d'indentation (du plus élevé au plus bas)
            const sortedFavorites = [...favorites].sort((a, b) => {
                const aCat = getCategoryForTitle(a.title);
                const bCat = getCategoryForTitle(b.title);

                const aLevel = aCat ? aCat.indentLevel : -1;
                const bLevel = bCat ? bCat.indentLevel : -1;

                // Trier par niveau d'indentation décroissant (2, 1, 0, puis -1)
                return bLevel - aLevel;
            });

            // Zone de drop au début
            html += '<div class="drop-zone" data-index="0"></div>';

            sortedFavorites.forEach((fav, index) => {
                // Highlight le texte recherché
                let titleHtml = fav.title;
                let numberHtml = formatDocumentNumber(fav.number);

                if (favoritesSearchQuery) {
                    const regex = new RegExp(`(${favoritesSearchQuery})`, 'gi');
                    titleHtml = fav.title.replace(regex, '<span class="highlight-match">$1</span>');
                    numberHtml = formatDocumentNumber(fav.number).replace(regex, '<span class="highlight-match">$1</span>');
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

                // Détecter la catégorie du document
                const category = getCategoryForTitle(fav.title);
                let categoryAttr = '';
                let indentClass = '';
                let styleAttr = '';

                if (category) {
                    categoryAttr = ` data-category="${category.id}"`;
                    styleAttr = ` style="border-color: ${category.color}; background: ${category.color}15;"`;

                    if (category.indentLevel === 1) {
                        indentClass = ' indent-level-1';
                    } else if (category.indentLevel === 2) {
                        indentClass = ' indent-level-2';
                    }
                }

                html += `
                    <div class="favorite-item${indentClass}" data-number="${fav.number}" data-index="${index}"${categoryAttr}${styleAttr}>
                        <span class="drag-handle" draggable="true">⋮⋮</span>
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

                // Zone de drop après chaque élément
                html += `<div class="drop-zone" data-index="${index + 1}"></div>`;
            });

            return html;
        } catch (error) {
            console.error('Erreur dans renderFavorites:', error);
            console.error('Stack:', error.stack);
            return '<div class="no-favorites">Erreur lors du rendu des favoris</div>';
        }
    }

    function attachFavoriteEvents() {
        const listContainer = document.querySelector('.favorites-list');
        if (!listContainer) return;

        // Cliquer sur toute la zone du favori pour remplir le champ
        listContainer.querySelectorAll('.favorite-item').forEach(item => {
            item.addEventListener('click', (e) => {
                // Ne pas déclencher si on clique sur le drag handle ou les boutons
                if (e.target.classList.contains('drag-handle') ||
                    e.target.closest('.favorite-actions') ||
                    e.target.closest('button')) {
                    return;
                }
                const number = item.getAttribute('data-number');
                fillSearchField(number);
                closeFavoritesModal();
            });

            // Garder le curseur pointer sur toute la zone sauf drag handle et boutons
            item.style.cursor = 'pointer';
        });

        // Modifier un favori
        listContainer.querySelectorAll('.edit-favorite').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const number = e.target.getAttribute('data-number');
                openEditModal(number);
            });
        });

        // Supprimer un favori
        listContainer.querySelectorAll('.remove-favorite').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const number = e.target.getAttribute('data-number');
                removeFavorite(number);
                updateFavoritesList();
            });
        });

        // Le drag handle garde son propre curseur et gère le drag
        listContainer.querySelectorAll('.drag-handle').forEach(handle => {
            handle.style.cursor = 'grab';
            handle.addEventListener('mousedown', () => {
                handle.style.cursor = 'grabbing';
            });
            handle.addEventListener('mouseup', () => {
                handle.style.cursor = 'grab';
            });

            // Attacher les événements de drag au handle
            handle.addEventListener('dragstart', handleDragStart);
            handle.addEventListener('dragend', handleDragEnd);
        });

        // Pas de drag events sur les items, seulement sur les drop zones
        listContainer.querySelectorAll('.drop-zone').forEach(zone => {
            zone.addEventListener('dragover', handleDropZoneDragOver);
            zone.addEventListener('dragenter', handleDropZoneDragEnter);
            zone.addEventListener('dragleave', handleDropZoneDragLeave);
            zone.addEventListener('drop', handleDropZoneDrop);
        });
    }

    // Variables globales pour le drag & drop
    let draggedElement = null;
    let draggedFavoriteNumber = null;
    let draggedIndex = -1;

    function handleDragStart(e) {
        const handle = e.target;
        draggedElement = handle.closest('.favorite-item');

        if (!draggedElement) return;

        draggedFavoriteNumber = draggedElement.getAttribute('data-number');
        draggedIndex = parseInt(draggedElement.getAttribute('data-index'));
        draggedElement.classList.add('dragging');

        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', draggedFavoriteNumber);
    }

    function handleDragEnd(e) {
        if (draggedElement) {
            draggedElement.classList.remove('dragging');
        }

        // Retirer toutes les classes
        document.querySelectorAll('.favorites-modal .drop-zone').forEach(zone => {
            zone.classList.remove('active');
        });
        document.querySelectorAll('.favorites-modal .favorite-item').forEach(item => {
            item.classList.remove('shift-up', 'shift-down');
        });

        draggedElement = null;
        draggedFavoriteNumber = null;
        draggedIndex = -1;
    }

    function handleDropZoneDragOver(e) {
        if (e.preventDefault) {
            e.preventDefault();
        }
        e.dataTransfer.dropEffect = 'move';
        return false;
    }

    function handleDropZoneDragEnter(e) {
        if (!draggedElement) return;

        const zone = e.currentTarget;
        const targetIndex = parseInt(zone.getAttribute('data-index'));

        // Retirer toutes les classes actives
        document.querySelectorAll('.favorites-modal .drop-zone').forEach(z => {
            z.classList.remove('active');
        });
        document.querySelectorAll('.favorites-modal .favorite-item').forEach(item => {
            item.classList.remove('shift-up', 'shift-down');
        });

        // Activer cette zone
        zone.classList.add('active');

        // Déplacer les éléments pour montrer où ça va atterrir
        updateItemsShift(targetIndex);
    }

    function handleDropZoneDragLeave(e) {
        // Le leave est géré par le enter de la nouvelle zone
    }

    function updateItemsShift(targetIndex) {
        const allItems = Array.from(document.querySelectorAll('.favorites-modal .favorite-item'));

        allItems.forEach((item, index) => {
            item.classList.remove('shift-up', 'shift-down');

            // Ne pas bouger l'élément dragué
            if (index === draggedIndex) return;

            // Si on insère avant l'élément dragué
            if (targetIndex <= draggedIndex) {
                // Les éléments entre targetIndex et draggedIndex descendent
                if (index >= targetIndex && index < draggedIndex) {
                    item.classList.add('shift-down');
                }
            } else {
                // On insère après l'élément dragué
                // Les éléments entre draggedIndex et targetIndex montent
                if (index > draggedIndex && index < targetIndex) {
                    item.classList.add('shift-up');
                }
            }
        });
    }

    function handleDropZoneDrop(e) {
        if (e.stopPropagation) {
            e.stopPropagation();
        }
        e.preventDefault();

        const zone = e.currentTarget;
        const targetIndex = parseInt(zone.getAttribute('data-index'));

        // Retirer toutes les classes
        document.querySelectorAll('.favorites-modal .drop-zone').forEach(z => {
            z.classList.remove('active');
        });
        document.querySelectorAll('.favorites-modal .favorite-item').forEach(item => {
            item.classList.remove('shift-up', 'shift-down');
        });

        if (!draggedElement || draggedIndex === -1) {
            return false;
        }

        // Calculer le nouvel index après le retrait de l'élément
        let newIndex = targetIndex;
        if (targetIndex > draggedIndex) {
            newIndex = targetIndex - 1;
        }

        // Si c'est la même position, ne rien faire
        if (newIndex === draggedIndex) {
            return false;
        }

        // Récupérer les favoris
        const favorites = getFavorites();
        const folders = getFolders();
        const currentFolder = currentFolderId;

        // Fonction pour récupérer tous les IDs de sous-dossiers récursivement
        const getAllSubfolderIds = (folderId) => {
            let ids = [folderId];
            const children = folders.filter(f => f.parentId === folderId);
            children.forEach(child => {
                ids = ids.concat(getAllSubfolderIds(child.id));
            });
            return ids;
        };

        // Filtrer les favoris du dossier actuel (incluant sous-dossiers)
        let folderFavorites;
        if (currentFolder === 'all') {
            folderFavorites = favorites;
        } else if (currentFolder === '') {
            folderFavorites = favorites.filter(f => !f.folderId);
        } else {
            const folderIds = getAllSubfolderIds(currentFolder);
            folderFavorites = favorites.filter(f => folderIds.includes(f.folderId));
        }

        // Réorganiser les favoris du dossier
        const [movedFavorite] = folderFavorites.splice(draggedIndex, 1);
        folderFavorites.splice(newIndex, 0, movedFavorite);

        // Obtenir les autres favoris (qui ne sont pas dans le dossier actuel)
        let otherFavorites;
        if (currentFolder === 'all') {
            otherFavorites = [];
        } else if (currentFolder === '') {
            otherFavorites = favorites.filter(f => f.folderId);
        } else {
            const folderIds = getAllSubfolderIds(currentFolder);
            otherFavorites = favorites.filter(f => !folderIds.includes(f.folderId));
        }

        // Fusionner les favoris réorganisés avec les autres
        const newFavorites = [...folderFavorites, ...otherFavorites];

        // Sauvegarder
        saveFavorites(newFavorites);

        // Rafraîchir l'affichage
        updateFavoritesList();

        showNotification('✅ Ordre des favoris mis à jour');

        return false;
    }

    // Fonctions pour drag & drop vers les dossiers
    function handleFolderDragOver(e) {
        if (e.preventDefault) {
            e.preventDefault();
        }
        if (!draggedElement) return false;

        e.dataTransfer.dropEffect = 'move';
        return false;
    }

    function handleFolderDragEnter(e) {
        if (!draggedElement) return;

        const header = e.currentTarget;
        const folderId = header.getAttribute('data-folder-id');

        // Ne pas permettre de glisser vers "Tous les favoris"
        if (folderId === 'all') return;

        header.style.backgroundColor = 'rgba(59, 130, 246, 0.2)';
        header.style.borderLeft = '4px solid var(--primary-color)';
    }

    function handleFolderDragLeave(e) {
        const header = e.currentTarget;
        header.style.backgroundColor = '';
        header.style.borderLeft = '';
    }

    function handleFolderDrop(e) {
        if (e.stopPropagation) {
            e.stopPropagation();
        }
        e.preventDefault();

        const header = e.currentTarget;
        const folderId = header.getAttribute('data-folder-id');

        // Retirer le style
        header.style.backgroundColor = '';
        header.style.borderLeft = '';

        if (!draggedElement || !draggedFavoriteNumber) {
            return false;
        }

        // Ne pas permettre de glisser vers "Tous les favoris"
        if (folderId === 'all') {
            return false;
        }

        // Déplacer le favori vers le dossier cible
        const favorites = getFavorites();
        const favorite = favorites.find(f => f.number === draggedFavoriteNumber);

        if (favorite) {
            // Si c'est "Sans dossier", mettre folderId à null
            if (folderId === '' || !folderId) {
                favorite.folderId = null;
                showNotification('📄 Déplacé vers "Sans dossier"');
            } else {
                favorite.folderId = folderId;
                const folders = getFolders();
                const folder = folders.find(f => f.id === folderId);
                showNotification(`📁 Déplacé vers "${folder ? folder.name : 'dossier'}"`);
            }

            saveFavorites(favorites);
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
    async function createNewFolder() {
        const name = await customPrompt('Nom du nouveau dossier:', '', '📁');
        if (name && name.trim() !== '') {
            if (createFolder(name, null)) {
                updateFavoritesList();
                showNotification('✅ Dossier créé !');
            } else {
                await customAlert('Un dossier avec ce nom existe déjà à cet emplacement !', '⚠️');
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

            // Attendre un court instant puis cliquer sur le bouton Rechercher
            setTimeout(() => {
                const searchButton = document.querySelector('button.btn.btn-primary.float-right.mt-4');
                if (searchButton && searchButton.textContent.trim() === 'Rechercher') {
                    searchButton.click();
                }
            }, 100);
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

            button.addEventListener('click', async (e) => {
                e.preventDefault();
                const searchInput = document.querySelector('#input-search-field');

                if (!searchInput) {
                    await customAlert('Champ de recherche non trouvé.', '⚠️');
                    return;
                }

                const number = searchInput.value.trim();

                if (number === '') {
                    await customAlert('Veuillez entrer un numéro de document avant de l\'ajouter aux favoris.', '⚠️');
                    return;
                }

                if (isFavorite(number)) {
                    await customAlert('Ce numéro est déjà dans vos favoris.', 'ℹ️');
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

                <div class="custom-terms-body">
                    <div class="left-panel">
                        <div class="terms-section">
                            <h4>📁 Ajouter dans un dossier :</h4>
                            <input type="text" class="folder-search" id="folder-search-modal" placeholder="🔍 Rechercher...">
                            <div class="folder-selector" id="folder-selector-list"></div>
                        </div>

                        <div class="create-folder-section">
                            <h4>➕ Créer un nouveau dossier :</h4>
                            <div class="create-folder-inputs">
                                <input type="text" id="new-folder-designation" placeholder="Désignation du dossier..." maxlength="100">
                                <input type="text" id="new-folder-symbol" placeholder="Symbole (8 chiffres obligatoires)" maxlength="8">
                                <div class="input-hint" id="symbol-hint">Format: 12345678</div>
                                <select id="parent-folder-select" class="parent-folder-select">
                                    <option value="">📂 Dossier racine (aucun parent)</option>
                                </select>
                                <button class="create-folder-btn-submit" id="create-folder-submit" disabled>📁 Créer le dossier</button>
                            </div>
                        </div>
                    </div>

                    <div class="center-panel">
                        <div class="terms-section">
                            <h4>�📝 Nom personnalisé du document :</h4>
                            <input type="text" id="custom-doc-name" placeholder="Entrez un nom personnalisé...">
                        </div>

                        <div class="preview-section">
                            <h4>Aperçu du nom final :</h4>
                            <div class="preview-text" id="term-preview"></div>
                        </div>
                    </div>

                    <div class="right-panel">
                        <div class="terms-section">
                            <h4>Ou sélectionnez des termes prédéfinis :</h4>
                            <div class="terms-buttons" id="terms-list"></div>
                            <div class="add-term-input">
                                <input type="text" id="new-term-input" placeholder="Ajouter un nouveau terme...">
                                <button id="add-term-btn">➕ Ajouter</button>
                            </div>
                        </div>
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
    let customDocName = '';
    let isEditMode = false;
    let selectedFolderId = null;
    let folderSearchQueryModal = '';

    function openCustomTermsModal(number) {
        currentDocNumber = number;
        selectedTerms = [];
        customDocName = '';
        isEditMode = false;
        selectedFolderId = null;
        folderSearchQueryModal = '';

        createCustomTermsModal();
        const modal = document.querySelector('.custom-terms-modal');

        // Changer le titre
        modal.querySelector('.custom-terms-header h3').textContent = '🏷️ Personnaliser le nom du document';

        updateTermsList();
        updateFolderSelector();
        updatePreview();

        // Gérer la recherche de dossiers
        const folderSearchInput = modal.querySelector('#folder-search-modal');
        folderSearchInput.addEventListener('input', (e) => {
            folderSearchQueryModal = e.target.value.trim();
            updateFolderSelector();
        });

        // Gérer le champ de nom personnalisé
        const customNameInput = modal.querySelector('#custom-doc-name');
        customNameInput.value = '';
        customNameInput.addEventListener('input', (e) => {
            customDocName = e.target.value.trim();
            updatePreview();
        });

        // Valider
        const validateBtn = modal.querySelector('.btn-validate');
        validateBtn.onclick = () => {
            const finalTitle = buildFinalTitle();
            if (addFavorite(number, finalTitle, selectedFolderId)) {
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
                    customAlert('Ce terme existe déjà ou est invalide.', '⚠️');
                }
            }
        };

        // Permettre d'ajouter avec Enter
        newTermInput.onkeypress = (e) => {
            if (e.key === 'Enter') {
                addTermBtn.click();
            }
        };

        // Gérer la création de nouveau dossier
        const newFolderDesignation = modal.querySelector('#new-folder-designation');
        const newFolderSymbol = modal.querySelector('#new-folder-symbol');
        const createFolderBtn = modal.querySelector('#create-folder-submit');
        const symbolHint = modal.querySelector('#symbol-hint');
        const parentFolderSelect = modal.querySelector('#parent-folder-select');

        // Fonction pour peupler le sélecteur de dossiers parents
        const populateParentFolderSelect = () => {
            const folders = getFolders();
            parentFolderSelect.innerHTML = '<option value="">📂 Dossier racine (aucun parent)</option>';

            // Fonction récursive pour construire la liste avec indentation
            const buildFolderOptions = (parentId = null, level = 0) => {
                const childFolders = folders.filter(f => f.parentId === parentId);
                childFolders.forEach(folder => {
                    const indent = '&nbsp;&nbsp;'.repeat(level * 2);
                    const option = document.createElement('option');
                    option.value = folder.id;
                    option.innerHTML = `${indent}📁 ${folder.name}`;
                    parentFolderSelect.appendChild(option);

                    // Ajouter récursivement les sous-dossiers
                    buildFolderOptions(folder.id, level + 1);
                });
            };

            buildFolderOptions(null, 0);
        };

        // Peupler le sélecteur au démarrage
        populateParentFolderSelect();

        // Fonction de validation du symbole
        const validateSymbol = () => {
            const symbol = newFolderSymbol.value.trim();
            const designation = newFolderDesignation.value.trim();

            // Vérifier que le symbole contient exactement 8 chiffres
            const isValid = /^\d{8}$/.test(symbol);

            if (symbol.length > 0 && !isValid) {
                newFolderSymbol.classList.add('error');
                symbolHint.classList.add('error');
                symbolHint.textContent = '⚠️ Le symbole doit contenir exactement 8 chiffres';
            } else {
                newFolderSymbol.classList.remove('error');
                symbolHint.classList.remove('error');
                symbolHint.textContent = 'Format: 12345678';
            }

            // Activer le bouton seulement si les deux champs sont valides
            createFolderBtn.disabled = !(designation.length > 0 && isValid);
        };

        // Écouter les changements sur les champs
        newFolderDesignation.addEventListener('input', validateSymbol);
        newFolderSymbol.addEventListener('input', (e) => {
            // Autoriser uniquement les chiffres
            e.target.value = e.target.value.replace(/\D/g, '');
            validateSymbol();
        });

        // Créer le dossier
        createFolderBtn.addEventListener('click', async () => {
            const designation = newFolderDesignation.value.trim();
            const symbol = newFolderSymbol.value.trim();
            const parentId = parentFolderSelect.value || null; // Récupérer le dossier parent sélectionné

            if (designation && symbol && /^\d{8}$/.test(symbol)) {
                const folderName = `${designation} - ${symbol}`;

                if (createFolder(folderName, parentId)) { // Passer le parentId à createFolder
                    showNotification('✅ Dossier créé avec succès !');

                    // Réinitialiser les champs
                    newFolderDesignation.value = '';
                    newFolderSymbol.value = '';
                    parentFolderSelect.value = '';
                    validateSymbol();

                    // Mettre à jour la liste des dossiers
                    updateFolderSelector();
                    populateParentFolderSelect(); // Mettre à jour aussi le sélecteur de parents

                    // Sélectionner automatiquement le nouveau dossier
                    const folders = getFolders();
                    const newFolder = folders.find(f => f.name === folderName);
                    if (newFolder) {
                        selectedFolderId = newFolder.id;
                        updateFolderSelector();
                    }
                } else {
                    await customAlert('Un dossier avec ce nom existe déjà.', '⚠️');
                }
            }
        });

        // Permettre de créer avec Enter dans les champs
        newFolderDesignation.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !createFolderBtn.disabled) {
                createFolderBtn.click();
            }
        });

        newFolderSymbol.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !createFolderBtn.disabled) {
                createFolderBtn.click();
            }
        });

        modal.classList.add('show');
    }

    function openEditModal(number) {
        const favorite = getFavoriteByNumber(number);
        if (!favorite) return;

        currentDocNumber = number;
        isEditMode = true;
        selectedFolderId = favorite.folderId || null;
        folderSearchQueryModal = '';

        // Extraire les termes et le nom personnalisé du titre
        const extracted = extractTermsAndCustomName(favorite.title, number);
        selectedTerms = extracted.terms;
        customDocName = extracted.customName;

        console.log('Extraction:', {
            titre: favorite.title,
            termes: selectedTerms,
            nomPersonnalisé: customDocName
        });

        createCustomTermsModal();
        const modal = document.querySelector('.custom-terms-modal');

        // Changer le titre
        modal.querySelector('.custom-terms-header h3').textContent = '✏️ Modifier le nom du document';

        // Pré-remplir le champ de nom personnalisé AVANT updateTermsList
        const customNameInput = modal.querySelector('#custom-doc-name');
        if (customNameInput) {
            customNameInput.value = customDocName;
            console.log('Valeur assignée au champ:', customNameInput.value);

            // Retirer les anciens listeners
            const newInput = customNameInput.cloneNode(true);
            customNameInput.parentNode.replaceChild(newInput, customNameInput);

            // Ajouter le nouveau listener
            newInput.addEventListener('input', (e) => {
                customDocName = e.target.value.trim();
                updatePreview();
            });
        } else {
            console.error('Champ #custom-doc-name non trouvé !');
        }

        updateTermsList();
        updateFolderSelector();
        updatePreview();

        // Gérer la recherche de dossiers
        const folderSearchInput = modal.querySelector('#folder-search-modal');
        folderSearchInput.value = ''; // Reset search

        // Retirer les anciens listeners
        const newFolderSearch = folderSearchInput.cloneNode(true);
        folderSearchInput.parentNode.replaceChild(newFolderSearch, folderSearchInput);

        newFolderSearch.addEventListener('input', (e) => {
            folderSearchQueryModal = e.target.value.trim();
            updateFolderSelector();
        });

        // Valider
        const validateBtn = modal.querySelector('.btn-validate');
        validateBtn.textContent = '✅ Enregistrer';
        validateBtn.onclick = () => {
            const finalTitle = buildFinalTitle();
            if (updateFavorite(number, finalTitle)) {
                // Mettre à jour le dossier
                if (selectedFolderId !== favorite.folderId) {
                    moveToFolder(number, selectedFolderId);
                }
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
                    customAlert('Ce terme existe déjà ou est invalide.', '⚠️');
                }
            }
        };

        // Permettre d'ajouter avec Enter
        newTermInput.onkeypress = (e) => {
            if (e.key === 'Enter') {
                addTermBtn.click();
            }
        };

        // Gérer la création de nouveau dossier
        const newFolderDesignation = modal.querySelector('#new-folder-designation');
        const newFolderSymbol = modal.querySelector('#new-folder-symbol');
        const createFolderBtn = modal.querySelector('#create-folder-submit');
        const symbolHint = modal.querySelector('#symbol-hint');
        const parentFolderSelect = modal.querySelector('#parent-folder-select');

        // Fonction pour peupler le sélecteur de dossiers parents
        const populateParentFolderSelect = () => {
            const folders = getFolders();
            parentFolderSelect.innerHTML = '<option value="">📂 Dossier racine (aucun parent)</option>';

            // Fonction récursive pour construire la liste avec indentation
            const buildFolderOptions = (parentId = null, level = 0) => {
                const childFolders = folders.filter(f => f.parentId === parentId);
                childFolders.forEach(folder => {
                    const indent = '&nbsp;&nbsp;'.repeat(level * 2);
                    const option = document.createElement('option');
                    option.value = folder.id;
                    option.innerHTML = `${indent}📁 ${folder.name}`;
                    parentFolderSelect.appendChild(option);

                    // Ajouter récursivement les sous-dossiers
                    buildFolderOptions(folder.id, level + 1);
                });
            };

            buildFolderOptions(null, 0);
        };

        // Peupler le sélecteur au démarrage
        populateParentFolderSelect();

        // Fonction de validation du symbole
        const validateSymbol = () => {
            const symbol = newFolderSymbol.value.trim();
            const designation = newFolderDesignation.value.trim();

            // Vérifier que le symbole contient exactement 8 chiffres
            const isValid = /^\d{8}$/.test(symbol);

            if (symbol.length > 0 && !isValid) {
                newFolderSymbol.classList.add('error');
                symbolHint.classList.add('error');
                symbolHint.textContent = '⚠️ Le symbole doit contenir exactement 8 chiffres';
            } else {
                newFolderSymbol.classList.remove('error');
                symbolHint.classList.remove('error');
                symbolHint.textContent = 'Format: 12345678';
            }

            // Activer le bouton seulement si les deux champs sont valides
            createFolderBtn.disabled = !(designation.length > 0 && isValid);
        };

        // Écouter les changements sur les champs
        newFolderDesignation.addEventListener('input', validateSymbol);
        newFolderSymbol.addEventListener('input', (e) => {
            // Autoriser uniquement les chiffres
            e.target.value = e.target.value.replace(/\D/g, '');
            validateSymbol();
        });

        // Créer le dossier
        createFolderBtn.addEventListener('click', async () => {
            const designation = newFolderDesignation.value.trim();
            const symbol = newFolderSymbol.value.trim();
            const parentId = parentFolderSelect.value || null; // Récupérer le dossier parent sélectionné

            if (designation && symbol && /^\d{8}$/.test(symbol)) {
                const folderName = `${designation} - ${symbol}`;

                if (createFolder(folderName, parentId)) { // Passer le parentId à createFolder
                    showNotification('✅ Dossier créé avec succès !');

                    // Réinitialiser les champs
                    newFolderDesignation.value = '';
                    newFolderSymbol.value = '';
                    parentFolderSelect.value = '';
                    validateSymbol();

                    // Mettre à jour la liste des dossiers
                    updateFolderSelector();
                    populateParentFolderSelect(); // Mettre à jour aussi le sélecteur de parents

                    // Sélectionner automatiquement le nouveau dossier
                    const folders = getFolders();
                    const newFolder = folders.find(f => f.name === folderName);
                    if (newFolder) {
                        selectedFolderId = newFolder.id;
                        updateFolderSelector();
                    }
                } else {
                    await customAlert('Un dossier avec ce nom existe déjà.', '⚠️');
                }
            }
        });

        // Permettre de créer avec Enter dans les champs
        newFolderDesignation.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !createFolderBtn.disabled) {
                createFolderBtn.click();
            }
        });

        newFolderSymbol.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !createFolderBtn.disabled) {
                createFolderBtn.click();
            }
        });

        modal.classList.add('show');
    }

    function extractTermsAndCustomName(title, number) {
        // Si le titre est juste le numéro, rien à extraire
        if (title === number) {
            return { terms: [], customName: '' };
        }

        // Format attendu: "Terme1 + Terme2 - Nom Personnalisé"
        const customTermsList = getCustomTerms();
        const terms = [];
        let customName = '';

        // Vérifier si le titre contient " + " (séparateur de termes)
        if (title.includes(' + ')) {
            // Séparer par " - " pour isoler les termes du nom personnalisé
            const dashParts = title.split(' - ');

            // Traiter la partie termes (avant le " - " si présent)
            const termsString = dashParts[0];
            const termsParts = termsString.split(' + ').map(t => t.trim()).filter(t => t !== '');

            termsParts.forEach(part => {
                if (customTermsList.includes(part)) {
                    terms.push(part);
                }
            });

            // Le nom personnalisé est tout ce qui vient après les termes reconnus
            if (dashParts.length > 1) {
                customName = dashParts.slice(1).join(' - ').trim();
            }
        } else {
            // Pas de " + ", donc pas de format "termes + nom"
            // Tout le titre est considéré comme nom personnalisé
            customName = title;
        }

        return {
            terms: terms,
            customName: customName
        };
    }

    function closeCustomTermsModal() {
        const modal = document.querySelector('.custom-terms-modal');
        if (modal) {
            modal.classList.remove('show');
        }
        currentDocNumber = '';
        selectedTerms = [];
        customDocName = '';
        isEditMode = false;
        selectedFolderId = null;
        folderSearchQueryModal = '';
    }

    function updateFolderSelector() {
        const folderSelectorList = document.querySelector('#folder-selector-list');
        if (!folderSelectorList) return;

        const folders = getFolders();

        // État des dossiers dépliés (on garde en mémoire les dossiers qui étaient ouverts)
        const expandedFolders = new Set();
        folderSelectorList.querySelectorAll('.folder-children.expanded').forEach(el => {
            const parentId = el.getAttribute('data-parent-id');
            if (parentId) expandedFolders.add(parentId);
        });

        // Fonction récursive pour construire l'arborescence HTML
        const buildFolderTree = (parentId = null) => {
            const childFolders = folders.filter(f => f.parentId === parentId);

            // Filtrer selon la recherche
            let filteredFolders = folderSearchQueryModal
                ? childFolders.filter(f => f.name.toLowerCase().includes(folderSearchQueryModal.toLowerCase()))
                : childFolders;

            if (filteredFolders.length === 0) return '';

            let html = '';
            filteredFolders.forEach(folder => {
                const hasChildren = folders.some(f => f.parentId === folder.id);
                const isSelected = selectedFolderId === folder.id;
                const isExpanded = expandedFolders.has(folder.id);

                html += `
                    <div class="folder-tree-item" data-folder-id="${folder.id}">
                        <div class="folder-item-header ${isSelected ? 'selected' : ''}" data-folder-id="${folder.id}">
                            <span class="folder-expand-icon ${hasChildren ? (isExpanded ? '' : 'collapsed') : 'hidden'}" data-folder-id="${folder.id}">
                                ▼
                            </span>
                            <input type="checkbox" id="folder-${folder.id}" ${isSelected ? 'checked' : ''}>
                            <span class="folder-icon-small">📁</span>
                            <label for="folder-${folder.id}">${folder.name}</label>
                        </div>
                `;

                // Sous-dossiers
                if (hasChildren) {
                    html += `
                        <div class="folder-children ${isExpanded ? 'expanded' : ''}" data-parent-id="${folder.id}">
                            ${buildFolderTree(folder.id)}
                        </div>
                    `;
                }

                html += `</div>`;
            });

            return html;
        };

        const treeHTML = buildFolderTree(null);

        if (!treeHTML) {
            folderSelectorList.innerHTML = '<p style="color: #999; font-style: italic; font-size: 13px;">Aucun dossier disponible.</p>';
            return;
        }

        folderSelectorList.innerHTML = treeHTML;

        // Événements pour déplier/replier les dossiers
        folderSelectorList.querySelectorAll('.folder-expand-icon:not(.hidden)').forEach(icon => {
            icon.addEventListener('click', (e) => {
                e.stopPropagation();
                const folderId = icon.getAttribute('data-folder-id');
                const treeItem = icon.closest('.folder-tree-item');
                const childrenDiv = treeItem.querySelector('.folder-children');

                if (childrenDiv) {
                    childrenDiv.classList.toggle('expanded');
                    icon.classList.toggle('collapsed');
                }
            });
        });

        // Événements pour sélectionner/désélectionner un dossier
        folderSelectorList.querySelectorAll('.folder-item-header').forEach(header => {
            header.addEventListener('click', (e) => {
                // Ne pas traiter si on clique sur l'icône d'expansion
                if (e.target.classList.contains('folder-expand-icon')) {
                    return;
                }

                const folderId = header.getAttribute('data-folder-id');
                const checkbox = header.querySelector('input[type="checkbox"]');

                // Toggle la sélection
                if (selectedFolderId === folderId) {
                    selectedFolderId = null;
                    checkbox.checked = false;
                } else {
                    selectedFolderId = folderId;
                    checkbox.checked = true;
                }

                updateFolderSelector();
            });

            // Empêcher le double toggle quand on clique sur la checkbox
            const checkbox = header.querySelector('input[type="checkbox"]');
            checkbox.addEventListener('click', (e) => {
                e.stopPropagation();
                const folderId = header.getAttribute('data-folder-id');

                if (e.target.checked) {
                    selectedFolderId = folderId;
                } else {
                    selectedFolderId = null;
                }

                updateFolderSelector();
            });
        });
    }

    function updateTermsList() {
        const termsList = document.querySelector('#terms-list');
        if (!termsList) return;

        const terms = getCustomTerms();

        if (terms.length === 0) {
            termsList.innerHTML = '<p style="color: #999; font-style: italic;">Aucun terme personnalisé. Ajoutez-en un ci-dessous.</p>';
            return;
        }

        termsList.innerHTML = terms.map((term, index) => {
            const isSelected = selectedTerms.includes(term);
            return `
                <div class="term-button ${isSelected ? 'selected' : ''}" data-term="${term}" data-term-index="${index}">
                    <span class="term-drag-handle" draggable="true" data-term="${term}" data-term-index="${index}">☰</span>
                    <span class="term-name-editable" data-term="${term}" style="flex: 1;" title="Double-cliquez pour modifier">${term}</span>
                    <span class="remove-term" data-term="${term}" title="Supprimer ce terme">×</span>
                </div>
            `;
        }).join('');

        // Événements pour sélectionner/désélectionner (clic simple sur toute la zone)
        termsList.querySelectorAll('.term-button').forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Ne pas déclencher si c'est un clic sur la suppression ou sur le drag handle
                if (e.target.classList.contains('remove-term') ||
                    e.target.classList.contains('term-drag-handle')) {
                    return;
                }
                const term = btn.getAttribute('data-term');
                toggleTerm(term);
            });
        });

        // Événements pour éditer le nom (double-clic sur le nom uniquement)
        termsList.querySelectorAll('.term-name-editable').forEach(span => {
            // Simple clic sur le nom = sélectionner/désélectionner le terme
            span.addEventListener('click', (e) => {
                // Le clic simple est géré par l'événement du bouton parent
                // On ne fait rien ici pour éviter les doublons
            });

            // Double-clic sur le nom = modifier
            span.addEventListener('dblclick', async (e) => {
                e.stopPropagation();
                const oldTerm = span.getAttribute('data-term');
                const newTerm = await customPrompt('Modifier le terme:', oldTerm, '✏️');
                if (newTerm && newTerm.trim() !== '' && newTerm !== oldTerm) {
                    const terms = getCustomTerms();
                    const index = terms.indexOf(oldTerm);
                    if (index !== -1) {
                        // Vérifier si le nouveau terme n'existe pas déjà
                        if (!terms.includes(newTerm.trim())) {
                            terms[index] = newTerm.trim();
                            saveCustomTerms(terms);

                            // Mettre à jour selectedTerms si nécessaire
                            const selectedIndex = selectedTerms.indexOf(oldTerm);
                            if (selectedIndex !== -1) {
                                selectedTerms[selectedIndex] = newTerm.trim();
                            }

                            updateTermsList();
                            updatePreview();
                            showNotification('✅ Terme modifié !');
                        } else {
                            customAlert('Ce terme existe déjà !', '⚠️');
                        }
                    }
                }
            });
        });

        // Événements pour supprimer un terme
        termsList.querySelectorAll('.remove-term').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const term = btn.getAttribute('data-term');
                const confirmed = await customConfirm(`Supprimer le terme "${term}" ?\n(Il sera retiré de la liste des termes mémorisés)`, '🗑️');
                if (confirmed) {
                    removeCustomTerm(term);
                    // Retirer de la sélection si présent
                    selectedTerms = selectedTerms.filter(t => t !== term);
                    updateTermsList();
                    updatePreview();
                    showNotification('🗑️ Terme supprimé');
                }
            });
        });

        // Drag & Drop pour réordonner les termes (uniquement via le handle ☰)
        let draggedElement = null;
        let draggedIndex = null;

        termsList.querySelectorAll('.term-drag-handle').forEach(handle => {
            handle.addEventListener('dragstart', (e) => {
                draggedElement = e.target.closest('.term-button');
                draggedIndex = parseInt(e.target.dataset.termIndex);
                draggedElement.style.opacity = '0.5';
                e.dataTransfer.effectAllowed = 'move';
            });

            handle.addEventListener('dragend', (e) => {
                if (draggedElement) {
                    draggedElement.style.opacity = '1';
                    draggedElement.style.borderColor = '';
                }
            });
        });

        termsList.querySelectorAll('.term-button').forEach(item => {
            item.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                if (e.target.closest('.term-button') && e.target.closest('.term-button') !== draggedElement) {
                    e.target.closest('.term-button').style.borderColor = 'var(--primary-color)';
                }
            });

            item.addEventListener('dragleave', (e) => {
                if (e.target.closest('.term-button')) {
                    e.target.closest('.term-button').style.borderColor = '';
                }
            });

            item.addEventListener('drop', (e) => {
                e.preventDefault();
                const dropTarget = e.target.closest('.term-button');
                if (dropTarget && dropTarget !== draggedElement) {
                    dropTarget.style.borderColor = '';
                    const dropIndex = parseInt(dropTarget.dataset.termIndex);

                    // Réorganiser les termes
                    const terms = getCustomTerms();
                    const [movedItem] = terms.splice(draggedIndex, 1);
                    terms.splice(dropIndex, 0, movedItem);
                    saveCustomTerms(terms);

                    // Rafraîchir l'affichage
                    updateTermsList();
                    showNotification('✅ Termes réordonnés !');
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
        let result = '';

        // Ajouter les termes prédéfinis en premier (séparés par +)
        if (selectedTerms.length > 0) {
            result = selectedTerms.join(' + ');
        }

        // Ajouter le nom personnalisé à droite (séparé par -)
        if (customDocName && customDocName.trim() !== '') {
            if (result !== '') {
                result += ' - ' + customDocName;
            } else {
                result = customDocName;
            }
        }

        // Si on a un résultat, le retourner, sinon juste le numéro
        if (result !== '') {
            return result;
        }

        return currentDocNumber;
    }

    function updatePreview() {
        const previewElement = document.querySelector('#term-preview');
        if (previewElement) {
            const title = buildFinalTitle();
            const formattedNumber = formatDocumentNumber(currentDocNumber);
            previewElement.innerHTML = `
                <div style="margin-bottom: 8px;">${title}</div>
                <div style="font-size: 14px; color: var(--text-secondary);">Numéro: ${formattedNumber}</div>
            `;
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

    // Modal de gestion des catégories
    function openCategoriesModal() {
        const categories = getDocumentCategories();

        const modal = document.createElement('div');
        modal.className = 'custom-dialog-modal categories-management-modal';
        modal.style.zIndex = '10003';

        const renderCategoriesList = () => {
            const categories = getDocumentCategories();
            return categories.map((cat, index) => `
                <div class="category-item" draggable="true" data-cat-id="${cat.id}" data-cat-index="${index}"
                     style="display: flex; align-items: center; gap: 12px; padding: 12px; background: var(--bg-card); border-radius: 8px; margin-bottom: 10px; cursor: move; transition: all 0.3s ease; border: 2px solid transparent;">
                    <span style="font-size: 18px; cursor: grab;">☰</span>
                    <input type="color" value="${cat.color}" data-cat-id="${cat.id}" class="cat-color-input"
                           style="width: 50px; height: 40px; border: none; border-radius: 6px; cursor: pointer;">
                    <div style="flex: 1;">
                        <div style="font-weight: 600; color: var(--text-primary); margin-bottom: 4px; cursor: pointer;"
                             class="cat-name-editable" data-cat-id="${cat.id}" title="Double-cliquez pour modifier">${cat.name}</div>
                        <select data-cat-id="${cat.id}" class="cat-indent-select"
                                style="padding: 4px 8px; background: var(--bg-dark); color: var(--text-primary); border: 1px solid var(--border-color); border-radius: 4px; font-size: 12px;">
                            <option value="0" ${cat.indentLevel === 0 ? 'selected' : ''}>Normal</option>
                            <option value="1" ${cat.indentLevel === 1 ? 'selected' : ''}>Décalé -15px</option>
                            <option value="2" ${cat.indentLevel === 2 ? 'selected' : ''}>Décalé -30px</option>
                        </select>
                    </div>
                    <button class="delete-cat-btn" data-cat-id="${cat.id}"
                            style="background: var(--danger-color); color: white; border: none; padding: 8px 12px; border-radius: 6px; cursor: pointer; font-size: 14px;">
                        🗑️
                    </button>
                </div>
            `).join('');
        };

        modal.innerHTML = `
            <div class="dialog-content" style="max-width: 600px;">
                <div style="font-size: 32px; text-align: center; margin-bottom: 16px;">🎨</div>
                <div style="font-size: 20px; font-weight: 700; color: var(--text-primary); text-align: center; margin-bottom: 24px;">
                    Gérer les Catégories de Documents
                </div>

                <div id="categories-list-container" style="max-height: 400px; overflow-y: auto; margin-bottom: 20px;">
                    ${renderCategoriesList()}
                </div>

                <div style="border-top: 2px solid var(--border-color); padding-top: 20px; margin-top: 20px;">
                    <div style="font-weight: 600; color: var(--text-primary); margin-bottom: 12px;">Ajouter une nouvelle catégorie :</div>
                    <div style="display: flex; gap: 12px; margin-bottom: 20px;">
                        <input type="text" id="new-cat-name" placeholder="Nom de la catégorie..."
                               style="flex: 1; padding: 10px; background: var(--bg-card); color: var(--text-primary); border: 2px solid var(--border-color); border-radius: 8px;">
                        <input type="color" id="new-cat-color" value="#8b5cf6"
                               style="width: 60px; height: 42px; border: none; border-radius: 8px; cursor: pointer;">
                        <select id="new-cat-indent"
                                style="padding: 10px; background: var(--bg-card); color: var(--text-primary); border: 2px solid var(--border-color); border-radius: 8px;">
                            <option value="0">Normal</option>
                            <option value="1">Décalé -15px</option>
                            <option value="2">Décalé -30px</option>
                        </select>
                        <button id="add-cat-btn" class="dialog-btn dialog-btn-primary" style="white-space: nowrap;">
                            ➕ Ajouter
                        </button>
                    </div>
                </div>

                <div class="dialog-actions">
                    <button class="dialog-btn dialog-btn-primary close-categories-modal">✅ Enregistrer et Fermer</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        modal.classList.add('show');

        // Fonction pour réattacher les événements après mise à jour de la liste
        const attachEventListeners = () => {
            // Gérer les changements de couleur
            modal.querySelectorAll('.cat-color-input').forEach(input => {
                input.addEventListener('change', (e) => {
                    const catId = e.target.dataset.catId;
                    const categories = getDocumentCategories();
                    const cat = categories.find(c => c.id === catId);
                    if (cat) {
                        cat.color = e.target.value;
                        saveDocumentCategories(categories);
                    }
                });
            });

            // Gérer les changements d'indentation
            modal.querySelectorAll('.cat-indent-select').forEach(select => {
                select.addEventListener('change', (e) => {
                    const catId = e.target.dataset.catId;
                    const categories = getDocumentCategories();
                    const cat = categories.find(c => c.id === catId);
                    if (cat) {
                        cat.indentLevel = parseInt(e.target.value);
                        saveDocumentCategories(categories);
                    }
                });
            });

            // Gérer l'édition du nom (double-clic)
            modal.querySelectorAll('.cat-name-editable').forEach(nameDiv => {
                nameDiv.addEventListener('dblclick', async (e) => {
                    const catId = e.target.dataset.catId;
                    const categories = getDocumentCategories();
                    const cat = categories.find(c => c.id === catId);
                    if (cat) {
                        const newName = await customPrompt('Modifier le nom de la catégorie:', cat.name, '✏️');
                        if (newName && newName.trim() !== '') {
                            cat.name = newName.trim();
                            saveDocumentCategories(categories);
                            const listContainer = modal.querySelector('#categories-list-container');
                            listContainer.innerHTML = renderCategoriesList();
                            attachEventListeners();
                            showNotification('✅ Nom modifié !');
                        }
                    }
                });
            });

            // Gérer la suppression
            modal.querySelectorAll('.delete-cat-btn').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const catId = e.target.dataset.catId;
                    const confirmed = await customConfirm('Supprimer cette catégorie ?', '🗑️');
                    if (confirmed) {
                        removeDocumentCategory(catId);
                        // Mettre à jour uniquement la liste sans réouvrir
                        const listContainer = modal.querySelector('#categories-list-container');
                        listContainer.innerHTML = renderCategoriesList();
                        attachEventListeners(); // Réattacher les événements
                        showNotification('✅ Catégorie supprimée !');
                    }
                });
            });

            // Drag & Drop pour réordonner les catégories
            let draggedElement = null;
            let draggedIndex = null;

            modal.querySelectorAll('.category-item').forEach(item => {
                item.addEventListener('dragstart', (e) => {
                    draggedElement = e.target;
                    draggedIndex = parseInt(e.target.dataset.catIndex);
                    e.target.style.opacity = '0.5';
                    e.dataTransfer.effectAllowed = 'move';
                });

                item.addEventListener('dragend', (e) => {
                    e.target.style.opacity = '1';
                    e.target.style.borderColor = 'transparent';
                });

                item.addEventListener('dragover', (e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'move';
                    if (e.target.closest('.category-item') && e.target.closest('.category-item') !== draggedElement) {
                        e.target.closest('.category-item').style.borderColor = 'var(--primary-color)';
                    }
                });

                item.addEventListener('dragleave', (e) => {
                    if (e.target.closest('.category-item')) {
                        e.target.closest('.category-item').style.borderColor = 'transparent';
                    }
                });

                item.addEventListener('drop', (e) => {
                    e.preventDefault();
                    const dropTarget = e.target.closest('.category-item');
                    if (dropTarget && dropTarget !== draggedElement) {
                        dropTarget.style.borderColor = 'transparent';
                        const dropIndex = parseInt(dropTarget.dataset.catIndex);

                        // Réorganiser les catégories
                        const categories = getDocumentCategories();
                        const [movedItem] = categories.splice(draggedIndex, 1);
                        categories.splice(dropIndex, 0, movedItem);
                        saveDocumentCategories(categories);

                        // Rafraîchir l'affichage
                        const listContainer = modal.querySelector('#categories-list-container');
                        listContainer.innerHTML = renderCategoriesList();
                        attachEventListeners();
                        showNotification('✅ Catégories réordonnées !');
                    }
                });
            });
        };

        // Attacher les événements initiaux
        attachEventListeners();

        // Ajouter une nouvelle catégorie
        modal.querySelector('#add-cat-btn').addEventListener('click', () => {
            const name = modal.querySelector('#new-cat-name').value.trim();
            const color = modal.querySelector('#new-cat-color').value;
            const indent = parseInt(modal.querySelector('#new-cat-indent').value);

            if (name) {
                if (addDocumentCategory(name, color, indent)) {
                    // Mettre à jour uniquement la liste sans réouvrir
                    const listContainer = modal.querySelector('#categories-list-container');
                    listContainer.innerHTML = renderCategoriesList();
                    attachEventListeners(); // Réattacher les événements

                    // Réinitialiser les champs
                    modal.querySelector('#new-cat-name').value = '';
                    modal.querySelector('#new-cat-color').value = '#8b5cf6';
                    modal.querySelector('#new-cat-indent').value = '0';

                    showNotification('✅ Catégorie ajoutée !');
                } else {
                    customAlert('Cette catégorie existe déjà !', '⚠️');
                }
            }
        });

        // Permettre d'ajouter avec Enter
        modal.querySelector('#new-cat-name').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                modal.querySelector('#add-cat-btn').click();
            }
        });

        // Fermer et rafraîchir
        modal.querySelector('.close-categories-modal').addEventListener('click', () => {
            modal.classList.remove('show');
            setTimeout(() => modal.remove(), 300);
            updateFavoritesList(); // Rafraîchir l'affichage des favoris
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('show');
                setTimeout(() => modal.remove(), 300);
                updateFavoritesList();
            }
        });
    }

    // Initialisation et observation
    function init() {
        // Restaurer le handle du dossier et démarrer le timer d'auto-export si activé
        if (autoExportEnabled) {
            restoreDirHandle().then(() => {
                setTimeout(() => startAutoExportTimer(), 2000);
            });
        }
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
