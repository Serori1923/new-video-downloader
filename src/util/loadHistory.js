import { readTextFile } from "@tauri-apps/plugin-fs";
import { appDataDir } from "@tauri-apps/api/path";
import { checkAndInitJson } from "./checkAndInitJson";

export const loadHistory = async () => {
    const JSON_FILE = "history.json";
    const appDataDirPath = await appDataDir();
    const jsonFilePath = `${appDataDirPath}/${JSON_FILE}`;

    checkAndInitJson();

    try {
      const content = await readTextFile(jsonFilePath);
      return(JSON.parse(content));
    } catch (error) {
      console.error("無法讀取 JSON 檔案:", error);
      return [];
    }
  };