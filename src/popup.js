async function postToBluesky(text, imageURL = [], timestamp = new Date().toISOString()) {
    const { BskyAgent } = await import("@atproto/api");
    const { RichText } = await import("@atproto/api");

    // Function to retrieve credentials as a promise
    function getCredentials() {
        return new Promise((resolve, reject) => {
            chrome.storage.local.get(["identifier", "password"], (result) => {
                if (chrome.runtime.lastError) {
                    return reject(chrome.runtime.lastError);
                }
                resolve(result);
            });
        });
    }
    
    async function imageToUint8Array(image, context, quality = 0.9) {
        context.canvas.width = image.width;
        context.canvas.height = image.height;
        context.drawImage(image, 0, 0);
        
        const blob = await new Promise((resolve) => {
            context.canvas.toBlob(
                (blob) => {
                    resolve(blob);
                },
                "image/jpeg",
                quality
            );
        });
        return new Uint8Array(await blob.arrayBuffer());
    }

    const agent = new BskyAgent({
        service: "https://bsky.social"
    });

    try {
        await agent.login(await getCredentials());
    } catch(error) {
        console.error("Error retrieving credentials: ", error);
    }
    
    const rt = new RichText({text: text});
    await rt.detectFacets(agent);
    const postRecord = {
        $type: "app.bsky.feed.post",
        text: rt.text,
        facets: rt.facets,      
        createdAt: timestamp
    };

    if (imageURL.length > 0) {
        postRecord.embed = {
            $type: "app.bsky.embed.images",
            images: []
        }
    }
    const processImages = async () => {
        for (const src of imageURL) {
            const tempImage = new Image();
            tempImage.src = src;
            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d");
            let data;
            try {
                const imageData = await imageToUint8Array(tempImage, context);
                ({ data } = await agent.uploadBlob(imageData, { encoding: "image/jpeg" }));
            } catch (error) {
                console.error("Error uploading file: ", error);
            }
            postRecord.embed.images.push({
                alt: "",
                image: data.blob,
                aspectRatio: {width: tempImage.width, height: tempImage.height}
            });
        }
    };
    
    try {
        await processImages();
        await agent.post(postRecord);
        console.log("Post submitted successfully.");
    } catch(error) {
        console.error("Error submitting post: ", error);
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
                    if (response.imageURL.length > 0) {
                        response.imageURL.forEach(src => {
                            const img = document.createElement("img");
                            img.src = src;
                            document.getElementById("image-container").appendChild(img);
                        });
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