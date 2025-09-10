(function () {
    'use strict';

    const storageKey = "formCopies";
    const configKey = "formCopies_config";
    
    // Variable globale pour stocker le dernier payload capturé
    let lastCapturedPayload = null;

    // Interception permanente des requêtes réseau
    const originalFetch = window.fetch;
    const originalXHR = XMLHttpRequest.prototype.send;
    const originalOpen = XMLHttpRequest.prototype.open;

    // Intercepter fetch de manière permanente
    window.fetch = function(...args) {
        const [url, options] = args;
        
        // Interception spécifique pour EditComponentFailure avec fk_dico_constituant
        if (url && url.includes('EditComponentFailure')) {
            console.log('🎯 === INTERCEPTION EditComponentFailure (fetch) ===');
            console.log('URL:', url);
            if (options && options.body) {
                let parsedBody = null;
                let fk_dico_constituant = null;
                
                try {
                    // Essayer d'abord le parsing JSON
                    parsedBody = JSON.parse(options.body);
                    fk_dico_constituant = parsedBody.fk_dico_constituant;
                } catch (e) {
                    // Si ça échoue, c'est probablement du URL-encoded
                    console.log('📝 Payload URL-encoded détecté');
                    const urlParams = new URLSearchParams(options.body);
                    fk_dico_constituant = urlParams.get('fk_dico_constituant');
                    
                    // Convertir en objet pour faciliter la manipulation
                    parsedBody = {};
                    for (const [key, value] of urlParams.entries()) {
                        parsedBody[key] = value;
                    }
                }
                
                console.log('Payload complet:', parsedBody);
                
                // Vérifier si le payload contient fk_dico_constituant
                if (fk_dico_constituant) {
                    console.log('🔥 PAYLOAD AVEC CONSTITUANT DÉTECTÉ !');
                    console.log('fk_dico_constituant:', fk_dico_constituant);
                    console.log('Payload complet:', JSON.stringify(parsedBody, null, 2));
                    lastCapturedPayload = options.body;
                    
                    // Créer une clé unique avec suffixe si nécessaire
                    const uniqueKey = creerCleUniqueConstituant(fk_dico_constituant);
                    
                    // Sauvegarder dans le localStorage avec une clé spécifique au constituant
                    const timestamp = new Date().toISOString();
                    const storageKey = `constituant_${uniqueKey}_payloads`;
                    const savedPayloads = JSON.parse(localStorage.getItem(storageKey) || '[]');
                    
                    const payloadEntry = {
                        timestamp,
                        url,
                        payload: parsedBody,
                        rawPayload: options.body,
                        fk_dico_constituant: fk_dico_constituant,
                        unique_key: uniqueKey
                    };
                    
                    savedPayloads.push(payloadEntry);
                    localStorage.setItem(storageKey, JSON.stringify(savedPayloads));
                    
                    // Maintenir aussi un index global de tous les constituants
                    const globalIndex = JSON.parse(localStorage.getItem('constituants_index') || '{}');
                    if (!globalIndex[uniqueKey]) {
                        globalIndex[uniqueKey] = {
                            original_id: fk_dico_constituant,
                            first_seen: timestamp,
                            count: 0,
                            storage_key: storageKey
                        };
                    }
                    globalIndex[uniqueKey].count = savedPayloads.length;
                    globalIndex[uniqueKey].last_seen = timestamp;
                    localStorage.setItem('constituants_index', JSON.stringify(globalIndex));
                    
                    console.log(`💾 Payload sauvegardé dans localStorage (clé: ${storageKey})`);
                    console.log(`📊 ${savedPayloads.length} payload(s) pour le constituant ${uniqueKey}`);
                } else {
                    console.log('⚠️ Payload EditComponentFailure sans fk_dico_constituant');
                }
            }
            console.log('🎯 === FIN INTERCEPTION EditComponentFailure ===');
        }
        
        // Intercepter toutes les requêtes pour voir lesquelles contiennent les données (SAUF EditComponentFailure qui est géré spécifiquement)
        if (url && (url.includes('/Prm/') || url.includes('Validate') || url.includes('Edit') || url.includes('Save')) &&
                   !url.includes('EditComponentFailure')) {
            console.log('=== REQUÊTE INTERCEPTÉE (fetch) ===');
            console.log('URL:', url);
            if (options && options.body) {
                try {
                    const parsedBody = JSON.parse(options.body);
                    console.log('Payload (JSON):', parsedBody);
                    // Sauvegarder si c'est une requête importante
                    if (url.includes('Validate') || 
                        (typeof parsedBody === 'object' && Object.keys(parsedBody).length > 3)) {
                        lastCapturedPayload = options.body;
                        console.log('>>> PAYLOAD SAUVEGARDÉ <<<');
                    }
                } catch (e) {
                    console.log('Payload (raw):', options.body);
                    // Sauvegarder si c'est une requête importante
                    if (url.includes('Validate') || 
                        (options.body && options.body.length > 50)) {
                        lastCapturedPayload = options.body;
                        console.log('>>> PAYLOAD SAUVEGARDÉ <<<');
                    }
                }
            } else {
                console.log('Aucun body dans la requête fetch');
            }
            console.log('Options complètes:', options);
            console.log('=== FIN REQUÊTE ===');
        }
        return originalFetch.apply(this, args);
    };

    // Intercepter XMLHttpRequest de manière permanente
    XMLHttpRequest.prototype.send = function(data) {
        
        // Interception spécifique pour EditComponentFailure avec fk_dico_constituant
        if (this._url && this._url.includes('EditComponentFailure')) {
            console.log('🎯 === INTERCEPTION EditComponentFailure (XHR) ===');
            console.log('URL:', this._url);
            if (data) {
                let parsedData = null;
                let fk_dico_constituant = null;
                
                try {
                    // Essayer d'abord le parsing JSON
                    parsedData = JSON.parse(data);
                    fk_dico_constituant = parsedData.fk_dico_constituant;
                } catch (e) {
                    // Si ça échoue, c'est probablement du URL-encoded
                    console.log('📝 Payload URL-encoded détecté');
                    const urlParams = new URLSearchParams(data);
                    fk_dico_constituant = urlParams.get('fk_dico_constituant');
                    
                    // Convertir en objet pour faciliter la manipulation
                    parsedData = {};
                    for (const [key, value] of urlParams.entries()) {
                        parsedData[key] = value;
                    }
                }
                
                console.log('Payload complet:', parsedData);
                
                // Vérifier si le payload contient fk_dico_constituant
                if (fk_dico_constituant) {
                    console.log('🔥 PAYLOAD AVEC CONSTITUANT DÉTECTÉ !');
                    console.log('fk_dico_constituant:', fk_dico_constituant);
                    console.log('Payload complet:', JSON.stringify(parsedData, null, 2));
                    lastCapturedPayload = data;
                    
                    // Créer une clé unique avec suffixe si nécessaire
                    const uniqueKey = creerCleUniqueConstituant(fk_dico_constituant);
                    
                    // Sauvegarder dans le localStorage avec une clé spécifique au constituant
                    const timestamp = new Date().toISOString();
                    const storageKey = `constituant_${uniqueKey}_payloads`;
                    const savedPayloads = JSON.parse(localStorage.getItem(storageKey) || '[]');
                    
                    const payloadEntry = {
                        timestamp,
                        url: this._url,
                        payload: parsedData,
                        rawPayload: data,
                        fk_dico_constituant: fk_dico_constituant,
                        unique_key: uniqueKey
                    };
                    
                    savedPayloads.push(payloadEntry);
                    localStorage.setItem(storageKey, JSON.stringify(savedPayloads));
                    
                    // Maintenir aussi un index global de tous les constituants
                    const globalIndex = JSON.parse(localStorage.getItem('constituants_index') || '{}');
                    if (!globalIndex[uniqueKey]) {
                        globalIndex[uniqueKey] = {
                            original_id: fk_dico_constituant,
                            first_seen: timestamp,
                            count: 0,
                            storage_key: storageKey
                        };
                    }
                    globalIndex[uniqueKey].count = savedPayloads.length;
                    globalIndex[uniqueKey].last_seen = timestamp;
                    localStorage.setItem('constituants_index', JSON.stringify(globalIndex));
                    
                    console.log(`💾 Payload sauvegardé dans localStorage (clé: ${storageKey})`);
                    console.log(`📊 ${savedPayloads.length} payload(s) pour le constituant ${uniqueKey}`);
                } else {
                    console.log('⚠️ Payload EditComponentFailure sans fk_dico_constituant');
                }
            }
            console.log('🎯 === FIN INTERCEPTION EditComponentFailure ===');
        }
        
        // Intercepter toutes les requêtes importantes (SAUF EditComponentFailure qui est géré spécifiquement)
        if (this._url && (this._url.includes('/Prm/') || this._url.includes('Validate') || 
                         this._url.includes('Edit') || this._url.includes('Save')) &&
                         !this._url.includes('EditComponentFailure')) {
            console.log('=== REQUÊTE INTERCEPTÉE (XHR) ===');
            console.log('URL:', this._url);
            if (data) {
                try {
                    const parsedData = JSON.parse(data);
                    console.log('Payload (JSON):', parsedData);
                    // Sauvegarder si c'est une requête importante
                    if (this._url.includes('Validate') ||
                        (typeof parsedData === 'object' && Object.keys(parsedData).length > 3)) {
                        lastCapturedPayload = data;
                        console.log('>>> PAYLOAD SAUVEGARDÉ <<<');
                    }
                } catch (e) {
                    console.log('Payload (raw):', data);
                    // Sauvegarder si c'est une requête importante  
                    if (this._url.includes('Validate') ||
                        (data && data.length > 50)) {
                        lastCapturedPayload = data;
                        console.log('>>> PAYLOAD SAUVEGARDÉ <<<');
                    }
                }
            } else {
                console.log('Aucun data dans la requête XHR');
            }
            console.log('=== FIN REQUÊTE ===');
        }
        return originalXHR.apply(this, arguments);
    };

    // Hook permanent pour capturer l'URL dans XMLHttpRequest
    XMLHttpRequest.prototype.open = function(method, url, ...args) {
        this._url = url;
        return originalOpen.apply(this, [method, url, ...args]);
    };

    // Message de confirmation que l'interception est active
    console.log('=== INTERCEPTION RÉSEAU ÉTENDUE ACTIVE ===');
    console.log('Le script surveille TOUTES les requêtes vers: /Prm/, Validate, Edit, Save');
    console.log('🎯 INTERCEPTION SPÉCIALE ACTIVE pour EditComponentFailure avec fk_dico_constituant');
    console.log('📊 Les payloads avec constituants sont sauvegardés dans localStorage');
    console.log('Les payloads importants seront automatiquement sauvegardés');
    console.log('================================================');

    // Fonction pour surveiller et intercepter le bouton "SAISIE DU REX"
    function surveillerBoutonREX() {
        // Observer les changements dans le DOM pour détecter l'apparition du bouton
        const observer = new MutationObserver(() => {
            const boutonREX = document.querySelector('button[collector-trans-id="277"][collector-form-name="Saisie REX"]');
            if (boutonREX && !boutonREX.hasAttribute('data-rex-intercepted')) {
                console.log('🎯 Bouton "SAISIE DU REX" détecté, ajout de l\'interception...');
                
                // Marquer le bouton comme intercepté pour éviter les doublons
                boutonREX.setAttribute('data-rex-intercepted', 'true');
                
                // Ajouter un listener sur le clic
                boutonREX.addEventListener('click', function(event) {
                    console.log('🧹 === BOUTON SAISIE DU REX CLIQUÉ ===');
                    console.log('Nettoyage automatique des données des constituants...');
                    
                    // Vider tous les constituants
                    clearConstituantPayloads();
                    
                    console.log('✅ Données des constituants nettoyées avant la transition REX');
                    console.log('🧹 === FIN DU NETTOYAGE ===');
                });
                
                console.log('✅ Interception du bouton "SAISIE DU REX" configurée');
            }
        });
        
        // Démarrer l'observation
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        console.log('👁️ Surveillance du bouton "SAISIE DU REX" activée');
    }

    // Démarrer la surveillance du bouton REX
    surveillerBoutonREX();

    function getConfig() {
        return JSON.parse(localStorage.getItem(configKey)) || [];
    }

    function setConfig(config) {
        localStorage.setItem(configKey, JSON.stringify(config));
    }

    function resetStorage() {
        const config = getConfig();
        const initObj = {};
        config.forEach(b => initObj[b.key] = null);
        localStorage.setItem(storageKey, JSON.stringify(initObj));
    }

    if (!localStorage.getItem(storageKey) || !localStorage.getItem(configKey)) {
        setConfig([]);
        resetStorage();
    }

    let intervalCheck = setInterval(() => {
        if ([...document.querySelectorAll('h3.panel-title')].some(h3 => h3.textContent.trim() === "Saisie REX")) {
            clearInterval(intervalCheck);
            ajouterBoutonsRex();
        }
    }, 1000);

    function ajouterBoutonsRex() {
        const panelHeading = [...document.querySelectorAll('.panel-heading > h3.panel-title')]
            .find(h3 => h3.textContent.trim() === "Saisie REX")?.parentElement;

        if (!panelHeading || document.getElementById("btnCopierRex")) return;

        panelHeading.style.display = 'flex';
        panelHeading.style.justifyContent = 'space-between';
        panelHeading.style.alignItems = 'center';

        const btnContainer = document.createElement('div');
        btnContainer.id = "dynamicPasteButtons";
        btnContainer.style.display = 'inline-flex';
        btnContainer.style.gap = '5px';

        const btnManage = creerBouton('⚙️', 'btn-warning', ouvrirFenetreGestion);
        btnManage.title = "Gérer les emplacements";
        btnContainer.appendChild(btnManage);

        const btnCopier = creerBouton('Copier', 'btn-secondary', copierFormulaire);
        btnCopier.id = 'btnCopierRex';
        btnContainer.appendChild(btnCopier);

        getConfig().forEach(({ label, key }) => {
            const btn = creerBouton(label, 'btn-success', () => collerFormulaire(key));
            btn.dataset.key = key;
            btnContainer.appendChild(btn);
        });

        panelHeading.appendChild(btnContainer);
    }

    function creerBouton(text, btnClass, onclick) {
        const btn = document.createElement('button');
        btn.className = `btn ${btnClass}`;
        btn.textContent = text;
        btn.style.padding = '2px 8px';
        btn.style.borderRadius = '5px';
        btn.onclick = onclick;
        return btn;
    }

    function copierFormulaire() {
        const config = getConfig();

        const fenetre = document.createElement('div');
        Object.assign(fenetre.style, {
            position: 'fixed',
            top: '30%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'white',
            border: '1px solid #ccc',
            padding: '20px',
            zIndex: '9999'
        });

        const titre = document.createElement('div');
        titre.textContent = "Choisissez ou créez un emplacement :";
        fenetre.appendChild(titre);

        const select = document.createElement('select');
        select.style.margin = '10px';
        config.forEach(({ key }) => {
            const opt = document.createElement('option');
            opt.value = key;
            opt.textContent = key;
            select.appendChild(opt);
        });
        fenetre.appendChild(select);

        const input = document.createElement('input');
        input.placeholder = "Nouveau nom";
        input.style.margin = '10px';
        fenetre.appendChild(input);

        const valider = creerBouton('Valider', 'btn-success', () => {
            const key = input.value || select.value;
            if (!key) return alert("Veuillez sélectionner ou créer un nom.");

            const champs = document.querySelectorAll("input[type=text], textarea, select");
            const data = Array.from(champs).map(champ => ({
                selector: getUniqueSelector(champ),
                value: champ.tagName === "SELECT"
                    ? (champ.multiple ? [...champ.selectedOptions].map(o => o.value) : champ.value)
                    : champ.value
            }));

            // Sauvegarde du bouton consistance cliqué
            const boutonActif = document.querySelector('button[id^="id_dico_consistance_"].btn-primary');
            const consistanceID = boutonActif ? boutonActif.id : null;

            // Créer un payload généré à partir des données du formulaire
            const payloadGenere = creerPayloadDepuisFormulaire({ champs: data, consistance: consistanceID, payload: lastCapturedPayload });

            // Récupérer les données des constituants capturés
            const constituantsCaptures = recupererConstituantsCaptures();

            const stockage = JSON.parse(localStorage.getItem(storageKey)) || {};
            stockage[key] = { 
                champs: data, 
                consistance: consistanceID,
                payload: lastCapturedPayload, // Payload original capturé (legacy)
                payloadGenere: payloadGenere,  // Payload généré depuis le formulaire
                constituants: constituantsCaptures // Nouveaux données des constituants
            };
            localStorage.setItem(storageKey, JSON.stringify(stockage));

            // Afficher le payload dans la console si capturé
            if (lastCapturedPayload || constituantsCaptures.length > 0) {
                console.log('=== DONNÉES SAUVEGARDÉES AVEC LE FORMULAIRE ===');
                console.log('Emplacement:', key);
                
                if (lastCapturedPayload) {
                    console.log('Payload original (legacy):', lastCapturedPayload);
                }
                
                if (payloadGenere) {
                    console.log('Payload généré:', payloadGenere);
                }
                
                if (constituantsCaptures.length > 0) {
                    console.log('Constituants capturés:');
                    constituantsCaptures.forEach((constituant, index) => {
                        console.log(`  ${index + 1}. Constituant ${constituant.id}:`, constituant.lastPayload);
                    });
                }
                console.log('=== FIN ===');
            } else {
                console.log('=== AUCUNE DONNÉE CAPTURÉE ===');
                console.log('Emplacement:', key);
                if (payloadGenere) {
                    console.log('Payload généré:', payloadGenere);
                }
                console.log('Assurez-vous qu\'une requête vers EditComponentFailure a été effectuée avant de copier');
                console.log('=== FIN ===');
            }

            let cfg = getConfig();
            if (!cfg.some(c => c.key === key)) {
                cfg.push({ label: key, key });
                setConfig(cfg);

                const btn = creerBouton(key, 'btn-success', () => collerFormulaire(key));
                btn.dataset.key = key;
                document.getElementById("dynamicPasteButtons").appendChild(btn);
            }

            document.body.removeChild(fenetre);
            
            const constituantsInfo = constituantsCaptures.length > 0 ? 
                ` + ${constituantsCaptures.length} constituant(s)` : '';
            
            alert(`Formulaire copié dans '${key}' ${lastCapturedPayload ? '(avec payload legacy)' : '(sans payload legacy)'} ${payloadGenere ? '+ payload généré' : ''}${constituantsInfo}`);
        });
        fenetre.appendChild(valider);

        const annuler = creerBouton('Annuler', 'btn-secondary', () => {
            document.body.removeChild(fenetre);
        });
        fenetre.appendChild(annuler);

        document.body.appendChild(fenetre);
    }

    function ouvrirFenetreGestion() {
        const config = getConfig();
        const fenetre = document.createElement('div');
        Object.assign(fenetre.style, {
            position: 'fixed',
            top: '25%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'white',
            border: '1px solid #aaa',
            padding: '20px',
            zIndex: '9999'
        });

        const titre = document.createElement('div');
        titre.textContent = "Gérer les emplacements :";
        fenetre.appendChild(titre);

        const list = document.createElement('ul');
        list.style.listStyle = 'none';
        list.style.padding = '0';

        config.forEach(({ label, key }, index) => {
            const item = document.createElement('li');
            Object.assign(item.style, {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                margin: '5px 0'
            });

            const span = document.createElement('span');
            span.textContent = key;
            span.style.flexGrow = '1';
            item.appendChild(span);

            const btnGroup = document.createElement('div');
            btnGroup.style.display = 'flex';

            const up = creerBouton('⬆️', 'btn-warning', () => reorder(index, -1));
            const down = creerBouton('⬇️', 'btn-warning', () => reorder(index, 1));
            const del = creerBouton('🗑️', 'btn-danger', () => supprimer(index));

            [up, down, del].forEach((btn, i, arr) => {
                btn.style.padding = '2px 8px';
                if (i < arr.length - 1) btn.style.marginRight = '5px';
                btnGroup.appendChild(btn);
            });

            item.appendChild(btnGroup);
            list.appendChild(item);
        });

        fenetre.appendChild(list);
        fenetre.appendChild(creerBouton('Fermer', 'btn-secondary', () => document.body.removeChild(fenetre)));
        document.body.appendChild(fenetre);

        function reorder(index, delta) {
            const cfg = getConfig();
            const newIndex = index + delta;
            if (newIndex < 0 || newIndex >= cfg.length) return;
            [cfg[index], cfg[newIndex]] = [cfg[newIndex], cfg[index]];
            setConfig(cfg);
            location.reload();
        }

        function supprimer(index) {
            const cfg = getConfig();
            const removed = cfg.splice(index, 1)[0];
            setConfig(cfg);

            const stockage = JSON.parse(localStorage.getItem(storageKey)) || {};
            delete stockage[removed.key];
            localStorage.setItem(storageKey, JSON.stringify(stockage));
            location.reload();
        }
    }

    function collerFormulaire(emplacement) {
        const stockage = JSON.parse(localStorage.getItem(storageKey)) || {};
        const data = stockage[emplacement];
        if (!data || !data.champs) return alert(`Aucune donnée pour '${emplacement}'`);

        // Afficher le payload sauvegardé dans la console
        if (data.payload) {
            console.log('=== PAYLOAD RESTAURÉ (LEGACY) ===');
            console.log('Emplacement:', emplacement);
            console.log('Payload original:', data.payload);
            console.log('=== FIN ===');
        }

        // Afficher le payload généré
        if (data.payloadGenere) {
            console.log('=== PAYLOAD GÉNÉRÉ RESTAURÉ ===');
            console.log('Emplacement:', emplacement);
            console.log('Payload généré:', data.payloadGenere);
            console.log('=== FIN ===');
        }

        // Afficher les constituants sauvegardés
        if (data.constituants && data.constituants.length > 0) {
            console.log('=== CONSTITUANTS RESTAURÉS ===');
            console.log('Emplacement:', emplacement);
            data.constituants.forEach((constituant, index) => {
                console.log(`\n${index + 1}. Constituant ${constituant.id}:`);
                console.log(`   Nombre de payloads: ${constituant.count}`);
                console.log(`   Première vue: ${constituant.first_seen}`);
                console.log(`   Dernière vue: ${constituant.last_seen}`);
                console.log(`   Dernier payload:`, constituant.lastPayload);
            });
            console.log('=== FIN ===');
        }

        // Créer un nouveau payload à partir des données actuelles du formulaire
        const nouveauPayload = creerPayloadDepuisFormulaire(data);
        if (nouveauPayload) {
            console.log('=== NOUVEAU PAYLOAD CRÉÉ EN TEMPS RÉEL ===');
            console.log('Emplacement:', emplacement);
            console.log('Payload temps réel:', nouveauPayload);
            console.log('=== FIN ===');
        }

        data.champs.forEach(item => {
            try {
                const champ = document.querySelector(item.selector);
                if (champ) {
                    if (champ.tagName === "SELECT") {
                        if (champ.multiple && Array.isArray(item.value)) {
                            [...champ.options].forEach(opt => opt.selected = item.value.includes(opt.value));
                        } else {
                            champ.value = item.value;
                        }
                        champ.dispatchEvent(new Event('change', { bubbles: true }));

                        if (typeof $ !== "undefined" && $(champ).hasClass("selectpicker")) {
                            $(champ).selectpicker('refresh');
                        }
                    } else {
                        champ.value = item.value;
                        champ.dispatchEvent(new Event('input', { bubbles: true }));
                    }
                }
            } catch (e) {
                console.warn("Erreur collage:", item.selector);
            }
        });

        // Clique sur le bouton consistance après 1 seconde
        if (data.consistance) {
            setTimeout(() => {
                const btn = document.getElementById(data.consistance);
                if (btn) btn.click();
            }, 2000);
        }

        // Créer automatiquement les requêtes EditComponentFailure avec les payloads restaurés
        if (data.payload || (data.constituants && data.constituants.length > 0)) {
            setTimeout(() => {
                envoyerRequetesEditComponentFailure(data, emplacement);
            }, 3000);
        } else {
            // Si pas de constituants ni payload, afficher le popup immédiatement
            const constituantsInfo = data.constituants && data.constituants.length > 0 ? 
                ` + ${data.constituants.length} constituant(s)` : '';
            
            alert(`Formulaire collé depuis '${emplacement}' ${data.payload ? '(avec payload legacy)' : ''}${constituantsInfo}`);
        }
    }

    function envoyerRequetesEditComponentFailure(data, emplacement = 'inconnue') {
        try {
            console.log('=== ANALYSE DES COMPOSANTS À ENVOYER ===');
            
            // Prioriser les constituants sauvegardés avec le nouveau système
            if (data.constituants && data.constituants.length > 0) {
                console.log('🎯 Utilisation des constituants sauvegardés du nouveau système');
                
                let requetesTerminees = 0;
                const totalRequetes = data.constituants.length;

                                const afficherPopupQuandFini = () => {
                                    requetesTerminees++;
                                    if (requetesTerminees >= totalRequetes) {
                                        // Toutes les requêtes sont terminées, afficher le popup
                                        const ajouteS = data.constituants && data.constituants.length > 1 ? 's' : '';
                                        alert(`Formulaire ${emplacement} a bien été pris en compte + ${data.constituants.length} constituant${ajouteS} ajouté${ajouteS}`);
                                    }
                                };

                data.constituants.forEach((constituant, index) => {
                    setTimeout(() => {
                        console.log(`=== ENVOI CONSTITUANT ${constituant.id} (#${index + 1}) ===`);
                        console.log('Payload à envoyer:', constituant.lastPayload.rawPayload);
                        envoyerRequeteEditComponentFailure(constituant.lastPayload.rawPayload, index + 1, afficherPopupQuandFini);
                    }, index * 500); // Délai de 500ms entre chaque requête
                });
                return;
            }
            
            // Fallback: utiliser l'ancienne méthode si pas de constituants sauvegardés
            console.log('⚠️ Aucun constituant sauvegardé, utilisation de l\'ancienne méthode');
            
            // [Le reste du code reste identique...]
            
            // Analyser les champs sauvegardés pour trouver tous les composants REX
            const composantsREX = [];
            
            data.champs.forEach(champ => {
                // Chercher les champs qui correspondent à des sélections de composants/défauts
                const selector = champ.selector.toLowerCase();
                
                if (champ.value && champ.value !== '' && champ.value !== '0') {
                    // Essayer de trouver l'élément actuel pour avoir plus d'infos
                    const element = document.querySelector(champ.selector);
                    if (element && element.tagName === 'SELECT') {
                        const name = (element.name || '').toLowerCase();
                        const id = (element.id || '').toLowerCase();
                        
                        // Vérifier si c'est un champ de composant ou défaut par plusieurs critères
                        const isComposant = selector.includes('constituant') || selector.includes('component') ||
                                          name.includes('constituant') || name.includes('component') ||
                                          id.includes('constituant') || id.includes('component');
                                          
                        const isDefaut = (selector.includes('defaut') || selector.includes('failure') ||
                                        name.includes('defaut') || name.includes('failure') ||
                                        id.includes('defaut') || id.includes('failure')) &&
                                       !name.includes('serie'); // Exclure le select "serie"
                        
                        if (isComposant || isDefaut) {
                            console.log(`Composant trouvé: ${champ.selector} = ${champ.value} (${isComposant ? 'constituant' : 'défaut'})`);
                            composantsREX.push({
                                selector: champ.selector,
                                value: champ.value,
                                name: element.name,
                                id: element.id,
                                type: isComposant ? 'constituant' : 'defaut'
                            });
                        }
                    }
                }
            });
            
            console.log('Composants REX détectés:', composantsREX);
            
            // Si pas de composants spécifiques détectés, utiliser le payload original
            if (composantsREX.length === 0) {
                console.log('Aucun composant spécifique détecté, envoi du payload original');
                envoyerRequeteEditComponentFailure(data.payload, 1);
                return;
            }
            
            // Grouper les composants par paires constituant/défaut
            const paires = [];
            let repereActuel = null;
            
            // Chercher le repère dans les champs sauvegardés
            data.champs.forEach(champ => {
                if (champ.selector.toLowerCase().includes('repere') || 
                    champ.selector.toLowerCase().includes('reference')) {
                    repereActuel = champ.value;
                }
            });
            
            // Séparer les constituants et défauts
            const constituants = [];
            const defauts = [];
            
            composantsREX.forEach(comp => {
                if (comp.name && comp.name.includes('constituant') && !comp.name.includes('defaut')) {
                    constituants.push(comp.value);
                    console.log(`Constituant ajouté: ${comp.value}`);
                } else if (comp.name && (comp.name.includes('defaut') || comp.name.includes('failure'))) {
                    defauts.push(comp.value);
                    console.log(`Défaut ajouté: ${comp.value}`);
                }
            });
            
            console.log('Constituants trouvés:', constituants);
            console.log('Défauts trouvés:', defauts);
            
            // Créer toutes les combinaisons possibles constituant/défaut
            if (constituants.length > 0 && defauts.length > 0) {
                constituants.forEach(constituant => {
                    defauts.forEach(defaut => {
                        paires.push({
                            constituant: constituant,
                            defaut: defaut,
                            repere: repereActuel || 'REX'
                        });
                    });
                });
            } else if (constituants.length > 0) {
                // Si on a des constituants mais pas de défauts, utiliser un défaut par défaut
                constituants.forEach(constituant => {
                    paires.push({
                        constituant: constituant,
                        defaut: '1424', // Défaut par défaut
                        repere: repereActuel || 'REX'
                    });
                });
            } else if (defauts.length > 0) {
                // Si on a des défauts mais pas de constituants, utiliser un constituant par défaut
                defauts.forEach(defaut => {
                    paires.push({
                        constituant: '698', // Constituant par défaut
                        defaut: defaut,
                        repere: repereActuel || 'REX'
                    });
                });
            }
            
            // Si pas de paires détectées, créer une paire avec les valeurs du payload original
            if (paires.length === 0 && data.payload) {
                const params = new URLSearchParams(data.payload);
                paires.push({
                    constituant: params.get('fk_dico_constituant'),
                    defaut: params.get('fk_dico_defaut_constituant'),
                    repere: params.get('S_repere') || 'REX'
                });
            }
            
            console.log('Paires constituant/défaut à envoyer:', paires);
            
            // Envoyer une requête pour chaque paire
            if (paires.length > 0) {
                let requetesTerminees = 0;
                const totalRequetes = paires.length;
                
                const afficherPopupQuandFini = () => {
                    requetesTerminees++;
                    if (requetesTerminees >= totalRequetes) {
                        // Toutes les requêtes sont terminées, afficher le popup
                        const constituantsInfo = data.constituants && data.constituants.length > 0 ? 
                            ` + ${data.constituants.length} constituant(s)` : '';
                        
                        alert(`Formulaire collé depuis '${emplacement}' ${data.payload ? '(avec payload legacy)' : ''}${constituantsInfo}`);
                    }
                };
                
                paires.forEach((paire, index) => {
                    setTimeout(() => {
                        const payload = creerPayloadPourComposant(paire, data);
                        envoyerRequeteEditComponentFailure(payload, index + 1, afficherPopupQuandFini);
                    }, index * 500); // Délai de 500ms entre chaque requête
                });
            } else {
                // Aucune paire trouvée, afficher le popup immédiatement
                const constituantsInfo = data.constituants && data.constituants.length > 0 ? 
                    ` + ${data.constituants.length} constituant(s)` : '';
                
                alert(`Formulaire collé depuis '${emplacement}' ${data.payload ? '(avec payload legacy)' : ''}${constituantsInfo}`);
            }
            
        } catch (e) {
            console.error('Erreur lors de l\'analyse des composants:', e);
            // Fallback: envoyer le payload original
            const afficherPopupQuandFini = () => {
                const constituantsInfo = data.constituants && data.constituants.length > 0 ? 
                    ` + ${data.constituants.length} constituant(s)` : '';
                
                alert(`Formulaire collé depuis '${emplacement}' ${data.payload ? '(avec payload legacy)' : ''}${constituantsInfo}`);
            };
            envoyerRequeteEditComponentFailure(data.payload, 1, afficherPopupQuandFini);
        }
    }
    
    function creerPayloadPourComposant(paire, data) {
        // Récupérer les valeurs de base depuis le payload original
        let basePayload = {};
        if (data.payload) {
            const params = new URLSearchParams(data.payload);
            for (let [key, value] of params) {
                basePayload[key] = value;
            }
        }
        
        // Construire le payload pour ce composant spécifique
        const payload = [
            `fk_dico_constituant=${paire.constituant}`,
            `fk_dico_defaut_constituant=${paire.defaut}`,
            `S_repere=${paire.repere}`,
            `idt_t_reparation_has_lst_dico_constituant=-1`,
            `t_reparation_idt_reparation=${basePayload['t_reparation_idt_reparation'] || '3817904'}`,
            `idUser=${basePayload['idUser'] || '9303122P'}`,
            `current_repair_id=${basePayload['current_repair_id'] || '3817904'}`
        ].join('&');
        
        return payload;
    }

    function envoyerRequeteEditComponentFailure(payload, numeroRequete = 1, callback = null) {
        try {
            console.log(`=== ENVOI REQUÊTE EditComponentFailure #${numeroRequete} ===`);
            console.log('Payload à envoyer:', payload);
            
            const xhr = new XMLHttpRequest();
            xhr.open('POST', 'https://prod.cloud-collectorplus.mt.sncf.fr/Prm/ReparationForms/Saisie_Intervention/EditComponentFailure', true);
            xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
            xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
            
            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4) {
                    console.log(`Réponse EditComponentFailure #${numeroRequete}:`, xhr.status, xhr.responseText);
                    // Appeler le callback quand la requête est terminée
                    if (callback && typeof callback === 'function') {
                        callback();
                    }
                }
            };
            
            xhr.send(payload);
            console.log(`=== REQUÊTE EditComponentFailure #${numeroRequete} ENVOYÉE ===`);
        } catch (e) {
            console.error(`Erreur lors de l'envoi de la requête EditComponentFailure #${numeroRequete}:`, e);
            // Appeler le callback même en cas d'erreur
            if (callback && typeof callback === 'function') {
                callback();
            }
        }
    }

    function creerPayloadDepuisFormulaire(data) {
        // Si on a un payload original, on l'utilise comme base
        let payloadData = {};
        
        if (data.payload) {
            // Parser le payload original pour récupérer sa structure exacte
            const params = new URLSearchParams(data.payload);
            for (let [key, value] of params) {
                payloadData[key] = value;
            }
            console.log('Base payload extrait:', payloadData);
        } else {
            // Valeurs par défaut seulement si pas de payload original
            payloadData = {
                'fk_dico_constituant': '698',
                'fk_dico_defaut_constituant': '1424',
                'S_repere': 'rgghrghr',
                'idt_t_reparation_has_lst_dico_constituant': '-1',
                't_reparation_idt_reparation': '3817904',
                'idUser': '9303122P',
                'current_repair_id': '3817904'
            };
        }

        // Debug: Afficher tous les selects et inputs disponibles
        console.log('=== DEBUG: CHAMPS DISPONIBLES ===');
        const allSelects = document.querySelectorAll('select');
        const allInputs = document.querySelectorAll('input[type="text"], input[type="hidden"]');
        
        console.log('Selects trouvés:');
        allSelects.forEach((select, index) => {
            console.log(`  ${index}: name="${select.name}", id="${select.id}", value="${select.value}"`);
        });
        
        console.log('Inputs trouvés:');
        allInputs.forEach((input, index) => {
            console.log(`  ${index}: name="${input.name}", id="${input.id}", value="${input.value}"`);
        });
        console.log('=== FIN DEBUG ===');

        // Maintenant, mettre à jour avec les vraies valeurs actuelles du DOM
        try {
            // 1. Essayer de trouver le select constituant avec plusieurs stratégies
            let constituantSelect = document.querySelector('select[name*="constituant"]') ||
                                  document.querySelector('select[id*="constituant"]') ||
                                  document.querySelector('select[name*="component"]') ||
                                  document.querySelector('select[id*="component"]');
                                  
            // Si pas trouvé, chercher par valeur
            if (!constituantSelect && payloadData['fk_dico_constituant']) {
                allSelects.forEach(select => {
                    if (select.value === payloadData['fk_dico_constituant']) {
                        constituantSelect = select;
                        console.log('Constituant trouvé par valeur:', select);
                    }
                });
            }
            
            if (constituantSelect && constituantSelect.value) {
                payloadData['fk_dico_constituant'] = constituantSelect.value;
                console.log('Constituant trouvé:', constituantSelect.value, 'via', constituantSelect.name || constituantSelect.id);
            }

            // 2. Essayer de trouver le select défaut (en évitant le select "serie")
            let defautSelect = document.querySelector('select[name*="defaut"]:not([name="serie"])') ||
                              document.querySelector('select[id*="defaut"]:not([name="serie"])') ||
                              document.querySelector('select[name*="failure"]:not([name="serie"])') ||
                              document.querySelector('select[id*="failure"]:not([name="serie"])');
                              
            // Si pas trouvé, chercher par valeur mais en excluant le select "serie"
            if (!defautSelect && payloadData['fk_dico_defaut_constituant']) {
                allSelects.forEach(select => {
                    // Ignorer le select "serie" et chercher la vraie valeur du payload original
                    if (select.name !== 'serie' && 
                        select.value === payloadData['fk_dico_defaut_constituant']) {
                        defautSelect = select;
                        console.log('Défaut trouvé par valeur:', select);
                    }
                });
            }
            
            // Si toujours pas trouvé, garder la valeur du payload original
            if (defautSelect && defautSelect.value && defautSelect.name !== 'serie') {
                payloadData['fk_dico_defaut_constituant'] = defautSelect.value;
                console.log('Défaut trouvé:', defautSelect.value, 'via', defautSelect.name || defautSelect.id);
            } else {
                console.log('Défaut gardé du payload original:', payloadData['fk_dico_defaut_constituant']);
            }

            // 3. Essayer de trouver l'input repère
            let repereInput = document.querySelector('input[name*="repere"]') ||
                             document.querySelector('input[id*="repere"]') ||
                             document.querySelector('input[name*="reference"]') ||
                             document.querySelector('input[id*="reference"]');
                             
            // Si pas trouvé, chercher par valeur
            if (!repereInput && payloadData['S_repere']) {
                allInputs.forEach(input => {
                    if (input.value === payloadData['S_repere']) {
                        repereInput = input;
                        console.log('Repère trouvé par valeur:', input);
                    }
                });
            }
            
            if (repereInput && repereInput.value) {
                payloadData['S_repere'] = repereInput.value;
                console.log('Repère trouvé:', repereInput.value, 'via', repereInput.name || repereInput.id);
            }

            // 4. Récupérer l'ID de réparation depuis l'URL ou le DOM
            const urlParams = new URLSearchParams(window.location.search);
            const repairId = urlParams.get('repair_id') || urlParams.get('reparation_id') || 
                            urlParams.get('current_repair_id') ||
                            document.querySelector('[name*="repair_id"], [name*="reparation_id"]')?.value;
            if (repairId) {
                payloadData['t_reparation_idt_reparation'] = repairId;
                payloadData['current_repair_id'] = repairId;
                console.log('Repair ID trouvé:', repairId);
            }

            // 5. Récupérer l'ID utilisateur
            const userId = document.querySelector('[name*="user"], [data-user], [id*="user"]')?.value || 
                          window.currentUserId || 
                          urlParams.get('user') || urlParams.get('idUser');
            if (userId) {
                payloadData['idUser'] = userId;
                console.log('User ID trouvé:', userId);
            }

        } catch (e) {
            console.warn('Erreur lors de la récupération des valeurs DOM:', e);
        }

        // Construire le payload dans le même ordre que l'original
        const payloadString = [
            `fk_dico_constituant=${payloadData['fk_dico_constituant'] || ''}`,
            `fk_dico_defaut_constituant=${payloadData['fk_dico_defaut_constituant'] || ''}`,
            `S_repere=${payloadData['S_repere'] || ''}`,
            `idt_t_reparation_has_lst_dico_constituant=${payloadData['idt_t_reparation_has_lst_dico_constituant'] || '-1'}`,
            `t_reparation_idt_reparation=${payloadData['t_reparation_idt_reparation'] || ''}`,
            `idUser=${payloadData['idUser'] || ''}`,
            `current_repair_id=${payloadData['current_repair_id'] || ''}`
        ].join('&');

        console.log('Payload final généré:', payloadString);
        return payloadString;
    }

    function getUniqueSelector(el) {
        if (el.id) return `#${el.id}`;
        if (el.name) return `[name='${el.name}']`;
        const path = [];
        while (el && el.nodeType === 1) {
            let selector = el.tagName.toLowerCase();
            if (el.className) {
                const cls = el.className.trim().split(/\s+/).join('.');
                selector += '.' + cls;
            }
            path.unshift(selector);
            el = el.parentElement;
        }
        return path.join(' > ');
    }

    function recupererConstituantsCaptures() {
        const index = JSON.parse(localStorage.getItem('constituants_index') || '{}');
        const constituants = [];
        
        Object.entries(index).forEach(([uniqueKey, info]) => {
            const storageKey = `constituant_${uniqueKey}_payloads`;
            const payloads = JSON.parse(localStorage.getItem(storageKey) || '[]');
            
            if (payloads.length > 0) {
                const lastPayload = payloads[payloads.length - 1];
                constituants.push({
                    id: uniqueKey,
                    original_id: info.original_id || uniqueKey, // Pour compatibilité avec anciens constituants
                    count: info.count,
                    first_seen: info.first_seen,
                    last_seen: info.last_seen,
                    lastPayload: lastPayload,
                    allPayloads: payloads
                });
            }
        });
        
        console.log(`📦 ${constituants.length} constituant(s) récupéré(s) pour la sauvegarde`);
        return constituants;
    }

    function creerCleUniqueConstituant(fk_dico_constituant) {
        const index = JSON.parse(localStorage.getItem('constituants_index') || '{}');
        
        // Vérifier si ce constituant existe déjà (sans suffixe)
        if (!index[fk_dico_constituant]) {
            console.log(`🆕 Nouveau constituant ${fk_dico_constituant} - pas de suffixe nécessaire`);
            return fk_dico_constituant;
        }
        
        // Le constituant existe déjà, chercher le prochain suffixe disponible
        let suffix = 1;
        let uniqueKey = `${fk_dico_constituant}_${suffix}`;
        
        while (index[uniqueKey]) {
            suffix++;
            uniqueKey = `${fk_dico_constituant}_${suffix}`;
        }
        
        console.log(`🔢 Constituant ${fk_dico_constituant} existe déjà - création avec suffixe: ${uniqueKey}`);
        return uniqueKey;
    }

    // === FONCTIONS D'ASSISTANCE POUR CONSTITUANTS ===
    
    // Fonction pour voir l'index de tous les constituants
    window.getConstituantsIndex = function() {
        const index = JSON.parse(localStorage.getItem('constituants_index') || '{}');
        console.log('📚 INDEX DES CONSTITUANTS:');
        if (Object.keys(index).length === 0) {
            console.log('❌ Aucun constituant trouvé');
            return {};
        }
        
        Object.entries(index).forEach(([uniqueKey, info]) => {
            console.log(`\n🔧 Constituant ${uniqueKey}:`);
            if (info.original_id && info.original_id !== uniqueKey) {
                console.log(`   ID original: ${info.original_id}`);
            }
            console.log(`   Première vue: ${info.first_seen}`);
            console.log(`   Dernière vue: ${info.last_seen}`);
            console.log(`   Nombre de payloads: ${info.count}`);
            console.log(`   Clé de stockage: ${info.storage_key}`);
        });
        return index;
    };
    
    // Fonction pour consulter tous les payloads d'un constituant spécifique
    window.getConstituantPayloads = function(constituantId = null) {
        if (constituantId) {
            // Voir les payloads d'un constituant spécifique (peut être avec ou sans suffixe)
            const storageKey = `constituant_${constituantId}_payloads`;
            const payloads = JSON.parse(localStorage.getItem(storageKey) || '[]');
            console.log(`📋 ${payloads.length} payload(s) pour le constituant ${constituantId}:`);
            
            payloads.forEach((item, index) => {
                console.log(`\n${index + 1}. ${item.timestamp}`);
                console.log(`   URL: ${item.url}`);
                if (item.unique_key && item.unique_key !== item.fk_dico_constituant) {
                    console.log(`   ID original: ${item.fk_dico_constituant} (clé unique: ${item.unique_key})`);
                }
                console.log(`   Payload (objet):`, item.payload);
                console.log(`   Payload (brut): ${item.rawPayload}`);
            });
            return payloads;
        } else {
            // Voir l'index de tous les constituants si aucun ID spécifié
            return getConstituantsIndex();
        }
    };

    // Fonction pour obtenir le dernier payload d'un constituant spécifique
    window.getLastConstituantPayload = function(constituantId = null) {
        if (!constituantId) {
            // Si pas d'ID spécifié, chercher le dernier payload de n'importe quel constituant
            const index = JSON.parse(localStorage.getItem('constituants_index') || '{}');
            if (Object.keys(index).length === 0) {
                console.log('❌ Aucun constituant trouvé');
                return null;
            }
            
            // Trouver le constituant avec la dernière activité
            let lastConstituant = null;
            let lastTime = null;
            
            Object.entries(index).forEach(([id, info]) => {
                if (!lastTime || new Date(info.last_seen) > new Date(lastTime)) {
                    lastTime = info.last_seen;
                    lastConstituant = id;
                }
            });
            
            if (lastConstituant) {
                console.log(`🎯 Dernier constituant actif: ${lastConstituant}`);
                return getLastConstituantPayload(lastConstituant);
            }
            return null;
        }
        
        const storageKey = `constituant_${constituantId}_payloads`;
        const payloads = JSON.parse(localStorage.getItem(storageKey) || '[]');
        if (payloads.length === 0) {
            console.log(`❌ Aucun payload pour le constituant ${constituantId}`);
            return null;
        }
        
        const last = payloads[payloads.length - 1];
        console.log(`🎯 Dernier payload du constituant ${constituantId}:`);
        console.log(`   Timestamp: ${last.timestamp}`);
        console.log(`   URL: ${last.url}`);
        console.log(`   Payload (objet):`, last.payload);
        console.log(`   Payload (brut): ${last.rawPayload}`);
        return last;
    };

    // Fonction pour vider l'historique d'un constituant spécifique ou de tous
    window.clearConstituantPayloads = function(constituantId = null) {
        if (constituantId) {
            // Vider un constituant spécifique
            const storageKey = `constituant_${constituantId}_payloads`;
            localStorage.removeItem(storageKey);
            
            // Retirer de l'index
            const index = JSON.parse(localStorage.getItem('constituants_index') || '{}');
            delete index[constituantId];
            localStorage.setItem('constituants_index', JSON.stringify(index));
            
            console.log(`🗑️ Historique du constituant ${constituantId} vidé`);
        } else {
            // Vider tous les constituants
            const index = JSON.parse(localStorage.getItem('constituants_index') || '{}');
            Object.keys(index).forEach(constituantId => {
                const storageKey = `constituant_${constituantId}_payloads`;
                localStorage.removeItem(storageKey);
            });
            localStorage.removeItem('constituants_index');
            console.log('🗑️ Historique de TOUS les constituants vidé');
        }
    };

    // Fonction pour rechercher des payloads par ID de constituant (alias)
    window.searchPayloadsByConstituant = function(constituantId) {
        return getConstituantPayloads(constituantId);
    };

    // Fonction pour rechercher tous les constituants ayant le même ID original
    window.getConstituantsByOriginalId = function(originalId) {
        const index = JSON.parse(localStorage.getItem('constituants_index') || '{}');
        const results = [];
        
        Object.entries(index).forEach(([uniqueKey, info]) => {
            const checkId = info.original_id || uniqueKey;
            if (checkId === originalId) {
                const storageKey = `constituant_${uniqueKey}_payloads`;
                const payloads = JSON.parse(localStorage.getItem(storageKey) || '[]');
                results.push({
                    unique_key: uniqueKey,
                    original_id: checkId,
                    count: info.count,
                    first_seen: info.first_seen,
                    last_seen: info.last_seen,
                    payloads: payloads
                });
            }
        });
        
        console.log(`🔍 ${results.length} variant(s) trouvé(s) pour le constituant original ${originalId}:`);
        results.forEach((item, index) => {
            console.log(`\n${index + 1}. Clé unique: ${item.unique_key}`);
            console.log(`   Nombre de payloads: ${item.count}`);
            console.log(`   Première vue: ${item.first_seen}`);
            console.log(`   Dernière vue: ${item.last_seen}`);
        });
        
        return results;
    };

    // Fonction pour obtenir des statistiques
    window.getConstituantsStats = function() {
        const index = JSON.parse(localStorage.getItem('constituants_index') || '{}');
        const stats = {
            total_constituants: Object.keys(index).length,
            total_payloads: 0,
            most_active: null,
            least_active: null
        };
        
        let maxCount = 0;
        let minCount = Infinity;
        
        Object.entries(index).forEach(([id, info]) => {
            stats.total_payloads += info.count;
            
            if (info.count > maxCount) {
                maxCount = info.count;
                stats.most_active = { id, count: info.count };
            }
            
            if (info.count < minCount) {
                minCount = info.count;
                stats.least_active = { id, count: info.count };
            }
        });
        
        console.log('� STATISTIQUES DES CONSTITUANTS:');
        console.log(`   Nombre total de constituants: ${stats.total_constituants}`);
        console.log(`   Nombre total de payloads: ${stats.total_payloads}`);
        if (stats.most_active) {
            console.log(`   Plus actif: Constituant ${stats.most_active.id} (${stats.most_active.count} payloads)`);
        }
        if (stats.least_active && stats.least_active.count < Infinity) {
            console.log(`   Moins actif: Constituant ${stats.least_active.id} (${stats.least_active.count} payloads)`);
        }
        
        return stats;
    };

    // Afficher les fonctions disponibles dans la console
    console.log('\n🔧 === FONCTIONS DISPONIBLES POUR CONSTITUANTS ===');
    console.log('� getConstituantsIndex() - Voir l\'index de tous les constituants');
    console.log('�📋 getConstituantPayloads(id) - Voir les payloads d\'un constituant (ou index si sans paramètre)');
    console.log('🎯 getLastConstituantPayload(id) - Dernier payload d\'un constituant (ou le plus récent si sans paramètre)');
    console.log('🔍 searchPayloadsByConstituant(id) - Rechercher par ID constituant');
    console.log('� getConstituantsByOriginalId(id) - Voir tous les variants d\'un constituant original');
    console.log('�📊 getConstituantsStats() - Voir les statistiques');
    console.log('🗑️ clearConstituantPayloads(id) - Vider un constituant (ou tous si sans paramètre)');
    console.log('==================================================\n');
})();
