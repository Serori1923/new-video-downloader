import { image, menu } from "@tauri-apps/api";

export const themeColor = {
    home: {
        menu: {
            backgroundColor: { "light": "#81001B", "dark": "#101720" },
            fontColor: { "light": "white", "dark": "#EEEEEE" },
            selectedBackgroundColor: { "light": "#FFFDF0", "dark": "#15202B" },
            selectedFontColor: { "light": "#81001B", "dark": "#EEEEEE" },
        },
        backgroundColor: { "light": "#FFFDF0", "dark": "#15202B" },
        fontColor: { "light": "#81001B", "dark": "#EEEEEE" },
        textField: {
            backGroundColor: {"light": "#F8EFEE" , "dark": "#57687A"},
            borderColor: {"light": "#81001B" , "dark": "#57687A"},
            borderColorHover: {"light": "#5A5058" , "dark": "#57687A"},
            borderColorFocus: {"light": "#5A5058" , "dark": "white"},
            inputFontColor: { "light": "black", "dark": "white" },
            placeholderFontColor: { "light": "#5A5058", "dark": "#15202B" },
            urlLabelFontColor: { "light": "#81001B", "dark": "white" },
            urlLabelFontColorFocus: { "light": "#5A5058", "dark": "white" }
        },
        searchButton: { "light": "black", "dark": "white" },
        buttonBackgroundColor: { "light": "#5A5058", "dark": "#222F41" },
        buttonSelectedBackgroundColor: { "light": "#41313e", "dark": "#57687A" },
        success: { "light": "#93e374", "dark": "#76BE5B" },
        fail: { "light": "#B0B0B0", "dark": "#55606A" },
        downloadInfoFontColor: { "light": "#A8A8A8", "dark": "#A8A8A8" },
        downloadButtonFontColor: { "light": "white", "dark": "#EEEEEE" },
        updateDialog: {
            backgroundColor: { "light": "#FFFDF0", "dark": "#15202B" },
            fontColor: { "light": "#81001B", "dark": "#EEEEEE" },
            line: { "light": "#F4F4F4", "dark": "#EEEEEE" },
            readmeBackgroundColor: { "light": "#F0F6FC", "dark": "#222F41"},
            readmeFontColor: { "light": "#81001B", "dark": "white"},
            ignoreButtonBackgroundColor: { "light": "#5A5058", "dark": "#222F41" },
            updateButtonBackgroundColor: { "light": "#41313e", "dark": "#57687A" }
        }
    },
    preferences: {
        backgroundColor: { "light": "#FFFDF0", "dark": "#15202B" },
        fontColor: { "light": "#81001B", "dark": "#EEEEEE" },
        optionBackgroundColor: {"light": "#F4F4F4", "dark": "#222F41" },
        formControl: {
            backGroundColor: {"light": "#F8EFEE" , "dark": "#57687A"},
            borderColor: {"light": "#81001B" , "dark": "#57687A"},
            borderColorHover: {"light": "#5A5058" , "dark": "#57687A"},
            borderColorFocus: {"light": "#5A5058" , "dark": "white"},
            languageLabelFontColor: { "light": "#81001B", "dark": "white" },
            languageLabelFontColorFocus: { "light": "#5A5058", "dark": "white" },
            arrow: { "light": "#81001B", "dark": "white" },
            select : {
                backgroundColor: { "light": "white", "dark": "#15202B" },
                backgroundColorHover: { "light": "#E6F4F1", "dark": "#222F41" },
                selectedBackgroundColor: { "light": "#DDD2D5", "dark": "#101720" },
                fontColor: { "light": "black", "dark": "white" },
                selectedFontColor: { "light": "#81001B", "dark": "#EEEEEE"}
            }
        },
        textField: {
            backGroundColor: {"light": "#F8EFEE" , "dark": "#57687A"},
            borderColor: {"light": "#81001B" , "dark": "#57687A"},
            borderColorHover: {"light": "#5A5058" , "dark": "#57687A"},
            borderColorFocus: {"light": "#5A5058" , "dark": "white"},
            inputFontColor: { "light": "black", "dark": "#EEEEEE" },
            placeholderFontColor: { "light": "#5A5058", "dark": "#15202B" },
            urlLabelFontColor: { "light": "#81001B", "dark": "white" },
            urlLabelFontColorFocus: { "light": "#5A5058", "dark": "white" }
        },
        switch: {
            trackColor: { "light": "#B0B0B0", "dark": "#55606A" },
            thumbColor: { "light": "white", "dark": "white" },
            checkedTrackColor: { "light": "#B0B0B0", "dark": "#EEEEEE" },
            checkedThumbColor: { "light": "#81001B", "dark": "#57687A" }
        },
        resetButton: { "light": "#878ac9", "dark": "#878ac9" },
        darkModeIconColor: { "light": "#787878", "dark": "#878ac9" },
        lightModeIconColor: { "light": "#ffd863", "dark": "#787878" }
    },
    downloadHistory: {
        backgroundColor: { "light": "#FFFDF0", "dark": "#15202B" },
        fontColor: { "light": "#81001B", "dark": "#EEEEEE" },
        trashIconColor: { "light": "#5A5058", "dark": "#EEEEEE" },
        refreshIconColor: { "light": "#5A5058", "dark": "#EEEEEE" },
        tableHeaderBackgroundColor: { "light": "#81001B", "dark": "#101720" },
        tableHeaderFontColor: { "light": "white", "dark": "#EEEEEE" },
        tableBodyBackgroundColor: { "light": "white", "dark": "#222F41" },
        tableBodyFontColor: { "light": "#81001B", "dark": "#EEEEEE" },
        dialog: {
            backgroundColor: { "light": "white", "dark": "#15202B" },
            fontColor: { "light": "#81001B", "dark": "#EEEEEE" },
            
        },
        snackbar: {
            backgroundColor: { "light": "white", "dark": "#15202B" },
            fontColor: { "light": "#81001B", "dark": "#EEEEEE" },

        }
    },
    twitterPicker: {
        backgroundColor: { "light": "#FFFDF0", "dark": "#15202B" },
        fontColor: { "light": "#81001B", "dark": "#EEEEEE" },
        imageBackgroundColor: { "light": "#212427", "dark": "#101720" }
    }
};

// #81001B -- dark red
// #FFFDF0 -- off white
// #Smoky Black -- #101720
// #Oxford Blue -- #212A37
// #Dark Gray -- #212427
// #Jet -- #2A2A2A