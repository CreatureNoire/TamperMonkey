(function () {
  'use strict';

  //const YOUTUBE_VIDEO_ID = "e8YXqReOSSg"; //star citi
  //const YOUTUBE_VIDEO_ID = "GosiJmZ0wsg"; //car drift
  const YOUTUBE_VIDEO_ID = "91Qe6t6vbI4"; //skiing

  function injectBackgroundWithBlur() {
    const container = document.querySelector(".appContent");
    if (!container) return;
    
    // Vérifier si le background n'est pas déjà injecté
    if (document.getElementById("youtube-bg-wrapper")) return;

    // Créer le wrapper vidéo + overlay
    const wrapper = document.createElement("div");
    wrapper.id = "youtube-bg-wrapper";
    wrapper.innerHTML = `
      <iframe
        id="youtube-bg"
        src="https://www.youtube.com/embed/${YOUTUBE_VIDEO_ID}?autoplay=1&mute=1&loop=1&playlist=${YOUTUBE_VIDEO_ID}&controls=0&showinfo=0&modestbranding=1&rel=0"
        frameborder="0"
        allow="autoplay; fullscreen"
        allowfullscreen
      ></iframe>
      <div id="blur-overlay"></div>
    `;

    container.insertBefore(wrapper, container.firstChild);

    // Appliquer les styles
    GM_addStyle(`

      span[class^="wrapper-"] {
      display: none !important;
      }

      button.is-selected > span > div > .ms-Pivot-linkContent {
      background-color: rgba(1,1,1,0.4) !important;
      }

      .ms-Pivot-linkContent {
      border-radius: 5px !important;
      border-color: rgba(1,1,1,0.1) !important;
      }

      .textContent {
      border-radius: 5px;
      }

      /*.textContent:hover {
      border: 1px solid rgb(219,113,40) !important;
      //margin: -2px -2px -2px -2px;
      }*/

      #unoSuiteNavContainer {
      border-bottom: 0px solid rgba(1,1,1,0) !important;
      }

      .o365cs-base,
      .o365sx-button,
      .o365sx-waffle,
      .o365sx-appName {
      background-color: rgba(5, 5, 5, 1) !important;
      }

      #O365_NavHeader {
      background-color: rgba(5, 5, 5, 1) !important;
      }

      .sideNav {
      background-color: rgba(1, 1, 1, 0.4) !important;
      backdrop-filter: blur(20px);
      border-right: 0px;
      box-shadow: 4px 0 10px rgba(0, 0, 0, 0.4);
      }

      .is-selected {
      background-color: rgba(1, 1, 1, 0.1) !important;
      backdrop-filter: blur(5px);
      }

      .taskcard {
      border-radius: 5px !important;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      }

      .taskcard:hover {
      transform: scale(1.15);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.35) !important;
      border: 1px solid rgb(68,0,0) !important;
      z-index: 10;
      }

      /*ms-FocusZone:hover {
      transform: scale(1.15);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.35);
      z-index: 10;
      }*/

      .container {
      background-color: rgba(1, 1, 1, 0.4) !important;
      backdrop-filter: blur(20px);
      border-radius: 5px !important;

      }

      .placeholder {
      background-color: rgba(1, 1, 1, 0) !important;
      }

      #main-content-container {
        position: relative !important;
        background: none !important;
        z-index: 0;
      }

      #youtube-bg-wrapper {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        overflow: hidden;
        z-index: -1;
      }

      #youtube-bg {
        position: absolute;
        top: 50%;
        left: 50%;
        width: 120vw;
        height: 120vh;
        transform: translate(-50%, -50%);
        pointer-events: none;
        z-index: -2;
      }

      #blur-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        backdrop-filter: blur(5px);
        z-index: -1;
      }

      html, body {
        background: none !important;
      }
    `);
  }

  // Attente de l'élément cible via MutationObserver
  const observer = new MutationObserver(() => {
    const container = document.querySelector(".appContent");
    if (container) {
      injectBackgroundWithBlur();
      observer.disconnect();
    }
  });

  observer.observe(document.documentElement, { childList: true, subtree: true });
})();
