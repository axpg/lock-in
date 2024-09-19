//shorts shelf elements
const SELECTORS = {
    miniShortsShelf: 'ytd-mini-guide-entry-renderer[aria-label="Shorts"]',
    shortsShelf: 'ytd-guide-entry-renderer a[title="Shorts"]'
};

// CSS to hide Shorts
const css = `
    .hide-shorts ${SELECTORS.miniShortsShelf},
    .hide-shorts ${SELECTORS.shortsShelf} {
        display: none !important;
    }
`;

// Function to inject CSS
function injectCSS() {
    if (!document.getElementById('hide-shorts-style')) {
        const style = document.createElement('style');
        style.id = 'hide-shorts-style';
        style.textContent = css;
        document.head.appendChild(style);
        console.log("CSS to hide Shorts injected");
    }
}

// Function to remove injected CSS
function removeCSS() {
    const style = document.getElementById('hide-shorts-style');
    if (style) {
        style.remove();
        console.log("CSS to hide Shorts removed");
    }
}

// Cache user preference
let shortsVisibility = 'show';

// Function to apply visibility based on preference
function applyShortsVisibility() {
    if (shortsVisibility === 'hide') {
        document.body.classList.add('hide-shorts');
        injectCSS();
    } else {
        document.body.classList.remove('hide-shorts');
        removeCSS();
    }
    console.log(`Shorts ${shortsVisibility === 'hide' ? 'hidden' : 'shown'}`);
}

// Listener for messages to update preference
chrome.runtime.onMessage.addListener((message) => {
    if (message.action === "hide" || message.action === "show") {
        shortsVisibility = message.action;
        applyShortsVisibility();
        // Save the updated preference
        chrome.storage.sync.set({ shortsVisibility });
    }
});

// Initialize by retrieving stored preference
chrome.storage.sync.get({ shortsVisibility: "show" }, (data) => {
    shortsVisibility = data.shortsVisibility;
    applyShortsVisibility();
});

// Debounce function to limit the rate of function calls
function debounce(fn, delay) {
    let timeoutId;
    return function(...args) {
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn.apply(this, args), delay);
    };
}

// Function to check and apply preference
const checkAndApplyPreference = debounce(() => {
    applyShortsVisibility();
}, 300);

// Set up MutationObserver efficiently
function setupObserver() {
    const targetNode = document.querySelector('ytd-app'); // More specific target

    if (!targetNode) {
        console.log("ytd-app not found, retrying...");
        setTimeout(setupObserver, 1000);
        return;
    }

    const observer = new MutationObserver((mutations) => {
        for (let mutation of mutations) {
            if (mutation.type === 'childList' && mutation.addedNodes.length) {
                checkAndApplyPreference();
                break; // No need to process further mutations in this batch
            }
        }
    });

    // Configuration for the observer
    const config = { childList: true, subtree: true };

    // Start observing the target node
    observer.observe(targetNode, config);
    console.log("MutationObserver started on ytd-app");
}

// Initialize the observer after DOM is ready
function init() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupObserver);
    } else {
        setupObserver();
    }
}

init();
