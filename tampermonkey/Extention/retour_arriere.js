(function () {
    'use strict';

    if (!document.getElementById('retournement-style')) {
        const style = document.createElement('style');
        style.id = 'retournement-style';
        style.textContent = `
/* From Uiverse.io by mrhyddenn */
.retournement-button {
  background: transparent;
  color: #000;
  font-size: 17px;
  text-transform: uppercase;
  font-weight: 600;
  border: none;
  padding: 0px 10px;
  cursor: pointer;
  perspective: 30rem;
  border-radius: 5px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.308);
  position: relative;
}

.retournement-button::before {
  content: "";
  display: block;
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  border-radius: 5px;
  background: linear-gradient(
    320deg,
    rgba(0, 140, 255, 0.678),
    rgba(128, 0, 128, 0.308)
  );
  z-index: 1;
  transition: background 3s;
}

.retournement-button:hover::before {
  animation: rotate 1s;
  transition: all 0.5s;
}

@keyframes rotate {
  0% {
    transform: rotateY(180deg);
  }
  100% {
    transform: rotateY(360deg);
  }
}
        `;
        document.head.appendChild(style);
    }

    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    function log(txt) {
        console.log(`[RETOUR ÉTAT] ${txt}`);
    }

    async function cliquerSurBoutonAvecTexte(texte) {
        const boutons = Array.from(document.querySelectorAll("button"));
        for (const bouton of boutons) {
            if (bouton.innerText.trim().includes(texte)) {
                bouton.click();
                log(`✅ Cliquez sur "${texte}"`);
                return true;
            }
        }
        log(`❌ Bouton "${texte}" introuvable`);
        return false;
    }

    async function cliquerSurBoutonParAttribut(selector, nomBouton) {
        const bouton = document.querySelector(selector);
        if (!bouton) {
            log(`❌ Bouton "${nomBouton}" introuvable avec le sélecteur: ${selector}`);
            return false;
        }
        bouton.click();
        log(`✅ Clique sur "${nomBouton}"`);
        return true;
    }

    async function actionRetourEnArriere() {
        // Étape 1: Cliquer sur le premier bouton (Renvoi Qualité Industrielle)
        const boutonRenvoi = document.querySelector('button[collector-trans-id="22758"]');
        if (!boutonRenvoi) {
            alert("❌ Bouton 'Renvoi Qualité Industrielle' non trouvé.");
            return;
        }

        boutonRenvoi.click();
        log("✅ Clique sur 'Renvoi Qualité Industrielle'");
        await delay(2000);

        // Étape 2: Cliquer sur "Remise en production" (collector-trans-id="22760")
        let ok1 = await cliquerSurBoutonParAttribut('button[collector-trans-id="22760"]', "Remise en production");
        // Si le sélecteur collector-trans-id ne fonctionne pas, essayer avec pk
        if (!ok1) {
            ok1 = await cliquerSurBoutonParAttribut('button[pk="11874"]', "Remise en production");
        }
        // Si ça ne fonctionne toujours pas, essayer par texte
        if (!ok1) {
            ok1 = await cliquerSurBoutonAvecTexte("Remise en production");
        }
        if (!ok1) {
            alert("❌ Impossible de trouver le bouton 'Remise en production'");
            return;
        }

        await delay(2000);

        // Étape 3: Cliquer sur "Retour contrôle Qualité" (collector-trans-id="26067")
        let ok2 = await cliquerSurBoutonParAttribut('button[collector-trans-id="26067"]', "Retour contrôle Qualité");
        // Si le sélecteur collector-trans-id ne fonctionne pas, essayer avec pk
        if (!ok2) {
            ok2 = await cliquerSurBoutonParAttribut('button[pk="389"]', "Retour contrôle Qualité");
        }
        // Si ça ne fonctionne toujours pas, essayer par texte
        if (!ok2) {
            ok2 = await cliquerSurBoutonAvecTexte("Retour contrôle Qualité");
        }
        if (!ok2) {
            alert("❌ Impossible de trouver le bouton 'Retour contrôle Qualité'");
            return;
        }

        alert("✅ Séquence retour effectuée avec succès !");
    }

    function creerBouton() {
        if (document.getElementById("btnRevenirArriere")) return;

        const header = Array.from(document.querySelectorAll("h3.panel-title"))
            .find(el => el.textContent.trim() === "Actions disponibles");

        if (!header || !header.parentElement) return;

        const container = header.parentElement;

        // Style en flex pour l'affichage du bouton à droite
        container.style.display = "flex";
        container.style.justifyContent = "space-between";
        container.style.alignItems = "center";

        const bouton = document.createElement("button");
        bouton.id = "btnRevenirArriere";
        bouton.textContent = "↶";
        bouton.className = "retournement-button";
        bouton.style.marginLeft = "auto";

        bouton.onclick = actionRetourEnArriere;

        container.appendChild(bouton);
    }

    // Observer le DOM car les éléments changent sans recharger la page
    const observer = new MutationObserver(() => {
        creerBouton();
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // Initialisation directe
    creerBouton();
})();
