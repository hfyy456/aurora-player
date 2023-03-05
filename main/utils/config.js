import { stat, readdir, readFile, writeFile, access, mkdir } from "fs/promises";
const path = require("path");
const fs = require("fs");
const basePath = path.join(__dirname, "/saveData");
const filename = "config.json";
const mm = require("music-metadata");
import LrcDao from "../server/models/dao/lrcDao";
import Oss from "../server/oss";

let lrcDao = new LrcDao();
const ossClient = new Oss();
function buffterToUtr8(buffer) {
  return buffer.toString("utf-8");
}
const _baseConfig = {
  playList: {},
  curPlayList: "",
  curMusic: "",
  musicInfos: {},
  audioOptions: {
    volume: 80,
  },
  lrcInfo: {
    modifyTime: 0,
    path: "",
    list: [],
  },
  index: 0,
};
class Config {
  constructor() {
    this.file = path.join(basePath, filename);
    this.json = null;
    this.loadData();
    // this.getList();
  }
  saveItem() {
    lrcDao.save({
      name: "下一站天后",
      url: "111",
    });
  }
  async getList() {
    let res = lrcDao.findAllByPage(0, 9999);
    return res;
  }
  async findOnlineLrc(regex) {
    let res = await lrcDao.findByRegex(regex);
    return res;
  }
  getConfig() {
    return this.json;
  }
  setConfig(key, value) {
    this.json[key] = value;
    this.saveData();
  }
  async getOnlineLrc(name) {
    let buffer = await ossClient.getBuffer(name);
    return buffer;
  }
  async getLrc(info) {
    let lrc = null;

    // for (const item of this.json.lrcInfo.list) {
    //   console.log(item, info);
    //   if (item.indexOf(info.artist) > -1 && item.indexOf(info.title) > -1) {
    //     lrc = await this.loadLrc(item);
    //     break;
    //   }
    // }
    if (!lrc) {
      let res = await this.findOnlineLrc(info.title);
      console.log(res, typeof res, "res");
      if (res.length > 0) {
        let item = res[0];
        let buffer = await this.getOnlineLrc(item.name);
        lrc = await this.loadLrc(buffterToUtr8(buffer), true);
      }
    }
    return lrc;
  }
  async loadLrc(filename, isDir = false) {
    let data = null;
    if (isDir) {
      data = filename.split("[");
    } else {
      const res = await readFile(path.join(this.json.lrcInfo.path, filename), {
        encoding: "utf-8",
      });
      data = res.split("[");
    }

    const reg = /([0-9]\d):([0-5]\d)/;
    let lrc = [];
    for (let i = 0; i < data.length; i++) {
      data[i] = "[" + data[i];
      data[i] = data[i].replace(/\r\n\r\n/, "");
      data[i] = data[i].replace(/\r\n/, "");
      if (reg.test(data[i])) {
        let arr = data[i].split("]");
        let timeStringArr = arr[0].split("[");
        let timeString = timeStringArr[1];
        let time = timeString.split(":");
        //console.log(time)
        let second = time[0] * 1 * 60 + time[1] * 1;
        let seconds = parseInt(second);
        lrc.push({ seconds: seconds, content: arr[1] });
      }
    }
    //console.log(lrc)
    return lrc;
  }
  async loadLrcs(filepath) {
    let files = await readdir(filepath);
    let statData = await stat(filepath);
    let modifyTime = parseInt(statData.mtimeMs);
    let list = [];
    let length = files.length;
    for (let i = 0; i < length; i++) {
      let filename = files[i];
      let extname = path.extname(filename);
      if (extname == ".lrc") {
        list.push(filename);
      }
    }
    this.json.lrcInfo = {
      ...this.json.lrcInfo,
      list: list,
      path: filepath,
      modifyTime: modifyTime,
    };
    this.saveData();
  }
  async addPlaylist(path) {
    let statData = await stat(path);
    let modifyTime = parseInt(statData.mtimeMs);
    let list = await this.readMusicFiles(path);
    this.json.playList[path] = {
      list: list,
      type: "directory",
      modifyTime: modifyTime,
      name: "本地目录",
      index: (this.json.index += 1),
      key: path,
    };
    this.saveData();
  }
  async getPlayList(path) {
    if (!this.json.playList[path]) {
      await this.addPlaylist(path);
    } else {
      let statData = await stat(path);
      let modifyTime = parseInt(statData.mtimeMs);
      if (modifyTime != this.json.playList[path].modifyTime) {
        await this.addPlaylist(path);
      }
    }
    return this.json.playList[path];
  }
  saveData() {
    let jsonData = JSON.stringify(this.json);
    fs.writeFile(this.file, jsonData, function () {});
  }

  async readMusicFiles(filepath) {
    let files = await readdir(filepath);
    var playList = [];
    if (!files) {
      return playList;
    }
    let index = 0;
    let length = files.length;
    const startTime = new Date().getTime();
    for (let i = 0; i < length; i++) {
      let filename = files[i];
      let extname = path.extname(filename);
      if (extname === ".flac" || extname === ".mp3") {
        let url = path.join(filepath, filename);
        const metadata = await mm.parseFile(url);
        let item = { id: index++, url: url };
        item["title"] = metadata.common["title"];
        item["artist"] = metadata.common["artist"];
        item["album"] = metadata.common["album"];
        item["duration"] = metadata.format["duration"];
        //   item["picture"] = tags["picture"];
        playList.push(item);
      }
    }
    const endTime = new Date().getTime();
    console.log(endTime - startTime);
    return playList;
  }
  async loadData() {
    console.log(this.file);
    var _this = this;
    try {
      const data = fs.readFileSync(_this.file, "UTF-8").toString();
      _this.json = JSON.parse(data);
    } catch (error) {
      await access(basePath)
        .then((res) => {})
        .catch(async (e) => {
          await mkdir(basePath);
        });
      let jsonData = JSON.stringify(_baseConfig);
      await writeFile(_this.file, jsonData, { flag: "w" });
      _this.json = _baseConfig;
    }
  }
}
export const config = new Config();
