const { assert } = require("chai");
const shortcuts = require("../lib/shortcuts");

describe("shortcuts", () => {
  describe("keys", () => {
    it("should return correct keys", () => {
      let keys = shortcuts.keys;
      assert.deepEqual(
        keys({ test: true }),
        ["test"],
        "should return correct keys"
      );
    });
  });
  describe("containsKeys", () => {
    let containsKeys = shortcuts.containsKeys;
    it("should return true if key exists in object", () => {
      assert.isTrue(containsKeys({ test: true }, "test"));
    });
    it("should return false if key does not exist in object", () => {
      assert.isTrue(containsKeys({ test: true }, "test"));
    });
    it("should return false if the get type is not an object and is lazy", () => {
      assert.isFalse(containsKeys("frog", "no", true), "it should be false");
    });
  });
  describe("contains", () => {
    let contains = shortcuts.contains;
    it("should return true if string in string", () => {
      assert.isTrue(contains("test", "es"), "should be true");
    });
    it("should return false if string not in string", () => {
      assert.isFalse(contains("test", "frog"), "should be false");
    });
    it("should return true if item in array", () => {
      assert.isTrue(contains(["test"], "test"), "should be true");
    });
    it("should return false if item not in array", () => {
      assert.isFalse(contains(["test"], "frog"), "should be true");
    });
  });
  describe("eachKey", () => {
    let eachKey = shortcuts.eachKey;
    it("should correctly run eachKey", () => {
      let testData = [];
      eachKey({ test: "test" }, (key) => testData.push(key));
      assert.deepEqual(testData, ["test"], "it should return correct data");
    });
  });
  describe("azsort", () => {
    it("should return -1 if string a is less than string b", () => {
      let actualData = shortcuts.azsort("a", "b");
      assert.deepEqual(actualData, -1, "it should return -1");
    });
    it("should return 1 if string a is greater than string b", () => {
      let actualData = shortcuts.azsort(3, 2);
      assert.deepEqual(actualData, 1, "it should return 11");
    });
    it("should return 0 if string a is equal to string b", () => {
      let actualData = shortcuts.azsort(2, 2);
      assert.deepEqual(actualData, 0, "it should return 11");
    });
  });
  describe("distinct", () => {
    it("should remove duplicate string entries from an array of strings", () => {
      let expectedData = ["hi"];
      let actualData = shortcuts.distinct(["hi", "hi"]);
      assert.deepEqual(actualData, expectedData, "it should return array");
    });
  });
});
