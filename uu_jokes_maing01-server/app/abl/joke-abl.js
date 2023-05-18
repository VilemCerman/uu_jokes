"use strict";
const { Validator } = require("uu_appg01_server").Validation;
const { ValidationHelper } = require("uu_appg01_server").AppServer;
const { DaoFactory } = require("uu_appg01_server").ObjectStore;

const Errors = require("../api/errors/joke-error.js");
const Warnings = require("../api/warnings/joke-warning.js");

const FISHY_WORDS = ["barracuda", "broccoli", "Topolánek"];

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
  }
};

class JokeAbl {
  constructor() {
    this.validator = Validator.load();
    this.dao = DaoFactory.getDao("joke");
  }

  async create(awid, dtoIn) {
    let uuAppErrorMap = {};

    // validation of dtoIn
    const validationResult = this.validator.validate("jokeCreateDtoInType", dtoIn);
    uuAppErrorMap = ValidationHelper.processValidationResult(
      dtoIn,
      validationResult,
      uuAppErrorMap,
      Warnings.Create.UnsupportedKeys.code,
      Errors.Create.InvalidDtoIn
    );

    // check for fishy words
    FISHY_WORDS.forEach((word) => {
      if (dtoIn.text.includes(word)) {
        throw new Errors.Create.TextContainsFishyWords({ uuAppErrorMap }, { text: dtoIn.text, fishyWord: word });
      }
    });

    // save joke to uuObjectStore
    dtoIn.awid = awid;
    const joke = await this.dao.create(dtoIn);

    // prepare and return dtoOut
    const dtoOut = { ...joke, uuAppErrorMap };
    return dtoOut;
  }
  async list(awid, dtoIn) {
    // hds 1, 1.1
    let validationResult = this.validator.validate("jokeListDtoInType", dtoIn);
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
    let validationResult = this.validator.validate("jokeGetDtoInType", dtoIn);
    // hds 1.2, 1.3
    let uuAppErrorMap = ValidationHelper.processValidationResult(dtoIn,
      validationResult,
      WARNINGS.getUnsupportedKeys.code, Errors.Get.InvalidDtoIn);
    // hds 2
    // hds 3
    let dtoOut = await this._getJoke(awid, dtoIn.id, uuAppErrorMap)
    dtoOut.uuAppErrorMap = uuAppErrorMap;
    // hds 4
    return dtoOut;
  }
  async _getJoke(awid, id, uuAppErrorMap) {
    let loadedJoke;
    try {
      loadedJoke = await this.dao.get(awid, id);
    } catch (e) {
      // AS 2.1. - Throw exchangeRateDaoGetFailed exception, which writes the error
      // in dtoOut.uuAppErrorMap, and terminate.
      if (e instanceof ObjectStoreError) {
        throw new Errors.Get.JokeDaoUpdateFailed({uuAppErrorMap}, e);
      }
      throw e;
    }
    if (!loadedJoke) {
      // AS 2.2. - Throw exchangeRateNotFound exception, which writes the error
      // in dtoOut.uuAppErrorMap, and terminate.
      throw new Errors.Get.JokeDoesNotExist({uuAppErrorMap}, {jokeId: id});
    }
    return loadedJoke;
  }
  async update(awid, dtoIn, session, authorizationResult) {
    // 2. Performs a logical check of dtoIn.
    let validationResult = this.validator.validate("jokeUpdateDtoInType",
      dtoIn);
    // hds 1.2, 1.3 // A1, A2
    let uuAppErrorMap = ValidationHelper.processValidationResult(dtoIn,
      validationResult,
      WARNINGS.updateUnsupportedKeys.code, Errors.Update.InvalidDtoIn);
    // 3. Loads the Joke uuObject according to dtoIn.id (by joke DAO get). (A5)
    let loadedJoke = await this._getJoke(awid, dtoIn.id, uuAppErrorMap);
    // 4. Validates users authorization to update the joke, e.g. user is in Authorities profile or uuIdentity of logged user is the same as joke.uuIdentity. (A6)

    // if (this._isUserAuthorizedForAction(loadedJoke.uuIdentity, session,
    //   authorizationResult)) {
    //   throw new Errors.Update.UserNotAuthorized({uuAppErrorMap})
    // }

    // 5. For all categories in categoryIdList in dtoIn verifies the existence of the category by Id (category DAO listByCategoryIdList). (A7)
    // 6. If the dtoIn contains key image, finds the value of joke.image from uuObject joke loaded in HDS 3.
    if (dtoIn.image) {
      //6.1. If it is null, calls the createBinary method from the uuAppBinaryStore library with attributes - data: dtoIn.image. (A8)
      if (!loadedJoke.image) {
        dtoIn = await this._saveImageData(awid, dtoIn)
        loadedJoke.image = dtoIn.image;
        //6.2. If it is not null, calls the updateBinaryData method from the uuAppBinaryStore library with attributes - data: dtoIn.image, code: "joke.image" and revisionStrategy: "NONE". (A9)
      } else {
        await this._updateJokeImage(awid, loadedJoke.image ,dtoIn, uuAppErrorMap)
      }
    }
    // 7. Checked dtoIn is saved to the uuAppObjectStore (through joke DAO update). (A10)
    loadedJoke.name = dtoIn.name;
    loadedJoke.text = dtoIn.text

    let updated = await this._updateJoke(awid, loadedJoke, uuAppErrorMap)
    // 8. Returns properly filled out dtoOut.
    return {joke: updated, uuAppErrorMap: uuAppErrorMap}
  }
  // async _getJoke(awid, id, uuAppErrorMap) {
  //   let loadedJoke;
  //   try {
  //     loadedJoke = await this.jokeDao.get(awid, id);
  //   } catch (e) {
  //     // AS 2.1. - Throw exchangeRateDaoGetFailed exception, which writes the error
  //     // in dtoOut.uuAppErrorMap, and terminate.
  //     if (e instanceof ObjectStoreError) {
  //       throw new Errors.Update.JokeDaoUpdateFailed({uuAppErrorMap}, e);
  //     }
  //     throw e;
  //   }
  //   if (!loadedJoke) {
  //     // AS 2.2. - Throw exchangeRateNotFound exception, which writes the error
  //     // in dtoOut.uuAppErrorMap, and terminate.
  //     throw new Errors.Update.JokeDoesNotExist({uuAppErrorMap}, {jokeId: id});
  //   }
  //   return loadedJoke;
  // }
  _isUserAuthorizedForAction(uuIdentity, session, authorizationResult) {
    return !(uuIdentity === session.getIdentity().getUuIdentity()
      || authorizationResult.getAuthorizedProfiles().includes(
        EXECUTIVES_PROFILE));
  }
  async _updateJoke(awid, dtoIn, uuAppErrorMap) {
      return await this.dao.findOneAndUpdate(dtoIn);
  }

}

module.exports = new JokeAbl();
