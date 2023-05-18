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
      text: "Something very funny",
    };
    const result = await TestHelper.executePostCommand("joke/create", dtoIn);

    expect(result.data.name).toEqual(dtoIn.name);
    expect(result.data.text).toEqual(dtoIn.text);
    expect(result.data.awid).toEqual(TestHelper.awid);
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

  test("textContainsFishyWords", async () => {
    expect.assertions(4);
    const dtoIn = {
      name: "Fishy joke",
      text: "A broccoli is super fun.",
    };

    try {
      await TestHelper.executePostCommand("joke/create", dtoIn);
    } catch (e) {
      expect(e.code).toEqual("uu-jokes-main/joke/create/textContainsFishyWords");
      expect(e.paramMap.text).toEqual("A broccoli is super fun.");
      expect(e.paramMap.fishyWord).toEqual("broccoli");
      expect(e.status).toEqual(400);
    }
  });
});
