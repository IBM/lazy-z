const { assert } = require("chai");
const utils = require("../lib/strings");
const { prettyJSON } = require("../lib/shortcuts");

describe("string functions", () => {
  describe("remove trailing spaces", () => {
    it("should remove spaces from the end of a string", () => {
      let expectedData = "test";
      let actualData = utils.removeTrailingSpaces("test        ");
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return the correct string"
      );
    });
  });
  describe("stringify", () => {
    it("should return string if function", () => {
      let expectedData = (() => {}).toString();
      let actualData = utils.stringify(() => {});
      assert.deepEqual(
        actualData,
        expectedData,
        "should return correct string"
      );
    });
    it("should return string if object", () => {
      let expectedData = prettyJSON({ key: "value" });
      let actualData = utils.stringify({ key: "value" });
      assert.deepEqual(
        actualData,
        expectedData,
        "should return correct string"
      );
    });
    it("should return string if array", () => {
      let expectedData = prettyJSON(["foo"]);
      let actualData = utils.stringify(["foo"]);
      assert.deepEqual(
        actualData,
        expectedData,
        "should return correct string"
      );
    });
    it("should return string if bool or number", () => {
      let expectedData = "2";
      let actualData = utils.stringify(2);
      assert.deepEqual(
        actualData,
        expectedData,
        "should return correct string"
      );
    });
  });
  describe("capitalize", () => {
    it("should return a string with the first letter uppercase", () => {
      let expectedData = "Hello";
      let actualData = utils.capitalize("hello");
      assert.deepEqual(
        actualData,
        expectedData,
        "it should capitalize the word"
      );
    });
  });
});
