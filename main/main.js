const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
import { join } from "node:path";
import { config } from "./utils/config";
import Files from "./ipc/files";
import Player from "./ipc/player";
// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  app.quit();
}

const preload = join(__dirname, "./preload.js");
let mainWindow = null;
const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    title: "Main window",
    height: 650,
    useContentSize: true,
    width: 900,
    resizable: false,
    backgroundColor: "#00000000",
    transparent: true,
    frame: false,
    webPreferences: {
      preload,
      // Warning: Enable nodeIntegration and disable contextIsolation is not secure in production
      // Consider using contextBridge.exposeInMainWorld
      // Read more on https://www.electronjs.org/docs/latest/tutorial/context-isolation
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false,
    },
  });
  const winURL = MAIN_WINDOW_VITE_DEV_SERVER_URL
    ? MAIN_WINDOW_VITE_DEV_SERVER_URL
    : path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`);
  // and load the index.html of the app.
  mainWindow.loadURL(winURL);
  // Open the DevTools.
  mainWindow.webContents.openDevTools();

  Player(mainWindow, winURL);
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);
app.config = config;
// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
Files();
//BASIC ANCTIONS
ipcMain.handle("closeWindow", () => {
  mainWindow.close();
});

ipcMain.handle("minimizeWindow", () => {
  mainWindow.minimize();
});
