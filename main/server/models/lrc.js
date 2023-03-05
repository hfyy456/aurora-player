let { Schema } = require("mongoose");
import mongoClient from "../mongodb";
const lrcSchema = new Schema(
  {
    name: String,
    url: String,
    createTime: {
      type: Date,
      default: new Date(),
    },
    editTime: {
      type: Date,
      default: new Date(),
    },
  },
  {
    runSettersOnQuery: true, // 查询时是否执行 setters
  }
);
let Lrc;
try {
  Lrc = mongoClient.model(`Lrc`, lrcSchema, "lrc");
} catch (error) {
  console.log(error);
}

export default Lrc;
