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

        // Effets hover
        scrollButton.addEventListener('mouseenter', () => {
            scrollButton.style.transform = 'scale(1.05)';
            scrollButton.style.boxShadow = '0 4px 12px rgba(255, 104, 0, 1)';
        });

        scrollButton.addEventListener('mouseleave', () => {
            scrollButton.style.transform = 'scale(1)';
            scrollButton.style.boxShadow = '0 2px 8px rgba(255, 104, 0, 0.8)';
        });

        // Événement click unifié (scroll d'abord, puis scan)
        scrollButton.addEventListener('click', () => {
            console.log('[Bouton Unifié] Démarrage: Scroll puis Scan');
            
            // D'abord faire le scroll
            scrollToBottom();
            
            // Puis déclencher le scan après un délai pour laisser le temps au scroll
            setTimeout(() => {
                console.log('[Bouton Unifié] Lancement du scan après scroll');
                if (window.scanContainers) {
                    window.scanContainers();
                } else {
                    console.log('[Bouton Unifié] Fonction scanContainers non disponible');
                }
            }, 2000); // 2 secondes de délai pour laisser le scroll se terminer
        });

        // Ajouter le bouton au DOM
        document.body.appendChild(scrollButton);
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
        const taskElements = container.querySelectorAll('[class*="taskBoardCard"], [class*="card"], [data-index]');
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

})();

// -------------------- MODULE LISTE --------------------

// Liste configurable par l'utilisateur
const DEFAULT_LIST = "non trouvé, ATTENTE RT, ATTENTE REBUT, ATTENTE COMPOSANT, EN ATTENTE SOUS-TRAITANCE,CONTROLE QUALITE, ATTENTE SUPPORT";

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


    function scanContainers() {
        console.log('[Planner Script] Démarrage avec scan des conteneurs...');
        const containers = document.querySelectorAll('div.ms-FocusZone');
        console.log('[Planner Script] Nombre de conteneurs ms-FocusZone trouvés:', containers.length);
        
        if (containers.length === 0) {
            console.log('[Planner Script] Aucun conteneur ms-FocusZone trouvé, tentative avec d\'autres sélecteurs...');
            // Essayer d'autres sélecteurs possibles
            const alternateContainers = document.querySelectorAll('.taskCard, [class*="taskCard"], [class*="task-card"]');
            console.log('[Planner Script] Conteneurs alternatifs trouvés:', alternateContainers.length);
        }
        
        containers.forEach((container, index) => {
            console.log(`[Planner Script] Traitement du conteneur ${index + 1}`);
            const taskCard = container.querySelector('div.taskCard');
            if (!taskCard) {
                console.log(`[Planner Script] Pas de taskCard dans le conteneur ${index + 1}`);
                return;
            }

            const lienElement = container.querySelector('a.referencePreviewDescription');
            let lien = lienElement?.getAttribute('href') || lienElement?.getAttribute('title');
            console.log(`[Planner Script] Lien trouvé pour le conteneur ${index + 1}:`, lien);

            if (lien && !lien.endsWith('.html')) lien += '.html';
            if (!lien || !lien.includes('.html')) {
                console.log(`[Planner Script] Lien invalide pour le conteneur ${index + 1}, ignoré`);
                return;
            }

            const numeroReparation = lien.match(/\/(\d+)(?:\.html)?$/)?.[1] || 'inconnu';
            console.log(`[Planner Script] Numéro de réparation: ${numeroReparation}`);
            ajouterOverlayTaskCard(taskCard, numeroReparation, 'Chargement...');
            testerLienHttp(lien, taskCard);
        });
        
        console.log('[Planner Script] Scan terminé');
    }

    // Rendre la fonction scanContainers accessible globalement
    window.scanContainers = scanContainers;

    function ajouterOverlayTaskCard(taskCard, numeroReparation, texteLabel = 'Chargement...') {
        const thumbnail = taskCard.querySelector('.thumbnail.placeholder');
        if (!thumbnail) return;

        // Supprime s’il existe déjà (évite doublons)
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
        const completeButton = taskCard.querySelector('.completeButtonWithAnimation');
        if (!completeButton) return;

        if (completeButton.getAttribute('aria-checked') === 'true') {
            console.log(`[Planner Script] Bouton déjà coché pour la tâche ${numeroReparation}, pas de clic`);
            return;
        }

        // Cas 1 : PV terminé
        if (texteLabel === 'Terminé / PV') {
            setTimeout(() => {
                completeButton.click();
                console.log(`[Planner Script] Bouton complete cliqué (PV) pour la tâche ${numeroReparation}`);
            }, 500);
            return;
        }

        // Cas 2 : correspond à un élément de la liste
        const autoListFinish = getList();
        const match = autoListFinish.some(item => texteLabel.includes(item));
        if (match) {
            setTimeout(() => {
                completeButton.click();
                console.log(`[Planner Script] Bouton complete cliqué (liste match: "${texteLabel}") pour la tâche ${numeroReparation}`);
            }, 500);
        }
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
                    tryClickComplete(taskCard, numeroReparation, texteLabel);
                    if (texteLabel === 'non trouvé' && response.finalUrl?.includes('/Prm/AfficherPv/')) {
                        texteLabel = 'Terminé / PV';
                    }
                    else {
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
                                        //overlay.style.maxWidth = '900px';
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
                            //addInfo('Date Expédition :', dateExpe);
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

    /*function extraireValeurDivParTexte(doc, libelle) {
        const divs = Array.from(doc.querySelectorAll('div'));
        for (let i = 0; i < divs.length; i++) {
            if (divs[i].textContent.trim() === libelle) {
                const suivant = divs[i + 1];
                if (suivant) {
                    return suivant.textContent.trim();
                }
            }
        }
        return 'non trouvé';
    }*/
