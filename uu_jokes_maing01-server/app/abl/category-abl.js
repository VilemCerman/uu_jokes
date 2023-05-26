"use strict";
const { Validator } = require("uu_appg01_server").Validation;
const { ValidationHelper } = require("uu_appg01_server").AppServer;
const { DaoFactory } = require("uu_appg01_server").ObjectStore;

const Errors = require("../api/errors/category-error.js");
const Warnings = require("../api/warnings/category-warning.js");

const DEFAUL_VALUES = {
  sortBy: "name",
  order: "asc",
  pageIndex: 0,
  pageSize: 100,
};
const WARNINGS = {
  createUnsupportedKeys: {
    code: `${Errors.Create.UC_CODE}unsupportedKeys`,
  },
  listUnsupportedKeys: {
    code: `${Errors.List.UC_CODE}unsupportedKeys`,
  },
  getUnsupportedKeys: {
    code: `${Errors.Get.UC_CODE}unsupportedKeys`,
  },
  updateUnsupportedKeys: {
    code: `${Errors.Update.UC_CODE}unsupportedKeys`,
  },
  deleteUnsupportedKeys: {
    code: `${Errors.Delete.UC_CODE}unsupportedKeys`,
  },
};

class CategoryAbl {
  constructor() {
    this.validator = Validator.load();
    this.dao = DaoFactory.getDao("category");
    this.jokeDao = DaoFactory.getDao("joke");
  }

  async create(awid, dtoIn) {
    let uuAppErrorMap = {};

    const validationResult = this.validator.validate("categoryCreateDtoInType", dtoIn);
    uuAppErrorMap = ValidationHelper.processValidationResult(
      dtoIn,
      validationResult,
      uuAppErrorMap,
      Warnings.Create.UnsupportedKeys.code,
      Errors.Create.InvalidDtoIn
    );

    const categoryList = await this.list(awid, {
      sortBy: "name",
      order: "asc",
      pageInfo: { pageSize: 1024, pageIndex: DEFAUL_VALUES.pageIndex },
    });
    let exists = false;
    let category;

    categoryList.itemList.forEach((listedCategory) => {
      if (listedCategory.name === dtoIn.name) {
        category = listedCategory;
        exists = true;
        //return { ...listedCategory, uuAppErrorMap};
      }
    });

    if (category === undefined) {
      dtoIn.awid = awid;
      category = await this.dao.create(dtoIn);
    }
    const dtoOut = { ...category, uuAppErrorMap };
    return dtoOut;
  }
  async list(awid, dtoIn) {
    let validationResult = this.validator.validate("categoryListDtoInType", dtoIn);
    let uuAppErrorMap = ValidationHelper.processValidationResult(
      dtoIn,
      validationResult,
      WARNINGS.listUnsupportedKeys.code,
      Errors.List.InvalidDtoIn
    );
    this._fillDefaults(dtoIn);
    let dtoOut = await this.dao.listByVisibility(awid, true, dtoIn);
    dtoOut.uuAppErrorMap = uuAppErrorMap;
    return dtoOut;
  }
  _fillDefaults(dtoIn) {
    if (!dtoIn.sortBy) {
      dtoIn.sortBy = DEFAUL_VALUES.sortBy;
    }
    if (!dtoIn.order) {
      dtoIn.order = DEFAUL_VALUES.order;
    }
    if (!dtoIn.pageInfo) {
      dtoIn.pageInfo = {};
    }
    if (!dtoIn.pageInfo.pageSize) {
      dtoIn.pageInfo.pageSize = DEFAUL_VALUES.pageSize;
    }
    if (!dtoIn.pageInfo.pageIndex) {
      dtoIn.pageInfo.pageIndex = DEFAUL_VALUES.pageIndex;
    }
  }
  async get(awid, dtoIn) {
    let validationResult = this.validator.validate("categoryGetDtoInType", dtoIn);
    let uuAppErrorMap = ValidationHelper.processValidationResult(
      dtoIn,
      validationResult,
      WARNINGS.getUnsupportedKeys.code,
      Errors.Get.InvalidDtoIn
    );
    let dtoOut = await this._getCategory(awid, dtoIn.id, uuAppErrorMap);
    dtoOut.uuAppErrorMap = uuAppErrorMap;
    return dtoOut;
  }
  async _getCategory(awid, id, uuAppErrorMap) {
    let loadedCategory;
    try {
      loadedCategory = await this.dao.get(awid, id);
    } catch (e) {
      if (e instanceof ObjectStoreError) {
        throw new Errors.Get.CategoryDaoUpdateFailed({ uuAppErrorMap }, e);
      }
      throw e;
    }
    if (!loadedCategory) {
      return [];
    }
    return loadedCategory;
  }
  async update(awid, dtoIn, session, authorizationResult) {
    let validationResult = this.validator.validate("categoryUpdateDtoInType", dtoIn);
    let uuAppErrorMap = ValidationHelper.processValidationResult(
      dtoIn,
      validationResult,
      WARNINGS.updateUnsupportedKeys.code,
      Errors.Update.InvalidDtoIn
    );
    let loadedCategory = await this._getCategory(awid, dtoIn.id, uuAppErrorMap);
    loadedCategory.name = dtoIn.name;

    let updated = await this._updateCategory(awid, loadedCategory, uuAppErrorMap);
    return { category: updated, uuAppErrorMap: uuAppErrorMap };
  }
  async _updateCategory(awid, dtoIn, uuAppErrorMap) {
    return await this.dao.findOneAndUpdate(dtoIn);
  }
  async delete(awid, dtoIn, session, authorizationResult) {
    let validationResult = this.validator.validate("categoryDeleteDtoInType", dtoIn);
    let uuAppErrorMap = ValidationHelper.processValidationResult(
      dtoIn,
      validationResult,
      WARNINGS.deleteUnsupportedKeys.code,
      Errors.Delete.InvalidDtoIn
    );

    const category = await this.dao.get(awid, dtoIn.id);
    const jokes = await this.jokeDao.getByCategory(awid, category.name);
    if (jokes.pageInfo.total === 0) {
      await this._deleteCategory(awid, dtoIn, uuAppErrorMap);
      return { status: 200, uuAppErrorMap: uuAppErrorMap };
    }
    return { status: 405, uuAppErrorMap: Errors.Delete.CategoryContainsJokes };
  }
  async _deleteCategory(awid, dtoIn, uuAppErrorMap) {
    try {
      await this.dao.delete(awid, dtoIn.id);
    } catch (e) {
      if (e instanceof ObjectStoreError) {
        throw new Errors.Delete.CategoryDoesNotExist({ uuAppErrorMap }, e);
      }
      throw e;
    }
  }
}

module.exports = new CategoryAbl();
