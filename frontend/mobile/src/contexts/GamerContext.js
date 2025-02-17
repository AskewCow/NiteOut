import React, { createContext, useState, useContext } from 'react';

// Create a Context for the gamerId
const GamerContext = createContext();

// Create a custom hook to use the gamer context
export const useGamer = () => useContext(GamerContext);

// Create a provider to wrap your app and manage the state
export const GamerProvider = ({ children }) => {
  const [gamerId, setGamerId] = useState(null);

  return (
    <GamerContext.Provider value={{ gamerId, setGamerId }}>
      {children}
    </GamerContext.Provider>
  );
};
