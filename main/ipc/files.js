import { ipcMain, dialog, app } from "electron";
import { formatData } from "../utils/message";
const Store = require("electron-store");
const store = new Store();
let selectPath = null;
let playList = null;
export default function Files() {
  ipcMain.handle("openFileSystem", async (event) => {
    const res = dialog.showOpenDialogSync({
      properties: ["openDirectory"],
      defaultPath: "./",
    });
    if (res) {
      selectPath = res[0];
      playList = await app.config.getPlayList(selectPath);
      app.config.setConfig("curPlayList", playList.key);
      app.config.loadLrcs(selectPath);
      return formatData({ playList: playList });
    }

    return formatData(1, {});
  });
  ipcMain.on("getDefaultList", async (event) => {
    let config = app.config.getConfig();
    if (config.curPlayList == "") {
      event.sender.send("getPlaylist", formatData(1, { playList: null }));
    }
    playList = await app.config.getPlayList(config.curPlayList);
    app.config.setConfig("curPlayList", playList.key);

    event.sender.send("getPlaylist", formatData({ playList: playList }));
  });
  ipcMain.handle("clearStore", () => {
    store.clear();
    console.log("clear");
  });
}
