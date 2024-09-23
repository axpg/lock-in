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
let visibilityYt = 'show';
let visibilityIg = 'show';


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
    console.log(`Applying visibility for ${platform}`);
    try {
        if (platform === 'yt') {
            visibilityYt === 'hide' ? injectGlobalCSS() : removeGlobalCSS();
        } else if (platform === 'ig') {
            visibilityIg === 'hide' ? injectGlobalCSS() : removeGlobalCSS();
            visibilityIg === 'hide' ? hideInstagramReels() : showInstagramReels();
        } else {
            console.log("Unsupported platform");
        }
    } catch (error) {
        console.error("Error in applyVisibility:", error);
    }
}

// Listener for messages to update preference
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("Message received:", message);
    try {
        if (message.action === "hide" || message.action === "show") {
            visibility = message.action;
            const platform = getPlatform();
            applyVisibility(platform);
            // Save the updated preference
            chrome.storage.sync.set({ visibility }, () => {
                if (chrome.runtime.lastError) {
                    console.error("Error saving visibility:", chrome.runtime.lastError);
                } else {
                    console.log("Visibility saved successfully");
                }
            });
            sendResponse({ status: "Visibility updated", platform: platform });
        }
    } catch (error) {
        console.error("Error processing message:", error);
        sendResponse({ status: "Error", error: error.message });
    }
    return true; // Keeps the message channel open for asynchronous response
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
    const url = window.location.href;
    console.log("Current URL:", url);
    if (url.includes("youtube.com")) return "yt";
    if (url.includes("instagram.com")) return "ig";
    console.log("Unknown platform");
    return "unknown";
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
