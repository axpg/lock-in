/**
 * Retrieves the elements representing the "Shorts" shelves in the YouTube UI.
 *
 * @return {Object} An object containing two properties:
 *  - miniShortsShelf: The DOM element for the mini shorts shelf.
 *  - shortsShelf: The DOM element for the main shorts shelf.
 */
function getShortsShelves() {
    return {
        miniShortsShelf: document.querySelector('ytd-mini-guide-entry-renderer[aria-label="Shorts"]'),
        shortsShelf: document.querySelector('ytd-guide-entry-renderer a[title="Shorts"]')
    };
}

/**
 * Hides the mini shorts shelf and the shorts shelf by setting their display style to 'none'.
 * Logs a message to the console indicating the action taken or an error if the shelves are not found.
 *
 * @return {void}
 */
function hideShorts() {
    const { miniShortsShelf, shortsShelf } = getShortsShelves();
    if (miniShortsShelf || shortsShelf) {
        miniShortsShelf.style.display = 'none'
        shortsShelf.style.display = 'none'
        console.log("Shorts hidden");
    } else {
        console.error("Shorts shelf not found");
    }
}

/**
 * Restores the display of short shelves if they exist, otherwise logs an error.
 *
 * @return {void}
 */
function showShorts() {
    const { miniShortsShelf, shortsShelf } = getShortsShelves();
    if (miniShortsShelf || shortsShelf) {
        miniShortsShelf.style.display = ''
        shortsShelf.style.display = ''
        console.log("Shorts restored");
    } else {
        console.error("Shorts shelf not found");
    }
}

/**
 * Applies the user preference for hiding or showing Shorts.
 *
 * @param {string} action - The action to perform ("hide" or "show").
 */
function applyUserPreference(action) {
    if (action === "hide") {
        hideShorts();
    } else if (action === "show") {
        showShorts();
    }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "hide") {
        hideShorts();
    } else if (message.action === "show") {
        showShorts();
    }
});

// On content script load, retrieve the stored preference and apply it
chrome.storage.sync.get({ shortsVisibility: "show" }, (data) => {
    applyUserPreference(data.shortsVisibility);
});