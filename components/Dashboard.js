import React, { useState } from "react";
import YouTubeInput from "./YoutubeInput";
import { useSession, signIn, signOut } from "next-auth/react";

const Dashboard = (props) => {
  const [processingVideo, setProcessingVideo] = useState(false);
  const [resultingTimestamps, setResultingTimestamps] = useState([]);
  const onSubmitVideoId = async (id) => {
    setProcessingVideo(true);
    const transcriptionResult = await fetch("/api/getTranscription", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id,
      }),
    }).then((res) => res.json());
    // Loop through transcript
    let currentTextChunk = "";
    let chunkSummaries = "";
    let chunkStartTime = 0;
    for (const currentLine of transcriptionResult.transcript) {
      if (chunkStartTime === 0) chunkStartTime = currentLine.offset;
      currentTextChunk = currentTextChunk + " " + currentLine.text;
      // if the current text chunk exceeds 3500 words print the chunk and reset chunk to blank
      if (currentTextChunk.split(" ").length > 500) {
        // console.log(currentTextChunk);
        const completionResult = await fetch("/api/generateTimestamp", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            currentTextChunk,
          }),
        }).then((res) => res.json());
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
        console.log(resultingTimestamps, "resultingTimestamps");
        setResultingTimestamps((resultingTimestamps) => [
          ...resultingTimestamps,
          polishedTimeStamp,
        ]);
        console.log(polishedTimeStamp);
        chunkStartTime = 0;
        currentTextChunk = "";
      }
    }
    console.log(transcriptionResult, "transcriptionResult");
    setProcessingVideo(false);
  };
  return (
    <div className="dashboard">
      {processingVideo ? (
        <>
          {resultingTimestamps.length === 0 && <p>processing...</p>}
          <div>
            {resultingTimestamps.map((line, index) => (
              <p key={index}>{line}</p>
            ))}
          </div>
        </>
      ) : (
        <YouTubeInput onSubmit={onSubmitVideoId} />
      )}
    </div>
  );
};

export default Dashboard;
