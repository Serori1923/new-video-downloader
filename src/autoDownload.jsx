import React, { createContext, useState, useContext } from 'react';

const AutoDownloadContext = createContext();

export const useAutoDownload = () => useContext(AutoDownloadContext);

export const AutoDownloadProvider = ({ children }) => {
  const [auto, setAuto] = useState(() => {
    const savedAuto = localStorage.getItem("autoDownload");
    return savedAuto === "true";
  });

  const changeAutoDownload = (newAuto) => {
    setAuto(newAuto);
  };

  return (
    <AutoDownloadContext.Provider value={{ auto, changeAutoDownload }}>
      {children}
    </AutoDownloadContext.Provider>
  );
};
