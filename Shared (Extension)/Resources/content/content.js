let scannerStarted = false;

let settings = await browser.storage.local.get({
    KeyMatche: false,
    fuzzyMatche: false
});

function handleRouteChange() {
    if (settings.KeyMatche === false && settings.fuzzyMatche === false) {
        scannerStarted = false;
        stopScanner();
        return;
    }
    const isNotePage = location.pathname === "/explore"
        || location.pathname.startsWith("/explore/");
    if (isNotePage && !scannerStarted) {
        scannerStarted = true;
        initScanner();
    }
    if (!isNotePage && scannerStarted) {
        scannerStarted = false;
        stopScanner();
    }
}

function RouteObeserver() {

    function newChangeEvent() {
        window.dispatchEvent(new Event('xhs-route-event'));
    }

    const originalPushState = history.pushState;
    history.pushState = function(...args) {
        const result = originalPushState.apply(this, args);
        newChangeEvent();
        return result;
    }

    const originalReplaceState = history.replaceState;
    history.replaceState = function(...args) {
        const result = originalReplaceState.apply(this, args);
        newChangeEvent();
        return result;
    }

    window.addEventListener("xhs-route-event", () => {
        handleRouteChange();
    });
    window.addEventListener("popstate", () => {
        handleRouteChange();
    });
}

browser.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== "local") {
        return;
    }

    if (!("KeyMatche" in changes) && !("fuzzyMatche" in changes)) {
        return;
    }

    settings = {
        ...settings,
        ...("KeyMatche" in changes && { KeyMatche: changes.KeyMatche.newValue === true }),
        ...("fuzzyMatche" in changes && { fuzzyMatche: changes.fuzzyMatche.newValue === true })
    };
    handleRouteChange();

    if (scannerStarted) {
        refreshScannedComments();
    }
});

RouteObeserver();
handleRouteChange();