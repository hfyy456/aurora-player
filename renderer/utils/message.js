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
export { parseData };
