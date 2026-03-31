    (function() {
        'use strict';

        console.log('🚀 Script Optimum - Boutons personnalisés chargé');
        console.log('⌨️  Raccourcis disponibles:');
        console.log('   - Ctrl+Alt+R : Configurer les boutons affichés');
        console.log('   - Ctrl+Alt+A : Analyser les régularisations (RP/RU) dans l\'agenda');

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
            // Raccourci Ctrl+Alt+A pour analyser les régularisations
            if (e.ctrlKey && e.altKey && e.key.toLowerCase() === 'a') {
                analyserRegularisationsAgenda();
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
                color: #28a745;
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

        // Fonction pour exécuter les requêtes API
        async function executeApiRequests() {
            console.log('🚀 Début de l\'exécution des requêtes API...');

            try {
                // Récupérer le x_token_key
                const xTokenKey = getTokenKey();
                if (!xTokenKey) {
                    console.error('❌ Token x_token_key non trouvé');
                    return;
                }

                console.log('✅ Token trouvé:', xTokenKey);

                // Récupérer le matricule
                const matricule = getMatricule();
                const groupe = 'MS_C';
                const dateEndOfYear = getEndOfYearDate();
                const dateToday = getFormattedDate();

                // Troisième requête - Détails des compteurs (fin d'année pour RP, RU, CP)
                console.log(`📡 [1/2] Requête détails fin d'année (RP, RU, CP)...`);
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
                    throw new Error(`Erreur requête fin d'année: ${response3.status}`);
                }

                const data3 = await response3.json();

                // Quatrième requête - Détails RN à la date d'aujourd'hui
                console.log(`📡 [2/2] Requête RN aujourd'hui...`);
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
                    throw new Error(`Erreur requête RN: ${response4.status}`);
                }

                const data4 = await response4.json();

                console.log('✅ Requêtes API terminées avec succès');

                // Mettre à jour l'affichage des soldes
                updateSoldesFromAPI(data3, data4);

            } catch (error) {
                console.error('❌ Erreur lors de l\'exécution des requêtes API:', error);
            }
        }

        // Fonction pour analyser les données d'agenda et compter les régularisations
        async function analyserRegularisationsAgenda() {
            try {
                const xTokenKey = getTokenKey();
                const matricule = getMatricule();

                if (!xTokenKey || !matricule) {
                    console.error('❌ Token ou matricule manquant');
                    return;
                }

                // Requête vers l'API agenda
                const today = new Date();
                const year = today.getFullYear();
                const dateDebut = `${year}0101`;
                const dateFin = `${year}1231`;
                const url = `https://optimum.sncf.fr/chronotime/rest/agenda/${dateDebut}%2C${dateFin}%2C${matricule}?type=0%2C1%2C2%2C3%2C4%2C5%2C6%2C8%2C9%2C10%2C11%2C7%3A0%3B1%3B2%3B3%3B4%3B5%3B6%3B8%3B10&combos=1`;

                console.log('📡 Récupération des données agenda...');
                console.log(`URL: ${url}`);

                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'accept': 'application/json',
                        'content-type': 'application/json',
                        'gfi-context': '{"onglet": "agenda", "fonc_cour": "COL_AGANNU", "nat_gest": ""}',
                        'x_token_key': xTokenKey
                    },
                    credentials: 'include'
                });

                if (!response.ok) {
                    throw new Error(`Erreur API: ${response.status}`);
                }

                const data = await response.json();
                console.log('📊 Données agenda récupérées');
                console.log('📊 Type de données:', Array.isArray(data) ? 'Array' : typeof data);
                console.log('📊 Nombre d\'éléments:', Array.isArray(data) ? data.length : Object.keys(data).length);

                // ANALYSE CIBLÉE sur data.evt["4"]
                const simplePattern = `${matricule}REGCALDEM`;
                console.log('🔍 ═══ ANALYSE DES RÉGULARISATIONS ═══');
                console.log(`🎯 Recherche de: "${simplePattern}"`);

                let trouvailles = [];

                // Accès direct à la zone identifiée : data.evt["4"]
                if (data.evt && data.evt["4"] && Array.isArray(data.evt["4"])) {
                    const joursAvecEvents = data.evt["4"];
                    console.log(`📅 ${joursAvecEvents.length} jour(s) avec événements trouvés`);

                    joursAvecEvents.forEach((jour, jourIndex) => {
                        if (jour.evt && Array.isArray(jour.evt)) {
                            jour.evt.forEach((event, eventIndex) => {
                                if (event.uid && event.uid.includes(simplePattern)) {
                                    console.log(`✅ Trouvé: ${event.uid} (code: ${event.cod})`);
                                    trouvailles.push({
                                        chemin: `data.evt.4[${jourIndex}].evt[${eventIndex}]`,
                                        propriete: 'uid',
                                        valeur: event.uid,
                                        objetComplet: event
                                    });
                                }
                            });
                        }
                    });
                }

                console.log(`\n🎯 RÉSULTAT: ${trouvailles.length} régularisation(s) trouvée(s)`);
                console.log('═══════════════════════════════════════════════════\n');

            // Traiter les trouvailles pour classifier RP/RU
            const pattern = new RegExp(`${matricule}REGCALDEM(\\d+)`);
            let detailsRegularisations = {
                RP: [],
                RU: [],
                autres: []
            };

            trouvailles.forEach(t => {
                const match = t.valeur.match(pattern);
                if (match) {
                    const numeroID = match[1];
                    const obj = t.objetComplet;

                    // Extraire le code et la date
                    const code = obj.cod || obj.code;
                    const date = obj.dts?.deb || obj.dts?.fin || obj.dat;

                    const itemDetails = {
                        uid: t.valeur,
                        numeroID: numeroID,
                        code: code,
                        date: date,
                        libelle: obj.libelle || obj.libMotif || '',
                        val: obj.val || null,
                        dts: obj.dts || null,
                        chemin: t.chemin
                    };

                    if (code === 70 || code === '70') {
                        detailsRegularisations.RP.push(itemDetails);
                    } else if (code === 71 || code === '71') {
                        detailsRegularisations.RU.push(itemDetails);
                    } else {
                        detailsRegularisations.autres.push(itemDetails);
                    }
                }
            });

            // Afficher les résultats finaux
            const compteurTotal = trouvailles.length;
            console.log('═══════════════════════════════════════════════════');
            console.log(`📊 RÉSULTAT FINAL`);
            console.log(`📊 Total: ${compteurTotal} régularisation(s)`);
            console.log(`   ✅ RP (code 70): ${detailsRegularisations.RP.length}`);
            console.log(`   ✅ RU (code 71): ${detailsRegularisations.RU.length}`);
            if (detailsRegularisations.autres.length > 0) {
                console.log(`   ⚠️ Autres: ${detailsRegularisations.autres.length}`);
            }
            console.log('═══════════════════════════════════════════════════');

            // Afficher les compteurs sous les boutons RP et RU
            afficherCompteursRegularisations(detailsRegularisations.RP.length, detailsRegularisations.RU.length);

            // Afficher résumé des régularisations trouvées
            if (detailsRegularisations.RP.length > 0) {
                console.log(`\n📋 Régularisations Positives (RP):`);
                detailsRegularisations.RP.forEach((reg, i) => {
                    const dateFormatted = reg.date ? `${reg.date.substring(6,8)}/${reg.date.substring(4,6)}/${reg.date.substring(0,4)}` : 'N/A';
                    console.log(`   ${i+1}. ${dateFormatted} - ${reg.val || '1'}J (ID: ${reg.numeroID})`);
                });
            }

            if (detailsRegularisations.RU.length > 0) {
                console.log(`\n📋 Régularisations Usuelles (RU):`);
                detailsRegularisations.RU.forEach((reg, i) => {
                    const dateFormatted = reg.date ? `${reg.date.substring(6,8)}/${reg.date.substring(4,6)}/${reg.date.substring(0,4)}` : 'N/A';
                    console.log(`   ${i+1}. ${dateFormatted} - ${reg.val || '1'}J (ID: ${reg.numeroID})`);
                });
            }

            if (detailsRegularisations.autres.length > 0) {
                console.log(`\n⚠️ Autres régularisations trouvées: ${detailsRegularisations.autres.length}`);
            }

                console.log('═══════════════════════════════════════════════════');
                console.log('💡 Appuyez sur Ctrl+Alt+A pour relancer cette analyse');

                return {
                    total: compteurTotal,
                    details: detailsRegularisations
                };

            } catch (error) {
                console.error('❌ Erreur lors de l\'analyse:', error);
                console.log('Détails de l\'erreur:', error.message);
            }
        }

        // Fonction pour convertir le format "95j00" ou "95J" en nombre de jours
        function parseSoldeToJours(solde) {
            const match = solde.match(/(\d+)[jJ]/);
            return match ? parseInt(match[1], 10) : 0;
        }

        // Fonction pour charger les soldes depuis le localStorage
        function loadSoldesFromCache() {
            const cachedSoldes = localStorage.getItem('optimum-soldes');
            if (cachedSoldes) {
                try {
                    const soldes = JSON.parse(cachedSoldes);
                    console.log('📦 Chargement des soldes depuis le cache:', soldes);

                    const rpDisplay = document.querySelector('.solde-display-rp');
                    const ruDisplay = document.querySelector('.solde-display-ru');
                    const cpDisplay = document.querySelector('.solde-display-cp');
                    const rqDisplay = document.querySelector('.solde-display-rq');
                    const rnDisplay = document.querySelector('.solde-display-rn');

                    if (rpDisplay && soldes.RP) {
                        rpDisplay.innerHTML = '';
                        rpDisplay.textContent = soldes.RP + ' ';
                        rpDisplay.style.color = '#6c757d';
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

            // Trouver les soldes dans les données
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
                rpDisplay.innerHTML = '';
                rpDisplay.textContent = soldes.RP;
                rpDisplay.style.color = '#28a745';
                console.log('✅ Solde RP affiché:', soldes.RP);
            }

            if (ruDisplay && soldes.RU) {
                ruDisplay.innerHTML = '';
                ruDisplay.textContent = soldes.RU;
                ruDisplay.style.color = '#28a745';
                console.log('✅ Solde RU affiché:', soldes.RU);
            }

            if (cpDisplay && soldes.CP) {
                cpDisplay.innerHTML = '';
                cpDisplay.textContent = soldes.CP;
                cpDisplay.style.color = '#28a745';
                console.log('✅ Solde CP affiché:', soldes.CP);
            }

            if (rqDisplay && soldes.RQ) {
                rqDisplay.innerHTML = '';
                rqDisplay.textContent = soldes.RQ;
                rqDisplay.style.color = '#28a745';
                console.log('✅ Solde RQ affiché:', soldes.RQ);
            }

            if (rnDisplay && soldes.RN) {
                rnDisplay.innerHTML = '';
                rnDisplay.textContent = soldes.RN;
                rnDisplay.style.color = '#28a745';
                console.log('✅ Solde RN affiché:', soldes.RN);
            }
        }

        // Fonction pour récupérer le matricule de l'utilisateur
        function getMatricule() {
            // Méthode 0a: Utiliser le matricule saisi manuellement par l'utilisateur
            const userSavedMatricule = localStorage.getItem('optimum-matricule-user');
            if (userSavedMatricule && /^\d{7}$/.test(userSavedMatricule)) {
                console.log('✅ Matricule trouvé dans la sauvegarde utilisateur:', userSavedMatricule);
                cachedMatricule = userSavedMatricule;
                return userSavedMatricule;
            }

            // Méthode 0b: Utiliser le matricule intercepté
            if (cachedMatricule) {
                console.log('✅ Matricule trouvé dans les requêtes interceptées:', cachedMatricule);
                return cachedMatricule;
            }

            // Méthode 1: Chercher dans l'URL
            const urlMatch = window.location.href.match(/matricule[=\/](\d{7})/);
            if (urlMatch) {
                console.log('✅ Matricule trouvé dans l\'URL:', urlMatch[1]);
                cachedMatricule = urlMatch[1];
                return urlMatch[1];
            }

            // Autres méthodes...
            console.warn('⚠️ Matricule non trouvé automatiquement. Ouverture du popup de saisie...');
            askMatriculePopup();
            return null;
        }

        // Popup de saisie du matricule
        function askMatriculePopup() {
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

            function saveMatricule() {
                const val = input.value.trim();
                if (!/^\d{7}$/.test(val)) {
                    errorDiv.style.display = 'block';
                    input.focus();
                    return;
                }
                errorDiv.style.display = 'none';
                localStorage.setItem('optimum-matricule-user', val);
                cachedMatricule = val;
                console.log('✅ Matricule saisi et enregistré:', val);
                document.body.removeChild(overlay);
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
            return `${year}1231`;
        }

        // Variable globale pour stocker le token et matricule interceptés
        let cachedToken = null;
        let cachedMatricule = null;

        // Intercepter les requêtes fetch pour capturer le token ET le matricule
        const originalFetch = window.fetch;
        window.fetch = function(...args) {
            const [url, options] = args;

            if (options && options.headers) {
                const headers = options.headers;
                if (headers['x_token_key']) {
                    cachedToken = headers['x_token_key'];
                    console.log('Token intercepté depuis fetch:', cachedToken);
                }
            }

            if (typeof url === 'string') {
                const matriculeMatch = url.match(/[?&]matricule=(\d{7})/);
                if (matriculeMatch) {
                    cachedMatricule = matriculeMatch[1];
                    console.log('✅ Matricule intercepté depuis une requête API:', cachedMatricule);
                }
            }

            return originalFetch.apply(this, args);
        };

        // Intercepter XMLHttpRequest
        const originalOpen = XMLHttpRequest.prototype.open;
        const originalSetRequestHeader = XMLHttpRequest.prototype.setRequestHeader;

        XMLHttpRequest.prototype.open = function(method, url, ...rest) {
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

        // Fonction pour récupérer le token
        function getTokenKey() {
            console.log('Recherche du token x_token_key...');

            if (cachedToken) {
                console.log('Token trouvé dans le cache:', cachedToken);
                return cachedToken;
            }

            const localToken = localStorage.getItem('x_token_key') || sessionStorage.getItem('x_token_key');
            if (localToken) {
                console.log('Token trouvé dans localStorage/sessionStorage');
                return localToken;
            }

            if (window.x_token_key) {
                console.log('Token trouvé dans window.x_token_key');
                return window.x_token_key;
            }

            console.error('❌ Token non trouvé.');
            return null;
        }

        // Fonction pour simuler la création d'une régularisation (RP/RU)
        function createRegularisation(motifCode) {
            console.log(`Tentative de création de régularisation avec motif: ${motifCode}...`);

            let nouveauButton = document.querySelector('.agenda_acmcreercmb button.dropReg');

            if (!nouveauButton) {
                nouveauButton = document.querySelector('.agenda_acmcreercmb button.creerAb');
            }
            if (!nouveauButton) {
                nouveauButton = document.querySelector('.agenda_acmcreercmb button');
            }

            if (nouveauButton) {
                console.log('Bouton "Nouveau" trouvé:', nouveauButton);
                nouveauButton.click();

                let attempts = 0;
                const maxAttempts = 10;

                const checkMenu = setInterval(function() {
                    let creerRegButton = document.querySelector('li.dropReg.c-panneauMenu__item.cwMenuButton-option');

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
                console.log('Bouton "Nouveau" non trouvé');
            }
        }

        // Fonction pour simuler la création d'une absence
        function createAbsence(motifCode) {
            console.log(`Tentative de création d'absence avec motif: ${motifCode}...`);

            let nouveauButton = document.querySelector('.agenda_acmcreercmb button.dropReg');

            if (!nouveauButton) {
                nouveauButton = document.querySelector('.agenda_acmcreercmb button.creerAb');
            }
            if (!nouveauButton) {
                nouveauButton = document.querySelector('.agenda_acmcreercmb button');
            }

            if (nouveauButton) {
                console.log('Bouton "Nouveau" trouvé:', nouveauButton);
                nouveauButton.click();

                let attempts = 0;
                const maxAttempts = 10;

                const checkMenu = setInterval(function() {
                    let creerAbsButton = document.querySelector('li.creerAb.c-panneauMenu__item.cwMenuButton-option');

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
                console.log('Bouton "Nouveau" non trouvé');
            }
        }

        // Fonction pour remplir le champ motif
        function fillMotifCode(code) {
            console.log(`Remplissage du champ motif avec: ${code}`);

            let motifInput = document.querySelector('input[class*="motif.code"]');

            if (!motifInput) {
                motifInput = document.querySelector('input.c-cwComboBoxView2__input[id^="motif.code"]');
            }

            if (motifInput) {
                console.log('Input motif trouvé:', motifInput);

                motifInput.focus();
                motifInput.value = code;

                const inputEvent = new Event('input', { bubbles: true });
                motifInput.dispatchEvent(inputEvent);

                const keyupEvent = new KeyboardEvent('keyup', { bubbles: true, key: code });
                motifInput.dispatchEvent(keyupEvent);

                console.log(`Valeur "${code}" entrée dans le champ motif`);

                let attempts = 0;
                const maxAttempts = 15;

                const checkSuggestions = setInterval(function() {
                    const suggestions = document.querySelectorAll('.ui-autocomplete li.ui-menu-item, .ui-autocomplete .ui-menu-item');

                    if (suggestions.length > 0) {
                        clearInterval(checkSuggestions);
                        console.log(`${suggestions.length} suggestion(s) trouvée(s), sélection de la première...`);

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

            const cellulesAbsences = document.querySelectorAll('.phx-cell-render-text.phx-dynamicStyle-cell-absaval');

            if (cellulesAbsences.length === 0) {
                console.log('⚠️ Aucune cellule d\'absence trouvée dans le calendrier');
                return 0;
            }

            console.log(`📊 ${cellulesAbsences.length} cellule(s) d'absence trouvée(s)`);

            let totalJours = 0;

            cellulesAbsences.forEach((cellule, index) => {
                const celluleParente = cellule.closest('.phx-cell-render');

                if (!celluleParente) return;

                const celluleAbs = celluleParente.querySelector('.phx-dynamicStyle-cell-abs_COR.phx-cell-abs-aval');

                if (!celluleAbs) return;

                console.log(`  📅 Cellule ${index + 1}:`);

                const hasLeft = celluleParente.querySelector('.phx-cell-render-left');
                const hasRight = celluleParente.querySelector('.phx-cell-render-right');
                const hasWhite = celluleParente.querySelector('.ui-phx-color-blanc_5');
                const hasDynamicAbsLeft = celluleParente.querySelector('.phx-cell-render-left.phx-dynamicStyle-cell-abs_COR');
                const hasDynamicAbsRight = celluleParente.querySelector('.phx-cell-render-right.phx-dynamicStyle-cell-abs_COR');

                if (hasWhite && (hasDynamicAbsLeft || hasDynamicAbsRight)) {
                    totalJours += 0.5;
                    console.log(`    ➡️ Demi-journée détectée (+0.5J)`);
                }
                else if (!hasLeft && !hasRight) {
                    totalJours += 1;
                    console.log(`    ➡️ Journée complète détectée (+1J)`);
                }
                else if (hasDynamicAbsLeft && hasDynamicAbsRight && !hasWhite) {
                    totalJours += 1;
                    console.log(`    ➡️ Journée complète détectée (+1J)`);
                }
            });

            console.log(`✅ Total CP calculé depuis le calendrier: ${totalJours}J`);
            return totalJours;
        }

        // Fonction pour afficher les CP calculés sous le bouton
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

                // Mettre à jour la couleur du solde CP
                if (cpDisplay.textContent.trim()) {
                    cpDisplay.style.color = '#ff8c00'; // Orange pour indiquer des CP posés
                }
            } else if (existingCalc) {
                existingCalc.remove();
                // Remettre la couleur en vert s'il n'y a plus de CP
                cpDisplay.style.color = '#28a745';
            }
        }

        // Fonction pour afficher les compteurs de régularisations sous les boutons RP et RU
        function afficherCompteursRegularisations(nbRP, nbRU) {
            console.log(`📊 Affichage des compteurs: ${nbRP} RP, ${nbRU} RU`);

            // Afficher le compteur RP
            const rpDisplay = document.querySelector('.solde-display-rp');
            if (rpDisplay) {
                const wrapper = rpDisplay.parentElement;
                let existingRPCount = wrapper.querySelector('.valeur-reg-rp');

                if (nbRP > 0) {
                    if (existingRPCount) {
                        existingRPCount.textContent = `${nbRP}J`;
                    } else {
                        const compteurRP = document.createElement('div');
                        compteurRP.className = 'valeur-reg-rp';
                        compteurRP.textContent = `${nbRP}J`;
                        compteurRP.title = `${nbRP} régularisation(s) positive(s) dans l'agenda`;
                        compteurRP.style.cssText = `
                            color: #dc3545;
                            font-size: 11px;
                            font-weight: bold;
                            text-align: center;
                            padding: 2px 8px;
                            background: rgba(220, 53, 69, 0.1);
                            border-radius: 8px;
                            margin-top: 4px;
                            cursor: help;
                        `;

                        if (wrapper && wrapper.classList.contains('modern-button-wrapper')) {
                            wrapper.appendChild(compteurRP);
                        }
                    }
                } else if (existingRPCount) {
                    existingRPCount.remove();
                }
            }

            // Afficher le compteur RU
            const ruDisplay = document.querySelector('.solde-display-ru');
            if (ruDisplay) {
                const wrapper = ruDisplay.parentElement;
                let existingRUCount = wrapper.querySelector('.valeur-reg-ru');

                if (nbRU > 0) {
                    if (existingRUCount) {
                        existingRUCount.textContent = `${nbRU}J`;
                    } else {
                        const compteurRU = document.createElement('div');
                        compteurRU.className = 'valeur-reg-ru';
                        compteurRU.textContent = `${nbRU}J`;
                        compteurRU.title = `${nbRU} régularisation(s) usuelle(s) dans l'agenda`;
                        compteurRU.style.cssText = `
                            color: #dc3545;
                            font-size: 11px;
                            font-weight: bold;
                            text-align: center;
                            padding: 2px 8px;
                            background: rgba(220, 53, 69, 0.1);
                            border-radius: 8px;
                            margin-top: 4px;
                            cursor: help;
                        `;

                        if (wrapper && wrapper.classList.contains('modern-button-wrapper')) {
                            wrapper.appendChild(compteurRU);
                        }
                    }
                } else if (existingRUCount) {
                    existingRUCount.remove();
                }
            }
        }

        // Observer les changements dans le calendrier pour recalculer les CP automatiquement
        const calendrierObserver = new MutationObserver(function(mutations) {
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
                setTimeout(afficherCPCalendrierSousBouton, 500);
            }
        });

        // Démarrer l'observation du calendrier
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

        // Fonction pour supprimer les boutons personnalisés
        function removeCustomButtons() {
            const group = document.querySelector('.phx-custom-buttons-group');
            if (group) group.remove();
        }

        // Fonction pour insérer les boutons
        function insertButtons() {
            const nouveauButton = document.querySelector('.agenda_acmcreercmb button, button.dropReg, button.creerAb');
            if (!nouveauButton) {
                console.log('Bouton "Nouveau" non trouvé');
                return;
            }
            console.log('Bouton "Nouveau" détecté, vérification du conteneur...');
            waitForElement('.phx-agenda-accesrapides', function(container) {
                console.log('Zone phx-agenda-accesrapides trouvée, ajout des boutons personnalisés...');

                if (document.querySelector('.phx-custom-buttons-group')) {
                    console.log('Les boutons personnalisés existent déjà');
                    return;
                }

                const buttonContainer = document.createElement('div');
                buttonContainer.className = 'btn-group phx-custom-buttons-group order-4';
                buttonContainer.setAttribute('role', 'group');
                buttonContainer.setAttribute('aria-label', 'Boutons personnalisés');
                buttonContainer.style.cssText = 'display: flex; flex-direction: row; gap: 8px; margin-left: 8px;';

                const boutonsActifs = chargerConfigBoutons();
                boutonsActifs.forEach(key => {
                    if (key === 'RP') buttonContainer.appendChild(createButton('RP', 'btn-rp-custom', false));
                    if (key === 'RU') buttonContainer.appendChild(createButton('RU', 'btn-ru-custom', false));
                    if (key === 'CP') buttonContainer.appendChild(createButton('CP', 'btn-cp-custom', true, 'UC'));
                    if (key === 'RQ') buttonContainer.appendChild(createButton('RQ', 'btn-rq-custom', true));
                    if (key === 'RN') buttonContainer.appendChild(createButton('RN', 'btn-rn-custom', false, 'Don repos nuit rn'));
                });

                const accesRapides = document.querySelector('.phx-agenda-accesrapides');
                if (accesRapides) {
                    accesRapides.appendChild(buttonContainer);
                    console.log('Boutons personnalisés ajoutés avec succès');

                    // Charger les soldes depuis le cache
                    const hasCachedData = loadSoldesFromCache();
                    if (hasCachedData) {
                        console.log('✅ Soldes du cache affichés');
                    }

                    // Lancer la requête API
                    setTimeout(function() {
                        console.log('🔄 Chargement des soldes depuis l\'API...');
                        executeApiRequests();
                    }, 500);

                    // Calculer et afficher les CP depuis le calendrier
                    setTimeout(function() {
                        console.log('🔄 Calcul des CP depuis le calendrier...');
                        afficherCPCalendrierSousBouton();
                        startCalendrierObserver();
                    }, 1500);

                    // Analyser les régularisations et afficher les compteurs
                    setTimeout(function() {
                        console.log('🔄 Analyse des régularisations RP/RU...');
                        analyserRegularisationsAgenda();
                    }, 2000);

                    // Actualiser automatiquement toutes les 15 minutes
                    setInterval(function() {
                        console.log('🔄 Actualisation automatique des soldes (toutes les 15 min)...');
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

        // Observer les changements dans le DOM
        const observer = new MutationObserver(function(mutations) {
            const nouveauPresent = document.querySelector('.agenda_acmcreercmb button, button.dropReg, button.creerAb');
            const containeurPresent = document.querySelector('.phx-agenda-accesrapides');
            const boutonsAbsents = !document.querySelector('.btn-rp-custom');

            if (nouveauPresent && containeurPresent && boutonsAbsents) {
                insertButtons();
                setTimeout(afficherCPCalendrierSousBouton, 1000);
            }
        });

        // Démarrer l'observation
        observer.observe(document.body, {
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
