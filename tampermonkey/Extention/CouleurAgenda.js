// ==UserScript==
// @name         Calendrier Couleur - RP en Violet
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Couleur Agenda Optimum
// @author       Vous
// @match        https://optimum.sncf.fr/chronotime/*
// @updateURL    https://raw.githubusercontent.com/CreatureNoire/TamperMonkey/edit/master/tampermonkey/Extention/CouleurAgenda.js
// @downloadURL  https://raw.githubusercontent.com/CreatureNoire/TamperMonkey/edit/master/tampermonkey/Extention/CouleurAgenda.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Couleurs par défaut
    const COULEURS_DEFAUT = {
        rpSemaine: '#9370DB',
        rpWeekend: '#FF8C00',
        ru: '#4169E1',
        jf: '#FF1493',
        uc: '#32CD32'
    };

    // Fonction pour charger les couleurs depuis localStorage
    function chargerCouleurs() {
        const couleursStockees = localStorage.getItem('calendrier-couleurs');
        if (couleursStockees) {
            return JSON.parse(couleursStockees);
        }
        return COULEURS_DEFAUT;
    }

    // Fonction pour sauvegarder les couleurs dans localStorage
    function sauvegarderCouleurs(couleurs) {
        localStorage.setItem('calendrier-couleurs', JSON.stringify(couleurs));
    }

    // Charger les couleurs au démarrage
    let couleursActuelles = chargerCouleurs();

    // Fonction pour ajuster la hauteur du tableau calendrier et cacher la zone des totaux
    function ajusterHauteurTableau() {
        // Cacher la zone des totaux en bas
        const zoneTotaux = document.querySelector('.agenda_zone_bottom');
        if (zoneTotaux) {
            zoneTotaux.style.setProperty('display', 'none', 'important');
        }
        
        // NE PAS toucher à .agenda_wrap - laisser la mise en page par défaut
        
        // Activer le scroll UNIQUEMENT sur le conteneur du calendrier
        const tableauContainer = document.querySelector('.agenda_zone_center_C_yearly');
        if (tableauContainer) {
            // Calculer la hauteur disponible (hauteur viewport - header - marges)
            const hauteurDisponible = window.innerHeight - 200; // Réserver 200px pour le header et autres éléments
            
            tableauContainer.style.setProperty('max-height', hauteurDisponible + 'px', 'important');
            tableauContainer.style.setProperty('overflow-y', 'auto', 'important');
            tableauContainer.style.setProperty('overflow-x', 'hidden', 'important');
            tableauContainer.style.setProperty('display', 'block', 'important');
        }
    }

    // Fonction pour créer le bouton dans la barre d'outils
    function creerBoutonBarre() {
        // Vérifier si le bouton existe déjà
        if (document.getElementById('btn-colorier-calendrier')) {
            return;
        }

        // Trouver la barre d'outils
        const barreOutils = document.querySelector('.phx-agenda-view.d-flex.align-items-center.justify-content-end.pr-4.col-3');
        if (!barreOutils) {
            return;
        }

        // Créer le bouton
        const bouton = document.createElement('button');
        bouton.id = 'btn-colorier-calendrier';
        bouton.className = 'btn btn-secondary btn-withIcon cw-icon-text phx-agenda-menuviewbtn phx-agenda-menuviewico';
        bouton.innerHTML = `
            <span>🎨 Couleurs</span>
            <span class="cw-icon-16 ctime-sprite-icon cw-icon"><svg><use xlink:href="assets/images/icons.svg#sprite-fleche_bas"></use></svg></span>
        `;
        bouton.style.marginRight = '10px';

        // Ajouter le gestionnaire de clic
        bouton.addEventListener('click', (e) => {
            e.stopPropagation();
            const menu = document.getElementById('menu-colorier');
            if (menu) {
                // Toggle la visibilité du menu
                if (menu.style.display === 'none') {
                    menu.style.display = 'block';
                } else {
                    menu.style.display = 'none';
                }
            } else {
                creerMenuDeroulant();
            }
        });

        // Insérer le bouton au début de la barre d'outils
        barreOutils.insertBefore(bouton, barreOutils.firstChild);
    }

    // Fonction pour créer le menu déroulant de coloration
    function creerMenuDeroulant() {
        // Vérifier si le menu existe déjà
        if (document.getElementById('menu-colorier')) {
            return;
        }

        // Trouver le bouton pour positionner le menu
        const bouton = document.getElementById('btn-colorier-calendrier');
        if (!bouton) {
            return;
        }

        // Créer le conteneur du menu
        const menu = document.createElement('ul');
        menu.id = 'menu-colorier';
        menu.className = 'phx-agenda-viewmenu c-panneauMenu ui-menu ui-widget ui-widget-content';
        menu.style.cssText = `
            display: block;
            position: absolute;
            z-index: 9999;
            background-color: white;
            border-radius: 4px;
            box-shadow: 0 4px 10px rgba(0,0,0,0.3);
            padding: 10px;
            min-width: 250px;
            list-style: none;
        `;

        // Positionner le menu sous le bouton
        const boutonRect = bouton.getBoundingClientRect();
        menu.style.top = (boutonRect.bottom + window.scrollY) + 'px';
        menu.style.left = boutonRect.left + 'px';

        // Fonction pour créer une ligne de sélection de couleur
        function creerLigneCouleur(label, couleurKey, typeElement, weekendOnly) {
            const li = document.createElement('li');
            li.className = 'ui-menu-item';
            li.style.cssText = `
                display: flex;
                align-items: center;
                padding: 8px 10px;
                gap: 10px;
            `;

            // Label
            const labelSpan = document.createElement('span');
            labelSpan.textContent = label;
            labelSpan.style.cssText = `
                flex: 1;
                font-size: 13px;
                color: #333;
                font-weight: 500;
            `;
            li.appendChild(labelSpan);

            // Input color
            const colorInput = document.createElement('input');
            colorInput.type = 'color';
            colorInput.value = couleursActuelles[couleurKey];
            colorInput.style.cssText = `
                width: 35px;
                height: 25px;
                border: none;
                border-radius: 4px;
                cursor: pointer;
            `;

            // Événement au changement de couleur (en temps réel)
            colorInput.addEventListener('input', (e) => {
                e.stopPropagation();
                const nouvelleCouleur = colorInput.value;
                couleursActuelles[couleurKey] = nouvelleCouleur;
                sauvegarderCouleurs(couleursActuelles);
                colorerElements(typeElement, weekendOnly, nouvelleCouleur);
                afficherFeedback(`✅ ${label} mis à jour !`);
            });

            colorInput.addEventListener('click', (e) => {
                e.stopPropagation();
            });

            li.appendChild(colorInput);
            return li;
        }

        // Ligne pour RP Semaine
        menu.appendChild(creerLigneCouleur('RP Semaine', 'rpSemaine', 'RP', false));

        // Ligne pour RP Weekend
        menu.appendChild(creerLigneCouleur('RP Weekend', 'rpWeekend', 'RP', true));

        // Ligne pour RU
        menu.appendChild(creerLigneCouleur('RU', 'ru', 'RU', null));

        // Ligne pour JF
        menu.appendChild(creerLigneCouleur('JF', 'jf', 'JF', null));

        // Ligne pour UC
        menu.appendChild(creerLigneCouleur('UC', 'uc', 'UC', null));

        // Séparateur
        const separateur = document.createElement('li');
        separateur.className = 'phx-agenda-menuseparator ui-widget-content ui-menu-divider';
        menu.appendChild(separateur);

        // Bouton pour tout colorier
        const liBtnTout = document.createElement('li');
        liBtnTout.className = 'ui-menu-item';
        liBtnTout.style.cssText = `
            padding: 5px 10px;
        `;

        const btnTout = document.createElement('button');
        btnTout.textContent = '🎨 Tout Colorier';
        btnTout.style.cssText = `
            display: block;
            width: 100%;
            padding: 8px;
            background-color: #28a745;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 13px;
            font-weight: bold;
            transition: all 0.2s ease;
        `;

        btnTout.addEventListener('mouseenter', () => {
            btnTout.style.transform = 'scale(1.02)';
        });

        btnTout.addEventListener('mouseleave', () => {
            btnTout.style.transform = 'scale(1)';
        });

        btnTout.addEventListener('click', (e) => {
            e.stopPropagation();
            colorerElements('RP', false, couleursActuelles.rpSemaine);
            colorerElements('RP', true, couleursActuelles.rpWeekend);
            colorerElements('RU', null, couleursActuelles.ru);
            colorerElements('JF', null, couleursActuelles.jf);
            colorerElements('UC', null, couleursActuelles.uc);
            afficherFeedback('✅ Tout coloré !');
        });

        liBtnTout.appendChild(btnTout);
        menu.appendChild(liBtnTout);

        // Zone de feedback
        const liFeedback = document.createElement('li');
        liFeedback.className = 'ui-menu-item';
        liFeedback.style.padding = '5px 10px';
        
        const feedback = document.createElement('div');
        feedback.id = 'feedback-colorier';
        feedback.style.cssText = `
            text-align: center;
            font-size: 11px;
            color: #28a745;
            font-weight: bold;
            min-height: 18px;
        `;
        liFeedback.appendChild(feedback);
        menu.appendChild(liFeedback);

        // Fonction pour afficher le feedback
        function afficherFeedback(message) {
            feedback.textContent = message;
            setTimeout(() => {
                feedback.textContent = '';
            }, 2000);
        }

        // Fermer le menu si on clique ailleurs
        document.addEventListener('click', (e) => {
            if (!menu.contains(e.target) && e.target.id !== 'btn-colorier-calendrier') {
                menu.style.display = 'none';
            }
        });

        // Ajouter le menu au document
        document.body.appendChild(menu);
    }

    // Fonction pour masquer/supprimer le menu
    function masquerMenu() {
        const menu = document.getElementById('menu-colorier');
        if (menu) {
            menu.style.display = 'none';
        }
    }

    // Fonction pour supprimer le bouton
    function masquerBouton() {
        const bouton = document.getElementById('btn-colorier-calendrier');
        if (bouton) {
            bouton.remove();
        }
        masquerMenu();
    }

    // Fonction pour vérifier la visibilité de la vue annuelle et gérer le bouton
    function gererAffichageMenu() {
        const vueAnnuelle = document.querySelector('.agenda_zone_center_C_yearly');
        if (vueAnnuelle && vueAnnuelle.style.display !== 'none') {
            creerBoutonBarre();
            ajusterHauteurTableau();
        } else {
            masquerBouton();
        }
    }

    // Fonction générique pour colorier les éléments (RP ou RU)
    function colorerElements(typeElement, weekendOnly, couleur) {
        // Sélectionner uniquement les cellules dans le tableau avec la classe tableCalendrierJourEx
        const tableau = document.querySelector('.tableCalendrierJourEx');
        if (!tableau) {
            return;
        }
        
        // Sélectionner toutes les cellules avec la classe ui-phx-info-cell-style dans ce tableau
        const cellules = tableau.querySelectorAll('.ui-phx-info-cell-style[data-date]');

        let elementsTrouves = 0;
        let elementsColores = 0;

        cellules.forEach((cellule) => {
            // Récupérer la date depuis l'attribut data-date
            const dateStr = cellule.getAttribute('data-date');
            
            if (dateStr) {
                // Convertir la date au format YYYYMMDD en objet Date
                const annee = parseInt(dateStr.substring(0, 4));
                const mois = parseInt(dateStr.substring(4, 6)) - 1; // Les mois commencent à 0
                const jour = parseInt(dateStr.substring(6, 8));
                const date = new Date(annee, mois, jour);
                
                // Obtenir le jour de la semaine (0 = dimanche, 6 = samedi)
                const jourSemaine = date.getDay();
                const estWeekend = (jourSemaine === 0 || jourSemaine === 6);
                
                // Trouver toutes les divs qui contiennent le texte recherché
                const texteDivs = cellule.querySelectorAll('.phx-cell-render-text');

                texteDivs.forEach(texteDiv => {
                    const contenu = texteDiv.textContent.trim();

                    // Vérifier si c'est le bon type d'élément (RP ou RU)
                    if (contenu === typeElement) {
                        elementsTrouves++;
                        
                        // Filtrer selon weekend/semaine si nécessaire
                        let doitColorier = false;
                        if (weekendOnly === null) {
                            // Pour RU, colorier tous les jours
                            doitColorier = true;
                        } else if (weekendOnly === true) {
                            // Colorier uniquement les weekends
                            doitColorier = estWeekend;
                        } else if (weekendOnly === false) {
                            // Colorier uniquement la semaine
                            doitColorier = !estWeekend;
                        }
                        
                        if (doitColorier) {
                            // Remonter jusqu'à trouver l'élément parent avec la classe de couleur
                            let parentCouleur = texteDiv.closest('.phx-cell-render');
                            
                            if (parentCouleur) {
                                // Pour UC, chercher .phx-cell-render-center au lieu de ui-phx-color-*
                                let elemCouleur;
                                if (typeElement === 'UC' || typeElement === 'JF') {
                                    elemCouleur = parentCouleur.querySelector('.phx-cell-render-center');
                                } else {
                                    elemCouleur = parentCouleur.querySelector('[class*="ui-phx-color-"]');
                                }
                                
                                if (elemCouleur) {
                                    // Appliquer la couleur avec !important
                                    elemCouleur.style.setProperty('background-color', couleur, 'important');
                                    elemCouleur.style.setProperty('color', 'white', 'important');
                                    elementsColores++;
                                }
                            }
                        }
                    }
                });
            }
        });
    }

    // Fonction pour colorier automatiquement tout
    function colorierAutomatiquement() {
        colorerElements('RP', false, couleursActuelles.rpSemaine);  // RP semaine
        colorerElements('RP', true, couleursActuelles.rpWeekend);   // RP weekend
        colorerElements('RU', null, couleursActuelles.ru);          // RU
        colorerElements('JF', null, couleursActuelles.jf);          // JF
        colorerElements('UC', null, couleursActuelles.uc);          // UC
    }

    // Observer les changements dans le DOM pour les tableaux dynamiques
    const observer = new MutationObserver((mutations) => {
        // Vérifier s'il y a de nouvelles cellules de calendrier
        const tableauPresent = document.querySelector('.tableCalendrier');
        if (tableauPresent) {
            colorierAutomatiquement();
        }
        
        // Gérer l'affichage du menu selon la vue active
        gererAffichageMenu();
    });

    // Configuration de l'observateur
    const config = {
        childList: true,
        subtree: true,
        attributes: true, // Observer les changements d'attributs (comme le style)
        attributeFilter: ['style'] // Filtrer pour ne surveiller que les changements de style
    };

    // Démarrer l'observation du document
    observer.observe(document.body, config);

    // Exécuter une première fois au chargement
    setTimeout(() => {
        colorierAutomatiquement();
        gererAffichageMenu();
        ajusterHauteurTableau();
    }, 1000);
    
    // Exécuter également après un délai plus long pour les chargements dynamiques
    setTimeout(() => {
        colorierAutomatiquement();
        gererAffichageMenu();
        ajusterHauteurTableau();
    }, 3000);
})();
