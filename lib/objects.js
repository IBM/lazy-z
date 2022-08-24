const { eachKey, contains } = require("./shortcuts");
const { paramTest } = require("./values");

/**
 * Set keys from one object to another in place
 * @param {Object} source source object
 * @param {Object} destination where values from the source object will be added
 */
function transpose(source, destination) {
  // paramTest(transpose, arguments, {
  //   source: "object",
  //   destination: "object",
  // });
  eachKey(source, (key) => {
    destination[key] = source[key];
  });
}

/**
 * return the values of an object as an array to cast to function using spread operator
 * @param {Object} obj Object
 * @returns {Array} array of values
 */
function spreadKeyValues(obj) {
  // paramTest(spreadKeyValues, arguments, { obj: "object" });
  let values = [];
  eachKey(obj, (key) => {
    values.push(obj[key]);
  });
  return values;
}

/**
 * get all values for a field in an array of objects and
 * return as array
 * @param {Array<object>} arr array of objects
 * @param {string} field  key name
 * @returns {Array} array
 */
function splat(arr, field) {
  //paramTest(splat, arguments, { arr: "Array<object>", field: "string" });
  let splatifiedArr = [];
  arr.forEach((obj) => {
    splatifiedArr.push(obj[field]);
  });
  return splatifiedArr;
}

/**
 * check for no duplicate keys
 * @param {Array<object>} arr array of objects
 * @param {string} field key name
 * @param {string} str string value to check
 */
function hasDuplicateKeys(arr, field, str) {
  // paramTest(hasDuplicateKeys, arguments, {
  //   arr: "Array<object>",
  //   field: "string",
  //   str: "string",
  // });
  let data = splat(arr, field);
  return contains(data, str);
}

/**
 * check for no duplicate keys
 * @param {string} component name of the component
 * @param {Array<object>} arr array of objects
 * @param {string} field  key name
 * @param {string} str string value to check
 */
function duplicateKeyTest(component, arr, field, str) {
  // paramTest(duplicateKeyTest, arguments, {
  //   component: "string",
  //   arr: "Array<object>",
  //   field: "string",
  //   str: "string",
  // });
  if (hasDuplicateKeys(arr, field, str)) {
    throw new Error(
      `${component} expected no duplicate keys for ${field}. Duplicate value: ${str}`
    );
  }
}

/**
 * get index of an array with a value
 * @param {Array<object>} arr array of objects
 * @param {string} field  key name
 * @param {string} str string value to check
 * @returns {number} index of object with value
 */

function arraySplatIndex(arr, field, str) {
  // paramTest(arraySplatIndex, arguments, {
  //   arr: "Array<object>",
  //   field: "string",
  //   str: "string",
  // });
  return splat(arr, field).indexOf(str);
}

/**
 * get object from array of objects
 * @param {Array<object>} arr array of objects
 * @param {string} field  key name
 * @param {string} str string value to check
 */

function getObjectFromArray(arr, field, str) {
  // paramTest(getObjectFromArray, arguments, {
  //   arr: "Array<object>",
  //   field: "string",
  //   str: "string",
  // });
  return arr[arraySplatIndex(arr, field, str)];
}

/**
 * remove an item from an array of objects by name
 * @param {Array<object>} arr array of objects
 * @param {string} field  key name
 * @param {string} str string value to check
 * @returns splice value
 */

function carve(arr, field, str) {
  // paramTest(carve, arguments, {
  //   arr: "Array<object>",
  //   field: "string",
  //   str: "string",
  // });
  let index = arraySplatIndex(arr, field, str);
  return arr.splice(index, 1);
}

module.exports = {
  transpose,
  spreadKeyValues,
  hasDuplicateKeys,
  duplicateKeyTest,
  arraySplatIndex,
  getObjectFromArray,
  splat,
  carve,
};
