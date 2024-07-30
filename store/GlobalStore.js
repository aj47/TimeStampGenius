import React, { createContext, useContext, useState } from 'react';

const GlobalContext = createContext();

export const GlobalProvider = ({ children }) => {
  const [credits, setCredits] = useState(0);
  const [chunkSize, setChunkSize] = useState(1000);
  const [systemPrompt, setSystemPrompt] = useState("");
  const [userPrompt, setUserPrompt] = useState("");

  return (
    <GlobalContext.Provider value={{
      credits,
      setCredits,
      chunkSize,
      setChunkSize,
      systemPrompt,
      setSystemPrompt,
      userPrompt,
      setUserPrompt
    }}>
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobalStore = () => useContext(GlobalContext);
