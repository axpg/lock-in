function getShortsShelves() {
    return {
        miniShortsShelf: document.querySelector('ytd-mini-guide-entry-renderer[aria-label="Shorts"]'),
        shortsShelf: document.querySelector('ytd-guide-entry-renderer a[title="Shorts"]')
    };
}

function setDisplay(element, displayValue) {
    if (element) {
        element.style.display = displayValue;
    }
}

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