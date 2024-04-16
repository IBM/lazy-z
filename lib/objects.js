const {
  eachKey,
  contains,
  isNullOrEmptyString,
  containsKeys,
  isArray,
  isArrayOfObjects,
  isBoolean,
  isString,
} = require("./shortcuts");
const { paramTest } = require("./values");

/**
 * check to see if all fields in an object are null
 * @param {Object} obj arbitrary object
 * @returns {boolean} true if all are null, otherwise false
 */
function allFieldsNull(obj) {
  paramTest("allFieldsNull", "obj", "object", obj);
  let allNull = true;
  eachKey(obj, (key) => {
    if (obj[key] !== null) {
      allNull = false;
    }
  });
  return allNull;
}

/**
 * get index of an array with a value
 * @param {Array<object>} arr array of objects
 * @param {string} field  key name
 * @param {string} str string value to check
 * @returns {number} index of object with value
 */

function arraySplatIndex(arr, field, str) {
  paramTest(
    "arraySplatIndex",
    "arr",
    "Array<object>",
    arr,
    "field",
    "string",
    field,
    "str",
    "string",
    str,
  );
  return splat(arr, field).indexOf(str);
}

/**
 * remove an item from an array of objects by name
 * @param {Array<object>} arr array of objects
 * @param {string} field  key name
 * @param {string} str string value to check
 * @returns splice value
 */

function carve(arr, field, str) {
  paramTest(
    "carve",
    "arr",
    "Array<object>",
    arr,
    "field",
    "string",
    field,
    "str",
    "string",
    str,
  );
  let index = arraySplatIndex(arr, field, str);
  if (index === -1) {
    throw new Error(
      `carve expected object with ${field} value ${str}. Found no matching entries.`,
    );
  }
  return arr.splice(index, 1);
}

/**
 * check for no duplicate keys
 * @param {string} component name of the component
 * @param {Array<object>} arr array of objects
 * @param {string} field  key name
 * @param {string} str string value to check
 */
function duplicateKeyTest(component, arr, field, str) {
  paramTest(
    "duplicateKeyTest",
    "component",
    "string",
    component,
    "arr",
    "Array<object>",
    arr,
    "field",
    "string",
    field,
    "str",
    "string",
    str,
  );
  if (hasDuplicateKeys(arr, field, str)) {
    throw new Error(
      `${component} expected no duplicate keys for ${field}. Duplicate value: ${str}`,
    );
  }
}

/**
 * get object from array of objects
 * @param {Array<object>} arr array of objects
 * @param {string} field  key name
 * @param {string} str string value to check
 */

function getObjectFromArray(arr, field, str) {
  paramTest(
    "getObjectFromArray",
    "arr",
    "Array<object>",
    arr,
    "field",
    "string",
    field,
    "str",
    "string",
    str,
  );
  return arr[arraySplatIndex(arr, field, str)];
}

/**
 * check for no duplicate keys
 * @param {Array<object>} arr array of objects
 * @param {string} field key name
 * @param {string} str string value to check
 */
function hasDuplicateKeys(arr, field, str) {
  paramTest(
    "hasDuplicateKeys",
    "arr",
    "Array<object>",
    arr,
    "field",
    "string",
    field,
    "str",
    "string",
    str,
  );
  let data = splat(arr, field);
  return contains(data, str);
}

/**
 * get all values for a field in an array of objects and
 * return as array
 * @param {Array<object>} arr array of objects
 * @param {string} field  key name
 * @returns {Array} array
 */
function splat(arr, field) {
  paramTest("splat", "arr", "Array<object>", arr, "field", "string", field);
  let splatifiedArr = [];
  arr.forEach((obj) => {
    splatifiedArr.push(obj[field]);
  });
  return splatifiedArr;
}

/**
 * get all values for a field in an array of objects and return true
 * if the checkValue is found
 * @param {Array<object>} arr array of objects
 * @param {string} field  key name
 * @param {*} checkValue value to search for
 */
function splatContains(arr, field, value) {
  let data = splat(arr, field);
  return contains(data, value);
}

/**
 * return the values of an object as an array to cast to function using spread operator
 * @param {Object} obj Object
 * @returns {Array} array of values
 */
function spreadKeyValues(obj) {
  paramTest("spreadKeyValues", "obj", "object", obj);
  let values = [];
  eachKey(obj, (key) => {
    values.push(obj[key]);
  });
  return values;
}

/**
 * Set keys from one object to another in place
 * @param {Object} source source object
 * @param {Object} destination where values from the source object will be added
 */
function transpose(source, destination) {
  paramTest(
    "transpose",
    "source",
    "object",
    source,
    "destination",
    "object",
    destination,
  );
  eachKey(source, (key) => {
    destination[key] = source[key];
  });
}

/**
 * Set keys from one object to another in place, set only unfound values
 * this function will look through arrays of objects and replace values
 * @param {Object} source source object
 * @param {Object} destination where values from the source object will be added
 */
function recursiveTranspose(source, destination) {
  paramTest(
    "recursiveTranspose",
    "source",
    "object",
    source,
    "destination",
    "object",
    destination,
  );
  eachKey(source, (key) => {
    if (
      !containsKeys(destination, key) ||
      isBoolean(source[key]) ||
      isString(source[key]) ||
      typeof source[key] === "number"
    ) {
      destination[key] = source[key];
    } else if (typeof source[key] === "object" && !isArray(source[key])) {
      recursiveTranspose(source[key], destination[key]);
    } else if (isArrayOfObjects(source[key])) {
      // for arrays of objects
      source[key].forEach((item, itemIndex) => {
        if (destination[key][itemIndex]) {
          recursiveTranspose(item, destination[key][itemIndex]);
        } else destination[key].push(item);
      });
      // remove excess
      while (source[key].length < destination[key].length) {
        destination[key].pop();
      }
    } else {
      // else is only for arrays of items that are not objects
      source[key].forEach((item, itemIndex) => {
        if (destination[key][itemIndex] !== item) {
          destination[key][itemIndex] = item;
        }
      });
      // remove excess
      while (source[key].length < destination[key].length) {
        destination[key].pop();
      }
    }
  });
}

/**
 * returns whether any object value is null or empty
 * @param {Object} obj Object
 * @param {Array<string>} array of object key strings
 * @returns {boolean} true if any object value is null or empty, otherwise false
 */
function nullOrEmptyStringFields(obj, arr) {
  hasNullOrEmptyFields = false;
  paramTest(
    "nullOrEmptyStringFields",
    "obj",
    "object",
    obj,
    "arr",
    "Array<string>",
    arr,
  );
  arr.forEach((key) => {
    if (isNullOrEmptyString(obj[key])) {
      hasNullOrEmptyFields = true;
    }
  });
  return hasNullOrEmptyFields;
}

module.exports = {
  allFieldsNull,
  arraySplatIndex,
  carve,
  duplicateKeyTest,
  getObjectFromArray,
  hasDuplicateKeys,
  splat,
  splatContains,
  spreadKeyValues,
  transpose,
  nullOrEmptyStringFields,
  recursiveTranspose,
};
