import React, { useState } from "react";
import { writeFile, BaseDirectory } from '@tauri-apps/plugin-fs';
import { localizationTwitterPicker } from "../util/localization/localizationTwitterPicker";
import { Typography } from "@mui/material";
import { useLanguage } from "../LanguageContext";
import { useTheme } from '../theme';
import { themeColor } from '../util/themeColor';
import { Snackbar, Alert } from "@mui/material";


export default function TwitterPickerPage( picker ) {
    const { lang } = useLanguage();
    const { theme } = useTheme();
    const themeSet = themeColor.twitterPicker;
    const [message, setMessage] = useState("");
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackberStatus, setSnackberStatus] = useState("");
    const data = picker.picker;

    const handleDownloadMedia = async (url, mediaType) => {

        setMessage(localizationTwitterPicker.downloading[lang]);
        setSnackberStatus("info");
        setOpenSnackbar(true);
        try {
            let filename = "";
            const urlObj = new URL(url);
            const pathLastPart = urlObj.pathname.split('/').pop();

            if (pathLastPart.includes('.')) {
                filename = pathLastPart;
            } else {
                let ext = "jpg";
                if (mediaType === "video") ext = "mp4";
                else if (mediaType === "gif") ext = "gif";
                else if (mediaType === "photo") ext = "jpg";

                filename = `twitter_${Date.now()}.${ext}`;
            }

            const response = await fetch(url);
            if (!response.ok) throw new Error("Network response was not ok");
            
            const blob = await response.blob();
            const arrayBuffer = await blob.arrayBuffer();
            const uint8Array = new Uint8Array(arrayBuffer);

            await writeFile(filename, uint8Array, { baseDir: BaseDirectory.Download });
            
            setMessage(`${localizationTwitterPicker.downloadSuccess[lang]}: ${filename}`);
            setSnackberStatus("success");
            setOpenSnackbar(true);
            
        } catch (error) {
            console.error("Download Error:", error);
            setMessage(localizationTwitterPicker.downloadFail[lang]);
            setSnackberStatus("error");
            setOpenSnackbar(true);
        }
    };

    return (
        <div className="w-full h-full" style={{ backgroundColor: themeSet.backgroundColor[theme]}}>
            <div style={{height: "10%"}}></div>

            <div className='flex flex-wrap gap-4 justify-center gallery'>
                {data && data.length > 0 ? (
                    data.map((link, index) => (
                        <div key={index} className="flex justify-center w-1/3 big">
                            {link.type === "photo" ? (
                                <div style={{ position: "relative", width: "100%", paddingBottom: "56.25%", overflow: "hidden", borderRadius: "10px", backgroundColor: themeSet.imageBackgroundColor[theme] }}>
                                    <img 
                                        src={link.url} 
                                        alt={`Preview ${index}`} 
                                        style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "contain" }}
                                    />

                                    <button
                                        onClick={() => handleDownloadMedia(link.url, link.type)}
                                        style={{
                                            position: "absolute",
                                            bottom: "10px",
                                            right: "10px",
                                            backgroundColor: "rgba(0, 0, 0, 0.6)",
                                            color: "white",
                                            padding: "8px 16px",
                                            borderRadius: "8px",
                                            border: "none",
                                            cursor: "pointer",
                                            fontWeight: "bold",
                                            backdropFilter: "blur(4px)"
                                        }}
                                    >
                                        {localizationTwitterPicker.downloadImage[lang]}
                                    </button>
                                </div>
                            ) : link.type === "video" ? (
                                <div style={{ position: "relative", width: "100%", paddingBottom: "56.25%", overflow: "hidden", borderRadius: "10px", backgroundColor: themeSet.imageBackgroundColor[theme] }}>
                                    <video 
                                        src={link.url} 
                                        loop 
                                        muted 
                                        autoPlay 
                                        style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "contain" }}
                                    />

                                    <button
                                        onClick={() => handleDownloadMedia(link.url, link.type)}
                                        style={{
                                            position: "absolute",
                                            bottom: "10px",
                                            right: "10px",
                                            backgroundColor: "rgba(0, 0, 0, 0.6)",
                                            color: "white",
                                            padding: "8px 16px",
                                            borderRadius: "8px",
                                            border: "none",
                                            cursor: "pointer",
                                            fontWeight: "bold",
                                            backdropFilter: "blur(4px)"
                                        }}
                                    >
                                        {localizationTwitterPicker.downloadVideo[lang]}
                                    </button>
                                </div>
                            ) : link.type === "gif" ? (
                                <div style={{ position: "relative", width: "100%", paddingBottom: "56.25%", overflow: "hidden", borderRadius: "10px", backgroundColor: themeSet.imageBackgroundColor[theme] }}>
                                    <img 
                                        src={link.url} 
                                        alt={`Preview ${index}`} 
                                        style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "contain" }}
                                    />

                                    <button
                                        onClick={() => handleDownloadMedia(link.url, link.type)}
                                        style={{
                                            position: "absolute",
                                            bottom: "10px",
                                            right: "10px",
                                            backgroundColor: "rgba(0, 0, 0, 0.6)",
                                            color: "white",
                                            padding: "8px 16px",
                                            borderRadius: "8px",
                                            border: "none",
                                            cursor: "pointer",
                                            fontWeight: "bold",
                                            backdropFilter: "blur(4px)"
                                        }}
                                    >
                                        {localizationTwitterPicker.downloadGIF[lang]}
                                    </button>
                                </div>
                            ) : null}
                        </div>
                    ))
                ) : null}
            </div>

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