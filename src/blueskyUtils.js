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

export async function postToBluesky(text, imageURL = [], timestamp = new Date().toISOString()) {
    const { BskyAgent } = await import("@atproto/api");
    const { RichText } = await import("@atproto/api");

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
    } catch (error) {
        console.error("Error retrieving credentials: ", error);
    }

    const rt = new RichText({ text: text });
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
        };
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
                aspectRatio: { width: tempImage.width, height: tempImage.height }
            });
        }
    };

    try {
        await processImages();
        await agent.post(postRecord);
        console.log("Post submitted successfully.");
    } catch (error) {
        console.error("Error submitting post: ", error);
    }
}

async function getPostUri(url) {
    const match = url.match(/https:\/\/bsky\.app\/profile\/(.+)\/post\/(.+)/);
    if (!match) {
      throw new Error("Invalid Bluesky post URL");
    }
    
    const [, handle, rkey] = match;
  
    const response = await fetch(`https://bsky.social/xrpc/com.atproto.identity.resolveHandle?handle=${handle}`);
    const data = await response.json();
    const did = data.did;

    return `at://${did}/app.bsky.feed.post/${rkey}`;
}

export async function fetchThread(url) {
    const { BskyAgent } = await import("@atproto/api");

    const uri = await getPostUri(url);

    const agent = new BskyAgent({
        service: "https://bsky.social"
    });

    try {
        await agent.login(await getCredentials());
    } catch (error) {
        console.error("Error retrieving credentials: ", error);
    }

    const res = await agent.getPostThread({uri: uri});
    const { thread } = res.data;

    return thread;
}