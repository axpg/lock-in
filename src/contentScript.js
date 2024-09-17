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
 * Sets the display style of the provided HTML element.
 *
 * @param {HTMLElement} element - The element for which to set the display style.
 * @param {string} displayValue - The display value to set (e.g., "block", "none").
 * @return {void}
 */
function setDisplay(element, displayValue) {
    if (element) {
        element.style.display = displayValue;
    }
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
        setDisplay(miniShortsShelf, 'none');
        setDisplay(shortsShelf, 'none');
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
        setDisplay(miniShortsShelf, '');
        setDisplay(shortsShelf, '');
        console.log("Shorts restored");
    } else {
        console.error("Shorts shelf not found");
    }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "hide") {
        hideShorts();
    } else if (message.action === "show") {
        showShorts();
    }
});