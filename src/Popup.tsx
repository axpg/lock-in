import { useState, useEffect } from "react";

function Popup() {
    const [shortsIsHidden, setShortsIsHidden] = useState(false);

    useEffect(() => {
        chrome.storage.sync.get({ Visibility: "show" }, (data) => {
            setShortsIsHidden(data.Visibility === "hide");
        });
    }, []);

    const toggleShorts = () => {
        const action = shortsIsHidden ? "show" : "hide";

        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0].id) {
                chrome.tabs.sendMessage(tabs[0].id, { action });
            }
        });

        chrome.storage.sync.set({ visibility: action }, () => {
            console.log(`Visibility set to ${action}`);
        });

        setShortsIsHidden(!shortsIsHidden);
    };

    return (
        <div>
            <h1>Lock In!</h1>
            <h2>Block online distractions and focus</h2>
            <img
                src={"/youtube_dark.png"}
                alt={"youtube"}
                className={"youtube-play-button"}
                onClick={toggleShorts}
            />
        </div>
    );
}

export default Popup;
