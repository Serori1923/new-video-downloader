import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { LanguageProvider } from './LanguageContext';
import { AutoDownloadProvider } from "./autoDownload";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <LanguageProvider>
      <AutoDownloadProvider>
        <App />
      </AutoDownloadProvider>
    </LanguageProvider>
  </React.StrictMode>,
);
