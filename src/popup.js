import { postToBluesky, fetchThread } from "./blueskyUtils";

function populatePopup(response) {
    const dateOptions = {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    };
    document.getElementById("name").innerText = response.name;
    document.getElementById("handle").innerText = response.handle;
    document.getElementById("text").innerText = response.text;
    document.getElementById("profile-picture").src = response.profilePicURL;
    if (response.imageURL.length > 0) {
        response.imageURL.forEach(source => {
            const img = document.createElement("img");
            img.src = source;
            document.getElementById("image-container").appendChild(img);
        });
    }
    const timestamp = document.createElement("time");
    timestamp.setAttribute("datetime", response.timestamp);
    timestamp.textContent = new Date(response.timestamp).toLocaleString("en-US", dateOptions);
    document.getElementById("post").appendChild(timestamp);
}

document.addEventListener("DOMContentLoaded", () => {
    chrome.tabs.query({active: true, currentWindow: true}, async (tabs) => {
        if (tabs.length === 0) {
            console.log("No active tab found. This might be because the popup is being inspected.");
            document.getElementById("text").innerText = "Popup is being inspected. Please open it normally to use the extension.";
            return;
        }
        const currentTab = tabs[0];
        const url = currentTab.url;
        if (url.match(/https:\/\/bsky\.app\/profile\/(.+)\/post\/(.+)/)) {
            try {
                const thread = await fetchThread(url);
                const response = {
                    name: thread.post.author.displayName,
                    handle: thread.post.author.handle,
                    text: thread.post.record.text,
                    profilePicURL: thread.post.author.avatar,
                    imageURL: [],
                    timestamp: thread.post.record.createdAt
                };
                if (thread.post.embed) {
                    if (thread.post.embed.$type === "app.bsky.embed.images#view") {
                        thread.post.embed.images.forEach(image => {
                            response.imageURL.push(image.fullsize);
                        });  
                    } else if (thread.post.embed.$type === "app.bsky.embed.recordWithMedia#view") {
                        thread.post.embed.media.images.forEach(image => {
                            response.imageURL.push(image.fullsize);
                        });  
                    }
                }
                // TO-DO: Handle quote reskeets and alt-text
                populatePopup(response);
            } catch (error) {
                console.error("Error fetching Bluesky thread:", error);
            }
        } else if (url.match(/https:\/\/x\.com\/[^\/]+\/status\/\d+/)) {
            chrome.runtime.sendMessage({ action: "injectContentScript" }, (response) => {
                if (chrome.runtime.lastError) {
                    console.error("Runtime error:", chrome.runtime.lastError);
                    document.getElementById("text").innerText = "Error: " + chrome.runtime.lastError.message;
                    return;
                }
                
                if (response && response.status === "scriptInjected") {
                    console.log("Content script injected successfully.");
                    chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
                        if (tabs.length === 0) {
                            document.getElementById("text").innerText = "No active tab found. Please open the popup normally.";
                            return;
                        }
                        
                        chrome.tabs.sendMessage(tabs[0].id, { action: "getContent" }, (contentResponse) => {
                            if (chrome.runtime.lastError) {
                                console.error(chrome.runtime.lastError);
                                document.getElementById("text").innerText = "Error: " + chrome.runtime.lastError.message;
                            } else if (contentResponse) {
                                populatePopup(contentResponse);
                            } else {
                                document.getElementById("text").innerText = "Failed to retrieve text, open any post to continue";
                            }
                        });
                    });
                } else {
                    console.error("Error injecting content script:", response ? response.message : "Unknown error");
                    document.getElementById("text").innerText = "Error injecting content script: " + (response ? response.message : "Unknown error");
                }
            });
        }
    });

    document.getElementById("icon1").addEventListener("click", function() {
        window.open("https://bsky.app/profile/timconspicuous.bsky.social", "_blank");
    });
    document.getElementById("icon2").addEventListener("click", function() {
        chrome.runtime.openOptionsPage();
    });
    document.getElementById("post-to-bluesky").addEventListener("click", async () => {
        try {
            const srcs = [];
            document.getElementById("image-container").querySelectorAll("img").forEach(img => {
                srcs.push(img.src);
            });
            postToBluesky(document.getElementById("text").innerText, srcs);
        } catch (error) {
            console.error(error);
        }
    });
});