const { assert } = require("chai");
const { isInRange } = require("../lib/numbers");

describe("number methods", () => {
  describe("isInRange", () => {
    it("should return true if a number is in a range", () => {
      assert.isTrue(isInRange(1.5, 1, 2), "it should be in the range");
    });
    it("should return false if a number is not in a range", () => {
      assert.isTrue(isInRange(1.5, 0, 1), "it should be in the range");
    });
    it("should throw an error if min is greater than max", () => {
      let task = () => isInRange(1, 5, 1);
      assert.throws(
        task,
        "isInRange expects min(5) to be less than or equal to max(1)."
      );
    });
  });
});
