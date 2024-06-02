document.getElementById('credentialsForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Store credentials in chrome.storage.local
    chrome.storage.local.set({ username, password }, () => {
        console.log('Credentials saved');
    });
});