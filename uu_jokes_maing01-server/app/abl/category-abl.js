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
  pageSize: 100
};
const WARNINGS = {
  createUnsupportedKeys: {
    code: `${Errors.Create.UC_CODE}unsupportedKeys`
  },
  listUnsupportedKeys: {
    code: `${Errors.List.UC_CODE}unsupportedKeys`
  },
  getUnsupportedKeys: {
    code: `${Errors.Get.UC_CODE}unsupportedKeys`
  },
  updateUnsupportedKeys: {
    code: `${Errors.Update.UC_CODE}unsupportedKeys`
  },
  deleteUnsupportedKeys: {
    code: `${Errors.Delete.UC_CODE}unsupportedKeys`
  }
};

class CategoryAbl {
  constructor() {
    this.validator = Validator.load();
    this.dao = DaoFactory.getDao("category");
  }

  async create(awid, dtoIn) {
    let uuAppErrorMap = {};

    // validation of dtoIn
    const validationResult = this.validator.validate("categoryCreateDtoInType", dtoIn);
    uuAppErrorMap = ValidationHelper.processValidationResult(
      dtoIn,
      validationResult,
      uuAppErrorMap,
      Warnings.Create.UnsupportedKeys.code,
      Errors.Create.InvalidDtoIn
    );

    // save to uuObjectStore
    dtoIn.awid = awid;
    const category = await this.dao.create(dtoIn);

    // prepare and return dtoOut
    const dtoOut = { ...category, uuAppErrorMap };
    return dtoOut;
  }
  async list(awid, dtoIn) {
    // hds 1, 1.1
    let validationResult = this.validator.validate("categoryListDtoInType", dtoIn);
    // hds 1.2, 1.3 // A1, A2
    let uuAppErrorMap = ValidationHelper.processValidationResult(dtoIn,
      validationResult,
      WARNINGS.listUnsupportedKeys.code, Errors.List.InvalidDtoIn);
    // hds 2
    this._fillDefaults(dtoIn);
    let dtoOut = await this.dao.listByVisibility(awid, true, dtoIn);
    // hds 3
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
    // hds 1, 1.1
    let validationResult = this.validator.validate("categoryGetDtoInType", dtoIn);
    // hds 1.2, 1.3
    let uuAppErrorMap = ValidationHelper.processValidationResult(dtoIn,
      validationResult,
      WARNINGS.getUnsupportedKeys.code, Errors.Get.InvalidDtoIn);
    // hds 2
    // hds 3
    let dtoOut = await this._getCategory(awid, dtoIn.id, uuAppErrorMap)
    dtoOut.uuAppErrorMap = uuAppErrorMap;
    // hds 4
    return dtoOut;
  }
  async _getCategory(awid, id, uuAppErrorMap) {
    let loadedCategory;
    try {
      loadedCategory = await this.dao.get(awid, id);
    } catch (e) {
      // AS 2.1. - Throw exchangeRateDaoGetFailed exception, which writes the error
      // in dtoOut.uuAppErrorMap, and terminate.
      if (e instanceof ObjectStoreError) {
        throw new Errors.Get.CategoryDaoUpdateFailed({uuAppErrorMap}, e);
      }
      throw e;
    }
    if (!loadedCategory) {
      // AS 2.2. - Throw exchangeRateNotFound exception, which writes the error
      // in dtoOut.uuAppErrorMap, and terminate.
      //throw new Errors.Get.CategoryDoesNotExist({uuAppErrorMap}, {categoryId: id});
      return [];
    }
    return loadedCategory;
  }
  async update(awid, dtoIn, session, authorizationResult) {
    // 2. Performs a logical check of dtoIn.
    let validationResult = this.validator.validate("categoryUpdateDtoInType",
      dtoIn);
    // hds 1.2, 1.3 // A1, A2
    let uuAppErrorMap = ValidationHelper.processValidationResult(dtoIn,
      validationResult,
      WARNINGS.updateUnsupportedKeys.code, Errors.Update.InvalidDtoIn);
    // 3. Loads the Category uuObject according to dtoIn.id (by category DAO get). (A5)
    let loadedCategory = await this._getCategory(awid, dtoIn.id, uuAppErrorMap);
    // 4. Validates users authorization to update the category, e.g. user is in Authorities profile or uuIdentity of logged user is the same as category.uuIdentity. (A6)

    // if (this._isUserAuthorizedForAction(loadedCategory.uuIdentity, session,
    //   authorizationResult)) {
    //   throw new Errors.Update.UserNotAuthorized({uuAppErrorMap})
    // }

    // 5. For all categories in categoryIdList in dtoIn verifies the existence of the category by Id (category DAO listByCategoryIdList). (A7)
    // 6. If the dtoIn contains key image, finds the value of category.image from uuObject category loaded in HDS 3.
    if (dtoIn.image) {
      //6.1. If it is null, calls the createBinary method from the uuAppBinaryStore library with attributes - data: dtoIn.image. (A8)
      if (!loadedCategory.image) {
        dtoIn = await this._saveImageData(awid, dtoIn)
        loadedCategory.image = dtoIn.image;
        //6.2. If it is not null, calls the updateBinaryData method from the uuAppBinaryStore library with attributes - data: dtoIn.image, code: "category.image" and revisionStrategy: "NONE". (A9)
      } else {
        await this._updateCategoryImage(awid, loadedCategory.image ,dtoIn, uuAppErrorMap)
      }
    }
    // 7. Checked dtoIn is saved to the uuAppObjectStore (through category DAO update). (A10)
    loadedCategory.name = dtoIn.name;
    loadedCategory.text = dtoIn.text

    let updated = await this._updateCategory(awid, loadedCategory, uuAppErrorMap)
    // 8. Returns properly filled out dtoOut.
    return {category: updated, uuAppErrorMap: uuAppErrorMap}
  }
  // async _getCategory(awid, id, uuAppErrorMap) {
  //   let loadedCategory;
  //   try {
  //     loadedCategory = await this.categoryDao.get(awid, id);
  //   } catch (e) {
  //     // AS 2.1. - Throw exchangeRateDaoGetFailed exception, which writes the error
  //     // in dtoOut.uuAppErrorMap, and terminate.
  //     if (e instanceof ObjectStoreError) {
  //       throw new Errors.Update.CategoryDaoUpdateFailed({uuAppErrorMap}, e);
  //     }
  //     throw e;
  //   }
  //   if (!loadedCategory) {
  //     // AS 2.2. - Throw exchangeRateNotFound exception, which writes the error
  //     // in dtoOut.uuAppErrorMap, and terminate.
  //     throw new Errors.Update.CategoryDoesNotExist({uuAppErrorMap}, {categoryId: id});
  //   }
  //   return loadedCategory;
  // }
  _isUserAuthorizedForAction(uuIdentity, session, authorizationResult) {
    return !(uuIdentity === session.getIdentity().getUuIdentity()
      || authorizationResult.getAuthorizedProfiles().includes(
        EXECUTIVES_PROFILE));
  }
  async _updateCategory(awid, dtoIn, uuAppErrorMap) {
    return await this.dao.findOneAndUpdate(dtoIn);
  }
  async delete(awid, dtoIn, session, authorizationResult) {
    // HDS 2. Performs a logical check of dtoIn.
    let validationResult = this.validator.validate("categoryDeleteDtoInType",
      dtoIn);
    // hds 2.2, 2.3
    let uuAppErrorMap = ValidationHelper.processValidationResult(dtoIn,
      validationResult,
      WARNINGS.deleteUnsupportedKeys.code,
      Errors.Delete.InvalidDtoIn);
    // 3. Gets Category object according to dtoIn.id (by category DAO get). (A5)
    let loadedCategory = await this._getCategory(awid, dtoIn.id, uuAppErrorMap);
    // 4. Validates users authorization to update the category, e.g. user is in Authorities profile or uuIdentity of logged user is the same as category.uuIdentity. (A6)
    // if (this._isUserAuthorizedForAction(loadedCategory.uuIdentity, session,
    //   authorizationResult)) {
    //   throw new Errors.Delete.UserNotAuthorized(uuAppErrorMap);
    // }
    // 5. Deletes all categoryRating uuObjects from the uuAppObjectStore that contain a given Id of the category (through the categoryRating DAO deleteByCategory).
    // 6. In case the category.image is filled in the object loaded in HDS 3, then calls the uuAppBinaryStore library method deleteBinary and so deletes the image with the given id from the uuAppBinaryStore. (A7)
    // 7. Deletes the category uuObject from the uuAppObjectStore with a given Id (through the category DAO delete).
    await this._deleteCategory(awid, dtoIn, uuAppErrorMap);
    // if (loadedCategory.image){
    //   await this._deleteCategoryImage(awid, loadedCategory, uuAppErrorMap);
    // }
    // 8. Returns properly filled out dtoOut.
    return {status : 200, uuAppErrorMap: uuAppErrorMap};
  }
  async _deleteCategory(awid, dtoIn, uuAppErrorMap) {
    try {
      await this.dao.delete(awid, dtoIn.id);
    } catch (e) {
      if (e instanceof ObjectStoreError) {
        throw new Errors.Delete.CategoryDoesNotExist({uuAppErrorMap}, e);
      }
      throw e;
    }
  }
  async _deleteCategoryImage(awid, loadedCategory, uuAppErrorMap) {
    try {
      await this.categoryImageDao.deleteByCode(awid, loadedCategory.image);
    } catch (e) {
      if (e instanceof ObjectStoreError) {
        throw new Errors.Delete.CategoryDoesNotExist({uuAppErrorMap}, e);
      }
      throw e;
    }
  }
  // async _getCategory(awid, id, uuAppErrorMap) {
  //   let loadedCategory;
  //   try {
  //     loadedCategory = await this.dao.get(awid, id);
  //   } catch (e) {
  //     // AS 2.1. - Throw exchangeRateDaoGetFailed exception, which writes the error
  //     // in dtoOut.uuAppErrorMap, and terminate.
  //     if (e instanceof BinaryStoreError) {
  //       throw new Errors.Delete.UuBinaryDeleteFailed({uuAppErrorMap}, e);
  //     }
  //     throw e;
  //   }
  //   if (!loadedCategory) {
  //     // AS 2.2. - Throw exchangeRateNotFound exception, which writes the error
  //     // in dtoOut.uuAppErrorMap, and terminate.
  //     throw new Errors.Delete.CategoryDoesNotExist({uuAppErrorMap}, {categoryId: id});
  //   }
  //   return loadedCategory;
  // }
}

module.exports = new CategoryAbl();
