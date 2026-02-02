(function() {
    'use strict';

    // Fonction pour vérifier si le symbole 08663935 est présent
    function checkSymbole() {
        const panelTitle = document.querySelector('.panel-title');
        if (panelTitle && panelTitle.textContent.includes('08663935')) {
            return true;
        }
        return false;
    }

    // Fonction pour ajouter le texte dans le textarea
    function ajouterTexteObservation() {
        const textarea = document.getElementById('S_observation_reparation');
        if (textarea) {
            const texteExistant = textarea.value;
            const nouveauTexte = 'JH --> test sur banc 0037 --> OK';

            // Ajouter le texte à la fin avec un saut de ligne si le textarea n'est pas vide
            if (texteExistant.trim() !== '') {
                textarea.value = texteExistant + '\n' + nouveauTexte;
            } else {
                textarea.value = nouveauTexte;
            }

            // Déclencher un événement pour que l'application détecte le changement
            textarea.dispatchEvent(new Event('input', { bubbles: true }));
            textarea.dispatchEvent(new Event('change', { bubbles: true }));

            console.log('Texte ajouté avec succès dans le textarea');

            // Simuler un clic sur le bouton Valider après un court délai
            setTimeout(function() {
                const btnValider = document.getElementById('fonctionnel_validate_form');
                if (btnValider) {
                    btnValider.click();
                    console.log('Clic automatique sur le bouton Valider effectué');
                } else {
                    console.error('Bouton Valider (fonctionnel_validate_form) non trouvé');
                }
            }, 500); // Délai de 500ms pour laisser le temps aux événements de se propager

        } else {
            console.error('Textarea S_observation_reparation non trouvé');
        }
    }

    // Fonction pour créer et insérer le bouton
    function creerBouton() {
        // Vérifier si le symbole est bien 08663935
        if (!checkSymbole()) {
            console.log('Symbole 08663935 non détecté, le bouton ne sera pas ajouté');
            return;
        }

        // Vérifier si le bouton existe déjà
        if (document.getElementById('btnTestOkPlatine')) {
            console.log('Le bouton existe déjà');
            return;
        }

        // Trouver la zone copie-rex-button-container
        const buttonContainer = document.querySelector('.copie-rex-button-container');
        if (!buttonContainer) {
            console.log('Zone copie-rex-button-container non trouvée');
            return;
        }

        // Modifier le container pour avoir l'alignement à droite avec justify-content: space-between
        buttonContainer.style.justifyContent = 'space-between';

        // Créer le bouton avec le même style que les autres boutons Frutiger (couleur orange par défaut)
        const bouton = document.createElement('button');
        bouton.id = 'btnTestOkPlatine';
        bouton.type = 'button';
        bouton.className = 'frutiger-button';
        bouton.style.cssText = `
            cursor: pointer;
            position: relative;
            padding: 1px;
            border-radius: 4px;
            border: 0px;
            text-shadow: rgba(0, 0, 0, 0.667) 1px 1px;
            background: linear-gradient(rgb(255, 140, 0), rgb(255, 165, 0));
            box-shadow: rgba(0, 0, 0, 0.533) 0px 2px 4px 0px;
            transition: 0.3s;
            margin: 3px;
            margin-left: auto;
        `;

        // Créer la structure interne du bouton
        const innerDiv = document.createElement('div');
        innerDiv.className = 'inner';
        innerDiv.style.cssText = `
            position: relative;
            inset: 0px;
            padding: 0.5em 1em;
            border-radius: 5px;
            background: radial-gradient(circle at 50% 100%, rgb(255, 165, 0) 10%, rgba(255, 165, 0, 0) 55%), linear-gradient(rgba(255, 140, 0, 0.667), rgba(255, 165, 0, 0.867));
            overflow: hidden;
            transition: inherit;
            font-size: 13px;
        `;

        // Animation shine
        const shineDiv = document.createElement('div');
        shineDiv.style.cssText = `
            content: "";
            position: absolute;
            inset: 0px;
            background: linear-gradient(-65deg, rgba(0, 0, 0, 0) 40%, rgba(255, 255, 255, 0.467) 50%, rgba(0, 0, 0, 0) 70%) 0% 0% / 200% 100% no-repeat;
            animation: 3s ease 0s infinite normal none running shine;
            pointer-events: none;
        `;

        // Top white gradient
        const topWhiteDiv = document.createElement('div');
        topWhiteDiv.className = 'top-white';
        topWhiteDiv.style.cssText = `
            position: absolute;
            border-radius: inherit;
            inset: 0px -8em;
            background: radial-gradient(circle at 50% -270%, rgb(255, 255, 255) 45%, rgba(255, 255, 255, 0.4) 60%, rgba(255, 255, 255, 0) 60%);
            transition: inherit;
            pointer-events: none;
        `;

        // Texte du bouton
        const textSpan = document.createElement('span');
        textSpan.className = 'text';
        textSpan.style.cssText = `
            position: relative;
            z-index: 1;
            color: white;
            font-weight: 550;
            transition: inherit;
            display: flex;
            align-items: center;
            gap: 4px;
            font-size: 13px;
            line-height: 1.2;
        `;

        const textContent = document.createElement('span');
        textContent.textContent = '✓ Test OK Banc 0037';
        textSpan.appendChild(textContent);

        // Assembler les éléments
        innerDiv.appendChild(shineDiv);
        innerDiv.appendChild(topWhiteDiv);
        innerDiv.appendChild(textSpan);
        bouton.appendChild(innerDiv);

        // Ajouter l'événement au clic
        bouton.addEventListener('click', function() {
            ajouterTexteObservation();
            // Feedback visuel - passer en vert
            textContent.textContent = '✓ Texte ajouté !';
            bouton.style.background = 'linear-gradient(rgb(40, 167, 69), rgb(92, 214, 125))';
            innerDiv.style.background = 'radial-gradient(circle at 50% 100%, rgb(92, 214, 125) 10%, rgba(92, 214, 125, 0) 55%), linear-gradient(rgba(40, 167, 69, 0.667), rgba(92, 214, 125, 0.867))';
            setTimeout(function() {
                textContent.textContent = '✓ Test OK Banc 0037';
                // Revenir à la couleur orange
                bouton.style.background = 'linear-gradient(rgb(255, 140, 0), rgb(255, 165, 0))';
                innerDiv.style.background = 'radial-gradient(circle at 50% 100%, rgb(255, 165, 0) 10%, rgba(255, 165, 0, 0) 55%), linear-gradient(rgba(255, 140, 0, 0.667), rgba(255, 165, 0, 0.867))';
            }, 2000);
        });

        // Ajouter le bouton à la fin du container
        buttonContainer.appendChild(bouton);

        console.log('Bouton "Test OK Banc 0037" ajouté avec succès');
    }

    // Observer les changements DOM pour détecter le chargement dynamique
    const observer = new MutationObserver(function(mutations) {
        creerBouton();
    });

    // Attendre que le DOM soit complètement chargé
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(creerBouton, 1000);
            // Observer les changements pour les chargements AJAX
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        });
    } else {
        setTimeout(creerBouton, 1000);
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
})();
