(function() {
    'use strict';

    // Liste des boutons disponibles
    const BOUTONS_DISPONIBLES = [
        { key: 'RP', label: 'RP', compteur: true },
        { key: 'RU', label: 'RU', compteur: true },
        { key: 'CP', label: 'CP', compteur: true },
        { key: 'RQ', label: 'RQ', compteur: true },
        { key: 'RN', label: 'RN', compteur: true }
    ];

    // Charger la config utilisateur (boutons à afficher)
    function chargerConfigBoutons() {
        const config = localStorage.getItem('optimum-boutons-utilisateur');
        if (config) {
            try {
                const arr = JSON.parse(config);
                if (Array.isArray(arr) && arr.length > 0) return arr;
            } catch {}
        }
        // Par défaut : tous les boutons
        return ['RP', 'RU', 'CP', 'RN'];
    }

    // Sauvegarder la config utilisateur
    function sauvegarderConfigBoutons(arr) {
        localStorage.setItem('optimum-boutons-utilisateur', JSON.stringify(arr));
    }

    // Menu de configuration (Ctrl+Alt+R)
    function ouvrirMenuConfigBoutons() {
        // Éviter doublon
        if (document.getElementById('optimum-boutons-config-popup')) return;

        const boutonsActifs = chargerConfigBoutons();

        const overlay = document.createElement('div');
        overlay.id = 'optimum-boutons-config-popup';
        overlay.style.cssText = `
            position: fixed; inset: 0; z-index: 99999;
            background: rgba(0,0,0,0.55);
            display: flex; align-items: center; justify-content: center;
            font-family: 'Segoe UI', Arial, sans-serif;
        `;

        let html = `<div style="background: #1e1e2e; color: #cdd6f4; border-radius: 16px; padding: 32px 36px; box-shadow: 0 8px 40px rgba(0,0,0,0.7); min-width: 340px; max-width: 420px; border: 1px solid rgba(139,92,246,0.4);">
            <div style="font-size:1.2rem; font-weight:700; margin-bottom:8px; color:#cba6f7;">⚙️ Configuration des boutons</div>
            <div style="font-size:0.95rem; color:#a6adc8; margin-bottom:18px;">Cochez les boutons à afficher :</div>
            <form id='optimum-boutons-form'>`;
        BOUTONS_DISPONIBLES.forEach(b => {
            html += `<label style='display:flex;align-items:center;margin-bottom:8px;gap:8px;'><input type='checkbox' name='btn' value='${b.key}' ${boutonsActifs.includes(b.key) ? 'checked' : ''} style='accent-color:#b4befe;width:18px;height:18px;'> <span style='font-size:1.05rem;'>${b.label}</span></label>`;
        });
        html += `</form>
            <div style='display:flex;gap:12px;justify-content:flex-end;margin-top:18px;'>
                <button id='optimum-boutons-cancel' style='padding:9px 20px;border-radius:8px;border:1px solid rgba(139,92,246,0.3);background:transparent;color:#a6adc8;cursor:pointer;font-size:0.9rem;'>Annuler</button>
                <button id='optimum-boutons-save' style='padding:9px 22px;border-radius:8px;border:none;background:linear-gradient(135deg, hsl(260,97%,50%), hsl(280,90%,65%));color:white;cursor:pointer;font-size:0.9rem;font-weight:600;'>Enregistrer</button>
            </div>
        </div>`;
        overlay.innerHTML = html;
        document.body.appendChild(overlay);

        document.getElementById('optimum-boutons-cancel').onclick = () => document.body.removeChild(overlay);
        document.getElementById('optimum-boutons-save').onclick = () => {
            const checked = Array.from(document.querySelectorAll('#optimum-boutons-form input[type=checkbox]:checked')).map(i => i.value);
            if (checked.length === 0) {
                alert('Sélectionnez au moins un bouton !');
                return;
            }
            sauvegarderConfigBoutons(checked);
            document.body.removeChild(overlay);
            removeCustomButtons();
            insertButtons();
        };
    }

    // Raccourci clavier Ctrl+Alt+R pour ouvrir le menu
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.altKey && e.key.toLowerCase() === 'r') {
            ouvrirMenuConfigBoutons();
        }
    });

    // Ajouter le CSS moderne pour les boutons
    const style = document.createElement('style');
    style.textContent = `
        /* Style moderne des boutons avec effet glow */
        .modern-button {
            --black-700: hsla(0 0% 12% / 1);
            --border_radius: 9999px;
            --transtion: 0.3s ease-in-out;
            --offset: 2px;
            cursor: pointer;
            position: relative;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            transform-origin: center;
            padding: 0.5rem 1rem;
            background-color: transparent;
            border: none;
            border-radius: var(--border_radius);
            transform: scale(calc(1 + (var(--active, 0) * 0.05)));
            transition: transform var(--transtion);
        }

        .modern-button::before {
            content: "";
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 100%;
            height: 100%;
            background-color: inherit;
            border-radius: var(--border_radius);
            box-shadow: inset 0 0.5px hsla(255, 255%, 255%, 0.2), inset 0 -1px 2px 0 hsla(0, 0%, 0%, 0.3),
                0px 4px 10px -4px hsla(0 0% 0% / calc(1 - var(--active, 0))),
                0 0 0 calc(var(--active, 0) * 0.2rem) hsl(260 97% 50% / 0.5);
            transition: all var(--transtion);
            z-index: 0;
        }

        .modern-button::after {
            content: "";
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 100%;
            height: 100%;
            background-color: hsla(260 97% 61% / 0.4);
            background-image: radial-gradient(at 51% 89%, hsla(266, 45%, 74%, 0.6) 0px, transparent 50%),
                radial-gradient(at 100% 100%, hsla(266, 36%, 60%, 0.5) 0px, transparent 50%),
                radial-gradient(at 22% 91%, hsla(266, 36%, 60%, 0.5) 0px, transparent 50%);
            background-position: top;
            opacity: var(--active, 0);
            border-radius: var(--border_radius);
            transition: opacity var(--transtion);
            z-index: 2;
        }

        .modern-button:is(:hover, :focus-visible) {
            --active: 1;
        }

        .modern-button:active {
            transform: scale(1);
        }

        .modern-button .dots_border {
            --size_border: calc(100% + 2px);
            overflow: hidden;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: var(--size_border);
            height: var(--size_border);
            background-color: transparent;
            border-radius: var(--border_radius);
            z-index: -10;
        }

        .modern-button .dots_border::before {
            content: "";
            position: absolute;
            top: 30%;
            left: 50%;
            transform: translate(-50%, -50%);
            transform-origin: left;
            transform: rotate(0deg);
            width: 100%;
            height: 2rem;
            background-color: white;
            mask: linear-gradient(transparent 0%, white 120%);
            animation: rotate 2s linear infinite;
        }

        @keyframes rotate {
            to { transform: rotate(360deg); }
        }

        .modern-button .sparkle {
            position: relative;
            z-index: 10;
            width: 1.5rem;
            height: 1.5rem;
        }

        .modern-button .sparkle .path {
            fill: currentColor;
            stroke: currentColor;
            transform-origin: center;
            color: hsl(0, 0%, 100%);
        }

        .modern-button:is(:hover, :focus) .sparkle .path {
            animation: path 1.5s linear 0.5s infinite;
        }

        .modern-button .sparkle .path:nth-child(1) {
            --scale_path_1: 1.2;
        }
        .modern-button .sparkle .path:nth-child(2) {
            --scale_path_2: 1.2;
        }
        .modern-button .sparkle .path:nth-child(3) {
            --scale_path_3: 1.2;
        }

        @keyframes path {
            0%, 34%, 71%, 100% {
                transform: scale(1);
            }
            17% {
                transform: scale(var(--scale_path_1, 1));
            }
            49% {
                transform: scale(var(--scale_path_2, 1));
            }
            83% {
                transform: scale(var(--scale_path_3, 1));
            }
        }

        .modern-button .text_button {
            position: relative;
            z-index: 10;
            background-image: linear-gradient(90deg, hsla(0 0% 100% / 1) 0%, hsla(0 0% 100% / var(--active, 0)) 120%);
            background-clip: text;
            -webkit-background-clip: text;
            font-size: 0.85rem;
            font-weight: 500;
            color: white;
        }

        .modern-button-wrapper {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 8px;
            margin: 0 4px;
        }

        .modern-button-solde {
            font-size: 11px;
            font-weight: bold;
            color: #333;
            min-height: 15px;
            text-align: center;
            padding: 2px 8px;
            background: transparent;
            border-radius: 12px;
        }

        .modern-loading-spinner {
            display: inline-block;
            width: 12px;
            height: 12px;
            border: 2px solid rgba(138, 43, 226, 0.3);
            border-radius: 50%;
            border-top-color: hsl(260, 97%, 50%);
            animation: spinner-rotation 0.6s linear infinite;
        }

        @keyframes spinner-rotation {
            to { transform: rotate(360deg); }
        }

        .valeur-cp-calendrier {
            color: #dc3545;
            font-size: 11px;
            font-weight: bold;
            text-align: center;
            padding: 2px 8px;
            background: rgba(220, 53, 69, 0.1);
            border-radius: 8px;
            margin-top: 4px;
            cursor: help;
        }
    `;
    document.head.appendChild(style);

    // Fonction pour attendre que l'élément soit présent dans le DOM
    function waitForElement(selector, callback, maxAttempts = 50) {
        let attempts = 0;
        const checkExist = setInterval(function() {
            const element = document.querySelector(selector);
            if (element) {
                clearInterval(checkExist);
                callback(element);
            } else if (attempts >= maxAttempts) {
                clearInterval(checkExist);
                console.log('Element non trouvé après plusieurs tentatives:', selector);
            }
            attempts++;
        }, 200);
    }

    // Fonction pour créer un bouton avec affichage du solde
    function createButton(text, className, isAbsence = false, motifText = null) {
        // Créer un conteneur pour le bouton et le solde
        const wrapper = document.createElement('div');
        wrapper.className = 'modern-button-wrapper';

        const button = document.createElement('button');
        button.type = 'button';
        button.className = `modern-button ${className}`;

        // Définir une couleur de fond par défaut (sera remplacée par le script Calendrier couleur.js)
        button.style.backgroundColor = '#6c757d'; // Gris par défaut
        button.style.color = 'white';

        // Créer la structure HTML sans icône sparkle
        button.innerHTML = `
            <div class="dots_border"></div>
            <span class="text_button">${text}</span>
        `;

        // Créer l'élément pour afficher le solde
        const soldeDisplay = document.createElement('div');
        soldeDisplay.className = `solde-display-${text.toLowerCase()} modern-button-solde`;

        // Ajouter un spinner de chargement
        const spinner = document.createElement('div');
        spinner.className = 'modern-loading-spinner';
        soldeDisplay.appendChild(spinner);

        wrapper.appendChild(button);
        wrapper.appendChild(soldeDisplay);

        // Ajouter l'événement de clic
        button.addEventListener('click', function() {
            console.log(`Bouton ${text} cliqué`);
            const codeMotif = motifText || text;
            console.log(`➡️ motifText="${motifText}", text="${text}", codeMotif utilisé="${codeMotif}"`);
            if (isAbsence) {
                createAbsence(codeMotif);
            } else {
                createRegularisation(codeMotif);
            }
        });

        return wrapper;
    }

    // Fonction pour créer l'affichage du solde RN (sans bouton)
    function createRNDisplay() {
        const wrapper = document.createElement('div');
        wrapper.className = 'modern-button-wrapper';
        wrapper.style.cssText = 'flex-direction: row; gap: 8px;';

        // Label RN avec style moderne
        const label = document.createElement('div');
        label.textContent = 'RN :';
        label.style.cssText = 'font-size: 13px; font-weight: 600; color: #333; display: flex; align-items: center;';

        // Affichage du solde
        const soldeDisplay = document.createElement('div');
        soldeDisplay.className = 'solde-display-rn modern-button-solde';

        // Ajouter un spinner de chargement
        const spinner = document.createElement('div');
        spinner.className = 'modern-loading-spinner';
        soldeDisplay.appendChild(spinner);

        wrapper.appendChild(label);
        wrapper.appendChild(soldeDisplay);

        return wrapper;
    }

    // Fonction pour exécuter les trois requêtes API séquentiellement
    async function executeApiRequests() {
        console.log('🚀 Début de l\'exécution des requêtes API...');

        try {
            // Récupérer le x_token_key depuis les cookies ou le header
            const xTokenKey = getTokenKey();
            if (!xTokenKey) {
                console.error('❌ Token x_token_key non trouvé');
                return;
            }

            console.log('✅ Token trouvé:', xTokenKey);

            // Première requête - Récupération des groupes
            console.log('📡 [1/3] Exécution de la première requête (groupes)...');
            const response1 = await fetch('https://optimum.sncf.fr/chronotime/rest/resultatsgroupecpt/groupes/33?index=1&nbrang=75', {
                method: 'GET',
                headers: {
                    'accept': 'application/json',
                    'content-type': 'application/json',
                    'gfi-context': '{"onglet": "gmsituation", "fonc_cour": "COL_SITUVAL.V", "nat_gest": ""}',
                    'x_token_key': xTokenKey
                },
                credentials: 'include'
            });

            if (!response1.ok) {
                throw new Error(`Erreur requête 1: ${response1.status}`);
            }

            const data1 = await response1.json();
            console.log('✅ Réponse requête 1 (groupes):', data1);

            // Deuxième requête - Configuration
            console.log('📡 [2/3] Exécution de la deuxième requête (config)...');
            const response2 = await fetch('https://optimum.sncf.fr/chronotime/rest/resultatsgroupecpt/config', {
                method: 'GET',
                headers: {
                    'accept': 'application/json',
                    'content-type': 'application/json',
                    'gfi-context': '{"onglet": "gmsituation", "fonc_cour": "COL_SITUVAL.V", "nat_gest": ""}',
                    'x_token_key': xTokenKey
                },
                credentials: 'include'
            });

            if (!response2.ok) {
                throw new Error(`Erreur requête 2: ${response2.status}`);
            }

            const data2 = await response2.json();
            console.log('✅ Réponse requête 2 (config):', data2);

            // Récupérer le matricule depuis les données ou l'utilisateur
            const matricule = getMatricule();
            const groupe = 'MS_C'; // Groupe par défaut
            const dateEndOfYear = getEndOfYearDate(); // Dernier jour de l'année au format YYYYMMDD
            const dateToday = getFormattedDate(); // Date d'aujourd'hui au format YYYYMMDD

            // Troisième requête - Détails des compteurs (fin d'année pour RP, RU, CP)
            console.log(`📡 [3/4] Exécution de la troisième requête (détails fin d'année pour RP, RU, CP)...`);
            console.log(`   Paramètres: matricule=${matricule}, groupe=${groupe}, date=${dateEndOfYear} (31/12)`);

            const response3 = await fetch(`https://optimum.sncf.fr/chronotime/rest/resultatsgroupecpt?matricule=${matricule}&groupe=${groupe}&date=${dateEndOfYear}`, {
                method: 'GET',
                headers: {
                    'accept': 'application/json',
                    'content-type': 'application/json',
                    'gfi-context': '{"onglet": "gmsituation", "fonc_cour": "COL_SITUVAL.V", "nat_gest": ""}',
                    'x_token_key': xTokenKey
                },
                credentials: 'include'
            });

            if (!response3.ok) {
                throw new Error(`Erreur requête 3: ${response3.status}`);
            }

            const data3 = await response3.json();

            // Quatrième requête - Détails RN à la date d'aujourd'hui
            console.log(`📡 [4/4] Exécution de la quatrième requête (RN aujourd'hui)...`);
            console.log(`   Paramètres: matricule=${matricule}, groupe=${groupe}, date=${dateToday} (aujourd'hui)`);

            const response4 = await fetch(`https://optimum.sncf.fr/chronotime/rest/resultatsgroupecpt?matricule=${matricule}&groupe=${groupe}&date=${dateToday}`, {
                method: 'GET',
                headers: {
                    'accept': 'application/json',
                    'content-type': 'application/json',
                    'gfi-context': '{"onglet": "gmsituation", "fonc_cour": "COL_SITUVAL.V", "nat_gest": ""}',
                    'x_token_key': xTokenKey
                },
                credentials: 'include'
            });

            if (!response4.ok) {
                throw new Error(`Erreur requête 4: ${response4.status}`);
            }

            const data4 = await response4.json();

            // Affichage détaillé des résultats dans la console
            console.log('');
            console.log('═══════════════════════════════════════════════════════════');
            console.log('           📊 RÉSULTATS DES REQUÊTES API                  ');
            console.log('═══════════════════════════════════════════════════════════');
            console.log('');
            console.log('📦 Requête 1 (Groupes):', data1);
            console.log('');
            console.log('⚙️  Requête 2 (Config):', data2);
            console.log('');
            console.log('🎯 Requête 3 (Détails fin d\'année - RP, RU, CP):');
            console.log('───────────────────────────────────────────────────────────');

            // Affichage formaté des compteurs fin d'année
            if (Array.isArray(data3)) {
                data3.forEach((item, index) => {
                    console.log(`${index}. ${item.libelle}: ${item.valeur}`);
                });
                console.log('');
                console.log('📋 Données brutes:', data3);
            } else {
                console.log(data3);
            }

            console.log('');
            console.log('🎯 Requête 4 (RN aujourd\'hui):');
            console.log('───────────────────────────────────────────────────────────');

            // Affichage formaté des compteurs aujourd'hui
            if (Array.isArray(data4)) {
                data4.forEach((item, index) => {
                    console.log(`${index}. ${item.libelle}: ${item.valeur}`);
                });
                console.log('');
                console.log('📋 Données brutes:', data4);
            } else {
                console.log(data4);
            }

            console.log('═══════════════════════════════════════════════════════════');
            console.log('');

            // Mettre à jour l'affichage des soldes sous les boutons
            // RP, RU, CP depuis data3 (fin d'année), RN depuis data4 (aujourd'hui)
            updateSoldesFromAPI(data3, data4);

        } catch (error) {
            console.error('❌ Erreur lors de l\'exécution des requêtes API:', error);
        }
    }

    // Fonction pour convertir le format "95j00" ou "95J" en nombre de jours
    function parseSoldeToJours(solde) {
        const match = solde.match(/(\d+)[jJ]/);
        return match ? parseInt(match[1], 10) : 0;
    }

    // Fonction pour convertir un nombre de jours en format "XJ"
    function formatJoursToSolde(jours) {
        return `${jours}J`;
    }

    // Fonction pour charger les soldes depuis le localStorage
    function loadSoldesFromCache() {
        const cachedSoldes = localStorage.getItem('optimum-soldes');
        if (cachedSoldes) {
            try {
                const soldes = JSON.parse(cachedSoldes);
                console.log('📦 Chargement des soldes depuis le cache:', soldes);

                // Afficher les soldes en cache
                const rpDisplay = document.querySelector('.solde-display-rp');
                const ruDisplay = document.querySelector('.solde-display-ru');
                const cpDisplay = document.querySelector('.solde-display-cp');
                const rqDisplay = document.querySelector('.solde-display-rq');
                const rnDisplay = document.querySelector('.solde-display-rn');

                if (rpDisplay && soldes.RP) {
                    rpDisplay.innerHTML = ''; // Vider d'abord
                    rpDisplay.textContent = soldes.RP + ' ';
                    rpDisplay.style.color = '#6c757d'; // Gris pour indiquer que c'est du cache
                    // Ajouter le spinner à droite
                    const spinner = document.createElement('span');
                    spinner.className = 'modern-loading-spinner';
                    spinner.style.marginLeft = '4px';
                    rpDisplay.appendChild(spinner);
                }

                if (ruDisplay && soldes.RU) {
                    ruDisplay.innerHTML = '';
                    ruDisplay.textContent = soldes.RU + ' ';
                    ruDisplay.style.color = '#6c757d';
                    const spinner = document.createElement('span');
                    spinner.className = 'modern-loading-spinner';
                    spinner.style.marginLeft = '4px';
                    ruDisplay.appendChild(spinner);
                }

                if (cpDisplay && soldes.CP) {
                    cpDisplay.innerHTML = '';
                    cpDisplay.textContent = soldes.CP + ' ';
                    cpDisplay.style.color = '#6c757d';
                    const spinner = document.createElement('span');
                    spinner.className = 'modern-loading-spinner';
                    spinner.style.marginLeft = '4px';
                    cpDisplay.appendChild(spinner);
                }

                if (rqDisplay && soldes.RQ) {
                    rqDisplay.innerHTML = '';
                    rqDisplay.textContent = soldes.RQ + ' ';
                    rqDisplay.style.color = '#6c757d';
                    const spinner = document.createElement('span');
                    spinner.className = 'modern-loading-spinner';
                    spinner.style.marginLeft = '4px';
                    rqDisplay.appendChild(spinner);
                }

                if (rnDisplay && soldes.RN) {
                    rnDisplay.innerHTML = '';
                    rnDisplay.textContent = soldes.RN + ' ';
                    rnDisplay.style.color = '#6c757d';
                    const spinner = document.createElement('span');
                    spinner.className = 'modern-loading-spinner';
                    spinner.style.marginLeft = '4px';
                    rnDisplay.appendChild(spinner);
                }

                return true;
            } catch (error) {
                console.error('Erreur lors du chargement du cache:', error);
                return false;
            }
        }
        return false;
    }

    // Fonction pour sauvegarder les soldes dans le localStorage
    function saveSoldesToCache(soldes) {
        try {
            localStorage.setItem('optimum-soldes', JSON.stringify(soldes));
            console.log('💾 Soldes sauvegardés dans le cache');
        } catch (error) {
            console.error('Erreur lors de la sauvegarde dans le cache:', error);
        }
    }

    // Fonction pour convertir le format "95j00" en "95J"
    function formatSoldeVersJ(solde) {
        const match = solde.match(/(\d+)[jJ]/);
        if (match) {
            return `${match[1]}J`;
        }
        return solde;
    }

    // Fonction pour mettre à jour l'affichage des soldes depuis l'API
    function updateSoldesFromAPI(dataEndOfYear, dataToday) {
        if (!Array.isArray(dataEndOfYear)) return;

        console.log('🔄 Mise à jour des soldes...');

        // Trouver les soldes dans les données de fin d'année
        const soldes = {
            RP: null,
            RU: null,
            CP: null,
            RQ: null,
            RN: null
        };

        dataEndOfYear.forEach(item => {
            if (item.libelle === 'Solde RP') {
                soldes.RP = formatSoldeVersJ(item.valeur.trim());
            } else if (item.libelle === 'Solde RU') {
                soldes.RU = formatSoldeVersJ(item.valeur.trim());
            } else if (item.libelle === 'CR solde Actuel') {
                soldes.CP = formatSoldeVersJ(item.valeur.trim());
            } else if (item.libelle === 'Solde RQ') {
                soldes.RQ = formatSoldeVersJ(item.valeur.trim());
            }
        });

        // Trouver le solde RN dans les données d'aujourd'hui
        if (Array.isArray(dataToday)) {
            dataToday.forEach(item => {
                if (item.libelle === 'Solde RN') {
                    soldes.RN = formatSoldeVersJ(item.valeur.trim());
                }
            });
        }

        // Sauvegarder dans le localStorage
        saveSoldesToCache(soldes);

        // Mettre à jour l'affichage
        const rpDisplay = document.querySelector('.solde-display-rp');
        const ruDisplay = document.querySelector('.solde-display-ru');
        const cpDisplay = document.querySelector('.solde-display-cp');
        const rqDisplay = document.querySelector('.solde-display-rq');
        const rnDisplay = document.querySelector('.solde-display-rn');

        if (rpDisplay && soldes.RP) {
            rpDisplay.innerHTML = ''; // Supprimer le spinner
            rpDisplay.textContent = soldes.RP;
            rpDisplay.style.color = '#6c757d'; // Gris temporaire (sera mis à jour après vérification)
            console.log('✅ Solde RP affiché:', soldes.RP);
        }

        if (ruDisplay && soldes.RU) {
            ruDisplay.innerHTML = '';
            ruDisplay.textContent = soldes.RU;
            ruDisplay.style.color = '#6c757d'; // Gris temporaire
            console.log('✅ Solde RU affiché:', soldes.RU);
        }

        if (cpDisplay && soldes.CP) {
            cpDisplay.innerHTML = '';
            cpDisplay.textContent = soldes.CP;
            cpDisplay.style.color = '#6c757d'; // Gris temporaire
            console.log('✅ Solde CP affiché:', soldes.CP);
        }

        if (rqDisplay && soldes.RQ) {
            rqDisplay.innerHTML = '';
            rqDisplay.textContent = soldes.RQ;
            rqDisplay.style.color = '#6c757d'; // Gris temporaire
            console.log('✅ Solde RQ affiché:', soldes.RQ);
        }

        if (rnDisplay && soldes.RN) {
            rnDisplay.innerHTML = '';
            rnDisplay.textContent = soldes.RN;
            rnDisplay.style.color = '#6c757d'; // Gris temporaire
            console.log('✅ Solde RN affiché:', soldes.RN);
        }

        // Après avoir mis à jour les soldes, vérifier avec les compteurs en cache
        // Utiliser setTimeout pour s'assurer que le DOM est bien mis à jour
        setTimeout(() => {
            const cachedCompteurs = localStorage.getItem('optimum-compteurs-regularisations');
            if (cachedCompteurs) {
                try {
                    const compteurs = JSON.parse(cachedCompteurs);
                    console.log('🔍 Vérification des soldes avec les compteurs en cache...', compteurs);
                    verifierSoldesVsRegularisations(compteurs);
                } catch (e) {
                    console.error('❌ Erreur lors du chargement des compteurs:', e);
                }
            } else {
                console.log('ℹ️ Aucun compteur en cache, les couleurs resteront grises jusqu\'à l\'analyse');
            }
        }, 100); // Petit délai pour s'assurer que le DOM est à jour
    }

    // Fonction pour récupérer le matricule de l'utilisateur
    function getMatricule() {
        // Méthode 0a: Utiliser le matricule saisi manuellement par l'utilisateur (priorité maximale)
        const userSavedMatricule = localStorage.getItem('optimum-matricule-user');
        if (userSavedMatricule && /^\d{7}$/.test(userSavedMatricule)) {
            console.log('✅ Matricule trouvé dans la sauvegarde utilisateur:', userSavedMatricule);
            cachedMatricule = userSavedMatricule;
            return userSavedMatricule;
        }

        // Méthode 0b: Utiliser le matricule intercepté depuis les requêtes API (LE PLUS FIABLE)
        if (cachedMatricule) {
            console.log('✅ Matricule trouvé dans les requêtes interceptées:', cachedMatricule);
            return cachedMatricule;
        }

        // Méthode 1: Chercher dans l'URL (le plus fiable pour Optimum)
        const urlMatch = window.location.href.match(/matricule[=\/](\d{7})/);
        if (urlMatch) {
            console.log('✅ Matricule trouvé dans l\'URL:', urlMatch[1]);
            cachedMatricule = urlMatch[1]; // Sauvegarder pour la prochaine fois
            return urlMatch[1];
        }

        // Méthode 2: Chercher dans le localStorage/sessionStorage
        const storedMatricule = localStorage.getItem('matricule') || sessionStorage.getItem('matricule');
        if (storedMatricule && /^\d{7}$/.test(storedMatricule)) {
            console.log('✅ Matricule trouvé dans le storage:', storedMatricule);
            cachedMatricule = storedMatricule;
            return storedMatricule;
        }

        // Méthode 3: Chercher dans les variables globales
        if (window.matricule && /^\d{7}$/.test(window.matricule)) {
            console.log('✅ Matricule trouvé dans window.matricule:', window.matricule);
            cachedMatricule = window.matricule;
            return window.matricule;
        }
        if (window.userInfo && window.userInfo.matricule && /^\d{7}$/.test(window.userInfo.matricule)) {
            console.log('✅ Matricule trouvé dans window.userInfo:', window.userInfo.matricule);
            cachedMatricule = window.userInfo.matricule;
            return window.userInfo.matricule;
        }

        // Méthode 4: Chercher dans le DOM (éléments qui affichent le matricule)
        const matriculeElements = document.querySelectorAll('[data-matricule], .matricule, #matricule, [id*="matricule"], [class*="matricule"]');
        for (let elem of matriculeElements) {
            const mat = elem.getAttribute('data-matricule') || elem.textContent.trim();
            if (mat && /^\d{7}$/.test(mat)) {
                console.log('✅ Matricule trouvé dans le DOM:', mat);
                cachedMatricule = mat;
                return mat;
            }
        }

        // Méthode 5: Chercher dans toutes les requêtes fetch précédentes
        if (window.performance && window.performance.getEntriesByType) {
            const resources = window.performance.getEntriesByType('resource');
            for (let resource of resources) {
                if (resource.name.includes('optimum.sncf.fr')) {
                    const match = resource.name.match(/[?&]matricule=(\d{7})/);
                    if (match) {
                        console.log('✅ Matricule trouvé dans l\'historique des requêtes:', match[1]);
                        cachedMatricule = match[1];
                        return match[1];
                    }
                }
            }
        }

        // Méthode 6: Extraire des scripts
        const scriptElements = document.querySelectorAll('script');
        for (let script of scriptElements) {
            const content = script.textContent;
            const match = content.match(/matricule['":\s=]+(\d{7})/);
            if (match) {
                console.log('✅ Matricule trouvé dans un script:', match[1]);
                cachedMatricule = match[1];
                return match[1];
            }
        }

        // Méthode 7: Attendre un peu et chercher dans les cookies
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
            const match = cookie.match(/matricule[=:](\d{7})/);
            if (match) {
                console.log('✅ Matricule trouvé dans les cookies:', match[1]);
                cachedMatricule = match[1];
                return match[1];
            }
        }

        // Aucun matricule trouvé → demander à l'utilisateur via un popup
        console.warn('⚠️ Matricule non trouvé automatiquement. Ouverture du popup de saisie...');
        askMatriculePopup();
        return null;
    }

    // Popup de saisie du matricule (stocké dans localStorage pour les prochaines fois)
    function askMatriculePopup() {
        // Éviter d'ouvrir plusieurs popups en même temps
        if (document.getElementById('optimum-matricule-popup')) return;

        const overlay = document.createElement('div');
        overlay.id = 'optimum-matricule-popup';
        overlay.style.cssText = `
            position: fixed; inset: 0; z-index: 99999;
            background: rgba(0,0,0,0.55);
            display: flex; align-items: center; justify-content: center;
            font-family: 'Segoe UI', Arial, sans-serif;
        `;

        overlay.innerHTML = `
            <div style="
                background: #1e1e2e; color: #cdd6f4;
                border-radius: 16px; padding: 32px 36px;
                box-shadow: 0 8px 40px rgba(0,0,0,0.7);
                min-width: 340px; max-width: 420px;
                border: 1px solid rgba(139,92,246,0.4);
            ">
                <div style="font-size:1.2rem; font-weight:700; margin-bottom:8px; color:#cba6f7;">
                    🔑 Matricule requis
                </div>
                <div style="font-size:0.9rem; color:#a6adc8; margin-bottom:20px;">
                    Aucun matricule n'a été détecté automatiquement.<br>
                    Saisissez votre matricule (7 chiffres) pour continuer.<br>
                    <span style="color:#89b4fa; font-size:0.82rem;">Il sera mémorisé pour les prochaines sessions.</span>
                </div>
                <input id="optimum-matricule-input" type="text" maxlength="7" placeholder="ex: 9303122"
                    style="
                        width: 100%; box-sizing: border-box;
                        padding: 10px 14px; border-radius: 8px;
                        border: 1.5px solid rgba(139,92,246,0.5);
                        background: #313244; color: #cdd6f4;
                        font-size: 1.1rem; letter-spacing: 2px;
                        outline: none; margin-bottom: 18px;
                    "
                />
                <div id="optimum-matricule-error" style="color:#f38ba8; font-size:0.83rem; margin-bottom:10px; display:none;">
                    ⚠️ Le matricule doit contenir exactement 7 chiffres.
                </div>
                <div style="display:flex; gap:12px; justify-content:flex-end;">
                    <button id="optimum-matricule-cancel" style="
                        padding: 9px 20px; border-radius: 8px;
                        border: 1px solid rgba(139,92,246,0.3);
                        background: transparent; color: #a6adc8;
                        cursor: pointer; font-size: 0.9rem;
                    ">Annuler</button>
                    <button id="optimum-matricule-save" style="
                        padding: 9px 22px; border-radius: 8px;
                        border: none;
                        background: linear-gradient(135deg, hsl(260,97%,50%), hsl(280,90%,65%));
                        color: white; cursor: pointer;
                        font-size: 0.9rem; font-weight: 600;
                    ">Enregistrer</button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        const input = document.getElementById('optimum-matricule-input');
        const errorDiv = document.getElementById('optimum-matricule-error');
        const saveBtn = document.getElementById('optimum-matricule-save');
        const cancelBtn = document.getElementById('optimum-matricule-cancel');

        input.focus();

        // Validation et sauvegarde
        function saveMatricule() {
            const val = input.value.trim();
            if (!/^\d{7}$/.test(val)) {
                errorDiv.style.display = 'block';
                input.focus();
                return;
            }
            errorDiv.style.display = 'none';
            // Sauvegarder dans localStorage (clé dédiée)
            localStorage.setItem('optimum-matricule-user', val);
            cachedMatricule = val;
            console.log('✅ Matricule saisi et enregistré:', val);
            document.body.removeChild(overlay);
            // Relancer les requêtes API maintenant que le matricule est connu
            executeApiRequests();
        }

        saveBtn.addEventListener('click', saveMatricule);
        cancelBtn.addEventListener('click', () => document.body.removeChild(overlay));
        input.addEventListener('keydown', (e) => { if (e.key === 'Enter') saveMatricule(); });
    }

    // Fonction pour obtenir la date au format YYYYMMDD
    function getFormattedDate() {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}${month}${day}`;
    }

    // Fonction pour obtenir le dernier jour de l'année au format YYYYMMDD
    function getEndOfYearDate() {
        const today = new Date();
        const year = today.getFullYear();
        return `${year}1231`; // 31 décembre
    }

    // Variable globale pour stocker le token intercepté
    let cachedToken = null;
    let cachedMatricule = null;

    // Intercepter les requêtes fetch pour capturer le token ET le matricule
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
        const [url, options] = args;

        // Si la requête contient le header x_token_key, on le stocke
        if (options && options.headers) {
            const headers = options.headers;
            if (headers['x_token_key']) {
                cachedToken = headers['x_token_key'];
                console.log('Token intercepté depuis fetch:', cachedToken);
            }
        }

        // Extraire le matricule depuis l'URL de la requête
        if (typeof url === 'string') {
            const matriculeMatch = url.match(/[?&]matricule=(\d{7})/);
            if (matriculeMatch) {
                cachedMatricule = matriculeMatch[1];
                console.log('✅ Matricule intercepté depuis une requête API:', cachedMatricule);
            }
        }

        return originalFetch.apply(this, args);
    };

    // Intercepter XMLHttpRequest pour capturer le token et le matricule
    const originalOpen = XMLHttpRequest.prototype.open;
    const originalSetRequestHeader = XMLHttpRequest.prototype.setRequestHeader;

    // Stocker l'URL de la requête XHR
    let currentXhrUrl = null;

    XMLHttpRequest.prototype.open = function(method, url, ...rest) {
        currentXhrUrl = url;
        // Extraire le matricule depuis l'URL
        if (typeof url === 'string') {
            const matriculeMatch = url.match(/[?&]matricule=(\d{7})/);
            if (matriculeMatch) {
                cachedMatricule = matriculeMatch[1];
                console.log('✅ Matricule intercepté depuis XHR:', cachedMatricule);
            }
        }
        return originalOpen.apply(this, [method, url, ...rest]);
    };

    XMLHttpRequest.prototype.setRequestHeader = function(header, value) {
        if (header.toLowerCase() === 'x_token_key') {
            cachedToken = value;
            console.log('Token intercepté depuis XHR:', cachedToken);
        }
        return originalSetRequestHeader.apply(this, arguments);
    };

    // Fonction pour récupérer le token depuis les éléments de la page
    function getTokenKey() {
        console.log('Recherche du token x_token_key...');

        // Méthode 1: Utiliser le token intercepté
        if (cachedToken) {
            console.log('Token trouvé dans le cache:', cachedToken);
            return cachedToken;
        }

        // Méthode 2: Chercher dans le localStorage ou sessionStorage
        const localToken = localStorage.getItem('x_token_key') || sessionStorage.getItem('x_token_key');
        if (localToken) {
            console.log('Token trouvé dans localStorage/sessionStorage');
            return localToken;
        }

        // Méthode 3: Chercher dans les variables globales window
        if (window.x_token_key) {
            console.log('Token trouvé dans window.x_token_key');
            return window.x_token_key;
        }

        // Méthode 4: Chercher dans les éléments meta ou data attributes
        const metaToken = document.querySelector('meta[name="x_token_key"]');
        if (metaToken) {
            console.log('Token trouvé dans meta tag');
            return metaToken.getAttribute('content');
        }

        // Méthode 5: Essayer de trouver le token dans le DOM/scripts
        const scriptElements = document.querySelectorAll('script');
        for (let script of scriptElements) {
            const content = script.textContent;
            const match = content.match(/['"']?x_token_key['"']?\s*[:=]\s*['"']([A-Za-z0-9_-]+)['"']/);
            if (match) {
                console.log('Token trouvé dans un script');
                return match[1];
            }
        }

        console.error('❌ Token non trouvé. Assurez-vous de naviguer sur Optimum avant de cliquer sur le bouton API.');
        return null;
    }

    // Fonction pour simuler la création d'une régularisation (RP/RU)
    function createRegularisation(motifCode) {
        console.log(`Tentative de création de régularisation avec motif: ${motifCode}...`);

        // Chercher différents sélecteurs possibles pour le bouton "Nouveau"
        let nouveauButton = document.querySelector('.agenda_acmcreercmb button.dropReg');

        // Si non trouvé, essayer avec d'autres sélecteurs
        if (!nouveauButton) {
            nouveauButton = document.querySelector('.agenda_acmcreercmb button.creerAb');
        }
        if (!nouveauButton) {
            nouveauButton = document.querySelector('.agenda_acmcreercmb button');
        }

        if (nouveauButton) {
            console.log('Bouton "Nouveau" trouvé:', nouveauButton);
            nouveauButton.click();

            // Attendre que le menu s'ouvre avec plusieurs tentatives
            let attempts = 0;
            const maxAttempts = 10;

            const checkMenu = setInterval(function() {
                // Chercher le bouton "Créer régularisation"
                let creerRegButton = document.querySelector('li.dropReg.c-panneauMenu__item.cwMenuButton-option');

                // Essayer d'autres sélecteurs si nécessaire
                if (!creerRegButton) {
                    const allMenuItems = document.querySelectorAll('li.c-panneauMenu__item.cwMenuButton-option');
                    for (let item of allMenuItems) {
                        if (item.textContent.includes('régularisation') || item.textContent.includes('regularisation')) {
                            creerRegButton = item;
                            break;
                        }
                    }
                }

                if (creerRegButton) {
                    clearInterval(checkMenu);
                    console.log('Clic sur "Créer régularisation"');
                    creerRegButton.click();

                    // Attendre que le formulaire apparaisse et remplir le champ motif
                    setTimeout(function() {
                        fillMotifCode(motifCode);
                    }, 300);
                } else if (attempts >= maxAttempts) {
                    clearInterval(checkMenu);
                    console.log('Bouton "Créer régularisation" non trouvé après plusieurs tentatives');
                }
                attempts++;
            }, 100);
        } else {
            console.log('Bouton "Nouveau" non trouvé - Tous les sélecteurs ont échoué');
        }
    }

    // Fonction pour simuler la création d'une absence
    function createAbsence(motifCode) {
        console.log(`Tentative de création d'absence avec motif: ${motifCode}...`);

        // Chercher différents sélecteurs possibles pour le bouton "Nouveau"
        let nouveauButton = document.querySelector('.agenda_acmcreercmb button.dropReg');

        // Si non trouvé, essayer avec d'autres sélecteurs
        if (!nouveauButton) {
            nouveauButton = document.querySelector('.agenda_acmcreercmb button.creerAb');
        }
        if (!nouveauButton) {
            nouveauButton = document.querySelector('.agenda_acmcreercmb button');
        }

        if (nouveauButton) {
            console.log('Bouton "Nouveau" trouvé:', nouveauButton);
            nouveauButton.click();

            // Attendre que le menu s'ouvre avec plusieurs tentatives
            let attempts = 0;
            const maxAttempts = 10;

            const checkMenu = setInterval(function() {
                // Chercher le bouton "Créer absence"
                let creerAbsButton = document.querySelector('li.creerAb.c-panneauMenu__item.cwMenuButton-option');

                // Essayer d'autres sélecteurs si nécessaire
                if (!creerAbsButton) {
                    const allMenuItems = document.querySelectorAll('li.c-panneauMenu__item.cwMenuButton-option');
                    for (let item of allMenuItems) {
                        if (item.textContent.includes('absence')) {
                            creerAbsButton = item;
                            break;
                        }
                    }
                }

                if (creerAbsButton) {
                    clearInterval(checkMenu);
                    console.log('Clic sur "Créer absence"');
                    creerAbsButton.click();

                    // Attendre que le formulaire apparaisse et remplir le champ motif avec le code du bouton
                    setTimeout(function() {
                        fillMotifCode(motifCode);
                    }, 300);
                } else if (attempts >= maxAttempts) {
                    clearInterval(checkMenu);
                    console.log('Bouton "Créer absence" non trouvé après plusieurs tentatives');
                }
                attempts++;
            }, 100);
        } else {
            console.log('Bouton "Nouveau" non trouvé - Tous les sélecteurs ont échoué');
        }
    }

    // Fonction pour remplir le champ motif et sélectionner le premier choix
    function fillMotifCode(code) {
        console.log(`Remplissage du champ motif avec: ${code}`);

        // Chercher l'input du motif
        let motifInput = document.querySelector('input[class*="motif.code"]');

        // Essayer d'autres sélecteurs si nécessaire
        if (!motifInput) {
            motifInput = document.querySelector('input.c-cwComboBoxView2__input[id^="motif.code"]');
        }

        if (motifInput) {
            console.log('Input motif trouvé:', motifInput);

            // Mettre le focus sur l'input
            motifInput.focus();

            // Vider le champ et entrer la valeur
            motifInput.value = code;

            // Déclencher les événements pour activer l'autocomplete
            const inputEvent = new Event('input', { bubbles: true });
            motifInput.dispatchEvent(inputEvent);

            const keyupEvent = new KeyboardEvent('keyup', { bubbles: true, key: code });
            motifInput.dispatchEvent(keyupEvent);

            console.log(`Valeur "${code}" entrée dans le champ motif`);

            // Attendre que les suggestions apparaissent et cliquer sur la première
            let attempts = 0;
            const maxAttempts = 15;

            const checkSuggestions = setInterval(function() {
                // Chercher les suggestions de l'autocomplete
                const suggestions = document.querySelectorAll('.ui-autocomplete li.ui-menu-item, .ui-autocomplete .ui-menu-item');

                if (suggestions.length > 0) {
                    clearInterval(checkSuggestions);
                    console.log(`${suggestions.length} suggestion(s) trouvée(s), sélection de la première...`);

                    // Cliquer sur la première suggestion
                    const firstSuggestion = suggestions[0];
                    firstSuggestion.click();
                    console.log('Première suggestion sélectionnée');
                } else if (attempts >= maxAttempts) {
                    clearInterval(checkSuggestions);
                    console.log('Aucune suggestion trouvée après plusieurs tentatives');
                }
                attempts++;
            }, 100);
        } else {
            console.log('Input motif non trouvé');
        }
    }

    // Fonction pour scanner le calendrier et calculer les jours de CP posés
    function calculerCPDepuisCalendrier() {
        console.log('🔍 Scan du calendrier pour détecter les CP...');
        
        // Chercher toutes les cellules avec les classes spécifiques pour les absences validées
        const cellulesAbsences = document.querySelectorAll('.phx-cell-render-text.phx-dynamicStyle-cell-absaval');
        
        if (cellulesAbsences.length === 0) {
            console.log('⚠️ Aucune cellule d\'absence trouvée dans le calendrier');
            return 0;
        }
        
        console.log(`📊 ${cellulesAbsences.length} cellule(s) d'absence trouvée(s)`);
        
        let totalJours = 0;
        
        cellulesAbsences.forEach((cellule, index) => {
            // Remonter à la cellule parente complète
            const celluleParente = cellule.closest('.phx-cell-render');
            
            if (!celluleParente) return;
            
            // Vérifier si c'est une cellule d'absence CP (abs_COR)
            const celluleAbs = celluleParente.querySelector('.phx-dynamicStyle-cell-abs_COR.phx-cell-abs-aval');
            
            if (!celluleAbs) return; // Pas une absence CP
            
            console.log(`  📅 Cellule ${index + 1}:`);
            
            // Vérifier la présence des classes pour déterminer le type de journée
            const hasLeft = celluleParente.querySelector('.phx-cell-render-left');
            const hasRight = celluleParente.querySelector('.phx-cell-render-right');
            const hasWhite = celluleParente.querySelector('.ui-phx-color-blanc_5');
            const hasDynamicAbsLeft = celluleParente.querySelector('.phx-cell-render-left.phx-dynamicStyle-cell-abs_COR');
            const hasDynamicAbsRight = celluleParente.querySelector('.phx-cell-render-right.phx-dynamicStyle-cell-abs_COR');
            
            // Cas 1: Demi-journée - présence d'un blanc ET d'un CP dynamique (left ou right)
            if (hasWhite && (hasDynamicAbsLeft || hasDynamicAbsRight)) {
                totalJours += 0.5;
                console.log(`    ➡️ Demi-journée détectée (blanc + CP dynamique) (+0.5J)`);
            }
            // Cas 2: Journée complète - pas de left/right, ou les deux sont CP
            else if (!hasLeft && !hasRight) {
                totalJours += 1;
                console.log(`    ➡️ Journée complète détectée (pas de left/right) (+1J)`);
            }
            // Cas 3: Journée complète - left et right sont tous les deux CP (pas de blanc)
            else if (hasDynamicAbsLeft && hasDynamicAbsRight && !hasWhite) {
                totalJours += 1;
                console.log(`    ➡️ Journée complète détectée (left + right CP, pas de blanc) (+1J)`);
            }
            // Cas 4: Autre configuration
            else {
                console.log(`    ⚠️ Configuration non reconnue (hasLeft: ${!!hasLeft}, hasRight: ${!!hasRight}, hasWhite: ${!!hasWhite}, hasDynamicAbsLeft: ${!!hasDynamicAbsLeft}, hasDynamicAbsRight: ${!!hasDynamicAbsRight})`);
            }
        });
        
        console.log(`✅ Total CP calculé depuis le calendrier: ${totalJours}J`);
        return totalJours;
    }

    // Fonction pour afficher les CP calculés automatiquement sous le bouton
    function afficherCPCalendrierSousBouton() {
        const cpCalendrier = calculerCPDepuisCalendrier();
        const cpDisplay = document.querySelector('.solde-display-cp');
        
        if (!cpDisplay) return;
        
        const wrapper = cpDisplay.parentElement;
        let existingCalc = wrapper.querySelector('.valeur-cp-calendrier');
        
        if (cpCalendrier > 0) {
            if (existingCalc) {
                existingCalc.textContent = `-${cpCalendrier}J`;
            } else {
                const valeurCalculee = document.createElement('div');
                valeurCalculee.className = 'valeur-cp-calendrier';
                valeurCalculee.textContent = `-${cpCalendrier}J`;
                valeurCalculee.title = 'CP posés (calculé depuis le calendrier)';
                
                if (wrapper && wrapper.classList.contains('modern-button-wrapper')) {
                    wrapper.appendChild(valeurCalculee);
                }
            }
            
            // Calculer et afficher le résultat après CP
            afficherResultatApresCP();
        } else if (existingCalc) {
            existingCalc.remove();
            // Retirer aussi le résultat s'il existe
            const resultatElement = wrapper.querySelector('.resultat-apres-regul-cp');
            if (resultatElement) {
                resultatElement.remove();
            }
        }
    }

    // Fonction pour calculer et afficher le résultat après CP
    function afficherResultatApresCP() {
        const cpDisplay = document.querySelector('.solde-display-cp');
        const cpCalendrierElement = cpDisplay ? cpDisplay.parentElement.querySelector('.valeur-cp-calendrier') : null;
        
        if (cpDisplay && cpCalendrierElement) {
            const soldeText = cpDisplay.textContent.trim();
            const soldeJours = parseSoldeToJours(soldeText);
            const cpText = cpCalendrierElement.textContent.trim().replace('-', '').replace('J', '');
            const cpCalendrierJours = parseFloat(cpText) || 0;
            
            if (cpCalendrierJours > 0 && soldeJours > 0) {
                const resultat = soldeJours - cpCalendrierJours;

                // Ajouter le résultat
                let resultatElement = cpDisplay.parentElement.querySelector('.resultat-apres-regul-cp');
                if (!resultatElement) {
                    resultatElement = document.createElement('div');
                    resultatElement.className = 'resultat-apres-regul-cp';
                    resultatElement.style.cssText = 'font-size: 11px; color: #28a745; font-weight: bold; margin-top: 2px;';
                    resultatElement.title = 'Solde après CP posés';
                    cpDisplay.parentElement.appendChild(resultatElement);
                }
                
                resultatElement.textContent = `${resultat}J`;
                console.log(`✅ CP: ${soldeJours}J - ${cpCalendrierJours}J = ${resultat}J`);
                
                // Sauvegarder dans le localStorage
                const cachedResultats = localStorage.getItem('optimum-resultats-regularisations');
                let resultats = cachedResultats ? JSON.parse(cachedResultats) : { RP: 0, RU: 0, RQ: 0, CP: 0 };
                resultats.CP = resultat;
                localStorage.setItem('optimum-resultats-regularisations', JSON.stringify(resultats));
            }
        }
    }

    // Fonction pour récupérer toutes les cellules clignotantes avec leurs dates
    function recupererCellulesClignotantes() {
        console.log('');
        console.log('═══════════════════════════════════════════════════════════');
        console.log('      🔍 RÉCUPÉRATION DES CELLULES CLIGNOTANTES           ');
        console.log('═══════════════════════════════════════════════════════════');
        console.log('');

        // Chercher toutes les cellules clignotantes (avec la classe cellule-30-clignotante ou similaire)
        const cellulesClignotantes = document.querySelectorAll('[class*="cellule-"][class*="-clignotante"]');
        
        if (cellulesClignotantes.length === 0) {
            console.log('⚠️ Aucune cellule clignotante trouvée dans le calendrier');
            console.log('');
            return [];
        }

        console.log(`📊 ${cellulesClignotantes.length} cellule(s) clignotante(s) trouvée(s)`);
        console.log('');

        const resultats = [];

        cellulesClignotantes.forEach((cellule, index) => {
            // Récupérer l'attribut data-date
            const dataDate = cellule.getAttribute('data-date');
            
            // Récupérer le titre (tooltip) qui contient les informations
            const titre = cellule.getAttribute('title');
            
            // Récupérer la couleur de fond
            const bgColor = cellule.style.backgroundColor || 
                           window.getComputedStyle(cellule).backgroundColor;
            
            // Récupérer le texte affiché dans la cellule (ex: "30")
            const texteElement = cellule.querySelector('.phx-cell-render-text');
            const texte = texteElement ? texteElement.textContent.trim() : '';

            // Formater la date YYYYMMDD en DD/MM/YYYY
            let dateFormatee = dataDate;
            if (dataDate && /^\d{8}$/.test(dataDate)) {
                const annee = dataDate.substring(0, 4);
                const mois = dataDate.substring(4, 6);
                const jour = dataDate.substring(6, 8);
                dateFormatee = `${jour}/${mois}/${annee}`;
            }

            // Extraire les informations du titre (HTML dans l'attribut title)
            let infoExtraites = '';
            if (titre) {
                // Supprimer les balises HTML pour avoir le texte brut
                const parser = new DOMParser();
                const doc = parser.parseFromString(titre, 'text/html');
                infoExtraites = doc.body.textContent || titre;
            }

            const resultat = {
                index: index + 1,
                dataDate: dataDate,
                dateFormatee: dateFormatee,
                texte: texte,
                couleur: bgColor,
                titre: infoExtraites,
                element: cellule
            };

            resultats.push(resultat);

            // Affichage dans la console
            console.log(`📅 Cellule ${index + 1}:`);
            console.log(`   └─ Date (data-date): ${dataDate}`);
            console.log(`   └─ Date formatée: ${dateFormatee}`);
            console.log(`   └─ Texte: "${texte}"`);
            console.log(`   └─ Couleur: ${bgColor}`);
            if (infoExtraites) {
                console.log(`   └─ Info: ${infoExtraites}`);
            }
            console.log('');
        });

        console.log('═══════════════════════════════════════════════════════════');
        console.log(`          ✅ TOTAL: ${resultats.length} cellule(s)                 `);
        console.log('═══════════════════════════════════════════════════════════');
        console.log('');
        console.log('📋 Détails complets:', resultats);
        console.log('');

        return resultats;
    }

    // Exposer la fonction globalement pour pouvoir l'appeler depuis la console
    window.recupererCellulesClignotantes = recupererCellulesClignotantes;

    // Fonction pour simuler l'analyse des régularisations pour chaque date clignotante
    async function analyserRegularisationsParDate() {
        console.log('');
        console.log('═══════════════════════════════════════════════════════════');
        console.log('   🔄 ANALYSE DES RÉGULARISATIONS PAR DATE CLIGNOTANTE    ');
        console.log('═══════════════════════════════════════════════════════════');
        console.log('');

        // Afficher les spinners sur les compteurs existants pendant le chargement
        ajouterSpinnersAuxCompteurs();

        // Fermer le panel "Journée du XX/XX/XXXX" s'il est ouvert
        const panelJournee = document.querySelector('.phx-agenda-zoomtbl.c-collapsePanel__header');
        if (panelJournee) {
            console.log('🔽 Fermeture du panel "Journée du..." pour libérer l\'interface...');
            panelJournee.click();
            // Attendre que le panel se ferme
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        // Récupérer toutes les cellules clignotantes SANS afficher dans la console
        const cellulesClignotantes = document.querySelectorAll('[class*="cellule-"][class*="-clignotante"]');
        
        if (cellulesClignotantes.length === 0) {
            console.log('❌ Aucune cellule clignotante trouvée dans le calendrier');
            console.log('');
            return [];
        }

        // Préparer les cellules
        const cellules = [];
        cellulesClignotantes.forEach((cellule, index) => {
            const dataDate = cellule.getAttribute('data-date');
            let dateFormatee = dataDate;
            if (dataDate && /^\d{8}$/.test(dataDate)) {
                const annee = dataDate.substring(0, 4);
                const mois = dataDate.substring(4, 6);
                const jour = dataDate.substring(6, 8);
                dateFormatee = `${jour}/${mois}/${annee}`;
            }
            cellules.push({
                index: index + 1,
                dataDate: dataDate,
                dateFormatee: dateFormatee,
                element: cellule
            });
        });

        console.log(`📊 ${cellules.length} date(s) à analyser`);
        console.log('');

        const resultats = [];

        // Pour chaque cellule clignotante
        for (let i = 0; i < cellules.length; i++) {
            const cellule = cellules[i];
            const { dataDate, dateFormatee, element } = cellule;

            console.log(`⏳ [${i + 1}/${cellules.length}] Analyse de la date: ${dateFormatee} (${dataDate})`);

            try {
                // Cliquer sur la cellule clignotante pour ouvrir le panel de détails
                console.log('   🖱️ Clic sur la cellule...');
                element.click();

                // Attendre que le panel se charge (réduit à 1 seconde)
                await new Promise(resolve => setTimeout(resolve, 1000));

                // Chercher le panel de régularisation
                const panelRegularisation = document.querySelector('.cw-regularisation, [class*="regularisation"]');
                
                if (panelRegularisation) {
                    console.log('   📦 Contenu complet du panel de régularisation:');
                    console.log('   ────────────────────────────────────────────────');
                    console.log(panelRegularisation.textContent.trim());
                    console.log('   ────────────────────────────────────────────────');
                } else {
                    console.log('   ⚠️ Panel de régularisation non trouvé');
                }

                // Chercher le libellé de régularisation dans le panel
                const libelleElements = document.querySelectorAll('.cw-regularisation__libelle, .cw-texteNormal.cw-regularisation__libelle');
                
                console.log(`   🔍 ${libelleElements.length} élément(s) de régularisation trouvé(s)`);

                let typeRegularisation = 'AUCUNE';
                let details = '';
                const typesTrouves = [];

                if (libelleElements.length > 0) {
                    // Analyser chaque libellé trouvé
                    libelleElements.forEach((libelle, idx) => {
                        const texte = libelle.textContent.trim();
                        console.log(`   📋 Libellé ${idx + 1}: "${texte}"`);
                        
                        // Détecter le type de régularisation
                        if (texte.includes('RP') || texte.toLowerCase().includes('repos périodique') || texte.toLowerCase().includes('demande de rp')) {
                            typesTrouves.push('RP');
                        } else if (texte.includes('RU') || texte.toLowerCase().includes('repos unique') || texte.toLowerCase().includes('demande de ru')) {
                            typesTrouves.push('RU');
                        } else if (texte.includes('RQ') || texte.toLowerCase().includes('repos qualifié') || texte.toLowerCase().includes('demande de rq')) {
                            typesTrouves.push('RQ');
                        }
                    });

                    if (typesTrouves.length > 0) {
                        // Supprimer les doublons
                        const typesUniques = [...new Set(typesTrouves)];
                        typeRegularisation = typesUniques.join(' + ');
                        details = `${typesUniques.length} régularisation(s) trouvée(s)`;
                    } else {
                        details = 'Régularisation trouvée mais type non reconnu';
                    }
                } else {
                    details = 'Aucun élément de régularisation trouvé dans le panel';
                }

                const resultat = {
                    date: dateFormatee,
                    dataDate: dataDate,
                    type: typeRegularisation,
                    details: details
                };

                resultats.push(resultat);

                // Afficher le résultat dans la console
                console.log(`   ✅ Type détecté: ${typeRegularisation}`);
                if (details) {
                    console.log(`   📝 Détails: ${details}`);
                }
                console.log('');

            } catch (error) {
                console.log(`   ❌ Erreur lors de l'analyse: ${error.message}`);
                resultats.push({
                    date: dateFormatee,
                    dataDate: dataDate,
                    type: 'ERREUR',
                    details: error.message
                });
                console.log('');
            }

            // Pas de pause entre chaque analyse (test sans délai)
            // await new Promise(resolve => setTimeout(resolve, 300));
        }

        // Résumé final
        console.log('═══════════════════════════════════════════════════════════');
        console.log('                    📊 RÉSUMÉ FINAL                        ');
        console.log('═══════════════════════════════════════════════════════════');
        console.log('');

        // Compter les types
        const compteur = {
            'RP': 0,
            'RU': 0,
            'RQ': 0,
            'AUCUNE': 0,
            'ERREUR': 0,
            'AUTRE': 0
        };

        resultats.forEach(r => {
            if (r.type === 'RP') compteur.RP++;
            else if (r.type === 'RU') compteur.RU++;
            else if (r.type === 'RQ') compteur.RQ++;
            else if (r.type === 'ERREUR') compteur.ERREUR++;
            else if (r.type === 'AUCUNE') compteur.AUCUNE++;
            else compteur.AUTRE++;
        });

        console.log(`📅 Total de dates analysées: ${resultats.length}`);
        console.log(`🟢 RP (Repos Périodique): ${compteur.RP}`);
        console.log(`🔵 RU (Repos Unique): ${compteur.RU}`);
        console.log(`🟡 RQ (Repos Qualifié): ${compteur.RQ}`);
        console.log(`⚪ Aucune régularisation: ${compteur.AUCUNE}`);
        if (compteur.ERREUR > 0) {
            console.log(`🔴 Erreurs: ${compteur.ERREUR}`);
        }
        if (compteur.AUTRE > 0) {
            console.log(`🟣 Autres types: ${compteur.AUTRE}`);
        }
        console.log('');

        // Afficher le tableau détaillé
        console.table(resultats);

        console.log('═══════════════════════════════════════════════════════════');
        console.log('');

        // Afficher les compteurs sous les boutons RP, RU, RQ
        afficherCompteursRegularisations(compteur);

        return resultats;
    }

    // Fonction pour ajouter les spinners aux compteurs existants pendant le chargement
    function ajouterSpinnersAuxCompteurs() {
        const compteurs = [
            '.compteur-regularisation-rp',
            '.compteur-regularisation-ru',
            '.compteur-regularisation-rq'
        ];

        compteurs.forEach(selecteur => {
            const compteurElement = document.querySelector(selecteur);
            if (compteurElement) {
                // Vérifier si un spinner n'existe pas déjà
                if (!compteurElement.querySelector('.modern-loading-spinner')) {
                    const spinner = document.createElement('span');
                    spinner.className = 'modern-loading-spinner';
                    spinner.style.marginLeft = '4px';
                    compteurElement.appendChild(spinner);
                    console.log(`⏳ Spinner ajouté au compteur ${selecteur}`);
                }
            }
        });
    }

    // Fonction pour afficher les compteurs de régularisations sous les boutons
    function afficherCompteursRegularisations(compteur) {
        console.log('📊 Mise à jour de l\'affichage des compteurs de régularisations...');

        // Afficher RP
        const rpDisplay = document.querySelector('.solde-display-rp');
        if (rpDisplay) {
            // Vérifier si un compteur existe déjà
            let compteurElement = rpDisplay.parentElement.querySelector('.compteur-regularisation-rp');
            if (!compteurElement && compteur.RP > 0) {
                // Créer le compteur seulement s'il y a des régularisations
                compteurElement = document.createElement('div');
                compteurElement.className = 'compteur-regularisation-rp valeur-cp-calendrier';
                compteurElement.title = 'Régularisations RP détectées';
                rpDisplay.parentElement.appendChild(compteurElement);
            }
            if (compteurElement) {
                // Retirer le spinner s'il existe
                const spinner = compteurElement.querySelector('.modern-loading-spinner');
                if (spinner) {
                    spinner.remove();
                }
                // Mettre à jour le texte
                compteurElement.textContent = compteur.RP > 0 ? `-${compteur.RP}J` : '';
                // Masquer si 0
                compteurElement.style.display = compteur.RP > 0 ? 'block' : 'none';
                console.log(`✅ Compteur RP affiché: -${compteur.RP}J`);
            }
        }

        // Afficher RU
        const ruDisplay = document.querySelector('.solde-display-ru');
        if (ruDisplay) {
            let compteurElement = ruDisplay.parentElement.querySelector('.compteur-regularisation-ru');
            if (!compteurElement && compteur.RU > 0) {
                compteurElement = document.createElement('div');
                compteurElement.className = 'compteur-regularisation-ru valeur-cp-calendrier';
                compteurElement.title = 'Régularisations RU détectées';
                ruDisplay.parentElement.appendChild(compteurElement);
            }
            if (compteurElement) {
                const spinner = compteurElement.querySelector('.modern-loading-spinner');
                if (spinner) {
                    spinner.remove();
                }
                compteurElement.textContent = compteur.RU > 0 ? `-${compteur.RU}J` : '';
                compteurElement.style.display = compteur.RU > 0 ? 'block' : 'none';
                console.log(`✅ Compteur RU affiché: -${compteur.RU}J`);
            }
        }

        // Afficher RQ
        const rqDisplay = document.querySelector('.solde-display-rq');
        if (rqDisplay) {
            let compteurElement = rqDisplay.parentElement.querySelector('.compteur-regularisation-rq');
            if (!compteurElement && compteur.RQ > 0) {
                compteurElement = document.createElement('div');
                compteurElement.className = 'compteur-regularisation-rq valeur-cp-calendrier';
                compteurElement.title = 'Régularisations RQ détectées';
                rqDisplay.parentElement.appendChild(compteurElement);
            }
            if (compteurElement) {
                const spinner = compteurElement.querySelector('.modern-loading-spinner');
                if (spinner) {
                    spinner.remove();
                }
                compteurElement.textContent = compteur.RQ > 0 ? `-${compteur.RQ}J` : '';
                compteurElement.style.display = compteur.RQ > 0 ? 'block' : 'none';
                console.log(`✅ Compteur RQ affiché: -${compteur.RQ}J`);
            }
        }

        // Sauvegarder les compteurs dans le localStorage
        const compteursRegul = {
            RP: compteur.RP,
            RU: compteur.RU,
            RQ: compteur.RQ
        };
        localStorage.setItem('optimum-compteurs-regularisations', JSON.stringify(compteursRegul));
        console.log('💾 Compteurs de régularisations sauvegardés dans le cache');

        // Afficher le calcul Solde - Régularisations
        afficherCalculSoldeApresRegularisations(compteur);

        // Vérifier les soldes et mettre en orange si insuffisant
        verifierSoldesVsRegularisations(compteur);
    }

    // Fonction pour afficher le calcul Solde - Régularisations
    function afficherCalculSoldeApresRegularisations(compteur) {
        console.log('🧮 Calcul du solde après régularisations...');

        // Calculer et afficher pour RP
        const rpDisplay = document.querySelector('.solde-display-rp');
        if (rpDisplay) {
            const soldeText = rpDisplay.textContent.trim();
            const soldeJours = parseSoldeToJours(soldeText);
            
            if (compteur.RP > 0) {
                const resultat = soldeJours - compteur.RP;

                // Ajouter le résultat
                let resultatElement = rpDisplay.parentElement.querySelector('.resultat-apres-regul-rp');
                if (!resultatElement) {
                    resultatElement = document.createElement('div');
                    resultatElement.className = 'resultat-apres-regul-rp';
                    resultatElement.style.cssText = 'font-size: 11px; color: #28a745; font-weight: bold; margin-top: 2px;';
                    resultatElement.title = 'Solde après régularisations';
                    rpDisplay.parentElement.appendChild(resultatElement);
                }
                
                resultatElement.textContent = `${resultat}J`;
                console.log(`✅ RP: ${soldeJours}J - ${compteur.RP}J = ${resultat}J`);
            }
        }

        // Calculer et afficher pour RU
        const ruDisplay = document.querySelector('.solde-display-ru');
        if (ruDisplay) {
            const soldeText = ruDisplay.textContent.trim();
            const soldeJours = parseSoldeToJours(soldeText);
            
            if (compteur.RU > 0) {
                const resultat = soldeJours - compteur.RU;

                // Ajouter le résultat
                let resultatElement = ruDisplay.parentElement.querySelector('.resultat-apres-regul-ru');
                if (!resultatElement) {
                    resultatElement = document.createElement('div');
                    resultatElement.className = 'resultat-apres-regul-ru';
                    resultatElement.style.cssText = 'font-size: 11px; color: #28a745; font-weight: bold; margin-top: 2px;';
                    resultatElement.title = 'Solde après régularisations';
                    ruDisplay.parentElement.appendChild(resultatElement);
                }
                
                resultatElement.textContent = `${resultat}J`;
                console.log(`✅ RU: ${soldeJours}J - ${compteur.RU}J = ${resultat}J`);
            }
        }

        // Calculer et afficher pour RQ
        const rqDisplay = document.querySelector('.solde-display-rq');
        if (rqDisplay) {
            const soldeText = rqDisplay.textContent.trim();
            const soldeJours = parseSoldeToJours(soldeText);
            
            if (compteur.RQ > 0) {
                const resultat = soldeJours - compteur.RQ;

                // Ajouter le résultat
                let resultatElement = rqDisplay.parentElement.querySelector('.resultat-apres-regul-rq');
                if (!resultatElement) {
                    resultatElement = document.createElement('div');
                    resultatElement.className = 'resultat-apres-regul-rq';
                    resultatElement.style.cssText = 'font-size: 11px; color: #28a745; font-weight: bold; margin-top: 2px;';
                    resultatElement.title = 'Solde après régularisations';
                    rqDisplay.parentElement.appendChild(resultatElement);
                }
                
                resultatElement.textContent = `${resultat}J`;
                console.log(`✅ RQ: ${soldeJours}J - ${compteur.RQ}J = ${resultat}J`);
            }
        }

        // Calculer et afficher pour CP
        const cpDisplay = document.querySelector('.solde-display-cp');
        const cpCalendrierElement = cpDisplay ? cpDisplay.parentElement.querySelector('.valeur-cp-calendrier') : null;
        if (cpDisplay) {
            const soldeText = cpDisplay.textContent.trim();
            const soldeJours = parseSoldeToJours(soldeText);
            
            if (cpCalendrierElement) {
                const cpText = cpCalendrierElement.textContent.trim().replace('-', '').replace('J', '');
                const cpCalendrierJours = parseFloat(cpText) || 0;
                
                if (cpCalendrierJours > 0) {
                    const resultat = soldeJours - cpCalendrierJours;

                    // Ajouter le résultat
                    let resultatElement = cpDisplay.parentElement.querySelector('.resultat-apres-regul-cp');
                    if (!resultatElement) {
                        resultatElement = document.createElement('div');
                        resultatElement.className = 'resultat-apres-regul-cp';
                        resultatElement.style.cssText = 'font-size: 11px; color: #28a745; font-weight: bold; margin-top: 2px;';
                        resultatElement.title = 'Solde après CP posés';
                        cpDisplay.parentElement.appendChild(resultatElement);
                    }
                    
                    resultatElement.textContent = `${resultat}J`;
                    console.log(`✅ CP: ${soldeJours}J - ${cpCalendrierJours}J = ${resultat}J`);
                }
            }
        }

        // Sauvegarder les résultats dans le localStorage
        const cpCalendrier = cpDisplay && cpCalendrierElement ? parseFloat(cpCalendrierElement.textContent.trim().replace('-', '').replace('J', '')) || 0 : 0;
        const resultats = {
            RP: rpDisplay && compteur.RP > 0 ? parseSoldeToJours(rpDisplay.textContent.trim()) - compteur.RP : 0,
            RU: ruDisplay && compteur.RU > 0 ? parseSoldeToJours(ruDisplay.textContent.trim()) - compteur.RU : 0,
            RQ: rqDisplay && compteur.RQ > 0 ? parseSoldeToJours(rqDisplay.textContent.trim()) - compteur.RQ : 0,
            CP: cpDisplay && cpCalendrier > 0 ? parseSoldeToJours(cpDisplay.textContent.trim()) - cpCalendrier : 0
        };
        localStorage.setItem('optimum-resultats-regularisations', JSON.stringify(resultats));
        console.log('💾 Résultats sauvegardés dans le cache:', resultats);
    }

    // Fonction pour vérifier les soldes et changer la couleur si insuffisant
    function verifierSoldesVsRegularisations(compteur) {
        console.log('🔍 Vérification des soldes vs régularisations...', compteur);

        // Vérifier RP
        const rpDisplay = document.querySelector('.solde-display-rp');
        if (rpDisplay) {
            const soldeText = rpDisplay.textContent.trim();
            const soldeJours = parseSoldeToJours(soldeText);
            
            if (soldeJours === 0 || !soldeText) {
                console.log('⚠️ RP: Solde non disponible, reste en gris');
                // Ne pas return, continuer pour les autres soldes
            } else {
                // Chercher le compteur de régularisations RP
                let regulJours = compteur.RP || 0;
                
                console.log(`📊 RP: Solde=${soldeJours}J, Régularisations=${regulJours}J`);
                
                if (regulJours > 0) {
                    // Si des régularisations détectées → ORANGE
                    rpDisplay.style.color = '#ff8c00';
                    console.log(`🟠 RP: Régularisations détectées (${regulJours}J) → Orange`);
                } else {
                    // Si aucune régularisation → VERT
                    rpDisplay.style.color = '#28a745';
                    console.log(`🟢 RP: Aucune régularisation détectée → Vert`);
                }
            }
        }

        // Vérifier RU
        const ruDisplay = document.querySelector('.solde-display-ru');
        if (ruDisplay) {
            const soldeText = ruDisplay.textContent.trim();
            const soldeJours = parseSoldeToJours(soldeText);
            
            if (soldeJours === 0 || !soldeText) {
                console.log('⚠️ RU: Solde non disponible, reste en gris');
                // Ne pas return, continuer pour les autres soldes
            } else {
                let regulJours = compteur.RU || 0;
                
                console.log(`📊 RU: Solde=${soldeJours}J, Régularisations=${regulJours}J`);
                
                if (regulJours > 0) {
                    // Si des régularisations détectées → ORANGE
                    ruDisplay.style.color = '#ff8c00';
                    console.log(`🟠 RU: Régularisations détectées (${regulJours}J) → Orange`);
                } else {
                    // Si aucune régularisation → VERT
                    ruDisplay.style.color = '#28a745';
                    console.log(`🟢 RU: Aucune régularisation détectée → Vert`);
                }
            }
        }

        // Vérifier RQ
        const rqDisplay = document.querySelector('.solde-display-rq');
        if (rqDisplay) {
            const soldeText = rqDisplay.textContent.trim();
            const soldeJours = parseSoldeToJours(soldeText);
            
            if (soldeJours === 0 || !soldeText) {
                console.log('⚠️ RQ: Solde non disponible, reste en gris');
                // Ne pas return, continuer pour les autres soldes
            } else {
                let regulJours = compteur.RQ || 0;
                
                console.log(`📊 RQ: Solde=${soldeJours}J, Régularisations=${regulJours}J`);
                
                if (regulJours > 0) {
                    // Si des régularisations détectées → ORANGE
                    rqDisplay.style.color = '#ff8c00';
                    console.log(`🟠 RQ: Régularisations détectées (${regulJours}J) → Orange`);
                } else {
                    // Si aucune régularisation → VERT
                    rqDisplay.style.color = '#28a745';
                    console.log(`🟢 RQ: Aucune régularisation détectée → Vert`);
                }
            }
        }

        // Vérifier CP (si applicable)
        const cpDisplay = document.querySelector('.solde-display-cp');
        if (cpDisplay) {
            const soldeText = cpDisplay.textContent.trim();
            const soldeJours = parseSoldeToJours(soldeText);
            
            if (soldeJours === 0 || !soldeText) {
                console.log('⚠️ CP: Solde non disponible, reste en gris');
                // Ne pas return, fin de la fonction
            } else {
                const cpCalendrierCP = cpDisplay.parentElement.querySelector('.valeur-cp-calendrier');
                if (cpCalendrierCP) {
                    const cpText = cpCalendrierCP.textContent.trim().replace('-', '').replace('J', '');
                    const cpCalendrierJours = parseFloat(cpText) || 0;
                    
                    console.log(`📊 CP: Solde=${soldeJours}J, CP Calendrier=${cpCalendrierJours}J`);
                    
                    if (cpCalendrierJours > 0) {
                        // Si des CP posés → ORANGE
                        cpDisplay.style.color = '#ff8c00';
                        console.log(`🟠 CP: CP posés détectés (${cpCalendrierJours}J) → Orange`);
                    } else {
                        // Si aucun CP posé → VERT
                        cpDisplay.style.color = '#28a745';
                        console.log(`🟢 CP: Aucun CP posé → Vert`);
                    }
                } else {
                    // Pas de compteur CP → VERT
                    cpDisplay.style.color = '#28a745';
                    console.log(`🟢 CP: Aucun CP posé → Vert`);
                }
            }
        }
    }

    // Fonction pour charger et afficher les compteurs depuis le cache au démarrage
    function chargerCompteursRegularisationsDepuisCache() {
        const cachedCompteurs = localStorage.getItem('optimum-compteurs-regularisations');
        if (cachedCompteurs) {
            try {
                const compteurs = JSON.parse(cachedCompteurs);
                console.log('📦 Chargement des compteurs de régularisations depuis le cache:', compteurs);

                // Afficher RP
                const rpDisplay = document.querySelector('.solde-display-rp');
                if (rpDisplay && compteurs.RP > 0) {
                    let compteurElement = rpDisplay.parentElement.querySelector('.compteur-regularisation-rp');
                    if (!compteurElement) {
                        compteurElement = document.createElement('div');
                        compteurElement.className = 'compteur-regularisation-rp valeur-cp-calendrier';
                        compteurElement.title = 'Régularisations RP détectées (cache)';
                        rpDisplay.parentElement.appendChild(compteurElement);
                    }
                    compteurElement.innerHTML = ''; // Vider d'abord
                    compteurElement.textContent = `-${compteurs.RP}J `;
                    compteurElement.style.display = 'block';
                    // Ajouter le spinner à droite
                    const spinner = document.createElement('span');
                    spinner.className = 'modern-loading-spinner';
                    spinner.style.marginLeft = '4px';
                    compteurElement.appendChild(spinner);
                }

                // Afficher RU
                const ruDisplay = document.querySelector('.solde-display-ru');
                if (ruDisplay && compteurs.RU > 0) {
                    let compteurElement = ruDisplay.parentElement.querySelector('.compteur-regularisation-ru');
                    if (!compteurElement) {
                        compteurElement = document.createElement('div');
                        compteurElement.className = 'compteur-regularisation-ru valeur-cp-calendrier';
                        compteurElement.title = 'Régularisations RU détectées (cache)';
                        ruDisplay.parentElement.appendChild(compteurElement);
                    }
                    compteurElement.innerHTML = '';
                    compteurElement.textContent = `-${compteurs.RU}J `;
                    compteurElement.style.display = 'block';
                    const spinner = document.createElement('span');
                    spinner.className = 'modern-loading-spinner';
                    spinner.style.marginLeft = '4px';
                    compteurElement.appendChild(spinner);
                }

                // Afficher RQ
                const rqDisplay = document.querySelector('.solde-display-rq');
                if (rqDisplay && compteurs.RQ > 0) {
                    let compteurElement = rqDisplay.parentElement.querySelector('.compteur-regularisation-rq');
                    if (!compteurElement) {
                        compteurElement = document.createElement('div');
                        compteurElement.className = 'compteur-regularisation-rq valeur-cp-calendrier';
                        compteurElement.title = 'Régularisations RQ détectées (cache)';
                        rqDisplay.parentElement.appendChild(compteurElement);
                    }
                    compteurElement.innerHTML = '';
                    compteurElement.textContent = `-${compteurs.RQ}J `;
                    compteurElement.style.display = 'block';
                    const spinner = document.createElement('span');
                    spinner.className = 'modern-loading-spinner';
                    spinner.style.marginLeft = '4px';
                    compteurElement.appendChild(spinner);
                }

                return true;
            } catch (error) {
                console.error('❌ Erreur lors du chargement des compteurs depuis le cache:', error);
                return false;
            }
        }
        return false;
    }

    // Fonction pour charger et afficher les résultats depuis le cache au démarrage
    function chargerResultatsRegularisationsDepuisCache() {
        const cachedResultats = localStorage.getItem('optimum-resultats-regularisations');
        const cachedCompteurs = localStorage.getItem('optimum-compteurs-regularisations');
        
        if (cachedResultats) {
            try {
                const resultats = JSON.parse(cachedResultats);
                const compteurs = cachedCompteurs ? JSON.parse(cachedCompteurs) : { RP: 0, RU: 0, RQ: 0 };
                console.log('📦 Chargement des résultats de régularisations depuis le cache:', resultats);

                // Afficher résultat RP
                const rpDisplay = document.querySelector('.solde-display-rp');
                if (rpDisplay && compteurs.RP > 0 && resultats.RP !== undefined) {
                    let resultatElement = rpDisplay.parentElement.querySelector('.resultat-apres-regul-rp');
                    if (!resultatElement) {
                        resultatElement = document.createElement('div');
                        resultatElement.className = 'resultat-apres-regul-rp';
                        resultatElement.style.cssText = 'font-size: 11px; color: #28a745; font-weight: bold; margin-top: 2px;';
                        resultatElement.title = 'Solde après régularisations (cache)';
                        rpDisplay.parentElement.appendChild(resultatElement);
                    }
                    resultatElement.textContent = `${resultats.RP}J`;
                }

                // Afficher résultat RU
                const ruDisplay = document.querySelector('.solde-display-ru');
                if (ruDisplay && compteurs.RU > 0 && resultats.RU !== undefined) {
                    let resultatElement = ruDisplay.parentElement.querySelector('.resultat-apres-regul-ru');
                    if (!resultatElement) {
                        resultatElement = document.createElement('div');
                        resultatElement.className = 'resultat-apres-regul-ru';
                        resultatElement.style.cssText = 'font-size: 11px; color: #28a745; font-weight: bold; margin-top: 2px;';
                        resultatElement.title = 'Solde après régularisations (cache)';
                        ruDisplay.parentElement.appendChild(resultatElement);
                    }
                    resultatElement.textContent = `${resultats.RU}J`;
                }

                // Afficher résultat RQ
                const rqDisplay = document.querySelector('.solde-display-rq');
                if (rqDisplay && compteurs.RQ > 0 && resultats.RQ !== undefined) {
                    let resultatElement = rqDisplay.parentElement.querySelector('.resultat-apres-regul-rq');
                    if (!resultatElement) {
                        resultatElement = document.createElement('div');
                        resultatElement.className = 'resultat-apres-regul-rq';
                        resultatElement.style.cssText = 'font-size: 11px; color: #28a745; font-weight: bold; margin-top: 2px;';
                        resultatElement.title = 'Solde après régularisations (cache)';
                        rqDisplay.parentElement.appendChild(resultatElement);
                    }
                    resultatElement.textContent = `${resultats.RQ}J`;
                }

                // Afficher résultat CP
                const cpDisplay = document.querySelector('.solde-display-cp');
                const cpCalendrierElement = cpDisplay ? cpDisplay.parentElement.querySelector('.valeur-cp-calendrier') : null;
                if (cpDisplay && cpCalendrierElement && resultats.CP !== undefined && resultats.CP !== 0) {
                    let resultatElement = cpDisplay.parentElement.querySelector('.resultat-apres-regul-cp');
                    if (!resultatElement) {
                        resultatElement = document.createElement('div');
                        resultatElement.className = 'resultat-apres-regul-cp';
                        resultatElement.style.cssText = 'font-size: 11px; color: #28a745; font-weight: bold; margin-top: 2px;';
                        resultatElement.title = 'Solde après CP posés (cache)';
                        cpDisplay.parentElement.appendChild(resultatElement);
                    }
                    resultatElement.textContent = `${resultats.CP}J`;
                }

                return true;
            } catch (error) {
                console.error('❌ Erreur lors du chargement des résultats depuis le cache:', error);
                return false;
            }
        }
        return false;
    }

    // Exposer la fonction globalement
    window.analyserRegularisationsParDate = analyserRegularisationsParDate;

    // Observer les changements dans le calendrier pour recalculer les CP automatiquement
    const calendrierObserver = new MutationObserver(function(mutations) {
        // Vérifier si des cellules d'absence ont changé
        const hasAbsenceChanges = mutations.some(mutation => {
            if (mutation.type === 'childList' || mutation.type === 'attributes') {
                const target = mutation.target;
                if (target.classList && 
                    (target.classList.contains('phx-cell-render-text') || 
                     target.classList.contains('phx-cell-render') ||
                     target.classList.contains('phx-dynamicStyle-cell-absaval'))) {
                    return true;
                }
            }
            return false;
        });
        
        if (hasAbsenceChanges) {
            console.log('🔄 Changement détecté dans le calendrier, recalcul des CP...');
            // Attendre un peu pour que le DOM soit stabilisé
            setTimeout(afficherCPCalendrierSousBouton, 500);
        }
    });

    // Démarrer l'observation du calendrier (chercher la zone du calendrier)
    const startCalendrierObserver = function() {
        const calendrierZone = document.querySelector('.phx-agenda-calendrier, .phx-calendar, .phx-agenda-accesrapides');
        if (calendrierZone) {
            calendrierObserver.observe(calendrierZone, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: ['class']
            });
            console.log('👁️ Observation du calendrier activée pour le calcul automatique des CP');
        }
    };

    // Fonction pour supprimer les boutons personnalisés (avant réinsertion)
    function removeCustomButtons() {
        const group = document.querySelector('.phx-custom-buttons-group');
        if (group) group.remove();
    }

    // Fonction pour insérer les boutons selon la config utilisateur
    function insertButtons() {
        // D'abord vérifier si le bouton "Nouveau" existe (condition pour afficher nos boutons)
        const nouveauButton = document.querySelector('.agenda_acmcreercmb button, button.dropReg, button.creerAb');
        if (!nouveauButton) {
            console.log('Bouton "Nouveau" non trouvé, pas d\'affichage des boutons personnalisés');
            return;
        }
        console.log('Bouton "Nouveau" détecté, vérification du conteneur...');
        waitForElement('.phx-agenda-accesrapides', function(container) {
            console.log('Zone phx-agenda-accesrapides trouvée, ajout des boutons personnalisés...');
            // Vérifier si les boutons n'existent pas déjà
            if (document.querySelector('.phx-custom-buttons-group')) {
                console.log('Les boutons personnalisés existent déjà');
                return;
            }
            // Créer un conteneur pour les boutons avec la classe btn-group
            const buttonContainer = document.createElement('div');
            buttonContainer.className = 'btn-group phx-custom-buttons-group order-4';
            buttonContainer.setAttribute('role', 'group');
            buttonContainer.setAttribute('aria-label', 'Boutons personnalisés');
            buttonContainer.style.cssText = 'display: flex; flex-direction: row; gap: 8px; margin-left: 8px;';

            // Charger la config utilisateur
            const boutonsActifs = chargerConfigBoutons();
            // Ajouter les boutons sélectionnés
            boutonsActifs.forEach(key => {
                if (key === 'RP') buttonContainer.appendChild(createButton('RP', 'btn-rp-custom', false));
                if (key === 'RU') buttonContainer.appendChild(createButton('RU', 'btn-ru-custom', false));
                if (key === 'CP') buttonContainer.appendChild(createButton('CP', 'btn-cp-custom', true, 'UC'));
                if (key === 'RQ') buttonContainer.appendChild(createButton('RQ', 'btn-rq-custom', true));
                if (key === 'RN') buttonContainer.appendChild(createButton('RN', 'btn-rn-custom', false, 'Don repos nuit rn'));
            });

            // Insérer le conteneur dans la zone phx-agenda-accesrapides
            const accesRapides = document.querySelector('.phx-agenda-accesrapides');
            if (accesRapides) {
                accesRapides.appendChild(buttonContainer);
                console.log('Boutons personnalisés ajoutés avec succès dans phx-agenda-accesrapides');
                // Charger immédiatement les soldes depuis le cache
                const hasCachedData = loadSoldesFromCache();
                if (hasCachedData) {
                    console.log('✅ Soldes du cache affichés, requête API en cours...');
                }
                // Charger immédiatement les compteurs de régularisations depuis le cache
                chargerCompteursRegularisationsDepuisCache();
                // Charger immédiatement les résultats depuis le cache
                chargerResultatsRegularisationsDepuisCache();
                
                // Lancer la requête API après un court délai
                setTimeout(function() {
                    console.log('🔄 Chargement des soldes depuis l\'API...');
                    executeApiRequests();
                }, 500);
                
                // Calculer et afficher les CP depuis le calendrier après un délai
                setTimeout(function() {
                    console.log('🔄 Calcul des CP depuis le calendrier...');
                    afficherCPCalendrierSousBouton();
                    startCalendrierObserver();
                    
                    // Récupérer et afficher les cellules clignotantes
                    setTimeout(function() {
                        recupererCellulesClignotantes();
                    }, 1000);
                }, 1500);
                
                // Actualiser automatiquement toutes les 15 minutes (900000 ms)
                setInterval(function() {
                    console.log('🔄 Actualisation automatique des soldes (toutes les 15 min)...');
                    // Afficher les spinners pendant l'actualisation
                    const rpDisplay = document.querySelector('.solde-display-rp');
                    const ruDisplay = document.querySelector('.solde-display-ru');
                    const cpDisplay = document.querySelector('.solde-display-cp');
                    const rqDisplay = document.querySelector('.solde-display-rq');
                    const rnDisplay = document.querySelector('.solde-display-rn');
                    [rpDisplay, ruDisplay, cpDisplay, rqDisplay, rnDisplay].forEach(display => {
                        if (display && display.textContent.trim()) {
                            if (!display.querySelector('.modern-loading-spinner')) {
                                const spinner = document.createElement('span');
                                spinner.className = 'modern-loading-spinner';
                                spinner.style.marginLeft = '4px';
                                display.appendChild(spinner);
                                display.style.color = '#6c757d';
                            }
                        }
                    });
                    executeApiRequests();
                }, 900000);
            } else {
                console.log('Zone phx-agenda-accesrapides non trouvée');
            }
        });
    }

    // Observer les changements dans le DOM pour réagir au chargement dynamique
    const observer = new MutationObserver(function(mutations) {
        // N'ajouter les boutons que si le bouton "Nouveau" est présent
        const nouveauPresent = document.querySelector('.agenda_acmcreercmb button, button.dropReg, button.creerAb');
        const containeurPresent = document.querySelector('.phx-agenda-accesrapides');
        const boutonsAbsents = !document.querySelector('.btn-rp-custom');

        if (nouveauPresent && containeurPresent && boutonsAbsents) {
            insertButtons();
            // Calculer et afficher les CP depuis le calendrier
            setTimeout(afficherCPCalendrierSousBouton, 1000);
        }
    });

    // Observer pour détecter l'apparition du titre "Agenda" et lancer l'analyse automatiquement
    let analyseLancee = false;
    const agendaObserver = new MutationObserver(function(mutations) {
        if (analyseLancee) return; // Ne lancer qu'une seule fois
        
        const titreAgenda = document.querySelector('.cw-header-usecase-title.d-flex');
        if (titreAgenda && titreAgenda.textContent.trim() === 'Agenda') {
            console.log('📅 Titre "Agenda" détecté, lancement de l\'analyse dans 3 secondes...');
            analyseLancee = true;
            
            setTimeout(function() {
                console.log('🚀 Lancement automatique de l\'analyse des régularisations...');
                analyserRegularisationsParDate();
            }, 3000);
            
            // Arrêter l'observation une fois l'analyse lancée
            agendaObserver.disconnect();
        }
    });

    // Démarrer l'observation
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // Démarrer l'observation pour le titre Agenda
    agendaObserver.observe(document.body, {
        childList: true,
        subtree: true
    });

    // Tenter d'insérer les boutons immédiatement
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            insertButtons();
            setTimeout(afficherCPCalendrierSousBouton, 1500);
        });
    } else {
        insertButtons();
        setTimeout(afficherCPCalendrierSousBouton, 1500);
    }

})();
