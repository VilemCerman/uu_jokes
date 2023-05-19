"use strict";
const CategoryAbl = require("../../abl/category-abl.js");

class CategoryController {
  create(ucEnv) {
    const awid = ucEnv.getUri().getAwid();
    const dtoIn = ucEnv.parameters;
    return CategoryAbl.create(awid, dtoIn);
  }
  list(ucEnv) {
    return CategoryAbl.list(ucEnv.getUri().getAwid(), ucEnv.parameters);
  }
  get(ucEnv) {
    return CategoryAbl.get(ucEnv.getUri().getAwid(), ucEnv.getDtoIn());
  }

  update(ucEnv) {
    return CategoryAbl.update(ucEnv.getUri().getAwid(), ucEnv.getDtoIn(), ucEnv.getSession(), ucEnv.getAuthorizationResult());
  }

  delete(ucEnv) {
    return CategoryAbl.delete(ucEnv.getUri().getAwid(), ucEnv.getDtoIn(), ucEnv.getSession(), ucEnv.getAuthorizationResult());
  }
}

module.exports = new CategoryController();
