import { ipcMain, app } from "electron";
import { formatData } from "../utils/message";
const Store = require("electron-store");
const store = new Store();
const http = require("http");
const mm = require("music-metadata");

let curMusic = store.get("curMusic");
let curList = null;
let maxId = 0;

export default function player(window, winURL) {
  startMusicServer((port) => {
    window.loadURL(winURL);
  });
  ipcMain.on("switchMusic", async (event, args) => {
    curMusic = JSON.parse(args) || null;
    switchMusic(event, curMusic);
  });
  ipcMain.on("startPlay", async (event) => {
    let music;
    if (curMusic) {
      music = curMusic;
    } else {
      music = JSON.stringify(getList[0]);
    }
    switchMusic(event, music);
  });
  ipcMain.on("setVolume", async (event, volume) => {
    event.sender.send("setVolume", volume);
  });
  ipcMain.on("pausePlay", async (event, args) => {
    event.sender.send("pausePlay");
  });
  ipcMain.on("nextPlay", async (event, args) => {
    !curList && getList();
    let curId = curMusic.id;
    let id = 0;
    if (curId >= maxId) {
      id = 0;
    } else {
      id = curId + 1;
    }
    console.log(maxId, id, curId);
    curMusic = getMusicById(id);
    console.log(curMusic);
    switchMusic(event, curMusic);
  });
}
async function switchMusic(event, ms) {
  let mss;
  if (typeof ms == "object") {
    mss = JSON.stringify(ms);
  } else {
    ms = JSON.parse(ms);
  }
  store.set("curMusic", mss || JSON.stringify(ms));
  event.sender.send("switchMusic", formatData({ ms: ms }));
  const metadata = await getMediaInfo(ms);
  let lrc = await app.config.getLrc({
    artist: metadata.common.artist,
    title: metadata.common.title,
  });
  event.sender.send("lrcReader", formatData({ lrc: lrc }));
  event.sender.send("getMediaInfo", formatData({ meta: metadata.common }));
}
function getList() {
  curList = JSON.parse(store.get("curList"));
  for (const item of curList) {
    maxId = Math.max(item.id, maxId);
  }
  return curList;
}
function getMusicById(id) {
  for (const item of curList) {
    if (item.id == id) {
      return item;
    }
  }
}
function startMusicServer(callback) {
  const server = http.createServer(pipeMusic).listen(0, () => {
    callback(server.address().port);
  });

  return server;
}

function pipeMusic(req, res) {
  const musicUrl = decodeURIComponent(req.url);
  const extname = path.extname(musicUrl);
  if (allowKeys.indexOf(extname) < 0) {
    return notFound(res);
  }
  const fileUrl = path.join(musicUrl.substring(1));
  if (!fs.existsSync(fileUrl)) {
    return notFound(res);
  }

  ms.pipe(req, res, fileUrl);
}
async function getMediaInfo(ms) {
  if (typeof ms == "string") {
    ms = JSON.parse(ms);
  }
  const metadata = await mm.parseFile(ms.url);
  return metadata;
}
