const { assert } = require("chai");
const { transpose } = require("../lib/objects");

describe("objects", () => {
  describe("transpose", () => {
    it("should add values from one object to another", () => {
      let obj1 = { one: 1 };
      let obj2 = { two: 2 };
      transpose(obj2, obj1);
      assert.deepEqual(obj1, { one: 1, two: 2 }, "it should merge objects");
    });
  });
});
