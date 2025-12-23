import React, { useState, useEffect } from "react";
import ReactMarkdown from 'react-markdown';
import { open } from '@tauri-apps/plugin-shell';
import { check } from '@tauri-apps/plugin-updater';
import { relaunch } from '@tauri-apps/plugin-process';
import DownloadHistoryPage from "./pages/DownloadHistory";
import PreferencesPage from "./pages/Preferences";
import TwitterPickerPage from "./pages/TwitterPicker";
import { TextField, Button, Typography, Tabs, Tab, IconButton } from "@mui/material";
import { Snackbar, Alert, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { LinearProgress, Box, CircularProgress } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { localization } from "./util/localization/localization";
import { errorMap } from "./util/errorMap";
import { saveNewHistory } from "./util/saveNewHistory";
import { useLanguage } from "./LanguageContext";
import { useAutoDownload } from "./autoDownload";
import { useServerUrl } from "./serverUrl";
import { useTheme } from "./theme";
import { themeColor } from "./util/themeColor";
import "./index.css";

export default function App() {
  const { lang } = useLanguage();
  const { auto } = useAutoDownload();
  const { serverUrl } = useServerUrl();
  const { theme } = useTheme();
  const [url, setUrl] = useState("");
  const [downloadStatus, setDownloadStatus] = useState("");
  const [downloadInfo, setDownloadInfo] = useState("");
  const [option, setOption] = useState("auto");
  const [page, setPage] = useState(0);
  const [videoUrl, setVideoUrl] = useState("");
  const [twitterPickerData, setTwitterPickerData] = useState("");
  const themeSet = themeColor.home;

  // for updater
  const [message, setMessage] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackberStatus, setSnackberStatus] = useState("");
  const [dialogUpdate, setDialogUpdate] = useState(false);
  const [updateInfo, setUpdateInfo] = useState("");
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [readmeContent, setReadmeContent] = useState("");

  const fetchReadme = async () => {
    try {
      const response = await fetch(
        `https://raw.githubusercontent.com/Serori1923/new-video-downloader/refs/heads/main/update-content/${lang}.md?t=${Date.now()}`,
        { cache: 'no-store' }
      );
      const text = await response.text();
      if(text == "404: Not Found"){
        setReadmeContent("## " + localization.updater.loadReadmeFail[lang]);
      } else{
        setReadmeContent(text);
      }
    } catch (error) {
      setReadmeContent(localization.updater.loadReadmeFail[lang]);
    }
  };

  const checkUpdate = async () => {
    try {
      const update = await check({
        headers: {
          'Cache-Control': 'no-cache'
        },
      });

      if (update) {
        setUpdateInfo(update);
        setDialogUpdate(true);
        await fetchReadme();
        console.log(`found update ${update.version} from ${update.date} with notes ${update.body}`);
      }
    } catch (error) {
      console.error("檢查更新時出錯:", error);
    }
  };

  const installUpdate = async () => {
    try {
      if (!updateInfo) throw "未取得更新資訊";
  
      let downloaded = 0;
      let contentLength = 0;
      await updateInfo.downloadAndInstall((event) => {
        switch (event.event) {
          case 'Started':
            contentLength = event.data.contentLength;
            setProgress(0);
            break;
          case 'Progress':
            downloaded += event.data.chunkLength;
            const percentage = Math.min((downloaded / contentLength) * 100, 100);
            setProgress(percentage);
            break;
          case 'Finished':
            setProgress(100);
            break;
          default:
            console.log("未知事件:", event);
        }
      });
      await relaunch();
    } catch (error) {
      setMessage(localization.updater.error[lang]);
      setSnackberStatus("error");
      setOpenSnackbar(true);
      setDialogUpdate(false);
      console.error("安裝更新時出錯:", error);
    }
  };

  const timer = React.useRef(undefined);

  useEffect(() => {
    checkUpdate();

    return () => {
      clearTimeout(timer.current);
    };
  }, []);

  const handleUpdateButtonClick = () => {
    if (!loading) {
      setLoading(true);
      timer.current = setTimeout(() => {
        setSuccess(true);
        setLoading(false);
      }, 10000);
      installUpdate();
    }
  };

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
      convertGif: true,
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

      else if(data.status === "picker"){
        setDownloadStatus("success");
        console.log(data);
        setTwitterPickerData(data.picker);
        setVideoUrl("picker");
        saveNewHistory("MultipleFiles", url);
        setPage(3);
      }

      else{
        setDownloadStatus("success");
        console.log(data);
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
      setVideoUrl("");
    } finally {
      clearTimeout(timeoutId);
    }
  };

  return (
      <div className="relative flex flex-col">
        <div className="w-full" style={{ backgroundColor: themeSet.menu.backgroundColor[theme], fontWeight: "bold" }}>
          <Tabs value={page} sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 'bold',
            },
            '& .MuiTab-root.Mui-selected': {
              color: themeSet.menu.selectedFontColor[theme],
              backgroundColor: themeSet.menu.selectedBackgroundColor[theme]
            },
            '& .MuiTabs-indicator': {
              display: 'none',
            },
          }}>
            <Tab onClick={() => setPage(0)} sx={{ textTransform: "none", color: themeSet.menu.fontColor[theme], fontWeight: "bold" }} label={localization.tabs.home[lang]} />
            <Tab onClick={() => setPage(1)} sx={{ textTransform: "none", color: themeSet.menu.fontColor[theme], fontWeight: "bold" }} label={localization.tabs.preference[lang]} />
            <Tab onClick={() => setPage(2)} sx={{ textTransform: "none", color: themeSet.menu.fontColor[theme], fontWeight: "bold" }} label={localization.tabs.downloadHistory[lang]} />
            <Tab onClick={() => setPage(3)} sx={{ textTransform: "none", color: themeSet.menu.fontColor[theme], fontWeight: "bold", display: page == 3 ? "block" : "none" }} label={localization.tabs.twitterPicker[lang]} />
          </Tabs>
        </div>
        <div className="absolute top-12 left-0 w-full h-screen flex flex-col items-center" style={{ backgroundColor: themeSet.backgroundColor[theme]}}>
          <div className="flex w-19/20 mt-5 ml-3">
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
                mr: 1,
                backgroundColor: themeSet.textField.backGroundColor[theme],
                // 外框圓角
                '& .MuiOutlinedInput-root': {
                  borderRadius: '50px',
                },
                // 外框預設顏色
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: themeSet.textField.borderColor[theme]
                },

                // hover 時外框顏色
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: themeSet.textField.borderColorHover[theme]
                },

                // focus 時外框顏色
                '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: themeSet.textField.borderColorFocus[theme]
                },
                // 輸入的文字顏色
                '& .MuiOutlinedInput-input': {
                  color: themeSet.textField.inputFontColor[theme]
                },
                // placeholder 文字顏色
                '& .MuiOutlinedInput-input::placeholder': {
                  color: themeSet.textField.placeholderFontColor[theme],
                  opacity: 1
                },
                // URL 文字顏色
                '& .MuiInputLabel-root': {
                  color: themeSet.textField.urlLabelFontColor[theme]
                },
                // URL 點擊後文字顏色
                '& .MuiInputLabel-root.Mui-focused': {
                  color: themeSet.textField.urlLabelFontColorFocus[theme]
                }
              }}
              style={{ borderRadius: "50px", color: "white" }}
              id="url"
            />
            <IconButton variant="outlined" style={{ color: themeSet.searchButton[theme] }} onClick={() => {download()}}>
              <SearchIcon />
            </IconButton>
          </div>

          {/* Download Options */}
          <Typography variant="h5" sx={{mt: 3}} style={{ color: themeSet.fontColor[theme], fontWeight: "bold" }}>
            {localization.downloadOptionsTitle[lang]}
          </Typography>
          <div className="flex space-x-4 mt-4">
            <Button variant="contained" sx={{ mr: 2, fontSize:"20px", backgroundColor: option == "auto" ? themeSet.buttonSelectedBackgroundColor[theme] : themeSet.buttonBackgroundColor[theme], textTransform: "none", borderRadius: "16px" }} size="large" onClick={() => setOption("auto")}>
              {localization.downloadOptionsButton.videoAndAudio[lang]}
            </Button>
            <Button variant="contained" sx={{ mr: 2, fontSize:"20px", backgroundColor: option == "audio" ? themeSet.buttonSelectedBackgroundColor[theme] : themeSet.buttonBackgroundColor[theme], textTransform: "none", borderRadius: "16px" }} size="large" onClick={() => setOption("audio")}>
              {localization.downloadOptionsButton.audioOnly[lang]}
            </Button>
            <Button variant="contained" sx={{ fontSize:"20px", backgroundColor: option == "mute" ? themeSet.buttonSelectedBackgroundColor[theme] : themeSet.buttonBackgroundColor[theme], textTransform: "none", borderRadius: "16px" }} size="large" onClick={() => setOption("mute")}>
              {localization.downloadOptionsButton.videoOnly[lang]}
            </Button>
          </div>
          
          {/* Download Status */}
          <div className="flex mt-4">
            <Typography sx={{mr: 1, fontSize:"20px" }} style={{ color: themeSet.fontColor[theme], fontWeight: "bold" }}>{localization.downloadStatusTitle[lang]}</Typography>
            <Typography sx={{fontSize:"20px", color: downloadStatus === "fail" ? "red" : downloadStatus === "requestFail" ? "red" : downloadStatus === "success" ? themeSet.success[theme] : themeSet.fontColor[theme]}} style={{fontWeight: "bold"}}>
              {downloadStatus === "fail" ? localization.downloadStatus.fail[lang] : downloadStatus === "requestFail" ? localization.downloadStatus.requestFail[lang] : downloadStatus === "success" ? localization.downloadStatus.success[lang] : downloadStatus === "downloading" ? localization.downloadStatus.downloading[lang] : localization.downloadStatus.ready[lang]}
            </Typography>
          </div>

          {/* Download Info */}
          <Typography sx={{ mt: 3, fontSize:"15px", maxWidth: "70%" }} style={{ color: themeSet.downloadInfoFontColor[theme] }}>
            {videoUrl === "picker" ? (
              <a href="#" onClick={(e) => {e.preventDefault();setPage(3);}} style={{ cursor: "pointer" }}>
                {downloadStatus === "fail" ? localization.infoTitle.error[lang] : downloadStatus === "requestFail" ? localization.infoTitle.error[lang] : downloadStatus === "success" ? localization.infoTitle.twitterPicker[lang]: localization.infoTitle.download[lang]}
              </a>
            ) : (
              <a href={videoUrl} target="_blank" style={{ pointerEvents: videoUrl ? "auto" : "none" }}>
                {downloadStatus === "fail" ? localization.infoTitle.error[lang] : downloadStatus === "requestFail" ? localization.infoTitle.error[lang] : downloadStatus === "success" ? downloadInfo : localization.infoTitle.download[lang]}
              </a>
            )}
          </Typography>

          {/* Download Button */}
          <Typography className="shadow-md" sx={{mt: 1, ml: 3, mr: 3, fontSize:"20px", color: themeSet.downloadButtonFontColor[theme]}} style={{borderRadius: "16px"}}>
            {videoUrl === "picker" ? (
              <a href="#" onClick={(e) => {e.preventDefault();setPage(3);}} style={{ width: "200px", minHeight: "50px", padding: "5px", borderRadius: "16px", fontWeight: "bold", justifyContent: "center", display: "flex", alignItems: "center", textAlign: "center", overflowWrap: "break-word", cursor: "pointer", backgroundColor: downloadStatus == "success" ? themeSet.success[theme] : downloadStatus == "fail" ? themeSet.fail[theme] : themeSet.fail[theme] }}>
                {downloadStatus === "fail" ? downloadInfo[lang] : downloadStatus === "requestFail" ? downloadInfo[lang] : downloadStatus === "success" ? localization.infoDescription.lookUp[lang] : localization.infoDescription.notDownload[lang]}
              </a>
            ) : (
              <a href={videoUrl} target="_blank" style={{ width: "200px", minHeight: "50px", padding: "5px", borderRadius: "16px", fontWeight: "bold", justifyContent: "center", display: "flex", alignItems: "center", textAlign: "center", overflowWrap: "break-word", pointerEvents: videoUrl ? "auto" : "none", backgroundColor: downloadStatus == "success" ? themeSet.success[theme] : downloadStatus == "fail" ? themeSet.fail[theme] : themeSet.fail[theme] }}>
                {downloadStatus === "fail" ? downloadInfo[lang] : downloadStatus === "requestFail" ? downloadInfo[lang] : downloadStatus === "success" ? localization.infoDescription.download[lang] : localization.infoDescription.notDownload[lang]}
              </a>
            )}
          </Typography>

        </div>

        <div className="absolute top-8 left-0 w-full flex flex-col items-center mt-4">
          <div className={`w-full h-screen absolute duration-500 ${page === 1 ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"}`}>
            <PreferencesPage />
          </div>

          <div className={`w-full h-screen absolute duration-500 ${page === 2 ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"}`}>
            <DownloadHistoryPage />
          </div>

          <div className={`w-full h-screen absolute duration-500 ${page === 3 ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"}`}>
            <TwitterPickerPage picker={twitterPickerData} />
          </div>
        </div>

        {/* Updater */}
        <Dialog open={dialogUpdate} onClose={() => setDialogUpdate(false)} disableScrollLock
          sx={{
            '& .MuiDialog-paper': {
              borderRadius: "16px", 
              backgroundColor: themeSet.updateDialog.backgroundColor[theme],
              color: themeSet.updateDialog.fontColor[theme],
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              width: 'auto',
              maxWidth: '700px',
              height: 'auto',
              padding: '16px',
            },
          }}
        >
          <div className="mx-2 mb-2">
            <DialogTitle
              sx={{
                fontSize: "22px",
                fontWeight: 600,
                color: themeSet.updateDialog.fontColor[theme],
                paddingBottom: 1,
              }}
            >
              {localization.updater.newUpdateTitle[lang]}
            </DialogTitle>
            <DialogContent sx={{ paddingY: 2 }}>
              <Typography
                sx={{
                  fontSize: "20px",
                  fontWeight: 500,
                  color: themeSet.updateDialog.fontColor[theme],
                  marginBottom: "5px",
                }}
              >
                {localization.updater.updateContent[lang]}
              </Typography>
              {/* 分隔線 */}
              <div style={{ height: "3px", backgroundColor: themeSet.updateDialog.fontColor[theme], borderRadius: '5px', marginBottom: "15px"}}></div>
              {/* README 內容 */}
              <div style={{ backgroundColor: themeSet.updateDialog.readmeBackgroundColor[theme], borderRadius: "16px" }} class="readme" className="px-15 py-1 max-h-130 mt-6 overflow-y-auto">  
                <ReactMarkdown
                  components={{
                    h1: ({ node, ...props }) => (
                      <Typography sx={{ fontSize: "34px", color: themeSet.updateDialog.readmeFontColor[theme], mt: 2, mb: 3, borderBottom: "1px solid #CBD5E1" }} {...props} />
                    ),
                    h2: ({ node, ...props }) => (
                      <Typography sx={{ fontSize: "28px", color: themeSet.updateDialog.readmeFontColor[theme], mt: 2, mb: 2, borderBottom: "1px solid #CBD5E1" }} {...props} />
                    ),
                    h3: ({ node, ...props }) => (
                      <Typography sx={{ fontSize: "20px", color: themeSet.updateDialog.readmeFontColor[theme], mt: 1 }} {...props} />
                    ),
                    p: ({ node, ...props }) => (
                      <Typography sx={{ fontSize: "18px", lineHeight: 1.6, color: themeSet.updateDialog.readmeFontColor[theme], mb: 1 }} {...props} />
                    ),
                    strong: ({ node, ...props }) => (
                      <Typography component="span" sx={{ fontWeight: 700, color: themeSet.updateDialog.readmeFontColor[theme] }} {...props} />
                    ),
                    ul: ({ node, ...props }) => (
                      <div component="ul" sx={{ pl: 2, color: themeSet.updateDialog.readmeFontColor[theme] }} {...props} />
                    ),
                    li: ({ node, ...props }) => (
                      <Typography component="li" sx={{ fontSize: "18px", lineHeight: 1.6, mb: 0.5, ml: 3, color: themeSet.updateDialog.readmeFontColor[theme] }} {...props} />
                    ),
                    ol: ({ node, ...props }) => (
                      <Box component="ol" sx={{ ml: 3, color: '#555', listStyleType: 'decimal' }} {...props} />
                    ),
                    code: ({ node, ...props }) => (
                      <div className="bg-[#151B23] p-4 rounded-md">
                        <Typography
                          component="code"
                          sx={{
                            fontFamily: 'monospace',
                            fontSize: "14px",
                            borderRadius: "4px",
                            color: '#F0F6FC',
                          }}
                          {...props}
                        />
                      </div>
                    ),
                  }}
                >
                  {readmeContent}
                </ReactMarkdown>
              </div>
              {progress > 0 && (
                <LinearProgress
                  variant="determinate"
                  value={progress}
                  sx={{ mt: 2, height: 8, borderRadius: 4, backgroundColor: themeSet.updateDialog.progressBar.backgroundColor[theme],
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: themeSet.updateDialog.progressBar.progressColor[theme],
                    }
                  }}
                />
              )}
            </DialogContent>
            <DialogActions sx={{ paddingX: 2 }}>
              <Button
                sx={{ fontSize: "17px", backgroundColor: themeSet.updateDialog.ignoreButtonBackgroundColor[theme], color: 'white', paddingX: "15px" }}
                onClick={() => setDialogUpdate(false)}
              >
                {localization.updater.reminderLater[lang]}
              </Button>
              <Box sx={{ m: 1, position: 'relative' }}>
                <Button
                  variant="contained"
                  sx={{ fontSize: "17px", backgroundColor: themeSet.updateDialog.updateButtonBackgroundColor[theme], color: 'white', paddingX: "15px" }}
                  disabled={loading}
                  onClick={handleUpdateButtonClick}
                >
                  {localization.updater.updateNow[lang]}
                </Button>
                {loading && (
                  <CircularProgress size={24} sx={{ position: 'absolute', top: '50%', left: '50%', marginTop: '-12px', marginLeft: '-12px' }} />
                )}
              </Box>
            </DialogActions>
          </div>
        </Dialog>

        <Snackbar open={openSnackbar} autoHideDuration={2500} onClose={() => setOpenSnackbar(false)}>
          <Alert
            onClose={() => setOpenSnackbar(false)}
            severity={snackberStatus}
            sx={{ width: "100%", maxWidth: "600px", marginBottom: "16px", wordBreak: "break-all" }}
          >
            {message}
          </Alert>
        </Snackbar>
      </div>
  );
}