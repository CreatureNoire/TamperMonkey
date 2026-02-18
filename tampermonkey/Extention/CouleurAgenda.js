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
        uc: '#32CD32',
        plus30: '#FF6347' // Couleur pour les cases avec 30 et cercle plein
    };

    // Ajouter le style pour l'animation clignotante
    const style = document.createElement('style');
    style.textContent = `
        @keyframes clignoter-30 {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.3; }
        }
        .cellule-30-clignotante {
            animation: clignoter-30 1.5s ease-in-out infinite;
        }
    `;
    document.head.appendChild(style);

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
                colorierBoutonsRPRU(); // Mettre à jour les boutons RP/RU
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

        // Ligne pour 30+
        const li30Plus = document.createElement('li');
        li30Plus.className = 'ui-menu-item';
        li30Plus.style.cssText = `
            display: flex;
            align-items: center;
            padding: 8px 10px;
            gap: 10px;
        `;

        const label30Plus = document.createElement('span');
        label30Plus.textContent = '30 (cercle plein)';
        label30Plus.style.cssText = `
            flex: 1;
            font-size: 13px;
            color: #333;
            font-weight: 500;
        `;
        li30Plus.appendChild(label30Plus);

        const colorInput30Plus = document.createElement('input');
        colorInput30Plus.type = 'color';
        colorInput30Plus.value = couleursActuelles.plus30;
        colorInput30Plus.style.cssText = `
            width: 35px;
            height: 25px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
        `;

        colorInput30Plus.addEventListener('input', (e) => {
            e.stopPropagation();
            const nouvelleCouleur = colorInput30Plus.value;
            couleursActuelles.plus30 = nouvelleCouleur;
            sauvegarderCouleurs(couleursActuelles);
            colorerCellules30Plus(nouvelleCouleur);
            afficherFeedback(`✅ 30 (cercle plein) mis à jour !`);
        });

        colorInput30Plus.addEventListener('click', (e) => {
            e.stopPropagation();
        });

        li30Plus.appendChild(colorInput30Plus);
        menu.appendChild(li30Plus);

        // Séparateur
        const separateur = document.createElement('li');
        separateur.className = 'phx-agenda-menuseparator ui-widget-content ui-menu-divider';
        menu.appendChild(separateur);

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

    // Fonction pour cacher le chiffre 30 dans les cellules (sauf si cercle plein présent)
    function cacherChiffre30() {
        const tableau = document.querySelector('.tableCalendrierJourEx');
        if (!tableau) {
            return;
        }
        
        const cellules = tableau.querySelectorAll('.ui-phx-info-cell-style[data-date]');
        
        cellules.forEach((cellule) => {
            // Vérifier d'abord si la cellule a l'icône cercle plein
            const divAvecIcone = cellule.querySelector('.phx-cell-render-ind');
            const aIconeCerclePlein = divAvecIcone && divAvecIcone.querySelector('.cw-cercle-plein-icon');
            
            const texteDivs = cellule.querySelectorAll('.phx-cell-render-text');
            
            texteDivs.forEach(texteDiv => {
                const contenu = texteDiv.textContent.trim();
                
                // Si le contenu est exactement "30" ET qu'il n'y a PAS d'icône cercle plein, on cache l'élément
                if (contenu === '30' && !aIconeCerclePlein) {
                    texteDiv.style.setProperty('display', 'none', 'important');
                }
                // Si le contenu est "30" ET qu'il y a l'icône cercle plein, on s'assure qu'il est visible
                else if (contenu === '30' && aIconeCerclePlein) {
                    texteDiv.style.setProperty('display', 'block', 'important');
                }
            });
        });
    }

    // Fonction pour colorier les cellules contenant 30 avec l'icône cercle plein
    function colorerCellules30Plus(couleur) {
        const tableau = document.querySelector('.tableCalendrierJourEx');
        if (!tableau) {
            return;
        }
        
        const cellules = tableau.querySelectorAll('.ui-phx-info-cell-style[data-date]');
        
        cellules.forEach((cellule) => {
            // Chercher le texte "30" dans la cellule
            const texteDivs = cellule.querySelectorAll('.phx-cell-render-text');
            let contient30 = false;
            
            texteDivs.forEach(texteDiv => {
                const contenu = texteDiv.textContent.trim();
                if (contenu === '30') {
                    contient30 = true;
                }
            });
            
            // Chercher la div avec l'icône cercle plein (avec ou sans la classe phx-cell-ind-regaval)
            const divAvecIcone = cellule.querySelector('.phx-cell-render-ind');
            let contientIconeCerclePlein = false;
            
            if (divAvecIcone) {
                const iconeCerclePlein = divAvecIcone.querySelector('.cw-cercle-plein-icon');
                if (iconeCerclePlein) {
                    contientIconeCerclePlein = true;
                }
            }
            
            // Si on trouve à la fois "30" et la div avec l'icône cercle plein
            if (contient30 && contientIconeCerclePlein) {
                // Marquer la cellule comme déjà traitée pour éviter les doublons
                cellule.setAttribute('data-30-colore', 'true');
                
                // Ajouter la classe pour l'animation clignotante
                cellule.classList.add('cellule-30-clignotante');
                
                // Trouver tous les éléments phx-cell-render dans la cellule
                const phxCellRenders = cellule.querySelectorAll('.phx-cell-render');
                
                phxCellRenders.forEach(render => {
                    // Colorier le fond de chaque phx-cell-render
                    render.style.setProperty('background-color', couleur, 'important');
                    
                    // Colorier aussi les éléments enfants qui ont des couleurs
                    const elementsColores = render.querySelectorAll('[class*="ui-phx-color-"], .phx-cell-render-center');
                    elementsColores.forEach(elem => {
                        elem.style.setProperty('background-color', couleur, 'important');
                        elem.style.setProperty('color', 'white', 'important');
                    });
                });
                
                // Colorier aussi toute la cellule en arrière-plan
                cellule.style.setProperty('background-color', couleur, 'important');
                
                // Ajuster la couleur du texte pour la lisibilité
                const tousLesTextes = cellule.querySelectorAll('.phx-cell-render-text');
                tousLesTextes.forEach(elem => {
                    elem.style.setProperty('color', 'white', 'important');
                });
            } else {
                // Si la cellule ne correspond plus aux critères, retirer le marqueur, la coloration et l'animation
                if (cellule.getAttribute('data-30-colore') === 'true') {
                    cellule.removeAttribute('data-30-colore');
                    cellule.classList.remove('cellule-30-clignotante');
                    cellule.style.removeProperty('background-color');
                }
            }
        });
    }

    // Fonction pour ajouter des bordures fines entre les lignes
    function ajouterBorduresLignes() {
        const tableau = document.querySelector('.tableCalendrierJourEx');
        if (!tableau) {
            return;
        }
        
        // Ajouter une bordure fine en bas de chaque cellule
        const cellules = tableau.querySelectorAll('.ui-phx-info-cell-style');
        cellules.forEach((cellule) => {
            cellule.style.setProperty('border-bottom', '1px solid #e0e0e0', 'important');
        });
    }

    // Fonction pour appliquer les couleurs aux boutons RP et RU du script BoutonsupplémentaireOptimum.js
    function colorierBoutonsRPRU() {
        // Chercher le bouton RP
        const boutonRP = document.querySelector('button.btn-rp-custom');
        if (boutonRP) {
            // Utiliser la couleur RP Semaine pour le bouton (on pourrait aussi faire une moyenne ou un dégradé)
            boutonRP.style.setProperty('background-color', couleursActuelles.rpSemaine, 'important');
            boutonRP.style.setProperty('border-color', couleursActuelles.rpSemaine, 'important');
            boutonRP.style.setProperty('color', 'white', 'important');
            // Forcer le style au survol également
            boutonRP.addEventListener('mouseenter', function() {
                this.style.setProperty('background-color', couleursActuelles.rpSemaine, 'important');
                this.style.setProperty('border-color', couleursActuelles.rpSemaine, 'important');
            });
        }
        
        // Chercher le bouton RU
        const boutonRU = document.querySelector('button.btn-ru-custom');
        if (boutonRU) {
            boutonRU.style.setProperty('background-color', couleursActuelles.ru, 'important');
            boutonRU.style.setProperty('border-color', couleursActuelles.ru, 'important');
            boutonRU.style.setProperty('color', 'white', 'important');
            // Forcer le style au survol également
            boutonRU.addEventListener('mouseenter', function() {
                this.style.setProperty('background-color', couleursActuelles.ru, 'important');
                this.style.setProperty('border-color', couleursActuelles.ru, 'important');
            });
        }
        
        // Chercher le bouton CP (cible: <button type="button" class="btn btn-primary btn-withIcon btn-noHeight btn-cp-custom">)
        const boutonCP = document.querySelector('button.btn-cp-custom');
        if (boutonCP) {
            boutonCP.style.setProperty('background-color', couleursActuelles.uc, 'important');
            boutonCP.style.setProperty('border-color', couleursActuelles.uc, 'important');
            boutonCP.style.setProperty('color', 'white', 'important');
            // Forcer le style au survol également
            boutonCP.addEventListener('mouseenter', function() {
                this.style.setProperty('background-color', couleursActuelles.uc, 'important');
                this.style.setProperty('border-color', couleursActuelles.uc, 'important');
            });
        }
    }

    // Fonction pour colorier automatiquement tout
    function colorierAutomatiquement() {
        colorerElements('RP', false, couleursActuelles.rpSemaine);  // RP semaine
        colorerElements('RP', true, couleursActuelles.rpWeekend);   // RP weekend
        colorerElements('RU', null, couleursActuelles.ru);          // RU
        colorerElements('JF', null, couleursActuelles.jf);          // JF
        colorerElements('UC', null, couleursActuelles.uc);          // UC
        colorerCellules30Plus(couleursActuelles.plus30);            // Colorier les cellules 30 avec cercle plein (AVANT de cacher)
        cacherChiffre30();                                          // Cacher le chiffre 30 (après avoir colorié)
        ajouterBorduresLignes();                                    // Ajouter les bordures entre les lignes
        colorierBoutonsRPRU();                                      // Colorier les boutons RP et RU
    }

    // Observer les changements dans le DOM pour les tableaux dynamiques
    const observer = new MutationObserver((mutations) => {
        // Vérifier s'il y a de nouvelles cellules de calendrier
        const tableauPresent = document.querySelector('.tableCalendrier');
        if (tableauPresent) {
            // Temporairement suspendre l'observateur pendant la coloration pour éviter les boucles
            observer.disconnect();
            colorierAutomatiquement();
            // Redémarrer l'observateur
            observer.observe(document.body, config);
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
