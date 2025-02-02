import { writeTextFile } from "@tauri-apps/plugin-fs";
import { appDataDir } from "@tauri-apps/api/path";
import { loadHistory } from "./loadHistory";
import { checkAndInitJson } from "./checkAndInitJson";

const JSON_FILE = "history.json";
const appDataDirPath = await appDataDir();
const jsonFilePath = `${appDataDirPath}/${JSON_FILE}`;

export const saveNewHistory = async (name, url) => {
    const newVideo = {
        downloadDate: new Date().toISOString().split("T")[0],
        fileName: name,
        originalURL: url,
    };
  
    try {
        checkAndInitJson();
        let videoHistory = await loadHistory();
        videoHistory.push(newVideo);

        await writeTextFile(jsonFilePath, JSON.stringify(videoHistory, null, 2));
        console.log("影片紀錄已儲存");
    } catch (error) {
        console.error("寫入 JSON 檔案失敗:", error);
    }
};