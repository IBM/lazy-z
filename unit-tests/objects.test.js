const { assert } = require("chai");
const {
  transpose,
  spreadKeyValues,
  splat,
  hasDuplicateKeys,
  duplicateKeyTest,
  arraySplatIndex,
  getObjectFromArray,
  carve,
  allFieldsNull,
  splatContains,
  nullOrEmptyStringFields,
  recursiveTranspose,
} = require("../lib/objects");

describe("objects", () => {
  describe("transpose", () => {
    it("should add values from one object to another", () => {
      let obj1 = { one: 1 };
      let obj2 = { two: 2 };
      transpose(obj2, obj1);
      assert.deepEqual(obj1, { one: 1, two: 2 }, "it should merge objects");
    });
  });
  describe("spreadValues", () => {
    it("should return the values as an array", () => {
      let actualData = spreadKeyValues({
        test: 1,
        test_2: "test",
      });
      let expectedData = [1, "test"];
      assert.deepEqual(actualData, expectedData, "it should return array");
    });
  });
  describe("splat", () => {
    it("should return the values as an array", () => {
      let actualData = splat(
        [
          {
            name: "todd",
          },
          {
            name: "egg",
          },
          {
            name: "frog",
          },
        ],
        "name",
      );
      assert.deepEqual(
        actualData,
        ["todd", "egg", "frog"],
        "should return array",
      );
    });
  });
  describe("splatContains", () => {
    it("should return the values as an array", () => {
      let actualData = splatContains(
        [
          {
            name: "todd",
          },
          {
            name: "egg",
          },
          {
            name: "frog",
          },
        ],
        "name",
        "egg",
      );
      assert.deepEqual(actualData, true, "should contain egg");
    });
  });
  describe("hasDuplicateKeys", () => {
    let arr = [
      {
        name: "todd",
      },
      {
        name: "egg",
      },
      {
        name: "frog",
      },
    ];
    it("should return true if duplicate keys", () => {
      assert.isTrue(hasDuplicateKeys(arr, "name", "todd"), "todd is here");
    });
    it("should return false if no duplicate keys", () => {
      assert.isFalse(hasDuplicateKeys(arr, "name", "ham"), "ham is not here");
    });
  });
  describe("duplicateKeyTest", () => {
    it("should not throw if not duplicate", () => {
      let arr = [
        {
          name: "todd",
        },
        {
          name: "egg",
        },
        {
          name: "frog",
        },
      ];
      let task = () => {
        duplicateKeyTest("test", arr, "name", "ham");
      };
      assert.doesNotThrow(task);
    });
    it("should throw if duplicate", () => {
      let arr = [
        {
          name: "todd",
        },
        {
          name: "egg",
        },
        {
          name: "frog",
        },
      ];
      let task = () => {
        duplicateKeyTest("test", arr, "name", "todd");
      };
      assert.throws(
        task,
        "test expected no duplicate keys for name. Duplicate value: todd",
      );
    });
  });
  describe("arraySplatIndex", () => {
    it("should return the correct index", () => {
      let arr = [
        {
          name: "todd",
        },
        {
          name: "egg",
        },
        {
          name: "frog",
        },
      ];
      assert.deepEqual(
        arraySplatIndex(arr, "name", "todd"),
        0,
        "it should return index",
      );
    });
  });
  describe("getObjectFromArray", () => {
    it("should return the correct object", () => {
      let arr = [
        {
          name: "todd",
        },
        {
          name: "egg",
        },
        {
          name: "frog",
        },
      ];
      assert.deepEqual(
        getObjectFromArray(arr, "name", "todd"),
        {
          name: "todd",
        },
        "it should return index",
      );
    });
  });
  describe("carve", () => {
    it("should remove and return object", () => {
      let arr = [
        {
          name: "todd",
        },
        {
          name: "egg",
        },
        {
          name: "frog",
        },
      ];
      let returnedValue = carve(arr, "name", "todd");
      assert.deepEqual(
        returnedValue,
        [{ name: "todd" }],
        "it should carve out value",
      );
      assert.deepEqual(
        arr,
        [
          {
            name: "egg",
          },
          {
            name: "frog",
          },
        ],
        "it should change array in place",
      );
    });
    it("should throw an error if trying to carve unfound object", () => {
      let arr = [
        {
          name: "todd",
        },
        {
          name: "egg",
        },
        {
          name: "frog",
        },
      ];
      let task = () => {
        carve(arr, "name", "ronald");
      };
      assert.throws(
        task,
        "carve expected object with name value ronald. Found no matching entries.",
      );
    });
  });
  describe("allFieldsNull", () => {
    it("should return true if all fields are null", () => {
      assert.isTrue(allFieldsNull({ one: null }), "it should be true");
    });
    it("should return false if all fields not null", () => {
      assert.isFalse(
        allFieldsNull({ one: null, two: 2 }),
        "it should be false",
      );
    });
    describe("nullorEmptyStringFields", () => {
      it("should return true if any obj values are null", () => {
        let obj = { test: "one", test_2: null, test_3: "three" };
        let keyArr = ["test", "test_2", "test_3"];
        assert.isTrue(
          nullOrEmptyStringFields(obj, keyArr),
          "it should be true",
        );
      });
      it("should return true if any obj values are empty", () => {
        let obj = { test: "one", test_2: "", test_3: "three" };
        let keyArr = ["test", "test_2", "test_3"];
        assert.isTrue(
          nullOrEmptyStringFields(obj, keyArr),
          "it should be true",
        );
      });
      it("should return false if no obj values are null or empty", () => {
        let obj = { test: "one", test_2: "two", test_3: "three" };
        let keyArr = ["test", "test_2", "test_3"];
        assert.isFalse(
          nullOrEmptyStringFields(obj, keyArr),
          "it should be false",
        );
      });
    });
  });
  describe("recursiveTranspose", () => {
    it("should update string, boolean, and number values found on both source and destination", () => {
      let source = {
        frog: 3,
        toad: "yes",
        friends: true,
      };
      let destination = {};

      recursiveTranspose(source, destination);
      assert.deepEqual(source, destination, "it should set values of object");
    });
    it("should set a value on destination object", () => {
      let source = { frog: true };
      let destination = {};
      recursiveTranspose(source, destination);
      assert.deepEqual(source, destination, "it should set values of object");
    });
    it("should set a value on destination object", () => {
      let source = {
        frog: {
          toad: true,
        },
      };
      let destination = {
        frog: {},
      };
      recursiveTranspose(source, destination);
      assert.deepEqual(source, destination, "it should set values of object");
    });
    it("should set a value on destination array of objects", () => {
      let source = {
        frog: [
          {
            name: "hello",
          },
          {
            name: "world",
          },
        ],
      };
      let destination = {
        frog: [{}, {}],
      };
      recursiveTranspose(source, destination);
      assert.deepEqual(source, destination, "it should set values of object");
    });
    it("should add unfound objects", () => {
      let source = {
        frog: [
          {
            name: "hello",
          },
          {
            name: "world",
          },
          {
            name: "toad",
          },
        ],
      };
      let destination = {
        frog: [{}, {}],
      };
      recursiveTranspose(source, destination);
      assert.deepEqual(source, destination, "it should set values of object");
    });
    it("should remove deleted objects", () => {
      let source = {
        frog: [
          {
            name: "hello",
          },
          {
            name: "world",
          },
        ],
      };
      let destination = {
        frog: [
          {
            name: "hello",
          },
          {
            name: "world",
          },
          {
            name: "toad",
          },
        ],
      };
      recursiveTranspose(source, destination);
      assert.deepEqual(source, destination, "it should set values of object");
    });
    it("should update an array of strings", () => {
      let source = {
        frog: ["1", "2", "3", "4"],
      };
      let destination = {
        frog: ["4", "5", "6", "7"],
      };

      recursiveTranspose(source, destination);
      assert.deepEqual(source, destination, "it should set values of object");
    });
    it("should update an array of strings and reduce", () => {
      let source = {
        frog: ["1", "2", "3"],
      };
      let destination = {
        frog: ["1", "5", "3", "7"],
      };

      recursiveTranspose(source, destination);
      assert.deepEqual(source, destination, "it should set values of object");
    });
  });
});
