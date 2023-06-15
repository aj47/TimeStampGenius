import React, { useRef, useState } from "react";
import NavBar from "./NavBar";
import YouTubeInput from "./YoutubeInput";

const Dashboard = (props) => {
  const [processingVideo, setProcessingVideo] = useState(false);
  const [resultingTimestamps, setResultingTimestamps] = useState([]);
  const [copySuccess, setCopySuccess] = useState(false);
  const [credits, setCredits] = useState(0);
  const textAreaRef = useRef(null);

  const copyToClipboard = () => {
    const textToCopy = textAreaRef.current.value;
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopySuccess(true);
      setTimeout(() => {
        setCopySuccess(false);
      }, 1000);
    });
  };

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

  const onSubmitVideoId = async (url) => {
    setProcessingVideo(true);
    const videoId = extractVideoId(url);
    let hasTranscript = true;
    const transcriptionResult = await fetch("/api/getTranscription", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: videoId,
      }),
    })
      .then((res) => res.json())
      .catch((e) => {
        hasTranscript = false;
      });
    if (!hasTranscript) {
      setResultingTimestamps([
        "ERROR: - Selected Youtube video has transcripts disabled",
      ]);
      setProcessingVideo(false);
      return;
    }
    setResultingTimestamps(["00:00:00 -   Intro"]);
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
        if (props.freeTrial) {
          completionResult = await fetch("/api/generateFreeTimestamp", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              user: props.freeTrial,
              currentTextChunk,
            }),
          }).then((res) => res.json());
        } else {
          completionResult = await fetch("/api/generateTimestamp", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              currentTextChunk,
            }),
          }).then((res) => res.json());
        }
        if (!completionResult.error && !completionResult.completionText) {
          onSubmitVideoId(url);
        }
        if (completionResult.error) {
          setProcessingVideo(false);
          setResultingTimestamps((resultingTimestamps) => [
            ...resultingTimestamps,
            "-- Insufficient credits to generate more timestamps --",
          ]);
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
        setResultingTimestamps((resultingTimestamps) => [
          ...resultingTimestamps,
          polishedTimeStamp,
        ]);
        document
          .querySelector("#timestamp-textarea")
          ?.scrollTo(
            0,
            document.querySelector("#timestamp-textarea")?.scrollHeight
          );
        setCredits((oldCredits) => oldCredits - 1);
        chunkStartTime = 0;
        currentTextChunk = "";
      }
    }
  };
  return (
    <div className="dashboard">
      <NavBar
        credits={credits}
        setCredits={setCredits}
        freeTrial={props.freeTrial}
      />
      {processingVideo ? (
        <button
          style={{
            fontSize: "0.8rem",
            padding: "5px 20px",
            marginBottom: 10,
            marginRight: "auto",
            marginLeft: 20,
          }}
          onClick={() => {
            setProcessingVideo(false);
          }}
        >
          Back
        </button>
      ) : (
        <YouTubeInput onSubmit={onSubmitVideoId} />
      )}
      <>
        {resultingTimestamps.length === 0 && processingVideo && (
          <p>processing...</p>
        )}
        {resultingTimestamps.length > 0 && (
          <>
            <div className="timestamps">
              <textarea
                ref={textAreaRef}
                id="timestamp-textarea"
                value={resultingTimestamps.join("\n")}
                rows={4}
                cols={50}
              />
            </div>
            {copySuccess ? (
              <button className="primary" style={{ marginTop: 15 }}>
                Copied
              </button>
            ) : (
              <button
                onClick={copyToClipboard}
                className="primary"
                style={{ marginTop: 15, fontSize: "1rem" }}
              >
                Copy Text
              </button>
            )}
          </>
        )}
      </>
    </div>
  );
};

export default Dashboard;
