(function() {
    'use strict';

    // Bloque le son par défaut de Planner
    const originalAudio = window.Audio;
    window.Audio = function(url) {
        if (url && url.includes('task_completion_sound')) {
            console.log('🚫 Son par défaut de Planner bloqué:', url);
            // Retourne un audio muet ou notre audio
            return new originalAudio('http://localhost:8000/PieceMario.mp3');
        }
        return new originalAudio(url);
    };

    // Intercepte aussi les fetch/XMLHttpRequest pour cette URL
    const originalFetch = window.fetch;
    window.fetch = function(url, options) {
        if (typeof url === 'string' && url.includes('task_completion_sound')) {
            console.log('🚫 Requête audio Planner interceptée:', url);
            return Promise.reject(new Error('Audio bloqué par TamperMonkey'));
        }
        return originalFetch.call(this, url, options);
    };

    // Intercepte les requêtes XMLHttpRequest
    const originalXHR = window.XMLHttpRequest;
    window.XMLHttpRequest = function() {
        const xhr = new originalXHR();
        const originalOpen = xhr.open;
        xhr.open = function(method, url) {
            if (typeof url === 'string' && url.includes('task_completion_sound')) {
                console.log('🚫 Requête audio Planner interceptée (XHR):', url);
                xhr.abort();
            }
            return originalOpen.apply(xhr, arguments);
        };
            return xhr;
        };

    })();
