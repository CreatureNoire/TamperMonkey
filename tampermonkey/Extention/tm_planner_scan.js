// -------------------- MODULE SCROLL --------------------

(function() {
    'use strict';

    // Configuration
    const CONFIG = {
        scrollSpeed: 'instant', // Scroll instantané vers le bas
        buttonPosition: {
            top: '20px',
            right: '20px'
        },
        autoScrollClass: 'scrollable', // Classe principale à cibler
        targetSelectors: [
            '.scrollable.scrollable-265',
            '.scrollable[data-can-drag-to-scroll="true"]',
            '.listWrapper',
            '.listBoxGroup',
            '.primarySection.taskBoardColumnGroup'
        ]
    };

    // Variables globales
    let scrollButton = null;
    let targetContainer = null;
    let debugMode = false;

    // Fonction de debug pour analyser le comportement du scroll
    function enableDebugMode() {
        debugMode = true;
        console.log('=== MODE DEBUG ACTIVÉ ===');

        // Surveiller tous les événements de scroll
        if (targetContainer) {
            targetContainer.addEventListener('scroll', function(e) {
                if (debugMode) {
                    console.log(`📜 SCROLL EVENT - Position: ${this.scrollTop}, Hauteur: ${this.scrollHeight}, Client: ${this.clientHeight}`);
                    console.log(`📏 Distance du bas: ${this.scrollHeight - this.scrollTop - this.clientHeight}px`);
                }
            });
        }

        // Surveiller les changements dans le DOM du conteneur
        if (targetContainer) {
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'childList') {
                        console.log(`🔄 DOM CHANGE - Ajouté: ${mutation.addedNodes.length}, Supprimé: ${mutation.removedNodes.length}`);
                        if (mutation.addedNodes.length > 0) {
                            console.log('📋 Nouveaux éléments:', mutation.addedNodes);
                        }
                    }
                });
            });

            observer.observe(targetContainer, {
                childList: true,
                subtree: true
            });
        }

        // Surveiller les requêtes réseau
        const originalFetch = window.fetch;
        window.fetch = function(...args) {
            console.log('🌐 FETCH REQUEST:', args[0]);
            return originalFetch.apply(this, arguments).then(response => {
                console.log('✅ FETCH RESPONSE:', response.status, args[0]);
                return response;
            });
        };

        // Surveiller XMLHttpRequest
        const originalXHR = window.XMLHttpRequest;
        window.XMLHttpRequest = function() {
            const xhr = new originalXHR();
            const originalOpen = xhr.open;
            const originalSend = xhr.send;

            xhr.open = function(method, url, ...args) {
                console.log(`🌐 XHR ${method}:`, url);
                return originalOpen.apply(this, [method, url, ...args]);
            };

            xhr.addEventListener('load', function() {
                console.log('✅ XHR RESPONSE:', this.status, this.responseURL);
            });

            return xhr;
        };
    }

    // Fonction pour créer le bouton unifié (scroll + scan)
    function createUnifiedButton() {
        if (scrollButton) return; // Éviter les doublons

        // Vérifier si on est sur Microsoft Planner
        if (!location.href.includes("planner.cloud.microsoft")) {
            console.log('[Bouton Unifié] Pas sur Microsoft Planner, bouton non créé');
            return; // Ne pas afficher le bouton si on n'est pas sur Microsoft Planner
        }

        console.log('[Bouton Unifié] Création du bouton sur Microsoft Planner');
        scrollButton = document.createElement('button');
        scrollButton.id = 'unified-scan-scroll-button';
        scrollButton.textContent = 'SCAN';

        // Styles du bouton (style du bouton scan)
        Object.assign(scrollButton.style, {
            position: 'fixed',
            width: '65px',
            height: '65px',
            bottom: '20px',
            right: '20px',
            zIndex: '9999',
            padding: '10px 15px',
            background: 'rgba(0, 0, 0, 0.1)',
            color: '#fff',
            border: '2px solid rgb(255, 128, 0)',
            borderRadius: '50px',
            fontSize: '14px',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(255, 104, 0, 0.8)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            transition: 'all 0.3s ease',
            userSelect: 'none'
        });

        // Ajouter l'animation CSS pour l'effet de clignotement
        const style = document.createElement('style');
        style.textContent = `
            @keyframes pulse {
                0% {
                    box-shadow: 0 2px 8px rgba(255, 104, 0, 0.8);
                    border-color: rgb(255, 128, 0);
                }
                50% {
                    box-shadow: 0 4px 20px rgba(255, 104, 0, 1);
                    border-color: rgb(255, 200, 0);
                }
                100% {
                    box-shadow: 0 2px 8px rgba(255, 104, 0, 0.8);
                    border-color: rgb(255, 128, 0);
                }
            }
        `;
        document.head.appendChild(style);

        // Effets hover
        scrollButton.addEventListener('mouseenter', () => {
            scrollButton.style.transform = 'scale(1.05)';
            scrollButton.style.boxShadow = '0 4px 12px rgba(255, 104, 0, 1)';
        });

        scrollButton.addEventListener('mouseleave', () => {
            scrollButton.style.transform = 'scale(1)';
            scrollButton.style.boxShadow = '0 2px 8px rgba(255, 104, 0, 0.8)';
        });

        // Événement click unifié (scroll d'abord, puis scan) - AVEC RELANCE POSSIBLE
        scrollButton.addEventListener('click', () => {
            if (scanInProgress) {
                console.log('[Bouton Unifié] 🔄 RELANCE: Arrêt du scan en cours et redémarrage complet...');
                scrollButton.textContent = 'RESTART';
                scrollButton.style.backgroundColor = 'rgba(255, 165, 0, 0.2)'; // Orange
                scrollButton.style.borderColor = 'rgb(255, 165, 0)';

                // Arrêter le scan en cours et réinitialiser
                resetCompleteSystem();

                // Relancer après un délai
                setTimeout(() => {
                    console.log('[Bouton Unifié] 🚀 RELANCE: Démarrage du nouveau cycle complet...');
                    startCompleteScrollAndScanCycle();
                }, 1000);
            } else {
                console.log('[Bouton Unifié] 🚀 DÉMARRAGE: Lancement du cycle complet (Scroll → Scan → Actions)...');
                scrollButton.textContent = 'RUNNING';
                scrollButton.style.backgroundColor = 'rgba(0, 255, 0, 0.2)'; // Vert
                scrollButton.style.borderColor = 'rgb(0, 255, 0)';
                scrollButton.style.animation = ''; // Supprimer l'animation pulse

                startCompleteScrollAndScanCycle();
            }
        });

        // Ajouter le bouton au DOM
        document.body.appendChild(scrollButton);
    }

    // Fonction pour réinitialiser complètement le système
    function resetCompleteSystem() {
        console.log('[Système] 🔄 RÉINITIALISATION COMPLÈTE DU SYSTÈME...');

        // Arrêter le scan en cours
        scanInProgress = false;

        // Arrêter la surveillance DOM
        if (domWatcher) {
            domWatcher.disconnect();
            domWatcher = null;
            console.log('[Système] 🛑 Surveillance DOM arrêtée');
        }

        // Vider toutes les variables de scan
        tasksToScan = [];
        tasksResults.clear();
        pendingRequests = 0;
        processedTasks.clear();
        containersToProcess = [];

        console.log('[Système] 🗑️ Toutes les variables de scan vidées');

        // Supprimer tous les overlays existants
        const existingOverlays = document.querySelectorAll('.autoelement');
        existingOverlays.forEach(overlay => overlay.remove());
        console.log(`[Système] 🗑️ ${existingOverlays.length} overlays supprimés`);

        // Remettre le bouton à l'état initial
        if (scrollButton) {
            scrollButton.textContent = 'SCAN';
            scrollButton.style.backgroundColor = 'rgba(0, 0, 0, 0.1)';
            scrollButton.style.borderColor = 'rgb(255, 128, 0)';
        }

        console.log('[Système] ✅ Réinitialisation complète terminée');
    }

    // Fonction pour démarrer un cycle complet (scroll + scan)
    function startCompleteScrollAndScanCycle() {
        console.log('[Cycle Complet] 🚀 DÉMARRAGE DU CYCLE COMPLET: Scroll → Scan → Actions → Scroll Final');

        // Étape 1: Scroll initial
        console.log('[Cycle Complet] 📜 ÉTAPE 1/4: Scroll initial...');
        scrollToBottom();

        // Étape 2: Premier scan après le scroll
        setTimeout(() => {
            console.log('[Cycle Complet] 🔍 ÉTAPE 2/4: Premier scan après scroll...');
            if (window.scanContainers) {
                window.scanContainers();
            } else {
                console.log('[Cycle Complet] ❌ Fonction scanContainers non disponible');
                resetButtonToReady();
            }
        }, 3000); // 3 secondes pour laisser le scroll se terminer

        // Les étapes 3 et 4 (actions + scroll final) sont gérées automatiquement par le système existant
    }

    // Fonction pour remettre le bouton à l'état prêt
    function resetButtonToReady() {
        if (scrollButton) {
            // Remettre le style initial
            scrollButton.textContent = 'SCAN';
            scrollButton.style.backgroundColor = 'rgba(0, 0, 0, 0.1)';
            scrollButton.style.borderColor = 'rgb(255, 128, 0)';
            scrollButton.style.boxShadow = '0 2px 8px rgba(255, 104, 0, 0.8)';

            // Petit effet de clignotement pour indiquer que c'est prêt
            scrollButton.style.animation = 'pulse 2s ease-in-out 3';

            // Supprimer l'animation après
            setTimeout(() => {
                if (scrollButton) {
                    scrollButton.style.animation = '';
                }
            }, 6000);

            console.log('[Bouton] ✅ Bouton SCAN prêt pour un nouveau lancement');
        }
        scanInProgress = false;
    }

    // Fonction pour analyser la structure DOM et les éléments
    function analyzeScrollStructure() {
        console.log('🔍 === ANALYSE DE LA STRUCTURE DE SCROLL ===');

        const container = findScrollContainer();
        if (!container) {
            console.log('❌ Aucun conteneur trouvé');
            return;
        }

        console.log('📦 Conteneur trouvé:', container);
        console.log('📐 Dimensions:', {
            scrollHeight: container.scrollHeight,
            clientHeight: container.clientHeight,
            scrollTop: container.scrollTop
        });

        // Analyser les éléments enfants
        const children = container.children;
        console.log(`👶 Nombre d'enfants directs: ${children.length}`);

        // Trouver les éléments de tâches
        const taskElements = container.querySelectorAll('[class*="taskCard"], [class*="taskBoardCard"], [class*="card"], [data-index]');
        console.log(`📋 Éléments de tâches trouvés: ${taskElements.length}`);

        // Analyser les attributs data
        const elementsWithDataIndex = container.querySelectorAll('[data-index]');
        if (elementsWithDataIndex.length > 0) {
            const indices = Array.from(elementsWithDataIndex).map(el => el.getAttribute('data-index'));
            console.log('🔢 Indices des tâches:', indices);
            console.log(`📊 Range des indices: ${Math.min(...indices)} à ${Math.max(...indices)}`);
        }

        // Chercher des indicateurs de pagination/lazy loading
        const loadingElements = container.querySelectorAll('[class*="loading"], [class*="spinner"], [class*="loader"]');
        console.log(`⏳ Éléments de chargement: ${loadingElements.length}`);

        // Chercher des zones de drop ou de contenu dynamique
        const dropZones = container.querySelectorAll('[data-dnd-role], [class*="dropZone"]');
        console.log(`🎯 Zones de drop: ${dropZones.length}`);

        // Analyser la position et l'état du scroll
        const isAtBottom = container.scrollTop >= (container.scrollHeight - container.clientHeight - 10);
        console.log(`📍 Position: ${isAtBottom ? 'En bas' : 'Pas en bas'}`);

        // Vérifier s'il y a des éléments invisibles en bas
        const containerRect = container.getBoundingClientRect();
        const elementsBelow = Array.from(taskElements).filter(el => {
            const rect = el.getBoundingClientRect();
            return rect.top > containerRect.bottom;
        });
        console.log(`👻 Éléments invisibles en bas: ${elementsBelow.length}`);

        return container;
    }

    // Fonction pour attendre que le contenu se stabilise
    function waitForContentStabilization(container, callback, timeout = 1000) { // Réduit de 2000ms à 1000ms
        let lastHeight = container.scrollHeight;
        let stableCount = 0;
        const requiredStableChecks = 2; // Réduit de 3 à 2 vérifications
        const checkInterval = 100; // Réduit de 200ms à 100ms
        let totalWaited = 0;

        function checkStability() {
            const currentHeight = container.scrollHeight;

            if (currentHeight === lastHeight) {
                stableCount++;
                console.log(`📏 Hauteur stable (${stableCount}/${requiredStableChecks}): ${currentHeight}px`);

                if (stableCount >= requiredStableChecks) {
                    console.log('✅ Contenu stabilisé');
                    callback(true);
                    return;
                }
            } else {
                console.log(`📈 Hauteur changée: ${lastHeight}px → ${currentHeight}px`);
                lastHeight = currentHeight;
                stableCount = 0;
            }

            totalWaited += checkInterval;
            if (totalWaited >= timeout) {
                console.log('⏰ Timeout atteint pour la stabilisation');
                callback(false);
                return;
            }

            setTimeout(checkStability, checkInterval);
        }

        checkStability();
    }

    // Fonction pour trouver le conteneur de scroll
    function findScrollContainer() {
        // Essayer de trouver le conteneur par différents sélecteurs
        for (const selector of CONFIG.targetSelectors) {
            const container = document.querySelector(selector);
            if (container && container.scrollHeight > container.clientHeight) {
                console.log(`Conteneur trouvé avec le sélecteur: ${selector}`);
                return container;
            }
        }

        // Fallback: chercher tout élément avec la classe scrollable
        const scrollableElements = document.querySelectorAll('[class*="scrollable"]');
        for (const element of scrollableElements) {
            if (element.scrollHeight > element.clientHeight) {
                console.log('Conteneur trouvé via fallback:', element.className);
                return element;
            }
        }

        console.warn('Aucun conteneur scrollable trouvé');
        return null;
    }

    // Fonction de scroll progressif pour déclencher le lazy loading
    function scrollToBottom() {
        let attempts = 0;
        const maxAttempts = 50; // Réduit car on a une meilleure logique maintenant
        const scrollStep = 5000; // Augmenté pour un scroll plus rapide

        function performProgressiveScroll() {
            // Récupérer une nouvelle référence du conteneur à chaque tentative
            const container = findScrollContainer();
            if (!container) {
                console.error('❌ Conteneur perdu lors de la tentative', attempts + 1);
                return;
            }

            const currentScrollTop = container.scrollTop;
            const scrollHeight = container.scrollHeight;
            const clientHeight = container.clientHeight;
            const maxScrollTop = scrollHeight - clientHeight;

            console.log(`🔄 Tentative ${attempts + 1}: Position ${currentScrollTop}/${maxScrollTop}, Hauteur totale: ${scrollHeight}`);

            // Vérifier si on est déjà au bas
            if (currentScrollTop >= maxScrollTop - 10) {
                console.log('📍 Atteint le bas, vérification de la stabilisation...');

                // Utiliser la nouvelle fonction de stabilisation
                waitForContentStabilization(container, (isStable) => {
                    if (!isStable && attempts < maxAttempts) {
                        console.log('🔄 Contenu encore en chargement, tentative suivante...');
                        attempts++;
                        setTimeout(performProgressiveScroll, 50); // Réduit à 50ms pour quasi-instantané
                    } else {
                        const finalContainer = findScrollContainer();
                        if (finalContainer) {
                            console.log(`🎯 Scroll terminé ! Tentatives: ${attempts + 1}`);
                            console.log(`📊 Hauteur finale: ${finalContainer.scrollHeight}px`);
                            console.log(`📍 Position finale: ${finalContainer.scrollTop}px`);

                            // Dernière analyse pour confirmer
                            const taskElements = finalContainer.querySelectorAll('[data-index]');
                            if (taskElements.length > 0) {
                                const indices = Array.from(taskElements).map(el => parseInt(el.getAttribute('data-index')));
                                console.log(`📋 Total des tâches chargées: ${taskElements.length}`);
                                console.log(`📊 Range final: ${Math.min(...indices)} à ${Math.max(...indices)}`);
                            }
                        }
                    }
                }, 800); // Réduit de 1500ms à 800ms pour plus de rapidité
            } else {
                // Pas encore au bas, scroller par étapes
                const targetScroll = Math.min(currentScrollTop + scrollStep, maxScrollTop);
                container.scrollTop = targetScroll;

                // Déclencher des événements pour s'assurer que les listeners se déclenchent
                container.dispatchEvent(new Event('scroll', { bubbles: true }));

                // Simuler aussi un événement wheel pour certains lazy loaders
                container.dispatchEvent(new WheelEvent('wheel', {
                    deltaY: scrollStep,
                    bubbles: true
                }));

                attempts++;
                if (attempts < maxAttempts) {
                    setTimeout(performProgressiveScroll, 50); // Réduit à 50ms pour quasi-instantané
                } else {
                    console.log('⚠️ Limite de tentatives atteinte sans atteindre le bas.');
                }
            }
        }

        // Vérification initiale
        const initialContainer = findScrollContainer();
        if (!initialContainer) {
            alert('❌ Aucun conteneur scrollable trouvé sur cette page.');
            return;
        }

        console.log('🚀 === DÉMARRAGE DU SCROLL AMÉLIORÉ ===');
        console.log(`📐 Dimensions initiales: ${initialContainer.scrollHeight}px (visible: ${initialContainer.clientHeight}px)`);

        // Compter les tâches initiales
        const initialTasks = initialContainer.querySelectorAll('[data-index]');
        console.log(`📋 Tâches initialement visibles: ${initialTasks.length}`);

        performProgressiveScroll();
    }

    // Fonction pour surveiller les changements dans le DOM
    function observeDOMChanges() {
        const observer = new MutationObserver((mutations) => {
            // Observer les changements pour maintenir la référence au conteneur à jour
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    // Réinitialiser la référence du conteneur si nécessaire
                    setTimeout(() => {
                        targetContainer = null;
                    }, 100);
                }
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // Fonction d'initialisation du module scroll
    function initScrollModule() {
        // Attendre que le DOM soit complètement chargé
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initScrollModule);
            return;
        }

        // Délai pour s'assurer que l'interface est complètement rendue
        setTimeout(() => {
            createUnifiedButton();
            observeDOMChanges();
            console.log('Bouton unifié (Scroll + Scan) initialisé');
        }, 1000);
    }

    // Raccourci clavier pour scroll instantané (Ctrl + Shift + S)
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.shiftKey && e.key === 'S') {
            e.preventDefault();
            scrollToBottom();
        }
    });

    // Initialiser le module scroll
    initScrollModule();

    // Exposer les fonctions globalement pour les rendre accessibles depuis l'extérieur du module
    window.resetCompleteSystem = resetCompleteSystem;
    window.startCompleteScrollAndScanCycle = startCompleteScrollAndScanCycle;
    window.resetButtonToReady = resetButtonToReady;

})();

// -------------------- MODULE LISTE --------------------

// Liste configurable par l'utilisateur
const DEFAULT_LIST = "non trouvé, ATTENTE RT, ATTENTE REBUT, ATTENTE COMPOSANT, SOUS TRAITANCE, SOUS-TRAITANCE, CONTROLE QUALITE, ATTENTE SUPPORT";

function getList() {
    return GM_getValue("autoListFinish", DEFAULT_LIST).split(",").map(s => s.trim());
}

function editList() {
    const current = GM_getValue("autoListFinish", DEFAULT_LIST);
    const next = prompt("Entre ta liste d'éléments séparés par des virgules:", current);
    if (next !== null) GM_setValue("autoListFinish", next);
}

function showList() {
    alert("Liste actuelle:\n" + getList().join("\n"));
}

// Menus Tampermonkey pour la liste
GM_registerMenuCommand("✏️ Modifier la liste", editList);
GM_registerMenuCommand("📋 Afficher la liste", showList);

// -------------------- SCRIPT PRINCIPAL --------------------

// Variables globales pour le scan
const processedSections = new WeakMap();
const donneesTaches = []; // tableau global pour stocker les infos extraites
let liensEnCours = 0;
let postEnCours = 0;

// Variables pour la surveillance DOM et le scan
let scanInProgress = false;
let domWatcher = null;
let processedTasks = new Set(); // Pour éviter les doublons
let containersToProcess = []; // Liste temporaire pour compatibility

// Variables pour la séparation scan/déplacement
let tasksToScan = [];
let tasksResults = new Map(); // stocke les résultats des scans
let pendingRequests = 0;
let maxConcurrentRequests = 5;

function scanContainers() {
    console.log('[Planner Script] 🚀 SYSTÈME SIMPLIFIÉ: Scan unique puis déplacements...');

    // Si un scan est déjà en cours, l'arrêter proprement
    if (scanInProgress) {
        console.log('[Planner Script] ⚠️ Scan déjà en cours, arrêt du précédent scan');
        stopDOMWatcher();
    }

    // Marquer le scan comme en cours
    scanInProgress = true;

    // Lancer directement le système simplifié
    console.log('[Planner Script] 🚀 Lancement du système simplifié...');
    startSimplifiedScanAndMove();
}

// SYSTÈME SIMPLIFIÉ: Scan unique puis déplacements
function startSimplifiedScanAndMove() {
    console.log('[Planner Script] 🎯 DÉBUT DU SYSTÈME SIMPLIFIÉ');

    // Chercher les conteneurs avec priorité : listBoxGroup d'abord, puis taskBoardCard
    let containers = document.querySelectorAll('.listBoxGroup .taskBoardCard');

    if (containers.length === 0) {
        containers = document.querySelectorAll('.taskBoardCard');
    }

    if (containers.length === 0) {
        console.log('[Planner Script] ❌ Aucun conteneur trouvé');
        return;
    }

    console.log(`[Planner Script] 🔍 ÉTAPE 1: Scan de ${containers.length} tâches...`);
    console.log(`[Planner Script] � `);
}

// SYSTÈME SIMPLIFIÉ: Scan unique puis déplacements
function startSimplifiedScanAndMove() {
    console.log('[Planner Script] 🎯 DÉBUT DU SYSTÈME SIMPLIFIÉ');

    // Chercher les conteneurs avec priorité : listBoxGroup d'abord, puis taskBoardCard
    let containers = document.querySelectorAll('.listBoxGroup .taskBoardCard');

    if (containers.length === 0) {
        containers = document.querySelectorAll('.taskBoardCard');
    }

    if (containers.length === 0) {
        console.log('[Planner Script] ❌ Aucun conteneur trouvé');
        return;
    }

    console.log(`[Planner Script] 🔍 ÉTAPE 1: Scan de ${containers.length} tâches...`);

    // Réinitialiser les variables
    tasksToScan = [];
    tasksResults.clear();
    pendingRequests = 0;

    // Préparer toutes les tâches à scanner
    containers.forEach((container, index) => {
        const taskCard = container.querySelector('div.taskCard');
        if (!taskCard) return;

        const lienElement = container.querySelector('a.referencePreviewDescription');
        let lien = lienElement?.getAttribute('href') || lienElement?.getAttribute('title');
        if (lien && !lien.endsWith('.html')) lien += '.html';
        if (!lien || !lien.includes('.html')) return;

        const numeroReparation = lien.match(/\/(\d+)(?:\.html)?$/)?.[1];
        if (!numeroReparation || processedTasks.has(numeroReparation)) return;

        processedTasks.add(numeroReparation);
        ajouterOverlayTaskCard(taskCard, numeroReparation, 'Scan...');

        tasksToScan.push({
            container,
            taskCard,
            lien,
            numeroReparation,
            index: index + 1
        });
    });

    console.log(`[Planner Script] 📋 ${tasksToScan.length} tâches préparées pour le scan`);

    if (tasksToScan.length > 0) {
        // Lancer tous les scans en parallèle (rapide)
        startSimplifiedScanning();
    }
}

// Scan simplifié en parallèle
function startSimplifiedScanning() {
    console.log(`[Planner Script] 🚀 Lancement du scan de ${tasksToScan.length} tâches en parallèle...`);

    tasksToScan.forEach((task, index) => {
        // Petit délai échelonné pour éviter la surcharge
        setTimeout(() => {
            scanTaskSimplified(task);
        }, index * 100); // 100ms entre chaque requête
    });
}

// Scan d'une tâche (version simplifiée)
function scanTaskSimplified(task) {
    const { lien, numeroReparation, taskCard } = task;
    pendingRequests++;

    GM_xmlhttpRequest({
        method: 'GET',
        url: lien,
        onload: function (response) {
            handleSimplifiedScanResult(response, task);
        },
        onerror: function () {
            console.log(`[Planner Script] ❌ Erreur scan ${numeroReparation}`);
            pendingRequests--;
            checkSimplifiedScanCompletion();
        }
    });
}

// Traitement du résultat de scan (simplifié)
function handleSimplifiedScanResult(response, task) {
    const { numeroReparation, taskCard } = task;
    pendingRequests--;

    let texteLabel = 'Erreur';
    let canMove = false;
    let canComplete = false;

    if (response.status === 200) {
        const html = response.responseText;
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        const label = doc.querySelector('span.label-success');
        texteLabel = label?.textContent?.trim() || 'non trouvé';

        // Cas PV
        if (texteLabel === 'non trouvé' && response.finalUrl?.includes('/Prm/AfficherPv/')) {
            texteLabel = 'Terminé / PV';
        }

        // Déterminer si on doit cocher (completion) et/ou déplacer
        const autoListFinish = getList();
        const matchInList = autoListFinish.some(item => texteLabel.includes(item));
        const containsPieceEnProd = texteLabel.includes('PIECE EN PROD');
        canMove = !containsPieceEnProd && !matchInList;

        // Déterminer si on doit cocher (tâches dans la liste configurable)
        canComplete = matchInList && !containsPieceEnProd;
    }

    // Stocker le résultat
    tasksResults.set(numeroReparation, {
        texteLabel,
        canMove,
        canComplete,
        taskCard,
        originalContainer: task.container
    });

    // Mettre à jour l'overlay
    const overlay = taskCard.querySelector(`#idreparation-status-${numeroReparation}`);
    if (overlay) {
        const textElement = overlay.querySelector('.text-collector');
        if (textElement) {
            if (canComplete) {
                textElement.textContent = '✅ ' + texteLabel;
                overlay.style.backgroundColor = 'rgba(0, 0, 255, 0.8)'; // Bleu pour cochage
            } else if (canMove) {
                textElement.textContent = '🚀 ' + texteLabel;
                overlay.style.backgroundColor = 'rgba(0, 255, 0, 0.8)'; // Vert pour déplacement
            } else {
                textElement.textContent = '⏸️ ' + texteLabel;
                overlay.style.backgroundColor = 'rgba(128, 128, 128, 0.8)'; // Gris pour aucune action
            }
        }
    }

    let actionText = '';
    if (canComplete) actionText = '(à cocher)';
    else if (canMove) actionText = '(à déplacer)';
    else actionText = '(aucune action)';

    console.log(`[Planner Script] ✅ ${numeroReparation}: ${texteLabel} ${actionText}`);
    console.log(`[Planner Script] 📊 Requêtes restantes: ${pendingRequests}`);
    checkSimplifiedScanCompletion();
}

// Vérifier si le scan est terminé
function checkSimplifiedScanCompletion() {
    console.log(`[Planner Script] 🔍 Vérification completion: ${pendingRequests} requêtes restantes`);
    if (pendingRequests === 0) {
        const movableTasks = Array.from(tasksResults.entries()).filter(([_, result]) => result.canMove);
        const completableTasks = Array.from(tasksResults.entries()).filter(([_, result]) => result.canComplete);

        console.log(`[Planner Script] 🎉 ÉTAPE 1 TERMINÉE: ${tasksResults.size} tâches scannées`);
        console.log(`[Planner Script] 📊 ${completableTasks.length} tâches à cocher, ${movableTasks.length} tâches à déplacer`);

        if (completableTasks.length > 0) {
            // ÉTAPE 2A: D'abord cocher les tâches terminées (PRIORITÉ)
            console.log('[Planner Script] 🎯 ORDRE D\'EXÉCUTION: 1) Cochage des tâches terminées, puis 2) Déplacements');
            setTimeout(() => {
                startSimplifiedCompletions(completableTasks, movableTasks);
            }, 2000);
        } else if (movableTasks.length > 0) {
            // ÉTAPE 2B: Directement aux déplacements si pas de cochage
            setTimeout(() => {
                startSimplifiedMovements(movableTasks);
            }, 2000);
        } else {
            console.log('[Planner Script] ✅ Aucune action nécessaire, scan terminé');
            // Faire quand même la restauration finale pour afficher les statuts
            setTimeout(() => {
                performFinalOverlayRestoration();
            }, 1000);
            scanInProgress = false;
        }
    }
}

// ÉTAPE 2A: Completions (cochages) séquentiels
function startSimplifiedCompletions(completableTasks, movableTasks) {
    console.log(`[Planner Script] ✅ ÉTAPE 2A: Cochage de ${completableTasks.length} tâches terminées...`);

    completableTasks.forEach(([numeroReparation, result], index) => {
        setTimeout(async () => {
            console.log(`[Planner Script] ✅ Cochage ${index + 1}/${completableTasks.length}: ${numeroReparation}`);

            // Rechercher la tâche dans le DOM actuel
            const currentTaskCard = await findCurrentTaskCard(numeroReparation);
            if (currentTaskCard) {
                // Effectuer le cochage
                tryClickComplete(currentTaskCard, numeroReparation, result.texteLabel);

                // Mettre à jour l'overlay pour indiquer le cochage effectué
                setTimeout(() => {
                    const overlay = currentTaskCard.querySelector(`#idreparation-status-${numeroReparation}`);
                    if (overlay) {
                        const textElement = overlay.querySelector('.text-collector');
                        if (textElement) {
                            textElement.textContent = '✅ Cochée: ' + result.texteLabel;
                            overlay.style.backgroundColor = 'rgba(0, 150, 255, 0.9)'; // Bleu plus foncé
                        }
                    }
                }, 1000);
            } else {
                console.log(`[Planner Script] ❌ Tâche ${numeroReparation} non trouvée pour cochage`);
            }

            // Si c'est la dernière completion
            if (index === completableTasks.length - 1) {
                setTimeout(() => {
                    console.log('[Planner Script] ✅ ÉTAPE 2A TERMINÉE: Tous les cochages effectués!');

                    // Passer aux déplacements si nécessaire
                    if (movableTasks.length > 0) {
                        console.log(`[Planner Script] 🔄 ÉTAPE 2A TERMINÉE → Passage à l'étape 2B: Déplacements...`);
                        console.log(`[Planner Script] ⏱️ Attente de 2 secondes avant de commencer les déplacements...`);
                        setTimeout(() => {
                            startSimplifiedMovements(movableTasks);
                        }, 2000);
                    } else {
                        console.log('[Planner Script] ✅ TOUTES LES ACTIONS TERMINÉES!');
                        setTimeout(() => {
                            performFinalOverlayRestoration();
                        }, 2000);
                        scanInProgress = false;
                    }
                }, 2000);
            }
        }, index * 3000); // 3 secondes entre chaque cochage
    });
}

// ÉTAPE 2B: Déplacements séquentiels
function startSimplifiedMovements(movableTasks) {
    console.log(`[Planner Script] 🚀 ÉTAPE 2: Déplacement de ${movableTasks.length} tâches...`);

    // Démarrer la maintenance périodique des overlays
    const overlayMaintenance = setInterval(() => {
        restoreAllOverlays();
    }, 3000); // Restaurer les overlays toutes les 3 secondes

    movableTasks.forEach(([numeroReparation, result], index) => {
        setTimeout(async () => {
            console.log(`[Planner Script] 🚀 Déplacement ${index + 1}/${movableTasks.length}: ${numeroReparation}`);

            // Rechercher la tâche dans le DOM actuel
            const currentTaskCard = await findCurrentTaskCard(numeroReparation);
            if (currentTaskCard) {
                // Effectuer le déplacement
                tryMoveTaskToDropZone(currentTaskCard, numeroReparation, result.texteLabel);

                // Attendre un peu puis restaurer TOUS les overlays
                setTimeout(() => {
                    restoreAllOverlays();
                }, 2000);
            } else {
                console.log(`[Planner Script] ❌ Tâche ${numeroReparation} non trouvée pour déplacement`);
            }

            // Si c'est le dernier déplacement
            if (index === movableTasks.length - 1) {
                setTimeout(() => {
                    console.log('[Planner Script] ✅ TOUS LES DÉPLACEMENTS TERMINÉS!');
                    // Arrêter la maintenance périodique
                    clearInterval(overlayMaintenance);
                    // Restauration finale complète
                    performFinalOverlayRestoration();
                    scanInProgress = false;
                }, 4000);
            }
        }, index * 6000); // 6 secondes entre chaque déplacement (plus de temps)
    });
}

// Fonction pour restaurer tous les overlays après les déplacements
function restoreAllOverlays() {
    if (tasksResults.size === 0) return;

    let overlaysChecked = 0;
    let overlaysRestored = 0;

    // Rechercher tous les conteneurs actuels
    const allContainers = document.querySelectorAll('.taskBoardCard');

    allContainers.forEach(container => {
        const lienElement = container.querySelector('a.referencePreviewDescription');
        let lien = lienElement?.getAttribute('href') || lienElement?.getAttribute('title');

        if (lien) {
            if (!lien.endsWith('.html')) lien += '.html';
            const numeroReparation = lien.match(/\/(\d+)(?:\.html)?$/)?.[1];

            // Vérifier si on a des résultats pour cette tâche
            if (numeroReparation && tasksResults.has(numeroReparation)) {
                overlaysChecked++;
                const result = tasksResults.get(numeroReparation);
                const taskCard = container.querySelector('div.taskCard');

                if (taskCard) {
                    // Vérifier si l'overlay existe déjà et est visible
                    const existingOverlay = taskCard.querySelector(`#idreparation-status-${numeroReparation}`);

                    if (!existingOverlay || existingOverlay.style.display === 'none') {
                        // Recréer l'overlay
                        const displayText = result.canMove ? '🚀 ' + result.texteLabel : '⏸️ ' + result.texteLabel;
                        ajouterOverlayTaskCard(taskCard, numeroReparation, displayText);

                        // Appliquer le style après création
                        setTimeout(() => {
                            const newOverlay = taskCard.querySelector(`#idreparation-status-${numeroReparation}`);
                            if (newOverlay) {
                                const backgroundColor = result.canMove ? 'rgba(0, 255, 0, 0.8)' : 'rgba(128, 128, 128, 0.8)';
                                newOverlay.style.backgroundColor = backgroundColor;
                                newOverlay.style.display = 'block';
                                newOverlay.style.visibility = 'visible';
                            }
                        }, 50);

                        overlaysRestored++;
                    } else {
                        // S'assurer que l'overlay existant est visible et à jour
                        const textElement = existingOverlay.querySelector('.text-collector');
                        if (textElement) {
                            const displayText = result.canMove ? '🚀 ' + result.texteLabel : '⏸️ ' + result.texteLabel;
                            textElement.textContent = displayText;
                        }

                        const backgroundColor = result.canMove ? 'rgba(0, 255, 0, 0.8)' : 'rgba(128, 128, 128, 0.8)';
                        existingOverlay.style.backgroundColor = backgroundColor;
                        existingOverlay.style.display = 'block';
                        existingOverlay.style.visibility = 'visible';
                    }
                }
            }
        }
    });

    if (overlaysRestored > 0) {
        console.log(`[Planner Script] 🔄 ${overlaysRestored}/${overlaysChecked} overlays restaurés`);
    }
}

// Fonction pour la restauration finale complète de tous les overlays
function performFinalOverlayRestoration() {
    console.log('[Planner Script] 🎨 RESTAURATION FINALE: Affichage de tous les overlays...');

    // Attendre un peu pour que l'interface se stabilise complètement
    setTimeout(() => {
        let totalRestored = 0;
        let totalTasks = tasksResults.size;

        // Rechercher tous les conteneurs dans toutes les colonnes
        const allContainers = document.querySelectorAll('.taskBoardCard');
        console.log(`[Planner Script] 🔍 Recherche dans ${allContainers.length} conteneurs...`);

        allContainers.forEach(container => {
            const lienElement = container.querySelector('a.referencePreviewDescription');
            let lien = lienElement?.getAttribute('href') || lienElement?.getAttribute('title');

            if (lien) {
                if (!lien.endsWith('.html')) lien += '.html';
                const numeroReparation = lien.match(/\/(\d+)(?:\.html)?$/)?.[1];

                if (numeroReparation && tasksResults.has(numeroReparation)) {
                    const result = tasksResults.get(numeroReparation);
                    const taskCard = container.querySelector('div.taskCard');

                    if (taskCard) {
                        // Supprimer l'ancien overlay s'il existe
                        const oldOverlay = taskCard.querySelector(`#idreparation-status-${numeroReparation}`);
                        if (oldOverlay) {
                            oldOverlay.remove();
                        }

                        // Déterminer le texte et la couleur selon l'état final
                        let displayText, backgroundColor;

                        // Vérifier dans quelle colonne se trouve maintenant la tâche
                        const parentColumn = container.closest('.listBoxGroup');
                        let columnName = 'Inconnue';
                        if (parentColumn) {
                            const columnHeader = parentColumn.querySelector('[data-automation-id="task-bucket-header"]');
                            columnName = columnHeader?.textContent?.trim() || 'Inconnue';
                        }

                        // Vérifier si la tâche a été cochée (peut être dans la colonne "Terminé")
                        const isInCompletedColumn = columnName.includes('Terminé') || columnName.includes('Completed') || columnName.includes('Done');

                        if (result.canComplete && isInCompletedColumn) {
                            // Tâche cochée avec succès
                            displayText = '✅ Cochée et terminée: ' + result.texteLabel;
                            backgroundColor = 'rgba(0, 100, 255, 0.9)'; // Bleu foncé
                        } else if (result.canComplete) {
                            // Tâche qui devait être cochée
                            displayText = '✅ Cochée: ' + result.texteLabel;
                            backgroundColor = 'rgba(0, 150, 255, 0.9)'; // Bleu
                        } else if (columnName.includes('En cours') || columnName.includes('In Progress')) {
                            // Tâche déplacée avec succès
                            displayText = '🚀 Déplacée: ' + result.texteLabel;
                            backgroundColor = 'rgba(0, 200, 0, 0.9)'; // Vert
                        } else if (result.canMove) {
                            // Tâche qui devait être déplacée mais qui n'a pas bougé
                            displayText = '🔄 À déplacer: ' + result.texteLabel;
                            backgroundColor = 'rgba(255, 165, 0, 0.9)'; // Orange
                        } else {
                            // Tâche qui ne devait pas être déplacée
                            displayText = '⏸️ Aucune action: ' + result.texteLabel;
                            backgroundColor = 'rgba(128, 128, 128, 0.8)'; // Gris
                        }

                        // Créer le nouvel overlay avec le statut final
                        ajouterOverlayTaskCard(taskCard, numeroReparation, displayText);

                        // Appliquer le style final
                        setTimeout(() => {
                            const finalOverlay = taskCard.querySelector(`#idreparation-status-${numeroReparation}`);
                            if (finalOverlay) {
                                finalOverlay.style.backgroundColor = backgroundColor;
                                finalOverlay.style.display = 'block';
                                finalOverlay.style.visibility = 'visible';
                                finalOverlay.style.opacity = '1';
                                finalOverlay.style.zIndex = '9999';

                                // Ajout d'un petit effet de mise en surbrillance
                                finalOverlay.style.border = '2px solid rgba(255, 255, 255, 0.8)';
                                finalOverlay.style.borderRadius = '4px';
                            }
                        }, 100);

                        totalRestored++;
                        console.log(`[Planner Script] 🎨 ${numeroReparation} dans "${columnName}": ${displayText}`);
                    }
                }
            }
        });

        // Rapport final
        setTimeout(() => {
            console.log(`[Planner Script] 🎉 RESTAURATION FINALE TERMINÉE!`);
            console.log(`[Planner Script] 📊 ${totalRestored}/${totalTasks} overlays affichés`);
            console.log(`[Planner Script] ✅ Tous les statuts sont maintenant visibles`);

            // Afficher un résumé des résultats
            displayFinalSummary();
        }, 1000);

    }, 2000); // Délai initial pour stabiliser l'interface
}

// Fonction pour afficher un résumé final
function displayFinalSummary() {
    let moved = 0;
    let completed = 0;
    let shouldHaveMoved = 0;
    let shouldHaveCompleted = 0;
    let noAction = 0;

    // Compter les résultats finaux
    document.querySelectorAll('.taskBoardCard').forEach(container => {
        const lienElement = container.querySelector('a.referencePreviewDescription');
        let lien = lienElement?.getAttribute('href') || lienElement?.getAttribute('title');

        if (lien) {
            if (!lien.endsWith('.html')) lien += '.html';
            const numeroReparation = lien.match(/\/(\d+)(?:\.html)?$/)?.[1];

            if (numeroReparation && tasksResults.has(numeroReparation)) {
                const result = tasksResults.get(numeroReparation);
                const parentColumn = container.closest('.listBoxGroup');

                if (parentColumn) {
                    const columnHeader = parentColumn.querySelector('[data-automation-id="task-bucket-header"]');
                    const columnName = columnHeader?.textContent?.trim() || '';

                    const isInCompletedColumn = columnName.includes('Terminé') || columnName.includes('Completed') || columnName.includes('Done');
                    const isInProgressColumn = columnName.includes('En cours') || columnName.includes('In Progress');

                    if (result.canComplete && isInCompletedColumn) {
                        completed++;
                    } else if (result.canComplete) {
                        shouldHaveCompleted++;
                    } else if (isInProgressColumn) {
                        moved++;
                    } else if (result.canMove) {
                        shouldHaveMoved++;
                    } else {
                        noAction++;
                    }
                }
            }
        }
    });

    console.log(`[Planner Script] 📈 RÉSUMÉ FINAL:`);
    console.log(`[Planner Script] ✅ Tâches cochées et terminées: ${completed}`);
    console.log(`[Planner Script] 🔄 Tâches qui auraient dû être cochées: ${shouldHaveCompleted}`);
    console.log(`[Planner Script] 🚀 Tâches déplacées avec succès: ${moved}`);
    console.log(`[Planner Script] 🔄 Tâches qui auraient dû être déplacées: ${shouldHaveMoved}`);
    console.log(`[Planner Script] ⏸️ Tâches sans action (normal): ${noAction}`);

    // ÉTAPE FINALE: Dernier scroll + scan complet pour nouvelles tâches
    setTimeout(() => {
        startFinalScrollAndScan();
    }, 3000);
}

// ÉTAPE FINALE: Dernier scroll puis scan complet des nouvelles tâches
function startFinalScrollAndScan() {
    console.log(`[Planner Script] 🏁 ÉTAPE FINALE: Dernier scroll + scan des nouvelles tâches...`);

    // D'abord effectuer un scroll final pour révéler toutes les tâches
    performFinalScroll().then(() => {
        // Attendre que le contenu se stabilise après le scroll
        setTimeout(() => {
            performFinalCompleteScan();
        }, 2000);
    });
}

// Fonction pour effectuer le scroll final
function performFinalScroll() {
    return new Promise((resolve) => {
        console.log(`[Planner Script] 📜 Scroll final pour révéler toutes les tâches...`);

        // Utiliser la fonction de scroll existante du module scroll
        const container = findScrollContainer();
        if (!container) {
            console.log(`[Planner Script] ❌ Aucun conteneur scrollable trouvé pour le scroll final`);
            resolve();
            return;
        }

        // Scroll progressif vers le bas
        let currentScrollTop = container.scrollTop;
        const maxScrollTop = container.scrollHeight - container.clientHeight;
        const scrollStep = 3000; // 3000px à la fois

        console.log(`[Planner Script] 📐 Scroll de ${currentScrollTop} vers ${maxScrollTop} (total: ${container.scrollHeight}px)`);

        function scrollStepByStep() {
            if (currentScrollTop >= maxScrollTop - 10) {
                console.log(`[Planner Script] ✅ Scroll final terminé!`);
                resolve();
                return;
            }

            currentScrollTop = Math.min(currentScrollTop + scrollStep, maxScrollTop);
            container.scrollTop = currentScrollTop;

            console.log(`[Planner Script] 📜 Scroll à ${currentScrollTop}px...`);

            // Attendre un peu pour que le contenu se charge
            setTimeout(scrollStepByStep, 800);
        }

        scrollStepByStep();
    });
}

// Fonction pour scanner toutes les tâches après le scroll final
function performFinalCompleteScan() {
    console.log(`[Planner Script] 🔍 SCAN FINAL COMPLET: Recherche de nouvelles tâches...`);

    // Chercher tous les conteneurs après le scroll
    let allContainers = document.querySelectorAll('.listBoxGroup .taskBoardCard');
    if (allContainers.length === 0) {
        allContainers = document.querySelectorAll('.taskBoardCard');
    }

    console.log(`[Planner Script] 📊 ${allContainers.length} conteneurs trouvés après scroll final`);

    // Identifier les nouvelles tâches
    const newTasks = [];
    let totalTasks = 0;
    let alreadyProcessed = 0;

    allContainers.forEach((container, index) => {
        const lienElement = container.querySelector('a.referencePreviewDescription');
        let lien = lienElement?.getAttribute('href') || lienElement?.getAttribute('title');

        if (lien) {
            if (!lien.endsWith('.html')) lien += '.html';
            const numeroReparation = lien.match(/\/(\d+)(?:\.html)?$/)?.[1];

            if (numeroReparation) {
                totalTasks++;

                // Vérifier si cette tâche a déjà été traitée
                if (tasksResults.has(numeroReparation)) {
                    alreadyProcessed++;
                } else {
                    // Nouvelle tâche trouvée !
                    const taskCard = container.querySelector('div.taskCard');
                    if (taskCard) {
                        newTasks.push({
                            container,
                            taskCard,
                            lien,
                            numeroReparation,
                            index: index + 1
                        });

                        console.log(`[Planner Script] 🆕 Nouvelle tâche détectée: ${numeroReparation}`);
                        ajouterOverlayTaskCard(taskCard, numeroReparation, '🆕 Nouveau scan...');
                    }
                }
            }
        }
    });

    console.log(`[Planner Script] 📊 BILAN FINAL: ${totalTasks} tâches au total, ${alreadyProcessed} déjà traitées, ${newTasks.length} nouvelles`);

    if (newTasks.length > 0) {
        // Scanner les nouvelles tâches
        console.log(`[Planner Script] 🚀 Scan de ${newTasks.length} nouvelles tâches...`);
        scanNewTasksAndProcess(newTasks);
    } else {
        console.log(`[Planner Script] ✅ SCAN FINAL TERMINÉ: Aucune nouvelle tâche trouvée`);
        markScanAsCompletelyFinished();
    }
}

// Fonction pour scanner et traiter les nouvelles tâches
function scanNewTasksAndProcess(newTasks) {
    let newPendingRequests = 0;
    const newTasksResults = new Map();

    // Scanner toutes les nouvelles tâches en parallèle
    newTasks.forEach((task, index) => {
        setTimeout(() => {
            const { lien, numeroReparation, taskCard } = task;
            newPendingRequests++;

            GM_xmlhttpRequest({
                method: 'GET',
                url: lien,
                onload: function (response) {
                    newPendingRequests--;

                    let texteLabel = 'Erreur';
                    let canMove = false;
                    let canComplete = false;

                    if (response.status === 200) {
                        const html = response.responseText;
                        const parser = new DOMParser();
                        const doc = parser.parseFromString(html, 'text/html');

                        const label = doc.querySelector('span.label-success');
                        texteLabel = label?.textContent?.trim() || 'non trouvé';

                        if (texteLabel === 'non trouvé' && response.finalUrl?.includes('/Prm/AfficherPv/')) {
                            texteLabel = 'Terminé / PV';
                        }

                        const autoListFinish = getList();
                        const matchInList = autoListFinish.some(item => texteLabel.includes(item));
                        const containsPieceEnProd = texteLabel.includes('PIECE EN PROD');
                        canMove = !containsPieceEnProd && !matchInList;
                        canComplete = matchInList && !containsPieceEnProd;
                    }

                    // Stocker dans les résultats globaux ET locaux
                    const result = {
                        texteLabel,
                        canMove,
                        canComplete,
                        taskCard,
                        originalContainer: task.container
                    };

                    tasksResults.set(numeroReparation, result);
                    newTasksResults.set(numeroReparation, result);

                    // Mettre à jour l'overlay
                    const overlay = taskCard.querySelector(`#idreparation-status-${numeroReparation}`);
                    if (overlay) {
                        const textElement = overlay.querySelector('.text-collector');
                        if (textElement) {
                            if (canComplete) {
                                textElement.textContent = '✅ ' + texteLabel;
                                overlay.style.backgroundColor = 'rgba(0, 0, 255, 0.8)';
                            } else if (canMove) {
                                textElement.textContent = '🚀 ' + texteLabel;
                                overlay.style.backgroundColor = 'rgba(0, 255, 0, 0.8)';
                            } else {
                                textElement.textContent = '⏸️ ' + texteLabel;
                                overlay.style.backgroundColor = 'rgba(128, 128, 128, 0.8)';
                            }
                        }
                    }

                    console.log(`[Planner Script] ✅ Nouvelle tâche scannée ${numeroReparation}: ${texteLabel}`);

                    // Vérifier si tous les scans sont terminés
                    if (newPendingRequests === 0) {
                        processNewTasksActions(newTasksResults);
                    }
                },
                onerror: function () {
                    newPendingRequests--;
                    console.log(`[Planner Script] ❌ Erreur scan nouvelle tâche ${numeroReparation}`);

                    if (newPendingRequests === 0) {
                        processNewTasksActions(newTasksResults);
                    }
                }
            });
        }, index * 100); // 100ms entre chaque requête
    });
}

// Fonction pour traiter les actions sur les nouvelles tâches
function processNewTasksActions(newTasksResults) {
    const newMovableTasks = Array.from(newTasksResults.entries()).filter(([_, result]) => result.canMove);
    const newCompletableTasks = Array.from(newTasksResults.entries()).filter(([_, result]) => result.canComplete);

    console.log(`[Planner Script] 🎯 NOUVELLES TÂCHES: ${newCompletableTasks.length} à cocher, ${newMovableTasks.length} à déplacer`);

    if (newCompletableTasks.length > 0 || newMovableTasks.length > 0) {
        // Traiter les nouvelles tâches avec le même système que les anciennes
        if (newCompletableTasks.length > 0) {
            console.log(`[Planner Script] ✅ Cochage des ${newCompletableTasks.length} nouvelles tâches terminées...`);
            setTimeout(() => {
                startSimplifiedCompletions(newCompletableTasks, newMovableTasks);
            }, 2000);
        } else if (newMovableTasks.length > 0) {
            console.log(`[Planner Script] 🚀 Déplacement des ${newMovableTasks.length} nouvelles tâches...`);
            setTimeout(() => {
                startSimplifiedMovements(newMovableTasks);
            }, 2000);
        }

        // Après le traitement, finaliser complètement
        const totalNewActions = newCompletableTasks.length + newMovableTasks.length;
        setTimeout(() => {
            markScanAsCompletelyFinished();
        }, totalNewActions * 4000 + 5000); // Temps estimé pour toutes les actions + marge
    } else {
        markScanAsCompletelyFinished();
    }
}

// Fonction pour marquer le scan comme complètement terminé
function markScanAsCompletelyFinished() {
    console.log(`[Planner Script] 🏆 SCAN COMPLÈTEMENT TERMINÉ!`);
    console.log(`[Planner Script] 📊 TOTAL FINAL: ${tasksResults.size} tâches traitées`);
    console.log(`[Planner Script] ✅ Toutes les tâches ont été scannées, cochées et déplacées selon les règles`);
    console.log(`[Planner Script] 🎉 Le processus de scan automatique est maintenant COMPLÈTEMENT FINI!`);

    // Marquer le scan comme terminé
    scanInProgress = false;

    // Remettre immédiatement le bouton à l'état prêt pour un nouveau scan
    if (typeof resetButtonToReady === 'function') {
        resetButtonToReady();
        console.log(`[Planner Script] 🔘 Bouton remis à l'état prêt pour un nouveau scan`);
    }

    // Dernière restauration des overlays pour s'assurer que tout est visible
    setTimeout(() => {
        restoreAllOverlays();
        console.log(`[Planner Script] 🎨 Restauration finale de tous les overlays effectuée`);

        // Message final très visible pour indiquer que l'utilisateur peut relancer
        displayFinalCompletionMessage();

        // S'assurer une dernière fois que le bouton est prêt
        if (typeof resetButtonToReady === 'function') {
            resetButtonToReady();
        }
    }, 2000);
}

// Fonction pour afficher un message final très visible
function displayFinalCompletionMessage() {
    console.log(`%c
╔═══════════════════════════════════════════════════════════════╗
║                    🎉 SCAN TERMINÉ ! 🎉                      ║
║                                                               ║
║   ✅ Toutes les tâches ont été traitées                      ║
║   ✅ Les overlays sont visibles                              ║
║   ✅ Le bouton SCAN est prêt pour un nouveau lancement       ║
║                                                               ║
║   🔄 CLIQUEZ À NOUVEAU SUR LE BOUTON SCAN POUR RELANCER     ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
    `, 'color: #00ff00; font-weight: bold; font-size: 14px;');

    console.log(`[Planner Script] 🎯 PRÊT POUR RELANCE: Vous pouvez maintenant cliquer sur le bouton SCAN`);
    console.log(`[Planner Script] 🔄 Le nouveau cycle fera: Scroll → Scan → Cochages → Déplacements → Scan Final`);

    // Ajouter un petit effet visuel sur le bouton pour indiquer qu'il est prêt
    if (typeof window.scrollButton !== 'undefined' && window.scrollButton) {
        const button = window.scrollButton;

        // Effet de pulsation plus visible
        button.style.animation = 'pulse 1.5s ease-in-out infinite';

        // Message au survol
        button.title = 'Cliquez pour relancer un nouveau scan complet';

        // Arrêter l'animation après 10 secondes
        setTimeout(() => {
            if (button) {
                button.style.animation = '';
            }
        }, 10000);
    }
}

// Fonction pour traiter tous les conteneurs rapidement (ANCIENNE VERSION - gardée pour compatibilité)
function processAllContainersRapidly() {
    // Chercher les conteneurs avec priorité : listBoxGroup d'abord, puis taskBoardCard
    let containers = document.querySelectorAll('.listBoxGroup .taskBoardCard');

    if (containers.length === 0) {
        containers = document.querySelectorAll('.taskBoardCard');
    }

    if (containers.length === 0) {
        console.log('[Planner Script] ❌ Aucun conteneur trouvé pour le traitement rapide');
        return;
    }

    console.log(`[Planner Script] ⚡ Traitement rapide de ${containers.length} conteneurs`);

    containers.forEach((container, index) => {
        const containerNumber = index + 1;
        console.log(`[Planner Script] Traitement rapide du conteneur ${containerNumber}`);

        const taskCard = container.querySelector('div.taskCard');
        if (!taskCard) {
            console.log(`[Planner Script] Pas de taskCard dans le conteneur ${containerNumber}`);
            return;
        }

        const lienElement = container.querySelector('a.referencePreviewDescription');
        let lien = lienElement?.getAttribute('href') || lienElement?.getAttribute('title');
        console.log(`[Planner Script] Lien trouvé pour le conteneur ${containerNumber}:`, lien);

        if (lien && !lien.endsWith('.html')) lien += '.html';
        if (!lien || !lien.includes('.html')) {
            console.log(`[Planner Script] Lien invalide pour le conteneur ${containerNumber}, ignoré`);
            return;
        }

        const numeroReparation = lien.match(/\/(\d+)(?:\.html)?$/)?.[1] || 'inconnu';

        // Vérifier si cette tâche a déjà été traitée
        if (processedTasks.has(numeroReparation)) {
            console.log(`[Planner Script] ⚠️ Tâche ${numeroReparation} déjà traitée, ignorée`);
            return;
        }

        console.log(`[Planner Script] Numéro de réparation: ${numeroReparation}`);
        processedTasks.add(numeroReparation);

        ajouterOverlayTaskCard(taskCard, numeroReparation, 'Chargement...');
        testerLienHttp(lien, taskCard);
    });

    // Marquer la fin du scan initial et démarrer le nouveau système
    setTimeout(() => {
        console.log('[Planner Script] ✅ Scan rapide initial terminé - DÉMARRAGE NOUVEAU SYSTÈME');
        startNewScanSystem();
    }, 1000);
}

// NOUVEAU SYSTÈME: Scan complet d'abord, puis déplacements
function startNewScanSystem() {
    // Chercher les conteneurs avec priorité : listBoxGroup d'abord, puis taskBoardCard
    let containers = document.querySelectorAll('.listBoxGroup .taskBoardCard');

    if (containers.length === 0) {
        containers = document.querySelectorAll('.taskBoardCard');
    }

    if (containers.length === 0) {
        console.log('[Planner Script] ❌ Aucun conteneur trouvé pour le nouveau système');
        return;
    }

    console.log(`[Planner Script] 🔍 NOUVEAU SYSTÈME - PHASE 1: Scan de ${containers.length} conteneurs (SANS déplacements)`);

    // Réinitialiser les variables
    tasksToScan = [];
    tasksResults.clear();
    pendingRequests = 0;

    // Préparer la liste des tâches à scanner
    containers.forEach((container, index) => {
        const containerNumber = index + 1;

        const taskCard = container.querySelector('div.taskCard');
        if (!taskCard) {
            return;
        }

        const lienElement = container.querySelector('a.referencePreviewDescription');
        let lien = lienElement?.getAttribute('href') || lienElement?.getAttribute('title');

        if (lien && !lien.endsWith('.html')) lien += '.html';
        if (!lien || !lien.includes('.html')) {
            return;
        }

        const numeroReparation = lien.match(/\/(\d+)(?:\.html)?$/)?.[1] || 'inconnu';

        // Vérifier si cette tâche a déjà été traitée par l'ancien système
        if (processedTasks.has(numeroReparation)) {
            console.log(`[Planner Script] ⚠️ Tâche ${numeroReparation} déjà traitée par l'ancien système, on la reprend`);
            // On la reprend quand même pour le nouveau système
        }

        // Ajouter l'overlay de scanning pour le nouveau système
        ajouterOverlayTaskCard(taskCard, numeroReparation, '🔍 Analyse...');

        // Ajouter à la liste des tâches à scanner
        tasksToScan.push({
            container,
            taskCard,
            lien,
            numeroReparation,
            containerNumber
        });
    });

    console.log(`[Planner Script] 📋 ${tasksToScan.length} tâches préparées pour le nouveau scan`);

    if (tasksToScan.length > 0) {
        // Lancer le scan de toutes les tâches
        startBatchScanning();
    }
}

// Fonction pour scanner par lots sans déplacer
function startBatchScanning() {
    console.log(`[Planner Script] 🚀 Démarrage du scan par lots (max ${maxConcurrentRequests} simultanés)`);

    // Traiter les tâches par petits lots
    tasksToScan.forEach((task, index) => {
        // Limiter le nombre de requêtes simultanées
        setTimeout(() => {
            scanTaskOnly(task);
        }, Math.floor(index / maxConcurrentRequests) * 1000); // 1 seconde entre chaque lot
    });
}

// Fonction pour scanner une tâche uniquement (sans déplacement)
function scanTaskOnly(task) {
    const { container, taskCard, lien, numeroReparation, containerNumber } = task;

    console.log(`[Planner Script] 🔍 Scan de la tâche ${numeroReparation}...`);
    pendingRequests++;

    GM_xmlhttpRequest({
        method: 'GET',
        url: lien,
        onload: function (response) {
            handleScanResult(response, task);
        },
        onerror: function () {
            console.log(`[Planner Script] ❌ Erreur scan pour ${numeroReparation}`);
            pendingRequests--;
            checkScanCompletion();
        }
    });
}

// Fonction pour traiter le résultat d'un scan
function handleScanResult(response, task) {
    const { container, taskCard, lien, numeroReparation } = task;
    pendingRequests--;

    if (response.status === 200) {
        const html = response.responseText;
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        const label = doc.querySelector('span.label-success');
        let texteLabel = label?.textContent?.trim() || 'non trouvé';

        // Traiter le cas PV
        if (texteLabel === 'non trouvé' && response.finalUrl?.includes('/Prm/AfficherPv/')) {
            texteLabel = 'Terminé / PV';
        }

        // Stocker le résultat
        tasksResults.set(numeroReparation, {
            container,
            taskCard,
            texteLabel,
            lien,
            canMove: shouldMoveTask(texteLabel),
            canComplete: shouldCompleteTask(texteLabel)
        });

        // Mettre à jour l'overlay avec le statut
        const overlay = taskCard.querySelector(`#idreparation-status-${numeroReparation}`);
        if (overlay) {
            const textElement = overlay.querySelector('.text-collector');
            if (textElement) {
                textElement.textContent = texteLabel;

                // Colorer selon le résultat
                if (shouldMoveTask(texteLabel)) {
                    overlay.style.backgroundColor = 'rgba(0, 255, 0, 0.8)'; // Vert pour déplacement
                    textElement.textContent = '🚀 ' + texteLabel;
                } else if (shouldCompleteTask(texteLabel)) {
                    overlay.style.backgroundColor = 'rgba(0, 0, 255, 0.8)'; // Bleu pour completion
                    textElement.textContent = '✅ ' + texteLabel;
                } else {
                    overlay.style.backgroundColor = 'rgba(128, 128, 128, 0.8)'; // Gris pour aucune action
                    textElement.textContent = '⏸️ ' + texteLabel;
                }
            }
        }

        console.log(`[Planner Script] ✅ Scan terminé pour ${numeroReparation}: "${texteLabel}"`);
    } else {
        console.log(`[Planner Script] ❌ Erreur ${response.status} pour ${numeroReparation}`);
    }

    checkScanCompletion();
}

// Vérifier si le scan est terminé et lancer les déplacements
function checkScanCompletion() {
    if (pendingRequests === 0) {
        console.log(`[Planner Script] 🎉 PHASE 1 TERMINÉE: Tous les scans sont terminés!`);
        console.log(`[Planner Script] 📊 ${tasksResults.size} tâches analysées`);

        // Afficher un résumé des actions prévues
        let movesToDo = 0;
        let completionsToDoCount = 0;

        tasksResults.forEach((result, numeroReparation) => {
            if (result.canMove) movesToDo++;
            if (result.canComplete) completionsToDoCount++;
        });

        console.log(`[Planner Script] 📋 Actions prévues: ${movesToDo} déplacements, ${completionsToDoCount} complétions`);

        // Arrêter la surveillance DOM avant les déplacements pour éviter les interférences
        if (domWatcher) {
            console.log('[Planner Script] 🛑 Arrêt de la surveillance DOM avant la phase de déplacement');
            domWatcher.disconnect();
            domWatcher = null;
        }

        // Lancer les déplacements après un délai
        setTimeout(() => {
            startMovementPhase();
        }, 3000);
    } else {
        console.log(`[Planner Script] ⏳ ${pendingRequests} scans en cours...`);
    }
}

// Phase 2: Effectuer les déplacements
function startMovementPhase() {
    console.log(`[Planner Script] 🚀 PHASE 2: Démarrage des déplacements...`);

    let movementsCount = 0;
    let completionsCount = 0;

    // Convertir en array pour un traitement séquentiel
    const tasksArray = Array.from(tasksResults.entries());

    // Traiter les déplacements un par un
    tasksArray.forEach(([numeroReparation, result], index) => {
        const { texteLabel, canMove, canComplete } = result;

        // Effectuer les déplacements avec des délais
        if (canMove) {
            setTimeout(async () => {
                console.log(`[Planner Script] 🚀 Déplacement ${movementsCount + 1}/${tasksArray.filter(([_, r]) => r.canMove).length}: ${numeroReparation} (${texteLabel})`);

                // CRUCIAL: Rechercher à nouveau l'élément DOM au moment du déplacement
                const currentTaskCard = await findCurrentTaskCard(numeroReparation);
                if (currentTaskCard) {
                    tryMoveTaskToDropZone(currentTaskCard, numeroReparation, texteLabel);
                } else {
                    console.log(`[Planner Script] ❌ Impossible de trouver la tâche ${numeroReparation} pour le déplacement`);
                }
            }, movementsCount * 6000); // 6 secondes entre chaque déplacement (plus de temps)
            movementsCount++;
        }

        // Effectuer les complétions avec des délais
        if (canComplete) {
            setTimeout(async () => {
                console.log(`[Planner Script] ✅ Completion ${completionsCount + 1}: ${numeroReparation} (${texteLabel})`);

                // CRUCIAL: Rechercher à nouveau l'élément DOM au moment de la completion
                const currentTaskCard = await findCurrentTaskCard(numeroReparation);
                if (currentTaskCard) {
                    tryClickComplete(currentTaskCard, numeroReparation, texteLabel);
                } else {
                    console.log(`[Planner Script] ❌ Impossible de trouver la tâche ${numeroReparation} pour la completion`);
                }
            }, (movementsCount * 6000) + (completionsCount * 2000)); // Après les déplacements
            completionsCount++;
        }
    });

    console.log(`[Planner Script] 📋 Programme: ${movementsCount} déplacements, ${completionsCount} complétions`);
}

// Fonction pour retrouver une taskCard par son numéro de réparation
function findCurrentTaskCard(numeroReparation) {
    console.log(`[Planner Script] 🔍 Recherche de la tâche ${numeroReparation} dans le DOM actuel...`);

    // Petite attente pour laisser le DOM se stabiliser
    return new Promise((resolve) => {
        setTimeout(() => {
            // Chercher d'abord dans les colonnes prioritaires (listBoxGroup)
            let allContainers = document.querySelectorAll('.listBoxGroup .taskBoardCard');

            // Si rien trouvé, chercher dans tous les conteneurs
            if (allContainers.length === 0) {
                allContainers = document.querySelectorAll('.taskBoardCard');
            }

            console.log(`[Planner Script] 🔍 Examen de ${allContainers.length} conteneurs pour trouver ${numeroReparation}...`);

            for (const container of allContainers) {
                const lienElement = container.querySelector('a.referencePreviewDescription');
                let lien = lienElement?.getAttribute('href') || lienElement?.getAttribute('title');

                if (lien) {
                    if (!lien.endsWith('.html')) lien += '.html';
                    const foundNumero = lien.match(/\/(\d+)(?:\.html)?$/)?.[1];

                    if (foundNumero === numeroReparation) {
                        const taskCard = container.querySelector('div.taskCard');
                        if (taskCard) {
                            console.log(`[Planner Script] ✅ Tâche ${numeroReparation} trouvée dans le DOM actuel`);

                            // Vérifier dans quelle colonne elle se trouve
                            const parentColumn = container.closest('.listBoxGroup');
                            if (parentColumn) {
                                const columnHeader = parentColumn.querySelector('[data-automation-id="task-bucket-header"]');
                                const columnName = columnHeader?.textContent?.trim() || 'Colonne inconnue';
                                console.log(`[Planner Script] 📍 Tâche ${numeroReparation} trouvée dans la colonne: ${columnName}`);
                            }

                            resolve(taskCard);
                            return;
                        } else {
                            console.log(`[Planner Script] ⚠️ Conteneur trouvé pour ${numeroReparation} mais pas de taskCard`);
                        }
                    }
                }
            }

            console.log(`[Planner Script] ❌ Tâche ${numeroReparation} non trouvée dans le DOM actuel`);
            resolve(null);
        }, 500); // 500ms pour laisser le DOM se stabiliser
    });
}

// Fonctions utilitaires pour déterminer les actions
function shouldMoveTask(texteLabel) {
    const autoListFinish = getList();
    const matchInList = autoListFinish.some(item => texteLabel.includes(item));
    const containsPieceEnProd = texteLabel.includes('PIECE EN PROD');

    return !containsPieceEnProd && !matchInList;
}

function shouldCompleteTask(texteLabel) {
    const completionList = [
        'ELECTRONIQUE - 01 - LIVRAISON EFFECTUEE',
        'ELECTRONIQUE - 02 - DEMANDE TRAITEE',
        'ELECTRONIQUE - 03 - REX TERMINE',
        'MECANIQUE - 12 - LIVRAISON EFFECTUEE',
        'MECANIQUE - 13 - DEMANDE TRAITEE',
        'MECANIQUE - 14 - REX TERMINE',
        'Terminé / PV'
    ];

    return completionList.some(item => texteLabel.includes(item));
}

// Fonction de surveillance DOM pour gérer les changements après déplacement
function startDOMWatcher() {
    if (domWatcher) {
        domWatcher.disconnect();
    }

    console.log('[Planner Script] 👁️ Démarrage de la surveillance DOM');

    let scanTimeout = null;
    let lastScanTime = 0;
    let changeMutationCount = 0;

    domWatcher = new MutationObserver((mutations) => {
        let hasSignificantChanges = false;
        let taskCardChanges = 0;

        mutations.forEach((mutation) => {
            if (mutation.type === 'childList') {
                // Compter les changements de tâches uniquement
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        const isTaskCard = node.classList && node.classList.contains('taskBoardCard');
                        const hasTaskCards = node.querySelectorAll && node.querySelectorAll('.taskBoardCard').length > 0;

                        if (isTaskCard || hasTaskCards) {
                            taskCardChanges++;
                            hasSignificantChanges = true;
                        }
                    }
                });

                mutation.removedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE && node.classList) {
                        if (node.classList.contains('taskBoardCard')) {
                            taskCardChanges++;
                            hasSignificantChanges = true;
                        }
                    }
                });
            }
        });

        if (hasSignificantChanges && taskCardChanges > 0) {
            changeMutationCount++;
            console.log(`[Planner Script] � Changement détecté: ${taskCardChanges} tâche(s) affectée(s) (mutation #${changeMutationCount})`);

            // Éviter les scans trop fréquents
            const now = Date.now();
            if (now - lastScanTime < 5000) {
                console.log('[Planner Script] ⏳ Scan trop récent, attente...');
                return;
            }

            // Annuler le timeout précédent
            if (scanTimeout) {
                clearTimeout(scanTimeout);
            }

            // Programmer un nouveau scan seulement si nécessaire
            scanTimeout = setTimeout(() => {
                // Vérifier s'il y a vraiment de nouvelles tâches à traiter
                const currentTasks = document.querySelectorAll('.taskBoardCard');
                let newTasksFound = 0;

                currentTasks.forEach((container) => {
                    const lienElement = container.querySelector('a.referencePreviewDescription');
                    let lien = lienElement?.getAttribute('href') || lienElement?.getAttribute('title');

                    if (lien) {
                        if (lien && !lien.endsWith('.html')) lien += '.html';
                        const numeroReparation = lien.match(/\/(\d+)(?:\.html)?$/)?.[1];

                        if (numeroReparation && !processedTasks.has(numeroReparation)) {
                            newTasksFound++;
                        }
                    }
                });

                if (newTasksFound > 0) {
                    console.log(`[Planner Script] 🆕 ${newTasksFound} nouvelle(s) tâche(s) trouvée(s), lancement du scan...`);
                    lastScanTime = Date.now();
                    processAllContainersRapidly();
                } else {
                    console.log('[Planner Script] ℹ️ Aucune nouvelle tâche trouvée, scan ignoré');
                }
            }, 4000); // Délai plus long pour éviter les scans inutiles
        }
    });

    // Observer tout le document pour capter les changements
    domWatcher.observe(document.body, {
        childList: true,
        subtree: true
    });

    // Arrêter la surveillance après 60 secondes avec rapport final
    setTimeout(() => {
        if (domWatcher) {
            domWatcher.disconnect();
            domWatcher = null;
            scanInProgress = false;
            console.log(`[Planner Script] 🛑 Surveillance DOM arrêtée après 60 secondes`);
            console.log(`[Planner Script] 📊 Résumé: ${processedTasks.size} tâches traitées au total, ${changeMutationCount} changements détectés`);
        }
        if (scanTimeout) {
            clearTimeout(scanTimeout);
        }
    }, 60000);
}

// Fonction pour arrêter la surveillance DOM si nécessaire
function stopDOMWatcher() {
    if (domWatcher) {
        domWatcher.disconnect();
        domWatcher = null;
        scanInProgress = false;
        console.log('[Planner Script] � Surveillance DOM arrêtée manuellement');
    }
}

// Fonction de diagnostic pour vérifier la détection de la nouvelle structure
function diagnosticStructure() {
    console.log('=== DIAGNOSTIC DE STRUCTURE DOM ===');

    // Vérifier les listBoxGroup (structure après déplacement - NOUVEAU)
    const listBoxGroups = document.querySelectorAll('.listBoxGroup');
    console.log(`🎯 Nombre de listBoxGroup trouvées: ${listBoxGroups.length}`);
    listBoxGroups.forEach((group, index) => {
        console.log(`- listBoxGroup ${index + 1}:`, group.className, group);
        const parent = group.parentElement;
        if (parent && parent.classList.contains('taskBoardColumnGroup')) {
            console.log(`  └─ Parent taskBoardColumnGroup:`, parent.className);
        }
        // Compter les tâches dans ce groupe
        const tasksInGroup = group.querySelectorAll('.taskBoardCard');
        console.log(`  └─ Tâches dans ce groupe: ${tasksInGroup.length}`);
    });

    // Vérifier les listWrapper (zone de drop principale)
    const listWrappers = document.querySelectorAll('.listWrapper');
    console.log(`Nombre de listWrapper trouvées: ${listWrappers.length}`);
    listWrappers.forEach((wrapper, index) => {
        console.log(`- listWrapper ${index + 1}:`, wrapper.className, wrapper);
        const parent = wrapper.parentElement;
        if (parent && parent.classList.contains('taskBoardColumnGroup')) {
            console.log(`  └─ Parent taskBoardColumnGroup:`, parent.className);
        }
    });

    // Vérifier les bottomDropZone (zone de drop secondaire)
    const bottomDropZones = document.querySelectorAll('.bottomDropZone');
    console.log(`Nombre de bottomDropZone trouvées: ${bottomDropZones.length}`);
    bottomDropZones.forEach((zone, index) => {
        console.log(`- bottomDropZone ${index + 1}:`, zone.className, zone);
    });

    // Vérifier les taskBoardCard (conteneurs principaux des tâches)
    const taskBoardCards = document.querySelectorAll('.taskBoardCard');
    console.log(`Nombre de taskBoardCard trouvées: ${taskBoardCards.length}`);
    taskBoardCards.forEach((card, index) => {
        if (index < 5) { // Limite l'affichage aux 5 premières
            console.log(`- taskBoardCard ${index + 1}:`, card.className, card.id, card);
            const innerTaskCard = card.querySelector('.taskCard');
            if (innerTaskCard) {
                console.log(`  └─ taskCard interne:`, innerTaskCard.className);
            }
        }
    });

    // Vérifier les taskCard internes
    const taskCards = document.querySelectorAll('[class*="taskCard"]');
    console.log(`Nombre de taskCard trouvées: ${taskCards.length}`);

    // Vérifier la colonne "En cours"
    const targetColumn = document.querySelector('#column_InProgress, li[id*="InProgress"], li[aria-label*="En cours"]');
    if (targetColumn) {
        console.log('Colonne "En cours" trouvée:', targetColumn.id || targetColumn.className, targetColumn);

        // Vérifier la structure complète
        const columnListBoxGroup = targetColumn.querySelector('.listBoxGroup');
        const columnListWrapper = targetColumn.querySelector('.listWrapper');
        const columnBottomDropZone = targetColumn.querySelector('.bottomDropZone');
        const columnTaskBoardGroup = targetColumn.querySelector('.taskBoardColumnGroup');

        if (columnListBoxGroup) {
            console.log('- 🎯 ✅ listBoxGroup dans la colonne "En cours" (OPTIMAL):', columnListBoxGroup.className, columnListBoxGroup);
            const tasksInListBoxGroup = columnListBoxGroup.querySelectorAll('.taskBoardCard');
            console.log(`  └─ Tâches dans listBoxGroup: ${tasksInListBoxGroup.length}`);
        } else {
            console.log('- ❌ Aucune listBoxGroup dans la colonne "En cours"');
        }

        if (columnListWrapper) {
            console.log('- ✅ listWrapper dans la colonne "En cours":', columnListWrapper.className, columnListWrapper);
        } else {
            console.log('- ❌ Aucune listWrapper dans la colonne "En cours"');
        }

        if (columnBottomDropZone) {
            console.log('- ✅ bottomDropZone dans la colonne "En cours":', columnBottomDropZone.className, columnBottomDropZone);
        } else {
            console.log('- ❌ Aucune bottomDropZone dans la colonne "En cours"');
        }

        if (columnTaskBoardGroup) {
            console.log('- ✅ taskBoardColumnGroup dans la colonne "En cours":', columnTaskBoardGroup.className, columnTaskBoardGroup);
        } else {
            console.log('- ❌ Aucun taskBoardColumnGroup dans la colonne "En cours"');
        }
    } else {
        console.log('❌ Colonne "En cours" non trouvée');
    }

    console.log('=== FIN DIAGNOSTIC ===');
}

// Rendre les fonctions accessibles globalement
window.scanContainers = scanContainers;
window.diagnosticStructure = diagnosticStructure;
window.resetCompleteSystem = resetCompleteSystem;
window.startCompleteScrollAndScanCycle = startCompleteScrollAndScanCycle;
window.resetButtonToReady = resetButtonToReady;

function ajouterOverlayTaskCard(taskCard, numeroReparation, texteLabel = 'Chargement...') {
    const thumbnail = taskCard.querySelector('.thumbnail.placeholder');
    if (!thumbnail) return;

    // Supprime s'il existe déjà (évite doublons) - recherche plus large
    const existingById = document.getElementById(`idreparation-status-${numeroReparation}`);
    if (existingById) existingById.remove();

    const existing = thumbnail.querySelector('.autoelement');
    if (existing) existing.remove();

    const container = document.createElement('div');
    container.className = 'autoelement';
    container.id = `idreparation-status-${numeroReparation}`;
    container.style.position = 'absolute';
    container.style.top = '50%';
    container.style.left = '50%';
    container.style.transform = 'translate(-50%, -50%)';
    container.style.zIndex = '10';
    container.style.borderRadius = '6px';
    container.style.padding = '5px 10px';
    container.style.fontSize = '12px';
    container.style.maxWidth = '160px';
    container.style.textAlign = 'center';

    container.innerHTML = `
        <div class="autoelement__img__container" style="text-align:center;">
            <img src="https://prod.cloud-collectorplus.mt.sncf.fr/assets/images/sprite_src/pictos/Collector_accueil.png"
                 alt="Icon"
                 class="autoelement__img__source"
                 style="width: 24px; height: 24px;">
        </div>
        <span class="autoelement__text text-numeroreparation" style="display:block; font-weight:bold; margin-top:4px;">
            ${numeroReparation}
        </span>
        <span class="autoelement__text text-collector" style="display:block; color: #333;">
            ${texteLabel}
        </span>
    `;

    thumbnail.style.position = 'relative';
    thumbnail.appendChild(container);

    // Ajuste dynamiquement la hauteur du thumbnail
    setTimeout(() => {
        const hauteurOverlay = container.scrollHeight;
        const hauteurMin = Math.max(hauteurOverlay + 20, 100);
        thumbnail.style.minHeight = hauteurMin + 'px';
    }, 0);
}

// Fonction qui vérifie si on doit cliquer sur le bouton "complete"
function tryClickComplete(taskCard, numeroReparation, texteLabel) {
    console.log(`[Planner Script] tryClickComplete appelée pour ${numeroReparation} avec statut: "${texteLabel}"`);

    const completeButton = taskCard.querySelector('.completeButtonWithAnimation');
    if (!completeButton) {
        console.log(`[Planner Script] Bouton complete non trouvé pour ${numeroReparation}`);
        return;
    }

    if (completeButton.getAttribute('aria-checked') === 'true') {
        console.log(`[Planner Script] Bouton déjà coché pour la tâche ${numeroReparation}, pas de clic`);
        return;
    }

    // Cas 1 : PV terminé
    if (texteLabel === 'Terminé / PV') {
        setTimeout(() => {
            completeButton.click();
            console.log(`[Planner Script] ✅ Bouton complete cliqué (PV) pour la tâche ${numeroReparation}`);
        }, 500);
        return;
    }

    // Cas 2 : correspond à un élément de la liste
    const autoListFinish = getList();
    const match = autoListFinish.some(item => texteLabel.includes(item));
    if (match) {
        setTimeout(() => {
            completeButton.click();
            console.log(`[Planner Script] ✅ Bouton complete cliqué (liste match: "${texteLabel}") pour la tâche ${numeroReparation}`);
        }, 500);
    } else {
        console.log(`[Planner Script] Statut "${texteLabel}" ne correspond pas aux critères de completion pour ${numeroReparation}`);
    }
}

// Fonction pour simuler un vrai drag & drop avec tous les événements nécessaires
function simulateDragAndDrop(sourceElement, targetElement) {
    try {
        console.log(`[Planner Script] 🎬 Simulation du drag & drop depuis:`, sourceElement);
        console.log(`[Planner Script] 🎯 Vers la cible:`, targetElement);

        // Vérifier que les éléments sont visibles
        const sourceRect = sourceElement.getBoundingClientRect();
        const targetRect = targetElement.getBoundingClientRect();

        console.log(`[Planner Script] Source rect:`, sourceRect);
        console.log(`[Planner Script] Target rect:`, targetRect);

        // Si l'élément source n'est pas visible, le faire défiler dans la vue
        if (sourceRect.top < 0 || sourceRect.bottom > window.innerHeight) {
            console.log(`[Planner Script] 📜 Élément source hors de vue, défilement...`);
            sourceElement.scrollIntoView({ behavior: 'smooth', block: 'center' });

            // Attendre que le défilement soit terminé
            return new Promise(resolve => {
                setTimeout(() => {
                    resolve(simulateDragAndDrop(sourceElement, targetElement));
                }, 1000);
            });
        }

        const sourceCenter = {
            x: sourceRect.left + sourceRect.width / 2,
            y: sourceRect.top + sourceRect.height / 2
        };

        const targetCenter = {
            x: targetRect.left + targetRect.width / 2,
            y: targetRect.top + targetRect.height / 2
        };

        console.log(`[Planner Script] Source position:`, sourceCenter);
        console.log(`[Planner Script] Target position:`, targetCenter);

        // Essayer d'abord avec un déplacement DOM direct puis des événements
        console.log(`[Planner Script] 🔄 Tentative de déplacement DOM direct...`);

        // Mémoriser la position originale
        const originalParent = sourceElement.parentElement;
        const originalNextSibling = sourceElement.nextElementSibling;

        // Déplacer physiquement l'élément
        targetElement.appendChild(sourceElement);

        // Vérifier si le déplacement a pris effet
        if (sourceElement.parentElement === targetElement) {
            console.log(`[Planner Script] ✅ Déplacement DOM direct réussi`);

            // Déclencher les événements pour notifier l'application
            setTimeout(() => {
                // Événements de drag & drop pour la cohérence
                const dragStartEvent = new DragEvent('dragstart', {
                    bubbles: true,
                    cancelable: true,
                    clientX: sourceCenter.x,
                    clientY: sourceCenter.y
                });
                sourceElement.dispatchEvent(dragStartEvent);

                const dropEvent = new DragEvent('drop', {
                    bubbles: true,
                    cancelable: true,
                    clientX: targetCenter.x,
                    clientY: targetCenter.y
                });
                targetElement.dispatchEvent(dropEvent);

                // Événements de mutation pour React
                const mutationEvent = new CustomEvent('taskMoved', {
                    bubbles: true,
                    detail: {
                        taskId: sourceElement.id,
                        source: originalParent,
                        target: targetElement,
                        type: 'manual-move'
                    }
                });

                document.dispatchEvent(mutationEvent);
                targetElement.dispatchEvent(new Event('DOMNodeInserted', { bubbles: true }));
                sourceElement.dispatchEvent(new Event('DOMNodeMoved', { bubbles: true }));

                console.log(`[Planner Script] ✅ Événements de notification envoyés`);
            }, 100);

            return true;
        } else {
            console.log(`[Planner Script] ❌ Déplacement DOM direct échoué, fallback vers événements`);

            // Remettre à la position originale
            if (originalNextSibling) {
                originalParent.insertBefore(sourceElement, originalNextSibling);
            } else {
                originalParent.appendChild(sourceElement);
            }

            // Fallback vers la simulation d'événements
            return simulateMouseDragAndDrop(sourceElement, targetElement);
        }

    } catch (error) {
        console.error(`[Planner Script] ❌ Erreur lors de la simulation du drag & drop:`, error);
        return simulateMouseDragAndDrop(sourceElement, targetElement);
    }
}

// Fonction de fallback utilisant des événements de souris
function simulateMouseDragAndDrop(sourceElement, targetElement) {
    try {
        const sourceRect = sourceElement.getBoundingClientRect();
        const targetRect = targetElement.getBoundingClientRect();

        const sourceCenter = {
            x: sourceRect.left + sourceRect.width / 2,
            y: sourceRect.top + sourceRect.height / 2
        };

        const targetCenter = {
            x: targetRect.left + targetRect.width / 2,
            y: targetRect.top + targetRect.height / 2
        };

        // 1. mousedown sur l'élément source
        const mouseDownEvent = new MouseEvent('mousedown', {
            bubbles: true,
            cancelable: true,
            clientX: sourceCenter.x,
            clientY: sourceCenter.y,
            button: 0
        });
        sourceElement.dispatchEvent(mouseDownEvent);
        console.log(`[Planner Script] ✅ mousedown event dispatched`);

        // 2. mousemove pour simuler le drag
        setTimeout(() => {
            const mouseMoveEvent = new MouseEvent('mousemove', {
                bubbles: true,
                cancelable: true,
                clientX: targetCenter.x,
                clientY: targetCenter.y,
                button: 0
            });
            document.dispatchEvent(mouseMoveEvent);
            console.log(`[Planner Script] ✅ mousemove event dispatched`);

            // 3. mouseup sur la cible
            setTimeout(() => {
                const mouseUpEvent = new MouseEvent('mouseup', {
                    bubbles: true,
                    cancelable: true,
                    clientX: targetCenter.x,
                    clientY: targetCenter.y,
                    button: 0
                });
                targetElement.dispatchEvent(mouseUpEvent);
                console.log(`[Planner Script] ✅ mouseup event dispatched`);

                // 4. click sur la cible pour finaliser
                setTimeout(() => {
                    const clickEvent = new MouseEvent('click', {
                        bubbles: true,
                        cancelable: true,
                        clientX: targetCenter.x,
                        clientY: targetCenter.y,
                        button: 0
                    });
                    targetElement.dispatchEvent(clickEvent);
                    console.log(`[Planner Script] ✅ click event dispatched`);
                }, 50);
            }, 100);
        }, 50);

        return true;

    } catch (error) {
        console.error(`[Planner Script] ❌ Erreur lors de la simulation des événements de souris:`, error);
        return false;
    }
}

// Fonction alternative utilisant une approche plus programatique
function simulateNativeDragAndDrop(sourceElement, targetElement) {
    try {
        console.log(`[Planner Script] 🔧 Tentative de drag & drop natif programmé`);

        // Vérifier si l'élément source a les bons attributs
        if (!sourceElement.draggable) {
            sourceElement.draggable = true;
            console.log(`[Planner Script] ✅ Élément source rendu draggable`);
        }

        // Créer un DataTransfer personnalisé
        const dataTransfer = new DataTransfer();
        dataTransfer.setData('text/plain', sourceElement.id || 'task');
        dataTransfer.effectAllowed = 'move';

        // Positions pour les événements
        const sourceRect = sourceElement.getBoundingClientRect();
        const targetRect = targetElement.getBoundingClientRect();

        const sourceCenter = {
            x: sourceRect.left + sourceRect.width / 2,
            y: sourceRect.top + sourceRect.height / 2
        };

        const targetCenter = {
            x: targetRect.left + targetRect.width / 2,
            y: targetRect.top + targetRect.height / 2
        };

        // Séquence d'événements avec délais
        return new Promise((resolve) => {
            let step = 0;

            const executeStep = () => {
                try {
                    switch(step) {
                        case 0:
                            // Focus sur l'élément source
                            sourceElement.focus();
                            console.log(`[Planner Script] ✅ Étape ${step}: focus sur source`);
                            break;

                        case 1:
                            // dragstart
                            const dragStartEvent = new DragEvent('dragstart', {
                                bubbles: true,
                                cancelable: true,
                                clientX: sourceCenter.x,
                                clientY: sourceCenter.y,
                                dataTransfer: dataTransfer
                            });

                            sourceElement.dispatchEvent(dragStartEvent);
                            console.log(`[Planner Script] ✅ Étape ${step}: dragstart`);
                            break;

                        case 2:
                            // dragenter sur target
                            const dragEnterEvent = new DragEvent('dragenter', {
                                bubbles: true,
                                cancelable: true,
                                clientX: targetCenter.x,
                                clientY: targetCenter.y,
                                dataTransfer: dataTransfer
                            });

                            dragEnterEvent.preventDefault = () => {};
                            targetElement.dispatchEvent(dragEnterEvent);
                            console.log(`[Planner Script] ✅ Étape ${step}: dragenter`);
                            break;

                        case 3:
                            // dragover sur target
                            const dragOverEvent = new DragEvent('dragover', {
                                bubbles: true,
                                cancelable: true,
                                clientX: targetCenter.x,
                                clientY: targetCenter.y,
                                dataTransfer: dataTransfer
                            });

                            dragOverEvent.preventDefault = () => {};
                            targetElement.dispatchEvent(dragOverEvent);
                            console.log(`[Planner Script] ✅ Étape ${step}: dragover`);
                            break;

                        case 4:
                            // drop sur target
                            const dropEvent = new DragEvent('drop', {
                                bubbles: true,
                                cancelable: true,
                                clientX: targetCenter.x,
                                clientY: targetCenter.y,
                                dataTransfer: dataTransfer
                            });

                            dropEvent.preventDefault = () => {};
                            targetElement.dispatchEvent(dropEvent);
                            console.log(`[Planner Script] ✅ Étape ${step}: drop`);
                            break;

                        case 5:
                            // dragend sur source
                            const dragEndEvent = new DragEvent('dragend', {
                                bubbles: true,
                                cancelable: true,
                                clientX: targetCenter.x,
                                clientY: targetCenter.y,
                                dataTransfer: dataTransfer
                            });

                            sourceElement.dispatchEvent(dragEndEvent);
                            console.log(`[Planner Script] ✅ Étape ${step}: dragend`);

                            // Finaliser
                            setTimeout(() => {
                                console.log(`[Planner Script] ✅ Séquence de drag & drop native terminée`);
                                resolve(true);
                            }, 100);
                            return;
                    }

                    step++;
                    setTimeout(executeStep, 150); // Délai entre chaque étape

                } catch (error) {
                    console.error(`[Planner Script] ❌ Erreur à l'étape ${step}:`, error);
                    resolve(false);
                }
            };

            executeStep();
        });

    } catch (error) {
        console.error(`[Planner Script] ❌ Erreur lors du drag & drop natif:`, error);
        return Promise.resolve(false);
    }
}

// Fonction pour simuler le déplacement d'une tâche vers la zone de drop
async function tryMoveTaskToDropZone(taskCard, numeroReparation, texteLabel) {
    console.log(`[Planner Script] tryMoveTaskToDropZone appelée pour ${numeroReparation} avec texte: "${texteLabel}"`);

    // Vérifier si la tâche contient "PIECE EN PROD" - si oui, ne pas la déplacer
    if (texteLabel.includes('PIECE EN PROD')) {
        console.log(`[Planner Script] ❌ Tâche ${numeroReparation} contient "PIECE EN PROD", pas de déplacement`);
        return;
    }

    // Vérifier si la tâche correspond à un élément de la liste configurable - si oui, ne pas la déplacer
    const autoListFinish = getList();
    const matchInList = autoListFinish.some(item => texteLabel.includes(item));
    if (matchInList) {
        console.log(`[Planner Script] ❌ Tâche ${numeroReparation} correspond à la liste configurable ("${texteLabel}"), pas de déplacement`);
        return;
    }

    console.log(`[Planner Script] ✅ Tâche ${numeroReparation} autorisée pour déplacement`);

    // Chercher la colonne "En cours" spécifiquement
    const targetColumn = document.querySelector('#column_InProgress, li[id*="InProgress"], li[aria-label*="En cours"]');
    let dropZone = null;

    if (targetColumn) {
        // NOUVEAU: Chercher d'abord le listBoxGroup (structure après déplacement)
        const listBoxGroup = targetColumn.querySelector('.listBoxGroup');
        if (listBoxGroup) {
            dropZone = listBoxGroup;
            console.log(`[Planner Script] ✅ Colonne "En cours" trouvée avec listBoxGroup (structure post-déplacement): ${listBoxGroup.className}`);
        } else {
            // Chercher le listWrapper dans la colonne "En cours" (zone de drop principale initiale)
            const listWrapper = targetColumn.querySelector('.listWrapper');
            if (listWrapper) {
                dropZone = listWrapper;
                console.log(`[Planner Script] ✅ Colonne "En cours" trouvée avec listWrapper: ${listWrapper.className}`);
            } else {
                // Fallback vers bottomDropZone (zone de drop secondaire)
                const bottomDropZone = targetColumn.querySelector('.bottomDropZone');
                if (bottomDropZone) {
                    dropZone = bottomDropZone;
                    console.log(`[Planner Script] ✅ Colonne "En cours" trouvée avec bottomDropZone: ${bottomDropZone.className}`);
                } else {
                    // Fallback vers le conteneur de tâches dans la colonne "En cours"
                    const taskContainer = targetColumn.querySelector('.taskBoardColumnGroup, [data-dnd-role="columnGroup"]');
                    if (taskContainer) {
                        dropZone = taskContainer;
                        console.log(`[Planner Script] ✅ Colonne "En cours" trouvée avec conteneur de tâches: ${taskContainer.className}`);
                    } else {
                        // Fallback vers la colonne elle-même
                        dropZone = targetColumn;
                        console.log(`[Planner Script] ✅ Colonne "En cours" trouvée (fallback): ${targetColumn.className}`);
                    }
                }
            }
        }
    } else {
        console.log(`[Planner Script] ⚠️ Colonne "En cours" non trouvée pour ${numeroReparation}`);
        return;
    }

    if (!dropZone) {
        console.log(`[Planner Script] ❌ Aucune zone de drop trouvée pour la tâche ${numeroReparation}`);
        return;
    }

    // Trouver l'élément parent de la tâche (taskBoardCard)
    const taskContainer = taskCard.closest('.taskBoardCard');
    if (!taskContainer) {
        console.log(`[Planner Script] ❌ Conteneur de tâche (taskBoardCard) non trouvé pour ${numeroReparation}`);
        return;
    }

    console.log(`[Planner Script] 🚀 Démarrage du déplacement de la tâche ${numeroReparation} vers la zone de drop`);

    setTimeout(async () => {
        try {
            // Sauvegarder la position originale
            const originalParent = taskContainer.parentElement;

            console.log(`[Planner Script] Élément à déplacer:`, taskContainer);
            console.log(`[Planner Script] Parent original:`, originalParent?.className);
            console.log(`[Planner Script] Zone de destination:`, dropZone);

            // Essayer de déplacer vers différentes cibles dans l'ordre de priorité
            const possibleTargets = [
                // Priorité 1: listBoxGroup (structure après déplacement - NOUVELLE PRIORITÉ)
                targetColumn?.querySelector('.listBoxGroup'),
                // Priorité 2: listWrapper (zone de drop principale selon votre HTML)
                targetColumn?.querySelector('.listWrapper'),
                // Priorité 3: bottomDropZone (zone de drop secondaire)
                targetColumn?.querySelector('.bottomDropZone'),
                // Priorité 4: Conteneur de tâches dans la colonne "En cours"
                targetColumn?.querySelector('.taskBoardColumnGroup'),
                targetColumn?.querySelector('[data-dnd-role="columnGroup"]'),
                // Priorité 5: La colonne "En cours" elle-même
                targetColumn,
                // Priorité 6: Zone de drop sélectionnée
                dropZone
            ].filter(target => target && target !== taskContainer);

            let moveSuccess = false;

            for (const [index, target] of possibleTargets.entries()) {
                try {
                    const targetName = target.id || target.className || target.tagName;
                    console.log(`[Planner Script] Tentative ${index + 1}: Déplacement vers "${targetName}"`);

                    // Stratégie spécifique selon le type de cible
                    let finalTarget = target;

                    if (target.classList?.contains('listBoxGroup')) {
                        // C'est la zone de drop après déplacement - PRIORITÉ ABSOLUE
                        finalTarget = target;
                        console.log(`[Planner Script] 🎯 Cible OPTIMALE trouvée: listBoxGroup (structure post-déplacement)`);
                    } else if (target.classList?.contains('listWrapper')) {
                        // C'est la zone de drop principale parfaite, l'utiliser directement
                        finalTarget = target;
                        console.log(`[Planner Script] Cible optimale trouvée: listWrapper (zone de drop principale)`);
                    } else if (target.classList?.contains('bottomDropZone')) {
                        // C'est la zone de drop secondaire, l'utiliser directement
                        finalTarget = target;
                        console.log(`[Planner Script] Cible secondaire trouvée: bottomDropZone`);
                    } else if (target.id === 'column_InProgress') {
                        // C'est la colonne "En cours", chercher d'abord listBoxGroup (structure post-déplacement), puis listWrapper, puis bottomDropZone
                        const listBoxGroup = target.querySelector('.listBoxGroup');
                        if (listBoxGroup) {
                            finalTarget = listBoxGroup;
                            console.log(`[Planner Script] 🎯 listBoxGroup trouvée dans la colonne (OPTIMAL): ${listBoxGroup.className}`);
                        } else {
                            const listWrapper = target.querySelector('.listWrapper');
                            if (listWrapper) {
                                finalTarget = listWrapper;
                                console.log(`[Planner Script] listWrapper trouvée dans la colonne: ${listWrapper.className}`);
                            } else {
                                const bottomDropZone = target.querySelector('.bottomDropZone');
                                if (bottomDropZone) {
                                    finalTarget = bottomDropZone;
                                    console.log(`[Planner Script] bottomDropZone trouvée dans la colonne: ${bottomDropZone.className}`);
                                } else {
                                    const innerTaskContainer = target.querySelector('.taskBoardColumnGroup') ||
                                                             target.querySelector('[data-dnd-role="columnGroup"]');
                                    if (innerTaskContainer) {
                                        finalTarget = innerTaskContainer;
                                        console.log(`[Planner Script] Conteneur de tâches trouvé dans la colonne: ${innerTaskContainer.className}`);
                                    }
                                }
                            }
                        }
                    }

                    // Simuler une vraie action de drag & drop
                    let success = await simulateDragAndDrop(taskContainer, finalTarget);

                    // Si la première approche échoue, essayer la fonction native
                    if (!success) {
                        console.log(`[Planner Script] ⚠️ Première approche échouée, tentative de drag & drop natif...`);
                        success = await simulateNativeDragAndDrop(taskContainer, finalTarget);
                    }

                    if (success) {
                        console.log(`[Planner Script] ✅ Drag & Drop simulé avec succès vers: "${finalTarget.id || finalTarget.className}"`);

                        // Attendre un peu pour que l'interface se mette à jour
                        await new Promise(resolve => setTimeout(resolve, 1500));

                        // Vérifier si on est bien dans la colonne "En cours"
                        const inProgressColumn = taskContainer.closest('#column_InProgress, li[aria-label*="En cours"]');
                        if (inProgressColumn) {
                            console.log(`[Planner Script] ✅ Confirmé: Tâche déplacée dans la colonne "En cours"`);
                        } else {
                            console.log(`[Planner Script] ⚠️ Attention: Tâche pas dans la colonne "En cours"`);
                        }

                        moveSuccess = true;
                        break;
                    }
                } catch (moveError) {
                    console.log(`[Planner Script] Échec déplacement vers target ${index + 1}:`, moveError.message);
                    continue;
                }
            }

            // Indicateur visuel
            const indicator = document.createElement('div');
            indicator.style.position = 'fixed';
            indicator.style.top = '10px';
            indicator.style.right = '100px';
            indicator.style.background = moveSuccess ? 'rgba(0, 200, 0, 0.9)' : 'rgba(255, 165, 0, 0.9)';
            indicator.style.color = 'white';
            indicator.style.padding = '5px 10px';
            indicator.style.borderRadius = '4px';
            indicator.style.zIndex = '10000';
            indicator.style.fontSize = '12px';
            indicator.style.fontWeight = 'bold';
            indicator.textContent = moveSuccess ? `✅ Déplacé: ${numeroReparation}` : `🔄 Tentative: ${numeroReparation}`;
            document.body.appendChild(indicator);

            setTimeout(() => {
                if (indicator.parentNode) {
                    indicator.parentNode.removeChild(indicator);
                }
            }, 6000);

        } catch (error) {
            console.error(`[Planner Script] Erreur lors du déplacement de la tâche ${numeroReparation}:`, error);
        }
    }, 1500); // Délai de 1.5 seconde après la validation du statut
}

function testerLienHttp(lien, taskCard, tentative = 1) {
    liensEnCours++;

    const maxTentatives = 5;
    const numeroReparation = lien.match(/\/(\d+)\.html$/)?.[1] || 'inconnu';

    GM_xmlhttpRequest({
        method: 'GET',
        url: lien,
        onload: function (response) {
            const overlay = taskCard.querySelector(`#idreparation-status-${numeroReparation}`);

            if (response.status === 200) {
                const html = response.responseText;
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');

                const label = doc.querySelector('span.label-success');

                const symbole = doc.getElementById('idSymbole')?.value?.trim() || 'non trouvé';
                const idUser = doc.getElementById('idUser')?.value?.trim() || 'non trouvé';

                let texteLabel = label?.textContent?.trim() || 'non trouvé';

                // Traiter le cas PV d'abord avant les autres actions
                if (texteLabel === 'non trouvé' && response.finalUrl?.includes('/Prm/AfficherPv/')) {
                    texteLabel = 'Terminé / PV';
                }

                console.log(`[Planner Script] 📊 Traitement de la tâche ${numeroReparation} avec statut: "${texteLabel}"`);

                // Vérifier les conditions d'exclusion pour le déplacement
                const autoListFinish = getList();
                console.log(`[Planner Script] 🔍 Liste d'exclusion:`, autoListFinish);
                console.log(`[Planner Script] 🔍 Vérification du statut "${texteLabel}" contre la liste`);

                const matchInList = autoListFinish.some(item => {
                    const match = texteLabel.includes(item);
                    if (match) {
                        console.log(`[Planner Script] 🎯 Match trouvé: "${item}" dans "${texteLabel}"`);
                    }
                    return match;
                });

                const containsPieceEnProd = texteLabel.includes('PIECE EN PROD');

                if (containsPieceEnProd) {
                    console.log(`[Planner Script] ⛔ Déplacement ignoré pour ${numeroReparation} (PIECE EN PROD)`);
                } else if (matchInList) {
                    console.log(`[Planner Script] ⛔ Déplacement ignoré pour ${numeroReparation} (correspond à la liste configurable: "${texteLabel}")`);
                } else {
                    console.log(`[Planner Script] 🚀 Déplacement autorisé pour ${numeroReparation} (statut: "${texteLabel}")`);
                    tryMoveTaskToDropZone(taskCard, numeroReparation, texteLabel);
                }

                // Puis gérer les clics complete avec un délai pour éviter les conflits
                setTimeout(() => {
                    tryClickComplete(taskCard, numeroReparation, texteLabel);
                }, 2000); // Délai de 2 secondes après le déplacement

                // ✅ Récupérer le nombre d'historique (si existe)
                let nombreHistorique = 0;
                const h3List = Array.from(doc.querySelectorAll('h3'));

                for (const h3 of h3List) {
                    const spanParent = h3.querySelector('span');
                    if (spanParent && spanParent.textContent.includes('Historique')) {
                        const badge = spanParent.querySelector('.badge.badge-onglet');
                        if (badge) {
                            const val = parseInt(badge.textContent.trim());
                            if (!isNaN(val)) {
                                nombreHistorique = val;
                            }
                        }
                        break; // dès qu'on a trouvé un bloc historique, on sort
                    }
                }

                const leftSection = taskCard.querySelector('.leftSection');
                if (leftSection) {
                    // Vérifie si un élément historique a déjà été injecté
                    if (!leftSection.querySelector('.badge-historique')) {
                        const historiqueDiv = document.createElement('div');
                        historiqueDiv.className = 'badge-historique';
                        historiqueDiv.textContent = `Historique : ${nombreHistorique}`;
                        historiqueDiv.style.marginLeft = 'auto';
                        historiqueDiv.style.padding = '2px 6px';
                        historiqueDiv.style.background = 'rgba(0,0,0,0.3)';
                        historiqueDiv.style.color = '#fff';
                        historiqueDiv.style.fontSize = '11px';
                        historiqueDiv.style.borderRadius = '4px';
                        historiqueDiv.style.alignSelf = 'center';

                        leftSection.appendChild(historiqueDiv);
                    }
                }

                if (nombreHistorique > 0 && idUser !== 'non trouvé') {
                    const urlHistorique = `https://prod.cloud-collectorplus.mt.sncf.fr/Prm/Reparation/ongletHistorique/${numeroReparation}?idUser=${idUser}&current_repair_id=${numeroReparation}`;

                    GM_xmlhttpRequest({
                        method: 'GET',
                        url: urlHistorique,
                        onload: function (res) {
                            const parser = new DOMParser();
                            const docHistorique = parser.parseFromString(res.responseText, 'text/html');
                            const lignes = Array.from(docHistorique.querySelectorAll('#dataTablesHistoriqueReparation tbody tr'));

                            const donnees = lignes.map(tr => {
                                const tds = tr.querySelectorAll('td');
                                return {
                                    numeroSerie: tds[2]?.textContent.trim(),
                                    numeroOf: tds[3]?.textContent.trim(),
                                    typeOf: tds[4]?.textContent.trim(),
                                    dateDebut: tds[6]?.textContent.trim(),
                                    etat: tds[7]?.textContent.trim(),
                                    consistance: tds[8]?.textContent.trim(),
                                };
                            });

                            const badge = leftSection.querySelector('.badge-historique');
                            if (badge) {
                                const overlay = document.createElement('div');
                                overlay.className = 'overlay-historique';
                                overlay.style.position = 'absolute';
                                overlay.style.top = '50%';
                                overlay.style.left = '50%';
                                overlay.style.transform = 'translate(-50%, -50%)';
                                overlay.style.background = 'rgba(0,0,0,0.85)';
                                overlay.style.color = '#fff';
                                overlay.style.padding = '10px';
                                overlay.style.borderRadius = '6px';
                                overlay.style.boxShadow = '0 2px 10px rgba(0,0,0,0.5)';
                                overlay.style.fontSize = '11px';
                                overlay.style.zIndex = '99999';
                                overlay.style.display = 'none';
                                overlay.style.overflowX = 'auto';

                                const table = document.createElement('table');
                                table.style.borderCollapse = 'separate';
                                table.style.width = '100%';
                                table.style.borderSpacing = '7px';
                                table.querySelectorAll('td, th').forEach(cell => {
                                    cell.style.padding = '4px 7px';
                                });
                                table.innerHTML = `<thead><tr><th>N° Série</th><th>OF</th><th>Type</th><th>Date Début</th><th>État</th><th>Consistance</th></tr></thead><tbody>${donnees.map(d => `<tr><td>${d.numeroSerie}</td><td>${d.numeroOf}</td><td>${d.typeOf}</td><td>${d.dateDebut}</td><td>${d.etat}</td><td>${d.consistance}</td></tr>`).join('')}</tbody>`;

                                overlay.appendChild(table);
                                document.body.appendChild(overlay);

                                badge.addEventListener('mouseenter', () => overlay.style.display = 'block');
                                badge.addEventListener('mouseleave', () => overlay.style.display = 'none');
                            }
                        }
                    });
                }

                const modificateur = extraireValeurParLibelle(doc, 'Dernière modif par :');
                const dateModif    = extraireValeurParLibelle(doc, 'Date dernière modif :');
                const infoAgent    = extraireValeurParLibelle(doc, 'Info Agent :');

                const index = donneesTaches.findIndex(t => t.numeroReparation === numeroReparation);
                const nouvelleTache = {
                    lien,
                    numeroReparation,
                    label: texteLabel,
                    idSymbole: symbole,
                    idUser: idUser,
                    modificateur,
                    dateModif,
                    infoAgent
                };

                if (index !== -1) {
                    donneesTaches[index] = nouvelleTache;
                } else {
                    donneesTaches.push(nouvelleTache);
                }

                if (overlay) {
                    overlay.querySelector('.text-collector').textContent = texteLabel;
                    overlay.querySelector('.text-numeroreparation').textContent = numeroReparation;
                    overlay.classList.remove('http-error');
                }

                const topBar = taskCard.querySelector('.topBar');
                if (topBar) {
                    let infoBox = topBar.querySelector('.collector-infos');
                    if (!infoBox) {
                        infoBox = document.createElement('div');
                        infoBox.className = 'collector-infos';
                        infoBox.style.marginBottom = '15px';
                        infoBox.style.background = 'rgba(0,0,0,0.5)';
                        infoBox.style.border = '1px solid #f97731';
                        infoBox.style.borderRadius = '4px';
                        infoBox.style.padding = '4px 6px';
                        infoBox.style.fontSize = '11px';
                        infoBox.style.lineHeight = '1.4';
                        infoBox.style.color = 'rgb(204,204,204)';
                        infoBox.style.fontFamily = "'Montserrat', sans-serif";
                        infoBox.style.fontWeight = '400';

                        // 🟠 Insérer AVANT le premier enfant de .topBar
                        topBar.insertBefore(infoBox, topBar.firstChild);
                    } else {
                        infoBox.innerHTML = '';
                    }

                    const addInfo = (label, val) => {
                        const span = document.createElement('span');
                        span.style.display = 'block';
                        span.innerHTML = `<strong>${label}</strong> ${val}`;
                        infoBox.appendChild(span);
                    };

                    if (texteLabel === 'Terminé / PV') {
                        addInfo('Terminé', '');
                    } else {
                        addInfo('Modifié par :', modificateur);
                        addInfo('Date modif :', dateModif);
                        addInfo('Info Agent :', infoAgent);
                    }

                    masquerPlanProduction();
                }

                liensEnCours = Math.max(0, liensEnCours - 1);

            } else {
                if (tentative < maxTentatives) {
                    setTimeout(() => testerLienHttp(lien, taskCard, tentative + 1), 2000);
                } else {
                    if (overlay) {
                        overlay.querySelector('.text-collector').textContent = `Erreur ${response.status}`;
                        overlay.classList.add('http-co-error');
                    }
                    liensEnCours = Math.max(0, liensEnCours - 1);
                }
            }
        },
        onerror: function () {
            if (tentative < maxTentatives) {
                setTimeout(() => testerLienHttp(lien, taskCard, tentative + 1), 2000);
            } else {
                const overlay = taskCard.querySelector(`#idreparation-status-${numeroReparation}`);
                if (overlay) {
                    overlay.querySelector('.text-collector').textContent = `Erreur réseau`;
                    overlay.classList.add('http-error');
                }
                liensEnCours = Math.max(0, liensEnCours - 1);
            }
        }
    });
}

function masquerPlanProduction() {
    const plans = document.querySelectorAll('div.planName');

    for (const plan of plans) {
        const texte = plan.textContent.trim();
        if (texte.includes('Production ')) {
            plan.style.display = 'none';
        }
    }
}

function extraireValeurParLibelle(doc, libelle) {
    const spans = [...doc.querySelectorAll('span')];
    for (const span of spans) {
        if (span.textContent.trim() === libelle) {
            const parentDiv = span.closest('div');
            const container = parentDiv?.parentElement;
            if (container) {
                const infos = container.querySelectorAll('div');
                if (infos.length >= 2) {
                    const valeur = infos[1]?.textContent?.trim();
                    if (valeur) return valeur;
                }
            }
        }
    }
    return '✖️';
}
