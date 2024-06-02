// Function to retrieve the text from the known <div>
function fetchContent() {
    const url = window.location.href;
  
    let targetDivs = {
      name: "",
      handle: "",
      text: "",
      profilePicURL: "",
      imageURL: "",
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
        if (document.querySelector(".css-175oi2r.r-1loqt21.r-1otgn73.r-1udh08x.r-1xfd6ze")) {
          targetDivs.imageURL = document.querySelector(".css-175oi2r.r-1loqt21.r-1otgn73.r-1udh08x.r-1xfd6ze").querySelector("img").src;
          targetDivs.imageURL = targetDivs.imageURL.replace("thumbnail", "fullsize");
        };
        break;
      case url.includes("x.com"):
        targetDivs.name = document.querySelector("[data-testid='User-Name']").textContent.split("@")[0];
        targetDivs.handle = "@" + document.querySelector("[data-testid='User-Name']").textContent.split("@")[1];
        if (document.querySelector("[data-testid='tweetText']")) {
          targetDivs.text = document.querySelector("[data-testid='tweetText']").textContent;
        }
        targetDivs.profilePicURL = document.querySelector(".css-9pa8cd").src;
        if (document.querySelector("[data-testid='tweetPhoto']")) {
          targetDivs.imageURL = document.querySelector("[data-testid='tweetPhoto']").querySelector(".css-9pa8cd").src.split("&name")[0];
        };
        break;
      // Add more cases as needed
      default:
          //targetDiv = null;
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

//twt
//name: css-1jxf684 r-bcqeeo r-1ttztb7 r-qvutc0 r-poiln3
//handle: css-1jxf684 r-bcqeeo r-1ttztb7 r-qvutc0 r-poiln3
//class="css-1jxf684 r-bcqeeo r-1ttztb7 r-qvutc0 r-poiln3 r-xoduu5 r-1q142lx r-1w6e6rj r-9aw3ui r-3s2u2q r-1loqt21
//profilepic: css-175oi2r r-172uzmj r-1pi2tsx r-13qz1uu r-o7ynqc r-6416eg r-1ny4l3l