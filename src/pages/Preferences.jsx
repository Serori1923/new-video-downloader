import React, { useEffect, useState } from 'react';
import { Typography, FormControl, InputLabel, Select, MenuItem, TextField } from "@mui/material";
import Switch from '@mui/material/Switch';
import { useLanguage } from "../LanguageContext";
import { localization } from "../util/localization";
import { useAutoDownload } from '../autoDownload';

export default function PreferencesPage() {
    const { lang, changeLanguage } = useLanguage();
    const { auto, changeAutoDownload } = useAutoDownload();
    const [ apiServerURL, setApiServerURL ] = useState(() => {
        return localStorage.getItem("apiServer") || "https://meow.akkkou.com";
    });

    const handleChange = (e) => {
        changeLanguage(e.target.value);
    };

    const handleApiServerChange = (e) => {
        setApiServerURL(e.target.value);
    };

    const handleAutoDownloadChange = (e) => {
        changeAutoDownload(e.target.checked);
    };

    // 更新 localStorage
    useEffect(() => {
        localStorage.setItem("lang", lang);
        localStorage.setItem("autoDownload", auto);
    }, [lang, auto]);

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
                                disablePortal: false,  // 確保選單渲染在 `body` 外，避免 `aria-hidden` 問題
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
                    <TextField
                        variant="outlined"
                        placeholder="Enter Server URL..."
                        label="URL"
                        value={apiServerURL}
                        onChange={(e) => handleApiServerChange(e)}
                        sx={{
                        mt: 2,
                        width: "250px",
                        backgroundColor: "#FDE4DF",
                        }}
                        id="url"
                        disabled
                    />
                </div>
            </div>
            
        </div>
    );
}
