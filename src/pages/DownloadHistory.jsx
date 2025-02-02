import React, { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Snackbar, Alert, IconButton, Box, Dialog, DialogActions, DialogContent, DialogTitle, Button } from "@mui/material";
import { useLanguage } from "../LanguageContext";
import { localizationDownloadHistory } from "../util/download history";
import { loadHistory } from "../util/loadHistory";
import { checkAndInitJson } from "../util/checkAndInitJson";
import { appDataDir } from "@tauri-apps/api/path";
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import { Fullscreen } from "@mui/icons-material";
import { writeTextFile } from "@tauri-apps/plugin-fs";


const JSON_FILE = "history.json";
const appDataDirPath = await appDataDir();
const jsonFilePath = `${appDataDirPath}/${JSON_FILE}`;

export default function DownloadHistory (){
  const [history, setHistory] = useState([]);
  const { lang, changeLanguage } = useLanguage();
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [message, setMessage] = useState("");
  const [openDialog, setOpenDialog] = useState(false);  // 控制確認對話框顯示
  const [isDeleting, setIsDeleting] = useState(false);  // 控制刪除操作狀態

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setMessage(`${localizationDownloadHistory.copied[lang]}: ${text}`);
    setOpenSnackbar(true);
  };

  const refrashHistory = () => {
    fetchData()
  }

  const deleteHistory = async () => {
    setIsDeleting(true);
    try {
      checkAndInitJson();
      await writeTextFile(jsonFilePath, JSON.stringify([], null, 2));
      console.log("紀錄已清空");
      setIsDeleting(false);
      fetchData();
    } catch (error) {
      console.error("清空紀錄失敗:", error);
      setIsDeleting(false);
    }
  };

  const fetchData = async () => {
    const data = await loadHistory();
    setHistory(data);
  };

  useEffect(() => {
    fetchData(); // 執行異步資料載入
  }, []); 

  return (
    <div className="w-full h-full flex flex-col items-center bg-green-100">
        <Typography variant="h5" sx={{ mt: 3, color: "#7E9F98" }}>
            {localizationDownloadHistory.downloadHistory[lang]}
        </Typography>
        <TableContainer component={Paper} sx={{mt: 4, mb: 8, backgroundColor: "#FDE4DE" }}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <IconButton variant="outlined" onClick={() => setOpenDialog(true)}>
            <DeleteIcon />
          </IconButton>
          <IconButton variant="outlined" onClick={() => {refrashHistory()}}>
            <RefreshIcon />
          </IconButton>
        </Box>
        <Table stickyHeader style={{ width: Fullscreen }} aria-label="sticky table" >
          <TableHead>
            <TableRow>
              <TableCell style={{ width: '10%', backgroundColor: "#D9D9D9" }}>{localizationDownloadHistory.list.number[lang]}</TableCell>
              <TableCell style={{ width: '15%', backgroundColor: "#D9D9D9" }}>{localizationDownloadHistory.list.downloadDate[lang]}</TableCell>
              <TableCell id="name" style={{ width: '40%', backgroundColor: "#D9D9D9" }}>{localizationDownloadHistory.list.fileName[lang]}</TableCell>
              <TableCell id="link" style={{ width: '30%', backgroundColor: "#D9D9D9" }}>{localizationDownloadHistory.list.originalURL[lang]}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {history.map((item, index) => (
              <TableRow key={index} sx={{
                "&:hover": {
                  backgroundColor: "#e0e0e0", // 滑鼠懸停時的背景色
                  cursor: "pointer", // 滑鼠變成手型
                },
              }}>
                <TableCell>{index+1}</TableCell>
                <TableCell>{item.downloadDate}</TableCell>
                <TableCell sx={{ "&:hover": { color: "#23ACE2" } }} onClick={() => handleCopy(item.fileName)}>{item.fileName}</TableCell>
                <TableCell sx={{ "&:hover": { color: "#23ACE2" } }} onClick={() => handleCopy(item.originalURL)}>{item.originalURL}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={1500} // 自動消失時間 (毫秒)
        onClose={() => setOpenSnackbar(false)}
      >
        <Alert
          onClose={() => setOpenSnackbar(false)}
          severity="success"
          sx={{
            width: "calc(100% - 16px)",
            maxWidth: "500px",
            marginBottom: "16px"
          }}
        >
          {message}
        </Alert>
      </Snackbar>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} disableScrollLock >
        <DialogTitle>{localizationDownloadHistory.deleteConfirmTitle[lang]}</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            {localizationDownloadHistory.deleteConfirmText[lang]}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="primary">
            {localizationDownloadHistory.cancelButton[lang]}
          </Button>
          <Button onClick={() => {
              deleteHistory();
              setOpenDialog(false);
            }} color="error" disabled={isDeleting}>
            {isDeleting ? 'Deleting...' : localizationDownloadHistory.clearButton[lang]}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};
