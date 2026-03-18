(function() {
    'use strict';

    // Ajouter du CSS personnalisé
    function ajouterStyles() {
        const style = document.createElement('style');
        style.textContent = `
            #panel-body-general {
                min-height: 300px !important;
                height: auto !important;
            }

            #S_observation_constat,
            #S_observation_reparation {
                height: 150px !important;
                min-height: 150px !important;
                resize: vertical !important;
            }

            textarea.not-resizable {
                resize: vertical !important;
            }
        `;
        document.head.appendChild(style);
    }

    // Fonction pour agrandir les éléments
    function agrandirElements() {
        // Agrandir le panel-body-general
        const panelBody = document.getElementById('panel-body-general');
        if (panelBody) {
            panelBody.style.setProperty('min-height', '300px', 'important');
            panelBody.style.setProperty('height', 'auto', 'important');
        }

        // Agrandir les textareas des commentaires
        const textareaObservationConstat = document.getElementById('S_observation_constat');
        if (textareaObservationConstat) {
            textareaObservationConstat.style.setProperty('height', '150px', 'important');
            textareaObservationConstat.style.setProperty('min-height', '150px', 'important');
            textareaObservationConstat.style.setProperty('resize', 'vertical', 'important');
            textareaObservationConstat.classList.remove('not-resizable');
        }

        const textareaObservationReparation = document.getElementById('S_observation_reparation');
        if (textareaObservationReparation) {
            textareaObservationReparation.style.setProperty('height', '150px', 'important');
            textareaObservationReparation.style.setProperty('min-height', '150px', 'important');
            textareaObservationReparation.style.setProperty('resize', 'vertical', 'important');
            textareaObservationReparation.classList.remove('not-resizable');
        }

        // Rendre les textareas redimensionnables
        const allTextareas = document.querySelectorAll('textarea.not-resizable');
        allTextareas.forEach(textarea => {
            textarea.style.setProperty('resize', 'vertical', 'important');
            textarea.classList.remove('not-resizable');
        });
    }

    // Ajouter les styles au chargement
    ajouterStyles();

    // Exécuter au chargement de la page
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', agrandirElements);
    } else {
        agrandirElements();
    }

    // Observer les changements DOM pour les éléments chargés dynamiquement
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length) {
                agrandirElements();
            }
        });
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
})();
