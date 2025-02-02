// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

// use reqwest::header::{HeaderMap, HeaderValue, ACCEPT, CONTENT_TYPE, USER_AGENT};
// use reqwest::Client;
// use serde::{Deserialize, Serialize};

// 定義請求的 JSON 結構
// #[derive(Serialize, Deserialize, Debug, Clone)]
// struct RequestData {
//     url: String,
//     videoQuality: String,
//     filenameStyle: String,
//     downloadMode: String,
//     tiktokFullAudio: bool,
//     tiktokH265: bool,
//     twitterGif: bool,
// }

// 定義 API 回應的結構
// #[derive(Deserialize, Debug)]
// struct ApiResponse {
//     // 根據 API 回傳的 JSON 結構定義
//     status: String,
//     filename: String,
//     url: String,
// }

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

// 使用 async 函數來處理非同步請求
// #[tauri::command]
// async fn download(url: String, option: String) -> Result<String, String> {
//     // 建立要發送的資料
//     let mut requests_data = RequestData {
//         url,
//         videoQuality: "max".to_string(),
//         filenameStyle: "basic".to_string(),
//         downloadMode: option,
//         tiktokFullAudio: false,
//         tiktokH265: true,
//         twitterGif: true,
//     };

//     // 設定 Header
//     let mut headers = HeaderMap::new();
//     headers.insert(
//         USER_AGENT,
//         HeaderValue::from_static("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"),
//     );
//     headers.insert(ACCEPT, HeaderValue::from_static("application/json"));
//     headers.insert(CONTENT_TYPE, HeaderValue::from_static("application/json"));

//     // 設定 API URL
//     let url = "https://meow.akkkou.com/";

//     // 建立 reqwest 客戶端
//     let client = Client::new();

//     // 發送 POST 請求
//     let response = client
//         .post(url)
//         .headers(headers)
//         .json(&requests_data)
//         .send()
//         .await
//         .map_err(|e| e.to_string())?; // **await 解開 Future**

//     if response.status().is_success() {
//         let result: ApiResponse = response.json().await.map_err(|e| e.to_string())?; // **await 解析 JSON**
//         Ok(format!("Success: {}", result.url))
//     } else {
//         Err(format!("Failed: HTTP {}", response.status()))
//     }
// }
