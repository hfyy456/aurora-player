const { ipcRenderer } = require("electron");
(function () {
  window.mmsdk = {
    closeWindow: () => {
      ipcRenderer.invoke("closeWindow");
    },
    minimizeWindow: () => {
      ipcRenderer.invoke("minimizeWindow");
    },
    openFileSystem: () => {
      return new Promise((resolve, reject) => {
        ipcRenderer.invoke("openFileSystem").then((res) => {
          res = parseData(res);
          resolve(res);
        });
      });
    },
    formatTime: (ts) => {
      if (!ts) {
        return "0:00";
      }
      return `${parseInt(ts / 60)}:${
        Math.floor(ts % 60) >= 10
          ? Math.floor(ts % 60)
          : "0" + Math.floor(ts % 60)
      }`;
    },
    getMetaPic: (meta) => {
      if (!meta || !meta.picture) {
        return "";
      }
      console.log(meta);
      let base64String = "";
      let data = meta.picture[0].data.data;
      let format = meta.picture[0].format;
      for (var i = 0; i < data.length; i++) {
        base64String += String.fromCharCode(data[i]);
      }
      let base64 = `data:${format};base64,${window.btoa(base64String)}`;

      return base64;
    },
    parseData: (mes) => {
      return parseData(mes);
    },
  };
})();
function parseData(mes) {
  if (typeof mes == "string") {
    mes = JSON.parse(mes);
  }
  let data = isJSON(mes.data) ? JSON.parse(mes.data) : mes.data;
  return {
    ...mes,
    data: data,
  };
}
var isJSON = function (str) {
  if (typeof str == "string") {
    try {
      var obj = JSON.parse(str);
      if (typeof obj == "object" && obj) {
        return true;
      } else {
        return false;
      }
    } catch (e) {
      console.log("error：" + str + "!!!" + e);
      return false;
    }
  }
  console.log("It is not a string!");
};
