import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { LanguageProvider } from './LanguageContext';
import { AutoDownloadProvider } from "./autoDownload";
import { ServerUrlProvider } from "./serverUrl";
import { ThemeProvider } from "./theme";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <LanguageProvider>
      <AutoDownloadProvider>
        <ServerUrlProvider>
          <ThemeProvider>
            <App />
          </ThemeProvider>
        </ServerUrlProvider>
      </AutoDownloadProvider>
    </LanguageProvider>
  </React.StrictMode>,
);
