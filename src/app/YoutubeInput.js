import React, { useState } from 'react';

function YouTubeInput(props) {
  const [videoId, setVideoId] = useState('');

  const handleInputChange = (event) => {
    setVideoId(event.target.value);
  };

  const handleSubmit = (event) => {
    console.log(`Submitted YouTube Video ID: ${videoId}`);
		props.onSubmit(videoId);
    event.preventDefault();
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        YouTube Video ID:
        <input type="text" value={videoId} onChange={handleInputChange} />
      </label>
      <button type="submit">Submit</button>
    </form>
  );
}

export default YouTubeInput;
