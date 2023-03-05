class BaseDao {
  /**
   * 子类构造传入对应的 Model 类
   *
   * @param Model
   */
  constructor(Model) {
    this.Model = Model;
  }

  /**
   * 使用 Model 的 静态方法 create() 添加 doc
   *
   * @param obj 构造实体的对象
   * @returns {Promise}
   */
  create(obj) {
    return new Promise((resolve, reject) => {
      let entity = new this.Model(obj);
      this.Model.create(entity, (error, result) => {
        if (error) {
          console.log("create error--> ", error);
          reject(error);
        } else {
          console.log("create result--> ", result);
          resolve(result);
        }
      });
    });
  }
  findByRegex(regex) {
    let reg = new RegExp(regex, "i");
    return new Promise((resolve, reject) => {
      this.Model.find({ name: { $regex: reg } })
        .then((res) => {
          resolve(res);
        })
        .catch((e) => {
          reject(e);
        });
    });
  }
  /**
   * 使用 Model save() 添加 doc
   *
   * @param obj 构造实体的对象
   * @returns {Promise}
   */
  save(obj) {
    return new Promise((resolve, reject) => {
      let entity = new this.Model(obj);
      entity
        .save()
        .then((res) => {
          resolve(res);
        })
        .catch((e) => {
          reject(e);
        });
    });
  }

  /**
   * 查询所有符合条件 docs
   *
   * @param condition 查找条件
   * @param constraints
   * @returns {Promise}
   */
  findAll(condition, constraints) {
    return new Promise((resolve, reject) => {
      console.log(condition, constraints);
      this.Model.find(
        condition,
        constraints ? constraints : null,
        (error, results) => {
          if (error) {
            console.log("findAll error--> ", error);
            reject(error);
          } else {
            console.log("findAll results--> ", results);
            resolve(results);
          }
        }
      );
    });
  }

  /**
   * 查找符合条件的第一条 doc
   *
   * @param condition
   * @param constraints
   * @returns {Promise}
   */
  findOne(condition, constraints, limit) {
    return new Promise((resolve, reject) => {
      this.Model.findOne(
        condition,
        constraints ? constraints : null,
        limit ? limit : null
      )
        .then((res) => {
          resolve(res);
        })
        .catch((e) => {
          reject(e);
        });
    });
  }

  /**
   * 查找排序之后的第一条
   *
   * @param condition
   * @param orderColumn
   * @param orderType
   * @returns {Promise}
   */
  findOneByOrder(condition, orderColumn, orderType) {
    return new Promise((resolve, reject) => {
      this.Model.findOne(condition)
        .sort({
          [orderColumn]: orderType,
        })
        .exec(function (err, record) {
          console.log(record);
          if (err) {
            reject(err);
          } else {
            resolve(record);
          }
        });
    });
  }

  /**
   * 查找分页
   * @param pageSize
   * @param pageNum
   * @returns {Promise}
   */
  findAllByPage(pageSize, pageNum) {
    return new Promise((resolve, reject) => {
      this.Model.find()
        .limit(pageSize)
        .skip(pageSize * pageNum)
        .sort({
          createTime: -1,
        })
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  /**
   * 更新 docs
   *
   * @param condition 查找条件
   * @param updater 更新操作
   * @returns {Promise}
   */
  updateOne(condition, updater) {
    return new Promise((resolve, reject) => {
      console.log(condition, updater);
      this.Model.updateOne(condition, updater, (error, results) => {
        if (error) {
          console.log("update error--> ", error);
          reject(error);
        } else {
          console.log("update results--> ", results);
          resolve(results);
        }
      });
    });
  }

  /**
   * 移除 doc
   *
   * @param condition 查找条件
   * @returns {Promise}
   */
  remove(condition) {
    return new Promise((resolve, reject) => {
      this.Model.remove(condition, (error, result) => {
        if (error) {
          console.log("remove error--> ", error);
          reject(error);
        } else {
          console.log("remove result--> ", result);
          resolve(result);
        }
      });
    });
  }
}

export default BaseDao;
