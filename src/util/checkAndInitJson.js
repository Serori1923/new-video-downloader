import { mkdir, writeTextFile, exists } from "@tauri-apps/plugin-fs";
import { appDataDir } from "@tauri-apps/api/path";

export const checkAndInitJson = async () => {
    const JSON_FILE = "history.json";
    const appDataDirPath = await appDataDir();
    const jsonFilePath = `${appDataDirPath}/${JSON_FILE}`;

    const dirExists = await exists(appDataDirPath);
    if (!dirExists) {
      try {
        await mkdir(appDataDirPath, { recursive: true });
        console.log("資料夾已創建");
      } catch (error) {
        console.error("無法創建資料夾:", error);
        return;
      }
    }
  
    const jsonExists = await exists(jsonFilePath);
    
    if (!jsonExists) {
      try {
        await writeTextFile(jsonFilePath, JSON.stringify([], null, 2));
        console.log("JSON 檔案已初始化");
      } catch (error) {
        console.error("初始化 JSON 失敗:", error);
      }
    }
  };