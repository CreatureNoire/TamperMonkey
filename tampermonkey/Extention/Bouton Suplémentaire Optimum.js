    // ==UserScript==
    // @name         Boutons Supplémentaires Optimum
    // @namespace    http://tampermonkey.net/
    // @version      1.4
    // @description  Ajoute trois boutons RP, RU, CP et affichage du solde RN avec calcul automatique des week-ends
    // @author       Vous
    // @match        https://optimum.sncf.fr/chronotime/*
    // @updateURL    https://raw.githubusercontent.com/CreatureNoire/TamperMonkey/refs/heads/master/tampermonkey/Extention/Bouton%20RP%20et%20RU%20Optimum.js
    // @downloadURL  https://raw.githubusercontent.com/CreatureNoire/TamperMonkey/refs/heads/master/tampermonkey/Extention/Bouton%20RP%20et%20RU%20Optimum.js
    // @grant        none
    // ==/UserScript==

    (function() {
        'use strict';

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
        wrapper.style.cssText = 'display: flex; flex-direction: column; align-items: center; gap: 4px;';

        const button = document.createElement('button');
        button.type = 'button';
        button.className = `btn btn-primary btn-withIcon btn-noHeight ${className}`;
        button.style.cssText = 'width: auto;';
        button.innerHTML = `<span class="c-menuButton__text">${text}</span>`;

        // Créer l'élément pour afficher le solde
        const soldeDisplay = document.createElement('div');
        soldeDisplay.className = `solde-display-${text.toLowerCase()}`;
        soldeDisplay.style.cssText = 'font-size: 11px; font-weight: bold; color: #333; min-height: 15px;';
        soldeDisplay.textContent = '...';
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

        wrapper.insertBefore(button, wrapper.firstChild);
        return wrapper;
    }

    // Fonction pour créer l'affichage du solde RN (sans bouton)
    function createRNDisplay() {
        const wrapper = document.createElement('div');
        wrapper.style.cssText = 'display: flex; flex-direction: row; align-items: center; gap: 8px; justify-content: center; padding: 8px;';

        // Label RN
        const label = document.createElement('div');
        label.textContent = 'RN :';
        label.style.cssText = 'font-size: 12px; font-weight: bold; color: #333;';

        // Affichage du solde
        const soldeDisplay = document.createElement('div');
        soldeDisplay.className = 'solde-display-rn';
        soldeDisplay.style.cssText = 'font-size: 11px; font-weight: bold; color: #333;';
        soldeDisplay.textContent = '...';

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
            console.log(`📡 [3/3] Exécution de la troisième requête (détails fin d'année)...`);
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
            console.log('🎯 Requête 3 (Détails fin d\'année):');
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

        // Mettre à jour l'affichage
        const rpDisplay = document.querySelector('.solde-display-rp');
        const ruDisplay = document.querySelector('.solde-display-ru');
        const cpDisplay = document.querySelector('.solde-display-cp');
        const rnDisplay = document.querySelector('.solde-display-rn');

        // Pour RP : afficher le solde tel quel (sans déduction)
        if (rpDisplay && soldes.RP) {
            rpDisplay.textContent = soldes.RP;
            rpDisplay.style.color = '#28a745'; // Vert
            console.log('✅ Solde RP affiché:', soldes.RP);
        }

        if (ruDisplay && soldes.RU) {
            ruDisplay.textContent = soldes.RU;
            ruDisplay.style.color = '#28a745'; // Vert
            console.log('✅ Solde RU affiché:', soldes.RU);
        }

        if (cpDisplay && soldes.CP) {
            cpDisplay.textContent = soldes.CP;
            cpDisplay.style.color = '#28a745'; // Vert
            console.log('✅ Solde CP affiché:', soldes.CP);
        }

        if (rnDisplay && soldes.RN) {
            rnDisplay.textContent = soldes.RN;
            rnDisplay.style.color = '#28a745'; // Vert
            console.log('✅ Solde RN affiché:', soldes.RN);
        }
    }

    // Fonction pour récupérer le matricule de l'utilisateur
    function getMatricule() {
        // Méthode 1: Chercher dans le localStorage/sessionStorage
        const storedMatricule = localStorage.getItem('matricule') || sessionStorage.getItem('matricule');
        if (storedMatricule) return storedMatricule;

        // Méthode 2: Chercher dans les variables globales
        if (window.matricule) return window.matricule;
        if (window.userInfo && window.userInfo.matricule) return window.userInfo.matricule;

        // Méthode 3: Chercher dans le DOM (éléments qui affichent le matricule)
        const matriculeElements = document.querySelectorAll('[data-matricule], .matricule, #matricule');
        for (let elem of matriculeElements) {
            const mat = elem.getAttribute('data-matricule') || elem.textContent.trim();
            if (mat && /^\d{7}$/.test(mat)) return mat;
        }

        // Méthode 4: Extraire des scripts
        const scriptElements = document.querySelectorAll('script');
        for (let script of scriptElements) {
            const content = script.textContent;
            const match = content.match(/matricule['":\s]+(\d{7})/);
            if (match) return match[1];
        }

        // Par défaut, utiliser celui de l'exemple
        console.warn('⚠️ Matricule non trouvé automatiquement, utilisation de 9303122');
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

    // Intercepter les requêtes fetch pour capturer le token
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

        return originalFetch.apply(this, args);
    };

    // Intercepter XMLHttpRequest pour capturer le token
    const originalOpen = XMLHttpRequest.prototype.open;
    const originalSetRequestHeader = XMLHttpRequest.prototype.setRequestHeader;

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

            // Créer les boutons et l'affichage RN
            const rpButton = createButton('RP', 'btn-rp-custom', false);
            const ruButton = createButton('RU', 'btn-ru-custom', false);
            const cpButton = createButton('CP', 'btn-cp-custom', true);
            const rnDisplay = createRNDisplay();

            // Ajouter les boutons au conteneur
            buttonContainer.appendChild(rpButton);
            buttonContainer.appendChild(ruButton);
            buttonContainer.appendChild(cpButton);
            buttonContainer.appendChild(rnDisplay);

            // Insérer le conteneur dans la zone phx-agenda-accesrapides
            const accesRapides = document.querySelector('.phx-agenda-accesrapides');
            if (accesRapides) {
                accesRapides.appendChild(buttonContainer);
                console.log('Boutons RP, RU, CP et affichage RN ajoutés avec succès dans phx-agenda-accesrapides');

                // Charger automatiquement les soldes après 2 secondes
                setTimeout(function() {
                    console.log('🔄 Chargement automatique des soldes...');
                    executeApiRequests();
                }, 2000);
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
