import React from "react";
import { FaQuestionCircle } from "react-icons/fa";
import { useGlobalStore } from "../store/GlobalStore";

const Settings = () => {
  const { chunkSize, setChunkSize, systemPrompt, setSystemPrompt, userPrompt, setUserPrompt } = useGlobalStore();

  const handleChunkSizeChange = (e) => {
    const newSize = parseInt(e.target.value, 10);
    setChunkSize(newSize);
  };

  const handleSystemPromptChange = (e) => {
    setSystemPrompt(e.target.value);
  };

  const handleUserPromptChange = (e) => {
    setUserPrompt(e.target.value);
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
      <div className="container">
        <div className="setting-label">
          <label htmlFor="systemPrompt">System Prompt:</label>
          <div className="tooltip">
            <FaQuestionCircle size={16} />
            <span className="tooltiptext">
              Custom instructions for the AI. Leave blank to use default.
            </span>
          </div>
        </div>
        <textarea
          id="systemPrompt"
          value={systemPrompt}
          onChange={handleSystemPromptChange}
          placeholder="Enter custom system prompt here..."
          rows="4"
        />
      </div>
      <div className="container">
        <div className="setting-label">
          <label htmlFor="userPrompt">User Prompt:</label>
          <div className="tooltip">
            <FaQuestionCircle size={16} />
            <span className="tooltiptext">
              Custom user instructions for each chunk. Leave blank to use default.
            </span>
          </div>
        </div>
        <textarea
          id="userPrompt"
          value={userPrompt}
          onChange={handleUserPromptChange}
          placeholder="Enter custom user prompt here..."
          rows="4"
        />
      </div>
    </div>
  );
};

export default Settings;
