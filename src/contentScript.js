function getShortsShelves() {
    return {
        miniShortsShelf: document.querySelector('ytd-mini-guide-entry-renderer[aria-label="Shorts"]'),
        shortsShelf: document.querySelector('ytd-guide-entry-renderer a[title="Shorts"]')
    };
}

function hideShorts() {
    const { miniShortsShelf, shortsShelf } = getShortsShelves();
    if (miniShortsShelf || shortsShelf) {
        miniShortsShelf.style.display = 'none'
        shortsShelf.style.display =  'none'
        console.log("Shorts hidden");
    } else {
        console.error("Shorts shelf not found");
    }
}

function showShorts() {
    const { miniShortsShelf, shortsShelf } = getShortsShelves();
    if (miniShortsShelf || shortsShelf) {
        miniShortsShelf.style.display = ''
        shortsShelf.style.display =  ''
        console.log("Shorts restored");
    } else {
        console.error("Shorts shelf not found");
    }
}

function applyUserPreference(action) {
    if (action === "hide") {
        hideShorts();
    } else if (action === "show") {
        showShorts();
    }
}

chrome.runtime.onMessage.addListener((message) => {
    if (message.action === "hide" || message.action === "show") {
        applyUserPreference(message.action);
    }
});

// On content script load, retrieve the stored preference and apply it
chrome.storage.sync.get({ shortsVisibility: "show" }, (data) => {
    applyUserPreference(data.shortsVisibility);
});

function checkAndApplyPreference() {
    chrome.storage.sync.get({ shortsVisibility: "show" }, (data) => {
        applyUserPreference(data.shortsVisibility);
    });
}

// Set up MutationObserver to watch for changes
function setupObserver() {
    const observer = new MutationObserver((mutations) => {
        for (let mutation of mutations) {
            if (mutation.addedNodes.length) {
                checkAndApplyPreference();
                break;
            }
        }
    });

    // Configuration for the observer
    const config = { childList: true, subtree: true };

    // Start observing the document body for changes
    if (document.body) {
        observer.observe(document.body, config);
        console.log("Observer started on document.body");
    } else {
        console.log("Document body not available, retrying...");
        setTimeout(setupObserver, 1000); // Retry after 1 second
    }
}

function init() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupObserver);
    } else {
        setupObserver();
    }
    checkAndApplyPreference();
}

init();
