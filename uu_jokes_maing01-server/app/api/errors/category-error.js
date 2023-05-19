"use strict";

const UuCategoryError = require("./uu-categories-error");

const Create = {
  UC_CODE: `${UuCategoryError.ERROR_PREFIX}category/create/`,

  InvalidDtoIn: class extends UuCategoryError {
    constructor() {
      super(...arguments);
      this.code = `${Create.UC_CODE}invalidDtoIn`;
      this.message = "DtoIn is not valid.";
    }
  },
  JokeDaoCreateFailed: class extends UuCategoryError {
    constructor() {
      super(...arguments);
      this.code = `${Create.UC_CODE}categoryDaoCreateFailed`;
      this.message = "Create category by category Dao create failed.";
    }
  },
  JokeImageDaoCreateFailed: class extends UuCategoryError {
    constructor() {
      super(...arguments);
      this.code = `${Create.UC_CODE}categoryImageDaoCreateFailed`;
      this.message = "Create of categoryImage by categoryImage Dao create failed.";
    }
  },
  InvalidPhotoContentType: class extends UuCategoryError {
    constructor() {
      super(...arguments);
      this.code = `${Create.UC_CODE}invalidPhotoContentType`;
      this.message = "ContentType of new photo is invalid.";
    }
  },
};

const Get = {
  UC_CODE: `${UuCategoryError.ERROR_PREFIX}get/`,

  InvalidDtoIn: class extends UuCategoryError {
    constructor() {
      super(...arguments);
      this.code = `${Get.UC_CODE}invalidDtoIn`;
      this.message = "DtoIn is not valid.";
    }
  },
  JokeDoesNotExist: class extends UuCategoryError {
    constructor() {
      super(...arguments);
      this.code = `${Get.UC_CODE}categoryDoesNotExist`;
      this.status = 404,
        this.message = "Joke does not exist..";
    }
  },
  CategoryInstanceIsUnderConstruction : class extends UuCategoryError {
    constructor() {
      super(...arguments);
      this.code = `${Get.UC_CODE}categoriesInstanceIsUnderConstruction`;
      this.message = "CategoryInstance is in underConstruction state";
    }
  },
  CategoryInstanceNotInProperState : class extends UuCategoryError {
    constructor() {
      super(...arguments);
      this.code = `${Get.UC_CODE}categoriesInstanceNotInProperState`;
      this.message = "CategoryInstance is not in proper state [active|underConstruction].";
    }
  },

  categoriesInstanceDoesNotExist : class extends UuCategoryError {
    constructor() {
      super(...arguments);
      this.code = `${Get.UC_CODE}categoriesInstanceDoesNotExist`;
      this.message = "CategoryInstance does not exist.";
    }
  },
};

const List = {
  UC_CODE: `${UuCategoryError.ERROR_PREFIX}list/`,

  InvalidDtoIn: class extends UuCategoryError {
    constructor() {
      super(...arguments);
      this.code = `${List.UC_CODE}invalidDtoIn`;
      this.message = "DtoIn is not valid.";
    }
  }
};

const Delete = {
  UC_CODE: `${UuCategoryError.ERROR_PREFIX}delete/`,

  InvalidDtoIn: class extends UuCategoryError {
    constructor() {
      super(...arguments);
      this.code = `${Delete.UC_CODE}invalidDtoIn`;
      this.message = "DtoIn is not valid.";
    }
  },
  UserNotAuthorized: class extends UuCategoryError {
    constructor() {
      super(...arguments);
      this.code = `${Delete.UC_CODE}userNotAuthorized`;
      this.message = "User not authorized.";
    }
  },
  JokeDoesNotExist: class extends UuCategoryError {
    constructor() {
      super(...arguments);
      this.code = `${Delete.UC_CODE}categoryDoesNotExist`;
      this.status = 404,
        this.message = "Joke does not exist.";
    }
  },
  CategoryInstanceNotInProperState	: class extends UuCategoryError {
    constructor() {
      super(...arguments);
      this.code = `${Delete.UC_CODE}categoriesInstanceNotInProperState`;
      this.message = "CategoryInstance is not in proper state [active|underConstruction].";
    }
  },
  CategoryInstanceDoesNotExist	: class extends UuCategoryError {
    constructor() {
      super(...arguments);
      this.code = `${Delete.UC_CODE}categoriesInstanceDoesNotExist`;
      this.message = "CategoryInstance does not exist.";
    }
  },
  UuBinaryDeleteFailed: class extends UuCategoryError {
    constructor() {
      super(...arguments);
      this.code = `${Delete.UC_CODE}uuBinaryDeleteFailed`;
      this.message = "Deleting uuBinary failed.";
    }
  },
};

const Update = {
  UC_CODE: `${UuCategoryError.ERROR_PREFIX}update/`,

  InvalidDtoIn: class extends UuCategoryError {
    constructor() {
      super(...arguments);
      this.code = `${Update.UC_CODE}invalidDtoIn`;
      this.message = "DtoIn is not valid.";
    }
  },
  CategoryInstanceDoesNotExist: class extends UuCategoryError {
    constructor() {
      super(...arguments);
      this.code = `${Update.UC_CODE}categoriesInstanceDoesNotExist`;
      this.message = "CategoryInstance does not exist.";
    }
  },
  CategoryInstanceNotInProperState: class extends UuCategoryError {
    constructor() {
      super(...arguments);
      this.code = `${Update.UC_CODE}categoriesInstanceNotInProperState`;
      this.message = "CategoryInstance is not in proper state [active|underConstruction].";
    }
  },
  JokeDoesNotExist: class extends UuCategoryError {
    constructor() {
      super(...arguments);
      this.code = `${Update.UC_CODE}categoryDoesNotExist`;
      this.status = 404,
        this.message = "Joke does not exist.";
    }
  },
  UserNotAuthorized: class extends UuCategoryError {
    constructor() {
      super(...arguments);
      this.code = `${Update.UC_CODE}userNotAuthorized`;
      this.message = "User not authorized.";
    }
  },
  JokeDaoUpdateFailed: class extends UuCategoryError {
    constructor() {
      super(...arguments);
      this.code = `${Update.UC_CODE}categoryDaoUpdateFailed`;
      this.message = "Update category by category Dao update failed.";
    }
  }
};


module.exports = {
  Update,
  Delete,
  List,
  Get,
  Create
};
