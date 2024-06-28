document.getElementById("credentialsForm").addEventListener("submit", async (event) => {
    event.preventDefault();

    const identifier = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    // Store credentials in chrome.storage.local
    chrome.storage.local.set({ identifier, password }, () => {
        console.log("Credentials saved");
    });
});