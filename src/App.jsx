import React, { useState, useEffect } from "react";
import DownloadHistoryPage from "./pages/DownloadHistory";
import PreferencesPage from "./pages/Preferences";
import { open } from '@tauri-apps/plugin-shell';
import { TextField, Button, Typography, Tabs, Tab, IconButton } from "@mui/material";
import { Download } from "@mui/icons-material";
import { localization } from "./util/localization";
import { localizationDownloadHistory } from "./util/download history";
import { errorMap } from "./util/error map";
import { saveNewHistory } from "./util/saveNewHistory";
import { useLanguage } from "./LanguageContext";
import { useAutoDownload } from "./autoDownload";
import { useServerUrl } from "./serverUrl";
import "./index.css";

export default function App() {
  const { lang, changeLanguage } = useLanguage();
  const { auto, changeAutoDownload } = useAutoDownload();
  const { serverUrl, changeServerUrl } = useServerUrl();
  const [url, setUrl] = useState("");
  const [downloadStatus, setDownloadStatus] = useState("");
  const [downloadInfo, setDownloadInfo] = useState("");
  const [option, setOption] = useState("auto");
  const [page, setPage] = useState(0);
  const [videoUrl, setVideoUrl] = useState("");

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      download();
    }
  };

  const download = async () => {
    setDownloadStatus("downloading");
    const requestData = {
      url: url,
      videoQuality: "max",
      filenameStyle: "basic",
      downloadMode: option,
      tiktokFullAudio: false,
      tiktokH265: true,
      twitterGif: true,
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
      const response = await fetch(serverUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'application/json',
        },
        body: JSON.stringify(requestData),
        signal: controller.signal
      });
      
      const data = await response.json();
      if(data.status === "error"){
        console.log(data);
        setDownloadStatus("fail");
        setDownloadInfo(errorMap[data.error.code] || errorMap["unknownError"]);
        setVideoUrl("");
      }
      else{
        setDownloadStatus("success");
        setDownloadInfo(data.filename);
        setVideoUrl(data.url);
        if(auto){
          open(data.url);
        }
        saveNewHistory(data.filename, url);
      }
    }
    catch (error) {
      setDownloadStatus("requestFail");
      setDownloadInfo(errorMap["failToConnectToServer"]);
    } finally {
      clearTimeout(timeoutId);
    }
  };

  return (
      <div className="relative flex flex-col">
        <div className="w-full bg-gray-200">
          <Tabs value={page}>
            <Tab onClick={() => setPage(0)} sx={{ textTransform: "none" }} label={localization.home[lang]} />
            <Tab onClick={() => setPage(1)} sx={{ textTransform: "none" }} label={localization.preference_menu.preference[lang]} />
            <Tab onClick={() => setPage(2)} sx={{ textTransform: "none" }} label={localizationDownloadHistory.downloadHistory[lang]} />
          </Tabs>
        </div>
        <div className="absolute top-12 left-0 w-full h-screen flex flex-col items-center bg-green-100">
          <div className="flex w-19/20 mt-5">
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Enter video URL..."
              label="URL"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={handleKeyDown}
              tabIndex={0}
              sx={{
                mr: 2,
                backgroundColor: "#F8EFEE",
              }}
              id="url"
            />
            <IconButton variant="outlined" onClick={() => {download()}}>
              <Download />
            </IconButton>
          </div>

          {/* Download Options */}
          <Typography variant="h5" sx={{mt: 3, color: "#7E9F98"}}>
            {localization.downloadOptionsTitle[lang]}
          </Typography>
          <div className="flex space-x-4 mt-4">
            <Button variant="contained" sx={{mr: 2, fontSize:"20px", backgroundColor: option == "auto" ? "#41313e" : "#5A5058", textTransform: "none"}} size="large" onClick={() => setOption("auto")}>
              {localization.downloadOptionsButton.videoAndAudio[lang]}
            </Button>
            <Button variant="contained" sx={{mr: 2, fontSize:"20px", backgroundColor: option == "audio" ? "#41313e" : "#5A5058", textTransform: "none"}} size="large" onClick={() => setOption("audio")}>
              {localization.downloadOptionsButton.audioOnly[lang]}
            </Button>
            <Button variant="contained" sx={{fontSize:"20px", backgroundColor: option == "mute" ? "#41313e" : "#5A5058", textTransform: "none"}} size="large" onClick={() => setOption("mute")}>
              {localization.downloadOptionsButton.videoOnly[lang]}
            </Button>
          </div>
          
          <div className="flex mt-4">
            <Typography sx={{mr: 1, fontSize:"20px", color: "#7E9F98"}}>{localization.downloadStatusTitle[lang]}</Typography>
            <Typography sx={{fontSize:"20px", color: downloadStatus === "fail" ? "red" : downloadStatus === "requestFail" ? "red" : downloadStatus === "success" ? "green" : "#7E9F98"}}>
              {downloadStatus === "fail" ? localization.status.fail[lang] : downloadStatus === "requestFail" ? localization.status.requestFail[lang] : downloadStatus === "success" ? localization.status.success[lang] : downloadStatus === "downloading" ? localization.status.downloading[lang] : localization.status.ready[lang]}
            </Typography>
          </div>
          <Typography sx={{mt: 2, fontSize:"20px", color: "#7E9F98"}}>
          {downloadStatus === "fail" ? localization.infoTitle.error[lang] : downloadStatus === "requestFail" ? localization.infoTitle.error[lang] : downloadStatus === "success" ? localization.infoTitle.fileLink[lang] : localization.infoTitle.download[lang]}
            </Typography>
          <a href={videoUrl} target="_blank">
            <Typography sx={{mt: 1, ml: 3, mr: 3, fontSize:"20px", color: "#aaa5ec"}}>
              {downloadStatus === "fail" ? downloadInfo[lang] : downloadStatus === "requestFail" ? downloadInfo[lang] : downloadStatus === "success" ? downloadInfo : localization.infoDescription.notDownload[lang]}
            </Typography>
          </a>
        </div>

        <div className="absolute top-8 left-0 w-full flex flex-col items-center mt-4">
          <div className={`w-full h-screen absolute duration-500 ${page === 1 ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"}`}>
            <PreferencesPage />
          </div>

          <div className={`w-full h-screen absolute duration-500 ${page === 2 ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"}`}>
            <DownloadHistoryPage />
          </div>
        </div>
      </div>
  );
}
