const reelsElement = document.querySelector('a[href="/reels"]');
const reelsDiv = reelsElement.closest('div');

const css = `
    .hide-reels ${reelsElement};, {
        display: none !important;
    }
`;

function injectCSS() {
    if (!document.getElementById('hide-reels-style')) {
        const style = document.createElement('style');
        style.id = 'hide-reels-style';
        style.textContent = css;
        document.head.appendChild(style);
        console.log("CSS to hide reels injected");
    }
}

function removeCSS() {
    const style = document.createElement('style');
    if (style) {
        style.remove()
    }
    console.log("CSS to hide reels removed");
}