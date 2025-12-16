import React, { useState, useEffect } from "react";
import { Fullscreen } from "@mui/icons-material";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Snackbar, Alert, IconButton, Box, Dialog, DialogActions, DialogContent, DialogTitle, Button } from "@mui/material";
import { localizationDownloadHistory } from "../util/localization/localizationDownloadHistory";
import { loadHistory } from "../util/loadHistory";
import { checkAndInitJson } from "../util/checkAndInitJson";
import { appDataDir } from "@tauri-apps/api/path";
import { writeTextFile } from "@tauri-apps/plugin-fs";
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useLanguage } from "../LanguageContext";
import { useTheme } from "../theme";
import { themeColor } from "../util/themeColor";

export default function DownloadHistory (){
  const JSON_FILE = "history.json";
  const [history, setHistory] = useState([]);
  const { lang } = useLanguage();
  const [message, setMessage] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [jsonFilePath, setJsonFilePath] = useState("");
  const { theme, changeTheme } = useTheme();
  const themeSet = themeColor.downloadHistory;

  useEffect(() => {
    const fetchData = async () => {
      const appDataDirPath = await appDataDir();
      const jsonFilePath = `${appDataDirPath}/${JSON_FILE}`;
      setJsonFilePath(jsonFilePath);
    };
    fetchData();
  }, []);

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
    fetchData();
  }, []); 

  return (
    <div className="w-full h-full flex flex-col items-center" style={{ backgroundColor: themeSet.backgroundColor[theme]}}>
      <Typography variant="h5" sx={{ mt: 3 }} style={{ color: themeSet.fontColor[theme], fontWeight: "bold" }}>
          {localizationDownloadHistory.downloadHistory[lang]}
      </Typography>
      <div style={{ justifyContent: "end", width: '95%', marginTop: '15px'}}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <IconButton variant="outlined" onClick={() => {refrashHistory()}} style={{ color: themeSet.refreshIconColor[theme] }}>
            <RefreshIcon />
          </IconButton>
          <IconButton variant="outlined" onClick={() => setOpenDialog(true)} style={{ color: themeSet.trashIconColor[theme] }}>
            <DeleteIcon />
          </IconButton>
        </Box>
      </div>
      <TableContainer component={Paper} sx={{ mb: 8 }}>
        <Table stickyHeader style={{ width: Fullscreen }} aria-label="sticky table" >
          <TableHead>
            <TableRow>
              <TableCell style={{ width: '5%', backgroundColor: themeSet.tableHeaderBackgroundColor[theme], color: themeSet.tableHeaderFontColor[theme], whiteSpace: 'nowrap' }}>{localizationDownloadHistory.list.number[lang]}</TableCell>
              <TableCell style={{ width: '10%', backgroundColor: themeSet.tableHeaderBackgroundColor[theme], color: themeSet.tableHeaderFontColor[theme], whiteSpace: 'nowrap' }}>{localizationDownloadHistory.list.downloadDate[lang]}</TableCell>
              <TableCell style={{ width: '45%', backgroundColor: themeSet.tableHeaderBackgroundColor[theme], color: themeSet.tableHeaderFontColor[theme], whiteSpace: 'nowrap' }}>{localizationDownloadHistory.list.fileName[lang]}</TableCell>
              <TableCell style={{ width: '40%', backgroundColor: themeSet.tableHeaderBackgroundColor[theme], color: themeSet.tableHeaderFontColor[theme], whiteSpace: 'nowrap' }}>{localizationDownloadHistory.list.originalURL[lang]}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {history.map((item, index) => (
              <TableRow key={index} style={{ backgroundColor: themeSet.tableBodyBackgroundColor[theme] }}>
                <TableCell sx={{ color: themeSet.tableBodyFontColor[theme] }}>{index+1}</TableCell>
                <TableCell sx={{ color: themeSet.tableBodyFontColor[theme], whiteSpace: "nowrap" }}>{item.downloadDate}</TableCell>
                <TableCell sx={{ color: themeSet.tableBodyFontColor[theme], "&:hover": { color: themeSet.tableBodyFontColor[theme], fontWeight: "bold" }, wordBreak: "break-all" }} onClick={() => handleCopy(item.fileName == "MultipleFiles" ? localizationDownloadHistory.list.MultipleFiles[lang] : item.fileName)}>{item.fileName == "MultipleFiles" ? localizationDownloadHistory.list.MultipleFiles[lang] : item.fileName}</TableCell>
                <TableCell sx={{ color: themeSet.tableBodyFontColor[theme], "&:hover": { color: themeSet.tableBodyFontColor[theme], fontWeight: "bold" }, wordBreak: "break-all" }} onClick={() => handleCopy(item.originalURL)}>{item.originalURL}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={1500}
        onClose={() => setOpenSnackbar(false)}
      >
        <Alert
          onClose={() => setOpenSnackbar(false)}
          severity="success"
          sx={{
            width: "100%",
            maxWidth: "500px",
            marginBottom: "16px",
            wordBreak: "break-all"
          }}
        >
          {message}
        </Alert>
      </Snackbar>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} disableScrollLock
        PaperProps={{
          sx: {
            borderRadius: "16px",
            backgroundColor: themeSet.dialog.backgroundColor[theme],
            color: themeSet.dialog.fontColor[theme],
          },
        }}
      >
        <DialogTitle>{localizationDownloadHistory.deleteConfirmTitle[lang]}</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            {localizationDownloadHistory.deleteConfirmText[lang]}
          </Typography>
        </DialogContent>
        <DialogActions style={{ background: themeSet.dialog.backgroundColor[theme] }}>
          <Button onClick={() => setOpenDialog(false)} color="primary">
            {localizationDownloadHistory.cancelButton[lang]}
          </Button>
          <Button onClick={() => {
              deleteHistory();
              setOpenDialog(false);
            }}
            color="error"
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : localizationDownloadHistory.clearButton[lang]}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};
