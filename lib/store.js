const { carve } = require("./objects");
const { revision } = require("./revision");
const {
  eachKey,
  contains,
  keys,
  containsKeys,
  isArray,
  isString,
} = require("./shortcuts");
const { paramTest, getType, arrTypeCheck, containsAny } = require("./values");

/**
 * create an initial store
 * @param {object=} defaults defaults for store data
 * @param {object=} defaults._defaults key value pairs of default values for store
 * @param {Array<string>} defaults._no_default list of values in store to set to `null`
 * @param {object=} store arbitrary key value pairs to add to store object. values are added after defaults
 * @param {string=} parent override function name
 * @returns {object} key value pairs for store data
 */
function createStore(defaults, store, parent) {
  let functionName = parent || "createStore";
  paramTest(functionName, "defaults", "object", defaults);
  // check for store is object if
  if (store) {
    paramTest(functionName, "store", "object", store);
  }
  // throw if defaults contains keys other than _default or _no_default
  eachKey(defaults, (key) => {
    if (!contains(["_defaults", "_no_default"], key)) {
      throw new Error(
        `${functionName} expects defaults to only have keys _defaults and _no_default, got ${JSON.stringify(
          keys(defaults),
        )}`,
      );
    }
  });
  let data = {
    store: {},
  };
  // set defaults on store and return data
  new revision(data).set("store", defaults, store);
  return data.store;
}

/**
 * create store function
 * @param {object} state
 * @param {string} field field to initialize
 * @param {params} params
 * @param {stateInitCallback} params.init function to run on initialization
 * @param {onStoreUpdateCallback} params.onStoreUpdate on store update function
 * @param {shouldDisableSave} params.shouldDisableSave should disable save callback
 * @param {onCreate} params.create create function
 * @param {onSave} params.save save function
 * @param {onDelete} params.delete delete function
 * @param {Object=} params.subComponents object of nested sub components
 * @param {Object=} parentStore parent function store where functions will be stored when creating sub components
 */
function storeTemplate(state, field, params, parentStore) {
  paramTest(
    "lazyZState.storeTemplate",
    "state",
    "object",
    state,
    "field",
    "string",
    field,
    "params",
    "object",
    params,
  );
  // if function is not recurring
  if (!parentStore) {
    // throw an error if no initialization
    if (!params.init)
      throw new Error(
        `lazyZstate store template expects top level components to have init function, got ${params.init}.`,
      );
    // if not found, initialize
    if (!state[field]) params.init(state);
    // set object if type is not object or null (null is type object)
    if (typeof state[field] !== "object" && state[field] !== null)
      state[field] = {};
    // if an onstoreupdate function is passed
    if (params.onStoreUpdate) {
      // add function nested in trycatch to state update functions
      state.updateFunctions.push(() => {
        state.tryCatch(() => {
          params.onStoreUpdate(state);
        }, true);
      });
    }
  }

  // initialize the store field and add create save and update functions
  let componentStore = parentStore ? parentStore[field] : state[field];
  ["create", "save", "delete", "shouldDisableSave"].forEach((storeFunction) => {
    if (params[storeFunction]) {
      componentStore[storeFunction] = function (stateData, componentProps) {
        if (storeFunction === "shouldDisableSave") {
          return params.shouldDisableSave(state, stateData, componentProps);
        } else {
          state.tryCatch(() => {
            params[storeFunction](state, stateData, componentProps);
          });
        }
      };
    }
  });

  // initialize schema
  if (params.schema) {
    // error out for reserved keys
    if (
      containsAny(keys(params.schema), [
        "create",
        "onStoreUpdate",
        "delete",
        "save",
      ])
    ) {
      let invalidKeys = [];
      ["create", "onStoreUpdate", "delete", "save", "schema"].forEach(
        (item) => {
          if (containsKeys(params.schema, item)) invalidKeys.push(item);
        },
      );
      throw new Error(
        `Invalid reserved key name in schema: ` + JSON.stringify(invalidKeys),
      );
    }
    // error out when sub components and field have same name
    if (params?.subComponents) {
      if (containsAny(keys(params.schema), keys(params.subComponents))) {
        let invalidKeys = [];
        eachKey(params.subComponents, (key) => {
          if (containsKeys(params.schema, key)) {
            invalidKeys.push(key);
          }
        });
        throw new Error(
          "Cannot create schema fields with the same name as subComponents: " +
            JSON.stringify(invalidKeys),
        );
      }
    }

    //for each item in the schema
    eachKey(params.schema, (formField) => {
      componentStore[formField] = {};
      // helperText
      // toolTip
      [
        "default",
        "invalid",
        "invalidText",
        "disabled",
        "disabledText",
        "helperText",
        "hideWhen",
        "type",
        "size",
        "groups",
        "onInputChange",
        "forceUpdateKey",
        "onRender",
        "tooltip",
        "labelText",
        "onStateChange",
        "optional",
      ].forEach((formFieldItem) => {
        if (params.schema[formField][formFieldItem]) {
          // if item is passed from schema, set to state
          componentStore[formField][formFieldItem] =
            params.schema[formField][formFieldItem];
        } else if (formFieldItem === "default") {
          // set default to null
          componentStore[formField][formFieldItem] =
            params.schema[formField][formFieldItem] || null;
        } else if (formFieldItem === "invalidText") {
          // set invalidText to generic text
          componentStore[formField][formFieldItem] = function () {
            return `Invalid ${formField} value`;
          };
        } else if (formFieldItem === "disabledText") {
          // set disabledText to generic text
          componentStore[formField][formFieldItem] = function () {
            return `${formField} disabled`;
          };
        } else if (contains(["invalid", "disabled"], formFieldItem)) {
          // set invalid and disabled to return false by default
          componentStore[formField][formFieldItem] = function () {
            return false;
          };
        }
      });
    });
  }

  // component has sub components
  if (containsKeys(params, "subComponents")) {
    // for each sub component
    eachKey(params.subComponents, (subComponent) => {
      // set subcomponent store
      componentStore[subComponent] = {};
      // build a new sub component
      storeTemplate(
        state,
        subComponent,
        params.subComponents[subComponent],
        componentStore,
      );
    });
  }
}

/**
 * state constructor object
 * @param {object=} defaults defaults for store data
 * @param {object=} defaults._defaults key value pairs of default values for store
 * @param {Array<string>=} defaults._no_default list of values in store to set to `null`
 * @param {object=} store arbitrary key value pairs to add to store object. values are added after defaults
 * @param {object=} options object of options to turn on, key is option, value is value
 */
function lazyZstate(defaults, store) {
  this.store = {}; // store data
  this.updateFunctions = []; // update functions
  /**
   * initialize state store
   * @param {object=} storeDefaults
   * @param {object=} defaults._defaults key value pairs of default values for store
   * @param {Array<string>=} defaults._no_default list of values in store to set to `null`
   * @param {object=} storeData arbitrary key value pairs to add to store object. values are added after defaults
   */
  this.initStore = function (storeDefaults, storeData) {
    this.store = createStore(storeDefaults || {}, storeData, "state.initStore");
  };

  /**
   * Set update callback. This function will be run when components update
   * @param {Function} callback callback function
   */
  this.setUpdateCallback = function (callback) {
    paramTest(`state.setUpdateCallback`, "callback", "Function", callback);
    this.updateCallback = callback;
  };

  /**
   * function to run after update
   * @throws error if unset
   */
  this.updateCallback = () => {
    throw new Error(
      `state.updateCallback expects a callback to be set using state.setUpdateCallback. No callback has been added.`,
    );
  };

  /**
   * update all components
   */
  this.update = function () {
    this.updateFunctions.forEach((fn) => {
      fn();
    });
    this.updateCallback();
  };

  /**
   * send an error
   * @param {Error} err error
   * @throws when message provided
   */
  this.sendError = function (err) {
    console.error(err);
    if (this.sendErrorCallback) this.sendErrorCallback(err);
    else throw new Error(err);
  };

  /**
   * set callback for error handling
   * @param {setErrorCallback} callback callback function
   */
  this.setErrorCallback = function (callback) {
    paramTest(`lazyZstate.setErrorCallback`, "callback", "Function", callback);
    this.sendErrorCallback = callback;
  };

  /**
   * try catch wrapper for state functions
   * @param {Function} tryFunction function to try
   * @param {boolean=} onStoreUpdate is an onstoreupdate function, do not call `this.update` after run
   */
  this.tryCatch = function (tryFunction, onStoreUpdate) {
    try {
      tryFunction();
      if (!onStoreUpdate) this.update();
    } catch (err) {
      console.error(err);
      this.sendError(err);
    }
  };

  /**
   * create a new state store field
   * @param {string} field fieldName
   * @param {object} params
   * @param {stateInitCallback} params.init function to run on initialization
   * @param {onStoreUpdateCallback} params.onStoreUpdate on store update function
   * @param {onCreate} params.create create function
   * @param {onSave} params.save save function
   * @param {onDelete} params.delete delete function
   * @param {object} params.subComponents object of sub components to be added
   */
  this.newField = function (field, params) {
    storeTemplate(this, field, params);
  };

  /**
   * push array to store
   * @param {string|Array<string>} fields field name to push to or array of field names. array of field names will be looked up
   * @param {*} item item to push
   */
  this.push = function (fields, item) {
    let storeRef;
    if (isArray(fields)) {
      arrTypeCheck(
        "lazyZstore.push fields expected array items to be",
        "string",
        fields,
      );
      fields.forEach((field) => {
        storeRef = storeRef ? storeRef[field] : this.store[field];
      });
      storeRef.push(item);
    } else if (isString(fields)) {
      this.store[fields].push(item);
    } else
      throw new Error(
        "lazyZstore.push expects fields to be either string or array of strings, got " +
          getType(fields),
      );
  };

  /**
   * set unfound data from object in store to null
   * @param {string} storeField field to check in store. this must point to an array of strings
   * @param {Object} obj item where null values will be set
   * @param {string} field key from object to set if unfound
   */
  this.setUnfound = function (storeField, obj, field) {
    arrTypeCheck(
      `lazyZstore expects store["${storeField}"] to be array of`,
      "string",
      this.store[storeField],
    );
    if (!contains(this.store[storeField], obj[field])) {
      obj[field] = null;
    }
  };

  /**
   * update a store item in an array of objects
   * @param {string|Array<string>} fields field name to push to or array of field names. array of field names will be looked up
   * @param {*} lookupValue the value to check to find the update child object
   * @param {Object} updatedData updated child data
   * @param {string=} lookupIndex index to use if not name
   */
  this.updateChild = function (fields, lookupValue, updatedData, lookupIndex) {
    if (isArray(fields)) {
      arrTypeCheck(
        "lazyZstore.updateChild fields expected array items to be",
        "string",
        fields,
      );
      if (fields.length === 1) {
        new revision(this.store).updateChild(
          fields[0],
          lookupValue,
          lookupIndex || updatedData, // index if index, otherwise params
          lookupIndex ? updatedData : null, // params if index, otherwise null
        );
      } else {
        let storeRef;
        fields.forEach((field, index) => {
          if (index !== fields.length - 1) {
            storeRef = storeRef ? storeRef[field] : this.store[field];
          }
        });
        new revision(storeRef).updateChild(
          fields[fields.length - 1],
          lookupValue,
          lookupIndex || updatedData, // index if index, otherwise params
          lookupIndex ? updatedData : null, // params if index, otherwise null
        );
      }
    } else if (isString(fields)) {
      new revision(this.store).updateChild(
        fields,
        lookupValue,
        lookupIndex || updatedData, // index if index, otherwise params
        lookupIndex ? updatedData : null, // params if index, otherwise null
      );
    } else
      throw new Error(
        "lazyZstore.updateChild expects fields to be either string or array of strings, got " +
          getType(fields),
      );
  };

  /**
   * remove an object from an array of objects in store
   * @param {string|Array<string>} fields field name to push to or array of field names. array of field names will be looked up
   * @param {*} lookupValue the value to check to find the update child object
   * @param {string=} lookupIndex index to use if not name
   */
  this.carve = function (fields, lookupValue, lookupIndex) {
    if (isArray(fields)) {
      arrTypeCheck(
        "lazyZstore.carve fields expected array items to be",
        "string",
        fields,
      );
      let storeRef;
      fields.forEach((field) => {
        storeRef = storeRef ? storeRef[field] : this.store[field];
      });
      carve(storeRef, lookupIndex || "name", lookupValue);
    } else if (isString(fields)) {
      carve(this.store[fields], lookupIndex || "name", lookupValue);
    } else
      throw new Error(
        "lazyZstore.carve expects fields to be either string or array of strings, got " +
          getType(fields),
      );
  };

  // run init store on creation
  this.initStore(defaults, store);
}

module.exports = {
  createStore,
  storeTemplate,
  lazyZstate,
};
