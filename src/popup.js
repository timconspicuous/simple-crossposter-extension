async function postToBluesky(text) {
    const { BskyAgent } = await import("@atproto/api");

    // Function to retrieve credentials as a promise
    function getCredentials() {
        return new Promise((resolve, reject) => {
            chrome.storage.local.get(["username", "password"], (result) => {
                if (chrome.runtime.lastError) {
                    return reject(chrome.runtime.lastError);
                }
                resolve(result);
            });
        });
    }

    function composePost(text, image = null, timestamp = null) {
        const postJSON = {};
        
    }

    try {
        const { username, password } = await getCredentials();

        const agent = new BskyAgent({
            service: "https://bsky.social"
        });

        if (username && password) {
            await agent.login({
                identifier: username,
                password: password
            });
            await agent.post({
                text: "[🤖🔁]: " + text,
                createdAt: new Date().toISOString()
            });
            console.log("Post successful!");
        } else {
            console.log("No credentials stored");
        }
    } catch (error) {
        console.error("Error retrieving credentials or posting:", error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    let body = document.body;
    let html = document.documentElement;
    let height = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);
    
    // Set the height of the popup
    document.body.style.height = height + 'px';

    // Query the active tab
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        let activeTab = tabs[0];

        // Inject the content script into the active tab
        chrome.scripting.executeScript({
            target: { tabId: activeTab.id },
            files: ["content.bundle.js"]
        }, () => {
            // After injecting, send a message to the content script to get the text
            chrome.tabs.sendMessage(activeTab.id, {message: "getContent"}, (response) => {
                if (chrome.runtime.lastError) {
                    console.error(chrome.runtime.lastError);
                    document.getElementById("text").innerText = "Error: " + chrome.runtime.lastError.message;
                } else if (response) { // you might want to check if the fields are not null
                    document.getElementById("name").innerText = response.name;
                    document.getElementById("handle").innerText = response.handle;
                    document.getElementById("text").innerText = response.text;
                    document.getElementById("profile-picture").src = response.profilePicURL;

                    if (response.imageURL) {
                        document.getElementById("image").src = response.imageURL;
                        document.getElementById("image").style.display = "block"; // Show the div if there is an image URL
                    } else {
                        document.getElementById("image").style.display = "none"; // Hide the div if there is no image URL
                    }
                } else {
                    document.getElementById("text").innerText = "Failed to retrieve text";
                }
            });
        });
    });
    document.getElementById("icon1").addEventListener("click", function() {
        window.open("https://bsky.app/profile/timconspicuous.bsky.social", "_blank");
    });
    document.getElementById("icon2").addEventListener("click", function() {
        chrome.runtime.openOptionsPage();
    });
    document.getElementById("postToBluesky").addEventListener("click", async () => {
        try {
            postToBluesky(document.getElementById("text").innerText);
        } catch (error) {
            console.error(error);
            //document.getElementById('status').innerText = 'Post failed.';
        }
    });
});