const { assert } = require("chai");
const sinon = require("sinon");
const { isFunction } = require("../lib/shortcuts");
const { createStore, lazyZstate, storeTemplate } = require("../lib/store");

describe("store", () => {
  describe("createStore", () => {
    it("should throw an error if defaults contains a key other than _defaults and _no_default", () => {
      let task = () => createStore({ frog: true });
      assert.throws(
        task,
        `createStore expects defaults to only have keys _defaults and _no_default, got ["frog"]`,
      );
    });
    it("if no store is passed, it should create a store with only default values", () => {
      let actualData = createStore({
        _defaults: {
          frog: true,
          numbers: [1, 2, 3, 4],
          data: {
            foo: "baz",
          },
        },
        _no_default: ["todd"],
      });
      let expectedData = {
        frog: true,
        numbers: [1, 2, 3, 4],
        data: {
          foo: "baz",
        },
        todd: null,
      };
      assert.deepEqual(actualData, expectedData, "it should set defaults");
    });
    it("if store is passed, it should transpose store values to object on return", () => {
      let actualData = createStore(
        {
          _defaults: {
            frog: true,
            numbers: [1, 2, 3, 4],
            data: {
              foo: "baz",
            },
          },
          _no_default: ["todd"],
        },
        {
          frog: "yes",
          hi: "mom",
        },
      );
      let expectedData = {
        frog: "yes",
        numbers: [1, 2, 3, 4],
        data: {
          foo: "baz",
        },
        todd: null,
        hi: "mom",
      };
      assert.deepEqual(actualData, expectedData, "it should set defaults");
    });
  });
  describe("storeTemplate", () => {
    it("should throw an error if top level component and no initialization", () => {
      let task = () => storeTemplate({}, "hi", {});
      assert.throws(
        task,
        "lazyZstate store template expects top level components to have init function, got undefined.",
      );
    });
    it("should initialize an empty object when init is passed and object not found in store", () => {
      let expectedData = {
        frog: {},
      };
      let actualData = {};
      let initSpy = new sinon.spy();
      storeTemplate(actualData, "frog", {
        init: initSpy,
      });
      assert.deepEqual(actualData, expectedData, "it should set after init");
      assert.isTrue(initSpy.calledOnce, "it should be called");
    });
    it("should not initialize an empty object when init is passed and object is found in store", () => {
      let expectedData = {
        frog: { foo: "baz" },
      };
      let actualData = {
        frog: {
          foo: "baz",
        },
      };
      storeTemplate(actualData, "frog", { init: function (state) {} });
      assert.deepEqual(actualData, expectedData, "it should set after init");
    });
    it("should initialize onStoreUpdate when passed", () => {
      let actualData = {
        updateFunctions: [],
        tryCatch: function (callback) {
          callback();
        },
      };
      let test = false;
      storeTemplate(actualData, "frog", {
        init: function (state) {},
        onStoreUpdate: function () {
          test = true;
        },
      });
      actualData.updateFunctions[0]();
      assert.deepEqual(
        actualData.updateFunctions.length,
        1,
        "it should set after init",
      );
      assert.isTrue(test, "it should be true after update");
    });
    it("should initialize create when passed", () => {
      let actualData = {
        updateFunctions: [],
        tryCatch: function (callback) {
          callback();
        },
      };
      let test = false;
      storeTemplate(actualData, "frog", {
        init: function (state) {},
        onStoreUpdate: function () {},
        create: function () {
          test = true;
        },
      });
      actualData.frog.create();
      assert.isTrue(
        isFunction(actualData.frog.create) && test,
        "it should be a function and should update test",
      );
    });
    it("should initialize create when passed as a subComponent function", () => {
      let actualData = {
        updateFunctions: [],
        tryCatch: function (callback) {
          callback();
        },
      };
      let test = false;
      storeTemplate(actualData, "frog", {
        init: function (state) {},
        onStoreUpdate: function () {},
        subComponents: {
          egg: {
            create: function () {
              test = true;
            },
          },
        },
      });
      actualData.frog.egg.create();
      assert.isTrue(
        isFunction(actualData.frog.egg.create) && test,
        "it should be a function and should update test",
      );
    });
  });
  describe("state", () => {
    describe("initStore", () => {
      it("should initialize store data with no defaults and no store", () => {
        let actualData = new lazyZstate().store;
        let expectedData = {};
        assert.deepEqual(actualData, expectedData, "it should be empty object");
      });
    });
    describe("setUpdateCallback", () => {
      it("should set the update callback", () => {
        let slz = new lazyZstate();
        let callback = () => {
          console.log("hi");
        };
        slz.setUpdateCallback(callback);
        assert.deepEqual(
          slz.updateCallback.toString(),
          callback.toString(),
          "it should be same function",
        );
      });
    });
    describe("updateCallback", () => {
      it("should throw an error if unset", () => {
        let task = () => new lazyZstate().updateCallback();
        assert.throws(
          task,
          `state.updateCallback expects a callback to be set using state.setUpdateCallback. No callback has been added.`,
        );
      });
    });
    describe("update", () => {
      it("should run each function in update functions", () => {
        let slz = new lazyZstate();
        let updateSpy = new sinon.spy();
        let updateFnSpy = new sinon.spy();
        slz.updateFunctions.push(updateFnSpy);
        slz.setUpdateCallback(updateSpy);
        slz.update();
        assert.isTrue(updateSpy.calledOnce, "it should call");
        assert.isTrue(updateFnSpy.calledOnce, "it should call");
      });
    });
    describe("sendError", () => {
      it("should throw an error message by default", () => {
        let task = () => new lazyZstate().sendError("hi");
        assert.throws(task, "hi");
      });
    });
    describe("setErrorCallback", () => {
      it("should call error callback if one is set", () => {
        let spy = sinon.spy();
        let store = new lazyZstate();
        store.setErrorCallback(spy);
        store.sendError("hi");
        assert.isTrue(spy.calledOnce, "it should be called");
      });
    });
    describe("tryCatch", () => {
      it("should call send error when an error is thrown", () => {
        let slz = new lazyZstate();
        let value;
        slz.setErrorCallback((err) => {
          value = err.message;
        });
        slz.tryCatch(() => {
          throw new Error("frog");
        });
        assert.deepEqual(value, "frog", "it should be frog");
      });
      it("should not throw if function runs successfully", () => {
        let slz = new lazyZstate();
        let task = () =>
          slz.tryCatch(() => {
            return "hi";
          });
        assert.doesNotThrow(task, "it should not throw");
      });
      it("should not throw if function runs successfully and onstore update", () => {
        let slz = new lazyZstate();
        let task = () =>
          slz.tryCatch(() => {
            return "hi";
          }, true);
        assert.doesNotThrow(task, "it should not throw");
      });
    });
    describe("push", () => {
      it("should push to a child array in store when fields array", () => {
        let slz = new lazyZstate();
        slz.store.json = {
          list: [],
        };
        let updateSpy = new sinon.spy();
        let updateFnSpy = new sinon.spy();
        slz.updateFunctions.push(updateFnSpy);
        slz.setUpdateCallback(updateSpy);
        slz.push(["json", "list"], "item");
        assert.deepEqual(
          slz.store,
          {
            json: {
              list: ["item"],
            },
          },
          "it should push to store",
        );
      });
      it("should push to a child array in store when fields is string", () => {
        let slz = new lazyZstate();
        slz.store.list = [];
        let updateSpy = new sinon.spy();
        let updateFnSpy = new sinon.spy();
        slz.updateFunctions.push(updateFnSpy);
        slz.setUpdateCallback(updateSpy);
        slz.push("list", "item");
        assert.deepEqual(
          slz.store,
          {
            list: ["item"],
          },
          "it should push to store",
        );
      });
      it("should throw an error if field is not string or array", () => {
        let slz = new lazyZstate();
        slz.store.json = {
          list: [],
        };
        let updateSpy = new sinon.spy();
        let updateFnSpy = new sinon.spy();
        slz.updateFunctions.push(updateFnSpy);
        slz.setUpdateCallback(updateSpy);
        let task = () => slz.push(2, "item");
        assert.throws(
          task,
          "lazyZstore.push expects fields to be either string or array of strings, got number",
        );
      });
    });
    describe("updateChild", () => {
      it("should update a child object of array in store when fields array", () => {
        let slz = new lazyZstate();
        slz.store.json = {
          list: [
            {
              name: "test",
              foo: "bar",
            },
          ],
        };
        let updateSpy = new sinon.spy();
        let updateFnSpy = new sinon.spy();
        slz.updateFunctions.push(updateFnSpy);
        slz.setUpdateCallback(updateSpy);
        slz.updateChild(["json", "list"], "test", {
          foo: "baz",
        });
        assert.deepEqual(
          slz.store,
          {
            json: {
              list: [
                {
                  name: "test",
                  foo: "baz",
                },
              ],
            },
          },
          "it should push to store",
        );
      });
      it("should update a child object of array in store when fields array and looking up field other than name", () => {
        let slz = new lazyZstate();
        slz.store.json = {
          list: [
            {
              id: "test",
              foo: "bar",
            },
          ],
        };
        let updateSpy = new sinon.spy();
        let updateFnSpy = new sinon.spy();
        slz.updateFunctions.push(updateFnSpy);
        slz.setUpdateCallback(updateSpy);
        slz.updateChild(
          ["json", "list"],
          "test",
          {
            foo: "baz",
          },
          "id",
        );
        assert.deepEqual(
          slz.store,
          {
            json: {
              list: [
                {
                  id: "test",
                  foo: "baz",
                },
              ],
            },
          },
          "it should push to store",
        );
      });
      it("should update a child object of array in store when fields is deep array", () => {
        let slz = new lazyZstate();
        slz.store.json = {
          test: {
            list: [
              {
                name: "test",
                foo: "bar",
              },
            ],
          },
        };
        let updateSpy = new sinon.spy();
        let updateFnSpy = new sinon.spy();
        slz.updateFunctions.push(updateFnSpy);
        slz.setUpdateCallback(updateSpy);
        slz.updateChild(["json", "test", "list"], "test", {
          foo: "baz",
        });
        assert.deepEqual(
          slz.store,
          {
            json: {
              test: {
                list: [
                  {
                    name: "test",
                    foo: "baz",
                  },
                ],
              },
            },
          },
          "it should push to store",
        );
      });
      it("should update a child object of array in store when fields is string", () => {
        let slz = new lazyZstate();
        slz.store.list = [
          {
            name: "test",
            foo: "bar",
          },
        ];
        let updateSpy = new sinon.spy();
        let updateFnSpy = new sinon.spy();
        slz.updateFunctions.push(updateFnSpy);
        slz.setUpdateCallback(updateSpy);
        slz.updateChild("list", "test", {
          foo: "baz",
        });
        assert.deepEqual(
          slz.store,
          {
            list: [
              {
                name: "test",
                foo: "baz",
              },
            ],
          },
          "it should update store",
        );
      });
      it("should update a child object of array in store when fields is string and looking up field other than name", () => {
        let slz = new lazyZstate();
        slz.store.list = [
          {
            id: "test",
            foo: "bar",
          },
        ];
        let updateSpy = new sinon.spy();
        let updateFnSpy = new sinon.spy();
        slz.updateFunctions.push(updateFnSpy);
        slz.setUpdateCallback(updateSpy);
        slz.updateChild(
          "list",
          "test",
          {
            foo: "baz",
          },
          "id",
        );
        assert.deepEqual(
          slz.store,
          {
            list: [
              {
                id: "test",
                foo: "baz",
              },
            ],
          },
          "it should update store",
        );
      });
      it("should update a child object of array in store when fields is array of one string", () => {
        let slz = new lazyZstate();
        slz.store.list = [
          {
            name: "test",
            foo: "bar",
          },
        ];
        let updateSpy = new sinon.spy();
        let updateFnSpy = new sinon.spy();
        slz.updateFunctions.push(updateFnSpy);
        slz.setUpdateCallback(updateSpy);
        slz.updateChild(["list"], "test", {
          foo: "baz",
        });
        assert.deepEqual(
          slz.store,
          {
            list: [
              {
                name: "test",
                foo: "baz",
              },
            ],
          },
          "it should update store",
        );
      });
      it("should update a child object of array in store when fields is string and looking up field other than name", () => {
        let slz = new lazyZstate();
        slz.store.list = [
          {
            id: "test",
            foo: "bar",
          },
        ];
        let updateSpy = new sinon.spy();
        let updateFnSpy = new sinon.spy();
        slz.updateFunctions.push(updateFnSpy);
        slz.setUpdateCallback(updateSpy);
        slz.updateChild(
          ["list"],
          "test",
          {
            foo: "baz",
          },
          "id",
        );
        assert.deepEqual(
          slz.store,
          {
            list: [
              {
                id: "test",
                foo: "baz",
              },
            ],
          },
          "it should update store",
        );
      });
      it("should throw an error if field is not string or array", () => {
        let slz = new lazyZstate();
        slz.store.json = {
          list: [],
        };
        let updateSpy = new sinon.spy();
        let updateFnSpy = new sinon.spy();
        slz.updateFunctions.push(updateFnSpy);
        slz.setUpdateCallback(updateSpy);
        let task = () => slz.updateChild(2, "item");
        assert.throws(
          task,
          "lazyZstore.updateChild expects fields to be either string or array of strings, got number",
        );
      });
    });
    describe("carve", () => {
      it("should remove a child object of array in store when fields array", () => {
        let slz = new lazyZstate();
        slz.store.json = {
          list: [
            {
              name: "test",
              foo: "bar",
            },
          ],
        };
        let updateSpy = new sinon.spy();
        let updateFnSpy = new sinon.spy();
        slz.updateFunctions.push(updateFnSpy);
        slz.setUpdateCallback(updateSpy);
        slz.carve(["json", "list"], "test");
        assert.deepEqual(
          slz.store,
          {
            json: {
              list: [],
            },
          },
          "it should push to store",
        );
      });
      it("should remove a child object of array in store when fields array when index is not name", () => {
        let slz = new lazyZstate();
        slz.store.json = {
          list: [
            {
              id: "test",
              foo: "bar",
            },
          ],
        };
        let updateSpy = new sinon.spy();
        let updateFnSpy = new sinon.spy();
        slz.updateFunctions.push(updateFnSpy);
        slz.setUpdateCallback(updateSpy);
        slz.carve(["json", "list"], "test", "id");
        assert.deepEqual(
          slz.store,
          {
            json: {
              list: [],
            },
          },
          "it should push to store",
        );
      });
      it("should remove a child object of array in store when fields deep array", () => {
        let slz = new lazyZstate();
        slz.store.json = {
          test: {
            list: [
              {
                name: "test",
                foo: "bar",
              },
            ],
          },
        };
        let updateSpy = new sinon.spy();
        let updateFnSpy = new sinon.spy();
        slz.updateFunctions.push(updateFnSpy);
        slz.setUpdateCallback(updateSpy);
        slz.carve(["json", "test", "list"], "test");
        assert.deepEqual(
          slz.store,
          {
            json: {
              test: {
                list: [],
              },
            },
          },
          "it should push to store",
        );
      });
      it("should remove a child object of array in store when fields string", () => {
        let slz = new lazyZstate();
        slz.store.list = [
          {
            name: "test",
            foo: "bar",
          },
        ];
        let updateSpy = new sinon.spy();
        let updateFnSpy = new sinon.spy();
        slz.updateFunctions.push(updateFnSpy);
        slz.setUpdateCallback(updateSpy);
        slz.carve("list", "test");
        assert.deepEqual(
          slz.store,
          {
            list: [],
          },
          "it should push to store",
        );
      });
      it("should remove a child object of array in store when fields string and index is not name", () => {
        let slz = new lazyZstate();
        slz.store.list = [
          {
            id: "test",
            foo: "bar",
          },
        ];
        let updateSpy = new sinon.spy();
        let updateFnSpy = new sinon.spy();
        slz.updateFunctions.push(updateFnSpy);
        slz.setUpdateCallback(updateSpy);
        slz.carve("list", "test", "id");
        assert.deepEqual(
          slz.store,
          {
            list: [],
          },
          "it should push to store",
        );
      });
      it("should throw an error if field is not string or array", () => {
        let slz = new lazyZstate();
        slz.store.json = {
          list: [],
        };
        let updateSpy = new sinon.spy();
        let updateFnSpy = new sinon.spy();
        slz.updateFunctions.push(updateFnSpy);
        slz.setUpdateCallback(updateSpy);
        let task = () => slz.carve(2, "item");
        assert.throws(
          task,
          "lazyZstore.carve expects fields to be either string or array of strings, got number",
        );
      });
    });
    describe("setUnfound", () => {
      it("should throw an error if the list is not of strings", () => {
        let slz = new lazyZstate();
        slz.store.test = [[[]]];
        slz.store.json = {
          list: [],
        };
        let updateSpy = new sinon.spy();
        let updateFnSpy = new sinon.spy();
        slz.updateFunctions.push(updateFnSpy);
        slz.setUpdateCallback(updateSpy);
        let task = () => slz.setUnfound("test", {}, "dev");
        assert.throws(
          task,
          'lazyZstore expects store["test"] to be array of type string got ["Array"]',
        );
      });
      it("should set value on object to null if not found", () => {
        let slz = new lazyZstate();
        slz.store.test = ["one", "two"];
        let updateSpy = new sinon.spy();
        let updateFnSpy = new sinon.spy();
        slz.updateFunctions.push(updateFnSpy);
        slz.setUpdateCallback(updateSpy);
        let obj = {
          frog: "three",
        };
        slz.setUnfound("test", obj, "frog");
        assert.isNull(obj.frog, "it should set unfound value to null");
      });
      it("should not set value on object to null if found", () => {
        let slz = new lazyZstate();
        slz.store.test = ["one", "two", "three"];
        let updateSpy = new sinon.spy();
        let updateFnSpy = new sinon.spy();
        slz.updateFunctions.push(updateFnSpy);
        slz.setUpdateCallback(updateSpy);
        let obj = {
          frog: "three",
        };
        slz.setUnfound("test", obj, "frog");
        assert.deepEqual(obj.frog, "three", "it should be three");
      });
    });
    describe("newField", () => {
      it("should initialize a new field when run", () => {
        let slz = new lazyZstate();
        let initSpy = new sinon.spy();
        slz.newField("frog", { init: initSpy });
        assert.isTrue(initSpy.calledOnce, "it should be called");
        assert.isTrue(slz.frog !== null, "it should not be null");
      });
    });
  });
  describe("new state store functions - 1.11.0", () => {
    describe("store.schema", () => {
      it("should set invalid and invalidText when schema is added to new field", () => {
        let slz = new lazyZstate();
        let invalidSpy = new sinon.spy();
        let invalidTextSpy = new sinon.spy();
        slz.newField("frog", {
          init: () => {},
          schema: {
            test: {
              default: "frog",
              invalid: invalidSpy,
              invalidText: invalidTextSpy,
            },
          },
        });
        slz.frog.test.invalid();
        slz.frog.test.invalidText();
        assert.isTrue(
          invalidSpy.calledOnce,
          "it should set field and call spy",
        );
        assert.isTrue(
          invalidTextSpy.calledOnce,
          "it should set field and call spy",
        );
      });
      it("should set default functions for invalid, invalidText, disabled, and disabledText and set default value to null", () => {
        let slz = new lazyZstate();
        slz.newField("frog", {
          init: () => {},
          schema: {
            test: {},
          },
          subComponents: {
            test2: {},
          },
        });
        assert.isFalse(slz.frog.test.invalid(), "it should return false");
        assert.isFalse(slz.frog.test.disabled(), "it should return false");
        assert.deepEqual(
          slz.frog.test.invalidText(),
          "Invalid test value",
          "it should return InvalidText",
        );
        assert.deepEqual(
          slz.frog.test.disabledText(),
          "test disabled",
          "it should return InvalidText",
        );
        assert.isNull(slz.frog.test.default, "it should be null");
      });
      it("should throw an error when trying to create a schema object with reserved names", () => {
        let slz = new lazyZstate();
        let invalidSpy = new sinon.spy();
        let invalidTextSpy = new sinon.spy();
        let task = () => {
          slz.newField("frog", {
            init: () => {},
            schema: {
              create: {
                default: "frog",
                invalid: invalidSpy,
                invalidText: invalidTextSpy,
              },
            },
          });
        };
        assert.throws(task, 'Invalid reserved key name in schema: ["create"]');
      });
      it("should throw an error when trying to create a schema object with the same name as a subComponent", () => {
        let slz = new lazyZstate();
        let invalidSpy = new sinon.spy();
        let invalidTextSpy = new sinon.spy();
        let task = () => {
          slz.newField("frog", {
            init: () => {},
            schema: {
              test: {
                default: "frog",
                invalid: invalidSpy,
                invalidText: invalidTextSpy,
              },
            },
            subComponents: {
              test: {},
              toad: {},
            },
          });
        };
        assert.throws(
          task,
          'Cannot create schema fields with the same name as subComponents: ["test"]',
        );
      });
      it("should set default functions for invalid, invalidText, disabled, and disabledText and set default value to null for subcomponents", () => {
        let slz = new lazyZstate();
        slz.newField("frog", {
          init: () => {},
          schema: {
            test: {},
          },
          subComponents: {
            sons: {
              schema: {
                test: {},
              },
            },
          },
        });
        assert.isFalse(slz.frog.test.invalid(), "it should return false");
        assert.isFalse(slz.frog.test.disabled(), "it should return false");
        assert.deepEqual(
          slz.frog.test.invalidText(),
          "Invalid test value",
          "it should return InvalidText",
        );
        assert.deepEqual(
          slz.frog.test.disabledText(),
          "test disabled",
          "it should return InvalidText",
        );
        assert.isNull(slz.frog.sons.test.default, "it should be null");
        assert.isFalse(slz.frog.sons.test.invalid(), "it should return false");
        assert.isFalse(slz.frog.sons.test.disabled(), "it should return false");
        assert.deepEqual(
          slz.frog.sons.test.invalidText(),
          "Invalid test value",
          "it should return InvalidText",
        );
        assert.deepEqual(
          slz.frog.sons.test.disabledText(),
          "test disabled",
          "it should return InvalidText",
        );
        assert.isNull(slz.frog.sons.test.default, "it should be null");
      });
    });
  });
});
