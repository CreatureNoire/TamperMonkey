(function () {
    'use strict';

    // =============================================
    // SCRIPT : Rebut Cause — Modal + Info Agent
    // Ctrl + Alt + R => Modifier les initiales
    // =============================================

    const STORAGE_KEY_INITIALES = 'rebutCause_initiales';

    // Récupérer les initiales sauvegardées ou détecter automatiquement
    function getInitiales() {
        const saved = localStorage.getItem(STORAGE_KEY_INITIALES);
        if (saved) return saved;

        // Détection automatique depuis le DOM (nom utilisateur)
        const userSpan = document.querySelector('.user-infos .user.ellipsis');
        if (userSpan) {
            const nomComplet = userSpan.textContent.trim().replace(/\s+/g, ' ');
            const parties = nomComplet.split(' ');
            if (parties.length >= 2) {
                return parties[0].charAt(0).toUpperCase() + parties[1].charAt(0).toUpperCase();
            }
        }
        return 'XX';
    }

    function setInitiales(val) {
        localStorage.setItem(STORAGE_KEY_INITIALES, val.toUpperCase());
    }

    // ── Injection des styles du modal ──
    function injectStyles() {
        if (document.getElementById('rebut-cause-styles')) return;
        const style = document.createElement('style');
        style.id = 'rebut-cause-styles';
        style.textContent = `
            /* ── Overlay ── */
            .rebut-overlay {
                position: fixed;
                inset: 0;
                background: rgba(0, 0, 0, 0.65);
                backdrop-filter: blur(4px);
                z-index: 99999;
                display: flex;
                justify-content: center;
                align-items: center;
                animation: rebutFadeIn 0.25s ease;
            }

            @keyframes rebutFadeIn {
                from { opacity: 0; }
                to   { opacity: 1; }
            }

            /* ── Modal Card ── */
            .rebut-modal {
                background: #1a1a2e;
                border: 1px solid rgba(0, 242, 234, 0.3);
                border-radius: 14px;
                box-shadow: 0 0 30px rgba(0, 242, 234, 0.15), 0 8px 32px rgba(0,0,0,0.5);
                width: 460px;
                max-width: 92vw;
                overflow: hidden;
                animation: rebutSlideUp 0.3s ease;
                font-family: "Segoe UI", "Fira Code", Consolas, sans-serif;
            }

            @keyframes rebutSlideUp {
                from { transform: translateY(30px); opacity: 0; }
                to   { transform: translateY(0);    opacity: 1; }
            }

            /* ── Header ── */
            .rebut-modal-header {
                background: linear-gradient(135deg, #16213e, #0f3460);
                padding: 16px 20px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-bottom: 1px solid rgba(0, 242, 234, 0.2);
            }

            .rebut-modal-header h3 {
                margin: 0;
                color: #00f2ea;
                font-size: 16px;
                font-weight: 700;
                letter-spacing: 0.5px;
                text-transform: uppercase;
            }

            .rebut-modal-close {
                background: none;
                border: none;
                color: #ff6b6b;
                font-size: 22px;
                cursor: pointer;
                padding: 0 4px;
                line-height: 1;
                transition: transform 0.2s, color 0.2s;
            }

            .rebut-modal-close:hover {
                transform: scale(1.3);
                color: #ff4444;
            }

            /* ── Body ── */
            .rebut-modal-body {
                padding: 20px;
            }

            .rebut-modal-body label {
                display: block;
                color: #a0a0b8;
                font-size: 13px;
                margin-bottom: 8px;
                font-weight: 600;
                letter-spacing: 0.3px;
            }

            .rebut-modal-body textarea {
                width: 100%;
                min-height: 90px;
                background: #0d0d1a;
                border: 1px solid rgba(0, 242, 234, 0.25);
                border-radius: 8px;
                color: #e5e5e5;
                font-size: 14px;
                padding: 12px;
                resize: vertical;
                font-family: inherit;
                transition: border-color 0.2s, box-shadow 0.2s;
                box-sizing: border-box;
            }

            .rebut-modal-body textarea:focus {
                outline: none;
                border-color: #00f2ea;
                box-shadow: 0 0 8px rgba(0, 242, 234, 0.3);
            }

            .rebut-modal-body textarea::placeholder {
                color: #555;
            }

            .rebut-modal-info {
                margin-top: 12px;
                padding: 10px 14px;
                background: rgba(0, 242, 234, 0.06);
                border-left: 3px solid #00f2ea;
                border-radius: 4px;
                font-size: 12px;
                color: #8888a8;
                line-height: 1.5;
            }

            .rebut-modal-info code {
                background: rgba(0, 242, 234, 0.12);
                color: #00f2ea;
                padding: 1px 5px;
                border-radius: 3px;
                font-size: 11.5px;
            }

            /* ── Footer ── */
            .rebut-modal-footer {
                padding: 14px 20px;
                display: flex;
                justify-content: flex-end;
                gap: 10px;
                border-top: 1px solid rgba(255,255,255,0.06);
                background: rgba(0,0,0,0.15);
            }

            .rebut-btn {
                padding: 8px 22px;
                border-radius: 8px;
                font-size: 13px;
                font-weight: 600;
                cursor: pointer;
                border: none;
                transition: all 0.2s;
            }

            .rebut-btn-cancel {
                background: #2a2a3e;
                color: #aaa;
                border: 1px solid #444;
            }

            .rebut-btn-cancel:hover {
                background: #3a3a4e;
                color: #ddd;
            }

            .rebut-btn-confirm {
                background: linear-gradient(135deg, #00b4d8, #0077b6);
                color: #fff;
                box-shadow: 0 2px 10px rgba(0, 180, 216, 0.35);
            }

            .rebut-btn-confirm:hover {
                background: linear-gradient(135deg, #00c4e8, #0087c6);
                box-shadow: 0 4px 16px rgba(0, 180, 216, 0.5);
                transform: translateY(-1px);
            }

            .rebut-btn-confirm:active {
                transform: translateY(0);
            }

            /* ── Modal Initiales ── */
            .rebut-modal-body input[type="text"] {
                width: 100%;
                background: #0d0d1a;
                border: 1px solid rgba(0, 242, 234, 0.25);
                border-radius: 8px;
                color: #e5e5e5;
                font-size: 16px;
                padding: 10px 12px;
                font-family: inherit;
                text-transform: uppercase;
                letter-spacing: 2px;
                text-align: center;
                transition: border-color 0.2s, box-shadow 0.2s;
                box-sizing: border-box;
            }

            .rebut-modal-body input[type="text"]:focus {
                outline: none;
                border-color: #00f2ea;
                box-shadow: 0 0 8px rgba(0, 242, 234, 0.3);
            }
        `;
        document.head.appendChild(style);
    }

    // ── Afficher le modal de cause de rebut ──
    function showRebutModal(callback) {
        injectStyles();

        const initiales = getInitiales();
        const today = new Date();
        const dateStr = today.toLocaleDateString('fr-FR');

        const overlay = document.createElement('div');
        overlay.className = 'rebut-overlay';

        overlay.innerHTML = `
            <div class="rebut-modal">
                <div class="rebut-modal-header">
                    <h3>🗑️ Cause de Rebut</h3>
                    <button class="rebut-modal-close" title="Fermer">&times;</button>
                </div>
                <div class="rebut-modal-body">
                    <label for="rebut-cause-input">Indiquez la cause du rebut :</label>
                    <textarea id="rebut-cause-input" placeholder="Ex : Fissure carter, Usure roulement..."></textarea>
                    <div class="rebut-modal-info">
                        <strong>Aperçu Info Agent :</strong><br>
                        <code id="rebut-preview">${initiales} -- ${dateStr} -- Rebut cause : ...</code>
                        <br><br>
                        <span>💡 Initiales actuelles : <strong style="color:#00f2ea;">${initiales}</strong></span>
                    </div>
                </div>
                <div class="rebut-modal-footer">
                    <button class="rebut-btn rebut-btn-cancel" id="rebut-cancel">Annuler</button>
                    <button class="rebut-btn rebut-btn-confirm" id="rebut-confirm">✅ Valider</button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        const textarea = overlay.querySelector('#rebut-cause-input');
        const preview = overlay.querySelector('#rebut-preview');
        const btnCancel = overlay.querySelector('#rebut-cancel');
        const btnClose = overlay.querySelector('.rebut-modal-close');
        const btnConfirm = overlay.querySelector('#rebut-confirm');

        // Focus auto sur le textarea
        setTimeout(() => textarea.focus(), 100);

        // Mise à jour de l'aperçu en temps réel
        textarea.addEventListener('input', () => {
            const cause = textarea.value.trim() || '...';
            preview.textContent = `${initiales} -- ${dateStr} -- Rebut cause : ${cause}`;
        });

        function close() {
            overlay.remove();
        }

        btnCancel.addEventListener('click', close);
        btnClose.addEventListener('click', close);
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) close();
        });

        // Fermer avec Escape
        function onKeydown(e) {
            if (e.key === 'Escape') {
                close();
                document.removeEventListener('keydown', onKeydown);
            }
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                btnConfirm.click();
            }
        }
        document.addEventListener('keydown', onKeydown);

        btnConfirm.addEventListener('click', () => {
            const cause = textarea.value.trim();
            if (!cause) {
                textarea.style.borderColor = '#ff4444';
                textarea.style.boxShadow = '0 0 8px rgba(255, 68, 68, 0.4)';
                textarea.setAttribute('placeholder', '⚠️ Veuillez saisir une cause !');
                textarea.focus();
                setTimeout(() => {
                    textarea.style.borderColor = '';
                    textarea.style.boxShadow = '';
                }, 1500);
                return;
            }

            document.removeEventListener('keydown', onKeydown);
            close();

            const texteInfoAgent = `${initiales} -- ${dateStr} -- Rebut cause : ${cause}`;
            callback(texteInfoAgent);
        });
    }

    // ── Afficher le modal de changement d'initiales ──
    function showInitialesModal() {
        injectStyles();

        const current = getInitiales();

        const overlay = document.createElement('div');
        overlay.className = 'rebut-overlay';

        overlay.innerHTML = `
            <div class="rebut-modal" style="width: 360px;">
                <div class="rebut-modal-header">
                    <h3>✏️ Modifier les initiales</h3>
                    <button class="rebut-modal-close" title="Fermer">&times;</button>
                </div>
                <div class="rebut-modal-body">
                    <label for="rebut-initiales-input">Vos initiales (2-3 lettres) :</label>
                    <input type="text" id="rebut-initiales-input" value="${current}" maxlength="3" placeholder="Ex : JH">
                    <div class="rebut-modal-info" style="margin-top:14px;">
                        Vos initiales seront utilisées dans le format :<br>
                        <code>[INITIALES] -- Date -- Rebut cause : ...</code>
                    </div>
                </div>
                <div class="rebut-modal-footer">
                    <button class="rebut-btn rebut-btn-cancel" id="init-cancel">Annuler</button>
                    <button class="rebut-btn rebut-btn-confirm" id="init-confirm">💾 Sauvegarder</button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        const input = overlay.querySelector('#rebut-initiales-input');
        const btnCancel = overlay.querySelector('#init-cancel');
        const btnClose = overlay.querySelector('.rebut-modal-close');
        const btnConfirm = overlay.querySelector('#init-confirm');

        setTimeout(() => { input.focus(); input.select(); }, 100);

        function close() {
            overlay.remove();
        }

        btnCancel.addEventListener('click', close);
        btnClose.addEventListener('click', close);
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) close();
        });

        function onKeydown(e) {
            if (e.key === 'Escape') {
                close();
                document.removeEventListener('keydown', onKeydown);
            }
            if (e.key === 'Enter') {
                e.preventDefault();
                btnConfirm.click();
            }
        }
        document.addEventListener('keydown', onKeydown);

        btnConfirm.addEventListener('click', () => {
            const val = input.value.trim();
            if (!val) {
                input.style.borderColor = '#ff4444';
                input.focus();
                return;
            }

            setInitiales(val);
            document.removeEventListener('keydown', onKeydown);
            close();

            console.log(`✅ [RebutCause] Initiales mises à jour : ${val.toUpperCase()}`);
        });
    }

    // ── Remplir le champ Info Agent via la modal de modification ──
    function remplirInfoAgent(texteInfoAgent) {
        console.log('[RebutCause] 🔧 Remplissage Info Agent avec :', texteInfoAgent);

        // Ouvrir le menu d'actions puis "Modifier la réparation"
        const boutonActions = document.querySelector('button.btn.btn-default.btn-xs.dropdown-toggle.pull-right[data-toggle="dropdown"]');
        if (boutonActions) {
            boutonActions.click();
        }

        setTimeout(() => {
            const lienModifier = document.querySelector('#editionReparation');
            if (!lienModifier) {
                console.error('[RebutCause] ❌ Bouton "Modifier la réparation" non trouvé');
                alert('❌ Impossible de trouver "Modifier la réparation"');
                return;
            }

            lienModifier.click();
            console.log('[RebutCause] ✅ Clic sur "Modifier la réparation"');

            setTimeout(() => {
                const champInfoAgent = document.querySelector('#S_info_agent');
                if (champInfoAgent) {
                    champInfoAgent.value = texteInfoAgent;
                    champInfoAgent.dispatchEvent(new Event('input', { bubbles: true }));
                    champInfoAgent.dispatchEvent(new Event('change', { bubbles: true }));
                    console.log('[RebutCause] ✅ Champ Info Agent rempli :', texteInfoAgent);

                    // Cliquer sur Valider
                    setTimeout(() => {
                        const boutonValider = document.querySelector('button[data-bb-handler="ok"].btn-success');
                        if (boutonValider) {
                            boutonValider.click();
                            console.log('[RebutCause] ✅ Bouton Valider cliqué');
                        } else {
                            console.log('[RebutCause] ⚠️ Bouton Valider non trouvé — remplissage effectué, validez manuellement');
                        }
                    }, 400);

                } else {
                    console.error('[RebutCause] ❌ Champ #S_info_agent non trouvé');
                    alert('❌ Champ Info Agent non trouvé dans la modal');
                }
            }, 1000);

        }, 300);
    }

    // ── Intercepter le clic sur le bouton "En attente Rebut" ──
    let isProcessingRebutClick = false; // Flag pour éviter la double interception

    document.addEventListener('click', function (e) {
        const btn = e.target.closest('button.button-next_etat');
        if (!btn) return;

        const label = btn.getAttribute('collector-next-state-name') || '';
        if (!label.includes('ATTENTE REBUT')) return;

        // Si on est en train de traiter un clic automatique, ne pas intercepter
        if (isProcessingRebutClick) {
            console.log('[RebutCause] ⏭️ Clic automatique détecté, laissé passer');
            return;
        }

        // Bloquer le clic d'origine
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();

        console.log('[RebutCause] 🗑️ Bouton "En attente Rebut" intercepté');

        // Afficher le modal de saisie
        showRebutModal(function (texteInfoAgent) {
            // 1. D'abord cliquer sur le bouton "En attente Rebut"
            isProcessingRebutClick = true; // Activer le flag
            btn.click();
            console.log('[RebutCause] ✅ Bouton "En attente Rebut" cliqué automatiquement');

            // Réinitialiser le flag après un court délai
            setTimeout(() => {
                isProcessingRebutClick = false;
            }, 500);

            // 2. Ensuite remplir le champ Info Agent (après que la page ait réagi au clic)
            setTimeout(() => {
                remplirInfoAgent(texteInfoAgent);
            }, 1500);
        });

    }, true); // ← capture phase pour intercepter avant les autres handlers

    console.log('[RebutCause] ✅ Script chargé');

})();
