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

    // Injection du CSS
    const style = document.createElement('style');
    style.textContent = toastCSS;
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
    // Fonction d'impression
    // --------------------------
    function imprimerEtiquette() {
        const iframe = document.createElement("iframe");
        iframe.style.display = "none";
        iframe.src = urlImpression;
        document.body.appendChild(iframe);

        iframe.onload = async () => {
            try {
                await delay(1000);
                const doc = iframe.contentDocument || iframe.contentWindow.document;
                const bouton = doc.getElementById("btnPrintEtiquette");

                if (bouton) {
                    bouton.click();
                    sytoastSuccess("Étiquette imprimée avec succès !");
                } else {
                    sytoastError("Bouton 'Imprimer étiquette' introuvable.");
                }
            } catch (e) {
                console.error(e);
                sytoastError("Une erreur est survenue pendant l'impression.");
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

        btn.onclick = imprimerEtiquette;

        container.appendChild(btn);
    }

    // --------------------------
    // Intercepter bouton "Renvoi vers magasinier"
    // --------------------------
    function intercepterBoutonRenvoi() {
        const boutonRenvoi = document.querySelector('button[collector-trans-id="286"]');

        if (!boutonRenvoi || boutonRenvoi.dataset.listener === "true") return;

        boutonRenvoi.dataset.listener = "true"; // éviter double écoute

        boutonRenvoi.addEventListener("click", function () {
            setTimeout(() => {
                sytoastConfirm("Souhaitez-vous imprimer l'étiquette ?", () => imprimerEtiquette(), () => {});
            }, 100); // petit délai pour laisser l'action native se faire
        });
    }

    // --------------------------
    // Observer les changements du DOM
    // --------------------------
    const observer = new MutationObserver(() => {
        createManualPrintButton();
        intercepterBoutonRenvoi();
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // Init au chargement
    createManualPrintButton();
    intercepterBoutonRenvoi();
})();
