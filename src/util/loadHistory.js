import { readTextFile } from "@tauri-apps/plugin-fs";
import { appDataDir } from "@tauri-apps/api/path";
import { checkAndInitJson } from "./checkAndInitJson";

const JSON_FILE = "history.json";
const appDataDirPath = await appDataDir();
const jsonFilePath = `${appDataDirPath}/${JSON_FILE}`;

export const loadHistory = async () => {
    checkAndInitJson();

    try {
      const content = await readTextFile(jsonFilePath);
      return(JSON.parse(content));
    } catch (error) {
      console.error("無法讀取 JSON 檔案:", error);
      return [];
    }
  };