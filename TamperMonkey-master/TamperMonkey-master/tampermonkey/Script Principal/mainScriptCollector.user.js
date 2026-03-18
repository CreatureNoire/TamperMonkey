// ==UserScript==
// @name         Script Collector
// @namespace    https://github.com/Syfrost/JustWork-Next-Extension
// @version      1.9.1
// @description  Charge plusieurs scripts Collector + import/export séparés
// @author       CréatureNoire
// @connect      prod.cloud-collectorplus.mt.sncf.fr
// @match        https://prod.cloud-collectorplus.mt.sncf.fr/Prm/Reparation/*
// @match        planner.cloud.microsoft/webui/mytasks/*
// @match        planner.cloud.microsoft/webui/myplans/*
// @match        planner.cloud.microsoft/webui/plan/*
//
// @require      https://raw.githubusercontent.com/CreatureNoire/TamperMonkey/refs/heads/master/tampermonkey/Extention/BoutonModifiableCollectorInfo.js
// @require      https://raw.githubusercontent.com/CreatureNoire/TamperMonkey/refs/heads/master/tampermonkey/Extention/OuvertureCommandeComposantViaCollector.js
// @require      https://raw.githubusercontent.com/CreatureNoire/TamperMonkey/refs/heads/master/tampermonkey/Extention/Copie_Colle_REX.js
// @require      https://raw.githubusercontent.com/CreatureNoire/TamperMonkey/refs/heads/master/tampermonkey/Extention/copieFCA.js
// @require      https://raw.githubusercontent.com/CreatureNoire/TamperMonkey/refs/heads/master/tampermonkey/Extention/Commande_Composant_SY.js
// @require      https://raw.githubusercontent.com/CreatureNoire/TamperMonkey/refs/heads/master/tampermonkey/Extention%20C%C3%A9dric/tm_already_pass.js
// @require      https://raw.githubusercontent.com/CreatureNoire/TamperMonkey/refs/heads/master/tampermonkey/Extention/tm_prm_tab.js
// @require      https://raw.githubusercontent.com/CreatureNoire/TamperMonkey/refs/heads/master/tampermonkey/Extention/SDQ%20envoi%20en%20SST.js
// @require      https://raw.githubusercontent.com/Syfrost/JustWork-Next-Extension/refs/heads/master/tampermonkey/tm_unlock_any.js
// @require      https://raw.githubusercontent.com/CreatureNoire/TamperMonkey/refs/heads/master/tampermonkey/Extention/retour_arriere.js
// @require      https://raw.githubusercontent.com/CreatureNoire/TamperMonkey/refs/heads/master/tampermonkey/Extention/impression_etiquette.js
// @require      https://raw.githubusercontent.com/CreatureNoire/TamperMonkey/refs/heads/master/tampermonkey/Extention/boutonPlanDeControle.js
// @require      https://raw.githubusercontent.com/CreatureNoire/TamperMonkey/refs/heads/master/tampermonkey/Extention/Retour_Prema_en_couleur.js
// @require      https://raw.githubusercontent.com/CreatureNoire/TamperMonkey/refs/heads/master/tampermonkey/Extention/Agrandissment_Commentaire.js

// @updateURL    https://github.com/CreatureNoire/TamperMonkey/blob/master/tampermonkey/Script%20Principal/mainScriptCollector.user.js
// @downloadURL  https://github.com/CreatureNoire/TamperMonkey/blob/master/tampermonkey/Script%20Principal/mainScriptCollector.user.js
// @grant        GM_info
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// ==/UserScript==

(function () {
    'use strict';

    const MENU_PREFIX_BOUTONS = 'Boutons Modifiables';
    const MENU_PREFIX_REX = 'Copie REX';

    const BOUTONS_KEYS = {
        buttons: 'customButtonsConfig',
        colors: 'customButtonsColors'
    };

    const REX_KEYS = {
        copies: 'formCopies',
        order: 'buttonOrder'
    };

    function styleButton(button, backgroundColor, iconClass) {
        button.style.margin = '5px';
        button.style.backgroundColor = backgroundColor;
        button.style.color = 'black';
        button.style.padding = '5px 10px';
        button.style.border = 'none';
        button.style.borderRadius = '5px';
        button.style.cursor = 'pointer';
        button.innerHTML = `<i class='fa ${iconClass}'></i> ` + button.innerText;
    }

    GM_addStyle(`
    .autoelement {
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        width: 100%;
        border-radius: 5px !important;
        border: 2px solid rgb(255, 128, 0) !important;
        background: rgba(0, 0, 0, 0.5) !important;
        backdrop-filter: blur(5px);
        box-shadow: 0 2px 8px rgba(255, 104, 0, 0.8);
        padding: 5px;
    }
    .autoelement__img__container {
        display: block;
        position: relative;
        padding: 4px 4px 4px 4px;
        margin: 0;
        width: auto;
        height: auto;
        border-radius: 50px;
        overflow: hidden;
    }
    .autoelement__img__source {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 25px !important;
        height: 20px !important;
        overflow: hidden;
    }
    .autoelement__text {
        padding-right: 5px;
        color: rgb(204,204,204) !important;
        font-family: 'Montserrat', sans-serif;
        font-weight: 400;
        font-size: 0.8rem;
    }
        `);
    injecterPoliceMontserrat();

    function injecterPoliceMontserrat() {
        if (!document.getElementById('font')) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'https://fonts.googleapis.com/css?family=Montserrat:300,400,700,900&display=swap';
            link.id = 'font';
            document.head.appendChild(link);
            console.log('🔤 Police Montserrat injectée.');
        }
    }

    function downloadJsonFile(data, fileName) {
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

    function openJsonFilePicker(onLoad) {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.json,application/json';
        fileInput.style.display = 'none';

        fileInput.addEventListener('change', () => {
            const file = fileInput.files && fileInput.files[0];
            if (!file) {
                fileInput.remove();
                return;
            }

            const reader = new FileReader();
            reader.onload = () => {
                try {
                    const data = JSON.parse(reader.result);
                    onLoad(data);
                } catch (error) {
                    console.error('❌ JSON invalide:', error);
                    alert('❌ Impossible de lire ce JSON.');
                }
            };

            reader.onerror = () => {
                console.error('❌ Erreur lecture fichier JSON:', reader.error);
                alert('❌ Impossible de lire le fichier sélectionné.');
            };

            reader.readAsText(file, 'utf-8');
            fileInput.remove();
        });

        document.body.appendChild(fileInput);
        fileInput.click();
    }

    function exportBoutons() {
        const payload = {
            version: 1,
            exportedAt: new Date().toISOString(),
            buttons: JSON.parse(localStorage.getItem(BOUTONS_KEYS.buttons) || '[]'),
            colors: JSON.parse(localStorage.getItem(BOUTONS_KEYS.colors) || 'null')
        };
        const dateStamp = payload.exportedAt.slice(0, 10);
        downloadJsonFile(payload, `collector-boutons-${dateStamp}.json`);
        alert('✅ Export Boutons Modifiables terminé.');
    }

    function importBoutons() {
        openJsonFilePicker((data) => {
            if (!data || !Array.isArray(data.buttons)) {
                alert('❌ JSON Boutons invalide.');
                return;
            }

            const confirmOverwrite = confirm('Importer Boutons va remplacer votre configuration actuelle. Continuer ?');
            if (!confirmOverwrite) return;

            localStorage.setItem(BOUTONS_KEYS.buttons, JSON.stringify(data.buttons));
            if (data.colors) {
                localStorage.setItem(BOUTONS_KEYS.colors, JSON.stringify(data.colors));
            }

            alert('✅ Import Boutons terminé. La page va être rechargée.');
            location.reload();
        });
    }

    function exportRex() {
        const payload = {
            version: 1,
            exportedAt: new Date().toISOString(),
            copies: JSON.parse(localStorage.getItem(REX_KEYS.copies) || '{}'),
            order: JSON.parse(localStorage.getItem(REX_KEYS.order) || '[]')
        };
        const dateStamp = payload.exportedAt.slice(0, 10);
        downloadJsonFile(payload, `copie-rex-${dateStamp}.json`);
        alert('✅ Export Copie REX terminé.');
    }

    function importRex() {
        openJsonFilePicker((data) => {
            if (!data || typeof data.copies !== 'object') {
                alert('❌ JSON Copie REX invalide.');
                return;
            }

            const confirmOverwrite = confirm('Importer Copie REX va remplacer votre configuration actuelle. Continuer ?');
            if (!confirmOverwrite) return;

            localStorage.setItem(REX_KEYS.copies, JSON.stringify(data.copies));
            if (Array.isArray(data.order)) {
                localStorage.setItem(REX_KEYS.order, JSON.stringify(data.order));
            }

            alert('✅ Import Copie REX terminé. La page va être rechargée.');
            location.reload();
        });
    }

    function registerMenuCommands() {
        if (typeof GM_registerMenuCommand !== 'function') {
            console.warn('⚠️ GM_registerMenuCommand indisponible.');
            return;
        }

        const noop = () => {};

        GM_registerMenuCommand('──────── Boutons Modifiables ────────', noop);
        GM_registerMenuCommand(`${MENU_PREFIX_BOUTONS} → Exporter JSON`, exportBoutons);
        GM_registerMenuCommand(`${MENU_PREFIX_BOUTONS} → Importer JSON`, importBoutons);

        GM_registerMenuCommand('──────── Copie REX ────────', noop);
        GM_registerMenuCommand(`${MENU_PREFIX_REX} → Exporter JSON`, exportRex);
        GM_registerMenuCommand(`${MENU_PREFIX_REX} → Importer JSON`, importRex);
    }

    registerMenuCommands();
})();
