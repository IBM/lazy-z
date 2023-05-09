const { assert } = require("chai");
const {
  flatten,
  numberStringList,
  nestedSplat,
  deleteUnfoundArrayItems,
  anyAreEmpty,
} = require("../lib/arrays");

describe("arrays", () => {
  describe("flatten", () => {
    it("should return a flattened list of arrays", () => {
      let testData = [
        "one",
        ["two"],
        [["three", "four"]],
        [[["five", "six", [["seven"]]]]],
      ];
      let expectedData = [
        "one",
        "two",
        "three",
        "four",
        "five",
        "six",
        "seven",
      ];
      let actualData = flatten(testData);
      assert.deepEqual(actualData, expectedData, "it should flatten the array");
    });
  });
  describe("numberStringList", () => {
    it("should return array when no add", () => {
      assert.deepEqual(
        numberStringList(3),
        ["0", "1", "2"],
        "it should return a list"
      );
    });
    it("should return array when add", () => {
      assert.deepEqual(
        numberStringList(3, 1),
        ["1", "2", "3"],
        "it should return a list"
      );
    });
  });
  describe("nestedSplat", () => {
    it("should return a list of names from an array within an array", () => {
      let actualData = nestedSplat(
        [
          {
            name: "foo",
            items: [
              {
                name: "item-1",
              },
              {
                name: "item-2",
              },
            ],
          },
          {
            name: "bar",
            items: [
              {
                name: "item-3",
              },
              {
                name: "item-4",
              },
            ],
          },
        ],
        "items",
        "name"
      );
      let expectedData = ["item-1", "item-2", "item-3", "item-4"];
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct array"
      );
    });
  });
  describe("deleteUnfoundArrayItems", () => {
    it("should remove unfound items", () => {
      let actualData = deleteUnfoundArrayItems(
        ["foo", "bar", "baz"],
        ["baz", "bork"]
      );
      let expectedData = ["baz"];
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct array"
      );
    });
  });
  describe("anyAreEmpty", () => {
    it("should return true if any array passed as props are empty", () => {
      let actualData = anyAreEmpty(["frog"], []);
      assert.isTrue(actualData, "it should return true");
    });
  });
});
