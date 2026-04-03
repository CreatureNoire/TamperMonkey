// ==UserScript==
// @name         Script Interface Agent
// @namespace    https://github.com/Syfrost/JustWork-Next-Extension
// @version      1.3
// @description  Charge plusieurs scripts distants
// @author       CréatureNoire

// @match       https://apps.powerapps.com/play/e/8ce66143-5dbc-4269-9f4f-16af25fd3458/a/9296f847-18c6-446c-8b67-1f3f273ceb12?tenantId=4a7c8238-5799-4b16-9fc6-9ad8fce5a7d9&hint=4d175901-0dee-4f52-9ee9-1c10e53675db&sourcetime=1773746207995
// @match       https://runtime-app.powerplatform.com/*


// @require      https://raw.githubusercontent.com/CreatureNoire/TamperMonkey/refs/heads/master/tampermonkey/Extention/Demande_étiquette.js
// @require      https://raw.githubusercontent.com/CreatureNoire/TamperMonkey/refs/heads/master/tampermonkey/Extention/MiseEnRebut.js
// @require      https://raw.githubusercontent.com/CreatureNoire/TamperMonkey/refs/heads/master/tampermonkey/Extention/Commande_Composant_SY.js
// @require      https://raw.githubusercontent.com/CreatureNoire/TamperMonkey/refs/heads/master/tampermonkey/Extention/copieFCA.js


// @grant        GM_info
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        unsafeWindow
// @grant        GM_registerMenuCommand
// @connect      *
// @run-at       document-idle

// ==/UserScript==
// @match        https://*.powerapps.com/*
// @match        runtime-app.powerplatform.com/*
// @match        runtime-app.powerapps.com/*

(function () {
    'use strict';

    const versionLocale = GM_info.script.version;
    const scriptURL = "https://github.com/CreatureNoire/TamperMonkey/blob/master/tampermonkey/Script%20Principal/mainScriptInterfaceAgent.user.js";

    console.log("[Script Interface Agent] Version locale :", versionLocale);
    console.log("[Script Interface Agent] Initialisation des extensions...");

    fetch(scriptURL)
        .then(r => r.text())
        .then(text => {
            const match = text.match(/@version\s+([^\n]+)/);
            if (match) {
                const versionDistante = match[1].trim();
                console.log("[Script Interface Agent] Version distante :", versionDistante);
                console.log("[Script Interface Agent] Version locale :", versionLocale);

                if (estNouvelleVersion(versionLocale, versionDistante)) {
                    console.log("[Script Interface Agent] ➕ Mise à jour disponible !");
                    afficherBoutonMAJ(versionDistante, scriptURL);
                } else {
                    console.log("[Script Interface Agent] ✅ Script à jour.");
                }
            } else {
                console.warn("[Script Interface Agent] ⚠️ Impossible de détecter la version distante.");
            }
        })
        .catch(err => console.error("[Script Interface Agent] ❌ Erreur récupération version distante :", err));

    function estNouvelleVersion(local, distante) {
        const toNum = v => v.split('.').map(Number);
        const [l, d] = [toNum(local), toNum(distante)];
        for (let i = 0; i < Math.max(l.length, d.length); i++) {
            const a = l[i] || 0, b = d[i] || 0;
            if (b > a) return true;
            if (b < a) return false;
        }
        return false;
    }

    function afficherBoutonMAJ(versionDistante, installUrl) {
        const container = document.querySelector('div[style*="position: fixed"][style*="bottom: 10px"][style*="right: 10px"]');
        if (!container || document.getElementById("btnMajScript")) return;

        const btn = document.createElement("button");
        btn.id = "btnMajScript";
        btn.innerText = `🆕 MAJ dispo (${versionDistante})`;
        btn.onclick = () => {
            alert("Une nouvelle version du script est disponible.\nUn nouvel onglet va s'ouvrir pour l'installation.");
            window.open(installUrl, "_blank");
        };

        // Récupérer le message du dernier commit via l'API GitHub
        fetch("https://api.github.com/repos/CreatureNoire/TamperMonkey/commits?path=tampermonkey/Script%20Principal/mainScriptInterfaceAgent.user.js")
            .then(res => res.json())
            .then(data => {
                if (data && data[0] && data[0].commit && data[0].commit.message) {
                    btn.title = data[0].commit.message; // Affiche le message au hover
                }
            })
            .catch(err => {
                console.warn("[Script Interface Agent] ⚠️ Erreur récupération commit :", err);
            });

        styleButton(btn, "#ffc107", "fa-arrow-up");
        container.appendChild(btn);
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
            console.log('[Script Interface Agent] 🔤 Police Montserrat injectée.');
        }
    }

    console.log('[Script Interface Agent] ✅ Toutes les extensions sont chargées.');
})();
