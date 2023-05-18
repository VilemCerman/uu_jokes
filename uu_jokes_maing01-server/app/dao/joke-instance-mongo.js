"use strict";
const { UuObjectDao } = require("uu_appg01_server").ObjectStore;

class JokesInstanceMongo extends UuObjectDao {

  async createSchema() {
    await super.createIndex({ awid: 1 }, { unique: true });
  }

  async create(jokesInstance) {
    return await super.insertOne(todoInstance);
  }

  async getByAwid(awid) {
    return await super.findOne({ awid });
  }

  async updateByAwid(jokesInstance) {
    return await super.findOneAndUpdate({ awid: todoInstance.awid }, todoInstance, "NONE");
  }
}

module.exports = JokesInstanceMongo;
