async function postToBluesky(text, imageURL = null, timestamp = new Date().toISOString()) {
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

    /*function getImageDimensions(url) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                resolve({ width: img.width, height: img.height });
            };
            img.onerror = (error) => {
                reject(error);
            };
            img.src = url;
        });
    }*/

    /*function toBlob(canvas, type = "image/jpeg", quality = 1) {
        return new Promise((resolve) => canvas.toBlob(blob => resolve(blob)))
    }*/
      
    async function imageToUint8Array(image, context) {
        context.canvas.width = image.width;
        context.canvas.height = image.height;
        context.drawImage(image, 0, 0);
        
        const blob = await new Promise((resolve) => {
            context.canvas.toBlob(
                (blob) => {
                    resolve(blob);
                },
                "image/jpeg",
                1
            );
        });
        return new Uint8Array(await blob.arrayBuffer());
    }

    /*function imageToUint8Array(image, context) {
        context.width = image.width;
        context.height = image.height;
        context.drawImage(image, 0, 0);

        return new Uint8Array(context.getImageData(0, 0, image.width, image.height).data.buffer);
    }*/

    const agent = new BskyAgent({
        service: "https://bsky.social"
    });

    let username;
    let password;
    try {
        const credentials = await getCredentials();
        username = credentials.username;
        password = credentials.password;
    } catch (error) {
        console.error("Error retrieving credentials: ", error);
    }
        
    const postJSON = {};
    postJSON.text = text;
    postJSON.createdAt = timestamp;

    if (username && password) {
        await agent.login({
            identifier: username,
            password: password
        });
    }

    if (imageURL) {
        const tempImage = new Image();
        tempImage.src = imageURL;
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        postJSON.embed = {$type: "app.bsky.embed.images"};
        postJSON.embed.images = [{}];
        /*getImageDimensions(imageURL)
            .then(dimensions => {
                postJSON.embed.images[0].aspectRatio = dimensions;
            })
            .catch(error => {
                console.error("Error loading image:", error);
            });*/
        postJSON.embed.images[0].aspectRatio = {width: tempImage.width, height: tempImage.height};

        try {
            const { data } = await agent.uploadBlob(await imageToUint8Array(tempImage, context), {encoding: "image/jpeg"}); //include some encoding if necessary
            postJSON.embed.images[0].image = data.blob;
        } catch(error) {
            console.error("Error uploading file: ", error);
        }
        postJSON.embed.images[0].alt = "";
    }

    console.log(postJSON);

    try {
        await agent.post(postJSON);
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
            if (document.getElementById("image").src) {
                postToBluesky(document.getElementById("text").innerText, document.getElementById("image").src); // This should be an array of images
            } else {
                postToBluesky(document.getElementById("text").innerText);
            }
        } catch (error) {
            console.error(error);
        }
    });
});