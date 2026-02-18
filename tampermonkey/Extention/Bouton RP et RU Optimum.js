    // ==UserScript==
    // @name         Boutons RP et RU - Chronotime
    // @namespace    http://tampermonkey.net/
    // @version      1.1
    // @description  Ajoute deux boutons RP et RU pour créer des régularisations rapidement (uniquement si bouton "Nouveau" présent)
    // @author       Vous
    // @match        https://optimum.sncf.fr/chronotime/*
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

    // Fonction pour créer un bouton
    function createButton(text, className) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = `btn btn-primary btn-withIcon btn-noHeight ${className}`;
        button.style.cssText = 'width: auto; margin-left: 8px;';
        button.innerHTML = `<span class="c-menuButton__text">${text}</span>`;

        // Ajouter l'événement de clic
        button.addEventListener('click', function() {
            console.log(`Bouton ${text} cliqué`);
            createRegularisation(text);
        });

        return button;
    }    // Fonction pour simuler la création d'une régularisation
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
                        if (item.textContent.includes('régularisation')) {
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

        // Attendre que le conteneur de la zone droite soit présent
        waitForElement('.l-panelContainer__panelbg', function(container) {
            console.log('Conteneur trouvé, ajout des boutons RP/RU...');

            // Vérifier si les boutons n'existent pas déjà
            if (document.querySelector('.btn-rp-custom') || document.querySelector('.btn-ru-custom')) {
                console.log('Les boutons existent déjà');
                return;
            }

            // Trouver le conteneur pour insérer les boutons
            const zoneRightWrap = document.querySelector('.agenda_zone_right_wrap');
            if (!zoneRightWrap) {
                console.log('Zone right wrap non trouvée');
                return;
            }

            // Créer un conteneur pour les boutons
            const buttonContainer = document.createElement('div');
            buttonContainer.style.cssText = 'position: absolute; top: 10px; right: 10px; z-index: 1000; display: flex; gap: 8px;';

            // Créer les deux boutons
            const rpButton = createButton('RP', 'btn-rp-custom');
            const ruButton = createButton('RU', 'btn-ru-custom');

            // Ajouter les boutons au conteneur
            buttonContainer.appendChild(rpButton);
            buttonContainer.appendChild(ruButton);

            // Insérer le conteneur dans la page
            // On l'insère au début de l-panelContainer__panelbg avec position relative
            const panelBg = document.querySelector('.l-panelContainer__panelbg');
            if (panelBg) {
                panelBg.style.position = 'relative';
                panelBg.insertBefore(buttonContainer, panelBg.firstChild);
                console.log('Boutons RP et RU ajoutés avec succès');
            } else {
                console.log('Panel background non trouvé');
            }
        });
    }

    // Observer les changements dans le DOM pour réagir au chargement dynamique
    const observer = new MutationObserver(function(mutations) {
        // N'ajouter les boutons que si le bouton "Nouveau" est présent
        const nouveauPresent = document.querySelector('.agenda_acmcreercmb button, button.dropReg, button.creerAb');
        const containeurPresent = document.querySelector('.l-panelContainer__panelbg');
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
