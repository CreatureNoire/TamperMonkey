(function () {
    'use strict';

    // ⬇️ Récupère la couleur personnalisée du localStorage, ou par défaut jaune
    let clignoteColor = localStorage.getItem('clignoteColor') || '#ffff00';

    // ⬇️ Style CSS clignotant basé sur la couleur
    function applyClignoteStyle(color) {
        GM_addStyle(`
            .clignote {
                animation: clignoteAnim 1s infinite;
                border: 3px solid ${color} !important;
margin-top: -2px;
                border-radius: 5px;
            }
            @keyframes clignoteAnim {
                0% { box-shadow: 0 0 5px 3px ${color}; }
                50% { box-shadow: 0 0 10px 6px transparent; }
                100% { box-shadow: 0 0 5px 3px ${color}; }
            }
        `);
    }

    applyClignoteStyle(clignoteColor); // Applique au lancement

    // ⬇️ Panneau de configuration de la couleur
    function createColorControlPanel() {
        if (document.getElementById('colorPanel')) return;

        const panel = document.createElement('div');
        panel.id = 'colorPanel';
        Object.assign(panel.style, {
            position: 'fixed',
            top: '60px',
            left: '20px',
            background: 'white',
            border: '1px solid #ccc',
            padding: '10px',
            zIndex: '9999',
            fontSize: '14px',
            fontFamily: 'Arial',
            borderRadius: '8px',
            boxShadow: '2px 2px 8px rgba(0,0,0,0.1)'
        });

        panel.innerHTML = `
            <strong>🎨 Couleur Alerte</strong><br>
            Couleur clignotement : <input type="color" id="alertColor" value="${clignoteColor}"><br><br>
            <button id="saveAlertColor">💾 Sauvegarder</button>
            <button id="closeAlertPanel" style="margin-left: 10px;">❌ Fermer</button>
        `;

        document.body.appendChild(panel);

        document.getElementById('alertColor').addEventListener('input', e => {
            clignoteColor = e.target.value;
            applyClignoteStyle(clignoteColor); // Met à jour le style immédiatement
        });

        document.getElementById('saveAlertColor').addEventListener('click', () => {
            localStorage.setItem('clignoteColor', clignoteColor);
            alert('✅ Couleur sauvegardée !');
            panel.style.display = 'none';
        });

        document.getElementById('closeAlertPanel').addEventListener('click', () => {
            panel.style.display = 'none';
        });
    }

    // ⬇️ Bouton fixe en haut pour ouvrir le panneau
    function addToggleButton() {
        if (document.getElementById('openColorPanel')) return;

        const btn = document.createElement('button');
        btn.id = 'openColorPanel';
        btn.textContent = '🎨 Couleur alerte';
        Object.assign(btn.style, {
            position: 'fixed',
            top: '17px',
            left: '225px',
            zIndex: '10000',
            padding: '6px 10px',
            backgroundColor: '#333',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '12px'
        });

        btn.addEventListener('click', () => {
            const panel = document.getElementById('colorPanel');
            if (panel) {
                panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
            } else {
                createColorControlPanel();
            }
        });

        document.body.appendChild(btn);
    }

    // ⬇️ Observer de mutation pour détecter l’image + gérer le style du bouton
    const observer = new MutationObserver(() => {
        const alertImg = document.querySelector('img.labelStatutPRM[style="opacity: 0.5"][src="https://prod.cloud-collectorplus.mt.sncf.fr/assets/images/Divers/alerte2.png"][alt="Retour prématuré"][title="Retour prématuré"]');
        const button = document.getElementById('id_dico_consistance_3');

        if (alertImg && button) {
            button.classList.add('clignote');
        } else if (!alertImg && button) {
            button.classList.remove('clignote');
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // ⬇️ Initialisation
    window.addEventListener('load', () => {
        addToggleButton();
    });
})();
