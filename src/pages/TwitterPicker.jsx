import React from 'react';
import { localizationTwitterPicker } from "../util/localization/localizationTwitterPicker";
import { Typography } from "@mui/material";
import { useLanguage } from "../LanguageContext";
import { useTheme } from '../theme';
import { themeColor } from '../util/themeColor';


export default function TwitterPickerPage( picker ) {
    const { lang } = useLanguage();
    const { theme } = useTheme();
    const themeSet = themeColor.twitterPicker;
    const data = picker.picker;

    return (
        <div className="w-full h-full" style={{ backgroundColor: themeSet.backgroundColor[theme]}}>
            <Typography sx={{ fontSize:"20px", justifyContent: "center", display: "flex", marginBottom: "2%"}}  style={{paddingTop: "2%" , color: themeSet.fontColor[theme], fontWeight: "bold"}}>
                {localizationTwitterPicker.rightClickToDownload[lang]}
            </Typography>

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
                                </div>
                            ) : link.type === "gif" ? (
                                <div style={{ position: "relative", width: "100%", paddingBottom: "56.25%", overflow: "hidden", borderRadius: "10px", backgroundColor: themeSet.imageBackgroundColor[theme] }}>
                                    <img 
                                        src={link.url} 
                                        alt={`Preview ${index}`} 
                                        style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "contain" }}
                                    />
                                </div>
                            ) : null}
                        </div>
                    ))
                ) : null}
            </div>

        </div>
    );
}