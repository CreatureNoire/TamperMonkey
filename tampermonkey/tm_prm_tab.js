(function () {
    'use strict';

    const processedRows = new WeakSet();
    const iframeReloadAttempts = new WeakMap();

    function renderIframe(pk, element) {
        const row = element.closest('tr');
        const existingIframe = row.nextElementSibling;

        // Si déjà affichée => on la supprime et on remet le texte à "Afficher ici"
        if (existingIframe && existingIframe.classList.contains('iframe-row')) {
            existingIframe.remove();
            element.innerHTML = 'Afficher ici';
            console.log(`❎ Iframe fermée pour la réparation ${pk}`);
            return;
        }

        // Sinon, on crée et insère l'iframe
        const newRow = document.createElement('tr');
        newRow.classList.add('iframe-row');

        const cell = document.createElement('td');
        cell.colSpan = row.children.length;

        const iframe = document.createElement('iframe');
        iframe.src = `https://prod.cloud-collectorplus.mt.sncf.fr/Prm/Reparation/${pk}.html`;
        iframe.style.width = '100%';
        iframe.style.height = '600px';
        iframe.style.border = '2px solid #444';
        iframe.style.marginTop = '10px';
        iframe.style.display = 'block';

        cell.appendChild(iframe);
        newRow.appendChild(cell);
        row.parentNode.insertBefore(newRow, row.nextSibling);

        // Mise à jour du texte du lien
        element.innerHTML = 'Cacher';
        console.log(`📂 Iframe affichée pour la réparation ${pk}`);
    }


    function monitorTable() {
        // Vérification simplifiée : chercher l'onglet "PRM Fille(s)" OU la table directement
        let hasPrmFilleContext = false;
        
        // Option 1: Chercher l'onglet "PRM Fille(s)"
        const allSpans = document.querySelectorAll('span');
        for (let span of allSpans) {
            if (span.textContent && span.textContent.includes('PRM Fille(s)')) {
                hasPrmFilleContext = true;
                console.log('✅ Onglet PRM Fille(s) détecté');
                break;
            }
        }
        
        // Option 2: Si la table PRM Filles existe, c'est qu'on est sur la bonne page
        const table = document.getElementById('dataTablePrmFilles');
        if (table) {
            hasPrmFilleContext = true;
            console.log('✅ Table dataTablePrmFilles détectée');
        }

        // Si aucun contexte PRM Fille(s) détecté, ne pas créer les boutons
        if (!hasPrmFilleContext) {
            console.log('⏸️ Contexte PRM Fille(s) non détecté, boutons non créés');
            return;
        }

        if (!table) return;

        const rows = table.querySelectorAll('tr[idreparation]');
        rows.forEach(row => {
            if (processedRows.has(row)) return;

            const pk = row.getAttribute('idreparation');
            const existingLink = row.querySelector('a.openIframeLink');

            if (!existingLink && pk) {
                const cells = row.querySelectorAll('td');
                if (cells.length >= 3) {
                    const targetCell = cells[2];
                    targetCell.classList.add('noRedirect', 'noColvis', 'noExportable', 'noClick');

                    const link = document.createElement('a');
                    link.className = 'dropdown-item openIframeLink';
                    link.setAttribute('pk', pk);
                    link.innerHTML = 'Afficher ici'; // texte initial
                    link.style.cursor = 'pointer';

                    link.addEventListener('click', function (e) {
                        e.preventDefault();
                        renderIframe(pk, this);
                    });


                    targetCell.appendChild(link);
                    console.log(`➕ Lien ajouté pour la réparation ${pk}`);
                }
            }

            processedRows.add(row);
        });

        // Créer tous les boutons seulement si l'onglet PRM Fille(s) est présent
        createOpenAllButton();
        createCopyFormButton();
        createPasteAllButton();
        createTriggerAllButton();

        const iframes = document.querySelectorAll('tr.iframe-row iframe');

        if (iframes.length > 0) {
            hideElementsInIframes();
            checkRedirectErrorsInIframes();
            makeErrorAlertsClosableInIframes();
        }
    }


    function createOpenAllButton() {
        // Vérifier si le bouton existe déjà
        if (document.getElementById('btnOpenAllIframes')) return;

        // Créer un conteneur fixe indépendant pour ce bouton
        let container = document.getElementById('fixed-buttons-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'fixed-buttons-container';
            container.style.position = 'fixed';
            container.style.top = '10px';
            container.style.left = '10px';
            container.style.zIndex = '10000';
            container.style.display = 'flex';
            container.style.flexDirection = 'column';
            container.style.gap = '5px';
            document.body.appendChild(container);
        }

        const button = document.createElement('button');
        button.id = 'btnOpenAllIframes';
        button.className = 'btn btn-success btn-border-radius';
        button.innerHTML = '<span>Tout ouvrir</span>';
        button.style.padding = '8px 12px';
        button.style.backgroundColor = '#28a745';
        button.style.color = 'white';
        button.style.border = 'none';
        button.style.borderRadius = '5px';
        button.style.cursor = 'pointer';
        button.title = 'Ouvrir toutes les réparations';

        button.addEventListener('click', () => {
            const links = Array.from(document.querySelectorAll('#dataTablePrmFilles a.openIframeLink'));
            const iframesOpened = document.querySelectorAll('tr.iframe-row').length > 0;

            if (iframesOpened) {
                // Fermer toutes les iframes
                button.innerHTML = 'Fermeture...';
                document.querySelectorAll('tr.iframe-row').forEach(row => row.remove());

                links.forEach(link => {
                    link.innerHTML = 'Afficher ici';
                });

                setTimeout(() => {
                    button.innerHTML = '<span>Tout ouvrir</span>';
                }, 1000);

                console.log('❎ Toutes les iframes ont été fermées');
                return;
            }

            // Ouvrir avec délai progressif
            const total = links.length;
            if (total === 0) {
                button.innerHTML = 'Aucun lien trouvé';
                return;
            }

            let count = 0;
            links.forEach((link, index) => {
                setTimeout(() => {
                    link.click();
                    count++;
                    button.innerHTML = `Ouverture ${count}/${total}`;

                    if (count === total) {
                        setTimeout(() => {
                            button.innerHTML = '✅ Tout ouvert';
                        }, 500);
                    }
                }, index * 250);
            });

            console.log(`▶️ Ouverture de ${total} iframes`);
        });

        container.appendChild(button);
        console.log('✅ Bouton "Tout ouvrir" ajouté de manière permanente');
    }

    function createCopyFormButton() {
        // Vérifier si le bouton existe déjà
        if (document.getElementById("btnCopyForm")) return;

        // Utiliser le conteneur fixe indépendant
        let container = document.getElementById('fixed-buttons-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'fixed-buttons-container';
            container.style.position = 'fixed';
            container.style.top = '10px';
            container.style.left = '10px';
            container.style.zIndex = '10000';
            container.style.display = 'flex';
            container.style.flexDirection = 'column';
            container.style.gap = '5px';
            document.body.appendChild(container);
        }

        const button = document.createElement("button");
        button.id = "btnCopyForm";
        button.innerText = "Copier Formulaire";
        button.onclick = copyFormData;
        button.style.padding = '8px 12px';
        button.style.backgroundColor = '#28a745';
        button.style.color = 'white';
        button.style.border = 'none';
        button.style.borderRadius = '5px';
        button.style.cursor = 'pointer';
        button.innerHTML = `<i class='fa fa-copy'></i> ` + button.innerText;

        container.appendChild(button);
        console.log("✅ Bouton 'Copier Formulaire' ajouté de manière permanente");
    }

    function createPasteAllButton() {
        // Vérifier si le bouton existe déjà
        if (document.getElementById("btnPasteAllIframes")) return;

        // Utiliser le conteneur fixe indépendant
        let container = document.getElementById('fixed-buttons-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'fixed-buttons-container';
            container.style.position = 'fixed';
            container.style.top = '10px';
            container.style.left = '10px';
            container.style.zIndex = '10000';
            container.style.display = 'flex';
            container.style.flexDirection = 'column';
            container.style.gap = '5px';
            document.body.appendChild(container);
        }

        const button = document.createElement("button");
        button.id = "btnPasteAllIframes";
        button.innerText = "Coller Iframe";
        button.onclick = pasteIntoIframes;
        button.style.padding = '8px 12px';
        button.style.backgroundColor = '#17a2b8';
        button.style.color = 'white';
        button.style.border = 'none';
        button.style.borderRadius = '5px';
        button.style.cursor = 'pointer';
        button.innerHTML = `<i class='fa fa-paste'></i> ` + button.innerText;

        container.appendChild(button);
        console.log("✅ Bouton 'Coller Iframe' ajouté de manière permanente");
    }

    function createTriggerAllButton() {
        // Vérifier si le bouton existe déjà
        if (document.getElementById("btnTriggerAllIframes")) return;

        // Utiliser le conteneur fixe indépendant
        let container = document.getElementById('fixed-buttons-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'fixed-buttons-container';
            container.style.position = 'fixed';
            container.style.top = '10px';
            container.style.left = '10px';
            container.style.zIndex = '10000';
            container.style.display = 'flex';
            container.style.flexDirection = 'column';
            container.style.gap = '5px';
            document.body.appendChild(container);
        }

        const button = document.createElement("button");
        button.id = "btnTriggerAllIframes";
        button.innerText = "Traiter Iframe";
        button.onclick = triggerButtonsInIframes;
        button.style.padding = '8px 12px';
        button.style.backgroundColor = '#007bff';
        button.style.color = 'white';
        button.style.border = 'none';
        button.style.borderRadius = '5px';
        button.style.cursor = 'pointer';
        button.innerHTML = `<i class='fa fa-bolt'></i> ` + button.innerText;

        container.appendChild(button);
        console.log("✅ Bouton 'Traiter Iframe' ajouté de manière permanente");
    }

    // Fonction supprimée car les boutons sont maintenant permanents
    // function removeFloatingButton(id) {
    //     const btn = document.getElementById(id);
    //     if (btn) {
    //         btn.remove();
    //         console.log(`❌ Bouton '${id}' retiré`);
    //     }
    // }

    function getFloatingButtonArea() {
        return document.querySelector('div[style*="position: fixed;"][style*="bottom: 10px;"][style*="right: 10px;"]');
    }

    function styleFloatingButton(button, backgroundColor, iconClass) {
        button.style.margin = '5px';
        button.style.backgroundColor = backgroundColor;
        button.style.color = 'white';
        button.style.padding = '5px 10px';
        button.style.border = 'none';
        button.style.borderRadius = '5px';
        button.style.cursor = 'pointer';
        button.innerHTML = `<i class='fa ${iconClass}'></i> ` + button.innerText;
    }

    function copyFormData() {
        // Chercher d'abord dans la page principale
        let form = document.querySelector('#panel-body-groupe_saisie_cri');
        let sourceType = "page principale";
        
        // Si pas trouvé dans la page principale, chercher dans les iframes
        if (!form) {
            const iframes = document.querySelectorAll('tr.iframe-row iframe');
            for (let iframe of iframes) {
                try {
                    const doc = iframe.contentWindow.document;
                    form = doc.querySelector('#panel-body-groupe_saisie_cri');
                    if (form) {
                        sourceType = "iframe";
                        break;
                    }
                } catch (err) {
                    console.error("⚠️ Erreur d'accès à une iframe :", err);
                }
            }
        }

        if (!form) {
            alert("Aucun formulaire trouvé. Assurez-vous qu'une réparation est ouverte.");
            return;
        }

        const formData = {};
        const elements = form.querySelectorAll('input, select, textarea');
        
        elements.forEach(el => {
            if (el.name) {
                if (el.type === 'checkbox' || el.type === 'radio') {
                    formData[el.name] = el.checked;
                } else {
                    formData[el.name] = el.value;
                }
            }
        });

        // Sauvegarder dans localStorage
        localStorage.setItem('formulaireCopie', JSON.stringify(formData));
        
        const fieldsCount = Object.keys(formData).length;
        console.log(`📋 Formulaire copié depuis ${sourceType} (${fieldsCount} champs)`);
        
        // Feedback visuel
        const button = document.getElementById("btnCopyForm");
        const originalText = button.innerHTML;
        button.innerHTML = `<i class='fa fa-check'></i> Copié (${fieldsCount} champs)`;
        button.style.backgroundColor = '#28a745';
        
        setTimeout(() => {
            button.innerHTML = originalText;
            button.style.backgroundColor = '#28a745';
        }, 2000);
        
        alert(`Formulaire copié avec succès !\n${fieldsCount} champs sauvegardés depuis ${sourceType}.`);
    }

    function pasteIntoIframes() {
        const formData = JSON.parse(localStorage.getItem('formulaireCopie'));
        if (!formData) {
            alert("Aucune donnée à coller. Veuillez copier un formulaire d'abord.");
            return;
        }

        const iframes = document.querySelectorAll('tr.iframe-row iframe');

        iframes.forEach(iframe => {
            try {
                const doc = iframe.contentWindow.document;
                const form = doc.querySelector('#panel-body-groupe_saisie_cri');
                if (!form) return;

                form.querySelectorAll('input, select, textarea').forEach((el) => {
                    if (el.tagName === 'SELECT') {
                        el.value = formData[el.name];

                        const selectBtn = doc.querySelector(`button[data-id="${el.id}"]`);
                        const selectedOpt = el.querySelector(`option[value="${formData[el.name]}"]`);
                        const text = selectedOpt?.textContent?.trim() || '';
                        const filter = selectBtn?.querySelector('.filter-option');
                        if (filter) {
                            filter.textContent = text;
                        }
                    } else {
                        el.value = formData[el.name] || '';
                    }
                });

                console.log("✅ Formulaire collé dans une iframe");
            } catch (err) {
                console.error("⚠️ Erreur d'accès à une iframe :", err);
            }
        });
    }

    function triggerButtonsInIframes() {
        const iframes = document.querySelectorAll('tr.iframe-row iframe');

        // Liste des priorités : le premier trouvé est cliqué
        const priorityList = [
            'Saisie REX',
            'Saisie du plan de contrôle',
            'SAISIE ETIQUETTE ROUGE (CT10)',
            'SAISIE AUTRE',
            // Ajoute d'autres si nécessaire
        ];

        iframes.forEach(iframe => {
            try {
                const doc = iframe.contentWindow.document;
                let clicked = false;

                for (const label of priorityList) {
                    const button = doc.querySelector(`button[collector-form-name="${label}"]`);
                    if (button) {
                        button.click();
                        console.log(`🟢 Clic sur '${label}' dans une iframe`);
                        clicked = true;
                        break; // Stoppe à la première priorité trouvée
                    }
                }

                if (!clicked) {
                    console.log("⚠️ Aucun bouton prioritaire trouvé dans une iframe");
                }

            } catch (err) {
                console.error("❌ Impossible d'interagir avec une iframe :", err);
            }
        });
    }

    setInterval(monitorTable, 1000);

    function hideElementsInIframes() {
        const iframes = document.querySelectorAll('tr.iframe-row iframe');

        iframes.forEach(iframe => {
            try {
                const doc = iframe.contentWindow.document;

                const panel = doc.getElementById('repair_details_panel');
                if (panel) {
                    panel.style.display = 'none';
                    console.log("🙈 'repair_details_panel' masqué dans une iframe");
                }

            } catch (err) {
                console.error("❌ Impossible d'accéder à une iframe :", err);
            }
        });
    }
    function checkRedirectErrorsInIframes() {
        const iframes = document.querySelectorAll('tr.iframe-row iframe');

        iframes.forEach(iframe => {
            try {
                const doc = iframe.contentWindow.document;
                const bodyText = doc.body?.innerText || '';
                const titleText = doc.title || '';

                const isRedirectError = bodyText.includes("vous a redirigé à de trop nombreuses reprises")
                || titleText.toLowerCase().includes("redirigé");

                if (isRedirectError) {
                    const currentAttempts = iframeReloadAttempts.get(iframe) || 0;

                    if (currentAttempts >= 10) {
                        console.error("❌ Trop de tentatives de reload pour cette iframe. Abandon après 10 essais.");
                        return;
                    }

                    console.warn(`🔁 Redirection détectée (tentative ${currentAttempts + 1}/10). Reload dans 2s...`);

                    setTimeout(() => {
                        iframe.contentWindow.location.reload();
                        iframeReloadAttempts.set(iframe, currentAttempts + 1);
                        console.log("🔄 Iframe rechargée.");
                    }, 2000);
                }

            } catch (err) {
                console.error("❌ Erreur d'accès à une iframe :", err);
            }
        });
    }
    function makeErrorAlertsClosableInIframes() {
        const iframes = document.querySelectorAll('tr.iframe-row iframe');

        iframes.forEach(iframe => {
            try {
                const doc = iframe.contentWindow.document;
                const alert = doc.querySelector('.alert.alert-danger');

                if (
                    alert &&
                    alert.innerText.includes("Pas de transition applicable") &&
                    !alert.dataset.clickable
                ) {
                    alert.style.cursor = 'pointer';
                    alert.title = "Cliquer ici pour fermer cette iframe";
                    alert.dataset.clickable = "true"; // pour ne pas re-lier l'event plusieurs fois

                    alert.addEventListener('click', () => {
                        const tr = iframe.closest('tr.iframe-row');
                        if (tr) {
                            tr.remove();
                            console.log("❎ Iframe fermée après clic sur l'alerte 'Pas de transition applicable'");
                        }
                    });

                    console.log("🟠 Alerte détectée et rendue cliquable dans une iframe");
                }

            } catch (err) {
                console.error("❌ Erreur d'accès à une iframe pour rendre l'alerte cliquable :", err);
            }
        });
    }

})();
