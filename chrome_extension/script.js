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
  const videoId = extractVideoId(await getCurrentTab());
  const transcriptionResult = await fetch(
    "https://www.timestampgenius.com/api/getTranscription",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: videoId,
      }),
    }
  )
    .then((res) => res.json())
    .catch((e) => {
      hasTranscript = false;
    });
  console.log(transcriptionResult, "transcriptionResult");
  // Loop through transcript
  let currentTextChunk = "";
  let chunkSummaries = "";
  let chunkStartTime = 0;
  for (const currentLine of transcriptionResult.transcript) {
    if (chunkStartTime === 0) chunkStartTime = currentLine.offset;
    currentTextChunk = currentTextChunk + " " + currentLine.text;
    // if the current text chunk exceeds 3500 words print the chunk and reset chunk to blank
    if (currentTextChunk.split(" ").length > 500) {
      let completionResult = null;
      completionResult = await fetch(
        "https://www.timestampgenius.com/api/generateFreeTimestampFromChrome",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            currentTextChunk,
          }),
        }
      ).then((res) => res.json());
      if (completionResult.error) {
        // setProcessingVideo(false);
        // setResultingTimestamps((resultingTimestamps) => [
        //   ...resultingTimestamps,
        //   "-- Insufficient credits to generate more timestamps --",
        // ]);
        console.log("error");
        return;
      }
      // convert chunkStartTime from ms to hh:mm:ss string
      const completionText = completionResult.completionText;
      const timeStampString = new Date(chunkStartTime)
        .toISOString()
        .slice(11, 19);
      chunkSummaries =
        chunkSummaries + "\n " + timeStampString + " " + completionText;
      const polishedTimeStamp = (
        timeStampString +
        " - " +
        completionText
      ).replace(/\n/g, " ");
			console.log(polishedTimeStamp)
      // setResultingTimestamps((resultingTimestamps) => [
      //   ...resultingTimestamps,
      //   polishedTimeStamp,
      // ]);
      document
        .querySelector("#timestamp-textarea")
        ?.scrollTo(
          0,
          document.querySelector("#timestamp-textarea")?.scrollHeight
        );
      // setCredits((oldCredits) => oldCredits - 1);
      chunkStartTime = 0;
      currentTextChunk = "";
    }
  }
};

main();
