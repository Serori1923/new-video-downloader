import React, { createContext, useState, useContext } from 'react';

const ServerUrlContext = createContext();

export const useServerUrl = () => useContext(ServerUrlContext);

export const ServerUrlProvider = ({ children }) => {
  const [serverUrl, setServerUrl] = useState(() => {
    return localStorage.getItem("serverUrl") || "https://meow.akkkou.com/";
  });

  const changeServerUrl = (newServerUrl) => {
    setServerUrl(newServerUrl);
  };

  return (
    <ServerUrlContext.Provider value={{ serverUrl, changeServerUrl }}>
      {children}
    </ServerUrlContext.Provider>
  );
};
