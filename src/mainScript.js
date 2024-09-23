const SELECTORS = {
    yt: {
        miniShortsShelf: 'ytd-mini-guide-entry-renderer[aria-label="Shorts"]',
        shortsShelf: 'ytd-guide-entry-renderer a[title="Shorts"]'
    },
    ig: {
        reelShelf: 'a[href*="/reels"]'  // Updated selector for flexibility
    }
};

const css = `
    /* YouTube */
    ${SELECTORS.yt.miniShortsShelf},
    ${SELECTORS.yt.shortsShelf} {
        display: none !important;
    }

    /* Instagram */
    .hide-reels {
        display: none !important;
    }
`;

// Function to inject global CSS
function injectGlobalCSS() {
    if (!document.getElementById('custom-hide-global-style')) {
        const style = document.createElement('style');
        style.id = 'custom-hide-global-style';
        style.textContent = css;
        document.head.appendChild(style);
        console.log('Global CSS for hiding elements injected');
    }
}

// Function to remove global CSS (if needed)
function removeGlobalCSS() {
    const style = document.getElementById('custom-hide-global-style');
    if (style) {
        style.remove();
        console.log('Global CSS for hiding elements removed');
    }
}

// Cache user preference
let visibility = 'show';

// Function to hide Instagram Reels by adding a class
function hideInstagramReels() {
    const reelsLinks = document.querySelectorAll(SELECTORS.ig.reelShelf);
    reelsLinks.forEach(link => {
        const parentDiv = link.closest('div');
        if (parentDiv) {
            parentDiv.classList.add('hide-reels');
        }
    });
}

// Function to show Instagram Reels by removing the class
function showInstagramReels() {
    const reelsLinks = document.querySelectorAll(SELECTORS.ig.reelShelf);
    reelsLinks.forEach(link => {
        const parentDiv = link.closest('div');
        if (parentDiv) {
            parentDiv.classList.remove('hide-reels');
        }
    });
}

// Function to apply visibility based on preference
function applyVisibility(platform) {
    if (platform === 'yt') {
        if (visibility === 'hide') {
            injectGlobalCSS();
        } else {
            removeGlobalCSS();
        }
    }

    if (platform === 'ig') {
        injectGlobalCSS();  // Ensure global CSS is injected for Instagram
        if (visibility === 'hide') {
            hideInstagramReels();
        } else {
            showInstagramReels();
        }
    }
    console.log(`Elements are now ${visibility === 'hide' ? 'hidden' : 'shown'}`);
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

