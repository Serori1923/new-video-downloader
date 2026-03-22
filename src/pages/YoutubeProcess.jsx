import React from "react";
import { localizationYoutubeProcess } from "../util/localization/localizationYoutubeProcess";
import { Box } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import { useLanguage } from "../LanguageContext";
import { useTheme } from "../theme";
import { themeColor } from "../util/themeColor";

export default function YoutubeProcess( tasks ) {
    const { lang } = useLanguage();
    const { theme } = useTheme();
    const themeSet = themeColor.youtubeProcess;
    const data = tasks.tasks;

    return (
        <div className="w-full h-full" style={{ display: "flex", justifyContent: "center", backgroundColor: themeSet.backgroundColor[theme] }}>
            <Box sx={{
                marginTop: "40px",
                width: "90%",
                height: "75%",
                paddingRight: "15px",
                overflow: "auto",
                "&::-webkit-scrollbar": {
                    height: "100%"
                },
                "&::-webkit-scrollbar-track": {
                    backgroundColor: themeSet.scrollbar.trackBackgroundColor[theme],
                    borderRadius: "10px",
                    paddingTop: "15px"
                },
                "&::-webkit-scrollbar-thumb": {
                    backgroundColor: themeSet.scrollbar.thumbBackgroundColor[theme],
                    borderRadius: "10px"
                }
            }}>
                {data.map(task => (
                    <div key={task.id} 
                        style={{
                            width: "100%",
                            padding: "16px", 
                            marginBottom: "16px", 
                            borderRadius: "16px",
                            backgroundColor: themeSet.processBackgroundColor[theme]
                        }}
                    >
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                            {/* Filename */}
                            <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "70%", color: themeSet.fontColor[theme], fontWeight: "bold" }}>
                                {task.filename ? (
                                    task.filename == "preparing" ? (
                                        localizationYoutubeProcess.status.preparing[lang]
                                    ) : task.filename == "notSupportLiveStream" ? (
                                        localizationYoutubeProcess.notSupportLiveStream[lang]
                                    ) : task.filename
                                ) : task.status == "error" ? localizationYoutubeProcess.status.error[lang] : task.url}
                            </div>
                            {/* Status */}
                            <div style={{ color: themeSet.fontColor[theme], fontWeight: "bold" }}>
                                { task.status === "complete" ? (
                                    <CheckCircleIcon sx={{ color: themeSet.success[theme] }}></CheckCircleIcon>
                                ) : task.status === "error" ? (
                                    <ErrorIcon sx={{ color: "red" }}></ErrorIcon>
                                ) : localizationYoutubeProcess.status[task.status][lang]
                            }
                            </div>
                        </div>
                    
                        {/* progress */}
                        <div style={{ width: "100%", height: "10px", backgroundColor: themeSet.progressBar.backgroundColor[theme], borderRadius: "5px", overflow: "hidden" }}>
                            <div style={{ 
                                display : task.status != "error" ? "block" : "none",
                                width: `${task.progress}%`,
                                height: "100%", 
                                backgroundColor: task.status === "complete" ? themeSet.success[theme] : themeSet.progressBar.progressColor[theme],
                                transition: "width 0.3s ease" 
                            }} />
                        </div>
                        <div style={{ color: themeSet.fontColor[theme], textAlign: "right", fontSize: "0.8em", fontWeight: "bold", marginTop: "2px" }}>
                            {task.progress.toFixed(1)}%
                        </div>
                    </div>
                ))}
            </Box>
        </div>
    );
}