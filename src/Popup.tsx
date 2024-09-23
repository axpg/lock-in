import { useState, useEffect } from "react";

function Popup() {
    const [youtubeIsHidden, setYoutubeIsHidden] = useState(false);
    const [instagramIsHidden, setInstagramIsHidden] = useState(false);

    useEffect(() => {
        chrome.storage.sync.get(["yt", "ig"], (data) => {
            setYoutubeIsHidden(data.yt === "hide");
            setInstagramIsHidden(data.ig === "hide");
        });
    }, []);

    function togglePlatform(platform: string) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]?.id) {
                chrome.tabs.sendMessage(tabs[0].id, { action: "getState" }, (response) => {
                    if (chrome.runtime.lastError) {
                        console.error("Error sending message:", chrome.runtime.lastError);
                        updateStorage(platform);
                        return;
                    }

                    if (response && response.platform === platform) {
                        const newAction = response.visibility === "show" ? "hide" : "show";
                        chrome.tabs.sendMessage(tabs[0].id!, { action: newAction }, (toggleResponse) => {
                            if (chrome.runtime.lastError) {
                                console.error("Error toggling visibility:", chrome.runtime.lastError);
                            } else {
                                console.log("Visibility toggled:", toggleResponse);
                                updateStorage(platform, newAction);
                            }
                        });
                    } else {
                        console.log("Not on the correct platform, updating storage only");
                        updateStorage(platform);
                    }
                });
            }
        });
    }

    function updateStorage(platform: string, newAction?: string) {
        const currentState = platform === "yt" ? youtubeIsHidden : instagramIsHidden;
        const action = newAction || (currentState ? "show" : "hide");
        chrome.storage.sync.set({ [platform]: action }, () => {
            if (platform === "yt") {
                setYoutubeIsHidden(action === "hide");
            } else {
                setInstagramIsHidden(action === "hide");
            }
        });
    }

    return (
        <div>
            <h1>Lock In!</h1>
            <h2>Block online distractions and focus</h2>
            <img
                src={"/youtube_dark.png"}
                alt={"youtube"}
                className={"youtube-play-button"}
                onClick={function() { togglePlatform("yt"); }}
                style={{ opacity: youtubeIsHidden ? 0.5 : 1 }}
            />
            <img
                src={"https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/Instagram_logo.png/640px-Instagram_logo.png"}
                alt={"instagram"}
                className={"ig-button"}
                onClick={function() { togglePlatform("ig"); }}
                style={{ opacity: instagramIsHidden ? 0.5 : 1 }}
            />
        </div>
    );
}

export default Popup;
