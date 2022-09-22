const { assert } = require("chai");
const { flatten } = require("../lib/arrays");

describe("utils", () => {
  it("should return a flattened list of arrays", () => {
    let testData = [
      "one",
      ["two"],
      [["three", "four"]],
      [[["five", "six", [["seven"]]]]],
    ];
    let expectedData = ["one", "two", "three", "four", "five", "six", "seven"];
    let actualData = flatten(testData);
    assert.deepEqual(actualData, expectedData, "it should flatten the array");
  });
});
