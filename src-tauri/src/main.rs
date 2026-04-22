// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::fs;
use std::io::Cursor;
use std::process::Stdio;
use std::path::Path; // 用來處理路徑轉檔名
use std::process::Command;
use std::os::windows::process::CommandExt;
use tauri::{AppHandle, Emitter, Manager};
use tauri::path::BaseDirectory;
use serde_json::Value;
use tokio::io::{BufReader, AsyncBufReadExt};
use regex::Regex;

// 定義常數
const FFMPEG_FILENAME: &str = "ffmpeg.exe";
const YT_DLP_FILENAME: &str = "yt-dlp.exe";
const YT_DLP_API_URL: &str = "https://api.github.com/repos/yt-dlp/yt-dlp-nightly-builds/releases/latest";
const YT_DLP_DOWNLOAD_URL: &str = "https://github.com/yt-dlp/yt-dlp-nightly-builds/releases/latest/download/yt-dlp.exe";
const CREATE_NO_WINDOW: u32 = 0x08000000;

// 定義事件 Payload
#[derive(Clone, serde::Serialize)]
struct Payload {
    id: String,
    progress: f64,      // 進度百分比 (0.0 ~ 100.0)
    filename: String,   // 檔案名稱
    status: String,     // 目前狀態文字
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_process::init())
        .setup(|app| {
            let app_handle = app.handle().clone();
            
            // 初始化與更新
            tauri::async_runtime::spawn_blocking(move || {
                match init_and_update_ytdlp(&app_handle) {
                    Ok(_) => {
                        println!("yt-dlp 初始化與更新完成");
                        let _ = app_handle.emit("ytdlp-status", "ready");
                    },
                    Err(e) => {
                        eprintln!("yt-dlp 更新失敗: {}", e);
                        let _ = app_handle.emit("ytdlp-status", "error");
                    }
                }
            });
            Ok(())
        })
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![download_video])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

// 核心邏輯：初始化與更新
fn init_and_update_ytdlp(app: &AppHandle) -> Result<(), Box<dyn std::error::Error>> {
    let app_data_dir = app.path().app_local_data_dir()?;
    let bin_dir = app_data_dir.join("bin");
    if !bin_dir.exists() { fs::create_dir_all(&bin_dir)?; }

    let ytdlp_target = bin_dir.join(YT_DLP_FILENAME);

    // 初始化 ytdlp，如果檔案不存在，從 Resource 複製 (初始化)
    if !ytdlp_target.exists() {
        println!("正在初始化 yt-dlp...");
        let res_path = app.path().resolve("binaries/yt-dlp-x86_64-pc-windows-msvc.exe", BaseDirectory::Resource)?;
        fs::copy(res_path, &ytdlp_target)?;
    }
    
    // --- 初始化 ffmpeg ---
    let ffmpeg_target = bin_dir.join(FFMPEG_FILENAME);
    if !ffmpeg_target.exists() {
        println!("正在初始化 ffmpeg...");
        let res_path = app.path().resolve("binaries/ffmpeg-x86_64-pc-windows-msvc.exe", BaseDirectory::Resource)?;
        fs::copy(res_path, &ffmpeg_target)?;
    }

    // --- 版本偵測與自動更新邏輯 ---
    println!("正在檢查 yt-dlp 更新...");

    // 取得本機版本
    // 執行 yt-dlp.exe --version
    let local_version = match Command::new(&ytdlp_target)
    .arg("--version")
    .creation_flags(CREATE_NO_WINDOW)
    .output()
    {
        Ok(output) => String::from_utf8_lossy(&output.stdout).trim().to_string(),
        Err(_) => String::new(),
    };
    
    println!("本機版本: {}", local_version);

    // 透過 GitHub API 取得遠端版本
    let client = reqwest::blocking::Client::new();
    let api_response = client.get(YT_DLP_API_URL)
        .header("User-Agent", "Video-Downloader") 
        .send();

    match api_response {
        Ok(resp) => {
            if resp.status().is_success() {
                let json: Value = resp.json()?;
                if let Some(remote_version) = json["tag_name"].as_str() {
                    println!("遠端最新版本: {}", remote_version);

                    // 比對版本
                    if local_version != remote_version {
                        println!("發現新版本，開始下載...");
                        
                        // 下載邏輯
                        let download_resp = client.get(YT_DLP_DOWNLOAD_URL).send()?;
                        if download_resp.status().is_success() {
                            let bytes = download_resp.bytes()?;
                            let mut file = fs::File::create(&ytdlp_target)?;
                            let mut content = Cursor::new(bytes);
                            std::io::copy(&mut content, &mut file)?;
                            
                            println!("yt-dlp 更新成功！新版本: {}", remote_version);
                        } else {
                            println!("下載失敗，狀態碼: {}", download_resp.status());
                        }
                    } else {
                        println!("目前已是最新版本，無需更新。");
                    }
                }
            } else {
                println!("無法取得 GitHub 版本資訊: {}", resp.status());
            }
        },
        Err(e) => {
            println!("檢查更新時發生網路錯誤: {}", e);
        }
    }

    Ok(())
}

#[tauri::command]
async fn download_video(app_handle: AppHandle, id: String, url: String, mode: String) -> Result<(), String> {
    let app_data_dir = app_handle.path().app_local_data_dir().map_err(|e| e.to_string())?;
    let bin_dir = app_data_dir.join("bin");
    let cache_dir = app_data_dir.join("cache");
    
    // 確保 cache 存在
    if !cache_dir.exists() {
        let _ = fs::create_dir_all(&cache_dir);
    }

    let yt_dlp_path = bin_dir.join(YT_DLP_FILENAME);
    let ffmpeg_path = bin_dir.join(FFMPEG_FILENAME);
    let download_path = app_handle.path().download_dir().map_err(|e| e.to_string())?;
    
    let ffmpeg_path_string = ffmpeg_path.to_string_lossy().to_string();
    let download_path_string = download_path.to_string_lossy().to_string();
    let cache_path_string = cache_dir.to_string_lossy().to_string();
    let yt_dlp_path_string = yt_dlp_path.to_string_lossy().to_string();

    // 檢查檔案是否存在
    if !yt_dlp_path.exists() {
        return Err(format!("找不到 yt-dlp: {}", yt_dlp_path_string));
    }
    if !ffmpeg_path.exists() {
        println!("警告: 找不到 ffmpeg: {}", ffmpeg_path_string);
    }

    tauri::async_runtime::spawn(async move {
        let mut args = vec![
            "-P", &download_path_string,
            &url,
            "--newline",
            "--no-colors",
            "--verbose",
            "--progress",
            "--encoding", "utf-8",
            "--no-playlist",
            "--ffmpeg-location", &ffmpeg_path_string,
            "--cache-dir", &cache_path_string,
            "--no-check-certificates",
            "--match-filter", "!is_live"
        ];

        match mode.as_str() {
            "audio" => {
                // 設定檔名
                args.push("-o");
                args.push("%(title)s (Audio).%(ext)s");
                
                // 設定檔案格式
                args.push("-x");
                args.push("--audio-format");
                args.push("mp3");
                args.push("--audio-quality");
                args.push("0");
            },
            "mute" => {
                // 設定檔名
                args.push("-o");
                args.push("%(title)s (Video Only).%(ext)s");
                
                // 設定檔案格式
                args.push("-f");
                args.push("bestvideo");
                args.push("--merge-output-format");
                args.push("mp4");
            },
            _ => {
                // 設定檔名
                args.push("-o");
                args.push("%(title)s.%(ext)s");

                // 設定檔案格式
                args.push("--merge-output-format");
                args.push("mp4");
                args.push("--postprocessor-args");
                args.push("Merger+ffmpeg:-c:v copy -c:a aac");
            }
        }

        let mut child = tokio::process::Command::new(yt_dlp_path_string)
            .args(&args)
            .env("PYTHONUNBUFFERED", "1")
            .creation_flags(CREATE_NO_WINDOW)
            .stdout(Stdio::piped())
            .stderr(Stdio::piped()) 
            .spawn()
            .expect("failed to spawn yt-dlp");

        let progress_regex = Regex::new(r"(\d+\.?\d*)%").unwrap();
        let live_keyword_regex = Regex::new(r"is currently being live streamed|live event").unwrap();

        // 抓取檔名 (合併時): [Merger] Merging formats into "檔名.mp4"
        let merge_regex = Regex::new(r#"Merging formats into "(.*?)""#).unwrap();

        // 抓取檔名 (直接下載時): [download] Destination: 檔名.mp4
        let download_dest_regex = Regex::new(r"Destination: (.*)$").unwrap();

        let already_downloaded_regex = Regex::new(r"\[download\] (.*) has already been downloaded").unwrap();

        let stdout = child.stdout.take().unwrap();
        let stdout_reader = BufReader::new(stdout).lines();
        
        // Stderr 處理
        let stderr = child.stderr.take().unwrap();
        let stderr_reader = BufReader::new(stderr).lines();
        tauri::async_runtime::spawn(async move {
            let mut reader = stderr_reader;
            while let Ok(Some(line)) = reader.next_line().await {
                println!("YT-DLP Error: {}", line);
            }
        });

        // 用來判斷是下載一部影片的第幾個檔案
        let mut download_part_count = 0; 
        let mut reader = stdout_reader;
        let mut current_filename = String::new();
        let mut current_progress = 0.0;
        let mut has_valid_content = false;
        let mut aborted_due_to_live = false;

        loop {
            match reader.next_line().await {
                Ok(Some(line)) => {
                    println!("YT-DLP Output: {}", line); 

                    if live_keyword_regex.is_match(&line) || line.contains("does not pass filter (!is_live)"){
                        println!("偵測到直播影片，正在終止下載...");
                        
                        // 1. 強制殺死 yt-dlp 程序
                        let _ = child.start_kill(); 
                        
                        // 2. 設定標記
                        aborted_due_to_live = true;

                        // 3. 發送錯誤事件給前端
                        let _ = app_handle.emit("download-complete", Payload { 
                            id: id.clone(), 
                            progress: 0.0,
                            filename: "notSupportLiveStream".to_string(), 
                            status: "error".into() 
                        });

                        // 4. 跳出迴圈
                        break;
                    }

                    let mut status_text = "processing".to_string();
                    let mut calculated_progress = 0.0; // 用來計算調整後的進度
                    
                    if line.contains("has already been downloaded") {
                        if let Some(caps) = already_downloaded_regex.captures(&line) {
                            let full_path = &caps[1];
                            has_valid_content = true;
                            
                            // 利用 Path 工具從完整路徑中提取檔名
                            if let Some(name) = Path::new(full_path).file_name() {
                                current_filename = name.to_string_lossy().to_string();
                            } else {
                                current_filename = full_path.to_string();
                            }
                            
                            status_text = "fileIsAlreadyExist".to_string();
                            current_progress = 100.0;

                            // 發送事件並繼續 (讓它自然結束或等待其他輸出)
                            let _ = app_handle.emit("download-progress", Payload { 
                                id: id.clone(), 
                                progress: current_progress,
                                filename: current_filename.clone(),
                                status: status_text
                            });
                            continue;
                        }
                    }
                    
                    // 1. 解析檔名 & 判斷是第幾個檔案
                    if line.contains("Destination:") {
                        // 每次看到 Destination，代表開始下載一個新檔案
                        download_part_count += 1;
                        
                        if let Some(caps) = download_dest_regex.captures(&line) {
                            let full_path = &caps[1];
                            has_valid_content = true;
                            
                            // 利用 Path 工具從完整路徑中提取檔名
                            if let Some(name) = Path::new(full_path).file_name() {
                                current_filename = name.to_string_lossy().to_string();
                            } else {
                                current_filename = full_path.to_string();
                            }
                        }
                    }

                    // 2. 解析合併狀態
                    else if line.contains("[Merger]") {
                        if let Some(caps) = merge_regex.captures(&line) {
                            let full_path = &caps[1];
                            has_valid_content = true;
                            
                            // 利用 Path 工具從完整路徑中提取檔名
                            if let Some(name) = Path::new(full_path).file_name() {
                                current_filename = name.to_string_lossy().to_string();
                            } else {
                                current_filename = full_path.to_string();
                            }
                            status_text = "merging".to_string();
                            current_progress = 100.0;
                            
                            // 發送事件並跳過後面的邏輯
                             let _ = app_handle.emit("download-progress", Payload { 
                                id: id.clone(), 
                                progress: current_progress,
                                filename: current_filename.clone(),
                                status: status_text
                            });
                            continue;
                        }
                    }

                    // 3. 解析進度
                    if line.contains("[download]") && line.contains("%") {
                        if let Some(caps) = progress_regex.captures(&line) {
                            if let Ok(raw_p) = caps[1].parse::<f64>() {
                                
                                // 根據下載階段分配進度條
                                if download_part_count <= 1 {
                                    // 第一階段 (影像，通常檔案最大)：佔總進度的 0% ~ 85%
                                    calculated_progress = raw_p * 0.85;
                                    status_text = "downloading".to_string();
                                } else {
                                    // 第二階段 (聲音)：佔總進度的 85% ~ 99%
                                    // 公式：85 + (原始進度 * 0.14)
                                    calculated_progress = 85.0 + (raw_p * 0.14);
                                    status_text = "downloading".to_string();
                                }

                                current_progress = calculated_progress;
                            }
                        }
                    }

                    // 只有當有解析出進度，或是 Destination 剛出現時才發送
                    // 避免發送重複或無效的 0.0
                    if current_progress > 0.0 || download_part_count > 0 {
                         let _ = app_handle.emit("download-progress", Payload { 
                            id: id.clone(), 
                            progress: current_progress,
                            filename: current_filename.clone(),
                            status: status_text
                        });
                    }
                },
                Ok(None) => break,
                Err(_) => continue,
            }
        }

        let status = child.wait().await;
        let is_success_exit = status.map(|s| s.success()).unwrap_or(false);

        if aborted_due_to_live {
            println!("任務已因直播限制而終止");
            return;
        }

        if is_success_exit && has_valid_content {
            let _ = app_handle.emit("download-complete", Payload { 
                id: id, 
                progress: 100.0,
                filename: current_filename,
                status: "complete".into() 
            });
        } else {
             // 如果 Exit Code 是 0 但 has_valid_content 是 false，代表是無效網址
             // 或者 Exit Code 非 0，代表發生錯誤
             println!("任務失敗：無效網址或下載錯誤");
             let _ = app_handle.emit("download-complete", Payload { 
                id: id, 
                progress: 0.0,
                filename: "".into(),
                status: "error".into()
            });
        }
    });

    Ok(())
}