import React, { useRef, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import NavBar from "./NavBar";
import YouTubeInput from "./YoutubeInput";

const Dashboard = (props) => {
  const { data: session, status } = useSession();
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

  const generateTimestampCompletion = async (currentTextChunk) => {
    try {
      return await fetch("/api/generateEmbedding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputArray: currentTextChunk,
        }),
      }).then((res) => res.json());
      if (props.freeTrial) {
        return await fetch("/api/generateFreeTimestamp", {
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
        if (status === "authenticated") {
          return await fetch("/api/generateTimestamp", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              currentTextChunk,
            }),
          }).then((res) => res.json());
        } else {
          return await fetch(
            "https://m697d8eoq5.execute-api.us-east-1.amazonaws.com/dev/",
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
        }
      }
    } catch (e) {
      console.log(e, "e");
      return "error";
    }
  };

  const cleanTimestamp = (textToClean) => {
    // max of 3 comma separated topics
    // don't include "topics:"
    return textToClean
      .split(",")
      .slice(0, 3)
      .join(",")
      .replaceAll("Topics:", "")
      .replaceAll("topics:", "");
  };

  //Gets text transcription of youtube video
  const getTranscription = async (videoId) => {
    let hasTranscript = true;
    const result = await fetch("/api/getTranscription", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: videoId,
      }),
    }).catch((e) => {
      hasTranscript = false;
    });
    if (!hasTranscript) {
      setResultingTimestamps([
        "ERROR: - Selected Youtube video has transcripts disabled",
      ]);
      setProcessingVideo(false);
      return;
    } else {
      return result.json();
    }
  };

  const processTranscript = async (transcriptionResult) => {
    setResultingTimestamps(["00:00:00 - Intro"]);
    // Loop through transcript
    let currentTextChunk = "";
    let chunkStartTime = 0;
    let pendingTextChunk = ""; //This is used when we break context window on previous run
    for (const currentLine of transcriptionResult.transcript) {
      // if (chunkStartTime === 0) chunkStartTime = currentLine.offset;
      // if (pendingTextChunk.length > 0) {
      //   currentTextChunk = currentTextChunk + " " + pendingTextChunk;
      //   pendingTextChunk = "";
      // }
      // currentTextChunk = currentTextChunk + " " + currentLine.text;
      // // if the current text chunk exceeds 3500 words print the chunk and reset chunk to blank
      // if (currentTextChunk.split(" ").length > 1000) {
      if (true) {
        const stringArray = transcriptionResult.transcript.map(
          (obj) => obj.text
        );
        let completionResult = await generateTimestampCompletion(
          stringArray.slice(0, 10)
        );
        console.log(completionResult, "completionResult");
        const dotProduct = (vecA, vecB) => {
          return vecA.reduce((sum, val, idx) => sum + val * vecB[idx], 0);
        };

        const magnitude = (vec) => {
          return Math.sqrt(vec.reduce((sum, val) => sum + val * val, 0));
        };

        const cosineSimilarity = (vecA, vecB) => {
          return dotProduct(vecA, vecB) / (magnitude(vecA) * magnitude(vecB));
        };

        const vectorSubtract = (vecA, vecB) => {
          return vecA.map((val, idx) => val - vecB[idx]);
        };

        const analyzeTrainOfThought = (embedding1, embedding2) => {
          // Compute cosine similarity
          const similarity = cosineSimilarity(embedding1, embedding2);

          // Compute the direction of change
          const directionChange = vectorSubtract(embedding2, embedding1);

          // Custom logic for determining train of thought
          const threshold = 0.5; // Similarity threshold
          const directionMagnitude = magnitude(directionChange);
          const directionThreshold = 0.9; // Direction change threshold
          console.log(similarity, "similarity");
          console.log(directionMagnitude, "directionMagnitude");
          return similarity > threshold &&
            directionMagnitude < directionThreshold
            ? "Train of thought is likely maintained"
            : "Train of thought may have diverged";
        };
        const allEmbeddings = completionResult.completionText.data;
        let lastEmbedding = allEmbeddings[0];
        for (const embedding of allEmbeddings) {
          if (lastEmbedding === embedding) continue;
          console.log(
            analyzeTrainOfThought(lastEmbedding.embedding, embedding.embedding)
          );
          if (allEmbeddings.indexOf(embedding) === allEmbeddings.length) break;
          else lastEmbedding = embedding;
        }
        return;
        //if error, try again with smaller context
        if (completionResult === "error") {
          const firstHalfCurrentChunk = currentTextChunk.slice(
            0,
            Math.floor(currentTextChunk.length / 2)
          );
          pendingTextChunk = currentTextChunk.slice(
            Math.floor(currentTextChunk.length / 2),
            currentTextChunk.length
          );
          completionResult = await generateTimestampCompletion(
            firstHalfCurrentChunk
          );
        }
        if (!completionResult.error && !completionResult.completionText) {
          //Retry if stall
          processTranscript(transcriptionResult);
        } else if (completionResult.error) {
          // setProcessingVideo(false);
          if (
            completionResult.errorType &&
            completionResult.errorType === "MaxIP"
          ) {
            // prompt user to log in to get more credit
            setResultingTimestamps((resultingTimestamps) => [
              ...resultingTimestamps,
              `-- ${completionResult.error} --`,
            ]);
          } else {
            setResultingTimestamps((resultingTimestamps) => [
              ...resultingTimestamps,
              "-- Insufficient credits to generate more timestamps --",
            ]);
          }
          return;
        }
        const completionText = cleanTimestamp(completionResult.completionText);
        // convert chunkStartTime from ms to hh:mm:ss string
        const timeStampString = new Date(chunkStartTime)
          .toISOString()
          .slice(11, 19);
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

  const onSubmitVideoId = async (url) => {
    setProcessingVideo(true);
    const videoId = extractVideoId(url);
    const transcriptionResult = await getTranscription(videoId);
    await processTranscript(transcriptionResult);
  };

  return (
    <div className="dashboard">
      <NavBar
        session={session}
        status={status}
        credits={credits}
        setCredits={setCredits}
        freeTrial={props.freeTrial}
      />
      <div className="hero-container">
        <h1 className="hero-title">
          YouTube <span className="highlight">Timestamp Generation</span> with
          AI!
        </h1>
      </div>
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
              <button
                className="primary"
                style={{ marginTop: 15, fontSize: "1rem" }}
              >
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
