const OSS = require("ali-oss");
import serverConfig from "./serverConfig";

class Oss {
  constructor() {
    this.config = serverConfig.oss;
    this.client = this.connect();
  }
  connect() {
    return new OSS({ ...this.config });
  }
  async list() {
    // 不带任何参数，默认最多返回100个文件。
    const result = await this.client.list();
    console.log(result);
  }
  async getBuffer(name) {
    try {
      const result = await this.client.get(name);
      console.log(result);
      return result.content;
    } catch (e) {
      console.log(e);
    }
  }
}

export default Oss;
