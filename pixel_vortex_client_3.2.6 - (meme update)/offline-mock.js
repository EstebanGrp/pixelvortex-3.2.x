window.grecaptcha = {
    ready: (cb) => { if (typeof cb === 'function') cb(); },
    execute: () => Promise.resolve("mock-token"),
    render: () => "mock-widget-id"
};

window.CrazyGames = {
    SDK: {
        game: {
            gameplayStart: () => {},
            gameplayStop: () => {},
            happytime: () => {},
        },
        ad: {
            requestAd: () => {},
        },
        banner: {
            requestBanner: () => {},
        }
    }
};

window.gtag = function() {};
window.dataLayer = [];

window.turnstile = {
    render: () => "mock-widget-id",
    reset: () => {},
    getResponse: () => "mock-token"
};

console.log("Offline mocks loaded.");
