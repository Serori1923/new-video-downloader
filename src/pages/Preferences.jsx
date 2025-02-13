import React, { useEffect, useState } from 'react';
import { Typography, FormControl, InputLabel, Select, MenuItem, TextField, Button } from "@mui/material";
import Switch from '@mui/material/Switch';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from "@mui/icons-material/Error";
import { localization } from "../util/localization";
import { useLanguage } from "../LanguageContext";
import { useAutoDownload } from '../autoDownload';
import { useServerUrl } from '../serverUrl';

export default function PreferencesPage() {
    const { lang, changeLanguage } = useLanguage();
    const { auto, changeAutoDownload } = useAutoDownload();
    const { serverUrl, changeServerUrl } = useServerUrl();
    const [ serverStatus, setServerStatus ] = useState("checking");
    const defaultServerUrl = "https://meow.akkkou.com/"

    const handleChange = (e) => {
        changeLanguage(e.target.value);
    };

    const handleServerChange = (e) => {
        changeServerUrl(e.target.value);
    };

    const handleAutoDownloadChange = (e) => {
        changeAutoDownload(e.target.checked);
    };

    const checkServerStatus = async () => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);
        
        try {
            const response = await fetch(serverUrl, { 
                method: "HEAD", 
                signal: controller.signal
            });

            if (response.ok) {
                setServerStatus("online");
            } else {
                setServerStatus("offline");
            }
        } catch (error) {
            setServerStatus("offline");
        } finally {
            clearTimeout(timeoutId);
        }
    };

    useEffect(() => {
        localStorage.setItem("lang", lang);
        localStorage.setItem("autoDownload", auto);
        localStorage.setItem("serverUrl", serverUrl);
    
        const intervalId = setInterval(checkServerStatus, 5000);
        return () => clearInterval(intervalId);
    }, [lang, auto, serverUrl]);
    
    return (
        <div className="w-full h-full flex flex-col items-center bg-green-100">
            <div className='flex gap-20'>
                <div className='w-60 items-center flex flex-col'>
                    <Typography variant="h5" sx={{ mt: 3, color: "#7E9F98" }}>
                        {localization.preference_menu.languageSetting[lang]}
                    </Typography>
                    <FormControl fullWidth sx={{ mt: 2, width: "250px"}}>
                        <InputLabel id="language-select-label">Language</InputLabel>
                        <Select
                            labelId="language-select-label"
                            id="language-select"
                            value={lang}
                            label="Language"
                            onChange={handleChange}
                            MenuProps={{
                                disableScrollLock: true,
                                disablePortal: false
                            }}
                            >
                            <MenuItem value="zh-TW">繁體中文</MenuItem>
                            <MenuItem value="en-US">English</MenuItem>
                            <MenuItem value="ja-JP">日本語</MenuItem>
                            <MenuItem value="ko-KR">한국어</MenuItem>
                            <MenuItem value="tr-TR">Türkçe</MenuItem>
                        </Select>
                    </FormControl>
                    
                    <Typography variant="h5" sx={{ mt: 7, color: "#7E9F98" }}>
                        {localization.preference_menu.autoDownload[lang]}
                    </Typography>
                    <Switch checked={auto} onChange={(e) => handleAutoDownloadChange(e)}/>
                </div>
                <div className='w-60 items-center flex flex-col'>
                    <Typography variant="h5" sx={{ mt: 3, color: "#7E9F98" }}>
                        {localization.preference_menu.apiServerURL[lang]}
                    </Typography>
                    <div className='flex items-center ml-7'>
                        <TextField
                            variant="outlined"
                            placeholder="Enter Server URL..."
                            label="URL"
                            value={serverUrl}
                            onChange={(e) => handleServerChange(e)}
                            sx={{
                                mt: 2,
                                width: "250px",
                                backgroundColor: "#FDE4DF"
                            }}
                        />
                        {serverStatus === "online" ? 
                            (<CheckCircleIcon sx={{ color: "green", mt: 2, ml: 1 }} />) : (<ErrorIcon sx={{ color: "red", mt: 2, ml: 1 }} />)
                        }
                    </div>
                    <Button onClick={(e) => changeServerUrl(defaultServerUrl)} sx={{ display: serverUrl == defaultServerUrl ? "none" : "block"}}>{localization.preference_menu.resetServerURL[lang]}</Button>
                </div>
            </div>
        </div>
    );
}
