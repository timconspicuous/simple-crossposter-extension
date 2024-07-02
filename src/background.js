chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "injectContentScript") {
        chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
            if (tabs.length === 0) {
                sendResponse({ status: "error", message: "No active tab found. The popup might be detached." });
                return;
            }
            
            const activeTab = tabs[0];
            chrome.scripting.executeScript({
                target: { tabId: activeTab.id },
                files: ["content-script.bundle.js"]
            }, (results) => {
                if (chrome.runtime.lastError) {
                    console.error(chrome.runtime.lastError);
                    sendResponse({ status: "error", message: chrome.runtime.lastError.message });
                } else if (!results || results.length === 0) {
                    sendResponse({ status: "error", message: "Script injection failed" });
                } else {
                    sendResponse({ status: "scriptInjected" });
                }
            });
        });
        return true;
    }
});