import React, { createContext, useState, useContext } from 'react';

// Create a Context for gamerId
const GamerContext = createContext();

export const useGamer = () => useContext(GamerContext);

export const GamerProvider = ({ children }) => {
  const [gamerId, setGamerId] = useState(null);

  return (
    <GamerContext.Provider value={{ gamerId, setGamerId }}>
      {children}
    </GamerContext.Provider>
  );
};
