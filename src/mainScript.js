const SELECTORS = {
    yt: {
        miniShortsShelf: 'ytd-mini-guide-entry-renderer[aria-label="Shorts"]',
        shortsShelf: 'ytd-guide-entry-renderer a[title="Shorts"]'
    },
    ig: {
        reelShelf: 'a[href="/reels"]'
    }
};

const reelsDiv = SELECTORS.ig.reelShelf.closest('div');

const css = {
    yt: `
        ${SELECTORS.yt.miniShortsShelf},
        ${SELECTORS.yt.shortsShelf} {
            display: none !important;
        }
    `,
    ig: `
        ${SELECTORS.ig.reelShelf} {
            display: none !important;
        }
    `
};

// Function to inject CSS
function injectCSS(platform) {
    if (!document.getElementById(`custom-hide-style-${platform}`)) {
        const style = document.createElement('style');
        style.id = `custom-hide-style-${platform}`;
        style.textContent = css[platform];
        document.head.appendChild(style);
        console.log(`CSS to hide ${platform} elements injected`);
    }
}

// Function to remove injected CSS
function removeCSS(platform) {
    const style = document.getElementById(`custom-hide-style-${platform}`);
    if (style) {
        style.remove();
        console.log(`CSS to hide ${platform} elements removed`);
    }
}

// Cache user preference
let visibility = 'show';

// Function to apply visibility based on preference
function applyVisibility(platform) {
    if (visibility === 'hide') {
        document.body.classList.add('hide-shorts');
        injectCSS(platform);
    } else {
        document.body.classList.remove('hide-shorts');
        removeCSS(platform);
    }
    console.log(`Element ${visibility === 'hide' ? 'hidden' : 'shown'}`);
}

// Listener for messages to update preference
chrome.runtime.onMessage.addListener((message) => {
    if (message.action === "hide" || message.action === "show") {
        visibility = message.action;
        applyVisibility(getPlatform());
        // Save the updated preference
        chrome.storage.sync.set({ visibility });
    }
});

// Initialize by retrieving stored preference
chrome.storage.sync.get({ visibility: "show" }, (data) => {
    visibility = data.visibility;
    applyVisibility(getPlatform());
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
    applyVisibility(getPlatform());
}, 300);

// Abstract observer target and platform detection
function getPlatformObserverTarget() {
    if (window.location.hostname.includes('youtube.com')) {
        return document.querySelector('ytd-app');  // YouTube target
    } else if (window.location.hostname.includes('instagram.com')) {
        return document.body;  // Instagram target
    }
    return null;  // Default in case platform isn't matched
}

function getPlatform() {
    if (window.location.hostname.includes('youtube.com')) {
        return 'yt';
    } else if (window.location.hostname.includes('instagram.com')) {
        return 'ig';
    }
    return null;
}

// Update the observer setup logic
function setupObserver() {
    const targetNode = getPlatformObserverTarget();

    if (!targetNode) {
        console.log("Target node not found, retrying...");
        setTimeout(setupObserver, 1000);
        return;
    }

    const observer = new MutationObserver((mutations) => {
        for (let mutation of mutations) {
            if (mutation.type === 'childList' && mutation.addedNodes.length) {
                checkAndApplyPreference();
                break;
            }
        }
    });

    const config = { childList: true, subtree: true };
    observer.observe(targetNode, config);
    console.log(`MutationObserver started on ${window.location.hostname}`);
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
