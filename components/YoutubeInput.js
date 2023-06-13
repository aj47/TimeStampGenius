import React, { useState } from "react";

function YouTubeInput(props) {
  const [videoId, setVideoId] = useState("");

  const handleInputChange = (event) => {
    setVideoId(event.target.value);
  };

  const handleSubmit = (event) => {
    console.log(`Submitted YouTube Video ID: ${videoId}`);
    props.onSubmit(videoId);
    event.preventDefault();
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{ marginBottom: 30, textAlign: "center", width: 350 }}
    >
      <label>
        YouTube Video URL:
        <input
          style={{padding: 5, textAlign: "center"}}
          type="text"
          value={videoId}
          onChange={handleInputChange}
          placeholder="https://www.youtube.com/watch?v=xzZVni4OcfE"
        />
      </label>
      <button className="primary" type="submit" style={{padding: 5}}>Submit</button>
    </form>
  );
}

export default YouTubeInput;
