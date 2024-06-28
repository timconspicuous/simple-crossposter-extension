// Function to retrieve the text from the known <div>
function fetchContent() {
    const url = window.location.href;
  
    let targetDivs = {
      name: "",
      handle: "",
      text: "",
      profilePicURL: "",
      imageURL: [],
      timetamp: null
    };
  
    switch (true) {
      case url.includes("bsky.app"):
        targetDivs.name = document.querySelector(".css-175oi2r.r-1loqt21.r-1otgn73.r-13awgt0").textContent;
        targetDivs.handle = document.querySelector(".css-175oi2r.r-18u37iz.r-1559e4e").textContent
        if (document.querySelector(".css-146c3p1.r-1xnzce8")) {
          targetDivs.text = document.querySelector(".css-146c3p1.r-1xnzce8").textContent;
        };
        targetDivs.profilePicURL = document.querySelector(".css-9pa8cd").src;
        let imgs = document.querySelector(".css-175oi2r.r-1m04atk.r-1pyaxff.r-95jzfe.r-13yce4e").querySelectorAll("img");
        for (let i = 1; i < imgs.length; i++) {
          targetDivs.imageURL.push(imgs[i].src.replace("thumbnail", "fullsize"));
        } 
        break;
      case url.includes("x.com"):
        targetDivs.name = document.querySelector("[data-testid='User-Name']").textContent.split("@")[0];
        targetDivs.handle = "@" + document.querySelector("[data-testid='User-Name']").textContent.split("@")[1];
        if (document.querySelector("[data-testid='tweetText']")) {
          targetDivs.text = document.querySelector("[data-testid='tweetText']").textContent;
        }
        targetDivs.profilePicURL = document.querySelector(".css-9pa8cd").src;
        document.querySelectorAll("[data-testid='tweetPhoto']").forEach(img => {
          targetDivs.imageURL.push(img.querySelector(".css-9pa8cd").src.split("&name")[0]);
        });
        break;
      // Add more cases as needed
      default:
          //
          break;
    }
    return targetDivs;
  }
  
// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.message === "getContent") {
      const content = fetchContent();
      sendResponse(content);
  }
});