import React from "react";
import { FaQuestionCircle } from "react-icons/fa";

const Settings = ({ chunkSize, onChunkSizeChange }) => {
  const handleChunkSizeChange = (e) => {
    const newSize = parseInt(e.target.value, 10);
    onChunkSizeChange(newSize);
  };

  return (
    <div className="settings-modal">
      <h1>Settings</h1>
      <div className="container">
        <div className="setting-label">
          <label htmlFor="chunkSize">Chunk Size:</label>
          <div className="tooltip">
            <FaQuestionCircle size={16} />
            <span className="tooltiptext">
              Determines how many words in each timestamp segment. 1000
              words is usually about 7 minutes of time.
            </span>
          </div>
        </div>
        <input
          type="range"
          id="chunkSize"
          min="300"
          max="5000"
          step="100"
          value={chunkSize}
          onChange={handleChunkSizeChange}
        />
        <span>{chunkSize} words</span>
      </div>
    </div>
  );
};

export default Settings;
