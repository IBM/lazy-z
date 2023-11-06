const { assert } = require("chai");
const {
  isInRange,
  validPortRange,
  areNotWholeNumbers,
  haveValidRanges,
  portRangeInvalid,
  rangeInvalid,
} = require("../lib/numbers");

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
        "isInRange expects min(5) to be less than or equal to max(1).",
      );
    });
  });
  describe("validPortRange", () => {
    it("should throw an error when an invalid name is passed", () => {
      let task = () => validPortRange("frog");
      assert.throws(
        task,
        `Name must be one of the following: ["type","code","port_min","port_max","source_port_min","source_port_max"] got frog`,
      );
    });
    it("should throw an error when value is not an integer", () => {
      let task = () => validPortRange("type", "string");
      assert.throws(
        task,
        "validPortRange expects an integer to be parsed from value. Got type of string for value string.",
      );
    });
    it("should return true if the port range is not icmp and is valid", () => {
      assert.isTrue(validPortRange("source_port_min", 2), "it should be true");
    });
    it("should return true if type range is valid", () => {
      assert.isTrue(validPortRange("type", 254), "it should be true");
    });
    it("should return false if type range is not valid", () => {
      assert.isFalse(validPortRange("type", 255), "it should be true");
    });
    it("should return false if code range is not valid", () => {
      assert.isFalse(validPortRange("code", 256), "it should be true");
    });
    it("should return false if the port range is not icmp and is not valid", () => {
      assert.isFalse(
        validPortRange("source_port_min", 0),
        "it should be false",
      );
    });
  });
  describe("areNotWholeNumbers", () => {
    it("should return true if any number is not whole", () => {
      assert.isTrue(areNotWholeNumbers(1, 3, 4, 6.3), "it should be true");
    });
  });
  describe("haveValidRanges", () => {
    it("should return true if any range invalid", () => {
      assert.isFalse(
        haveValidRanges([1, 0, 2], [3, 1, 2]),
        "it should return false",
      );
    });
  });
  describe("portRangeInvalid", () => {
    it("should return true if port value is not a whole number ", () => {
      assert.isTrue(portRangeInvalid("code", 8080.1), "it should return true");
    });
    it("should return true if port value is empty", () => {
      assert.isTrue(portRangeInvalid("port_max", ""), "it should return true");
    });
    it("should return false if port range is valid", () => {
      assert.isFalse(
        portRangeInvalid("port_min", 3000),
        "it should return false",
      );
    });
  });
  describe("rangeInvalid", () => {
    it("should return true if value is not a whole number ", () => {
      assert.isTrue(rangeInvalid(0.1, 0, 5), "it should return true");
    });
    it("should return true if value is empty", () => {
      assert.isTrue(rangeInvalid("", 0, 5), "it should return true");
    });
    it("should return false if value is within the range", () => {
      assert.isFalse(rangeInvalid(100, 100, 101), "it should return false");
    });
  });
});
