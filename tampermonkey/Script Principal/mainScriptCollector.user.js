// ==UserScript==
// @name         Script Collector
// @namespace    https://github.com/Syfrost/JustWork-Next-Extension
// @version      2.0.0
// @description  Charge plusieurs scripts Collector + panneau Export/Import unifié
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
// @require      https://raw.githubusercontent.com/CreatureNoire/TamperMonkey/refs/heads/master/tampermonkey/Extention/AgrandissmentCommentaire.js
// @require      https://raw.githubusercontent.com/CreatureNoire/TamperMonkey/refs/heads/master/tampermonkey/Extention/Bouton_Test_OK_Platine.js
// @require      https://raw.githubusercontent.com/CreatureNoire/TamperMonkey/refs/heads/master/tampermonkey/Extention/Prise_En_Main_Platine_08663935.js
// @require      https://raw.githubusercontent.com/CreatureNoire/TamperMonkey/refs/heads/master/tampermonkey/Extention/RebutCause.js
// @updateURL    https://raw.githubusercontent.com/CreatureNoire/TamperMonkey/refs/heads/master/tampermonkey/Script%20Principal/mainScriptCollector.user.js
// @downloadURL  https://raw.githubusercontent.com/CreatureNoire/TamperMonkey/refs/heads/master/tampermonkey/Script%20Principal/mainScriptCollector.user.js
// @grant        GM_info
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// ==/UserScript==

(function () {
    'use strict';

    const BOUTONS_KEYS = {
        buttons: 'customButtonsConfig',
        colors: 'customButtonsColors'
    };

    const REX_KEYS = {
        copies: 'formCopies',
        order: 'buttonOrder'
    };

    // ========================================
    // CONFIG AUTO-EXPORT
    // ========================================
    let autoExportFileName = GM_getValue('collectorAutoExportFileName', 'CollectorExport');
    let autoExportEnabled = GM_getValue('collectorAutoExportEnabled', false);
    let autoExportIntervalId = null;
    let lastAutoExportTime = GM_getValue('collectorLastAutoExportTime', null);
    let autoExportDirHandle = null;
    let autoExportDirName = GM_getValue('collectorAutoExportDirName', '');
    const AUTO_EXPORT_INTERVAL_MS = 3 * 60 * 60 * 1000; // 3H

    // ── IndexedDB : persister le FileSystemDirectoryHandle ──
    const COL_IDB_NAME = 'CollectorAutoExportDB';
    const COL_IDB_STORE = 'dirHandles';
    const COL_IDB_KEY = 'autoExportDirHandle';

    function openColIDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(COL_IDB_NAME, 1);
            request.onupgradeneeded = (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains(COL_IDB_STORE)) {
                    db.createObjectStore(COL_IDB_STORE);
                }
            };
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async function saveDirHandleToIDB(handle) {
        try {
            const db = await openColIDB();
            const tx = db.transaction(COL_IDB_STORE, 'readwrite');
            tx.objectStore(COL_IDB_STORE).put(handle, COL_IDB_KEY);
            await new Promise((resolve, reject) => {
                tx.oncomplete = resolve;
                tx.onerror = () => reject(tx.error);
            });
            db.close();
            console.log('💾 [Collector] DirHandle sauvegardé dans IndexedDB');
        } catch (err) {
            console.warn('⚠️ [Collector] Impossible de sauvegarder le DirHandle dans IDB:', err);
        }
    }

    async function loadDirHandleFromIDB() {
        try {
            const db = await openColIDB();
            const tx = db.transaction(COL_IDB_STORE, 'readonly');
            const store = tx.objectStore(COL_IDB_STORE);
            const request = store.get(COL_IDB_KEY);
            const handle = await new Promise((resolve, reject) => {
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            });
            db.close();
            return handle || null;
        } catch (err) {
            console.warn('⚠️ [Collector] Impossible de charger le DirHandle depuis IDB:', err);
            return null;
        }
    }

    async function restoreDirHandle() {
        if (autoExportDirHandle) return;
        const handle = await loadDirHandleFromIDB();
        if (!handle) return;
        try {
            const perm = await handle.queryPermission({ mode: 'readwrite' });
            if (perm === 'granted') {
                autoExportDirHandle = handle;
                console.log('✅ [Collector] DirHandle restauré depuis IDB → ' + handle.name);
            } else if (perm === 'prompt') {
                autoExportDirHandle = handle;
                console.log('⏳ [Collector] DirHandle restauré (permission en attente) → ' + handle.name);
            }
        } catch (err) {
            console.warn('⚠️ [Collector] DirHandle invalide, ignoré:', err);
        }
    }

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

    function exportAll() {
        const payload = {
            version: 1,
            exportedAt: new Date().toISOString(),
            type: 'collector-full',
            boutons: {
                buttons: JSON.parse(localStorage.getItem(BOUTONS_KEYS.buttons) || '[]'),
                colors: JSON.parse(localStorage.getItem(BOUTONS_KEYS.colors) || 'null')
            },
            rex: {
                copies: JSON.parse(localStorage.getItem(REX_KEYS.copies) || '{}'),
                order: JSON.parse(localStorage.getItem(REX_KEYS.order) || '[]')
            }
        };
        const dateStamp = payload.exportedAt.slice(0, 10);
        downloadJsonFile(payload, `collector-export-${dateStamp}.json`);
        showNotification('✅ Export Collector terminé (Boutons + REX).');
    }

    function importAll() {
        openJsonFilePicker((data) => {
            if (!data || data.type !== 'collector-full' || !data.boutons || !data.rex) {
                alert('❌ JSON Collector invalide. Assurez-vous d\'utiliser un fichier exporté depuis ce script.');
                return;
            }

            const confirmOverwrite = confirm(
                'Importer va remplacer TOUTE votre configuration actuelle :\n' +
                '• Boutons Modifiables\n' +
                '• Copie REX\n\n' +
                'Continuer ?'
            );
            if (!confirmOverwrite) return;

            // Import Boutons
            if (Array.isArray(data.boutons.buttons)) {
                localStorage.setItem(BOUTONS_KEYS.buttons, JSON.stringify(data.boutons.buttons));
            }
            if (data.boutons.colors) {
                localStorage.setItem(BOUTONS_KEYS.colors, JSON.stringify(data.boutons.colors));
            }

            // Import REX
            if (typeof data.rex.copies === 'object') {
                localStorage.setItem(REX_KEYS.copies, JSON.stringify(data.rex.copies));
            }
            if (Array.isArray(data.rex.order)) {
                localStorage.setItem(REX_KEYS.order, JSON.stringify(data.rex.order));
            }

            alert('✅ Import Collector terminé (Boutons + REX). La page va être rechargée.');
            location.reload();
        });
    }

    // ========================================
    // NOTIFICATION VISUELLE
    // ========================================
    function showNotification(message, isError = false) {
        const notif = document.createElement('div');
        notif.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 100002;
            padding: 14px 22px;
            border-radius: 10px;
            font-size: 14px;
            font-weight: 600;
            font-family: 'Montserrat', 'Segoe UI', sans-serif;
            color: #fff;
            background: ${isError ? 'linear-gradient(135deg, #5f1e1e, #802a2a)' : 'linear-gradient(135deg, #1a2a1a, #2a4a2a)'};
            border: 1px solid ${isError ? 'rgba(255,100,100,0.3)' : 'rgba(74,222,128,0.3)'};
            box-shadow: 0 8px 32px rgba(0,0,0,0.4);
            animation: fadeInCollectorNotif 0.3s ease;
            pointer-events: none;
        `;
        notif.textContent = message;

        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeInCollectorNotif { from { opacity:0; transform:translateX(40px); } to { opacity:1; transform:translateX(0); } }
            @keyframes fadeOutCollectorNotif { from { opacity:1; transform:translateX(0); } to { opacity:0; transform:translateX(40px); } }
        `;
        notif.appendChild(style);
        document.body.appendChild(notif);

        setTimeout(() => {
            notif.style.animation = 'fadeOutCollectorNotif 0.3s ease forwards';
            setTimeout(() => notif.remove(), 300);
        }, 3000);
    }

    // ========================================
    // AUTO-EXPORT AUTOMATIQUE (TOUTES LES 3H)
    // ========================================
    async function performAutoExport() {
        if (!autoExportEnabled) return;

        // Tenter de restaurer le handle depuis IndexedDB si absent
        if (!autoExportDirHandle && autoExportDirName) {
            await restoreDirHandle();
        }

        // Si le handle est restauré, tenter de demander la permission
        if (autoExportDirHandle) {
            try {
                const perm = await autoExportDirHandle.queryPermission({ mode: 'readwrite' });
                if (perm !== 'granted') {
                    const req = await autoExportDirHandle.requestPermission({ mode: 'readwrite' });
                    if (req !== 'granted') {
                        console.warn('⚠️ [Collector] Permission refusée pour le dossier, fallback téléchargement');
                        autoExportDirHandle = null;
                    }
                }
            } catch (err) {
                console.warn('⚠️ [Collector] Erreur de permission, fallback téléchargement:', err);
                autoExportDirHandle = null;
            }
        }

        const payload = {
            version: 1,
            exportedAt: new Date().toISOString(),
            type: 'collector-full',
            boutons: {
                buttons: JSON.parse(localStorage.getItem(BOUTONS_KEYS.buttons) || '[]'),
                colors: JSON.parse(localStorage.getItem(BOUTONS_KEYS.colors) || 'null')
            },
            rex: {
                copies: JSON.parse(localStorage.getItem(REX_KEYS.copies) || '{}'),
                order: JSON.parse(localStorage.getItem(REX_KEYS.order) || '[]')
            }
        };

        const dateStamp = new Date().toISOString().slice(0, 10);
        const timeStamp = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }).replace(':', 'h');
        const fileName = `${autoExportFileName}_${dateStamp}_${timeStamp}.json`;
        const jsonData = JSON.stringify(payload, null, 2);

        if (autoExportDirHandle) {
            autoExportDirHandle.getFileHandle(fileName, { create: true })
                .then(fileHandle => fileHandle.createWritable())
                .then(writable => writable.write(jsonData).then(() => writable.close()))
                .then(() => {
                    lastAutoExportTime = new Date().toISOString();
                    GM_setValue('collectorLastAutoExportTime', lastAutoExportTime);
                    console.log('✅ [Collector] Auto-export direct réussi → ' + autoExportDirName + '/' + fileName);
                    showExportPanel('✅ Export réussi !', '📂 ' + autoExportDirName + ' → ' + fileName, lastAutoExportTime);
                })
                .catch(err => {
                    console.warn('⚠️ [Collector] Écriture directe échouée, fallback téléchargement:', err);
                    downloadJsonFile(payload, fileName);
                    lastAutoExportTime = new Date().toISOString();
                    GM_setValue('collectorLastAutoExportTime', lastAutoExportTime);
                    showExportPanel('⚠️ Dossier inaccessible — téléchargé', '📥 ' + fileName, lastAutoExportTime);
                });
        } else {
            downloadJsonFile(payload, fileName);
            lastAutoExportTime = new Date().toISOString();
            GM_setValue('collectorLastAutoExportTime', lastAutoExportTime);
            console.log('✅ [Collector] Auto-export téléchargé → ' + fileName);
            showExportPanel('✅ Export réussi !', '📥 Téléchargé → ' + fileName, lastAutoExportTime);
        }
    }

    // Panel persistant après un export
    function showExportPanel(title, detail, timestamp) {
        const existing = document.getElementById('collector-export-success-panel');
        if (existing) existing.remove();

        const timeStr = new Date(timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const dateStr = new Date(timestamp).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });

        const panel = document.createElement('div');
        panel.id = 'collector-export-success-panel';
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
            font-family: 'Montserrat', 'Segoe UI', sans-serif;
            animation: slideInCollectorExportPanel 0.3s ease;
            display: flex;
            flex-direction: column;
            gap: 6px;
        `;

        panel.innerHTML = `
            <style>
                @keyframes slideInCollectorExportPanel {
                    from { transform: translateX(100px); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOutCollectorExportPanel {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100px); opacity: 0; }
                }
                #collector-export-success-panel .panel-header {
                    display: flex; align-items: center; justify-content: space-between;
                }
                #collector-export-success-panel .panel-title {
                    font-size: 15px; font-weight: 700; color: #4ade80;
                }
                #collector-export-success-panel .panel-close {
                    background: none; border: none; color: #888; font-size: 20px;
                    cursor: pointer; padding: 2px 6px; border-radius: 6px;
                    transition: all 0.2s; line-height: 1;
                }
                #collector-export-success-panel .panel-close:hover {
                    background: rgba(255,255,255,0.1); color: #fff;
                }
                #collector-export-success-panel .panel-detail {
                    font-size: 13px; color: #b0d0b0; word-break: break-all;
                }
                #collector-export-success-panel .panel-time {
                    font-size: 11px; color: #667; margin-top: 2px;
                }
                #collector-export-success-panel .panel-bar {
                    height: 3px; background: rgba(74, 222, 128, 0.3);
                    border-radius: 3px; margin-top: 6px; overflow: hidden;
                }
                #collector-export-success-panel .panel-bar-fill {
                    height: 100%; background: #4ade80; border-radius: 3px; width: 100%;
                }
            </style>
            <div class="panel-header">
                <span class="panel-title">${title}</span>
                <button class="panel-close" id="collector-export-panel-close-btn" title="Fermer">✕</button>
            </div>
            <div class="panel-detail">${detail}</div>
            <div class="panel-time">🕐 ${dateStr} à ${timeStr}</div>
            <div class="panel-bar"><div class="panel-bar-fill"></div></div>
        `;

        document.body.appendChild(panel);

        document.getElementById('collector-export-panel-close-btn').addEventListener('click', () => {
            panel.style.animation = 'slideOutCollectorExportPanel 0.25s ease forwards';
            setTimeout(() => panel.remove(), 250);
        });
    }

    // Démarrer / Arrêter le timer d'auto-export
    function startAutoExportTimer() {
        if (autoExportIntervalId) clearInterval(autoExportIntervalId);
        if (autoExportEnabled) {
            // Si jamais aucun export n'a eu lieu, initialiser le point de départ à maintenant
            if (!lastAutoExportTime) {
                lastAutoExportTime = new Date().toISOString();
                GM_setValue('collectorLastAutoExportTime', lastAutoExportTime);
            }

            const elapsed = Date.now() - new Date(lastAutoExportTime).getTime();
            if (elapsed >= AUTO_EXPORT_INTERVAL_MS) {
                performAutoExport();
            }

            autoExportIntervalId = setInterval(performAutoExport, AUTO_EXPORT_INTERVAL_MS);
            console.log('⏱️ [Collector] Auto-export activé : toutes les 3h → fichier:', autoExportFileName);
        }
    }

    function stopAutoExportTimer() {
        if (autoExportIntervalId) {
            clearInterval(autoExportIntervalId);
            autoExportIntervalId = null;
        }
    }

    // ========================================
    // PANNEAU MODAL EXPORT / IMPORT
    // ========================================

    function openExportImportPanel() {
        const old = document.getElementById('modal-collector-export-import');
        if (old) old.remove();

        const modal = document.createElement('div');
        modal.id = 'modal-collector-export-import';
        modal.style.cssText = `
            position: fixed;
            inset: 0;
            z-index: 100000;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(0, 0, 0, 0.6);
            backdrop-filter: blur(4px);
            animation: fadeInCollectorPanel 0.2s ease;
        `;

        modal.innerHTML = `
            <style>
                @keyframes fadeInCollectorPanel { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideUpCollectorPanel { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

                #collector-export-import-box {
                    background: #1e1e1e;
                    border-radius: 16px;
                    padding: 28px 32px;
                    min-width: 460px;
                    max-width: 540px;
                    max-height: 80vh;
                    overflow-y: auto;
                    box-shadow: 0 20px 60px rgba(0,0,0,0.5);
                    border: 1px solid rgba(255,128,0,0.3);
                    animation: slideUpCollectorPanel 0.3s ease;
                    font-family: 'Montserrat', 'Segoe UI', sans-serif;
                    color: #e0e0e0;
                }

                /* Scrollbar personnalisée */
                #collector-export-import-box::-webkit-scrollbar { width: 6px; }
                #collector-export-import-box::-webkit-scrollbar-track { background: transparent; }
                #collector-export-import-box::-webkit-scrollbar-thumb { background: rgba(255,128,0,0.3); border-radius: 3px; }
                #collector-export-import-box::-webkit-scrollbar-thumb:hover { background: rgba(255,128,0,0.5); }

                #collector-export-import-box h2 {
                    margin: 0 0 6px 0;
                    font-size: 20px;
                    color: #fff;
                }
                #collector-export-import-box .cei-subtitle {
                    font-size: 13px;
                    color: #888;
                    margin-bottom: 20px;
                }
                #collector-export-import-box .cei-info {
                    background: rgba(255, 128, 0, 0.08);
                    border: 1px solid rgba(255, 128, 0, 0.2);
                    border-radius: 8px;
                    padding: 10px 14px;
                    font-size: 12px;
                    color: #e0a060;
                    margin-bottom: 20px;
                    line-height: 1.5;
                }

                /* Section déroulante */
                .cei-section {
                    border: 1px solid rgba(255,255,255,0.08);
                    border-radius: 10px;
                    margin-bottom: 12px;
                    overflow: hidden;
                    transition: border-color 0.3s;
                }
                .cei-section:hover {
                    border-color: rgba(255,128,0,0.3);
                }
                .cei-section-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 14px 16px;
                    cursor: pointer;
                    background: #252525;
                    user-select: none;
                    transition: background 0.2s;
                }
                .cei-section-header:hover {
                    background: #2a2a2a;
                }
                .cei-section-title {
                    font-size: 15px;
                    font-weight: 600;
                    color: #fff;
                }
                .cei-section-arrow {
                    font-size: 12px;
                    color: #888;
                    transition: transform 0.3s ease;
                }
                .cei-section.open .cei-section-arrow {
                    transform: rotate(180deg);
                }
                .cei-section-body {
                    max-height: 0;
                    overflow: hidden;
                    transition: max-height 0.35s ease, padding 0.35s ease;
                    padding: 0 16px;
                    background: #1e1e1e;
                }
                .cei-section.open .cei-section-body {
                    max-height: 600px;
                    padding: 16px;
                }

                /* Boutons export/import */
                .cei-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    width: 100%;
                    padding: 12px 18px;
                    margin-bottom: 10px;
                    border: none;
                    border-radius: 10px;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                    font-family: 'Montserrat', 'Segoe UI', sans-serif;
                }
                .cei-btn:last-child { margin-bottom: 0; }
                .cei-btn:hover {
                    filter: brightness(1.15);
                    transform: translateY(-1px);
                }
                .cei-btn:active {
                    transform: translateY(0);
                }
                .cei-btn-export {
                    background: linear-gradient(135deg, #1e3a5f, #2a5080);
                    color: #7db8f0;
                }
                .cei-btn-import {
                    background: linear-gradient(135deg, #3a1e5f, #502a80);
                    color: #c0a0f0;
                }

                /* Bouton fermer */
                .cei-close-btn {
                    display: block;
                    width: 100%;
                    padding: 12px;
                    margin-top: 8px;
                    border: none;
                    border-radius: 10px;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    background: #333;
                    color: #ccc;
                    transition: all 0.2s;
                    font-family: 'Montserrat', 'Segoe UI', sans-serif;
                }
                .cei-close-btn:hover {
                    background: #444;
                }

                /* Auto-export styles */
                .cei-auto-info {
                    background: rgba(74, 222, 128, 0.08);
                    border: 1px solid rgba(74, 222, 128, 0.2);
                    border-radius: 8px;
                    padding: 10px 14px;
                    font-size: 12px;
                    color: #7dd3a0;
                    margin-bottom: 14px;
                    line-height: 1.5;
                }
                .cei-field-label {
                    display: block;
                    font-size: 13px;
                    margin-bottom: 6px;
                    color: #bbb;
                    font-weight: 600;
                }
                .cei-input {
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
                    font-family: 'Montserrat', 'Segoe UI', sans-serif;
                }
                .cei-input:focus {
                    border-color: #ff8000;
                }
                .cei-input::placeholder {
                    color: #666;
                }
                .cei-hint {
                    font-size: 11px;
                    color: #666;
                    margin-bottom: 14px;
                    font-style: italic;
                }
                .cei-preview {
                    font-size: 11px;
                    color: #777;
                    margin-bottom: 14px;
                    font-style: italic;
                }
                .cei-btn-browse {
                    padding: 10px 16px;
                    border: none;
                    border-radius: 8px;
                    font-size: 13px;
                    font-weight: 600;
                    cursor: pointer;
                    background: #3a3a5c;
                    color: #c0c0ff;
                    transition: all 0.2s;
                    white-space: nowrap;
                    font-family: 'Montserrat', 'Segoe UI', sans-serif;
                }
                .cei-btn-browse:hover {
                    filter: brightness(1.15);
                }
                .cei-toggle-row {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 16px;
                }
                .cei-toggle-label {
                    font-size: 14px;
                    color: #ccc;
                }
                .cei-toggle {
                    position: relative;
                    width: 48px;
                    height: 26px;
                    cursor: pointer;
                }
                .cei-toggle input {
                    opacity: 0;
                    width: 0;
                    height: 0;
                }
                .cei-toggle-slider {
                    position: absolute;
                    inset: 0;
                    background: #444;
                    border-radius: 26px;
                    transition: background 0.3s;
                }
                .cei-toggle-slider:before {
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
                .cei-toggle input:checked + .cei-toggle-slider {
                    background: #ff8000;
                }
                .cei-toggle input:checked + .cei-toggle-slider:before {
                    transform: translateX(22px);
                }
                .cei-btn-save {
                    background: linear-gradient(135deg, #ff8000, #cc6600) !important;
                    color: #fff !important;
                }
                .cei-timer {
                    font-size: 11px;
                    font-weight: 600;
                    color: #4ade80;
                    background: rgba(74, 222, 128, 0.1);
                    border: 1px solid rgba(74, 222, 128, 0.2);
                    padding: 3px 8px;
                    border-radius: 6px;
                    margin-left: auto;
                    margin-right: 10px;
                    white-space: nowrap;
                    font-family: 'Consolas', 'Courier New', monospace;
                    letter-spacing: 0.5px;
                    min-width: 70px;
                    text-align: center;
                }
                .cei-timer.off {
                    color: #888;
                    background: rgba(255, 255, 255, 0.05);
                    border-color: rgba(255, 255, 255, 0.1);
                }
            </style>

            <div id="collector-export-import-box">
                <h2>📦 Export / Import — Collector</h2>
                <p class="cei-subtitle">Gérez vos sauvegardes de configuration</p>

                <div class="cei-info">
                    💡 Cliquez sur une section pour la déplier et accéder aux boutons <b>Exporter</b> / <b>Importer</b>.<br>
                    Raccourci : <b>Ctrl + Alt + R</b> pour rouvrir cette fenêtre.
                </div>

                <!-- ═══════ Section Auto-Export ═══════ -->
                <div class="cei-section open" data-section="auto-export">
                    <div class="cei-section-header">
                        <span class="cei-section-title">⏱️ Auto-Export Local (3H)</span>
                        <span id="cei-auto-timer" class="cei-timer">${autoExportEnabled ? '⏳ …' : '⏸️ OFF'}</span>
                        <span class="cei-section-arrow">▼</span>
                    </div>
                    <div class="cei-section-body">
                        <div class="cei-auto-info">
                            💾 Exporte automatiquement <b>Boutons + REX</b> sur votre PC toutes les 3 heures.<br>
                            ⚠️ Le timer ne tourne <b>que quand la page Collector est ouverte</b>. Si la page est fermée puis réouverte, un export se fera immédiatement si plus de 3h se sont écoulées.
                        </div>

                        <div id="cei-auto-last-export" class="cei-hint" style="margin-bottom:14px;color:#888;">
                            ${lastAutoExportTime
                                ? '📅 Dernier export : ' + new Date(lastAutoExportTime).toLocaleDateString('fr-FR') + ' à ' + new Date(lastAutoExportTime).toLocaleTimeString('fr-FR', {hour:'2-digit',minute:'2-digit'})
                                : '📅 Aucun export effectué pour le moment'}
                        </div>

                        <label class="cei-field-label">📂 Dossier de destination</label>
                        <div style="display:flex;gap:8px;align-items:center;margin-bottom:6px;">
                            <div id="cei-auto-path-display" style="flex:1;padding:10px 14px;border-radius:8px;border:1px solid rgba(255,255,255,0.15);background:#2a2a2a;color:#fff;font-size:13px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-height:20px;">${autoExportDirName ? '📁 ' + autoExportDirName : '<span style="color:#666;">Aucun dossier sélectionné</span>'}</div>
                            <button class="cei-btn-browse" id="cei-auto-btn-browse">📁 Parcourir…</button>
                        </div>
                        <div id="cei-auto-path-hint" class="cei-hint">
                            ${autoExportDirName ? '✅ Les fichiers seront enregistrés dans ce dossier' : 'Cliquez sur Parcourir pour choisir le dossier, sinon → Téléchargements'}
                        </div>

                        <label class="cei-field-label" for="cei-auto-filename-input">📄 Nom du fichier d'export</label>
                        <input type="text" class="cei-input" id="cei-auto-filename-input" placeholder="CollectorExport" value="${autoExportFileName.replace(/"/g, '&quot;')}" />
                        <div class="cei-preview" id="cei-auto-filename-preview">
                            Aperçu : ${autoExportFileName}_${new Date().toISOString().slice(0, 10)}_14h30.json
                        </div>

                        <div class="cei-toggle-row">
                            <span class="cei-toggle-label">⏱️ Activer l'auto-export toutes les 3H</span>
                            <label class="cei-toggle">
                                <input type="checkbox" id="cei-auto-enabled-toggle" ${autoExportEnabled ? 'checked' : ''} />
                                <span class="cei-toggle-slider"></span>
                            </label>
                        </div>

                        <button class="cei-btn cei-btn-save" id="cei-auto-btn-save">💾 Sauvegarder la configuration</button>
                    </div>
                </div>

                <!-- ═══════ Section Export / Import Manuel ═══════ -->
                <div class="cei-section" data-section="manuel">
                    <div class="cei-section-header">
                        <span class="cei-section-title">� Export / Import Manuel</span>
                        <span class="cei-section-arrow">▼</span>
                    </div>
                    <div class="cei-section-body">
                        <div class="cei-auto-info">
                            📋 Exporte ou importe <b>Boutons Modifiables + Copie REX</b> dans un seul fichier JSON.
                        </div>
                        <button class="cei-btn cei-btn-export" id="cei-btn-export-all">📤 Exporter tout (JSON)</button>
                        <button class="cei-btn cei-btn-import" id="cei-btn-import-all">📥 Importer tout (JSON)</button>
                    </div>
                </div>

                <button class="cei-close-btn" id="cei-btn-close">✖ Fermer</button>
            </div>
        `;

        document.body.appendChild(modal);

        // ── Timer countdown dans le header ──
        const timerEl = document.getElementById('cei-auto-timer');
        let timerInterval = null;

        function updateTimerDisplay() {
            if (!autoExportEnabled) {
                timerEl.textContent = '⏸️ OFF';
                timerEl.classList.add('off');
                return;
            }
            timerEl.classList.remove('off');

            if (!lastAutoExportTime) {
                timerEl.textContent = '⏳ 03:00:00';
                return;
            }

            const elapsed = Date.now() - new Date(lastAutoExportTime).getTime();
            const remaining = AUTO_EXPORT_INTERVAL_MS - elapsed;

            if (remaining <= 0) {
                timerEl.textContent = '🔄 Imminent';
                return;
            }

            const totalSec = Math.floor(remaining / 1000);
            const h = Math.floor(totalSec / 3600);
            const m = Math.floor((totalSec % 3600) / 60);
            const s = totalSec % 60;
            timerEl.textContent = '⏳ ' + String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
        }

        updateTimerDisplay();
        timerInterval = setInterval(updateTimerDisplay, 1000);

        // Nettoyer l'interval quand le modal est fermé
        const originalRemove = modal.remove.bind(modal);
        modal.remove = () => {
            if (timerInterval) clearInterval(timerInterval);
            originalRemove();
        };

        // Toggle sections déroulantes
        modal.querySelectorAll('.cei-section-header').forEach(header => {
            header.addEventListener('click', () => {
                header.parentElement.classList.toggle('open');
            });
        });

        // ── Auto-Export : Bouton Parcourir ──
        document.getElementById('cei-auto-btn-browse').addEventListener('click', async () => {
            if (typeof window.showDirectoryPicker === 'function') {
                try {
                    autoExportDirHandle = await window.showDirectoryPicker({ mode: 'readwrite' });
                    autoExportDirName = autoExportDirHandle.name;
                    GM_setValue('collectorAutoExportDirName', autoExportDirName);
                    await saveDirHandleToIDB(autoExportDirHandle);
                    document.getElementById('cei-auto-path-display').textContent = '📁 ' + autoExportDirName;
                    document.getElementById('cei-auto-path-hint').textContent = '✅ Les fichiers seront enregistrés dans ce dossier';
                    document.getElementById('cei-auto-path-hint').style.color = '#4ade80';
                    showNotification('📂 Dossier sélectionné : ' + autoExportDirName);
                } catch (err) {
                    if (err.name !== 'AbortError') {
                        console.error('❌ Erreur sélection dossier:', err);
                        showNotification('❌ Erreur lors de la sélection du dossier', true);
                    }
                }
            } else {
                showNotification('⚠️ Votre navigateur ne supporte pas le choix de dossier. Les fichiers iront dans vos Téléchargements.', true);
            }
        });

        // ── Auto-Export : Preview dynamique du nom ──
        const filenameInput = document.getElementById('cei-auto-filename-input');
        const filenamePreview = document.getElementById('cei-auto-filename-preview');
        filenameInput.addEventListener('input', () => {
            const name = filenameInput.value.trim() || 'CollectorExport';
            filenamePreview.textContent = 'Aperçu : ' + name + '_' + new Date().toISOString().slice(0, 10) + '_14h30.json';
        });

        // ── Auto-Export : Bouton Sauvegarder ──
        document.getElementById('cei-auto-btn-save').addEventListener('click', () => {
            const nameInput = document.getElementById('cei-auto-filename-input').value.trim();
            const enabledToggle = document.getElementById('cei-auto-enabled-toggle').checked;

            autoExportFileName = nameInput || 'CollectorExport';
            autoExportEnabled = enabledToggle;
            GM_setValue('collectorAutoExportFileName', autoExportFileName);
            GM_setValue('collectorAutoExportEnabled', autoExportEnabled);
            GM_setValue('collectorAutoExportDirName', autoExportDirName);

            if (autoExportEnabled) {
                startAutoExportTimer();
                const dest = autoExportDirName ? '📂 ' + autoExportDirName : '📥 Téléchargements';
                showNotification('✅ Auto-export activé ! → ' + dest + ' — Prochain dans 3h.');
                updateTimerDisplay();
            } else {
                stopAutoExportTimer();
                showNotification('⏸️ Auto-export désactivé.');
                updateTimerDisplay();
            }

            modal.remove();
        });

        // ── Export / Import Manuel (tout en 1) ──
        document.getElementById('cei-btn-export-all').addEventListener('click', () => {
            modal.remove();
            exportAll();
        });
        document.getElementById('cei-btn-import-all').addEventListener('click', () => {
            modal.remove();
            importAll();
        });

        // Bouton Fermer
        document.getElementById('cei-btn-close').addEventListener('click', () => {
            modal.remove();
        });

        // Fermer en cliquant en dehors
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
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

    // ========================================
    // RACCOURCI CLAVIER CTRL + ALT + R
    // ========================================
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.altKey && (e.key === 'r' || e.key === 'R')) {
            e.preventDefault();
            e.stopPropagation();
            openExportImportPanel();
        }
    });

    // ========================================
    // ENREGISTREMENT UNIQUE DU MENU TAMPERMONKEY
    // ========================================
    if (typeof GM_registerMenuCommand === 'function') {
        GM_registerMenuCommand('📦 Export / Import Collector', openExportImportPanel);
    }

    // ========================================
    // DÉMARRAGE AUTO-EXPORT AU BOOT
    // ========================================
    restoreDirHandle().then(() => {
        setTimeout(() => {
            if (autoExportEnabled) {
                startAutoExportTimer();
            }
        }, 2000);
    });
})();
