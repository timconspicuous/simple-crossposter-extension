# Simple Cross-Poster

A Chrome extension to cross-post your tweets to Bluesky.

If the current tab is a tweet, the extension will fetch the contents of the tweet and display them in the pop-up. A single click will then cross-post the contents to Bluesky.

(I'm planning to look at other APIs, most notably the new Threads API soon.)

## How to use

Download the latest `dist.zip` release and unzip it. The `dist` folder can be placed and renamed as to your preferences.

Go to chrome://extensions/ and toggle `Developer mode`.

Click `Load unpacked` and select the unzipped `dist` folder.

The extension should now be active. You will have to set your Bluesky credentials by opening the extension pop-up and clicking on the cogwheel emoji in the top right.

Now, whenever your active tab is a tweet, you should be able to fetch its contents by opening the extension pop-up.

### Alternative installation

The `dist` folder can be built yourself using Node.js.
Download the source code, install all dependencies with `npm install` and then run `npm run build`. The `dist` folder will appear in the same directory.

## Troubleshooting

This is a very early version and I am not a trained developer. Please expect many bugs and unintended behavior.

Most issues stem from the content-script not being properly injected. If the pop-up displays unintended content, **simply try to reload the page and re-open the pop-up**. I will try to improve the content injection as we go along.

Note that only the contents shown in the pop-up will be cross-posted, so please take a moment to verify that the intended content was fetched.