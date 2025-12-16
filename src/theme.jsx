import React, { createContext, useState, useContext } from 'react';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [isLight, setIsLight] = useState(() => {
    const saved = localStorage.getItem("theme");
    return saved === "light"; // light => true
  });

  const changeTheme = (checked) => {
    setIsLight(checked);
    localStorage.setItem("theme", checked ? "light" : "dark");
  };

  const theme = isLight ? "light" : "dark";

  return (
    <ThemeContext.Provider value={{ isLight, theme, changeTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
