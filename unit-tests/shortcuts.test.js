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
  describe("isEmpty", () => {
    let isEmpty = shortcuts.isEmpty;
    it("should return false if not empty", () => {
      assert.deepEqual(isEmpty(["test"]), false, "should return correct keys");
    });
  });
  describe("objectAtFirstKey", () => {
    it("should return the object", () => {
      let actualData = shortcuts.objectAtFirstKey({
        sub_obj: {
          one: "one",
        },
      });
      assert.deepEqual(actualData, { one: "one" }, "it should return object");
    });
  });
  describe("keyValueType", () => {
    it("should return the object key type", () => {
      let actualData = shortcuts.keyValueType({
        sub_obj: {
          one: "one",
        },
      }, "sub_obj");
      assert.deepEqual(actualData, "object", "it should return object");
    });
  });
  describe("isString", () => {
    let isString = shortcuts.isString;
    it("should return true if string", () => {
      assert.isTrue(isString("string"))
    })
    it("should return false if not string", () => {
      assert.isFalse(isString())
    })
  })
  describe("isBoolean", () => {
    let isBoolean = shortcuts.isBoolean;
    it("should return true if boolean", () => {
      assert.isTrue(isBoolean(true))
    })
    it("should return false if not string", () => {
      assert.isFalse(isBoolean())
    })
  })
  describe("isIpv4CidrOrAddress", () => {
    let isIpv4CidrOrAddress = shortcuts.isIpv4CidrOrAddress;
    it("should return true if ipv4 cidr block", () => {
      let actualData = isIpv4CidrOrAddress("10.0.0.0/8");
      assert.isTrue(actualData, "it should be true");
    });
    it("should return false if invalid ipv4 cidr block", () => {
      let actualData = isIpv4CidrOrAddress("310.0.0.0/8");
      assert.isFalse(actualData, "it should be false");
    });
  });
  describe("validIpv4Test", () => {
    let validIpv4Test = shortcuts.validIpv4Test;
    it("should throw an error if address is invalid", () => {
      let task = () => {
        validIpv4Test("test", "honk");
      };
      assert.throws(
        task,
        "test expected valid ipv4 address or CIDR block, got honk"
      );
    });
    it("should not throw an error if address is vaid", () => {
      let task = () => {
        validIpv4Test("test", "1.2.3.4/5");
      };
      assert.doesNotThrow(task, "no throw");
    });
  });
});
