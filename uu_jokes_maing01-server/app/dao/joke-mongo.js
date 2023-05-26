const { UuObjectDao } = require("uu_appg01_server").ObjectStore;

class JokeMongo extends UuObjectDao {
  async createSchema() {
    await super.createIndex({ awid: 1, _id: 1 }, { unique: true });
  }

  async create(uuObject) {
    return await super.insertOne(uuObject);
  }

  async createMany(uuObject) {
    return await super.insertMany(uuObject);
  }

  async listByVisibility(awid, visibility, dtoIn = {}) {
    let sort = {
      [dtoIn.sortBy]: dtoIn.order === "asc" ? 1 : -1,
    };
    return await super.find({ awid }, dtoIn.pageInfo, sort);
  }

  async get(awid, id) {
    return await super.findOne({ awid, id });
  }

  async getByCategory(awid, categoryName) {
    const all = await this.listByVisibility(awid, true);
    let jokes = [];
    all.itemList.forEach((joke) => {
      if (joke.categoryName === categoryName) {
        jokes.push(joke);
      }
    });
    const result = {
      itemList: { jokes },
      pageInfo: {
        pageIndex: 0,
        pageSize: 100,
        total: jokes.length,
      },
      uuErrorMap: all.uuErrorMap,
    };

    console.log("rResult");
    console.log(result);
    return result;
  }

  async findOneAndUpdate(uuObject) {
    return await super.findOneAndUpdate({ awid: uuObject.awid, id: uuObject.id }, uuObject);
  }

  async delete(awid, id) {
    return await super.deleteOne({ awid, id });
  }
}

module.exports = JokeMongo;
