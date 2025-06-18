async function getCurrentTab() {
  let queryOptions = { active: true, lastFocusedWindow: true };
  // `tab` will either be a `tabs.Tab` instance or `undefined`.
  let [tab] = await chrome.tabs.query(queryOptions);
  console.log(tab);
  return tab.url;
}

const extractVideoId = (url) => {
  // Regular expression pattern to match YouTube video URLs with any domain name and formats
  var pattern =
    /(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|.*\.)?youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|v\/|shorts\/)?([^&?/]+)/i;

  // Extract the video ID using the pattern
  var match = url.match(pattern);

  if (match && match[1]) {
    // Return the extracted video ID
    return match[1];
  } else {
    // Return null if the URL is not a valid YouTube video URL
    return null;
  }
};

const main = async () => {
  // Chrome extension no longer supports anonymous usage
  // Users must now sign in to use Timestamp Genius
  console.log("Chrome extension is no longer supported. Please visit https://www.timestampgenius.com and sign in to use the service.");

  // Display message to user
  alert("Chrome extension is no longer supported. Please visit https://www.timestampgenius.com and sign in to use Timestamp Genius.");

  // Redirect to the main website
  window.open("https://www.timestampgenius.com", "_blank");
};

main();
