(function () {
    'use strict';

    // Injection du CSS pour les toasts
    const toastCSS = `
        @import url('https://fonts.googleapis.com/css2?family=Varela+Round&display=swap');

        :root {
            --tr: all 0.5s ease 0s;
            --ch1: #05478a;
            --ch2: #0070e0;
            --ch3: #0070e040;
            --cs1: #005e38;
            --cs2: #03a65a;
            --cs3: #03a65a40;
            --cw1: #c24914;
            --cw2: #fc8621;
            --cw3: #fc862140;
            --ce1: #851d41;
            --ce2: #db3056;
            --ce3: #db305640;
            /* Geometry vars for the decorative plate (::before) and the badge (::after) */
            --plate-w: 28px;
            --plate-h: 28px;
            --plate-left: -1.5px;
            --plate-bottom: -1.5px;
            --badge: 16px;
        }

        @property --bg-help {
            syntax: '<percentage>';
            inherits: false;
            initial-value: -10%;
        }

        @property --bg-success {
            syntax: '<percentage>';
            inherits: false;
            initial-value: 145%;
        }

        @property --bg-warning {
            syntax: '<percentage>';
            inherits: false;
            initial-value: -55%;
        }

        @property --bg-error {
            syntax: '<percentage>';
            inherits: false;
            initial-value: 112%;
        }

        @property --bsc {
            syntax: '<color>';
            inherits: false;
            initial-value: red;
        }

        .sytoast-container {
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 10000;
            display: flex;
            flex-direction: column;
            gap: 10px;
            max-width: 400px;
            font-family: "Varela Round", sans-serif;
        }

        .sytoast {
            background: linear-gradient(90deg, #1f2333, #22232b);
            color: #f5f5f5;
            padding: 12px 20px 12px 56px;
            text-align: left;
            border-radius: 5px;
            position: relative;
            font-weight: 300;
            max-width: 360px;
            transition: var(--tr);
            opacity: 0;
            transform: translateX(0);
            border: 1.5px solid #fff2;
            box-shadow: inset 0 0 5px 0 #1d1e26, 0 4px 12px rgba(0,0,0,0.3);
            animation: sytoast-slide-in 0.5s ease forwards;
        }

        .sytoast.show {
            opacity: 1;
            transform: translateX(0);
        }

        .sytoast.hide {
            opacity: 0;
            transform: translateY(-20px);
            animation: sytoast-slide-out 0.3s ease forwards;
        }

        @keyframes sytoast-slide-in {
            from {
                opacity: 0;
                transform: translateY(-20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        @keyframes sytoast-slide-out {
            from {
                opacity: 1;
                transform: translateY(0);
            }
            to {
                opacity: 0;
                transform: translateY(-20px);
            }
        }

        .sytoast:before {
            content: "";
            position: absolute;
            width: var(--plate-w);
            top: 0;
            bottom: var(--plate-bottom);
            left: var(--plate-left);
            z-index: 0;
            border-radius: 3.5px;
            background: radial-gradient(circle at 0% 50%, var(--clr), #fff0 50px), radial-gradient(circle at -50% 50%, var(--bg), #fff0 50px);
            opacity: 0.5;
        }

        .sytoast:after {
            content: "";
            position: absolute;
            width: var(--badge);
            height: var(--badge);
            background: radial-gradient(circle at 50% 50%, var(--clr) 12.5px, var(--brd) calc(12.5px + 1px) 100%);
            left: calc(var(--plate-left) + (var(--plate-w) * 0.42) - (var(--badge) / 2));
            top: calc(((100% - var(--plate-bottom)) - var(--badge)) / 2);
            border-radius: 30px;
            padding-top: 2px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 8px;
            box-sizing: border-box;
        }

        .sytoast h3 {
            font-size: 12px;
            margin: 0 0 5px 0;
            line-height: 12px;
            font-weight: 300;
            position: relative;
            z-index: 1;
        }

        .sytoast p {
            position: relative;
            font-size: 11px;
            z-index: 1;
            margin: 0;
            line-height: 1.4;
        }

        .sytoast-close {
            position: absolute;
            width: 16px;
            height: 16px;
            text-align: center;
            right: 5px;
            top: 5px;
            cursor: pointer;
            border-radius: 100%;
            z-index: 2;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            color: #fff;
            transition: var(--tr);
        }

        .sytoast-close:hover {
            background: var(--clr);
            color: #22232c;
        }

        .sytoast-close:after {
            content: "+";
            transform: rotate(45deg);
        }

        /* Types de toasts */
        .sytoast.help {
            --bg: var(--ch1);
            --clr: var(--ch2);
            --brd: var(--ch3);
        }
        .sytoast.help:after {
            content: "?";
        }

        .sytoast.success {
            --bg: var(--cs1);
            --clr: var(--cs2);
            --brd: var(--cs3);
        }
        .sytoast.success:after {
            content: "✓";
            font-size: 7px;
            font-weight: bold;
            padding-bottom: 1px;
        }

        .sytoast.warning {
            --bg: var(--cw1);
            --clr: var(--cw2);
            --brd: var(--cw3);
        }
        .sytoast.warning:after {
            content: "!";
            font-weight: bold;
        }

        .sytoast.error {
            --bg: var(--ce1);
            --clr: var(--ce2);
            --brd: var(--ce3);
        }
        .sytoast.error:after {
            content: "×";
            font-size: 10px;
            line-height: 1;
        }

        .sytoast.info {
            --bg: var(--ch1);
            --clr: var(--ch2);
            --brd: var(--ch3);
        }
        .sytoast.info:after {
            content: "i";
            font-weight: bold;
            font-style: italic;
        }

        .sytoast-buttons {
            display: flex;
            gap: 10px;
            margin-top: 10px;
            justify-content: flex-end;
            position: relative;
            z-index: 1;
        }

        .sytoast-buttons button {
            padding: 5px 10px;
            border: none;
            border-radius: 3px;
            cursor: pointer;
            font-size: 11px;
        }

        .sytoast-buttons .yes {
            background: #03a65a;
            color: white;
        }

        .sytoast-buttons .no {
            background: #db3056;
            color: white;
        }
    `;

    // CSS pour le modal d'impression
    const modalCSS = `
        .symodal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            z-index: 10001;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            animation: symodal-fade-in 0.3s ease forwards;
        }

        @keyframes symodal-fade-in {
            to {
                opacity: 1;
            }
        }

        .symodal {
            background: linear-gradient(135deg, #1f2333 0%, #2a2d3e 100%);
            border-radius: 10px;
            padding: 25px;
            max-width: 500px;
            width: 90%;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
            border: 1.5px solid #fff2;
            font-family: "Varela Round", sans-serif;
            color: #f5f5f5;
            position: relative;
            margin: auto;
        }

        .symodal.from-button {
            position: fixed;
            left: var(--start-x);
            top: var(--start-y);
            transform: translate(-50%, -50%) scale(0);
            opacity: 0;
        }

        .symodal.from-button.animate {
            animation: symodal-expand-and-move 0.3s linear forwards;
        }

        @keyframes symodal-expand-and-move {
            0% {
                left: var(--start-x);
                top: var(--start-y);
                transform: translate(-50%, -50%) scale(0);
                opacity: 0;
            }
            100% {
                left: 50%;
                top: 50%;
                transform: translate(-50%, -50%) scale(1);
                opacity: 1;
            }
        }

        .symodal-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 1px solid #fff2;
        }

        .symodal-header h2 {
            margin: 0;
            font-size: 20px;
            font-weight: 500;
            color: #0070e0;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .symodal-close {
            cursor: pointer;
            font-size: 24px;
            color: #999;
            transition: color 0.2s;
            background: none;
            border: none;
            padding: 0;
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
        }

        .symodal-close:hover {
            color: #db3056;
            background: #fff1;
        }

        .symodal-body {
            margin-bottom: 20px;
        }

        .symodal-field {
            margin-bottom: 20px;
        }

        .symodal-field label {
            display: block;
            margin-bottom: 8px;
            font-size: 14px;
            color: #0070e0;
            font-weight: 500;
        }

        .symodal-select {
            width: 100%;
            padding: 10px 15px;
            background: #2a2d3e;
            border: 1px solid #fff2;
            border-radius: 5px;
            color: #f5f5f5;
            font-size: 14px;
            font-family: "Varela Round", sans-serif;
            cursor: pointer;
            transition: border-color 0.2s, background 0.2s;
        }

        .symodal-select:hover {
            border-color: #0070e0;
            background: #33364a;
        }

        .symodal-select:focus {
            outline: none;
            border-color: #0070e0;
            box-shadow: 0 0 0 3px rgba(0, 112, 224, 0.1);
        }

        .symodal-select option {
            background: #2a2d3e;
            color: #f5f5f5;
        }

        .symodal-footer {
            display: flex;
            gap: 10px;
            justify-content: flex-end;
        }

        .symodal-btn {
            padding: 10px 20px;
            border: none;
            border-radius: 5px;
            font-size: 14px;
            font-family: "Varela Round", sans-serif;
            cursor: pointer;
            transition: all 0.2s;
            font-weight: 500;
        }

        .symodal-btn-primary {
            background: linear-gradient(90deg, #0070e0 0%, #05478a 100%);
            color: #fff;
        }

        .symodal-btn-primary:hover {
            background: linear-gradient(90deg, #05478a 0%, #0070e0 100%);
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 112, 224, 0.3);
        }

        .symodal-btn-secondary {
            background: #3a3d4e;
            color: #f5f5f5;
        }

        .symodal-btn-secondary:hover {
            background: #4a4d5e;
        }

        .symodal-tabs {
            display: flex;
            gap: 5px;
            margin-bottom: 20px;
            border-bottom: 1px solid #fff2;
        }

        .symodal-tab {
            padding: 10px 20px;
            background: transparent;
            border: none;
            color: #999;
            cursor: pointer;
            font-family: "Varela Round", sans-serif;
            font-size: 14px;
            transition: all 0.2s;
            border-bottom: 2px solid transparent;
        }

        .symodal-tab:hover {
            color: #0070e0;
        }

        .symodal-tab.active {
            color: #0070e0;
            border-bottom-color: #0070e0;
        }

        .symodal-tab-content {
            display: none;
        }

        .symodal-tab-content.active {
            display: block;
        }

        .symodal-config-list {
            max-height: 300px;
            overflow-y: auto;
        }

        .symodal-config-item {
            background: #2a2d3e;
            border: 1px solid #fff2;
            border-radius: 5px;
            padding: 12px;
            margin-bottom: 10px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
        }

        .symodal-config-info {
            flex: 1;
        }

        .symodal-config-name {
            font-size: 14px;
            color: #0070e0;
            font-weight: 500;
            margin-bottom: 4px;
        }

        .symodal-config-details {
            font-size: 12px;
            color: #999;
        }

        .symodal-config-actions {
            display: flex;
            gap: 5px;
        }

        .symodal-btn-small {
            padding: 6px 12px;
            font-size: 12px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            transition: all 0.2s;
            font-family: "Varela Round", sans-serif;
        }

        .symodal-btn-edit {
            background: #0070e0;
            color: #fff;
        }

        .symodal-btn-edit:hover {
            background: #05478a;
        }

        .symodal-btn-delete {
            background: #db3056;
            color: #fff;
        }

        .symodal-btn-delete:hover {
            background: #a02342;
        }

        .symodal-no-config {
            text-align: center;
            padding: 30px;
            color: #999;
            font-size: 14px;
        }

        .symodal-add-btn {
            width: 100%;
            padding: 15px;
            background: linear-gradient(90deg, #03a65a 0%, #005e38 100%);
            color: #fff;
            border: none;
            border-radius: 5px;
            font-size: 14px;
            font-family: "Varela Round", sans-serif;
            cursor: pointer;
            transition: all 0.2s;
            font-weight: 500;
            margin-bottom: 15px;
        }

        .symodal-add-btn:hover {
            background: linear-gradient(90deg, #005e38 0%, #03a65a 100%);
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(3, 166, 90, 0.3);
        }

        .symodal-add-btn.active {
            background: linear-gradient(90deg, #fc8621 0%, #c24914 100%);
            animation: pulse 1s infinite;
        }

        @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
        }

        .transition-btn-highlight {
            position: relative;
            outline: 3px solid #fc8621 !important;
            outline-offset: 3px;
            animation: highlight-pulse 1s infinite;
            cursor: pointer !important;
        }

        @keyframes highlight-pulse {
            0%, 100% { outline-color: #fc8621; }
            50% { outline-color: #0070e0; }
        }
    `;

    // Injection du CSS
    const style = document.createElement('style');
    style.textContent = toastCSS + modalCSS;
    document.head.appendChild(style);

    // Créer le conteneur de toasts s'il n'existe pas
    function getToastContainer() {
        let container = document.querySelector('.sytoast-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'sytoast-container';
            document.body.appendChild(container);
        }
        return container;
    }

    // Fonction principale pour afficher les toasts
    window.sytoast = function(type, message, duration = 5000) {
        const container = getToastContainer();

        // Créer l'élément toast
        const toast = document.createElement('div');
        toast.className = `sytoast ${type}`;

        // Créer le contenu
        const title = getTitle(type);
        toast.innerHTML = `
            <div class="sytoast-close"></div>
            <h3>${title}</h3>
            <p>${message}</p>
        `;

        // Ajouter au conteneur
        container.appendChild(toast);

        // Déclencher l'animation d'apparition
        setTimeout(() => toast.classList.add('show'), 10);

        // Gestion de la fermeture par clic
        const closeBtn = toast.querySelector('.sytoast-close');
        closeBtn.addEventListener('click', () => {
            removeToast(toast);
        });

        // Fermeture automatique
        if (duration > 0) {
            setTimeout(() => {
                removeToast(toast);
            }, duration);
        }

        return toast;
    };

    // Fonction pour supprimer un toast
    function removeToast(toast) {
        if (toast && toast.parentNode) {
            toast.classList.add('hide');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }
    }

    // Fonction pour obtenir le titre selon le type
    function getTitle(type) {
        const titles = {
            'success': 'Succès',
            'warning': 'Attention',
            'error': 'Erreur',
            'info': 'Information',
            'help': 'Aide'
        };
        return titles[type] || 'Notification';
    }

    // Fonctions de raccourci pour chaque type
    window.sytoastSuccess = function(message, duration) {
        return sytoast('success', message, duration);
    };

    window.sytoastWarning = function(message, duration) {
        return sytoast('warning', message, duration);
    };

    window.sytoastError = function(message, duration) {
        return sytoast('error', message, duration);
    };

    window.sytoastInfo = function(message, duration) {
        return sytoast('info', message, duration);
    };

    window.sytoastHelp = function(message, duration) {
        return sytoast('help', message, duration);
    };

    // Types disponibles (enum-like) pour appels comme sytoast(SyToastType.Warning, 'message')
    window.SyToastType = Object.freeze({
        Success: 'success',
        Warning: 'warning',
        Error: 'error',
        Info: 'info',
        Help: 'help'
    });

    // Raccourcis optionnels en global (sans écraser le constructeur Error)
    window.Success = 'success';
    window.Warning = 'warning';
    window.Info = 'info';
    window.Help = 'help';
    // Pour l'erreur, utilisez ErrorType pour éviter le conflit avec Error
    window.ErrorType = 'error';

    // Fonction pour nettoyer tous les toasts
    window.sytoastClear = function() {
        const container = document.querySelector('.sytoast-container');
        if (container) {
            container.innerHTML = '';
        }
    };

    // Fonction de confirmation avec toast
    window.sytoastConfirm = function(message, onYes, onNo) {
        const container = getToastContainer();
        const toast = document.createElement('div');
        toast.className = `sytoast info`;
        const title = 'Confirmation';
        toast.innerHTML = `
            <div class="sytoast-close"></div>
            <h3>${title}</h3>
            <p>${message}</p>
            <div class="sytoast-buttons">
                <button class="yes">Oui</button>
                <button class="no">Non</button>
            </div>
        `;
        container.appendChild(toast);
        setTimeout(() => toast.classList.add('show'), 10);
        const closeBtn = toast.querySelector('.sytoast-close');
        closeBtn.addEventListener('click', () => {
            removeToast(toast);
            if (onNo) onNo();
        });
        const yesBtn = toast.querySelector('.yes');
        const noBtn = toast.querySelector('.no');
        yesBtn.addEventListener('click', () => {
            if (onYes) onYes();
            removeToast(toast);
        });
        noBtn.addEventListener('click', () => {
            if (onNo) onNo();
            removeToast(toast);
        });
        return toast;
    };

    // Debug helper: toggle and show demo toasts with infinite duration
    window.sytoastDebugMode = function(enable = true) {
        try {
            if (enable) {
                localStorage.setItem('SY_TOAST_DEBUG', '1');
            } else {
                localStorage.removeItem('SY_TOAST_DEBUG');
            }
        } catch (e) {
            // localStorage might be blocked; ignore
        }
        if (enable) {
            const msg = 'DEBUG: notification de type';
            sytoast('success', `${msg} SUCCESS`, 0);
            sytoast('warning', `${msg} WARNING`, 0);
            sytoast('error', `${msg} ERROR`, 0);
            sytoast('info', `${msg} INFO`, 0);
            sytoast('help', `${msg} HELP`, 0);
        } else {
            sytoastClear();
        }
    };

    // Auto-activate debug if flag is present
    (function() {
        const globalFlag = (typeof window !== 'undefined' && window.SY_TOAST_DEBUG === true);
        let storageFlag = false;
        try {
            storageFlag = localStorage.getItem('SY_TOAST_DEBUG') === '1';
        } catch (e) { /* ignore */ }
        if (globalFlag || storageFlag) {
            // Slight delay to ensure container is available
            setTimeout(() => window.sytoastDebugMode(true), 50);
        }
    })();

    console.log('🍞 Système de toasts SyToast chargé !');
    console.log('  Debug: activez via window.SY_TOAST_DEBUG = true; ou sytoastDebugMode(true)');

    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    const match = window.location.href.match(/\/Reparation\/(\d+)\.html/);
    if (!match) return;
    const idReparation = match[1];
    const urlImpression = `https://prod.cloud-collectorplus.mt.sncf.fr/Commun/ConsulterRepV2/imprime?idReparation=${idReparation}`;

    // --------------------------
    // Debug: Charger l'iframe et récupérer les infos
    // --------------------------
    let cachedPrinterOptions = [];
    let cachedMaskOptions = [];
    let iframeForMaskUpdate = null; // Garder l'iframe pour les mises à jour de masque

    function debugAndLoadSelectOptions(callback) {
        const iframe = document.createElement("iframe");
        iframe.style.display = "none";
        iframe.src = urlImpression;
        document.body.appendChild(iframe);
        iframeForMaskUpdate = iframe; // Sauvegarder la référence

        iframe.onload = async () => {
            try {
                console.log('⏳ Attente du chargement de la page...');
                await delay(2000); // Augmenter le délai initial

                const doc = iframe.contentDocument || iframe.contentWindow.document;

                console.log('🔍 DEBUG: Recherche des form-row...');
                const formRows = doc.querySelectorAll('.form-row');
                console.log(`📊 Nombre de form-row trouvées: ${formRows.length}`);

                // Attendre que les selects soient remplis (surtout mask_equipe)
                let attempts = 0;
                const maxAttempts = 10;

                const waitForSelects = async () => {
                    const printerSelect = doc.querySelector('select[id="printer_equipe"]');
                    const maskSelect = doc.querySelector('select[id="mask_equipe"]');

                    const printerHasOptions = printerSelect && printerSelect.options.length > 1;
                    const maskHasOptions = maskSelect && maskSelect.options.length > 1;

                    console.log(`🔄 Tentative ${attempts + 1}/${maxAttempts}`);
                    console.log(`  - printer_equipe: ${printerSelect?.options.length || 0} options`);
                    console.log(`  - mask_equipe: ${maskSelect?.options.length || 0} options`);

                    // On attend seulement que printer_equipe soit rempli
                    // mask_equipe peut être vide (dépend de la configuration)
                    if (printerHasOptions) {
                        console.log('✅ printer_equipe chargé, on continue...');
                        return true;
                    }

                    if (attempts < maxAttempts) {
                        attempts++;
                        await delay(500);
                        return waitForSelects();
                    }

                    console.log('⏰ Timeout atteint, on continue avec ce qu\'on a...');
                    return false;
                };

                await waitForSelects();

                formRows.forEach((row, index) => {
                    console.log(`\n--- Form-row ${index + 1} ---`);
                    console.log('HTML:', row.innerHTML.substring(0, 200));

                    const selects = row.querySelectorAll('select');
                    console.log(`Nombre de select trouvés: ${selects.length}`);

                    selects.forEach((select, sIndex) => {
                        console.log(`  Select ${sIndex + 1}:`);
                        console.log(`    ID: ${select.id}`);
                        console.log(`    Name: ${select.name}`);
                        console.log(`    Options:`, Array.from(select.options).map(opt => ({
                            value: opt.value,
                            text: opt.text,
                            selected: opt.selected
                        })));
                    });
                });

                // Chercher spécifiquement printer_equipe et mask_equipe
                const printerSelect = doc.querySelector('select[id="printer_equipe"]');
                const maskSelect = doc.querySelector('select[id="mask_equipe"]');

                if (printerSelect) {
                    cachedPrinterOptions = Array.from(printerSelect.options)
                        .filter(opt => opt.value !== '') // Filtrer les options vides
                        .map(opt => ({
                            value: opt.value,
                            text: opt.text,
                            selected: opt.selected
                        }));
                    console.log('✅ printer_equipe trouvé:', cachedPrinterOptions);
                } else {
                    console.log('❌ printer_equipe NON trouvé');
                }

                if (maskSelect) {
                    cachedMaskOptions = Array.from(maskSelect.options)
                        .filter(opt => opt.value !== '') // Filtrer les options vides
                        .map(opt => ({
                            value: opt.value,
                            text: opt.text,
                            selected: opt.selected
                        }));
                    console.log('✅ mask_equipe trouvé:', cachedMaskOptions);
                } else {
                    console.log('❌ mask_equipe NON trouvé');
                }

                // Si mask_equipe est toujours vide, chercher ailleurs
                if (cachedMaskOptions.length === 0) {
                    console.log('⚠️ mask_equipe vide, recherche alternative...');
                    const allSelects = doc.querySelectorAll('select');
                    allSelects.forEach((select, idx) => {
                        console.log(`📋 Select ${idx + 1}:`, {
                            id: select.id,
                            name: select.name,
                            class: select.className,
                            optionsCount: select.options.length
                        });
                    });
                }

                // NE PAS nettoyer l'iframe, on en a besoin pour les mises à jour

                if (callback) callback();

            } catch (e) {
                console.error('❌ Erreur lors du debug:', e);
                if (iframe.parentNode) {
                    iframe.parentNode.removeChild(iframe);
                }
                iframeForMaskUpdate = null;
            }
        };
    }

    // --------------------------
    // Mettre à jour les masques en fonction de l'imprimante sélectionnée
    // --------------------------
    async function updateMaskOptions(printerId) {
        if (!iframeForMaskUpdate) {
            console.log('⚠️ Iframe non disponible pour mise à jour des masques');
            return [];
        }

        try {
            const doc = iframeForMaskUpdate.contentDocument || iframeForMaskUpdate.contentWindow.document;
            const printerSelect = doc.querySelector('select[id="printer_equipe"]');

            if (!printerSelect) {
                console.log('❌ printer_equipe non trouvé dans l\'iframe');
                return [];
            }

            // Changer la valeur de l'imprimante
            console.log(`🔄 Changement d'imprimante vers: ${printerId}`);
            printerSelect.value = printerId;

            // Déclencher l'événement change
            const changeEvent = new Event('change', { bubbles: true });
            printerSelect.dispatchEvent(changeEvent);

            // Attendre que les masques se chargent
            await delay(1000);

            const maskSelect = doc.querySelector('select[id="mask_equipe"]');
            if (!maskSelect) {
                console.log('❌ mask_equipe non trouvé');
                return [];
            }

            const masks = Array.from(maskSelect.options)
                .filter(opt => opt.value !== '')
                .map(opt => ({
                    value: opt.value,
                    text: opt.text,
                    selected: opt.selected
                }));

            console.log(`✅ ${masks.length} masques trouvés pour l'imprimante ${printerId}:`, masks);
            return masks;

        } catch (e) {
            console.error('❌ Erreur lors de la mise à jour des masques:', e);
            return [];
        }
    }

    // --------------------------
    // Gestion des configurations d'impression
    // --------------------------
    const STORAGE_KEY = 'SY_PRINT_CONFIGS';

    function getPrintConfigs() {
        try {
            const configs = localStorage.getItem(STORAGE_KEY);
            return configs ? JSON.parse(configs) : {};
        } catch (e) {
            console.error('Erreur lors de la récupération des configurations:', e);
            return {};
        }
    }

    function savePrintConfig(transitionId, transitionName, printer, mask) {
        try {
            const configs = getPrintConfigs();
            configs[transitionId] = {
                transitionId,
                transitionName,
                printer,
                mask,
                updatedAt: new Date().toISOString()
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(configs));
            console.log('✅ Configuration sauvegardée:', configs[transitionId]);
            return true;
        } catch (e) {
            console.error('❌ Erreur lors de la sauvegarde:', e);
            return false;
        }
    }

    function deletePrintConfig(transitionId) {
        try {
            const configs = getPrintConfigs();
            delete configs[transitionId];
            localStorage.setItem(STORAGE_KEY, JSON.stringify(configs));
            console.log('🗑️ Configuration supprimée pour:', transitionId);
            return true;
        } catch (e) {
            console.error('❌ Erreur lors de la suppression:', e);
            return false;
        }
    }

    function getConfigForTransition(transitionId) {
        const configs = getPrintConfigs();
        return configs[transitionId] || null;
    }

    // --------------------------
    // Détecter les boutons de transition
    // --------------------------
    function detectTransitionButtons() {
        const buttons = [];

        // Détecter tous les boutons de transition
        const allTransitionButtons = document.querySelectorAll('button[collector-trans-id]');
        allTransitionButtons.forEach(btn => {
            const id = btn.getAttribute('collector-trans-id');
            const name = btn.getAttribute('collector-next-state-name') ||
                        btn.querySelector('span')?.textContent.trim() ||
                        'Transition ' + id;

            buttons.push({
                id,
                name,
                element: btn
            });
        });

        return buttons;
    }

    // --------------------------
    // Mode sélection de bouton
    // --------------------------
    let selectionMode = false;
    let buttonClickHandlers = new Map();

    function activateSelectionMode(callback) {
        if (selectionMode) return;

        selectionMode = true;
        console.log('🎯 Mode sélection activé');

        // Ajouter un overlay transparent MAIS qui ne bloque PAS les clics sur les boutons
        const overlay = document.createElement('div');
        overlay.id = 'button-selection-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 9999;
            background: rgba(0, 0, 0, 0.3);
            cursor: crosshair;
            pointer-events: none;
        `;
        document.body.appendChild(overlay);

        // Toast d'instruction
        sytoastInfo('Cliquez sur un bouton de transition pour le configurer', 0);

        // Mettre en surbrillance tous les boutons de transition
        const transitionButtons = document.querySelectorAll('button[collector-trans-id]');
        transitionButtons.forEach(btn => {
            btn.classList.add('transition-btn-highlight');
            // Permettre les clics sur les boutons
            btn.style.pointerEvents = 'auto';
            btn.style.position = 'relative';
            btn.style.zIndex = '10000';

            const handler = (e) => {
                e.preventDefault();
                e.stopPropagation();

                const id = btn.getAttribute('collector-trans-id');
                const name = btn.getAttribute('collector-next-state-name') ||
                            btn.querySelector('span')?.textContent.trim() ||
                            'Transition ' + id;

                console.log('✅ Bouton sélectionné:', id, name);
                deactivateSelectionMode();
                callback(id, name);
            };

            buttonClickHandlers.set(btn, handler);
            btn.addEventListener('click', handler, true);
        });

        // Ajouter un bouton d'annulation visible
        const cancelBtn = document.createElement('div');
        cancelBtn.id = 'selection-cancel-btn';
        cancelBtn.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 10001;
            padding: 12px 24px;
            background: linear-gradient(90deg, #db3056 0%, #851d41 100%);
            color: white;
            border-radius: 8px;
            cursor: pointer;
            font-family: "Varela Round", sans-serif;
            font-size: 14px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            pointer-events: auto;
        `;
        cancelBtn.textContent = '❌ Annuler la sélection';
        cancelBtn.addEventListener('click', () => {
            deactivateSelectionMode();
            sytoastInfo('Sélection annulée');
        });
        document.body.appendChild(cancelBtn);
    }

    function deactivateSelectionMode() {
        if (!selectionMode) return;

        selectionMode = false;
        console.log('❌ Mode sélection désactivé');

        // Retirer l'overlay
        const overlay = document.getElementById('button-selection-overlay');
        if (overlay) overlay.remove();

        // Retirer le bouton d'annulation
        const cancelBtn = document.getElementById('selection-cancel-btn');
        if (cancelBtn) cancelBtn.remove();

        // Retirer les surbrillances et les handlers
        const transitionButtons = document.querySelectorAll('button[collector-trans-id]');
        transitionButtons.forEach(btn => {
            btn.classList.remove('transition-btn-highlight');
            btn.style.pointerEvents = '';
            btn.style.position = '';
            btn.style.zIndex = '';

            const handler = buttonClickHandlers.get(btn);
            if (handler) {
                btn.removeEventListener('click', handler, true);
                buttonClickHandlers.delete(btn);
            }
        });

        // Fermer le toast d'instruction
        sytoastClear();
    }

    // --------------------------
    // Récupérer les options des selects
    // --------------------------
    function getOptionsFromSelect(selectId) {
        if (selectId === 'printer_equipe') {
            return cachedPrinterOptions;
        } else if (selectId === 'mask_equipe') {
            return cachedMaskOptions;
        }
        return [];
    }

    // --------------------------
    // Créer et afficher le modal
    // --------------------------
    function showPrintModal(onConfirm, configMode = false, transitionId = null, transitionName = null, sourceButton = null) {
        // Récupérer les options des deux selects
        const printerOptions = getOptionsFromSelect('printer_equipe');
        const maskOptions = getOptionsFromSelect('mask_equipe');

        console.log('🔍 Affichage modal - Options disponibles:');
        console.log('  Imprimantes:', printerOptions.length);
        console.log('  Masques:', maskOptions.length);
        console.log('  Iframe disponible:', !!iframeForMaskUpdate);

        // Vérifier si on a au moins les imprimantes ET si l'iframe est disponible
        if (printerOptions.length === 0 || !iframeForMaskUpdate) {
            // Précharger silencieusement sans afficher de toast
            debugAndLoadSelectOptions(() => {
                showPrintModal(onConfirm, configMode, transitionId, transitionName, sourceButton);
            });
            return;
        }

        // Récupérer la configuration existante si on édite
        const existingConfig = transitionId ? getConfigForTransition(transitionId) : null;
        console.log('📋 Configuration existante:', existingConfig);

        // Créer l'overlay
        const overlay = document.createElement('div');
        overlay.className = 'symodal-overlay';

        // Créer le modal
        const modal = document.createElement('div');
        modal.className = 'symodal';

        // Calculer l'origine de l'animation si on a un bouton source
        if (sourceButton) {
            const rect = sourceButton.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            // Définir la position de départ exacte du bouton
            modal.classList.add('from-button');
            modal.style.setProperty('--start-x', `${centerX}px`);
            modal.style.setProperty('--start-y', `${centerY}px`);

            console.log('🎯 Animation depuis le bouton:', {
                x: centerX,
                y: centerY,
                rect: rect,
                button: sourceButton
            });
        }

        // Récupérer les configurations existantes
        const printConfigs = getPrintConfigs();

        // Contenu du modal avec onglets
        modal.innerHTML = `
            <div class="symodal-header">
                <h2>🖨️ Impression d'étiquette</h2>
                <button class="symodal-close" type="button">×</button>
            </div>

            <div class="symodal-tabs">
                <button class="symodal-tab ${!configMode ? 'active' : ''}" data-tab="print">Impression</button>
                <button class="symodal-tab ${configMode ? 'active' : ''}" data-tab="config">Configuration (${Object.keys(printConfigs).length})</button>
            </div>

            <div class="symodal-tab-content ${!configMode ? 'active' : ''}" data-content="print">
                <div class="symodal-body">
                    ${transitionId ? `<div class="symodal-field"><p style="color: #0070e0; font-size: 13px;">📋 Configuration pour: <strong>${transitionName}</strong></p></div>` : ''}
                    <div class="symodal-field">
                        <label>Imprimante :</label>
                        <select class="symodal-select" id="modal-printer">
                            ${printerOptions.map(opt =>
                                `<option value="${opt.value}" ${(existingConfig && opt.value === existingConfig.printer) || (!existingConfig && opt.selected) ? 'selected' : ''}>${opt.text}</option>`
                            ).join('')}
                        </select>
                    </div>
                    <div class="symodal-field">
                        <label>Masque : <span id="mask-loading" style="color: #fc8621; display: none;">⏳ Chargement...</span></label>
                        <select class="symodal-select" id="modal-mask" disabled>
                            <option value="">Sélectionnez d'abord une imprimante</option>
                        </select>
                    </div>
                </div>
                <div class="symodal-footer">
                    <button class="symodal-btn symodal-btn-secondary" id="modal-cancel" type="button">Annuler</button>
                    ${transitionId ? `<button class="symodal-btn symodal-btn-primary" id="modal-save-config" type="button">💾 Sauvegarder la config</button>` : ''}
                    <button class="symodal-btn symodal-btn-primary" id="modal-print" type="button">🖨️ Imprimer</button>
                </div>
            </div>

            <div class="symodal-tab-content ${configMode ? 'active' : ''}" data-content="config">
                <div class="symodal-body">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <button class="symodal-add-btn" id="add-button-config" type="button">
                            ➕ Ajouter un bouton
                        </button>
                        <p style="color: #666; font-size: 12px; margin-top: 10px;">
                            Cliquez pour sélectionner un bouton de transition à configurer
                        </p>
                    </div>

                    <div class="symodal-config-list" id="config-list">
                        ${Object.keys(printConfigs).length === 0 ?
                            '<div class="symodal-no-config">Aucune configuration enregistrée</div>' :
                            Object.values(printConfigs).map(config => {
                                return `
                                    <div class="symodal-config-item" data-transition-id="${config.transitionId}">
                                        <div class="symodal-config-info">
                                            <div class="symodal-config-name">${config.transitionName}</div>
                                            <div class="symodal-config-details">
                                                ✅ Configuré: ${config.printer} → ${config.mask || 'Aucun masque'}
                                            </div>
                                        </div>
                                        <div class="symodal-config-actions">
                                            <button class="symodal-btn-small symodal-btn-edit" data-action="edit" data-id="${config.transitionId}" data-name="${config.transitionName}">
                                                ✏️ Modifier
                                            </button>
                                            <button class="symodal-btn-small symodal-btn-delete" data-action="delete" data-id="${config.transitionId}">🗑️</button>
                                        </div>
                                    </div>
                                `;
                            }).join('')
                        }
                    </div>
                </div>
                <div class="symodal-footer">
                    <button class="symodal-btn symodal-btn-secondary" id="modal-cancel-config" type="button">Fermer</button>
                </div>
            </div>
        `;

        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        // Si le modal vient d'un bouton, déclencher l'animation après l'ajout au DOM
        if (sourceButton) {
            // Forcer le reflow pour que les styles CSS soient appliqués
            modal.offsetHeight;

            // Déclencher l'animation en ajoutant la classe
            requestAnimationFrame(() => {
                modal.classList.add('animate');
            });
        }

        // Fonction pour fermer le modal
        const closeModal = () => {
            overlay.style.opacity = '0';
            setTimeout(() => {
                if (overlay.parentNode) {
                    overlay.parentNode.removeChild(overlay);
                }
                // NE PAS nettoyer l'iframe quand on ferme le modal
                // On en a besoin pour les prochaines ouvertures et les changements de masque
                // L'iframe sera nettoyée seulement au chargement d'une nouvelle page
            }, 300);
        };

        // Gestion des événements
        const closeBtn = modal.querySelector('.symodal-close');
        const cancelBtn = modal.querySelector('#modal-cancel');
        const cancelConfigBtn = modal.querySelector('#modal-cancel-config');
        const printBtn = modal.querySelector('#modal-print');
        const saveConfigBtn = modal.querySelector('#modal-save-config');
        const printerSelect = modal.querySelector('#modal-printer');
        const maskSelect = modal.querySelector('#modal-mask');
        const maskLoading = modal.querySelector('#mask-loading');

        // Gestion des onglets
        const tabs = modal.querySelectorAll('.symodal-tab');
        const tabContents = modal.querySelectorAll('.symodal-tab-content');

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabName = tab.getAttribute('data-tab');

                tabs.forEach(t => t.classList.remove('active'));
                tabContents.forEach(c => c.classList.remove('active'));

                tab.classList.add('active');
                const content = modal.querySelector(`[data-content="${tabName}"]`);
                if (content) content.classList.add('active');
            });
        });

        // Gestion du bouton "Ajouter un bouton"
        const addButtonBtn = modal.querySelector('#add-button-config');
        if (addButtonBtn) {
            addButtonBtn.addEventListener('click', () => {
                closeModal();
                activateSelectionMode((selectedId, selectedName) => {
                    sytoastSuccess(`Bouton sélectionné: ${selectedName}`);
                    // Réouvrir le modal en mode configuration pour ce bouton
                    setTimeout(() => {
                        showPrintModal(null, false, selectedId, selectedName, null);
                    }, 100);
                });
            });
        }

        // Gestion des actions de configuration
        const configList = modal.querySelector('#config-list');
        if (configList) {
            configList.addEventListener('click', (e) => {
                const btn = e.target.closest('[data-action]');
                if (!btn) return;

                const action = btn.getAttribute('data-action');
                const id = btn.getAttribute('data-id');
                const name = btn.getAttribute('data-name');

                if (action === 'edit') {
                    closeModal();
                    showPrintModal(null, false, id, name, btn);
                } else if (action === 'delete') {
                    if (confirm(`Supprimer la configuration pour "${name}" ?`)) {
                        deletePrintConfig(id);
                        closeModal();
                        showPrintModal(null, true, null, null, null);
                        sytoastSuccess('Configuration supprimée !');
                    }
                }
            });
        }

        closeBtn.addEventListener('click', closeModal);
        if (cancelBtn) cancelBtn.addEventListener('click', closeModal);
        if (cancelConfigBtn) cancelConfigBtn.addEventListener('click', closeModal);
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeModal();
        });

        // Charger les masques quand on change d'imprimante
        printerSelect.addEventListener('change', async () => {
            const selectedPrinter = printerSelect.value;
            console.log('🔄 Changement d\'imprimante:', selectedPrinter);

            // Désactiver le select et afficher le chargement
            maskSelect.disabled = true;
            maskSelect.innerHTML = '<option value="">Chargement...</option>';
            maskLoading.style.display = 'inline';

            // Charger les masques
            const masks = await updateMaskOptions(selectedPrinter);

            // Mettre à jour le select des masques
            if (masks.length > 0) {
                maskSelect.innerHTML = masks.map(opt =>
                    `<option value="${opt.value}" ${opt.selected ? 'selected' : ''}>${opt.text}</option>`
                ).join('');
                maskSelect.disabled = false;
            } else {
                maskSelect.innerHTML = '<option value="">Aucun masque disponible</option>';
                maskSelect.disabled = true;
            }

            maskLoading.style.display = 'none';
        });

        // Charger les masques pour l'imprimante sélectionnée par défaut
        const loadInitialMasks = async () => {
            const initialPrinter = printerSelect.value;
            if (initialPrinter) {
                console.log('🔄 Chargement initial des masques pour:', initialPrinter);
                maskSelect.disabled = true;
                maskSelect.innerHTML = '<option value="">Chargement...</option>';
                maskLoading.style.display = 'inline';

                const masks = await updateMaskOptions(initialPrinter);

                if (masks.length > 0) {
                    // Si on a une config existante, pré-sélectionner le masque sauvegardé
                    maskSelect.innerHTML = masks.map(opt =>
                        `<option value="${opt.value}" ${(existingConfig && opt.value === existingConfig.mask) || (!existingConfig && opt.selected) ? 'selected' : ''}>${opt.text}</option>`
                    ).join('');
                    maskSelect.disabled = false;
                    console.log('✅ Masques chargés, config existante appliquée:', existingConfig?.mask);
                } else {
                    maskSelect.innerHTML = '<option value="">Aucun masque disponible</option>';
                    maskSelect.disabled = true;
                }

                maskLoading.style.display = 'none';
            }
        };

        // Charger les masques après un court délai pour s'assurer que le modal est bien affiché
        setTimeout(loadInitialMasks, 100);

        // Sauvegarder la configuration
        if (saveConfigBtn && transitionId) {
            saveConfigBtn.addEventListener('click', () => {
                const selectedPrinter = printerSelect.value;
                const selectedMask = maskSelect.value;

                if (!selectedPrinter) {
                    sytoastWarning('Veuillez sélectionner une imprimante');
                    return;
                }

                if (savePrintConfig(transitionId, transitionName, selectedPrinter, selectedMask)) {
                    sytoastSuccess('Configuration sauvegardée !');
                    closeModal();
                    // Réouvrir le modal sur l'onglet configuration
                    setTimeout(() => showPrintModal(null, true, null, null, null), 300);
                } else {
                    sytoastError('Erreur lors de la sauvegarde');
                }
            });
        }

        printBtn.addEventListener('click', () => {
            const selectedPrinter = printerSelect.value;
            const selectedMask = maskSelect.value;
            console.log('🖨️ Impression avec:', { printer: selectedPrinter, mask: selectedMask });
            closeModal();
            if (onConfirm) {
                onConfirm(selectedPrinter, selectedMask);
            }
        });
    }

    // --------------------------
    // Fonction d'impression
    // --------------------------
    function imprimerEtiquette(printer, mask) {
        console.log('🖨️ Début impression avec:', { printer, mask });

        const iframe = document.createElement("iframe");
        iframe.style.display = "none";
        iframe.src = urlImpression;
        document.body.appendChild(iframe);

        iframe.onload = async () => {
            try {
                console.log('⏳ Attente du chargement de la page d\'impression...');
                await delay(2000); // Augmenter le délai

                const doc = iframe.contentDocument || iframe.contentWindow.document;

                // Attendre que les selects soient disponibles
                let attempts = 0;
                const maxAttempts = 10;

                const waitForSelects = async () => {
                    const printerSelect = doc.querySelector('select[id="printer_equipe"]');
                    const maskSelect = doc.querySelector('select[id="mask_equipe"]');

                    console.log(`🔄 Tentative ${attempts + 1}/${maxAttempts} - Selects trouvés:`, {
                        printer: !!printerSelect,
                        mask: !!maskSelect,
                        printerOptions: printerSelect?.options.length || 0,
                        maskOptions: maskSelect?.options.length || 0
                    });

                    if (printerSelect && printerSelect.options.length > 1) {
                        return true;
                    }

                    if (attempts < maxAttempts) {
                        attempts++;
                        await delay(500);
                        return waitForSelects();
                    }

                    return false;
                };

                const selectsReady = await waitForSelects();

                if (!selectsReady) {
                    sytoastError("Les sélections d'impression ne sont pas disponibles");
                    if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
                    return;
                }

                // Appliquer les sélections
                const printerSelect = doc.querySelector('select[id="printer_equipe"]');
                const maskSelect = doc.querySelector('select[id="mask_equipe"]');

                if (printer && printerSelect) {
                    console.log('📝 Application imprimante:', printer);
                    printerSelect.value = printer;

                    // Déclencher l'événement change pour charger les masques
                    const changeEvent = new Event('change', { bubbles: true });
                    printerSelect.dispatchEvent(changeEvent);

                    // Attendre que les masques se chargent
                    await delay(1500);
                }

                if (mask && maskSelect) {
                    console.log('📝 Application masque:', mask);
                    maskSelect.value = mask;
                }

                // Attendre un peu avant de cliquer sur le bouton
                await delay(500);

                const bouton = doc.getElementById("btnPrintEtiquette");
                console.log('🔍 Bouton d\'impression trouvé:', !!bouton);

                if (bouton) {
                    console.log('✅ Clic sur le bouton d\'impression');
                    bouton.click();
                    sytoastSuccess("Étiquette imprimée avec succès !");

                    // Nettoyer l'iframe après un délai
                    setTimeout(() => {
                        if (iframe.parentNode) {
                            iframe.parentNode.removeChild(iframe);
                        }
                    }, 2000);
                } else {
                    sytoastError("Bouton 'Imprimer étiquette' introuvable.");
                    if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
                }
            } catch (e) {
                console.error('❌ Erreur lors de l\'impression:', e);
                sytoastError("Une erreur est survenue pendant l'impression.");
                if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
            }
        };
    }

    // --------------------------
    // Injection du bouton manuel 🖨️
    // --------------------------
    function createManualPrintButton() {
        if (document.getElementById("btnImprimerEtiquetteManuel")) return;

        const titleEl = Array.from(document.querySelectorAll("h3.panel-title"))
            .find(el => el.textContent.trim() === "Actions disponibles");
        if (!titleEl) return;

        const container = titleEl.closest(".panel-heading");
        if (!container) return;

        container.style.display = "flex";
        container.style.justifyContent = "space-between";
        container.style.alignItems = "center";

        const btn = document.createElement("button");
        btn.id = "btnImprimerEtiquetteManuel";
        btn.className = "retournement-btn";
        btn.innerHTML = `<span class="icon">🖨️</span>`;
        btn.title = "Imprimer étiquette";
        // Ajout du CSS spécifique Retournement_Bouton.css si non déjà présent
        if (!document.getElementById("retournement-btn-css")) {
            const style = document.createElement("style");
            style.id = "retournement-btn-css";
            style.textContent = `
            .retournement-btn {
                display: inline-flex;
                align-items: center;
                gap: 8px;
                background: linear-gradient(90deg, #0070e0 0%, #05478a 100%);
                color: #fff;
                border: none;
                border-radius: 6px;
                padding: 0px 11px;
                font-size: 1rem;
                font-family: "Varela Round", sans-serif;
                font-weight: 500;
                box-shadow: 0 2px 8px rgba(0,0,0,0.10);
                cursor: pointer;
                transition: background 0.2s, box-shadow 0.2s, transform 0.1s;
            }
            .retournement-btn:hover {
                background: linear-gradient(90deg, #05478a 0%, #0070e0 100%);
                box-shadow: 0 4px 16px rgba(0,0,0,0.18);
                transform: translateY(-2px) scale(1.03);
            }
            .retournement-btn .icon {
                font-size: 1.2em;
            }
            .retournement-btn .text {
                font-size: 1em;
            }
            `;
            document.head.appendChild(style);
        }

        btn.onclick = () => {
            showPrintModal((printer, mask) => {
                imprimerEtiquette(printer, mask);
            }, false, null, null, btn);
        };

        container.appendChild(btn);
    }

    // --------------------------
    // Intercepter tous les boutons de transition configurés
    // --------------------------
    function intercepterBoutonsTransition() {
        const printConfigs = getPrintConfigs();
        const configuredIds = Object.keys(printConfigs);

        // Intercepter SEULEMENT les boutons qui ont une configuration
        configuredIds.forEach(transitionId => {
            const btn = document.querySelector(`button[collector-trans-id="${transitionId}"]`);

            if (!btn) return;

            // Éviter de rajouter plusieurs fois le listener
            if (btn.dataset.listener === "true") return;
            btn.dataset.listener = "true";

            console.log(`🔗 Intercepter le bouton ${transitionId} avec config:`, printConfigs[transitionId]);

            btn.addEventListener("click", function () {
                setTimeout(() => {
                    const config = printConfigs[transitionId];

                    console.log(`✅ Configuration trouvée pour ${transitionId}:`, config);
                    sytoastConfirm("Souhaitez-vous imprimer l'étiquette ?",
                        () => {
                            imprimerEtiquette(config.printer, config.mask);
                        },
                        () => {}
                    );
                }, 100); // petit délai pour laisser l'action native se faire
            });
        });
    }

    // --------------------------
    // Observer les changements du DOM
    // --------------------------
    const observer = new MutationObserver(() => {
        createManualPrintButton();
        intercepterBoutonsTransition();
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // Init au chargement
    createManualPrintButton();
    intercepterBoutonsTransition();

    // Précharger les options au démarrage (en arrière-plan, silencieux)
    console.log('🔄 Préchargement des options d\'impression en arrière-plan...');
    debugAndLoadSelectOptions(() => {
        console.log('✅ Options préchargées avec succès ! Le modal sera instantané.');
    });
})();
