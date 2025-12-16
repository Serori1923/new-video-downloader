import React, { useEffect, useState } from 'react';
import { Typography, FormControl, InputLabel, Select, MenuItem, TextField, Button } from "@mui/material";
import Switch from '@mui/material/Switch';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from "@mui/icons-material/Error";
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import { localizationPreference } from "../util/localization/localizationPreference";
import { useLanguage } from "../LanguageContext";
import { useAutoDownload } from '../autoDownload';
import { useServerUrl } from '../serverUrl';
import { useTheme } from '../theme';
import { themeColor } from '../util/themeColor';

export default function PreferencesPage() {
    const { lang, changeLanguage } = useLanguage();
    const { auto, changeAutoDownload } = useAutoDownload();
    const { isLight, theme, changeTheme } = useTheme();
    const { serverUrl, changeServerUrl } = useServerUrl();
    const [ serverStatus, setServerStatus ] = useState("checking");
    const defaultServerUrl = "https://meow.akkkou.com"
    const themeSet = themeColor.preferences;

    const handleChange = (e) => {
        changeLanguage(e.target.value);
    };

    const handleServerChange = (e) => {
        changeServerUrl(e.target.value);
    };

    const handleAutoDownloadChange = (e) => {
        changeAutoDownload(e.target.checked);
    };

    const handleThemeChange = (e) => {
        changeTheme(e.target.checked);
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
        localStorage.setItem("theme", theme);
    
        const intervalId = setInterval(checkServerStatus, 5000);
        return () => clearInterval(intervalId);
    }, [lang, auto, serverUrl, theme]);
    
    return (
        <div className="w-full h-full" style={{ backgroundColor: themeSet.backgroundColor[theme] }}>
            <div className="flex flex-wrap gap-4 justify-center">
                <div className='items-center flex flex-col w-[310px] shadow-[0px_0px_15px_rgba(0,0,0,0.4)] mt-10' style={{ backgroundColor: themeSet.optionBackgroundColor[theme], borderRadius: "16px", padding: "20px", color: themeSet.fontColor[theme] }}>
                    <Typography variant="h5" sx={{ fontWeight:"bold" }}>
                        {localizationPreference.languageSetting[lang]}
                    </Typography>   
                    <FormControl fullWidth sx={{
                        mt: 2,
                        width: "250px",
                        // ===== 外層（整體圓角 + 背景）=====
                        '& .MuiOutlinedInput-root': {
                            borderRadius: '50px',
                            backgroundColor: themeSet.formControl.backGroundColor[theme],
                        },

                        // ===== 外框顏色 =====
                        '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: themeSet.formControl.borderColor[theme],
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: themeSet.formControl.borderColorHover[theme],
                        },
                        '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: themeSet.formControl.borderColorFocus[theme],
                        },

                        // ===== Select 文字顏色 =====
                        '& .MuiSelect-select': {
                            color: themeSet.formControl.select.fontColor[theme],
                            paddingLeft: '16px',
                        },

                        // ===== Label 顏色 =====
                        '& .MuiInputLabel-root': {
                            color: themeSet.formControl.languageLabelFontColor[theme],
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                            color: themeSet.formControl.languageLabelFontColorFocus[theme],
                        },

                        // ===== 下拉箭頭顏色 =====
                        '& .MuiSelect-icon': {
                            color: themeSet.formControl.arrow[theme],
                        }
                        }}
                    >
                        <InputLabel id="language-select-label">{localizationPreference.language[lang]}</InputLabel>
                        <Select
                            labelId="language-select-label"
                            id="language-select"
                            value={lang}
                            label={localizationPreference.language[lang]}
                            onChange={handleChange}
                            MenuProps={{
                                disableScrollLock: true,
                                disablePortal: false,
                                PaperProps: {
                                    sx: {
                                        backgroundColor: themeSet.formControl.select.backgroundColor[theme],
                                        '& .MuiMenuItem-root': {
                                            color: themeSet.formControl.select.fontColor[theme]
                                        },
                                        '& .MuiMenuItem-root.Mui-selected': {
                                            backgroundColor: themeSet.formControl.select.selectedBackgroundColor[theme],
                                            color: themeSet.formControl.select.selectedFontColor[theme],
                                        },
                                        '& .MuiMenuItem-root:hover': {
                                            backgroundColor: themeSet.formControl.select.backgroundColorHover[theme]
                                        },
                                    }
                                }                          
                            }}
                            >
                            <MenuItem value="zh-TW">繁體中文</MenuItem>
                            <MenuItem value="en-US">English</MenuItem>
                            <MenuItem value="ja-JP">日本語</MenuItem>
                            <MenuItem value="ko-KR">한국어</MenuItem>
                            <MenuItem value="tr-TR">Türkçe</MenuItem>
                        </Select>
                    </FormControl>
                </div>

                <div className='items-center flex flex-col w-[310px] shadow-[0px_0px_15px_rgba(0,0,0,0.4)] mt-10' style={{backgroundColor: themeSet.optionBackgroundColor[theme], borderRadius: "16px", padding: "20px", color: themeSet.fontColor[theme] }}>
                    <Typography variant="h5" sx={{ fontWeight:"bold"}}>
                        {localizationPreference.apiServerURL[lang]}
                    </Typography>
                    <div className='flex items-center ml-2'>
                        <TextField
                            variant="outlined"
                            placeholder="Enter Server URL..."
                            label="URL"
                            value={serverUrl}
                            onChange={(e) => handleServerChange(e)}
                            sx={{
                                mt: 2,
                                width: "250px",
                                backgroundColor: themeSet.textField.backGroundColor[theme],
                                // 外框圓角
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '50px'
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
                        />
                        {serverStatus === "online" ? 
                            (<CheckCircleIcon sx={{ color: "green", mt: 2, ml: 1 }} />) : (<ErrorIcon sx={{ color: "red", mt: 2, ml: 1 }} />)
                        }
                    </div>
                    <Button onClick={(e) => changeServerUrl(defaultServerUrl)} sx={{ display: serverUrl == defaultServerUrl ? "none" : "block"}} style={{ color: themeSet.resetButton[theme] }}>{localizationPreference.resetServerURL[lang]}</Button>
                </div> 
            </div>
            
            <div className="flex flex-wrap gap-4 justify-center mt-15">
                <div className='items-center flex flex-col w-[310px] shadow-[0px_0px_15px_rgba(0,0,0,0.4)]' style={{backgroundColor: themeSet.optionBackgroundColor[theme], borderRadius: "16px", padding: "20px", color: themeSet.fontColor[theme] }}>
                    <Typography variant="h5" sx={{ fontWeight:"bold"}}>
                        {localizationPreference.autoDownload[lang]}
                    </Typography>
                    <Switch checked={auto} onChange={(e) => handleAutoDownloadChange(e)}
                        sx={{
                            '& .MuiSwitch-switchBase.Mui-checked': {
                                color: themeSet.switch.checkedThumbColor[theme] // thumb 顏色
                            },
                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                backgroundColor: themeSet.switch.checkedTrackColor[theme],
                                opacity: 1,
                            }
                        }}
                    />
                </div>

                <div className='items-center flex flex-col w-[310px] shadow-[0px_0px_15px_rgba(0,0,0,0.4)]' style={{backgroundColor: themeSet.optionBackgroundColor[theme], borderRadius: "16px", padding: "20px", color: themeSet.fontColor[theme] }}>
                    <Typography variant="h5" sx={{ fontWeight:"bold" }}>
                        {localizationPreference.changeTheme[lang]}
                    </Typography>
                    <div className='flex'>
                        <DarkModeIcon sx={{ mt: 1, mr: 1, color: themeSet.darkModeIconColor[theme] }} />
                        <Switch checked={isLight} onChange={(e) => handleThemeChange(e)}
                            sx={{
                                '& .MuiSwitch-switchBase.Mui-checked': {
                                    color: themeSet.switch.checkedThumbColor[theme] // thumb 顏色
                                },
                                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                    backgroundColor: themeSet.switch.checkedTrackColor[theme],
                                    opacity: 1,
                                }
                            }}
                        />
                        <LightModeIcon sx={{ mt: 1, ml: 1, color: themeSet.lightModeIconColor[theme] }} />
                    </div>
                </div>
            </div>
        </div>
    );
}
