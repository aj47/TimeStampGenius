import React, { useRef, useState, useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import NavBar from "./NavBar";
import YouTubeInput from "./YoutubeInput";
import { useGlobalStore } from "../store/GlobalStore";
import Modal from "./Modal";

const Dashboard = () => {
  const { data: session, status } = useSession();
  const { credits, setCredits, chunkSize, systemPrompt, userPrompt } = useGlobalStore();
  const [processingVideo, setProcessingVideo] = useState(false);
  const [resultingTimestamps, setResultingTimestamps] = useState([]);
  const [copySuccess, setCopySuccess] = useState(false);
  const [openAISettings, setOpenAISettings] = useState({
    model: "gpt-3.5-turbo",
    temperature: 0.7,
    max_tokens: 100,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
  });
  const textAreaRef = useRef(null);
  const [showInsufficientCreditsModal, setShowInsufficientCreditsModal] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const textarea = textAreaRef.current;
      const handleResize = () => {
        if (!textarea) return
        textarea.style.height = "auto";
        textarea.style.height = `${textarea.scrollHeight}px`;
        textarea.style.maxHeight = `${window.innerHeight * 0.5}px`;
      };

      handleResize();
      window.addEventListener("resize", handleResize);

      return () => {
        window.removeEventListener("resize", handleResize);
      };
    }
  }, [resultingTimestamps]);

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

/**
 * Generates a timestamp completion for a given text chunk using OpenRouter with Gemini 2.5 Flash.
 *
 * @param {string} currentTextChunk The text chunk to be processed
 * @returns {object} The response from the API, or "error" if an error occurs
 */
const generateTimestampCompletion = async (currentTextChunk) => {
  try {
    const requestBody = {
      currentTextChunk,
      systemPrompt,
      userPrompt
    };

    const response = await fetch("/api/generateTimestampOpenRouter", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      console.error('API request failed:', response.status, response.statusText);
      return "error";
    }

    const result = await response.json();

    if (result.error) {
      console.error('API returned error:', result.error);
      return "error";
    }

    return result;
  } catch (e) {
    console.error('Error in generateTimestampCompletion:', e);
    return "error";
  }
};

  /**
   * Cleans a string by removing extra topics and the "Topics:" prefix.
   *
   * @param {string} textToClean - The string to clean
   * @returns {string} The cleaned string with a maximum of 3 comma-separated topics
   */
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
      if (chunkStartTime === 0) chunkStartTime = currentLine.offset * 1000; //to get offset in seconds
      if (pendingTextChunk.length > 0) {
        currentTextChunk = currentTextChunk + " " + pendingTextChunk;
        pendingTextChunk = "";
      }
      currentTextChunk = currentTextChunk + " " + currentLine.text;
      // if the current text chunk exceeds chunkSize print the chunk and reset chunk to blank
      if (currentTextChunk.split(" ").length > chunkSize) {
        let completionResult = await generateTimestampCompletion(
          currentTextChunk
        );
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
            setShowInsufficientCreditsModal(true);
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

  // Show login screen for unauthenticated users
  if (status === "loading") {
    return (
      <div className="dashboard">
        <NavBar />
        <div className="hero-container">
          <h1 className="hero-title">Loading...</h1>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="dashboard">
        <NavBar />
        <div className="hero-container">
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h1 className="hero-title">
              YouTube <span className="highlight">Timestamp Generation</span> with AI!
            </h1>
            <div style={{ marginTop: '2rem' }}>
              <h2>Sign in to get started</h2>
              <p>You need to sign in with Google to use Timestamp Genius.</p>
              <button
                onClick={() => signIn("google")}
                style={{
                  padding: '12px 24px',
                  fontSize: '16px',
                  backgroundColor: '#4285f4',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  marginTop: '1rem'
                }}
              >
                Sign in with Google
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <NavBar />
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
                readOnly
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
      <Modal
        isOpen={showInsufficientCreditsModal}
        onClose={() => setShowInsufficientCreditsModal(false)}
      >
        <h2>Insufficient Credits</h2>
        <p>You don&apos;t have enough credits to generate more timestamps.</p>
        {status === "authenticated" ? (
          <>
            <p>Purchase more credits to continue using the service.</p>
            <button onClick={() => {/* Add your buy credits logic here */}}>
              Buy Credits
            </button>
          </>
        ) : (
          <>
            <p>Log in with Google to get free credits!</p>
            <button onClick={() => signIn("google")}>Log in with Google</button>
          </>
        )}
      </Modal>
    </div>
  );
};

export default Dashboard;