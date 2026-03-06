    (function() {
        'use strict';

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
    function createButton(text, className, isAbsence = false) {
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
            if (isAbsence) {
                createAbsence(text);
            } else {
                createRegularisation(text);
            }
        });

        return wrapper;
    }

    // Fonction pour créer l'affichage du solde RN (AVEC bouton)
    function createRNDisplay() {
        const wrapper = document.createElement('div');
        wrapper.className = 'modern-button-wrapper';

        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'modern-button btn-rn-custom';
        
        // Définir une couleur de fond par défaut (sera remplacée par le script Calendrier couleur.js)
        button.style.backgroundColor = '#6c757d'; // Gris par défaut
        button.style.color = 'white';
        
        // Créer la structure HTML sans icône sparkle
        button.innerHTML = `
            <div class="dots_border"></div>
            <span class="text_button">RN</span>
        `;

        // Créer l'élément pour afficher le solde
        const soldeDisplay = document.createElement('div');
        soldeDisplay.className = 'solde-display-rn modern-button-solde';

        // Ajouter un spinner de chargement
        const spinner = document.createElement('div');
        spinner.className = 'modern-loading-spinner';
        soldeDisplay.appendChild(spinner);

        wrapper.appendChild(button);
        wrapper.appendChild(soldeDisplay);

        // Ajouter l'événement de clic pour créer une régularisation RN
        button.addEventListener('click', function() {
            console.log('Bouton RN cliqué');
            createRegularisation('RN');
        });

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

    // Fonction pour calculer le nombre de week-ends restants dans l'année
    function calculateRemainingWeekends() {
        const today = new Date();
        const endOfYear = new Date(today.getFullYear(), 11, 31); // 31 décembre

        let weekendDays = 0;
        let currentDate = new Date(today);

        // Parcourir toutes les dates jusqu'à la fin de l'année
        while (currentDate <= endOfYear) {
            const dayOfWeek = currentDate.getDay();
            // 0 = Dimanche, 6 = Samedi
            if (dayOfWeek === 0 || dayOfWeek === 6) {
                weekendDays++;
            }
            // Passer au jour suivant
            currentDate.setDate(currentDate.getDate() + 1);
        }

        return weekendDays;
    }

    // Fonction pour convertir le format "95j00" en nombre de jours
    function parseSoldeToJours(solde) {
        const match = solde.match(/(\d+)j/);
        return match ? parseInt(match[1], 10) : 0;
    }

    // Fonction pour convertir un nombre de jours en format "XXjYY"
    function formatJoursToSolde(jours) {
        return `${jours}j00`;
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

    // Fonction pour mettre à jour l'affichage des soldes depuis l'API
    function updateSoldesFromAPI(dataEndOfYear, dataToday) {
        if (!Array.isArray(dataEndOfYear)) return;

        console.log('🔄 Mise à jour des soldes...');

        // Trouver les soldes dans les données de fin d'année
        const soldes = {
            RP: null,
            RU: null,
            CP: null,
            RN: null
        };

        dataEndOfYear.forEach(item => {
            if (item.libelle === 'Solde RP') {
                soldes.RP = item.valeur.trim();
            } else if (item.libelle === 'Solde RU') {
                soldes.RU = item.valeur.trim();
            } else if (item.libelle === 'CR solde Actuel') {
                soldes.CP = item.valeur.trim();
            }
        });

        // Trouver le solde RN dans les données d'aujourd'hui
        if (Array.isArray(dataToday)) {
            dataToday.forEach(item => {
                if (item.libelle === 'Solde RN') {
                    soldes.RN = item.valeur.trim();
                }
            });
        }

        // Sauvegarder dans le localStorage
        saveSoldesToCache(soldes);

        // Mettre à jour l'affichage
        const rpDisplay = document.querySelector('.solde-display-rp');
        const ruDisplay = document.querySelector('.solde-display-ru');
        const cpDisplay = document.querySelector('.solde-display-cp');
        const rnDisplay = document.querySelector('.solde-display-rn');

        // Pour RP : afficher le solde tel quel (sans déduction)
        if (rpDisplay && soldes.RP) {
            rpDisplay.innerHTML = ''; // Supprimer le spinner
            rpDisplay.textContent = soldes.RP;
            rpDisplay.style.color = '#28a745'; // Vert
            console.log('✅ Solde RP affiché:', soldes.RP);
        }

        if (ruDisplay && soldes.RU) {
            ruDisplay.innerHTML = '';
            ruDisplay.textContent = soldes.RU;
            ruDisplay.style.color = '#28a745'; // Vert
            console.log('✅ Solde RU affiché:', soldes.RU);
        }

        if (cpDisplay && soldes.CP) {
            cpDisplay.innerHTML = '';
            cpDisplay.textContent = soldes.CP;
            cpDisplay.style.color = '#28a745'; // Vert
            console.log('✅ Solde CP affiché:', soldes.CP);
        }

        if (rnDisplay && soldes.RN) {
            rnDisplay.innerHTML = '';
            rnDisplay.textContent = soldes.RN;
            rnDisplay.style.color = '#28a745'; // Vert
            console.log('✅ Solde RN affiché:', soldes.RN);
        }
    }

    // Fonction pour récupérer le matricule de l'utilisateur
    function getMatricule() {
        // Méthode 0: Utiliser le matricule intercepté depuis les requêtes API (LE PLUS FIABLE)
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

        // Par défaut, utiliser celui de l'exemple et afficher un avertissement
        console.warn('⚠️ Matricule non trouvé automatiquement.');
        console.warn('💡 Astuce: Naviguez dans Optimum (par exemple, allez dans "Ma situation") avant d\'utiliser les boutons.');
        console.warn('Le script interceptera automatiquement votre matricule depuis les requêtes API.');
        console.warn('Utilisation temporaire du matricule par défaut: 9303122');
        return '9303122';
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
    const originalSend = XMLHttpRequest.prototype.send;

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

    // Fonction pour simuler la création d'une régularisation (RP/RU/RN)
    function createRegularisation(motifCode) {
        console.log(`Tentative de création de régularisation avec motif: ${motifCode}...`);

        // Déterminer le texte de recherche selon le motif
        let searchText = motifCode;
        if (motifCode === 'RN') {
            searchText = 'repos nuit';
            console.log('Recherche du motif "repos nuit" pour RN');
        }

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
                        fillMotifCode(searchText);
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

                    // Attendre que le formulaire apparaisse et remplir le champ motif avec UC0
                    setTimeout(function() {
                        fillMotifCode('UC0');
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

    // Fonction pour insérer les boutons
    function insertButtons() {
        // D'abord vérifier si le bouton "Nouveau" existe (condition pour afficher nos boutons)
        const nouveauButton = document.querySelector('.agenda_acmcreercmb button, button.dropReg, button.creerAb');

        if (!nouveauButton) {
            console.log('Bouton "Nouveau" non trouvé, pas d\'affichage des boutons RP/RU');
            return;
        }

        console.log('Bouton "Nouveau" détecté, vérification du conteneur...');

        // Attendre que la zone d'accès rapides soit présente
        waitForElement('.phx-agenda-accesrapides', function(container) {
            console.log('Zone phx-agenda-accesrapides trouvée, ajout des boutons RP/RU...');

            // Vérifier si les boutons n'existent pas déjà
            if (document.querySelector('.btn-rp-custom') || document.querySelector('.btn-ru-custom') || document.querySelector('.btn-cp-custom')) {
                console.log('Les boutons existent déjà');
                return;
            }

            // Créer un conteneur pour les boutons avec la classe btn-group
            const buttonContainer = document.createElement('div');
            buttonContainer.className = 'btn-group phx-custom-buttons-group order-4';
            buttonContainer.setAttribute('role', 'group');
            buttonContainer.setAttribute('aria-label', 'Boutons personnalisés');
            buttonContainer.style.cssText = 'display: flex; flex-direction: row; gap: 8px; margin-left: 8px;';

            // Créer les boutons (RP, RU, CP et maintenant RN aussi)
            const rpButton = createButton('RP', 'btn-rp-custom', false);
            const ruButton = createButton('RU', 'btn-ru-custom', false);
            const cpButton = createButton('CP', 'btn-cp-custom', true);
            const rnButton = createRNDisplay(); // Maintenant c'est un vrai bouton

            // Ajouter les boutons au conteneur
            buttonContainer.appendChild(rpButton);
            buttonContainer.appendChild(ruButton);
            buttonContainer.appendChild(cpButton);
            buttonContainer.appendChild(rnButton);

            // Insérer le conteneur dans la zone phx-agenda-accesrapides
            const accesRapides = document.querySelector('.phx-agenda-accesrapides');
            if (accesRapides) {
                accesRapides.appendChild(buttonContainer);
                console.log('Boutons RP, RU, CP et RN ajoutés avec succès dans phx-agenda-accesrapides');

                // Charger immédiatement les soldes depuis le cache
                const hasCachedData = loadSoldesFromCache();
                
                if (hasCachedData) {
                    console.log('✅ Soldes du cache affichés, requête API en cours...');
                }

                // Lancer la requête API après un court délai
                setTimeout(function() {
                    console.log('🔄 Chargement des soldes depuis l\'API...');
                    executeApiRequests();
                }, 500);

                // Actualiser automatiquement toutes les 15 minutes (900000 ms)
                setInterval(function() {
                    console.log('🔄 Actualisation automatique des soldes (toutes les 15 min)...');
                    
                    // Afficher les spinners pendant l'actualisation
                    const rpDisplay = document.querySelector('.solde-display-rp');
                    const ruDisplay = document.querySelector('.solde-display-ru');
                    const cpDisplay = document.querySelector('.solde-display-cp');
                    const rnDisplay = document.querySelector('.solde-display-rn');
                    
                    [rpDisplay, ruDisplay, cpDisplay, rnDisplay].forEach(display => {
                        if (display && display.textContent.trim()) {
                            // Ajouter le spinner à droite si pas déjà présent
                            if (!display.querySelector('.modern-loading-spinner')) {
                                const spinner = document.createElement('span');
                                spinner.className = 'modern-loading-spinner';
                                spinner.style.marginLeft = '4px';
                                display.appendChild(spinner);
                                display.style.color = '#6c757d'; // Repasser en gris pendant le chargement
                            }
                        }
                    });
                    
                    executeApiRequests();
                }, 900000); // 15 minutes = 900000 millisecondes
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
        }
    });

    // Démarrer l'observation
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // Tenter d'insérer les boutons immédiatement
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', insertButtons);
    } else {
        insertButtons();
    }

    })();
