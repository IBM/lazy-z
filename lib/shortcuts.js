const { typeCheck, paramTest, getType } = require("./values");

/**
 * Shortcut for Object.keys`
 * @param {object} object Object
 * @returns {Array<string>} list of keys
 */
function keys(object) {
  typeCheck("keys expects type", "object", object);
  return Object.keys(object);
}

/**
 * helper function to see if an object contains a key
 * @param {Object} object Any object
 * @param {string} str Name of the key to find
 * @param {boolean=} lazy don't throw an error if the object type is not object
 * @returns {boolean} true if containsKeys, false if does not or is not an object
 */
function containsKeys(object, str, lazy) {
  if (getType(object) !== "object" && lazy) return false;
  paramTest(containsKeys, arguments, { object: "object", str: "string" });
  return !(Object.keys(object).indexOf(str) === -1);
}

/**
 * Shortcut to check if string or array of strings contains a value
 * @param {String|Array} stringOrArray string or array of strings
 * @param {*} value Value to check
 * @returns {boolean} true if array contains value
 */
function contains(stringOrArray, value) {
  if (getType(stringOrArray) !== "string") {
    paramTest(contains, arguments, {
      stringOrArray: "Array<string>",
    });
  } else {
    paramTest(contains, arguments, { stringOrArray: "string" });
  }
  return stringOrArray.indexOf(value) !== -1;
}

/**
 * Shortcut for Object.keys(object).forEach(i=>{})
 * @param {Object} obj Object to call
 * @param {eachKeyCallback} callback Callback function to run
 */
function eachKey(obj, callback) {
  paramTest(eachKey, arguments, { obj: "object", callback: "Function" });
  Object.keys(obj).forEach((i, index) => callback(i, index));
}

/**
 * Eachkey Callback
 * @callback eachKeyCallback
 * @param {string} key Key to check values against
 * @param {number} index Index of item in array
 */

/**
 * Callback function for sort
 * @param {string} a string a
 * @param {string} b string b
 * @returns {number} 1, 0, -1
 */
function azsort(a, b) {
  if (a < b) {
    return -1;
  } else if (a > b) {
    return 1;
  } else return 0;
}

/**
 * Shortcut for JSON.stringify(obj, null, 2)
 * @param {Object} obj Object to return
 * @returns {string} prettified json string
 */
function prettyJSON(value) {
  return JSON.stringify(value, null, 2);
}

/**
 * return all distinct entries in an array of strings
 * @param {Array<string>} arr Strings to check
 * @returns {Array<string>} array with only distinct string elements
 */
function distinct(arr) {
  paramTest(distinct, arguments, { arr: "Array<string>" });
  let distinctArr = [];
  arr.forEach((item) => {
    if (!contains(distinctArr, item)) {
      distinctArr.push(item);
    }
  });
  return distinctArr;
}

/**
 * Check if array is empty
 * @param {Array} arr Array
 * @returns {boolean} true if length == 0
 */
 function isEmpty(arr) {
  typeCheck(`isEmpty expects type of`, "Array", arr);
  return arr.length === 0;
}

module.exports = {
  keys,
  containsKeys,
  contains,
  eachKey,
  azsort,
  prettyJSON,
  distinct,
  isEmpty
};
