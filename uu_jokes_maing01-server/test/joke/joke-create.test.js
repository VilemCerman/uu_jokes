const { TestHelper } = require("uu_appg01_server-test");

beforeEach(async () => {
  await TestHelper.setup({ authEnabled: false, sysStatesEnabled: false });
});

afterEach(async () => {
  await TestHelper.teardown();
});

describe("uuCmd joke/create", () => {
  test("hds", async () => {
    const dtoIn = {
      name: "Very Funny Joke",
      categoryName: "Very funny jokes",
      text: "Something very funny",
    };
    const result = await TestHelper.executePostCommand("joke/create", dtoIn);

    expect(result.data.name).toEqual(dtoIn.name);
    expect(result.data.categoryName).toEqual(dtoIn.categoryName);
    expect(result.data.text).toEqual(dtoIn.text);
    expect(result.data.uuAppErrorMap).toEqual({});
  });

  test("invalid dtoIn", async () => {
    expect.assertions(3);
    try {
      await TestHelper.executePostCommand("joke/create", {});
    } catch (e) {
      expect(e.code).toEqual("uu-jokes-main/joke/create/invalidDtoIn");
      expect(Object.keys(e.paramMap.missingKeyMap).length).toEqual(1);
      expect(e.status).toEqual(400);
    }
  });
});
