let targetDivs = {
  name: "",
  handle: "",
  text: "",
  profilePicURL: "",
  imageURL: [],
  timestamp: ""
};

function fetchContent() {
  const currentUrl = window.location.href;

  targetDivs = {
    name: "",
    handle: "",
    text: "",
    profilePicURL: "",
    imageURL: [],
    timestamp: ""
  };

  switch (true) {
    case (/https:\/\/x\.com\/[^\/]+\/status\/\d+/).test(currentUrl):
      const postContainer = document.querySelector("[data-testid='tweet']");
      if (!postContainer) return targetDivs; // Exit if container not found

      const userNameElement = postContainer.querySelector("[data-testid='User-Name']");
      if (userNameElement) {
        const nameParts = userNameElement.textContent.split("@");
        targetDivs.name = nameParts[0].trim();
        targetDivs.handle = nameParts[1] ? "@" + nameParts[1].trim() : "";
      }

      const tweetTextElement = postContainer.querySelector("[data-testid='tweetText']");
      if (tweetTextElement) {
        targetDivs.text = tweetTextElement.textContent;
      }

      const profilePicElement = postContainer.querySelector(".css-9pa8cd");
      if (profilePicElement) {
        targetDivs.profilePicURL = profilePicElement.src;
      }

      postContainer.querySelectorAll("[data-testid='tweetPhoto']").forEach(img => {
        const imgElement = img.querySelector(".css-9pa8cd");
        if (imgElement && imgElement.src) {
          targetDivs.imageURL.push(imgElement.src.split("&name")[0]);
        }
      });

      const timeElement = postContainer.querySelector("time");
      if (timeElement) {
        targetDivs.timestamp = timeElement.getAttribute("datetime");
      }
      break;
    default:
      break;
  }
  return targetDivs;
}
let lastUrl = location.href; 
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    setTimeout(fetchContent, 500);
  }
}).observe(document, {subtree: true, childList: true});

// Initial pass with DOMContentLoaded
document.addEventListener("DOMContentLoaded", fetchContent);
  
// Listen for messages from the popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "getContent") {
      fetchContent();
      sendResponse(targetDivs);
      return true;
  }
});